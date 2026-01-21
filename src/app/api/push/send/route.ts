import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { MongoClient } from 'mongodb';

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
    const { title, body, url = '/', targetUserId } = await request.json();

    if (!title || !body) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      );
    }

    const client = await connectToDatabase();
    const db = client.db();
    const usersCollection = db.collection('users');

    let query: any = { 
      pushSubscription: { $exists: true, $ne: null },
      notificationsEnabled: true 
    };

    // If targetUserId is specified, only send to that user
    if (targetUserId) {
      query.email = targetUserId; // Using email as identifier
    }

    const users = await usersCollection.find(query).toArray();
    
    if (users.length === 0) {
      await client.close();
      return NextResponse.json({
        success: true,
        message: 'No users with push subscriptions found',
        sent: 0,
      });
    }

    const payload = JSON.stringify({
      title,
      body,
      url,
      icon: '/favicon/android-chrome-192x192.png',
      badge: '/favicon/favicon-32x32.png',
    });

    const sendPromises = users.map(async (user) => {
      try {
        await webpush.sendNotification(user.pushSubscription, payload);
        return { success: true, userId: user.email };
      } catch (error: any) {
        console.error(`Failed to send to ${user.email}:`, error);
        
        // If subscription is invalid, remove it
        if (error.statusCode === 410 || error.statusCode === 404) {
          await usersCollection.updateOne(
            { email: user.email },
            {
              $unset: { pushSubscription: '' },
              $set: { notificationsEnabled: false },
            }
          );
        }
        
        return { success: false, userId: user.email, error: error.message };
      }
    });

    const results = await Promise.allSettled(sendPromises);
    
    const successful = results.filter(r => 
      r.status === 'fulfilled' && r.value.success
    ).length;
    
    const failed = results.length - successful;

    await client.close();

    return NextResponse.json({
      success: true,
      message: `Notification sent to ${successful} users`,
      sent: successful,
      failed,
      total: results.length,
    });

  } catch (error) {
    console.error('Send notification error:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}

// GET endpoint to test send notification
export async function GET() {
  try {
    return NextResponse.json({
      message: 'Push notification send endpoint is working',
      usage: {
        endpoint: '/api/push/send',
        method: 'POST',
        body: {
          title: 'Notification Title',
          body: 'Notification body text',
          url: '/', // optional
          targetUserId: 'user@example.com' // optional, sends to all if not specified
        }
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Endpoint check failed' },
      { status: 500 }
    );
  }
}