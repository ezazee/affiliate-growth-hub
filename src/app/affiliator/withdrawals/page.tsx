"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { CalendarIcon, DollarSign, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface Withdrawal {
  id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  requestedAt: string;
  processedAt?: string;
  rejectionReason?: string;
  availableBalance: number;
}

export default function AffiliatorWithdrawalsPage() {
  const { user } = useAuth();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [amount, setAmount] = useState('');
  const [availableBalance, setAvailableBalance] = useState(0);
  const [minimumWithdrawal, setMinimumWithdrawal] = useState(50000);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch withdrawals
        const withdrawalsResponse = await fetch('/api/affiliator/withdrawals');
        if (withdrawalsResponse.ok) {
          const withdrawalsData = await withdrawalsResponse.json();
          setWithdrawals(withdrawalsData);
        }

        // Fetch user stats for balance
        const statsResponse = await fetch('/api/affiliator/stats');
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setAvailableBalance(statsData.withdrawableCommission || 0);
        }

        // Fetch settings
        const settingsResponse = await fetch('/api/settings');
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json();
          setMinimumWithdrawal(settingsData.minimumWithdrawal || 50000);
        }
      } catch (error) {
        console.error('Error fetching withdrawals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const withdrawAmount = parseFloat(amount);
    
    if (!withdrawAmount || withdrawAmount <= 0) {
      alert('Masukkan jumlah penarikan yang valid');
      return;
    }

    if (withdrawAmount < minimumWithdrawal) {
      alert(`Minimum penarikan adalah Rp ${minimumWithdrawal.toLocaleString('id-ID')}`);
      return;
    }

    if (withdrawAmount > availableBalance) {
      alert('Saldo tidak mencukupi');
      return;
    }

    setSubmitting(true);
    
    try {
      const response = await fetch('/api/affiliator/withdrawals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: withdrawAmount }),
      });

      const result = await response.json();

      if (response.ok) {
        // Reset form
        setAmount('');
        // Update balance
        setAvailableBalance(prev => prev - withdrawAmount);
        // Add new withdrawal to list
        const newWithdrawal: Withdrawal = {
          id: result.id,
          amount: withdrawAmount,
          status: 'pending',
          requestedAt: new Date().toISOString(),
          availableBalance: availableBalance - withdrawAmount,
        };
        setWithdrawals(prev => [newWithdrawal, ...prev]);
        alert('Permohonan penarikan berhasil diajukan!');
      } else {
        alert(result.error || 'Gagal mengajukan penarikan');
      }
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      alert('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: Withdrawal['status']) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-blue-100 text-blue-800 border-blue-200',
      processed: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
    };

    const labels = {
      pending: 'Menunggu',
      approved: 'Disetujui',
      processed: 'Diproses',
      rejected: 'Ditolak',
    };

    return (
      <Badge className={cn(variants[status], 'border')}>
        {labels[status]}
      </Badge>
    );
  };

  const getStatusIcon = (status: Withdrawal['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'processed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const stats = {
    total: withdrawals.length,
    pending: withdrawals.filter(w => w.status === 'pending').length,
    approved: withdrawals.filter(w => w.status === 'approved').length,
    processed: withdrawals.filter(w => w.status === 'processed').length,
    rejected: withdrawals.filter(w => w.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Penarikan Dana</h1>
        <p className="text-muted-foreground">
          Kelola permohonan penarikan komisi Anda
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">Menunggu</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.approved}</div>
            <div className="text-sm text-muted-foreground">Disetujui</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.processed}</div>
            <div className="text-sm text-muted-foreground">Diproses</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-muted-foreground">Ditolak</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Withdrawal Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Ajukan Penarikan
              </CardTitle>
              <CardDescription>
                Ajukan penarikan dana dari komisi Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Saldo Tersedia</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      Rp {availableBalance.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Jumlah Penarikan</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Masukkan jumlah"
                    min={minimumWithdrawal}
                    max={availableBalance}
                    step={1000}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimal: Rp {minimumWithdrawal.toLocaleString('id-ID')}
                  </p>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <p className="text-sm text-blue-800">
                      Penarikan akan diproses dalam 1-3 hari kerja
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={submitting || availableBalance < minimumWithdrawal}
                >
                  {submitting ? 'Mengajukan...' : 'Ajukan Penarikan'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Withdrawals History */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Penarikan</CardTitle>
              <CardDescription>
                Daftar semua permohonan penarikan Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <Skeleton className="h-6 w-32 mb-2" />
                      <Skeleton className="h-4 w-48 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </div>
              ) : withdrawals.length > 0 ? (
                <div className="space-y-4">
                  {withdrawals.map((withdrawal, index) => (
                    <motion.div
                      key={withdrawal.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getStatusIcon(withdrawal.status)}
                            <div>
                              <p className="font-semibold text-lg">
                                Rp {withdrawal.amount.toLocaleString('id-ID')}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Diajukan: {format(new Date(withdrawal.requestedAt), 'PPP', { locale: id })}
                              </p>
                              {withdrawal.processedAt && (
                                <p className="text-sm text-muted-foreground">
                                  Diproses: {format(new Date(withdrawal.processedAt), 'PPP', { locale: id })}
                                </p>
                              )}
                            </div>
                          </div>
                          {withdrawal.rejectionReason && (
                            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                              <div className="flex items-center gap-2">
                                <XCircle className="h-4 w-4 text-red-600" />
                                <p className="text-sm text-red-800">
                                  Alasan penolakan: {withdrawal.rejectionReason}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-2 sm:items-end">
                          {getStatusBadge(withdrawal.status)}
                          {withdrawal.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (confirm('Batalkan permohonan penarikan ini?')) {
                                  // TODO: Implement cancel withdrawal
                                  alert('Fitur pembatalan akan segera tersedia');
                                }
                              }}
                            >
                              Batalkan
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    Belum Ada Riwayat Penarikan
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Ajukan penarikan pertama Anda untuk melihat riwayat di sini
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}