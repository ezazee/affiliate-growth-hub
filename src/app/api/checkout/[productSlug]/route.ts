import { NextRequest, NextResponse } from 'next/server';
import { getProductBySlug, getAffiliateLinkByCode, getUserById } from '@/services/dataService';

export async function GET(request: NextRequest, context: any) {
  try {
    const { productSlug } = await context.params;
    const { searchParams } = new URL(request.url);
    const refCode = searchParams.get('ref');

    if (!refCode) {
      return NextResponse.json({ error: 'Referral code is missing' }, { status: 400 });
    }

    const affiliateLink = await getAffiliateLinkByCode(refCode);
    if (!affiliateLink) {
      return NextResponse.json({ error: 'Invalid affiliate link' }, { status: 404 });
    }

    const product = await getProductBySlug(productSlug);
    if (!product || product.id !== affiliateLink.productId) {
      return NextResponse.json({ error: 'Product not found or mismatch' }, { status: 404 });
    }

    const affiliator = await getUserById(affiliateLink.affiliatorId);
    if (!affiliator || affiliator.status !== 'approved') {
      return NextResponse.json({ error: 'Affiliator not found or not approved' }, { status: 404 });
    }

    return NextResponse.json({ product, affiliateLink, affiliator });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
