import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { verifyPassword, generateToken, setAuthCookie } from '@/lib/auth';
import { signInSchema } from '@/lib/validations';

const sql = neon(process.env.DATABASE_URL);

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = signInSchema.parse(body);
    
    // Find user by email
    const users = await sql`
      SELECT id, email, password, first_name, last_name 
      FROM users 
      WHERE email = ${validatedData.email}
    `;
    
    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    const user = users[0];
    
    // Verify password
    const isValidPassword = await verifyPassword(validatedData.password, user.password);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Generate token and set cookie
    const token = generateToken(user.id);
    await setAuthCookie(token);
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      },
    });
    
  } catch (error) {
    console.error('Signin error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}



