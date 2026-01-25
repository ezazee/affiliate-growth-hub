import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth-utils';

// MongoDB connection
async function connectToDatabase() {
  const client = await clientPromise;
  return client;
}

export async function POST(request: NextRequest) {
  try {
    const subscription = await request.json();

    // Early validation
    if (!subscription.endpoint || !subscription.keys || !subscription.keys.auth || !subscription.keys.p256dh) {
      return NextResponse.json(
        { error: 'Invalid subscription data. Missing required fields.' },
        { status: 400 }
      );
    }

    const userInfo = await getUserFromRequest(request);
    if (!userInfo) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const client = await connectToDatabase();
    const db = client.db();

    // Efficient update using atomic operators
    await db.collection('users').updateOne(
      { email: userInfo.email },
      {
        $set: {
          pushSubscription: subscription,
          notificationsEnabled: true,
          updatedAt: new Date(),
        }
      },
      { upsert: false } // User must exist
    );

    return NextResponse.json({
      success: true,
      message: 'Subscribed'
    });

  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { endpoint } = await request.json();

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint is required' },
        { status: 400 }
      );
    }

    // Get user from request
    const userInfo = await getUserFromRequest(request);
    if (!userInfo) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const client = await connectToDatabase();
    const db = client.db();

    // Remove push subscription
    await db.collection('users').updateOne(
      { email: userInfo.email },
      {
        $unset: {
          pushSubscription: '',
        },
        $set: {
          notificationsEnabled: false,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Unsubscribed',
    });

  } catch (error) {
    console.error('Unsubscription error:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}