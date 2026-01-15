import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Shield, TrendingUp, Users, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProductsSectionProps {
  products: any[];
}

export default function ProductsSection({ products }: ProductsSectionProps) {
  const getCommissionRate = (products: any[]) => {
    if (!products || products.length === 0) return '0%';
    const firstProduct = products[0];
    if (!firstProduct) return '0%';
    const commissionType = firstProduct.commissionType;
    const commissionValue = firstProduct.commissionValue;
    return commissionType === 'percentage' 
      ? `${commissionValue}%` 
      : `Rp ${Number(commissionValue).toLocaleString('id-ID')}`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <section id="products" className="py-20 px-6">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-4">
            Produk Unggulan PE Skinpro
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Promosikan produk-produk berkualitas tinggi kami dan dapatkan komisi menarik dari setiap penjualan.
          </p>
          <Badge className="mt-4 bg-gradient-to-r from-primary/20 to-secondary/20 text-primary px-6 py-3 text-base font-semibold rounded-full border border-primary/20">
            Komisi {getCommissionRate(products)}
          </Badge>
        </div>

        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {products.map((product, index) => (
              <div key={product.id}>
                <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70">
                  <div className="aspect-square relative overflow-hidden">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-2 text-foreground group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xl font-bold text-primary">
                        {formatPrice(product.price)}
                      </span>
                      <Badge className="bg-success/20 text-success text-xs">
                        Tersedia
                      </Badge>
                    </div>
                    <Button
                      asChild
                      className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white"
                    >
                      <Link href="/register">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Promosikan
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Produk Sedang Dimuat</h3>
            <p className="text-muted-foreground mb-6">Produk unggulan kami akan segera tersedia</p>
          </div>
        )}

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 p-8 rounded-3xl border border-primary/20">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Siap Memulai Karir Affiliate Anda?
            </h3>
            <p className="text-muted-foreground text-lg mb-6 max-w-2xl mx-auto">
              Bergabung sekarang juga dan nikmati komisi menarik dari setiap penjualan produk PE Skinpro.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white px-8 py-4"
              >
                <Link href="/register">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Daftar Sekarang
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="bg-white/80 backdrop-blur-sm hover:bg-white/90 border-2 border-primary/20 hover:border-primary/40 px-8 py-4"
              >
                <Link href="/login">
                  <Users className="w-5 h-5 mr-2" />
                  Login Member
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}