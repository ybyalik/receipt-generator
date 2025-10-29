import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { FiCheck, FiArrowRight } from 'react-icons/fi';

export default function SubscriptionSuccess() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/pricing');
      return;
    }

    const timer = setTimeout(() => {
      setIsVerifying(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [user, loading, router]);

  if (loading || isVerifying) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-accent-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-navy-600">Verifying your subscription...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-white rounded-2xl shadow-xl p-12">
          <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheck className="text-4xl text-success-600" />
          </div>

          <h1 className="text-4xl font-bold text-navy-900 mb-4">
            Welcome to Premium!
          </h1>

          <p className="text-xl text-navy-600 mb-8">
            Your subscription has been activated successfully. You now have access to all premium features!
          </p>

          <div className="bg-accent-50 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-navy-900 mb-3">What&apos;s Included:</h2>
            <ul className="space-y-2 text-left max-w-md mx-auto">
              {[
                'Download receipts without watermarks',
                'Save unlimited custom templates',
                'Access all premium templates',
                'Priority support',
              ].map((feature, index) => (
                <li key={index} className="flex items-start">
                  <FiCheck className="text-success-500 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-navy-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/templates"
              className="inline-flex items-center justify-center bg-accent-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-accent-700 transition-all shadow-lg cursor-pointer"
            >
              Browse Templates
              <FiArrowRight className="ml-2" />
            </Link>
            <Link
              href="/my-templates"
              className="inline-flex items-center justify-center bg-white text-navy-900 border-2 border-navy-200 px-8 py-3 rounded-xl font-semibold hover:bg-navy-50 transition-all cursor-pointer"
            >
              My Templates
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
