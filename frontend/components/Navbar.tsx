'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import DarkModeToggle from './DarkModeToggle';

export default function Navbar() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4 md:gap-6">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Contact Hub</h1>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/contacts" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Contacts
              </Link>
              {user?.role === 'admin' && (
                <Link href="/admin" className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium">
                  Admin
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <span className="hidden sm:inline text-sm text-gray-600 dark:text-gray-300">
              Welcome, {user?.email?.split('@')[0] || 'User'}
            </span>
            <DarkModeToggle />
            <button
              onClick={handleLogout}
              className="hidden sm:block px-3 md:px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              Logout
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
            <div className="flex flex-col space-y-3">
              <Link
                href="/contacts"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Contacts
              </Link>
              {user?.role === 'admin' && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900 rounded-lg font-medium"
                >
                  Admin
                </Link>
              )}
              <div className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
                Welcome, {user?.email?.split('@')[0] || 'User'}
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="mx-4 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}


