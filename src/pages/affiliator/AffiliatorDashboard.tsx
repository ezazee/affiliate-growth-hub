import React from 'react';
import { motion } from 'framer-motion';
import { 
  Link as LinkIcon, 
  DollarSign, 
  ShoppingCart, 
  TrendingUp,
  ExternalLink,
  Copy
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Mock data for demo
const affiliateLinks = [
  { id: '1', product: 'Premium Course', code: 'ABC123', clicks: 245, conversions: 12, earnings: 598 },
  { id: '2', product: 'E-Book Bundle', code: 'DEF456', clicks: 156, conversions: 8, earnings: 196 },
  { id: '3', product: 'Membership', code: 'GHI789', clicks: 89, conversions: 5, earnings: 245 },
];

const recentCommissions = [
  { id: '1', product: 'Premium Course', amount: 49.90, status: 'approved', date: '2024-01-15' },
  { id: '2', product: 'E-Book Bundle', amount: 24.50, status: 'pending', date: '2024-01-14' },
  { id: '3', product: 'Premium Course', amount: 49.90, status: 'paid', date: '2024-01-10' },
];

export default function AffiliatorDashboard() {
  const { user } = useAuth();

  const copyLink = (code: string) => {
    const link = `https://yoursite.com/checkout/product?ref=${code}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard!');
  };

  return (
    <DashboardLayout>
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
          <StatCard
            title="Total Earnings"
            value="$1,039"
            icon={DollarSign}
            trend={{ value: 15, isPositive: true }}
            variant="primary"
            delay={0}
          />
          <StatCard
            title="Active Links"
            value="3"
            icon={LinkIcon}
            delay={0.1}
          />
          <StatCard
            title="Total Conversions"
            value="25"
            icon={ShoppingCart}
            trend={{ value: 8, isPositive: true }}
            delay={0.2}
          />
          <StatCard
            title="Conversion Rate"
            value="5.1%"
            icon={TrendingUp}
            trend={{ value: 2, isPositive: true }}
            delay={0.3}
          />
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
                <div className="space-y-4">
                  {affiliateLinks.map((link) => (
                    <div key={link.id} className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-foreground">{link.product}</h3>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => copyLink(link.code)}
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
                          <p className="text-muted-foreground">Clicks</p>
                          <p className="font-semibold text-foreground">{link.clicks}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Conversions</p>
                          <p className="font-semibold text-foreground">{link.conversions}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Earnings</p>
                          <p className="font-semibold text-primary">${link.earnings}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
                <div className="space-y-4">
                  {recentCommissions.map((commission) => (
                    <div key={commission.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                      <div>
                        <p className="font-medium text-foreground">{commission.product}</p>
                        <p className="text-sm text-muted-foreground">{commission.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">${commission.amount}</p>
                        <Badge 
                          variant="secondary"
                          className={
                            commission.status === 'paid' 
                              ? 'bg-success/20 text-success' 
                              : commission.status === 'approved'
                                ? 'bg-primary/20 text-primary'
                                : 'bg-accent/20 text-accent-foreground'
                          }
                        >
                          {commission.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
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
    </DashboardLayout>
  );
}
