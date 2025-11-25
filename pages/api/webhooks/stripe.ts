import type { NextApiRequest, NextApiResponse } from 'next';
import { buffer } from 'micro';
import Stripe from 'stripe';
import { stripe } from '../../../lib/stripe';
import { updateUserSubscription } from '../../../server/storage';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    console.error('Missing stripe signature or webhook secret');
    return res.status(400).json({ error: 'Webhook configuration error' });
  }

  let event: Stripe.Event;

  try {
    const buf = await buffer(req);
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed:`, err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription & {
          current_period_end?: number;
        };
        const firebaseUid = subscription.metadata?.firebaseUid;

        if (!firebaseUid) {
          console.error('No firebaseUid in subscription metadata');
          break;
        }

        const plan = subscription.metadata?.plan || 'monthly';
        const isPremium = ['active', 'trialing'].includes(subscription.status);
        
        let subscriptionEndsAt: Date | undefined;
        if (subscription.current_period_end) {
          subscriptionEndsAt = new Date(subscription.current_period_end * 1000);
        }

        await updateUserSubscription(firebaseUid, {
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          subscriptionPlan: plan,
          subscriptionStatus: subscription.status,
          subscriptionEndsAt,
          isPremium,
        });

        console.log(`Updated subscription for user ${firebaseUid}: ${subscription.status}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription & {
          current_period_end?: number;
        };
        const firebaseUid = subscription.metadata?.firebaseUid;

        if (!firebaseUid) {
          console.error('No firebaseUid in subscription metadata');
          break;
        }

        let subscriptionEndsAt: Date | undefined;
        if (subscription.current_period_end) {
          subscriptionEndsAt = new Date(subscription.current_period_end * 1000);
        }

        await updateUserSubscription(firebaseUid, {
          subscriptionStatus: 'canceled',
          isPremium: false,
          subscriptionEndsAt,
        });

        console.log(`Subscription canceled for user ${firebaseUid}`);
        break;
      }

      case 'invoice.created': {
        const invoice = event.data.object as Stripe.Invoice & {
          subscription?: string | Stripe.Subscription | null;
        };
        
        if (invoice.status === 'draft' && invoice.subscription) {
          try {
            await stripe.invoices.update(invoice.id, {
              statement_descriptor: 'Generator',
            });
            console.log(`Updated invoice ${invoice.id} with statement descriptor "Generator"`);
          } catch (err: any) {
            console.error(`Failed to update invoice statement descriptor:`, err.message);
          }
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice & {
          subscription?: string | Stripe.Subscription;
        };
        
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          ) as Stripe.Subscription & {
            current_period_end?: number;
          };
          
          const firebaseUid = subscription.metadata?.firebaseUid;
          if (!firebaseUid) break;

          let subscriptionEndsAt: Date | undefined;
          if (subscription.current_period_end) {
            subscriptionEndsAt = new Date(subscription.current_period_end * 1000);
          }

          await updateUserSubscription(firebaseUid, {
            subscriptionStatus: subscription.status,
            isPremium: ['active', 'trialing'].includes(subscription.status),
            subscriptionEndsAt,
          });

          console.log(`Payment succeeded for user ${firebaseUid}`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice & {
          subscription?: string | Stripe.Subscription;
        };
        
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          );
          
          const firebaseUid = subscription.metadata?.firebaseUid;
          if (!firebaseUid) break;

          await updateUserSubscription(firebaseUid, {
            subscriptionStatus: 'past_due',
            isPremium: false,
          });

          console.log(`Payment failed for user ${firebaseUid}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}
