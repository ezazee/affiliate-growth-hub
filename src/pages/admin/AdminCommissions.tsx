import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, DollarSign, Check, Clock, CreditCard } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { commissions as initialCommissions, getUserById, getProductById, orders } from '@/data/mockData';
import { Commission, CommissionStatus } from '@/types';
import { toast } from 'sonner';

export default function AdminCommissions() {
  const [commissions, setCommissions] = useState<Commission[]>(initialCommissions);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const getOrderDetails = (orderId: string) => orders.find(o => o.id === orderId);

  const filteredCommissions = commissions.filter(c => {
    const affiliator = getUserById(c.affiliatorId);
    const matchesSearch = affiliator?.name.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateStatus = (commissionId: string, newStatus: CommissionStatus) => {
    setCommissions(prev => prev.map(c => 
      c.id === commissionId ? { ...c, status: newStatus } : c
    ));
    toast.success(`Commission ${newStatus}`);
  };

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
    total: commissions.reduce((sum, c) => sum + c.amount, 0),
    pending: commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.amount, 0),
    approved: commissions.filter(c => c.status === 'approved').reduce((sum, c) => sum + c.amount, 0),
    paid: commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.amount, 0),
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Commissions</h1>
          <p className="text-muted-foreground">Manage affiliator commission payouts</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: `$${stats.total.toFixed(2)}`, color: 'bg-primary/10 text-primary' },
            { label: 'Pending', value: `$${stats.pending.toFixed(2)}`, color: 'bg-accent/10 text-accent-foreground' },
            { label: 'Approved', value: `$${stats.approved.toFixed(2)}`, color: 'bg-primary/10 text-primary' },
            { label: 'Paid Out', value: `$${stats.paid.toFixed(2)}`, color: 'bg-success/10 text-success' },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-xl p-4 ${stat.color}`}>
              <p className="text-2xl font-display font-bold">{stat.value}</p>
              <p className="text-sm opacity-80">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by affiliator name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Commissions List */}
        <div className="space-y-4">
          {filteredCommissions.map((commission, index) => {
            const affiliator = getUserById(commission.affiliatorId);
            const order = getOrderDetails(commission.orderId);
            const product = order ? getProductById(order.productId) : null;
            
            return (
              <motion.div
                key={commission.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="shadow-card hover:shadow-card-hover transition-all duration-300">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                          <DollarSign className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{affiliator?.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Product: {product?.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(commission.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-display font-bold text-success">
                            ${commission.amount.toFixed(2)}
                          </p>
                        </div>
                        
                        <Badge className={`${getStatusBadge(commission.status)} flex items-center gap-1`}>
                          {getStatusIcon(commission.status)}
                          {commission.status}
                        </Badge>
                        
                        <div className="flex gap-2">
                          {commission.status === 'pending' && (
                            <Button 
                              size="sm"
                              onClick={() => updateStatus(commission.id, 'approved')}
                            >
                              Approve
                            </Button>
                          )}
                          {commission.status === 'approved' && (
                            <Button 
                              size="sm"
                              variant="hero"
                              onClick={() => updateStatus(commission.id, 'paid')}
                            >
                              <CreditCard className="w-4 h-4 mr-1" />
                              Mark Paid
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filteredCommissions.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No commissions found</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
