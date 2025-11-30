'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker
            .register('/sw.js')
            .then((registration) => {
              console.log('Service Worker registered successfully:', registration.scope);
            })
            .catch((error) => {
              console.error('Service Worker registration failed:', error);
            });
        });
      }
    }
  }, []);

  return null;
}

