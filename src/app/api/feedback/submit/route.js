import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { clusteringService } from '@/lib/ollama';
import { blockchainService } from '@/lib/blockchain';
import { verifyToken } from '@/lib/auth';

const sql = neon(process.env.DATABASE_URL);

export async function POST(request) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content } = body;

    // Process feedback with Ollama
    const processed = await clusteringService.processFeedback(content);

    // Get existing feedbacks for clustering
    const existingFeedbacks = await sql`
      SELECT id, content, category, tags, cluster_id as "clusterId"
      FROM feedbacks 
      WHERE category = ${processed.category}
      ORDER BY created_at DESC 
      LIMIT 20
    `;

    let clusterId = null;

    if (existingFeedbacks.length > 0) {
      // Find similar feedbacks
      const similarity = await clusteringService.findSimilarFeedbacks(
        { content: processed.cleanedContent, category: processed.category, tags: processed.tags },
        existingFeedbacks
      );

      if (similarity.suggestedClusterId && !similarity.shouldCreateNewCluster) {
        clusterId = similarity.suggestedClusterId;
      } else if (similarity.shouldCreateNewCluster) {
        // Create new cluster
        const clusterInfo = await clusteringService.generateClusterName([
          { content: processed.cleanedContent, category: processed.category }
        ]);

        const [newCluster] = await sql`
          INSERT INTO clusters (name, description, category, keywords, feedback_count)
          VALUES (
            ${clusterInfo.name},
            ${clusterInfo.description},
            ${processed.category},
            ${JSON.stringify(clusterInfo.keywords)},
            1
          )
          RETURNING id
        `;
        clusterId = newCluster.id;
      }
    } else {
      // First feedback in this category - create new cluster
      const clusterInfo = await clusteringService.generateClusterName([
        { content: processed.cleanedContent, category: processed.category }
      ]);

      const [newCluster] = await sql`
        INSERT INTO clusters (name, description, category, keywords, feedback_count)
        VALUES (
          ${clusterInfo.name},
          ${clusterInfo.description},
          ${processed.category},
          ${JSON.stringify(clusterInfo.keywords)},
          1
        )
        RETURNING id
      `;
      clusterId = newCluster.id;
    }

    // Insert feedback
    const [newFeedback] = await sql`
      INSERT INTO feedbacks (
        user_id, title, content, original_content, processed_content,
        category, cluster_id, urgency, location, tags, sentiment
      )
      VALUES (
        ${decoded.userId},
        ${title},
        ${processed.cleanedContent},
        ${content},
        ${processed.cleanedContent},
        ${processed.category},
        ${clusterId},
        ${processed.urgency},
        ${processed.location},
        ${JSON.stringify(processed.tags)},
        ${processed.sentiment}
      )
      RETURNING id, title, content, category, urgency, sentiment, created_at
    `;

    // Update cluster feedback count
    if (clusterId) {
      await sql`
        UPDATE clusters 
        SET feedback_count = feedback_count + 1,
            updated_at = NOW()
        WHERE id = ${clusterId}
      `;
    }

    // BLOCKCHAIN VERIFICATION - This happens in background
    let blockchainResult = null;
    try {
      // Create blockchain verification asynchronously
      const feedbackForBlockchain = {
        id: newFeedback.id,
        userId: decoded.userId,
        title: newFeedback.title,
        content: newFeedback.content,
        createdAt: newFeedback.created_at
      };

      blockchainResult = await blockchainService.verifyFeedback(feedbackForBlockchain);
      
      // Update feedback with blockchain hash
      await sql`
        UPDATE feedbacks 
        SET blockchain_hash = ${blockchainResult.transactionHash},
            blockchain_verified = true,
            verification_data = ${JSON.stringify({
              blockNumber: blockchainResult.blockNumber,
              blockTimestamp: blockchainResult.blockTimestamp,
              gasUsed: blockchainResult.gasUsed,
              networkName: blockchainResult.networkName,
              feedbackHash: blockchainResult.feedbackHash
            })}
        WHERE id = ${newFeedback.id}
      `;

      // Log blockchain verification
      await sql`
        INSERT INTO blockchain_verifications (
          feedback_id, transaction_hash, block_number, block_timestamp,
          gas_used, network_name, verification_status
        )
        VALUES (
          ${newFeedback.id},
          ${blockchainResult.transactionHash},
          ${blockchainResult.blockNumber},
          ${blockchainResult.blockTimestamp},
          ${blockchainResult.gasUsed},
          ${blockchainResult.networkName},
          'confirmed'
        )
      `;

    } catch (blockchainError) {
      console.error('Blockchain verification failed:', blockchainError);
      // Don't fail the entire request if blockchain fails
      // Log the error for later retry
      await sql`
        UPDATE feedbacks 
        SET blockchain_verified = false,
            verification_data = ${JSON.stringify({ error: blockchainError.message })}
        WHERE id = ${newFeedback.id}
      `;
    }

    return NextResponse.json({
      success: true,
      feedback: newFeedback,
      clusterId,
      processed,
      blockchain: blockchainResult ? {
        verified: true,
        transactionHash: blockchainResult.transactionHash,
        verificationUrl: blockchainService.generateVerificationUrl(
          blockchainResult.transactionHash, 
          blockchainResult.networkName
        )
      } : { verified: false, error: 'Blockchain verification pending' }
    });

  } catch (error) {
    console.error('Feedback submission error:', error);
    return NextResponse.json(
      { error: 'Failed to process feedback' },
      { status: 500 }
    );
  }
}
