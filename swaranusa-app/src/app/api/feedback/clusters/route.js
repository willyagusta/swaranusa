import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export async function GET(request) {
  try {
    const clusters = await sql`
      SELECT 
        c.*,
        c.feedback_count as "feedbackCount",
        c.avg_sentiment as "avgSentiment",
        c.created_at as "createdAt",
        c.updated_at as "updatedAt"
      FROM clusters c
      ORDER BY c.feedback_count DESC, c.created_at DESC
    `;

    return NextResponse.json({
      success: true,
      clusters
    });

  } catch (error) {
    console.error('Clusters fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clusters' },
      { status: 500 }
    );
  }
}
