import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Order } from '@/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const affiliatorId = searchParams.get('affiliatorId');

  if (!affiliatorId) {
    return NextResponse.json({ error: 'affiliatorId is required' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const orders = await db.collection<Order>('orders').find({ affiliatorId }).sort({ createdAt: -1 }).toArray();

    // Collect productIds as strings
    const productIds = [...new Set(orders.map(order => order.productId))];
    // Find products by their string 'id' field
    const products = await db.collection('products').find({ id: { $in: productIds } }).toArray();

    // Map products by their string 'id' for easy lookup
    const productsMap = new Map(products.map(p => [p.id, p]));

    const ordersWithProducts = orders.map(order => ({
      ...order,
      id: order._id.toString(), // Keep _id to id mapping for the order itself
      product: productsMap.get(order.productId), // Lookup product by its string 'id'
    }));

    return NextResponse.json(ordersWithProducts);
  } catch (error) {
    console.error('Error fetching customer history:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
