import type { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { mockTemplates } from '../lib/mockTemplates';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';

const Admin: NextPage = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState(mockTemplates);

  if (!user) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to access the admin panel</h1>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Admin - ReceiptGen</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <FiPlus className="mr-2" />
            Create New Template
          </button>
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
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                    <FiEdit />
                  </button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded">
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
    </Layout>
  );
};

export default Admin;
