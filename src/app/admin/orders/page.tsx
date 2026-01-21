"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Eye, CheckCircle, XCircle, Clock, ShoppingCart, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Order, OrderStatus } from '@/types';

import { Skeleton } from '@/components/ui/skeleton';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [shippingCost, setShippingCost] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersResponse = await fetch('/api/admin/orders');
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          setOrders(ordersData);
        } else {
          console.error('Gagal memuat pesanan.');
        }
      } catch (error) {
        console.error('Gagal mengambil pesanan:', error);
        console.error('Terjadi kesalahan saat memuat data.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);
  
  const handleUpdateOrder = async (orderId: string, updateData: { status?: OrderStatus; shippingCost?: number }) => {
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, ...updateData }),
      });

      const updatedOrder = await response.json();

      if (response.ok) {
        setOrders(prev => prev.map(o => (o.id === orderId ? updatedOrder : o)));
        console.log('Pesanan berhasil diperbarui.');
        return updatedOrder;
      } else {
        console.error(`Gagal memperbarui pesanan: ${updatedOrder.error || 'Silakan coba lagi.'}`);
        return null;
      }
    } catch (error) {
      console.error('Failed to update order:', error);
      console.error('Gagal memperbarui pesanan karena kesalahan jaringan.');
      return null;
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    const updatedOrder = await handleUpdateOrder(orderId, { status: newStatus });
    if (updatedOrder) {
      setSelectedOrder(updatedOrder);
       if(newStatus !== 'pending') {
         setTimeout(() => setSelectedOrder(null), 1000);
       }
    }
  };

  const updateShippingCost = async (orderId: string) => {
    if (!shippingCost) return;
    const cost = Number(shippingCost);
    const updatedOrder = await handleUpdateOrder(orderId, { shippingCost: cost });
    if (updatedOrder && selectedOrder) {
      setSelectedOrder(updatedOrder);
      setShippingCost('');
    }
  };


  const filteredOrders = orders.filter(o => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = o.buyerName?.toLowerCase().includes(searchLower) ||
                          o.affiliateName?.toLowerCase().includes(searchLower) ||
                          o.productName?.toLowerCase().includes(searchLower);
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: OrderStatus) => {
    const styles: Record<OrderStatus, string> = {
      pending: 'bg-accent/20 text-accent-foreground',
      paid: 'bg-success/20 text-success',
      cancelled: 'bg-destructive/20 text-destructive',
      shipping: 'bg-blue-500/20 text-blue-500'
    };
    return styles[status];
  };

  const getStatusIcon = (status: OrderStatus) => {
    const icons: Record<OrderStatus, React.ReactNode> = {
      pending: <Clock className="w-3 h-3" />,
      paid: <CheckCircle className="w-3 h-3" />,
      cancelled: <XCircle className="w-3 h-3" />,
      shipping: <Truck className="w-3 h-3" />,
    };
    return icons[status];
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    paid: orders.filter(o => o.status === 'paid').length,
    revenue: orders.filter(o => o.status === 'paid').reduce((sum, o) => {
      return sum + (o.totalPrice || 0);
    }, 0),
    totalCommission: orders.filter(o => o.status === 'paid').reduce((sum, o) => {
      // Hitung komisi berdasarkan setting produk
      if (o.commissionType === 'percentage') {
        return sum + ((o.productPrice || 0) * (o.commissionValue || 0) / 100);
      } else {
        return sum + (o.commissionValue || 0);
      }
     }, 0),
     commissionDeductionRate: 0.10, // 10% deduction untuk affiliator (bisa diambil dari settings)
   };
  
  const netRevenue = stats.revenue - stats.totalCommission; // Total pembayaran - total komisi affiliator

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Pesanan</h1>
          <p className="text-muted-foreground">Kelola pesanan dan pembayaran pelanggan</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Total Pesanan', value: stats.total, color: 'bg-primary/10 text-primary' },
            { label: 'Tertunda', value: stats.pending, color: 'bg-accent/10 text-accent-foreground' },
            { label: 'Dibayar', value: stats.paid, color: 'bg-success/10 text-success' },
            {
              label: 'Komisi Kotor',
              value: stats.totalCommission.toLocaleString('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }),
              color: 'bg-warning/10 text-warning'
            },
            {
              label: 'Pendapatan Bersih',
              value: netRevenue.toLocaleString('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }),
              color: 'gradient-primary text-primary-foreground'
            },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-xl p-4 ${stat.color}`}>
              <p className="text-2xl font-display font-bold">{stat.value}</p>
              <p className="text-sm opacity-80">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari berdasarkan pembeli, afiliasi, atau produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter berdasarkan status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="pending">Tertunda</SelectItem>
              <SelectItem value="paid">Dibayar</SelectItem>
              <SelectItem value="shipping">Dikirim</SelectItem>
              <SelectItem value="cancelled">Dibatalkan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order._id?.toString()}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="shadow-card hover:shadow-card-hover transition-all duration-300">
                  <CardContent className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-foreground">{order.buyerName}</h3>
                          <Badge className={`${getStatusBadge(order.status)} flex items-center gap-1 capitalize`}>
                            {getStatusIcon(order.status)}
                            {order.status}
                          </Badge>
                         </div>
                         <div className="flex items-center gap-2 mb-2">
                           <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                             🧾 {order.orderNumber}
                           </span>
                         </div>
                         <p className="text-sm text-muted-foreground">
                           Produk: <span className="text-foreground">{order.productName}</span>
                         </p>
                        <p className="text-sm text-muted-foreground">
                          Afiliasi: <span className="text-foreground">{order.affiliateName}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-display font-bold text-primary">
                          {(order.productPrice || 0).toLocaleString('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                          </p>
                          {order.shippingCost > 0 && (
                            <p className="text-xs text-muted-foreground">
                              + {order.shippingCost.toLocaleString('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              })} pengiriman
                            </p>
                          )}
                        </div>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Lihat
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Tidak ada pesanan ditemukan</p>
          </div>
        )}

        <Dialog open={!!selectedOrder} onOpenChange={(isOpen) => !isOpen && setSelectedOrder(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display">Detail Pesanan</DialogTitle>
            </DialogHeader>
             {selectedOrder && (
               <div className="space-y-6 mt-4 max-h-[70vh] overflow-y-auto">
                 {/* Customer Details */}
                 <div className="space-y-3">
                   <h3 className="font-semibold text-foreground flex items-center gap-2">
                     📍 Informasi Penerima
                   </h3>
                   <div className="grid grid-cols-1 gap-3 text-sm">
                     <div>
                       <p className="text-muted-foreground">Nama Lengkap</p>
                       <p className="font-medium text-base">{selectedOrder.buyerName}</p>
                     </div>
                     <div>
                       <p className="text-muted-foreground">No. Telepon</p>
                       <a href={`https://wa.me/${selectedOrder.buyerPhone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline flex items-center gap-1">
                         📱 {selectedOrder.buyerPhone}
                       </a>
                     </div>
                     <div>
                       <p className="text-muted-foreground">Alamat Lengkap</p>
                       <p className="font-medium bg-secondary p-3 rounded-md">
                         {selectedOrder.shippingAddress}, {selectedOrder.city}, {selectedOrder.province} {selectedOrder.postalCode}
                       </p>
                     </div>
                     {selectedOrder.orderNote && (
                       <div>
                         <p className="text-muted-foreground">Catatan Pesanan</p>
                         <p className="font-medium italic bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md border-l-4 border-yellow-400">
                           📝 "{selectedOrder.orderNote}"
                         </p>
                       </div>
                     )}
                   </div>
                 </div>

                 {/* Order Details */}
                 <div className="space-y-3">
                   <h3 className="font-semibold text-foreground flex items-center gap-2">
                     📦 Detail Pesanan
                   </h3>
                   <div className="grid grid-cols-1 gap-3 text-sm">
                     <div>
                       <p className="text-muted-foreground">Nomor Pesanan</p>
                       <p className="font-mono font-bold text-base">{selectedOrder.orderNumber}</p>
                     </div>
                     <div>
                       <p className="text-muted-foreground">Produk</p>
                       <p className="font-medium text-base">{selectedOrder.productName}</p>
                       <p className="text-xs text-muted-foreground">
                         {(selectedOrder.productPrice || 0).toLocaleString('id-ID', {
                           style: 'currency',
                           currency: 'IDR',
                           minimumFractionDigits: 0,
                         })}
                       </p>
                     </div>
                     <div>
                       <p className="text-muted-foreground">Tanggal Pesanan</p>
                       <p className="font-medium">
                         {new Date(selectedOrder.createdAt).toLocaleString('id-ID', { 
                           day: 'numeric', 
                           month: 'long', 
                           year: 'numeric',
                           hour: '2-digit',
                           minute: '2-digit'
                         })}
                       </p>
                     </div>
                   </div>
                 </div>

                 {/* Affiliator Details */}
                 <div className="space-y-3">
                   <h3 className="font-semibold text-foreground flex items-center gap-2">
                     👤 Informasi Affiliator
                   </h3>
                   <div className="grid grid-cols-1 gap-3 text-sm">
                     <div>
                       <p className="text-muted-foreground">Nama Affiliator</p>
                       <p className="font-medium text-base">{selectedOrder.affiliateName}</p>
                     </div>
                     <div>
                       <p className="text-muted-foreground">Kode Affiliator</p>
                       <p className="font-mono bg-primary/10 text-primary px-2 py-1 rounded inline-block">
                         {selectedOrder.affiliateCode}
                       </p>
                     </div>
                     <div>
                       <p className="text-muted-foreground">Affiliator ID</p>
                       <p className="font-mono text-xs bg-muted px-2 py-1 rounded">
                         {selectedOrder.affiliatorId}
                       </p>
                     </div>
                   </div>
                 </div>

                 {/* Price Details */}
                 <div className="space-y-3">
                   <h3 className="font-semibold text-foreground flex items-center gap-2">
                     💰 Rincian Harga
                   </h3>
                   <div className="bg-muted/50 p-4 rounded-md space-y-2">
                     <div className="flex justify-between">
                       <span className="text-muted-foreground">Harga Produk:</span>
                       <span className="font-medium">
                         {(selectedOrder.productPrice || 0).toLocaleString('id-ID', {
                           style: 'currency',
                           currency: 'IDR',
                           minimumFractionDigits: 0,
                         })}
                       </span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-muted-foreground">Biaya Pengiriman:</span>
                       <span className="font-medium">
                         {(selectedOrder.shippingCost || 0).toLocaleString('id-ID', {
                           style: 'currency',
                           currency: 'IDR',
                           minimumFractionDigits: 0,
                         })}
                       </span>
                     </div>
                     <div className="border-t pt-2 flex justify-between font-bold text-base">
                       <span>Total Pembayaran:</span>
                       <span className="text-primary">
                         {(selectedOrder.totalPrice || 0).toLocaleString('id-ID', {
                           style: 'currency',
                           currency: 'IDR',
                           minimumFractionDigits: 0,
                         })}
                       </span>
                     </div>
                   </div>
                 </div>



                 {/* Status Update */}
                 <div className="space-y-3">
                   <Label className="font-semibold">Ubah Status Pesanan</Label>
                   <div className="flex gap-2 flex-wrap">
                     {(['pending', 'paid', 'shipping', 'cancelled'] as OrderStatus[]).map((status) => (
                       <Button
                         key={status}
                         variant={selectedOrder.status === status ? 'default' : 'outline'}
                         size="sm"
                         onClick={() => updateOrderStatus(selectedOrder.id, status)}
                         className="flex-1 min-w-[100px]"
                       >
                         {status === 'pending' && '⏳ Menunggu'}
                         {status === 'paid' && '✅ Dibayar'}
                         {status === 'shipping' && '🚚 Dikirim'}
                         {status === 'cancelled' && '❌ Dibatalkan'}
                       </Button>
                     ))}
                   </div>
                 </div>
               </div>
             )}
          </DialogContent>
        </Dialog>
      </div>
  );
}
