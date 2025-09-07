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

    // Check if user is government official
    const [user] = await sql`
      SELECT role FROM users WHERE id = ${decoded.userId}
    `;

    if (!user || user.role !== 'government') {
      return NextResponse.json({ error: 'Akses ditolak. Hanya petugas pemerintah yang dapat melihat feedback.' }, { status: 403 });
    }

    const url = new URL(request.url);
    const limit = url.searchParams.get('limit') || '50';
    const status = url.searchParams.get('status');

    // Get feedbacks with submitter information and status details
    let feedbacks;
    
    if (status) {
      feedbacks = await sql`
        SELECT 
          f.*,
          u.first_name as submitter_first_name,
          u.last_name as submitter_last_name,
          su.first_name as status_updated_by_name,
          su.last_name as status_updated_by_lastname,
          su.department as status_updated_by_department
        FROM feedbacks f
        JOIN users u ON f.user_id = u.id
        LEFT JOIN users su ON f.status_updated_by = su.id
        WHERE f.status = ${status}
        ORDER BY f.created_at DESC
        LIMIT ${parseInt(limit)}
      `;
    } else {
      feedbacks = await sql`
        SELECT 
          f.*,
          u.first_name as submitter_first_name,
          u.last_name as submitter_last_name,
          su.first_name as status_updated_by_name,
          su.last_name as status_updated_by_lastname,
          su.department as status_updated_by_department
        FROM feedbacks f
        JOIN users u ON f.user_id = u.id
        LEFT JOIN users su ON f.status_updated_by = su.id
        ORDER BY f.created_at DESC
        LIMIT ${parseInt(limit)}
      `;
    }

    return NextResponse.json({
      success: true,
      feedbacks
    });

  } catch (error) {
    console.error('Get government feedbacks error:', error);
    return NextResponse.json({ error: 'Gagal mengambil feedback' }, { status: 500 });
  }
}
