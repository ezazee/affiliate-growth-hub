import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Product } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { name, slug, price, description, commissionType, commissionValue, isActive, imageUrl } = await req.json();

    if (!name || !slug || !price || !commissionType || !commissionValue) {
      return NextResponse.json({ error: 'Missing required product fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Check for duplicate slug
    const existingProduct = await db.collection<Product>('products').findOne({ slug });
    if (existingProduct) {
      return NextResponse.json({ error: 'Product with this slug already exists' }, { status: 409 });
    }

    const newProduct: Omit<Product, 'id' | '_id'> = {
      name,
      slug,
      price: Number(price),
      description: description || '',
      commissionType,
      commissionValue: Number(commissionValue),
      isActive: isActive ?? true,
      imageUrl: imageUrl || '/placeholder.svg',
    };

    const result = await db.collection<Product>('products').insertOne(newProduct as Product);
    const createdProduct = { ...newProduct, id: result.insertedId.toString() };

    return NextResponse.json(createdProduct, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const products = await db.collection<Product>('products').find({}).toArray();

    // Map _id to id for consistency with frontend
    const formattedProducts = products.map(product => {
      const { id, ...rest } = product; // Remove the original 'id' field
      return {
        ...rest,
        id: product._id.toString(), // Convert ObjectId to string
      };
    });

    return NextResponse.json(formattedProducts);
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
