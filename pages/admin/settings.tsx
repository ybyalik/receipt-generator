import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { FiSave, FiRefreshCw, FiArrowLeft } from 'react-icons/fi';

export default function AdminSettings() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [seoPrompt, setSeoPrompt] = useState('');
  const [isDefault, setIsDefault] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin()) {
      router.push('/');
    }
  }, [user, isAdmin, authLoading, router]);

  useEffect(() => {
    if (isAdmin()) {
      fetchSeoPrompt();
    }
  }, [isAdmin]);

  const fetchSeoPrompt = async () => {
    try {
      const response = await fetch('/api/settings/seo-prompt');
      const data = await response.json();
      setSeoPrompt(data.prompt);
      setIsDefault(data.isDefault);
    } catch (error) {
      console.error('Failed to fetch SEO prompt:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSeoPrompt = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings/seo-prompt', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: seoPrompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to save SEO prompt');
      }

      alert('SEO prompt saved successfully!');
      setIsDefault(false);
    } catch (error) {
      console.error('Error saving SEO prompt:', error);
      alert('Failed to save SEO prompt. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = async () => {
    if (!confirm('Are you sure you want to reset to the default prompt? This action cannot be undone.')) {
      return;
    }
    setLoading(true);
    await fetchSeoPrompt();
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!isAdmin()) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl text-red-600">Unauthorized Access</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <button
          onClick={() => router.push('/admin')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <FiArrowLeft className="mr-2" />
          Back to Admin Panel
        </button>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-navy-900 mb-6">Admin Settings</h1>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-navy-900">SEO Content Generation Prompt</h2>
              {isDefault && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  Using Default
                </span>
              )}
            </div>

            <p className="text-gray-600 mb-4">
              Customize the AI prompt used to generate SEO content for receipt templates. Use {'{templateName}'} and {'{sections}'} as placeholders that will be replaced with actual template data.
            </p>

            <textarea
              value={seoPrompt}
              onChange={(e) => setSeoPrompt(e.target.value)}
              rows={15}
              className="w-full border border-gray-300 rounded-lg p-4 font-mono text-sm focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
              placeholder="Enter your custom SEO prompt here..."
            />

            <div className="mt-4 flex gap-4">
              <button
                onClick={saveSeoPrompt}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-accent-600 text-white rounded-lg hover:bg-accent-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <FiSave />
                {saving ? 'Saving...' : 'Save Prompt'}
              </button>

              <button
                onClick={resetToDefault}
                className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <FiRefreshCw />
                Reset to Default
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Tips for Writing Good Prompts:</h3>
            <ul className="list-disc list-inside text-blue-800 space-y-1 text-sm">
              <li>Be specific about the tone and style you want</li>
              <li>Include instructions for HTML formatting (h2, h3, p, ul, li tags)</li>
              <li>Specify desired content length (e.g., 300-500 words)</li>
              <li>Use {'{templateName}'} to insert the template name</li>
              <li>Use {'{sections}'} to insert the list of template sections</li>
              <li>Include SEO best practices like keyword usage and readability</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}
