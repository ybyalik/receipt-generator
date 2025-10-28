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

      <div className="bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Create Professional Receipts in Seconds
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Choose from our pre-built templates, customize every detail, and download
              your receipt instantly. Perfect for businesses and individuals.
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                href="/templates"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
              >
                Browse Templates
              </Link>
              <Link
                href="/pricing"
                className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-50 transition"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiFileText className="text-3xl text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">1. Choose a Template</h3>
            <p className="text-gray-600">
              Select from our collection of professional receipt templates
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiEdit className="text-3xl text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">2. Customize</h3>
            <p className="text-gray-600">
              Edit business details, items, prices, and rearrange sections
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiDownload className="text-3xl text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">3. Download</h3>
            <p className="text-gray-600">
              Export your custom receipt as a high-quality PNG image
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start">
              <FiZap className="text-2xl text-blue-600 mr-4 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Live Preview</h3>
                <p className="text-gray-600">
                  See your changes in real-time with our instant preview feature
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <FiEdit className="text-2xl text-blue-600 mr-4 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Drag & Drop</h3>
                <p className="text-gray-600">
                  Rearrange receipt sections easily with drag and drop
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <FiFileText className="text-2xl text-blue-600 mr-4 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Save Templates</h3>
                <p className="text-gray-600">
                  Save your customized templates for future use
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <FiDownload className="text-2xl text-blue-600 mr-4 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2">High Quality Export</h3>
                <p className="text-gray-600">
                  Download receipts as crisp, professional PNG images
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
