import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import Layout from '../components/Layout';
import { FiFileText, FiEdit, FiDownload, FiZap, FiLayers, FiCheckCircle } from 'react-icons/fi';

const Home: NextPage = () => {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const setSectionRef = (id: string) => (el: HTMLDivElement | null) => {
    sectionRefs.current[id] = el;
  };

  const isVisible = (id: string) => visibleSections.has(id);

  return (
    <Layout>
      <Head>
        <title>Receipt Generator - Create Professional Receipts Instantly | ReceiptGen</title>
        <meta name="description" content="Create professional receipts in seconds with our online receipt generator. Choose from customizable templates, add your details, and download high-quality receipts instantly. Perfect for businesses and individuals." />
        <meta name="keywords" content="receipt generator, receipt maker, online receipt, create receipt, receipt template, business receipt, custom receipt" />
        <meta property="og:title" content="Receipt Generator - Create Professional Receipts Instantly" />
        <meta property="og:description" content="Create professional receipts in seconds with our online receipt generator. Choose from customizable templates and download instantly." />
        <meta property="og:type" content="website" />
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
                className="bg-accent-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-accent-700 transition-all shadow-lg hover:shadow-xl cursor-pointer"
              >
                <span className="text-white">Browse Templates</span>
              </Link>
              <Link
                href="/pricing"
                className="bg-white text-navy-900 border-2 border-navy-200 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-navy-50 hover:border-accent-500 transition-all shadow-md cursor-pointer"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-white via-accent-50/30 to-navy-50/50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-navy-900 mb-16">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            {
              id: 'step-1',
              icon: FiFileText,
              title: '1. Choose a Template',
              description: 'Select from our collection of professional receipt templates designed for various business types',
            },
            {
              id: 'step-2',
              icon: FiEdit,
              title: '2. Customize',
              description: 'Edit business details, items, prices, and rearrange sections with our intuitive drag-and-drop editor',
            },
            {
              id: 'step-3',
              icon: FiDownload,
              title: '3. Download',
              description: 'Export your custom receipt as a high-quality PNG image, ready to use or share',
            },
          ].map((step, index) => (
            <div
              key={step.id}
              id={step.id}
              ref={setSectionRef(step.id)}
              className={`text-center transition-all duration-700 ${
                isVisible(step.id)
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="bg-gradient-to-br from-accent-100 to-accent-200 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all">
                <step.icon className="text-4xl text-accent-600" />
              </div>
              <h3 className="text-xl font-semibold text-navy-900 mb-3">{step.title}</h3>
              <p className="text-navy-600 leading-relaxed">{step.description}</p>
            </div>
          ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-b from-navy-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-navy-900 mb-4">Powerful Features</h2>
            <p className="text-xl text-navy-600 max-w-2xl mx-auto">
              Everything you need to create professional receipts quickly and easily
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                id: 'feature-1',
                icon: FiZap,
                title: 'Live Preview',
                description: 'See your changes in real-time with our instant preview feature - no need to wait or refresh',
              },
              {
                id: 'feature-2',
                icon: FiEdit,
                title: 'Drag & Drop',
                description: 'Rearrange receipt sections easily with our intuitive drag-and-drop interface',
              },
              {
                id: 'feature-3',
                icon: FiLayers,
                title: 'Multiple Templates',
                description: 'Choose from pre-built templates for restaurants, repair shops, gas stations, and more',
              },
              {
                id: 'feature-4',
                icon: FiFileText,
                title: 'Save Templates',
                description: 'Save your customized templates to your personal collection for quick access and reuse',
              },
              {
                id: 'feature-5',
                icon: FiDownload,
                title: 'High Quality Export',
                description: 'Download receipts as crisp, professional PNG images suitable for printing or digital use',
              },
              {
                id: 'feature-6',
                icon: FiCheckCircle,
                title: 'Fully Customizable',
                description: 'Control every detail from fonts and colors to currency formats and receipt textures',
              },
            ].map((feature, index) => (
              <div
                key={feature.id}
                id={feature.id}
                ref={setSectionRef(feature.id)}
                className={`bg-white p-8 rounded-2xl shadow-md hover:shadow-xl border border-navy-100 transition-all duration-700 ${
                  isVisible(feature.id)
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                <div className="bg-gradient-to-br from-accent-500 to-accent-600 w-14 h-14 rounded-xl flex items-center justify-center mb-5">
                  <feature.icon className="text-2xl text-white" />
                </div>
                <h3 className="text-xl font-semibold text-navy-900 mb-3">{feature.title}</h3>
                <p className="text-navy-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-navy-900 via-navy-800 to-accent-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-white/90 mb-10 leading-relaxed">
            Join thousands of users creating professional receipts every day. Start for free!
          </p>
          <Link
            href="/templates"
            className="inline-block bg-accent-500 text-white px-10 py-4 rounded-xl text-lg font-semibold hover:bg-accent-600 transition-all cursor-pointer shadow-xl hover:shadow-2xl hover:scale-105"
          >
            Create Your First Receipt
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
