/**
 * AuthContext - Authentication State Management
 *
 * Provides authentication state and actions across the app.
 * This context sits at the TOP of the provider hierarchy (above UserContext).
 *
 * Features:
 * - Real-time auth state sync with Supabase
 * - Automatic session refresh
 * - Auth modal control (show/hide)
 * - User profile management
 * - Error handling with user-friendly messages
 *
 * Provider Hierarchy:
 * AuthProvider (this)
 *   └── NavigationProvider
 *       └── PracticeProvider
 *           └── UserProvider (will consume auth.user.id)
 *               └── InsightsProvider
 *                   └── AIProvider
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService from '../services/authService';
import { supabase } from '../services/supabaseClient';
import type {
  AuthContextValue,
  AuthUser,
  AuthSession,
  AuthResult,
  UserProfile
} from '../types';

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ============================================================================
// AUTH PROVIDER COMPONENT
// ============================================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  // State
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Start false for progressive auth
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Derived state - user presence is sufficient; session is managed internally by Supabase SDK
  // Using !!user && !!session causes a race on mobile where session resolves async after user
  const isAuthenticated = !!user;

  // ============================================================================
  // INITIAL AUTH CHECK
  // ============================================================================

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        if (import.meta.env.DEV) console.log('[AuthContext] Initializing auth...');

        // Get current session
        const currentSession = await authService.getSession();
        const currentUser = await authService.getCurrentUser();

        if (mounted) {
          setSession(currentSession);
          setIsLoading(false);

          if (currentUser) {
            // Fetch is_admin for initial load
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('is_admin')
              .eq('id', currentUser.id)
              .maybeSingle();
            const updatedUser = { ...currentUser, isAdmin: (profile as { is_admin?: boolean })?.is_admin === true };
            setUser(updatedUser);
            if (import.meta.env.DEV) console.log('[AuthContext] User authenticated:', currentUser.email);
          } else {
            setUser(null);
            if (import.meta.env.DEV) console.log('[AuthContext] No authenticated user');
          }
        }
      } catch (err) {
        console.error('[AuthContext] Initialize error:', err);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  // ============================================================================
  // AUTH STATE CHANGE LISTENER
  // ============================================================================

  useEffect(() => {
    if (import.meta.env.DEV) console.log('[AuthContext] Setting up auth state listener');

    const unsubscribe = authService.onAuthStateChange(async (authUser) => {
      if (import.meta.env.DEV) console.log('[AuthContext] Auth state changed:', authUser?.email || 'signed out');

      if (authUser) {
        // Fetch is_admin flag
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('is_admin')
          .eq('id', authUser.id)
          .maybeSingle();
        authUser = { ...authUser, isAdmin: (profile as { is_admin?: boolean })?.is_admin === true };
      }

      setUser(authUser);

      // Seed user_profiles.preferences.display_name so forum author names resolve
      if (authUser) {
        authService.ensureUserProfile(
          authUser.id,
          { display_name: authUser.displayName },
          authUser.email
        );
      }

      // Fetch fresh session when user changes
      if (authUser) {
        authService.getSession().then((freshSession) => {
          setSession(freshSession);
        });
      } else {
        setSession(null);
      }
    });

    return () => {
      if (import.meta.env.DEV) console.log('[AuthContext] Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  // ============================================================================
  // AUTH ACTIONS
  // ============================================================================

  const signUp = async (
    email: string,
    password: string,
    displayName?: string
  ): Promise<AuthResult> => {
    try {
      const result = await authService.signUp(email, password, displayName);

      if (result.success && result.user) {
        setUser(result.user);
        if (result.session) {
          setSession(result.session);
        }
      }

      return result;
    } catch (err: any) {
      console.error('[AuthContext] Sign up error:', err);
      return {
        success: false,
        error: err.message || 'An unexpected error occurred',
      };
    }
  };

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const result = await authService.signIn(email, password);

      if (result.success && result.user) {
        setUser(result.user);
        if (result.session) {
          setSession(result.session);
        }
      }

      return result;
    } catch (err: any) {
      console.error('[AuthContext] Sign in error:', err);
      return {
        success: false,
        error: err.message || 'An unexpected error occurred',
      };
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await authService.signOut();
      setUser(null);
      setSession(null);
    } catch (err) {
      console.error('[AuthContext] Sign out error:', err);
      throw err;
    }
  };

  const resetPassword = async (email: string): Promise<AuthResult> => {
    try {
      return await authService.resetPassword(email);
    } catch (err: any) {
      console.error('[AuthContext] Reset password error:', err);
      return {
        success: false,
        error: err.message || 'An unexpected error occurred',
      };
    }
  };

  const updatePassword = async (newPassword: string): Promise<AuthResult> => {
    try {
      return await authService.updatePassword(newPassword);
    } catch (err: any) {
      console.error('[AuthContext] Update password error:', err);
      return {
        success: false,
        error: err.message || 'An unexpected error occurred',
      };
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<AuthResult> => {
    try {
      const result = await authService.updateProfile(updates);

      if (result.success && result.user) {
        setUser(result.user);
      }

      return result;
    } catch (err: any) {
      console.error('[AuthContext] Update profile error:', err);
      return {
        success: false,
        error: err.message || 'An unexpected error occurred',
      };
    }
  };

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: AuthContextValue = {
    // State
    user,
    session,
    isAuthenticated,
    isLoading,
    showAuthModal,

    // Actions
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    setShowAuthModal,
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  // Progressive auth: Don't block app loading
  // Auth check happens in background, app works unauthenticated by default
  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

// ============================================================================
// CUSTOM HOOK
// ============================================================================

/**
 * useAuth - Access authentication state and actions
 *
 * Usage:
 * const { user, isAuthenticated, signIn, signOut, setShowAuthModal } = useAuth();
 *
 * if (!isAuthenticated) {
 *   setShowAuthModal(true);
 *   return;
 * }
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export default AuthContext;
