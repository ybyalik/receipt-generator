
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { FiCheck, FiChevronDown } from 'react-icons/fi';

const faqs = [
  {
    q: 'Can I cancel my subscription anytime?',
    a: 'Yes — cancel with one click from your account settings. You keep access through the end of your billing period, no questions asked.',
  },
  {
    q: 'What happens to my receipts if I cancel?',
    a: 'All receipts you downloaded are yours to keep forever. Saved templates remain in your account but new downloads will include a watermark.',
  },
  {
    q: 'Is there a free plan?',
    a: 'You can browse templates and customize receipts for free. Downloads on the free tier include a small watermark. Upgrade to remove it instantly.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit and debit cards (Visa, Mastercard, Amex) through our secure Stripe payment processor.',
  },
  {
    q: 'Can I switch plans later?',
    a: 'Absolutely. Upgrade or downgrade at any time — changes take effect on your next billing cycle.',
  },
  {
    q: 'Do you offer refunds?',
    a: "If you're not satisfied within the first 7 days, contact us for a full refund. After that, you can cancel to stop future charges.",
  },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="mt-20 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">
        Frequently Asked Questions
      </h2>
      <div className="divide-y divide-gray-200">
        {faqs.map((faq, i) => (
          <div key={i}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between py-5 text-left cursor-pointer"
            >
              <span className="text-base font-medium text-gray-900">{faq.q}</span>
              <FiChevronDown
                className={`w-5 h-5 flex-shrink-0 ml-4 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`}
                style={{ color: '#6b7280' }}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-200 ${open === i ? 'max-h-40 pb-5' : 'max-h-0'}`}
            >
              <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const Pricing: NextPage = () => {
  const { user, signIn } = useAuth();

  const plans = [
    {
      name: 'Weekly',
      price: '$4.99',
      period: '/week',
      popular: false,
      cta: 'Get Started',
    },
    {
      name: 'Monthly',
      price: '$9.99',
      period: '/month',
      popular: false,
      savings: 'Save $10/month',
      cta: 'Get Premium Access',
    },
    {
      name: 'Yearly',
      price: '$44.99',
      period: '/year',
      popular: true,
      savings: 'Just $3.75/month',
      cta: 'Get Best Value',
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
    <Layout breadcrumbs={[{ label: 'Pricing' }]}>
      <Head>
        <title>Pricing - Receipt Generator</title>
        <meta name="description" content="Choose your plan" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600">
            Choose the plan that works best for you
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-xl shadow-lg p-8 border-2 ${
                plan.popular
                  ? 'border-teal-500 relative transform md:-translate-y-2 md:scale-105'
                  : 'border-gray-100'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 px-4 py-1 rounded-bl-xl rounded-tr-xl text-sm font-semibold" style={{ backgroundColor: '#0d9488', color: '#ffffff' }}>
                  Best Value
                </div>
              )}
              <h3 className="text-2xl font-bold mb-4 text-gray-900">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-gray-600 text-lg">{plan.period}</span>
              </div>
              {plan.savings && (
                <div className="mb-4">
                  <span className="text-teal-700 font-semibold text-sm bg-teal-50 px-3 py-1 rounded-full">
                    {plan.savings}
                  </span>
                </div>
              )}
              <ul className="space-y-3 mb-8">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <FiCheck className="text-teal-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={`/checkout?plan=${plan.name.toLowerCase()}`}
                className={`block w-full text-center px-6 py-3 rounded-xl font-semibold transition-all hover:shadow-lg cursor-pointer ${
                  plan.popular
                    ? ''
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={plan.popular ? { backgroundColor: '#0d9488', color: '#ffffff' } : undefined}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
        {/* FAQ Section */}
        <FAQ />
      </div>
    </Layout>
  );
};

export default Pricing;
