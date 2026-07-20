/**
 * Authentication Service
 *
 * Wraps Supabase Auth APIs with clean, type-safe interface for:
 * - User registration (sign up)
 * - User login (sign in)
 * - Session management
 * - Password reset
 * - Profile updates
 * - Auth state change listeners
 *
 * Architecture:
 * - Uses Supabase Auth for session management (automatic refresh)
 * - Sessions stored in localStorage automatically by Supabase SDK
 * - RLS policies enforce data isolation by user
 * - Progressive auth: browse anonymously, auth required for saving
 */

import { supabase } from './supabaseClient';
import type {
  AuthResult,
  AuthUser,
  AuthSession,
  UserProfile,
  UserPreferences
} from '../types';
import type { User, Session } from '@supabase/supabase-js';

// ============================================================================
// HELPER: Convert Supabase User → AuthUser
// ============================================================================

const convertToAuthUser = (supabaseUser: User | null): AuthUser | null => {
  if (!supabaseUser) return null;

  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    displayName: supabaseUser.user_metadata?.display_name || null,
    avatarUrl: supabaseUser.user_metadata?.avatar_url || null,
  };
};

// ============================================================================
// HELPER: Convert Supabase Session → AuthSession
// ============================================================================

const convertToAuthSession = (supabaseSession: Session | null): AuthSession | null => {
  if (!supabaseSession || !supabaseSession.user) return null;

  return {
    access_token: supabaseSession.access_token,
    refresh_token: supabaseSession.refresh_token,
    expires_in: supabaseSession.expires_in || 3600,
    expires_at: supabaseSession.expires_at,
    token_type: supabaseSession.token_type || 'bearer',
    user: convertToAuthUser(supabaseSession.user)!,
  };
};

// ============================================================================
// AUTHENTICATION OPERATIONS
// ============================================================================

/**
 * Sign up a new user
 *
 * @param email - User email
 * @param password - User password (min 6 characters)
 * @param displayName - Optional display name
 * @returns AuthResult with user and session
 *
 * Note: User profile is auto-created via database trigger (handle_new_user)
 */
export const signUp = async (
  email: string,
  password: string,
  displayName?: string
): Promise<AuthResult> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName || email.split('@')[0], // Default to email prefix
        },
        emailRedirectTo: window.location.origin, // Redirect to home, AuthCallback handles hash
      },
    });

    if (error) {
      console.error('Sign up error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: 'Sign up succeeded but no user returned',
      };
    }

    // Check if email confirmation is required
    const needsConfirmation = !data.session;

    return {
      success: true,
      user: convertToAuthUser(data.user) || undefined,
      session: convertToAuthSession(data.session) || undefined,
      error: needsConfirmation
        ? 'Please check your email to confirm your account'
        : undefined,
    };
  } catch (err: any) {
    console.error('Unexpected sign up error:', err);
    return {
      success: false,
      error: err.message || 'An unexpected error occurred',
    };
  }
};

/**
 * Sign in an existing user
 *
 * @param email - User email
 * @param password - User password
 * @returns AuthResult with user and session
 */
export const signIn = async (
  email: string,
  password: string
): Promise<AuthResult> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    if (!data.user || !data.session) {
      return {
        success: false,
        error: 'Sign in succeeded but no session returned',
      };
    }

    return {
      success: true,
      user: convertToAuthUser(data.user) || undefined,
      session: convertToAuthSession(data.session) || undefined,
    };
  } catch (err: any) {
    console.error('Unexpected sign in error:', err);
    return {
      success: false,
      error: err.message || 'An unexpected error occurred',
    };
  }
};

/**
 * Sign out the current user
 * Clears session and revokes tokens
 */
export const signOut = async (): Promise<AuthResult> => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Sign out error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (err: any) {
    console.error('Unexpected sign out error:', err);
    return {
      success: false,
      error: err.message || 'An unexpected error occurred',
    };
  }
};

/**
 * Get the current authenticated user
 * Returns null if not authenticated
 */
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      if (error.name !== 'AuthSessionMissingError') {
        console.error('Get user error:', error);
      }
      return null;
    }

    return convertToAuthUser(data.user);
  } catch (err) {
    console.error('Unexpected get user error:', err);
    return null;
  }
};

/**
 * Get the current session
 * Returns null if no active session
 */
export const getSession = async (): Promise<AuthSession | null> => {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Get session error:', error);
      return null;
    }

    return convertToAuthSession(data.session);
  } catch (err) {
    console.error('Unexpected get session error:', err);
    return null;
  }
};

/**
 * Send password reset email
 *
 * @param email - User email
 * @returns AuthResult indicating success/failure
 */
export const resetPassword = async (email: string): Promise<AuthResult> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin, // Redirect to home, AuthCallback handles hash
    });

    if (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (err: any) {
    console.error('Unexpected reset password error:', err);
    return {
      success: false,
      error: err.message || 'An unexpected error occurred',
    };
  }
};

/**
 * Update the current user's password
 * User must be authenticated
 *
 * @param newPassword - New password (min 6 characters)
 * @returns AuthResult indicating success/failure
 */
export const updatePassword = async (newPassword: string): Promise<AuthResult> => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error('Update password error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (err: any) {
    console.error('Unexpected update password error:', err);
    return {
      success: false,
      error: err.message || 'An unexpected error occurred',
    };
  }
};

