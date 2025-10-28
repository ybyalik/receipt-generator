import { useRouter } from 'next/router';
import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout';
import ReceiptPreview from '../../components/ReceiptPreview';
import { mockTemplates } from '../../lib/mockTemplates';
import { Section } from '../../lib/types';
import { useAuth } from '../../contexts/AuthContext';
import html2canvas from 'html2canvas';
import { FiSave, FiDownload, FiRefreshCw } from 'react-icons/fi';
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

function SortableSection({ section, onUpdate }: { section: Section; onUpdate: (section: Section) => void }) {
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

  const template = mockTemplates.find(t => t.slug === id);
  const [sections, setSections] = useState<Section[]>([]);

  useEffect(() => {
    if (template) {
      setSections(template.sections);
    }
  }, [template]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const resetTemplate = () => {
    setSections(template.sections);
  };

  const saveTemplate = () => {
    alert('Template saved! (This would save to Firebase in production)');
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
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">{template.name}</h1>
          <div className="flex space-x-3">
            <button
              onClick={resetTemplate}
              className="flex items-center px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              <FiRefreshCw className="mr-2" />
              Reset
            </button>
            {user && (
              <button
                onClick={saveTemplate}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <FiSave className="mr-2" />
                Save as new template
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
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
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          <div className="sticky top-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Live Preview</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={downloadWithWatermark}
                    className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Download Sample
                  </button>
                  <button
                    onClick={downloadReceipt}
                    className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    <FiDownload className="mr-1" />
                    Download
                  </button>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded">
                <ReceiptPreview 
                  sections={sections} 
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
