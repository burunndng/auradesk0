/**
 * AXIS Reflection
 * Capture what stood out, what changed, what remains open
 *
 * Design: stone-950 base · Violet secondary
 */

import React, { useState, useEffect } from 'react';
import { ChevronLeft, BookOpen } from 'lucide-react';
import type { AXISSession, AXISReflection, AXISAnchorMode } from '../../../../types';


const MAX_REFLECTION_LENGTH = 2000;
const DRAFT_STORAGE_PREFIX = 'aura-AXIS-reflection-draft-';

const MODE_PROMPTS: Record<AXISAnchorMode | 'default', { salience: string; delta: string; residue: string }> = {
  'emotional-pattern': {
    salience: 'What felt most true in what came up today?',
    delta: 'Did anything shift in how you understand a recurring feeling or pattern?',
    residue: 'What emotional thread is still alive and unresolved?',
  },
  'behavioral-change': {
    salience: "What's one concrete thing you noticed or decided?",
    delta: "What shifted in how you think about a behavior you're working on?",
    residue: 'What will you try or observe before next session?',
  },
  'identity-transition': {
    salience: "How does what we explored today sit with the version of yourself you're moving toward?",
    delta: "Did your sense of who you are or who you're becoming shift at all?",
    residue: 'What questions about your identity or direction remain open?',
  },
  'relational': {
    salience: 'What did you notice about your own patterns in what we discussed?',
    delta: 'Did anything shift in how you see a relationship or relational dynamic?',
    residue: 'What relational thread feels unresolved or still needs attention?',
  },

  default: {
    salience: 'What stood out? What surprised you or felt important?',
    delta: 'How has your understanding or perspective shifted?',
    residue: 'What questions or threads are still alive?',
  },
};

interface AXISReflectionProps {
  session: AXISSession;
  anchorMode?: AXISAnchorMode;
  insightGenerating?: boolean;
  onComplete: (reflection: AXISReflection) => void;
  onSkip?: () => void;
  onBack: () => void;
}

export default function AXISReflection({ session, anchorMode, insightGenerating, onComplete, onSkip, onBack }: AXISReflectionProps) {
  const [salience, setSalience] = useState('');
  const [delta, setDelta] = useState('');
  const [residue, setResidue] = useState('');
  const [selfNoticing, setSelfNoticing] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const draftKey = `${DRAFT_STORAGE_PREFIX}${session.id}`;
  const prompts = MODE_PROMPTS[anchorMode ?? 'default'];

  // Load draft on mount
  useEffect(() => {
    const rawStr = localStorage.getItem(draftKey);
    if (rawStr) {
      try {
        const draft = JSON.parse(rawStr) as any;
        setSalience(draft.salience);
        setDelta(draft.delta);
        setResidue(draft.residue);
        setSelfNoticing(draft.selfNoticing || '');
      } catch (e) {
        console.error('[AXIS] Failed to load reflection draft:', e);
      }
    }
  }, [draftKey]);

  // Save draft on change
  useEffect(() => {
    const draft = { salience, delta, residue, selfNoticing };
    try {
      localStorage.setItem(draftKey, JSON.stringify(draft));
    } catch (e) {
      console.error('[AXIS] Failed to save reflection draft:', e);
    }
  }, [salience, delta, residue, selfNoticing, draftKey]);

  const hasAnyContent = salience.trim().length > 0 || delta.trim().length > 0 || residue.trim().length > 0 || selfNoticing.trim().length > 0;

  const handleContinue = async () => {
    try {
      // Clear draft on success
      localStorage.removeItem(draftKey);
      setSaveError(null);
      onComplete({
        salience: salience.trim() || '—',
        delta: delta.trim() || undefined,
        residue: residue.trim() || undefined,
        selfNoticing: selfNoticing.trim() || undefined,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save reflection';
      setSaveError(message);
      console.error('[AXISReflection] Save failed:', error);
    }
  };

  const handleSkip = () => {
    localStorage.removeItem(draftKey);
    onSkip?.();
  };

  const FieldBlock = ({ label, required, value, onChange, placeholder, rows = 3 }: {
    label: string; required?: boolean; value: string; onChange: (v: string) => void; placeholder: string; rows?: number;
  }) => (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
          {label}{required && ' *'}
        </p>
        <span className="text-xs text-stone-600">{value.length} / {MAX_REFLECTION_LENGTH}</span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, MAX_REFLECTION_LENGTH))}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-stone-950/80 border border-stone-700/50 text-stone-100 placeholder-stone-600 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/30 transition-all"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Error banner */}
      {saveError && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded text-rose-400 text-sm">
          <div className="flex items-center justify-between">
            <span>{saveError}</span>
            <button
              onClick={() => setSaveError(null)}
              className="ml-2 underline hover:no-underline text-xs"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Chapter heading */}
      <div className="text-center mb-2">
        <div className="inline-block text-violet-400/60 mb-3"><BookOpen size={44} /></div>
        <h2 className="text-2xl font-serif font-light text-stone-100 mb-1">{session.title}</h2>
        <p className="text-sm text-stone-400">Capture what mattered</p>
      </div>

      <FieldBlock
        label="Reflection"
        required
        value={salience}
        onChange={setSalience}
        placeholder={prompts.salience}
        rows={4}
      />

      <FieldBlock
        label="What changed, if anything?"
        value={delta}
        onChange={setDelta}
        placeholder={prompts.delta}
      />

      <FieldBlock
        label="What remains open?"
        value={residue}
        onChange={setResidue}
        placeholder={prompts.residue}
      />

      <FieldBlock
        label="Self-noticing (optional)"
        value={selfNoticing}
        onChange={setSelfNoticing}
        placeholder="What are you now noticing on your own that AXIS used to surface for you?"
      />

      {/* Generating indicator — shown prominently above footer when insight is still resolving */}
      {insightGenerating && (
        <div className="flex items-center gap-2 px-4 py-3 bg-violet-500/10 border border-violet-500/20 rounded-xl text-sm text-violet-400">
          <svg className="animate-spin shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <span>Generating insight from your session — you can write or skip once it's ready.</span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-stone-800/60">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-stone-400 hover:text-stone-200 hover:bg-stone-800/60 transition-all"
        >
          <ChevronLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-2">
          {onSkip && (
            <button
              onClick={handleSkip}
              disabled={insightGenerating}
              className="px-4 py-2.5 rounded-xl text-sm text-stone-500 hover:text-stone-300 hover:bg-stone-800/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Skip — let AI reflect
            </button>
          )}
          <button
            onClick={handleContinue}
            disabled={!hasAnyContent || insightGenerating}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-900/20"
          >
            Save Reflection
          </button>
        </div>
      </div>
    </div>
  );
}
