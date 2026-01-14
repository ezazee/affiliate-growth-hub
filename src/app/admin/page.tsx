"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  Landmark, 
  Users, 
  Package,
  TrendingUp,
  Clock,
  DollarSign,
  UserCheck,
  Link,
  MoreHorizontal
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface AffiliatorStats {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  stats: {
    totalLinks: number;
    totalOrders: number;
    paidOrders: number;
    totalRevenue: number;
    totalCommission: number;
    paidCommission: number;
    withdrawableCommission: number;
    conversionRate: string;
  };
}

interface AdminStats {
  totalAffiliators: number;
  totalOrders: number;
  paidOrders: number;
  totalRevenue: number;
  totalCommission: number;
  netRevenue: number; // Pendapatan bersih
  activeAffiliators: number;
}

interface DashboardData {
  overallStats: AdminStats;
  affiliators: AffiliatorStats[];
}

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/admin/dashboard');
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        }
      } catch (error) {
        console.error('Failed to fetch admin dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
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
                title="Total Afiliasi"
                value={dashboardData?.overallStats.totalAffiliators.toString() || '0'}
                icon={Users}
                delay={0}
              />
              <StatCard
                title="Afiliasi Aktif"
                value={dashboardData?.overallStats.activeAffiliators.toString() || '0'}
                icon={UserCheck}
                delay={0.1}
              />
              <StatCard
                title="Total Pesanan"
                value={dashboardData?.overallStats.totalOrders.toString() || '0'}
                icon={ShoppingCart}
                delay={0.2}
              />
              <StatCard
                title="Pendapatan Bersih"
                value={
                  dashboardData?.overallStats.netRevenue.toLocaleString('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }) || 'Rp0'
                }
                icon={Landmark}
                variant="primary"
                delay={0.3}
              />
            </>
          )}
        </div>

        {/* All Affiliators */}
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Daftar Afiliasi
            </CardTitle>
            <Badge variant="secondary">
              {dashboardData?.affiliators.length || 0} total
            </Badge>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-64 mb-4" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : dashboardData?.affiliators && dashboardData.affiliators.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.affiliators.map((affiliator, index) => (
                  <motion.div
                    key={affiliator.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="border rounded-lg p-4 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      {/* Affiliator Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
                            <span className="font-bold text-primary-foreground">
                              {affiliator.name?.charAt(0)?.toUpperCase() || 'A'}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground text-lg">{affiliator.name}</h3>
                            <p className="text-sm text-muted-foreground">{affiliator.email}</p>
                            <p className="text-xs text-muted-foreground">
                              Bergabung: {new Date(affiliator.createdAt).toLocaleDateString('id-ID', { 
                                day: 'numeric', 
                                month: 'long', 
                                year: 'numeric' 
                              })}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 min-w-[320px]">
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <Link className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                          <p className="text-xs text-muted-foreground">Link</p>
                          <p className="font-bold text-foreground">{affiliator.stats.totalLinks}</p>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <ShoppingCart className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                          <p className="text-xs text-muted-foreground">Pesanan</p>
                          <p className="font-bold text-foreground">{affiliator.stats.totalOrders}</p>
                        </div>
                        <div className="text-center p-3 bg-success/10 rounded-lg">
                          <DollarSign className="w-4 h-4 mx-auto text-success mb-1" />
                          <p className="text-xs text-muted-foreground">Komisi</p>
                          <p className="font-bold text-success">
                            {affiliator.stats.totalCommission.toLocaleString('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                              minimumFractionDigits: 0,
                            })}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-primary/10 rounded-lg">
                          <TrendingUp className="w-4 h-4 mx-auto text-primary mb-1" />
                          <p className="text-xs text-muted-foreground">Konversi</p>
                          <p className="font-bold text-primary">{affiliator.stats.conversionRate}%</p>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Stats */}
                    <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pesanan Dibayar:</span>
                        <span className="font-medium">{affiliator.stats.paidOrders}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Pendapatan:</span>
                        <span className="font-medium">
                          {affiliator.stats.totalRevenue.toLocaleString('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Komisi Bisa Ditarik:</span>
                        <span className="font-medium text-primary">
                          {affiliator.stats.withdrawableCommission.toLocaleString('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                          })}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Belum Ada Afiliasi</h3>
                <p className="text-muted-foreground">Belum ada affiliator yang terdaftar dalam sistem.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  );
}

