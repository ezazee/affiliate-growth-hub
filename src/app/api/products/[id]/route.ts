import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb'; // Import ObjectId
import { Product } from '@/types';

export async function PUT(
  req: NextRequest,
  context: any
) {
  try {
    const { id } = await context.params;
    const { name, slug, price, description, commissionType, commissionValue, isActive, imageUrl } = await req.json();

    if (!name || !slug || !price || !commissionType || !commissionValue) {
      return NextResponse.json({ error: 'Missing required product fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Check for duplicate slug, excluding the current product being updated
    const existingProductWithSlug = await db.collection<Product>('products').findOne({ slug, _id: { $ne: new ObjectId(id) } });
    if (existingProductWithSlug) {
      return NextResponse.json({ error: 'Product with this slug already exists' }, { status: 409 });
    }

    const updatedProductData: Partial<Product> = {
      name,
      slug,
      price: Number(price),
      description: description || '',
      commissionType,
      commissionValue: Number(commissionValue),
      isActive: isActive ?? true,
      imageUrl: imageUrl || '/placeholder.svg',
    };

    const result = await db.collection<Product>('products').updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedProductData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const updatedProduct = await db.collection<Product>('products').findOne({ _id: new ObjectId(id) });
    return NextResponse.json({ ...updatedProduct, id: updatedProduct?._id.toString() });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: any
) {
  try {
    const { id } = await context.params;

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection<Product>('products').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  context: any
) {
  try {
    const { id } = await context.params;

    const client = await clientPromise;
    const db = client.db();

    const product = await db.collection<Product>('products').findOne({ _id: new ObjectId(id) });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Map _id to id for consistency with frontend
    const { id: originalId, ...rest } = product; // Remove the original 'id' field
    const formattedProduct = {
      ...rest,
      id: product._id.toString(), // Convert ObjectId to string
    };

    return NextResponse.json(formattedProduct);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
