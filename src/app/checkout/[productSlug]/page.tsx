"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ShoppingCart, User, Phone, MapPin, CreditCard, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Product, AffiliateLink, User as UserType } from '@/types';
import { toast } from 'sonner';

const Logo = () => (
    <div className="flex items-center gap-2">
      <Image 
        src="/Logo.png" 
        alt="Affiliate PE Skinpro Logo"
        width={32} 
        height={32} 
        priority
      />
      <span className="font-display font-bold text-lg text-foreground">Affiliate</span>
    </div>
  );

export default function Checkout() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const productSlug = params.productSlug as string;
  const refCode = searchParams.get('ref');

  const [product, setProduct] = useState<Product | null>(null);
  const [affiliateLink, setAffiliateLink] = useState<AffiliateLink | null>(null);
  const [affiliator, setAffiliator] = useState<UserType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    buyerName: '',
    buyerPhone: '',
    shippingAddress: '',
    city: '',
    province: '',
    postalCode: '',
    orderNote: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      if (!refCode) {
        router.push('/invalid-affiliate');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/checkout/${productSlug}?ref=${refCode}`);
        const data = await response.json();

        if (!response.ok) {
          toast.error(data.error || 'Gagal memuat data pembayaran.');
          router.push('/invalid-affiliate');
          return;
        }

        setProduct(data.product);
        setAffiliateLink(data.affiliateLink);
        setAffiliator(data.affiliator);
      } catch (error) {
        console.error('Error fetching checkout data:', error);
        toast.error('Gagal memuat data pembayaran karena kesalahan jaringan.');
        router.push('/invalid-affiliate');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [productSlug, refCode, router]);

  useEffect(() => {
    if (refCode) {
      fetch('/api/track-click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ref: refCode }),
      }).catch(error => {
        console.error('Failed to track click:', error);
      });
    }
  }, [refCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const orderData = {
      ...formData,
      productId: product?.id,
      affiliatorId: affiliator?.id,
      affiliateCode: refCode,
      affiliateName: affiliator?.name,
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        setIsSuccess(true);
        toast.success('Pesanan berhasil ditempatkan!');
      } else {
        const errorData = await response.json();
        toast.error(`Gagal menempatkan pesanan: ${errorData.error || 'Silakan coba lagi.'}`);
      }
    } catch (error) {
      console.error('Failed to submit order:', error);
      toast.error('Gagal menempatkan pesanan karena kesalahan jaringan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !product || !affiliator) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse-soft text-muted-foreground">Memuat...</div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md text-center"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}
            className="w-24 h-24 mx-auto mb-8 rounded-full bg-success/20 flex items-center justify-center"
          >
            <CheckCircle className="w-12 h-12 text-success" />
          </motion.div>

          <h1 className="text-3xl font-display font-bold text-foreground mb-4">
            Pesanan Ditempatkan!
          </h1>
          <p className="text-muted-foreground mb-8">
            Terima kasih atas pesanan Anda. Tim kami akan segera menghubungi Anda untuk konfirmasi pembayaran 
            dan detail pengiriman.
          </p>

          <div className="bg-card rounded-xl p-6 shadow-card border border-border text-left mb-8">
            <h3 className="font-semibold text-foreground mb-3">Ringkasan Pesanan</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Produk</span>
                <span className="font-medium">{product.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Harga</span>
                <span className="font-medium">
                  {product.price.toLocaleString('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pengiriman</span>
                <span className="font-medium">Akan ditentukan</span>
              </div>
            </div>
          </div>

          <Button asChild className="w-full">
            <Link href="/">Kembali ke Beranda</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-flex items-center gap-3 mb-8">
            <Logo />
          </Link>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Pembayaran</h1>
          <p className="text-muted-foreground">Selesaikan pesanan Anda</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  Detail Pesanan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Info */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <User className="w-4 h-4" /> Informasi Pribadi
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="buyerName">Nama Lengkap *</Label>
                        <Input
                          id="buyerName"
                          value={formData.buyerName}
                          onChange={(e) => setFormData(prev => ({ ...prev, buyerName: e.target.value }))}
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="buyerPhone">Nomor Telepon *</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="buyerPhone"
                            value={formData.buyerPhone}
                            onChange={(e) => setFormData(prev => ({ ...prev, buyerPhone: e.target.value }))}
                            placeholder="+62..."
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Info */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Alamat Pengiriman
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="shippingAddress">Alamat Jalan *</Label>
                      <Input
                        id="shippingAddress"
                        value={formData.shippingAddress}
                        onChange={(e) => setFormData(prev => ({ ...prev, shippingAddress: e.target.value }))}
                        placeholder="Jalan, nomor rumah, RT/RW..."
                        required
                      />
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">Kota *</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                          placeholder="Jakarta"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="province">Provinsi *</Label>
                        <Input
                          id="province"
                          value={formData.province}
                          onChange={(e) => setFormData(prev => ({ ...prev, province: e.target.value }))}
                          placeholder="DKI Jakarta"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="postalCode">Kode Pos *</Label>
                        <Input
                          id="postalCode"
                          value={formData.postalCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                          placeholder="12345"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Order Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="orderNote">Catatan Pesanan (Opsional)</Label>
                    <Textarea
                      id="orderNote"
                      value={formData.orderNote}
                      onChange={(e) => setFormData(prev => ({ ...prev, orderNote: e.target.value }))}
                      placeholder="Instruksi khusus..."
                      rows={3}
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <span className="animate-pulse-soft">Memproses...</span>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Tempatkan Pesanan
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Dengan menempatkan pesanan ini, Anda menyetujui syarat dan ketentuan kami. 
                    Detail pembayaran akan dikirim melalui WhatsApp/Email.
                  </p>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Order Summary */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-card sticky top-8">
              <CardHeader>
                <CardTitle className="font-display">Ringkasan Pesanan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Product */}
                <div className="flex gap-4">
                  {product.imageUrl && (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <h3 className="font-medium text-foreground">{product.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 pt-4 border-t border-border">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-medium">
                                      {product.price.toLocaleString('id-ID', {
                                        style: 'currency',
                                        currency: 'IDR',
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0,
                                      })}
                                    </span>
                                  </div>                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pengiriman</span>
                    <span className="font-medium">Dihitung nanti</span>
                  </div>
                  <div className="flex justify-between text-lg pt-3 border-t border-border">
                    <span className="font-semibold">Total</span>
                    <span className="font-display font-bold text-primary">
                      {product.price.toLocaleString('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </div>
                </div>

                {/* Referred By */}
                <div className="p-4 rounded-lg bg-secondary">
                  <p className="text-xs text-muted-foreground mb-1">Direferensikan oleh</p>
                  <p className="font-medium text-foreground">{affiliator.name}</p>
                  <p className="text-xs text-muted-foreground">Kode: {refCode}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}