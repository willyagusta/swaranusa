import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { verifyToken } from '@/lib/auth';

const sql = neon(process.env.DATABASE_URL);

// Get feedback status with history
export async function GET(request) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const url = new URL(request.url);
    const feedbackId = url.searchParams.get('feedbackId');

    if (!feedbackId) {
      return NextResponse.json({ error: 'Feedback ID required' }, { status: 400 });
    }

    // Get current feedback with status
    const [feedback] = await sql`
      SELECT 
        f.*,
        u.first_name as status_updated_by_name,
        u.last_name as status_updated_by_lastname,
        u.department as status_updated_by_department
      FROM feedbacks f
      LEFT JOIN users u ON f.status_updated_by = u.id
      WHERE f.id = ${feedbackId}
    `;

    if (!feedback) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    }

    // Get status history
    const statusHistory = await sql`
      SELECT 
        fsh.*,
        u.first_name,
        u.last_name,
        u.department
      FROM feedback_status_history fsh
      JOIN users u ON fsh.updated_by = u.id
      WHERE fsh.feedback_id = ${feedbackId}
      ORDER BY fsh.created_at DESC
    `;

    return NextResponse.json({
      success: true,
      feedback,
      statusHistory
    });

  } catch (error) {
    console.error('Get feedback status error:', error);
    return NextResponse.json({ error: 'Failed to get feedback status' }, { status: 500 });
  }
}

// Update feedback status
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
      return NextResponse.json({ error: 'Akses ditolak. Hanya petugas pemerintah yang dapat mengubah status.' }, { status: 403 });
    }

    const body = await request.json();
    const { feedbackId, newStatus, note } = body;

    if (!feedbackId || !newStatus) {
      return NextResponse.json({ error: 'Feedback ID dan status baru diperlukan' }, { status: 400 });
    }

    // Validate status
    const validStatuses = ['belum_dilihat', 'dilihat', 'masuk_daftar_bahasan', 'dirapatkan', 'ditindak_lanjuti', 'selesai'];
    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 });
    }

    // Get current feedback
    const [currentFeedback] = await sql`
      SELECT status FROM feedbacks WHERE id = ${feedbackId}
    `;

    if (!currentFeedback) {
      return NextResponse.json({ error: 'Feedback tidak ditemukan' }, { status: 404 });
    }

    // Update feedback status
    await sql`
      UPDATE feedbacks 
      SET 
        status = ${newStatus},
        status_updated_by = ${decoded.userId},
        status_updated_at = NOW(),
        status_note = ${note || null},
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
        ${currentFeedback.status},
        ${newStatus},
        ${decoded.userId},
        ${note || null}
      )
    `;

    return NextResponse.json({
      success: true,
      message: `Status berhasil diubah menjadi ${getStatusLabel(newStatus)}`,
      updatedBy: `${user.first_name} ${user.last_name} - ${user.department || 'Pemerintah'}`
    });

  } catch (error) {
    console.error('Update feedback status error:', error);
    return NextResponse.json({ error: 'Gagal mengubah status feedback' }, { status: 500 });
  }
}

// Helper function to get status labels in Indonesian
function getStatusLabel(status) {
  const statusLabels = {
    'belum_dilihat': 'Belum Dilihat',
    'dilihat': 'Dilihat',
    'masuk_daftar_bahasan': 'Masuk Daftar Bahasan',
    'dirapatkan': 'Dirapatkan',
    'ditindak_lanjuti': 'Ditindak Lanjuti',
    'selesai': 'Selesai'
  };
  return statusLabels[status] || status;
}
