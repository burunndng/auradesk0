/**
 * useGlitchTokenWarning Hook
 * Validates user input for glitch tokens before wizard submission
 * Returns warning state and user actions
 */

import { useState, useCallback } from 'react';
import { validatePromptSafety, logGlitchEncounter } from '../.claude/lib/promptSafetyValidator';

export interface GlitchWarningState {
  isWarning: boolean;
  riskLevel: 'safe' | 'warning' | 'danger';
  tokens: string[];
  recommendation: string;
  userChoice: 'proceed' | 'cancel' | 'rephrase' | null;
}

export function useGlitchTokenWarning() {
  const [warning, setWarning] = useState<GlitchWarningState>({
    isWarning: false,
    riskLevel: 'safe',
    tokens: [],
    recommendation: '',
    userChoice: null
  });

  /**
   * Check user input for glitch tokens
   * Returns true if safe to proceed, false if warning needed
   */
  const validateInput = useCallback((userInput: string): boolean => {
    const validation = validatePromptSafety(userInput, { strictMode: false });

    if (validation.detections.length === 0) {
      // Safe
      setWarning({
        isWarning: false,
        riskLevel: 'safe',
        tokens: [],
        recommendation: '',
        userChoice: null
      });
      return true;
    }

    // Has glitch tokens - show warning
    setWarning({
      isWarning: true,
      riskLevel: validation.riskLevel,
      tokens: validation.severeTokens.length > 0 ? validation.severeTokens :
              validation.detections.map(d => d.token),
      recommendation: validation.recommendation,
      userChoice: null
    });

    return false;
  }, []);

  /**
   * User acknowledged warning and wants to proceed
   */
  const handleProceed = useCallback((userInput: string) => {
    setWarning((prev) => ({ ...prev, userChoice: 'proceed' }));

    // Log the encounter
    logGlitchEncounter({
      prompt: userInput,
      detections: validatePromptSafety(userInput).detections,
      riskLevel: warning.riskLevel,
      timestamp: new Date().toISOString(),
      context: 'Wizard Input - User Confirmed'
    });
  }, [warning.riskLevel]);

  /**
   * User wants to rephrase their input
   */
  const handleRephrase = useCallback(() => {
    setWarning((prev) => ({ ...prev, userChoice: 'rephrase' }));
  }, []);

  /**
   * User cancelled submission
   */
  const handleCancel = useCallback(() => {
    setWarning((prev) => ({ ...prev, userChoice: 'cancel' }));
  }, []);

  /**
   * Reset warning state
   */
  const resetWarning = useCallback(() => {
    setWarning({
      isWarning: false,
      riskLevel: 'safe',
      tokens: [],
      recommendation: '',
      userChoice: null
    });
  }, []);

  return {
    warning,
    validateInput,
    handleProceed,
    handleRephrase,
    handleCancel,
    resetWarning
  };
}

/**
 * Component for displaying glitch token warning
 */
export interface GlitchWarningModalProps {
  isOpen: boolean;
  riskLevel: 'warning' | 'danger';
  tokens: string[];
  onProceed: () => void;
  onRephrase: () => void;
  onCancel: () => void;
  onOpenMirage: () => void;
}

export function GlitchWarningModal({
  isOpen,
  riskLevel,
  tokens,
  onProceed,
  onRephrase,
  onCancel,
  onOpenMirage
}: GlitchWarningModalProps) {
  if (!isOpen) return null;

  const isSevere = riskLevel === 'danger';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={`bg-slate-900 border rounded-lg shadow-2xl max-w-md w-full mx-4 ${
        isSevere ? 'border-red-500/50' : 'border-yellow-500/50'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b ${
          isSevere ? 'bg-red-900/20 border-red-500/30' : 'bg-yellow-900/20 border-yellow-500/30'
        }`}>
          <h2 className={`font-bold text-lg ${
            isSevere ? 'text-red-200' : 'text-yellow-200'
          }`}>
            {isSevere ? '🔴 Severe Tokenization Anomaly' : '⚠️ Tokenization Anomaly Detected'}
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            Your input contains tokens that may confuse the AI.
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          <div>
            <p className="text-xs text-slate-400 mb-2">Detected tokens:</p>
            <div className="space-y-1">
              {tokens.map((token) => (
                <div key={token} className="text-xs bg-slate-800 rounded px-2 py-1">
                  <code className="text-amber-300">{token}</code>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/50 rounded p-3 text-xs text-slate-300">
            <p>
              {isSevere
                ? 'These tokens often cause AI to misinterpret or produce unexpected output.'
                : 'These tokens may cause the AI to behave unexpectedly.'}
            </p>
            <p className="mt-2">
              You can proceed anyway, but expect unusual results. Learn more in the <strong>Tokenization Researcher (MIRAGE)</strong>.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className={`px-6 py-4 border-t ${
          isSevere ? 'border-red-500/30 bg-red-900/10' : 'border-yellow-500/30 bg-yellow-900/10'
        } space-y-2`}>
          <button
            onClick={onProceed}
            className={`w-full px-4 py-2 rounded font-mono text-sm transition-colors ${
              isSevere
                ? 'bg-red-600/30 hover:bg-red-600/50 text-red-200 border border-red-500/50'
                : 'bg-yellow-600/30 hover:bg-yellow-600/50 text-yellow-200 border border-yellow-500/50'
            }`}
          >
            Proceed Anyway ({isSevere ? '⚠️ Risky' : '⚡ Continue'})
          </button>

          <button
            onClick={onRephrase}
            className="w-full px-4 py-2 rounded font-mono text-sm bg-slate-700/50 hover:bg-slate-700 text-slate-200 border border-slate-600/50 transition-colors"
          >
            Rephrase My Input
          </button>

          <button
            onClick={onOpenMirage}
            className="w-full px-4 py-2 rounded font-mono text-sm bg-teal-600/20 hover:bg-teal-600/30 text-teal-200 border border-teal-500/50 transition-colors"
          >
            Learn in MIRAGE
          </button>

          <button
            onClick={onCancel}
            className="w-full px-4 py-2 rounded font-mono text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
