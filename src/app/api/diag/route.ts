import { NextRequest, NextResponse } from 'next/server';
import { getProductBySlug, getAffiliateLinkByCode, getUserById } from '@/services/dataService';

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

    // Step 1: Find Affiliate Link
    const affiliateLink = await getAffiliateLinkByCode(refCode);
    log.push(`[DIAG] Result from getAffiliateLinkByCode('${refCode}'): ${JSON.stringify(affiliateLink, null, 2)}`);
    if (!affiliateLink) {
      log.push(`[DIAG] FAIL: Affiliate link not found. Returning 404.`);
      return NextResponse.json({ final_status: 'FAIL: Link not found', log, affiliateLink });
    }

    // Step 2: Find Product
    const product = await getProductBySlug(productSlug);
    log.push(`[DIAG] Result from getProductBySlug('${productSlug}'): ${JSON.stringify(product, null, 2)}`);
    if (!product) {
        log.push(`[DIAG] FAIL: Product not found. Returning 404.`);
        return NextResponse.json({ final_status: 'FAIL: Product not found', log, product });
    }

    // Step 3: Compare Product ID and Affiliate Link's Product ID
    log.push(`[DIAG] Comparing product.id ('${product.id}') with affiliateLink.productId ('${affiliateLink.productId}')`);
    if (product.id !== affiliateLink.productId) {
      log.push(`[DIAG] FAIL: Mismatch! product.id is not equal to affiliateLink.productId. Returning 404.`);
      return NextResponse.json({
        final_status: 'FAIL: Product ID mismatch',
        log,
        product_id_from_product: product.id,
        product_id_from_link: affiliateLink.productId
      });
    }
    log.push(`[DIAG] SUCCESS: Product IDs match.`);

    // Step 4: Find Affiliator
    const affiliator = await getUserById(affiliateLink.affiliatorId);
    log.push(`[DIAG] Result from getUserById('${affiliateLink.affiliatorId}'): ${JSON.stringify(affiliator, null, 2)}`);
    if (!affiliator) {
        log.push(`[DIAG] FAIL: Affiliator not found. Returning 404.`);
        return NextResponse.json({ final_status: 'FAIL: Affiliator not found', log, affiliator });
    }

    // Step 5: Check Affiliator Status
    log.push(`[DIAG] Checking affiliator.status ('${affiliator.status}')`);
    if (affiliator.status !== 'approved') {
        log.push(`[DIAG] FAIL: Affiliator not approved. Returning 404.`);
        return NextResponse.json({ final_status: 'FAIL: Affiliator not approved', log, affiliator_status: affiliator.status });
    }
    log.push(`[DIAG] SUCCESS: Affiliator is approved.`);

    
    log.push(`[DIAG] ALL CHECKS PASSED!`);
    return NextResponse.json({ final_status: 'SUCCESS', log, product, affiliateLink, affiliator });

  } catch (error) {
    log.push(`[DIAG] UNEXPECTED ERROR: ${error.message}`);
    console.error('[DIAG] API Error:', error);
    return NextResponse.json({ final_status: 'UNEXPECTED_ERROR', log, error: error.message }, { status: 500 });
  }
}
