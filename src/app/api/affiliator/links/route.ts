import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { AffiliateLink, Product } from '@/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const affiliatorId = searchParams.get('affiliatorId');

  if (!affiliatorId) {
    return NextResponse.json({ error: 'affiliatorId is required' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    
    const matchQuery = affiliatorId === 'all' ? {} : { affiliatorId };

    const userLinksRaw = await db.collection<AffiliateLink>('affiliateLinks').find(matchQuery).toArray();
    const userLinks = userLinksRaw.map(link => ({ ...link, id: link._id.toString() }));
    
    const productIds = userLinks.map(link => link.productId);
    
    const productsRaw = await db.collection<Product>('products').find({ _id: { $in: productIds.map(id => new ObjectId(id)) } }).toArray();
    const products = productsRaw.map(p => ({ ...p, id: p._id.toString() }));

    const linksWithProducts = userLinks.map(link => {
      const product = products.find(p => p.id === link.productId);
      return {
        ...link,
        product: product,
      };
    });

    return NextResponse.json(linksWithProducts);
  } catch (error) {
    console.error('Error fetching affiliate links:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { affiliatorId, productId, isActive } = await req.json();

    if (!affiliatorId || !productId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    
    const affiliateLinksCollection = db.collection('affiliateLinks');
    
    // The frontend now sends the canonical string ID ("product1")
    const canonicalProductId = productId;

    // Check if an affiliate link already exists for this affiliator and product
    const existingLink = await affiliateLinksCollection.findOne({ affiliatorId, productId: canonicalProductId });

    if (existingLink) {
      return NextResponse.json({ error: 'Affiliate link for this product already exists' }, { status: 409 });
    }

    const newLink = {
      affiliatorId,
      productId: canonicalProductId,
      isActive: isActive ?? true,
      createdAt: new Date(),
    };

    const result = await db.collection('affiliateLinks').insertOne(newLink);
    const insertedId = result.insertedId;

    const createdLink = await db.collection('affiliateLinks').findOne({ _id: insertedId });
    if (!createdLink) {
        return NextResponse.json({ error: 'Failed to retrieve created link' }, { status: 500 });
    }

    const product = await db.collection('products').findOne({ _id: new ObjectId(createdLink.productId) });

    const formattedLink = { ...createdLink, id: createdLink._id.toString(), product: product ? { ...product, id: product._id.toString() } : null };

    return NextResponse.json(formattedLink, { status: 201 });
  } catch (error) {
    console.error('Error creating affiliate link:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
