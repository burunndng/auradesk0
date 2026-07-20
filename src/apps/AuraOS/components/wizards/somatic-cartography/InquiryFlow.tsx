/**
 * Somatic Cartography — InquiryFlow
 * Steps I1–I3: locate → offline timer → capture. Foundation level only.
 * Includes pacing gate, access gate, adverse-state check, and wellbeing conversation.
 */

import React, { useState, useCallback } from 'react';
import type {
  InquiryDraft,
  InquiryStep,
  BodyMapHistoryEntry,
  PostSessionState,
  SafetyProfile,
} from './types';
import {
  INQUIRY_DRAFT_KEY,
  INQUIRY_COOLDOWN_MS,
  POST_SESSION_STATES,
  INQUIRY_PROMPTS,
  ZONE_LABELS,
  DISMISS_PAUSE_THRESHOLD,
  type SomaticBodyZone,
} from './constants';
import { checkAdversePattern } from '../SomaticCartographyWizard';
import OfflineTimer from './OfflineTimer';

// ---------------------------------------------------------------------------
// Storage helpers
// ---------------------------------------------------------------------------

function readDraft(): InquiryDraft | null {
  try {
    const raw = localStorage.getItem(INQUIRY_DRAFT_KEY);
    return raw ? (JSON.parse(raw) as InquiryDraft) : null;
  } catch {
    return null;
  }
}

function saveDraft(draft: InquiryDraft): void {
  localStorage.setItem(INQUIRY_DRAFT_KEY, JSON.stringify(draft));
}

function buildInitialDraft(anchorZone?: string): InquiryDraft {
  return {
    sessionId: crypto.randomUUID(),
    startedAt: new Date().toISOString(),
    step: 'I1',
    anchorZone,
    completedHere: false,
  };
}

