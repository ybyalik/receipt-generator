import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import { FiFileText, FiEdit, FiDownload, FiZap } from 'react-icons/fi';

const Home: NextPage = () => {
  return (
    <Layout>
      <Head>
        <title>ReceiptGen - Create Professional Receipts Instantly</title>
        <meta name="description" content="Generate custom receipts with ease" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="bg-gradient-to-br from-navy-50 via-white to-accent-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-5xl lg:text-6xl font-bold text-navy-900 mb-6 leading-tight tracking-tight">
              Create Professional Receipts<br />in Seconds
            </h1>
            <p className="text-xl text-navy-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Choose from our pre-built templates, customize every detail, and download
              your receipt instantly. Perfect for businesses and individuals.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/templates"
                className="bg-accent-500 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-accent-600 hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
              >
                Browse Templates
              </Link>
              <Link
                href="/pricing"
                className="bg-white text-navy-700 border-2 border-navy-200 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-navy-50 hover:border-navy-300 hover:shadow-md transition-all"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-center text-navy-900 mb-16">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center group">
            <div className="bg-gradient-to-br from-accent-100 to-accent-200 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-all">
              <FiFileText className="text-4xl text-accent-600" />
            </div>
            <h3 className="text-xl font-semibold text-navy-900 mb-3">1. Choose a Template</h3>
            <p className="text-navy-600 leading-relaxed">
              Select from our collection of professional receipt templates designed for various business types
            </p>
          </div>
          <div className="text-center group">
            <div className="bg-gradient-to-br from-accent-100 to-accent-200 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-all">
              <FiEdit className="text-4xl text-accent-600" />
            </div>
            <h3 className="text-xl font-semibold text-navy-900 mb-3">2. Customize</h3>
            <p className="text-navy-600 leading-relaxed">
              Edit business details, items, prices, and rearrange sections with our intuitive drag-and-drop editor
            </p>
          </div>
          <div className="text-center group">
            <div className="bg-gradient-to-br from-accent-100 to-accent-200 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-all">
              <FiDownload className="text-4xl text-accent-600" />
            </div>
            <h3 className="text-xl font-semibold text-navy-900 mb-3">3. Download</h3>
            <p className="text-navy-600 leading-relaxed">
              Export your custom receipt as a high-quality PNG image, ready to use or share
            </p>
          </div>
        </div>
      </div>

      <div className="bg-navy-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-navy-900 mb-16">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="flex items-start bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-accent-100 p-3 rounded-lg mr-5 flex-shrink-0">
                <FiZap className="text-2xl text-accent-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-navy-900 mb-2">Live Preview</h3>
                <p className="text-navy-600 leading-relaxed">
                  See your changes in real-time with our instant preview feature - no need to wait or refresh
                </p>
              </div>
            </div>
            <div className="flex items-start bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-accent-100 p-3 rounded-lg mr-5 flex-shrink-0">
                <FiEdit className="text-2xl text-accent-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-navy-900 mb-2">Drag & Drop</h3>
                <p className="text-navy-600 leading-relaxed">
                  Rearrange receipt sections easily with our intuitive drag-and-drop interface
                </p>
              </div>
            </div>
            <div className="flex items-start bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-accent-100 p-3 rounded-lg mr-5 flex-shrink-0">
                <FiFileText className="text-2xl text-accent-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-navy-900 mb-2">Save Templates</h3>
                <p className="text-navy-600 leading-relaxed">
                  Save your customized templates to your personal collection for quick access and reuse
                </p>
              </div>
            </div>
            <div className="flex items-start bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-accent-100 p-3 rounded-lg mr-5 flex-shrink-0">
                <FiDownload className="text-2xl text-accent-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-navy-900 mb-2">High Quality Export</h3>
                <p className="text-navy-600 leading-relaxed">
                  Download receipts as crisp, professional PNG images suitable for printing or digital use
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
