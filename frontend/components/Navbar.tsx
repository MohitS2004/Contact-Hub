'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import DarkModeToggle from './DarkModeToggle';

export default function Navbar() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();

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
              className="px-3 md:px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}


