import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export async function GET() {
  try {
    // Same query as government dashboard
    const availableReports = await sql`
      SELECT 
        category,
        location,
        COUNT(*) as feedback_count,
        COUNT(CASE WHEN urgency = 'high' THEN 1 END) as high_priority_count,
        MAX(created_at) as latest_feedback
      FROM feedbacks
      WHERE category IS NOT NULL 
      AND location IS NOT NULL
      GROUP BY category, location
      HAVING COUNT(*) >= 3
      ORDER BY feedback_count DESC, high_priority_count DESC
    `;

    return NextResponse.json({
      availableReports,
      debug: "This should show infrastructure + Jakarta with 3 feedbacks"
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
