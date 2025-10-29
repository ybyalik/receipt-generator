import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ToastContainer';
import { FiSearch, FiEdit2, FiTrash2, FiCheck, FiX, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';

interface User {
  id: number;
  firebaseUid: string;
  email: string;
  displayName: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionPlan: string | null;
  subscriptionStatus: string | null;
  subscriptionEndsAt: Date | null;
  isPremium: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function AdminUsers() {
  const router = useRouter();
  const { user, loading, isAdmin } = useAuth();
  const { showSuccess, showError } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const fetchUsers = useCallback(async (search?: string) => {
    if (!user?.email) return;
    
    try {
      const params = new URLSearchParams({ userEmail: user.email });
      if (search) params.append('search', search);
      
      const url = `/api/admin/users?${params.toString()}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (error: any) {
      showError(error.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, [user?.email, showError]);

  useEffect(() => {
    if (loading) return;

    if (!user || !isAdmin()) {
      router.push('/');
      return;
    }

    fetchUsers();
  }, [user, loading, isAdmin, router, fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(searchQuery);
  };

  const handleDeleteUser = async (userId: number) => {
    if (!user?.email) return;
    
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: user.email }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      showSuccess('User deleted successfully');
      setDeleteConfirm(null);
      fetchUsers(searchQuery);
    } catch (error: any) {
      showError(error.message || 'Failed to delete user');
    }
  };

  const togglePremium = async (userId: number, currentStatus: boolean) => {
    if (!user?.email) return;
    
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userEmail: user.email,
          isPremium: !currentStatus 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      showSuccess(`User ${!currentStatus ? 'granted' : 'revoked'} premium access`);
      fetchUsers(searchQuery);
    } catch (error: any) {
      showError(error.message || 'Failed to update user');
    }
  };

  const getStatusBadge = (status: string | null) => {
    const badges = {
      active: 'bg-success-100 text-success-700',
      trialing: 'bg-blue-100 text-blue-700',
      past_due: 'bg-warning-100 text-warning-700',
      canceled: 'bg-error-100 text-error-700',
    };

    if (!status) return null;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-700'}`}>
        {status}
      </span>
    );
  };

  if (loading || isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-accent-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-navy-600">Loading users...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>User Management - Admin</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy-900 mb-2">User Management</h1>
          <p className="text-navy-600">Manage users and their subscriptions</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by email or name..."
                className="w-full pl-10 pr-4 py-2 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
            </div>
            <button
              type="submit"
              className="bg-accent-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-accent-700 transition-colors cursor-pointer"
            >
              Search
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  fetchUsers();
                }}
                className="bg-navy-100 text-navy-700 px-6 py-2 rounded-lg font-semibold hover:bg-navy-200 transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-navy-50 border-b border-navy-200">
                <tr>
                  <th className="text-left py-3 px-4 text-navy-900 font-semibold">User</th>
                  <th className="text-left py-3 px-4 text-navy-900 font-semibold">Plan</th>
                  <th className="text-left py-3 px-4 text-navy-900 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 text-navy-900 font-semibold">Subscription Ends</th>
                  <th className="text-left py-3 px-4 text-navy-900 font-semibold">Joined</th>
                  <th className="text-left py-3 px-4 text-navy-900 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-navy-600">
                      {searchQuery ? 'No users found matching your search' : 'No users yet'}
                    </td>
                  </tr>
                ) : (
                  users.map((userData) => (
                    <tr key={userData.id} className="border-b border-navy-100 hover:bg-navy-50">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-navy-900">
                            {userData.displayName || 'No name'}
                          </div>
                          <div className="text-sm text-navy-600">{userData.email}</div>
                          {userData.isPremium && (
                            <span className="inline-flex items-center text-xs text-accent-600 mt-1">
                              <FiCheck className="mr-1" />
                              Premium
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-navy-700 capitalize">
                          {userData.subscriptionPlan || 'Free'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {userData.subscriptionStatus ? getStatusBadge(userData.subscriptionStatus) : (
                          <span className="text-navy-500 text-sm">No subscription</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {userData.subscriptionEndsAt ? (
                          <span className="text-navy-700 text-sm">
                            {format(new Date(userData.subscriptionEndsAt), 'MMM d, yyyy')}
                          </span>
                        ) : (
                          <span className="text-navy-500 text-sm">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-navy-700 text-sm">
                          {format(new Date(userData.createdAt), 'MMM d, yyyy')}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => togglePremium(userData.id, userData.isPremium)}
                            className={`p-2 rounded-lg transition-colors cursor-pointer ${
                              userData.isPremium
                                ? 'bg-error-100 text-error-600 hover:bg-error-200'
                                : 'bg-success-100 text-success-600 hover:bg-success-200'
                            }`}
                            title={userData.isPremium ? 'Revoke Premium' : 'Grant Premium'}
                          >
                            {userData.isPremium ? <FiX /> : <FiCheck />}
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(userData.id)}
                            className="p-2 bg-error-100 text-error-600 rounded-lg hover:bg-error-200 transition-colors cursor-pointer"
                            title="Delete User"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-navy-900 mb-4">Delete User</h3>
            <p className="text-navy-600 mb-6">
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-navy-100 text-navy-700 rounded-lg hover:bg-navy-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(deleteConfirm)}
                className="px-4 py-2 bg-error-600 text-white rounded-lg hover:bg-error-700 transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
