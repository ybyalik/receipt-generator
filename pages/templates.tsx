import type { NextPage, GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import { FiArrowRight, FiSearch, FiX } from 'react-icons/fi';
import { getAllTemplates } from '../server/storage';
import type { Template } from '../shared/schema';
import type { Section, TemplateSettings } from '../lib/types';

const ReceiptPreview = dynamic(() => import('../components/ReceiptPreview'), {
  ssr: false,
  loading: () => <div className="h-full bg-gray-100 animate-pulse rounded" />,
});

// Derive category from template slug/name
function getCategory(slug: string): string {
  const s = slug.toLowerCase();
  if (/restaurant|food|mexican|hardees|mcdonalds|doordash/.test(s)) return 'Food & Dining';
  if (/gas.station|auto.zone|car.wash|mechanic|towing|oreilly/.test(s)) return 'Automotive';
  if (/walmart|target|costco|home.depot|lowes|five.below|gamestop|sears|clothing|bookstore/.test(s)) return 'Retail';
  if (/uber|cab|taxi|bus.ticket|parking|rental.car|dollar.rental|ace.rental/.test(s)) return 'Travel & Transport';
  if (/doctor|hospital|fsa|cremation/.test(s)) return 'Medical';
  if (/computer.repair|mobile|cell.phone/.test(s)) return 'Electronics';
  if (/nail.salon|child.care|donation/.test(s)) return 'Services';
  if (/ups|shipping|western.union|stockx|grailed/.test(s)) return 'Shipping & Mail';
  if (/emd.passenger/.test(s)) return 'Travel & Transport';
  return 'Other';
}

interface TemplatesPageProps {
  templates: Template[];
}

const Templates: NextPage<TemplatesPageProps> = ({ templates }) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Build category list with counts
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    templates.forEach((t) => {
      const cat = getCategory(t.slug);
      map.set(cat, (map.get(cat) || 0) + 1);
    });
    // Sort by count descending
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [templates]);

  // Filter templates
  const filtered = useMemo(() => {
    let result = templates;
    if (activeCategory) {
      result = result.filter((t) => getCategory(t.slug) === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.slug.toLowerCase().includes(q) ||
          getCategory(t.slug).toLowerCase().includes(q)
      );
    }
    return result;
  }, [templates, activeCategory, search]);

  return (
    <Layout>
      <Head>
        <title>Receipt Templates - Customizable Business Receipt Designs</title>
        <meta name="description" content="Browse our collection of professional receipt templates for restaurants, retail, repair shops, gas stations, and more. Fully customizable and ready to download instantly." />
        <meta property="og:title" content="Receipt Templates - Customizable Business Receipt Designs" />
        <meta property="og:description" content="Browse our collection of professional receipt templates. Fully customizable and ready to download instantly." />
        <meta property="og:type" content="website" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Receipt Templates
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Choose from our professionally designed templates and customize them to your needs
          </p>
        </div>

        {/* Search bar */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-10 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent shadow-sm text-base"
              style={{ focusRingColor: '#0d9488' } as any}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          <button
            onClick={() => setActiveCategory(null)}
            className="px-4 py-2 rounded-full text-sm font-medium transition-all border"
            style={
              activeCategory === null
                ? { backgroundColor: '#0d9488', color: '#ffffff', borderColor: '#0d9488' }
                : { backgroundColor: '#ffffff', color: '#374151', borderColor: '#e5e7eb' }
            }
          >
            All ({templates.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all border"
              style={
                activeCategory === cat.name
                  ? { backgroundColor: '#0d9488', color: '#ffffff', borderColor: '#0d9488' }
                  : { backgroundColor: '#ffffff', color: '#374151', borderColor: '#e5e7eb' }
              }
            >
              {cat.name} ({cat.count})
            </button>
          ))}
        </div>

        {/* Results count */}
        {(search || activeCategory) && (
          <p className="text-center text-sm text-gray-500 mb-6">
            Showing {filtered.length} of {templates.length} templates
            {activeCategory && <> in <strong>{activeCategory}</strong></>}
            {search && <> matching &ldquo;{search}&rdquo;</>}
          </p>
        )}

        {/* Template grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((template) => (
              <Link
                key={template.id}
                href={`/template/${template.slug}`}
                className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden border border-gray-100 hover:-translate-y-1"
              >
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-8">
                  <div className="bg-white rounded-lg shadow-sm h-64 overflow-hidden flex items-start justify-center">
                    <div className="scale-50 origin-top">
                      <ReceiptPreview
                        sections={template.sections as Section[]}
                        settings={template.settings as TemplateSettings}
                        showWatermark={false}
                      />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: '#f0fdfa', color: '#0d9488' }}
                    >
                      {getCategory(template.slug)}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">{template.name}</h3>
                  <p className="text-gray-600 mb-4">
                    {(template.sections as Section[]).length} customizable sections
                  </p>
                  <div className="flex items-center font-semibold transition-colors" style={{ color: '#0d9488' }}>
                    Customize Template
                    <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-2">No templates found</p>
            <p className="text-gray-400 text-sm">
              Try a different search term or{' '}
              <button
                onClick={() => { setSearch(''); setActiveCategory(null); }}
                className="underline"
                style={{ color: '#0d9488' }}
              >
                clear filters
              </button>
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps<TemplatesPageProps> = async () => {
  try {
    const templates = await getAllTemplates();

    return {
      props: {
        templates: JSON.parse(JSON.stringify(templates)),
      },
    };
  } catch (error) {
    console.error('Failed to fetch templates:', error);
    return {
      props: {
        templates: [],
      },
    };
  }
};

export default Templates;
