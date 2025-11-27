import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { clusteringService } from '@/lib/ollama';
import { blockchainService } from '@/lib/blockchain';
import { verifyToken } from '@/lib/auth';

const sql = neon(process.env.DATABASE_URL);

export async function POST(request) {
  try {
    // Set timezone to WIB
    await sql`SET timezone = 'Asia/Jakarta'`;
    
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
    const { title, content, provinsi, kota, kabupaten, location } = body;

    // Validate required fields
    if (!title?.trim() || !content?.trim() || !provinsi || !kota || !kabupaten) {
      return NextResponse.json({ 
        error: 'Title, content, provinsi, kota, and kabupaten are required' 
      }, { status: 400 });
    }

    // OPTIMIZATION 1: Process feedback with Claude AI
    const locationData = { provinsi, kota, kabupaten, location };
    const processed = await clusteringService.processFeedback(content, locationData);

    // OPTIMIZATION 2: Fetch existing feedbacks immediately after we have category
    // Don't wait for anything else
    const existingFeedbacks = await sql`
      SELECT id, content, category, tags, cluster_id as "clusterId", provinsi, kota, kabupaten
      FROM feedbacks 
      WHERE category = ${processed.category}
        AND provinsi = ${provinsi}
      ORDER BY created_at DESC 
      LIMIT 20
    `;

    let clusterId = null;

    // OPTIMIZATION 3: Clustering logic (sequential, but necessary)
    if (existingFeedbacks.length > 0) {
      const similarity = await clusteringService.findSimilarFeedbacks(
        { 
          content: processed.cleanedContent, 
          category: processed.category, 
          tags: processed.tags,
          originalLocation: locationData
        },
        existingFeedbacks
      );

      if (similarity.suggestedClusterId && !similarity.shouldCreateNewCluster) {
        clusterId = similarity.suggestedClusterId;
      } else if (similarity.shouldCreateNewCluster) {
        const clusterInfo = await clusteringService.generateClusterName([
          { 
            content: processed.cleanedContent, 
            category: processed.category,
            originalLocation: locationData
          }
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
      const clusterInfo = await clusteringService.generateClusterName([
        { 
          content: processed.cleanedContent, 
          category: processed.category,
          originalLocation: locationData
        }
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

    // OPTIMIZATION 4: Insert feedback and update cluster in parallel
    const [newFeedback] = await Promise.all([
      sql`
        INSERT INTO feedbacks (
          user_id, title, content, original_content, processed_content,
          category, cluster_id, urgency, 
          provinsi, kota, kabupaten, location,
          tags, sentiment, status
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
          ${provinsi},
          ${kota},
          ${kabupaten},
          ${location || null},
          ${JSON.stringify(processed.tags)},
          ${processed.sentiment},
          'belum_dilihat'
        )
        RETURNING id, title, content, category, urgency, sentiment, provinsi, kota, kabupaten, location, status, created_at
      `,
      // Update cluster count in parallel
      clusterId ? sql`
        UPDATE clusters 
        SET feedback_count = feedback_count + 1,
            updated_at = NOW()
        WHERE id = ${clusterId}
      ` : Promise.resolve()
    ]).then(results => results[0]);

    // OPTIMIZATION 5: Start blockchain verification but DON'T wait for it
    // Return response immediately after feedback is saved
    const feedbackForBlockchain = {
      id: newFeedback.id,
      userId: decoded.userId,
      title: newFeedback.title,
      content: newFeedback.content,
      location: `${provinsi}, ${kota}, ${kabupaten}${location ? `, ${location}` : ''}`,
      createdAt: newFeedback.created_at
    };

    // Fire blockchain verification without awaiting (async)
    blockchainService.verifyFeedback(feedbackForBlockchain)
      .then(async (blockchainResult) => {
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
      })
      .catch(async (blockchainError) => {
        console.error('Blockchain verification failed:', blockchainError);
        await sql`
          UPDATE feedbacks 
          SET blockchain_verified = false,
              verification_data = ${JSON.stringify({ error: blockchainError.message })}
          WHERE id = ${newFeedback.id}
        `;
      });

    // RETURN IMMEDIATELY
    return NextResponse.json({
      success: true,
      feedback: newFeedback,
      clusterId,
      processed,
      blockchain: { 
        verified: false, 
        status: 'processing',
        message: 'Blockchain verification in progress'
      }
    });

  } catch (error) {
    console.error('Feedback submission error:', error);
    return NextResponse.json(
      { error: 'Failed to process feedback' },
      { status: 500 }
    );
  }
}