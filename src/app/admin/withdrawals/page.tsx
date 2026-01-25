"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Check, X, Banknote, Calendar, User, ArrowUpDown, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Withdrawal, WithdrawalStatus } from '@/types/withdrawal';
import { User as UserType } from '@/types/user';

import { Skeleton } from '@/components/ui/skeleton';

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [affiliators, setAffiliators] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch withdrawals
        const withdrawalsResponse = await fetch('/api/admin/withdrawals');
        if (withdrawalsResponse.ok) {
          const withdrawalsData = await withdrawalsResponse.json();
          setWithdrawals(withdrawalsData);
        } else {
          console.error('Failed to load withdrawals.');
        }

        // Fetch affiliators for user info
        const affiliatorsResponse = await fetch('/api/admin/affiliators');
        if (affiliatorsResponse.ok) {
          const affiliatorsData = await affiliatorsResponse.json();
          setAffiliators(affiliatorsData);
        }
      } catch (error) {
        console.error('Failed to load data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const updateWithdrawalStatus = async (withdrawalId: string, newStatus: WithdrawalStatus, reason?: string) => {
    try {
      const body: any = { status: newStatus };
      if (newStatus === 'rejected' && reason) {
        body.rejectionReason = reason;
      }

      const response = await fetch(`/api/admin/withdrawals/${withdrawalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setWithdrawals(prev => prev.map(w =>
          w.id === withdrawalId ? { ...w, status: newStatus, processedAt: new Date() } : w
        ));

        if (newStatus === 'rejected') {
          setIsRejectDialogOpen(false);
          setRejectionReason('');
        }
      } else {
        console.error('Gagal memperbarui status penarikan.');
      }
    } catch (error) {
      console.error('Terjadi kesalahan saat memperbarui status.');
    }
  };

  const getAffiliatorName = (affiliatorId: string) => {
    const affiliator = affiliators.find(a => a.id === affiliatorId);
    return affiliator ? affiliator.name : 'Unknown';
  };

  const getAffiliatorEmail = (affiliatorId: string) => {
    const affiliator = affiliators.find(a => a.id === affiliatorId);
    return affiliator ? affiliator.email : 'Unknown';
  };

  const getStatusBadge = (status: WithdrawalStatus) => {
    const styles: Record<WithdrawalStatus, string> = {
      pending: 'bg-accent/20 text-accent-foreground',
      approved: 'bg-success/20 text-success',
      rejected: 'bg-destructive/20 text-destructive',
      completed: 'bg-primary/20 text-primary',
    };
    return styles[status];
  };

  const getStatusIcon = (status: WithdrawalStatus) => {
    const icons: Record<WithdrawalStatus, React.ReactNode> = {
      pending: <Calendar className="w-3 h-3" />,
      approved: <Check className="w-3 h-3" />,
      rejected: <X className="w-3 h-3" />,
      completed: <Download className="w-3 h-3" />,
    };
    return icons[status];
  };

  const filteredWithdrawals = withdrawals.filter(w => {
    const affiliatorName = getAffiliatorName(w.affiliatorId).toLowerCase();
    const matchesSearch = affiliatorName.includes(searchQuery.toLowerCase()) ||
      w.affiliatorId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: withdrawals.length,
    pending: withdrawals.filter(w => w.status === 'pending').length,
    approved: withdrawals.filter(w => w.status === 'approved').length,
    completed: withdrawals.filter(w => w.status === 'completed').length,
    totalAmount: withdrawals.filter(w => w.status === 'approved' || w.status === 'completed').reduce((sum, w) => sum + w.amount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">Penarikan Dana</h1>
        <p className="text-muted-foreground">Kelola permintaan penarikan dana afiliasi</p>
      </div>

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Detail Penarikan</DialogTitle>
          </DialogHeader>
          {selectedWithdrawal && (
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Afiliasi</p>
                <p className="text-sm">{getAffiliatorName(selectedWithdrawal.affiliatorId)}</p>
                <p className="text-xs text-muted-foreground">{getAffiliatorEmail(selectedWithdrawal.affiliatorId)}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Jumlah</p>
                <p className="text-lg font-bold text-primary">
                  {selectedWithdrawal.amount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Detail Rekening</p>
                <p className="text-sm">Bank: {selectedWithdrawal.bankDetails.bankName}</p>
                <p className="text-sm">Pemilik: {selectedWithdrawal.bankDetails.accountHolderName}</p>
                <p className="text-sm">No. Rekening: {selectedWithdrawal.bankDetails.accountNumber}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Tanggal</p>
                <p className="text-sm">Diajukan: {new Date(selectedWithdrawal.requestedAt).toLocaleDateString('id-ID')}</p>
                {selectedWithdrawal.processedAt && (
                  <p className="text-sm">Diproses: {new Date(selectedWithdrawal.processedAt).toLocaleDateString('id-ID')}</p>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Status</p>
                <Badge className={`${getStatusBadge(selectedWithdrawal.status)} flex items-center gap-1`}>
                  {getStatusIcon(selectedWithdrawal.status)}
                  {selectedWithdrawal.status}
                </Badge>
              </div>
              {selectedWithdrawal.rejectionReason && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-destructive">Alasan Penolakan</p>
                  <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                    {selectedWithdrawal.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2 text-destructive">
              <X className="w-5 h-5" />
              Tolak Penarikan
            </DialogTitle>
          </DialogHeader>
          {selectedWithdrawal && (
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Detail Penarikan</p>
                <p className="text-sm">
                  {getAffiliatorName(selectedWithdrawal.affiliatorId)} -
                  {selectedWithdrawal.amount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="rejectionReason" className="text-sm font-medium">
                  Alasan Penolakan
                </label>
                <Textarea
                  id="rejectionReason"
                  placeholder="Masukkan alasan penolakan..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsRejectDialogOpen(false);
                    setRejectionReason('');
                  }}
                >
                  Batal
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => updateWithdrawalStatus(selectedWithdrawal.id, 'rejected', rejectionReason)}
                  disabled={!rejectionReason.trim()}
                >
                  <X className="w-4 h-4 mr-2" />
                  Tolak
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {[
          { label: 'Total Permintaan', value: stats.total, color: 'bg-primary/10 text-primary' },
          { label: 'Menunggu', value: stats.pending, color: 'bg-accent/10 text-accent-foreground' },
          { label: 'Disetujui', value: stats.approved, color: 'bg-success/10 text-success' },
          { label: 'Selesai', value: stats.completed, color: 'bg-muted text-muted-foreground' },
          { label: 'Total Dana', value: stats.totalAmount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }), color: 'bg-primary/10 text-primary' },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-xl p-4 ${stat.color}`}>
            <p className="text-2xl font-display font-bold">{stat.value}</p>
            <p className="text-sm opacity-80">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari berdasarkan nama afiliasi..."
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
            <SelectItem value="pending">Menunggu</SelectItem>
            <SelectItem value="approved">Disetujui</SelectItem>
            <SelectItem value="rejected">Ditolak</SelectItem>
            <SelectItem value="completed">Selesai</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Withdrawals List */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredWithdrawals.map((withdrawal, index) => (
            <motion.div
              key={withdrawal.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="shadow-card hover:shadow-card-hover transition-all duration-300">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="font-semibold text-primary text-lg">
                          <Banknote className="w-6 h-6" />
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{getAffiliatorName(withdrawal.affiliatorId)}</h3>
                        <p className="text-sm text-muted-foreground">{getAffiliatorEmail(withdrawal.affiliatorId)}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Diajukan: {new Date(withdrawal.requestedAt).toLocaleDateString('id-ID')}
                        </p>
                        {withdrawal.processedAt && (
                          <p className="text-xs text-muted-foreground">
                            Diproses: {new Date(withdrawal.processedAt).toLocaleDateString('id-ID')}
                          </p>
                        )}
                        {withdrawal.rejectionReason && (
                          <p className="text-xs text-destructive mt-1">
                            Alasan: {withdrawal.rejectionReason}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end gap-3">
                      <div className="text-right">
                        <p className="text-xl font-display font-bold text-primary">
                          {withdrawal.amount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                        </p>
                        <Badge className={`${getStatusBadge(withdrawal.status)} flex items-center gap-1 mt-1`}>
                          {getStatusIcon(withdrawal.status)}
                          {withdrawal.status}
                        </Badge>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedWithdrawal(withdrawal);
                            setIsDetailsDialogOpen(true);
                          }}
                        >
                          Detail
                        </Button>

                        {(withdrawal.status === 'pending' || withdrawal.status === 'approved') && (
                          <>
                            {withdrawal.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => updateWithdrawalStatus(withdrawal.id, 'approved')}
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Setujui
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive"
                              onClick={() => {
                                setSelectedWithdrawal(withdrawal);
                                setIsRejectDialogOpen(true);
                              }}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Tolak
                            </Button>
                          </>
                        )}

                        {withdrawal.status === 'approved' && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => updateWithdrawalStatus(withdrawal.id, 'completed')}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Selesai
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filteredWithdrawals.length === 0 && (
        <div className="text-center py-12">
          <Banknote className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Tidak ada permintaan penarikan ditemukan</p>
        </div>
      )}
    </div>
  );
}