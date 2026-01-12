import { NextRequest, NextResponse } from 'next/server';
import { getProductBySlug, getUserByReferralCode, getAffiliateLinkByAffiliatorProduct } from '@/services/dataService';

export async function GET(request: NextRequest, context: any) {
  try {
    const { productSlug } = await context.params;
    const { searchParams } = new URL(request.url);
    const refCode = searchParams.get('ref'); // This is now the affiliator's referralCode

    console.log(`[Checkout API] Received productSlug: ${productSlug}, refCode: ${refCode}`);

    if (!refCode) {
      console.log('[Checkout API] Error: Referral code is missing');
      return NextResponse.json({ error: 'Referral code is missing' }, { status: 400 });
    }

    // 1. Find the affiliator by their referral code
    const affiliator = await getUserByReferralCode(refCode);
    console.log('[Checkout API] Affiliator found:', affiliator ? affiliator.id : 'null', 'Status:', affiliator?.status);
    if (!affiliator || affiliator.status !== 'approved') {
      console.log('[Checkout API] Error: Affiliator not found or not approved');
      return NextResponse.json({ error: 'Affiliator not found or not approved' }, { status: 404 });
    }

    // 2. Find the product by its slug
    const product = await getProductBySlug(productSlug);
    console.log('[Checkout API] Product found:', product ? product.id : 'null');
    if (!product) {
      console.log('[Checkout API] Error: Product not found');
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // 3. Find the specific affiliate link for this affiliator and product
    const affiliateLink = await getAffiliateLinkByAffiliatorProduct(affiliator.id, product.id);
    console.log('[Checkout API] Affiliate link found:', affiliateLink ? affiliateLink.id : 'null', 'isActive:', affiliateLink?.isActive);
    if (!affiliateLink || !affiliateLink.isActive) {
      console.log('[Checkout API] Error: Affiliate link not found or inactive');
      return NextResponse.json({ error: 'Affiliate link not found or inactive' }, { status: 404 });
    }
    
    // All checks passed, return the data
    console.log('[Checkout API] All checks passed. Returning product, affiliateLink, affiliator.');
    return NextResponse.json({ product, affiliateLink, affiliator });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
