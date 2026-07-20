/**
 * InnerCompassWizard.tsx
 * Spirit module (teal accent) — Fishbowl multi-perspective reflection tool.
 * Steps: 1 (Metaphor) → 2 (Extension) → [Breath overlay] → 3 (Fishbowl) → 4 (Reflexive Turn) → 5 (Bridge) → 6 (Practice + Done)
 */
import React, { useState, useCallback, useMemo } from 'react';
import { WizardFrame } from '../shared/WizardFrame';
import { callGrokThenAIJson } from '../../services/ai/aiCore';
import { useWizardDraft } from '../../hooks/useWizardDraft';
import { fishbowlResponseSchema, bridgeAndPracticeResponseSchema } from '../../services/ai/fishbowlSchemas';
import type { FishbowlResponse, BridgeAndPracticeResponse } from '../../services/ai/fishbowlSchemas';
import { FISHBOWL_SYSTEM_PROMPT, BRIDGE_PROMPT, PRACTICE_PROMPT } from '../../services/ai/wizardPrompts';
import { METAPHOR_TILES, PERSPECTIVES, PRACTICE_VARIETY_CLASSES } from '../../data/fishbowlConfig';
import type { MetaphorTile, Perspective } from '../../data/fishbowlConfig';
import { wizardSessionService } from '../../services/wizardSessionService';
import { AstralCompassIcon } from '../visualizations/SacredGeometryIcons';

// ---------------------------------------------------------------------------
// Draft shape
// ---------------------------------------------------------------------------
interface InnerCompassDraft {
  sessionId: string;
  metaphorId: string;
  metaphorText: string;
  isConcrete: boolean;
  isCustom: boolean;
  customText?: string;
  extensionSelections: Array<{ prompt: string; selected: string }>;
  tookBreaths: boolean;
  perspectiveIds: string[];
  calibrationFeedback?: {
    perspectiveName: string;
    feeling: 'yes' | 'partly' | 'no';
    correction?: string;
  };
  fishbowlResponse?: FishbowlResponse;
  thirdPerspectiveUnlocked: boolean;
  bridgeQuestion?: string;
  plainGloss?: string;
  practice?: string;
}

