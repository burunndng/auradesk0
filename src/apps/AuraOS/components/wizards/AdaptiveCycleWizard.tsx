/**
 * REFACTORED - AdaptiveCycleWizard using WizardFrame
 * Original: 433 lines → Refactored: ~320 lines (26% reduction)
 */

import React, { useState } from 'react';
import { RefreshCw, TrendingUp, Shield, Zap } from 'lucide-react';
import { AdaptiveCycleSession, AdaptiveCycleDiagnosticAnswers, IntegratedInsight } from '../../types.ts';
import { generateFullAdaptiveCycleLandscape } from '../../services/adaptiveCycleService.ts';
import { WizardFrame } from '../shared/WizardFrame';
import { useWizardDraft } from '../../hooks/useWizardDraft';

type Step = 'ONBOARDING' | 'CONTEXT' | 'SELF_ASSESSMENT' | 'LANDSCAPE' | 'COMPLETE';

interface AdaptiveCycleWizardProps {
  onClose: () => void;
  onSave: (session: AdaptiveCycleSession) => Promise<void> | void;
  insightContext?: IntegratedInsight | null;
  markInsightAsAddressed: (insightId: string, wizardType: string, sessionId: string) => void;
}

const STEPS: Step[] = ['ONBOARDING', 'CONTEXT', 'SELF_ASSESSMENT', 'LANDSCAPE', 'COMPLETE'];

