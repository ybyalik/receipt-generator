import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ToastContainer';

export default function AdminSettings() {
  const router = useRouter();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const [seoPrompt, setSeoPrompt] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin())) {
      router.push('/');
      return;
    }

    if (user && isAdmin()) {
      loadSettings();
    }
  }, [user, authLoading, isAdmin, router]);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings/seo-prompt');
      if (response.ok) {
        const data = await response.json();
        setSeoPrompt(data.prompt || getDefaultPrompt());
      } else {
        setSeoPrompt(getDefaultPrompt());
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setSeoPrompt(getDefaultPrompt());
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings/seo-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: seoPrompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      showSuccess('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      showError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSeoPrompt(getDefaultPrompt());
    showSuccess('Reset to default prompt');
  };

  const getDefaultPrompt = () => {
    return `Generate SEO-optimized content for a receipt template titled "{templateName}".

Template Details:
- Name: {templateName}
- Industry/Type: {industry}

Create engaging, informative content (300-500 words) that:
1. Explains what this receipt template is for
2. Describes who would use it (target audience)
3. Highlights key features and sections
4. Includes relevant keywords naturally
5. Provides helpful tips for using this type of receipt
6. Uses clear headings and well-structured paragraphs

Format the content in HTML using these tags only:
- <h2> for main headings
- <h3> for subheadings
- <p> for paragraphs
- <strong> for emphasis
- <ul> and <li> for bullet lists

Make it professional, helpful, and SEO-friendly.`;
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <Head>
          <title>Settings - Admin - ReceiptGen</title>
        </Head>
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!user || !isAdmin()) {
    return null;
  }

  return (
    <Layout>
      <Head>
        <title>Settings - Admin - ReceiptGen</title>
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin')}
            className="text-teal-600 hover:text-teal-800 mb-4"
          >
            ← Back to Admin Panel
          </button>
          <h1 className="text-3xl font-bold">Admin Settings</h1>
          <p className="text-gray-600 mt-2">Configure AI prompts and system settings</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">SEO Content Generation Prompt</h2>
              <button
                onClick={handleReset}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border rounded"
              >
                Reset to Default
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Customize the AI prompt used to generate SEO content for templates. 
              Use <code className="bg-gray-100 px-1 rounded">{'{templateName}'}</code> and <code className="bg-gray-100 px-1 rounded">{'{industry}'}</code> as placeholders.
            </p>

            <textarea
              value={seoPrompt}
              onChange={(e) => setSeoPrompt(e.target.value)}
              className="w-full h-96 px-4 py-3 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Enter your custom AI prompt..."
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-teal-50 border border-teal-200 rounded-lg">
          <h3 className="font-semibold text-teal-900 mb-2">Available Placeholders:</h3>
          <ul className="text-sm text-teal-800 space-y-1">
            <li><code className="bg-white px-2 py-1 rounded">{'{templateName}'}</code> - The name of the template</li>
            <li><code className="bg-white px-2 py-1 rounded">{'{industry}'}</code> - The industry/type extracted from the template name</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
