'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const registered = searchParams.get('registered') === 'true';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/contacts');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      // Redirect on success
      router.push('/contacts');
    } catch (err: any) {
      // Handle error from API
      setError(
        err.response?.data?.message ||
        err.message ||
        'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Login
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Sign in to your Contact Hub account
        </p>

        {/* Success message from registration */}
        {registered && (
          <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm mb-4">
            Registration successful! Please login with your credentials.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/register" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Register here
          </Link>
        </p>

        {/* Dev Mode - Temporary bypass for viewing pages without database */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => {
              // Mock login data for dev viewing
              localStorage.setItem('token', 'dev-token-mock');
              localStorage.setItem('user', JSON.stringify({
                id: 'dev-user-123',
                email: 'dev@example.com',
                role: 'user'
              }));
              router.push('/contacts');
            }}
            className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm"
          >
            🚀 Dev Mode: View Contacts (No DB Required)
          </button>
          <p className="mt-2 text-xs text-center text-gray-500">
            Temporary bypass to view pages without database connection
          </p>
        </div>
      </div>
    </div>
  );
}

