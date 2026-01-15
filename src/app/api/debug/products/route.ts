import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();

    // Fetch products with detailed logging
    const products = await db.collection('products')
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
      .toArray();

    console.log('Raw products from DB:', JSON.stringify(products, null, 2));

    // Map _id to id and format response
    const productsWithId = products.map((p) => {
      console.log(`Product: ${p.name}, Commission: ${p.commissionValue} (type: ${typeof p.commissionValue})`);
      return {
        id: p._id?.toString(),
        name: p.name,
        slug: p.slug,
        price: p.price,
        description: p.description,
        imageUrl: p.imageUrl,
        commissionType: p.commissionType,
        commissionValue: p.commissionValue,
        isActive: p.isActive
      };
    });

    return NextResponse.json(productsWithId);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}