import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { hashPassword, generateToken, setAuthCookie } from '@/lib/auth';
import { signUpSchema } from '@/lib/validations';

const sql = neon(process.env.DATABASE_URL);

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = signUpSchema.parse(body);
    
    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${validatedData.email}
    `;
    
    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }
    
    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);
    
    // Create user
    const [newUser] = await sql`
      INSERT INTO users (email, password, first_name, last_name, created_at, updated_at)
      VALUES (
        ${validatedData.email},
        ${hashedPassword},
        ${validatedData.firstName},
        ${validatedData.lastName},
        NOW(),
        NOW()
      )
      RETURNING id, email, first_name, last_name
    `;
    
    // Generate token and set cookie
    const token = generateToken(newUser.id);
    await setAuthCookie(token);
    
    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
      },
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    // Check for duplicate email error
    if (error.message?.includes('duplicate key') || error.message?.includes('unique constraint')) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}