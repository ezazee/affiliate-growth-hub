import clientPromise from '@/lib/mongodb';

export async function checkMongoHealth() {
  try {
    const client = await clientPromise;
    const db = client.db();
    await db.admin().ping();
    return { status: 'connected', message: 'MongoDB connection successful' };
  } catch (error) {
    console.error('MongoDB health check failed:', error);
    return { 
      status: 'error', 
      message: error instanceof Error ? error.message : 'Unknown error',
      isDnsError: error instanceof Error && (
        error.message.includes('ESERVFAIL') || 
        error.message.includes('queryTxt') ||
        error.message.includes('ENOTFOUND')
      )
    };
  }
}