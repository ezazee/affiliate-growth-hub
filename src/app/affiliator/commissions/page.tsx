"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Landmark, Clock, Check, CreditCard, TrendingUp, XCircle, Plus, Banknote } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/StatCard';
import { useAuth } from '@/contexts/AuthContext';
import { Commission, CommissionStatus } from '@/types';
import { BankDetails } from '@/types/withdrawal';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AffiliatorCommissions() {
  const { user } = useAuth();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);

  // State for withdrawal form
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    bankName: user?.bankDetails?.bankName || '',
    accountHolderName: user?.bankDetails?.accountHolderName || '',
    accountNumber: user?.bankDetails?.accountNumber || '',
  });

  const MINIMUM_WITHDRAWAL_AMOUNT = 100000;

  const fetchData = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
          try {
            const commissionsResponse = await fetch(`/api/affiliator/commissions?affiliatorId=${user.id}`, { cache: 'no-store' });
    
                  if (commissionsResponse.ok) {
                    const commissionsData = await commissionsResponse.json();
                    console.log('[DEBUG] Fetched commissions on client:', commissionsData);
                    setCommissions(commissionsData);
                  } else {
                    toast.error('Gagal memuat riwayat komisi.');
                  }    } catch (error) {
      console.error('Gagal mengambil data komisi:', error);
      toast.error('Terjadi kesalahan saat memuat data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleRequestWithdrawal = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const response = await fetch('/api/affiliator/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          affiliatorId: user.id,
          amount: Number(withdrawalAmount),
          bankDetails,
        }),
      });
      const result = await response.json();
      if (response.ok) {
        toast.success('Permintaan penarikan berhasil dikirim!');
        setIsDialogOpen(false);
        setWithdrawalAmount('');
        await fetchData(); // Refresh data
      } else {
        toast.error(`Gagal: ${result.error}`);
      }
    } catch (error) {
      toast.error('Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: CommissionStatus) => {
    const styles: Record<CommissionStatus, string> = {
      pending: 'bg-accent/20 text-accent-foreground',
      approved: 'bg-primary/20 text-primary',
      paid: 'bg-success/20 text-success',
      cancelled: 'bg-destructive/20 text-destructive',
    };
    return styles[status] || 'bg-gray-100';
  };

  const getStatusIcon = (status: CommissionStatus) => {
    const icons: Record<CommissionStatus, React.ReactNode> = {
      pending: <Clock className="w-3 h-3" />,
      approved: <Check className="w-3 h-3" />,
      paid: <CreditCard className="w-3 h-3" />,
      cancelled: <XCircle className="w-3 h-3" />,
    };
    return icons[status];
  };

  const stats = {
    totalRevenue: commissions.filter(c => c.status === 'approved' || c.status === 'paid').reduce((sum, c) => sum + c.amount, 0),
    withdrawable: commissions.filter(c => c.status === 'approved').reduce((sum, c) => sum + c.amount, 0),
    pending: commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.amount, 0),
    paid: commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.amount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Komisi & Penarikan</h1>
          <p className="text-muted-foreground">Lacak penghasilan dan ajukan penarikan dana Anda</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="hero" disabled={stats.withdrawable <= 0}>
                    <Plus className="w-4 h-4 mr-2" />
                    Ajukan Penarikan
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-display">Formulir Penarikan Dana</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                    <p className="text-sm text-muted-foreground">
                        Saldo yang dapat ditarik: <span className="font-semibold text-primary">{stats.withdrawable.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span>
                    </p>
                    <div className="space-y-2">
                        <Label htmlFor="amount">Jumlah Penarikan (Rp)</Label>
                        <Input id="amount" type="number" value={withdrawalAmount} onChange={(e) => setWithdrawalAmount(e.target.value)} placeholder={`min. Rp${MINIMUM_WITHDRAWAL_AMOUNT.toLocaleString('id-ID')}`} />
                        {Number(withdrawalAmount) > 0 && Number(withdrawalAmount) < MINIMUM_WITHDRAWAL_AMOUNT && (
                            <p className="text-sm text-red-500">Minimal penarikan adalah Rp{MINIMUM_WITHDRAWAL_AMOUNT.toLocaleString('id-ID')}.</p>
                        )}
                    </div>
                    <h3 className="font-medium text-foreground pt-4 border-t">Detail Rekening Bank</h3>
                    <div className="space-y-2">
                        <Label htmlFor="bankName">Nama Bank</Label>
                        <Input id="bankName" value={bankDetails.bankName} onChange={(e) => setBankDetails(prev => ({...prev, bankName: e.target.value}))} placeholder="e.g. Bank Central Asia (BCA)" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="accountHolderName">Nama Pemilik Rekening</Label>
                        <Input id="accountHolderName" value={bankDetails.accountHolderName} onChange={(e) => setBankDetails(prev => ({...prev, accountHolderName: e.target.value}))} placeholder="e.g. John Doe" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="accountNumber">Nomor Rekening</Label>
                        <Input id="accountNumber" value={bankDetails.accountNumber} onChange={(e) => setBankDetails(prev => ({...prev, accountNumber: e.target.value}))} placeholder="e.g. 1234567890" />
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button onClick={handleRequestWithdrawal} disabled={!withdrawalAmount || Number(withdrawalAmount) < MINIMUM_WITHDRAWAL_AMOUNT || Number(withdrawalAmount) > stats.withdrawable}>
                            Kirim Permintaan
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)
        ) : (
          <>
            <StatCard title="Total Pendapatan" value={stats.totalRevenue.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })} icon={Landmark} variant="primary" delay={0} />
            <StatCard title="Dapat Ditarik" value={stats.withdrawable.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })} icon={Banknote} delay={0.1} />
            <StatCard title="Komisi Tertunda" value={stats.pending.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })} icon={Clock} delay={0.2} />
            <StatCard title="Total Dibayar" value={stats.paid.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })} icon={CreditCard} delay={0.3} />
          </>
        )}
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Riwayat Komisi
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
            </div>
          ) : commissions.length > 0 ? (
            <div className="space-y-4">
              {commissions.map((commission, index) => (
                <motion.div
                  key={commission.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                      <Landmark className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {commission.productName || 'Produk Tidak Dikenal'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Pesanan dari {commission.order?.buyerName || 'N/A'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(commission.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <p className="text-xl font-display font-bold text-success">
                      +{commission.amount.toLocaleString('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                      })}
                    </p>
                    <Badge className={`${getStatusBadge(commission.status)} flex items-center gap-1 capitalize`}>
                      {getStatusIcon(commission.status)}
                      {commission.status}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Landmark className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Belum ada komisi</h3>
              <p className="text-muted-foreground">
                Mulai bagikan link afiliasi Anda untuk mendapatkan komisi
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
