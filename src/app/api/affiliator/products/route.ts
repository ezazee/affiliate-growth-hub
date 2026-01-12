import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Product } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();

    // Fetch only active products for affiliators
    const products = await db.collection<Product>('products').find({ isActive: true }).toArray();

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching affiliator products:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
