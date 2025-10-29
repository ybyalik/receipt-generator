import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ToastContainer';

export default function Checkout() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { showError } = useToast();
  const { plan } = router.query;

  useEffect(() => {
    if (loading) return;

    if (!user) {
      showError('Please sign in to continue');
      router.push('/pricing');
      return;
    }

    if (!plan || !['weekly', 'monthly', 'yearly'].includes(plan as string)) {
      showError('Invalid plan selected');
      router.push('/pricing');
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
