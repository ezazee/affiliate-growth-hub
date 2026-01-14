import { Metadata } from 'next';
import CheckoutClient from './CheckoutClient';
import {
  getProductBySlug,
  getUserByReferralCode,
  getAffiliateLinkByAffiliatorProduct,
} from '@/services/dataService';

/* ===========================
   Helper Functions
=========================== */

const getBaseUrl = () => {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return 'http://localhost:3000';
};

const generateProductTitle = (productName: string) => {
  const name = productName.toLowerCase();

  if (name.includes('vit c') && name.includes('spf'))
    return 'Day Cream Vitamin C SPF 50 | Cerah & Perlindungan UV';

  if (name.includes('cica'))
    return 'Toner CICA B5 | Menenangkan & Repair Skin Barrier';

  if (name.includes('honey'))
    return 'Honey Cleansing Gel | Pembersih Wajah Lembut';

  if (name.includes('prebiotic'))
    return 'Prebiotic Pore-EX Pad | Eksfoliasi & Jaga Skin Barrier';

  if (name.includes('hydro'))
    return 'Hydro Restorative Cream | Pelembap Repair Barrier';

  if (name.includes('serum') || name.includes('glow'))
    return 'Glow Serum | Kulit Cerah & Bercahaya';

  if (name.includes('feminine'))
    return 'Feminine Mousse Cleanser | Perawatan Area Intim';

  return productName;
};

const generateDescription = (
  product: { name: string; description?: string; price: number },
  affiliatorName: string
) => {
  const cleanDescription = product.description
    ? product.description.replace(/(<([^>]+)>)/gi, '').slice(0, 120)
    : 'Produk original PE Skinpro dengan kualitas terbaik';

  return `Beli ${product.name} hanya Rp ${product.price.toLocaleString(
    'id-ID'
  )} melalui ${affiliatorName}. ${cleanDescription}. ✨ Original PE Skinpro`;
};

const resolveImage = (imageUrl?: string, baseUrl?: string) => {
  if (!imageUrl) return `${baseUrl}/Logo.png`;

  if (imageUrl.match(/\.(jpg|jpeg|png|webp)$/i)) {
    return imageUrl;
  }

  const imageMap: Record<string, string> = {
    'CICA-B5-REFRESHING':
      'https://blsfkizrchqzahqa.public.blob.vercel-storage.com/CICA-B5-REFRESHING.jpg',
    'HONEY CLEANSING GEL':
      'https://blsfkizrchqzahqa.public.blob.vercel-storage.com/HONEY-CLEANSING-GEL.jpg',
  };

  return imageMap[imageUrl] || imageUrl;
};

/* ===========================
   Metadata Generator
=========================== */

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { productSlug: string };
  searchParams: { ref?: string };
}): Promise<Metadata> {
  const baseUrl = getBaseUrl();
  const refCode = searchParams.ref;

  try {
    // Default fallback
    const fallback: Metadata = {
      title: 'Checkout Produk - PE Skinpro',
      description: 'Selesaikan pembelian produk PE Skinpro Anda',
    };

    if (!refCode) return fallback;

    const affiliator = await getUserByReferralCode(refCode);
    const product = await getProductBySlug(params.productSlug);

    if (!affiliator || !product) return fallback;

    const affiliateLink = await getAffiliateLinkByAffiliatorProduct(
      affiliator.id,
      product.id
    );

    if (!affiliateLink || !affiliateLink.isActive) return fallback;

    const productTitle = generateProductTitle(product.name);
    const description = generateDescription(product, affiliator.name);
    const image = resolveImage(product.imageUrl, baseUrl);

    return {
      title: `${productTitle} - Rekomendasi ${affiliator.name}`,
      description,
      keywords: [
        product.name,
        'PE Skinpro',
        'skincare Indonesia',
        affiliator.name,
        'affiliate skincare',
      ],
      authors: [{ name: affiliator.name }],
      openGraph: {
        title: productTitle,
        description,
        url: `${baseUrl}/checkout/${params.productSlug}?ref=${refCode}`,
        siteName: 'PE Skinpro Affiliate',
        locale: 'id_ID',
        type: 'website',
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: `${product.name} - PE Skinpro`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: productTitle,
        description,
        images: [image],
      },
      other: {
        'product:price:amount': product.price.toString(),
        'product:price:currency': 'IDR',
        'product:availability': 'in stock',
        'product:brand': 'PE Skinpro',
        'product:condition': 'new',
      },
    };
  } catch (error) {
    console.error('generateMetadata error:', error);
    return {
      title: 'Checkout Produk - PE Skinpro',
      description: 'Selesaikan pembelian produk PE Skinpro Anda',
    };
  }
}

/* ===========================
   Page
=========================== */

export default function CheckoutPage() {
  return <CheckoutClient />;
}
