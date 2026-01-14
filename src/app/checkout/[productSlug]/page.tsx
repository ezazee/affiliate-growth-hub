export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { Metadata } from 'next';
import CheckoutClient from './CheckoutClient';

/* ===========================
   Utils
=========================== */

const getBaseUrl = () => {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
};

/* ===========================
   Metadata
=========================== */

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { productSlug: string };
  searchParams: { ref?: string };
}): Promise<Metadata> {
  const baseUrl = getBaseUrl();

  // ❌ TANPA REF = INVALID (RULE KAMU)
  if (!searchParams.ref) {
    return {
      title: 'Link Checkout Tidak Valid',
      description: 'Link checkout tidak valid atau tidak lengkap.',
      openGraph: {
        title: 'Link Checkout Tidak Valid',
        description: 'Link checkout tidak valid atau tidak lengkap.',
        images: [
          {
            url: `${baseUrl}/Logo.png`,
            width: 1200,
            height: 630,
          },
        ],
      },
    };
  }

  try {
    const response = await fetch(
      `${baseUrl}/api/checkout/${params.productSlug}?ref=${searchParams.ref}`,
      {
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error('API not ok');
    }

    const data = await response.json();
    const { product, affiliator } = data;

    // HARD SAFETY
    if (!product || !affiliator) {
      throw new Error('Invalid API data');
    }

    const title = `${product.name} - Rekomendasi ${affiliator.name}`;
    const description = `Beli ${product.name} hanya Rp ${product.price.toLocaleString(
      'id-ID'
    )}. ${product.description}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        url: `${baseUrl}/checkout/${params.productSlug}?ref=${searchParams.ref}`,
        images: [
          {
            url: product.imageUrl.endsWith('.jpg')
              ? product.imageUrl
              : `${product.imageUrl}.jpg`,
            width: 1200,
            height: 630,
            alt: product.name,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [
          product.imageUrl.endsWith('.jpg')
            ? product.imageUrl
            : `${product.imageUrl}.jpg`,
        ],
      },
    };
  } catch (err) {
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
