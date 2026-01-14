"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Landmark, Clock, Check, CreditCard, TrendingUp, XCircle, Plus, Banknote, Wallet, ArrowUpRight, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/StatCard';
import { useAuth } from '@/contexts/AuthContext';
import { Commission, CommissionStatus } from '@/types';
import { BankDetails } from '@/types/withdrawal';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { getAdminWhatsApp, createWhatsAppLink } from '@/lib/whatsapp';
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
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [minimumWithdrawal, setMinimumWithdrawal] = useState(50000);
  const [adminWhatsApp, setAdminWhatsApp] = useState('628123456789');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'commissions' | 'withdrawals'>('commissions');

  // State for withdrawal form
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
  });

  const { user } = useAuth();

  // DEBUG: Log all commissions to understand the data
  useEffect(() => {
    if (commissions.length > 0) {
      console.log('DEBUG: All commissions:', commissions.map(c => ({
        id: c.id,
        amount: c.amount,
        status: c.status,
        usedAmount: c.usedAmount,
        remaining: c.amount - (c.usedAmount || 0)
      })));
    }
  }, [commissions]);

  const fetchData = async () => {
    console.log('fetchData called, user:', user);
    if (!user?.id) {
      console.log('No user ID, returning');
      return;
    }
    
    setLoading(true);
    try {
      // Fetch commissions data
      const commissionsUrl = `/api/affiliator/commissions?affiliatorId=${user.id}`;
      console.log('Fetching commissions from:', commissionsUrl);
      const commissionsResponse = await fetch(commissionsUrl);
      const commissionsResult = await commissionsResponse.json();
      
       // Fetch settings for minimum withdrawal
       const settingsResponse = await fetch('/api/settings');
       const settingsResult = await settingsResponse.json();
       
       // Fetch withdrawal history
       const withdrawalsResponse = await fetch(`/api/affiliator/withdrawals?affiliatorId=${user.id}`);
       const withdrawalsResult = await withdrawalsResponse.json();

       console.log('Commissions API Response:', commissionsResult);
       console.log('Withdrawals API Response:', withdrawalsResult);
       console.log('Settings API Response:', settingsResult);
       
       if (commissionsResponse.ok && withdrawalsResponse.ok && settingsResponse.ok) {
          setCommissions(Array.isArray(commissionsResult) ? commissionsResult : []);
          setWithdrawals(Array.isArray(withdrawalsResult) ? withdrawalsResult : []);
          setMinimumWithdrawal(settingsResult.minimumWithdrawal || 50000);
          setAdminWhatsApp(settingsResult.adminWhatsApp || '628123456789');
          console.log('Commissions set:', Array.isArray(commissionsResult) ? commissionsResult.length : 0);
          console.log('Withdrawals set:', Array.isArray(withdrawalsResult) ? withdrawalsResult.length : 0);
          console.log('Minimum withdrawal set:', settingsResult.minimumWithdrawal || 50000);
          console.log('Admin WhatsApp set:', settingsResult.adminWhatsApp || '628123456789');
        } else {
          console.error('API Error:', { commissions: commissionsResult, withdrawals: withdrawalsResult, settings: settingsResult });
          toast.error('Gagal memuat data komisi');
        }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useEffect triggered, user:', user);
    if (user?.id) {
      console.log('User has ID, calling fetchData');
      fetchData();
    } else {
      console.log('No user ID, setting loading to false');
      setLoading(false);
    }
  }, [user?.id]);

  // Auto refresh every 30 seconds to check for withdrawal status updates
  useEffect(() => {
    if (user?.id && activeTab === 'withdrawals') {
      const interval = setInterval(() => {
        fetchData();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [user?.id, activeTab]);

  const handleRequestWithdrawal = async () => {
    if (!user?.id) return;
    
    const amount = Number(withdrawalAmount);
    if (!amount || amount < minimumWithdrawal || amount > availableForWithdrawal) {
      toast.error('Jumlah penarikan tidak valid');
      return;
    }

    if (!bankDetails.bankName || !bankDetails.accountHolderName || !bankDetails.accountNumber) {
      toast.error('Mohon lengkapi detail rekening bank');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/affiliator/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          affiliatorId: user.id,
          amount: amount,
          bankDetails,
        }),
      });
      const result = await response.json();
      if (response.ok) {
        toast.success('🎉 Permintaan penarikan berhasil dikirim!');
        setIsDialogOpen(false);
        setWithdrawalAmount('');
        await fetchData(); // Refresh data
      } else {
        toast.error(`Gagal: ${result.error}`);
      }
    } catch (error) {
      toast.error('Terjadi kesalahan.');
    } finally {
      // Small delay to ensure user sees the loading state
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  const getStatusBadge = (status: CommissionStatus) => {
    const styles: Record<CommissionStatus, string> = {
      pending: 'bg-accent/20 text-accent-foreground',
      approved: 'bg-primary/20 text-primary',
      paid: 'bg-success/20 text-success',
      cancelled: 'bg-destructive/20 text-destructive',
      withdrawn: 'bg-warning/20 text-warning',
      reserved: 'bg-orange/20 text-orange-600',
      processed: 'bg-gray/20 text-gray-600',
    };
    return styles[status] || 'bg-gray-100';
  };

  const getStatusIcon = (status: CommissionStatus) => {
    const icons: Record<CommissionStatus, React.ReactNode> = {
      pending: <Clock className="w-3 h-3" />,
      approved: <Check className="w-3 h-3" />,
      paid: <CreditCard className="w-3 h-3" />,
      cancelled: <XCircle className="w-3 h-3" />,
      withdrawn: <Wallet className="w-3 h-3" />,
      reserved: <Clock className="w-3 h-3" />,
      processed: <Sparkles className="w-3 h-3" />,
    };
    return icons[status];
  };

  // SIMPLE LOGIC:
  
  // 1. Untuk RIWAYAT KOMISI (HANYA komisi asli, tidak boleh ada partial sama sekali!)
  const historyCommissions = commissions.filter(c => !c.isPartial); // Hanya commission asli
  
  // 2. Untuk SALDO (hanya yang statusnya masih paid)
  const availableCommissions = commissions.filter(c => c.status === 'paid');
  
  // 3. Yang sedang dalam proses withdrawal
  const reservedCommissions = commissions.filter(c => c.status === 'reserved');
  
  // Hitung saldo yang bisa ditarik (hanya dari commission yang masih paid)
  const availableForWithdrawal = availableCommissions
    .reduce((sum, c) => {
      const usedAmount = c.usedAmount || 0;
      return sum + (c.amount - usedAmount);
    }, 0);
  
  const stats = {
    totalRevenue: historyCommissions.reduce((sum, c) => sum + c.amount, 0), // Total dari HANYA komisi asli
    withdrawable: availableForWithdrawal,
    availableForWithdrawal: availableForWithdrawal,
    reserved: reservedCommissions.reduce((sum, c) => sum + c.amount, 0),
    approved: commissions.filter(c => c.status === 'approved').reduce((sum, c) => sum + c.amount, 0),
    paid: availableForWithdrawal,
  };

  // DEBUG: Log stats calculation
  console.log('DEBUG Stats Calculation:', {
    totalCommissions: commissions.length,
    historyCommissions: historyCommissions.length,
    availableCommissions: availableCommissions.length,
    totalRevenue: stats.totalRevenue,
    availableForWithdrawal: stats.availableForWithdrawal,
    commissionsDetail: historyCommissions.map(c => ({
      amount: c.amount,
      status: c.status,
      usedAmount: c.usedAmount,
      remaining: c.amount - (c.usedAmount || 0)
    }))
  });

  return (
    <div className="space-y-6">
      {/* Header dengan Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 p-8 border">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/5 rounded-full -ml-12 -mb-12" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
              <Wallet className="w-8 h-8 text-primary" />
              Komisi & Penarikan
            </h1>
            <p className="text-muted-foreground">Kelola penghasilan Anda dan tarik dana dengan mudah</p>
          </div>
          
          <div className="flex gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="lg" 
                  className="relative overflow-hidden group"
                  disabled={stats.withdrawable <= 0}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-primary/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                  <Wallet className="w-4 h-4 mr-2 relative z-10" />
                  <span className="relative z-10">Ajukan Penarikan</span>
                  {stats.withdrawable > 0 && (
                    <div className="absolute -top-2 -right-2 w-3 h-3 bg-success rounded-full animate-pulse" />
                  )}
                </Button>
              </DialogTrigger>
            
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display flex items-center gap-2">
                  <ArrowUpRight className="w-6 h-6 text-primary" />
                  Form Penarikan Dana
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={(e) => { e.preventDefault(); handleRequestWithdrawal(); }} className="space-y-6 mt-4">
                {/* Amount Selection */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Saldo Dapat Ditarik</span>
                      <span className="text-xl font-bold text-primary">
                        {stats.withdrawable.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Saldo tersedia: {availableForWithdrawal.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Minimal penarikan: {minimumWithdrawal.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-base font-medium">Jumlah Penarikan</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">Rp</span>
                      <Input 
                        id="amount" 
                        type="number" 
                        value={withdrawalAmount} 
                        onChange={(e) => setWithdrawalAmount(e.target.value)} 
                        placeholder="0"
                        className="pl-12 text-lg h-12"
                      />
                    </div>
                    
                    {/* Validation Messages */}
                    {withdrawalAmount && Number(withdrawalAmount) > 0 && (
                      <div className="space-y-2">
                        {Number(withdrawalAmount) < minimumWithdrawal && (
                          <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 p-2 rounded">
                            <AlertCircle className="w-4 h-4" />
                            <span>Minimal penarikan adalah {minimumWithdrawal.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span>
                          </div>
                        )}
                        {Number(withdrawalAmount) > availableForWithdrawal && (
                          <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 p-2 rounded">
                            <AlertCircle className="w-4 h-4" />
                            <span>Melebihi saldo yang tersedia</span>
                          </div>
                        )}
                        {Number(withdrawalAmount) >= minimumWithdrawal && Number(withdrawalAmount) <= availableForWithdrawal && (
                          <div className="flex items-center gap-2 text-sm text-success bg-success/10 p-2 rounded">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Jumlah penarikan valid</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bank Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2 pt-4 border-t">
                    <Landmark className="w-5 h-5 text-primary" />
                    Detail Rekening Bank
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="bankName">Nama Bank</Label>
                      <Input 
                        id="bankName" 
                        value={bankDetails.bankName} 
                        onChange={(e) => setBankDetails(prev => ({...prev, bankName: e.target.value}))} 
                        placeholder="contoh: Bank Central Asia (BCA)" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountHolderName">Nama Pemilik Rekening</Label>
                      <Input 
                        id="accountHolderName" 
                        value={bankDetails.accountHolderName} 
                        onChange={(e) => setBankDetails(prev => ({...prev, accountHolderName: e.target.value}))} 
                        placeholder="contoh: John Doe" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountNumber">Nomor Rekening</Label>
                      <Input 
                        id="accountNumber" 
                        value={bankDetails.accountNumber} 
                        onChange={(e) => setBankDetails(prev => ({...prev, accountNumber: e.target.value}))} 
                        placeholder="contoh: 1234567890" 
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4 border-t">
                  <Button 
                    type="submit"
                    disabled={!withdrawalAmount || 
                            Number(withdrawalAmount) < minimumWithdrawal || 
                            Number(withdrawalAmount) > availableForWithdrawal ||
                            !bankDetails.bankName?.trim() || 
                            !bankDetails.accountHolderName?.trim() || 
                            !bankDetails.accountNumber?.trim()}
                    className="min-w-[150px]"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Kirim Permintaan
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
           {/* Tombol request ke admin */}
           <Button 
             variant="outline"
             size="lg" 
             onClick={() => window.open(createWhatsAppLink(adminWhatsApp, 'Halo Admin, saya ingin mengajukan penarikan dana afiliasi.'), '_blank')}
           >
             <AlertCircle className="w-4 h-4 mr-2" />
             Hubungi Admin
           </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => 
            <Skeleton key={i} className="h-28" />
          )
        ) : (
          <>
            <StatCard title="Total Pendapatan" value={stats.totalRevenue.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })} icon={Landmark} variant="primary" delay={0} />
            <StatCard title="Saldo Dapat Ditarik" value={stats.availableForWithdrawal.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })} icon={Banknote} delay={0.1} />
            <StatCard title="Sedang Diproses" value={stats.reserved.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })} icon={Clock} delay={0.2} />
            <StatCard title="Total Dapat Ditarik" value={stats.paid.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })} icon={CreditCard} delay={0.3} />
          </>
        )}
      </div>

      {/* Tab Navigation */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4 border-b">
            <button
              onClick={() => setActiveTab('commissions')}
              className={`pb-3 px-1 font-medium transition-colors border-b-2 ${
                activeTab === 'commissions'
                  ? 'text-primary border-primary'
                  : 'text-muted-foreground border-transparent hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Riwayat Komisi
              </div>
            </button>
            <button
              onClick={() => setActiveTab('withdrawals')}
              className={`pb-3 px-1 font-medium transition-colors border-b-2 ${
                activeTab === 'withdrawals'
                  ? 'text-primary border-primary'
                  : 'text-muted-foreground border-transparent hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Riwayat Penarikan
              </div>
            </button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {activeTab === 'commissions' ? (
            // Commission Tab
            loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => 
                  <Skeleton key={i} className="h-20" />
                )}
              </div>
            ) : commissions.length > 0 ? (
              <div className="space-y-4">
                {historyCommissions
                  .filter(commission => commission.status !== 'withdrawn')
                  .map((commission, index) => (
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
                       <div className="text-right">
                         <p className="text-xl font-display font-bold text-success">
                           +{commission.amount.toLocaleString('id-ID', {
                             style: 'currency',
                             currency: 'IDR',
                             minimumFractionDigits: 0,
                           })}
                         </p>
                         {(commission.usedAmount && commission.usedAmount > 0) && (
                           <p className="text-xs text-muted-foreground">
                             Terpakai: {commission.usedAmount.toLocaleString('id-ID', {
                               style: 'currency',
                               currency: 'IDR',
                               minimumFractionDigits: 0,
                             })}
                           </p>
                         )}
                       </div>
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
            )
          ) : (
            // Withdrawals Tab
            loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => 
                  <Skeleton key={i} className="h-20" />
                )}
              </div>
            ) : withdrawals.length > 0 ? (
              <div className="space-y-4">
                {withdrawals.map((withdrawal, index) => (
                  <motion.div
                    key={withdrawal.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        withdrawal.status === 'approved' ? 'bg-success/20 text-success' :
                        withdrawal.status === 'rejected' ? 'bg-destructive/20 text-destructive' :
                        withdrawal.status === 'completed' ? 'bg-success/20 text-success' :
                        'bg-accent/20 text-accent-foreground'
                      }`}>
                        {withdrawal.status === 'approved' ? <Check className="w-5 h-5" /> :
                         withdrawal.status === 'rejected' ? <XCircle className="w-5 h-5" /> :
                         withdrawal.status === 'completed' ? <CreditCard className="w-5 h-5" /> :
                         <Clock className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          Penarikan Dana
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Bank: {withdrawal.bankDetails?.bankName || 'N/A'}
                        </p>
                         <p className="text-xs text-muted-foreground">
                           {new Date(withdrawal.requestedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                         </p>
                         {withdrawal.rejectionReason && (
                           <p className="text-xs text-destructive mt-1">
                             Alasan: {withdrawal.rejectionReason}
                           </p>
                         )}
                       </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <p className="text-xl font-display font-bold text-primary">
                        {withdrawal.amount.toLocaleString('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0,
                        })}
                      </p>
                      <Badge className={`${
                        withdrawal.status === 'approved' ? 'bg-success/20 text-success' :
                        withdrawal.status === 'rejected' ? 'bg-destructive/20 text-destructive' :
                        withdrawal.status === 'completed' ? 'bg-success/20 text-success' :
                        'bg-accent/20 text-accent-foreground'
                      } flex items-center gap-1 capitalize`}>
                        {withdrawal.status === 'approved' ? <Check className="w-3 h-3" /> :
                         withdrawal.status === 'rejected' ? <XCircle className="w-3 h-3" /> :
                         withdrawal.status === 'completed' ? <CreditCard className="w-3 h-3" /> :
                         <Clock className="w-3 h-3" />}
                        {withdrawal.status === 'approved' ? 'Disetujui' :
                         withdrawal.status === 'rejected' ? 'Ditolak' :
                         withdrawal.status === 'completed' ? 'Selesai' :
                         'Menunggu'}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Wallet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Belum ada penarikan</h3>
                <p className="text-muted-foreground">
                  Ajukan penarikan dana untuk melihat riwayatnya di sini
                </p>
              </div>
            )
          )}
        </CardContent>
      </Card>
      </div>
     );
  }