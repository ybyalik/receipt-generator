import type { NextApiRequest, NextApiResponse } from 'next';
import { stripe, STRIPE_PRICE_IDS, PricingPlan } from '../../lib/stripe';
import { getUserByFirebaseUid, updateUserSubscription } from '../../server/storage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { firebaseUid, plan } = req.body;

    if (!firebaseUid || !plan) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['weekly', 'monthly', 'yearly'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const user = await getUserByFirebaseUid(firebaseUid);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const priceId = STRIPE_PRICE_IDS[plan as PricingPlan];
    
    if (!priceId) {
      return res.status(400).json({ error: `Price ID not configured for ${plan} plan. Please contact support.` });
    }

    // Check for existing active subscription
    if (user.stripeSubscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);

        // Return error if user already has an active subscription
        if (user.isPremium && (subscription.status === 'active' || subscription.status === 'trialing')) {
          return res.status(400).json({ error: 'You already have an active subscription' });
        }
        
        // Cancel incomplete or old subscriptions for non-premium users
        if (!user.isPremium && (subscription.status === 'incomplete' || subscription.status === 'incomplete_expired' || subscription.status === 'canceled' || subscription.status === 'past_due')) {
          await stripe.subscriptions.cancel(subscription.id);
          await updateUserSubscription(user.firebaseUid, {
            stripeSubscriptionId: null,
            subscriptionStatus: null,
            subscriptionPlan: null,
          });
        }
      } catch (error) {
        // If subscription doesn't exist in Stripe, clear it from database
        console.error('Error retrieving subscription:', error);
        await updateUserSubscription(user.firebaseUid, {
          stripeSubscriptionId: null,
          subscriptionStatus: null,
          subscriptionPlan: null,
        });
      }
    }

    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.displayName || undefined,
        metadata: {
          firebaseUid: user.firebaseUid,
        },
      });
      
      customerId = customer.id;
      
      await updateUserSubscription(user.firebaseUid, {
        stripeCustomerId: customerId,
      });
    }

    // Determine base URL from request headers or environment
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;
    
    // Create a Checkout Session instead of directly creating a subscription
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${baseUrl}/my-templates?success=true`,
      cancel_url: `${baseUrl}/pricing?canceled=true`,
      metadata: {
        firebaseUid: user.firebaseUid,
        plan,
      },
      subscription_data: {
        metadata: {
          firebaseUid: user.firebaseUid,
          plan,
        },
      },
    });

    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
