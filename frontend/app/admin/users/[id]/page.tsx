'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { getAdminUser, AdminUser } from '@/lib/api';

export default function AdminUserDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user: currentUser, isAuthenticated } = useAuth();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated && currentUser?.role !== 'admin') {
      router.push('/contacts');
      return;
    }
    if (isAuthenticated && currentUser?.role === 'admin' && params.id) {
      fetchUser();
    }
  }, [isAuthenticated, currentUser, router, params.id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAdminUser(params.id as string);
      setUser(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || currentUser?.role !== 'admin') {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Link href="/admin/users" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 mb-4 inline-block">
              ← Back to Users
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">User Details</h1>
          </div>

          {loading && (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">Loading user details...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6">
              <p className="text-red-700 dark:text-red-100">{error}</p>
            </div>
          )}

          {!loading && !error && user && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">User Information</h2>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}>
                      {user.role.toUpperCase()}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">User ID</label>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-mono">{user.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Created At</label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {new Date(user.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Updated</label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {new Date(user.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

