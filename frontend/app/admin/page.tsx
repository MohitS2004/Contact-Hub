'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { getAdminStats, AdminStats } from '@/lib/api';

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is admin
    if (isAuthenticated && user?.role !== 'admin') {
      router.push('/contacts');
      return;
    }

    if (isAuthenticated && user?.role === 'admin') {
      fetchStats();
    }
  }, [isAuthenticated, user, router]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAdminStats();
      setStats(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load admin stats');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

          {loading && (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading stats...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {!loading && !error && stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Total Users Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
                  </div>
                  <div className="p-3 bg-indigo-100 rounded-full">
                    <svg
                      className="w-8 h-8 text-indigo-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                </div>
                <Link
                  href="/admin/users"
                  className="mt-4 inline-block text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Manage Users →
                </Link>
              </div>

              {/* Total Contacts Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Contacts</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalContacts}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
                <Link
                  href="/admin/contacts"
                  className="mt-4 inline-block text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Manage Contacts →
                </Link>
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/admin/users"
                className="p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 mb-2">Manage Users</h3>
                <p className="text-sm text-gray-600">
                  View, edit, and delete users. Change user roles.
                </p>
              </Link>
              <Link
                href="/admin/contacts"
                className="p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 mb-2">Manage Contacts</h3>
                <p className="text-sm text-gray-600">
                  View all contacts across all users. Search and filter contacts.
                </p>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

