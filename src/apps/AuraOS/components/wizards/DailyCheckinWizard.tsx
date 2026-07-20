/**
 * DailyCheckinWizard.tsx
 *
 * 5-step daily integration check-in. Bridges insight → action.
 * "What did you notice / enact since last practice?"
 *
 * Steps:
 *  1. Mood Snapshot   — 3 sliders (energy, clarity, openness) + "what's present" text
 *  2. Since Last      — what did you DO differently since last session?
 *  3. What Showed Up  — patterns / insights noticed in daily life
 *  4. Edge            — growing edge / where being called
 *  5. Intention       — one small enactment + AI reflection
 *
 * Module: Mind (amber accent)
 */

import React, { useState, useCallback } from 'react';
import { z } from 'zod';
import { WizardFrame } from '../shared/WizardFrame';
import { useWizardDraft } from '../../hooks/useWizardDraft';
import { callGrokThenAIJson } from '../../services/ai/aiCore';
import { generateInsightFromSession } from '../../services/insightGenerator';
import { practices } from '../../constants';
import { getIconComponent } from '../../.claude/lib/iconMap';
import type { DailyCheckinSession } from '../../types';

// ---------------------------------------------------------------------------
// Keys
// ---------------------------------------------------------------------------
const DRAFT_KEY = 'aura-draft-daily-checkin';
const HISTORY_KEY = 'aura-history-daily-checkin';

// ---------------------------------------------------------------------------
// Local Zod schema for AI reflection
// ---------------------------------------------------------------------------
const checkinSchema = z.object({
  reflection: z.string().min(50).max(400),
});

// ---------------------------------------------------------------------------
// Draft shape
// ---------------------------------------------------------------------------
interface DailyCheckinDraft {
  sessionId: string;
  step: number;
  energy: number;
  clarity: number;
  openness: number;
  whatIsPresent: string;
  enactmentSince: string;
  relatedPractice: string;
  patternsNoticed: string;
  growingEdge: string;
  todayIntention: string;
  aiReflection: string;
}

const INITIAL_DRAFT: DailyCheckinDraft = {
  sessionId: `daily-checkin-${Date.now()}`,
  step: 1,
  energy: 5,
  clarity: 5,
  openness: 5,
  whatIsPresent: '',
  enactmentSince: '',
  relatedPractice: '',
  patternsNoticed: '',
  growingEdge: '',
  todayIntention: '',
  aiReflection: '',
};

// ---------------------------------------------------------------------------
// Isolated text area to prevent INP lag
// ---------------------------------------------------------------------------
interface TextAreaProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
  hint?: string;
}

function IsolatedTextArea({ value, onChange, placeholder, rows = 4, label, hint }: TextAreaProps) {
  const [local, setLocal] = useState(value);
  return (
    <div className="space-y-1">
      {label && <label className="text-xs font-semibold text-amber-400 uppercase tracking-widest">{label}</label>}
      <textarea
        className="w-full bg-slate-800/60 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none transition-colors"
        rows={rows}
        value={local}
        placeholder={placeholder}
        onChange={e => setLocal(e.target.value)}
        onBlur={() => onChange(local)}
      />
      {hint && <p className="text-xs text-slate-500 italic">{hint}</p>}
    </div>
  );
}

interface IsolatedInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  label?: string;
}

