import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import ReceiptPreview from '../components/ReceiptPreview';
import SectionEditor from '../components/SectionEditor';
import SettingsPanel from '../components/SettingsPanel';
import { FiDownload } from 'react-icons/fi';
import type { Section, TemplateSettings } from '../lib/types';
import html2canvas from 'html2canvas';

export default function AIResult() {
  const router = useRouter();
  const [sections, setSections] = useState<Section[]>([]);
  const [settings, setSettings] = useState<TemplateSettings>({
    font: 'mono',
    currency: 'USD',
    currencyFormat: 'symbol_before',
    width: '80mm',
    backgroundTexture: 'none',
    textColor: '#000000',
  });
  const [loading, setLoading] = useState(true);
  const previewRef = useRef<HTMLDivElement>(null);

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
      
      // Clear sessionStorage
      sessionStorage.removeItem('ai-generated-template');
    } catch (error) {
      console.error('Failed to load template:', error);
      router.push('/ai');
    }
  }, []);

  const handleDownload = async () => {
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
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download receipt');
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-navy-900 mb-2">
              AI-Generated Receipt Template
            </h1>
            <p className="text-gray-600">
              Review and customize your automatically generated receipt
            </p>
          </div>

          <div className="grid lg:grid-cols-[minmax(0,6fr)_minmax(0,4fr)] gap-6">
            {/* Left side - Editor */}
            <div className="space-y-4">
              {/* Settings Panel */}
              <div className="border border-gray-300 rounded-xl bg-white">
                <SettingsPanel
                  settings={settings}
                  onUpdate={setSettings}
                />
              </div>

              {/* Sections */}
              <div>
                <h2 className="text-xl font-semibold mb-3 text-navy-900">Customize Sections</h2>
                <div className="space-y-3">
                  {sections.map((section) => (
                    <SectionEditor
                      key={section.id}
                      section={section}
                      onUpdate={(updated) => {
                        setSections(sections.map((s) => (s.id === section.id ? updated : s)));
                      }}
                      onDelete={() => {
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

            {/* Right side - Preview */}
            <div className="lg:sticky lg:top-4 lg:self-start">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-navy-900">Live Preview</h2>
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <FiDownload className="w-4 h-4" />
                    Download
                  </button>
                </div>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <ReceiptPreview
                    sections={sections}
                    settings={settings}
                    showWatermark={false}
                    previewRef={previewRef}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
