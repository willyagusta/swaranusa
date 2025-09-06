import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { blockchainService } from '@/lib/blockchain';

const sql = neon(process.env.DATABASE_URL);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const feedbackId = searchParams.get('feedbackId');
    const transactionHash = searchParams.get('transactionHash');

    if (!feedbackId && !transactionHash) {
      return NextResponse.json(
        { error: 'feedbackId or transactionHash required' },
        { status: 400 }
      );
    }

    let feedback;
    if (feedbackId) {
      const feedbacks = await sql`
        SELECT id, blockchain_hash, blockchain_verified, verification_data, created_at
        FROM feedbacks 
        WHERE id = ${feedbackId}
      `;
      
      if (feedbacks.length === 0) {
        return NextResponse.json(
          { error: 'Feedback not found' },
          { status: 404 }
        );
      }
      
      feedback = feedbacks[0];
    }

    const hashToVerify = transactionHash || feedback?.blockchain_hash;
    
    if (!hashToVerify) {
      return NextResponse.json({
        verified: false,
        message: 'No blockchain verification found for this feedback'
      });
    }

    // Check blockchain verification
    const verification = await blockchainService.checkVerification(hashToVerify);
    
    // Get verification logs from database
    const verificationLogs = await sql`
      SELECT * FROM blockchain_verifications 
      WHERE transaction_hash = ${hashToVerify}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({
      verified: verification.verified,
      transactionHash: hashToVerify,
      verificationUrl: blockchainService.generateVerificationUrl(hashToVerify),
      blockchainData: verification,
      verificationLogs: verificationLogs,
      feedbackData: feedback ? {
        id: feedback.id,
        createdAt: feedback.created_at,
        verificationData: feedback.verification_data
      } : null
    });

  } catch (error) {
    console.error('Verification check error:', error);
    return NextResponse.json(
      { error: 'Failed to verify blockchain record' },
      { status: 500 }
    );
  }
}
