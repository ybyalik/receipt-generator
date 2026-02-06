"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { FiArrowRight } from 'react-icons/fi';
import type { Template } from '../../shared/schema';

const ReceiptPreview = dynamic(() => import('../ReceiptPreview'), {
  ssr: false,
  loading: () => <div className="h-40 bg-ink-100 animate-pulse rounded-lg" />,
});

interface RelatedTemplatesProps {
  currentTemplateId: number;
  currentCategory?: string;
  limit?: number;
}

export const RelatedTemplates: React.FC<RelatedTemplatesProps> = ({
  currentTemplateId,
  currentCategory,
  limit = 3,
}) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedTemplates = async () => {
      try {
        const res = await fetch('/api/templates');
        const allTemplates: Template[] = await res.json();

        // Filter out current template and find related ones
        let related = allTemplates.filter(t => t.id !== currentTemplateId);

        // Prioritize templates from the same category
        if (currentCategory) {
          const sameCategory = related.filter(t => t.category === currentCategory);
          const otherCategory = related.filter(t => t.category !== currentCategory);

          // Take from same category first, then fill with others
          related = [...sameCategory, ...otherCategory];
        }

        // Limit results
        setTemplates(related.slice(0, limit));
      } catch (error) {
        console.error('Failed to fetch related templates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedTemplates();
  }, [currentTemplateId, currentCategory, limit]);

  if (loading) {
    return (
      <div className="mt-16 py-12 border-t border-ink-100">
        <h2 className="font-display text-2xl text-ink-950 mb-8">Related Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-ink-100 rounded-xl h-64 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (templates.length === 0) {
    return null;
  }

  return (
    <div className="mt-16 py-12 border-t border-ink-100">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-display text-2xl text-ink-950">Related Templates</h2>
        <Link
          href="/templates"
          className="text-sm font-medium text-ink-600 hover:text-gold-600 transition-colors flex items-center gap-1 group"
        >
          View all
          <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Link
            key={template.id}
            href={`/template/${template.slug}`}
            className="group block bg-white rounded-xl border border-ink-100 overflow-hidden hover:shadow-lg hover:border-ink-200 transition-all"
          >
            {/* Preview */}
            <div className="bg-gradient-to-br from-paper-100 to-white p-4 h-48 flex items-center justify-center overflow-hidden">
              <div className="transform scale-[0.4] origin-center pointer-events-none">
                <ReceiptPreview
                  sections={template.sections || []}
                  settings={template.settings || {
                    currency: '$',
                    currencyFormat: 'symbol_before',
                    font: 'courier',
                    textColor: '#000000',
                    backgroundTexture: 'none',
                  }}
                  showWatermark={false}
                />
              </div>
            </div>

            {/* Info */}
            <div className="p-4 border-t border-ink-100">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-medium text-ink-900 group-hover:text-gold-600 transition-colors line-clamp-1">
                    {template.name}
                  </h3>
                  {template.category && (
                    <span className="text-xs text-ink-500 mt-1 block">
                      {template.category}
                    </span>
                  )}
                </div>
                <span className="text-xs px-2 py-1 bg-paper-100 text-ink-500 rounded-full whitespace-nowrap">
                  Use Template
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedTemplates;
