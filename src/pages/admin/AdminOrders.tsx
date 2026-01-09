import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Eye, CheckCircle, XCircle, Clock, ShoppingCart } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { orders as initialOrders, getProductById } from '@/data/mockData';
import { Order, OrderStatus } from '@/types';
import { toast } from 'sonner';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [shippingCost, setShippingCost] = useState('');

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.affiliateName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => 
      o.id === orderId ? { ...o, status: newStatus } : o
    ));
    toast.success(`Order marked as ${newStatus}`);
    setSelectedOrder(null);
  };

  const updateShippingCost = (orderId: string) => {
    if (!shippingCost) return;
    setOrders(prev => prev.map(o => 
      o.id === orderId ? { ...o, shippingCost: Number(shippingCost) } : o
    ));
    toast.success('Shipping cost updated');
    setShippingCost('');
  };

  const getStatusBadge = (status: OrderStatus) => {
    const styles: Record<OrderStatus, string> = {
      pending: 'bg-accent/20 text-accent-foreground',
      paid: 'bg-success/20 text-success',
      cancelled: 'bg-destructive/20 text-destructive',
    };
    return styles[status];
  };

  const getStatusIcon = (status: OrderStatus) => {
    const icons: Record<OrderStatus, React.ReactNode> = {
      pending: <Clock className="w-3 h-3" />,
      paid: <CheckCircle className="w-3 h-3" />,
      cancelled: <XCircle className="w-3 h-3" />,
    };
    return icons[status];
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    paid: orders.filter(o => o.status === 'paid').length,
    revenue: orders.filter(o => o.status === 'paid').reduce((sum, o) => {
      const product = getProductById(o.productId);
      return sum + (product?.price || 0) + (o.shippingCost || 0);
    }, 0),
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Orders</h1>
          <p className="text-muted-foreground">Manage customer orders and payments</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Orders', value: stats.total, color: 'bg-primary/10 text-primary' },
            { label: 'Pending', value: stats.pending, color: 'bg-accent/10 text-accent-foreground' },
            { label: 'Paid', value: stats.paid, color: 'bg-success/10 text-success' },
            { label: 'Revenue', value: `$${stats.revenue}`, color: 'gradient-primary text-primary-foreground' },
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
              placeholder="Search by buyer or affiliator..."
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
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order, index) => {
            const product = getProductById(order.productId);
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="shadow-card hover:shadow-card-hover transition-all duration-300">
                  <CardContent className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-foreground">{order.buyerName}</h3>
                          <Badge className={`${getStatusBadge(order.status)} flex items-center gap-1`}>
                            {getStatusIcon(order.status)}
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Product: <span className="text-foreground">{product?.name}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Affiliator: <span className="text-foreground">{order.affiliateName}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-display font-bold text-primary">
                            ${product?.price || 0}
                          </p>
                          {order.shippingCost && (
                            <p className="text-xs text-muted-foreground">
                              + ${order.shippingCost} shipping
                            </p>
                          )}
                        </div>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No orders found</p>
          </div>
        )}

        {/* Order Detail Dialog */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display">Order Details</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Buyer Name</p>
                    <p className="font-medium">{selectedOrder.buyerName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedOrder.buyerPhone}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Shipping Address</p>
                    <p className="font-medium">
                      {selectedOrder.shippingAddress}, {selectedOrder.city}, {selectedOrder.province} {selectedOrder.postalCode}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Product</p>
                    <p className="font-medium">{getProductById(selectedOrder.productId)?.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Affiliator</p>
                    <p className="font-medium">{selectedOrder.affiliateName}</p>
                  </div>
                </div>

                {/* Shipping Cost Input */}
                <div className="flex gap-3 items-end p-4 bg-secondary rounded-lg">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="shipping">Shipping Cost ($)</Label>
                    <Input
                      id="shipping"
                      type="number"
                      value={shippingCost}
                      onChange={(e) => setShippingCost(e.target.value)}
                      placeholder={String(selectedOrder.shippingCost || 0)}
                    />
                  </div>
                  <Button onClick={() => updateShippingCost(selectedOrder.id)}>
                    Set
                  </Button>
                </div>

                {/* Status Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  {selectedOrder.status === 'pending' && (
                    <>
                      <Button 
                        className="flex-1"
                        onClick={() => updateOrderStatus(selectedOrder.id, 'paid')}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark as Paid
                      </Button>
                      <Button 
                        variant="outline"
                        className="flex-1 text-destructive"
                        onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </>
                  )}
                  {selectedOrder.status !== 'pending' && (
                    <Button 
                      variant="outline"
                      className="flex-1"
                      onClick={() => setSelectedOrder(null)}
                    >
                      Close
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
