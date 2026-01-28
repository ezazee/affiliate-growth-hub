"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Filter, Package, User, ShoppingCart, Calendar, DollarSign, TrendingUp, MessageCircle } from 'lucide-react';
import { getAdminWhatsApp, createWhatsAppLink } from '@/lib/whatsapp';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { Order, OrderStatus } from '@/types/order';
import { Skeleton } from '@/components/ui/skeleton';

export default function AffiliatorCustomers() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  useEffect(() => {
    if (user?.id) {
      const fetchCustomerHistory = async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/affiliator/customers?affiliatorId=${user.id}`);
          if (response.ok) {
            const data = await response.json();
            setOrders(data);
          }
        } catch (error) {
          console.error('Failed to fetch customer history:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchCustomerHistory();
    }
  }, [user]);

  const filteredOrders = orders.filter(order =>
    statusFilter === 'all' || order.status === statusFilter
  );

  const statusMap: Record<OrderStatus, string> = {
    pending: 'Tertunda',
    paid: 'Dibayar',
    cancelled: 'Dibatalkan',
    shipping: 'Dikirim',
  };

  const getStatusBadge = (status: OrderStatus) => {
    const styles: Record<OrderStatus, string> = {
      pending: 'bg-accent/20 text-accent-foreground',
      paid: 'bg-success/20 text-success',
      cancelled: 'bg-destructive/20 text-destructive',
      shipping: 'bg-blue-500/20 text-blue-500',
    };
    return styles[status];
  };

  const generateWhatsAppMessage = (order: Order, affiliatorName: string) => {
    const alamatLengkap = [
      order.shippingAddress,
      order.city,
      order.province,
      order.postalCode
    ].filter(Boolean).join(', ') || '-';

    const message = `📦 PERMINTAAN PROSES ORDER
----------------------------------------
Nama Customer   : ${order.buyerName}
No. Handphone   : ${order.buyerPhone}
Alamat          : ${alamatLengkap}

Nomor Transaksi : ${order.orderNumber || 'N/A'}
Total Harga     : ${order.totalPrice?.toLocaleString('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }) || 'Rp 0'}
Tanggal Order   : ${new Date(order.createdAt).toLocaleDateString()}
Sumber          : Affiliator (${affiliatorName})
----------------------------------------
Order ini diajukan oleh affiliator untuk segera diproses.
Mohon bantu dilakukan pengecekan dan tindak lanjut melalui dashboard admin.

Terima kasih.`;

    return encodeURIComponent(message);
  };

  const handleWhatsAppClick = async (order: Order) => {
    const adminWhatsApp = await getAdminWhatsApp();
    const message = generateWhatsAppMessage(order, user?.name || user?.email || 'Unknown');
    const whatsappUrl = createWhatsAppLink(adminWhatsApp, message);
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Riwayat Pelanggan</h1>
          <p className="text-muted-foreground">Lihat riwayat pelanggan yang membeli melalui link Anda.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pelanggan Anda</CardTitle>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as OrderStatus | 'all')}>
              <SelectTrigger className="w-[180px]">
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
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><ShoppingCart className="w-4 h-4 inline-block mr-1" /> No. Order</TableHead>
                  <TableHead><User className="w-4 h-4 inline-block mr-1" /> Pelanggan</TableHead>
                  <TableHead><Package className="w-4 h-4 inline-block mr-1" /> Produk</TableHead>
                  <TableHead><DollarSign className="w-4 h-4 inline-block mr-1" /> Total Harga</TableHead>
                  <TableHead><TrendingUp className="w-4 h-4 inline-block mr-1" /> Komisi</TableHead>
                  <TableHead><ShoppingCart className="w-4 h-4 inline-block mr-1" /> Status</TableHead>
                  <TableHead><Calendar className="w-4 h-4 inline-block mr-1" /> Tanggal</TableHead>
                  <TableHead><MessageCircle className="w-4 h-4 inline-block mr-1" /> WhatsApp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredOrders.length > 0 ? (
                  filteredOrders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="font-mono text-sm font-medium">{order.orderNumber || 'N/A'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{order.buyerName}</div>
                        <div className="text-sm text-muted-foreground">{order.buyerPhone}</div>
                      </TableCell>
                      <TableCell>{order.product?.name || order.productName || 'N/A'}</TableCell>
                      <TableCell className="font-medium">
                        {order.totalPrice?.toLocaleString('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0,
                        }) || 'Rp 0'}
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        {order.commission?.toLocaleString('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0,
                        }) || 'Rp 0'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(order.status)}>{statusMap[order.status]}</Badge>
                      </TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {order.status === 'cancelled' || order.status === 'paid' ? (
                          <span className="text-muted-foreground text-sm">-</span>
                        ) : (
                          <button
                            onClick={() => handleWhatsAppClick(order)}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors"
                            title="Kirim WhatsApp ke Admin"
                          >
                            <MessageCircle className="w-4 h-4" />
                            WA Admin
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Tidak ada riwayat pelanggan.</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
