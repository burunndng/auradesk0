/**
 * FlagPostModal - Modal for flagging forum posts
 */

import React, { useState } from 'react';
import { Flag, X } from 'lucide-react';

interface FlagPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: 'spam' | 'harmful' | 'off-topic' | 'crisis') => void;
  isLoading?: boolean;
}

const REASONS = [
  { id: 'spam', label: 'Spam', description: 'Unwanted promotional content' },
  { id: 'harmful', label: 'Harmful', description: 'Abusive or threatening content' },
  { id: 'off-topic', label: 'Off-topic', description: 'Not relevant to the discussion' },
  { id: 'crisis', label: 'Crisis', description: 'Expresses suicidal or self-harm intent' },
] as const;

export default function FlagPostModal({ isOpen, onClose, onSubmit, isLoading }: FlagPostModalProps) {
  const [selectedReason, setSelectedReason] = useState<'spam' | 'harmful' | 'off-topic' | 'crisis' | null>(null);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!selectedReason) return;
    onSubmit(selectedReason);
    setSelectedReason(null);
  };

  const handleClose = () => {
    setSelectedReason(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm">
      <div className="bg-stone-900 border border-stone-800 rounded-xl max-w-sm w-full mx-4 overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <Flag size={18} className="text-rose-400" />
            <h2 className="text-lg font-serif text-stone-200">Flag Post</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-stone-400 hover:text-stone-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <p className="text-sm text-stone-400">
            Help us keep the community safe. Why are you flagging this post?
          </p>

          <div className="space-y-2">
            {REASONS.map(({ id, label, description }) => (
              <button
                key={id}
                onClick={() => setSelectedReason(id)}
                className={`w-full p-3 rounded-lg border text-left transition-all ${
                  selectedReason === id
                    ? 'bg-rose-900/20 border-rose-500/50 text-rose-300'
                    : 'bg-stone-800/30 border-stone-700 text-stone-300 hover:border-stone-600'
                }`}
              >
                <div className="font-medium text-sm">{label}</div>
                <div className="text-xs text-stone-500 mt-0.5">{description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 p-4 border-t border-stone-800 bg-stone-950/50">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 rounded-lg bg-stone-800 text-stone-300 text-sm font-medium hover:bg-stone-700 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedReason || isLoading}
            className="flex-1 px-4 py-2 rounded-lg bg-rose-900/40 text-rose-300 text-sm font-medium border border-rose-700/30 hover:bg-rose-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Flagging...' : 'Flag'}
          </button>
        </div>
      </div>
    </div>
  );
}
