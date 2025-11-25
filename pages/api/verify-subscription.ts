import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { stripe } from '../../lib/stripe';
import { getUserByFirebaseUid, updateUserSubscription } from '../../server/storage';

type SubscriptionWithPeriod = Stripe.Subscription & {
  current_period_end?: number;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { firebaseUid } = req.body;

    if (!firebaseUid) {
      return res.status(400).json({ error: 'Missing firebaseUid' });
    }

    const user = await getUserByFirebaseUid(firebaseUid);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.stripeCustomerId) {
      return res.status(200).json({ 
        isPremium: false, 
        message: 'No Stripe customer found' 
      });
    }

    // Fetch all subscriptions for this customer from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length > 0) {
      const subscription = subscriptions.data[0] as SubscriptionWithPeriod;
      const plan = subscription.metadata?.plan || 'monthly';
      
      let subscriptionEndsAt: Date | undefined;
      if (subscription.current_period_end) {
        subscriptionEndsAt = new Date(subscription.current_period_end * 1000);
      }

      // Update user subscription status
      await updateUserSubscription(user.firebaseUid, {
        stripeSubscriptionId: subscription.id,
        subscriptionPlan: plan,
        subscriptionStatus: subscription.status,
        subscriptionEndsAt,
        isPremium: true,
      });

      console.log(`Verified and updated subscription for user ${firebaseUid}: ${subscription.status}`);

      return res.status(200).json({
        isPremium: true,
        subscriptionStatus: subscription.status,
        subscriptionPlan: plan,
        subscriptionEndsAt: subscriptionEndsAt?.toISOString(),
      });
    }

    // Also check for trialing subscriptions
    const trialingSubscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: 'trialing',
      limit: 1,
    });

    if (trialingSubscriptions.data.length > 0) {
      const subscription = trialingSubscriptions.data[0] as SubscriptionWithPeriod;
      const plan = subscription.metadata?.plan || 'monthly';
      
      let subscriptionEndsAt: Date | undefined;
      if (subscription.current_period_end) {
        subscriptionEndsAt = new Date(subscription.current_period_end * 1000);
      }

      await updateUserSubscription(user.firebaseUid, {
        stripeSubscriptionId: subscription.id,
        subscriptionPlan: plan,
        subscriptionStatus: subscription.status,
        subscriptionEndsAt,
        isPremium: true,
      });

      console.log(`Verified and updated trialing subscription for user ${firebaseUid}`);

      return res.status(200).json({
        isPremium: true,
        subscriptionStatus: subscription.status,
        subscriptionPlan: plan,
        subscriptionEndsAt: subscriptionEndsAt?.toISOString(),
      });
    }

    return res.status(200).json({
      isPremium: false,
      message: 'No active subscription found',
    });
  } catch (error: any) {
    console.error('Error verifying subscription:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
