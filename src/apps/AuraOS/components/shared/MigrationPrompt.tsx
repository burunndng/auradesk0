/**
 * MigrationPrompt - Data Migration Notification
 *
 * Prompts users to migrate existing localStorage data to Supabase
 * when they sign in for the first time.
 *
 * Features:
 * - Auto-detects old localStorage userId
 * - Shows migration summary
 * - Allows user to skip migration
 * - Marks migration complete after execution
 *
 * Usage:
 * - Rendered in App.tsx after AuthProvider
 * - Automatically shown when user signs in and has unmigrated data
 */

import React, { useState, useEffect } from 'react';
import { Upload, X, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { migrationService } from '../../services/migrationService';
import type { MigrationSummary } from '../../types';

export default function MigrationPrompt() {
  const { user, isAuthenticated } = useAuth();

  // Component state
  const [showPrompt, setShowPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [migrationComplete, setMigrationComplete] = useState(false);
  const [summary, setSummary] = useState<MigrationSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // CHECK IF MIGRATION NEEDED
  // ============================================================================

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setShowPrompt(false);
      return;
    }

    const checkMigration = async () => {
      try {
        // Check if already migrated
        const alreadyMigrated = await migrationService.isMigrationCompleted(user.id);
        if (alreadyMigrated) {
          setShowPrompt(false);
          return;
        }

        // Check if there's old data to migrate
        const oldUserId = migrationService.getOldUserId();
        if (!oldUserId) {
          // No old data, mark as complete to avoid prompting again
          await migrationService.markMigrationCompleted(user.id);
          setShowPrompt(false);
          return;
        }

        // Show migration prompt
        setShowPrompt(true);
      } catch (err) {
        console.error('[MigrationPrompt] Check migration error:', err);
        setShowPrompt(false);
      }
    };

    // Delay check to avoid blocking initial render
    const timer = setTimeout(checkMigration, 2000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleMigrate = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await migrationService.migrateUserData(user.id);

      if (result) {
        setSummary(result);
        setMigrationComplete(true);

        // Auto-close after 5 seconds
        setTimeout(() => {
          setShowPrompt(false);
        }, 5000);
      } else {
        setError('Migration failed or no data to migrate');
      }
    } catch (err: any) {
      console.error('[MigrationPrompt] Migration error:', err);
      setError(err.message || 'Failed to migrate data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    if (!user) return;

    // Mark migration as complete (user chose to skip)
    await migrationService.markMigrationCompleted(user.id);
    setShowPrompt(false);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg bg-stone-950 border border-stone-800 rounded-lg shadow-2xl">
        {/* Close Button */}
        {!isLoading && !migrationComplete && (
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 text-stone-400 hover:text-amber-400 transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        )}

        <div className="p-6">
          {/* Success State */}
          {migrationComplete && summary && (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-emerald-600/20 border-2 border-emerald-400 rounded-full flex items-center justify-center">
                  <Check size={32} className="text-emerald-400" />
                </div>
              </div>

              <h2 className="text-2xl font-display text-emerald-400 mb-2">
                Migration Complete!
              </h2>

              <p className="text-stone-300 mb-4">
                Your data has been successfully migrated to your account
              </p>

              <div className="bg-stone-900/50 border border-stone-800 rounded-md p-4 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-400">Insights migrated:</span>
                  <span className="text-amber-400 font-medium">{summary.insights_migrated}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-400">Guidance cache:</span>
                  <span className="text-amber-400 font-medium">{summary.guidance_migrated}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-400">Preferences:</span>
                  <span className="text-amber-400 font-medium">
                    {summary.preferences_migrated > 0 ? 'Migrated' : 'None'}
                  </span>
                </div>
                <div className="border-t border-stone-700 pt-2 mt-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-stone-300">Total items:</span>
                    <span className="text-amber-400">{summary.total_migrated}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-stone-500 mt-4">
                This window will close automatically...
              </p>
            </div>
          )}

          {/* Error State */}
          {error && !migrationComplete && (
            <div>
              <h2 className="text-xl font-display text-rose-400 mb-2">
                Migration Failed
              </h2>
              <p className="text-stone-300 mb-4">{error}</p>
              <button
                onClick={handleSkip}
                className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          )}

          {/* Initial Prompt */}
          {!migrationComplete && !error && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-amber-600/20 border-2 border-amber-400 rounded-full flex items-center justify-center">
                  <Upload size={24} className="text-amber-400" />
                </div>
                <div>
                  <h2 className="text-xl font-display text-amber-400">
                    Migrate Your Data
                  </h2>
                  <p className="text-sm text-stone-400">
                    We found existing practice data
                  </p>
                </div>
              </div>

              <p className="text-stone-300 mb-6">
                Would you like to migrate your existing insights, guidance, and practice
                stack to your new authenticated account? This will sync your data across
                devices and enable cloud backup.
              </p>

              <div className="bg-stone-900/50 border border-stone-800 rounded-md p-4 mb-6">
                <p className="text-sm text-stone-400">
                  <strong className="text-stone-300">Note:</strong> AI Coach conversations
                  remain private and will stay on this device only.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleMigrate}
                  disabled={isLoading}
                  className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-stone-700 disabled:text-stone-500 text-stone-950 font-medium rounded-md transition-colors"
                >
                  {isLoading ? 'Migrating...' : 'Migrate Data'}
                </button>
                <button
                  onClick={handleSkip}
                  disabled={isLoading}
                  className="flex-1 py-3 bg-stone-800 hover:bg-stone-700 disabled:bg-stone-800 text-stone-300 font-medium rounded-md transition-colors"
                >
                  Skip
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
