"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { AddressAutocompleteInput } from '@/components/ui/address-autocomplete-input';
import { DollarSign, Upload, Image, Link as LinkIcon, Mail, Phone, Instagram, ShoppingBag, MessageCircle, Globe } from 'lucide-react';

export default function SettingsPage() {
  const [address, setAddress] = useState('');
  const [adminWhatsApp, setAdminWhatsApp] = useState('');
  const [minimumWithdrawal, setMinimumWithdrawal] = useState(50000);
  const [shippingRates, setShippingRates] = useState({
    short_rate: 1500,
    medium_rate: 1200,
    long_rate: 1000,
    long_flat_rate: 50000,
  });

  // Landing Page Settings
  const [landingPageSettings, setLandingPageSettings] = useState({
    aboutTitle: '',
    aboutDescription: '',
    aboutImage: '',
    heroTitle: '',
    heroDescription: '',
    instagramUrl: '',
    tiktokUrl: '',
    shopeeUrl: '',
    websiteUrl: '',
    whatsappNumber: '',
    email: '',
    footerDescription: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [isSavingWhatsApp, setIsSavingWhatsApp] = useState(false);
  const [isSavingWithdrawal, setIsSavingWithdrawal] = useState(false);
  const [isSavingRates, setIsSavingRates] = useState(false);
  const [isSavingLandingPage, setIsSavingLandingPage] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/admin/settings');
        
        if (!response.ok) {
          // Try to get error message, fallback to status text
          let errorMessage = 'Gagal memuat pengaturan.';
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            errorMessage = `Server error: ${response.status} ${response.statusText}`;
          }
          toast.error(errorMessage);
          return;
        }
        
        const data = await response.json();
        setAddress(data.warehouseAddress || '');
        setAdminWhatsApp(data.adminWhatsApp || '');
        setMinimumWithdrawal(data.minimumWithdrawal || 50000);
        setShippingRates({
          short_rate: data.short_rate || 1500,
          medium_rate: data.medium_rate || 1200,
          long_rate: data.long_rate || 1000,
          long_flat_rate: data.long_flat_rate || 50000,
        });

        // Landing Page Settings
        try {
          const landingResponse = await fetch('/api/admin/landing-settings');
          if (landingResponse.ok) {
            const landingData = await landingResponse.json();
            setLandingPageSettings({
              aboutTitle: landingData.aboutTitle || '',
              aboutDescription: landingData.aboutDescription || '',
              aboutImage: landingData.aboutImage || '',
              heroTitle: landingData.heroTitle || '',
              heroDescription: landingData.heroDescription || '',
              instagramUrl: landingData.instagramUrl || 'https://www.instagram.com/peskinproid',
              tiktokUrl: landingData.tiktokUrl || 'https://www.tiktok.com/@peskinproid',
              shopeeUrl: landingData.shopeeUrl || 'https://shopee.co.id/peskinpro_id',
              websiteUrl: landingData.websiteUrl || 'https://peskinpro.id',
              whatsappNumber: landingData.whatsappNumber || '0821-2316-7895',
              email: landingData.email || 'adm.peskinproid@gmail.com',
              footerDescription: landingData.footerDescription || 'Program affiliate resmi PE Skinpro. Dapatkan komisi menarik dari setiap penjualan produk skincare berkualitas.',
            });
          }
        } catch (error) {
          console.error('Error fetching landing page settings:', error);
        }
      } catch (error) {
        console.error('Settings fetch error:', error);
        toast.error('Gagal memuat pengaturan karena kesalahan jaringan.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAddress(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'warehouseAddress', value: address }),
      });
      
      if (!response.ok) {
        let errorMessage = 'Gagal memperbarui alamat.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        toast.error(errorMessage);
        return;
      }
      
      const data = await response.json();
      toast.success('Alamat gudang berhasil diperbarui.');
    } catch (error) {
      console.error('Address save error:', error);
      toast.error('Gagal memperbarui alamat karena kesalahan jaringan.');
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleSaveWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi nomor WhatsApp
    const cleanNumber = adminWhatsApp.replace(/\D/g, '');
    if (!cleanNumber) {
      toast.error('Nomor WhatsApp tidak boleh kosong.');
      return;
    }
    
    if (cleanNumber.length < 9 || cleanNumber.length > 13) {
      toast.error('Nomor WhatsApp harus antara 9-13 digit.');
      return;
    }
    
    setIsSavingWhatsApp(true);
    try {
      // Format nomor dengan prefix 62
      const formattedNumber = cleanNumber.startsWith('62') ? cleanNumber : `62${cleanNumber}`;
      
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'adminWhatsApp', value: formattedNumber }),
      });
      
      if (!response.ok) {
        let errorMessage = 'Gagal memperbarui nomor WhatsApp.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        toast.error(errorMessage);
        return;
      }
      
      const data = await response.json();
      setAdminWhatsApp(formattedNumber);
      toast.success('Nomor WhatsApp admin berhasil diperbarui.');
    } catch (error) {
      console.error('WhatsApp save error:', error);
      toast.error('Gagal memperbarui nomor WhatsApp karena kesalahan jaringan.');
    } finally {
      setIsSavingWhatsApp(false);
    }
  };

  const handleSaveMinimumWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi minimal penarikan
    const amount = Number(minimumWithdrawal);
    if (!amount || amount < 10000) {
      toast.error('Minimal penarikan harus minimal Rp 10.000.');
      return;
    }
    
    if (amount > 10000000) {
      toast.error('Minimal penarikan tidak boleh lebih dari Rp 10.000.000.');
      return;
    }
    
    setIsSavingWithdrawal(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'minimumWithdrawal', value: amount }),
      });
      
      if (!response.ok) {
        let errorMessage = 'Gagal memperbarui minimal penarikan.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        toast.error(errorMessage);
        return;
      }
      
      const data = await response.json();
      toast.success('Minimal penarikan berhasil diperbarui.');
    } catch (error) {
      console.error('Minimum withdrawal save error:', error);
      toast.error('Gagal memperbarui minimal penarikan karena kesalahan jaringan.');
    } finally {
      setIsSavingWithdrawal(false);
    }
  };
  
  const handleSaveShippingRates = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingRates(true);

    const ratesToSave = Object.entries(shippingRates).map(([name, value]) => ({
      name,
      value: Number(value),
    }));

    try {
      const responses = await Promise.all(
        ratesToSave.map(rate => 
          fetch('/api/admin/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(rate),
          })
        )
      );
      
      // Check if any responses failed
      const failedResponses = responses.filter(response => !response.ok);
      if (failedResponses.length > 0) {
        let errorMessage = 'Gagal memperbarui satu atau lebih biaya pengiriman.';
        try {
          const errorData = await failedResponses[0].json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Server error: ${failedResponses[0].status} ${failedResponses[0].statusText}`;
        }
        toast.error(errorMessage);
        return;
      }
      
      toast.success('Biaya pengiriman berhasil diperbarui.');
    } catch (error) {
      console.error('Shipping rates save error:', error);
      toast.error('Gagal memperbarui satu atau lebih biaya pengiriman.');
    } finally {
      setIsSavingRates(false);
    }
  };
  
  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingRates(prev => ({ ...prev, [name]: value }));
  };

  // Landing Page Settings Handlers
  const handleLandingPageChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLandingPageSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran gambar maksimal 5MB');
      return;
    }

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || 'Gagal mengupload gambar');
        return;
      }

      const data = await response.json();
      setLandingPageSettings(prev => ({ ...prev, aboutImage: data.url }));
      toast.success('Gambar berhasil diupload');
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Gagal mengupload gambar');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveLandingPage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingLandingPage(true);

    try {
      const response = await fetch('/api/admin/landing-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(landingPageSettings),
      });

      if (!response.ok) {
        let errorMessage = 'Gagal memperbarui pengaturan landing page.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        toast.error(errorMessage);
        return;
      }

      const data = await response.json();
      toast.success('Pengaturan landing page berhasil diperbarui.');
    } catch (error) {
      console.error('Landing page save error:', error);
      toast.error('Gagal memperbarui pengaturan landing page.');
    } finally {
      setIsSavingLandingPage(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pengaturan</h1>
        <p className="text-muted-foreground">Kelola pengaturan umum untuk aplikasi Anda.</p>
      </div>

      {isLoading ? (
        <div className="grid gap-6">
          <Card><CardHeader><div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div></CardHeader><CardContent><div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div></CardContent></Card>
          <Card><CardHeader><div className="h-24 bg-gray-200 rounded w-full animate-pulse"></div></CardHeader><CardContent><div className="h-10 bg-gray-200 rounded w-1/2 animate-pulse"></div></CardContent></Card>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Alamat Gudang</CardTitle>
              <CardDescription>
                Alamat ini akan digunakan sebagai titik asal untuk perhitungan biaya pengiriman.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveAddress} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="warehouse-address">Alamat Lengkap</Label>
                  <AddressAutocompleteInput
                    value={address}
                    onValueChange={setAddress}
                    placeholder="Mulai ketik untuk mencari alamat..."
                  />
                </div>
                <Button type="submit" disabled={isSavingAddress}>
                  {isSavingAddress ? 'Menyimpan...' : 'Simpan Alamat'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Minimal Penarikan Dana</CardTitle>
              <CardDescription>
                Atur jumlah minimal yang bisa ditarik oleh affiliator dari komisi mereka.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveMinimumWithdrawal} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="minimum-withdrawal">Minimal Penarikan (Rp)</Label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-muted-foreground">Rp</span>
                    <Input 
                      id="minimum-withdrawal" 
                      type="number" 
                      value={minimumWithdrawal}
                      onChange={(e) => setMinimumWithdrawal(Number(e.target.value))}
                      placeholder="50000"
                      className="pl-12"
                      min={10000}
                      max={10000000}
                      step={1000}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Minimal: Rp 10.000, Maksimal: Rp 10.000.000
                  </p>
                </div>
                <Button type="submit" disabled={isSavingWithdrawal}>
                  {isSavingWithdrawal ? 'Menyimpan...' : 'Simpan Minimal Penarikan'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Nomor WhatsApp Admin</CardTitle>
              <CardDescription>
                Nomor WhatsApp ini akan digunakan untuk kontak admin di seluruh aplikasi. Gunakan format 628xxxxxxxxxx.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveWhatsApp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-whatsapp">Nomor WhatsApp Admin</Label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-muted-foreground">62</span>
                    <Input 
                      id="admin-whatsapp" 
                      type="tel" 
                      value={adminWhatsApp.replace(/^62/, '')}
                      onChange={(e) => setAdminWhatsApp(e.target.value.replace(/\D/g, ''))}
                      placeholder="8xxxxxxxxxx"
                      className="pl-12"
                      pattern="[0-9]{9,13}"
                      minLength={9}
                      maxLength={13}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Contoh: 81313711180 (akan menjadi 6281313711180)
                  </p>
                </div>
                <Button type="submit" disabled={isSavingWhatsApp}>
                  {isSavingWhatsApp ? 'Menyimpan...' : 'Simpan Nomor WhatsApp'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Kategori Biaya Pengiriman</CardTitle>
              <CardDescription>
                Atur biaya berdasarkan jarak pengiriman. Biaya dihitung per kilometer dalam Rupiah (IDR).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveShippingRates} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Short Distance */}
                  <div className="space-y-2">
                    <Label htmlFor="short_rate">Dalam Kota / Dekat (&lt; 20 km)</Label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-muted-foreground">IDR</span>
                      <Input id="short_rate" name="short_rate" type="number" value={shippingRates.short_rate} onChange={handleRateChange} placeholder="1500" className="pl-12" />
                    </div>
                  </div>

                  {/* Medium Distance */}
                  <div className="space-y-2">
                    <Label htmlFor="medium_rate">Antar Kota (20-150 km)</Label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-muted-foreground">IDR</span>
                      <Input id="medium_rate" name="medium_rate" type="number" value={shippingRates.medium_rate} onChange={handleRateChange} placeholder="1200" className="pl-12" />
                    </div>
                  </div>

                  {/* Long Distance Per KM */}
                  <div className="space-y-2">
                    <Label htmlFor="long_rate">Jarak Jauh (&gt; 150 km) - Biaya /km</Label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-muted-foreground">IDR</span>
                      <Input id="long_rate" name="long_rate" type="number" value={shippingRates.long_rate} onChange={handleRateChange} placeholder="1000" className="pl-12" />
                    </div>
                  </div>
                  
                  {/* Long Distance Flat */}
                  <div className="space-y-2">
                    <Label htmlFor="long_flat_rate">Jarak Jauh (&gt; 150 km) - Biaya Flat</Label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-muted-foreground">IDR</span>
                      <Input id="long_flat_rate" name="long_flat_rate" type="number" value={shippingRates.long_flat_rate} onChange={handleRateChange} placeholder="50000" className="pl-12" />
                    </div>
                  </div>
                </div>
                <Button type="submit" disabled={isSavingRates}>
                  {isSavingRates ? 'Menyimpan...' : 'Simpan Biaya Pengiriman'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Landing Page Settings */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Pengaturan Landing Page
              </CardTitle>
              <CardDescription>
                Kelola konten dan tampilan landing page affiliate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveLandingPage} className="space-y-8">
                {/* Hero Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Hero Section</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="heroTitle">Judul Hero</Label>
                      <Input
                        id="heroTitle"
                        name="heroTitle"
                        value={landingPageSettings.heroTitle}
                        onChange={handleLandingPageChange}
                        placeholder="Dapatkan Penghasilan Hingga 10%"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="heroDescription">Deskripsi Hero</Label>
                      <Textarea
                        id="heroDescription"
                        name="heroDescription"
                        value={landingPageSettings.heroDescription}
                        onChange={handleLandingPageChange}
                        placeholder="Bergabunglah dengan program affiliate PE Skinpro dan dapatkan komisi menarik..."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                {/* About Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Tentang Kami</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="aboutTitle">Judul Tentang Kami</Label>
                      <Input
                        id="aboutTitle"
                        name="aboutTitle"
                        value={landingPageSettings.aboutTitle}
                        onChange={handleLandingPageChange}
                        placeholder="Tentang PE Skinpro"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="aboutDescription">Deskripsi Tentang Kami</Label>
                      <Textarea
                        id="aboutDescription"
                        name="aboutDescription"
                        value={landingPageSettings.aboutDescription}
                        onChange={handleLandingPageChange}
                        placeholder="PE Skin Professional didirikan pada satu dekade yang lalu..."
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="aboutImage">Gambar Tentang Kami</Label>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <Input
                            id="aboutImage"
                            name="aboutImage"
                            value={landingPageSettings.aboutImage}
                            onChange={handleLandingPageChange}
                            placeholder="https://example.com/image.jpg"
                            className="font-mono text-sm"
                          />
                        </div>
                        <div className="relative">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            disabled={isUploadingImage}
                          />
                          <Button type="button" variant="outline" disabled={isUploadingImage}>
                            <Image className="w-4 h-4 mr-2" />
                            {isUploadingImage ? 'Mengupload...' : 'Upload'}
                          </Button>
                        </div>
                      </div>
                      {landingPageSettings.aboutImage && (
                        <div className="mt-2">
                          <img 
                            src={landingPageSettings.aboutImage} 
                            alt="About" 
                            className="h-20 w-20 object-cover rounded border"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact & Social Media */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Kontak & Media Sosial</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="instagramUrl" className="flex items-center gap-2">
                        <Instagram className="w-4 h-4" />
                        Instagram URL
                      </Label>
                      <Input
                        id="instagramUrl"
                        name="instagramUrl"
                        value={landingPageSettings.instagramUrl}
                        onChange={handleLandingPageChange}
                        placeholder="https://www.instagram.com/peskinproid"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tiktokUrl" className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        TikTok URL
                      </Label>
                      <Input
                        id="tiktokUrl"
                        name="tiktokUrl"
                        value={landingPageSettings.tiktokUrl}
                        onChange={handleLandingPageChange}
                        placeholder="https://www.tiktok.com/@peskinproid"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shopeeUrl" className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4" />
                        Shopee URL
                      </Label>
                      <Input
                        id="shopeeUrl"
                        name="shopeeUrl"
                        value={landingPageSettings.shopeeUrl}
                        onChange={handleLandingPageChange}
                        placeholder="https://shopee.co.id/peskinpro_id"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="websiteUrl" className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Website URL
                      </Label>
                      <Input
                        id="websiteUrl"
                        name="websiteUrl"
                        value={landingPageSettings.websiteUrl}
                        onChange={handleLandingPageChange}
                        placeholder="https://peskinpro.id"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whatsappNumber" className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Nomor WhatsApp
                      </Label>
                      <Input
                        id="whatsappNumber"
                        name="whatsappNumber"
                        value={landingPageSettings.whatsappNumber}
                        onChange={handleLandingPageChange}
                        placeholder="0821-2316-7895"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-3">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={landingPageSettings.email}
                        onChange={handleLandingPageChange}
                        placeholder="adm.peskinproid@gmail.com"
                        className="md:max-w-md"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Description */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Footer Description</h3>
                  <div className="space-y-2">
                    <Label htmlFor="footerDescription">Deskripsi Footer</Label>
                    <Textarea
                      id="footerDescription"
                      name="footerDescription"
                      value={landingPageSettings.footerDescription}
                      onChange={handleLandingPageChange}
                      placeholder="Program affiliate resmi PE Skinpro. Dapatkan komisi menarik dari setiap penjualan produk skincare berkualitas."
                      rows={2}
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isSavingLandingPage} className="w-full md:w-auto">
                  {isSavingLandingPage ? 'Menyimpan...' : 'Simpan Pengaturan Landing Page'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

