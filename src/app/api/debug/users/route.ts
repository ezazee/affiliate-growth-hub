import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

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