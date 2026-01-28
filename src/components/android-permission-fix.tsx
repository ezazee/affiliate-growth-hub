'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';
import {
  Smartphone,
  Chrome,
  Settings,
  Check,
  X,
  AlertCircle,
  RefreshCw,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AndroidPermissionFix() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [检测结果, set检测结果] = useState<any>(null);

  const userAgent = typeof window !== 'undefined' ? navigator.userAgent : '';
  const isAndroid = /Android/i.test(userAgent);
  const isChrome = /Chrome/i.test(userAgent);

  const checkPermissionStatus = async () => {
    setIsChecking(true);

    try {
      const permission = Notification.permission;
      const isSupported = 'serviceWorker' in navigator && 'PushManager' in window;

      let serviceWorkerStatus = 'Not checked';
      if (isSupported) {
        try {
          const registration = await navigator.serviceWorker.ready;
          serviceWorkerStatus = registration.active ? 'Active' : 'Installing';
        } catch (err) {
          serviceWorkerStatus = 'Error';
        }
      }

      const result = {
        isAndroid,
        isChrome,
        isSupported,
        permission,
        serviceWorkerStatus,
        recommendations: []
      };

      // Add recommendations based on status
      if (isAndroid) {
        if (!isChrome) {
          result.recommendations.push('Use Chrome browser for best compatibility');
        }
        if (permission === 'denied') {
          result.recommendations.push('Follow Android permission steps below');
        }
        if (serviceWorkerStatus === 'Error') {
          result.recommendations.push('Restart Chrome app');
        }
      }

      set检测结果(result);

      // Send debug info to server
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/push/debug`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAgent,
          permissionStatus: permission
        })
      });

      toast({
        title: 'Permission Check Complete',
        description: `Status: ${permission} | Service Worker: ${serviceWorkerStatus}`,
      });

    } catch (error) {
      console.error('Check failed:', error);
      toast({
        title: 'Check Failed',
        description: 'Unable to check permission status',
        variant: 'destructive',
      });
    } finally {
      setIsChecking(false);
    }
  };

  if (!isAndroid) {
    return null; // Only show on Android devices
  }

  const fixInstructions = [
    {
      title: "Chrome Settings Fix",
      steps: [
        "Open Chrome menu (⋮)",
        "Go to Settings → Site Settings",
        "Select Notifications",
        "Find this domain and set to Allow"
      ]
    },
    {
      title: "Android Settings Fix",
      steps: [
        "Go to Android Settings",
        "Apps → Chrome",
        "Permissions → Notifications",
        "Set to Allow"
      ]
    },
    {
      title: "Quick Fix",
      steps: [
        "Clear Chrome cache",
        "Restart Chrome browser",
        "Try enabling notifications again",
        "Accept permission prompt immediately"
      ]
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.4 }}
    >
      <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-red-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">Android Permission Helper</CardTitle>
              <CardDescription>
                Fix notification permission issues on Android
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
              Android Only
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Check Status Button */}
          <div className="flex gap-2">
            <Button
              onClick={checkPermissionStatus}
              disabled={isChecking}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              {isChecking ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Smartphone className="w-4 h-4 mr-2" />
                  Check Android Status
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsOpen(!isOpen)}
              className="text-xs"
            >
              {isOpen ? 'Hide' : 'Show'} Fix Steps
            </Button>
          </div>

          {/* Check Results */}
          {检测结果 && (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Check Results</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
                  <div>Browser: {isChrome ? '✅ Chrome' : '❌ Other'}</div>
                  <div>Permission: {检测结果.permission}</div>
                  <div>Service Worker: {检测结果.serviceWorkerStatus}</div>
                  <div>Push Support: {检测结果.isSupported ? '✅ Yes' : '❌ No'}</div>
                </div>
              </div>
            </div>
          )}

          {isOpen && (
            <div className="space-y-3">
              {fixInstructions.map((fix, index) => (
                <div key={index} className="bg-white/60 p-3 rounded-lg border border-orange-200">
                  <h4 className="font-medium text-sm text-orange-900 mb-2">{fix.title}</h4>
                  <ol className="text-xs space-y-1">
                    {fix.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex gap-2">
                        <span className="font-bold">{stepIndex + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}

              <Button
                size="sm"
                onClick={() => window.open('chrome://settings/content/notifications', '_blank')}
                className="w-full text-xs bg-orange-600 hover:bg-orange-700"
              >
                <Chrome className="w-3 h-3 mr-1" />
                Open Chrome Notification Settings
              </Button>
            </div>
          )}

          {/* Troubleshooting Tips */}
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-900">Troubleshooting</span>
            </div>
            <div className="text-sm text-yellow-800">
              <strong>Troubleshooting:</strong>
              <ul className="mt-2 space-y-1 text-xs">
                <li>• Make sure Chrome is updated to latest version</li>
                <li>• Check if "Do Not Disturb" is off</li>
                <li>• Try both WiFi and Mobile Data</li>
                <li>• Restart your phone after changes</li>
                <li>• Clear Chrome cache if issues persist</li>
              </ul>
            </div>
          </div>

          {/* Quick Test */}
          <div className="text-center">
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open('/admin/notifications/test', '_blank')}
              className="text-xs"
            >
              Test Notifications After Fix
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}