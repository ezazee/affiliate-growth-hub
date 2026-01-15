"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Users, DollarSign, TrendingUp, CheckCircle, Star, Sparkles, Shield, Award, ChevronDown, LogOut, Instagram, MessageCircle, ShoppingBag, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton, HeroSkeleton, AboutSkeleton, BenefitsSkeleton, ProductsSkeleton, CTASkeleton, LandingSkeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';

interface LandingSettings {
  aboutTitle?: string;
  aboutDescription?: string;
  aboutImage?: string;
  heroTitle?: string;
  heroDescription?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  shopeeUrl?: string;
  websiteUrl?: string;
  whatsappNumber?: string;
  email?: string;
  footerDescription?: string;
}

export default function Index() {
  const { user, isAuthenticated, logout, isLoggingOut } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [landingSettings, setLandingSettings] = useState<LandingSettings>({});
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Helper functions for formatting links
  const formatWhatsAppLink = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('62') ? cleanPhone : `62${cleanPhone}`;
    return `https://wa.me/${formattedPhone}`;
  };

  const formatEmailLink = (email: string) => {
    return `mailto:${email}`;
  };

  // Get commission from first active product
  const getCommissionRate = (products: any[]) => {
    if (!products || products.length === 0) return '0%';
    // Ambil komisi dari produk pertama yang aktif
    const firstProduct = products[0];
    if (!firstProduct) return '0%';
    const commission = parseFloat(firstProduct.commissionValue) || 0;
    return `${commission}%`;
  };

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Add cache busting timestamp
        const timestamp = Date.now();
        const [productsResponse, settingsResponse] = await Promise.all([
          fetch(`/api/public/products?t=${timestamp}`),
          fetch(`/api/public/landing-settings?t=${timestamp}`)
        ]);

        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          setProducts(productsData);
        } else {
          console.error('Failed to fetch products');
          setProducts([]);
        }

        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json();
        setLandingSettings(settingsData);
      } else {
        console.error('Failed to fetch landing settings');
        // Set default values on error
        setLandingSettings({
          footerDescription: 'Program affiliate resmi PE Skinpro. Dapatkan komisi menarik dari setiap penjualan produk skincare berkualitas.'
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback to empty array
      setProducts([]);
    } finally {
      setLoading(false);
      setDataLoaded(true);
    }
    };

    fetchData();
  }, []);

  const benefits = [
    {
      icon: Sparkles,
      title: 'Mencerahkan Kulit',
      description: 'Kandungan alami yang membantu mencerahkan kulit wajah secara efektif.',
    },
    {
      icon: Shield,
      title: 'Melembabkan Kulit',
      description: 'Formula khusus dengan honey extract untuk menjaga kelembaban alami kulit.',
    },
    {
      icon: Star,
      title: 'Menghaluskan Kulit',
      description: 'Teknologi plant-based yang membantu menghaluskan tekstur kulit.',
    },
    {
      icon: Award,
      title: 'Menjaga Kesehatan',
      description: 'Formula prebiotic yang menjaga kesehatan dan keseimbangan kulit.',
    },
  ];

  const stats = [
    { value: `${products.length}+`, label: 'Produk Skincare' },
    { value: getCommissionRate(products), label: 'Komisi Produk' },
    { value: '10K+', label: 'Affiliate Aktif' },
  ];

  const certifications = [
    { name: 'Cruelty Free', icon: Shield },
    { name: 'GMP Certified', icon: Award },
    { name: 'Halal Certified', icon: CheckCircle },
    { name: 'Lab Tested', icon: Star },
    { name: 'THC Free', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Show full page skeleton while loading */}
      {loading && <LandingSkeleton />}
      
      {/* Main content with fade-in animation */}
      <div className={`transition-opacity duration-500 ${loading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/Logo.png" alt="PE Skinpro" className="w-10 h-10 rounded-xl" />
            <span className="font-display font-bold text-xl text-foreground">Affiliate</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                        <span className="text-primary-foreground font-semibold text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-foreground">{user.name}</span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link href={user.role === 'admin' ? '/admin' : '/affiliator'} className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4" />
                        Pergi ke Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={logout} 
                      disabled={isLoggingOut}
                      className="flex items-center gap-2 text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <LogOut className={`w-4 h-4 ${isLoggingOut ? 'animate-spin' : ''}`} />
                      {isLoggingOut ? 'Keluar...' : 'Keluar'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button variant="hero" asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Program Affiliate PE Skinpro Sekarang Dibuka!
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-display font-bold text-foreground mb-6 leading-tight">
              {landingSettings.heroTitle || `Dapatkan Penghasilan Hingga ${getCommissionRate(products)}`}
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
              {landingSettings.heroDescription || 'Bergabunglah dengan program affiliate PE Skinpro dan dapatkan komisi menarik dari setiap penjualan.'}
              {!loading && ` Promosikan ${products.length}+ produk skincare berkualitas dengan bahan alami dan teknologi Jerman.`}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <>
                  <Button variant="hero" size="xl" asChild>
                    <Link href="/register">
                      Join Affiliate Sekarang
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="xl" asChild>
                    <Link href="#products">
                      Lihat Produk
                    </Link>
                  </Button>
                </>
              ) : (
                <Button variant="hero" size="xl" asChild>
                  <Link href={user?.role === 'admin' ? '/admin' : '/affiliator'}>
                    Pergi ke Dashboard
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              )}
            </div>

            {/* Stats Preview */}
            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mt-16">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                  className="text-center"
                >
                  <p className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-2">
                    {stat.value}
                  </p>
                  <p className="text-muted-foreground text-sm">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* About PE Skinpro Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            <div>
              <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-6">
                {landingSettings.aboutTitle || 'Tentang PE Skinpro'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {landingSettings.aboutDescription || 'PE Skin Professional didirikan pada satu dekade yang lalu dengan tujuan untuk memproduksi produk perawatan kecantikan pribadi yang terjangkau oleh semua orang. Kami menawarkan formulasi perawatan wajah dan tubuh dibuat dengan perhatian yang cermat terhadap detail dan khasiat yang kuat.'}
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm border border-primary/20">
                  Natural Vegan
                </div>
                <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm border border-primary/20">
                  Plant-Based Technologies
                </div>
                <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm border border-primary/20">
                  Cruelty Free
                </div>
                <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm border border-primary/20">
                  GMP Certified
                </div>
              </div>
            </div>
             <div className="relative">
               <div className="aspect-square rounded-2xl overflow-hidden shadow-lg">
                 {landingSettings.aboutImage ? (
                   <img 
                     src={landingSettings.aboutImage} 
                     alt="Tentang PE Skinpro"
                     className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                     onLoad={() => console.log('About image loaded successfully:', landingSettings.aboutImage)}
                     onError={(e) => {
                       console.error('Failed to load about image:', landingSettings.aboutImage);
                       const target = e.currentTarget;
                       target.style.display = 'none';
                       const fallback = target.nextElementSibling as HTMLElement;
                       if (fallback) {
                         fallback.classList.remove('hidden');
                         console.log('Showing fallback content');
                       }
                     }}
                   />
                 ) : null}
                 <div className={`aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center ${landingSettings.aboutImage ? 'hidden' : ''}`}>
                   <div className="text-center">
                     <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4 shadow-button">
                       <Sparkles className="w-10 h-10 text-primary-foreground" />
                     </div>
                     <h3 className="text-2xl font-bold text-foreground mb-2">PE Skinpro</h3>
                     <p className="text-muted-foreground">Skincare Profesional untuk Kulit Cantik Anda</p>
                   </div>
                 </div>
               </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-secondary/30">
        <div className="container mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-4">
              Manfaat Produk PE Skinpro
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Kandungan alami yang dirancang khusus untuk memberikan hasil terbaik untuk kulit Anda.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-button">
                  <benefit.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-display font-semibold text-foreground mb-3">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-4">
              Keunggulan Produk Kami
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Produk kami bebas dari kekejaman, bersertifikat GMP, telah teruji di laboratorium, dan bebas dari THC.
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-8">
            {certifications.map((cert, index) => (
              <motion.div
                key={cert.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-card rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 text-center min-w-[150px]"
              >
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mx-auto mb-3">
                  <cert.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">{cert.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-20 px-6 bg-secondary/30">
        <div className="container mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-4">
              Produk Kami
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Dapatkan komisi menarik dari setiap produk yang berhasil Anda promosikan
            </p>
          </motion.div>

          {/* Show products skeleton if products are loading but main page is loaded */}
          {products.length === 0 && !loading ? (
            <div className="col-span-full text-center py-12">
              <Sparkles className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Belum Ada Produk Tersedia</h3>
              <p className="text-muted-foreground">Produk akan segera tersedia. Silakan cek kembali nanti.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product, index) => (
                <motion.div
                  key={product.id || product.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-card rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col h-full"
                >
                  <div className="w-full h-40 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl mb-4 flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <Sparkles className="w-12 h-12 text-primary/50 hidden" />
                  </div>
                  <h3 className="text-lg font-display font-semibold text-foreground mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-grow">
                    {product.description}
                  </p>
                  <div className="flex flex-col gap-3 mt-auto">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-bold text-primary">Rp. {product.price.toLocaleString('id-ID')}</div>
                      </div>
                      <div className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                        {parseFloat(product.commissionValue || 0).toFixed(1)}% Komisi
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/register">
                        Promosikan Produk
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="gradient-hero rounded-3xl p-12 lg:p-16 text-center shadow-card"
          >
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-primary-foreground mb-4">
              Siap Mulai Menghasilkan?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
              Bergabung dengan ribuan affiliate yang sudah mendapatkan penghasilan dari PE Skinpro. 
              Hanya butuh 2 menit untuk mendaftar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <>
                  <Button size="xl" className="bg-card text-foreground hover:bg-card/90 shadow-card" asChild>
                    <Link href="/register">
                      Daftar Affiliate Gratis
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="xl" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                    <Link href="/login">
                      Login Affiliate
                    </Link>
                  </Button>
                </>
              ) : (
                <Button size="xl" className="bg-card text-foreground hover:bg-card/90 shadow-card" asChild>
                  <Link href={user?.role === 'admin' ? '/admin' : '/affiliator'}>
                    Pergi ke Dashboard
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border bg-secondary/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img src="/Logo.png" alt="PE Skinpro" className="w-10 h-10 rounded-xl" />
                <span className="font-display font-bold text-xl text-foreground">Affiliate</span>
              </div>
              <p className="text-muted-foreground mb-4 max-w-sm">
                {landingSettings.footerDescription || 'Program affiliate resmi PE Skinpro. Dapatkan komisi menarik dari setiap penjualan produk skincare berkualitas.'}
              </p>
              <div className="flex flex-wrap gap-4 sm:gap-6">
                <a href={landingSettings.instagramUrl || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                  <Instagram className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Instagram</span>
                </a>
                <a href={landingSettings.tiktokUrl || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                  <MessageCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm sm:text-base">TikTok</span>
                </a>
                <a href={landingSettings.shopeeUrl || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                  <ShoppingBag className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Shopee</span>
                </a>
                <a href={landingSettings.websiteUrl || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                  <Globe className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Website</span>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/register" className="text-muted-foreground hover:text-primary transition-colors">Daftar Affiliate</Link></li>
                <li><Link href="/login" className="text-muted-foreground hover:text-primary transition-colors">Login</Link></li>
                <li><Link href="#products" className="text-muted-foreground hover:text-primary transition-colors">Produk</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Kontak</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="break-words">
                  <span className="block sm:hidden font-medium">WA: </span>
                  <span className="hidden sm:inline font-medium">WhatsApp: </span>
                  <a 
                    href={formatWhatsAppLink(landingSettings.whatsappNumber || '0821-2316-7895')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors underline decoration-dotted"
                  >
                    {landingSettings.whatsappNumber || '0821-2316-7895'}
                  </a>
                </li>
                <li className="break-words">
                  <span className="block sm:hidden font-medium">Email: </span>
                  <span className="hidden sm:inline font-medium">Email: </span>
                  <a 
                    href={formatEmailLink(landingSettings.email || 'adm.peskinproid@gmail.com')}
                    className="hover:text-primary transition-colors underline decoration-dotted break-all"
                  >
                    {landingSettings.email || 'adm.peskinproid@gmail.com'}
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border pt-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img src="/Logo.png" alt="PE Skinpro" className="w-8 h-8 rounded-lg" />
                <span className="font-display font-bold text-foreground">Affiliate</span>
              </div>
              <p className="text-muted-foreground text-sm text-center sm:text-right">
                © 2026 PE Skinpro Affiliate. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}