import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { verifyToken } from '@/lib/auth';

const sql = neon(process.env.DATABASE_URL);

export async function GET(request) {
  try {
    console.log('Testing full government reports flow...');
    
    // Step 1: Authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'No token', step: 1 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token', step: 2 });
    }

    // Step 2: User check
    const [user] = await sql`
      SELECT role FROM users WHERE id = ${decoded.userId}
    `;

    if (!user || user.role !== 'government') {
      return NextResponse.json({ 
        error: 'Not government user', 
        step: 3,
        user_role: user?.role,
        user_id: decoded.userId
      });
    }

    // Step 3: Fetch reports (exact same query as the real API)
    const reports = await sql`
      SELECT * FROM government_reports
      WHERE 1=1
      ORDER BY created_at DESC
    `;

    console.log('Reports found:', reports.length);

    return NextResponse.json({
      success: true,
      reports: reports,
      total_reports: reports.length,
      message: 'Full test successful'
    });

  } catch (error) {
    console.error('Full test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
