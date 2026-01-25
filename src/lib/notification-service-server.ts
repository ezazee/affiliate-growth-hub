import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import clientPromise from '@/lib/mongodb';
import {
  notificationTemplates,
  NotificationTemplateId,
  NotificationVariables,
  formatNotificationText
} from './notification-templates';
import { ObjectId } from 'mongodb';

const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!;
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

// Configure web-push
if (vapidPrivateKey && vapidPublicKey) {
  webpush.setVapidDetails(
    'mailto:admin@peskinpro.com',
    vapidPublicKey,
    vapidPrivateKey
  );
}

interface NotificationData {
  title: string;
  body: string;
  url: string;
  icon?: string;
  badge?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

interface NotificationTarget {
  role?: 'admin' | 'affiliator' | 'all';
  userId?: string;
  userEmail?: string;
}

// Save notification to database for Web UI
async function saveInAppNotification(
  data: NotificationData,
  target: NotificationTarget
) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const notificationsCollection = db.collection('notifications');

    const notificationDoc = {
      title: data.title,
      message: data.body, // Mapping body to message for WebNotification type
      type: data.type || 'info',
      url: data.url,
      timestamp: new Date(),
      read: false,
      target, // Store target info to filter queries
      createdAt: new Date()
    };

    // If target is specific users, we might want to create individual records or handle it in query
    // For simplicity, we store the target criteria and filter on read

    // However, for "read" status to work per user, we need individual records or a "readBy" array
    // Let's find the users and insert for each if it's a small group, or use a better schema.
    // Given the scale, finding users and inserting individual notifications is safer for "read" status.

    const usersCollection = db.collection('users');
    let query: any = {};

    if (target.role === 'admin') {
      query.role = 'admin';
    } else if (target.role === 'affiliator') {
      query.role = { $in: ['affiliator', 'affiliate'] };
    } else if (target.userEmail) {
      query.email = target.userEmail;
    } else if (target.userId) {
      query._id = new ObjectId(target.userId);
    }

    const users = await usersCollection.find(query).toArray();

    if (users.length > 0) {
      const notifications = users.map(user => ({
        ...notificationDoc,
        userEmail: user.email,
        userId: user._id.toString(),
        target: undefined // Remove generic target
      }));

      await notificationsCollection.insertMany(notifications);
      console.log(`💾 Saved ${notifications.length} in-app notifications`);
    }

  } catch (error) {
    console.error('❌ Failed to save in-app notification:', error);
  }
}

