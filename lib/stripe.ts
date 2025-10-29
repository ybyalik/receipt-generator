import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover',
});

export const STRIPE_PRICE_IDS = {
  weekly: process.env.STRIPE_PRICE_ID_WEEKLY || '',
  monthly: process.env.STRIPE_PRICE_ID_MONTHLY || '',
  yearly: process.env.STRIPE_PRICE_ID_YEARLY || '',
};

export type PricingPlan = 'weekly' | 'monthly' | 'yearly';
