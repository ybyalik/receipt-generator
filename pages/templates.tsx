import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import { useTemplates } from '../contexts/TemplatesContext';
import { FiArrowRight } from 'react-icons/fi';

const Templates: NextPage = () => {
  const { templates } = useTemplates();
  
  return (
    <Layout>
      <Head>
        <title>Templates - ReceiptGen</title>
        <meta name="description" content="Browse our collection of receipt templates" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Receipt Templates
          </h1>
          <p className="text-xl text-gray-600">
            Choose from our professionally designed templates and customize them to your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {templates.map((template) => (
            <Link
              key={template.id}
              href={`/template/${template.slug}`}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden border border-gray-200"
            >
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8">
                <div className="bg-white rounded shadow-sm p-4 text-xs text-gray-700 h-48 overflow-hidden">
                  <div className="text-center font-semibold mb-2">
                    {template.name}
                  </div>
                  <div className="space-y-1 text-center">
                    {template.sections.slice(0, 3).map((section, idx) => (
                      <div key={idx} className="border-b pb-1">
                        {section.type.replace('_', ' ').toUpperCase()}
                      </div>
                    ))}
                    {template.sections.length > 3 && (
                      <div className="text-gray-400">
                        +{template.sections.length - 3} more sections
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{template.name}</h3>
                <p className="text-gray-600 mb-4">
                  {template.sections.length} customizable sections
                </p>
                <div className="flex items-center text-blue-600 font-semibold">
                  Customize Template
                  <FiArrowRight className="ml-2" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Templates;
