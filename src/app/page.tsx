import { getProducts, getLandingSettings, Product, LandingSettings } from '@/lib/data';
import HeroSection from '@/components/landing/HeroSection';
import AboutSection from '@/components/landing/AboutSection';
import ProductsSection from '@/components/landing/ProductsSection';
import BenefitsSection from '@/components/landing/BenefitsSection';
import CTASection from '@/components/landing/CTASection';
import FooterSection from '@/components/landing/FooterSection';

export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

export default async function Index() {
  // Fetch data server-side
  let products: Product[] = [];
  let landingSettings: LandingSettings = {};

  try {
    [products, landingSettings] = await Promise.all([
      getProducts(),
      getLandingSettings(),
    ]);
  } catch (error) {
    // Gracefully handle database connection issues during build
    console.error('Failed to fetch data during build:', error);
    // Continue with empty data to prevent build failure
  }

  const getCommissionRate = (products: Product[]) => {
    if (!products || products.length === 0) return '15%';
    const firstProduct = products[0];
    if (!firstProduct) return '15%';
    const commissionType = firstProduct.commissionType;
    const commissionValue = firstProduct.commissionValue;
    return commissionType === 'percentage' 
      ? `${commissionValue}%` 
      : `Rp ${Number(commissionValue).toLocaleString('id-ID')}`;
  };

  return (
    <main className="min-h-screen">
      {/* Server-rendered sections */}
      <HeroSection 
        heroTitle={landingSettings.heroTitle}
        heroDescription={landingSettings.heroDescription}
        commissionRate={getCommissionRate(products)}
      />
      
      <BenefitsSection />
      
      <AboutSection 
        aboutTitle={landingSettings.aboutTitle}
        aboutDescription={landingSettings.aboutDescription}
        aboutImage={landingSettings.aboutImage}
      />
      
      <ProductsSection products={products} />
      
      <CTASection 
        instagramUrl={landingSettings.instagramUrl}
        tiktokUrl={landingSettings.tiktokUrl}
        shopeeUrl={landingSettings.shopeeUrl}
        websiteUrl={landingSettings.websiteUrl}
        whatsappNumber={landingSettings.whatsappNumber}
      />
      
      <FooterSection 
        footerDescription={landingSettings.footerDescription}
        instagramUrl={landingSettings.instagramUrl}
        tiktokUrl={landingSettings.tiktokUrl}
        shopeeUrl={landingSettings.shopeeUrl}
        websiteUrl={landingSettings.websiteUrl}
        whatsappNumber={landingSettings.whatsappNumber}
        email={landingSettings.email}
      />
      
      {/* Simple client-side menu without dynamic import */}
      <div className="fixed top-4 right-4 z-50">
        <div className="flex gap-2">
          <a 
            href="/login" 
            className="bg-white/90 backdrop-blur-md text-primary hover:bg-white/100 shadow-lg px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Login
          </a>
          <a 
            href="/register" 
            className="bg-primary/90 backdrop-blur-md hover:bg-primary text-white shadow-lg px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Daftar
          </a>
        </div>
      </div>
    </main>
  );
}