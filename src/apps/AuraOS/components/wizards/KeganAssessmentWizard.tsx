import React, { useState, useCallback } from 'react';
import {
  KeganAssessmentSession,
  KeganAssessmentStep,
  KeganForcedChoiceAnswer,
  KeganDilemmaSetup,
  KeganStressTestResult,
  KeganInterpretation,
  IntegratedInsight,
  KeganResponse,
  KeganDomain,
} from '../../types.ts';
import { X, ArrowRight, Loader2, ChevronRight } from 'lucide-react';
import { generateKeganDilemmaOptions, generateKeganStressTest, analyzeKeganSession, KEGAN_FORCED_CHOICE_QUESTIONS } from '../../services/keganService';
import KeganPostDialogueProbe from '../shared/KeganPostDialogueProbe.tsx';

interface KeganAssessmentWizardProps {
  onClose: () => void;
  onSave: (session: KeganAssessmentSession) => void;
  session: KeganAssessmentSession | null;
  setDraft: (session: KeganAssessmentSession | null) => void;
  userId: string;
  insightContext?: IntegratedInsight | null;
  markInsightAsAddressed: (insightId: string, wizardType: string, sessionId: string) => void;
}


// ─── Component ────────────────────────────────────────────────────────────────

export default function KeganAssessmentWizard({
  onClose,
  onSave,
  session,
  setDraft,
  userId,
  insightContext,
  markInsightAsAddressed,
}: KeganAssessmentWizardProps) {
  // ── Draft restoration: Initialize from session prop if available ──
  const [step, setStep] = useState<KeganAssessmentStep>(() => {
    return session?.overallInterpretation ? 'RESULTS' : 'INTRODUCTION';
  });
  const [forcedChoiceIndex, setForcedChoiceIndex] = useState(() => {
    return session?.forcedChoiceAnswers?.length ?? 0;
  });
  const [forcedChoiceAnswers, setForcedChoiceAnswers] = useState<KeganForcedChoiceAnswer[]>(() => {
    return session?.forcedChoiceAnswers ?? [];
  });

  const [dilemmaInput, setDilemmaInput] = useState(() => {
    return session?.dilemmaSetup?.userDilemma ?? '';
  });
  const [generatedOptions, setGeneratedOptions] = useState<string[]>(() => {
    return session?.dilemmaSetup?.generatedOptions ?? [];
  });
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(() => {
    return session?.dilemmaSetup?.selectedOptionIndex ?? null;
  });
  const [loadingOptions, setLoadingOptions] = useState(false);

  const [stressTestQuestion, setStressTestQuestion] = useState(() => {
    return session?.stressTest?.question ?? '';
  });
  const [stressTestResponse, setStressTestResponse] = useState(() => {
    return session?.stressTest?.userResponse ?? '';
  });
  const [loadingStressTest, setLoadingStressTest] = useState(false);

  const [interpretation, setInterpretation] = useState<KeganInterpretation | null>(() => {
    if (!session?.overallInterpretation) return null;
    const oi = session.overallInterpretation;
    return {
      centerOfGravityLabel: (oi.centerOfGravityLabel ?? 'The Socialized Mind') as KeganInterpretation['centerOfGravityLabel'],
      numericScore: oi.numericScore ?? 3.0,
      confidenceLevel: (oi.confidenceLevel ?? 'insufficient_data') as KeganInterpretation['confidenceLevel'],
      subjectObjectMap: oi.subjectObjectMap ?? { subjectTo: '', objectTo: '' },
      domainVariation: oi.domainVariation == null ? '' : typeof oi.domainVariation === 'string' ? oi.domainVariation : JSON.stringify(oi.domainVariation),
      consolidationStrengths: oi.consolidationStrengths ?? '',
      growthFrontier: oi.growthFrontier ?? '',
      tightness: oi.tightness ?? '',
      practiceRecommendation: oi.practiceRecommendation ?? { storyReference: '', practice: '', observation: '' },
      domainSplit: oi.domainSplit ?? '',
      growthEdge: oi.growthEdge ?? '',
    };
  });
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const [selfReflection, setSelfReflection] = useState(() => {
    return session?.selfReflection ?? '';
  });
  const [showProbe, setShowProbe] = useState(false);
  const [finalSession, setFinalSession] = useState<KeganAssessmentSession | null>(() => {
    return session ?? null;
  });

  // ── Forced choice ──────────────────────────────────────────────────────────

  const handleForcedChoice = useCallback((option: 'A' | 'B') => {
    const q = KEGAN_FORCED_CHOICE_QUESTIONS[forcedChoiceIndex];
    const answer: KeganForcedChoiceAnswer = {
      questionId: q.id,
      chosenOption: option,
      questionDomain: q.domain,
    };
    const updated = [...forcedChoiceAnswers, answer];
    setForcedChoiceAnswers(updated);

    if (forcedChoiceIndex < KEGAN_FORCED_CHOICE_QUESTIONS.length - 1) {
      setForcedChoiceIndex(forcedChoiceIndex + 1);
    } else {
      setStep('DILEMMA_INPUT');
    }
  }, [forcedChoiceIndex, forcedChoiceAnswers]);

  // ── Dilemma options ────────────────────────────────────────────────────────

  const handleDilemmaSubmit = useCallback(async () => {
    if (!dilemmaInput.trim() || loadingOptions) return;
    setLoadingOptions(true);
    try {
      const opts = await generateKeganDilemmaOptions(dilemmaInput.trim());
      setGeneratedOptions(opts);
    } finally {
      setLoadingOptions(false);
    }
  }, [dilemmaInput, loadingOptions]);

  const handleOptionSelect = useCallback(async (idx: number) => {
    setSelectedOptionIndex(idx);
    setLoadingStressTest(true);
    try {
      const q = await generateKeganStressTest(dilemmaInput.trim(), generatedOptions[idx]);
      setStressTestQuestion(q);
      setStep('STRESS_TEST');
    } finally {
      setLoadingStressTest(false);
    }
  }, [dilemmaInput, generatedOptions]);

  // ── Analysis ───────────────────────────────────────────────────────────────

  const handleStressTestSubmit = useCallback(async () => {
    if (!stressTestResponse.trim()) return;
    // Validate that an option was actually selected
    if (selectedOptionIndex === null) {
      console.error('Bug: selectedOptionIndex is null — user did not select an option');
      return;
    }
    setAnalysisError(null);
    setStep('ANALYSIS');
    setLoadingAnalysis(true);
    try {
      const dilemmaSetup: KeganDilemmaSetup = {
        userDilemma: dilemmaInput.trim(),
        generatedOptions,
        selectedOptionIndex,
      };
      const result = await analyzeKeganSession(forcedChoiceAnswers, dilemmaSetup, stressTestResponse.trim());
      setInterpretation(result);

      // Persist profile for cross-wizard injection
      localStorage.setItem('aura-kegan-profile', JSON.stringify({
        numericScore: result.numericScore,
        centerOfGravityLabel: result.centerOfGravityLabel,
      }));

      // ── Map new hybrid data to legacy responses[] format for KeganPostDialogueProbe ──
      // Probe functions expect assessmentSession.responses[] with domain + response
      const mapDomain = (shortDomain: string): KeganDomain => {
        switch (shortDomain) {
          case 'Work': return 'Work & Purpose';
          case 'Identity': return 'Identity & Self';
          case 'Values': return 'Values & Beliefs';
          case 'Relationships': return 'Relationships';
          default: return 'Values & Beliefs'; // Fallback
        }
      };

      const legacyResponses: KeganResponse[] = [
        // Map forced-choice answers to responses (use the chosen option as the response)
        ...forcedChoiceAnswers.map((answer, idx): KeganResponse => {
          // Find the original question to get the full option text
          const q = KEGAN_FORCED_CHOICE_QUESTIONS[idx];
          const optionText = answer.chosenOption === 'A' ? q?.optionA : q?.optionB;
          return {
            promptId: `forced-choice-${idx}`,
            domain: mapDomain(answer.questionDomain),
            response: optionText || answer.chosenOption,
          };
        }),
        // Map dilemma setup
        {
          promptId: 'dilemma-setup',
          domain: 'Values & Beliefs',
          response: dilemmaInput.trim(),
        },
        // Map stress test response
        {
          promptId: 'stress-test',
          domain: 'Identity & Self',
          response: stressTestResponse.trim(),
        },
      ];

      // Build session draft
      const sess: KeganAssessmentSession = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        forcedChoiceAnswers,
        dilemmaSetup,
        stressTest: { question: stressTestQuestion, userResponse: stressTestResponse.trim() },
        overallInterpretation: {
          centerOfGravityLabel: result.centerOfGravityLabel,
          numericScore: result.numericScore,
          subjectObjectMap: result.subjectObjectMap,
          domainSplit: result.domainSplit,
          growthEdge: result.growthEdge,
          // Legacy compatibility for probe functions
          centerOfGravity: result.centerOfGravityLabel,
          developmentalEdge: result.growthEdge,
          recommendations: [],
        },
        responses: legacyResponses,
      };
      setFinalSession(sess);
      setDraft(sess);
      setStep('RESULTS');
    } catch (err) {
      console.error('[KeganAssessmentWizard] Analysis failed:', err);
      setAnalysisError('The analysis could not be completed. Please check your connection and try again.');
      setStep('STRESS_TEST');
    } finally {
      setLoadingAnalysis(false);
    }
  }, [
    stressTestResponse, dilemmaInput, generatedOptions, selectedOptionIndex,
    forcedChoiceAnswers, stressTestQuestion, setDraft,
  ]);

  // ── Save + reflection ──────────────────────────────────────────────────────

  const handleSaveReflection = useCallback(() => {
    if (!finalSession) return;
    const updated = { ...finalSession, selfReflection };
    setFinalSession(updated);
    setDraft(updated);
    onSave(updated);
    if (insightContext?.id) {
      markInsightAsAddressed(insightContext.id, 'Kegan Assessment', updated.id);
    }
    setStep('POST_DIALOGUE');
    setShowProbe(true);
  }, [finalSession, selfReflection, setDraft, onSave, insightContext, markInsightAsAddressed]);

  // ── Rendering helpers ──────────────────────────────────────────────────────

  const currentQ = KEGAN_FORCED_CHOICE_QUESTIONS[forcedChoiceIndex];

  // ── Post-dialogue probe ────────────────────────────────────────────────────

  if (showProbe && finalSession) {
    return (
      <KeganPostDialogueProbe
        assessmentSession={finalSession}
        onClose={onClose}
        onComplete={() => onClose()}
      />
    );
  }

  // Fallback: if forced choice step but no current question, show error
  if (step === 'FORCED_CHOICE' && !currentQ) {
    console.error('Forced choice question not found at index:', forcedChoiceIndex);
    return (
      <div className="fixed inset-0 bg-stone-950/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-stone-900 border border-stone-700/50 rounded-2xl w-full max-w-2xl p-6 text-center space-y-4">
          <p className="text-stone-300">An error occurred loading the assessment. Please close and try again.</p>
          <button
            onClick={onClose}
            className="w-full bg-amber-700/80 hover:bg-amber-600/80 text-amber-100 font-medium py-3 px-6 rounded-xl transition-colors min-h-[44px]"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-stone-950/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-stone-700/50 rounded-2xl w-full max-w-2xl max-h-[90dvh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-stone-900/95 backdrop-blur-sm border-b border-stone-700/30 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="font-serif text-lg text-stone-100">Developmental Mind Assessment</h2>
            <p className="text-xs text-stone-500 mt-0.5">Robert Kegan's Constructive-Developmental Theory</p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-500 hover:text-stone-300 transition-colors p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">

          {/* ── INTRODUCTION ─────────────────────────────────────────────── */}
          {step === 'INTRODUCTION' && (
            <div className="space-y-6">
              <div className="space-y-4 text-stone-300">
                <p className="text-base leading-relaxed">
                  This isn't a personality test. There are no types to unlock, no scores to optimize.
                </p>
                <p className="text-sm leading-relaxed text-stone-400">
                  What you're about to explore is something more structural — the lens through which you currently make meaning of your life. How you understand yourself, relationships, conflict, and the things you hold most dear.
                </p>
                <p className="text-sm leading-relaxed text-stone-400">
                  The assessment works in three parts: a few rapid-fire choices, a personal dilemma you bring, and one high-stakes question designed to reveal something real.
                </p>
                <p className="text-sm leading-relaxed text-stone-400">
                  There are no right answers. The goal is not to perform a more evolved version of yourself — it's to see clearly where you actually are.
                </p>
              </div>
              <button
                onClick={() => setStep('FORCED_CHOICE')}
                className="w-full bg-amber-700/80 hover:bg-amber-600/80 text-amber-100 font-medium py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 min-h-[44px]"
              >
                Begin <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── FORCED CHOICE ────────────────────────────────────────────── */}
          {step === 'FORCED_CHOICE' && (
            <div className="space-y-6">
              {/* Progress dots */}
              <div className="flex items-center justify-center gap-2">
                {KEGAN_FORCED_CHOICE_QUESTIONS.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i < forcedChoiceIndex
                        ? 'bg-amber-600'
                        : i === forcedChoiceIndex
                        ? 'bg-amber-400'
                        : 'bg-stone-700'
                    }`}
                  />
                ))}
              </div>

              <div className="text-center space-y-1">
                <p className="text-xs text-stone-500 uppercase tracking-widest">{currentQ.domain}</p>
                <p className="text-sm text-stone-500">{forcedChoiceIndex + 1} of {KEGAN_FORCED_CHOICE_QUESTIONS.length}</p>
              </div>

              <p className="font-serif text-base text-stone-200 text-center leading-relaxed">
                {currentQ.question}
              </p>

              <p className="text-xs text-stone-500 text-center">Choose the one that resonates more — even slightly.</p>

              <div className="space-y-3">
                <button
                  onClick={() => handleForcedChoice('A')}
                  className="w-full text-left bg-stone-800 hover:bg-stone-700 border border-stone-700/50 hover:border-amber-700/50 text-stone-300 py-4 px-5 rounded-xl transition-all min-h-[44px] text-sm leading-relaxed"
                >
                  {currentQ.optionA}
                </button>
                <button
                  onClick={() => handleForcedChoice('B')}
                  className="w-full text-left bg-stone-800 hover:bg-stone-700 border border-stone-700/50 hover:border-amber-700/50 text-stone-300 py-4 px-5 rounded-xl transition-all min-h-[44px] text-sm leading-relaxed"
                >
                  {currentQ.optionB}
                </button>
              </div>
            </div>
          )}

          {/* ── MAGIC SETUP ──────────────────────────────────────────────── */}
          {step === 'DILEMMA_INPUT' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-serif text-base text-stone-200">Bring a real dilemma</h3>
                <p className="text-sm text-stone-400 leading-relaxed">
                  Think of a tension you're currently navigating — something where you feel genuinely pulled in different directions. Describe it in one sentence.
                </p>
              </div>

              <textarea
                value={dilemmaInput}
                onChange={e => setDilemmaInput(e.target.value)}
                placeholder="e.g. I want to advance my career but the opportunity requires me to relocate away from my family."
                className="w-full bg-stone-800/50 border border-stone-700/50 focus:border-amber-700/50 rounded-xl p-4 text-stone-200 placeholder:text-stone-600 text-sm resize-none outline-none transition-colors min-h-[100px]"
                rows={3}
              />

              {generatedOptions.length === 0 && (
                <button
                  onClick={handleDilemmaSubmit}
                  disabled={!dilemmaInput.trim() || loadingOptions}
                  className="w-full bg-amber-700/80 hover:bg-amber-600/80 disabled:opacity-40 disabled:cursor-not-allowed text-amber-100 font-medium py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 min-h-[44px]"
                >
                  {loadingOptions ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating options…
                    </>
                  ) : (
                    <>Generate options <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              )}

              {generatedOptions.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-stone-400">Which of these resonates most with how you'd actually navigate this?</p>
                  {generatedOptions.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleOptionSelect(i)}
                      disabled={loadingStressTest}
                      className="w-full text-left bg-stone-800 hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed border border-stone-700/50 hover:border-amber-700/50 text-stone-300 py-4 px-5 rounded-xl transition-all text-sm leading-relaxed min-h-[44px]"
                    >
                      {loadingStressTest && selectedOptionIndex === i ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-3 h-3 animate-spin flex-shrink-0" />
                          {opt}
                        </span>
                      ) : opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── STRESS TEST ──────────────────────────────────────────────── */}
          {step === 'STRESS_TEST' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-xs text-stone-500 uppercase tracking-widest">One more question</p>
                <p className="font-serif text-base text-stone-200 leading-relaxed">
                  {stressTestQuestion}
                </p>
              </div>

              {analysisError && (
                <div className="bg-rose-950/40 border border-rose-800/40 rounded-xl px-4 py-3 text-sm text-rose-300">
                  {analysisError}
                </div>
              )}

              <p className="text-xs text-stone-500">Answer honestly — 1 to 3 sentences is enough.</p>

              <textarea
                value={stressTestResponse}
                onChange={e => setStressTestResponse(e.target.value)}
                placeholder="Write your response here…"
                className="w-full bg-stone-800/50 border border-stone-700/50 focus:border-amber-700/50 rounded-xl p-4 text-stone-200 placeholder:text-stone-600 text-sm resize-none outline-none transition-colors min-h-[120px]"
                rows={4}
              />

              <button
                onClick={handleStressTestSubmit}
                disabled={!stressTestResponse.trim() || selectedOptionIndex === null}
                className="w-full bg-amber-700/80 hover:bg-amber-600/80 disabled:opacity-40 disabled:cursor-not-allowed text-amber-100 font-medium py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 min-h-[44px]"
                title={selectedOptionIndex === null ? 'Select an option above first' : ''}
              >
                Complete assessment <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── ANALYSIS ─────────────────────────────────────────────────── */}
          {step === 'ANALYSIS' && (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              <p className="font-serif text-stone-300 text-center">Mapping your developmental center of gravity…</p>
              <p className="text-xs text-stone-500 text-center max-w-xs">
                Evaluating structural complexity, subject-object capacity, and identity differentiation.
              </p>
            </div>
          )}

          {/* ── RESULTS ──────────────────────────────────────────────────── */}
          {step === 'RESULTS' && interpretation && (
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <p className="text-xs text-stone-500 uppercase tracking-widest">Your center of gravity</p>
                <h3 className="font-serif text-xl text-amber-300">{interpretation.centerOfGravityLabel}</h3>
              </div>

              {/* Card 1: Subject/Object Map */}
              <div className="bg-stone-800/60 border border-stone-700/40 rounded-xl p-5 space-y-4">
                <h4 className="text-xs text-stone-400 uppercase tracking-wider font-medium">What You're Embedded In vs. What You Can See</h4>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-xs text-amber-600/80 uppercase tracking-wider">Currently Subject To</p>
                    <p className="text-sm text-stone-300 leading-relaxed">{interpretation.subjectObjectMap.subjectTo}</p>
                  </div>
                  <div className="border-t border-stone-700/30" />
                  <div className="space-y-1">
                    <p className="text-xs text-emerald-600/80 uppercase tracking-wider">Can Hold as Object</p>
                    <p className="text-sm text-stone-300 leading-relaxed">{interpretation.subjectObjectMap.objectTo}</p>
                  </div>
                </div>
              </div>

              {/* Card 2: Domain Split */}
              <div className="bg-stone-800/60 border border-stone-700/40 rounded-xl p-5 space-y-2">
                <h4 className="text-xs text-stone-400 uppercase tracking-wider font-medium">Contextual Variation</h4>
                <p className="text-sm text-stone-300 leading-relaxed">{interpretation.domainSplit}</p>
              </div>

              {/* Card 3: Growth Edge */}
              <div className="bg-stone-800/60 border border-amber-900/30 rounded-xl p-5 space-y-2">
                <h4 className="text-xs text-amber-700/80 uppercase tracking-wider font-medium">The Growing Edge</h4>
                <p className="text-sm text-stone-300 leading-relaxed">{interpretation.growthEdge}</p>
              </div>

              {/* Reflection */}
              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <p className="text-sm text-stone-300">What lands, and what doesn't?</p>
                  <p className="text-xs text-stone-500">Engaging with your reaction is part of the process. Optional.</p>
                </div>
                <textarea
                  value={selfReflection}
                  onChange={e => setSelfReflection(e.target.value)}
                  placeholder="Your reflection…"
                  className="w-full bg-stone-800/50 border border-stone-700/50 focus:border-amber-700/50 rounded-xl p-4 text-stone-200 placeholder:text-stone-600 text-sm resize-none outline-none transition-colors"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { onSave(finalSession!); onClose(); }}
                  className="flex-1 bg-stone-800 hover:bg-stone-700 text-stone-300 font-medium py-3 px-4 rounded-xl transition-colors text-sm min-h-[44px]"
                >
                  Save & close
                </button>
                <button
                  onClick={handleSaveReflection}
                  className="flex-1 bg-amber-700/80 hover:bg-amber-600/80 text-amber-100 font-medium py-3 px-4 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 min-h-[44px]"
                >
                  Go deeper <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
