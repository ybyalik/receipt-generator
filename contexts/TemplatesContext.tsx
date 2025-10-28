import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Template } from '../lib/types';
import { mockTemplates } from '../lib/mockTemplates';

interface TemplatesContextType {
  templates: Template[];
  loading: boolean;
  addTemplate: (template: Template, userEmail?: string) => Promise<Template>;
  updateTemplate: (id: string, updates: Partial<Template>, userEmail?: string) => Promise<void>;
  deleteTemplate: (id: string, userEmail?: string) => Promise<void>;
  getTemplateBySlug: (slug: string) => Template | undefined;
}

const TemplatesContext = createContext<TemplatesContextType | undefined>(undefined);

export function TemplatesProvider({ children }: { children: ReactNode }) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTemplates() {
      try {
        const res = await fetch('/api/templates');
        if (res.ok) {
          const data = await res.json();
          setTemplates(data);
        } else {
          console.error('Failed to load templates:', res.statusText);
          setTemplates(mockTemplates);
        }
      } catch (error) {
        console.error('Failed to load templates:', error);
        setTemplates(mockTemplates);
      } finally {
        setLoading(false);
      }
    }
    loadTemplates();
  }, []);

  const addTemplate = async (template: Template, userEmail?: string): Promise<Template> => {
    const res = await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...template, userEmail }),
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to create template');
    }
    
    const newTemplate = await res.json();
    setTemplates([...templates, newTemplate]);
    return newTemplate;
  };

  const updateTemplate = async (id: string, updates: Partial<Template>, userEmail?: string) => {
    const res = await fetch(`/api/templates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...updates, userEmail }),
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to update template');
    }
    
    const updatedTemplate = await res.json();
    setTemplates(templates.map(t => 
      t.id === id ? updatedTemplate : t
    ));
  };

  const deleteTemplate = async (id: string, userEmail?: string) => {
    const res = await fetch(`/api/templates/${id}?userEmail=${encodeURIComponent(userEmail || '')}`, {
      method: 'DELETE',
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to delete template');
    }
    
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
