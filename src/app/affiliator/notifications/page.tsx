'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Check,
  X,
  ShoppingCart,
  Package,
  CheckCircle,
  AlertCircle,
  XCircle,
  Trash2,

  DollarSign,
  Send,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/contexts/NotificationContext';
import { WebNotification } from '@/types/notifications';

const getNotificationIcon = (type: WebNotification['type']) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'warning':
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    case 'error':
      return <XCircle className="w-5 h-5 text-red-500" />;
    default:
      return <Info className="w-5 h-5 text-blue-500" />;
  }
};

const getRelatedIcon = (title: string) => {
  if (title.toLowerCase().includes('pesanan') || title.toLowerCase().includes('order')) {
    return <ShoppingCart className="w-4 h-4 text-blue-600" />;
  }
  if (title.toLowerCase().includes('dikirim') || title.toLowerCase().includes('shipped')) {
    return <Send className="w-4 h-4 text-purple-600" />;
  }
  if (title.toLowerCase().includes('selesai') || title.toLowerCase().includes('completed')) {
    return <Package className="w-4 h-4 text-green-600" />;
  }
  if (title.toLowerCase().includes('komisi') || title.toLowerCase().includes('commission')) {
    return <DollarSign className="w-4 h-4 text-yellow-600" />;
  }
  if (title.toLowerCase().includes('saldo') || title.toLowerCase().includes('balance')) {
    return <DollarSign className="w-4 h-4 text-green-600" />;
  }
  if (title.toLowerCase().includes('penarikan') || title.toLowerCase().includes('withdrawal')) {
    return <DollarSign className="w-4 h-4 text-red-600" />;
  }
  return <Bell className="w-4 h-4 text-gray-600" />;
};

const formatTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Baru saja';
  if (minutes < 60) return `${minutes} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  return `${days} hari lalu`;
};

const getFullDateTime = (date: Date) => {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date);
};

export default function AffiliatorNotificationsPage() {
  const {
    state,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll
  } = useNotifications();

  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  // Filter notifications
  const filteredNotifications = state.notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  const getStats = () => {
    return {
      total: state.notifications.length,
      unread: state.notifications.filter(n => !n.read).length,
      success: state.notifications.filter(n => n.type === 'success').length,
      warning: state.notifications.filter(n => n.type === 'warning').length,
      error: state.notifications.filter(n => n.type === 'error').length,
      info: state.notifications.filter(n => n.type === 'info').length,
    };
  };

  const stats = getStats();

  const handleNotificationClick = async (notification: WebNotification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Bell className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Notifikasi Saya</h1>
            <p className="text-muted-foreground">
              Lihat semua update komisi dan pesanan affiliator
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {stats.unread > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              <Check className="w-4 h-4 mr-2" />
              Tandai semua dibaca
            </Button>
          )}
          <Button
            onClick={clearAll}
            variant="destructive"
            disabled={state.notifications.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Hapus semua
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-purple-700">{stats.total}</div>
            <div className="text-sm font-medium text-purple-600">Total Notifikasi</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-orange-700">{stats.unread}</div>
            <div className="text-sm font-medium text-orange-600">Belum Dibaca</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-green-700">{stats.success}</div>
            <div className="text-sm font-medium text-green-600">✅ Sukses</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-yellow-700">{stats.warning}</div>
            <div className="text-sm font-medium text-yellow-600">⚠️ Peringatan</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-red-700">{stats.error}</div>
            <div className="text-sm font-medium text-red-600">❌ Error</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-blue-700">{stats.info}</div>
            <div className="text-sm font-medium text-blue-600">ℹ️ Info</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShoppingCart className="w-8 h-8 text-blue-700" />
            </div>
            <h3 className="font-bold text-blue-900 text-lg">🛒 Pesanan</h3>
            <p className="text-sm text-blue-700 font-medium mt-2">
              {state.notifications.filter(n =>
                n.title.toLowerCase().includes('pesanan') ||
                n.title.toLowerCase().includes('order')
              ).length} notifikasi
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-3">
              <DollarSign className="w-8 h-8 text-green-700" />
            </div>
            <h3 className="font-bold text-green-900 text-lg">💰 Komisi</h3>
            <p className="text-sm text-green-700 font-medium mt-2">
              {state.notifications.filter(n =>
                n.title.toLowerCase().includes('komisi') ||
                n.title.toLowerCase().includes('commission')
              ).length} notifikasi
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-purple-200 rounded-full flex items-center justify-center mx-auto mb-3">
              <Package className="w-8 h-8 text-purple-700" />
            </div>
            <h3 className="font-bold text-purple-900 text-lg">✅ Selesai</h3>
            <p className="text-sm text-purple-700 font-medium mt-2">
              {state.notifications.filter(n =>
                n.title.toLowerCase().includes('selesai') ||
                n.title.toLowerCase().includes('completed')
              ).length} notifikasi
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-red-200 rounded-full flex items-center justify-center mx-auto mb-3">
              <XCircle className="w-8 h-8 text-red-700" />
            </div>
            <h3 className="font-bold text-red-900 text-lg">❌ Ditolak</h3>
            <p className="text-sm text-red-700 font-medium mt-2">
              {state.notifications.filter(n =>
                n.title.toLowerCase().includes('ditolak') ||
                n.title.toLowerCase().includes('rejected')
              ).length} notifikasi
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
            >
              Semua ({stats.total})
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              onClick={() => setFilter('unread')}
            >
              Belum Dibaca ({stats.unread})
            </Button>
            <Button
              variant={filter === 'read' ? 'default' : 'outline'}
              onClick={() => setFilter('read')}
            >
              Sudah Dibaca ({stats.total - stats.unread})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Daftar Notifikasi
          </CardTitle>
          <CardDescription>
            {filteredNotifications.length} notifikasi {filter === 'all' ? 'total' : filter === 'unread' ? 'belum dibaca' : 'sudah dibaca'}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Bell className="w-12 h-12 mb-2 opacity-50" />
                <p className="text-lg font-medium">
                  {filter === 'unread' ? 'Tidak ada notifikasi yang belum dibaca' :
                    filter === 'read' ? 'Tidak ada notifikasi yang sudah dibaca' :
                      'Belum ada notifikasi'}
                </p>
                <p className="text-sm mt-1">
                  {filter !== 'all' && 'Coba ubah filter untuk melihat notifikasi lainnya'}
                </p>
                <p className="text-sm mt-2">
                  Anda akan menerima notifikasi ketika:
                </p>
                <ul className="text-sm mt-1 text-left max-w-md">
                  <li>• Pesanan baru diterima</li>
                  <li>• Pesanan dikirim</li>
                  <li>• Pesanan selesai</li>
                  <li>• Komisi diterima</li>
                  <li>• Saldo diperbarui</li>
                  <li>• Penarikan disetujui/ditolak</li>
                </ul>
              </div>
            ) : (
              <div className="divide-y">
                {filteredNotifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-6 hover:bg-gray-50 transition-all duration-200 border-l-4 ${!notification.read
                        ? 'bg-purple-50 border-purple-500'
                        : 'bg-white border-gray-200'
                      }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Main Icon */}
                      <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${!notification.read ? 'bg-purple-100' : 'bg-gray-100'
                        }`}>
                        {getRelatedIcon(notification.title)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Title Row */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className={`text-base font-bold mb-1 ${!notification.read ? 'text-purple-900' : 'text-gray-900'
                              }`}>
                              {notification.title}
                              {!notification.read && (
                                <Badge variant="destructive" className="ml-2 text-xs px-2 py-0.5">
                                  BARU
                                </Badge>
                              )}
                            </h3>
                            <p className={`text-sm ${!notification.read ? 'text-purple-700' : 'text-gray-600'
                              }`}>
                              {notification.message}
                            </p>
                          </div>

                          {/* Type Icon & Actions */}
                          <div className="flex items-center gap-2 ml-4">
                            <div className="flex flex-col items-end gap-1">
                              {getNotificationIcon(notification.type)}
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatTime(notification.timestamp)}
                              </span>
                            </div>

                            <div className="flex flex-col gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeNotification(notification.id);
                                }}
                                className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
                              >
                                <X className="w-4 h-4" />
                              </Button>

                            </div>
                          </div>
                        </div>

                        {/* Bottom Row */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <span className="text-xs text-gray-400">
                            📅 {getFullDateTime(notification.timestamp)}
                          </span>

                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}