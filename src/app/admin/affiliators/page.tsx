"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Check, X, Ban, UserCheck, Clock, Users, Trash2, Edit } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { User, UserStatus } from '@/types/user';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

import ClientOnly from '@/components/ClientOnly';
import { Label } from '@/components/ui/label';

export default function AdminAffiliators() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'pending' as UserStatus,
  });

  useEffect(() => {
    const fetchAffiliators = async () => {
      try {
        const response = await fetch('/api/admin/affiliators');
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (error) {
        console.error('Failed to fetch affiliators:', error);
        toast.error('Failed to load affiliators.');
      } finally {
        setLoading(false);
      }
    };
    fetchAffiliators();
  }, []);

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateStatus = async (userId: string, newStatus: UserStatus) => {
    try {
      const response = await fetch(`/api/admin/affiliators/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, status: newStatus } : u
        ));
        toast.success(`Status afiliasi diperbarui menjadi ${newStatus}`);
      } else {
        toast.error('Gagal memperbarui status afiliasi.');
      }
    } catch (error) {
      console.error('Gagal memperbarui status:', error);
      toast.error('Terjadi kesalahan saat memperbarui status.');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus afiliasi ini? Tindakan ini tidak dapat dibatalkan.')) {
      return;
    }
    try {
      const response = await fetch(`/api/admin/affiliators/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers(prev => prev.filter(u => u.id !== userId));
        toast.success('Afiliasi berhasil dihapus');
      } else {
        toast.error('Gagal menghapus afiliasi.');
      }
    } catch (error) {
      console.error('Gagal menghapus pengguna:', error);
      toast.error('Terjadi kesalahan saat menghapus afiliasi.');
    }
  };

  const handleOpenEditDialog = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      status: user.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setEditFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const response = await fetch(`/api/admin/affiliators/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        const updatedUser = await response.json(); // API should return the updated user
        setUsers(prev => prev.map(u => 
          u.id === updatedUser.id ? updatedUser : u
        ));
        toast.success('Profil afiliasi berhasil diperbarui');
        setIsEditDialogOpen(false);
        setEditingUser(null);
      } else {
        toast.error('Gagal memperbarui profil afiliasi.');
      }
    } catch (error) {
      console.error('Gagal memperbarui profil pengguna:', error);
      toast.error('Terjadi kesalahan saat memperbarui profil.');
    }
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
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Afiliasi</h1>
          <p className="text-muted-foreground">Kelola pendaftaran dan status afiliasi</p>
        </div>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display">Ubah Profil Afiliasi</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  value={editFormData.name}
                  onChange={handleEditFormChange}
                  placeholder="Nama Lengkap"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editFormData.email}
                  onChange={handleEditFormChange}
                  placeholder="Email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Nomor Telepon</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={editFormData.phone}
                  onChange={handleEditFormChange}
                  placeholder="Nomor Telepon"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="referralCode">Kode Referral</Label>
                <Input
                  id="referralCode"
                  value={editingUser?.referralCode || ''}
                  readOnly
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registrationNumber">Nomor Registrasi</Label>
                <Input
                  id="registrationNumber"
                  value={editingUser?.registrationNumber || ''}
                  readOnly
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={editFormData.status}
                  onValueChange={(value: UserStatus) => setEditFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Tertunda</SelectItem>
                    <SelectItem value="approved">Disetujui</SelectItem>
                    <SelectItem value="rejected">Ditolak</SelectItem>
                    <SelectItem value="suspended">Ditangguhkan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit">
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>


        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: stats.total, color: 'bg-primary/10 text-primary' },
            { label: 'Tertunda', value: stats.pending, color: 'bg-accent/10 text-accent-foreground' },
            { label: 'Disetujui', value: stats.approved, color: 'bg-success/10 text-success' },
            { label: 'Ditangguhkan', value: stats.suspended, color: 'bg-muted text-muted-foreground' },
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
              placeholder="Cari berdasarkan nama atau email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <ClientOnly>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter berdasarkan status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Tertunda</SelectItem>
                <SelectItem value="approved">Disetujui</SelectItem>
                <SelectItem value="rejected">Ditolak</SelectItem>
                <SelectItem value="suspended">Ditangguhkan</SelectItem>
              </SelectContent>
            </Select>
          </ClientOnly>
        </div>

        {/* Users List */}
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        ) : (
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
                            Bergabung: {new Date(user.createdAt).toLocaleDateString()}
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
                                Setujui
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => updateStatus(user.id, 'rejected')}
                              >
                                <X className="w-4 h-4 mr-1" />
                                Tolak
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
                              Tangguhkan
                            </Button>
                          )}
                          {(user.status === 'suspended' || user.status === 'rejected') && (
                            <Button 
                              size="sm" 
                              variant="default"
                              onClick={() => updateStatus(user.id, 'approved')}
                            >
                              <UserCheck className="w-4 h-4 mr-1" />
                              Aktifkan Kembali
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenEditDialog(user)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {/* Always show delete button */}
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => deleteUser(user.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Tidak ada afiliasi ditemukan</p>
          </div>
        )}
      </div>
  );
}