export default function AdaptiveCycleWizard({
  onClose,
  onSave,
  insightContext,
  markInsightAsAddressed,
}: AdaptiveCycleWizardProps) {
  const [step, setStep] = useState<Step>('ONBOARDING');

  // Auto-save draft
  const [draft, updateDraft] = useWizardDraft<{
    systemToAnalyze: string;
    skipSelfAssessment: boolean;
    userHint: AdaptiveCycleDiagnosticAnswers;
  }>('adaptive-cycle', {
    systemToAnalyze: '',
    skipSelfAssessment: false,
    userHint: { potential: 5, connectedness: 5, resilience: 5 },
  });

  const [systemToAnalyze, setSystemToAnalyze] = useState(draft?.systemToAnalyze || '');
  const [skipSelfAssessment, setSkipSelfAssessment] = useState(draft?.skipSelfAssessment || false);
  const [userHint, setUserHint] = useState<AdaptiveCycleDiagnosticAnswers>(
    draft?.userHint || { potential: 5, connectedness: 5, resilience: 5 }
  );
  const [cycleMap, setCycleMap] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateDraftData = (updates: any) => {
    updateDraft({
      systemToAnalyze: updates.systemToAnalyze ?? systemToAnalyze,
      skipSelfAssessment: updates.skipSelfAssessment ?? skipSelfAssessment,
      userHint: updates.userHint ?? userHint,
    });
  };

  const handleNext = async () => {
    switch (step) {
      case 'ONBOARDING':
        setStep('CONTEXT');
        break;
      case 'CONTEXT':
        updateDraftData({ systemToAnalyze });
        setStep('SELF_ASSESSMENT');
        break;
      case 'SELF_ASSESSMENT':
        setIsLoading(true);
        try {
          const landscape = await generateFullAdaptiveCycleLandscape(
            systemToAnalyze,
            skipSelfAssessment ? undefined : userHint
          );
          setCycleMap(landscape);
          setError(null);
          setStep('LANDSCAPE');
        } catch (err) {
          console.error('Error generating landscape:', err);
          setError('Failed to generate landscape analysis. Please try again.');
        } finally {
          setIsLoading(false);
        }
        break;
      case 'LANDSCAPE':
        if (cycleMap) {
          const session: AdaptiveCycleSession = {
            id: `adaptive-cycle-${Date.now()}`,
            date: new Date().toISOString(),
            systemToAnalyze,
            userHint: skipSelfAssessment ? undefined : userHint,
            cycleMap,
          };
          await onSave(session);
          setStep('COMPLETE');
        }
        break;
      case 'COMPLETE':
        onClose();
        break;
    }
  };

  const handleBack = () => {
    const currentIndex = STEPS.indexOf(step);
    if (currentIndex > 0) {
      setStep(STEPS[currentIndex - 1]);
    }
  };

  const renderContent = () => {
    switch (step) {
      case 'ONBOARDING':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
              <RefreshCw className="text-emerald-400" size={24} />
              Adaptive Cycle Analysis
            </h2>
            <div className="space-y-4 text-slate-300">
              <p>
                Systems thinkers understand that all living systems move through cycles of renewal, growth, and adaptation.
              </p>
              <div className="bg-emerald-900/20 border border-emerald-700/50 rounded-lg p-4 space-y-3">
                <p className="font-semibold text-emerald-200">This tool maps:</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <TrendingUp size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span><strong>Growth phase:</strong> Where is expansion and emergence happening?</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
                    <span><strong>Stability phase:</strong> What stabilizes and sustains?</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span><strong>Release phase:</strong> What needs to be let go?</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'CONTEXT':
        const USE_CASES = [
          { id: 'work', label: 'Work/Project', example: 'My new product launch', icon: '💼' },
          { id: 'rel', label: 'Relationship', example: 'Dynamic with my partner', icon: '❤️' },
          { id: 'life', label: 'Life Phase', example: 'Transitioning to a new career', icon: '🌱' },
          { id: 'habit', label: 'Habit/Practice', example: 'My morning meditation routine', icon: '🧘' },
        ];

        return (
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Choose a context:</p>
              <div className="grid grid-cols-2 gap-3">
                {USE_CASES.map((uc) => (
                  <button
                    key={uc.id}
                    onClick={() => {
                      setSystemToAnalyze(uc.example);
                      updateDraftData({ systemToAnalyze: uc.example });
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${systemToAnalyze.includes(uc.example)
                        ? 'border-emerald-500 bg-emerald-900/20'
                        : 'border-neutral-700 bg-neutral-800 hover:border-neutral-600'
                      }`}
                  >
                    <div className="text-xl mb-1">{uc.icon}</div>
                    <p className="text-sm font-bold text-slate-100">{uc.label}</p>
                    <p className="text-[10px] text-slate-400 truncate">{uc.example}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-neutral-700"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest">
                <span className="bg-slate-900 px-2 text-slate-500">Or define your own</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                What system would you like to analyze?
              </label>
              <textarea
                value={systemToAnalyze}
                onChange={(e) => {
                  setSystemToAnalyze(e.target.value);
                  updateDraftData({ systemToAnalyze: e.target.value });
                }}
                placeholder="Describe your system here..."
                className="w-full bg-neutral-900/50 border border-neutral-700 rounded-lg p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none h-24 sm:h-28"
              />
            </div>
          </div>
        );

      case 'SELF_ASSESSMENT':
        return (
          <div className="space-y-5">
            <div>
              <label className="flex items-center gap-3 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={skipSelfAssessment}
                  onChange={(e) => {
                    setSkipSelfAssessment(e.target.checked);
                    updateDraftData({ skipSelfAssessment: e.target.checked });
                  }}
                  className="w-4 h-4 rounded border-neutral-600 bg-neutral-800 cursor-pointer"
                />
                <span className="text-slate-200">Skip assessment, use AI analysis</span>
              </label>
              <p className="text-xs text-slate-500 ml-7">
                The AI can analyze your system without your input, or you can guide it with your perspective.
              </p>
            </div>

            {!skipSelfAssessment && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-200 mb-2 block">
                    Potential (growth capacity): {userHint.potential}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={userHint.potential}
                    onChange={(e) => {
                      const newHint = { ...userHint, potential: parseInt(e.target.value) };
                      setUserHint(newHint);
                      updateDraftData({ userHint: newHint });
                    }}
                    className="w-full"
                  />
                  <p className="text-xs text-slate-400 mt-1">How much growth capacity does this system have?</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-200 mb-2 block">
                    Connectedness (integration): {userHint.connectedness}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={userHint.connectedness}
                    onChange={(e) => {
                      const newHint = { ...userHint, connectedness: parseInt(e.target.value) };
                      setUserHint(newHint);
                      updateDraftData({ userHint: newHint });
                    }}
                    className="w-full"
                  />
                  <p className="text-xs text-slate-400 mt-1">How interconnected are the parts?</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-200 mb-2 block">
                    Resilience (stability): {userHint.resilience}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={userHint.resilience}
                    onChange={(e) => {
                      const newHint = { ...userHint, resilience: parseInt(e.target.value) };
                      setUserHint(newHint);
                      updateDraftData({ userHint: newHint });
                    }}
                    className="w-full"
                  />
                  <p className="text-xs text-slate-400 mt-1">How stable and adaptive is the system?</p>
                </div>
              </div>
            )}
          </div>
        );

      case 'LANDSCAPE':
        const QUADRANT_STYLES: Record<string, { border: string; bg: string; icon: React.ReactNode; dot: string }> = {
          r: {
            border: 'border-emerald-700/50',
            bg: 'bg-emerald-900/15',
            icon: <TrendingUp size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />,
            dot: 'bg-emerald-500',
          },
          K: {
            border: 'border-blue-700/50',
            bg: 'bg-blue-900/15',
            icon: <Shield size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />,
            dot: 'bg-blue-500',
          },
          Ω: {
            border: 'border-amber-700/50',
            bg: 'bg-amber-900/15',
            icon: <Zap size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />,
            dot: 'bg-amber-500',
          },
          α: {
            border: 'border-purple-700/50',
            bg: 'bg-purple-900/15',
            icon: <RefreshCw size={16} className="text-purple-400 flex-shrink-0 mt-0.5" />,
            dot: 'bg-purple-500',
          },
        };
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-100">Adaptive Cycle Landscape</h3>
              <p className="text-xs text-slate-400 mt-1">System analyzed: <span className="text-slate-300 italic">{systemToAnalyze}</span></p>
            </div>
            {cycleMap ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(['r', 'K', 'Ω', 'α'] as const).map((phase) => {
                  const quadrant = cycleMap[phase];
                  const style = QUADRANT_STYLES[phase];
                  return (
                    <div key={phase} className={`rounded-lg border ${style.border} ${style.bg} p-4 space-y-2`}>
                      <div className="flex items-center gap-2">
                        {style.icon}
                        <h4 className="text-sm font-semibold text-slate-100">{quadrant.title}</h4>
                      </div>
                      <ul className="space-y-1.5">
                        {quadrant.points.map((point, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot} flex-shrink-0 mt-1.5`} />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-slate-400 text-sm">Loading landscape analysis...</p>
            )}
          </div>
        );

      case 'COMPLETE':
        return (
          <div className="space-y-4 text-center">
            <div className="text-5xl">✨</div>
            <h3 className="text-xl font-semibold text-slate-100">Analysis Complete</h3>
            <p className="text-slate-300">Your adaptive cycle landscape has been saved and is ready for integration into your practice.</p>
          </div>
        );

      default:
        return null;
    }
  };

  const currentStepIndex = STEPS.indexOf(step);
  const nextButtonText =
    step === 'LANDSCAPE' ? 'Save & Complete' : step === 'COMPLETE' ? 'Done' : 'Next';

  return (
    <WizardFrame
      title="Adaptive Cycle Analysis"
      currentStep={currentStepIndex + 1}
      totalSteps={STEPS.length}
      isLoading={isLoading}
      showBackButton={step !== 'ONBOARDING'}
      nextButtonText={nextButtonText}
      onClose={onClose}
      onBack={handleBack}
      onNext={handleNext}
      accentColor="emerald"
      errorMessage={error}
      children={renderContent()}
    />
  );
}
