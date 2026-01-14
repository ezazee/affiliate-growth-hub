import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { Order } from '@/types';

export async function GET(req: NextRequest, { params }: { params: Promise<{ paymentToken: string }> }) {
  const { paymentToken } = await params;

  if (!paymentToken) {
    return NextResponse.json({ error: 'Payment token is required' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const orders = await db.collection('orders').aggregate([
      { $match: { paymentToken } },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } }
    ]).toArray();

    const order = orders[0];

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if the payment link has expired
    if (order.paymentTokenExpiresAt && new Date() > new Date(order.paymentTokenExpiresAt)) {
      // Optionally, update the order status to 'cancelled' if expired
      await db.collection<Order>('orders').updateOne(
        { _id: order._id },
        { $set: { status: 'cancelled' } }
      );
      return NextResponse.json({ error: 'Payment link has expired' }, { status: 410 }); // 410 Gone
    }

    // Check if the payment link has already been used
    if (order.isPaymentUsed) {
      return NextResponse.json({ error: 'Payment link already used' }, { status: 409 }); // 409 Conflict
    }

    // If the order is valid, return its details
    // It's good practice to mark the payment link as 'used' right after access
    // to prevent multiple uses, especially if the payment process is initiated.
    // However, for just fetching details, we might mark it used after successful payment.
    // For now, I'll assume we mark it when the user clicks "Pay" or equivalent.
    // For initial access, we just return the data.

    const orderWithId = { ...order, id: order._id?.toString() };
    return NextResponse.json(orderWithId);

  } catch (error) {
    console.error('Error fetching payment details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}