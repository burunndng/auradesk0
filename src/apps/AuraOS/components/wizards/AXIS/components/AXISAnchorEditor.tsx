/**
 * AXIS Anchor Editor
 * Create or edit identity anchor with optional mode selection
 *
 * Design: stone-950 base · Violet secondary
 */

import React, { useState } from 'react';
import { Crosshair } from 'lucide-react';
import type { AXISAnchorMode } from '../../../../types';

const MAX_ANCHOR_LENGTH = 500;

const ANCHOR_MODES: { value: AXISAnchorMode; label: string; description: string }[] = [
  {
    value: 'emotional-pattern',
    label: 'Emotional Pattern',
    description: 'Exploring recurring feelings, defenses, and inner dynamics',
  },
  {
    value: 'behavioral-change',
    label: 'Behavioral Change',
    description: 'Tracking habits, action edges, and concrete shifts',
  },
  {
    value: 'identity-transition',
    label: 'Identity Transition',
    description: 'Navigating a role change, life chapter, or self-concept shift',
  },
  {
    value: 'relational',
    label: 'Relational',
    description: 'Working through patterns in relationships and connection',
  },
];

interface AXISAnchorEditorProps {
  initialValue?: string;
  initialMode?: AXISAnchorMode;
  onSave: (content: string, mode?: AXISAnchorMode) => void;
  isCreating: boolean;
}

export default function AXISAnchorEditor({
  initialValue = '',
  initialMode,
  onSave,
  isCreating,
}: AXISAnchorEditorProps) {
  const [content, setContent] = useState(initialValue.slice(0, MAX_ANCHOR_LENGTH));
  const [mode, setMode] = useState<AXISAnchorMode | undefined>(initialMode);

  const canSave = content.trim().length > 20 && content.length <= MAX_ANCHOR_LENGTH;

  return (
    <div className="space-y-5">
      {/* Chapter heading for initial creation */}
      {isCreating && (
        <div className="text-center mb-4">
          <div className="inline-block text-violet-400/60 mb-3"><Crosshair size={44} /></div>
          <h2 className="text-2xl font-serif font-light text-stone-100 mb-2">Create Your Anchor</h2>
          <p className="text-sm text-stone-400 max-w-md mx-auto leading-relaxed">
            Your anchor is a free-text description of who you are. It grounds every AXIS session in your identity.
          </p>
        </div>
      )}

      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">
          {isCreating ? 'Identity Anchor' : 'Edit Your Anchor'}
        </p>
        <p className="text-xs text-stone-500 mb-3">
          Include values, life context, preferences for interaction, constraints.
        </p>
        <textarea
          value={content}
          onChange={(e) => {
            const newValue = e.target.value.slice(0, MAX_ANCHOR_LENGTH);
            setContent(newValue);
          }}
          placeholder="I'm a 34-year-old engineer navigating career transition. I value directness and dislike platitudes. Working on being less conflict-avoidant."
          rows={4}
          className="w-full bg-stone-950/80 border border-stone-700/50 text-stone-100 placeholder-stone-600 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/30 transition-all"
        />
        <div className="flex justify-between items-end mt-2">
          <p className="text-xs text-stone-600">
            {content.length} / {MAX_ANCHOR_LENGTH}
          </p>
          {content.length < 20 && content.length > 0 && (
            <p className="text-xs text-amber-500/70">(minimum 20 characters)</p>
          )}
        </div>
      </div>

      {/* Mode Picker */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-600 mb-2">
          Focus Mode <span className="text-stone-700 normal-case font-normal">(optional)</span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ANCHOR_MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMode(mode === m.value ? undefined : m.value)}
              className={`text-left px-3 py-2.5 rounded-xl border transition-all duration-150 ${mode === m.value
                  ? 'border-violet-500/40 bg-violet-500/10 text-violet-200'
                  : 'border-stone-700/40 bg-stone-900/40 text-stone-400 hover:border-stone-600 hover:text-stone-300'
                }`}
            >
              <p className="text-xs font-semibold mb-0.5">{m.label}</p>
              <p className="text-xs opacity-70 leading-snug">{m.description}</p>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => onSave(content, mode)}
        disabled={!canSave}
        className="w-full px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-900/20"
      >
        {isCreating ? 'Create Anchor' : 'Save Changes'}
      </button>
    </div>
  );
}
