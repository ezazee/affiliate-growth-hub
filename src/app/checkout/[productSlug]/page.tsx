import { Metadata } from 'next';
import CheckoutClient from './CheckoutClient';
import { getProductBySlug, getUserByReferralCode, getAffiliateLinkByAffiliatorProduct } from '@/services/dataService';

// Generate dynamic metadata for SEO and social sharing
export async function generateMetadata({ params, searchParams }: { 
  params: { productSlug: string }; 
  searchParams: { ref?: string } 
}): Promise<Metadata> {
  try {
    const refCode = searchParams.ref;
    
    console.log('Generating metadata for:', { productSlug: params.productSlug, refCode });
    
    // Always return dynamic metadata if refCode exists
    if (refCode) {
      try {
        // 1. Find the affiliator by their referral code
        const affiliator = await getUserByReferralCode(refCode);
        
        // 2. Find the product by its slug
        const product = await getProductBySlug(params.productSlug);
        
        console.log('Found data:', { affiliator: !!affiliator, product: !!product });
        
        if (affiliator && product) {
          // 3. Check if affiliate link exists
          const affiliateLink = await getAffiliateLinkByAffiliatorProduct(affiliator.id, product.id);
          
          if (affiliateLink && affiliateLink.isActive) {
            const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
            let imageUrl = product.imageUrl;

            // Fix image URLs that are missing extensions
            const imageFixes: { [key: string]: string } = {
              'CICA-B5-REFRESHING': 'https://blsfkizrchqzahqa.public.blob.vercel-storage.com/CICA-B5-REFRESHING.jpg',
              'HONEY%20CLEANSING%20GEL': 'https://blsfkizrchqzahqa.public.blob.vercel-storage.com/HONEY-CLEANSING-GEL.jpg'
            };

            if (imageUrl && imageFixes[imageUrl.split('/').pop() || '']) {
              imageUrl = imageFixes[imageUrl.split('/').pop() || ''];
            }

            // Generate better title based on product type
            const getProductTitle = (productName: string) => {
              if (productName.toLowerCase().includes('vit c') && productName.toLowerCase().includes('spf')) {
                return `Day Cream Vitamin C SPF 50 - Mencerahkan & Melindungi UV`;
              } else if (productName.toLowerCase().includes('cica')) {
                return `Toner CICA B5 - Menenangkan & Repair Skin Barrier`;
              } else if (productName.toLowerCase().includes('honey')) {
                return `Honey Cleansing Gel - Pembersih Wajah Lembut`;
              } else if (productName.toLowerCase().includes('prebiotic')) {
                return `Prebiotic Pore-EX Pad - Eksfoliasi Lembut & Jaga Mikrobioma`;
              } else if (productName.toLowerCase().includes('hydro')) {
                return `Hydro Restorative Cream - Pelembap Repair Skin Barrier`;
              } else if (productName.toLowerCase().includes('serum') || productName.toLowerCase().includes('glow')) {
                return `Glow Serum - Mencerahkan & Bikin Kulit Bercahaya`;
              } else if (productName.toLowerCase().includes('feminine')) {
                return `Feminine Mousse Cleanser - Pembersih Area Kewanitaan`;
              }
              return productName;
            };

            const productTitle = getProductTitle(product.name);

            const metadata = {
              title: `${productTitle} - ${affiliator.name} | PE Skinpro Affiliate`,
              description: `Beli ${product.name} (Rp ${product.price.toLocaleString('id-ID')}) melalui ${affiliator.name}. ${product.description?.substring(0, 140)}... ✨ Original PE Skinpro ✨ Free Konsultasi`,
              keywords: [product.name, 'PE Skinpro', 'skincare Indonesia', 'affiliate', affiliator.name, 'original', 'murah'],
              authors: [{ name: affiliator.name }],
              openGraph: {
                title: `${productTitle} - ${affiliator.name}`,
                description: `Beli ${product.name} hanya Rp ${product.price.toLocaleString('id-ID')}. ${product.description?.substring(0, 140)}...`,
                images: imageUrl ? [
                  {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: `${product.name} - PE Skinpro`,
                  }
                ] : [
                  {
                    url: `${baseUrl}/Logo.png`,
                    width: 1200,
                    height: 630,
                    alt: 'PE Skinpro - Affiliate Skincare Indonesia',
                  }
                ],
                type: 'website',
                url: `${baseUrl}/checkout/${params.productSlug}?ref=${refCode}`,
                siteName: 'PE Skinpro Affiliate',
                locale: 'id_ID',
              },
              twitter: {
                card: 'summary_large_image',
                title: `${productTitle} - ${affiliator.name}`,
                description: `Beli ${product.name} Rp ${product.price.toLocaleString('id-ID')}. ${product.description?.substring(0, 140)}...`,
                images: imageUrl ? [imageUrl] : [`${baseUrl}/Logo.png`],
                site: '@peskinpro',
              },
              other: {
                'product:price:amount': product.price.toString(),
                'product:price:currency': 'IDR',
                'product:availability': 'in stock',
                'product:brand': 'PE Skinpro',
                'product:condition': 'new',
              },
            };
            
            console.log('Generated metadata:', metadata.title);
            return metadata;
          }
        }
      } catch (dataError) {
        console.error('Error fetching data for metadata:', dataError);
      }
    }

    // Fallback metadata with some variation
    const fallbackMetadata = {
      title: `Checkout ${params.productSlug} - Affiliate PE Skinpro`,
      description: `Selesaikan pesanan produk ${params.productSlug} Anda`,
    };
    
    console.log('Using fallback metadata');
    return fallbackMetadata;
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Checkout - Affiliate PE Skinpro',
      description: 'Selesaikan pesanan produk Anda',
    };
  }
}

export default function CheckoutPage() {
  return <CheckoutClient />;
}