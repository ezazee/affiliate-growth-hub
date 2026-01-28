"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ShoppingCart, User, Phone, MapPin, CreditCard, CheckCircle, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Product, AffiliateLink, User as UserType } from '@/types';
import { toast } from '@/hooks/use-toast';


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

export default function CheckoutClient({ productSlug: propProductSlug, referralCode: propReferralCode }: {
  productSlug?: string;
  referralCode?: string;
}) {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const productSlug = propProductSlug || (params.productSlug as string);
  const refCode = propReferralCode || searchParams.get('ref');

  const [product, setProduct] = useState<Product | null>(null);
  const [affiliateLink, setAffiliateLink] = useState<AffiliateLink | null>(null);
  const [affiliator, setAffiliator] = useState<UserType | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [distanceInKm, setDistanceInKm] = useState<number | null>(null);
  const [appliedRateDetails, setAppliedRateDetails] = useState<string | null>(null);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);

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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/checkout/${productSlug}?ref=${refCode}`);
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [productSlug, refCode, router]);

  useEffect(() => {
    if (refCode && productSlug) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/track-click`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ref: refCode, productSlug: productSlug }),
      }).catch(error => {
        console.error('Failed to track click:', error);
      });
    }
  }, [refCode, productSlug]);

  const handleCalculateShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculatingShipping(true);
    setShippingCost(null);
    setDistanceInKm(null);
    setAppliedRateDetails(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/calculate-shipping`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setShippingCost(data.shippingCost);
        setDistanceInKm(data.distanceInKm);
        setAppliedRateDetails(data.appliedRateDetails);
        toast.success('Biaya pengiriman berhasil dihitung.');
      } else {
        toast.error(`Gagal menghitung pengiriman: ${data.error || 'Silakan periksa alamat Anda.'}`);
      }
    } catch (error) {
      toast.error('Gagal menghitung pengiriman karena kesalahan jaringan.');
    } finally {
      setIsCalculatingShipping(false);
    }
  };

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);

    const orderData = {
      ...formData,
      productId: product?.id,
      affiliatorId: affiliator?.id,
      affiliateCode: refCode,
      affiliateName: affiliator?.name,
      shippingCost: shippingCost,
      totalPrice: (product?.price || 0) + (shippingCost || 0),
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const newOrder = await response.json();

      if (response.ok) {
        toast.success('Pesanan berhasil dibuat! Mengarahkan ke pembayaran...');
        router.push(`/payment/${newOrder.paymentToken}`);
      } else {
        toast.error(`Gagal menempatkan pesanan: ${newOrder.error || 'Silakan coba lagi.'}`);
      }
    } catch (error) {
      console.error('Failed to submit order:', error);
      toast.error('Gagal menempatkan pesanan karena kesalahan jaringan.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleEditAddress = () => {
    setShippingCost(null);
    setDistanceInKm(null);
    setAppliedRateDetails(null);
  };

  if (isLoading || !product || !affiliator) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse-soft text-muted-foreground">Memuat...</div>
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
                <form onSubmit={handleCalculateShipping} className="space-y-6">
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
                          disabled={shippingCost !== null}
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
                            disabled={shippingCost !== null}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Info - Address Form */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Alamat Pengiriman
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="shippingAddress">Alamat Lengkap *</Label>
                      <Input
                        id="shippingAddress"
                        value={formData.shippingAddress}
                        onChange={(e) => setFormData(prev => ({ ...prev, shippingAddress: e.target.value }))}
                        placeholder="Alamat lengkap Anda"
                        required
                        disabled={shippingCost !== null}
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">Kota</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                          placeholder="Kota"
                          required
                          disabled={shippingCost !== null}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="province">Provinsi</Label>
                        <Input
                          id="province"
                          value={formData.province}
                          onChange={(e) => setFormData(prev => ({ ...prev, province: e.target.value }))}
                          placeholder="Provinsi"
                          required
                          disabled={shippingCost !== null}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="postalCode">Kode Pos</Label>
                        <Input
                          id="postalCode"
                          value={formData.postalCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                          placeholder="Kode Pos"
                          required
                          disabled={shippingCost !== null}
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
                      disabled={shippingCost !== null}
                    />
                  </div>

                  {shippingCost === null ? (
                    <Button type="submit" size="lg" className="w-full" disabled={isCalculatingShipping}>
                      {isCalculatingShipping ? (
                        <span className="animate-pulse-soft">Menghitung Biaya...</span>
                      ) : (
                        'Hitung Biaya Pengiriman'
                      )}
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-secondary">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm text-muted-foreground">Biaya Pengiriman</p>
                          <Button variant="link" size="sm" className="h-auto p-0 text-primary" onClick={handleEditAddress}>
                            <Pencil className="w-3 h-3 mr-1" />
                            Edit Alamat
                          </Button>
                        </div>
                        <p className="text-2xl font-bold text-center">
                          {shippingCost.toLocaleString('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                          })}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Jarak: {distanceInKm} km.
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {appliedRateDetails}
                        </p>
                      </div>
                      <Button onClick={handlePlaceOrder} size="lg" className="w-full" disabled={isPlacingOrder}>
                        {isPlacingOrder ? (
                          <span className="animate-pulse-soft">Memproses...</span>
                        ) : (
                          'Konfirmasi & Tempatkan Pesanan'
                        )}
                      </Button>
                    </div>
                  )}

                  <p className="text-xs text-center text-muted-foreground">
                    Dengan menempatkan pesanan ini, Anda menyetujui syarat dan ketentuan kami.
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
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pengiriman</span>
                    <span className="font-medium">
                      {shippingCost === null
                        ? 'Menunggu...'
                        : shippingCost.toLocaleString('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0,
                        })}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg pt-3 border-t border-border">
                    <span className="font-semibold">Total</span>
                    <span className="font-display font-bold text-primary">
                      {((product.price || 0) + (shippingCost || 0)).toLocaleString('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
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