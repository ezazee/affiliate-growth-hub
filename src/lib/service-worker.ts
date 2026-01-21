import { useEffect } from 'react';

export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        
        console.log('Service Worker registered successfully:', registration.scope);

        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available; refresh the page
                console.log('New content available, refreshing...');
                window.location.reload();
              }
            });
          }
        });

        // Check for existing controller and force update if needed
        if (registration.active) {
          registration.active.postMessage({ type: 'FORCE_UPDATE' });
        }

      } catch (error) {
        console.error('Service Worker registration failed:', error);
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
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('Manual Service Worker registration successful:', registration);
      return registration;
    } catch (error) {
      console.error('Manual Service Worker registration failed:', error);
      throw error;
    }
  }
  throw new Error('Service Worker not supported');
}