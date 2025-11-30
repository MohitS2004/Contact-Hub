'use client';

import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

export default function ContactsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-xl font-bold text-gray-900">Contact Hub</h1>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Welcome, {user?.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contacts</h2>
            <p className="text-gray-600">
              Your contacts will appear here. This page will be implemented in the next commit.
            </p>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Status:</strong> You are successfully logged in! ✅
              </p>
              <p className="text-sm text-blue-800 mt-2">
                <strong>User ID:</strong> {user?.id}
              </p>
              <p className="text-sm text-blue-800">
                <strong>Role:</strong> {user?.role}
              </p>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}


