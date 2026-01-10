import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { AffiliateLink, Product } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const affiliatorId = searchParams.get('affiliatorId');

  if (!affiliatorId) {
    return NextResponse.json({ error: 'affiliatorId is required' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const userLinksRaw = await db.collection<AffiliateLink>('affiliateLinks').find({ affiliatorId }).toArray();
    const uniqueProductLinks = new Map<string, AffiliateLink>();
    userLinksRaw.forEach(link => {
      // Prioritize the first occurrence found, or could add logic to prioritize by _id for example
      if (!uniqueProductLinks.has(link.productId)) {
        uniqueProductLinks.set(link.productId, link);
      }
    });
    const userLinks = Array.from(uniqueProductLinks.values()).map(link => ({ ...link, id: link._id.toString() }));
    const productIds = userLinks.map(link => link.productId);
    const products = await db.collection<Product>('products').find({ _id: { $in: productIds } }).toArray();

    const linksWithProducts = userLinks.map(link => {
      const product = products.find(p => p._id.toString() === link.productId);
      return {
        ...link,
        productName: product?.name || 'Unknown Product',
        productPrice: product?.price || 0,
        commissionRate: product ? `${product.commissionValue}${product.commissionType === 'percentage' ? '%' : '$'}` : 'N/A',
      };
    });

    return NextResponse.json(linksWithProducts);
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { affiliatorId, productId, code, isActive } = await req.json();

    if (!affiliatorId || !productId || !code) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Check if an affiliate link already exists for this affiliator and product
    const existingLink = await db.collection<AffiliateLink>('affiliateLinks').findOne({ affiliatorId, productId });

    if (existingLink) {
      return NextResponse.json({ error: 'Affiliate link for this product already exists for this affiliator' }, { status: 409 });
    }

    const newLink = {
      affiliatorId,
      productId,
      code,
      isActive: isActive ?? true,
    };

    const result = await db.collection('affiliateLinks').insertOne(newLink);

    // Return the inserted document with _id mapped to id
    const insertedLink = { ...newLink, id: result.insertedId.toString() };

    return NextResponse.json(insertedLink, { status: 201 });
  } catch (error) {
    console.error('Error creating affiliate link:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
