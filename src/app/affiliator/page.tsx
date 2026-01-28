"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Link as LinkIcon,
  Landmark,
  ShoppingCart,
  TrendingUp,
  Users,
  BarChart as BarChartIcon,
  Calendar as CalendarIcon,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { DateRange } from 'react-day-picker';
import { startOfWeek, startOfMonth, startOfYear, format, startOfDay } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { AffiliateLink, Commission, Order, OrderStatus, CommissionStatus } from '@/types';
import { cn } from '@/lib/utils';
import { Wallet } from 'lucide-react';


interface AffiliatorStats {
  totalRevenue: number;
  totalOrders: number;
  conversionRate: string;
}

export default function AffiliatorDashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState<AffiliatorStats | null>(null);
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLink[]>([]);
  const [recentCommissions, setRecentCommissions] = useState<Commission[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [productKeys, setProductKeys] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'commissions' | 'withdrawals'>('commissions');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => ({
    from: startOfDay(new Date()),
    to: new Date()
  }));

  const totalClicks = useMemo(() => {
    return chartData.reduce((acc, item) =>
      acc + Object.values(item).reduce((a: any, b: any) =>
        typeof b === 'number' ? a + b : a, 0), 0
    );
  }, [chartData]);

  const handleFilterClick = (filter: 'weekly' | 'monthly' | 'yearly') => {
    if (activeFilter === filter) {
      setActiveFilter(null);
      setDateRange({ from: startOfDay(new Date()), to: new Date() });
    } else {
      setActiveFilter(filter);
      let fromDate;
      if (filter === 'weekly') fromDate = startOfWeek(new Date());
      if (filter === 'monthly') fromDate = startOfMonth(new Date());
      if (filter === 'yearly') fromDate = startOfYear(new Date());
      setDateRange({ from: fromDate, to: new Date() });
    }
  };

  const processChartData = useCallback((data: any[], links: AffiliateLink[]) => {
    if (!data || !links || data.length === 0) {
      setChartData([]);
      setProductKeys([]);
      return;
    }

    // Use productName directly from API response
    const productNames = Array.from(new Set(data.map(item => item.productName)));
    setProductKeys(productNames);

    const pivotedData = data.reduce((acc: Record<string, any>, item) => {
      const date = item.date;
      const productName = item.productName;

      if (!acc[date]) {
        acc[date] = { date };
        productNames.forEach(name => {
          acc[date][name] = 0;
        });
      }

      acc[date][productName] = (acc[date][productName] || 0) + (item.clicks || 0);

      return acc;
    }, {});

    const result = Object.values(pivotedData);
    setChartData(result);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchLinkPerformance = async () => {
      if (!user?.id || !dateRange?.from || !dateRange?.to || affiliateLinks.length === 0) {
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/affiliator/link-performance?affiliatorId=${user.id}&startDate=${format(dateRange.from, 'yyyy-MM-dd')}&endDate=${format(dateRange.to, 'yyyy-MM-dd')}`
        );

        if (response.ok) {
          const data = await response.json();
          if (isMounted) {
            processChartData(data, affiliateLinks);
          }
        } else {

        }
      } catch (error) {
        console.error('Gagal mengambil data chart:', error);

      }
    };

    fetchLinkPerformance();

    return () => {
      isMounted = false;
    };
  }, [user, dateRange, affiliateLinks, processChartData]);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        const [
          statsResponse,
          linksResponse,
          commissionsResponse,
          ordersResponse,
        ] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/affiliator/stats?affiliatorId=${user.id}`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/affiliator/links?affiliatorId=${user.id}`, {
            cache: "no-store",
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/affiliator/commissions?affiliatorId=${user.id}`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/affiliator/customers?affiliatorId=${user.id}`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/affiliator/withdrawals?affiliatorId=${user.id}`),
        ]);

        if (
          statsResponse.ok &&
          linksResponse.ok &&
          commissionsResponse.ok &&
          ordersResponse.ok
        ) {
          const statsData = await statsResponse.json();
          const linksData = await linksResponse.json();
          const commissionsData = await commissionsResponse.json();
          const ordersData = await ordersResponse.json();
          setStats(statsData);
          setAffiliateLinks(linksData);
          setRecentCommissions(commissionsData.slice(0, 5));
          setRecentOrders(ordersData.slice(0, 5));
        } else {

        }
      } catch (error) {
        console.error("Gagal mengambil data awal:", error);

      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [user]);

  const getCommissionStatusBadge = (status: CommissionStatus) => {
    const styles: Record<CommissionStatus, string> = {
      pending: "bg-accent/20 text-accent-foreground",
      approved: "bg-primary/20 text-primary",
      paid: "bg-success/20 text-success",
      cancelled: "bg-destructive/20 text-destructive",
      withdrawn: "bg-warning/20 text-warning",
      reserved: "bg-orange/20 text-orange-600",
      processed: "bg-gray/20 text-gray-600",
    };
    return styles[status];
  };

  const getOrderStatusBadge = (status: OrderStatus) => {
    const styles: Record<OrderStatus, string> = {
      pending: "bg-accent/20 text-accent-foreground",
      paid: "bg-success/20 text-success",
      cancelled: "bg-destructive/20 text-destructive",
      shipping: "bg-blue-500/20 text-blue-500",
    };
    return styles[status];
  };

  const chartColors = useMemo(() => [
    '#8884d8',
    '#82ca9d',
    '#ffc658',
    '#ff7c7c',
    '#8dd1e1',
    '#d084d0',
    '#ffb347',
    '#67b7dc'
  ], []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Selamat datang kembali, {user?.name?.split(" ")[0]}! 👋
          </h1>
          <p className="text-muted-foreground">
            Berikut adalah ringkasan performa afiliasi Anda
          </p>
        </div>

      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
              title="Total Pendapatan"
              value={
                stats?.totalRevenue.toLocaleString("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }) || "Rp0"
              }
              icon={Landmark}
              variant="primary"
              delay={0}
            />
            <StatCard
              title="Link Aktif"
              value={affiliateLinks.length.toString()}
              icon={LinkIcon}
              delay={0.1}
            />
            <StatCard
              title="Total Konversi"
              value={stats?.totalOrders.toString() || "0"}
              icon={ShoppingCart}
              delay={0.2}
            />
            <StatCard
              title="Total Klik (Rentang Tanggal)"
              value={totalClicks.toString()}
              icon={BarChartIcon}
              delay={0.3}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <BarChartIcon className="w-5 h-5 text-primary" />
                    Performa Link (Klik per Hari)
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant={activeFilter === 'weekly' ? 'default' : 'outline'} size="sm" onClick={() => handleFilterClick('weekly')}>Mingguan</Button>
                    <Button variant={activeFilter === 'monthly' ? 'default' : 'outline'} size="sm" onClick={() => handleFilterClick('monthly')}>Bulanan</Button>
                    <Button variant={activeFilter === 'yearly' ? 'default' : 'outline'} size="sm" onClick={() => handleFilterClick('yearly')}>Tahunan</Button>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="date"
                          variant={"outline"}
                          className={cn(
                            "w-[240px] justify-start text-left font-normal",
                            !dateRange && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange?.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "LLL dd, y")} -{" "}
                                {format(dateRange.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(dateRange.from, "LLL dd, y")
                            )
                          ) : (
                            <span>Pilih tanggal</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={dateRange?.from}
                          selected={dateRange}
                          onSelect={(range) => {
                            setDateRange(range);
                            setActiveFilter(null);
                          }}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-72" />
                ) : chartData.length > 0 ? (
                  <div style={{ width: '100%', height: '400px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 12 }}
                          stroke="hsl(var(--foreground))"
                          interval={Math.floor(chartData.length / 10)}
                        />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="hsl(var(--foreground))" />
                        <Tooltip
                          cursor={{ fill: 'hsl(var(--primary) / 0.1)' }}
                          contentStyle={{
                            background: 'hsl(var(--card))',
                            borderColor: 'hsl(var(--border))',
                            borderRadius: 'var(--radius)',
                          }}
                        />
                        <Legend />
                        {productKeys.map((key, index) => (
                          <Bar
                            key={key}
                            dataKey={key}
                            fill={chartColors[index % chartColors.length]}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={50}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">Tidak ada data klik untuk ditampilkan pada rentang tanggal ini.</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Commission & Withdrawal Summary Cards */}
          <div className="space-y-6">
            {/* Commission Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Card className="bg-gradient-to-r from-primary/10 to-success/10 border-primary/20 shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-primary" />
                    Total Komisi
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <div className="text-center">
                    <p className="text-3xl font-display font-bold text-primary">
                      {stats?.totalRevenue?.toLocaleString("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }) || "Rp0"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Dari {stats?.totalOrders || 0} transaksi
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          {/* Quick Tip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.8 }}
          >
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 shadow-card">
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground mb-1">
                      Tips Pro: Tingkatkan Penghasilan Anda
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Bagikan link afiliasi Anda di media sosial dan buletin email
                      untuk menjangkau lebih banyak calon pelanggan. Produk dengan
                      tingkat konversi lebih tinggi harus diprioritaskan dalam
                      promosi Anda.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <div className="w-full">
        {/* Recent Customer History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Riwayat Pelanggan Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pelanggan</TableHead>
                    <TableHead>Produk</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-5 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-40" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-24" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div className="font-medium">{order.buyerName}</div>
                          <div className="text-sm text-muted-foreground">
                            {order.buyerPhone}
                          </div>
                        </TableCell>
                        <TableCell>{order.product?.name || "N/A"}</TableCell>
                        <TableCell>
                          <Badge className={getOrderStatusBadge(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12">
                        Belum ada pesanan terbaru.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
