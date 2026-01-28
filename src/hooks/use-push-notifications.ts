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



      const supported = 'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window;



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

  // Check current subscription status - WITH SERVICE WORKER FIX
  useEffect(() => {
    if (!isSupported) return;

    const checkSubscription = async () => {
      try {
        // Ensure service worker is registered
        let registration = await navigator.serviceWorker.ready;

        // If no active service worker, register manually
        if (!registration.active) {

          registration = await navigator.serviceWorker.register('/sw.js');
          await navigator.serviceWorker.ready;
        }

        const sub = await registration.pushManager.getSubscription();

        if (sub) {
          const subscriptionData = sub.toJSON() as PushSubscription;


          setSubscription(subscriptionData);
          setIsSubscribed(true);
        } else {

          setIsSubscribed(false);
        }
      } catch (err) {
        console.error('❌ Subscription check failed:', err);
        setIsSubscribed(false);
      }
    };

    checkSubscription();
  }, [isSupported]);

  // Request notification permission - IMPROVED ANDROID FIX
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      setError('Push notifications are not supported');
      return 'denied';
    }

    try {
      const userAgent = navigator.userAgent;
      const isAndroid = /Android/i.test(userAgent);
      const isChrome = /Chrome/i.test(userAgent);



      // Check current permission first
      const currentPermission = Notification.permission;


      if (currentPermission === 'granted') {
        setPermission('granted');
        return 'granted';
      }

      if (currentPermission === 'denied') {
        if (isAndroid) {
          setError('⛔ Notifikasi diblokir. Untuk memperbaiki:\n1. Buka Chrome Settings (⋮)\n2. Site Settings → Notifications\n3. Cari site ini dan pilih "Allow"\n4. Restart Chrome');
        } else {
          setError('Notifikasi diblokir di browser settings');
        }
        return 'denied';
      }

      // For Android, show user instructions before requesting
      if (isAndroid) {


        // Try to get system permission status first
        if ('permissions' in navigator) {
          try {
            const systemPermission = await navigator.permissions.query({ name: 'notifications' });


            if (systemPermission.state === 'prompt') {

            }
          } catch (permErr) {
            console.warn('Permissions API not available:', permErr);
          }
        }
      }

      // Request permission with better error handling


      // Create a promise wrapper to handle timeout
      const permissionPromise = Notification.requestPermission();
      const timeoutPromise = new Promise<NotificationPermission>((_, reject) => {
        setTimeout(() => reject(new Error('Permission request timeout')), 10000);
      });

      const result = await Promise.race([permissionPromise, timeoutPromise]) as NotificationPermission;


      setPermission(result);

      // Handle different results
      if (result === 'granted') {

      } else if (result === 'denied') {
        const userAgent = navigator.userAgent;
        const isAndroidDevice = /Android/i.test(userAgent);
        if (isAndroidDevice) {
          setError('❌ Ditolak. Solusi:\n1. Chrome Settings → Privacy → Site Settings\n2. Notifications → Allow this site\n3. Atau Android Settings → Apps → Chrome → Permissions');
        } else {
          setError('Permission denied. Please check browser settings');
        }
      } else {
        setError('Permission request dismissed. Please try again');
      }

      return result;
    } catch (err) {
      console.error('❌ Permission request error:', err);

      const userAgent = navigator.userAgent;
      const isAndroidDevice = /Android/i.test(userAgent);

      if (err instanceof Error && err.message.includes('timeout')) {
        setError('⏱️ Request timeout. Please check internet connection and try again');
      } else if (isAndroidDevice) {
        setError('❌ Android permission error. Please restart Chrome and try again');
      } else {
        setError('Failed to request notification permission');
      }

      return 'denied';
    }
  }, [isSupported]);

  // Subscribe to push notifications - IMPROVED ANDROID COMPATIBLE
  const subscribe = useCallback(async () => {
    if (!isSupported) {
      setError('Push notifications not supported');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {


      // Step 1: Ensure service worker is active

      // Register first, then wait for ready
      await navigator.serviceWorker.register('/sw.js');
      const registration = await navigator.serviceWorker.ready;


      // Step 2: Request permission with better UX

      let currentPermission = Notification.permission;

      if (currentPermission === 'default') {

        currentPermission = await requestPermission();
      }

      if (currentPermission !== 'granted') {
        setError('Permission required. Please allow notifications to continue.');
        return;
      }

      // Step 3: Check existing subscription

      const existingSubscription = await registration.pushManager.getSubscription();

      if (existingSubscription) {

        const subscriptionData = existingSubscription.toJSON() as PushSubscription;
        setSubscription(subscriptionData);
        setIsSubscribed(true);
        return;
      }

      // Step 4: Create new subscription with retry

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BD7-XYAmgLZETcgTEzRWEPkGmXW0H0iPjGNl3vZvex-h_TFyGCvXifRZIX5mbPbk6HV7qkTs5VGJ-lvjonGoA1o';



      const applicationServerKey = urlB64ToUint8Array(vapidKey);

      const pushSubscription = await Promise.race([
        registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Subscription timeout')), 15000)
        )
      ]);

      const subscriptionData = pushSubscription.toJSON() as PushSubscription;

      if (!validateSubscription(subscriptionData)) {
        throw new Error('Invalid subscription format received');
      }



      // Step 5: Save to server with better error handling
      const userEmail = user?.email || localStorage.getItem('userEmail') || '';

      if (!userEmail) {
        console.warn('⚠️ No user email found, using fallback');
      }

      const response = await Promise.race([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/push/subscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': userEmail,
          },
          body: JSON.stringify(subscriptionData),
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Server timeout')), 10000)
        )
      ]);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server error:', response.status, errorText);
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();


      setSubscription(subscriptionData);
      setIsSubscribed(true);
      setPermission(currentPermission);
      setError(null);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Subscription failed';
      console.error('❌ Subscribe error:', err);

      const userAgent = navigator.userAgent;
      const isAndroid = /Android/i.test(userAgent);

      if (errorMessage.includes('timeout')) {
        setError(isAndroid ?
          '⏱️ Android timeout: Check connection & restart Chrome' :
          'Connection timeout. Please try again.'
        );
      } else if (errorMessage.includes('permission') || errorMessage.includes('Permission')) {
        setError('Permission required. Please allow notifications in browser settings.');
      } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Network')) {
        setError(isAndroid ?
          '📱 Android network error: Check WiFi/mobile data' :
          'Network error. Please check connection.'
        );
      } else {
        setError(`Subscription failed: ${errorMessage}`);
      }
      setIsSubscribed(false);
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, user, requestPermission]);

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
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/push/unsubscribe`, {
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


  return true;
}