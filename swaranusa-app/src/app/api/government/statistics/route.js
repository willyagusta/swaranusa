import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { verifyToken } from '@/lib/auth';

const sql = neon(process.env.DATABASE_URL);

export async function GET(request) {
  try {
    // Verify user authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get all government users with their statistics
    const governmentStats = await sql`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.department,
        u.position,
        u.political_party,
        COUNT(CASE WHEN f.status = 'dilihat' THEN 1 END) as reports_read,
        COUNT(CASE WHEN f.status = 'masuk_daftar_bahasan' THEN 1 END) as reports_in_discussion,
        COUNT(CASE WHEN f.status = 'dirapatkan' THEN 1 END) as reports_in_meeting,
        COUNT(CASE WHEN f.status = 'ditindak_lanjuti' THEN 1 END) as reports_followed_up,
        COUNT(CASE WHEN f.status = 'selesai' THEN 1 END) as reports_completed,
        COUNT(CASE WHEN f.status = 'belum_dilihat' THEN 1 END) as reports_unread,
        COUNT(f.id) as total_reports_handled,
        MAX(f.status_updated_at) as last_activity
      FROM users u
      LEFT JOIN feedbacks f ON u.id = f.status_updated_by
      WHERE u.role = 'government'
      GROUP BY u.id, u.first_name, u.last_name, u.department, u.position, u.political_party
      ORDER BY u.first_name, u.last_name
    `;

    // Get political party statistics
    const partyStats = await sql`
      SELECT 
        u.political_party,
        COUNT(DISTINCT u.id) as member_count,
        COUNT(CASE WHEN f.status = 'dilihat' THEN 1 END) as total_reports_read,
        COUNT(CASE WHEN f.status = 'masuk_daftar_bahasan' THEN 1 END) as total_reports_in_discussion,
        COUNT(CASE WHEN f.status = 'belum_dilihat' THEN 1 END) as total_reports_unread,
        COUNT(f.id) as total_reports_handled
      FROM users u
      LEFT JOIN feedbacks f ON u.id = f.status_updated_by
      WHERE u.role = 'government' AND u.political_party IS NOT NULL
      GROUP BY u.political_party
      ORDER BY member_count DESC
    `;

    // Get overall statistics
    const overallStats = await sql`
      SELECT 
        COUNT(DISTINCT CASE WHEN u.role = 'government' THEN u.id END) as total_government_users,
        COUNT(DISTINCT u.political_party) as total_political_parties,
        COUNT(CASE WHEN f.status = 'dilihat' THEN 1 END) as total_reports_read,
        COUNT(CASE WHEN f.status = 'masuk_daftar_bahasan' THEN 1 END) as total_reports_in_discussion,
        COUNT(CASE WHEN f.status = 'belum_dilihat' THEN 1 END) as total_reports_unread,
        COUNT(f.id) as total_reports
      FROM users u
      LEFT JOIN feedbacks f ON u.id = f.status_updated_by
      WHERE u.role = 'government'
    `;

    // Get department statistics
    const departmentStats = await sql`
      SELECT 
        u.department,
        COUNT(DISTINCT u.id) as member_count,
        COUNT(CASE WHEN f.status = 'dilihat' THEN 1 END) as reports_read,
        COUNT(CASE WHEN f.status = 'masuk_daftar_bahasan' THEN 1 END) as reports_in_discussion,
        COUNT(CASE WHEN f.status = 'belum_dilihat' THEN 1 END) as reports_unread,
        COUNT(f.id) as total_reports_handled
      FROM users u
      LEFT JOIN feedbacks f ON u.id = f.status_updated_by
      WHERE u.role = 'government' AND u.department IS NOT NULL
      GROUP BY u.department
      ORDER BY member_count DESC
    `;

    return NextResponse.json({
      success: true,
      data: {
        governmentStats,
        partyStats,
        overallStats: overallStats[0] || {},
        departmentStats
      }
    });

  } catch (error) {
    console.error('Government statistics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch government statistics' },
      { status: 500 }
    );
  }
}
