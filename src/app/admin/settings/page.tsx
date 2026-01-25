"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { AddressAutocompleteInput } from "@/components/ui/address-autocomplete-input";
import {
  DollarSign,
  Upload,
  Image,
  Link as LinkIcon,
  Mail,
  Phone,
  Instagram,
  ShoppingBag,
  MessageCircle,
  Globe,
  Bell,
  Send,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PushNotificationSender } from "@/components/admin/push-notification-sender";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  const { user } = useAuth();
  const [address, setAddress] = useState("");
  const [adminWhatsApp, setAdminWhatsApp] = useState("");
  const [minimumWithdrawal, setMinimumWithdrawal] = useState(50000);
  const [shippingRates, setShippingRates] = useState({
    short_rate: 1500,
    medium_rate: 1200,
    long_rate: 1000,
    long_flat_rate: 50000,
  });



  // Landing Page Settings
  const [landingPageSettings, setLandingPageSettings] = useState({
    aboutTitle: "",
    aboutDescription: "",
    aboutImage: "",
    heroTitle: "",
    heroDescription: "",
    instagramUrl: "",
    tiktokUrl: "",
    shopeeUrl: "",
    websiteUrl: "",
    whatsappNumber: "",
    email: "",
    footerDescription: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [isSavingWhatsApp, setIsSavingWhatsApp] = useState(false);
  const [isSavingWithdrawal, setIsSavingWithdrawal] = useState(false);
  const [isSavingRates, setIsSavingRates] = useState(false);
  const [isSavingLandingPage, setIsSavingLandingPage] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    // Admin Notifications
    newAffiliateTitle: "👋 Affiliator Baru Mendaftar!",
    newAffiliateMessage: "{name} ({email}) baru saja mendaftar sebagai affiliator.",
    newOrderTitle: "🛒 Pesanan Baru!",
    newOrderMessage: "Pesanan #{orderId} dari {customerName} dengan total {amount}",
    withdrawalRequestTitle: "💰 Permohonan Penarikan Dana",
    withdrawalRequestMessage: "{name} mengajukan penarikan sebesar {amount}",

    // Affiliator Notifications
    newOrderAffiliateTitle: "🛒 Pesanan Baru!",
    newOrderAffiliateMessage: "Pesanan #{orderId} dari {customerName}. Komisi: {commission}",
    orderShippedTitle: "📦 Pesanan Dikirim",
    orderShippedMessage: "Pesanan #{orderId} untuk {customerName} telah dikirim",
    orderCompletedTitle: "✅ Pesanan Selesai",
    orderCompletedMessage: "Pesanan #{orderId} untuk {customerName} telah selesai. Komisi telah ditambahkan!",
    commissionEarnedTitle: "💵 Pemasukan Komisi!",
    commissionEarnedMessage: "Komisi sebesar {amount} dari pesanan #{orderId} telah ditambahkan ke akun Anda",
    balanceUpdatedTitle: "💰 Saldo Dapat Ditarik Diperbarui",
    balanceUpdatedMessage: "Saldo yang dapat ditarik: {availableBalance}",
    withdrawalApprovedTitle: "✅ Penarikan Disetujui",
    withdrawalApprovedMessage: "Penarikan sebesar {amount} telah disetujui pada {processedAt}",
    withdrawalRejectedTitle: "❌ Penarikan Ditolak",
    withdrawalRejectedMessage: "Penarikan sebesar {amount} ditolak. Alasan: {reason}",

    // Settings
    enableAdminNotifications: true,
    enableAffiliateNotifications: true,
    enableEmailNotifications: false,
    enablePushNotifications: true,
  });

  const [isSavingNotificationSettings, setIsSavingNotificationSettings] = useState(false);

  const handleSaveNotificationSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingNotificationSettings(true);

    try {
      const response = await fetch("/api/admin/notification-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notificationSettings),
      });

      if (!response.ok) {
        let errorMessage = "Gagal memperbarui pengaturan notifikasi.";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        console.error(errorMessage);
        return;
      }

      const data = await response.json();

    } catch (error) {
      console.error("Notification settings save error:", error);
      console.error("Gagal memperbarui pengaturan notifikasi.");
    } finally {
      setIsSavingNotificationSettings(false);
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/admin/settings");

        if (!response.ok) {
          // Try to get error message, fallback to status text
          let errorMessage = "Gagal memuat pengaturan.";
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            errorMessage = `Server error: ${response.status} ${response.statusText}`;
          }
          console.error(errorMessage);
          return;
        }

        const data = await response.json();
        setAddress(data.warehouseAddress || "");
        setAdminWhatsApp(data.adminWhatsApp || "");
        setMinimumWithdrawal(data.minimumWithdrawal || 50000);
        setShippingRates({
          short_rate: data.short_rate || 1500,
          medium_rate: data.medium_rate || 1200,
          long_rate: data.long_rate || 1000,
          long_flat_rate: data.long_flat_rate || 50000,
        });

        // Landing Page Settings
        try {
          const landingResponse = await fetch("/api/admin/landing-settings");
          if (landingResponse.ok) {
            const landingData = await landingResponse.json();
            setLandingPageSettings({
              aboutTitle: landingData.aboutTitle || "",
              aboutDescription: landingData.aboutDescription || "",
              aboutImage: landingData.aboutImage || "",
              heroTitle: landingData.heroTitle || "",
              heroDescription: landingData.heroDescription || "",
              instagramUrl:
                landingData.instagramUrl ||
                "https://www.instagram.com/peskinproid",
              tiktokUrl:
                landingData.tiktokUrl || "https://www.tiktok.com/@peskinproid",
              shopeeUrl:
                landingData.shopeeUrl || "https://shopee.co.id/peskinpro_id",
              websiteUrl: landingData.websiteUrl || "https://peskinpro.id",
              whatsappNumber: landingData.whatsappNumber || "0821-2316-7895",
              email: landingData.email || "adm.peskinproid@gmail.com",
              footerDescription:
                landingData.footerDescription ||
                "Program affiliate resmi PE Skinpro. Dapatkan komisi menarik dari setiap penjualan produk skincare berkualitas.",
            });
          }
        } catch (error) {
          console.error("Error fetching landing page settings:", error);
        }
      } catch (error) {
        console.error("Settings fetch error:", error);
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
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "warehouseAddress", value: address }),
      });

      if (!response.ok) {
        let errorMessage = "Gagal memperbarui alamat.";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        console.error(errorMessage);
        return;
      }

      const data = await response.json();

    } catch (error) {
      console.error("Address save error:", error);
      console.error("Gagal memperbarui alamat karena kesalahan jaringan.");
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleSaveWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi nomor WhatsApp
    const cleanNumber = adminWhatsApp.replace(/\D/g, "");
    if (!cleanNumber) {
      console.error("Nomor WhatsApp tidak boleh kosong.");
      return;
    }

    if (cleanNumber.length < 9 || cleanNumber.length > 13) {
      console.error("Nomor WhatsApp harus antara 9-13 digit.");
      return;
    }

    setIsSavingWhatsApp(true);
    try {
      // Format nomor dengan prefix 62
      const formattedNumber = cleanNumber.startsWith("62")
        ? cleanNumber
        : `62${cleanNumber}`;

      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "adminWhatsApp", value: formattedNumber }),
      });

      if (!response.ok) {
        let errorMessage = "Gagal memperbarui nomor WhatsApp.";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        console.error(errorMessage);
        return;
      }

      const data = await response.json();
      setAdminWhatsApp(formattedNumber);

    } catch (error) {
      console.error("WhatsApp save error:", error);
      console.error(
        "Gagal memperbarui nomor WhatsApp. Silakan periksa kembali nomor Anda."
      );
    } finally {
      setIsSavingWhatsApp(false);
    }
  };

  const handleSaveMinimumWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi minimal penarikan
    const amount = Number(minimumWithdrawal);
    if (!amount || amount < 10000) {
      console.error("Minimal penarikan harus minimal Rp 10.000.");
      return;
    }

    if (amount > 10000000) {
      console.error("Minimal penarikan tidak boleh lebih dari Rp 10.000.000.");
      return;
    }

    setIsSavingWithdrawal(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "minimumWithdrawal", value: amount }),
      });

      if (!response.ok) {
        let errorMessage = "Gagal memperbarui minimal penarikan.";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        console.error(errorMessage);
        return;
      }

      const data = await response.json();

    } catch (error) {
      console.error("Minimum withdrawal save error:", error);
      console.error(
        "Gagal memperbarui minimal penarikan. Silakan coba lagi."
      );
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
        ratesToSave.map((rate) =>
          fetch("/api/admin/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(rate),
          })
        )
      );

      // Check if any responses failed
      const failedResponses = responses.filter((response) => !response.ok);
      if (failedResponses.length > 0) {
        let errorMessage =
          "Gagal memperbarui satu atau lebih biaya pengiriman.";
        try {
          const errorData = await failedResponses[0].json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Server error: ${failedResponses[0].status} ${failedResponses[0].statusText}`;
        }
        console.error(errorMessage);
        return;
      }


    } catch (error) {
      console.error("Shipping rates save error:", error);
      console.error("Gagal memperbarui satu atau lebih biaya pengiriman.");
    } finally {
      setIsSavingRates(false);
    }
  };

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingRates((prev) => ({ ...prev, [name]: value }));
  };

  // Landing Page Settings Handlers
  const handleLandingPageChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setLandingPageSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type first
    if (!file.type.startsWith("image/")) {
      console.error("File harus berupa gambar (JPG, PNG, WebP, GIF)");
      e.target.value = ""; // Reset input
      return;
    }

    // Show file size info immediately
    const fileSizeKB = Math.round(file.size / 1024);
    const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
    const maxSizeKB = 2 * 1024; // 2MB
    const recommendedKB = 500; // 500KB

    // Client-side validation for max size
    if (file.size > maxSizeKB * 1024) {
      console.error(`Ukuran file terlalu besar: ${fileSizeMB}MB. Maksimal: 2MB`);
      e.target.value = ""; // Reset input
      return;
    }

    // Warning for large files
    if (fileSizeKB > recommendedKB) {

    }

    // Validate minimum size
    if (file.size < 1024) {
      console.error("Ukuran gambar terlalu kecil (minimal 1KB)");
      e.target.value = ""; // Reset input
      return;
    }

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(errorData.error || "Gagal mengupload gambar");
        return;
      }

      const data = await response.json();
      setLandingPageSettings((prev) => ({ ...prev, aboutImage: data.url }));

      // Show success with size info
      const sizeInfo = ` (${data.sizeKB}KB)`;


      // Reset file input
      e.target.value = "";
    } catch (error) {
      console.error("Image upload error:", error);
      console.error(
        "Terjadi kesalahan saat mengupload gambar. Silakan coba lagi."
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveLandingPage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingLandingPage(true);

    try {
      const response = await fetch("/api/admin/landing-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(landingPageSettings),
      });

      if (!response.ok) {
        let errorMessage = "Gagal memperbarui pengaturan landing page.";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        console.error(errorMessage);
        return;
      }

      const data = await response.json();

    } catch (error) {
      console.error("Landing page save error:", error);
      console.error("Gagal memperbarui pengaturan landing page.");
    } finally {
      setIsSavingLandingPage(false);
    }
  };



  return (
    <div className="min-h-screen bg-gray-50 py-4 px-3 sm:py-6 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center sm:text-left mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Pengaturan</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Kelola pengaturan umum untuk aplikasi Anda.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="h-20 sm:h-24 lg:h-28">
                <CardHeader>
                  <div className="h-4 sm:h-6 lg:h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-16 sm:h-18 lg:h-20 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">Umum</TabsTrigger>
              <TabsTrigger value="landing">Landing Page</TabsTrigger>
              <TabsTrigger value="send-notification">Kirim Notifikasi</TabsTrigger>
              <TabsTrigger value="notifications">Template Notifikasi</TabsTrigger>
            </TabsList>

            <TabsContent value="send-notification" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    Kirim Notifikasi Manual
                  </CardTitle>
                  <CardDescription>
                    Kirim notifikasi push manual ke pengguna
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PushNotificationSender />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="general" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Alamat Gudang</CardTitle>
                    <CardDescription>
                      Alamat ini akan digunakan sebagai titik asal untuk perhitungan
                      biaya pengiriman.
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
                        {isSavingAddress ? "Menyimpan..." : "Simpan Alamat"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Minimal Penarikan Dana</CardTitle>
                    <CardDescription>
                      Atur jumlah minimal yang bisa ditarik oleh affiliator dari
                      komisi mereka.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={handleSaveMinimumWithdrawal}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="minimum-withdrawal">
                          Minimal Penarikan (Rp)
                        </Label>
                        <div className="relative flex items-center">
                          <span className="absolute left-3 text-muted-foreground">
                            Rp
                          </span>
                          <Input
                            id="minimum-withdrawal"
                            type="number"
                            value={minimumWithdrawal}
                            onChange={(e) =>
                              setMinimumWithdrawal(Number(e.target.value))
                            }
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
                        {isSavingWithdrawal
                          ? "Menyimpan..."
                          : "Simpan Minimal Penarikan"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Nomor WhatsApp Admin</CardTitle>
                    <CardDescription>
                      Nomor WhatsApp ini akan digunakan untuk kontak admin di
                      seluruh aplikasi. Gunakan format 628xxxxxxxxxx.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSaveWhatsApp} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="admin-whatsapp">Nomor WhatsApp Admin</Label>
                        <div className="relative flex items-center">
                          <span className="absolute left-3 text-muted-foreground">
                            62
                          </span>
                          <Input
                            id="admin-whatsapp"
                            type="tel"
                            value={adminWhatsApp.replace(/^62/, "")}
                            onChange={(e) =>
                              setAdminWhatsApp(e.target.value.replace(/\D/g, ""))
                            }
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
                        {isSavingWhatsApp
                          ? "Menyimpan..."
                          : "Simpan Nomor WhatsApp"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Kategori Biaya Pengiriman</CardTitle>
                    <CardDescription>
                      Atur biaya berdasarkan jarak pengiriman. Biaya dihitung per
                      kilometer dalam Rupiah (IDR).
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSaveShippingRates} className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-6">
                        {/* Short Distance */}
                        <div className="space-y-2">
                          <Label htmlFor="short_rate">
                            Dalam Kota / Dekat (&lt; 20 km)
                          </Label>
                          <div className="relative flex items-center">
                            <span className="absolute left-3 text-muted-foreground">
                              IDR
                            </span>
                            <Input
                              id="short_rate"
                              name="short_rate"
                              type="number"
                              value={shippingRates.short_rate}
                              onChange={handleRateChange}
                              placeholder="1500"
                              className="pl-12"
                            />
                          </div>
                        </div>

                        {/* Medium Distance */}
                        <div className="space-y-2">
                          <Label htmlFor="medium_rate">
                            Antar Kota (20-150 km)
                          </Label>
                          <div className="relative flex items-center">
                            <span className="absolute left-3 text-muted-foreground">
                              IDR
                            </span>
                            <Input
                              id="medium_rate"
                              name="medium_rate"
                              type="number"
                              value={shippingRates.medium_rate}
                              onChange={handleRateChange}
                              placeholder="1200"
                              className="pl-12"
                            />
                          </div>
                        </div>

                        {/* Long Distance Per KM */}
                        <div className="space-y-2">
                          <Label htmlFor="long_rate">
                            Jarak Jauh (&gt; 150 km) - Biaya /km
                          </Label>
                          <div className="relative flex items-center">
                            <span className="absolute left-3 text-muted-foreground">
                              IDR
                            </span>
                            <Input
                              id="long_rate"
                              name="long_rate"
                              type="number"
                              value={shippingRates.long_rate}
                              onChange={handleRateChange}
                              placeholder="1000"
                              className="pl-12"
                            />
                          </div>
                        </div>

                        {/* Long Distance Flat */}
                        <div className="space-y-2">
                          <Label htmlFor="long_flat_rate">
                            Jarak Jauh (&gt; 150 km) - Biaya Flat
                          </Label>
                          <div className="relative flex items-center">
                            <span className="absolute left-3 text-muted-foreground">
                              IDR
                            </span>
                            <Input
                              id="long_flat_rate"
                              name="long_flat_rate"
                              type="number"
                              value={shippingRates.long_flat_rate}
                              onChange={handleRateChange}
                              placeholder="50000"
                              className="pl-12"
                            />
                          </div>
                        </div>
                      </div>
                      <Button type="submit" disabled={isSavingRates}>
                        {isSavingRates ? "Menyimpan..." : "Simpan Biaya Pengiriman"}
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
                          {/* Judul */}
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

                          {/* Deskripsi */}
                          <div className="space-y-2">
                            <Label htmlFor="aboutDescription">
                              Deskripsi Tentang Kami
                            </Label>
                            <Textarea
                              id="aboutDescription"
                              name="aboutDescription"
                              value={landingPageSettings.aboutDescription}
                              onChange={handleLandingPageChange}
                              placeholder="PE Skin Professional didirikan pada satu dekade yang lalu..."
                              rows={4}
                            />
                          </div>

                          {/* Gambar */}
                          <div className="space-y-4">
                            <Label>Gambar Tentang Kami</Label>

                            {/* Preview Image */}
                            {landingPageSettings.aboutImage && (
                              <div className="relative">
                                <div className="rounded-lg overflow-hidden border border-border">
                                  <img
                                    src={landingPageSettings.aboutImage}
                                    alt="Tentang Kami"
                                    className="w-full h-64 object-cover object-center"
                                    onError={(e) => {
                                      const target = e.currentTarget;
                                      target.style.display = "none";
                                      target.nextElementSibling?.classList.remove(
                                        "hidden"
                                      );
                                    }}
                                  />
                                  <div className="hidden h-64 bg-secondary/50 flex items-center justify-center">
                                    <div className="text-center">
                                      <Image className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                                      <p className="text-muted-foreground">
                                        Gambar tidak dapat dimuat
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-2 right-2"
                                  onClick={() => {
                                    setLandingPageSettings((prev) => ({
                                      ...prev,
                                      aboutImage: "",
                                    }));

                                  }}
                                >
                                  Hapus
                                </Button>
                              </div>
                            )}

                            {/* Upload Section */}
                            <div className="border-2 border-dashed border-border rounded-lg p-6">
                              {/* ICON + TEXT (CENTER) */}
                              <div className="flex flex-col items-center justify-center text-center min-h-[180px]">
                                <Image className="w-14 h-14 text-muted-foreground mb-4" />
                                <p className="text-sm text-muted-foreground">
                                  Upload gambar baru atau masukkan URL
                                </p>
                              </div>

                              {/* INPUT & BUTTON */}
                              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Input
                                  id="aboutImage"
                                  name="aboutImage"
                                  value={landingPageSettings.aboutImage}
                                  onChange={handleLandingPageChange}
                                  placeholder="https://example.com/image.jpg"
                                  className="font-mono text-xs sm:text-sm h-10 sm:h-12 w-full sm:max-w-sm"
                                />

                                <label
                                  htmlFor="file-input"
                                  className="cursor-pointer"
                                >
                                  <Button
                                    type="button"
                                    variant="outline"
                                    disabled={isUploadingImage}
                                    asChild
                                  >
                                    <span>
                                      {isUploadingImage
                                        ? "Mengupload..."
                                        : "Pilih File"}
                                    </span>
                                  </Button>
                                </label>

                                <input
                                  id="file-input"
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                  className="hidden"
                                />
                              </div>

                              {/* Loading */}
                              {isUploadingImage && (
                                <div className="flex items-center justify-center gap-3 py-6">
                                  <div className="flex space-x-1">
                                    <div className="w-3 h-3 bg-primary rounded-full animate-bounce" />
                                    <div
                                      className="w-3 h-3 bg-primary rounded-full animate-bounce"
                                      style={{ animationDelay: "0.1s" }}
                                    />
                                    <div
                                      className="w-3 h-3 bg-primary rounded-full animate-bounce"
                                      style={{ animationDelay: "0.2s" }}
                                    />
                                  </div>
                                  <span className="text-sm text-primary">
                                    Mengupload...
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Contact & Social Media */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">
                          Kontak & Media Sosial
                        </h3>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label
                              htmlFor="instagramUrl"
                              className="flex items-center gap-2"
                            >
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
                            <Label
                              htmlFor="tiktokUrl"
                              className="flex items-center gap-2"
                            >
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
                            <Label
                              htmlFor="shopeeUrl"
                              className="flex items-center gap-2"
                            >
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
                            <Label
                              htmlFor="websiteUrl"
                              className="flex items-center gap-2"
                            >
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
                            <Label
                              htmlFor="whatsappNumber"
                              className="flex items-center gap-2"
                            >
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
                            <Label
                              htmlFor="email"
                              className="flex items-center gap-2"
                            >
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
                        <h3 className="text-lg font-semibold">
                          Footer Description
                        </h3>
                        <div className="space-y-2">
                          <Label htmlFor="footerDescription">
                            Deskripsi Footer
                          </Label>
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

                      <Button
                        type="submit"
                        disabled={isSavingLandingPage}
                        className="w-full md:w-auto"
                      >
                        {isSavingLandingPage
                          ? "Menyimpan..."
                          : "Simpan Pengaturan Landing Page"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="landing" className="space-y-6">
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
                        {/* Judul */}
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

                        {/* Deskripsi */}
                        <div className="space-y-2">
                          <Label htmlFor="aboutDescription">
                            Deskripsi Tentang Kami
                          </Label>
                          <Textarea
                            id="aboutDescription"
                            name="aboutDescription"
                            value={landingPageSettings.aboutDescription}
                            onChange={handleLandingPageChange}
                            placeholder="PE Skin Professional didirikan pada satu dekade yang lalu..."
                            rows={4}
                          />
                        </div>

                        {/* Gambar */}
                        <div className="space-y-4">
                          <Label>Gambar Tentang Kami</Label>

                          {/* Preview Image */}
                          {landingPageSettings.aboutImage && (
                            <div className="relative">
                              <div className="rounded-lg overflow-hidden border border-border">
                                <img
                                  src={landingPageSettings.aboutImage}
                                  alt="Tentang Kami"
                                  className="w-full h-64 object-cover object-center"
                                  onError={(e) => {
                                    const target = e.currentTarget;
                                    target.style.display = "none";
                                    target.nextElementSibling?.classList.remove(
                                      "hidden"
                                    );
                                  }}
                                />
                                <div className="hidden h-64 bg-secondary/50 flex items-center justify-center">
                                  <div className="text-center">
                                    <Image className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                                    <p className="text-muted-foreground">
                                      Gambar tidak dapat dimuat
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() => {
                                  setLandingPageSettings((prev) => ({
                                    ...prev,
                                    aboutImage: "",
                                  }));

                                }}
                              >
                                Hapus
                              </Button>
                            </div>
                          )}

                          {/* Upload Section */}
                          <div className="border-2 border-dashed border-border rounded-lg p-6">
                            {/* ICON + TEXT (CENTER) */}
                            <div className="flex flex-col items-center justify-center text-center min-h-[180px]">
                              <Image className="w-14 h-14 text-muted-foreground mb-4" />
                              <p className="text-sm text-muted-foreground">
                                Upload gambar baru atau masukkan URL
                              </p>
                            </div>

                            {/* INPUT & BUTTON */}
                            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                              <Input
                                id="aboutImage"
                                name="aboutImage"
                                value={landingPageSettings.aboutImage}
                                onChange={handleLandingPageChange}
                                placeholder="https://example.com/image.jpg"
                                className="font-mono text-xs sm:text-sm h-10 sm:h-12 w-full sm:max-w-sm"
                              />

                              <label
                                htmlFor="file-input"
                                className="cursor-pointer"
                              >
                                <Button
                                  type="button"
                                  variant="outline"
                                  disabled={isUploadingImage}
                                  asChild
                                >
                                  <span>
                                    {isUploadingImage
                                      ? "Mengupload..."
                                      : "Pilih File"}
                                  </span>
                                </Button>
                              </label>

                              <input
                                id="file-input"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                              />
                            </div>

                            {/* Loading */}
                            {isUploadingImage && (
                              <div className="flex items-center justify-center gap-3 py-6">
                                <div className="flex space-x-1">
                                  <div className="w-3 h-3 bg-primary rounded-full animate-bounce" />
                                  <div
                                    className="w-3 h-3 bg-primary rounded-full animate-bounce"
                                    style={{ animationDelay: "0.1s" }}
                                  />
                                  <div
                                    className="w-3 h-3 bg-primary rounded-full animate-bounce"
                                    style={{ animationDelay: "0.2s" }}
                                  />
                                </div>
                                <span className="text-sm text-primary">
                                  Mengupload...
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact & Social Media */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">
                        Kontak & Media Sosial
                      </h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="instagramUrl"
                            className="flex items-center gap-2"
                          >
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
                          <Label
                            htmlFor="tiktokUrl"
                            className="flex items-center gap-2"
                          >
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
                          <Label
                            htmlFor="shopeeUrl"
                            className="flex items-center gap-2"
                          >
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
                          <Label
                            htmlFor="websiteUrl"
                            className="flex items-center gap-2"
                          >
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
                          <Label
                            htmlFor="whatsappNumber"
                            className="flex items-center gap-2"
                          >
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
                          <Label
                            htmlFor="email"
                            className="flex items-center gap-2"
                          >
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
                      <h3 className="text-lg font-semibold">
                        Footer Description
                      </h3>
                      <div className="space-y-2">
                        <Label htmlFor="footerDescription">
                          Deskripsi Footer
                        </Label>
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

                    <Button
                      type="submit"
                      disabled={isSavingLandingPage}
                      className="w-full md:w-auto"
                    >
                      {isSavingLandingPage
                        ? "Menyimpan..."
                        : "Simpan Pengaturan Landing Page"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Pengaturan Notifikasi Otomatis
                  </CardTitle>
                  <CardDescription>
                    Atur template dan pengaturan untuk notifikasi otomatis sistem
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveNotificationSettings} className="space-y-8">
                    {/* Toggle Settings */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Pengaturan Umum</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="enableAdminNotifications">Notifikasi Admin</Label>
                            <p className="text-sm text-muted-foreground">Aktifkan notifikasi untuk admin</p>
                          </div>
                          <Switch
                            id="enableAdminNotifications"
                            checked={notificationSettings.enableAdminNotifications}
                            onCheckedChange={(checked) =>
                              setNotificationSettings(prev => ({ ...prev, enableAdminNotifications: checked }))
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="enableAffiliateNotifications">Notifikasi Affiliator</Label>
                            <p className="text-sm text-muted-foreground">Aktifkan notifikasi untuk affiliator</p>
                          </div>
                          <Switch
                            id="enableAffiliateNotifications"
                            checked={notificationSettings.enableAffiliateNotifications}
                            onCheckedChange={(checked) =>
                              setNotificationSettings(prev => ({ ...prev, enableAffiliateNotifications: checked }))
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="enableEmailNotifications">Notifikasi Email</Label>
                            <p className="text-sm text-muted-foreground">Kirim notifikasi via email</p>
                          </div>
                          <Switch
                            id="enableEmailNotifications"
                            checked={notificationSettings.enableEmailNotifications}
                            onCheckedChange={(checked) =>
                              setNotificationSettings(prev => ({ ...prev, enableEmailNotifications: checked }))
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="enablePushNotifications">Notifikasi Push</Label>
                            <p className="text-sm text-muted-foreground">Kirim notifikasi push browser</p>
                          </div>
                          <Switch
                            id="enablePushNotifications"
                            checked={notificationSettings.enablePushNotifications}
                            onCheckedChange={(checked) =>
                              setNotificationSettings(prev => ({ ...prev, enablePushNotifications: checked }))
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Admin Notification Templates */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Template Notifikasi Admin</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="newAffiliateTitle">Judul - Affiliator Baru</Label>
                          <Input
                            id="newAffiliateTitle"
                            value={notificationSettings.newAffiliateTitle}
                            onChange={(e) =>
                              setNotificationSettings(prev => ({ ...prev, newAffiliateTitle: e.target.value }))
                            }
                            placeholder="👋 Affiliator Baru Mendaftar!"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newAffiliateMessage">Pesan - Affiliator Baru</Label>
                          <Input
                            id="newAffiliateMessage"
                            value={notificationSettings.newAffiliateMessage}
                            onChange={(e) =>
                              setNotificationSettings(prev => ({ ...prev, newAffiliateMessage: e.target.value }))
                            }
                            placeholder="{name} ({email}) baru saja mendaftar sebagai affiliator."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newOrderTitle">Judul - Pesanan Baru</Label>
                          <Input
                            id="newOrderTitle"
                            value={notificationSettings.newOrderTitle}
                            onChange={(e) =>
                              setNotificationSettings(prev => ({ ...prev, newOrderTitle: e.target.value }))
                            }
                            placeholder="🛒 Pesanan Baru!"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newOrderMessage">Pesan - Pesanan Baru</Label>
                          <Input
                            id="newOrderMessage"
                            value={notificationSettings.newOrderMessage}
                            onChange={(e) =>
                              setNotificationSettings(prev => ({ ...prev, newOrderMessage: e.target.value }))
                            }
                            placeholder="Pesanan #{orderId} dari {customerName} dengan total {amount}"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="withdrawalRequestTitle">Judul - Permohonan Penarikan</Label>
                          <Input
                            id="withdrawalRequestTitle"
                            value={notificationSettings.withdrawalRequestTitle}
                            onChange={(e) =>
                              setNotificationSettings(prev => ({ ...prev, withdrawalRequestTitle: e.target.value }))
                            }
                            placeholder="💰 Permohonan Penarikan Dana"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="withdrawalRequestMessage">Pesan - Permohonan Penarikan</Label>
                          <Input
                            id="withdrawalRequestMessage"
                            value={notificationSettings.withdrawalRequestMessage}
                            onChange={(e) =>
                              setNotificationSettings(prev => ({ ...prev, withdrawalRequestMessage: e.target.value }))
                            }
                            placeholder="{name} mengajukan penarikan sebesar {amount}"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Affiliator Notification Templates */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Template Notifikasi Affiliator</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="newOrderAffiliateTitle">Judul - Pesanan Baru</Label>
                          <Input
                            id="newOrderAffiliateTitle"
                            value={notificationSettings.newOrderAffiliateTitle}
                            onChange={(e) =>
                              setNotificationSettings(prev => ({ ...prev, newOrderAffiliateTitle: e.target.value }))
                            }
                            placeholder="🛒 Pesanan Baru!"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newOrderAffiliateMessage">Pesan - Pesanan Baru</Label>
                          <Input
                            id="newOrderAffiliateMessage"
                            value={notificationSettings.newOrderAffiliateMessage}
                            onChange={(e) =>
                              setNotificationSettings(prev => ({ ...prev, newOrderAffiliateMessage: e.target.value }))
                            }
                            placeholder="Pesanan #{orderId} dari {customerName}. Komisi: {commission}"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="orderShippedTitle">Judul - Pesanan Dikirim</Label>
                          <Input
                            id="orderShippedTitle"
                            value={notificationSettings.orderShippedTitle}
                            onChange={(e) =>
                              setNotificationSettings(prev => ({ ...prev, orderShippedTitle: e.target.value }))
                            }
                            placeholder="📦 Pesanan Dikirim"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="orderShippedMessage">Pesan - Pesanan Dikirim</Label>
                          <Input
                            id="orderShippedMessage"
                            value={notificationSettings.orderShippedMessage}
                            onChange={(e) =>
                              setNotificationSettings(prev => ({ ...prev, orderShippedMessage: e.target.value }))
                            }
                            placeholder="Pesanan #{orderId} untuk {customerName} telah dikirim"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="orderCompletedTitle">Judul - Pesanan Selesai</Label>
                          <Input
                            id="orderCompletedTitle"
                            value={notificationSettings.orderCompletedTitle}
                            onChange={(e) =>
                              setNotificationSettings(prev => ({ ...prev, orderCompletedTitle: e.target.value }))
                            }
                            placeholder="✅ Pesanan Selesai"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="orderCompletedMessage">Pesan - Pesanan Selesai</Label>
                          <Input
                            id="orderCompletedMessage"
                            value={notificationSettings.orderCompletedMessage}
                            onChange={(e) =>
                              setNotificationSettings(prev => ({ ...prev, orderCompletedMessage: e.target.value }))
                            }
                            placeholder="Pesanan #{orderId} untuk {customerName} telah selesai. Komisi telah ditambahkan!"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="commissionEarnedTitle">Judul - Komisi Diterima</Label>
                          <Input
                            id="commissionEarnedTitle"
                            value={notificationSettings.commissionEarnedTitle}
                            onChange={(e) =>
                              setNotificationSettings(prev => ({ ...prev, commissionEarnedTitle: e.target.value }))
                            }
                            placeholder="💵 Pemasukan Komisi!"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="commissionEarnedMessage">Pesan - Komisi Diterima</Label>
                          <Input
                            id="commissionEarnedMessage"
                            value={notificationSettings.commissionEarnedMessage}
                            onChange={(e) =>
                              setNotificationSettings(prev => ({ ...prev, commissionEarnedMessage: e.target.value }))
                            }
                            placeholder="Komisi sebesar {amount} dari pesanan #{orderId} telah ditambahkan ke akun Anda"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="balanceUpdatedTitle">Judul - Saldo Diperbarui</Label>
                          <Input
                            id="balanceUpdatedTitle"
                            value={notificationSettings.balanceUpdatedTitle}
                            onChange={(e) =>
                              setNotificationSettings(prev => ({ ...prev, balanceUpdatedTitle: e.target.value }))
                            }
                            placeholder="💰 Saldo Dapat Ditarik Diperbarui"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="balanceUpdatedMessage">Pesan - Saldo Diperbarui</Label>
                          <Input
                            id="balanceUpdatedMessage"
                            value={notificationSettings.balanceUpdatedMessage}
                            onChange={(e) =>
                              setNotificationSettings(prev => ({ ...prev, balanceUpdatedMessage: e.target.value }))
                            }
                            placeholder="Saldo yang dapat ditarik: {availableBalance}"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="withdrawalApprovedTitle">Judul - Penarikan Disetujui</Label>
                          <Input
                            id="withdrawalApprovedTitle"
                            value={notificationSettings.withdrawalApprovedTitle}
                            onChange={(e) =>
                              setNotificationSettings(prev => ({ ...prev, withdrawalApprovedTitle: e.target.value }))
                            }
                            placeholder="✅ Penarikan Disetujui"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="withdrawalApprovedMessage">Pesan - Penarikan Disetujui</Label>
                          <Input
                            id="withdrawalApprovedMessage"
                            value={notificationSettings.withdrawalApprovedMessage}
                            onChange={(e) =>
                              setNotificationSettings(prev => ({ ...prev, withdrawalApprovedMessage: e.target.value }))
                            }
                            placeholder="Penarikan sebesar {amount} telah disetujui pada {processedAt}"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="withdrawalRejectedTitle">Judul - Penarikan Ditolak</Label>
                          <Input
                            id="withdrawalRejectedTitle"
                            value={notificationSettings.withdrawalRejectedTitle}
                            onChange={(e) =>
                              setNotificationSettings(prev => ({ ...prev, withdrawalRejectedTitle: e.target.value }))
                            }
                            placeholder="❌ Penarikan Ditolak"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="withdrawalRejectedMessage">Pesan - Penarikan Ditolak</Label>
                          <Input
                            id="withdrawalRejectedMessage"
                            value={notificationSettings.withdrawalRejectedMessage}
                            onChange={(e) =>
                              setNotificationSettings(prev => ({ ...prev, withdrawalRejectedMessage: e.target.value }))
                            }
                            placeholder="Penarikan sebesar {amount} ditolak. Alasan: {reason}"
                          />
                        </div>
                      </div>
                    </div>

                    <Button type="submit" disabled={isSavingNotificationSettings}>
                      {isSavingNotificationSettings ? "Menyimpan..." : "Simpan Pengaturan Notifikasi"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
