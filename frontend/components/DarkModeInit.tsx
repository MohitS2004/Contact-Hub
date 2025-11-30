'use client';

import { useEffect } from 'react';

/**
 * Initializes dark mode from localStorage before React hydration
 * This prevents flash of wrong theme on page load
 */
export default function DarkModeInit() {
  useEffect(() => {
    const stored = localStorage.getItem('darkMode');
    const isDark = stored === 'true';
    const html = document.documentElement;
    
    // Apply dark mode class immediately to prevent flash
    if (isDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, []);

  return null;
}

