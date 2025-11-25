import type { NextApiRequest, NextApiResponse } from 'next';
import { buffer } from 'micro';
import Stripe from 'stripe';
import { stripe } from '../../../lib/stripe';
import { updateUserSubscription, getUserByStripeCustomerId } from '../../../server/storage';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = 'contact@receiptgenerator.net';

function generateReceiptEmail(data: {
  customerName: string;
  customerEmail: string;
  plan: string;
  amount: number;
  currency: string;
  invoiceNumber: string;
  invoiceDate: string;
  nextBillingDate: string;
  invoiceUrl?: string;
}) {
  const planDisplayName = data.plan.charAt(0).toUpperCase() + data.plan.slice(1);
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: data.currency.toUpperCase(),
  }).format(data.amount / 100);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Receipt - Receipt Generator</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Receipt Generator</h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Payment Receipt</p>
            </td>
          </tr>
          
          <!-- Success Icon -->
          <tr>
            <td style="padding: 30px 40px 20px; text-align: center;">
              <div style="display: inline-block; width: 60px; height: 60px; background-color: #10b981; border-radius: 50%; line-height: 60px;">
                <span style="color: #ffffff; font-size: 28px;">&#10003;</span>
              </div>
              <h2 style="margin: 20px 0 10px; color: #1e3a5f; font-size: 22px;">Payment Successful</h2>
              <p style="margin: 0; color: #64748b; font-size: 15px;">Thank you for your subscription!</p>
            </td>
          </tr>
          
          <!-- Receipt Details -->
          <tr>
            <td style="padding: 20px 40px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8fafc; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Invoice Number</td>
                        <td style="padding: 8px 0; color: #1e3a5f; font-size: 14px; text-align: right; font-weight: 600;">${data.invoiceNumber}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Date</td>
                        <td style="padding: 8px 0; color: #1e3a5f; font-size: 14px; text-align: right;">${data.invoiceDate}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Customer</td>
                        <td style="padding: 8px 0; color: #1e3a5f; font-size: 14px; text-align: right;">${data.customerName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Email</td>
                        <td style="padding: 8px 0; color: #1e3a5f; font-size: 14px; text-align: right;">${data.customerEmail}</td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding: 15px 0 8px;">
                          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 0;">
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Plan</td>
                        <td style="padding: 8px 0; color: #1e3a5f; font-size: 14px; text-align: right;">Premium ${planDisplayName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Next Billing Date</td>
                        <td style="padding: 8px 0; color: #1e3a5f; font-size: 14px; text-align: right;">${data.nextBillingDate}</td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding: 15px 0 8px;">
                          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 0;">
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; color: #1e3a5f; font-size: 16px; font-weight: 700;">Total Paid</td>
                        <td style="padding: 12px 0; color: #10b981; font-size: 20px; text-align: right; font-weight: 700;">${formattedAmount}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          ${data.invoiceUrl ? `
          <!-- View Invoice Button -->
          <tr>
            <td style="padding: 10px 40px 30px; text-align: center;">
              <a href="${data.invoiceUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; border-radius: 8px;">View Invoice</a>
            </td>
          </tr>
          ` : ''}
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; text-align: center; background-color: #f8fafc; border-radius: 0 0 12px 12px;">
              <p style="margin: 0 0 10px; color: #64748b; font-size: 14px;">
                Questions? Contact us at <a href="mailto:contact@receiptgenerator.net" style="color: #2d5a87; text-decoration: none;">contact@receiptgenerator.net</a>
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                &copy; ${new Date().getFullYear()} Receipt Generator. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

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
          cancel_at_period_end?: boolean;
          canceled_at?: number | null;
        };
        
        // Try to get firebaseUid from metadata, fallback to finding user by customer ID
        let firebaseUid = subscription.metadata?.firebaseUid;
        
        if (!firebaseUid) {
          const customerId = subscription.customer as string;
          const user = await getUserByStripeCustomerId(customerId);
          if (user) {
            firebaseUid = user.firebaseUid;
            console.log(`Found user by stripeCustomerId: ${customerId} -> ${firebaseUid}`);
          } else {
            console.error('No firebaseUid in metadata and no user found by stripeCustomerId');
            break;
          }
        }

        const plan = subscription.metadata?.plan || 'monthly';
        
        // Check if subscription is being canceled at period end
        const isCanceledAtPeriodEnd = subscription.cancel_at_period_end === true;
        const isActive = ['active', 'trialing'].includes(subscription.status);
        
        // User keeps premium until period ends, even if they canceled
        const isPremium = isActive;
        
        // Determine the correct status to display
        // Use 'canceled' status when user has scheduled cancellation, but keep isPremium true
        let displayStatus: string = subscription.status;
        if (isCanceledAtPeriodEnd && isActive) {
          displayStatus = 'canceled'; // Show as canceled, but isPremium stays true until period ends
        }
        
        let subscriptionEndsAt: Date | undefined;
        if (subscription.current_period_end) {
          subscriptionEndsAt = new Date(subscription.current_period_end * 1000);
        }

        await updateUserSubscription(firebaseUid, {
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          subscriptionPlan: plan,
          subscriptionStatus: displayStatus,
          subscriptionEndsAt,
          isPremium,
        });

        console.log(`Updated subscription for user ${firebaseUid}: ${displayStatus} (cancel_at_period_end: ${isCanceledAtPeriodEnd})`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription & {
          current_period_end?: number;
        };
        
        // Try to get firebaseUid from metadata, fallback to finding user by customer ID
        let firebaseUid = subscription.metadata?.firebaseUid;
        
        if (!firebaseUid) {
          const customerId = subscription.customer as string;
          const user = await getUserByStripeCustomerId(customerId);
          if (user) {
            firebaseUid = user.firebaseUid;
            console.log(`Found user by stripeCustomerId for deletion: ${customerId} -> ${firebaseUid}`);
          } else {
            console.error('No firebaseUid in metadata and no user found by stripeCustomerId for deletion');
            break;
          }
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

        console.log(`Subscription fully canceled for user ${firebaseUid}`);
        break;
      }

      case 'invoice.created': {
        const invoice = event.data.object as Stripe.Invoice & {
          subscription?: string | Stripe.Subscription | null;
        };
        
        if (invoice.status === 'draft' && invoice.subscription) {
          try {
            // Set statement descriptor on invoice (works for non-card payments)
            await stripe.invoices.update(invoice.id, {
              statement_descriptor: 'GENERATOR',
            });
            console.log(`Updated invoice ${invoice.id} with statement descriptor`);
          } catch (err: any) {
            console.error(`Failed to update invoice statement descriptor:`, err.message);
          }
        }
        break;
      }

      case 'payment_intent.created': {
        // For card payments, must use statement_descriptor_suffix (2024 requirement)
        const paymentIntent = event.data.object as Stripe.PaymentIntent & {
          invoice?: string | null;
        };
        
        // Only update if it's from a subscription invoice
        if (paymentIntent.invoice) {
          try {
            await stripe.paymentIntents.update(paymentIntent.id, {
              statement_descriptor_suffix: 'GENERATOR',
            });
            console.log(`Updated payment intent ${paymentIntent.id} with suffix "GENERATOR"`);
          } catch (err: any) {
            console.error(`Failed to update payment intent descriptor:`, err.message);
          }
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice & {
          subscription?: string | Stripe.Subscription;
          customer_email?: string | null;
          customer_name?: string | null;
          amount_paid?: number;
          currency?: string;
          number?: string | null;
          hosted_invoice_url?: string | null;
          created?: number;
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

          // Send receipt emails
          const customerEmail = invoice.customer_email;
          const customerName = invoice.customer_name || 'Valued Customer';
          const plan = subscription.metadata?.plan || 'monthly';
          const amount = invoice.amount_paid || 0;
          const currency = invoice.currency || 'usd';
          const invoiceNumber = invoice.number || `INV-${Date.now()}`;
          const invoiceDate = invoice.created 
            ? new Date(invoice.created * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
          const nextBillingDate = subscriptionEndsAt
            ? subscriptionEndsAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            : 'N/A';

          if (customerEmail && process.env.RESEND_API_KEY) {
            const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@receiptgenerator.net';
            const receiptHtml = generateReceiptEmail({
              customerName,
              customerEmail,
              plan,
              amount,
              currency,
              invoiceNumber,
              invoiceDate,
              nextBillingDate,
              invoiceUrl: invoice.hosted_invoice_url || undefined,
            });

            try {
              // Send receipt to customer
              await resend.emails.send({
                from: fromEmail,
                to: customerEmail,
                subject: `Payment Receipt - Receipt Generator Premium ${plan.charAt(0).toUpperCase() + plan.slice(1)}`,
                html: receiptHtml,
              });
              console.log(`Receipt email sent to customer: ${customerEmail}`);

              // Send copy to admin
              await resend.emails.send({
                from: fromEmail,
                to: ADMIN_EMAIL,
                subject: `[Copy] Payment Receipt - ${customerName} (${customerEmail})`,
                html: receiptHtml,
              });
              console.log(`Receipt copy sent to admin: ${ADMIN_EMAIL}`);
            } catch (emailError: any) {
              console.error('Failed to send receipt email:', emailError.message);
            }
          }
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
