import React from 'react';
import Image from 'next/image';
import { Shield, Sparkles, Award, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface AboutSectionProps {
  aboutTitle?: string;
  aboutDescription?: string;
  aboutImage?: string;
}

export default function AboutSection({ aboutTitle, aboutDescription, aboutImage }: AboutSectionProps) {
  const defaultTitle = "Tentang PE Skinpro";
  const defaultDescription = "PE Skinpro adalah brand skincare terpercaya yang menggabungkan bahan alami berkualitas dengan teknologi terkini dari Jerman. Setiap produk diformulasikan secara teliti untuk memberikan hasil terbaik untuk kulit Anda, aman untuk semua jenis kulit, dan telah terdaftar resmi di BPOM.";

  const benefits = [
    {
      icon: Shield,
      title: "BPOM Terdaftar",
      description: "Semua produk telah terdaftar resmi dan aman digunakan"
    },
    {
      icon: Sparkles,
      title: "Bahan Alami",
      description: "Formulasi dengan bahan berkualitas tinggi dan teknologi Jerman"
    },
    {
      icon: Award,
      title: "Kualitas Premium",
      description: "Produk dengan hasil terbukti dan testimonial positif"
    },
    {
      icon: Clock,
      title: "Stok Selalu Tersedia",
      description: "Produk selalu ready untuk memenuhi permintaan pasar"
    }
  ];

  return (
    <section className="py-20 px-6 bg-secondary/30">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-4">
            {aboutTitle || defaultTitle}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {aboutDescription || defaultDescription}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <div className="space-y-8">
              {benefits.map((benefit, index) => (
                <div key={index}>
                  <Card className="border-0 shadow-sm bg-white/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                          <benefit.icon className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                          <p className="text-muted-foreground">{benefit.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            {aboutImage ? (
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src={aboutImage}
                  alt="Tentang PE Skinpro"
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) {
                      fallback.classList.remove('hidden');
                    }
                  }}
                />
              </div>
            ) : null}
            <div className={`aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl flex items-center justify-center ${aboutImage ? 'hidden' : ''}`}>
              <div className="text-center">
                <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6 shadow-button">
                  <Sparkles className="w-12 h-12 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">PE Skinpro</h3>
                <p className="text-muted-foreground">Skincare Profesional untuk Kulit Cantik Anda</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}