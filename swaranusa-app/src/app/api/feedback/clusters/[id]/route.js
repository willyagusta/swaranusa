import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // Get cluster details based on category
    const clusterResult = await sql`
      SELECT 
        category as id,
        category as name,
        CASE 
          WHEN category = 'infrastructure' THEN 'Kumpulan masukan mengenai infrastruktur dan fasilitas umum'
          WHEN category = 'transport' THEN 'Kumpulan masukan mengenai transportasi dan mobilitas'
          WHEN category = 'governance' THEN 'Kumpulan masukan mengenai tata kelola pemerintahan'
          WHEN category = 'environment' THEN 'Kumpulan masukan mengenai lingkungan dan kebersihan'
          WHEN category = 'education' THEN 'Kumpulan masukan mengenai pendidikan dan fasilitas belajar'
          WHEN category = 'healthcare' THEN 'Kumpulan masukan mengenai kesehatan dan fasilitas medis'
          WHEN category = 'economy' THEN 'Kumpulan masukan mengenai ekonomi dan kesejahteraan'
          WHEN category = 'social' THEN 'Kumpulan masukan mengenai sosial dan kemasyarakatan'
          WHEN category = 'security' THEN 'Kumpulan masukan mengenai keamanan dan ketertiban'
          WHEN category = 'technology' THEN 'Kumpulan masukan mengenai teknologi dan digitalisasi'
          WHEN category = 'other' THEN 'Kumpulan masukan lainnya'
          ELSE CONCAT('Kumpulan masukan mengenai ', category)
        END as description,
        category,
        COUNT(*) as "feedbackCount",
        -- Count each sentiment type
        SUM(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END) as "positiveCount",
        SUM(CASE WHEN sentiment = 'neutral' THEN 1 ELSE 0 END) as "neutralCount",
        SUM(CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END) as "negativeCount",
        MIN(created_at) as "createdAt",
        MAX(updated_at) as "updatedAt",
        ARRAY_AGG(DISTINCT 
          CASE 
            WHEN urgency = 'high' THEN 'mendesak'
            WHEN urgency = 'medium' THEN 'sedang'
            WHEN urgency = 'low' THEN 'rendah'
            ELSE urgency
          END
        ) as keywords
      FROM feedbacks
      WHERE category = ${id}
      GROUP BY category
    `;

    if (clusterResult.length === 0) {
      return NextResponse.json(
        { error: 'Cluster not found' },
        { status: 404 }
      );
    }


    // Calculate majority sentiment
    const cluster = clusterResult[0];
    const { positiveCount, neutralCount, negativeCount, feedbackCount } = cluster;

    // Find the dominant sentiment
    let dominantSentiment = 'neutral';
    let dominantCount = neutralCount || 0;
    let dominantPercentage = 0;

    if ((positiveCount || 0) > dominantCount) {
      dominantSentiment = 'positive';
      dominantCount = positiveCount;
    }
    if ((negativeCount || 0) > dominantCount) {
      dominantSentiment = 'negative';
      dominantCount = negativeCount;
    }

    dominantPercentage = feedbackCount > 0 ? (dominantCount / feedbackCount) : 0;

    // Add sentiment info to cluster
    cluster.avgSentiment = dominantPercentage;
    cluster.avgSentimentLabel = dominantSentiment;
    cluster.sentimentCounts = {
      positive: positiveCount || 0,
      neutral: neutralCount || 0,
      negative: negativeCount || 0
    };    
    const feedbacks = await sql`
      SELECT 
        f.id,
        f.title,
        f.content,
        f.category,
        f.provinsi,
        f.kota,
        f.kabupaten,
        f.location,
        f.urgency,
        f.status,
        f.sentiment,
        f.created_at as "createdAt",
        f.updated_at as "updatedAt",
        u.first_name as "userFirstName",
        u.last_name as "userLastName",
        u.email as "userEmail"
      FROM feedbacks f
      LEFT JOIN users u ON f.user_id = u.id
      WHERE f.category = ${id}
      ORDER BY f.created_at DESC
    `;

    return NextResponse.json({
      success: true,
      cluster: {
        ...cluster,
        feedbacks
      }
    });

  } catch (error) {
    console.error('Cluster detail fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cluster details' },
      { status: 500 }
    );
  }
}
