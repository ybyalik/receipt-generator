import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ToastContainer';

if (!process.env.NEXT_PUBLIC_VITE_STRIPE_PUBLIC_KEY) {
  console.warn('Missing VITE_STRIPE_PUBLIC_KEY environment variable');
}

const stripePromise = process.env.NEXT_PUBLIC_VITE_STRIPE_PUBLIC_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_VITE_STRIPE_PUBLIC_KEY)
  : null;

const CheckoutForm = ({ plan }: { plan: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { showToast, showError } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/subscription-success`,
        },
      });

      if (error) {
        showError(error.message || 'Payment failed');
      }
    } catch (err: any) {
      showError(err.message || 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const planDetails = {
    weekly: { name: 'Weekly', price: '$4.99/week' },
    monthly: { name: 'Monthly', price: '$9.99/month' },
    yearly: { name: 'Yearly', price: '$44.99/year' },
  }[plan] || { name: '', price: '' };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
        <h3 className="text-2xl font-bold text-navy-900 mb-2">{planDetails.name} Plan</h3>
        <p className="text-3xl font-bold text-accent-600 mb-6">{planDetails.price}</p>
        
        <div className="mb-6">
          <PaymentElement />
        </div>

        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="w-full bg-accent-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-accent-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isProcessing ? 'Processing...' : 'Subscribe Now'}
        </button>
      </div>

      <p className="text-center text-navy-600 text-sm">
        Secure payment powered by Stripe
      </p>
    </form>
  );
};

export default function Checkout() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { showError, showInfo } = useToast();
  const [clientSecret, setClientSecret] = useState('');
  const [isLoading, setIsLoading] = useState(true);
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

    const createSubscription = async () => {
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
          throw new Error(data.error || 'Failed to create subscription');
        }

        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          showInfo('Subscription already active');
          router.push('/my-templates');
        }
      } catch (error: any) {
        showError(error.message || 'An error occurred');
        router.push('/pricing');
      } finally {
        setIsLoading(false);
      }
    };

    createSubscription();
  }, [user, loading, plan, router, showError, showInfo]);

  if (loading || isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-accent-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-navy-600">Loading checkout...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!clientSecret || !stripePromise) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-navy-900 font-semibold">Unable to load checkout</p>
            <p className="text-navy-600">Please try again or contact support</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-navy-900 mb-2">Complete Your Subscription</h1>
          <p className="text-xl text-navy-600">Enter your payment details below</p>
        </div>

        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm plan={plan as string} />
        </Elements>
      </div>
    </Layout>
  );
}
