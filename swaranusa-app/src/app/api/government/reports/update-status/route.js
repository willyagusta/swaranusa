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
      return NextResponse.json({ error: 'Akses ditolak. Hanya petugas pemerintah yang dapat mengubah status.' }, { status: 403 });
    }

    const body = await request.json();
    const { reportId, newStatus, note } = body;

    if (!reportId || !newStatus) {
      return NextResponse.json({ error: 'Report ID dan status baru diperlukan' }, { status: 400 });
    }

    // Validate status
    const validStatuses = ['masuk_daftar_bahasan', 'dirapatkan', 'ditindak_lanjuti', 'selesai'];
    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 });
    }

    // Get the report details (category, location, creation time)
    const [report] = await sql`
      SELECT id, category, location, created_at, title FROM government_reports WHERE id = ${reportId}
    `;

    if (!report) {
      return NextResponse.json({ error: 'Laporan tidak ditemukan' }, { status: 404 });
    }

    // Find all feedbacks that match this report's criteria
    // (same category, location, and created before or at the time the report was created)
    const feedbacksToUpdate = await sql`
      SELECT id, status FROM feedbacks 
      WHERE category = ${report.category} 
        AND location = ${report.location}
        AND created_at <= ${report.created_at}
    `;
    
    if (feedbacksToUpdate.length === 0) {
      return NextResponse.json({ error: 'Tidak ada feedback yang terkait dengan laporan ini' }, { status: 400 });
    }

    const feedbackIds = feedbacksToUpdate.map(f => f.id);
    const statusNote = note || `Status diubah melalui laporan: ${report.title}`;

    // Update all matching feedbacks
    await sql`
      UPDATE feedbacks 
      SET 
        status = ${newStatus},
        status_updated_by = ${decoded.userId},
        status_updated_at = NOW(),
        status_note = ${statusNote},
        updated_at = NOW()
      WHERE id = ANY(${feedbackIds})
    `;

    // Add status history for all updated feedbacks
    for (const feedback of feedbacksToUpdate) {
      await sql`
        INSERT INTO feedback_status_history (
          feedback_id, old_status, new_status, updated_by, note, created_at
        )
        VALUES (
          ${feedback.id},
          ${feedback.status},
          ${newStatus},
          ${decoded.userId},
          ${statusNote},
          NOW()
        )
      `;
    }

    return NextResponse.json({
      success: true,
      message: `Status berhasil diubah untuk ${feedbackIds.length} feedback`,
      updatedCount: feedbackIds.length,
      updatedBy: `${user.first_name} ${user.last_name}${user.department ? ` - ${user.department}` : ''}`
    });

  } catch (error) {
    console.error('Update report feedback status error:', error);
    return NextResponse.json({ error: 'Gagal mengubah status feedback' }, { status: 500 });
  }
}
