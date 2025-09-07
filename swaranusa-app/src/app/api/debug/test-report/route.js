import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { reportGenerator } from '@/lib/reportGenerator';

const sql = neon(process.env.DATABASE_URL);

export async function GET() {
  try {
    // Get the Jakarta infrastructure feedbacks
    const feedbacks = await sql`
      SELECT 
        f.*,
        u.first_name,
        u.last_name
      FROM feedbacks f
      JOIN users u ON f.user_id = u.id
      WHERE f.category = 'infrastructure' 
      AND f.location = 'Jakarta'
      ORDER BY f.created_at DESC
    `;

    if (feedbacks.length === 0) {
      return NextResponse.json({ error: 'No feedbacks found' });
    }

    // Test report generation
    const reportData = await reportGenerator.generateReport(feedbacks, 'infrastructure', 'Jakarta');

    return NextResponse.json({
      feedbacks_found: feedbacks.length,
      feedbacks: feedbacks,
      generated_report: reportData,
      success: true
    });

  } catch (error) {
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
