/**
 * ProtectedRoute - Auth Protection Wrapper
 *
 * Wraps components/features that require authentication.
 * If user is not authenticated, shows auth modal instead of content.
 *
 * Usage:
 * <ProtectedRoute>
 *   <SensitiveFeature />
 * </ProtectedRoute>
 *
 * Props:
 * - children: Content to show when authenticated
 * - fallback: Optional custom fallback UI (default: "Please sign in")
 * - requireAuth: If true, blocks access; if false, just shows modal (default: true)
 */

import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import type { ProtectedRouteProps } from '../../types';

export default function ProtectedRoute({
  children,
  fallback,
  requireAuth = true,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, setShowAuthModal } = useAuth();

  useEffect(() => {
    // Auto-show auth modal when trying to access protected content
    if (!isAuthenticated && !isLoading) {
      setShowAuthModal(true);
    }
  }, [isAuthenticated, isLoading, setShowAuthModal]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-stone-400 animate-pulse">
          Checking authentication...
        </div>
      </div>
    );
  }

  // If auth is required and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="text-amber-400 text-xl font-display mb-2">
          Authentication Required
        </div>
        <div className="text-stone-400 text-sm mb-4">
          Please sign in to access this feature
        </div>
        <button
          onClick={() => setShowAuthModal(true)}
          className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-medium rounded-md transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  // If auth is not required, just show auth modal and display content
  if (!requireAuth && !isAuthenticated) {
    // Modal is already shown via useEffect above
    return <>{children}</>;
  }

  // User is authenticated, show content
  return <>{children}</>;
}
