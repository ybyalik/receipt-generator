import type { NextPage, GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { FiArrowRight, FiCheck, FiEdit3, FiDollarSign, FiUsers, FiGlobe, FiClock, FiDownload } from 'react-icons/fi';
import { getAllTemplates } from '../server/storage';
import type { Template } from '../shared/schema';
import type { Section, TemplateSettings } from '../lib/types';

const ReceiptPreview = dynamic(() => import('../components/ReceiptPreview'), {
  ssr: false,
  loading: () => <div className="h-full bg-gray-100 animate-pulse rounded-lg" />,
});

interface RestaurantPageProps {
  templates: Template[];
}

const RestaurantReceipt: NextPage<RestaurantPageProps> = ({ templates }) => {
  const restaurantTemplates = templates.filter(t =>
    t.category === 'Restaurant' ||
    t.name.toLowerCase().includes('restaurant') ||
    t.name.toLowerCase().includes('cafe') ||
    t.name.toLowerCase().includes('diner') ||
    t.name.toLowerCase().includes('food')
  );

  return (
    <>
      <Head>
        <title>Restaurant Receipt Generator - Create Restaurant Receipts</title>
        <meta name="description" content="Create professional restaurant receipts in seconds. Templates for cafes, diners, bistros, and restaurants with itemized bills, tips, and tax calculations." />
        <link rel="canonical" href="https://receiptgenerator.net/restaurant-receipt" />
      </Head>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-xl font-semibold text-gray-900">
              Receipt Generator
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link href="/templates" className="text-gray-600 hover:text-gray-900 transition-colors">
                Templates
              </Link>
              <Link href="/ai" className="text-gray-600 hover:text-gray-900 transition-colors">
                AI Generator
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                Pricing
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/templates" className="hidden sm:block text-gray-600 hover:text-gray-900 transition-colors">
                Log in
              </Link>
              <Link
                href="/templates"
                className="inline-flex items-center px-4 py-2 bg-teal-500 text-white font-medium rounded-lg hover:bg-teal-600 transition-colors"
              >
                Try for free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="bg-white">
        {/* Hero Section */}
        <section className="pt-24 pb-16 lg:pt-32 lg:pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left: Content */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-700 text-sm font-medium rounded-full mb-6">
                  Restaurant Receipts
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                  Restaurant receipts in seconds
                </h1>

                <p className="text-lg text-gray-600 mb-8 max-w-lg">
                  Create detailed receipts for your restaurant, cafe, or diner. Itemized orders, tips, taxes—all fully customizable.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <Link
                    href="#templates"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-500 text-white font-medium rounded-lg hover:bg-teal-600 transition-colors"
                  >
                    Browse restaurant templates
                    <FiArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/ai"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Upload existing receipt
                  </Link>
                </div>
              </div>

              {/* Right: Receipt Preview */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-amber-50 rounded-3xl transform rotate-3"></div>
                <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-sm mx-auto">
                  <div className="font-mono text-sm text-gray-800">
                    <div className="text-center mb-4">
                      <div className="font-bold text-lg">THE GOLDEN FORK</div>
                      <div className="text-xs text-gray-500">123 Main Street, City</div>
                      <div className="text-xs text-gray-500">Tel: (555) 123-4567</div>
                    </div>

                    <div className="border-t border-dashed border-gray-300 my-4"></div>

                    <div className="flex justify-between text-xs text-gray-500 mb-4">
                      <span>Server: Rebecca</span>
                      <span>Table: 12</span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span>2x Grilled Salmon</span>
                        <span>$42.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>1x Caesar Salad</span>
                        <span>$12.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>2x House Wine</span>
                        <span>$18.00</span>
                      </div>
                    </div>

                    <div className="border-t border-dashed border-gray-300 my-4"></div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>$72.00</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Tax (8%)</span>
                        <span>$5.76</span>
                      </div>
                      <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-200 mt-2">
                        <span>Total</span>
                        <span>$77.76</span>
                      </div>
                    </div>

                    <div className="text-center text-xs text-gray-400 mt-6">
                      Thank you for dining with us!
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 lg:py-28 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Built for restaurants
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Everything you need to create professional restaurant receipts
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: FiEdit3,
                  title: 'Itemized orders',
                  desc: 'Add menu items with quantities and prices. Perfect for detailed bills.',
                },
                {
                  icon: FiDollarSign,
                  title: 'Tax & tip calculations',
                  desc: 'Include tax rates and gratuity lines with automatic calculations.',
                },
                {
                  icon: FiUsers,
                  title: 'Server & table info',
                  desc: 'Add server names, table numbers, and order details.',
                },
                {
                  icon: FiGlobe,
                  title: 'Custom branding',
                  desc: 'Your restaurant name, address, phone, and logo.',
                },
                {
                  icon: FiClock,
                  title: 'Multiple formats',
                  desc: 'Support for various date formats, currencies, and layouts.',
                },
                {
                  icon: FiDownload,
                  title: 'Instant download',
                  desc: 'Export high-quality PNG files ready for print or digital use.',
                },
              ].map((feature) => (
                <div key={feature.title} className="p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-gray-300 transition-all">
                  <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Templates Section */}
        <section id="templates" className="py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Restaurant templates
              </h2>
              <p className="text-lg text-gray-600">
                Choose a template and customize it to match your restaurant
              </p>
            </div>

            {restaurantTemplates.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {restaurantTemplates.slice(0, 6).map((template) => (
                  <Link
                    key={template.id}
                    href={`/template/${template.slug}`}
                    className="group block bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all"
                  >
                    <div className="bg-gray-50 p-6 h-56 flex items-start justify-center overflow-hidden">
                      <div className="scale-[0.45] origin-top">
                        <ReceiptPreview
                          sections={template.sections as Section[]}
                          settings={template.settings as TemplateSettings}
                          showWatermark={false}
                        />
                      </div>
                    </div>
                    <div className="p-5 border-t border-gray-100">
                      <h3 className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">Click to customize →</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-xl">
                <p className="text-gray-600 mb-6">No specific restaurant templates found.</p>
                <Link
                  href="/templates"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-white font-medium rounded-lg hover:bg-teal-600 transition-colors"
                >
                  Browse all templates
                </Link>
              </div>
            )}

            <div className="text-center mt-12">
              <Link
                href="/templates"
                className="text-teal-600 font-medium hover:text-teal-700 transition-colors"
              >
                View all templates →
              </Link>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="py-20 lg:py-28 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Common use cases
              </h2>
              <p className="text-lg text-gray-600">
                Why restaurants use our receipt generator
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: 'Recreate lost receipts',
                  desc: 'Need to recreate a receipt for reimbursement or accounting records? Generate accurate duplicates.',
                },
                {
                  title: 'Staff training',
                  desc: 'Train new staff with realistic sample receipts. Practice POS workflows without real transactions.',
                },
                {
                  title: 'Menu testing',
                  desc: 'Test how new pricing displays before updating your actual POS system.',
                },
                {
                  title: 'Record keeping',
                  desc: 'Maintain organized backup copies of important transactions for your records.',
                },
              ].map((item) => (
                <div key={item.title} className="p-6 bg-white border border-gray-200 rounded-xl flex gap-4">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FiCheck className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 lg:py-28">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Ready to create your restaurant receipt?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              No signup required. Start creating in seconds.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/templates"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-500 text-white font-medium rounded-lg hover:bg-teal-600 transition-colors"
              >
                Browse templates
                <FiArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/ai"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Try AI generator
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="text-lg font-semibold text-gray-900 mb-4">Receipt Generator</div>
              <p className="text-gray-600 text-sm">
                The fastest way to create professional receipts for any business.
              </p>
            </div>

            <div>
              <div className="font-semibold text-gray-900 mb-4">Product</div>
              <ul className="space-y-3 text-gray-600">
                <li><Link href="/templates" className="hover:text-gray-900 transition-colors">Templates</Link></li>
                <li><Link href="/ai" className="hover:text-gray-900 transition-colors">AI Generator</Link></li>
                <li><Link href="/pricing" className="hover:text-gray-900 transition-colors">Pricing</Link></li>
              </ul>
            </div>

            <div>
              <div className="font-semibold text-gray-900 mb-4">Company</div>
              <ul className="space-y-3 text-gray-600">
                <li><Link href="/about" className="hover:text-gray-900 transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-gray-900 transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <div className="font-semibold text-gray-900 mb-4">Legal</div>
              <ul className="space-y-3 text-gray-600">
                <li><Link href="/terms" className="hover:text-gray-900 transition-colors">Terms</Link></li>
                <li><Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Receipt Generator. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<RestaurantPageProps> = async () => {
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

export default RestaurantReceipt;
