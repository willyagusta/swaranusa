import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { verifyToken } from '@/lib/auth';
import { reportGenerator } from '@/lib/reportGenerator';

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

    // Check if user is government official (you'll need to add role check)
    const [user] = await sql`
      SELECT role FROM users WHERE id = ${decoded.userId}
    `;

    if (!user || user.role !== 'government') {
      return NextResponse.json({ error: 'Access denied. Government access required.' }, { status: 403 });
    }

    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const location = url.searchParams.get('location');

    // Get all existing reports or filter by category/location
    let reports;

    if (category && location) {
      reports = await sql`
        SELECT * FROM government_reports
        WHERE category = ${category} AND location = ${location}
        ORDER BY created_at DESC
      `;
    } else if (category) {
      reports = await sql`
        SELECT * FROM government_reports
        WHERE category = ${category}
        ORDER BY created_at DESC
      `;
    } else if (location) {
      reports = await sql`
        SELECT * FROM government_reports
        WHERE location = ${location}
        ORDER BY created_at DESC
      `;
    } else {
      // Get all reports
      reports = await sql`
        SELECT * FROM government_reports
        ORDER BY created_at DESC
      `;
    }

    // Add deduplication based on ID (most reliable)
    const uniqueReports = reports.filter((report, index, self) => 
      index === self.findIndex(r => r.id === report.id)
    );

    return NextResponse.json({
      success: true,
      reports: uniqueReports // Use deduplicated reports
    });

  } catch (error) {
    console.error('Government reports error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
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
      SELECT role FROM users WHERE id = ${decoded.userId}
    `;

    if (!user || user.role !== 'government') {
      return NextResponse.json({ error: 'Access denied. Government access required.' }, { status: 403 });
    }

    const body = await request.json();
    const { category, kota, kabupaten, provinsi } = body;

    if (!category || !kota || !provinsi) {
      return NextResponse.json(
        { error: 'Category, kota, and provinsi are required' },
        { status: 400 }
      );
    }

    // Get feedbacks for the specified category and location
    let feedbacks;
    
    if (kabupaten && kabupaten !== kota) {
      // Search by kota, kabupaten, and provinsi
      feedbacks = await sql`
        SELECT 
          f.*,
          u.first_name,
          u.last_name
        FROM feedbacks f
        JOIN users u ON f.user_id = u.id
        WHERE f.category = ${category} 
        AND f.kota = ${kota}
        AND f.kabupaten = ${kabupaten}
        AND f.provinsi = ${provinsi}
        ORDER BY f.created_at DESC
      `;
    } else {
      // Search by kota and provinsi (when kota is same as kabupaten or kabupaten not specified)
      feedbacks = await sql`
        SELECT 
          f.*,
          u.first_name,
          u.last_name
        FROM feedbacks f
        JOIN users u ON f.user_id = u.id
        WHERE f.category = ${category} 
        AND (f.kota = ${kota} OR f.kabupaten = ${kota})
        AND f.provinsi = ${provinsi}
        ORDER BY f.created_at DESC
      `;
    }

    if (feedbacks.length === 0) {
      return NextResponse.json(
        { error: 'No feedbacks found for the specified category and location' },
        { status: 404 }
      );
    }

    // Generate AI report with new parameters
    const reportData = await reportGenerator.generateReport(feedbacks, category, kota, kabupaten, provinsi);

    // Save report to database with new structure
    const [newReport] = await sql`
      INSERT INTO government_reports (
        title, category, kota, kabupaten, provinsi, location, report_content, executive_summary,
        key_findings, recommendations, feedback_ids, total_feedbacks,
        sentiment_breakdown, urgency_breakdown, generated_by, status
      )
      VALUES (
        ${reportData.title},
        ${reportData.category},
        ${reportData.kota},
        ${reportData.kabupaten},
        ${reportData.provinsi},
        ${reportData.location},
        ${reportData.reportContent},
        ${reportData.executiveSummary},
        ${JSON.stringify(reportData.keyFindings)},
        ${JSON.stringify(reportData.recommendations)},
        ${JSON.stringify(reportData.feedbackIds)},
        ${reportData.totalFeedbacks},
        ${JSON.stringify(reportData.sentimentBreakdown)},
        ${JSON.stringify(reportData.urgencyBreakdown)},
        ${decoded.userId},
        ${reportData.status}
      )
      RETURNING *
    `;

    // Get current user info
    const [currentUser] = await sql`
      SELECT first_name, last_name, department FROM users WHERE id = ${decoded.userId}
    `;

    // Update all included feedbacks status to "dilihat" if they were "belum_dilihat"
    const feedbackIds = reportData.feedbackIds;
    
    if (feedbackIds && feedbackIds.length > 0) {
      // Create the status note properly
      const statusNote = `Feedback dimasukkan dalam laporan: ${reportData.title}`;
      
      // Update feedbacks that are currently "belum_dilihat" to "dilihat"
      await sql`
        UPDATE feedbacks 
        SET 
          status = 'dilihat',
          status_updated_by = ${decoded.userId},
          status_updated_at = NOW(),
          status_note = ${statusNote},
          updated_at = NOW()
        WHERE id = ANY(${feedbackIds}) 
        AND status = 'belum_dilihat'
      `;

      // Add status history for updated feedbacks
      // First, get the feedbacks that were actually updated
      const updatedFeedbacks = await sql`
        SELECT id FROM feedbacks 
        WHERE id = ANY(${feedbackIds}) 
        AND status = 'dilihat'
        AND status_updated_by = ${decoded.userId}
        AND status_updated_at >= NOW() - INTERVAL '1 minute'
      `;

      // Add history entries for each updated feedback
      for (const feedback of updatedFeedbacks) {
        await sql`
          INSERT INTO feedback_status_history (feedback_id, old_status, new_status, updated_by, note)
          VALUES (
            ${feedback.id},
            'belum_dilihat',
            'dilihat',
            ${decoded.userId},
            ${statusNote}
          )
        `;
      }
    }

    return NextResponse.json({
      success: true,
      report: newReport,
      message: `Laporan berhasil dibuat untuk ${reportData.location} dengan ${feedbacks.length} feedback. Status feedback telah diperbarui.`,
      feedbacksUpdated: feedbackIds ? feedbackIds.length : 0
    });

  } catch (error) {
    console.error('Generate report error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}


