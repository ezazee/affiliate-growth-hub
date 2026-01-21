"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, X, AlertCircle, Smartphone, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { usePushNotifications } from '@/hooks/use-push-notifications';

export function ForceNotificationPopup() {
  const { user } = useAuth();
  const [showPopup, setShowPopup] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { isSupported, permission, requestPermission, subscribe } = usePushNotifications();

  useEffect(() => {
    if (!user || isDismissed) return;

    // Cek apakah user sudah pernah dismiss atau enable notifications
    const dismissedKey = `notification-dismissed-${user.id}`;
    const hasDismissed = localStorage.getItem(dismissedKey);
    
    if (hasDismissed) {
      return;
    }

    // Tampilkan popup jika:
    // 1. Browser support notifications
    // 2. Permission belum granted (default atau denied)
    // 3. User belum pernah dismiss
    if (isSupported && permission !== 'granted') {
      // Delay 3 detik setelah login
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [user, isSupported, permission, isDismissed]);

  useEffect(() => {
    // Auto dismiss jika permission sudah granted
    if (permission === 'granted' && showPopup) {
      handleDismiss();
    }
  }, [permission, showPopup]);

  const handleEnable = async () => {
    try {
      const hasPermission = await requestPermission();
      if (hasPermission) {
        await subscribe();
        handleDismiss();
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error);
    }
  };

  const handleDismiss = () => {
    if (!user) return;
    
    const dismissedKey = `notification-dismissed-${user.id}`;
    localStorage.setItem(dismissedKey, 'true');
    setIsDismissed(true);
    setShowPopup(false);
  };

  const handleLater = () => {
    setShowPopup(false);
    // Munculkan lagi setelah 5 menit
    setTimeout(() => {
      if (!isDismissed && permission !== 'granted') {
        setShowPopup(true);
      }
    }, 5 * 60 * 1000); // 5 menit
  };

  if (!showPopup || !user || !isSupported) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            e.preventDefault(); // Prevent closing on backdrop click
          }
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-md"
        >
          <Card className="relative border-0 shadow-2xl">
            <CardContent className="p-6 space-y-4">
              {/* Close button disabled - user must make choice */}
              
              {/* Icon Section */}
              <div className="flex justify-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="relative"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <Bell className="w-10 h-10 text-white" />
                  </div>
                  <motion.div
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                  >
                    <span className="text-white text-xs font-bold">!</span>
                  </motion.div>
                </motion.div>
              </div>

              {/* Message */}
              <div className="text-center space-y-3">
                <h3 className="text-xl font-bold text-gray-900">
                  Aktifkan Notifikasi Penting!
                </h3>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    Jangan lewatkan informasi penting tentang:
                  </p>
                  
                  <div className="flex flex-col gap-2 mt-3">
                    <div className="flex items-center gap-2 text-left bg-green-50 p-3 rounded-lg border border-green-200">
                      <Smartphone className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-green-800">Komisi baru dan penjualan</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-left bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <MessageSquare className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="text-blue-800">Update terbaru dari admin</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warning for denied permission */}
              {permission === 'denied' && (
                <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-yellow-800">
                    <p className="font-semibold">Notifikasi diblokir</p>
                    <p>Harap buka browser settings dan izinkan notifikasi untuk website ini.</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                {permission === 'denied' ? (
                  <Button 
                    onClick={handleDismiss}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    Saya Mengerti
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={handleEnable}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg"
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      Aktifkan Notifikasi
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={handleLater}
                      className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Nanti Saja
                    </Button>
                  </>
                )}
              </div>

              {/* Small text */}
              <p className="text-xs text-gray-500 text-center">
                Notifikasi penting untuk kelancaran bisnis Anda
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}