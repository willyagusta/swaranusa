import { NextResponse } from 'next/server';
import { blockchainService } from '@/lib/blockchain';

export async function GET() {
  try {
    // Only allow this in development or for admin users
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
    }

    const walletInfo = await blockchainService.getWalletInfo();
    
    return NextResponse.json({
      status: 'connected',
      wallet: walletInfo,
      recommendations: {
        needsFunds: parseFloat(walletInfo.balance) < 0.01,
        faucetUrl: walletInfo.chainId === '11155111' ? 'https://sepoliafaucet.com/' : null,
        explorerUrl: `https://sepolia.etherscan.io/address/${walletInfo.address}`
      }
    });

  } catch (error) {
    console.error('Blockchain status check failed:', error);
    
    return NextResponse.json({
      status: 'error',
      error: error.message,
      troubleshooting: {
        checkPrivateKey: 'Ensure ADMIN_WALLET_PRIVATE_KEY is set in environment variables',
        checkRPC: 'Verify BLOCKCHAIN_RPC_URL is accessible',
        getFunds: 'Get free Sepolia ETH from https://sepoliafaucet.com/'
      }
    });
  }
}
