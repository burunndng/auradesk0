/**
 * AXIS RPL Banner
 * Pattern detection banner - dismissible
 *
 * Design: stone-950 base · Semantic colors per trigger type
 */

import React, { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import type { RPLTrigger } from '../hooks/useAXISRPL';
import { setRPLCooldown } from '../hooks/useAXISRPL';

interface AXISRPLBannerProps {
  trigger: RPLTrigger;
  onDismiss: () => void;
}

export default function AXISRPLBanner({ trigger, onDismiss }: AXISRPLBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  const handleDismiss = () => {
    setRPLCooldown(trigger.type);
    setIsDismissed(true);
    onDismiss();
  };

  if (isDismissed) return null;

  const getBgColor = (type: RPLTrigger['type']) => {
    switch (type) {
      case 'anchor-review':
        return 'bg-amber-950/30 border-amber-500/20';
      case 'title-repetition':
        return 'bg-amber-950/20 border-amber-600/20';
      case 'high-frequency':
        return 'bg-red-950/20 border-red-500/20';
      case 'open-accumulation':
        return 'bg-violet-950/20 border-violet-500/20';
      default:
        return 'bg-stone-900/40 border-stone-700/30';
    }
  };

  const getTextColor = (type: RPLTrigger['type']) => {
    switch (type) {
      case 'anchor-review':
        return 'text-amber-300';
      case 'title-repetition':
        return 'text-amber-200';
      case 'high-frequency':
        return 'text-red-300';
      case 'open-accumulation':
        return 'text-violet-300';
      default:
        return 'text-stone-300';
    }
  };

  return (
    <div className={`border rounded-xl p-4 ${getBgColor(trigger.type)}`}>
      <div className="flex gap-3">
        <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${getTextColor(trigger.type)}`} />
        <div className="flex-1">
          <p className={`text-sm font-semibold ${getTextColor(trigger.type)} mb-1`}>
            {trigger.message}
          </p>
          <p className={`text-sm ${getTextColor(trigger.type)} opacity-80`}>
            {trigger.question}
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className={`flex-shrink-0 ${getTextColor(trigger.type)} opacity-60 hover:opacity-100 transition-all`}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
