/**
 * ProfileModal - User Profile & Account Management
 *
 * MVP Features:
 * - Edit display name
 * - Edit avatar URL
 * - Change password
 * - Sign out
 * - View email (read-only)
 *
 * Design: "Alchemical Void" aesthetic (stone/amber/rose)
 */

import React, { useState, useEffect } from 'react';
import { X, User, Lock, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, signOut } = useAuth();

  // Profile fields
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Password fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<'profile' | 'password'>('profile');

  // Initialize form with current user data
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const validatePassword = (password: string): string | null => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return null;
  };

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleClose = () => {
    // Reset form
    setError(null);
    setSuccess(null);
    setNewPassword('');
    setConfirmPassword('');
    setActiveSection('profile');
    onClose();
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const updates: any = {};
      if (displayName !== (user?.displayName || '')) {
        updates.display_name = displayName || null;
      }
      if (avatarUrl !== (user?.avatarUrl || '')) {
        updates.avatar_url = avatarUrl || null;
      }

      // Only update if something changed
      if (Object.keys(updates).length === 0) {
        setSuccess('No changes to save');
        setIsLoading(false);
        return;
      }

      const result = await authService.updateProfile(updates);

      if (result.success) {
        setSuccess('Profile updated successfully!');
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.updatePassword(newPassword);

      if (result.success) {
        setSuccess('Password changed successfully!');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(result.error || 'Failed to change password');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      handleClose();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-4 bg-stone-950 border border-stone-800 rounded-lg shadow-2xl max-h-[70vh] sm:max-h-[80vh] md:max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-amber-400 transition-colors z-10"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-stone-800">
          <h2 className="text-2xl font-display text-amber-400">Profile & Account</h2>
          <p className="mt-2 text-sm text-stone-400">
            Manage your personal information and security
          </p>
        </div>

        {/* Section Tabs */}
        <div className="flex border-b border-stone-800">
          <button
            onClick={() => {
              setActiveSection('profile');
              setError(null);
              setSuccess(null);
            }}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeSection === 'profile'
                ? 'text-amber-400 border-b-2 border-amber-400'
                : 'text-stone-400 hover:text-stone-300'
            }`}
          >
            <User size={16} className="inline mr-2" />
            Profile
          </button>
          <button
            onClick={() => {
              setActiveSection('password');
              setError(null);
              setSuccess(null);
            }}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeSection === 'password'
                ? 'text-amber-400 border-b-2 border-amber-400'
                : 'text-stone-400 hover:text-stone-300'
            }`}
          >
            <Lock size={16} className="inline mr-2" />
            Password
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-emerald-900/20 border border-emerald-600/30 rounded-md text-emerald-400 text-sm">
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-rose-900/20 border border-rose-600/30 rounded-md text-rose-400 text-sm">
              {error}
            </div>
          )}

          {/* Profile Section */}
          {activeSection === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1">
                  Email
                </label>
                <div className="w-full px-4 py-2 bg-stone-900/50 border border-stone-700 rounded-md text-stone-400 text-sm">
                  {user?.email || 'Not available'}
                </div>
                <p className="mt-1 text-xs text-stone-500">
                  Email cannot be changed
                </p>
              </div>

              {/* Display Name */}
              <div>
                <label htmlFor="display-name" className="block text-sm font-medium text-stone-300 mb-1">
                  Display Name
                </label>
                <input
                  id="display-name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2 bg-stone-900 border border-stone-700 rounded-md text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                  placeholder="Your Name"
                  disabled={isLoading}
                />
              </div>

              {/* Avatar URL */}
              <div>
                <label htmlFor="avatar-url" className="block text-sm font-medium text-stone-300 mb-1">
                  Avatar URL
                </label>
                <input
                  id="avatar-url"
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-4 py-2 bg-stone-900 border border-stone-700 rounded-md text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                  placeholder="https://example.com/avatar.jpg"
                  disabled={isLoading}
                />
                <p className="mt-1 text-xs text-stone-500">
                  Enter a URL to an image for your profile picture
                </p>
              </div>

              {/* Avatar Preview */}
              {avatarUrl && (
                <div>
                  <label className="block text-sm font-medium text-stone-300 mb-2">
                    Preview
                  </label>
                  <div className="flex items-center gap-3">
                    <img
                      src={avatarUrl}
                      alt="Avatar preview"
                      className="w-16 h-16 rounded-full object-cover border-2 border-stone-700"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <span className="text-xs text-stone-500">
                      This is how your avatar will appear
                    </span>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-stone-700 disabled:text-stone-500 text-stone-950 font-medium rounded-md transition-colors flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 size={16} className="animate-spin" />}
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}

          {/* Password Section */}
          {activeSection === 'password' && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-stone-300 mb-1">
                  New Password
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-stone-900 border border-stone-700 rounded-md text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                  placeholder="At least 6 characters"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-stone-300 mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-stone-900 border border-stone-700 rounded-md text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-stone-700 disabled:text-stone-500 text-stone-950 font-medium rounded-md transition-colors flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 size={16} className="animate-spin" />}
                {isLoading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-stone-800">
          <button
            onClick={handleSignOut}
            className="w-full py-3 bg-rose-900/20 hover:bg-rose-900/30 border border-rose-600/30 text-rose-400 font-medium rounded-md transition-colors flex items-center justify-center gap-2"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
