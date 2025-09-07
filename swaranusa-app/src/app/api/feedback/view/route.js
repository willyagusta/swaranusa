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

    // Check if user is government official
    const [user] = await sql`
      SELECT role, first_name, last_name, department FROM users WHERE id = ${decoded.userId}
    `;

    if (!user || user.role !== 'government') {
      return NextResponse.json({ error: 'Akses ditolak. Hanya petugas pemerintah yang dapat melihat feedback.' }, { status: 403 });
    }

    const body = await request.json();
    const { feedbackId } = body;

    if (!feedbackId) {
      return NextResponse.json({ error: 'Feedback ID diperlukan' }, { status: 400 });
    }

    // Get current feedback
    const [feedback] = await sql`
      SELECT 
        f.*,
        u.first_name as submitter_first_name,
        u.last_name as submitter_last_name
      FROM feedbacks f
      JOIN users u ON f.user_id = u.id
      WHERE f.id = ${feedbackId}
    `;

    if (!feedback) {
      return NextResponse.json({ error: 'Feedback tidak ditemukan' }, { status: 404 });
    }

    // If status is "belum_dilihat", update to "dilihat"
    if (feedback.status === 'belum_dilihat') {
      await sql`
        UPDATE feedbacks 
        SET 
          status = 'dilihat',
          status_updated_by = ${decoded.userId},
          status_updated_at = NOW(),
          status_note = 'Feedback dilihat oleh petugas pemerintah',
          updated_at = NOW()
        WHERE id = ${feedbackId}
      `;

      // Add to status history
      await sql`
        INSERT INTO feedback_status_history (
          feedback_id, old_status, new_status, updated_by, note
        )
        VALUES (
          ${feedbackId},
          'belum_dilihat',
          'dilihat',
          ${decoded.userId},
          'Feedback dilihat oleh petugas pemerintah'
        )
      `;

      // Update feedback object
      feedback.status = 'dilihat';
      feedback.status_updated_by = decoded.userId;
      feedback.status_updated_at = new Date();
    }

    return NextResponse.json({
      success: true,
      feedback: {
        ...feedback,
        status_updated_by_name: user.first_name,
        status_updated_by_lastname: user.last_name,
        status_updated_by_department: user.department
      }
    });

  } catch (error) {
    console.error('View feedback error:', error);
    return NextResponse.json({ error: 'Gagal melihat feedback' }, { status: 500 });
  }
}