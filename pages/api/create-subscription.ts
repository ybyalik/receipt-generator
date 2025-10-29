import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
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

        // Only return existing subscription if it's actually active/trialing AND user is premium
        if (user.isPremium && (subscription.status === 'active' || subscription.status === 'trialing')) {
          const expandedSubscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId, {
            expand: ['latest_invoice.payment_intent'],
          });
          
          const latestInvoice = expandedSubscription.latest_invoice as Stripe.Invoice & {
            payment_intent?: Stripe.PaymentIntent;
          };
          const paymentIntent = latestInvoice.payment_intent;
          
          return res.status(200).json({
            subscriptionId: expandedSubscription.id,
            clientSecret: paymentIntent?.client_secret,
          });
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

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        firebaseUid: user.firebaseUid,
        plan,
      },
    });

    await updateUserSubscription(user.firebaseUid, {
      stripeSubscriptionId: subscription.id,
      subscriptionPlan: plan,
      subscriptionStatus: subscription.status,
    });

    const latestInvoice = subscription.latest_invoice as Stripe.Invoice & {
      payment_intent?: Stripe.PaymentIntent;
    };
    const paymentIntent = latestInvoice.payment_intent;

    if (!paymentIntent?.client_secret) {
      console.error('No client secret found for subscription:', subscription.id);
      return res.status(500).json({ error: 'Failed to get payment client secret' });
    }

    return res.status(200).json({
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
