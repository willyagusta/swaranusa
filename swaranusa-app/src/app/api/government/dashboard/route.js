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

    // Get date filter parameters
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || '30days';
    const customStart = searchParams.get('startDate');
    const customEnd = searchParams.get('endDate');

    // Calculate date range based on filter
    let dateCondition = `created_at >= NOW() - INTERVAL '30 days'`;
    let days = 30;
    
    if (filter === 'custom' && customStart && customEnd) {
      dateCondition = `created_at >= '${customStart}'::date AND created_at <= '${customEnd}'::date + INTERVAL '1 day'`;
      const start = new Date(customStart);
      const end = new Date(customEnd);
      days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    } else {
      switch (filter) {
        case '7days':
          dateCondition = `created_at >= NOW() - INTERVAL '7 days'`;
          days = 7;
          break;
        case '90days':
          dateCondition = `created_at >= NOW() - INTERVAL '90 days'`;
          days = 90;
          break;
        case '6months':
          dateCondition = `created_at >= NOW() - INTERVAL '6 months'`;
          days = 180;
          break;
        case '1year':
          dateCondition = `created_at >= NOW() - INTERVAL '1 year'`;
          days = 365;
          break;
        case 'lifetime':
          dateCondition = `1=1`; // No date filter
          days = null;
          break;
        default: // 30days
          dateCondition = `created_at >= NOW() - INTERVAL '30 days'`;
          days = 30;
      }
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
      WHERE ${sql.unsafe(dateCondition)}
    `;

    // Get feedback by category
    const categoryStats = await sql`
      SELECT 
        category,
        COUNT(*) as count,
        COUNT(CASE WHEN urgency = 'high' THEN 1 END) as high_urgency_count
      FROM feedbacks
      WHERE ${sql.unsafe(dateCondition)}
      GROUP BY category
      ORDER BY count DESC
      LIMIT 10
    `;

    // Get feedback by location (province and city)
    const locationStats = await sql`
      SELECT 
        provinsi,
        kota,
        kabupaten,
        CASE 
          WHEN kota IS NOT NULL AND kabupaten IS NOT NULL AND kota != kabupaten 
          THEN CONCAT(kota, ', ', kabupaten, ', ', provinsi)
          WHEN kota IS NOT NULL 
          THEN CONCAT(kota, ', ', provinsi)
          WHEN kabupaten IS NOT NULL 
          THEN CONCAT(kabupaten, ', ', provinsi)
          ELSE provinsi
        END as location,
        COUNT(*) as count,
        COUNT(CASE WHEN urgency = 'high' THEN 1 END) as high_urgency_count
      FROM feedbacks
      WHERE ${sql.unsafe(dateCondition)}
      AND provinsi IS NOT NULL
      GROUP BY provinsi, kota, kabupaten
      ORDER BY count DESC
      LIMIT 20
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

    // Get status pipeline counts
    const statusCounts = await sql`
      SELECT 
        status,
        COUNT(*) as count
      FROM feedbacks
      WHERE ${sql.unsafe(dateCondition)}
      GROUP BY status
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
      availableReports,
      statusCounts,
      filterInfo: {
        filter,
        days,
        startDate: customStart,
        endDate: customEnd
      }
    });

  } catch (error) {
    console.error('Government dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
