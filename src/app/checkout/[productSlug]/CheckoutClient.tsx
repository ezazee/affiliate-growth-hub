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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product, AffiliateLink, User as UserType } from '@/types';
import { toast } from '@/hooks/use-toast';
import { useIndonesiaArea, Area } from '@/hooks/useIndonesiaArea';
import { AddressAutocomplete } from '@/components/ui/address-autocomplete';

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

  // Address Hooks
  const { provinces, cities, districts, fetchCities, fetchDistricts, isLoading: isAreaLoading } = useIndonesiaArea();

  const [formData, setFormData] = useState({
    buyerName: '',
    buyerPhone: '',
    shippingAddress: '', // Full address string
    district: '',        // Name of district
    city: '',            // Name of city
    province: '',        // Name of province
    postalCode: '',
    orderNote: '',
  });

  // Keep track of selected IDs for the cascading logic
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('');
  const [selectedCityId, setSelectedCityId] = useState<string>('');

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

  // Handle Autocomplete Selection
  const handleAddressSelect = (feature: any) => {
    // Mapbox feature context extraction
    const context = feature.context || [];
    let foundCity = '';
    let foundProvince = '';
    let foundDistrict = '';
    let foundPostcode = '';

    context.forEach((c: any) => {
      if (c.id.startsWith('district')) foundDistrict = c.text;
      if (c.id.startsWith('place')) foundCity = c.text;
      if (c.id.startsWith('region')) foundProvince = c.text;
      if (c.id.startsWith('postcode')) foundPostcode = c.text;
    });

    setFormData(prev => ({
      ...prev,
      shippingAddress: feature.place_name,
      district: foundDistrict || prev.district,
      city: foundCity || prev.city,
      province: foundProvince || prev.province,
      postalCode: foundPostcode || prev.postalCode,
    }));

    // Note: We can't easily auto-select the dropdown IDs from Mapbox strings without fuzzy matching.
    // For now, we populate the text fields in formData.
    // The user will still see the dropdowns. If they want to manually change, they can.
    // But since the dropdowns drive the 'visual' selection, we might need to find the matching ID.
    // Simple exact match attempt:
    const matchedProvince = provinces.find(p => p.name.toLowerCase() === foundProvince?.toLowerCase());
    if (matchedProvince) {
      setSelectedProvinceId(matchedProvince.id);
      fetchCities(matchedProvince.id);
    }
  };

  // Handle Province Change
  const handleProvinceChange = (provinceId: string) => {
    const province = provinces.find(p => p.id === provinceId);
    setSelectedProvinceId(provinceId);
    setSelectedCityId(''); // Reset city
    setFormData(prev => ({ ...prev, province: province?.name || '', city: '', district: '' }));
    fetchCities(provinceId);
  };

  // Handle City Change
  const handleCityChange = (cityId: string) => {
    const city = cities.find(c => c.id === cityId);
    setSelectedCityId(cityId);
    setFormData(prev => ({ ...prev, city: city?.name || '', district: '' }));
    fetchDistricts(cityId);
  };

  // Handle District Change
  const handleDistrictChange = (districtId: string) => {
    const district = districts.find(d => d.id === districtId);
    setFormData(prev => ({ ...prev, district: district?.name || '' }));
  };


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

        // Store debug info
        (window as any).debugShipping = data.debug;

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
                      <AddressAutocomplete
                        value={formData.shippingAddress}
                        onChange={(val) => setFormData(prev => ({ ...prev, shippingAddress: val }))}
                        onSelect={handleAddressSelect}
                        disabled={shippingCost !== null}
                      />
                      <p className="text-xs text-muted-foreground">Cari alamat untuk mengisi otomatis kota, kecamatan, dll.</p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Province */}
                      <div className="space-y-2">
                        <Label htmlFor="province">Provinsi</Label>
                        <Select
                          disabled={shippingCost !== null || isAreaLoading}
                          value={selectedProvinceId}
                          onValueChange={handleProvinceChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih Provinsi" />
                          </SelectTrigger>
                          <SelectContent>
                            {provinces.map(p => (
                              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* City */}
                      <div className="space-y-2">
                        <Label htmlFor="city">Kota/Kabupaten</Label>
                        <Select
                          disabled={shippingCost !== null || !selectedProvinceId || isAreaLoading}
                          value={selectedCityId}
                          onValueChange={handleCityChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih Kota" />
                          </SelectTrigger>
                          <SelectContent>
                            {cities.map(c => (
                              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* District */}
                      <div className="space-y-2">
                        <Label htmlFor="district">Kecamatan</Label>
                        <Select
                          disabled={shippingCost !== null || !selectedCityId || isAreaLoading}
                          onValueChange={handleDistrictChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={formData.district || "Pilih Kecamatan"} />
                          </SelectTrigger>
                          <SelectContent>
                            {districts.map(d => (
                              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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

                        {/* Debug Info */}
                        {(isCalculatingShipping === false && (distanceInKm || 0) > 0) && (
                          <div className="mt-4 pt-4 border-t border-border/50 text-left">
                            <p className="text-[10px] font-mono text-muted-foreground mb-1 uppercase tracking-wider">Rute Pengiriman</p>
                            <div className="text-xs text-muted-foreground space-y-1">
                              <p><span className="font-semibold">Dari (Gudang):</span> <span className="opacity-80">{(window as any).debugShipping?.origin || '...'}</span></p>
                              <p><span className="font-semibold">Ke (Tujuan):</span> <span className="opacity-80">{(window as any).debugShipping?.destination || '...'}</span></p>
                            </div>
                          </div>
                        )}
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