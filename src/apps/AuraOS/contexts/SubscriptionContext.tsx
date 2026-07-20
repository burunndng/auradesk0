import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Tier } from '../config/freemiumConfig';
import { supabase } from '../services/supabaseClient';

interface SubscriptionContextValue {
  showUpgradeModal: () => void;
  hideUpgradeModal: () => void;
  isUpgradeModalOpen: boolean;
  isPremium: boolean;
  isTrialing: boolean;
  tier: Tier;
  remainingWizardSessions: number;
  remainingCoachMessages: number;
  isLoading: boolean;
  currentPeriodEnd: string | null;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

// Default values - always free until user authenticates
const DEFAULT_VALUE: SubscriptionContextValue = {
  showUpgradeModal: () => {},
  hideUpgradeModal: () => {},
  isUpgradeModalOpen: false,
  isPremium: false,
  isTrialing: false,
  tier: 'free',
  remainingWizardSessions: 10,
  remainingCoachMessages: 10,
  isLoading: false,
  currentPeriodEnd: null,
};

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [tier, setTier] = useState<Tier>('free');
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string } | null>(null);

  // Listen for auth changes (avoid circular dependency with useAuth)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user?.id) {
          setUser({ id: data.session.user.id });
        }
      } catch (err) {
        console.error('[SubscriptionContext] Auth check failed:', err);
      }
    };

    checkAuth();

    // Also listen for auth state changes
    const timer = setInterval(checkAuth, 5000); // Recheck every 5 seconds as fallback
    return () => clearInterval(timer);
  }, []);

  // Load subscription data when user changes
  useEffect(() => {
    const loadSubscriptionData = async () => {
      if (!user?.id) {
        setTier('free');
        setIsPremium(false);
        setCurrentPeriodEnd(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const { getSubscriptionStatus } = await import('../services/stripeService');
        const status = await getSubscriptionStatus(user.id);
        setTier(status.tier as Tier);
        setIsPremium(status.tier === 'premium' && status.status === 'active');
        setCurrentPeriodEnd(status.currentPeriodEnd);
      } catch (err) {
        console.error('[SubscriptionContext] Failed to load subscription:', err);
        // Gracefully degrade to free tier on error
        setTier('free');
        setIsPremium(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadSubscriptionData();
  }, [user?.id]);

  const showUpgradeModal = useCallback(() => setIsUpgradeModalOpen(true), []);
  const hideUpgradeModal = useCallback(() => setIsUpgradeModalOpen(false), []);

  // Placeholder values - can be implemented per-wizard
  const remainingWizardSessions = isPremium ? Infinity : 10;
  const remainingCoachMessages = isPremium ? Infinity : 10;
  const isTrialing = false; // TODO: implement trial tracking if needed

  return (
    <SubscriptionContext.Provider value={{
      showUpgradeModal, hideUpgradeModal, isUpgradeModalOpen,
      isPremium, isTrialing, tier, remainingWizardSessions, remainingCoachMessages,
      isLoading, currentPeriodEnd
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscriptionContext() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) {
    console.warn('[useSubscriptionContext] Used outside SubscriptionProvider, returning defaults');
    return DEFAULT_VALUE;
  }
  return ctx;
}
