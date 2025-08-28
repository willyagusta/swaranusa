import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    environment_variables: {
      DATABASE_URL: process.env.DATABASE_URL ? 'Set ✓' : 'Missing ✗',
      DATABASE_URL_preview: process.env.DATABASE_URL?.substring(0, 30) + '...',
      JWT_SECRET: process.env.JWT_SECRET ? 'Set ✓' : 'Missing ✗',
      NODE_ENV: process.env.NODE_ENV || 'Not set'
    }
  });
}