/**
 * Update the current user's profile
 * Updates both auth.users metadata AND user_profiles table
 *
 * @param updates - Partial profile updates
 * @returns AuthResult indicating success/failure
 */
export const updateProfile = async (
  updates: Partial<UserProfile>
): Promise<AuthResult> => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) {
      if (userError.name !== 'AuthSessionMissingError') {
        console.error('Get user error:', userError);
      }
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    if (!userData.user) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    const userId = userData.user.id;

    // Update auth.users metadata (for display_name, avatar_url)
    if (updates.display_name || updates.avatar_url) {
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          display_name: updates.display_name,
          avatar_url: updates.avatar_url,
        },
      });

      if (metadataError) {
        console.error('Update user metadata error:', metadataError);
        return {
          success: false,
          error: metadataError.message,
        };
      }
    }

    // Update user_profiles table
    const profileUpdates: any = {};
    if (updates.display_name !== undefined) profileUpdates.display_name = updates.display_name;
    if (updates.avatar_url !== undefined) profileUpdates.avatar_url = updates.avatar_url;
    if (updates.bio !== undefined) profileUpdates.bio = updates.bio;

    if (Object.keys(profileUpdates).length > 0) {
      const { error: profileError } = await (supabase as any)
        .from('user_profiles')
        .update(profileUpdates)
        .eq('id', userId);

      if (profileError) {
        console.error('Update profile error:', profileError);
        return {
          success: false,
          error: profileError.message,
        };
      }
    }

    // Get updated user
    const updatedUser = await getCurrentUser();

    return {
      success: true,
      user: updatedUser || undefined,
    };
  } catch (err: any) {
    console.error('Unexpected update profile error:', err);
    return {
      success: false,
      error: err.message || 'An unexpected error occurred',
    };
  }
};

/**
 * Ensure user_profiles row exists with display_name seeded from auth user_metadata.
 * Fire-and-forget on login so forum author names always resolve.
 */
export const ensureUserProfile = async (userId: string, userMetadata: Record<string, any>, email?: string): Promise<void> => {
  try {
    const displayName = userMetadata?.display_name || email?.split('@')[0] || 'User';
    const baseUsername = (userMetadata?.username || email?.split('@')[0] || userId.slice(0, 8)).replace(/[^a-z0-9_]/gi, '_').toLowerCase();
    const username = userMetadata?.username ? baseUsername : `${baseUsername}_${userId.slice(0, 6)}`;
    const upsertData: Record<string, any> = {
      id: userId,
      display_name: displayName,
      username,
      preferences: { display_name: displayName },
    };
    if (email) upsertData.email = email;
    const { error } = await (supabase as any)
      .from('user_profiles')
      .upsert(upsertData, { onConflict: 'id', ignoreDuplicates: false });
    if (error) {
      console.warn('[ensureUserProfile] upsert failed:', error.message, error.details);
    }
  } catch (err) {
    console.warn('[ensureUserProfile] unexpected error:', err);
  }
};

/**
 * Get the current user's profile from user_profiles table
 *
 * @returns UserProfile or null if not found
 */
export const getUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) {
      if (userError.name !== 'AuthSessionMissingError') {
        console.error('Get user error:', userError);
      }
      return null;
    }

    if (!userData.user) {
      return null;
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userData.user.id)
      .single();

    if (error) {
      console.error('Get profile error:', error);
      return null;
    }

    return data as UserProfile;
  } catch (err) {
    console.error('Unexpected get profile error:', err);
    return null;
  }
};

/**
 * Update user preferences by merging partial updates into existing preferences JSONB
 *
 * @param updates - Partial UserPreferences to merge into existing preferences
 */
export const updatePreferences = async (updates: Partial<UserPreferences>): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return { success: false, error: 'Not authenticated' };
    }

    const userId = userData.user.id;

    // Fetch current preferences to merge
    const { data: profileData, error: fetchError } = await supabase
      .from('user_profiles')
      .select('preferences')
      .eq('id', userId)
      .single();

    if (fetchError) {
      return { success: false, error: fetchError.message };
    }

    const currentPrefs = (profileData as any)?.preferences || {};
    const mergedPrefs = { ...currentPrefs, ...updates };

    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ preferences: mergedPrefs })
      .eq('id', userId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Unexpected updatePreferences error:', err);
    return { success: false, error: err.message || 'Unexpected error' };
  }
};

// ============================================================================
// AUTH STATE LISTENERS
// ============================================================================

/**
 * Subscribe to auth state changes
 *
 * @param callback - Called with user when auth state changes (login, logout, session refresh)
 * @returns Unsubscribe function
 *
 * Events:
 * - SIGNED_IN: User signed in
 * - SIGNED_OUT: User signed out
 * - TOKEN_REFRESHED: Session token refreshed (happens automatically every ~1 hour)
 * - USER_UPDATED: User metadata updated
 */
export const onAuthStateChange = (
  callback: (user: AuthUser | null) => void
): (() => void) => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state change:', event, session?.user?.email);
    callback(convertToAuthUser(session?.user || null));
  });

  // Return unsubscribe function
  return () => {
    subscription.unsubscribe();
  };
};

// ============================================================================
// EXPORT DEFAULT SERVICE OBJECT
// ============================================================================

export const authService = {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  getSession,
  resetPassword,
  updatePassword,
  updateProfile,
  getUserProfile,
  ensureUserProfile,
  updatePreferences,
  onAuthStateChange,
};

export default authService;
