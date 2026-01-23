'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  BellRing, 
  Check, 
  X, 
  Info, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
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

const getNotificationBg = (type: WebNotification['type']) => {
  switch (type) {
    case 'success':
      return 'bg-green-50 border-green-200 hover:bg-green-100';
    case 'warning':
      return 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100';
    case 'error':
      return 'bg-red-50 border-red-200 hover:bg-red-100';
    default:
      return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
  }
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

interface NotificationPanelProps {
  className?: string;
}

export function NotificationPanel({ className }: NotificationPanelProps) {
  const { 
    state, 
    markAsRead, 
    markAllAsRead, 
    removeNotification, 
    clearAll, 
    togglePanel 
  } = useNotifications();

  const handleNotificationClick = (notification: WebNotification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    } else if (notification.url) {
      window.location.href = notification.url;
    }
  };

  const handleRemoveNotification = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    removeNotification(notificationId);
  };

  return (
    <>
      {/* Notification Button */}
      <div className={`relative ${className}`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={togglePanel}
          className="hidden md:flex relative"
        >
          {state.unreadCount > 0 ? (
            <BellRing className="w-5 h-5 animate-pulse" />
          ) : (
            <Bell className="w-5 h-5" />
          )}
          
          {state.unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full animate-ping" />
          )}
        </Button>
        
        {/* Mobile Notification Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={togglePanel}
          className="md:hidden relative p-2"
        >
          {state.unreadCount > 0 ? (
            <BellRing className="w-6 h-6 animate-pulse" />
          ) : (
            <Bell className="w-6 h-6" />
          )}
          
          {state.unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full animate-ping" />
          )}
        </Button>
        
        {state.unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="hidden md:block absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs font-bold border-2 border-background"
          >
            {state.unreadCount > 99 ? '99+' : state.unreadCount}
          </Badge>
        )}
        
        {/* Mobile Badge */}
        {state.unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="md:hidden absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] font-bold border-2 border-background"
          >
            {state.unreadCount > 99 ? '99+' : state.unreadCount}
          </Badge>
        )}
      </div>

      {/* Notification Panel */}
      <AnimatePresence>
        {state.isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 right-4 z-50 w-96 max-h-96 md:w-96 md:max-h-96 md:right-4 shadow-2xl left-4 right-4 md:left-auto max-w-[calc(100vw-2rem)] md:max-w-none"
          >
            <Card className="border-2">
              <CardContent className="p-0">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notifikasi
                  </h3>
                  <div className="flex items-center gap-2">
                    {state.unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllAsRead}
                        className="text-xs h-7 px-2"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Tandai dibaca
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAll}
                      className="text-xs h-7 px-2"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Hapus semua
                    </Button>
                  </div>
                </div>

                {/* Notifications List */}
                <ScrollArea className="h-80">
                  {state.notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <Bell className="w-12 h-12 mb-2 opacity-50" />
                      <p className="text-sm">Belum ada notifikasi</p>
                    </div>
                  ) : (
                    <div className="p-2">
                      {state.notifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className={`mb-2 p-3 rounded-lg border cursor-pointer transition-colors ${getNotificationBg(notification.type)} ${
                            !notification.read ? 'font-semibold' : ''
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {getNotificationIcon(notification.type)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-medium truncate">
                                  {notification.title}
                                </p>
                                <div className="flex items-center gap-1">
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => handleRemoveNotification(e, notification.id)}
                                    className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              
                              <p className="text-xs text-gray-600 mb-2">
                                {notification.message}
                              </p>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-400">
                                  {formatTime(notification.timestamp)}
                                </span>
                                
                                {notification.actionUrl && (
                                  <ExternalLink className="w-3 h-3 text-gray-400" />
                                )}
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay */}
      {state.isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={togglePanel}
        />
      )}
    </>
  );
}