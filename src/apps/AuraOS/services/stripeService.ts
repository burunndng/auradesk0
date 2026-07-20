/**
 * Stripe Service — Freemium Billing
 *
 * Client-side service that proxies billing operations through
 * Supabase Edge Functions (Phase 2 implementation).
 *
 * All functions that mutate subscription state go through
 * /functions/v1/stripe-* edge functions to keep API keys server-side.
 */

import { supabase } from './supabaseClient';

// Plan definitions
export interface StripePlan {
  id: string;              // Stripe price ID (set via env var)
  tier: 'free' | 'premium';
  name: string;
  priceMonthlyUsd: number;
  features: string[];      // Human-readable feature list for UI
}

export const STRIPE_PLANS: StripePlan[] = [
  {
    id: 'free',
    tier: 'free',
    name: 'Free',
    priceMonthlyUsd: 0,
    features: [
      '5 guided practice wizards',
      'Last 20 insights stored',
      '3 Intelligence Hub requests/month',
      'JSON data export',
      'Basic AI Coach',
      'Forum read access',
    ],
  },
  {
    id: import.meta.env.VITE_STRIPE_PREMIUM_PRICE_ID || 'price_placeholder',
    tier: 'premium',
    name: 'Premium',
    priceMonthlyUsd: 9.99,
    features: [
      'All 36+ guided practice wizards',
      'Unlimited insights',
      'Unlimited Intelligence Hub guidance',
      'Cross-modal pattern analysis',
      'Predictive alerts',
      'JSON + PDF export',
      'Full AI Coach personality',
      'Forum read + write access',
    ],
  },
];

export interface SubscriptionStatus {
  tier: 'free' | 'premium';
  status: 'active' | 'canceled' | 'past_due' | 'none';
  currentPeriodEnd: string | null;
  stripeCustomerId: string | null;
}

const FREE_DEFAULT: SubscriptionStatus = {
  tier: 'free',
  status: 'none',
  currentPeriodEnd: null,
  stripeCustomerId: null,
};

/**
 * Get current subscription status for a user.
 * Reads from Supabase user_subscriptions table (client-safe read).
 * Defaults to free tier if no row found or table doesn't exist yet.
 *
 * TODO(Phase 2): Create user_subscriptions table in Supabase and run:
 * - See STRIPE_SETUP.md for SQL schema
 */
export async function getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions' as any)
      .select('tier, status, current_period_end, stripe_customer_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('[stripeService] getSubscriptionStatus error:', error.message);
      // Table may not exist yet (Phase 2 setup)
      return FREE_DEFAULT;
    }

    if (!data) {
      return FREE_DEFAULT;
    }

    const row = data as any;
    return {
      tier: (row.tier as 'free' | 'premium') ?? 'free',
      status: (row.status as SubscriptionStatus['status']) ?? 'none',
      currentPeriodEnd: (row.current_period_end as string | null) ?? null,
      stripeCustomerId: (row.stripe_customer_id as string | null) ?? null,
    };
  } catch (err) {
    console.error('[stripeService] getSubscriptionStatus exception:', err);
    return FREE_DEFAULT;
  }
}

/**
 * Create a Stripe checkout session for upgrading to premium.
 * Calls Vercel Function: /api/stripe-checkout
 * Returns the checkout URL to redirect to.
 */
export async function createCheckoutSession(
  userId: string,
  userEmail?: string,
): Promise<string> {
  try {
    const response = await fetch('/api/stripe-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, userEmail }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create checkout session');
    }

    const data = await response.json();
    if (!data.url) {
      throw new Error('No checkout URL in response');
    }

    return data.url;
  } catch (err) {
    console.error('[stripeService] createCheckoutSession error:', err);
    throw err;
  }
}

/**
 * Open Stripe customer portal for managing subscription.
 * Calls Vercel Function: /api/stripe-portal (TODO: implement)
 * Returns the portal URL to redirect to.
 */
export async function createPortalSession(userId: string): Promise<string> {
  try {
    const response = await fetch('/api/stripe-portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create portal session');
    }

    const data = await response.json();
    if (!data.url) {
      throw new Error('No portal URL in response');
    }

    return data.url;
  } catch (err) {
    console.error('[stripeService] createPortalSession error:', err);
    throw err;
  }
}

/**
 * Cancel subscription at period end.
 * Calls Vercel Function: /api/stripe-cancel (TODO: implement)
 */
export async function cancelSubscription(userId: string): Promise<void> {
  try {
    const response = await fetch('/api/stripe-cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to cancel subscription');
    }

    console.log(`[stripeService] Subscription cancelled for user ${userId}`);
  } catch (err) {
    console.error('[stripeService] cancelSubscription error:', err);
    throw err;
  }
}
