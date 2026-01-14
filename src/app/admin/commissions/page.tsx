"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Landmark, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Commission, CommissionStatus } from '@/types';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminCommissions() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const fetchCommissions = async () => {
      try {
        const response = await fetch('/api/admin/commissions');
        if (response.ok) {
          const data = await response.json();
          setCommissions(data);
        }
      } catch (error) {
        console.error('Gagal mengambil komisi:', error);
        toast.error('Gagal memuat komisi.');
      } finally {
        setLoading(false);
      }
    };
    fetchCommissions();
  }, []);

  const filteredCommissions = commissions.filter(c => {
    const matchesSearch = (c.affiliateName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (c.productName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateCommissionStatus = async (commissionId: string, newStatus: CommissionStatus) => {
    try {
      const response = await fetch('/api/admin/commissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commissionId, status: newStatus }),
      });

      const updatedCommission = await response.json();

      if (response.ok) {
        setCommissions(prev => prev.map(c => 
          c.id === commissionId ? updatedCommission : c
        ));
        toast.success(`Komisi ditandai sebagai ${newStatus}`);
      } else {
        toast.error(`Gagal memperbarui komisi: ${updatedCommission.error}`);
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat memperbarui status komisi.');
    }
  };

  const getStatusBadge = (status: CommissionStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'approved': return 'bg-primary/20 text-primary'; // Add approved status
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Komisi</h1>
          <p className="text-muted-foreground">Kelola dan lacak komisi afiliasi</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Komisi</CardTitle>
              <Landmark className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{commissions.length}</div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Didapat</CardTitle>
              <Landmark className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {commissions.reduce((acc, c) => acc + c.amount, 0).toLocaleString('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Komisi Tertunda</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {commissions.filter(c => c.status === 'pending').length}
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Komisi Dibayar</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {commissions.filter(c => c.status === 'paid').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari komisi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter berdasarkan status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="pending">Tertunda</SelectItem>
              <SelectItem value="approved">Disetujui</SelectItem>
              <SelectItem value="paid">Dibayar</SelectItem>
              <SelectItem value="cancelled">Dibatalkan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Commissions Table */}
        <Card className="shadow-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-4">
                  <Skeleton className="h-16 mb-2" />
                  <Skeleton className="h-16 mb-2" />
                  <Skeleton className="h-16" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Afiliasi</TableHead>
                      <TableHead>Produk</TableHead>
                      <TableHead>ID Pesanan</TableHead>
                      <TableHead>Jumlah</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead className="text-right">Tindakan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCommissions.length > 0 ? (
                      filteredCommissions.map((commission) => {
                        const statusText: Record<CommissionStatus, string> = {
                          pending: 'Tertunda',
                          approved: 'Disetujui',
                          paid: 'Dibayar',
                          cancelled: 'Dibatalkan',
                          withdrawn: 'Sudah Ditarik',
                          reserved: 'Diproses',
                          processed: 'Selesai Diproses',
                        };

                        return (
                          <motion.tr
                            key={commission.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                          >
                            <TableCell className="font-medium">{commission.affiliateName}</TableCell>
                            <TableCell>{commission.productName}</TableCell>
                            <TableCell>{commission.orderId}</TableCell>
                            <TableCell>
                              {commission.amount.toLocaleString('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              })}
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusBadge(commission.status)}>
                                {statusText[commission.status] || commission.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(commission.date).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              {commission.status === 'pending' && (
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="default" 
                                    onClick={() => updateCommissionStatus(commission.id, 'approved')}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Setujui
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="text-destructive"
                                    onClick={() => updateCommissionStatus(commission.id, 'cancelled')}
                                  >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Batalkan
                                  </Button>
                                </div>
                              )}
                              {commission.status === 'approved' && (
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="default" 
                                    onClick={() => updateCommissionStatus(commission.id, 'paid')}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Tandai Dibayar
                                  </Button>
                                </div>
                              )}
                              { (commission.status === 'paid' || commission.status === 'cancelled') && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  disabled
                                >
                                  Tidak Ada Tindakan
                                </Button>
                              )}
                            </TableCell>
                          </motion.tr>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                          Tidak ada komisi ditemukan.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
  );
}