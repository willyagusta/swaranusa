import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export async function GET() {
  try {
    // Check feedbacks
    const feedbacks = await sql`
      SELECT id, title, category, location, urgency, sentiment
      FROM feedbacks
      WHERE category IS NOT NULL AND location IS NOT NULL
    `;

    // Check combinations
    const combinations = await sql`
      SELECT 
        category,
        location,
        COUNT(*) as feedback_count,
        COUNT(CASE WHEN urgency = 'high' THEN 1 END) as high_priority_count
      FROM feedbacks
      WHERE category IS NOT NULL 
      AND location IS NOT NULL
      GROUP BY category, location
      HAVING COUNT(*) >= 1
      ORDER BY feedback_count DESC
    `;

    // Check if government_reports table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'government_reports'
      );
    `;

    return NextResponse.json({
      feedbacks_count: feedbacks.length,
      feedbacks: feedbacks,
      combinations: combinations,
      government_reports_table_exists: tableExists[0].exists,
      debug: "If combinations is empty, your test data doesn't have matching category+location"
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
