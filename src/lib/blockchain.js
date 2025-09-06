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
      const rpcUrl = process.env.SEPOLIA_URL || 'https://eth-sepolia.g.alchemy.com/v2/UEKumhN9FA36Sq5aHea3FEY67EZdWU4k';
      
      // Alternative free Sepolia RPC endpoints (no API key required)
      const freeSepoliaRPCs = [
        'https://ethereum-sepolia-rpc.publicnode.com',
        'https://sepolia.gateway.tenderly.co',
        'https://rpc.sepolia.org',
        'https://rpc2.sepolia.org'
      ];
      
      // Use environment variable or fall back to free public RPC
      const finalRpcUrl = process.env.SEPOLIA_URL || freeSepoliaRPCs[0];
      this.provider = new ethers.JsonRpcProvider(finalRpcUrl);

      // Your admin wallet private key (keep this secure!)
      const privateKey = process.env.ADMIN_WALLET_PRIVATE_KEY;
      if (!privateKey) {
        throw new Error('ADMIN_WALLET_PRIVATE_KEY not found in environment variables');
      }

      this.wallet = new ethers.Wallet(privateKey, this.provider);
      
      // Verify we're connected to Sepolia
      const network = await this.provider.getNetwork();
      console.log(`Connected to network: ${network.name} (Chain ID: ${network.chainId})`);
      
      if (network.chainId !== 11155111n) { // Sepolia chain ID
        console.warn(`Warning: Expected Sepolia (11155111) but connected to chain ${network.chainId}`);
      }
      
      // Simple contract for storing feedback hashes (optional)
      const contractAddress = process.env.FEEDBACK_CONTRACT_ADDRESS;
      const contractABI = [
        "function storeFeedbackHash(string memory feedbackHash, uint256 timestamp) public returns (uint256)",
        "function getFeedbackVerification(uint256 verificationId) public view returns (string memory, uint256, address)",
        "function verifyFeedbackHash(string memory feedbackHash) public view returns (bool, uint256, address)",
        "event FeedbackStored(uint256 indexed verificationId, string feedbackHash, uint256 timestamp, address verifier)"
      ];

      if (contractAddress) {
        this.contract = new ethers.Contract(contractAddress, contractABI, this.wallet);
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
      const timestamp = Math.floor(Date.now() / 1000);

      let transactionHash, blockNumber, blockTimestamp, gasUsed;

      if (this.contract) {
        // Use smart contract method
        console.log('Using smart contract to store feedback hash...');
        const tx = await this.contract.storeFeedbackHash(feedbackHash, timestamp, {
          gasLimit: 100000 // Set reasonable gas limit for Sepolia
        });
        const receipt = await tx.wait();
        
        transactionHash = receipt.hash;
        blockNumber = receipt.blockNumber;
        gasUsed = receipt.gasUsed.toString();
        
        // Get block timestamp
        const block = await this.provider.getBlock(receipt.blockNumber);
        blockTimestamp = new Date(block.timestamp * 1000);
      } else {
        // Fallback: Store hash in transaction data (simpler approach)
        console.log('Using transaction data to store feedback hash...');
        
        // Check wallet balance before transaction
        const balance = await this.provider.getBalance(this.wallet.address);
        console.log(`Wallet balance: ${ethers.formatEther(balance)} ETH`);
        
        if (balance === 0n) {
          throw new Error('Insufficient balance. Please add Sepolia ETH to your wallet. Get free ETH from: https://sepoliafaucet.com/');
        }

        const tx = await this.wallet.sendTransaction({
          to: this.wallet.address, // Send to self
          value: 0, // No ETH transfer, just data
          data: ethers.hexlify(ethers.toUtf8Bytes(feedbackHash)),
          gasLimit: 21000 + (feedbackHash.length * 16) // Base gas + data gas
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
        networkName: await this.getNetworkName()
      };
    } catch (error) {
      console.error('Blockchain verification failed:', error);
      
      // Provide helpful error messages for common issues
      if (error.message.includes('insufficient funds')) {
        throw new Error('Insufficient Sepolia ETH. Get free test ETH from: https://sepoliafaucet.com/');
      }
      if (error.message.includes('nonce')) {
        throw new Error('Transaction nonce error. Please try again.');
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

  async getNetworkName() {
    const network = await this.provider.getNetwork();
    return network.name;
  }

  // Get wallet info for debugging
  async getWalletInfo() {
    await this.initialize();
    
    const address = this.wallet.address;
    const balance = await this.provider.getBalance(address);
    const network = await this.provider.getNetwork();
    
    return {
      address,
      balance: ethers.formatEther(balance),
      networkName: network.name,
      chainId: network.chainId.toString()
    };
  }

  // Generate verification URL for users
  generateVerificationUrl(transactionHash, networkName = 'sepolia') {
    const explorers = {
      ethereum: `https://etherscan.io/tx/${transactionHash}`,
      mainnet: `https://etherscan.io/tx/${transactionHash}`,
      sepolia: `https://sepolia.etherscan.io/tx/${transactionHash}`,
      polygon: `https://polygonscan.com/tx/${transactionHash}`,
      goerli: `https://goerli.etherscan.io/tx/${transactionHash}`
    };
    
    return explorers[networkName] || explorers.sepolia;
  }
}

export const blockchainService = new BlockchainVerificationService();
