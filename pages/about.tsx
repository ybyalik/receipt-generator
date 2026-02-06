import React from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { FiCheckCircle, FiZap, FiShield, FiUsers } from 'react-icons/fi';

export default function About() {
  return (
    <Layout>
      <Head>
        <title>About Us - Receipt Generator</title>
        <meta name="description" content="Learn about Receipt Generator, our mission to make professional receipt creation easy and accessible for everyone." />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50">
        <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">About Receipt Generator</h1>
            <p className="text-xl text-gray-600">
              Making professional receipt creation simple and accessible for everyone
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              We built Receipt Generator to solve a common problem: creating professional-looking receipts 
              shouldn't require expensive software or design skills. Whether you need to replace a lost receipt, 
              document a transaction, or create receipts for your business, we've made it quick and easy.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Our platform combines ready-made templates with powerful customization options, giving you 
              everything you need to generate authentic-looking receipts in seconds.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
              <div className="bg-gradient-to-br from-teal-500 to-teal-600 w-14 h-14 rounded-xl flex items-center justify-center mb-5">
                <FiZap className="text-2xl text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Fast & Simple</h3>
              <p className="text-gray-600 leading-relaxed">
                Choose a template, fill in your details, and download. No complicated software, 
                no learning curve. Create professional receipts in under a minute.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
              <div className="bg-gradient-to-br from-teal-500 to-teal-600 w-14 h-14 rounded-xl flex items-center justify-center mb-5">
                <FiCheckCircle className="text-2xl text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Professional Quality</h3>
              <p className="text-gray-600 leading-relaxed">
                Our templates are designed to look authentic and professional. Every detail matters, 
                from fonts to layouts to proper receipt formatting.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-teal-900 rounded-2xl shadow-xl p-8 md:p-12 text-white">
            <h2 className="text-3xl font-bold mb-6">What Sets Us Apart</h2>
            <ul className="space-y-4">
              <li className="flex items-start">
                <FiCheckCircle className="text-teal-400 mt-1 mr-3 flex-shrink-0" size={24} />
                <div>
                  <strong className="text-lg">Industry-Specific Templates</strong>
                  <p className="text-white/90 mt-1">
                    Pre-built templates for restaurants, gas stations, auto repair shops, retail stores, and more
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <FiCheckCircle className="text-teal-400 mt-1 mr-3 flex-shrink-0" size={24} />
                <div>
                  <strong className="text-lg">AI-Powered Generator (Beta)</strong>
                  <p className="text-white/90 mt-1">
                    Upload any receipt image and our AI will extract the data and match the format automatically
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <FiCheckCircle className="text-teal-400 mt-1 mr-3 flex-shrink-0" size={24} />
                <div>
                  <strong className="text-lg">Complete Customization</strong>
                  <p className="text-white/90 mt-1">
                    Drag-and-drop editor, multiple fonts, custom logos, flexible sections, and real-time preview
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <FiCheckCircle className="text-teal-400 mt-1 mr-3 flex-shrink-0" size={24} />
                <div>
                  <strong className="text-lg">Save & Reuse</strong>
                  <p className="text-white/90 mt-1">
                    Save your customized templates to quickly generate similar receipts in the future
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div className="text-center mt-12">
            <p className="text-lg text-gray-700 mb-6">
              Ready to create your first professional receipt?
            </p>
            <a
              href="/templates"
              className="inline-block px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg hover:shadow-xl"
              style={{ backgroundColor: '#0d9488', color: '#ffffff' }}
            >
              <span className="text-white">Get Started Now</span>
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
