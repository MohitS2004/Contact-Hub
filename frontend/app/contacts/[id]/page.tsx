'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { getContact, deleteContact, Contact } from '@/lib/api';
import { formatLocalDate } from '@/lib/dateUtils';

export default function ContactDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchContact();
  }, [id]);

  const fetchContact = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getContact(id);
      setContact(data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Contact not found');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view this contact');
      } else {
        setError(err.response?.data?.message || 'Failed to load contact');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this contact?')) {
      return;
    }

    try {
      setDeleting(true);
      await deleteContact(id);
      router.push('/contacts?deleted=true');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete contact');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-12">
              <p className="text-gray-600">Loading contact...</p>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !contact) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error || 'Contact not found'}</p>
                <Link
                  href="/contacts"
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  ← Back to Contacts
                </Link>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Link
              href="/contacts"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              ← Back to Contacts
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-3xl font-bold text-gray-900">{contact.name}</h1>
              <div className="flex gap-2">
                <Link
                  href={`/contacts/${contact.id}/edit`}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                <p className="text-lg text-gray-900">{contact.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                <p className="text-lg text-gray-900">{contact.phone}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Created</label>
                <p className="text-lg text-gray-900">
                  {formatLocalDate(contact.createdAt)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Last Updated</label>
                <p className="text-lg text-gray-900">
                  {formatLocalDate(contact.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}


