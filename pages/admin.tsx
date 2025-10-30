import type { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useTemplates } from '../contexts/TemplatesContext';
import { useAuth } from '../contexts/AuthContext';
import { FiPlus, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import { useToast } from '../components/ToastContainer';

const Admin: NextPage = () => {
  const router = useRouter();
  const { user, loading, isAdmin } = useAuth();
  const { templates, addTemplate, deleteTemplate } = useTemplates();
  const { showSuccess, showError, showWarning } = useToast();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  // Wait for auth to load before checking access
  if (loading) {
    return (
      <Layout>
        <Head>
          <title>Admin - ReceiptGen</title>
        </Head>
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </Layout>
    );
  }

  // Show unauthorized message for non-authenticated or non-admin users
  if (!user || !isAdmin()) {
    return (
      <Layout>
        <Head>
          <title>Unauthorized - ReceiptGen</title>
        </Head>
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-red-600">Unauthorized Access</h1>
          <p className="mt-2 text-gray-600">
            {!user ? 'Please sign in to access this page.' : 'You need admin privileges to access this page.'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Go Home
          </button>
        </div>
      </Layout>
    );
  }

  const handleCreateTemplate = () => {
    setShowCreateModal(true);
  };

  const createTemplate = async () => {
    if (!newTemplateName.trim()) {
      showWarning('Please enter a template name');
      return;
    }

    if (!user) {
      showError('You must be logged in to create templates');
      return;
    }

    const slug = newTemplateName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const newTemplate = {
      id: Date.now().toString(),
      name: newTemplateName,
      slug: slug,
      sections: [
        {
          type: 'header' as const,
          id: `header-${Date.now()}`,
          alignment: 'center' as const,
          logoSize: 50,
          businessDetails: 'Your Business Name\nYour Address\nCity, State ZIP',
          dividerAtBottom: true,
          dividerStyle: 'dashed' as const,
        },
      ],
      settings: {
        currency: '$',
        currencyFormat: 'symbol_before' as const,
        font: 'courier' as const,
        textColor: '#000000',
        backgroundTexture: 'none' as const,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const createdTemplate = await addTemplate(newTemplate, user.email);
    setNewTemplateName('');
    setShowCreateModal(false);
    router.push(`/admin/templates/${createdTemplate.id}`);
  };

  const handleEditTemplate = (templateId: string) => {
    router.push(`/admin/templates/${templateId}`);
  };

  const handleDeleteTemplate = async (templateId: string, templateName: string) => {
    if (!user) {
      showError('You must be logged in to delete templates');
      return;
    }

    setDeleteConfirm({ id: templateId, name: templateName });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm || !user) return;
    
    await deleteTemplate(deleteConfirm.id, user.email);
    showSuccess(`Template "${deleteConfirm.name}" has been deleted!`);
    setDeleteConfirm(null);
  };

  return (
    <Layout>
      <Head>
        <title>Admin - ReceiptGen</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => router.push('/admin/blog')}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Manage Blog
            </button>
            <button 
              onClick={() => router.push('/admin/generate-templates')}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <FiPlus className="mr-2" />
              AI Generator
            </button>
            <button 
              onClick={handleCreateTemplate}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiPlus className="mr-2" />
              Create New Template
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Templates</h2>
          </div>

          <div className="divide-y">
            {templates.map((template) => (
              <div key={template.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <h3 className="font-semibold">{template.name}</h3>
                  <p className="text-sm text-gray-600">
                    {template.sections.length} sections • Created {new Date(template.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => router.push(`/template/${template.slug}`)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors cursor-pointer"
                    title="View front-end template"
                  >
                    <FiEye />
                  </button>
                  <button 
                    onClick={() => handleEditTemplate(template.id)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                    title="Edit global template"
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

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Available Section Types</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Header', desc: 'Business logo and details' },
              { name: 'Custom Message', desc: 'Custom text message' },
              { name: 'Items List', desc: 'Line items with prices' },
              { name: 'Payment', desc: 'Payment information' },
              { name: 'Date & Time', desc: 'Transaction timestamp' },
              { name: 'Barcode', desc: 'Barcode generation' },
            ].map((sectionType) => (
              <div key={sectionType.name} className="border rounded-lg p-4">
                <h3 className="font-semibold mb-1">{sectionType.name}</h3>
                <p className="text-sm text-gray-600">{sectionType.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Create New Template</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Template Name</label>
              <input
                type="text"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="e.g., Hotel Receipt"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => e.key === 'Enter' && createTemplate()}
              />
              <p className="text-sm text-gray-500 mt-1">
                URL will be: /{newTemplateName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'template-name'}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={createTemplate}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Create Template
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewTemplateName('');
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Delete Template</h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete &quot;<strong>{deleteConfirm.name}</strong>&quot;? This action cannot be undone.
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

export default Admin;
