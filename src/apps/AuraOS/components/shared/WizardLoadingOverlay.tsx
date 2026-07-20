import React, { useState, useEffect } from 'react';
import { Loader, AlertCircle } from 'lucide-react';

interface WizardLoadingOverlayProps {
  isLoading?: boolean;
  message?: string;
  submessage?: string;
  timeoutSeconds?: number;
  onCancel?: () => void;
}

export function WizardLoadingOverlay({
  isLoading = true,
  message = 'Aura is thinking...',
  submessage = 'Connecting to collective intelligence...',
  timeoutSeconds = 30,
  onCancel
}: WizardLoadingOverlayProps) {
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setShowTimeoutWarning(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowTimeoutWarning(true);
    }, timeoutSeconds * 1000);

    return () => clearTimeout(timer);
  }, [isLoading, timeoutSeconds]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl shadow-2xl max-w-sm w-full flex flex-col items-center text-center">
        
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-teal-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <Loader className="w-8 h-8 text-teal-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>

        <h3 className="text-xl font-bold text-slate-100 mb-2">{message}</h3>
        <p className="text-sm text-slate-400 mb-6">{submessage}</p>

        {showTimeoutWarning && (
          <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-2 text-left">
            <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-300">
              This is taking longer than usual. Please check your connection or try again.
            </p>
          </div>
        )}

        {onCancel && (
          <button 
            onClick={onCancel}
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            Cancel and Return
          </button>
        )}
      </div>
    </div>
  );
}