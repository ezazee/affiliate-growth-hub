import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Star, Sparkles, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HeroSectionProps {
  heroTitle?: string;
  heroDescription?: string;
  commissionRate?: string;
}

export default function HeroSection({ heroTitle, heroDescription, commissionRate }: HeroSectionProps) {
  const defaultTitle = "Maksimalkan Penghasilan Anda dengan Program Affiliate PE Skinpro";
  const defaultDescription = "Bergabunglah dengan ratusan affiliator yang sudah merasakan manfaat program affiliate kami. Dapatkan komisi 15% dari setiap penjualan produk skincare berkualitas.";
  const defaultCommission = "15%";

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10 container mx-auto px-6 text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg">
            <Image
              src="/Logo.png"
              alt="PE Skinpro"
              width={40}
              height={40}
              className="rounded-xl"
              priority
            />
            <span className="text-xl font-bold text-foreground">PE Skinpro</span>
          </div>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6">
          <span className="bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
            {heroTitle || defaultTitle}
          </span>
        </h1>

        {/* Hero Description */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
          {heroDescription || defaultDescription}
        </p>

        {/* Commission Badge */}
        <div className="mb-10">
          <Badge className="bg-gradient-to-r from-primary/20 to-secondary/20 text-primary px-6 py-3 text-lg font-semibold rounded-full border border-primary/20">
            <Sparkles className="w-5 h-5 mr-2" />
            Komisi hingga {commissionRate || defaultCommission}
          </Badge>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button
            asChild
            size="lg"
            className="relative overflow-hidden group bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white px-8 py-6 text-lg min-w-[200px]"
          >
            <Link href="/register">
              <span className="relative z-10 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Daftar Sekarang
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </Link>
          </Button>
          
          <Button
            asChild
            variant="outline"
            size="lg"
            className="bg-white/80 backdrop-blur-sm hover:bg-white/90 border-2 border-primary/20 hover:border-primary/40 px-8 py-6 text-lg min-w-[200px]"
          >
            <Link href="#benefits">
              Pelajari Lebih Lanjut
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span>Gratis Bergabung</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span>Komisi Real-Time</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span>Produk Berkualitas</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <span>Rating 4.9/5</span>
          </div>
        </div>
      </div>
    </section>
  );
}