import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { verifyToken } from '@/lib/auth';

const sql = neon(process.env.DATABASE_URL);

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
    const limit = url.searchParams.get('limit') || '10';

    // Get user's feedback submissions with status information
    const feedbacks = await sql`
      SELECT 
        f.id,
        f.title,
        f.content,
        f.category,
        f.location,
        f.urgency,
        f.sentiment,
        f.status,
        f.status_note,
        f.status_updated_at,
        f.created_at,
        f.blockchain_verified,
        f.blockchain_hash,
        su.first_name as status_updated_by_name,
        su.last_name as status_updated_by_lastname,
        su.department as status_updated_by_department
      FROM feedbacks f
      LEFT JOIN users su ON f.status_updated_by = su.id
      WHERE f.user_id = ${decoded.userId}
      ORDER BY f.created_at DESC
      LIMIT ${parseInt(limit)}
    `;

    // Get status labels in Indonesian
    const feedbacksWithLabels = feedbacks.map(feedback => ({
      ...feedback,
      statusLabel: getStatusLabel(feedback.status),
      statusColor: getStatusColor(feedback.status)
    }));

    return NextResponse.json({
      success: true,
      feedbacks: feedbacksWithLabels
    });

  } catch (error) {
    console.error('Get user feedbacks error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data feedback' }, { status: 500 });
  }
}

// Helper functions for status labels and colors
function getStatusLabel(status) {
  const statusLabels = {
    'belum_dilihat': 'Belum Dilihat',
    'dilihat': 'Dilihat',
    'masuk_daftar_bahasan': 'Masuk Daftar Bahasan',
    'dirapatkan': 'Dirapatkan',
    'ditindak_lanjuti': 'Ditindak Lanjuti',
    'selesai': 'Selesai'
  };
  return statusLabels[status] || 'Status Tidak Diketahui';
}

function getStatusColor(status) {
  const statusColors = {
    'belum_dilihat': 'bg-gray-100 text-gray-800',
    'dilihat': 'bg-blue-100 text-blue-800',
    'masuk_daftar_bahasan': 'bg-yellow-100 text-yellow-800',
    'dirapatkan': 'bg-orange-100 text-orange-800',
    'ditindak_lanjuti': 'bg-purple-100 text-purple-800',
    'selesai': 'bg-green-100 text-green-800'
  };
  return statusColors[status] || 'bg-gray-100 text-gray-800';
}
