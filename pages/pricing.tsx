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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-navy-900 mb-4 tracking-tight">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-navy-600">
            Choose the plan that works best for you
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-navy-100">
            <h3 className="text-2xl font-bold mb-4 text-navy-900">Free</h3>
            <div className="mb-6">
              <span className="text-5xl font-bold text-navy-900">$0</span>
              <span className="text-navy-600 text-lg">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <FiCheck className="text-success-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-navy-700">Access to all templates</span>
              </li>
              <li className="flex items-start">
                <FiCheck className="text-success-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-navy-700">Customize receipts</span>
              </li>
              <li className="flex items-start">
                <FiCheck className="text-success-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-navy-700">Live preview</span>
              </li>
              <li className="flex items-start">
                <FiCheck className="text-success-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-navy-700">Download with watermark</span>
              </li>
            </ul>
            <button className="w-full bg-navy-100 text-navy-700 px-6 py-3 rounded-xl font-semibold hover:bg-navy-200 transition-all">
              Current Plan
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-xl p-8 border-2 border-accent-500 relative transform md:-translate-y-2 md:scale-105">
            <div className="absolute top-0 right-0 bg-accent-500 text-white px-4 py-1 rounded-bl-xl rounded-tr-xl text-sm font-semibold">
              Popular
            </div>
            <h3 className="text-2xl font-bold mb-4 text-navy-900">Premium</h3>
            <div className="mb-6">
              <span className="text-5xl font-bold text-navy-900">$9.99</span>
              <span className="text-navy-600 text-lg">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <FiCheck className="text-success-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-navy-700">Everything in Free</span>
              </li>
              <li className="flex items-start">
                <FiCheck className="text-success-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-navy-700 font-semibold">Download without watermark</span>
              </li>
              <li className="flex items-start">
                <FiCheck className="text-success-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-navy-700">Save custom templates</span>
              </li>
              <li className="flex items-start">
                <FiCheck className="text-success-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-navy-700">Priority support</span>
              </li>
              <li className="flex items-start">
                <FiCheck className="text-success-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-navy-700">Unlimited downloads</span>
              </li>
            </ul>
            {user ? (
              <button className="w-full bg-accent-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-accent-600 transition-all hover:shadow-lg">
                Upgrade to Premium
              </button>
            ) : (
              <button
                onClick={signIn}
                className="w-full bg-accent-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-accent-600 transition-all hover:shadow-lg"
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
