import { useEffect } from 'react';

export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      const userAgent = navigator.userAgent;
      const isAndroid = /Android/i.test(userAgent);
      const isChrome = /Chrome/i.test(userAgent);



      try {
        // For Android, force unregister and re-register for better reliability
        if (isAndroid) {

          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const reg of registrations) {
            await reg.unregister();

          }
        }

        // Register with specific options for Android compatibility
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none', // Force fresh registration
          type: isAndroid ? 'module' : undefined // Try module worker on Android
        });



        // Wait for the service worker to be ready
        await navigator.serviceWorker.ready;


        // Handle updates
        registration.addEventListener('updatefound', () => {

          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {

              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available; show update notification

                if (confirm('New content available. Reload to update?')) {
                  window.location.reload();
                }
              }
            });
          }
        });

        // Android-specific: Ensure service worker is active
        if (isAndroid && registration.active) {

          registration.active.postMessage({
            type: 'ANDROID_SETUP',
            userAgent
          });
        }

        return registration;

      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);

        // Android-specific retry with delay
        if (isAndroid) {

          setTimeout(async () => {
            try {
              const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/',
                updateViaCache: 'none'
              });

            } catch (retryError) {
              console.error('❌ Android retry failed:', retryError);
              // Show user-friendly error for Android
              console.warn('📱 Android users: Please restart Chrome app if notifications don\'t work');
            }
          }, 5000);
        }
      }
    });
  }
}

// Custom hook to register service worker
export function useServiceWorker() {
  useEffect(() => {
    registerServiceWorker();
  }, []);
}

// Manual registration function
export async function manualRegisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      // Unregister existing service worker first
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();

      }

      // Register new service worker
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });


      return registration;
    } catch (error) {
      console.error('Manual Service Worker registration failed:', error);
      throw error;
    }
  }
  throw new Error('Service Worker not supported');
}