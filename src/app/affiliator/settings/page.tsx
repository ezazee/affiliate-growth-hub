"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Settings, User, Bell, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PushNotificationSettings } from '@/components/push-notification-settings';
import AndroidPermissionFix from '@/components/android-permission-fix';

export default function AffiliatorSettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Settings className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Pengaturan
          </h1>
          <p className="text-muted-foreground">
            Kelola preferensi akun dan notifikasi Anda
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* User Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{user?.name}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <p className="text-xs text-primary mt-1">ID: {user?.referralCode}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium capitalize">{user?.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Role:</span>
                <span className="font-medium capitalize">{user?.role}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Push Notification Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="lg:col-span-2"
        >
          <PushNotificationSettings userId={user?.email} />
        </motion.div>
      </div>

      {/* Android Permission Fix Helper */}
      <AndroidPermissionFix />

      {/* Additional Settings */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Security Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-card rounded-xl p-6 border">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg">Keamanan</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm font-medium mb-1">Password Protection</p>
                <p className="text-xs text-muted-foreground">
                  Your account is protected with a secure password
                </p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm font-medium mb-1">Data Encryption</p>
                <p className="text-xs text-muted-foreground">
                  All your data is encrypted and stored securely
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-lg">Tips Notifikasi</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                <p className="text-muted-foreground">
                  Aktifkan notifikasi untuk mendapatkan update komisi secara real-time
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                <p className="text-muted-foreground">
                  Pastikan browser Anda mengizinkan notifikasi dari website ini
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                <p className="text-muted-foreground">
                  Notifikasi akan muncul meskipun browser sedang diminimize
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}