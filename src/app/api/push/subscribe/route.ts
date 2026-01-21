import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { MongoClient, ObjectId } from 'mongodb';
import { getUserFromRequest } from '@/lib/auth-utils';

const mongodbUri = process.env.MONGODB_URI!;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!;
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

// Configure web-push
webpush.setVapidDetails(
  'mailto:admin@peskinpro.com',
  vapidPublicKey,
  vapidPrivateKey
);

// MongoDB connection
async function connectToDatabase() {
  const client = new MongoClient(mongodbUri);
  await client.connect();
  return client;
}

export async function POST(request: NextRequest) {
  try {
    const subscription = await request.json();

    if (!subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
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
    const usersCollection = db.collection('users');

    // Update user with push subscription
    await usersCollection.updateOne(
      { email: userInfo.email }, // Use email as identifier
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

    await client.close();

    // Send a test notification to confirm subscription
    try {
      await webpush.sendNotification(
        subscription,
        JSON.stringify({
          title: 'Notifications Enabled!',
          body: 'You\'ll now receive updates from PE Skinpro Affiliate.',
          url: '/',
          icon: '/favicon/android-chrome-192x192.png',
        })
      );
    } catch (testError) {
      console.error('Test notification failed:', testError);
      // Don't fail the subscription if test notification fails
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to push notifications',
    });

  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe to notifications' },
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
    const usersCollection = db.collection('users');

    // Remove push subscription
    await usersCollection.updateOne(
      { email: userInfo.email }, // Use email as identifier
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

    await client.close();

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from push notifications',
    });

  } catch (error) {
    console.error('Unsubscription error:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe from notifications' },
      { status: 500 }
    );
  }
}