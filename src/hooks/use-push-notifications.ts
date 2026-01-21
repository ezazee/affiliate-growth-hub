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
      const supported = 'serviceWorker' in navigator && 
                       'PushManager' in window && 
                       'Notification' in window;
      setIsSupported(supported);
      
      if (supported) {
        setPermission(Notification.permission);
      }
    };

    checkSupport();
  }, []);

  // Check current subscription status
  useEffect(() => {
    if (!isSupported) return;

    const checkSubscription = async () => {
      try {
        console.log('🔍 Checking current subscription status...');
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.getSubscription();
        
        if (sub) {
          const subscriptionData = sub.toJSON() as PushSubscription;
          setSubscription(subscriptionData);
          setIsSubscribed(true);
          console.log('✅ Found existing subscription:', subscriptionData.endpoint);
        } else {
          setIsSubscribed(false);
          console.log('ℹ️ No existing subscription found');
        }
      } catch (err) {
        console.error('❌ Error checking subscription:', err);
        setError('Failed to check subscription status');
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

  // Subscribe to push notifications
  const subscribe = useCallback(async (retryCount = 0) => {
    if (!isSupported) {
      setError('Push notifications are not supported');
      return;
    }

    if (retryCount > 2) {
      setError('Failed after 3 attempts. Please check your connection and try again.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    console.log(`🔄 Subscription attempt ${retryCount + 1}/3`);

    try {
      console.log('🔔 Current permission status:', permission);
      
      // Always check and request permission
      console.log('🔔 Requesting permission...');
      const currentPermission = await Promise.race([
        Notification.requestPermission(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Permission request timeout')), 10000)
        )
      ]) as NotificationPermission;
      
      console.log('📝 Permission request result:', currentPermission);
      
      if (currentPermission !== 'granted') {
        setError(`Permission ${currentPermission}. Please allow notifications in browser settings.`);
        setIsLoading(false);
        return;
      }
      
      console.log('✅ Permission granted!');

      console.log('🔄 Starting push subscription process...');
      
      // Get service worker registration with timeout
      console.log('📱 Getting service worker registration...');
      const registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Service worker registration timeout')), 10000)
        )
      ]);
      console.log('✅ Service worker ready:', registration.scope);
      
      // Check existing subscription first
      console.log('🔍 Checking existing subscription...');
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log('🔄 Found existing subscription, updating...');
        const subscriptionData = existingSubscription.toJSON() as PushSubscription;
        setSubscription(subscriptionData);
        setIsSubscribed(true);
        
        // Update server with existing subscription
        const response = await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': user?.email || '',
          },
          body: JSON.stringify(subscriptionData),
        });

        if (response.ok) {
          console.log('✅ Existing subscription updated on server');
          setIsLoading(false);
          return;
        }
      }
      
      // Convert VAPID key
      console.log('🔑 Converting VAPID key...');
      if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
        throw new Error('VAPID public key not found');
      }
      
      const applicationServerKey = urlB64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      );
      console.log('✅ VAPID key converted, length:', applicationServerKey.length);

      // Subscribe to push with timeout
      console.log('🔔 Subscribing to push manager...');
      const pushSubscription = await Promise.race([
        registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
        }),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Push subscription timeout')), 15000)
        )
      ]);
      
      console.log('✅ Push subscription successful:', pushSubscription.endpoint);

      const subscriptionData = pushSubscription.toJSON() as PushSubscription;
      setSubscription(subscriptionData);
      setIsSubscribed(true);
      console.log('💾 Sending subscription to server...');

      // Send subscription to server with timeout
      const response = await Promise.race([
        fetch('/api/push/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': user?.email || '',
          },
          body: JSON.stringify(subscriptionData),
        }),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Server request timeout')), 10000)
        )
      ]) as Response;

      console.log('📡 Server response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server error:', errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('✅ Subscription saved on server:', result);

    } catch (err) {
      console.error('❌ Subscription error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to subscribe to push notifications';
      console.error('❌ Error details:', errorMessage);
      
      // Retry for network errors
      if (errorMessage.includes('timeout') || errorMessage.includes('network') || errorMessage.includes('fetch')) {
        console.log(`🔄 Retrying subscription... (${retryCount + 1}/3)`);
        setTimeout(() => subscribe(retryCount + 1), 2000);
        return;
      }
      
      setError(errorMessage);
      setIsSubscribed(false);
    } finally {
      if (retryCount === 0) { // Only set loading to false on final attempt
        setIsLoading(false);
        console.log('🏁 Subscription process finished');
      }
    }
  }, [isSupported, permission, requestPermission]);

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