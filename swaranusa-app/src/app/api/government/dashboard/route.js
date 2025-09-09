import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { verifyToken } from '@/lib/auth';

const sql = neon(process.env.DATABASE_URL);

export async function GET(request) {
  try {
    // Verify government user authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if user is government official
    const [user] = await sql`
      SELECT role, first_name, last_name, department, position FROM users WHERE id = ${decoded.userId}
    `;

    if (!user || user.role !== 'government') {
      return NextResponse.json({ error: 'Access denied. Government access required.' }, { status: 403 });
    }

    // Get dashboard statistics
    const [stats] = await sql`
      SELECT 
        COUNT(*) as total_feedbacks,
        COUNT(CASE WHEN urgency = 'high' THEN 1 END) as high_urgency,
        COUNT(CASE WHEN urgency = 'medium' THEN 1 END) as medium_urgency,
        COUNT(CASE WHEN urgency = 'low' THEN 1 END) as low_urgency,
        COUNT(CASE WHEN sentiment = 'positive' THEN 1 END) as positive_sentiment,
        COUNT(CASE WHEN sentiment = 'negative' THEN 1 END) as negative_sentiment,
        COUNT(CASE WHEN sentiment = 'neutral' THEN 1 END) as neutral_sentiment,
        COUNT(CASE WHEN blockchain_verified = true THEN 1 END) as verified_feedbacks
      FROM feedbacks
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `;

    // Get feedback by category
    const categoryStats = await sql`
      SELECT 
        category,
        COUNT(*) as count,
        COUNT(CASE WHEN urgency = 'high' THEN 1 END) as high_urgency_count
      FROM feedbacks
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY category
      ORDER BY count DESC
      LIMIT 10
    `;

    // Get feedback by location
    const locationStats = await sql`
      SELECT 
        location,
        COUNT(*) as count,
        COUNT(CASE WHEN urgency = 'high' THEN 1 END) as high_urgency_count
      FROM feedbacks
      WHERE created_at >= NOW() - INTERVAL '30 days'
      AND location IS NOT NULL
      GROUP BY location
      ORDER BY count DESC
      LIMIT 10
    `;

    // Get recent high-priority feedbacks
    const recentHighPriority = await sql`
      SELECT 
        f.id,
        f.title,
        f.category,
        f.location,
        f.urgency,
        f.sentiment,
        f.created_at,
        u.first_name,
        u.last_name
      FROM feedbacks f
      JOIN users u ON f.user_id = u.id
      WHERE f.urgency = 'high'
      ORDER BY f.created_at DESC
      LIMIT 10
    `;

    // Get available category-location combinations for report generation
    const availableReports = await sql`
      SELECT 
        category,
        kota,
        kabupaten,
        provinsi,
        CASE 
          WHEN kota IS NOT NULL AND kabupaten IS NOT NULL AND kota != kabupaten 
          THEN CONCAT(kota, ', ', kabupaten, ', ', provinsi)
          WHEN kota IS NOT NULL 
          THEN CONCAT(kota, ', ', provinsi)
          WHEN kabupaten IS NOT NULL 
          THEN CONCAT(kabupaten, ', ', provinsi)
          ELSE provinsi
        END as location_display,
        COUNT(*) as feedback_count,
        COUNT(CASE WHEN urgency = 'high' THEN 1 END) as high_priority_count,
        MAX(created_at) as latest_feedback
      FROM feedbacks
      WHERE category IS NOT NULL 
      AND provinsi IS NOT NULL
      AND (kota IS NOT NULL OR kabupaten IS NOT NULL)
      GROUP BY category, kota, kabupaten, provinsi
      HAVING COUNT(*) >= 3
      ORDER BY feedback_count DESC, high_priority_count DESC
    `;

    return NextResponse.json({
      success: true,
      user: {
        name: `${user.first_name} ${user.last_name}`,
        department: user.department,
        position: user.position
      },
      stats,
      categoryStats,
      locationStats,
      recentHighPriority,
      availableReports
    });

  } catch (error) {
    console.error('Government dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
