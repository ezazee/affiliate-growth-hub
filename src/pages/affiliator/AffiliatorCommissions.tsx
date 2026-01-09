import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Clock, Check, CreditCard, TrendingUp } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/StatCard';
import { commissions, getCommissionsByAffiliatorId, orders, getProductById } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { CommissionStatus } from '@/types';

export default function AffiliatorCommissions() {
  const { user } = useAuth();
  const myCommissions = user ? getCommissionsByAffiliatorId(user.id) : [];

  const getOrderDetails = (orderId: string) => orders.find(o => o.id === orderId);

  const getStatusBadge = (status: CommissionStatus) => {
    const styles: Record<CommissionStatus, string> = {
      pending: 'bg-accent/20 text-accent-foreground',
      approved: 'bg-primary/20 text-primary',
      paid: 'bg-success/20 text-success',
    };
    return styles[status];
  };

  const getStatusIcon = (status: CommissionStatus) => {
    const icons: Record<CommissionStatus, React.ReactNode> = {
      pending: <Clock className="w-3 h-3" />,
      approved: <Check className="w-3 h-3" />,
      paid: <CreditCard className="w-3 h-3" />,
    };
    return icons[status];
  };

  const stats = {
    total: myCommissions.reduce((sum, c) => sum + c.amount, 0),
    pending: myCommissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.amount, 0),
    approved: myCommissions.filter(c => c.status === 'approved').reduce((sum, c) => sum + c.amount, 0),
    paid: myCommissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.amount, 0),
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">My Commissions</h1>
          <p className="text-muted-foreground">Track your earnings and payout status</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Earned"
            value={`$${stats.total.toFixed(2)}`}
            icon={DollarSign}
            variant="primary"
            delay={0}
          />
          <StatCard
            title="Pending"
            value={`$${stats.pending.toFixed(2)}`}
            icon={Clock}
            delay={0.1}
          />
          <StatCard
            title="Approved"
            value={`$${stats.approved.toFixed(2)}`}
            icon={Check}
            delay={0.2}
          />
          <StatCard
            title="Paid Out"
            value={`$${stats.paid.toFixed(2)}`}
            icon={CreditCard}
            delay={0.3}
          />
        </div>

        {/* Commissions List */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Commission History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {myCommissions.length > 0 ? (
              <div className="space-y-4">
                {myCommissions.map((commission, index) => {
                  const order = getOrderDetails(commission.orderId);
                  const product = order ? getProductById(order.productId) : null;
                  
                  return (
                    <motion.div
                      key={commission.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {product?.name || 'Unknown Product'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Order from {order?.buyerName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(commission.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <p className="text-xl font-display font-bold text-success">
                          +${commission.amount.toFixed(2)}
                        </p>
                        <Badge className={`${getStatusBadge(commission.status)} flex items-center gap-1`}>
                          {getStatusIcon(commission.status)}
                          {commission.status}
                        </Badge>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-foreground mb-2">No commissions yet</h3>
                <p className="text-muted-foreground">
                  Start sharing your affiliate links to earn commissions
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground mb-1">
                  How Payouts Work
                </h3>
                <p className="text-muted-foreground text-sm">
                  Once your commission is approved, our admin team will process your payout. 
                  Payments are made via bank transfer and typically processed within 7 business days.
                  Make sure your payment details are up to date in your profile.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
