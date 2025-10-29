
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { FiCheck } from 'react-icons/fi';

const Pricing: NextPage = () => {
  const { user, signIn } = useAuth();

  const plans = [
    {
      name: 'Weekly',
      price: '$4.99',
      period: '/week',
      popular: false,
    },
    {
      name: 'Monthly',
      price: '$9.99',
      period: '/month',
      popular: true,
    },
    {
      name: 'Yearly',
      price: '$44.99',
      period: '/year',
      popular: false,
      savings: 'Save $75/year',
    },
  ];

  const features = [
    'No Watermarks',
    'Save & Re-Use Templates',
    'Access to Template Library',
    'Unlimited Customizations',
    'Unlimited Downloads',
  ];

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-xl shadow-lg p-8 border-2 ${
                plan.popular
                  ? 'border-accent-500 relative transform md:-translate-y-2 md:scale-105'
                  : 'border-navy-100'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-accent-500 text-white px-4 py-1 rounded-bl-xl rounded-tr-xl text-sm font-semibold">
                  Popular
                </div>
              )}
              <h3 className="text-2xl font-bold mb-4 text-navy-900">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold text-navy-900">{plan.price}</span>
                <span className="text-navy-600 text-lg">{plan.period}</span>
              </div>
              {plan.savings && (
                <div className="mb-4">
                  <span className="text-success-600 font-semibold text-sm bg-success-50 px-3 py-1 rounded-full">
                    {plan.savings}
                  </span>
                </div>
              )}
              <ul className="space-y-3 mb-8">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <FiCheck className="text-success-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-navy-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={`/checkout?plan=${plan.name.toLowerCase()}`}
                className={`block w-full text-center px-6 py-3 rounded-xl font-semibold transition-all hover:shadow-lg cursor-pointer ${
                  plan.popular
                    ? 'bg-accent-500 text-white hover:bg-accent-600'
                    : 'bg-navy-100 text-navy-700 hover:bg-navy-200'
                }`}
              >
                Select Plan
              </Link>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Pricing;
