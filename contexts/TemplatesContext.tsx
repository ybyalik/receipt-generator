import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Template } from '../lib/types';
import { mockTemplates } from '../lib/mockTemplates';

interface TemplatesContextType {
  templates: Template[];
  loading: boolean;
  addTemplate: (template: Template) => Promise<Template>;
  updateTemplate: (id: string, updates: Partial<Template>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  getTemplateBySlug: (slug: string) => Template | undefined;
}

const TemplatesContext = createContext<TemplatesContextType | undefined>(undefined);

export function TemplatesProvider({ children }: { children: ReactNode }) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    async function loadTemplates() {
      try {
        const res = await fetch('/api/templates');
        const data = await res.json();
        
        if (data.length === 0 && !initialized) {
          for (const mockTemplate of mockTemplates) {
            const res = await fetch('/api/templates', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(mockTemplate),
            });
            await res.json();
          }
          const updatedRes = await fetch('/api/templates');
          const updatedData = await updatedRes.json();
          setTemplates(updatedData);
          setInitialized(true);
        } else {
          setTemplates(data);
        }
      } catch (error) {
        console.error('Failed to load templates:', error);
        setTemplates(mockTemplates);
      } finally {
        setLoading(false);
      }
    }
    loadTemplates();
  }, [initialized]);

  const addTemplate = async (template: Template): Promise<Template> => {
    const res = await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template),
    });
    const newTemplate = await res.json();
    setTemplates([...templates, newTemplate]);
    return newTemplate;
  };

  const updateTemplate = async (id: string, updates: Partial<Template>) => {
    const res = await fetch(`/api/templates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const updatedTemplate = await res.json();
    setTemplates(templates.map(t => 
      t.id === id ? updatedTemplate : t
    ));
  };

  const deleteTemplate = async (id: string) => {
    await fetch(`/api/templates/${id}`, {
      method: 'DELETE',
    });
    setTemplates(templates.filter(t => t.id !== id));
  };

  const getTemplateBySlug = (slug: string) => {
    return templates.find(t => t.slug === slug);
  };

  return (
    <TemplatesContext.Provider value={{
      templates,
      loading,
      addTemplate,
      updateTemplate,
      deleteTemplate,
      getTemplateBySlug,
    }}>
      {children}
    </TemplatesContext.Provider>
  );
}

export function useTemplates() {
  const context = useContext(TemplatesContext);
  if (context === undefined) {
    throw new Error('useTemplates must be used within a TemplatesProvider');
  }
  return context;
}
