"use client"

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Copy, ExternalLink, Link as LinkIcon, Trash2, Clock, XCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

import { useAuth } from '@/contexts/AuthContext';
import { AffiliateLink, Product } from '@/types';
import { toast } from '@/hooks/use-toast';


export default function AffiliatorLinks() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [allProductsForModal, setAllProductsForModal] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchData = async () => {
    if (authLoading || !isAuthenticated || !user?.id) {
      if (!authLoading) setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [linksResponse, productsResponse] = await Promise.all([
        fetch(`/api/affiliator/links?affiliatorId=${user.id}`, { cache: 'no-store' }),
        fetch('/api/affiliator/products'),
      ]);

      if (linksResponse.ok && productsResponse.ok) {
        const linksData = await linksResponse.json();
        const productsData = await productsResponse.json();

        // Handle different response formats
        const linksArray = Array.isArray(linksData) ? linksData : (linksData.links || []);
        const productsArray = Array.isArray(productsData) ? productsData : (productsData.products || []);

        setLinks(linksArray);
        setAllProductsForModal(productsArray);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      console.error('Gagal mengambil data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAuthenticated, authLoading, user?.id]);

  const handleCreateLinks = async () => {
    if (selectedProducts.length === 0) {
      console.error("Pilih minimal satu produk");
      return;
    }

    setSubmitting(true);
    try {
      const promises = selectedProducts.map(productId =>
        fetch("/api/affiliator/links", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            affiliatorId: user?.id,
            productId: productId,
            isActive: true
          })
        })
      );

      const responses = await Promise.all(promises);
      const results = await Promise.all(responses.map(res => res.json()));
      
      const successful = results.filter(result => !result.error).length;
      const failed = results.length - successful;

      if (successful > 0) {
        toast.success(`Berhasil membuat ${successful} link afiliasi${failed > 0 ? ` (${failed} gagal)` : ''}`);
        setIsDialogOpen(false);
        setSelectedProducts([]);
        fetchData();
      } else {
        toast.error("Gagal membuat link afiliasi");
      }
    } catch (error) {
      console.error("Error creating links:", error);
      toast.error("Terjadi kesalahan saat membuat link");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyLink = (link: AffiliateLink) => {
    // Generate affiliate link with user referralCode as ref parameter
    const refCode = user?.referralCode;
    const affiliateUrl = `${window.location.origin}/checkout/${link.product?.slug || link.productId}?ref=${refCode}`;
    navigator.clipboard.writeText(affiliateUrl);
    setCopiedId(link.id);
    toast.success("Link afiliasi berhasil disalin!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteLink = async (linkId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus link ini?")) return;

    try {
      const response = await fetch(`/api/affiliator/links/${linkId}`, {
        method: "DELETE"
      });

      if (response.ok) {
        toast.success("Link berhasil dihapus");
        fetchData();
      } else {
        const data = await response.json();
        toast.error(data.error || "Gagal menghapus link");
      }
    } catch (error) {
      console.error("Error deleting link:", error);
      toast.error("Terjadi kesalahan saat menghapus link");
    }
  };



  const filteredLinks = links.filter(link =>
    link.product?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableProducts = allProductsForModal.filter(product =>
    !links.some(link => link.productId === product.id)
  );

  const renderStatusAlert = () => {
    if (!user) return null;

    if (user.status === 'pending') {
      return (
        <div className="mb-6 p-4 border border-amber-200 bg-amber-50 rounded-lg">
          <div className="text-amber-800">
            Akun Anda menunggu persetujuan dari admin. Anda dapat membuat link afiliasi tetapi tidak dapat dibagikan sampai disetujui.
          </div>
        </div>
      );
    }

    if (user.status === 'rejected') {
      return (
        <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-lg">
          <div className="text-red-800">
            Akun Anda ditolak. Silakan hubungi admin untuk informasi lebih lanjut.
          </div>
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Anda harus login terlebih dahulu</h2>
          <Button onClick={() => window.location.href = '/login'}>
            Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-3 sm:py-8 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Link Afiliasi Saya</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Kelola link afiliasi produk Anda
            </p>
          </div>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Buat Link Baru
          </Button>
        </div>

        {/* Status Alert */}
        {renderStatusAlert()}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Input
              placeholder="Cari berdasarkan nama produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredLinks.map((link) => (
            <motion.div
              key={link.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2">
                      {link.product?.name || `Product ${link.productId}`}
                    </CardTitle>
                    <Badge 
                      variant={link.isActive ? "default" : "secondary"}
                      className="shrink-0"
                    >
                      {link.isActive ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Harga:</span>
                      <span className="font-medium">
                        Rp {link.product?.price.toLocaleString('id-ID') || '0'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Komisi:</span>
                      <span className="font-medium text-green-600">
                        {link.product?.commissionType === 'percentage' 
                          ? `${link.product.commissionValue}%`
                          : `Rp ${link.product?.commissionValue.toLocaleString('id-ID') || '0'}`
                        }
                      </span>
                    </div>
                    {link.clicks !== undefined && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Klik:</span>
                        <span className="font-medium">{link.clicks}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Input
                      value={`${window.location.origin}/checkout/${link.product?.slug || link.productId}?ref=${user?.referralCode}`}
                      readOnly
                      className="text-xs flex-1"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyLink(link)}
                      className="flex-shrink-0"
                    >
                      {copiedId === link.id ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  <div className="flex gap-2 sm:gap-3">
                    <Button
                      size="default"
                      variant="outline"
                      onClick={() => window.open(`/checkout/${link.product?.slug || link.productId}?ref=${user?.referralCode}`, '_blank')}
                      className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2 text-sm sm:text-base h-10 sm:h-11 min-w-[100px] sm:min-w-[120px]"
                    >
                      <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="hidden sm:inline ml-2">View Link</span>
                    </Button>
                    <Button
                      size="default"
                      variant="outline"
                      onClick={() => handleDeleteLink(link.id!)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2 text-sm sm:text-base h-10 sm:h-11 min-w-[100px] sm:min-w-[120px]"
                    >
                      <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="hidden sm:inline ml-2">Hapus</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredLinks.length === 0 && (
          <div className="text-center py-12">
            <LinkIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Tidak ada link yang ditemukan' : 'Belum ada link afiliasi'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Coba ubah kata kunci pencarian Anda' 
                : 'Buat link afiliasi pertama Anda untuk mulai berjualan'
              }
            </p>
            {!searchTerm && (
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Buat Link Baru
              </Button>
            )}
          </div>
        )}

        {/* Create Modal */}
        {isDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-4 sm:p-6 border-b">
                <h2 className="text-xl font-bold">Buat Link Afiliasi Baru</h2>
                <p className="text-gray-600 mt-1">Pilih produk yang ingin Anda promosikan</p>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                {availableProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">
                      Semua produk sudah memiliki link afiliasi
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {availableProducts.map((product) => {
                      const isSelected = selectedProducts.includes(product.id);
                      return (
                        <div 
                          key={product.id}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                            } else {
                              setSelectedProducts([...selectedProducts, product.id]);
                            }
                          }}
                          className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                            isSelected 
                              ? 'bg-blue-50 border-blue-300 hover:bg-blue-100' 
                              : 'hover:bg-gray-50 border-gray-200'
                          }`}
                        >
                          <Checkbox
                            id={`product-${product.id}`}
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedProducts([...selectedProducts, product.id]);
                              } else {
                                setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex-1 select-none">
                            <Label 
                              htmlFor={`product-${product.id}`} 
                              className="text-sm font-medium cursor-pointer"
                            >
                              {product.name}
                            </Label>
                            <div className="flex items-center space-x-4 mt-1 text-xs text-gray-600">
                              <span>Harga: Rp {product.price.toLocaleString('id-ID')}</span>
                              <span className="text-green-600 font-medium">
                                Komisi: {product.commissionType === 'percentage' 
                                  ? `${product.commissionValue}%`
                                  : `Rp ${product.commissionValue.toLocaleString('id-ID')}`
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="p-4 sm:p-6 border-t flex flex-col sm:flex-row-reverse gap-3">
                <Button
                  onClick={handleCreateLinks}
                  disabled={submitting || selectedProducts.length === 0}
                  className="w-full sm:w-auto"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Membuat Link...
                    </>
                  ) : (
                    `Buat ${selectedProducts.length} Link`
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setSelectedProducts([]);
                  }}
                  className="w-full sm:w-auto"
                >
                  Batal
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}