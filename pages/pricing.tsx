import type { NextPage } from 'next';
import Head from 'next/head';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { FiCheck } from 'react-icons/fi';

const Pricing: NextPage = () => {
  const { user, signIn } = useAuth();

  return (
    <Layout>
      <Head>
        <title>Pricing - ReceiptGen</title>
        <meta name="description" content="Choose your plan" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600">
            Choose the plan that works best for you
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-gray-200">
            <h3 className="text-2xl font-bold mb-4">Free</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-gray-600">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <FiCheck className="text-green-500 mr-2 mt-1" />
                <span>Access to all templates</span>
              </li>
              <li className="flex items-start">
                <FiCheck className="text-green-500 mr-2 mt-1" />
                <span>Customize receipts</span>
              </li>
              <li className="flex items-start">
                <FiCheck className="text-green-500 mr-2 mt-1" />
                <span>Live preview</span>
              </li>
              <li className="flex items-start">
                <FiCheck className="text-green-500 mr-2 mt-1" />
                <span>Download with watermark</span>
              </li>
            </ul>
            <button className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">
              Current Plan
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-blue-600 relative">
            <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 rounded-bl-lg rounded-tr-lg text-sm font-semibold">
              Popular
            </div>
            <h3 className="text-2xl font-bold mb-4">Premium</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold">$9.99</span>
              <span className="text-gray-600">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <FiCheck className="text-green-500 mr-2 mt-1" />
                <span>Everything in Free</span>
              </li>
              <li className="flex items-start">
                <FiCheck className="text-green-500 mr-2 mt-1" />
                <span className="font-semibold">Download without watermark</span>
              </li>
              <li className="flex items-start">
                <FiCheck className="text-green-500 mr-2 mt-1" />
                <span>Save custom templates</span>
              </li>
              <li className="flex items-start">
                <FiCheck className="text-green-500 mr-2 mt-1" />
                <span>Priority support</span>
              </li>
              <li className="flex items-start">
                <FiCheck className="text-green-500 mr-2 mt-1" />
                <span>Unlimited downloads</span>
              </li>
            </ul>
            {user ? (
              <button className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                Upgrade to Premium
              </button>
            ) : (
              <button
                onClick={signIn}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Sign In to Subscribe
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Pricing;
