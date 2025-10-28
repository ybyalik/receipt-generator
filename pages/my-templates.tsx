import type { NextPage } from 'next';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import { Template } from '../lib/types';
import { useToast } from '../components/ToastContainer';

const MyTemplates: NextPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [userTemplates, setUserTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    async function loadUserTemplates() {
      try {
        const res = await fetch(`/api/user-templates?userId=${user.uid}`);
        if (res.ok) {
          const data = await res.json();
          setUserTemplates(data);
        }
      } catch (error) {
        console.error('Failed to load user templates:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUserTemplates();
  }, [user, router]);

  const handleDeleteTemplate = async (templateId: string, templateName: string) => {
    if (!user) return;

    setDeleteConfirm({ id: templateId, name: templateName });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm || !user) return;

    try {
      const res = await fetch(`/api/user-templates/${deleteConfirm.id}?userId=${user.uid}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setUserTemplates(userTemplates.filter(t => t.id !== deleteConfirm.id));
        showSuccess(`Template "${deleteConfirm.name}" has been deleted!`);
        setDeleteConfirm(null);
      } else {
        showError('Failed to delete template. Please try again.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showError('Failed to delete template. Please try again.');
    }
  };

  const handleEditTemplate = (templateId: string) => {
    router.push(`/my-templates/${templateId}`);
  };

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <Head>
        <title>My Templates - ReceiptGen</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Templates</h1>
            <p className="text-gray-600 mt-1">Templates you&apos;ve customized and saved</p>
          </div>
          <button 
            onClick={() => router.push('/templates')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiPlus className="mr-2" />
            Create from Template
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading your templates...</p>
          </div>
        ) : userTemplates.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <h2 className="text-xl font-semibold mb-2">No saved templates yet</h2>
            <p className="text-gray-600 mb-6">
              Start by customizing one of our pre-built templates and save it to your collection.
            </p>
            <button
              onClick={() => router.push('/templates')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiPlus className="mr-2" />
              Browse Templates
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">Your Saved Templates</h2>
            </div>

            <div className="divide-y">
              {userTemplates.map((template) => (
                <div key={template.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <h3 className="font-semibold">{template.name}</h3>
                    <p className="text-sm text-gray-600">
                      {template.sections.length} sections • Saved {new Date(template.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEditTemplate(template.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                      title="Edit template"
                    >
                      <FiEdit />
                    </button>
                    <button 
                      onClick={() => handleDeleteTemplate(template.id, template.name)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                      title="Delete template"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Delete Template</h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete "<strong>{deleteConfirm.name}</strong>"? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default MyTemplates;
