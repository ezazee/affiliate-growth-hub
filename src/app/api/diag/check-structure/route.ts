import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();

    // Cek struktur data products
    const products = await db.collection('products')
      .find({})
      .limit(3)
      .toArray();

    // Cek struktur data orders
    const orders = await db.collection('orders')
      .find({})
      .limit(3)
      .toArray();

    return NextResponse.json({
      success: true,
      data: {
        sampleProducts: products.map(p => ({
          _id: p._id,
          id: p.id,
          name: p.name,
          commissionType: p.commissionType,
          commissionValue: p.commissionValue
        })),
        sampleOrders: orders.map(o => ({
          _id: o._id,
          id: o.id,
          orderNumber: o.orderNumber,
          productId: o.productId,
          affiliatorId: o.affiliatorId,
          status: o.status
        }))
      }
    });

  } catch (error) {
    console.error('Error checking data structure:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check data structure' },
      { status: 500 }
    );
  }
}