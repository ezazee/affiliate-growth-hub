import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Check, X, Ban, UserCheck, Clock, Users } from 'lucide-react';
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
import { users as initialUsers } from '@/data/mockData';
import { User, UserStatus } from '@/types';
import { toast } from 'sonner';

export default function AdminAffiliators() {
  const [users, setUsers] = useState<User[]>(initialUsers.filter(u => u.role === 'affiliator'));
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateStatus = (userId: string, newStatus: UserStatus) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, status: newStatus } : u
    ));
    toast.success(`Affiliator ${newStatus}`);
  };

  const getStatusBadge = (status: UserStatus) => {
    const styles: Record<UserStatus, string> = {
      pending: 'bg-accent/20 text-accent-foreground',
      approved: 'bg-success/20 text-success',
      rejected: 'bg-destructive/20 text-destructive',
      suspended: 'bg-muted text-muted-foreground',
    };
    return styles[status];
  };

  const getStatusIcon = (status: UserStatus) => {
    const icons: Record<UserStatus, React.ReactNode> = {
      pending: <Clock className="w-3 h-3" />,
      approved: <UserCheck className="w-3 h-3" />,
      rejected: <X className="w-3 h-3" />,
      suspended: <Ban className="w-3 h-3" />,
    };
    return icons[status];
  };

  const stats = {
    total: users.length,
    pending: users.filter(u => u.status === 'pending').length,
    approved: users.filter(u => u.status === 'approved').length,
    suspended: users.filter(u => u.status === 'suspended').length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Affiliators</h1>
          <p className="text-muted-foreground">Manage affiliator registrations and status</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: stats.total, color: 'bg-primary/10 text-primary' },
            { label: 'Pending', value: stats.pending, color: 'bg-accent/10 text-accent-foreground' },
            { label: 'Approved', value: stats.approved, color: 'bg-success/10 text-success' },
            { label: 'Suspended', value: stats.suspended, color: 'bg-muted text-muted-foreground' },
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
              placeholder="Search by name or email..."
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
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users List */}
        <div className="space-y-4">
          {filteredUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="shadow-card hover:shadow-card-hover transition-all duration-300">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="font-semibold text-primary text-lg">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{user.name}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Joined: {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge className={`${getStatusBadge(user.status)} flex items-center gap-1`}>
                        {getStatusIcon(user.status)}
                        {user.status}
                      </Badge>
                      
                      <div className="flex gap-2">
                        {user.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="default"
                              onClick={() => updateStatus(user.id, 'approved')}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateStatus(user.id, 'rejected')}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {user.status === 'approved' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-destructive"
                            onClick={() => updateStatus(user.id, 'suspended')}
                          >
                            <Ban className="w-4 h-4 mr-1" />
                            Suspend
                          </Button>
                        )}
                        {(user.status === 'suspended' || user.status === 'rejected') && (
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => updateStatus(user.id, 'approved')}
                          >
                            <UserCheck className="w-4 h-4 mr-1" />
                            Reactivate
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No affiliators found</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
