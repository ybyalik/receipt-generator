import { createContext, useContext, useState, ReactNode } from 'react';
import { Template } from '../lib/types';
import { mockTemplates } from '../lib/mockTemplates';

interface TemplatesContextType {
  templates: Template[];
  addTemplate: (template: Template) => void;
  updateTemplate: (id: string, updates: Partial<Template>) => void;
  deleteTemplate: (id: string) => void;
  getTemplateBySlug: (slug: string) => Template | undefined;
}

const TemplatesContext = createContext<TemplatesContextType | undefined>(undefined);

export function TemplatesProvider({ children }: { children: ReactNode }) {
  const [templates, setTemplates] = useState<Template[]>(mockTemplates);

  const addTemplate = (template: Template) => {
    setTemplates([...templates, template]);
  };

  const updateTemplate = (id: string, updates: Partial<Template>) => {
    setTemplates(templates.map(t => 
      t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
    ));
  };

  const deleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
  };

  const getTemplateBySlug = (slug: string) => {
    return templates.find(t => t.slug === slug);
  };

  return (
    <TemplatesContext.Provider value={{
      templates,
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