// Internal function to send the actual push notification
async function sendPushNotification(
  data: NotificationData,
  target?: NotificationTarget
): Promise<{ success: boolean; sent: number; failed: number; message: string }> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection('users');

    // Build query based on target
    let query: any = {
      pushSubscription: { $exists: true, $ne: null },
      $or: [
        { notificationsEnabled: true },
        { notificationsEnabled: { $exists: false } },
        { notificationsEnabled: null }
      ]
    };

    if (target) {
      if (target.role === 'admin') {
        query.role = 'admin';
      } else if (target.role === 'affiliator') {
        query.role = { $in: ['affiliator', 'affiliate'] };
      } else if (target.userEmail) {
        query.email = target.userEmail;
      } else if (target.userId) {
        query._id = new ObjectId(target.userId);
      }
    }

    const users = await usersCollection.find(query).toArray();

    if (users.length === 0) {
      return {
        success: true,
        sent: 0,
        failed: 0,
        message: 'No users with push subscriptions found'
      };
    }

    const payload = JSON.stringify({
      title: data.title,
      body: data.body,
      url: data.url,
      icon: data.icon || '/favicon/android-chrome-192x192.png',
      badge: data.badge || '/favicon/favicon-32x32.png',
    });

    const sendPromises = users.map(async (user) => {
      try {
        await webpush.sendNotification(user.pushSubscription, payload);
        return { success: true, userId: user.email };
      } catch (error: any) {
        console.error(`❌ Failed to send to ${user.email}:`, error.message);

        // Remove invalid subscription
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

    return {
      success: successful > 0,
      sent: successful,
      failed,
      message: `Notification sent to ${successful} users`
    };

  } catch (error) {
    console.error('❌ Notification service error:', error);
    return {
      success: false,
      sent: 0,
      failed: 0,
      message: `Failed to send notification: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Function to get template with custom overrides
async function getResolvedTemplate(templateId: NotificationTemplateId) {
  const defaultTemplate = notificationTemplates.find(t => t.id === templateId);
  if (!defaultTemplate) return null;

  try {
    const client = await clientPromise;
    const db = client.db();
    const settings = await db.collection('settings').findOne({ key: 'notificationTemplates' });

    const custom = settings?.templates?.find((t: any) => t.templateId === templateId);

    // If explicitly disabled
    if (custom && custom.enabled === false) {
      return null;
    }

    return {
      title: custom?.title || defaultTemplate.defaultTitle,
      body: custom?.body || defaultTemplate.defaultBody,
      url: custom?.url || defaultTemplate.defaultUrl,
      roles: defaultTemplate.roles,
      category: defaultTemplate.category
    };
  } catch (error) {
    console.error('Error fetching template settings:', error);
    // Fallback to default
    return {
      title: defaultTemplate.defaultTitle,
      body: defaultTemplate.defaultBody,
      url: defaultTemplate.defaultUrl,
      roles: defaultTemplate.roles,
      category: defaultTemplate.category
    };
  }
}

// Main function to trigger notification by template
export async function sendTemplateNotification(
  templateId: NotificationTemplateId,
  variables: NotificationVariables,
  targetOverride?: NotificationTarget
) {
  const template = await getResolvedTemplate(templateId);

  if (!template) {
    console.log(`🔕 Notification ${templateId} is disabled or invalid`);
    return;
  }

  const title = formatNotificationText(template.title, variables);
  const body = formatNotificationText(template.body, variables);
  const url = formatNotificationText(template.url, variables);

  // Determine target
  let target: NotificationTarget = {};

  if (targetOverride) {
    target = targetOverride;
  } else {
    if (template.roles.includes('admin')) {
      target.role = 'admin';
    } else if (template.roles.includes('affiliator')) {
      target.role = 'affiliator';
    }
  }

  // Map category to notification type
  let type: 'info' | 'success' | 'warning' | 'error' = 'info';
  if (template.category === 'commission' || template.category === 'order') type = 'success';
  if (template.category === 'withdrawal') type = 'warning';
  if (templateId === 'withdrawal_rejected') type = 'error';

  // 1. Save In-App Notification
  await saveInAppNotification({ title, body, url, type }, target);

  // 2. Send Push Notification
  return sendPushNotification(
    { title, body, url, type },
    target
  );
}

// Helper methods maintaining the old API but using the new system
export const adminNotifications = {
  newAffiliator: (name: string, email: string) =>
    sendTemplateNotification('new_affiliate', { name, email }, { role: 'admin' }),

  newOrder: (orderId: string, customerName: string, amount: string) =>
    sendTemplateNotification('new_order_admin', { orderId, customerName, amount }, { role: 'admin' }),

  withdrawalRequest: (name: string, amount: string) =>
    sendTemplateNotification('withdrawal_request', { name, amount }, { role: 'admin' }),
};

export const affiliatorNotifications = {
  newOrder: (orderId: string, amount: string, targetUserEmail: string) =>
    sendTemplateNotification('new_order_affiliate', { orderId, amount }, { userEmail: targetUserEmail }),

  orderShipped: (orderId: string, customerName: string, targetUserEmail: string) =>
    sendTemplateNotification('order_shipped', { orderId, customerName }, { userEmail: targetUserEmail }),

  orderCompleted: (orderId: string, customerName: string, targetUserEmail: string) =>
    sendTemplateNotification('order_completed', { orderId, customerName }, { userEmail: targetUserEmail }),

  orderPaid: (orderId: string, targetUserEmail: string) =>
    sendTemplateNotification('order_paid', { orderId }, { userEmail: targetUserEmail }),

  commissionEarned: (amount: string, orderId: string, targetUserEmail: string) =>
    sendTemplateNotification('commission_earned', { amount, orderId }, { userEmail: targetUserEmail }),

  balanceUpdated: (balance: string, targetUserEmail: string) =>
    sendTemplateNotification('balance_updated', { balance }, { userEmail: targetUserEmail }),

  withdrawalApproved: (amount: string, processedAt: string, targetUserEmail: string) =>
    sendTemplateNotification('withdrawal_approved', { amount }, { userEmail: targetUserEmail }),

  withdrawalRejected: (amount: string, reason: string, targetUserEmail: string) =>
    sendTemplateNotification('withdrawal_rejected', { amount, reason }, { userEmail: targetUserEmail }),
};

// Export original sendNotification for backward compatibility if needed directly
export { sendPushNotification as sendNotification };