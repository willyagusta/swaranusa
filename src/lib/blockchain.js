import { ethers } from 'ethers';

class BlockchainVerificationService {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.contract = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Use Sepolia Ethereum testnet
      const rpcUrl = process.env.SEPOLIA_URL || 'https://ethereum-sepolia-rpc.publicnode.com';
      this.provider = new ethers.JsonRpcProvider(rpcUrl);

      // Your admin wallet private key (keep this secure!)
      const privateKey = process.env.ADMIN_WALLET_PRIVATE_KEY;
      if (!privateKey) {
        throw new Error('ADMIN_WALLET_PRIVATE_KEY not found in environment variables');
      }

      this.wallet = new ethers.Wallet(privateKey, this.provider);
      
      // Verify we're connected to Sepolia
      const network = await this.provider.getNetwork();
      console.log(`Connected to network: ${network.name} (Chain ID: ${network.chainId})`);
      
      // Smart contract setup (if deployed)
      const contractAddress = process.env.FEEDBACK_CONTRACT_ADDRESS;
      if (contractAddress) {
        const contractABI = [
          "function storeFeedbackHash(string memory feedbackHash, uint256 feedbackId, uint256 timestamp) public returns (uint256)",
          "function getFeedbackVerification(uint256 verificationId) public view returns (string memory, uint256, uint256, address)",
          "function verifyFeedbackHash(string memory feedbackHash) public view returns (bool, uint256, uint256, address)",
          "function getTotalVerifications() public view returns (uint256)",
          "function getContractInfo() public view returns (address, uint256, uint256)",
          "function transferOwnership(address newOwner) public",
          "event FeedbackStored(uint256 indexed verificationId, string indexed feedbackHash, uint256 feedbackId, uint256 timestamp, address verifier)",
          "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)"
        ];
        
        this.contract = new ethers.Contract(contractAddress, contractABI, this.wallet);
        console.log('Smart contract connected:', contractAddress);
      } else {
        console.log('No contract address provided, using fallback method');
      }

      this.initialized = true;
    } catch (error) {
      console.error('Blockchain service initialization failed:', error);
      throw error;
    }
  }

  // Create a unique hash for the feedback
  createFeedbackHash(feedbackData) {
    const dataString = JSON.stringify({
      id: feedbackData.id,
      userId: feedbackData.userId,
      title: feedbackData.title,
      content: feedbackData.content,
      timestamp: feedbackData.createdAt
    });
    return ethers.keccak256(ethers.toUtf8Bytes(dataString));
  }

  // Store feedback verification on blockchain
  async verifyFeedback(feedbackData) {
    await this.initialize();

    try {
      const feedbackHash = this.createFeedbackHash(feedbackData);
      const timestamp = Math.floor(new Date(feedbackData.createdAt).getTime() / 1000);

      let transactionHash, blockNumber, blockTimestamp, gasUsed, verificationId;

      // Check wallet balance
      const balance = await this.provider.getBalance(this.wallet.address);
      if (balance === 0n) {
        throw new Error('Insufficient balance. Get free Sepolia ETH from: https://sepoliafaucet.com/');
      }

      if (this.contract) {
        // Use smart contract method (preferred)
        console.log('Storing feedback hash using smart contract...');
        
        const tx = await this.contract.storeFeedbackHash(
          feedbackHash, 
          feedbackData.id, 
          timestamp,
          { gasLimit: 500000 }
        );
        
        console.log(`Transaction sent: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
        
        // Extract verification ID from event
        const event = receipt.logs.find(log => {
          try {
            const parsed = this.contract.interface.parseLog(log);
            return parsed.name === 'FeedbackStored';
          } catch {
            return false;
          }
        });
        
        if (event) {
          const parsed = this.contract.interface.parseLog(event);
          verificationId = parsed.args[0].toString();
        }
        
        transactionHash = receipt.hash;
        blockNumber = receipt.blockNumber;
        gasUsed = receipt.gasUsed.toString();
        
        const block = await this.provider.getBlock(receipt.blockNumber);
        blockTimestamp = new Date(block.timestamp * 1000);
        
      } else {
        // Fallback: Store hash in transaction data
        console.log('Storing feedback hash using transaction data...');
        
        const tx = await this.wallet.sendTransaction({
          to: this.wallet.address, // Send to self
          value: 0,
          data: ethers.hexlify(ethers.toUtf8Bytes(JSON.stringify({
            feedbackHash,
            feedbackId: feedbackData.id,
            timestamp
          }))),
          gasLimit: 30000
        });
        
        console.log(`Transaction sent: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
        
        transactionHash = receipt.hash;
        blockNumber = receipt.blockNumber;
        gasUsed = receipt.gasUsed.toString();
        
        const block = await this.provider.getBlock(receipt.blockNumber);
        blockTimestamp = new Date(block.timestamp * 1000);
      }

      return {
        transactionHash,
        blockNumber,
        blockTimestamp,
        gasUsed,
        feedbackHash,
        verificationId,
        networkName: 'sepolia'
      };
    } catch (error) {
      console.error('Blockchain verification failed:', error);
      
      if (error.message.includes('insufficient funds')) {
        throw new Error('Insufficient Sepolia ETH. Get free test ETH from: https://sepoliafaucet.com/');
      }
      
      throw error;
    }
  }

  // Verify a feedback hash exists on blockchain
  async checkVerification(transactionHash) {
    await this.initialize();

    try {
      const receipt = await this.provider.getTransactionReceipt(transactionHash);
      if (!receipt) {
        return { verified: false, error: 'Transaction not found' };
      }

      const block = await this.provider.getBlock(receipt.blockNumber);
      
      return {
        verified: true,
        blockNumber: receipt.blockNumber,
        blockTimestamp: new Date(block.timestamp * 1000),
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status === 1 ? 'success' : 'failed',
        networkName: 'sepolia'
      };
    } catch (error) {
      console.error('Verification check failed:', error);
      return { verified: false, error: error.message };
    }
  }

  // Check if feedback hash exists in smart contract
  async checkFeedbackHash(feedbackHash) {
    await this.initialize();
    
    if (!this.contract) {
      return { exists: false, error: 'Smart contract not available' };
    }

    try {
      const result = await this.contract.verifyFeedbackHash(feedbackHash);
      return {
        exists: result[0],
        verificationId: result[1].toString(),
        timestamp: new Date(result[2].toNumber() * 1000),
        verifier: result[3]
      };
    } catch (error) {
      console.error('Hash verification failed:', error);
      return { exists: false, error: error.message };
    }
  }

  async getNetworkName() {
    const network = await this.provider.getNetwork();
    return network.name;
  }

  async getWalletInfo() {
    await this.initialize();
    
    const address = this.wallet.address;
    const balance = await this.provider.getBalance(address);
    const network = await this.provider.getNetwork();
    
    return {
      address,
      balance: ethers.formatEther(balance),
      networkName: network.name,
      chainId: network.chainId.toString(),
      hasContract: !!this.contract
    };
  }

  generateVerificationUrl(transactionHash, networkName = 'sepolia') {
    return `https://sepolia.etherscan.io/tx/${transactionHash}`;
  }
}

export const blockchainService = new BlockchainVerificationService();
