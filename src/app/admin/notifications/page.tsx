"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Send } from 'lucide-react';
import { PushNotificationSender } from '@/components/admin/push-notification-sender';

export default function AdminNotificationsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Bell className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Notifikasi Push
          </h1>
          <p className="text-muted-foreground">
            Kirim notifikasi ke semua afiliasi atau pengguna tertentu
          </p>
        </div>
      </div>

      <PushNotificationSender />
    </div>
  );
}