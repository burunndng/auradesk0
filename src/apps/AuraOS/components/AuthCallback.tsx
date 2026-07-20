/**
 * AuthCallback - Handles Supabase auth callbacks
 *
 * This component handles the redirect after:
 * - Email confirmation
 * - Password reset
 * - Magic link login
 *
 * It extracts the auth tokens from URL hash and completes the auth flow.
 */

import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

export default function AuthCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the hash fragment (everything after #)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));

        // Check for error in hash
        const error = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');

        if (error) {
          console.error('[AuthCallback] Error:', error, errorDescription);
          setStatus('error');

          if (error === 'access_denied' && errorDescription?.includes('expired')) {
            setMessage('This link has expired. Please request a new confirmation email.');
          } else {
            setMessage(errorDescription || 'Authentication failed. Please try again.');
          }

          // Redirect to home after 3 seconds
          setTimeout(() => {
            window.location.href = '/';
          }, 3000);
          return;
        }

        // Check for access_token in hash (email confirmation, password reset)
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          // Set the session with the tokens
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error('[AuthCallback] Session error:', sessionError);
            setStatus('error');
            setMessage('Failed to complete authentication. Please try again.');
          } else {
            setStatus('success');
            setMessage('Email confirmed! Redirecting...');

            // Redirect to home after 1 second
            setTimeout(() => {
              window.location.href = '/';
            }, 1000);
          }
        } else {
          // No tokens found, just redirect
          console.log('[AuthCallback] No tokens in URL, redirecting to home');
          window.location.href = '/';
        }
      } catch (err) {
        console.error('[AuthCallback] Unexpected error:', err);
        setStatus('error');
        setMessage('An unexpected error occurred. Redirecting to home...');

        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      }
    };

    handleAuthCallback();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[100dvh] bg-stone-950">
      <div className="text-center p-8 max-w-md">
        {/* Loading Spinner */}
        {status === 'loading' && (
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Success Icon */}
        {status === 'success' && (
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto bg-emerald-600/20 border-2 border-emerald-400 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}

        {/* Error Icon */}
        {status === 'error' && (
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto bg-rose-600/20 border-2 border-rose-400 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        )}

        {/* Message */}
        <h2 className={`text-xl font-display mb-2 ${status === 'success' ? 'text-emerald-400' :
            status === 'error' ? 'text-rose-400' :
              'text-amber-400'
          }`}>
          {status === 'loading' && 'Confirming Email'}
          {status === 'success' && 'Success!'}
          {status === 'error' && 'Authentication Failed'}
        </h2>

        <p className="text-stone-400 text-sm">
          {message}
        </p>
      </div>
    </div>
  );
}