function makeFreshDraft(): InnerCompassDraft {
  return {
    sessionId: crypto.randomUUID(),
    metaphorId: '',
    metaphorText: '',
    isConcrete: false,
    isCustom: false,
    extensionSelections: [],
    tookBreaths: false,
    perspectiveIds: [],
    thirdPerspectiveUnlocked: false,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

const DRAFT_KEY = 'aura-draft-inner-compass';
const TOTAL_STEPS = 6;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface InnerCompassWizardProps {
  onClose: () => void;
  userId: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function InnerCompassWizard({ onClose, userId }: InnerCompassWizardProps) {
  const [draft, setDraft] = useWizardDraft<InnerCompassDraft>(DRAFT_KEY, makeFreshDraft);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBreath, setShowBreath] = useState(false);
  const [breathCount, setBreathCount] = useState(0);
  const [showCalibration, setShowCalibration] = useState(false);
  const [calibFeeling, setCalibFeeling] = useState<'yes' | 'partly' | 'no' | null>(null);
  const [calibPerspective, setCalibPerspective] = useState<string | null>(null);
  const [calibCorrection, setCalibCorrection] = useState('');
  const [customText, setCustomText] = useState(draft.customText || '');
  const [concreteText, setConcreteText] = useState(draft.customText || '');

  // Selected metaphor tile
  const selectedTile = useMemo(
    () => METAPHOR_TILES.find(t => t.id === draft.metaphorId),
    [draft.metaphorId]
  );

  // -------------------------------------------------------------------------
  // AI calls
  // -------------------------------------------------------------------------
  const generateFishbowl = useCallback(async (perspCount: 2 | 3) => {
    setLoading(true);
    setError(null);
    try {
      const perspectiveIds = draft.perspectiveIds ?? [];
      const selectedPerspectives = perspectiveIds.length > 0
        ? PERSPECTIVES.filter(p => perspectiveIds.includes(p.id)).slice(0, perspCount)
        : pickRandom(PERSPECTIVES, perspCount);

      const perspIds = selectedPerspectives.map(p => p.id);
      setDraft(d => ({ ...d, perspectiveIds: perspIds }));

      const userInput = draft.isCustom
        ? (customText || draft.metaphorText)
        : draft.isConcrete
          ? (concreteText || draft.metaphorText)
          : draft.metaphorText;

      const extensionContext = draft.extensionSelections.length > 0
        ? '\n\nAdditional context:\n' + draft.extensionSelections.map(e => `${e.prompt}: ${e.selected}`).join('\n')
        : '';

      const perspectiveInstructions = selectedPerspectives
        .map(p => `[${p.name}]\nVoice: ${p.voice}\nNever: ${p.neverDo}`)
        .join('\n\n');

      const prompt = `${FISHBOWL_SYSTEM_PROMPT}

---

User's metaphor: "${userInput}"${extensionContext}

Perspectives to embody (generate exactly ${perspCount}):
${perspectiveInstructions}

CRITICAL: Respond with ONLY valid JSON (no markdown, no explanation):
{"perspectives": [{"perspectiveName": "Name", "response": "80-150 word response"}, ...]}`;

      const result = await callGrokThenAIJson<FishbowlResponse>(
        'fishbowl',
        prompt,
        undefined,
        fishbowlResponseSchema
      );

      setDraft(d => ({ ...d, fishbowlResponse: result, thirdPerspectiveUnlocked: perspCount === 3 }));
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[InnerCompass] generateFishbowl failed:', msg, err);
      setError(`Failed to generate perspectives: ${msg}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [draft, customText, concreteText, setDraft]);

  const generateBridgeAndPractice = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const varietyClass = pickRandom([...PRACTICE_VARIETY_CLASSES], 1)[0];

      const fishbowlSummary = draft.fishbowlResponse
        ? draft.fishbowlResponse.perspectives.map(p => `[${p.perspectiveName}]: ${p.response}`).join('\n\n')
        : '';

      const calibrationNote = draft.calibrationFeedback
        ? `\n\nCalibration: The "${draft.calibrationFeedback.perspectiveName}" perspective felt ${draft.calibrationFeedback.feeling}. ${draft.calibrationFeedback.correction || ''}`
        : '';

      const userInput = draft.isCustom
        ? (customText || draft.metaphorText)
        : draft.isConcrete
          ? (concreteText || draft.metaphorText)
          : draft.metaphorText;

      const prompt = `${BRIDGE_PROMPT}

${PRACTICE_PROMPT.replace('{VARIETY_CLASS}', varietyClass)}

---

User's metaphor: "${userInput}"

Fishbowl perspectives:
${fishbowlSummary}${calibrationNote}

CRITICAL: Respond with ONLY valid JSON (no markdown, no explanation):
{"bridgeQuestion": "...", "plainLanguageGloss": "In plain terms: ...", "practice": "...", "varietyClass": "${varietyClass.split(' ')[0]}"}`;

      const result = await callGrokThenAIJson<BridgeAndPracticeResponse>(
        'bridge-practice',
        prompt,
        undefined,
        bridgeAndPracticeResponseSchema
      );

      setDraft(d => ({
        ...d,
        bridgeQuestion: result.bridgeQuestion,
        plainGloss: result.plainLanguageGloss,
        practice: result.practice,
      }));
      return result;
    } catch (err) {
      setError('Failed to generate bridge question. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [draft, customText, concreteText, setDraft]);

  // -------------------------------------------------------------------------
  // Navigation
  // -------------------------------------------------------------------------
  const canAdvance = useMemo(() => {
    switch (step) {
      case 1: return !!draft.metaphorId && (
        (!draft.isCustom && !draft.isConcrete) ||
        (draft.isCustom && customText.trim().length > 10) ||
        (draft.isConcrete && concreteText.trim().length > 10)
      );
      case 2: return true; // extensions are optional
      case 3: return !!draft.fishbowlResponse;
      case 4: return true; // reflexive pause
      case 5: return !!draft.bridgeQuestion;
      case 6: return true;
      default: return false;
    }
  }, [step, draft, customText, concreteText]);

  const handleNext = useCallback(async () => {
    if (step === 1) {
      // Save custom/concrete text
      if (draft.isCustom) {
        setDraft(d => ({ ...d, metaphorText: customText, customText }));
      } else if (draft.isConcrete) {
        setDraft(d => ({ ...d, metaphorText: concreteText, customText: concreteText }));
      }

      const tile = selectedTile;
      if (tile && !tile.isConcrete && !tile.isCustom && tile.extensions && tile.extensions.length > 0) {
        setStep(2);
      } else {
        // Skip extensions, go to breath
        triggerBreath();
      }
    } else if (step === 2) {
      triggerBreath();
    } else if (step === 3) {
      // After fishbowl, show calibration prompt
      setShowCalibration(true);
    } else if (step === 4) {
      // After reflexive turn, generate bridge
      const result = await generateBridgeAndPractice();
      if (result) setStep(5);
    } else if (step === 5) {
      setStep(6);
    }
  }, [step, draft, selectedTile, customText, concreteText, setDraft, generateBridgeAndPractice]);

  const handleBack = useCallback(() => {
    if (step > 1) setStep(s => s - 1);
  }, [step]);

  // -------------------------------------------------------------------------
  // Breath transition
  // -------------------------------------------------------------------------
  const triggerBreath = useCallback(() => {
    setShowBreath(true);
    setBreathCount(0);
    const interval = setInterval(() => {
      setBreathCount(prev => {
        if (prev >= 2) {
          clearInterval(interval);
          setTimeout(() => {
            setShowBreath(false);
            setDraft(d => ({ ...d, tookBreaths: true }));
            // Generate fishbowl with 2 perspectives
            generateFishbowl(2).then(result => {
              if (result) setStep(3);
            });
          }, 500);
          return prev;
        }
        return prev + 1;
      });
    }, 4000); // ~4s per breath cycle
  }, [setDraft, generateFishbowl]);

  // -------------------------------------------------------------------------
  // Calibration handler
  // -------------------------------------------------------------------------
  const handleCalibrationDone = useCallback(async () => {
    if (calibFeeling && calibFeeling !== 'yes' && calibPerspective) {
      setDraft(d => ({
        ...d,
        calibrationFeedback: {
          perspectiveName: calibPerspective,
          feeling: calibFeeling,
          correction: calibCorrection || undefined,
        }
      }));
    }
    setShowCalibration(false);
    setStep(4);
  }, [calibFeeling, calibPerspective, calibCorrection, setDraft]);

  const handleUnlockThird = useCallback(async () => {
    await generateFishbowl(3);
  }, [generateFishbowl]);

  // -------------------------------------------------------------------------
  // Save session
  // -------------------------------------------------------------------------
  const handleDone = useCallback(async () => {
    try {
      const sessionData = {
        sessionId: draft.sessionId,
        metaphorId: draft.metaphorId,
        metaphorText: draft.metaphorText,
        extensionSelections: draft.extensionSelections,
        perspectiveIds: draft.perspectiveIds,
        fishbowlResponse: draft.fishbowlResponse,
        bridgeQuestion: draft.bridgeQuestion || '',
        practice: draft.practice || '',
        calibrationFeedback: draft.calibrationFeedback,
        completedAt: new Date().toISOString(),
      };

      await wizardSessionService.saveSession({
        id: draft.sessionId,
        user_id: userId,
        wizard_type: 'Inner Compass',
        session_data: sessionData,
        created_at: new Date().toISOString(),
      });

      // Clear draft
      setDraft(makeFreshDraft());
      localStorage.removeItem(DRAFT_KEY);
    } catch (err) {
      console.error('[InnerCompass] Save failed:', err);
    }
    onClose();
  }, [draft, userId, onClose, setDraft]);

  // -------------------------------------------------------------------------
  // Metaphor selection
  // -------------------------------------------------------------------------
  const handleSelectMetaphor = useCallback((tile: MetaphorTile) => {
    setDraft(d => ({
      ...d,
      metaphorId: tile.id,
      metaphorText: tile.text,
      isConcrete: !!tile.isConcrete,
      isCustom: !!tile.isCustom,
      extensionSelections: [],
    }));
  }, [setDraft]);

  const handleExtensionSelect = useCallback((prompt: string, selected: string) => {
    setDraft(d => {
      const existing = d.extensionSelections.filter(e => e.prompt !== prompt);
      return { ...d, extensionSelections: [...existing, { prompt, selected }] };
    });
  }, [setDraft]);

  // -------------------------------------------------------------------------
  // Breath overlay
  // -------------------------------------------------------------------------
  if (showBreath) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-neutral-950">
        <div
          className="rounded-full bg-teal-500/20 border border-teal-500/30"
          style={{
            width: 120,
            height: 120,
            animation: 'breathCycle 4s ease-in-out infinite',
          }}
        />
        <p className="mt-8 text-sm text-slate-400 tracking-wide">
          {breathCount < 2 ? 'Breathe...' : 'Settling...'}
        </p>
        <p className="mt-2 text-xs text-slate-600">{breathCount + 1} / 3</p>
        <style>{`
          @keyframes breathCycle {
            0%, 100% { transform: scale(1); opacity: 0.4; }
            50% { transform: scale(1.4); opacity: 0.8; }
          }
        `}</style>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Render steps
  // -------------------------------------------------------------------------
  const renderStep = () => {
    switch (step) {
      // ── STEP 1: Metaphor tiles ──
      case 1:
        return (
          <div className="space-y-4">
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Which of these is closest to where you are right now?
            </p>
            <div className="grid grid-cols-1 gap-3">
              {METAPHOR_TILES.map(tile => (
                <button
                  key={tile.id}
                  onClick={() => handleSelectMetaphor(tile)}
                  className={`text-left p-4 rounded-lg border transition-all duration-200 text-sm leading-relaxed ${
                    draft.metaphorId === tile.id
                      ? 'border-teal-500/50 bg-teal-500/10 text-teal-200'
                      : 'border-slate-700/50 bg-slate-900/40 text-slate-300 hover:border-teal-500/30 hover:bg-teal-500/5'
                  }`}
                >
                  {tile.text}
                </button>
              ))}
            </div>
            {draft.isCustom && (
              <textarea
                value={customText}
                onChange={e => setCustomText(e.target.value)}
                placeholder="Say it your own way..."
                className="w-full mt-3 p-3 rounded-lg bg-slate-900/60 border border-teal-500/20 text-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:border-teal-500/40 resize-none"
                rows={3}
              />
            )}
            {draft.isConcrete && (
              <textarea
                value={concreteText}
                onChange={e => setConcreteText(e.target.value)}
                placeholder="What happened?"
                className="w-full mt-3 p-3 rounded-lg bg-slate-900/60 border border-teal-500/20 text-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:border-teal-500/40 resize-none"
                rows={3}
              />
            )}
          </div>
        );

      // ── STEP 2: Extensions ──
      case 2:
        return (
          <div className="space-y-6">
            <p className="text-sm text-slate-400 leading-relaxed">
              A few more details to shape the reflection.
            </p>
            {selectedTile?.extensions?.map((ext, i) => (
              <div key={i} className="space-y-2">
                <p className="text-sm text-teal-300/80">{ext.prompt}</p>
                <div className="flex flex-wrap gap-2">
                  {ext.options.map(opt => {
                    const isSelected = draft.extensionSelections.some(
                      e => e.prompt === ext.prompt && e.selected === opt
                    );
                    return (
                      <button
                        key={opt}
                        onClick={() => handleExtensionSelect(ext.prompt, opt)}
                        className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                          isSelected
                            ? 'border-teal-500/50 bg-teal-500/15 text-teal-200'
                            : 'border-slate-700/50 text-slate-400 hover:border-teal-500/30 hover:text-teal-300'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        );

      // ── STEP 3: Fishbowl perspectives ──
      case 3:
        if (showCalibration) {
          return (
            <div className="space-y-5">
              <p className="text-sm text-slate-400">Anything feel off? (optional)</p>
              <div className="flex gap-2">
                {(['yes', 'partly', 'no'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setCalibFeeling(f)}
                    className={`px-4 py-2 rounded-lg text-xs border transition-colors ${
                      calibFeeling === f
                        ? 'border-teal-500/50 bg-teal-500/10 text-teal-200'
                        : 'border-slate-700/50 text-slate-400 hover:border-teal-500/30'
                    }`}
                  >
                    {f === 'yes' ? 'All landed' : f === 'partly' ? 'Mostly' : 'Something was off'}
                  </button>
                ))}
              </div>
              {calibFeeling === 'no' && draft.fishbowlResponse && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500">Which perspective?</p>
                  <div className="flex gap-2 flex-wrap">
                    {draft.fishbowlResponse.perspectives.map(p => (
                      <button
                        key={p.perspectiveName}
                        onClick={() => setCalibPerspective(p.perspectiveName)}
                        className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                          calibPerspective === p.perspectiveName
                            ? 'border-teal-500/50 bg-teal-500/10 text-teal-200'
                            : 'border-slate-700/50 text-slate-400 hover:border-teal-500/30'
                        }`}
                      >
                        {p.perspectiveName}
                      </button>
                    ))}
                  </div>
                  <input
                    value={calibCorrection}
                    onChange={e => setCalibCorrection(e.target.value)}
                    placeholder="What felt off? (optional)"
                    className="w-full p-2 rounded-lg bg-slate-900/60 border border-slate-700/30 text-slate-300 text-xs placeholder:text-slate-600 focus:outline-none focus:border-teal-500/30"
                  />
                </div>
              )}
              <button
                onClick={handleCalibrationDone}
                className="mt-2 px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm transition-colors"
              >
                Continue
              </button>
            </div>
          );
        }

        return (
          <div className="space-y-5">
            {draft.fishbowlResponse?.perspectives.map((p, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-teal-500/15 bg-teal-500/5"
              >
                <p className="text-xs text-teal-400/60 uppercase tracking-widest mb-2">{p.perspectiveName}</p>
                <p className="text-sm text-slate-300 leading-relaxed">{p.response}</p>
              </div>
            ))}
            {!draft.thirdPerspectiveUnlocked && (
              <button
                onClick={handleUnlockThird}
                disabled={loading}
                className="text-xs text-teal-400/60 hover:text-teal-300 transition-colors"
              >
                {loading ? 'Generating...' : 'Hear a third voice'}
              </button>
            )}
          </div>
        );

      // ── STEP 4: Reflexive Turn ──
      case 4:
        return (
          <div className="flex flex-col items-center justify-center py-12 space-y-6 text-center">
            <AstralCompassIcon size={48} className="text-teal-500/40" />
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Before the next step, sit with what you just read. No need to resolve anything.
              Notice which voice surprised you, which one you wanted to argue with,
              and which one you almost skipped past.
            </p>
            <p className="text-xs text-slate-600">Take a moment, then continue.</p>
          </div>
        );

      // ── STEP 5: Bridge question ──
      case 5:
        return (
          <div className="space-y-6 py-4">
            {draft.bridgeQuestion && (
              <div className="p-5 rounded-xl border border-teal-500/20 bg-teal-500/5">
                <p className="text-sm text-teal-300/80 leading-relaxed mb-3">
                  {draft.bridgeQuestion}
                </p>
                {draft.plainGloss && (
                  <p className="text-xs text-slate-500 italic">
                    {draft.plainGloss}
                  </p>
                )}
              </div>
            )}
            <p className="text-xs text-slate-600 text-center">
              You don't need to answer this now. Just hold it.
            </p>
          </div>
        );

      // ── STEP 6: Practice + Done ──
      case 6:
        return (
          <div className="space-y-6 py-4">
            {draft.practice && (
              <div className="p-5 rounded-xl border border-teal-500/20 bg-teal-500/5">
                <p className="text-xs text-teal-400/60 uppercase tracking-widest mb-3">Your experiment</p>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {draft.practice}
                </p>
              </div>
            )}
            <button
              onClick={handleDone}
              className="w-full py-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium transition-colors"
            >
              Done
            </button>
            <p className="text-[10px] text-slate-600 text-center leading-relaxed">
              This is not therapy. If you are in crisis, please reach out:
              Crisis Text Line (text HOME to 741741) or 988 Suicide & Crisis Lifeline (call or text 988).
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  const stepTitles = ['Choose a metaphor', 'Add context', 'The Fishbowl', 'Pause', 'Bridge question', 'Your experiment'];

  return (
    <WizardFrame
      title={`Inner Compass — ${stepTitles[step - 1] || ''}`}
      currentStep={step}
      totalSteps={TOTAL_STEPS}
      isLoading={loading}
      showBackButton={step > 1 && !showCalibration}
      nextButtonText={step === 5 ? 'See practice' : step === 6 ? '' : 'Next'}
      nextButtonDisabled={!canAdvance || showCalibration}
      onClose={onClose}
      onBack={handleBack}
      onNext={handleNext}
      accentColor="teal"
      errorMessage={error}
    >
      {renderStep()}
    </WizardFrame>
  );
}
