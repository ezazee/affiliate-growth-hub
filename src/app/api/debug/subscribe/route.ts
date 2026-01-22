import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth-utils';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection('users');
    
    const allUsers = await usersCollection.find({}).toArray();
    
    return NextResponse.json({
      success: true,
      users: allUsers.map(u => ({
        email: u.email,
        role: u.role,
        hasPushSubscription: !!u.pushSubscription,
        pushSubscriptionEndpoint: u.pushSubscription?.endpoint?.substring(0, 100) + '...',
        pushSubscriptionKeys: u.pushSubscription ? {
          auth: u.pushSubscription.keys?.auth?.substring(0, 20) + '...',
          p256dh: u.pushSubscription.keys?.p256dh?.substring(0, 20) + '...'
        } : null,
        notificationsEnabled: u.notificationsEnabled,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt
      })),
      totalUsers: allUsers.length,
      usersWithPushSubscription: allUsers.filter(u => u.pushSubscription).length
    });
  } catch (error) {
    console.error('Debug users error:', error);
    return NextResponse.json(
      { error: 'Failed to debug users', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const subscription = await request.json();
    const userInfo = await getUserFromRequest(request);
    
    if (!userInfo) {
      return NextResponse.json({ error: 'No user found' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection('users');

    // Debug: log what we're trying to save
    console.log('🔍 Debug subscribe attempt:', {
      email: userInfo.email,
      subscriptionEndpoint: subscription.endpoint?.substring(0, 50) + '...',
      subscriptionKeys: subscription.keys ? Object.keys(subscription.keys) : [],
      timestamp: new Date()
    });

    // Simulate subscribe API for debugging
    const result = await usersCollection.updateOne(
      { email: userInfo.email },
      {
        $set: {
          pushSubscription: subscription,
          notificationsEnabled: true,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    console.log('💾 Debug save result:', {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount,
      email: userInfo.email
    });

    // Verify the save
    const updatedUser = await usersCollection.findOne({ email: userInfo.email });
    
    return NextResponse.json({
      success: true,
      message: 'Debug subscription saved',
      result,
      user: {
        email: updatedUser?.email,
        hasPushSubscription: !!updatedUser?.pushSubscription,
        notificationsEnabled: updatedUser?.notificationsEnabled,
        endpoint: updatedUser?.pushSubscription?.endpoint?.substring(0, 50) + '...'
      }
    });

  } catch (error) {
    console.error('Debug subscribe error:', error);
    return NextResponse.json(
      { error: 'Debug subscribe failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}