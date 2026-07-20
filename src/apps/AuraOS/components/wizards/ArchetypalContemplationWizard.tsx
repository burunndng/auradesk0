import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { z } from 'zod';
import { useContemplationSession, ContemplationStep, ContemplationSessionState } from '../../hooks/useContemplationSession';
import type { ExperienceLevel, PreferredFace, SessionDepth } from '../../hooks/useContemplationSession';
import { drawRandomCard, MAJOR_ARCANA } from '../../data/majorArcana';
import type { MajorArcanaCard } from '../../data/majorArcana';
import {
  buildResonancePrompt,
  buildClosingPrompt,
} from '../../services/archetypalResonanceGenerator';
import type { ResonanceResponse, ClosingResponse } from '../../services/archetypalResonanceGenerator';
import { callGrokThenAIJson } from '../../services/ai/aiCore';
import { detectCrisisLevel } from '../../utils/crisisDetection';
import SafetyBanner from '../shared/SafetyBanner';

// ─── Types ──────────────────────────────────────────────────────────────────────

interface ArchetypalContemplationWizardProps {
  onComplete?: () => void;
  onExit?: () => void;
  insightContext?: any;
  quickMode?: boolean;
}

// ─── Step flow ──────────────────────────────────────────────────────────────────

const STEP_ORDER: ContemplationStep[] = [
  'gateway', 'ground', 'draw', 'gaze',
  'first-face', 'second-face', 'third-face',
  'resonance', 'release', 'harvest', 'closing',
];

const QUICK_STEPS: ContemplationStep[] = ['draw', 'gaze', 'harvest'];

// ─── Sub-components ─────────────────────────────────────────────────────────────

