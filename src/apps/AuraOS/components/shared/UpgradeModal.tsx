import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscriptionContext } from '../../contexts/SubscriptionContext';
import { createCheckoutSession, STRIPE_PLANS } from '../../services/stripeService';
import PricingCard from './PricingCard';
import { useToast } from './ToastContext';

export default function UpgradeModal() {
  const { user } = useAuth();
  const { tier, isLoading, isUpgradeModalOpen, hideUpgradeModal } = useSubscriptionContext();
  const { addToast } = useToast();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  if (!isUpgradeModalOpen) return null;

  const handleUpgrade = async () => {
    if (!user?.id || !user?.email) {
      addToast('Please sign in to upgrade', 'error');
      return;
    }

    setCheckoutLoading(true);
    try {
      // Get the Premium plan
      const premiumPlan = STRIPE_PLANS.find((p) => p.tier === 'premium');
      if (!premiumPlan) {
        throw new Error('Premium plan not found');
      }

      const checkoutUrl = await createCheckoutSession(user.id, user.email);
      window.location.href = checkoutUrl;
    } catch (err: any) {
      console.error('Checkout error:', err);
      addToast(
        err.message || 'Failed to initiate checkout. Please try again.',
        'error'
      );
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4 rounded-lg border border-slate-700/50 bg-slate-900 p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={hideUpgradeModal}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-800/50 transition-colors text-slate-400 hover:text-slate-300"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-serif font-semibold text-neutral-100">
            Choose Your Plan
          </h2>
          <p className="mt-2 text-slate-400">
            Unlock the full potential of Aura with premium access
          </p>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-slate-400">Loading subscription info...</div>
          </div>
        ) : (
          <>
            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {STRIPE_PLANS.map((plan) => (
                <PricingCard
                  key={plan.id}
                  plan={plan}
                  isCurrentTier={plan.tier === tier}
                  onUpgrade={handleUpgrade}
                  isLoading={checkoutLoading}
                />
              ))}
            </div>

            {/* Info Text */}
            <div className="border-t border-slate-700/50 pt-6 text-center">
              <p className="text-sm text-slate-400">
                🔒 Secure checkout powered by Stripe. Cancel anytime.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
