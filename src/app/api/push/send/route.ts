import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import clientPromise from '@/lib/mongodb';

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
  const client = await clientPromise;
  return client;
}

export async function POST(request: NextRequest) {
  try {
    const { title, body, url = '/', targetEmail } = await request.json();

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
      // Accept both true and undefined/null for notificationsEnabled
      $or: [
        { notificationsEnabled: true },
        { notificationsEnabled: { $exists: false } },
        { notificationsEnabled: null }
      ]
    };

    // If targetEmail is specified, only send to that user
    if (targetEmail) {
      query.email = targetEmail;
    }

    const users = await usersCollection.find(query).toArray();

    if (users.length === 0) {
      // Debug info - check all users and their push subscription status
      const allUsers = await db.collection('users').find({}).toArray();

      // Check if any user has push subscription data but notificationsEnabled is missing/null
      const usersWithPushButDisabled = allUsers.filter(u => u.pushSubscription && !u.notificationsEnabled);

      return NextResponse.json({
        success: true,
        message: 'No users with push subscriptions found',
        sent: 0,
        debug: {
          totalUsers: allUsers.length,
          usersWithPush: allUsers.filter(u => u.pushSubscription).length,
          usersWithNotificationsEnabled: allUsers.filter(u => u.notificationsEnabled).length,
          usersWithPushButDisabled: usersWithPushButDisabled.length,
          queryUsed: query,
        }
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

        // If subscription is invalid or expired, remove it
        if (error.statusCode === 410 || error.statusCode === 404 ||
          error.message.includes('unexpected response code') ||
          error.message.includes('registration')) {
          await usersCollection.updateOne(
            { email: user.email },
            {
              $unset: { pushSubscription: '' },
              $set: { notificationsEnabled: false },
            }
          );
          return { success: false, userId: user.email, error: 'Subscription expired and removed' };
        }

        return { success: false, userId: user.email, error: error.message };
      }
    });

    const results = await Promise.allSettled(sendPromises);

    const successful = results.filter(r =>
      r.status === 'fulfilled' && r.value.success
    ).length;

    const failed = results.length - successful;

    // Collect error details
    const errorDetails = results
      .map(r => r.status === 'fulfilled' ? r.value : { success: false, error: 'Unknown error' })
      .filter(r => !r.success);

    return NextResponse.json({
      success: true,
      message: `Notification sent to ${successful} users`,
      sent: successful,
      failed,
      total: results.length,
      errorDetails: errorDetails.length > 0 ? errorDetails : undefined,
    });

  } catch (error) {
    console.error('Send notification error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send notification',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
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
          targetEmail: 'user@example.com' // optional, sends to all if not specified
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