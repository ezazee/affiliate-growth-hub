import React from 'react';
import Link from 'next/link';
import { ArrowRight, Instagram, ShoppingBag, MessageCircle, Globe, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CTASectionProps {
  instagramUrl?: string;
  tiktokUrl?: string;
  shopeeUrl?: string;
  websiteUrl?: string;
  whatsappNumber?: string;
}

export default function CTASection({ instagramUrl, tiktokUrl, shopeeUrl, websiteUrl, whatsappNumber }: CTASectionProps) {
  const formatWhatsAppLink = (phone: string) => {
    if (!phone) return '#';
    const cleanPhone = phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('62') ? cleanPhone : `62${cleanPhone}`;
    return `https://wa.me/${formattedPhone}`;
  };

  const socialLinks = [
    {
      name: 'Instagram',
      icon: Instagram,
      url: instagramUrl,
      color: 'from-pink-500/20 to-rose-500/20 hover:from-pink-500/30 hover:to-rose-500/30'
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      url: whatsappNumber ? formatWhatsAppLink(whatsappNumber) : null,
      color: 'from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30'
    },
    {
      name: 'Shopee',
      icon: ShoppingBag,
      url: shopeeUrl,
      color: 'from-orange-500/20 to-red-500/20 hover:from-orange-500/30 hover:to-red-500/30'
    },
    {
      name: 'Website',
      icon: Globe,
      url: websiteUrl,
      color: 'from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30'
    }
  ].filter(link => link.url); // Filter out null URLs

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-4">
            Siap Memulai Perjalanan Affiliate Anda?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Bergabung sekarang dan nikmati komisi menarik dari setiap penjualan. Mulai promosikan produk berkualitas dan raih penghasilan tambahan.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
          {/* Left Column - CTA Content */}
          <div>
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl mb-2">Komisi Real-Time</h3>
                    <p className="text-muted-foreground">Pantau penghasilan Anda secara real-time melalui dashboard yang user-friendly.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                    <ArrowRight className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl mb-2">Mudah Dimulai</h3>
                    <p className="text-muted-foreground">Daftar gratis, dapatkan link affiliate otomatis, dan mulai berpenghasilan hari ini.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl mb-2">Produk Terlaris</h3>
                    <p className="text-muted-foreground">Promosikan produk skincare dengan rating tinggi dan permintaan pasar yang besar.</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white px-8 py-4"
                >
                  <Link href="/register">
                    Daftar Sekarang
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="bg-white/80 backdrop-blur-sm hover:bg-white/90 border-2 border-primary/20 hover:border-primary/40 px-8 py-4"
                >
                  <Link href="/login">Login Member</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column - Social Links */}
          <div className="space-y-8">
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h3 className="font-semibold text-xl mb-6 text-center">Ikuti Kami</h3>
              <div className="grid grid-cols-2 gap-4">
                {socialLinks.map((social, index) => (
                  <Button
                    key={index}
                    asChild
                    variant="outline"
                    className={`bg-gradient-to-br ${social.color} border-0 p-6 h-auto flex-col gap-3`}
                  >
                    <Link href={social.url!} target="_blank" rel="noopener noreferrer">
                      <social.icon className="w-8 h-8" />
                      <span className="font-medium">{social.name}</span>
                    </Link>
                  </Button>
                ))}
              </div>
            </div>

            <div className="text-center">
              <p className="text-muted-foreground mb-4">Butuh bantuan?</p>
              <Button
                asChild
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <Link href={whatsappNumber ? formatWhatsAppLink(whatsappNumber) : '#'}>
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Hubungi WhatsApp
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}