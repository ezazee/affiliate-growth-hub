import { NextRequest, NextResponse } from 'next/server';
import { getProductBySlug, getUserByReferralCode, getAffiliateLinkByAffiliatorProduct } from '@/services/dataService';

export async function GET(request: NextRequest) {
  const log = [];
  try {
    const { searchParams } = new URL(request.url);
    const refCode = searchParams.get('ref');
    const productSlug = searchParams.get('slug');

    log.push(`[DIAG] Received refCode: ${refCode}`);
    log.push(`[DIAG] Received productSlug: ${productSlug}`);

    if (!refCode || !productSlug) {
      return NextResponse.json({ error: 'refCode and slug are required query parameters' }, { status: 400 });
    }

    // Step 1: Find Affiliator by referralCode
    const affiliator = await getUserByReferralCode(refCode);
    log.push(`[DIAG] Result from getUserByReferralCode('${refCode}'): ${JSON.stringify(affiliator, null, 2)}`);
    if (!affiliator) {
      log.push(`[DIAG] FAIL: Affiliator not found for referralCode. Returning 404.`);
      return NextResponse.json({ final_status: 'FAIL: Affiliator not found', log, affiliator });
    }
    log.push(`[DIAG] SUCCESS: Affiliator found (ID: ${affiliator.id}, Name: ${affiliator.name}).`);

    // Step 2: Check Affiliator Status
    log.push(`[DIAG] Checking affiliator.status ('${affiliator.status}')`);
    if (affiliator.status !== 'approved') {
        log.push(`[DIAG] FAIL: Affiliator not approved. Returning 404.`);
        return NextResponse.json({ final_status: 'FAIL: Affiliator not approved', log, affiliator_status: affiliator.status });
    }
    log.push(`[DIAG] SUCCESS: Affiliator is approved.`);

    // Step 3: Find Product by slug
    const product = await getProductBySlug(productSlug);
    log.push(`[DIAG] Result from getProductBySlug('${productSlug}'): ${JSON.stringify(product, null, 2)}`);
    if (!product) {
        log.push(`[DIAG] FAIL: Product not found. Returning 404.`);
        return NextResponse.json({ final_status: 'FAIL: Product not found', log, product });
    }
    log.push(`[DIAG] SUCCESS: Product found (ID: ${product.id}, Name: ${product.name}).`);


    // Step 4: Find Affiliate Link for this affiliator and product
    const affiliateLink = await getAffiliateLinkByAffiliatorProduct(affiliator.id, product.id);
    log.push(`[DIAG] Result from getAffiliateLinkByAffiliatorProduct(affiliator ID: ${affiliator.id}, product ID: ${product.id}): ${JSON.stringify(affiliateLink, null, 2)}`);
    if (!affiliateLink) {
      log.push(`[DIAG] FAIL: Affiliate link not found for this affiliator and product. Returning 404.`);
      return NextResponse.json({ final_status: 'FAIL: Affiliate link not found', log, affiliateLink });
    }
    log.push(`[DIAG] SUCCESS: Affiliate link found (ID: ${affiliateLink.id}).`);

    // Step 5: Check Affiliate Link Status
    log.push(`[DIAG] Checking affiliateLink.isActive ('${affiliateLink.isActive}')`);
    if (!affiliateLink.isActive) {
        log.push(`[DIAG] FAIL: Affiliate link is inactive. Returning 404.`);
        return NextResponse.json({ final_status: 'FAIL: Affiliate link is inactive', log, affiliate_link_status: affiliateLink.isActive });
    }
    log.push(`[DIAG] SUCCESS: Affiliate link is active.`);

    
    log.push(`[DIAG] ALL CHECKS PASSED!`);
    return NextResponse.json({ final_status: 'SUCCESS', log, product, affiliateLink, affiliator });

  } catch (error) {
    log.push(`[DIAG] UNEXPECTED ERROR: ${error.message}`);
    console.error('[DIAG] API Error:', error);
    return NextResponse.json({ final_status: 'UNEXPECTED_ERROR', log, error: error.message }, { status: 500 });
  }
}
