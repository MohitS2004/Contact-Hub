'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import ContactsTable from '@/components/ContactsTable';
import { useAuth } from '@/contexts/AuthContext';
import { getAdminContacts, getAdminContact, deleteAdminContact, AdminContact } from '@/lib/api';
import { formatLocalDateOnly } from '@/lib/dateUtils';

export default function AdminContactsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [contacts, setContacts] = useState<AdminContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user?.role !== 'admin') {
      router.push('/contacts');
      return;
    }
    if (isAuthenticated && user?.role === 'admin') {
      fetchContacts();
    }
  }, [isAuthenticated, user, router, page, limit, searchQuery, sortBy, sortOrder]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAdminContacts(page, limit, searchQuery || undefined, sortBy, sortOrder);
      setContacts(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteAdminContact(id);
      fetchContacts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete contact');
    } finally {
      setDeletingId(null);
    }
  };

  const getSortValue = (): string => {
    if (sortBy === 'name') {
      return sortOrder === 'ASC' ? 'name-asc' : 'name-desc';
    }
    if (sortBy === 'createdAt') {
      return sortOrder === 'DESC' ? 'newest' : 'oldest';
    }
    return 'newest';
  };

  const setSortFromValue = (value: string) => {
    switch (value) {
      case 'name-asc':
        setSortBy('name');
        setSortOrder('ASC');
        break;
      case 'name-desc':
        setSortBy('name');
        setSortOrder('DESC');
        break;
      case 'newest':
        setSortBy('createdAt');
        setSortOrder('DESC');
        break;
      case 'oldest':
        setSortBy('createdAt');
        setSortOrder('ASC');
        break;
      default:
        setSortBy('createdAt');
        setSortOrder('DESC');
    }
    setPage(1);
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Manage Contacts</h1>
            <Link href="/admin" className="text-indigo-600 hover:text-indigo-700">
              ← Back to Admin
            </Link>
          </div>

          {/* Filter and Sort Controls */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  id="sort"
                  value={getSortValue()}
                  onChange={(e) => setSortFromValue(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                </select>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Showing {contacts.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, total)} of {total} contacts
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {!loading && contacts.length === 0 && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              {searchQuery ? (
                <p className="text-gray-600 text-lg">No results for &quot;{searchQuery}&quot;</p>
              ) : (
                <p className="text-gray-600 text-lg">No contacts found</p>
              )}
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading contacts...</p>
            </div>
          )}

          {!loading && contacts.length > 0 && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {contacts.map((contact) => (
                      <tr key={contact.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{contact.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contact.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contact.phone}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contact.ownerEmail || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatLocalDateOnly(contact.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/contacts/${contact.id}`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              View
                            </Link>
                            <Link
                              href={`/contacts/${contact.id}/edit`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(contact.id)}
                              disabled={deletingId === contact.id}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            >
                              {deletingId === contact.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

