"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  Landmark, 
  Users, 
  Package,
  TrendingUp,
  Clock
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// Mock data for demo
const recentOrders = [
  { id: '1', buyer: 'Alice Johnson', product: 'Premium Course', amount: 299, status: 'paid', date: '2024-01-15' },
  { id: '2', buyer: 'Bob Smith', product: 'E-Book Bundle', amount: 49, status: 'pending', date: '2024-01-15' },
  { id: '3', buyer: 'Carol White', product: 'Membership', amount: 99, status: 'paid', date: '2024-01-14' },
  { id: '4', buyer: 'David Brown', product: 'Premium Course', amount: 299, status: 'pending', date: '2024-01-14' },
];

const pendingAffiliators = [
  { id: '1', name: 'Emma Wilson', email: 'emma@example.com', date: '2024-01-15' },
  { id: '2', name: 'Frank Miller', email: 'frank@example.com', date: '2024-01-14' },
];

interface AdminStats {
  totalRevenue: number;
  totalAffiliators: number;
  totalOrders: number;
  totalCommissions: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Dasbor Admin
          </h1>
          <p className="text-muted-foreground">
            Ikhtisar performa program afiliasi Anda
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            <>
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </>
          ) : (
            <>
              <StatCard
                title="Total Pesanan"
                value={stats?.totalOrders.toString() || '0'}
                icon={ShoppingCart}
                delay={0}
              />
              <StatCard
                title="Total Pendapatan"
                value={
                  stats?.totalRevenue.toLocaleString('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }) || 'Rp0'
                }
                icon={Landmark}
                variant="primary"
                delay={0.1}
              />
              <StatCard
                title="Afiliasi Aktif"
                value={stats?.totalAffiliators.toString() || '0'}
                icon={Users}
                delay={0.2}
              />
              <StatCard
                title="Total Komisi"
                value={
                  stats?.totalCommissions.toLocaleString('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }) || 'Rp0'
                }
                icon={Package}
                delay={0.3}
              />
            </>
          )}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pesanan Terbaru */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Pesanan Terbaru
                </CardTitle>
                <Badge variant="secondary">Hari Ini</Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{order.buyer}</p>
                        <p className="text-sm text-muted-foreground">{order.product}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          {order.amount.toLocaleString('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </p>
                        <Badge 
                          variant={order.status === 'paid' ? 'default' : 'secondary'}
                          className={order.status === 'paid' ? 'bg-success text-success-foreground' : ''}
                        >
                          {order.status === 'paid' ? 'dibayar' : 'tertunda'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Persetujuan Tertunda */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <Clock className="w-5 h-5 text-accent" />
                  Persetujuan Tertunda
                </CardTitle>
                <Badge className="bg-accent text-accent-foreground">{pendingAffiliators.length} baru</Badge>
              </CardHeader>
              <CardContent>
                {pendingAffiliators.length > 0 ? (
                  <div className="space-y-4">
                    {pendingAffiliators.map((affiliator) => (
                      <div key={affiliator.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="font-semibold text-primary">
                              {affiliator.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{affiliator.name}</p>
                            <p className="text-sm text-muted-foreground">{affiliator.email}</p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">{affiliator.date}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Tidak ada persetujuan tertunda
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
  );
}

