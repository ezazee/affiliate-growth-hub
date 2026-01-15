import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Product } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();

    // Fetch only active products for public landing page
    const products = await db.collection<Product>('products')
      .find({ isActive: true })
      .project({
        name: 1,
        slug: 1,
        price: 1,
        description: 1,
        imageUrl: 1,
        commissionType: 1,
        commissionValue: 1,
        isActive: 1
      })
      .sort({ createdAt: 1 })
      .toArray();

    // Map _id to id and format the response
    const productsWithId = products.map((p) => ({
      id: p._id?.toString(),
      name: p.name,
      slug: p.slug,
      price: p.price,
      description: p.description,
      imageUrl: p.imageUrl,
      commissionType: p.commissionType,
      commissionValue: p.commissionValue,
      isActive: p.isActive
    }));

    return NextResponse.json(productsWithId);
  } catch (error) {
    console.error('Error fetching public products:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}