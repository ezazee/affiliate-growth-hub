import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { getUserFromRequest } from '@/lib/auth-utils';

const mongodbUri = process.env.MONGODB_URI!;

// MongoDB connection
async function connectToDatabase() {
  const client = new MongoClient(mongodbUri);
  await client.connect();
  return client;
}

export async function POST(request: NextRequest) {
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