import { NextRequest, NextResponse } from 'next/server';
import { getProductBySlug, getAffiliateLinkByCode, getUserById } from '@/services/dataService';

export async function GET(request: NextRequest, context: any) {
  try {
    const { productSlug } = await context.params;
    const { searchParams } = new URL(request.url);
    const refCode = searchParams.get('ref');

    console.log(`[DEBUG /api/checkout] Received refCode: ${refCode}, productSlug: ${productSlug}`);

    if (!refCode) {
      return NextResponse.json({ error: 'Referral code is missing' }, { status: 400 });
    }

    const affiliateLink = await getAffiliateLinkByCode(refCode);
    console.log(`[DEBUG /api/checkout] Affiliate link found: ${JSON.stringify(affiliateLink)}`);
    if (!affiliateLink) {
      return NextResponse.json({ error: 'Invalid affiliate link' }, { status: 404 });
    }

    const product = await getProductBySlug(productSlug);
    console.log(`[DEBUG /api/checkout] Product found: ${JSON.stringify(product)}`);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    console.log(`[DEBUG /api/checkout] Comparing product.id ('${product.id}') with affiliateLink.productId ('${affiliateLink.productId}')`);
    if (product.id !== affiliateLink.productId) {
      return NextResponse.json({ error: 'Product mismatch with affiliate link' }, { status: 404 });
    }

    const affiliator = await getUserById(affiliateLink.affiliatorId);
    console.log(`[DEBUG /api/checkout] Affiliator found: ${JSON.stringify(affiliator)}`);
    if (!affiliator || affiliator.status !== 'approved') {
      return NextResponse.json({ error: 'Affiliator not found or not approved' }, { status: 404 });
    }

    return NextResponse.json({ product, affiliateLink, affiliator });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
