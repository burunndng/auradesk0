/**
 * Somatic Cartography — CheckInFlow
 * Steps C1–C4: context tags → body map → intensity → post-session state
 */

import React, { useState, useCallback, useRef } from 'react';
import type {
  CheckInDraft,
  CheckInStep,
  ZoneMark,
  BodyMapHistoryEntry,
  PostSessionState,
  SafetyProfile,
} from './types';
import {
  CHECKIN_DRAFT_KEY,
  CONTEXT_TAGS,
  POST_SESSION_STATES,
  MAX_HISTORY_ENTRIES,
  MIN_CHECKINS_FOR_INSIGHT,
} from './constants';
import BodyMapSVG from './BodyMapSVG';
import ZoneDetailPanel from './ZoneDetailPanel';

// ---------------------------------------------------------------------------
// Draft helpers
// ---------------------------------------------------------------------------

function readDraft(): CheckInDraft | null {
  try {
    const raw = localStorage.getItem(CHECKIN_DRAFT_KEY);
    return raw ? (JSON.parse(raw) as CheckInDraft) : null;
  } catch {
    return null;
  }
}

function saveDraft(draft: CheckInDraft): void {
  localStorage.setItem(CHECKIN_DRAFT_KEY, JSON.stringify(draft));
}

function clearDraft(): void {
  localStorage.removeItem(CHECKIN_DRAFT_KEY);
}

