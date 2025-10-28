import { useRouter } from 'next/router';
import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../../../components/Layout';
import ReceiptPreview from '../../../components/ReceiptPreview';
import SettingsPanel from '../../../components/SettingsPanel';
import { useTemplates } from '../../../contexts/TemplatesContext';
import { Section, TemplateSettings } from '../../../lib/types';
import { useAuth } from '../../../contexts/AuthContext';
import { FiSave, FiRefreshCw, FiEdit2, FiPlus, FiArrowLeft } from 'react-icons/fi';
import { useToast } from '../../../components/ToastContainer';
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
import SectionEditor from '../../../components/SectionEditor';

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

export default function AdminTemplateEditor() {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading: authLoading, isAdmin } = useAuth();
  const { showSuccess, showError } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);
  const { templates, updateTemplate, loading: templatesLoading } = useTemplates();

  const template = templates.find(t => t.id === id);
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

  // No redirect - let the conditional render below handle showing Unauthorized page

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

  // Wait for auth to load
  if (authLoading) {
    return (
      <Layout>
        <Head>
          <title>Admin Template Editor - ReceiptGen</title>
        </Head>
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </Layout>
    );
  }

  // Access control check - only after auth has loaded
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

  if (templatesLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold">Loading template...</h1>
        </div>
      </Layout>
    );
  }

  if (!template) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold">Template not found</h1>
          <p className="mt-2 text-gray-600">Template ID: {id}</p>
          <button
            onClick={() => router.push('/admin')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Admin
          </button>
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
    if (!template) return;
    
    // Temporary: Allow saving without auth for testing
    const userEmail = user?.email || 'test@admin.com';
    
    const oldSlug = template.slug;
    const newSlug = templateSlug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    try {
      const res = await fetch(`/api/templates/${template.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: userEmail,
          name: templateName,
          slug: newSlug,
          sections: sections,
          settings: settings,
        }),
      });
      
      if (res.ok) {
        showSuccess(`Global template "${templateName}" has been saved!`);
        if (oldSlug !== newSlug) {
          router.push(`/admin/templates/${template.id}`);
        }
      } else {
        const error = await res.json();
        showError(`Failed to save: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      showError('Failed to save template. Please try again.');
    }
  };

  return (
    <Layout>
      <Head>
        <title>Edit {template.name} - Admin - ReceiptGen</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <FiArrowLeft className="mr-2" />
            Back to Admin Panel
          </button>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
            <p className="text-sm text-yellow-800 font-medium">
              🔒 Admin Mode: You are editing the global template. Changes will affect all users.
            </p>
          </div>
          
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
                Save Global Template
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
                  className="px-3 py-2 text-sm border rounded hover:bg-gray-50 transition-colors text-left"
                >
                  <FiPlus className="inline mr-1" /> Header
                </button>
                <button
                  onClick={() => addSection('custom_message')}
                  className="px-3 py-2 text-sm border rounded hover:bg-gray-50 transition-colors text-left"
                >
                  <FiPlus className="inline mr-1" /> Custom Message
                </button>
                <button
                  onClick={() => addSection('items_list')}
                  className="px-3 py-2 text-sm border rounded hover:bg-gray-50 transition-colors text-left"
                >
                  <FiPlus className="inline mr-1" /> Items List
                </button>
                <button
                  onClick={() => addSection('payment')}
                  className="px-3 py-2 text-sm border rounded hover:bg-gray-50 transition-colors text-left"
                >
                  <FiPlus className="inline mr-1" /> Payment
                </button>
                <button
                  onClick={() => addSection('date_time')}
                  className="px-3 py-2 text-sm border rounded hover:bg-gray-50 transition-colors text-left"
                >
                  <FiPlus className="inline mr-1" /> Date & Time
                </button>
                <button
                  onClick={() => addSection('barcode')}
                  className="px-3 py-2 text-sm border rounded hover:bg-gray-50 transition-colors text-left"
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
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded">
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
    </Layout>
  );
}
