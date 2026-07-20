import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useSubscriptionContext } from '../contexts/SubscriptionContext';

export default function CheckoutReturn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isPremium } = useSubscriptionContext();
  const [isChecking, setIsChecking] = useState(true);

  const upgradeParam = searchParams.get('upgrade');

  useEffect(() => {
    // Wait a bit for subscription data to sync, then check status
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-amber-500 border-opacity-75 mx-auto mb-4"></div>
          <p className="text-slate-400">Verifying your subscription...</p>
        </div>
      </div>
    );
  }

  const isSuccess = upgradeParam === 'success' && isPremium;
  const isCancelled = upgradeParam === 'cancelled';

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-950 px-4">
      <div className="max-w-md w-full">
        {isSuccess ? (
          <div className="rounded-lg border border-emerald-500/50 bg-emerald-500/5 p-8 text-center">
            <CheckCircle className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
            <h1 className="text-2xl font-serif font-semibold text-neutral-100 mb-2">
              Welcome to Premium!
            </h1>
            <p className="text-slate-400 mb-6">
              Your upgrade was successful. You now have access to all premium features.
            </p>
            <button
              onClick={() => navigate('/')}
              className="w-full rounded-lg bg-emerald-600/20 px-4 py-2.5 text-sm font-medium text-emerald-300 hover:bg-emerald-600/30 transition-colors"
            >
              Back to Aura
            </button>
          </div>
        ) : isCancelled ? (
          <div className="rounded-lg border border-amber-500/50 bg-amber-500/5 p-8 text-center">
            <AlertCircle className="h-16 w-16 text-amber-400 mx-auto mb-4" />
            <h1 className="text-2xl font-serif font-semibold text-neutral-100 mb-2">
              Checkout Cancelled
            </h1>
            <p className="text-slate-400 mb-6">
              No charges were made. Feel free to try again whenever you're ready.
            </p>
            <button
              onClick={() => navigate('/')}
              className="w-full rounded-lg bg-amber-600/20 px-4 py-2.5 text-sm font-medium text-amber-300 hover:bg-amber-600/30 transition-colors"
            >
              Back to Aura
            </button>
          </div>
        ) : (
          <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-8 text-center">
            <AlertCircle className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h1 className="text-2xl font-serif font-semibold text-neutral-100 mb-2">
              Unexpected Return
            </h1>
            <p className="text-slate-400 mb-6">
              Something went wrong. Please check your subscription status.
            </p>
            <button
              onClick={() => navigate('/')}
              className="w-full rounded-lg bg-slate-700/30 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-700/50 transition-colors"
            >
              Back to Aura
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
