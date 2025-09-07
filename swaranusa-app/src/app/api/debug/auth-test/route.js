import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { verifyToken } from '@/lib/auth';

const sql = neon(process.env.DATABASE_URL);

export async function GET(request) {
  try {
    console.log('Testing government authentication...');
    
    // Get token
    const token = request.cookies.get('auth-token')?.value;
    console.log('Token exists:', !!token);
    
    if (!token) {
      return NextResponse.json({ 
        step: 'token_check',
        success: false,
        error: 'No auth token found' 
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    console.log('Token valid:', !!decoded);
    console.log('Decoded token:', decoded);
    
    if (!decoded) {
      return NextResponse.json({ 
        step: 'token_verify',
        success: false,
        error: 'Invalid token' 
      });
    }

    // Get user
    const [user] = await sql`
      SELECT id, email, role, first_name, last_name, department, position 
      FROM users 
      WHERE id = ${decoded.userId}
    `;
    
    console.log('User found:', !!user);
    console.log('User data:', user);

    if (!user) {
      return NextResponse.json({ 
        step: 'user_lookup',
        success: false,
        error: 'User not found',
        user_id: decoded.userId
      });
    }

    if (user.role !== 'government') {
      return NextResponse.json({ 
        step: 'role_check',
        success: false,
        error: 'User is not government',
        user_role: user.role,
        user_data: user
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Government authentication successful',
      user: user,
      decoded_token: decoded
    });

  } catch (error) {
    console.error('Auth test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