function buildInitialDraft(): CheckInDraft {
  return {
    sessionId: crypto.randomUUID(),
    startedAt: new Date().toISOString(),
    step: 'C1',
    contextTags: [],
    marks: [],
    nothingNotable: false,
  };
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CheckInFlowProps {
  userId: string;
  safetyProfile: SafetyProfile;
  history: BodyMapHistoryEntry[];
  onComplete: (entry: BodyMapHistoryEntry) => void;
  onBack: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CheckInFlow({
  userId,
  safetyProfile,
  history,
  onComplete,
  onBack,
}: CheckInFlowProps) {
  const [draft, setDraft] = useState<CheckInDraft>(() => readDraft() ?? buildInitialDraft());
  const [panelZone, setPanelZone] = useState<string | null>(null);

  const updateDraft = useCallback((updates: Partial<CheckInDraft>) => {
    setDraft((prev) => {
      const next = { ...prev, ...updates };
      saveDraft(next);
      return next;
    });
  }, []);

  const goToStep = useCallback((step: CheckInStep) => {
    updateDraft({ step });
  }, [updateDraft]);

  // Called when C4 post-session state is selected
  const handleComplete = useCallback(
    (postSessionState: PostSessionState) => {
      const entry: BodyMapHistoryEntry = {
        id: draft.sessionId,
        completedAt: new Date().toISOString(),
        contextTags: draft.contextTags,
        marks: draft.marks,
        nothingNotable: draft.nothingNotable,
        overallIntensity: draft.overallIntensity,
        freeText: draft.freeText,
        postSessionState,
      };
      clearDraft();
      onComplete(entry);
    },
    [draft, onComplete]
  );

  // Zone tap from body map
  const handleZoneTap = useCallback((zone: string) => {
    if (draft.nothingNotable) return;
    setPanelZone(zone);
  }, [draft.nothingNotable]);

  const existingMark = panelZone
    ? draft.marks.find((m) => m.zone === panelZone) ?? null
    : null;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-neutral-800/60">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-200 transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <div className="flex items-center gap-2">
          {(['C1', 'C2', 'C3', 'C4'] as CheckInStep[]).map((s) => (
            <div
              key={s}
              className={`h-1 w-8 rounded-full transition-colors duration-200 ${
                ['C1', 'C2', 'C3', 'C4'].indexOf(s) <= ['C1', 'C2', 'C3', 'C4'].indexOf(draft.step)
                  ? 'bg-emerald-500'
                  : 'bg-neutral-800'
              }`}
            />
          ))}
        </div>
        <div className="w-16" />
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto">
        {draft.step === 'C1' && (
          <StepC1
            contextTags={draft.contextTags}
            freeText={draft.freeText ?? ''}
            onUpdate={(tags, text) => updateDraft({ contextTags: tags, freeText: text })}
            onNext={() => goToStep('C2')}
          />
        )}

        {draft.step === 'C2' && (
          <StepC2
            marks={draft.marks}
            nothingNotable={draft.nothingNotable}
            history={history}
            silhouettePreference={safetyProfile.silhouettePreference}
            onZoneTap={handleZoneTap}
            onNothingNotable={(v) => updateDraft({ nothingNotable: v, marks: v ? [] : draft.marks })}
            onNext={() => goToStep('C3')}
          />
        )}

        {draft.step === 'C3' && (
          <StepC3
            intensity={draft.overallIntensity}
            freeText={draft.freeText ?? ''}
            onUpdate={(intensity, text) => updateDraft({ overallIntensity: intensity, freeText: text })}
            onNext={() => goToStep('C4')}
            onBack={() => goToStep('C2')}
          />
        )}

        {draft.step === 'C4' && (
          <StepC4
            onSelect={handleComplete}
            onBack={() => goToStep('C3')}
          />
        )}
      </div>

      {/* Zone detail bottom sheet */}
      {panelZone && (
        <ZoneDetailPanel
          zone={panelZone}
          existingMark={existingMark ?? undefined}
          onSave={(mark) => {
            updateDraft({
              marks: [
                ...draft.marks.filter((m) => m.zone !== mark.zone),
                mark,
              ],
            });
            setPanelZone(null);
          }}
          onRemove={() => {
            updateDraft({ marks: draft.marks.filter((m) => m.zone !== panelZone) });
            setPanelZone(null);
          }}
          onClose={() => setPanelZone(null)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step C1: Context tags
// ---------------------------------------------------------------------------

interface StepC1Props {
  contextTags: string[];
  freeText: string;
  onUpdate: (tags: string[], text: string) => void;
  onNext: () => void;
}

function StepC1({ contextTags, freeText, onUpdate, onNext }: StepC1Props) {
  const toggleTag = (tag: string) => {
    const next = contextTags.includes(tag)
      ? contextTags.filter((t) => t !== tag)
      : [...contextTags, tag];
    onUpdate(next, freeText);
  };

  return (
    <div className="px-5 py-8 max-w-lg mx-auto space-y-6">
      <div>
        <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-neutral-500 mb-1">Step 1 of 4</p>
        <h2 className="text-2xl font-serif text-neutral-100">What's the context?</h2>
        <p className="text-neutral-500 text-sm mt-1">Optional — skip to body map if you prefer</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {CONTEXT_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`px-3 py-1.5 rounded-lg text-sm border transition-all duration-150 ${
              contextTags.includes(tag)
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                : 'bg-neutral-900/50 border-neutral-800 text-neutral-400 hover:border-neutral-700'
            }`}
          >
            {tag.replace(/-/g, ' ')}
          </button>
        ))}
      </div>

      <div>
        <label className="text-xs font-mono uppercase tracking-[0.15em] text-neutral-500 block mb-2">
          Anything to add?
        </label>
        <textarea
          value={freeText}
          onChange={(e) => onUpdate(contextTags, e.target.value)}
          placeholder="Big presentation this morning, argument with partner…"
          rows={3}
          className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-200 placeholder-neutral-600 resize-none focus:outline-none focus:border-emerald-500/40 transition-colors"
        />
      </div>

      <button
        onClick={onNext}
        className="w-full py-3.5 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 hover:border-emerald-500/35 rounded-xl text-emerald-300 font-mono text-xs uppercase tracking-widest transition-all duration-200"
      >
        Continue to Body Map
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step C2: Body map
// ---------------------------------------------------------------------------

interface StepC2Props {
  marks: ZoneMark[];
  nothingNotable: boolean;
  history: BodyMapHistoryEntry[];
  silhouettePreference: SafetyProfile['silhouettePreference'];
  onZoneTap: (zone: string) => void;
  onNothingNotable: (v: boolean) => void;
  onNext: () => void;
}

function StepC2({
  marks,
  nothingNotable,
  history,
  silhouettePreference,
  onZoneTap,
  onNothingNotable,
  onNext,
}: StepC2Props) {
  return (
    <div className="px-5 py-8 max-w-lg mx-auto space-y-5">
      <div>
        <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-neutral-500 mb-1">Step 2 of 4</p>
        <h2 className="text-2xl font-serif text-neutral-100">Mark what's present</h2>
        <p className="text-neutral-500 text-sm mt-1">
          {nothingNotable
            ? 'Nothing notable marked'
            : marks.length === 0
            ? 'Tap zones where you notice tension or sensation'
            : `${marks.length} zone${marks.length > 1 ? 's' : ''} marked`}
        </p>
      </div>

      <BodyMapSVG
        marks={marks}
        historicalMarks={history.slice(0, 30)}
        onZoneTap={onZoneTap}
        interactive={!nothingNotable}
      />

      {/* Nothing notable toggle */}
      <button
        onClick={() => onNothingNotable(!nothingNotable)}
        className={`w-full py-3 px-4 rounded-xl border text-sm transition-all duration-150 ${
          nothingNotable
            ? 'bg-neutral-800/60 border-neutral-700 text-neutral-300'
            : 'bg-neutral-900/40 border-neutral-800 text-neutral-500 hover:border-neutral-700 hover:text-neutral-400'
        }`}
      >
        {nothingNotable ? '✓ Nothing notable today' : 'Nothing notable today'}
      </button>

      <button
        onClick={onNext}
        disabled={!nothingNotable && marks.length === 0}
        className="w-full py-3.5 bg-emerald-500/10 hover:bg-emerald-500/15 disabled:opacity-40 disabled:cursor-default border border-emerald-500/20 hover:border-emerald-500/35 rounded-xl text-emerald-300 font-mono text-xs uppercase tracking-widest transition-all duration-200"
      >
        Continue
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step C3: Intensity + reflection
// ---------------------------------------------------------------------------

interface StepC3Props {
  intensity?: number;
  freeText: string;
  onUpdate: (intensity: number, text: string) => void;
  onNext: () => void;
  onBack: () => void;
}

function StepC3({ intensity, freeText, onUpdate, onNext, onBack }: StepC3Props) {
  return (
    <div className="px-5 py-8 max-w-lg mx-auto space-y-6">
      <div>
        <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-neutral-500 mb-1">Step 3 of 4</p>
        <h2 className="text-2xl font-serif text-neutral-100">Overall intensity</h2>
        <p className="text-neutral-500 text-sm mt-1">How much do you notice in your body right now?</p>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {[2, 4, 6, 8, 10].map((val) => (
          <button
            key={val}
            onClick={() => onUpdate(val, freeText)}
            className={`py-3 rounded-xl border text-sm font-mono transition-all duration-150 ${
              intensity === val
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                : 'bg-neutral-900/50 border-neutral-800 text-neutral-500 hover:border-neutral-700'
            }`}
          >
            {val}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-neutral-600 font-mono px-1">
        <span>minimal</span>
        <span>moderate</span>
        <span>high</span>
      </div>

      <div>
        <label className="text-xs font-mono uppercase tracking-[0.15em] text-neutral-500 block mb-2">
          Any reflections? (optional)
        </label>
        <textarea
          value={freeText}
          onChange={(e) => onUpdate(intensity ?? 0, e.target.value)}
          placeholder="What's coming up for you?"
          rows={3}
          className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-200 placeholder-neutral-600 resize-none focus:outline-none focus:border-emerald-500/40 transition-colors"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 bg-neutral-900/50 border border-neutral-800 rounded-xl text-neutral-400 font-mono text-xs uppercase tracking-widest hover:border-neutral-700 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-[2] py-3.5 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 hover:border-emerald-500/35 rounded-xl text-emerald-300 font-mono text-xs uppercase tracking-widest transition-all duration-200"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step C4: Post-session state
// ---------------------------------------------------------------------------

interface StepC4Props {
  onSelect: (state: PostSessionState) => void;
  onBack: () => void;
}

function StepC4({ onSelect, onBack }: StepC4Props) {
  return (
    <div className="px-5 py-8 max-w-lg mx-auto space-y-6">
      <div>
        <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-neutral-500 mb-1">Step 4 of 4</p>
        <h2 className="text-2xl font-serif text-neutral-100">How are you right now?</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {POST_SESSION_STATES.map(({ value, label, description }) => (
          <button
            key={value}
            onClick={() => onSelect(value as PostSessionState)}
            className="p-4 bg-neutral-900/50 hover:bg-neutral-900/70 border border-neutral-800 hover:border-neutral-700 rounded-xl text-left transition-all duration-150"
          >
            <p className="text-sm font-medium text-neutral-200">{label}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{description}</p>
          </button>
        ))}
      </div>

      <button
        onClick={onBack}
        className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
      >
        ← Back
      </button>
    </div>
  );
}
