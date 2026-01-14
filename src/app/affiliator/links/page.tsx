"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Plus, Copy, ExternalLink, Link as LinkIcon, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { AffiliateLink, Product } from '@/types';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function AffiliatorLinks() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [allProductsForModal, setAllProductsForModal] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');

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
        setLinks(linksData);
        setAllProductsForModal(productsData);
      } else {
        toast.error('Gagal memuat data.');
      }
    } catch (error) {
      console.error('Terjadi kesalahan saat mengambil data awal:', error);
      toast.error('Terjadi kesalahan saat memuat data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, isAuthenticated, authLoading]);

  // Get products that don't have links yet for the modal
  const linkedProductIds = new Set(links.map(l => l.productId));
  const availableProducts = allProductsForModal.filter(p => !linkedProductIds.has(p.id.toString()));

  const getProductById = (productId: string) => allProductsForModal.find(p => p.id?.toString() === productId);

  const createLink = async () => {
    if (!selectedProductId || !user) return;

    try {
      const response = await fetch('/api/affiliator/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          affiliatorId: user.id,
          productId: selectedProductId,
          isActive: true,
        }),
      });

      if (response.ok) {
        await fetchData(); // Re-fetch the data to ensure UI is updated
        setIsDialogOpen(false);
        setSelectedProductId('');
        toast.success('Link afiliasi berhasil dibuat!');
      } else {
        const errorData = await response.json();
        toast.error(`Gagal membuat link: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Gagal membuat link:', error);
      toast.error('Terjadi kesalahan saat membuat link.');
    }
  };

  const deleteLink = async (linkId: string) => {
    try {
      const response = await fetch(`/api/affiliator/links/${linkId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setLinks(prev => prev.filter(l => l.id !== linkId));
        toast.success('Link berhasil dihapus');
      } else {
        toast.error('Gagal menghapus link.');
      }
    } catch (error) {
      console.error('Gagal menghapus link:', error);
      toast.error('Terjadi kesalahan saat menghapus link.');
    }
  };

  const copyLink = (code: string, productSlug: string) => {
    const fullUrl = `${window.location.origin}/checkout/${productSlug}?ref=${code}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success('Link berhasil disalin ke clipboard!');
  };

  const toggleActive = (linkId: string) => {
    setLinks(prev => prev.map(l => 
      l.id === linkId ? { ...l, isActive: !l.isActive } : l
    ));
  };

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-shrink-0">
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">Link Afiliasi Saya</h1>
            <p className="text-muted-foreground text-sm">Buat dan kelola link afiliasi Anda</p>
          </div>
        </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" disabled={availableProducts.length === 0}>
                <Plus className="w-4 h-4 mr-2" />
                Buat Link
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display">Buat Link Afiliasi</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Pilih Produk</Label>
                  <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih produk" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProducts.map(product => (
                        <SelectItem key={product.id} value={product.id}>
                          <div className="flex items-center justify-between w-full">
                            {product.imageUrl && (
                              <Image 
                                src={product.imageUrl} 
                                alt={product.name} 
                                width={24} 
                                height={24} 
                                className="rounded-md mr-2 object-contain"
                              />
                            )}
                            <span>{product.name}</span>
                            <span className="text-muted-foreground ml-2">
                  {product.price.toLocaleString('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedProductId && (
                  <div className="p-4 rounded-lg bg-secondary">
                    <p className="text-sm text-muted-foreground">Komisi:</p>
                    <p className="font-semibold text-primary">
                      {(() => {
                        const product = getProductById(selectedProductId);
                        if (!product) return '';
                        return product.commissionType === 'percentage' 
                          ? `${product.commissionValue}% per penjualan`
                          : `${product.commissionValue.toLocaleString('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              })} per penjualan`;
                      })()}
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button onClick={createLink} disabled={!selectedProductId}>
                    Buat Link
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

        {/* Links List */}
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
        ) : (
          <div className="grid gap-4">
            {links.map((link, index) => {
              const product = link.product; // Use the embedded product object
              if (!product) return null;
              
              const fullUrl = `${window.location.origin}/checkout/${product.slug}?ref=${user.referralCode}`;
              
              return (
                <motion.div
                  key={link.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="shadow-card hover:shadow-card-hover transition-all duration-300">
                    <CardContent className="p-5">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {product.imageUrl && (
                              <Image 
                                src={product.imageUrl} 
                                alt={product.name} 
                                width={40} 
                                height={40} 
                                className="rounded-md object-contain"
                              />
                            )}
                            <h3 className="font-semibold text-foreground">{product.name}</h3>
                            <Badge 
                              variant={link.isActive ? 'default' : 'secondary'}
                              className={`cursor-pointer ${link.isActive ? 'bg-success text-success-foreground' : ''}`}
                              onClick={() => toggleActive(link.id)}
                            >
                              {link.isActive ? 'Aktif' : 'Tidak Aktif'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary text-sm font-mono">
                            <LinkIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="truncate text-muted-foreground">{fullUrl}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                            <span>Kode: <code className="text-primary font-semibold">{user?.referralCode}</code></span>
                            <span>•</span>
                            <span>
                              Komisi: {product.commissionType === 'percentage' 
                                ? `${product.commissionValue}%` 
                                : `${product.commissionValue.toLocaleString('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})}`}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => user?.referralCode && copyLink(user.referralCode, product.slug)}
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            Salin
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.open(fullUrl, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => deleteLink(link.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {!loading && links.length === 0 && (
          <Card className="shadow-card">
            <CardContent className="py-12 text-center">
              <LinkIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Belum ada link afiliasi</h3>
              <p className="text-muted-foreground mb-4">
                Buat link afiliasi pertama Anda untuk mulai mendapatkan komisi
              </p>
              <Button variant="hero" onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Buat Link Pertama Anda
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tips Card */}
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg font-display">💡 Tips Sukses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Bagikan link Anda di platform media sosial untuk jangkauan maksimal</p>
            <p>• Sertakan link afiliasi Anda di buletin email</p>
            <p>• Buat konten seputar produk yang Anda promosikan</p>
            <p>• Lacak link mana yang berkinerja terbaik dan fokus pada produk tersebut</p>
          </CardContent>
        </Card>
      </div>
  );
}