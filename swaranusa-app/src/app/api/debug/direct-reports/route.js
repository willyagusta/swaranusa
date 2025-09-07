import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export async function GET() {
  try {
    console.log('Testing direct database access...');
    
    // Direct query without any authentication
    const reports = await sql`
      SELECT 
        id, title, category, location, total_feedbacks, 
        status, created_at, generated_by
      FROM government_reports
      ORDER BY created_at DESC
    `;

    console.log('Found reports:', reports.length);

    return NextResponse.json({
      success: true,
      message: `Found ${reports.length} reports in database`,
      reports: reports,
      raw_query_result: reports
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
