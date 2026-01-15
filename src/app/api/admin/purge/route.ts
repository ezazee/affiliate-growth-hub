import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const collectionsToPurge = ['users', 'products', 'orders', 'commissions', 'affiliateLinks', 'withdrawals', 'settings'];

    const results = [];
    for (const collectionName of collectionsToPurge) {
      try {
        const result = await db.collection(collectionName).deleteMany({});
        results.push({
          collection: collectionName,
          deletedCount: result.deletedCount
        });
      } catch (e: any) {
        if (e.codeName === 'NamespaceNotFound') {
          results.push({
            collection: collectionName,
            deletedCount: 0,
            status: 'not_found'
          });
        } else {
          throw e;
        }
      }
    }

    // Also drop incorrect collection if it exists
    try {
      await db.dropCollection('affiliatelinks');
      results.push({
        collection: 'affiliatelinks',
        status: 'dropped'
      });
    } catch (e: any) {
      if (e.codeName === 'NamespaceNotFound') {
        results.push({
          collection: 'affiliatelinks',
          status: 'not_found'
        });
      } else {
        throw e;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Database purge complete',
      results
    });

  } catch (error) {
    console.error('❌ An error occurred during purge:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to purge database',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}