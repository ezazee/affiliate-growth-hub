"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { useAuth } from '@/contexts/AuthContext';
import { Bug, Smartphone, Bell, Wifi, WifiOff } from 'lucide-react';

export default function PushTestPage() {
  const { user } = useAuth();
  const {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    error,
    subscribe,
    unsubscribe,
    requestPermission,
  } = usePushNotifications();

  const [debugInfo, setDebugInfo] = useState<any>(null);

  const getDeviceInfo = () => {
    const info = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      isAndroid: /Android/i.test(navigator.userAgent),
      isChrome: /Chrome/i.test(navigator.userAgent),
      isMobile: /Mobile/i.test(navigator.userAgent),
      online: navigator.onLine,
      serviceWorkerSupport: 'serviceWorker' in navigator,
      pushManagerSupport: 'PushManager' in window,
      notificationSupport: 'Notification' in window,
      currentPermission: Notification.permission,
      user: user?.email,
    };

    setDebugInfo(info);
    return info;
  };

  const testSubscription = async () => {
    try {

      await subscribe();

    } catch (err) {
      console.error('❌ Subscription test failed:', err);
    }
  };

  const testPermission = async () => {
    try {

      const result = await requestPermission();

    } catch (err) {
      console.error('❌ Permission test failed:', err);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <Bug className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Push Notification Debug
          </h1>
          <p className="text-muted-foreground">
            Halaman debugging untuk notifikasi push di Android
          </p>
        </div>
      </div>

      {/* Device Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Device Information
          </CardTitle>
          <CardDescription>
            Informasi tentang device dan browser Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={getDeviceInfo} className="mb-4">
            Get Device Info
          </Button>

          {debugInfo && (
            <div className="space-y-2 text-sm font-mono bg-gray-50 p-4 rounded-lg">
              <div>User Agent: <span className="text-blue-600">{debugInfo.userAgent}</span></div>
              <div>Platform: <span className="text-blue-600">{debugInfo.platform}</span></div>
              <div>Android: <Badge variant={debugInfo.isAndroid ? "default" : "secondary"}>{debugInfo.isAndroid ? "Yes" : "No"}</Badge></div>
              <div>Chrome: <Badge variant={debugInfo.isChrome ? "default" : "secondary"}>{debugInfo.isChrome ? "Yes" : "No"}</Badge></div>
              <div>Mobile: <Badge variant={debugInfo.isMobile ? "default" : "secondary"}>{debugInfo.isMobile ? "Yes" : "No"}</Badge></div>
              <div>Online: {debugInfo.online ? <Wifi className="w-4 h-4 inline text-green-500" /> : <WifiOff className="w-4 h-4 inline text-red-500" />}</div>
              <div>Service Worker: <Badge variant={debugInfo.serviceWorkerSupport ? "default" : "destructive"}>{debugInfo.serviceWorkerSupport ? "Supported" : "Not Supported"}</Badge></div>
              <div>Push Manager: <Badge variant={debugInfo.pushManagerSupport ? "default" : "destructive"}>{debugInfo.pushManagerSupport ? "Supported" : "Not Supported"}</Badge></div>
              <div>Notification: <Badge variant={debugInfo.notificationSupport ? "default" : "destructive"}>{debugInfo.notificationSupport ? "Supported" : "Not Supported"}</Badge></div>
              <div>Current Permission: <Badge variant="secondary">{debugInfo.currentPermission}</Badge></div>
              <div>User: <span className="text-blue-600">{debugInfo.user || "Not logged in"}</span></div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Push Notification Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Push Notification Status
          </CardTitle>
          <CardDescription>
            Status current dari push notification system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>Supported: <Badge variant={isSupported ? "default" : "destructive"}>{isSupported ? "Yes" : "No"}</Badge></div>
            <div>Subscribed: <Badge variant={isSubscribed ? "default" : "secondary"}>{isSubscribed ? "Yes" : "No"}</Badge></div>
            <div>Loading: <Badge variant={isLoading ? "default" : "secondary"}>{isLoading ? "Yes" : "No"}</Badge></div>
            <div>Permission: <Badge variant="secondary">{permission}</Badge></div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600 font-mono">{error}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button onClick={testPermission} disabled={isLoading}>
              Test Permission
            </Button>
            <Button onClick={testSubscription} disabled={isLoading || !isSupported}>
              {isLoading ? "Processing..." : isSubscribed ? "Test Subscribe Again" : "Test Subscribe"}
            </Button>
            <Button onClick={unsubscribe} disabled={!isSubscribed || isLoading} variant="outline">
              Unsubscribe
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions for Android</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="font-semibold text-yellow-800 mb-2">🔍 Debugging Steps:</p>
            <ol className="list-decimal list-inside space-y-1 text-yellow-700">
              <li>Buka Chrome DevTools (chrome://inspect)</li>
              <li>Connect device via USB debugging</li>
              <li>Check console logs untuk detailed errors</li>
              <li>Pastikan Chrome versi terbaru</li>
              <li>Clear browser cache jika perlu</li>
            </ol>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="font-semibold text-blue-800 mb-2">📱 Android Requirements:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Chrome browser (versi 50+)</li>
              <li>HTTPS connection</li>
              <li>Notification permission di browser</li>
              <li>Service Worker harus terinstall</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}