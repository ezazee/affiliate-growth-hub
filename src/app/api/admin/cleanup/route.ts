import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();

    console.log('🧹 Starting cleanup of inconsistent data...');

    // 1. Remove all affiliate links (start fresh)
    const linksResult = await db.collection('affiliateLinks').deleteMany({});
    console.log(`🗑️ Deleted ${linksResult.deletedCount} affiliate links`);

    // 2. Remove all test commissions and orders  
    const commissionsResult = await db.collection('commissions').deleteMany({});
    console.log(`🗑️ Deleted ${commissionsResult.deletedCount} commissions`);

    const ordersResult = await db.collection('orders').deleteMany({});
    console.log(`🗑️ Deleted ${ordersResult.deletedCount} orders`);

    const withdrawalsResult = await db.collection('withdrawals').deleteMany({});
    console.log(`🗑️ Deleted ${withdrawalsResult.deletedCount} withdrawals`);

    // 3. Remove test users (keep only essential ones)
    const testUserEmails = ['alice@example.com', 'bob@example.com', 'newuser@test.com'];
    const usersResult = await db.collection('users').deleteMany({
      email: { $in: testUserEmails }
    });
    console.log(`🗑️ Deleted ${usersResult.deletedCount} test users`);

    // 4. Reset settings to default
    await db.collection('settings').deleteMany({});
    await db.collection('settings').insertMany([
      { name: 'minimumWithdrawal', value: 50000, createdAt: new Date() }
    ]);
    console.log('🔄 Reset settings to default');

    const results = {
      affiliateLinks: linksResult.deletedCount,
      commissions: commissionsResult.deletedCount,
      orders: ordersResult.deletedCount,
      withdrawals: withdrawalsResult.deletedCount,
      users: usersResult.deletedCount,
      settingsReset: true
    };

    console.log('✅ Cleanup complete!');
    console.log('Results:', results);

    return NextResponse.json({
      success: true,
      message: 'Cleanup complete - ready for fresh testing',
      results
    });

  } catch (error) {
    console.error('❌ Cleanup error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to cleanup database',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}