import Link from 'next/link';
import Head from 'next/head';
import { FiChevronRight } from 'react-icons/fi';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const BASE_URL = 'https://receiptgenerator.net';

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  // Prepend "Receipt Generator" as the first breadcrumb
  const allItems: BreadcrumbItem[] = [
    { label: 'Receipt Generator', href: '/' },
    ...items,
  ];

  // Build schema.org BreadcrumbList JSON-LD
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: allItems.map((item, index) => {
      const isLast = index === allItems.length - 1;
      const entry: any = {
        '@type': 'ListItem',
        position: index + 1,
        name: item.label,
      };
      if (!isLast && item.href) {
        entry.item = `${BASE_URL}${item.href}`;
      }
      return entry;
    }),
  };

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      </Head>
      <nav aria-label="Breadcrumb" className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ol className="flex items-center gap-1.5 py-3 text-sm overflow-x-auto">
            {allItems.map((item, index) => {
              const isLast = index === allItems.length - 1;
              return (
                <li key={index} className="flex items-center gap-1.5 whitespace-nowrap">
                  {index > 0 && (
                    <FiChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#9ca3af' }} />
                  )}
                  {isLast || !item.href ? (
                    <span style={{ color: '#111827' }} className="font-medium">
                      {item.label}
                    </span>
                  ) : (
                    <Link
                      href={item.href}
                      className="transition-colors"
                      style={{ color: '#6b7280' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#0d9488')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#6b7280')}
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </nav>
    </>
  );
}
