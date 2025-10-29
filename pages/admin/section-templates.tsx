import type { NextPage } from 'next';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { FiPlus, FiEdit, FiTrash2, FiSave, FiX } from 'react-icons/fi';
import { useToast } from '../../components/ToastContainer';
import type { Section } from '../../lib/types';

interface SectionTemplate {
  id: number;
  sectionType: string;
  name: string;
  defaultData: any;
  createdAt: string;
  updatedAt: string;
}

const SectionTemplates: NextPage = () => {
  const router = useRouter();
  const { user, loading, isAdmin } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();
  const [templates, setTemplates] = useState<SectionTemplate[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<Partial<SectionTemplate>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState<Partial<SectionTemplate>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    if (user && isAdmin()) {
      fetchTemplates();
    }
  }, [user, isAdmin]);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/admin/section-templates');
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch (error) {
      showError('Failed to load section templates');
    }
  };

  if (loading) {
    return (
      <Layout>
        <Head>
          <title>Section Templates - Admin</title>
        </Head>
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!user || !isAdmin()) {
    return (
      <Layout>
        <Head>
          <title>Unauthorized - ReceiptGen</title>
        </Head>
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-red-600">Unauthorized Access</h1>
          <p className="mt-2 text-gray-600">You need admin privileges to access this page.</p>
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

  const handleEdit = (template: SectionTemplate) => {
    setEditForm(template);
    setShowEditModal(true);
  };

  const handleSave = async () => {
    if (!editForm.id) return;
    
    try {
      const res = await fetch(`/api/admin/section-templates/${editForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: user?.email,
          ...editForm,
        }),
      });

      if (res.ok) {
        showSuccess('Section template updated!');
        setShowEditModal(false);
        setEditForm({});
        fetchTemplates();
      } else {
        showError('Failed to update section template');
      }
    } catch (error) {
      showError('Failed to update section template');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/section-templates/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        showSuccess(`Section template deleted!`);
        setDeleteConfirm(null);
        fetchTemplates();
      } else {
        showError('Failed to delete section template');
      }
    } catch (error) {
      showError('Failed to delete section template');
    }
  };

  const handleAdd = async () => {
    if (!addForm.sectionType || !addForm.name || !addForm.defaultData) {
      showWarning('Please fill in all fields');
      return;
    }

    try {
      const res = await fetch('/api/admin/section-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: user?.email,
          ...addForm,
        }),
      });

      if (res.ok) {
        showSuccess('Section template added!');
        setShowAddModal(false);
        setAddForm({});
        fetchTemplates();
      } else {
        showError('Failed to add section template');
      }
    } catch (error) {
      showError('Failed to add section template');
    }
  };

  const getSectionTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      header: 'Header',
      custom_message: 'Custom Message',
      items_list: 'Items List',
      payment: 'Payment',
      date_time: 'Date/Time',
      barcode: 'Barcode',
    };
    return labels[type] || type;
  };

  return (
    <Layout>
      <Head>
        <title>Section Templates - Admin</title>
      </Head>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Section Templates</h1>
            <p className="text-gray-600 mt-2">Manage default values for section types</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <FiPlus /> Add New Template
          </button>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Section Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {templates.map((template) => (
                <tr key={template.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      {getSectionTypeLabel(template.sectionType)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{template.name}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(template.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(template)}
                        className="text-blue-600 hover:text-blue-900 cursor-pointer"
                      >
                        <FiEdit size={18} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ id: template.id, name: template.name })}
                        className="text-red-600 hover:text-red-900 cursor-pointer"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Add Section Template</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Section Type</label>
                  <select
                    value={addForm.sectionType || ''}
                    onChange={(e) => setAddForm({ ...addForm, sectionType: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="">Select type...</option>
                    <option value="header">Header</option>
                    <option value="custom_message">Custom Message</option>
                    <option value="items_list">Items List</option>
                    <option value="payment">Payment</option>
                    <option value="date_time">Date/Time</option>
                    <option value="barcode">Barcode</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={addForm.name || ''}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="e.g., Default Header"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Default Data (JSON)</label>
                  <textarea
                    value={addForm.defaultData ? JSON.stringify(addForm.defaultData, null, 2) : ''}
                    onChange={(e) => {
                      try {
                        setAddForm({ ...addForm, defaultData: JSON.parse(e.target.value) });
                      } catch {}
                    }}
                    className="w-full border border-gray-300 rounded px-3 py-2 font-mono text-sm h-64"
                    placeholder='{"alignment": "center", "logoSize": 50, ...}'
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setAddForm({});
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Add Template
                </button>
              </div>
            </div>
          </div>
        )}

        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Edit Section Template</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Section Type</label>
                  <select
                    value={editForm.sectionType || ''}
                    onChange={(e) => setEditForm({ ...editForm, sectionType: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="header">Header</option>
                    <option value="custom_message">Custom Message</option>
                    <option value="items_list">Items List</option>
                    <option value="payment">Payment</option>
                    <option value="date_time">Date/Time</option>
                    <option value="barcode">Barcode</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="e.g., Default Header"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Default Data (JSON)</label>
                  <textarea
                    value={editForm.defaultData ? JSON.stringify(editForm.defaultData, null, 2) : ''}
                    onChange={(e) => {
                      try {
                        setEditForm({ ...editForm, defaultData: JSON.parse(e.target.value) });
                      } catch {}
                    }}
                    className="w-full border border-gray-300 rounded px-3 py-2 font-mono text-sm h-64"
                    placeholder='{"alignment": "center", "logoSize": 50, ...}'
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditForm({});
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Confirm Delete</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{deleteConfirm.name}"? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SectionTemplates;
