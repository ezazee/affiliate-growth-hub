import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { affiliatorNotifications } from '@/lib/notification-service-server';
import { webNotificationService } from '@/lib/web-notification-service';

export async function POST(req: NextRequest) {
  try {
    const { orderNumber, status, affiliateEmail } = await req.json();

    if (!orderNumber || !status) {
      return NextResponse.json({ error: 'Missing orderNumber or status' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Get order details
    const order = await db.collection('orders').findOne({ orderNumber });
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Update order status
    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    // Add timestamps based on status
    if (status === 'shipped') {
      updateData.shippedAt = new Date();
    } else if (status === 'completed') {
      updateData.completedAt = new Date();
    }

    await db.collection('orders').updateOne(
      { orderNumber },
      { $set: updateData }
    );

    // Send notifications
    try {
      const targetEmail = affiliateEmail || (await db.collection('users').findOne({ _id: new ObjectId(order.affiliatorId) }))?.email;

      if (targetEmail) {
        if (status === 'shipped' || status === 'shipping') {
          await affiliatorNotifications.orderShipped(
            orderNumber,
            order.buyerName,
            targetEmail
          );

        } else if (status === 'paid' || status === 'completed') {
          // Send Paid Notification
          await affiliatorNotifications.orderPaid(
            orderNumber,
            targetEmail
          );

          // Also send Completed notification if it was explicitly 'completed' (legacy)
          if (status === 'completed') {
            await affiliatorNotifications.orderCompleted(
              orderNumber,
              order.buyerName,
              targetEmail
            );
          }

          // COMMISSION LOGIC (Triggered on PAID)
          // 1. Check if commission already exists to avoid duplicates
          const existingCommission = await db.collection('commissions').findOne({
            orderNumber: orderNumber
          });

          if (!existingCommission) {
            const commissionRate = 0.1; // 10% commission
            const commissionAmount = Math.round(order.productPrice * commissionRate);

            // Fetch product for name
            const product = await db.collection('products').findOne({ _id: new ObjectId(order.productId) });

            // Update commission in database
            await db.collection('commissions').insertOne({
              orderNumber,
              orderId: orderNumber, // Consistency
              affiliatorId: order.affiliatorId,
              productId: order.productId,
              productName: product?.name || 'Product',
              amount: commissionAmount, // Correct field name
              status: 'paid', // Mark as paid so it is withdrawable
              createdAt: new Date(),
              date: new Date(),
              completedAt: new Date()
            });

            // Calculate and send balance update notification
            // Get updated balance
            const allCommissions = await db.collection('commissions').find({
              affiliatorId: order.affiliatorId,
              status: 'paid'
            }).toArray();

            const availableBalance = allCommissions.reduce((sum, commission) => {
              const usedAmount = commission.usedAmount || 0;
              return sum + (commission.amount - usedAmount);
            }, 0);

            await affiliatorNotifications.commissionEarned(
              commissionAmount.toLocaleString('id-ID'),
              orderNumber,
              targetEmail
            );

            await affiliatorNotifications.balanceUpdated(
              availableBalance.toLocaleString('id-ID'),
              targetEmail
            );
          } else {
            console.log(`ℹ️ Commission already exists for order ${orderNumber}, skipping creation.`);
          }
        }
      }

      console.log(`✅ All notifications sent for order status update: ${orderNumber} -> ${status}`);
    } catch (notificationError) {
      console.error('❌ Failed to send notifications for order update:', notificationError);
    }

    return NextResponse.json({
      success: true,
      message: `Order ${orderNumber} status updated to ${status}`
    });

  } catch (error) {
    console.error('Order status update error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}