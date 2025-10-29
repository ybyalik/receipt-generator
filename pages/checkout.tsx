import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ToastContainer';

export default function Checkout() {
  const router = useRouter();
  const { user, loading, signIn } = useAuth();
  const { showError } = useToast();
  const { plan } = router.query;

  useEffect(() => {
    if (loading) return;

    if (!plan || !['weekly', 'monthly', 'yearly'].includes(plan as string)) {
      showError('Invalid plan selected');
      router.push('/pricing');
      return;
    }

    if (!user) {
      return; // Show sign-in prompt instead of redirecting
    }

    const createCheckoutSession = async () => {
      try {
        const response = await fetch('/api/create-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firebaseUid: user.uid,
            plan,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create checkout session');
        }

        // Redirect to Stripe Checkout
        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error('No checkout URL returned');
        }
      } catch (error: any) {
        showError(error.message || 'An error occurred');
        router.push('/pricing');
      }
    };

    createCheckoutSession();
  }, [user, loading, plan, router, showError]);

  const planDetails = {
    weekly: { name: 'Weekly', price: '$4.99/week' },
    monthly: { name: 'Monthly', price: '$9.99/month' },
    yearly: { name: 'Yearly', price: '$44.99/year' },
  }[plan as string] || { name: '', price: '' };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-accent-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-navy-600 text-lg">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-3xl font-bold text-navy-900 mb-4">
              {planDetails.name} Plan
            </h2>
            <p className="text-4xl font-bold text-accent-600 mb-6">
              {planDetails.price}
            </p>
            <p className="text-navy-600 mb-8">
              Sign in with Google to complete your purchase and unlock premium features
            </p>
            <button
              onClick={signIn}
              className="w-full bg-accent-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-accent-600 transition-all hover:shadow-lg cursor-pointer"
            >
              Sign In to Continue
            </button>
            <p className="text-sm text-navy-500 mt-4">
              Quick and secure with Google
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-accent-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-navy-600 text-lg">Redirecting to secure checkout...</p>
        </div>
      </div>
    </Layout>
  );
}
