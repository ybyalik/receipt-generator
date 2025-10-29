import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../components/Layout';
import ReceiptPreview from '../components/ReceiptPreview';
import SectionEditor from '../components/SectionEditor';
import SettingsPanel from '../components/SettingsPanel';
import { FiDownload, FiSave, FiArrowLeft } from 'react-icons/fi';
import type { Section, TemplateSettings } from '../lib/types';
import html2canvas from 'html2canvas';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ToastContainer';

export default function AIResult() {
  const router = useRouter();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [sections, setSections] = useState<Section[]>([]);
  const [settings, setSettings] = useState<TemplateSettings>({
    font: 'mono',
    currency: 'USD',
    currencyFormat: 'symbol_before',
    receiptWidth: '80mm',
    backgroundTexture: 'none',
    textColor: '#000000',
  });
  const [loading, setLoading] = useState(true);
  const [templateName, setTemplateName] = useState('My AI Receipt');
  const [showSaveModal, setShowSaveModal] = useState(false);
  
  const previewRef = useRef<HTMLDivElement>(null);
  const watermarkPreviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load template from sessionStorage
    const templateDataStr = sessionStorage.getItem('ai-generated-template');
    if (!templateDataStr) {
      router.push('/ai');
      return;
    }

    try {
      const templateData = JSON.parse(templateDataStr);
      setSections(templateData.sections || []);
      setSettings(templateData.settings || settings);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load template:', error);
      router.push('/ai');
    }
  }, []);

  const handleDownload = async () => {
    if (!user?.isPremium) {
      // Show pricing modal or redirect
      router.push('/pricing');
      return;
    }

    if (!previewRef.current) return;

    try {
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });

      const link = document.createElement('a');
      link.download = `ai-receipt-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      // Clear sessionStorage after successful download
      sessionStorage.removeItem('ai-generated-template');
      showSuccess('Receipt downloaded successfully!');
    } catch (error) {
      console.error('Download failed:', error);
      showError('Failed to download receipt');
    }
  };

  const downloadWithWatermark = async () => {
    if (watermarkPreviewRef.current) {
      const canvas = await html2canvas(watermarkPreviewRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      const link = document.createElement('a');
      link.download = `ai-receipt-sample-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
      showSuccess('Sample downloaded! Upgrade to remove watermark.');
    }
  };

  const handleBackToAI = () => {
    // Clear stored template when user explicitly goes back
    sessionStorage.removeItem('ai-generated-template');
    router.push('/ai');
  };

  const handleSaveClick = () => {
    if (!user) {
      router.push('/pricing');
      return;
    }
    setShowSaveModal(true);
  };

  const handleSaveTemplate = async () => {
    if (!user || !templateName.trim()) {
      showError('Please enter a template name');
      return;
    }

    try {
      const response = await fetch('/api/user-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: templateName.trim(),
          sections,
          settings,
          firebaseUid: user.uid,
        }),
      });

      if (!response.ok) throw new Error('Failed to save template');

      showSuccess('Template saved to your collection!');
      setShowSaveModal(false);
      sessionStorage.removeItem('ai-generated-template');
      
      // Redirect to my templates after a short delay
      setTimeout(() => {
        router.push('/my-templates');
      }, 1500);
    } catch (error) {
      console.error('Save failed:', error);
      showError('Failed to save template');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">Loading template...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>AI-Generated Receipt - ReceiptGen</title>
      </Head>

      <div className="max-w-[1400px] mx-auto px-4 py-4 sm:py-8">
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col gap-4 mb-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-navy-900">
                AI-Generated Receipt Template
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Review and customize your automatically generated receipt</p>
            </div>
            <div className="hidden lg:flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={handleBackToAI}
                className="flex items-center justify-center px-4 py-2 bg-gray-100 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <FiArrowLeft className="mr-2" />
                Back to AI
              </button>
              <button
                onClick={handleSaveClick}
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <FiSave className="mr-2" />
                Save Template
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,6fr)_minmax(0,4fr)] gap-8">
          <div className="bg-white rounded-lg shadow p-6 min-w-0 overflow-x-auto order-2 lg:order-1">
            <SettingsPanel settings={settings} onUpdate={setSettings} />
            
            <div className="mt-6 pt-6 border-t">
              <h2 className="text-xl font-bold mb-4">Customize Sections</h2>
              <p className="text-sm text-gray-600 mb-4">
                Edit the extracted data below
              </p>
              
              <div className="space-y-4">
                {sections.map((section) => (
                  <SectionEditor
                    key={section.id}
                    section={section}
                    onUpdate={(updated) => {
                      setSections(sections.map((s) => (s.id === section.id ? updated : s)));
                    }}
                    onRemove={() => {
                      setSections(sections.filter((s) => s.id !== section.id));
                    }}
                    onDuplicate={() => {
                      const newSection = { ...section, id: `${section.id}-${Date.now()}` };
                      const index = sections.findIndex((s) => s.id === section.id);
                      setSections([
                        ...sections.slice(0, index + 1),
                        newSection,
                        ...sections.slice(index + 1),
                      ]);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-8 order-1 lg:order-2">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h2 className="text-lg sm:text-xl font-bold">Live Preview</h2>
                <div className="hidden lg:flex flex-col sm:flex-row gap-2">
                  {!user?.isPremium && (
                    <button
                      onClick={downloadWithWatermark}
                      className="flex items-center justify-center px-3 sm:px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer text-sm sm:text-base"
                    >
                      <FiDownload className="mr-2" />
                      Download Sample
                    </button>
                  )}
                  <button
                    onClick={handleDownload}
                    className="flex items-center justify-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-sm sm:text-base whitespace-nowrap"
                  >
                    <FiDownload className="mr-2" />
                    {user?.isPremium ? 'Download' : 'Remove Watermark'}
                  </button>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <ReceiptPreview
                  sections={sections}
                  settings={settings}
                  showWatermark={!user?.isPremium}
                  previewRef={user?.isPremium ? previewRef : watermarkPreviewRef}
                />
              </div>
              
              {/* Hidden watermark version for premium users */}
              {user?.isPremium && (
                <div className="hidden">
                  <ReceiptPreview
                    sections={sections}
                    settings={settings}
                    showWatermark={true}
                    previewRef={watermarkPreviewRef}
                  />
                </div>
              )}

              {/* Hidden clean version for non-premium users */}
              {!user?.isPremium && (
                <div className="hidden">
                  <ReceiptPreview
                    sections={sections}
                    settings={settings}
                    showWatermark={false}
                    previewRef={previewRef}
                  />
                </div>
              )}

              {/* Mobile-only buttons below preview */}
              <div className="lg:hidden mt-4 flex flex-col gap-2">
                {!user?.isPremium && (
                  <button
                    onClick={downloadWithWatermark}
                    className="flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
                  >
                    <FiDownload className="mr-2" />
                    Download Sample
                  </button>
                )}
                <button
                  onClick={handleDownload}
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <FiDownload className="mr-2" />
                  {user?.isPremium ? 'Download' : 'Remove Watermark'}
                </button>
                <button
                  onClick={handleBackToAI}
                  className="flex items-center justify-center px-4 py-2 bg-gray-100 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  <FiArrowLeft className="mr-2" />
                  Back to AI
                </button>
                <button
                  onClick={handleSaveClick}
                  className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                >
                  <FiSave className="mr-2" />
                  Save Template
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">Save Template</h3>
            <p className="text-gray-600 mb-4">
              Give your AI-generated receipt a name to save it to your collection.
            </p>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="My AI Receipt"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && handleSaveTemplate()}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTemplate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
