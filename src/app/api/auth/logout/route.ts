import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // For stateless authentication like this app, 
    // the actual logout is handled client-side by clearing localStorage
    // This endpoint is mainly for logging purposes
    console.log('User logged out at:', new Date().toISOString());
    
    return NextResponse.json({ 
      success: true, 
      message: 'Logout successful' 
    });
  } catch (error) {
    console.error('Logout API error:', error);
    return NextResponse.json({ 
      error: 'Something went wrong' 
    }, { status: 500 });
  }
}
