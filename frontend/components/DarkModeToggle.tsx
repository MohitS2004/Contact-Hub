'use client';

import { useEffect, useState } from 'react';

export default function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  /**
   * Initialize dark mode from localStorage on component mount
   * Prevents hydration mismatch by applying the class before rendering
   */
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('darkMode');
    const isDark = stored === 'true';
    setDarkMode(isDark);
    
    // Apply dark mode class immediately to prevent flash of wrong theme
    const html = document.documentElement;
    if (isDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, []);

  /**
   * Toggles dark mode by adding/removing the 'dark' class from the document element
   * and updating localStorage to persist the preference
   */
  const handleToggle = () => {
    const html = document.documentElement;
    
    // Toggle the dark class on the document element
    html.classList.toggle('dark');
    const finalState = html.classList.contains('dark');
    
    // Update React state and localStorage to persist preference
    setDarkMode(finalState);
    localStorage.setItem('darkMode', String(finalState));
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <div className="w-9 h-9" aria-hidden="true" />;
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleToggle();
      }}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 cursor-pointer"
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      type="button"
    >
      {darkMode ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}
