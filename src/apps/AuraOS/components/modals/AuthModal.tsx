/**
 * AuthModal - Sign In / Sign Up / Reset Password Modal
 *
 * Features:
 * - Tabbed interface (Sign In, Sign Up, Reset Password)
 * - Form validation (email format, password strength)
 * - User-friendly error messages
 * - Email verification notices
 * - "Alchemical Void" aesthetic (stone/amber/rose)
 *
 * Usage:
 * - Controlled by AuthContext via showAuthModal state
 * - Automatically shown when auth required for protected actions
 */

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { AuthModalMode } from '../../types';

// ============================================================================
// ISOLATED INPUT COMPONENTS (prevent parent re-render on every keystroke)
// ============================================================================

const EmailInput = React.memo(({
  id,
  value,
  onChange,
  disabled,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-stone-300 mb-1">
      Email
    </label>
    <input
      id={id}
      type="email"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2 bg-stone-900 border border-stone-700 rounded-md text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
      placeholder="you@example.com"
      required
      disabled={disabled}
    />
  </div>
));

EmailInput.displayName = 'EmailInput';

const PasswordInput = React.memo(({
  id,
  value,
  onChange,
  disabled,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-stone-300 mb-1">
      Password
    </label>
    <input
      id={id}
      type="password"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2 bg-stone-900 border border-stone-700 rounded-md text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
      placeholder="••••••••"
      required
      disabled={disabled}
    />
  </div>
));

PasswordInput.displayName = 'PasswordInput';

const ConfirmPasswordInput = React.memo(({
  id,
  value,
  onChange,
  disabled,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-stone-300 mb-1">
      Confirm Password
    </label>
    <input
      id={id}
      type="password"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2 bg-stone-900 border border-stone-700 rounded-md text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
      placeholder="••••••••"
      required
      disabled={disabled}
    />
  </div>
));

ConfirmPasswordInput.displayName = 'ConfirmPasswordInput';

const DisplayNameInput = React.memo(({
  id,
  value,
  onChange,
  disabled,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-stone-300 mb-1">
      Display Name (optional)
    </label>
    <input
      id={id}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2 bg-stone-900 border border-stone-700 rounded-md text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
      placeholder="Your Name"
      disabled={disabled}
    />
  </div>
));

DisplayNameInput.displayName = 'DisplayNameInput';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AuthModal() {
  const { showAuthModal, setShowAuthModal, signUp, signIn, resetPassword } = useAuth();

  // Modal state
  const [mode, setMode] = useState<AuthModalMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

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
    setShowAuthModal(false);
    setError(null);
    setSuccess(null);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setDisplayName('');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn(email, password);

      if (result.success) {
        setSuccess('Signed in successfully!');
        setTimeout(() => {
          handleClose();
        }, 1000);
      } else {
        setError(result.error || 'Sign in failed');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signUp(email, password, displayName || undefined);

      if (result.success) {
        if (result.error && result.error.includes('email')) {
          // Email confirmation required
          setSuccess('Success! Please check your email to confirm your account.');
          setMode('signin');
        } else {
          setSuccess('Account created successfully!');
          setTimeout(() => {
            handleClose();
          }, 1000);
        }
      } else {
        setError(result.error || 'Sign up failed');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const result = await resetPassword(email);

      if (result.success) {
        setSuccess('Password reset email sent! Check your inbox.');
        setTimeout(() => {
          setMode('signin');
          setError(null);
          setSuccess(null);
        }, 3000);
      } else {
        setError(result.error || 'Failed to send reset email');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!showAuthModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/80 backdrop-blur-sm">
      <div
        className="relative w-full max-w-md mx-4 bg-stone-950 border border-stone-800 rounded-lg shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-amber-400 transition-colors"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-stone-800">
          <h2 id="auth-modal-title" className="text-2xl font-display text-amber-400">
            {mode === 'signin' && 'Sign In'}
            {mode === 'signup' && 'Create Account'}
            {mode === 'reset-password' && 'Reset Password'}
          </h2>
          <p className="mt-2 text-sm text-stone-400">
            {mode === 'signin' && 'Welcome back to your practice'}
            {mode === 'signup' && 'Start your integral journey'}
            {mode === 'reset-password' && 'We\'ll send you a reset link'}
          </p>
        </div>

        {/* Tabs */}
        {mode !== 'reset-password' && (
          <div className="flex border-b border-stone-800">
            <button
              onClick={() => {
                setMode('signin');
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                mode === 'signin'
                  ? 'text-amber-400 border-b-2 border-amber-400'
                  : 'text-stone-400 hover:text-stone-300'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('signup');
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                mode === 'signup'
                  ? 'text-amber-400 border-b-2 border-amber-400'
                  : 'text-stone-400 hover:text-stone-300'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Form */}
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

          {/* Sign In Form */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <EmailInput
                id="signin-email"
                value={email}
                onChange={setEmail}
                disabled={isLoading}
              />

              <PasswordInput
                id="signin-password"
                value={password}
                onChange={setPassword}
                disabled={isLoading}
              />

              <button
                type="button"
                onClick={() => {
                  setMode('reset-password');
                  setError(null);
                  setSuccess(null);
                }}
                className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
              >
                Forgot password?
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-stone-700 disabled:text-stone-500 text-stone-950 font-medium rounded-md transition-colors"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* Sign Up Form */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <DisplayNameInput
                id="signup-name"
                value={displayName}
                onChange={setDisplayName}
                disabled={isLoading}
              />

              <EmailInput
                id="signup-email"
                value={email}
                onChange={setEmail}
                disabled={isLoading}
              />

              <PasswordInput
                id="signup-password"
                value={password}
                onChange={setPassword}
                disabled={isLoading}
              />

              <ConfirmPasswordInput
                id="signup-confirm-password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                disabled={isLoading}
              />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-stone-700 disabled:text-stone-500 text-stone-950 font-medium rounded-md transition-colors"
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* Reset Password Form */}
          {mode === 'reset-password' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <EmailInput
                id="reset-email"
                value={email}
                onChange={setEmail}
                disabled={isLoading}
              />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-stone-700 disabled:text-stone-500 text-stone-950 font-medium rounded-md transition-colors"
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                  setSuccess(null);
                }}
                className="w-full text-sm text-stone-400 hover:text-stone-300 transition-colors"
              >
                Back to Sign In
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
