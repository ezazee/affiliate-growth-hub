"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Link as LinkIcon, 
  DollarSign, 
  ShoppingCart, 
  TrendingUp,
  ExternalLink,
  Copy
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { AffiliateLink, Commission } from '@/types';

interface AffiliatorStats {
  totalRevenue: number;
  totalCommissions: number;
  totalOrders: number;
  conversionRate: string;
}

export default function AffiliatorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AffiliatorStats | null>(null);
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLink[]>([]);
  const [recentCommissions, setRecentCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        const [statsResponse, linksResponse, commissionsResponse] = await Promise.all([
          fetch(`/api/affiliator/stats?affiliatorId=${user.id}`),
          fetch(`/api/affiliator/links?affiliatorId=${user.id}`),
          fetch(`/api/affiliator/commissions?affiliatorId=${user.id}`),
        ]);

        if (statsResponse.ok && linksResponse.ok && commissionsResponse.ok) {
          const statsData = await statsResponse.json();
          const linksData = await linksResponse.json();
          const commissionsData = await commissionsResponse.json();
          setStats(statsData);
          setAffiliateLinks(linksData);
          setRecentCommissions(commissionsData.slice(0, 3)); // Get top 3 recent commissions
        } else {
          toast.error('Failed to load dashboard data.');
        }
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
        toast.error('An error occurred while loading data.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [user]);

  const copyLink = (code: string, productSlug: string) => {
    const link = `${window.location.origin}/checkout/${productSlug}?ref=${code}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard!');
  };

  const getCommissionStatusBadge = (status: Commission['status']) => {
    const styles: Record<Commission['status'], string> = {
      pending: 'bg-accent/20 text-accent-foreground',
      approved: 'bg-primary/20 text-primary',
      paid: 'bg-success/20 text-success',
      cancelled: 'bg-destructive/20 text-destructive', // Commissions from API can have 'cancelled'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  return (
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your affiliate performance
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
                title="Total Earnings"
                value={
                  stats?.totalCommissions.toLocaleString('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }) || 'Rp0'
                }
                icon={DollarSign}
                variant="primary"
                delay={0}
              />
              <StatCard
                title="Active Links"
                value={affiliateLinks.length.toString()}
                icon={LinkIcon}
                delay={0.1}
              />
              <StatCard
                title="Total Conversions"
                value={stats?.totalOrders.toString() || '0'}
                icon={ShoppingCart}
                delay={0.2}
              />
              <StatCard
                title="Conversion Rate"
                value={`${stats?.conversionRate || '0.00'}%`}
                icon={TrendingUp}
                delay={0.3}
              />
            </>
          )}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Affiliate Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-primary" />
                  Your Affiliate Links
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-20" />
                    <Skeleton className="h-20" />
                  </div>
                ) : affiliateLinks.length > 0 ? (
                  <div className="space-y-4">
                    {affiliateLinks.map((link, index) => (
                      <div key={link.id} className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium text-foreground">{link.product?.name || 'Unknown Product'}</h3>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => copyLink(link.code, link.product?.slug || 'unknown')}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Code</p>
                            <p className="font-semibold text-foreground">{link.code}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Commission</p>
                            <p className="font-semibold text-foreground">
                              {link.product?.commissionValue && link.product?.commissionType
                                ? `${link.product.commissionValue}${link.product.commissionType === 'percentage' ? '%' : ''}`
                                : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Status</p>
                            <Badge variant={link.isActive ? 'default' : 'secondary'}>
                              {link.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No affiliate links yet.</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Commissions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-success" />
                  Recent Commissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-20" />
                    <Skeleton className="h-20" />
                  </div>
                ) : recentCommissions.length > 0 ? (
                  <div className="space-y-4">
                    {recentCommissions.map((commission) => (
                      <div key={commission.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                        <div>
                          <p className="font-medium text-foreground">{commission.productName}</p>
                          <p className="text-sm text-muted-foreground">{new Date(commission.date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">
                            {commission.amount.toLocaleString('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            })}
                          </p>
                          <Badge 
                            variant="secondary"
                            className={getCommissionStatusBadge(commission.status)}
                          >
                            {commission.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No recent commissions.</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Tip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 shadow-card">
            <CardContent className="py-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground mb-1">
                    Pro Tip: Increase Your Earnings
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Share your affiliate links on social media and email newsletters to reach more potential customers. 
                    Products with higher conversion rates should be prioritized in your promotions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
  );
}