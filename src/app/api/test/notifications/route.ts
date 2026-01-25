import { NextRequest, NextResponse } from 'next/server';
import { adminNotifications, affiliatorNotifications } from '@/lib/notification-service-server';

export async function GET() {
  return NextResponse.json({
    message: 'Notification Test API',
    endpoints: [
      'POST /api/test/notifications/registration - Test new affiliator registration',
      'POST /api/test/notifications/order - Test new order',
      'POST /api/test/notifications/withdrawal - Test withdrawal request',
      'POST /api/test/notifications/all - Test all notifications'
    ]
  });
}

export async function POST(req: NextRequest) {
  try {
    const { testType, data } = await req.json();

    switch (testType) {
      case 'registration':
        await testRegistrationNotification(data);
        break;
      case 'order':
        await testOrderNotification(data);
        break;
      case 'withdrawal':
        await testWithdrawalNotification(data);
        break;
      case 'all':
        await testAllNotifications(data);
        break;
      default:
        return NextResponse.json({ error: 'Invalid test type' }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Test completed for ${testType}` 
    });

  } catch (error) {
    console.error('Notification test error:', error);
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

async function testRegistrationNotification(data: any) {
  const { name, email } = data || {
    name: 'Test Affiliator',
    email: 'test@affiliate.com'
  };

  await adminNotifications.newAffiliator(name, email);
  console.log(`✅ Registration notification sent: ${name} (${email})`);
}

async function testOrderNotification(data: any) {
  const { orderNumber, customerName, total, commission, affiliatorEmail } = data || {
    orderNumber: 'ORDER-TEST123',
    customerName: 'Test Customer',
    total: 'Rp 150,000',
    commission: 'Rp 15,000',
    affiliatorEmail: 'adm.peskinproid@gmail.com' // Change to actual affiliator email
  };

  // Test admin notification
  await adminNotifications.newOrder(orderNumber, customerName, total);
  
  // Test affiliator notification
  if (affiliatorEmail) {
    await affiliatorNotifications.newOrder(orderNumber, commission, affiliatorEmail);
  }
  
  console.log(`✅ Order notification sent: ${orderNumber}`);
}

async function testWithdrawalNotification(data: any) {
  const { affiliateName, amount, affiliatorEmail } = data || {
    affiliateName: 'Test Affiliate',
    amount: 'Rp 100,000',
    affiliatorEmail: 'adm.peskinproid@gmail.com' // Change to actual affiliator email
  };

  // Test admin notification
  await adminNotifications.withdrawalRequest(affiliateName, amount);
  
  // Test affiliator notification
  if (affiliatorEmail) {
    await affiliatorNotifications.withdrawalApproved(amount, new Date().toLocaleString('id-ID'), affiliatorEmail);
    await affiliatorNotifications.balanceUpdated('Rp 50,000', affiliatorEmail);
  }
  
  console.log(`✅ Withdrawal notification sent: ${amount}`);
}

async function testAllNotifications(data: any) {
  const testEmail = data?.email || 'adm.peskinproid@gmail.com';

  console.log('🧪 Testing ALL notification types...');

  // 1. Admin Notifications
  await adminNotifications.newAffiliator('John Doe', 'john@example.com');
  await adminNotifications.newOrder('ORDER-ALL001', 'Jane Smith', 'Rp 200,000');
  await adminNotifications.withdrawalRequest('Alice Johnson', 'Rp 150,000');

  // 2. Affiliator Notifications
  await affiliatorNotifications.newOrder('ORDER-ALL002', 'Rp 20,000', testEmail);
  await affiliatorNotifications.orderShipped('ORDER-ALL003', 'Charlie Brown', testEmail);
  await affiliatorNotifications.orderCompleted('ORDER-ALL004', 'Diana Prince', testEmail);
  await affiliatorNotifications.commissionEarned('Rp 25,000', 'ORDER-ALL005', testEmail);
  await affiliatorNotifications.balanceUpdated('Rp 75,000', testEmail);
  await affiliatorNotifications.withdrawalApproved('Rp 50,000', '22/01/2026 10:30', testEmail);
  await affiliatorNotifications.withdrawalRejected('Rp 30,000', 'Insufficient balance', testEmail);

  console.log('✅ ALL notification tests completed');
}