const OFFLINE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface InquiryFlowProps {
  userId: string;
  safetyProfile: SafetyProfile;
  history: BodyMapHistoryEntry[];
  resumeFromBackground: boolean;
  onComplete: (postState: PostSessionState | undefined, lastInquiryAt: string) => void;
  onUpdateProfile: (updates: Partial<SafetyProfile>) => void;
  onBack: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function InquiryFlow({
  userId,
  safetyProfile,
  history,
  resumeFromBackground,
  onComplete,
  onUpdateProfile,
  onBack,
}: InquiryFlowProps) {
  // Pacing gate
  const isPaced = safetyProfile.lastInquiryAt
    ? Date.now() - new Date(safetyProfile.lastInquiryAt).getTime() < INQUIRY_COOLDOWN_MS
    : false;

  // Access gate
  const isPaused = safetyProfile.accessLevel === 'inquiry_paused';

  // Top zone from recent history
  const topZone = (() => {
    const freq: Record<string, number> = {};
    history.slice(0, 10).forEach((e) => e.marks.forEach((m) => {
      freq[m.zone] = (freq[m.zone] || 0) + 1;
    }));
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0];
  })();

  const existingDraft = readDraft();
  const [draft, setDraft] = useState<InquiryDraft>(() => {
    if (resumeFromBackground && existingDraft) return existingDraft;
    return buildInitialDraft(topZone);
  });

  const [wellbeingShown, setWellbeingShown] = useState(false);

  const updateDraft = useCallback((updates: Partial<InquiryDraft>) => {
    setDraft((prev) => {
      const next = { ...prev, ...updates };
      saveDraft(next);
      return next;
    });
  }, []);

  // Complete here — jump to post-state
  const handleCompleteHere = useCallback(() => {
    updateDraft({ completedHere: true, step: 'POST_STATE' });
  }, [updateDraft]);

  // Called after post-session state is selected
  const handlePostState = useCallback(
    (state: PostSessionState) => {
      const lastInquiryAt = new Date().toISOString();
      updateDraft({ postSessionState: state });
      // Check if adverse monitoring should trigger wellbeing conversation
      const testProfile = { ...safetyProfile, adverseSessionFlags: [...safetyProfile.adverseSessionFlags, state] };
      const adverseResult = checkAdversePattern(testProfile);
      if (adverseResult === 'warn' && !wellbeingShown) {
        setWellbeingShown(true);
        // Save state to profile
        onUpdateProfile({ adverseSessionFlags: testProfile.adverseSessionFlags });
        return; // WellbeingConversation screen will render
      }
      // No warn — complete normally
      onUpdateProfile({ adverseSessionFlags: testProfile.adverseSessionFlags });
      onComplete(state, lastInquiryAt);
    },
    [safetyProfile, wellbeingShown, onUpdateProfile, onComplete]
  );

  const handleWellbeingDismiss = useCallback(() => {
    const newCount = safetyProfile.inquiryDismissCount + 1;
    if (newCount >= DISMISS_PAUSE_THRESHOLD) {
      onUpdateProfile({ inquiryDismissCount: newCount, accessLevel: 'inquiry_paused' });
    } else {
      onUpdateProfile({ inquiryDismissCount: newCount });
    }
    onComplete(draft.postSessionState, new Date().toISOString());
  }, [safetyProfile, draft, onUpdateProfile, onComplete]);

  const handleWellbeingSupport = useCallback(() => {
    onUpdateProfile({ inquiryDismissCount: 0, accessLevel: 'support_referred' });
    onComplete(draft.postSessionState, new Date().toISOString());
  }, [draft, onUpdateProfile, onComplete]);

  // ---------------------------------------------------------------------------
  // Render gates
  // ---------------------------------------------------------------------------

  if (isPaused) {
    return <InquiryPausedScreen onBack={onBack} />;
  }

  if (isPaced) {
    const nextAvailableAt = new Date(
      new Date(safetyProfile.lastInquiryAt!).getTime() + INQUIRY_COOLDOWN_MS
    );
    return (
      <RestPeriodScreen
        nextAvailableAt={nextAvailableAt}
        onOverride={() => setDraft(buildInitialDraft(topZone))} // clears pacing — handled by parent via override
        onBack={onBack}
      />
    );
  }

  if (wellbeingShown) {
    return (
      <WellbeingConversationScreen
        onDismiss={handleWellbeingDismiss}
        onFindSupport={handleWellbeingSupport}
        onLighterSessions={() => {
          onUpdateProfile({ accessLevel: 'inquiry_paused', inquiryDismissCount: 0 });
          onComplete(draft.postSessionState, new Date().toISOString());
        }}
      />
    );
  }

  // ---------------------------------------------------------------------------
  // Main flow
  // ---------------------------------------------------------------------------

  const prompt =
    INQUIRY_PROMPTS[draft.anchorZone as SomaticBodyZone] ?? INQUIRY_PROMPTS.default;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Offline timer (full-screen overlay) */}
      {draft.step === 'I2' && draft.offlineStartAt && (
        <OfflineTimer
          durationMs={OFFLINE_DURATION_MS}
          startedAt={draft.offlineStartAt}
          prompt={prompt}
          onComplete={(returnedAt) =>
            updateDraft({ step: 'I3', offlineReturnAt: returnedAt })
          }
          onEarlyReturn={(returnedAt) =>
            updateDraft({ step: 'I3', offlineReturnAt: returnedAt })
          }
        />
      )}

      {/* Header */}
      {draft.step !== 'I2' && (
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-neutral-800/60">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-200 transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>
          <p className="text-xs font-mono uppercase tracking-[0.15em] text-neutral-500">Inquiry</p>
          <div className="w-16" />
        </div>
      )}

      {/* Step content */}
      {draft.step !== 'I2' && (
        <div className="flex-1 overflow-y-auto">
          {draft.step === 'I1' && (
            <StepI1
              anchorZone={draft.anchorZone}
              history={history}
              onSelectZone={(zone) => updateDraft({ anchorZone: zone })}
              onBeginOffline={() =>
                updateDraft({
                  step: 'I2',
                  offlineStartAt: new Date().toISOString(),
                  offlineDurationMs: OFFLINE_DURATION_MS,
                })
              }
              onCompleteHere={handleCompleteHere}
            />
          )}

          {draft.step === 'I3' && (
            <StepI3
              notes={draft.i3IntegrationNotes ?? ''}
              onUpdateNotes={(n) => updateDraft({ i3IntegrationNotes: n })}
              onCompleteHere={handleCompleteHere}
              onFinish={() => updateDraft({ step: 'POST_STATE' })}
            />
          )}

          {draft.step === 'POST_STATE' && (
            <PostSessionStateScreen onSelect={handlePostState} />
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step I1: Zone selection + prompt display
// ---------------------------------------------------------------------------

interface StepI1Props {
  anchorZone?: string;
  history: BodyMapHistoryEntry[];
  onSelectZone: (zone: string) => void;
  onBeginOffline: () => void;
  onCompleteHere: () => void;
}

function StepI1({ anchorZone, history, onSelectZone, onBeginOffline, onCompleteHere }: StepI1Props) {
  // Top zones from recent history
  const topZones = (() => {
    const freq: Record<string, number> = {};
    history.slice(0, 15).forEach((e) => e.marks.forEach((m) => {
      freq[m.zone] = (freq[m.zone] || 0) + 1;
    }));
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([z]) => z);
  })();

  return (
    <div className="px-5 py-8 max-w-lg mx-auto space-y-6">
      <div>
        <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-neutral-500 mb-1">Step 1 — Locate</p>
        <h2 className="text-2xl font-serif text-neutral-100">Choose a zone to explore</h2>
        <p className="text-neutral-500 text-sm mt-1">Based on your recent check-ins</p>
      </div>

      {/* Zone selection */}
      {topZones.length > 0 ? (
        <div className="space-y-2">
          {topZones.map((zone) => (
            <button
              key={zone}
              onClick={() => onSelectZone(zone)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-150 text-left ${
                anchorZone === zone
                  ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-200'
                  : 'bg-neutral-900/50 border-neutral-800 text-neutral-300 hover:border-neutral-700'
              }`}
            >
              <span className="text-sm">{ZONE_LABELS[zone as SomaticBodyZone] ?? zone.replace(/_/g, ' ')}</span>
              {anchorZone === zone && <span className="text-emerald-400 text-xs">selected</span>}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-neutral-500 text-sm">Complete some check-ins first to see zone suggestions here.</p>
      )}

      {/* What happens next */}
      {anchorZone && (
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-4 space-y-2">
          <p className="text-xs font-mono uppercase tracking-[0.15em] text-neutral-500">How this works</p>
          <p className="text-sm text-neutral-400 leading-relaxed">
            You'll read a short prompt, then the screen will dim for 5 minutes.
            During that time, you direct your attention to this area and observe — no analyzing, just noticing.
            Come back whenever you're ready.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <button
          onClick={onBeginOffline}
          disabled={!anchorZone}
          className="w-full py-4 bg-emerald-500/15 hover:bg-emerald-500/20 disabled:opacity-40 disabled:cursor-default border border-emerald-500/25 hover:border-emerald-500/40 rounded-xl text-emerald-300 font-mono text-sm uppercase tracking-widest transition-all duration-200"
        >
          Begin Offline Period
        </button>
        <button
          onClick={onCompleteHere}
          className="w-full py-3.5 bg-neutral-900/50 hover:bg-neutral-900/70 border border-neutral-800 hover:border-neutral-700 rounded-xl text-neutral-400 font-mono text-sm uppercase tracking-widest transition-all duration-150"
        >
          Complete Here
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step I3: Capture after offline period
// ---------------------------------------------------------------------------

interface StepI3Props {
  notes: string;
  onUpdateNotes: (n: string) => void;
  onCompleteHere: () => void;
  onFinish: () => void;
}

function StepI3({ notes, onUpdateNotes, onCompleteHere, onFinish }: StepI3Props) {
  return (
    <div className="px-5 py-8 max-w-lg mx-auto space-y-6">
      <div>
        <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-neutral-500 mb-1">Step 3 — Capture</p>
        <h2 className="text-2xl font-serif text-neutral-100">What did you find?</h2>
        <p className="text-neutral-500 text-sm mt-1">Movement, quality, edges — or just what was there</p>
      </div>

      <textarea
        value={notes}
        onChange={(e) => onUpdateNotes(e.target.value)}
        placeholder="Write what emerged, or leave this blank…"
        rows={6}
        className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-200 placeholder-neutral-600 resize-none focus:outline-none focus:border-emerald-500/40 transition-colors"
      />

      <div className="flex flex-col gap-3">
        <button
          onClick={onFinish}
          className="w-full py-4 bg-emerald-500/15 hover:bg-emerald-500/20 border border-emerald-500/25 hover:border-emerald-500/40 rounded-xl text-emerald-300 font-mono text-sm uppercase tracking-widest transition-all duration-200"
        >
          Save Session
        </button>
        <button
          onClick={onCompleteHere}
          className="w-full py-3.5 bg-neutral-900/50 hover:bg-neutral-900/70 border border-neutral-800 hover:border-neutral-700 rounded-xl text-neutral-400 font-mono text-sm uppercase tracking-widest transition-all duration-150"
        >
          Complete Here
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Post-session state
// ---------------------------------------------------------------------------

function PostSessionStateScreen({ onSelect }: { onSelect: (state: PostSessionState) => void }) {
  return (
    <div className="px-5 py-8 max-w-lg mx-auto space-y-6">
      <h2 className="text-2xl font-serif text-neutral-100">How are you right now?</h2>
      <p className="text-neutral-500 text-sm">After the session — honest check-in</p>

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
    </div>
  );
}

// ---------------------------------------------------------------------------
// Gates
// ---------------------------------------------------------------------------

function InquiryPausedScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="px-5 py-8 max-w-lg mx-auto space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-200 transition-colors mb-2">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back
      </button>
      <h2 className="text-2xl font-serif text-neutral-100">Inquiry is resting</h2>
      <p className="text-neutral-400 text-sm leading-relaxed">
        Recent sessions have been leaving you stirred up or foggy. This happens when inner work
        moves faster than it can settle.
      </p>
      <p className="text-neutral-400 text-sm leading-relaxed">
        Check-ins and grounding practice are still available. Inquiry will be here when you're ready.
      </p>
      <p className="text-neutral-500 text-xs">
        You can re-enable inquiry in Settings.
      </p>
    </div>
  );
}

interface RestPeriodScreenProps {
  nextAvailableAt: Date;
  onOverride: () => void;
  onBack: () => void;
}

function RestPeriodScreen({ nextAvailableAt, onOverride, onBack }: RestPeriodScreenProps) {
  const formatted = nextAvailableAt.toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });

  return (
    <div className="px-5 py-8 max-w-lg mx-auto space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-200 transition-colors mb-2">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back
      </button>
      <h2 className="text-2xl font-serif text-neutral-100">Integration rest period</h2>
      <p className="text-neutral-400 text-sm leading-relaxed">
        A 48-hour rest between inquiry sessions gives what emerged time to settle before going deeper.
      </p>
      <p className="text-neutral-300 text-sm">
        Next inquiry available: <span className="text-emerald-400">{formatted}</span>
      </p>
      <p className="text-neutral-500 text-sm">
        Check-ins, pattern journal, and grounding practice are all available now.
      </p>
      <button
        onClick={onOverride}
        className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors underline underline-offset-2"
      >
        Continue anyway — I know my own capacity
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Wellbeing conversation
// ---------------------------------------------------------------------------

interface WellbeingConversationProps {
  onDismiss: () => void;
  onFindSupport: () => void;
  onLighterSessions: () => void;
}

function WellbeingConversationScreen({ onDismiss, onFindSupport, onLighterSessions }: WellbeingConversationProps) {
  return (
    <div className="px-5 py-8 max-w-lg mx-auto space-y-6">
      <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-5 space-y-3">
        <p className="text-amber-300/80 text-[11px] font-mono uppercase tracking-[0.15em]">A check-in</p>
        <p className="text-neutral-300 text-sm leading-relaxed">
          The last couple of sessions have left you feeling stirred up, foggy, or disconnected.
        </p>
        <p className="text-neutral-400 text-sm leading-relaxed">
          This sometimes happens when inner work is moving faster than it can settle. It's useful information — not a problem.
        </p>
      </div>

      <p className="text-neutral-400 text-sm">What would feel right?</p>

      <div className="space-y-3">
        {[
          {
            label: 'Lighter sessions for a while',
            desc: 'More check-ins, less deep inquiry',
            action: onLighterSessions,
            style: 'bg-neutral-900/50 border-neutral-800 text-neutral-300',
          },
          {
            label: 'I\'d like to talk to someone',
            desc: 'Show support resources',
            action: onFindSupport,
            style: 'bg-neutral-900/50 border-neutral-800 text-neutral-300',
          },
          {
            label: 'Continue',
            desc: 'I feel okay — this is part of the work',
            action: onDismiss,
            style: 'bg-neutral-900/40 border-neutral-800/50 text-neutral-400',
          },
        ].map(({ label, desc, action, style }) => (
          <button
            key={label}
            onClick={action}
            className={`w-full p-4 rounded-xl border transition-all duration-150 text-left ${style} hover:border-neutral-700`}
          >
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
