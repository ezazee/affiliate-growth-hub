import webpush from 'web-push';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Configure VAPID keys
// In a real app, these should be environment variables
// For this session, we use the generated keys
const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BPCvkIo9U5A5g0TIVZLwKKdn5OrycBTaOwLsyCYUXngspMOVBXqqpGeCb5Vn4g_f4YuzlOQB2kRUnVdv1LBy134';
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || 'WrcD3K5L-pPnjjx014F_bQ8VJBJAaqwUWWHBZvOkhc8';

webpush.setVapidDetails(
  'mailto:admin@peskinpro.com',
  publicVapidKey,
  privateVapidKey
);

export type NotificationType = 
  | 'NEW_ORDER' 
  | 'ORDER_PAID' 
  | 'AFFILIATOR_APPROVED' 
  | 'WITHDRAWAL_APPROVED' 
  | 'ADMIN_NEW_ORDER'
  | 'ADMIN_USER_REGISTER';

const DEFAULT_TEMPLATES = {
  NEW_ORDER: {
    title: 'Pesanan Baru Masuk! 🎉',
    body: 'Pesanan #{orderNumber} senilai {amount} telah masuk melalui link Anda.'
  },
  ORDER_PAID: {
    title: 'Komisi Diterima! 💰',
    body: 'Pesanan #{orderNumber} telah dibayar. Anda menerima komisi {commission}!'
  },
  AFFILIATOR_APPROVED: {
    title: 'Akun Disetujui! ✅',
    body: 'Akun affiliate Anda telah disetujui. Mulai bagikan link sekarang!'
  },
  WITHDRAWAL_APPROVED: {
    title: 'Penarikan Disetujui 💸',
    body: 'Penarikan dana sebesar {amount} telah disetujui dan diproses.'
  },
  ADMIN_NEW_ORDER: {
    title: 'Order Baru (Admin)',
    body: 'Order #{orderNumber} dari {affiliate} baru saja masuk.'
  },
  ADMIN_USER_REGISTER: {
    title: 'Pendaftaran Baru! 👤',
    body: 'Affiliator baru: {name} ({email}) menunggu persetujuan.'
  }
};

async function getTemplate(type: NotificationType): Promise<{title: string, body: string}> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const settings = await db.collection('settings').findOne({ name: 'notification_templates' });
    
    if (settings && settings.value && settings.value[type]) {
      return settings.value[type];
    }
  } catch (e) {
    console.error('Error fetching templates, using default', e);
  }
  return DEFAULT_TEMPLATES[type];
}

function formatMessage(template: {title: string, body: string}, data: any) {
  let { title, body } = template;
  
  Object.keys(data).forEach(key => {
    const placeholder = `{${key}}`;
    title = title.replace(new RegExp(placeholder, 'g'), data[key]);
    body = body.replace(new RegExp(placeholder, 'g'), data[key]);
  });
  
  return { title, body };
}

export async function sendNotification(userId: string, type: NotificationType, data: any = {}) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    // Find subscription for user
    // We assume a 'subscriptions' collection where documents link to userId
    // schema: { userId: string, subscription: Object }
    const subs = await db.collection('subscriptions').find({ userId }).toArray();
    
    if (subs.length === 0) {
      console.log(`No subscriptions found for user ${userId}`);
      return;
    }

    const template = await getTemplate(type);
    const payload = JSON.stringify(formatMessage(template, data));

    const promises = subs.map(sub => 
      webpush.sendNotification(sub.subscription, payload)
        .catch(err => {
          if (err.statusCode === 410 || err.statusCode === 404) {
            // Subscription is gone, delete it
            db.collection('subscriptions').deleteOne({ _id: sub._id });
          } else {
            console.error('Error sending notification', err);
          }
        })
    );

    await Promise.all(promises);
    console.log(`Sent ${type} notification to user ${userId}`);
    
  } catch (error) {
    console.error('Error in sendNotification:', error);
  }
}

export async function sendAdminNotification(type: NotificationType, data: any = {}) {
    // Notify all admins
    // First find admin users
    const client = await clientPromise;
    const db = client.db();
    const admins = await db.collection('users').find({ role: 'admin' }).toArray();
    
    for (const admin of admins) {
        await sendNotification(admin.id, type, data);
    }
}
