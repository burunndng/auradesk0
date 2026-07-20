/**
 * Somatic Cartography — OnboardingFlow
 * 5-screen first-time setup: intro × 2, crisis check, silhouette selection, AI pref.
 */

import React, { useState } from 'react';
import type { SafetyProfile, SilhouettePreference } from './types';
import { SAFETY_PROFILE_KEY } from './constants';
import { EngramArchiveIcon } from '../../visualizations/SacredGeometryIcons';

interface OnboardingFlowProps {
  userId: string;
  onComplete: (profile: SafetyProfile) => void;
}

type OnboardingStep = 'O1' | 'O2' | 'O3' | 'O4' | 'O5';

const STEP_ORDER: OnboardingStep[] = ['O1', 'O2', 'O3', 'O4', 'O5'];

export default function OnboardingFlow({ userId, onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<OnboardingStep>('O1');
  const [silhouettePreference, setSilhouettePreference] = useState<SilhouettePreference>('front_back');
  const [aiEnabled, setAiEnabled] = useState(true);

  const goNext = () => {
    const idx = STEP_ORDER.indexOf(step);
    if (idx < STEP_ORDER.length - 1) {
      setStep(STEP_ORDER[idx + 1]);
    }
  };

  const handleComplete = () => {
    const profile: SafetyProfile = {
      userId,
      accessLevel: 'standard',
      onboardingCompletedAt: new Date().toISOString(),
      silhouettePreference,
      aiEnabled,
      adverseSessionFlags: [],
      inquiryDismissCount: 0,
    };
    onComplete(profile);
  };

  return (
    <div className="px-5 py-10 max-w-md mx-auto min-h-screen flex flex-col">
      {/* Progress dots */}
      <div className="flex items-center gap-2 mb-10">
        {STEP_ORDER.map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              STEP_ORDER.indexOf(s) <= STEP_ORDER.indexOf(step)
                ? 'bg-emerald-500'
                : 'bg-neutral-800'
            }`}
          />
        ))}
      </div>

      {/* Step content */}
      <div className="flex-1">
        {step === 'O1' && <StepO1 onNext={goNext} />}
        {step === 'O2' && <StepO2 onNext={goNext} />}
        {step === 'O3' && <StepO3 onNext={goNext} />}
        {step === 'O4' && (
          <StepO4
            silhouettePreference={silhouettePreference}
            onSelect={setSilhouettePreference}
            onNext={goNext}
          />
        )}
        {step === 'O5' && (
          <StepO5
            aiEnabled={aiEnabled}
            onToggleAi={setAiEnabled}
            onComplete={handleComplete}
          />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step O1: What this tool is
// ---------------------------------------------------------------------------

function StepO1({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <EngramArchiveIcon size={24} />
        </div>
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500">Body · Somatic</p>
          <h1 className="text-xl font-serif text-neutral-100">Somatic Cartography</h1>
        </div>
      </div>

      <div className="space-y-5">
        <p className="text-neutral-200 text-lg font-serif leading-relaxed">
          This tool helps you track and explore recurring body patterns over time.
        </p>
        <div className="space-y-3 text-neutral-400 text-sm leading-relaxed">
          <p>
            You'll build an interactive map of where tension, discomfort, or notable sensations
            show up in your body — and gradually see what contexts they live in.
          </p>
          <p>
            The tool also offers structured inquiry sessions for going a little deeper, when you're ready.
          </p>
        </div>

        <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4 text-sm text-neutral-400 leading-relaxed">
          <p className="text-neutral-500 text-[11px] font-mono uppercase tracking-[0.15em] mb-2">Evidence base</p>
          <p>
            This tool draws on somatic psychology traditions alongside contemporary research in
            interoception. Some foundations are well-researched. Some are clinically practiced but
            less studied. The Learn section has the full picture.
          </p>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full py-4 bg-emerald-500/15 hover:bg-emerald-500/20 border border-emerald-500/25 hover:border-emerald-500/40 rounded-xl text-emerald-300 font-mono text-sm uppercase tracking-widest transition-all duration-200"
      >
        Continue
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step O2: How it works
// ---------------------------------------------------------------------------

function StepO2({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-serif text-neutral-100">How it works</h2>

      <div className="space-y-4">
        {[
          {
            title: 'Daily check-ins',
            desc: 'Tap zones on a body map to record where you notice tension or sensation. Takes about 2 minutes. This is the core of the tool — consistency here is what makes patterns visible.',
          },
          {
            title: 'Inquiry sessions',
            desc: 'A structured practice for going deeper into a specific zone. Involves brief offline periods (screen dims) where you do felt-sensing internally. Available when you\'re ready — not required.',
          },
          {
            title: 'Pattern journal',
            desc: 'As data accumulates, a heat map shows which zones appear most often, what contexts they live in, and how they change over time.',
          },
        ].map(({ title, desc }) => (
          <div key={title} className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4">
            <p className="text-sm font-medium text-neutral-200 mb-1">{title}</p>
            <p className="text-sm text-neutral-400 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-neutral-900/40 border border-amber-500/10 rounded-xl p-4 text-sm text-neutral-400 leading-relaxed">
        <p className="text-amber-400/70 text-[11px] font-mono uppercase tracking-[0.15em] mb-2">Worth knowing</p>
        <p>
          This tool can surface meaningful material. It works with some of the same territory as therapy —
          but it is not therapy. If things feel overwhelming, the grounding practice and support
          resources are always accessible from the home screen.
        </p>
      </div>

      <button
        onClick={onNext}
        className="w-full py-4 bg-emerald-500/15 hover:bg-emerald-500/20 border border-emerald-500/25 hover:border-emerald-500/40 rounded-xl text-emerald-300 font-mono text-sm uppercase tracking-widest transition-all duration-200"
      >
        Continue
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step O3: Crisis screen
// ---------------------------------------------------------------------------

function StepO3({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-serif text-neutral-100">One check before we start</h2>

      <div className="space-y-4 text-neutral-300 text-sm leading-relaxed">
        <p>
          Somatic work can bring up material that's better held with support than explored alone.
        </p>
        <p>
          If you're currently in active crisis, experiencing acute trauma symptoms, or feeling
          overwhelmed — this isn't the right moment to start.
        </p>
        <p>
          The grounding practice and support resources in this tool are available any time without
          requiring onboarding. You can access them from the home screen.
        </p>
      </div>

      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 text-sm text-neutral-400">
        <p className="mb-3">Are you in a reasonably stable place to begin?</p>
        <div className="space-y-2">
          <button
            onClick={onNext}
            className="w-full py-3 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 hover:border-emerald-500/30 rounded-lg text-emerald-300 text-sm transition-all duration-150 text-left px-4"
          >
            Yes — I'm in a reasonably stable place
          </button>
          <p className="text-center text-neutral-600 text-xs py-1">or</p>
          <p className="text-xs text-neutral-500 text-center leading-relaxed">
            If not, you can skip onboarding and access grounding resources directly.
            The tool will be here when you're ready.
          </p>
        </div>
      </div>

      <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-4 text-xs text-neutral-500 space-y-1">
        <p className="text-neutral-400 font-medium">Support resources</p>
        <p>US Crisis Line: 988 (call or text)</p>
        <p>Crisis Text Line: Text HOME to 741741</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step O4: Silhouette preference
// ---------------------------------------------------------------------------

interface StepO4Props {
  silhouettePreference: SilhouettePreference;
  onSelect: (pref: SilhouettePreference) => void;
  onNext: () => void;
}

function StepO4({ silhouettePreference, onSelect, onNext }: StepO4Props) {
  const options: Array<{ value: SilhouettePreference; label: string; description: string }> = [
    { value: 'front_back', label: 'Front & Back', description: 'Toggle between front and back body views' },
    { value: 'front_only', label: 'Front Only', description: 'Single front-view body map' },
    { value: 'text_list', label: 'Text List', description: 'Zone names as a selectable list — no body image' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-serif text-neutral-100">Choose your body map style</h2>
        <p className="text-neutral-400 text-sm mt-2 leading-relaxed">
          You can change this any time in Settings.
        </p>
      </div>

      <div className="space-y-3">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-150 text-left ${
              silhouettePreference === opt.value
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-neutral-900/50 border-neutral-800 hover:border-neutral-700'
            }`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
              silhouettePreference === opt.value
                ? 'border-emerald-400'
                : 'border-neutral-600'
            }`}>
              {silhouettePreference === opt.value && (
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              )}
            </div>
            <div>
              <p className={`text-sm font-medium ${silhouettePreference === opt.value ? 'text-emerald-200' : 'text-neutral-300'}`}>
                {opt.label}
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">{opt.description}</p>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={onNext}
        className="w-full py-4 bg-emerald-500/15 hover:bg-emerald-500/20 border border-emerald-500/25 hover:border-emerald-500/40 rounded-xl text-emerald-300 font-mono text-sm uppercase tracking-widest transition-all duration-200"
      >
        Continue
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step O5: AI preference + completion
// ---------------------------------------------------------------------------

interface StepO5Props {
  aiEnabled: boolean;
  onToggleAi: (v: boolean) => void;
  onComplete: () => void;
}

function StepO5({ aiEnabled, onToggleAi, onComplete }: StepO5Props) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-serif text-neutral-100">Pattern observations</h2>
        <p className="text-neutral-400 text-sm mt-2 leading-relaxed">
          After enough check-ins, the tool can surface simple observations about your patterns.
        </p>
      </div>

      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 space-y-3 text-sm">
        <p className="text-neutral-300">What this does:</p>
        <ul className="space-y-2 text-neutral-400">
          {[
            'Shows which zones appear most often',
            'Notes which context tags co-occur with high intensity',
            'Identifies repeated words in your free-text notes',
          ].map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-emerald-500 flex-shrink-0">·</span>
              {item}
            </li>
          ))}
        </ul>
        <p className="text-neutral-500 text-xs pt-1 border-t border-neutral-800">
          This never interprets what patterns mean. It reports what the data shows.
        </p>
      </div>

      <button
        onClick={() => onToggleAi(!aiEnabled)}
        className="w-full flex items-center justify-between p-4 bg-neutral-900/50 border border-neutral-800 rounded-xl hover:border-neutral-700 transition-colors"
      >
        <div>
          <p className="text-sm text-neutral-200 text-left">Enable pattern observations</p>
          <p className="text-xs text-neutral-500 mt-0.5 text-left">You can turn this off any time in Settings</p>
        </div>
        <div className={`w-11 h-6 rounded-full border-2 transition-colors flex-shrink-0 relative ${
          aiEnabled ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-neutral-800 border-neutral-700'
        }`}>
          <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200 ${
            aiEnabled ? 'bg-emerald-400 left-5' : 'bg-neutral-500 left-0.5'
          }`} />
        </div>
      </button>

      <button
        onClick={onComplete}
        className="w-full py-4 bg-emerald-500/15 hover:bg-emerald-500/20 border border-emerald-500/25 hover:border-emerald-500/40 rounded-xl text-emerald-300 font-mono text-sm uppercase tracking-widest transition-all duration-200"
      >
        Begin
      </button>
    </div>
  );
}
