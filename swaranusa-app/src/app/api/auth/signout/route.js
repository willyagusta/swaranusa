import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';

export async function POST() {
  try {
    await clearAuthCookie();
    
    return NextResponse.json({
      success: true,
      message: 'Signed out successfully',
    });
  } catch (error) {
    console.error('Signout error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
