import { NextRequest, NextResponse } from 'next/server';
import { getProductBySlug, getUserByReferralCode, getAffiliateLinkByAffiliatorProduct } from '@/services/dataService';

export async function GET(request: NextRequest, context: any) {
  try {
    const { productSlug } = await context.params;
    const { searchParams } = new URL(request.url);
    const refCode = searchParams.get('ref'); // This is now the affiliator's referralCode

    if (!refCode) {
      return NextResponse.json({ error: 'Referral code is missing' }, { status: 400 });
    }

    // 1. Find the affiliator by their referral code
    const affiliator = await getUserByReferralCode(refCode);
    if (!affiliator || affiliator.status !== 'approved') {
      return NextResponse.json({ error: 'Affiliator not found or not approved' }, { status: 404 });
    }

    // 2. Find the product by its slug
    const product = await getProductBySlug(productSlug);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // 3. Find the specific affiliate link for this affiliator and product
    const affiliateLink = await getAffiliateLinkByAffiliatorProduct(affiliator.id, product.id);
    if (!affiliateLink || !affiliateLink.isActive) {
      return NextResponse.json({ error: 'Affiliate link not found or inactive' }, { status: 404 });
    }
    
    // All checks passed, return the data
    return NextResponse.json({ product, affiliateLink, affiliator });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
