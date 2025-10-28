import { useRouter } from 'next/router';
import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout';
import ReceiptPreview from '../../components/ReceiptPreview';
import SettingsPanel from '../../components/SettingsPanel';
import { useTemplates } from '../../contexts/TemplatesContext';
import { Section, TemplateSettings } from '../../lib/types';
import { useAuth } from '../../contexts/AuthContext';
import html2canvas from 'html2canvas';
import { FiSave, FiDownload, FiRefreshCw, FiEdit2, FiPlus } from 'react-icons/fi';
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

export default function TemplateEditor() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const previewRef = useRef<HTMLDivElement>(null);
  const { getTemplateBySlug, updateTemplate } = useTemplates();

  const template = getTemplateBySlug(id as string);
  const [sections, setSections] = useState<Section[]>([]);
  const [templateName, setTemplateName] = useState('');
  const [templateSlug, setTemplateSlug] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [settings, setSettings] = useState<TemplateSettings>({
    currency: '$',
    currencyFormat: 'symbol_before',
    font: 'mono',
    textColor: '#000000',
    backgroundTexture: 'none',
  });

  useEffect(() => {
    if (template) {
      setSections(template.sections);
      setTemplateName(template.name);
      setTemplateSlug(template.slug);
      if (template.settings) {
        setSettings(template.settings);
      }
    }
  }, [template]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Show loading state while router is initializing
  if (!router.isReady) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="flex items-center justify-center gap-2">
            <FiRefreshCw className="animate-spin text-navy-600" />
            <span className="text-gray-600">Loading template...</span>
          </div>
        </div>
      </Layout>
    );
  }

  // Only show "not found" after router is ready and template is still null
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
    if (confirm('Are you sure you want to remove this section?')) {
      setSections(sections.filter(s => s.id !== sectionId));
    }
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
          length: 13,
          value: '1234567890123',
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
      setTemplateName(template.name);
      setTemplateSlug(template.slug);
    }
  };

  const saveTemplate = async () => {
    if (!template || !user) {
      router.push('/');
      return;
    }
    
    const newSlug = templateSlug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    try {
      const res = await fetch('/api/user-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
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
        alert(`Template "${templateName}" has been saved to your collection!`);
        router.push('/my-templates');
      } else {
        alert('Failed to save template. Please try again.');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save template. Please try again.');
    }
  };

  const downloadReceipt = async () => {
    if (!user?.isPremium) {
      router.push('/pricing');
      return;
    }

    if (previewRef.current) {
      const canvas = await html2canvas(previewRef.current);
      const link = document.createElement('a');
      link.download = `${template.name}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const downloadWithWatermark = async () => {
    if (previewRef.current) {
      const canvas = await html2canvas(previewRef.current);
      const link = document.createElement('a');
      link.download = `${template.name}-sample.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <Layout>
      <Head>
        <title>{template.name} - ReceiptGen</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {isEditingName ? (
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                className="text-3xl font-bold border-b-2 border-blue-500 focus:outline-none"
                autoFocus
              />
            ) : (
              <h1 
                className="text-3xl font-bold cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => setIsEditingName(true)}
                title="Click to edit template name"
              >
                {templateName}
              </h1>
            )}
            <div className="flex space-x-3">
              <button
                onClick={resetTemplate}
                className="flex items-center px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <FiRefreshCw className="mr-2" />
                Reset
              </button>
              <button
                onClick={saveTemplate}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiSave className="mr-2" />
                Save Template
              </button>
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">URL:</span>
            {isEditingSlug ? (
              <input
                type="text"
                value={templateSlug}
                onChange={(e) => setTemplateSlug(e.target.value)}
                onBlur={() => setIsEditingSlug(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingSlug(false)}
                className="border-b border-blue-500 focus:outline-none px-1"
                autoFocus
              />
            ) : (
              <span 
                className="cursor-pointer hover:text-blue-600 transition-colors flex items-center"
                onClick={() => setIsEditingSlug(true)}
                title="Click to edit URL slug"
              >
                /template/{templateSlug}
                <FiEdit2 className="ml-1 w-3 h-3" />
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
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
              <div className="grid grid-cols-2 gap-2">
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
              </div>
            </div>
          </div>

          <div className="sticky top-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Live Preview</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={downloadWithWatermark}
                    className="flex items-center px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
                  >
                    <FiDownload className="mr-2" />
                    Download Sample
                  </button>
                  <button
                    onClick={downloadReceipt}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    <FiDownload className="mr-2" />
                    Download
                  </button>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded">
                <ReceiptPreview 
                  sections={sections}
                  settings={settings}
                  showWatermark={!user?.isPremium}
                  previewRef={previewRef}
                />
              </div>
              
              {!user?.isPremium && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">
                    Upgrade to Premium to remove the watermark and download high-quality receipts
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
