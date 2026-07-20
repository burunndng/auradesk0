import React from 'react';
import { Check } from 'lucide-react';
import { STRIPE_PLANS } from '../../services/stripeService';

interface PricingCardProps {
  plan: typeof STRIPE_PLANS[number];
  isCurrentTier: boolean;
  onUpgrade: () => void;
  isLoading?: boolean;
}

export default function PricingCard({
  plan,
  isCurrentTier,
  onUpgrade,
  isLoading = false,
}: PricingCardProps) {
  const isFree = plan.tier === 'free';

  return (
    <div
      className={`rounded-lg border p-6 transition-all ${
        isCurrentTier
          ? 'border-amber-500/50 bg-amber-500/5'
          : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600/50'
      }`}
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-serif font-semibold text-neutral-100">
          {plan.name}
        </h3>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-3xl font-bold text-neutral-100">
            ${plan.priceMonthlyUsd}
          </span>
          <span className="text-sm text-slate-400">/month</span>
        </div>
      </div>

      {/* Features */}
      <ul className="mb-6 space-y-3">
        {plan.features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400" />
            <span className="text-sm text-slate-300">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      {isCurrentTier ? (
        <button
          disabled
          className="w-full rounded-lg bg-slate-700/50 py-2.5 text-sm font-medium text-slate-400 cursor-not-allowed"
        >
          Current Plan
        </button>
      ) : (
        <button
          onClick={onUpgrade}
          disabled={isLoading || isFree}
          className={`w-full rounded-lg py-2.5 text-sm font-medium transition-colors ${
            isFree
              ? 'bg-slate-700/30 text-slate-400 cursor-not-allowed'
              : 'bg-amber-600/20 text-amber-300 hover:bg-amber-600/30 disabled:opacity-50'
          }`}
        >
          {isLoading ? 'Loading...' : isFree ? 'Free Plan' : 'Upgrade Now'}
        </button>
      )}
    </div>
  );
}
