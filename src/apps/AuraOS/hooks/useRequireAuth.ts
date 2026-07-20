/**
 * useRequireAuth - Automatically show auth modal if not authenticated
 *
 * Use this hook in components that require authentication to function.
 * If the user is not authenticated, the auth modal will be shown automatically.
 *
 * Usage:
 * function MyProtectedComponent() {
 *   const { user } = useRequireAuth();
 *
 *   if (!user) {
 *     return <div>Please sign in...</div>;
 *   }
 *
 *   return <div>Welcome {user.email}</div>;
 * }
 */

import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function useRequireAuth() {
  const auth = useAuth();
  const { isAuthenticated, setShowAuthModal } = auth;

  useEffect(() => {
    if (!isAuthenticated) {
      // Automatically show auth modal if not authenticated
      setShowAuthModal(true);
    }
  }, [isAuthenticated, setShowAuthModal]);

  return auth;
}

export default useRequireAuth;
