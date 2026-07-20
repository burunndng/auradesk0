import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscriptionContext } from '../contexts/SubscriptionContext';
import { useToast } from '../components/shared/ToastContext';

/**
 * Hook to manage upgrade flow
 * - Shows auth modal if user is not logged in
 * - Shows upgrade modal if user is logged in but not premium
 * - Prevents free users from accessing premium features
 */
export function useUpgradeFlow() {
  const { user, setShowAuthModal } = useAuth();
  const { isPremium, showUpgradeModal } = useSubscriptionContext();
  const { addToast } = useToast();

  const requirePremium = useCallback(
    (featureName: string): boolean => {
      if (!user?.id) {
        addToast('Please sign in to access this feature', 'info');
        setShowAuthModal(true);
        return false;
      }

      if (!isPremium) {
        addToast(`${featureName} is a premium feature`, 'info');
        showUpgradeModal();
        return false;
      }

      return true;
    },
    [user?.id, isPremium, setShowAuthModal, showUpgradeModal, addToast]
  );

  return { requirePremium, isPremium, isAuthenticated: !!user?.id };
}
