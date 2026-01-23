'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Check, 
  X, 
  UserPlus, 
  ShoppingCart, 
  DollarSign, 
  Info, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Trash2,
  Eye
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
  if (title.toLowerCase().includes('affiliator') || title.toLowerCase().includes('pendaftaran')) {
    return <UserPlus className="w-4 h-4 text-blue-600" />;
  }
  if (title.toLowerCase().includes('pesanan') || title.toLowerCase().includes('order')) {
    return <ShoppingCart className="w-4 h-4 text-green-600" />;
  }
  if (title.toLowerCase().includes('penarikan') || title.toLowerCase().includes('withdrawal')) {
    return <DollarSign className="w-4 h-4 text-yellow-600" />;
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

export default function AdminNotificationsPage() {
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
    
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    } else if (notification.url) {
      window.location.href = notification.url;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Bell className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Notifikasi</h1>
            <p className="text-muted-foreground">
              Kelola semua notifikasi sistem admin
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
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.unread}</div>
            <div className="text-sm text-muted-foreground">Belum Dibaca</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.success}</div>
            <div className="text-sm text-muted-foreground">Sukses</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.warning}</div>
            <div className="text-sm text-muted-foreground">Peringatan</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.error}</div>
            <div className="text-sm text-muted-foreground">Error</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.info}</div>
            <div className="text-sm text-muted-foreground">Info</div>
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
              </div>
            ) : (
              <div className="divide-y">
                {filteredNotifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex flex-col gap-3">
                      {/* Header Row */}
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getRelatedIcon(notification.title)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                            <h3 className={`text-sm font-semibold truncate flex items-center gap-2 ${
                              !notification.read ? 'text-blue-900' : 'text-gray-900'
                            }`}>
                              <span>{notification.title}</span>
                              {!notification.read && (
                                <Badge variant="secondary" className="text-xs">
                                  Baru
                                </Badge>
                              )}
                            </h3>
                            
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatTime(notification.timestamp)}
                              </span>
                              
                              <div className="flex items-center gap-1">
                                {getNotificationIcon(notification.type)}
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeNotification(notification.id);
                                  }}
                                  className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                                
                                {notification.url && (
                                  <Eye className="w-3 h-3 text-gray-400" />
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <span className="text-xs text-gray-400 truncate" title={getFullDateTime(notification.timestamp)}>
                              {getFullDateTime(notification.timestamp)}
                            </span>
                            
                            {notification.url && (
                              <div className="text-xs text-blue-600">
                                Klik untuk melihat detail →
                              </div>
                            )}
                          </div>
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