import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getProductBySlug, getUserByReferralCode, getAffiliateLinkByAffiliatorProduct } from '@/services/dataService';

export async function POST(req: NextRequest) {
  try {
    const { ref, productSlug } = await req.json();

    if (!ref || !productSlug) {
      return NextResponse.json({ error: 'ref and productSlug are required' }, { status: 400 });
    }

    const affiliator = await getUserByReferralCode(ref);
    if (!affiliator) {
      console.warn(`Click tracking: Affiliator with ref "${ref}" not found.`);
      return NextResponse.json({ success: true });
    }

    const product = await getProductBySlug(productSlug);
    if (!product) {
      console.warn(`Click tracking: Product with slug "${productSlug}" not found.`);
      return NextResponse.json({ success: true });
    }
    
    const affiliateLink = await getAffiliateLinkByAffiliatorProduct(affiliator.id, product.id);

    if (affiliateLink) {
      const client = await clientPromise;
      const db = client.db();
      await db.collection('link_clicks').insertOne({
        linkId: affiliateLink._id,
        createdAt: new Date(),
      });
    } else {
      console.warn(`Click tracking: Affiliate link for affiliator "${affiliator.id}" and product "${product.id}" not found.`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking click:', error);
    // Return a generic success response to avoid leaking error details.
    return NextResponse.json({ success: true });
  }
}

