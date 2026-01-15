import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Instagram, ShoppingBag, MessageCircle, Globe, Mail, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FooterSectionProps {
  footerDescription?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  shopeeUrl?: string;
  websiteUrl?: string;
  whatsappNumber?: string;
  email?: string;
}

export default function FooterSection({ 
  footerDescription, 
  instagramUrl, 
  tiktokUrl, 
  shopeeUrl, 
  websiteUrl, 
  whatsappNumber,
  email
}: FooterSectionProps) {
  const formatWhatsAppLink = (phone: string) => {
    if (!phone) return '#';
    const cleanPhone = phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('62') ? cleanPhone : `62${cleanPhone}`;
    return `https://wa.me/${formattedPhone}`;
  };

  const formatEmailLink = (email: string) => {
    return `mailto:${email}`;
  };

  const socialLinks = [
    {
      name: 'Instagram',
      icon: Instagram,
      url: instagramUrl,
      color: 'text-pink-500 hover:text-pink-600'
    },
    {
      name: 'Shopee',
      icon: ShoppingBag,
      url: shopeeUrl,
      color: 'text-orange-500 hover:text-orange-600'
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      url: whatsappNumber ? formatWhatsAppLink(whatsappNumber) : null,
      color: 'text-green-500 hover:text-green-600'
    },
    {
      name: 'Website',
      icon: Globe,
      url: websiteUrl,
      color: 'text-blue-500 hover:text-blue-600'
    }
  ].filter(link => link.url); // Filter out null URLs

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/Logo.png"
                alt="PE Skinpro"
                width={40}
                height={40}
                className="rounded-xl"
              />
              <span className="text-xl font-bold">PE Skinpro</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {footerDescription || "Brand skincare terpercaya dengan bahan alami dan teknologi Jerman. Bergabung dengan program affiliate kami dan nikmati komisi menarik."}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-slate-300 hover:text-white transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-slate-300 hover:text-white transition-colors">
                  Daftar Affiliate
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-slate-300 hover:text-white transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/#products" className="text-slate-300 hover:text-white transition-colors">
                  Produk
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg mb-4">Bantuan</h3>
            <ul className="space-y-2">
              {whatsappNumber && (
                <li>
                  <Link 
                    href={formatWhatsAppLink(whatsappNumber)} 
                    className="text-slate-300 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp Support
                  </Link>
                </li>
              )}
              {email && (
                <li>
                  <Link 
                    href={formatEmailLink(email)} 
                    className="text-slate-300 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Email Support
                  </Link>
                </li>
              )}
              <li>
                <Link href="/#benefits" className="text-slate-300 hover:text-white transition-colors">
                  Keuntungan Affiliate
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-slate-300 hover:text-white transition-colors">
                  Cara Bergabung
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg mb-4">Ikuti Kami</h3>
            <div className="flex gap-3 mb-6">
              {socialLinks.map((social, index) => (
                <Button
                  key={index}
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700"
                >
                  <Link href={social.url!} target="_blank" rel="noopener noreferrer">
                    <social.icon className="w-5 h-5" />
                  </Link>
                </Button>
              ))}
            </div>
            <p className="text-sm text-slate-400">
              Dapatkan informasi terbaru tentang produk dan program affiliate kami
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-slate-400 text-sm">
              © 2024 PE Skinpro. All rights reserved.
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> in Indonesia
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}