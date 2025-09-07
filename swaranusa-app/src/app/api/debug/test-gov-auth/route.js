import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { verifyToken } from '@/lib/auth';

const sql = neon(process.env.DATABASE_URL);

export async function GET(request) {
  try {
    // Check authentication (same as government reports API)
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'No token found' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check user role
    const [user] = await sql`
      SELECT id, role, first_name, last_name, department, position FROM users WHERE id = ${decoded.userId}
    `;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role !== 'government') {
      return NextResponse.json({ 
        error: 'Access denied. Government access required.',
        user_role: user.role,
        user_info: user
      }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      message: 'Government authentication successful',
      user: user,
      token_decoded: decoded
    });

  } catch (error) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