function FadeInText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {React.Children.map(children, (child, i) => (
        <div
          key={i}
          className="animate-fadeIn opacity-0"
          style={{ animationDelay: `${i * 1.2}s`, animationFillMode: 'forwards' }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

function CardPlaceholder({ card }: { card: MajorArcanaCard }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-4 text-center w-full h-full">
      <span className="text-teal-400 font-mono text-sm">{card.number}</span>
      <span className="text-teal-300 font-serif text-lg">{card.name}</span>
      <span className="text-stone-400 text-xs">{card.jungianArchetype}</span>
    </div>
  );
}

function CardReveal({ card }: { card: MajorArcanaCard }) {
  const [flipped, setFlipped] = useState(false);
  const [showName, setShowName] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const flipTimer = setTimeout(() => setFlipped(true), 1500);
    const nameTimer = setTimeout(() => setShowName(true), 2000);
    return () => { clearTimeout(flipTimer); clearTimeout(nameTimer); };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-44 h-64 sm:w-56 sm:h-80" style={{ perspective: '1000px' }}>
        <div
          className="absolute inset-0 transition-transform duration-700"
          style={{
            transformStyle: 'preserve-3d',
            WebkitTransformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            WebkitTransform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Card back */}
          <div
            className="absolute inset-0 rounded-xl border-2 border-teal-500/40 bg-stone-800 flex items-center justify-center"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          >
            <div className="w-16 h-16 border-2 border-teal-500/30 rounded-full" />
          </div>
          {/* Card front */}
          <div
            className="absolute inset-0 rounded-xl border-2 border-teal-500/40 bg-stone-900 overflow-hidden flex flex-col items-center justify-center"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', WebkitTransform: 'rotateY(180deg)' }}
          >
            {!imgError ? (
              <img
                src={card.imageFile}
                alt={card.name}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
                    />
            ) : (
              <CardPlaceholder card={card} />
            )}
          </div>
        </div>
      </div>
      {showName && (
        <p className="text-teal-300 font-serif text-xl animate-fadeIn" style={{ animationFillMode: 'forwards' }}>
          {card.name}
        </p>
      )}
    </div>
  );
}

function GazeImage({ card }: { card: MajorArcanaCard }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="w-44 h-64 sm:w-56 sm:h-80 rounded-xl border-2 border-teal-500/40 bg-stone-900 overflow-hidden flex items-center justify-center">
      {!imgError ? (
        <img
          src={card.imageFile}
          alt={card.name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <CardPlaceholder card={card} />
      )}
    </div>
  );
}

// ─── Sidebar marginalia ─────────────────────────────────────────────────────────

function SidebarMarginalia({ state }: { state: ContemplationSessionState }) {
  const items: { label: string; value: string }[] = [];

  if (state.card) {
    items.push({ label: 'Card', value: `${state.card.number} \u2014 ${state.card.name}` });
  }
  if (state.gazeComplete) {
    items.push({ label: 'Gaze', value: 'Complete' });
  }
  if (state.firstFaceResponse) {
    items.push({ label: 'I-It', value: state.firstFaceResponse.slice(0, 40) + (state.firstFaceResponse.length > 40 ? '\u2026' : '') });
  }
  if (state.secondFaceResponse) {
    items.push({ label: 'I-Thou', value: state.secondFaceResponse.slice(0, 40) + (state.secondFaceResponse.length > 40 ? '\u2026' : '') });
  }
  if (state.thirdFaceResponse) {
    items.push({ label: 'It/Its', value: state.thirdFaceResponse.slice(0, 40) + (state.thirdFaceResponse.length > 40 ? '\u2026' : '') });
  }
  if (state.harvestSentence) {
    items.push({ label: 'Harvest', value: state.harvestSentence.slice(0, 40) + (state.harvestSentence.length > 40 ? '\u2026' : '') });
  }

  if (items.length === 0) return null;

  return (
    <div className="space-y-3 mt-6">
      <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Session</p>
      {items.map((item, i) => (
        <div key={i} className="text-xs">
          <p className="text-teal-500/70 font-mono text-[10px]">{item.label}</p>
          <p className="text-stone-400 leading-snug">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Gateway screen ─────────────────────────────────────────────────────────────

function GatewayScreen({
  experienceLevel,
  onSelect,
}: {
  experienceLevel: ExperienceLevel | undefined;
  onSelect: (level: ExperienceLevel) => void;
}) {
  const [phase, setPhase] = useState<'cards' | 'flipping' | 'revealed'>('cards');

  const handleCardClick = () => {
    if (phase !== 'cards') return;
    setPhase('flipping');
    setTimeout(() => setPhase('revealed'), 900);
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center gap-8 sm:gap-10">
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-serif text-teal-300 tracking-tight">Archetypal Contemplation</h1>
        <p className="text-stone-500 text-sm font-mono tracking-widest uppercase">A Practice with the Major Arcana</p>
      </div>

      {/* Card pair gateway */}
      {phase !== 'revealed' && (
        <button
          onClick={handleCardClick}
          aria-label="Enter the practice"
          className="group relative flex items-end justify-center gap-0 focus:outline-none"
          style={{ perspective: '1200px', height: '280px', width: '260px' }}
        >
          {/* Subtle glow behind cards */}
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-500"
            style={{
              background: 'radial-gradient(ellipse 60% 50% at 50% 80%, oklch(0.55 0.15 200deg / 0.25), transparent)',
              opacity: phase === 'flipping' ? 0 : 1,
            }}
          />

          {/* Left card — The Star */}
          <div
            className="absolute"
            style={{
              width: '156px',
              height: '260px',
              left: '10px',
              bottom: '0',
              transformOrigin: 'bottom center',
              transformStyle: 'preserve-3d',
              transition: 'transform 0.75s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease 0.55s',
              transform: phase === 'cards'
                ? 'rotate(-8deg) translateY(0px)'
                : phase === 'flipping'
                ? 'rotate(-8deg) rotateY(180deg) scale(0.85)'
                : 'rotate(-8deg) rotateY(180deg) scale(0.85)',
              opacity: phase === 'revealed' ? 0 : 1,
            }}
          >
            <img
              src="/tarot-gateway-star.avif"
              alt="The Star"
              className="w-full h-full object-cover rounded-xl"
              style={{
                boxShadow: '0 8px 32px oklch(0.55 0.15 200deg / 0.35), 0 2px 8px rgb(0 0 0 / 0.6)',
                border: '1px solid oklch(0.70 0.14 185deg / 0.35)',
              }}
              draggable={false}
            />
          </div>

          {/* Right card — The Magus */}
          <div
            className="absolute"
            style={{
              width: '156px',
              height: '260px',
              right: '10px',
              bottom: '0',
              transformOrigin: 'bottom center',
              transformStyle: 'preserve-3d',
              transition: 'transform 0.75s cubic-bezier(0.4, 0, 0.2, 1) 0.08s, opacity 0.4s ease 0.6s',
              transform: phase === 'cards'
                ? 'rotate(8deg) translateY(0px)'
                : phase === 'flipping'
                ? 'rotate(8deg) rotateY(-180deg) scale(0.85)'
                : 'rotate(8deg) rotateY(-180deg) scale(0.85)',
              opacity: phase === 'revealed' ? 0 : 1,
            }}
          >
            <img
              src="/tarot-gateway-magus.avif"
              alt="The Magus"
              className="w-full h-full object-cover rounded-xl"
              style={{
                boxShadow: '0 8px 32px oklch(0.72 0.16 75deg / 0.3), 0 2px 8px rgb(0 0 0 / 0.6)',
                border: '1px solid oklch(0.72 0.16 75deg / 0.3)',
              }}
              draggable={false}
            />
          </div>

          {/* Hover hint */}
          {phase === 'cards' && (
            <p
              className="absolute -bottom-8 left-0 right-0 text-center text-xs text-stone-500 group-hover:text-teal-400/70 transition-colors duration-300 font-mono tracking-wider"
            >
              touch to enter
            </p>
          )}
        </button>
      )}

      {/* Quote + MCQ — revealed after flip */}
      <div
        className="w-full space-y-6 transition-all duration-500"
        style={{
          opacity: phase === 'revealed' ? 1 : 0,
          transform: phase === 'revealed' ? 'translateY(0)' : 'translateY(12px)',
          pointerEvents: phase === 'revealed' ? 'auto' : 'none',
          marginTop: phase === 'revealed' ? '0' : '-60px',
        }}
      >
        <blockquote className="border-l-2 border-teal-500/30 pl-4 italic text-stone-300 text-sm leading-relaxed">
          &ldquo;The Tarot is a collection of meditations &mdash; a series of spiritual exercises. Each card is a &lsquo;master&rsquo; in the sense of a spiritual entity which a sincere and sufficiently prepared student can contact through meditation.&rdquo;
          <footer className="text-stone-500 text-xs mt-2 not-italic">&mdash; Valentin Tomberg</footer>
        </blockquote>

        <div className="space-y-3">
          <p className="text-stone-400 text-xs uppercase tracking-widest font-mono">Your experience</p>
          {([
            { level: 'new' as ExperienceLevel, label: 'New to contemplative practice', desc: 'Gentler entry, more guidance' },
            { level: 'some' as ExperienceLevel, label: 'Some experience', desc: 'Balanced approach' },
            { level: 'experienced' as ExperienceLevel, label: 'Established practice', desc: 'Direct, minimal scaffolding' },
          ]).map(({ level, label, desc }) => (
            <button
              key={level}
              onClick={() => onSelect(level)}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                experienceLevel === level
                  ? 'border-teal-500/60 bg-teal-500/10'
                  : 'border-stone-700/50 bg-stone-900/40 hover:border-stone-600/60'
              }`}
            >
              <p className={`text-sm font-medium ${experienceLevel === level ? 'text-teal-300' : 'text-stone-200'}`}>{label}</p>
              <p className="text-xs text-stone-500 mt-0.5">{desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────────

export default function ArchetypalContemplationWizard({
  onComplete,
  onExit,
  quickMode = false,
}: ArchetypalContemplationWizardProps) {
  const {
    state, updateState, saveSession, getPreviousSessions,
    getContemplatedCardIds, startGaze, stopGaze, clearSession,
  } = useContemplationSession();

  const [crisisLevel, setCrisisLevel] = useState<string>('none');
  const [resonanceLoading, setResonanceLoading] = useState(false);
  const [resonanceError, setResonanceError] = useState(false);
  const [closingLoading, setClosingLoading] = useState(false);
  const [groundReady, setGroundReady] = useState(false);
  const [resonanceReflection, setResonanceReflection] = useState('');
  const [cardNameShown, setCardNameShown] = useState(false);
  const [buberExpanded, setBuberExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const steps = quickMode ? QUICK_STEPS : STEP_ORDER;

  // Scroll to top on step change
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [state.step]);

  // Show redraw link 2.5s after card is drawn
  useEffect(() => {
    if (!state.card) { setCardNameShown(false); return; }
    const t = setTimeout(() => setCardNameShown(true), 2500);
    return () => clearTimeout(t);
  }, [state.card]);

  // Ground screen: disable continue for 10s
  useEffect(() => {
    if (state.step === 'ground') {
      setGroundReady(false);
      const t = setTimeout(() => setGroundReady(true), 10000);
      return () => clearTimeout(t);
    }
  }, [state.step]);

  // Start gaze timer on gaze screen
  useEffect(() => {
    if (state.step === 'gaze') {
      startGaze();
      return () => stopGaze();
    }
  }, [state.step, startGaze, stopGaze]);

  // Fire resonance AI
  useEffect(() => {
    if (state.step !== 'resonance' || state.resonanceData || resonanceLoading) return;
    if (!state.card) return;

    setResonanceLoading(true);
    setResonanceError(false);

    const prompt = buildResonancePrompt({
      card: state.card,
      firstFaceResponse: state.firstFaceResponse,
      secondFaceResponse: state.secondFaceResponse,
      thirdFaceResponse: state.thirdFaceResponse,
      experienceLevel: state.experienceLevel || 'new',
      previousSessionSummaries: getPreviousSessions().map((s) => ({
        cardName: s.cardName,
        harvestSentence: s.harvestSentence,
        preferredFace: s.preferredFace,
      })),
    });

    const schema = z.object({
      psychological: z.string(),
      mythological: z.string(),
      contemplative: z.string(),
    });

    callGrokThenAIJson('archetypal-resonance', prompt, undefined, schema)
      .then((data: ResonanceResponse) => {
        updateState({ resonanceData: data });
      })
      .catch(() => {
        setResonanceError(true);
      })
      .finally(() => {
        setResonanceLoading(false);
      });
  }, [state.step, state.resonanceData, state.card, resonanceLoading]);

  // Fire closing AI
  useEffect(() => {
    if (state.step !== 'closing' || state.closingData || closingLoading) return;
    if (!state.card) return;

    setClosingLoading(true);

    const prompt = buildClosingPrompt({
      card: state.card,
      harvestSentence: state.harvestSentence,
      preferredFace: state.preferredFace || 'first',
      sessionDepth: state.sessionDepth || 3,
      previousSessionSummaries: getPreviousSessions().slice(0, -1).map((s) => ({
        cardName: s.cardName,
        harvestSentence: s.harvestSentence,
        preferredFace: s.preferredFace,
      })),
    });

    const schema = z.object({
      crossPracticeConnection: z.string().nullable(),
      suggestedNextPractice: z.string().nullable(),
    });

    callGrokThenAIJson('archetypal-closing', prompt, undefined, schema)
      .then((data: ClosingResponse) => {
        updateState({ closingData: data });
      })
      .catch(() => {
        // Non-blocking
      })
      .finally(() => {
        setClosingLoading(false);
      });
  }, [state.step, state.closingData, closingLoading]);

  // Save session on closing screen entry
  useEffect(() => {
    if (state.step === 'closing' && state.card && state.preferredFace && state.sessionDepth) {
      saveSession();
    }
  }, [state.step]);

  // Crisis detection for face screens
  const handleTextChange = useCallback((field: 'firstFaceResponse' | 'secondFaceResponse' | 'thirdFaceResponse', value: string) => {
    updateState({ [field]: value });
    const result = detectCrisisLevel(value);
    setCrisisLevel(typeof result === 'string' ? result : (result as any)?.level ?? 'none');
  }, [updateState]);

  // ── Navigation ──────────────────────────────────────────────────────────────

  const canAdvance = useMemo(() => {
    switch (state.step) {
      case 'gateway': return !!state.experienceLevel;
      case 'ground': return groundReady;
      case 'draw': return !!state.card;
      case 'gaze': return state.gazeComplete;
      case 'first-face': return state.firstFaceResponse.length >= 10;
      case 'second-face': return state.secondFaceResponse.length >= 10;
      case 'third-face': return state.thirdFaceResponse.length >= 10;
      case 'resonance': return true;
      case 'release': return true;
      case 'harvest': return state.harvestSentence.length >= 10 && !!state.preferredFace && !!state.sessionDepth;
      case 'closing': return false;
      default: return false;
    }
  }, [state, groundReady]);

  const canGoBack = state.step !== 'gateway' && state.step !== 'closing';

  const goNext = useCallback(() => {
    if (!canAdvance) return;
    const idx = steps.indexOf(state.step);
    if (idx < steps.length - 1) {
      updateState({ step: steps[idx + 1] });
    }
  }, [canAdvance, state.step, steps, updateState]);

  const goBack = useCallback(() => {
    if (!canGoBack) return;
    if (state.step === 'draw' && !quickMode) {
      updateState({ step: 'gateway' });
      return;
    }
    const idx = steps.indexOf(state.step);
    if (idx > 0) {
      updateState({ step: steps[idx - 1] });
    }
  }, [canGoBack, state.step, steps, quickMode, updateState]);

  const handleExit = useCallback(() => {
    if (onExit) onExit();
    else if (onComplete) onComplete();
  }, [onExit, onComplete]);

  // ── Step labels for sidebar ─────────────────────────────────────────────────

  const stepLabels: Record<ContemplationStep, string> = {
    gateway: 'Gateway',
    ground: 'Grounding',
    draw: 'Draw',
    gaze: 'Gaze',
    'first-face': 'First Face',
    'second-face': 'Second Face',
    'third-face': 'Third Face',
    resonance: 'Resonance',
    release: 'Release',
    harvest: 'Harvest',
    closing: 'Complete',
  };

  // ── Render screens ──────────────────────────────────────────────────────────

  const renderScreen = () => {
    switch (state.step) {
      case 'gateway': return renderGateway();
      case 'ground': return renderGround();
      case 'draw': return renderDraw();
      case 'gaze': return renderGaze();
      case 'first-face': return renderFirstFace();
      case 'second-face': return renderSecondFace();
      case 'third-face': return renderThirdFace();
      case 'resonance': return renderResonance();
      case 'release': return renderRelease();
      case 'harvest': return renderHarvest();
      case 'closing': return renderClosing();
      default: return null;
    }
  };

  const renderGateway = () => <GatewayScreen experienceLevel={state.experienceLevel} onSelect={(level) => updateState({ experienceLevel: level })} />;

  const renderGround = () => (
    <div className="max-w-xl mx-auto">
      <FadeInText>
        <p className="text-stone-300 leading-relaxed">
          Find a comfortable position. Allow your eyes to soften. There is nowhere else you need to be.
        </p>
        <p className="text-stone-300 leading-relaxed">
          Let the concerns of the day settle, like silt drifting to the bottom of a still pool. You do not need to push them away. Simply let your attention come to rest here.
        </p>
        <p className="text-stone-300 leading-relaxed">
          Notice the breath moving through you. Not controlling it, just noticing. Each exhale releases a little more of what you were carrying.
        </p>
        <p className="text-stone-400 leading-relaxed text-sm">
          When you feel arrived in this moment, continue.
        </p>
      </FadeInText>
    </div>
  );

  const renderDraw = () => (
    <div className="max-w-lg mx-auto flex flex-col items-center gap-8">
      {!state.card ? (
        <div className="text-center space-y-6">
          <p className="text-stone-300 text-sm">When you are ready, draw a card.</p>
          <button
            onClick={() => updateState({ card: drawRandomCard() })}
            className="px-8 py-3 rounded-xl border border-teal-500/40 bg-teal-500/10 text-teal-300 font-medium hover:bg-teal-500/20 transition-colors"
          >
            Draw a Card
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <CardReveal card={state.card} />
          {cardNameShown && !state.hasRedrawn && (
            <button
              onClick={() => updateState({ card: drawRandomCard(), hasRedrawn: true })}
              className="text-xs text-stone-500 hover:text-stone-400 transition-colors mt-1"
            >
              Draw a different card
            </button>
          )}
        </div>
      )}
    </div>
  );

  const renderGaze = () => {
    if (!state.card) return null;
    const dotsTotal = state.experienceLevel === 'experienced' ? 18 : 9;
    const dotsFilled = Math.min(Math.floor(state.gazeElapsed / 5), dotsTotal);

    const instruction = state.gazeComplete
      ? 'When you feel ready, continue.'
      : state.experienceLevel === 'experienced'
        ? 'Rest attention on the image without naming or interpreting.'
        : 'Simply look at the image. Notice what draws your attention. There is nothing to figure out.';

    return (
      <div className="max-w-lg mx-auto flex flex-col items-center gap-6">
        <GazeImage card={state.card} />
        <h2 className="text-teal-300 font-serif text-lg">Gaze upon the image</h2>
        <p className="text-stone-400 text-sm text-center max-w-md">{instruction}</p>
        <div className="flex gap-1.5 flex-wrap justify-center">
          {Array.from({ length: dotsTotal }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors duration-500 ${
                i < dotsFilled ? 'bg-teal-400' : 'bg-stone-700'
              }`}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderFirstFace = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      {state.card && (
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-14 rounded border border-teal-500/30 bg-stone-800 flex items-center justify-center text-teal-400 text-xs font-mono">{state.card.number}</div>
          <span className="text-stone-400 text-sm font-serif">{state.card.name}</span>
        </div>
      )}
      <h2 className="text-teal-300 font-serif text-xl">First Face &mdash; I-It</h2>
      <p className="text-stone-500 text-xs uppercase tracking-widest">The archetype as object of contemplation</p>
      <p className="text-stone-300 text-sm leading-relaxed">
        {state.experienceLevel === 'experienced'
          ? 'What arises?'
          : state.experienceLevel === 'some'
            ? 'What in this image calls your attention? What does it evoke in you?'
            : 'What do you notice in the image? What feelings or memories does it stir? There are no wrong answers.'}
      </p>
      {crisisLevel !== 'none' && <SafetyBanner crisisLevel={crisisLevel} />}
      <textarea
        value={state.firstFaceResponse}
        onChange={(e) => handleTextChange('firstFaceResponse', e.target.value)}
        placeholder="Write what arises..."
        rows={6}
        className="w-full bg-stone-900/60 border border-stone-700/50 rounded-xl p-4 text-stone-200 text-sm placeholder:text-stone-600 focus:outline-none focus:border-teal-500/40 resize-none"
      />
      <p className="text-stone-600 text-xs">{state.firstFaceResponse.length} characters</p>
    </div>
  );

  const renderSecondFace = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-teal-300 font-serif text-xl">Second Face &mdash; I-Thou</h2>
      <p className="text-stone-500 text-xs uppercase tracking-widest">Meeting the archetype</p>
      {(state.experienceLevel === 'new' || state.experienceLevel === 'some') && (
        <div className="bg-stone-900/40 border border-stone-700/40 rounded-xl p-4 space-y-3">
          <p className="text-stone-400 text-xs uppercase tracking-widest font-mono">Before you write</p>
          <p className="text-stone-300 text-sm leading-relaxed">Try bringing to mind one of these:</p>
          <ul className="space-y-1.5 text-stone-400 text-sm leading-relaxed">
            <li>· A piece of music that once moved you unexpectedly. How did it &ldquo;speak&rdquo; to you?</li>
            <li>· A moment in nature &mdash; a landscape, a storm &mdash; that felt like it had something to say.</li>
            <li>· A conversation where someone said exactly what you needed without knowing it.</li>
          </ul>
          <p className="text-stone-300 text-sm leading-relaxed">
            That quality of attention is what this face invites. Now look at the image again with that same openness.
          </p>
          <button
            onClick={() => setBuberExpanded((v) => !v)}
            className="text-xs text-stone-600 hover:text-stone-400 transition-colors"
          >
            {buberExpanded ? 'Hide context ↑' : 'What is I-Thou? ↓'}
          </button>
          {buberExpanded && (
            <p className="text-stone-500 text-xs leading-relaxed border-t border-stone-800/50 pt-3">
              Martin Buber distinguished two modes of relation: I-It (experiencing something as an object) and I-Thou (encountering it as a presence that can address you). In this face of Spirit, we practice the latter.
            </p>
          )}
        </div>
      )}
      <p className="text-stone-300 text-sm leading-relaxed">
        Address the {state.card?.name} directly. What would you say to it? What do you need from it? What does it seem to want from you?
      </p>
      {crisisLevel !== 'none' && <SafetyBanner crisisLevel={crisisLevel} />}
      <textarea
        value={state.secondFaceResponse}
        onChange={(e) => handleTextChange('secondFaceResponse', e.target.value)}
        placeholder="Speak to the archetype..."
        rows={6}
        className="w-full bg-stone-900/60 border border-stone-700/50 rounded-xl p-4 text-stone-200 text-sm placeholder:text-stone-600 focus:outline-none focus:border-teal-500/40 resize-none"
      />
      <p className="text-stone-600 text-xs">{state.secondFaceResponse.length} characters</p>
    </div>
  );

  const renderThirdFace = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-teal-300 font-serif text-xl">Third Face &mdash; I-I</h2>
      <p className="text-stone-500 text-xs uppercase tracking-widest">The universal pattern</p>
      <p className="text-stone-300 text-sm leading-relaxed">
        {state.experienceLevel === 'experienced'
          ? 'What universal pattern is alive in this archetype? Where does it move in the world?'
          : `Stepping back now \u2014 what universal pattern does ${state.card?.name} represent? Where do you see this pattern in the world, in history, in the human story?`}
      </p>
      {crisisLevel !== 'none' && <SafetyBanner crisisLevel={crisisLevel} />}
      <textarea
        value={state.thirdFaceResponse}
        onChange={(e) => handleTextChange('thirdFaceResponse', e.target.value)}
        placeholder="What pattern do you see..."
        rows={6}
        className="w-full bg-stone-900/60 border border-stone-700/50 rounded-xl p-4 text-stone-200 text-sm placeholder:text-stone-600 focus:outline-none focus:border-teal-500/40 resize-none"
      />
      <p className="text-stone-600 text-xs">{state.thirdFaceResponse.length} characters</p>
    </div>
  );

  const renderResonance = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-teal-300 font-serif text-xl">Resonance</h2>
      {resonanceLoading && (
        <div className="flex items-center gap-3 py-8 justify-center">
          <div className="w-4 h-4 border-2 border-teal-500/40 border-t-teal-400 rounded-full animate-spin" />
          <span className="text-stone-400 text-sm">Consulting the tradition...</span>
        </div>
      )}
      {resonanceError && !state.resonanceData && (
        <div className="space-y-4">
          <p className="text-stone-400 text-sm italic">Resonance layers unavailable. Your practice is complete.</p>
          {state.card && (
            <div className="space-y-3">
              <p className="text-stone-300 text-sm leading-relaxed">{state.card.pollackDescription}</p>
              <p className="text-stone-400 text-xs">Archetype: {state.card.jungianArchetype}</p>
              <p className="text-stone-400 text-xs italic">{state.card.contemplativePrompt}</p>
            </div>
          )}
        </div>
      )}
      {state.resonanceData && (
        <div className="space-y-6">
          {([
            { title: 'Psychological Resonance', text: state.resonanceData.psychological },
            { title: 'Mythological Echoes', text: state.resonanceData.mythological },
            { title: 'Contemplative Dimension', text: state.resonanceData.contemplative },
          ]).map(({ title, text }) => (
            <div key={title} className="space-y-2">
              <h3 className="text-teal-400/80 text-xs uppercase tracking-widest font-mono">{title}</h3>
              <p className="text-stone-300 text-sm leading-relaxed">{text}</p>
            </div>
          ))}
          <div className="pt-4 space-y-2">
            <p className="text-stone-500 text-xs">What stirs in you reading this?</p>
            <textarea
              value={resonanceReflection}
              onChange={(e) => setResonanceReflection(e.target.value)}
              placeholder="Optional reflection..."
              rows={3}
              className="w-full bg-stone-900/60 border border-stone-700/50 rounded-xl p-3 text-stone-200 text-sm placeholder:text-stone-600 focus:outline-none focus:border-teal-500/40 resize-none"
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderRelease = () => (
    <div className="max-w-xl mx-auto">
      <FadeInText>
        <p className="text-stone-300 leading-relaxed">
          The image is complete. Allow it to dissolve.
        </p>
        <p className="text-stone-300 leading-relaxed">
          You do not need to hold this. Let the practice release you as you release it.
        </p>
        <p className="text-stone-300 leading-relaxed">
          Rest in the awareness that was here before the image, and will remain after.
        </p>
        <p className="text-stone-500 text-sm italic">
          Stay longer.
        </p>
      </FadeInText>
    </div>
  );

  const renderHarvest = () => (
    <div className="max-w-2xl mx-auto space-y-8">
      <h2 className="text-teal-300 font-serif text-xl">Harvest</h2>
      <div className="space-y-3">
        <p className="text-stone-300 text-sm">In one sentence, what does this practice leave you with?</p>
        <textarea
          value={state.harvestSentence}
          onChange={(e) => updateState({ harvestSentence: e.target.value })}
          placeholder="One sentence..."
          rows={3}
          className="w-full bg-stone-900/60 border border-stone-700/50 rounded-xl p-4 text-stone-200 text-sm placeholder:text-stone-600 focus:outline-none focus:border-teal-500/40 resize-none"
        />
      </div>

      <div className="space-y-3">
        <p className="text-stone-300 text-sm">Which face of Spirit felt most alive today?</p>
        <div className="flex gap-3">
          {([
            { face: 'first' as PreferredFace, label: 'First (I-It)' },
            { face: 'second' as PreferredFace, label: 'Second (I-Thou)' },
            { face: 'third' as PreferredFace, label: 'Third (I-I)' },
          ]).map(({ face, label }) => (
            <button
              key={face}
              onClick={() => updateState({ preferredFace: face })}
              className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                state.preferredFace === face
                  ? 'border-teal-500/60 bg-teal-500/10 text-teal-300'
                  : 'border-stone-700/50 text-stone-400 hover:border-stone-600/60'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-stone-300 text-sm">How did this session land?</p>
        <div className="space-y-2">
          {([
            { depth: 5 as SessionDepth, label: 'Deep', sub: 'something genuinely shifted' },
            { depth: 4 as SessionDepth, label: 'A lot', sub: 'I need time with this' },
            { depth: 3 as SessionDepth, label: 'Meaningful', sub: 'I noticed something new' },
            { depth: 2 as SessionDepth, label: 'Interesting', sub: 'engaging but surface-level' },
            { depth: 1 as SessionDepth, label: 'Flat', sub: "didn't connect today" },
          ]).map(({ depth, label, sub }) => (
            <button
              key={depth}
              onClick={() => updateState({ sessionDepth: depth })}
              className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-all ${
                state.sessionDepth === depth
                  ? 'border-teal-500/60 bg-teal-500/10 text-teal-300'
                  : 'border-stone-700/50 bg-stone-900/30 text-stone-400 hover:border-stone-600/60'
              }`}
            >
              <span className="font-medium">{label}</span>
              <span className="text-stone-500 ml-2 text-xs">{sub}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderClosing = () => {
    const contemplatedIds = getContemplatedCardIds();
    const isOverwhelmed = state.sessionDepth === 4;

    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-teal-300 font-serif text-xl">Practice Complete</h2>
          <p className="text-stone-500 text-sm">Feel your feet on the ground. Look around the room. Take one breath.</p>
        </div>

        <blockquote className="border-l-2 border-teal-500/20 pl-4 italic text-stone-400 text-sm leading-relaxed">
          &ldquo;The Tarot is not a system of divination. It is a system of symbols through which we may come to know ourselves.&rdquo;
          <footer className="text-stone-600 text-xs mt-2 not-italic">&mdash; P. D. Ouspensky</footer>
        </blockquote>

        <div className="space-y-3 bg-stone-900/30 border border-stone-800/50 rounded-xl p-4">
          <p className="text-teal-500/70 text-xs uppercase tracking-widest font-mono">What You Practiced</p>
          <p className="text-stone-300 text-sm leading-relaxed">
            The three prompts you moved through &mdash; observing, addressing, and stepping back &mdash; correspond to what Ken Wilber calls the Three Faces of Spirit: Spirit as object (I-It), Spirit as living presence (I-Thou), and Spirit as the universal pattern (I-I or It/Its).
          </p>
          <p className="text-stone-400 text-sm leading-relaxed">
            The final release invited letting go of interpretation entirely. Many contemplative traditions use this kind of move to notice the awareness that was present all along &mdash; though what you found there is yours to name.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-stone-500 text-xs uppercase tracking-widest font-mono">Your Journey So Far</p>
          <div className="grid grid-cols-11 gap-1.5">
            {MAJOR_ARCANA.map((c) => {
              const contemplated = contemplatedIds.includes(c.id);
              return (
                <div
                  key={c.id}
                  className={`aspect-[2/3] rounded border text-center flex items-center justify-center text-[9px] font-mono ${
                    contemplated
                      ? 'border-teal-500/50 bg-teal-500/10 text-teal-400'
                      : 'border-stone-800/50 bg-stone-900/30 text-stone-700'
                  }`}
                  title={c.name}
                >
                  {c.number}
                </div>
              );
            })}
          </div>
        </div>

        {isOverwhelmed ? (
          <div className="bg-stone-900/40 border border-stone-700/30 rounded-xl p-4">
            <p className="text-stone-300 text-sm leading-relaxed">
              Some things need room before they become clear. There&rsquo;s no rush to integrate what just opened. This session&rsquo;s harvest will be here when you&rsquo;re ready.
            </p>
          </div>
        ) : (
          <>
            {closingLoading && (
              <div className="flex items-center gap-2 justify-center py-4">
                <div className="w-3 h-3 border-2 border-teal-500/40 border-t-teal-400 rounded-full animate-spin" />
                <span className="text-stone-500 text-xs">Reflecting on your journey...</span>
              </div>
            )}
            {state.closingData?.crossPracticeConnection && (
              <div className="space-y-2">
                <h3 className="text-teal-400/80 text-xs uppercase tracking-widest font-mono">Across Sessions</h3>
                <p className="text-stone-300 text-sm leading-relaxed">{state.closingData.crossPracticeConnection}</p>
              </div>
            )}
            {state.closingData?.suggestedNextPractice && (
              <div className="space-y-2">
                <h3 className="text-teal-400/80 text-xs uppercase tracking-widest font-mono">An Invitation</h3>
                <p className="text-stone-300 text-sm leading-relaxed">{state.closingData.suggestedNextPractice}</p>
              </div>
            )}
          </>
        )}

        <div className="flex gap-4 justify-center pt-4">
          <button
            onClick={() => { clearSession(); updateState({ step: 'gateway' }); }}
            className="px-6 py-2.5 rounded-xl border border-teal-500/40 text-teal-300 text-sm hover:bg-teal-500/10 transition-colors"
          >
            Begin Again
          </button>
          <button
            onClick={handleExit}
            className="px-6 py-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-sm hover:bg-teal-500/20 transition-colors"
          >
            Return to Spirit
          </button>
        </div>
      </div>
    );
  };

  // ── Layout ──────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 h-[100dvh] bg-gradient-to-b from-stone-950 via-stone-950 to-stone-900 backdrop-blur-md flex">
      {/* Ambient glow — primary teal depth */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-teal-600/5 blur-3xl rounded-full pointer-events-none opacity-70" />
      {/* Secondary glow — warm stone undertone */}
      <div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-stone-800/6 blur-3xl rounded-full pointer-events-none" />

      {/* Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-gradient-to-b from-stone-950 to-stone-900 border-r border-stone-800/70 p-6 overflow-y-auto relative z-10 shadow-2xl">
        <div className="mb-8 pb-4 border-b border-stone-800/50">
          <h2 className="text-xs font-bold uppercase tracking-widest text-teal-400/80 font-mono">Archetypal Contemplation</h2>
          <p className="text-[10px] text-stone-500 mt-1.5 leading-relaxed">Three Faces of Spirit</p>
        </div>
        <div className="flex flex-col gap-1">
          {steps.map((s, i) => {
            const active = s === state.step;
            const done = steps.indexOf(state.step) > i;
            return (
              <div
                key={s}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 ${
                  active ? 'bg-teal-500/10 border border-teal-500/20' : done ? 'opacity-60' : 'opacity-30'
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? 'bg-teal-400' : done ? 'bg-teal-600' : 'bg-stone-600'}`} />
                <p className={`text-xs font-medium truncate ${active ? 'text-teal-300' : done ? 'text-stone-400' : 'text-stone-600'}`}>
                  {stepLabels[s]}
                </p>
              </div>
            );
          })}
        </div>
        <SidebarMarginalia state={state} />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 relative z-10">
        <div className="flex justify-end p-4 border-b border-stone-800/30">
          <button
            onClick={handleExit}
            className="text-stone-600 hover:text-stone-400 transition-colors text-sm font-medium tracking-wide"
          >
            ✕ Close
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 pb-32">
          {renderScreen()}
        </div>

        {state.step !== 'closing' && (
          <div className="shrink-0 border-t border-stone-800/60 bg-gradient-to-t from-stone-900/95 to-stone-950/80 backdrop-blur-md px-6 py-4 flex justify-between items-center shadow-lg">
            <div>
              {canGoBack && (
                <button
                  onClick={goBack}
                  className="px-3 py-1.5 text-stone-500 text-sm hover:text-teal-400 transition-colors duration-200 font-medium"
                >
                  ← Back
                </button>
              )}
            </div>
            <button
              onClick={goNext}
              disabled={!canAdvance}
              className={`px-8 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                canAdvance
                  ? 'bg-gradient-to-r from-teal-600/20 to-teal-500/15 border border-teal-500/50 text-teal-300 hover:from-teal-600/30 hover:to-teal-500/25 hover:border-teal-400/60 shadow-lg hover:shadow-teal-500/10'
                  : 'border border-stone-800/40 text-stone-600 cursor-not-allowed opacity-50'
              }`}
            >
              {state.step === 'harvest' ? 'Complete' : 'Continue →'}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}
