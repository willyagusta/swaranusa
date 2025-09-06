import { NextResponse } from 'next/server';
import { blockchainService } from '@/lib/blockchain';

export async function GET() {
  try {
    await blockchainService.initialize();
    const walletInfo = await blockchainService.getWalletInfo();
    
    // Check contract ownership using the correct function
    let contractInfo = null;
    if (blockchainService.contract) {
      try {
        const contractData = await blockchainService.contract.getContractInfo();
        const contractOwner = contractData[0];
        const totalVerifications = contractData[1];
        const contractBalance = contractData[2];
        
        contractInfo = {
          contractAddress: process.env.FEEDBACK_CONTRACT_ADDRESS,
          contractOwner: contractOwner,
          totalVerifications: totalVerifications.toString(),
          contractBalance: contractBalance.toString(),
          isWalletOwner: contractOwner.toLowerCase() === walletInfo.address.toLowerCase(),
          ownershipStatus: contractOwner.toLowerCase() === walletInfo.address.toLowerCase() ? 
            "✅ Your wallet owns this contract" : 
            "❌ Your wallet does NOT own this contract"
        };
        
      } catch (contractError) {
        contractInfo = {
          contractAddress: process.env.FEEDBACK_CONTRACT_ADDRESS,
          error: `Failed to read contract: ${contractError.message}`,
          possibleIssues: [
            "Contract not deployed at this address",
            "Wrong contract address",
            "Network mismatch"
          ]
        };
      }
    }
    
    return NextResponse.json({
      environment_variables: {
        FEEDBACK_CONTRACT_ADDRESS: process.env.FEEDBACK_CONTRACT_ADDRESS ? 'Set ✓' : 'Missing ✗',
        ADMIN_WALLET_PRIVATE_KEY: process.env.ADMIN_WALLET_PRIVATE_KEY ? 'Set ✓' : 'Missing ✗',
        SEPOLIA_URL: process.env.SEPOLIA_URL || 'Using default',
      },
      wallet_info: walletInfo,
      contract_info: contractInfo
    });
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}