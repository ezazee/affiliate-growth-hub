import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Order } from '@/types';
import { ObjectId } from 'mongodb';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const affiliatorId = searchParams.get('affiliatorId');

  if (!affiliatorId) {
    return NextResponse.json({ error: 'affiliatorId is required' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

// Get orders first
    const orders = await db.collection('orders').find({ affiliatorId }).sort({ createdAt: -1 }).toArray();
    

    
    // Manual product lookup
    const allProducts = await db.collection('products').find().toArray();
    const productMap = new Map();
    
    allProducts.forEach(product => {
      productMap.set(product._id.toString(), product);
      if (product.id) productMap.set(product.id, product);
    });

    const ordersWithProducts = orders.map(order => {
      const product = productMap.get(order.productId) || productMap.get(order.productId.toString());
      
      // Calculate commission based on product commission setting from admin
      // If order is cancelled, commission is 0
      let commission = 0;
      if (order.status !== 'cancelled' && product) {
        if (product.commissionType === 'percentage') {
          commission = Math.round(product.price * (product.commissionValue / 100));
        } else if (product.commissionType === 'fixed') {
          commission = product.commissionValue || 0;
        }
      }
      
      return {
        ...order,
        id: order._id?.toString(),
        productName: product?.name || null,
        product: product || null,
        productPrice: product?.price || 0,
        commission: commission
      };
    });

    return NextResponse.json(ordersWithProducts);
  } catch (error) {
    console.error('Error fetching customer history:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
