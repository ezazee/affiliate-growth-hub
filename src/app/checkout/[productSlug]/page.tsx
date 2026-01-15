import { Metadata } from 'next';
import CheckoutClient from './CheckoutClient';

// Generate dynamic metadata for SEO and social sharing
export async function generateMetadata({ params, searchParams }: { 
  params: Promise<{ productSlug: string }>; 
  searchParams: Promise<{ ref?: string }> 
}): Promise<Metadata> {
  try {
    const { productSlug } = await params;
    const { ref } = await searchParams;
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/checkout/${productSlug}?ref=${ref}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return {
        title: 'Checkout - Affiliate PE Skinpro',
        description: 'Selesaikan pesanan produk Anda',
      };
    }

    const data = await response.json();
    const { product, affiliator } = data;

    return {
      title: `Beli ${product.name} - ${affiliator.name} | Affiliate PE Skinpro`,
      description: `Beli ${product.name} melalui ${affiliator.name}. ${product.description?.substring(0, 160)}...`,
      keywords: [product.name, 'affiliate', 'PE Skinpro', 'skincare', affiliator.name],
      authors: [{ name: affiliator.name }],
      openGraph: {
        title: `Beli ${product.name} - ${affiliator.name}`,
        description: `${product.description?.substring(0, 160)}...`,
        images: product.imageUrl ? [
          {
            url: product.imageUrl,
            width: 1200,
            height: 630,
            alt: product.name,
          }
        ] : [],
        type: 'website',
        url: `${baseUrl}/checkout/${productSlug}?ref=${ref}`,
      },
      twitter: {
        card: 'summary_large_image',
        title: `Beli ${product.name} - ${affiliator.name}`,
        description: `${product.description?.substring(0, 160)}...`,
        images: product.imageUrl ? [product.imageUrl] : [],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Checkout - Affiliate PE Skinpro',
      description: 'Selesaikan pesanan produk Anda',
    };
  }
}

export default async function CheckoutPage({ params, searchParams }: {
  params: Promise<{ productSlug: string }>;
  searchParams: Promise<{ ref?: string }>;
}) {
  const { productSlug } = await params;
  const { ref } = await searchParams;
  
  return <CheckoutClient productSlug={productSlug} referralCode={ref} />;
}