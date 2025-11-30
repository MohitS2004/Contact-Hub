'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import ContactsTable from '@/components/ContactsTable';
import EmptyState from '@/components/EmptyState';
import { TableSkeleton } from '@/components/LoadingSkeleton';
import { useAuth } from '@/contexts/AuthContext';
import { getContacts, deleteContact, exportContactsToCsv, Contact } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ContactsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Filter and pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  
  // Helper function to get sort option value
  const getSortValue = (): string => {
    if (sortBy === 'name') {
      return sortOrder === 'ASC' ? 'name-asc' : 'name-desc';
    }
    if (sortBy === 'createdAt') {
      return sortOrder === 'DESC' ? 'newest' : 'oldest';
    }
    return 'newest';
  };

  // Helper function to set sort from option value
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
    setPage(1); // Reset to first page on sort change
  };

  // Initial load and check for success messages
  useEffect(() => {
    // Check for success messages from query params
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('created') === 'true') {
        setSuccessMessage('Contact created successfully!');
        router.replace('/contacts');
      } else if (params.get('updated') === 'true') {
        setSuccessMessage('Contact updated successfully!');
        router.replace('/contacts');
      } else if (params.get('deleted') === 'true') {
        setSuccessMessage('Contact deleted successfully!');
        router.replace('/contacts');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced search - reset to page 1 when search changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch contacts when filters/pagination change
  useEffect(() => {
    fetchContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, searchQuery, sortBy, sortOrder]);

  // Auto-dismiss success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getContacts(page, limit, searchQuery || undefined, sortBy, sortOrder);
      // Handle paginated response
      setContacts(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load contacts';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1); // Reset to first page on search
  };


  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteContact(id);
      // Refresh contacts list
      fetchContacts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete contact');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Contacts</h1>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={async () => {
                  try {
                    await exportContactsToCsv();
                    toast.success('Contacts exported successfully!');
                  } catch (err: any) {
                    toast.error(err.message || 'Failed to export contacts');
                  }
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:bg-green-500 dark:hover:bg-green-600 text-sm sm:text-base"
              >
                Export CSV
              </button>
              <Link
                href="/contacts/new"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-center text-sm sm:text-base"
              >
                Add New Contact
              </Link>
            </div>
          </div>

          {/* Filter and Sort Controls */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700"
                />
              </div>

              {/* Sort */}
              <div className="md:col-span-2">
                <label htmlFor="sort" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sort By
                </label>
                <select
                  id="sort"
                  value={getSortValue()}
                  onChange={(e) => setSortFromValue(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                </select>
              </div>
            </div>

            {/* Results count and limit */}
            <div className="mt-4 flex justify-between items-center flex-wrap gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {total > 0 ? (
                  <>
                    Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} contacts
                  </>
                ) : (
                  <span>No contacts found</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="limit" className="text-sm text-gray-700 dark:text-gray-300">
                  Per page:
                </label>
                <select
                  id="limit"
                  value={limit}
                  onChange={(e) => handleLimitChange(Number(e.target.value))}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 text-sm"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>
          </div>

          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex justify-between items-center">
              <p className="text-green-700">{successMessage}</p>
              <button
                onClick={() => setSuccessMessage('')}
                className="text-green-700 hover:text-green-900"
              >
                ×
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {loading && <TableSkeleton />}

          {!loading && !error && contacts.length === 0 && (
            <EmptyState
              title={searchQuery ? `No results for "${searchQuery}"` : 'No contacts yet'}
              description={
                searchQuery
                  ? 'Try a different search term or clear your search to see all contacts.'
                  : 'Get started by creating your first contact!'
              }
              actionLabel={searchQuery ? 'Clear search' : 'Create your first contact'}
              actionHref={searchQuery ? undefined : '/contacts/new'}
              onAction={searchQuery ? () => handleSearchChange('') : undefined}
            />
          )}

          {!loading && contacts.length > 0 && (
            <ContactsTable
              contacts={contacts}
              onDelete={handleDelete}
              deletingId={deletingId}
            />
          )}

          {/* Pagination Controls */}
          {!loading && !error && totalPages > 0 && (
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                {/* Page info */}
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Page {page} of {totalPages}
                </div>

                {/* Pagination buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                            page === pageNum
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
