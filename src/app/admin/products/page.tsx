"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Package, Search, Image as ImageIcon, Upload, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Product, CommissionType } from '@/types';
import { getAuthHeaders } from '@/lib/api';

import { Skeleton } from '@/components/ui/skeleton';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    price: '',
    description: '',
    commissionType: 'percentage' as CommissionType,
    commissionValue: '',
    imageUrl: '', // Added imageUrl to formData
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/products`, {
          headers: getAuthHeaders(),
        });
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
        console.error('Failed to load products.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Effect for image preview
  useEffect(() => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setImagePreview(editingProduct?.imageUrl || null);
    }
  }, [selectedFile, editingProduct]);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      price: '',
      description: '',
      commissionType: 'percentage',
      commissionValue: '',
      imageUrl: '',
    });
    setEditingProduct(null);
    setSelectedFile(null);
    setImagePreview(null);
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        slug: product.slug,
        price: String(product.price),
        description: product.description || '',
        commissionType: product.commissionType,
        commissionValue: String(product.commissionValue),
        imageUrl: product.imageUrl || '', // Set existing imageUrl
      });
      setImagePreview(product.imageUrl || null); // Set preview for existing image
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      setImagePreview(editingProduct?.imageUrl || null);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('File harus berupa gambar (JPG, PNG, WebP, GIF)');
      e.target.value = '';
      return;
    }

    // Validate file size (2MB max)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      console.error(`Ukuran file terlalu besar: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maksimal: 2MB`);
      e.target.value = '';
      return;
    }

    // Show file size info
    const fileSizeKB = Math.round(file.size / 1024);
    if (fileSizeKB > 500) {

    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let uploadedImageUrl = formData.imageUrl; // Use existing image by default

    // If a new file is selected, upload it
    if (selectedFile) {
      setIsUploading(true);
      try {
        const formDataUpload = new FormData();
        formDataUpload.append('file', selectedFile);

        const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
          method: 'POST',
          headers: {
            Authorization: getAuthHeaders()['Authorization'],
          },
          body: formDataUpload,
        });

        if (uploadResponse.ok) {
          const blobData = await uploadResponse.json();
          uploadedImageUrl = blobData.url;
        } else {
          const errorData = await uploadResponse.json();
          console.error(errorData.error || 'Failed to upload image.');
          return; // Stop submission if image upload fails
        }
      } catch (uploadError) {
        console.error('Image upload failed:', uploadError);
        console.error('Terjadi kesalahan saat mengupload gambar. Silakan coba lagi.');
        return; // Stop submission if image upload fails
      } finally {
        setIsUploading(false);
      }
    }

    try {
      if (editingProduct) {
        // Update existing product
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            ...formData,
            price: Number(formData.price),
            commissionValue: Number(formData.commissionValue),
            isActive: editingProduct.isActive,
            imageUrl: uploadedImageUrl, // Use the new or existing image URL
          }),
        });

        if (response.ok) {
          const updatedProduct = await response.json();
          setProducts(prev => prev.map(p =>
            p.id === updatedProduct.id ? updatedProduct : p
          ));

        } else if (response.status === 409) {
          const errorData = await response.json();
          console.error(errorData.error || 'Product with this slug already exists.');
        }
        else {
          const errorData = await response.json();
          console.error(errorData.error || 'Failed to update product.');
        }
      } else {
        // Create new product
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/products`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            ...formData,
            price: Number(formData.price),
            commissionValue: Number(formData.commissionValue),
            isActive: true,
            imageUrl: uploadedImageUrl, // Use the new or existing image URL
          }),
        });

        if (response.ok) {
          const createdProduct = await response.json();
          setProducts(prev => [...prev, createdProduct]);

        } else if (response.status === 409) {
          const errorData = await response.json();
          console.error(errorData.error || 'Product with this slug already exists.');
        } else {
          const errorData = await response.json();
          console.error(errorData.error || 'Failed to create product.');
        }
      }
    } catch (error) {
      console.error('Failed to submit product:', error);
      console.error('An error occurred while submitting product.');
    } finally {
      setIsDialogOpen(false);
      resetForm();
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));

      } else {
        console.error('Failed to delete product.');
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
      console.error('An error occurred while deleting product.');
    }
  };

  const toggleActive = async (id: string) => {
    const productToToggle = products.find(p => p.id === id);
    if (!productToToggle) return;

    const newIsActive = !productToToggle.isActive;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/products/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...productToToggle, isActive: newIsActive }),
      });

      if (response.ok) {
        setProducts(prev => prev.map(p =>
          p.id === id ? { ...p, isActive: newIsActive } : p
        ));

      } else {
        console.error('Failed to update product status.');
      }
    } catch (error) {
      console.error('Failed to toggle product status:', error);
      console.error('An error occurred while updating product status.');
    }
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Produk</h1>
          <p className="text-muted-foreground">Kelola produk afiliasi Anda</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Produk
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display">
                {editingProduct ? 'Ubah Produk' : 'Tambah Produk Baru'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Produk</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Kursus Premium"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="kursus-premium"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Harga (Rp)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="99000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Deskripsi produk..."
                />
              </div>
              {/* Image Upload Field */}
              <div className="space-y-4">
                <Label htmlFor="image">Gambar Produk</Label>

                {/* Upload Area */}
                <div className="border-2 border-dashed border-border rounded-lg p-6">
                  {imagePreview ? (
                    <div className="space-y-4">
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
                        <img
                          src={imagePreview}
                          alt="Pratinjau Gambar"
                          className="w-full h-full object-contain bg-secondary/20"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="hidden w-full h-48 bg-secondary/50 flex items-center justify-center">
                          <div className="text-center">
                            <ImageIcon className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-muted-foreground">Gambar tidak dapat dimuat</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {selectedFile ? `${selectedFile.name} (${Math.round(selectedFile.size / 1024)}KB)` : 'Gambar saat ini'}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedFile(null);
                            setImagePreview(editingProduct?.imageUrl || null);
                          }}
                        >
                          Hapus
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-4">
                        Klik untuk upload gambar produk
                      </p>
                      <p className="text-xs text-muted-foreground mb-4">
                        Format: JPG, PNG, WebP, GIF (Maks: 2MB, Recommended: &lt;500KB)
                      </p>
                    </div>
                  )}

                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                    disabled={isUploading}
                  />
                </div>

                {isUploading && (
                  <div className="flex items-center justify-center gap-3 py-4">
                    <div className="flex space-x-1">
                      <div className="w-3 h-3 bg-primary rounded-full animate-bounce" />
                      <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                    <span className="text-sm text-primary">Mengupload...</span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipe Komisi</Label>
                  <Select
                    value={formData.commissionType}
                    onValueChange={(value: CommissionType) => setFormData(prev => ({ ...prev, commissionType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Persentase (%)</SelectItem>
                      <SelectItem value="fixed">Tetap (Rp)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commissionValue">
                    Komisi {formData.commissionType === 'percentage' ? '(%)' : '(Rp)'}
                  </Label>
                  <Input
                    id="commissionValue"
                    type="number"
                    value={formData.commissionValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, commissionValue: e.target.value }))}
                    placeholder="20"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isUploading}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Mengupload...
                    </>
                  ) : (
                    <>{editingProduct ? 'Perbarui' : 'Buat'} Produk</>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari produk..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden">
                {product.imageUrl && (
                  <div className="h-40 overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{product.name}</h3>
                      <p className="text-2xl font-display font-bold text-primary">
                        {product.price.toLocaleString('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </p>
                    </div>
                    <Badge
                      variant={product.isActive ? 'default' : 'secondary'}
                      className={product.isActive ? 'bg-success text-success-foreground' : ''}
                      onClick={() => toggleActive(product.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      {product.isActive ? 'Aktif' : 'Tidak Aktif'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-sm text-muted-foreground">
                      Komisi: {product.commissionValue}{product.commissionType === 'percentage' ? '%' : 'Rp'}
                    </span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleOpenDialog(product)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(product.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Tidak ada produk ditemukan</p>
        </div>
      )}
    </div>
  );
}