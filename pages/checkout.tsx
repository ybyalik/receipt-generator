import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import AuthModal from '../components/AuthModal';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ToastContainer';

export default function Checkout() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { showError } = useToast();
  const { plan } = router.query;
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!plan || !['weekly', 'monthly', 'yearly'].includes(plan as string)) {
      showError('Invalid plan selected');
      router.push('/pricing');
      return;
    }

    if (!user) {
      // Show auth modal for logged-out users
      setShowAuthModal(true);
      return;
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

  const planLabels: Record<string, string> = {
    weekly: 'Weekly — $4.99/week',
    monthly: 'Monthly — $9.99/month',
    yearly: 'Yearly — $44.99/year ($3.75/month)',
  };

  return (
    <Layout breadcrumbs={[{ label: 'Pricing', href: '/pricing' }, { label: 'Checkout' }]}>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">
            {!user ? 'Please sign in to continue...' : 'Redirecting to secure checkout...'}
          </p>
          {plan && typeof plan === 'string' && planLabels[plan] && (
            <p className="text-gray-500 text-sm mt-2">
              {planLabels[plan]}
            </p>
          )}
          <div className="flex items-center justify-center gap-4 mt-6 text-gray-400 text-xs">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              <span>Secured by Stripe</span>
            </div>
            <span>|</span>
            <span>256-bit SSL encryption</span>
          </div>
        </div>
      </div>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => {
          setShowAuthModal(false);
          router.push('/pricing');
        }} 
      />
    </Layout>
  );
}
