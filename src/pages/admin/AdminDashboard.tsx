import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  DollarSign, 
  Users, 
  Package,
  TrendingUp,
  Clock
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Overview of your affiliate program performance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Orders"
            value="156"
            icon={ShoppingCart}
            trend={{ value: 12, isPositive: true }}
            delay={0}
          />
          <StatCard
            title="Total Revenue"
            value="$24,580"
            icon={DollarSign}
            trend={{ value: 8, isPositive: true }}
            variant="primary"
            delay={0.1}
          />
          <StatCard
            title="Active Affiliators"
            value="42"
            icon={Users}
            trend={{ value: 5, isPositive: true }}
            delay={0.2}
          />
          <StatCard
            title="Products"
            value="12"
            icon={Package}
            delay={0.3}
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Recent Orders
                </CardTitle>
                <Badge variant="secondary">Today</Badge>
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
                        <p className="font-semibold text-foreground">${order.amount}</p>
                        <Badge 
                          variant={order.status === 'paid' ? 'default' : 'secondary'}
                          className={order.status === 'paid' ? 'bg-success text-success-foreground' : ''}
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pending Affiliators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <Clock className="w-5 h-5 text-accent" />
                  Pending Approvals
                </CardTitle>
                <Badge className="bg-accent text-accent-foreground">{pendingAffiliators.length} new</Badge>
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
                    No pending approvals
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
