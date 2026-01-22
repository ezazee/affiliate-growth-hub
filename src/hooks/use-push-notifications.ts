import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface PushSubscription {
  endpoint: string;
  keys: {
    auth: string;
    p256dh: string;
  };
}

interface UsePushNotificationsReturn {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  permission: NotificationPermission;
  error: string | null;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
  requestPermission: () => Promise<NotificationPermission>;
}

export const usePushNotifications = (): UsePushNotificationsReturn => {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = () => {
      const userAgent = navigator.userAgent;
      const isAndroid = /Android/i.test(userAgent);
      const isChrome = /Chrome/i.test(userAgent);
      
      console.log('📱 Device info:', { userAgent, isAndroid, isChrome });
      
      const supported = 'serviceWorker' in navigator && 
                       'PushManager' in window && 
                       'Notification' in window;
      
      console.log('🔧 Feature support:', {
        serviceWorker: 'serviceWorker' in navigator,
        pushManager: 'PushManager' in window,
        notification: 'Notification' in window
      });
      
      setIsSupported(supported);
      
      if (supported) {
        setPermission(Notification.permission);
      } else {
        if (isAndroid && !isChrome) {
          console.warn('⚠️ Push notifications require Chrome on Android');
        }
      }
    };

    checkSupport();
  }, []);

  // Check current subscription status - SIMPLE
  useEffect(() => {
    if (!isSupported) return;

    const checkSubscription = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.getSubscription();
        
        if (sub) {
          setSubscription(sub.toJSON() as PushSubscription);
          setIsSubscribed(true);
        } else {
          setIsSubscribed(false);
        }
      } catch (err) {
        setIsSubscribed(false);
      }
    };

    checkSubscription();
  }, [isSupported]);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      setError('Push notifications are not supported');
      return 'denied';
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (err) {
      console.error('Error requesting permission:', err);
      setError('Failed to request notification permission');
      return 'denied';
    }
  }, [isSupported]);

  // Subscribe to push notifications - OPTIMIZED & FAST
  const subscribe = useCallback(async (retryCount = 0) => {
    if (!isSupported) {
      setError('Push notifications not supported');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Add timeout to prevent hanging
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 10000)
    );

    try {
      // Fast permission check with timeout
      const permissionPromise = Notification.permission === 'granted' ? 
        Promise.resolve('granted') : 
        Notification.requestPermission();
      
      const currentPermission = await Promise.race([permissionPromise, timeout]) as NotificationPermission;
      
      if (currentPermission !== 'granted') {
        setError('Permission denied. Please allow notifications.');
        return;
      }

      // Get service worker with timeout
      const registrationPromise = navigator.serviceWorker.ready;
      const registration = await Promise.race([registrationPromise, timeout]) as ServiceWorkerRegistration;
      
      // Check existing subscription
      const existingSubscription = await registration.pushManager.getSubscription();
      
      if (existingSubscription) {
        // Just set state for existing subscription - no API call needed
        const subscriptionData = existingSubscription.toJSON() as PushSubscription;
        setSubscription(subscriptionData);
        setIsSubscribed(true);
        return;
      }
      
      // Create new subscription with timeout
      const vapidKey = 'BEDiXZ34k42Cp1Vd_AfbmpcUAnq5ZEdj8x-DbNilC6A6Khldz9LlLQFklsbVpXrWslG6qRrIEsEnLy-vlUtKi-w';
      const applicationServerKey = urlB64ToUint8Array(vapidKey);
      
      const subscribePromise = registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
      });
      
      const pushSubscription = await Promise.race([subscribePromise, timeout]) as any;
      const subscriptionData = pushSubscription.toJSON() as PushSubscription;
      
      // Save to server with timeout
      const userEmail = user?.email || localStorage.getItem('userEmail') || '';
      const savePromise = fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': userEmail,
        },
        body: JSON.stringify(subscriptionData),
      });

      const response = await Promise.race([savePromise, timeout]) as Response;

      if (!response.ok) {
        // Still set local state even if server fails for better UX
        console.warn('Server save failed, but subscription active locally');
      }

      setSubscription(subscriptionData);
      setIsSubscribed(true);
      setPermission(currentPermission);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Subscription failed';
      if (errorMessage.includes('timeout')) {
        setError('Connection timeout. Please try again.');
      } else {
        setError(errorMessage);
      }
      setIsSubscribed(false);
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, user]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    if (!isSupported || !isSubscribed) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const pushSubscription = await registration.pushManager.getSubscription();

      if (pushSubscription) {
        // Remove from server first
        if (subscription) {
          await fetch('/api/push/unsubscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-user-email': user?.email || '',
            },
            body: JSON.stringify({
              endpoint: subscription.endpoint,
            }),
          });
        }

        // Remove from browser
        await pushSubscription.unsubscribe();
        setSubscription(null);
        setIsSubscribed(false);
      }
    } catch (err) {
      console.error('Error unsubscribing from push notifications:', err);
      setError('Failed to unsubscribe from push notifications');
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, isSubscribed, subscription]);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    error,
    subscribe,
    unsubscribe,
    requestPermission,
  };
};

// Helper function to convert base64 string to Uint8Array
function urlB64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Helper function to validate subscription format
function validateSubscription(subscription: any): boolean {
  if (!subscription.endpoint || !subscription.keys) {
    console.error('❌ Invalid subscription: missing endpoint or keys');
    return false;
  }
  
  if (!subscription.keys.auth || !subscription.keys.p256dh) {
    console.error('❌ Invalid subscription: missing auth or p256dh keys');
    return false;
  }
  
  console.log('✅ Subscription format valid');
  return true;
}