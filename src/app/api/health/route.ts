import { NextResponse } from 'next/server';
import { checkMongoHealth } from '@/lib/mongodb-health';

export async function GET() {
  try {
    const health = await checkMongoHealth();
    
    return NextResponse.json(health, {
      status: health.status === 'connected' ? 200 : 503
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 });
  }
}