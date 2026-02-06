import { useRouter } from 'next/router';
import { useState, useRef, useEffect } from 'react';
import Layout from '../../components/Layout';
import ReceiptPreview from '../../components/ReceiptPreview';
import SettingsPanel from '../../components/SettingsPanel';
import { useTemplates } from '../../contexts/TemplatesContext';
import { Section, TemplateSettings } from '../../lib/types';
import { useAuth } from '../../contexts/AuthContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { FiSave, FiDownload, FiRefreshCw, FiEdit2, FiPlus, FiFile } from 'react-icons/fi';
import { useToast } from '../../components/ToastContainer';
import PremiumUpsellModal from '../../components/PremiumUpsellModal';
import AuthModal from '../../components/AuthModal';
import EmailCaptureModal from '../../components/EmailCaptureModal';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import SectionEditor from '../../components/SectionEditor';

function SortableSection({ 
  section, 
  onUpdate, 
  onRemove, 
  onDuplicate 
}: { 
  section: Section; 
  onUpdate: (section: Section) => void;
  onRemove: () => void;
  onDuplicate: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <SectionEditor 
        section={section} 
        onUpdate={onUpdate}
        onRemove={onRemove}
        onDuplicate={onDuplicate}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

interface TemplateEditorProps {
  initialTemplate: any;
}

export default function TemplateEditor({ initialTemplate }: TemplateEditorProps) {
  const router = useRouter();
  const { id } = router.query;
  const { user, getIdToken } = useAuth();
  const previewRef = useRef<HTMLDivElement>(null);
  const watermarkPreviewRef = useRef<HTMLDivElement>(null);
  const { getTemplateBySlug, updateTemplate, loading: templatesLoading } = useTemplates();
  const { showSuccess, showError } = useToast();

  const [template, setTemplate] = useState<any>(initialTemplate);
  const [sections, setSections] = useState<Section[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [settings, setSettings] = useState<TemplateSettings>({
    currency: '$',
    currencyFormat: 'symbol_before',
    font: 'courier',
    textColor: '#000000',
    backgroundTexture: 'none',
  });

  useEffect(() => {
    // Fetch fresh template data when slug changes
    if (id && router.isReady) {
      const cachedTemplate = getTemplateBySlug(id as string);
      if (cachedTemplate) {
        setTemplate(cachedTemplate);
      }
      
      // Fetch single template by slug (instead of all templates)
      fetch(`/api/templates/by-slug/${encodeURIComponent(id as string)}`)
        .then(res => {
          if (!res.ok) throw new Error('Template not found');
          return res.json();
        })
        .then(freshTemplate => {
          setTemplate(freshTemplate);
        })
        .catch(err => console.error('Failed to fetch template:', err));
    }
  }, [id, router.isReady, getTemplateBySlug]);

  useEffect(() => {
    if (template) {
      console.log('Template loaded:', { 
        name: template.name, 
        hasSeoContent: !!template.seoContent,
        seoContentLength: template.seoContent?.length 
      });
      // Backfill empty barcode values
      const sectionsWithBarcodeValues = template.sections.map((section: any) => {
        if (section.type === 'barcode' && (!section.value || section.value === '')) {
          return { ...section, value: '1234567890123' };
        }
        return section;
      });
      setSections(sectionsWithBarcodeValues);
      if (template.settings) {
        setSettings(template.settings);
      }
      // Set default name when template loads
      setTemplateName(`My ${template.name}`);
    }
  }, [template]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Show loading state while router is initializing or templates are loading
  if (!router.isReady || templatesLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="flex items-center justify-center gap-2">
            <FiRefreshCw className="animate-spin text-teal-600" />
            <span className="text-gray-600">Loading template...</span>
          </div>
        </div>
      </Layout>
    );
  }

  // Only show "not found" after everything has loaded and template is still null
  if (!template) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold">Template not found</h1>
        </div>
      </Layout>
    );
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const updateSection = (updatedSection: Section) => {
    setSections(sections.map(s => s.id === updatedSection.id ? updatedSection : s));
  };

  const removeSection = (sectionId: string) => {
    setSections(sections.filter(s => s.id !== sectionId));
  };

  const duplicateSection = (section: Section) => {
    const deepClone = JSON.parse(JSON.stringify(section));
    const newSection = {
      ...deepClone,
      id: `${section.type}-${Date.now()}`,
    };
    const index = sections.findIndex(s => s.id === section.id);
    const newSections = [...sections];
    newSections.splice(index + 1, 0, newSection);
    setSections(newSections);
  };

  const addSection = (type: Section['type']) => {
    const newId = `${type}-${Date.now()}`;
    let newSection: Section;

    switch (type) {
      case 'header':
        newSection = {
          type: 'header',
          id: newId,
          alignment: 'center',
          logoSize: 50,
          businessDetails: 'Your Business Name\nYour Address\nCity, State ZIP',
          dividerAtBottom: true,
          dividerStyle: 'dashed',
        };
        break;
      case 'custom_message':
        newSection = {
          type: 'custom_message',
          id: newId,
          alignment: 'center',
          message: 'Thank you for your business!',
          dividerAtBottom: true,
          dividerStyle: 'dashed',
        };
        break;
      case 'items_list':
        newSection = {
          type: 'items_list',
          id: newId,
          items: [
            { quantity: 1, item: 'Item 1', price: 10.00 },
          ],
          totalLines: [
            { title: 'Subtotal:', value: 10.00 },
          ],
          tax: { title: 'Tax:', value: 0.80 },
          total: { title: 'Total:', price: 10.80 },
          dividerAfterItems: false,
          dividerAfterItemsStyle: 'dashed',
          dividerAfterTotal: true,
          dividerAfterTotalStyle: 'dashed',
        };
        break;
      case 'payment':
        newSection = {
          type: 'payment',
          id: newId,
          paymentType: 'card',
          cashFields: [
            { title: 'Cash Tendered', value: '$100.00' },
            { title: 'Change', value: '$0.00' },
          ],
          cardFields: [
            { title: 'Card number', value: '**** **** **** 1234' },
            { title: 'Card type', value: 'Visa' },
            { title: 'Card entry', value: 'Chip' },
            { title: 'Date/time', value: new Date().toLocaleString() },
            { title: 'Reference #', value: 'REF123456789' },
            { title: 'Status', value: 'APPROVED' },
          ],
          dividerAtBottom: true,
          dividerStyle: 'dashed',
        };
        break;
      case 'date_time':
        newSection = {
          type: 'date_time',
          id: newId,
          alignment: 'left',
          date: new Date().toLocaleString(),
          dividerAtBottom: true,
          dividerStyle: 'dashed',
        };
        break;
      case 'barcode':
        newSection = {
          type: 'barcode',
          id: newId,
          size: 2,
          length: 60,
          value: '1234567890123',
          dividerAtBottom: true,
          dividerStyle: 'dashed',
        };
        break;
      case 'two_columns':
        newSection = {
          type: 'two_columns',
          id: newId,
          column1: [
            { title: 'Table', value: '415' },
            { title: 'Server', value: 'Rebecca' },
          ],
          column2: [
            { title: 'Guests', value: '2' },
          ],
          dividerAtBottom: true,
          dividerStyle: 'dashed',
        };
        break;
    }

    setSections([...sections, newSection]);
  };

  const resetTemplate = () => {
    if (template) {
      setSections(template.sections);
      if (template.settings) {
        setSettings(template.settings);
      }
    }
  };

  const handleSaveClick = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setShowSaveModal(true);
  };

  const saveTemplate = async () => {
    if (!template || !user) {
      showError('Please sign in to save templates');
      return;
    }

    if (!templateName.trim()) {
      showError('Please enter a template name');
      return;
    }
    
    const newSlug = templateName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    try {
      const token = await getIdToken();
      const res = await fetch('/api/user-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          baseTemplateId: template.id,
          template: {
            name: templateName,
            slug: `${newSlug}-${Date.now()}`,
            sections: sections,
            settings: settings,
          },
        }),
      });
      
      if (res.ok) {
        showSuccess(`Template "${templateName}" saved to your collection!`);
        setShowSaveModal(false);
        setTemplateName(`My ${template.name}`); // Reset for next save
        router.push('/my-templates');
      } else {
        showError('Failed to save template. Please try again.');
      }
    } catch (error) {
      console.error('Save error:', error);
      showError('Failed to save template. Please try again.');
    }
  };

  const downloadReceipt = async () => {
    if (!user?.isPremium) {
      setShowUpsellModal(true);
      return;
    }

    if (previewRef.current) {
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      const link = document.createElement('a');
      link.download = `${template.name}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const downloadAsPdf = async () => {
    if (!user?.isPremium) {
      setShowUpsellModal(true);
      return;
    }

    if (previewRef.current) {
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // Size PDF to match receipt dimensions (convert px to mm at 96 DPI * scale 2)
      const pdfWidth = (imgWidth / 2) * 0.2646; // px to mm
      const pdfHeight = (imgHeight / 2) * 0.2646;
      const pdf = new jsPDF({
        orientation: pdfHeight > pdfWidth ? 'portrait' : 'landscape',
        unit: 'mm',
        format: [pdfWidth, pdfHeight],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${template.name}.pdf`);
    }
  };

  const downloadWithWatermark = async () => {
    if (watermarkPreviewRef.current) {
      const canvas = await html2canvas(watermarkPreviewRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      const link = document.createElement('a');
      link.download = `${template.name}-sample.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  if (!template) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="flex items-center justify-center gap-2">
            <FiRefreshCw className="animate-spin text-teal-600" />
            <span className="text-gray-600">Loading template...</span>
          </div>
        </div>
      </Layout>
    );
  }

  console.log('Render time - template has seoContent:', !!template?.seoContent);

  return (
    <Layout>
      <div className="max-w-[1400px] mx-auto px-4 py-4 sm:py-8">
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold">
              {template.name}
            </h1>
            <div className="hidden lg:flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={resetTemplate}
                className="flex items-center justify-center px-4 py-2 bg-red-50 border-2 border-red-500 text-red-700 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
              >
                <FiRefreshCw className="mr-2" />
                Reset
              </button>
              <button
                onClick={handleSaveClick}
                className="flex items-center justify-center px-4 py-2 rounded-lg transition-colors cursor-pointer"
                style={{ backgroundColor: '#0d9488', color: '#ffffff' }}
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
                Drag sections to reorder them
              </p>
              
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={sections.map(s => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {sections.map((section) => (
                      <SortableSection
                        key={section.id}
                        section={section}
                        onUpdate={updateSection}
                        onRemove={() => removeSection(section.id)}
                        onDuplicate={() => duplicateSection(section)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <div className="text-sm font-medium mb-2">Add New Section</div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => addSection('header')}
                  className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 hover:border-gray-400 transition-all cursor-pointer text-left"
                >
                  <FiPlus className="inline mr-1" /> Header
                </button>
                <button
                  onClick={() => addSection('custom_message')}
                  className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 hover:border-gray-400 transition-all cursor-pointer text-left"
                >
                  <FiPlus className="inline mr-1" /> Custom Message
                </button>
                <button
                  onClick={() => addSection('items_list')}
                  className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 hover:border-gray-400 transition-all cursor-pointer text-left"
                >
                  <FiPlus className="inline mr-1" /> Items List
                </button>
                <button
                  onClick={() => addSection('payment')}
                  className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 hover:border-gray-400 transition-all cursor-pointer text-left"
                >
                  <FiPlus className="inline mr-1" /> Payment
                </button>
                <button
                  onClick={() => addSection('date_time')}
                  className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 hover:border-gray-400 transition-all cursor-pointer text-left"
                >
                  <FiPlus className="inline mr-1" /> Date & Time
                </button>
                <button
                  onClick={() => addSection('barcode')}
                  className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 hover:border-gray-400 transition-all cursor-pointer text-left"
                >
                  <FiPlus className="inline mr-1" /> Barcode
                </button>
                <button
                  onClick={() => addSection('two_columns')}
                  className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 hover:border-gray-400 transition-all cursor-pointer text-left"
                >
                  <FiPlus className="inline mr-1" /> Two Columns
                </button>
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
                      onClick={() => user ? setShowUpsellModal(true) : setShowEmailCapture(true)}
                      className="flex items-center justify-center px-3 sm:px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer text-sm sm:text-base"
                    >
                      <FiDownload className="mr-2" />
                      Download
                    </button>
                  )}
                  <button
                    onClick={downloadReceipt}
                    className="flex items-center justify-center px-3 sm:px-4 py-2 rounded-lg transition-colors cursor-pointer text-sm sm:text-base whitespace-nowrap"
                    style={{ backgroundColor: '#0d9488', color: '#ffffff' }}
                  >
                    <FiDownload className="mr-2" />
                    {user?.isPremium ? 'PNG' : 'Remove Watermark'}
                  </button>
                  {user?.isPremium && (
                    <button
                      onClick={downloadAsPdf}
                      className="flex items-center justify-center px-3 sm:px-4 py-2 rounded-lg transition-colors cursor-pointer text-sm sm:text-base whitespace-nowrap border-2"
                      style={{ borderColor: '#0d9488', color: '#0d9488' }}
                    >
                      <FiFile className="mr-2" />
                      PDF
                    </button>
                  )}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded">
                <ReceiptPreview 
                  sections={sections}
                  settings={settings}
                  showWatermark={!user?.isPremium}
                  previewRef={previewRef}
                />
              </div>

              {/* Mobile-only buttons below preview */}
              <div className="lg:hidden mt-4 flex flex-col gap-2">
                {!user?.isPremium && (
                  <button
                    onClick={() => user ? setShowUpsellModal(true) : setShowEmailCapture(true)}
                    className="flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
                  >
                    <FiDownload className="mr-2" />
                    Download
                  </button>
                )}
                <button
                  onClick={downloadReceipt}
                  className="flex items-center justify-center px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                  style={{ backgroundColor: '#0d9488', color: '#ffffff' }}
                >
                  <FiDownload className="mr-2" />
                  {user?.isPremium ? 'Download PNG' : 'Remove Watermark'}
                </button>
                {user?.isPremium && (
                  <button
                    onClick={downloadAsPdf}
                    className="flex items-center justify-center px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap border-2"
                    style={{ borderColor: '#0d9488', color: '#0d9488' }}
                  >
                    <FiFile className="mr-2" />
                    Download PDF
                  </button>
                )}
                <button
                  onClick={resetTemplate}
                  className="flex items-center justify-center px-4 py-2 bg-red-50 border-2 border-red-500 text-red-700 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                >
                  <FiRefreshCw className="mr-2" />
                  Reset
                </button>
                <button
                  onClick={handleSaveClick}
                  className="flex items-center justify-center px-4 py-2 rounded-lg transition-colors cursor-pointer"
                  style={{ backgroundColor: '#0d9488', color: '#ffffff' }}
                >
                  <FiSave className="mr-2" />
                  Save Template
                </button>
              </div>
            </div>
          </div>
        </div>

        {template.seoContent && (
          <div className="mt-12 bg-white rounded-lg shadow-md p-8">
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: template.seoContent }}
            />
          </div>
        )}
      </div>

      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Save Template</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Template Name</label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., My Computer Repair Receipt"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                onKeyDown={(e) => e.key === 'Enter' && saveTemplate()}
                autoFocus
              />
              <p className="text-sm text-gray-500 mt-1">
                Choose a name for your customized template
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={saveTemplate}
                className="flex-1 px-4 py-2 rounded-lg transition-colors cursor-pointer"
                style={{ backgroundColor: '#0d9488', color: '#ffffff' }}
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setTemplateName(`My ${template.name}`); // Reset name
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <PremiumUpsellModal isOpen={showUpsellModal} onClose={() => setShowUpsellModal(false)} />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <EmailCaptureModal
        isOpen={showEmailCapture}
        onClose={() => setShowEmailCapture(false)}
        onSubmit={() => {
          setShowEmailCapture(false);
          downloadWithWatermark();
        }}
      />

      {/* Hidden watermarked preview for secure sample downloads */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <ReceiptPreview
          sections={sections}
          settings={settings}
          showWatermark={true}
          previewRef={watermarkPreviewRef}
        />
      </div>
    </Layout>
  );
}

// Server-side rendering to populate meta tags for SEO
export async function getServerSideProps(context: any) {
  const { id } = context.params;
  
  try {
    // Fetch single template by slug (avoids loading all templates)
    const protocol = context.req.headers['x-forwarded-proto'] || 'http';
    const host = context.req.headers.host;
    const baseUrl = `${protocol}://${host}`;

    const res = await fetch(`${baseUrl}/api/templates/by-slug/${encodeURIComponent(id)}`);
    if (!res.ok) {
      return { notFound: true };
    }
    const template = await res.json();

    if (!template) {
      return {
        notFound: true,
      };
    }
    
    // Pass meta tags through pageProps for server-side rendering
    return {
      props: {
        initialTemplate: template,
        metaTags: {
          title: `${template.name} - ${template.name} Template Generator`,
          description: `Generate a ${template.name} using a customizable template. Edit items, prices, taxes, and dates, then download a professional receipt in seconds.`,
          ogTitle: `${template.name} - ${template.name} Template Generator`,
          ogDescription: `Generate a ${template.name} using a customizable template. Edit items, prices, taxes, and dates, then download a professional receipt in seconds.`,
          ogType: 'website',
        },
      },
    };
  } catch (error) {
    console.error('Error fetching template:', error);
    return {
      notFound: true,
    };
  }
}
