import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { verifyToken } from '@/lib/auth';

const sql = neon(process.env.DATABASE_URL);

export async function POST(request) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user info
    const [user] = await sql`
      SELECT id, first_name, last_name, role, department 
      FROM users 
      WHERE id = ${decoded.userId}
    `;

    if (!user || user.role !== 'government') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { reportId } = await request.json();

    if (!reportId) {
      return NextResponse.json({ error: 'Report ID is required' }, { status: 400 });
    }

    // Get the report details
    const [report] = await sql`
      SELECT id, category, location, created_at 
      FROM government_reports 
      WHERE id = ${reportId}
    `;

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Find all feedbacks that match this report's criteria and are not yet viewed
    const feedbacksToUpdate = await sql`
      SELECT id FROM feedbacks 
      WHERE category = ${report.category} 
        AND location = ${report.location}
        AND created_at <= ${report.created_at}
        AND status = 'belum_dilihat'
    `;

    let updatedCount = 0;

    if (feedbacksToUpdate.length > 0) {
      // Update all matching feedbacks to "dilihat" status
      const feedbackIds = feedbacksToUpdate.map(f => f.id);
      
      for (const feedbackId of feedbackIds) {
        // Update feedback status
        await sql`
          UPDATE feedbacks 
          SET status = 'dilihat',
              status_updated_by = ${user.id},
              status_updated_at = NOW(),
              status_note = 'Dilihat melalui laporan ID ' || ${reportId}
          WHERE id = ${feedbackId}
        `;

        // Add to status history
        await sql`
          INSERT INTO feedback_status_history (
            feedback_id, old_status, new_status, updated_by, note, created_at
          ) VALUES (
            ${feedbackId}, 'belum_dilihat', 'dilihat', ${user.id}, 
            'Dilihat melalui laporan ID ' || ${reportId}, NOW()
          )
        `;
      }

      updatedCount = feedbackIds.length;
    }

    return NextResponse.json({
      success: true,
      message: `${updatedCount} feedback berhasil ditandai sebagai dilihat`,
      updatedCount
    });

  } catch (error) {
    console.error('Error marking report feedbacks as viewed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