function IsolatedInput({ value, onChange, placeholder, label }: IsolatedInputProps) {
  const [local, setLocal] = useState(value);
  return (
    <div className="space-y-1">
      {label && <label className="text-xs font-semibold text-amber-400 uppercase tracking-widest">{label}</label>}
      <input
        type="text"
        className="w-full bg-slate-800/60 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
        value={local}
        placeholder={placeholder}
        onChange={e => setLocal(e.target.value)}
        onBlur={() => onChange(local)}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Slider
// ---------------------------------------------------------------------------
interface SliderProps {
  label: string;
  hint: string;
  value: number;
  onChange: (v: number) => void;
}

function MoodSlider({ label, hint, value, onChange }: SliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-200">{label}</span>
        <span className="text-lg font-bold text-amber-400 tabular-nums w-6 text-right">{value}</span>
      </div>
      <input
        type="range"
        min={0}
        max={10}
        step={1}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-amber-500 cursor-pointer"
      />
      <div className="flex justify-between text-xs text-slate-500">
        <span>0</span>
        <span className="text-slate-400 italic">{hint}</span>
        <span>10</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface DailyCheckinWizardProps {
  onClose: () => void;
  onSave: (session: DailyCheckinSession) => void;
  userId?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function DailyCheckinWizard({ onClose, onSave, userId }: DailyCheckinWizardProps) {
  const [draft, updateDraft, , clearDraft] = useWizardDraft<DailyCheckinDraft>(DRAFT_KEY, INITIAL_DRAFT);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const TOTAL_STEPS = 5;
  const step = draft.step;

  const goBack = useCallback(() => {
    if (step > 1) updateDraft({ step: step - 1 });
  }, [step, updateDraft]);

  // ---------------------------------------------------------------------------
  // Step handlers
  // ---------------------------------------------------------------------------
  const handleStep1Next = useCallback(() => {
    if (!draft.whatIsPresent.trim()) {
      setError('Please describe what is present for you right now.');
      return;
    }
    setError(null);
    updateDraft({ step: 2 });
  }, [draft.whatIsPresent, updateDraft]);

  const handleStep2Next = useCallback(() => {
    // enactmentSince can be brief but required
    if (!draft.enactmentSince.trim()) {
      setError('Please describe what you did differently, even if it was small.');
      return;
    }
    setError(null);
    updateDraft({ step: 3 });
  }, [draft.enactmentSince, updateDraft]);

  const handleStep3Next = useCallback(() => {
    if (!draft.patternsNoticed.trim()) {
      setError('Please share at least one pattern or observation from daily life.');
      return;
    }
    setError(null);
    updateDraft({ step: 4 });
  }, [draft.patternsNoticed, updateDraft]);

  const handleStep4Next = useCallback(() => {
    if (!draft.growingEdge.trim()) {
      setError('Please describe your growing edge before continuing.');
      return;
    }
    setError(null);
    updateDraft({ step: 5 });
  }, [draft.growingEdge, updateDraft]);

  // ---------------------------------------------------------------------------
  // Step 5: generate AI reflection + save
  // ---------------------------------------------------------------------------
  const handleComplete = useCallback(async () => {
    if (!draft.todayIntention.trim()) {
      setError('Please set your intention for today before completing.');
      return;
    }
    if (isSaving) return;
    setError(null);
    setIsSaving(true);

    let reflection = '';
    try {
      const prompt = `You are a skilled integration coach. A person has completed a 5-minute daily check-in. Weave their answers into a 2-3 sentence reflection that honors what they shared, connects their enactment to their growing edge, and affirms their intention — using their own words and register, not clinical vocabulary.

Mood snapshot: Energy ${draft.energy}/10, Clarity ${draft.clarity}/10, Openness ${draft.openness}/10
What is present: ${draft.whatIsPresent}
What they did differently since last practice: ${draft.enactmentSince}
Related practice: ${draft.relatedPractice || 'not specified'}
Patterns noticed in daily life: ${draft.patternsNoticed}
Growing edge: ${draft.growingEdge}
Today's intention: ${draft.todayIntention}

Return a JSON object:
{
  "reflection": "You brought real curiosity into your conversations today — noticing the pull to fix rather than listen is exactly the edge you named. That awareness is the practice. Carrying your intention to pause before responding gives that insight a place to land."
}

Use the person's own words and register — do not translate to clinical or spiritual vocabulary.
CRITICAL: Respond with ONLY valid JSON (no markdown, no explanation):`;

      const result = await callGrokThenAIJson('DailyCheckinWizard', prompt, undefined, checkinSchema);
      reflection = result.reflection;
    } catch (err) {
      console.error('[DailyCheckin] AI reflection failed:', err);
      reflection = `You showed up today with energy ${draft.energy}/10, clarity ${draft.clarity}/10, and openness ${draft.openness}/10. ${draft.todayIntention ? `Your intention — "${draft.todayIntention}" — is a concrete step forward.` : ''} Keep noticing.`.trim();
    }

    updateDraft({ aiReflection: reflection });

    const session: DailyCheckinSession = {
      id: draft.sessionId,
      date: new Date().toISOString(),
      energy: draft.energy,
      clarity: draft.clarity,
      openness: draft.openness,
      whatIsPresent: draft.whatIsPresent,
      enactmentSince: draft.enactmentSince,
      relatedPractice: draft.relatedPractice,
      patternsNoticed: draft.patternsNoticed,
      growingEdge: draft.growingEdge,
      todayIntention: draft.todayIntention,
      aiReflection: reflection,
    };

    // Persist to localStorage history (capped at 75)
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      const existing: DailyCheckinSession[] = raw ? JSON.parse(raw) : [];
      const updated = [...existing.filter(s => s.id !== session.id), session].slice(-75);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch {
      // non-fatal
    }

    // Generate insight
    if (userId) {
      try {
        const report = [
          `# Daily Integration Check-in`,
          `Date: ${session.date}`,
          `Energy: ${session.energy}/10 | Clarity: ${session.clarity}/10 | Openness: ${session.openness}/10`,
          `What is present: ${session.whatIsPresent}`,
          `Since last practice: ${session.enactmentSince}`,
          `Related practice: ${session.relatedPractice || 'not specified'}`,
          `Patterns noticed: ${session.patternsNoticed}`,
          `Growing edge: ${session.growingEdge}`,
          `Today's intention: ${session.todayIntention}`,
          `AI reflection: ${session.aiReflection}`,
        ].join('\n');

        const summary = `Daily check-in: energy ${session.energy}/10, enactment since last practice: "${session.enactmentSince.slice(0, 100)}". Growing edge: "${session.growingEdge.slice(0, 80)}". Intention: "${session.todayIntention}".`;

        await generateInsightFromSession({
          wizardType: 'Daily Integration Check-in',
          sessionId: session.id,
          sessionName: 'Daily Integration Check-in',
          sessionReport: report,
          sessionSummary: summary,
          userId,
          availablePractices: Object.values(practices).flatMap(cat =>
            Array.isArray(cat) ? cat.map(p => ({ id: p.id, name: p.name })) : []
          ),
          dataContext: {
            totalSessions: 1,
            sessionsInLastWeek: 1,
            existingInsights: 0,
          },
        });
      } catch (err) {
        console.error('[DailyCheckin] Insight generation failed:', err);
      }
    }

    clearDraft();
    onSave(session);
    setIsSaving(false);
  }, [draft, isSaving, userId, updateDraft, clearDraft, onSave]);

  // ---------------------------------------------------------------------------
  // Next handler dispatch
  // ---------------------------------------------------------------------------
  const handleNext = useCallback(async () => {
    switch (step) {
      case 1: handleStep1Next(); break;
      case 2: handleStep2Next(); break;
      case 3: handleStep3Next(); break;
      case 4: handleStep4Next(); break;
      case 5: await handleComplete(); break;
    }
  }, [step, handleStep1Next, handleStep2Next, handleStep3Next, handleStep4Next, handleComplete]);

  const IconComponent = getIconComponent('AscensionFlame');

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------
  const avgMood = ((draft.energy + draft.clarity + draft.openness) / 3).toFixed(1);

  return (
    <WizardFrame
      title="Daily Integration Check-in"
      currentStep={step}
      totalSteps={TOTAL_STEPS}
      isLoading={isLoading || isSaving}
      showBackButton={step > 1}
      nextButtonText={step === 5 ? (isSaving ? 'Generating...' : 'Complete') : 'Continue'}
      onClose={onClose}
      onBack={goBack}
      onNext={handleNext}
      accentColor="amber"
      nextButtonDisabled={isSaving}
      errorMessage={error}
    >
      <div className="space-y-6 px-1">
        {/* Header icon */}
        <div className="flex items-center gap-3 mb-2">
          {IconComponent && (
            <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 text-amber-400">
              {React.createElement(IconComponent, { size: 22 })}
            </div>
          )}
          <div>
            <p className="text-xs font-mono text-amber-400 uppercase tracking-widest">Step {step} of {TOTAL_STEPS}</p>
          </div>
        </div>

        {/* Step 1: Mood Snapshot */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-serif font-bold text-slate-100 mb-1">Mood Snapshot</h2>
              <p className="text-sm text-slate-400">Where are you right now? Three numbers and a sentence.</p>
            </div>
            <div className="space-y-5 bg-slate-900/50 rounded-xl p-5 border border-slate-800">
              <MoodSlider
                label="Energy"
                hint="drained → vital"
                value={draft.energy}
                onChange={v => updateDraft({ energy: v })}
              />
              <MoodSlider
                label="Clarity"
                hint="foggy → sharp"
                value={draft.clarity}
                onChange={v => updateDraft({ clarity: v })}
              />
              <MoodSlider
                label="Openness"
                hint="contracted → open"
                value={draft.openness}
                onChange={v => updateDraft({ openness: v })}
              />
              <div className="pt-1 border-t border-slate-800 text-center">
                <span className="text-xs text-slate-500">Average: </span>
                <span className="text-amber-400 font-bold">{avgMood}</span>
                <span className="text-xs text-slate-500"> / 10</span>
              </div>
            </div>
            <IsolatedTextArea
              label="What's present right now?"
              value={draft.whatIsPresent}
              onChange={v => updateDraft({ whatIsPresent: v })}
              placeholder="A sentence or two. What's alive in you today — emotion, thought, body state?"
              rows={3}
            />
          </div>
        )}

        {/* Step 2: Since Last Practice */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-serif font-bold text-slate-100 mb-1">Since Last Practice</h2>
              <p className="text-sm text-slate-400">Insight without enactment is just interesting. What moved?</p>
            </div>
            <IsolatedTextArea
              label="What did you actually DO differently?"
              value={draft.enactmentSince}
              onChange={v => updateDraft({ enactmentSince: v })}
              placeholder="Even small counts. A pause before reacting. A conversation you approached differently. A boundary held."
              rows={5}
              hint="Be concrete — behavior, not intention."
            />
            <IsolatedInput
              label="Related practice or wizard (optional)"
              value={draft.relatedPractice}
              onChange={v => updateDraft({ relatedPractice: v })}
              placeholder="e.g. IFS, Shadow Journaling, Polarity Mapper…"
            />
          </div>
        )}

        {/* Step 3: What Showed Up */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-serif font-bold text-slate-100 mb-1">What Showed Up</h2>
              <p className="text-sm text-slate-400">Patterns don't stay in the session — they appear in life.</p>
            </div>
            <IsolatedTextArea
              label="What patterns or insights emerged in daily life?"
              value={draft.patternsNoticed}
              onChange={v => updateDraft({ patternsNoticed: v })}
              placeholder="A recurring reaction. A moment of recognition. Something you caught yourself doing. A feeling that kept returning."
              rows={6}
              hint="Use your own words — not psychological labels."
            />
          </div>
        )}

        {/* Step 4: Edge */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-serif font-bold text-slate-100 mb-1">Your Growing Edge</h2>
              <p className="text-sm text-slate-400">Where is life pressing you to grow right now?</p>
            </div>
            <div className="bg-amber-950/30 border border-amber-800/30 rounded-xl p-4 text-sm text-amber-200/80 italic">
              "The edge is not where you fail — it is where you are still learning to succeed."
            </div>
            <IsolatedTextArea
              label="Where are you being called?"
              value={draft.growingEdge}
              onChange={v => updateDraft({ growingEdge: v })}
              placeholder="What is the thing you keep avoiding, circling, or not quite reaching? Where do you feel the pull to grow?"
              rows={5}
              hint="Be honest. The edge is usually where there is some discomfort."
            />
          </div>
        )}

        {/* Step 5: Intention + AI Reflection */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-serif font-bold text-slate-100 mb-1">Today's Intention</h2>
              <p className="text-sm text-slate-400">One small, concrete enactment. Not a goal — a gesture.</p>
            </div>
            <IsolatedInput
              label="One small enactment for today"
              value={draft.todayIntention}
              onChange={v => updateDraft({ todayIntention: v })}
              placeholder="e.g. 'Pause three seconds before I respond to criticism today.'"
            />

            {draft.aiReflection && (
              <div className="bg-slate-900/70 border border-amber-500/20 rounded-xl p-5 space-y-2">
                <p className="text-xs font-mono text-amber-400 uppercase tracking-widest">Integration Reflection</p>
                <p className="text-sm text-slate-200 leading-relaxed italic">"{draft.aiReflection}"</p>
              </div>
            )}

            {!draft.aiReflection && (
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 text-sm text-slate-400">
                <p>Complete your intention above, then hit <strong className="text-amber-400">Complete</strong> to receive your integration reflection.</p>
              </div>
            )}

            {/* Summary of check-in */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-2">
              <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">Today's Check-in</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[['Energy', draft.energy], ['Clarity', draft.clarity], ['Openness', draft.openness]].map(([label, val]) => (
                  <div key={String(label)} className="bg-slate-800/60 rounded-lg p-2">
                    <div className="text-lg font-bold text-amber-400">{val}</div>
                    <div className="text-xs text-slate-500">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </WizardFrame>
  );
}
