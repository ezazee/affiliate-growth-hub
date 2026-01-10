"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image'; // Import Image component
import { motion } from 'framer-motion';
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
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');

  useEffect(() => {
    const fetchInitialData = async () => {
      console.log('AffiliatorLinks: authLoading:', authLoading, 'isAuthenticated:', isAuthenticated, 'user:', user);

      if (authLoading) {
        // AuthContext is still loading the user state from localStorage
        setLoading(true); // Keep local loading state true
        return;
      }

      if (!isAuthenticated || !user?.id) {
        // User is not authenticated or user.id is missing after auth loading is complete
        setLoading(false);
        console.log('AffiliatorLinks: User not authenticated or ID missing, stopping data fetch.');
        // Optionally, redirect to login page if not authenticated and not already handled by AuthProvider
        // router.push('/login'); 
        return;
      }

      try {
        console.log('AffiliatorLinks: Fetching links and products...');
        const [linksResponse, productsResponse] = await Promise.all([
          fetch(`/api/affiliator/links?affiliatorId=${user.id}`, { cache: 'no-store' }),
          fetch('/api/affiliator/products'),
        ]);
        console.log('AffiliatorLinks: Products response status:', productsResponse.status, productsResponse.statusText);


        if (linksResponse.ok && productsResponse.ok) {
          const linksData = await linksResponse.json();
          console.log('AffiliatorLinks: Fetched links data:', linksData);
          
          const productsData = await productsResponse.json();
          console.log('AffiliatorLinks: Fetched products data:', productsData);

          setLinks(linksData);
          setAllProducts(productsData);
        } else {
          console.error("AffiliatorLinks: Failed to load data:", {
            linksStatus: linksResponse.status,
            linksText: linksResponse.statusText,
            productsStatus: productsResponse.status,
            productsText: productsResponse.statusText,
          });
          toast.error('Failed to load data.');
        }
      } catch (error) {
        console.error('AffiliatorLinks: An error occurred while fetching initial data:', error);
        toast.error('An error occurred while loading data.');
      } finally {
        setLoading(false);
        // console.log('AffiliatorLinks: Data fetching finished.');
      }
    };
    fetchInitialData();
  }, [user, isAuthenticated, authLoading]); // Dependencies for re-running effect

  const getProductById = (productId: string) => allProducts.find(p => p._id?.toString() === productId);

  // Get products that don't have links yet
  const availableProducts = allProducts;

  const createLink = async () => {
    if (!selectedProductId || !user || !user.referralCode) return;

    try {
      const response = await fetch('/api/affiliator/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          affiliatorId: user.id,
          productId: selectedProductId,
          code: user.referralCode,
          isActive: true,
        }),
      });

      if (response.ok) {
        const createdLink = await response.json();
        setLinks(prev => [...prev, createdLink]);
        setIsDialogOpen(false);
        setSelectedProductId('');
        toast.success('Affiliate link created!');
      } else {
        toast.error('Failed to create affiliate link.');
      }
    } catch (error) {
      console.error('Failed to create link:', error);
      toast.error('An error occurred while creating link.');
    }
  };

  const deleteLink = async (linkId: string) => {
    try {
      const response = await fetch(`/api/affiliator/links/${linkId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setLinks(prev => prev.filter(l => l.id !== linkId));
        toast.success('Link deleted');
      } else {
        toast.error('Failed to delete link.');
      }
    } catch (error) {
      console.error('Failed to delete link:', error);
      toast.error('An error occurred while deleting link.');
    }
  };

  const copyLink = (code: string, productSlug: string) => {
    const fullUrl = `${window.location.origin}/checkout/${productSlug}?ref=${code}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success('Link copied to clipboard!');
  };

  const toggleActive = (linkId: string) => {
    // console.log('Frontend Toggle Active Link ID:', linkId);
    setLinks(prev => prev.map(l => 
      l.id === linkId ? { ...l, isActive: !l.isActive } : l
    ));
  };

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">My Affiliate Links</h1>
            <p className="text-muted-foreground">Create and manage your affiliate links</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" disabled={availableProducts.length === 0}>
                <Plus className="w-4 h-4 mr-2" />
                Create Link
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display">Create Affiliate Link</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Select Product</Label>
                  <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProducts.map(product => (
                        <SelectItem key={product._id?.toString()} value={product._id?.toString()}>
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
                    <p className="text-sm text-muted-foreground">Commission:</p>
                    <p className="font-semibold text-primary">
                      {(() => {
                        const product = getProductById(selectedProductId);
                        if (!product) return '';
                        return product.commissionType === 'percentage' 
                          ? `${product.commissionValue}% per sale`
                          : `${product.commissionValue.toLocaleString('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              })} per sale`;
                      })()}
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createLink} disabled={!selectedProductId}>
                    Generate Link
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

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
              const product = getProductById(link.productId);
              if (!product) return null;
              
              const fullUrl = `${window.location.origin}/checkout/${product.slug}?ref=${link.code}`;
              
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
                          <div className="flex items-center gap-3 mb-2"> {/* New div for image and product name */}
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
                              {link.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary text-sm font-mono">
                            <LinkIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="truncate text-muted-foreground">{fullUrl}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                            <span>Code: <code className="text-primary font-semibold">{link.code}</code></span>
                            <span>•</span>
                            <span>
                              Commission: {product.commissionType === 'percentage' 
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
                            onClick={() => copyLink(link.code, product.slug)}
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            Copy
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
              <h3 className="font-semibold text-foreground mb-2">No affiliate links yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first affiliate link to start earning commissions
              </p>
              <Button variant="hero" onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Link
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tips Card */}
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg font-display">💡 Tips for Success</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Share your links on social media platforms for maximum reach</p>
            <p>• Include your affiliate link in email newsletters</p>
            <p>• Create content around the products you're promoting</p>
            <p>• Track which links perform best and focus on those products</p>
          </CardContent>
        </Card>
      </div>
  );
}
