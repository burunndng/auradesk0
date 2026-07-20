
import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import { WizardFrame } from '../shared/WizardFrame';
import { useWizardDraft } from '../../hooks/useWizardDraft';
import { PolarityMap, PolarityMapperStep, PolarityMapDraft, IntegratedInsight, PolaritySynthesis } from '../../types.ts';
import { X, ArrowLeft, ArrowRight, Lightbulb, Download, GitCompareArrows, Check, Sparkles, Loader, AlertTriangle } from 'lucide-react';
import { generatePolaritySynthesis, validatePolarity } from '../../services/aiService.ts';
import { buildPriorContext } from '../../services/priorInsightContext';
import { detectCrossModalPatternsWithAI } from '../../services/crossModalAnalyzer';
import type { PriorInsightSummary } from '../../types';

interface PolarityMapperWizardProps {
  onClose: (draft: PolarityMapDraft | null) => void;
  onSave: (map: PolarityMap) => void;
  draft: PolarityMapDraft | null;
  setDraft: (draft: PolarityMapDraft | null) => void;
  userId: string;
  insightContext?: IntegratedInsight | null;
  markInsightAsAddressed: (insightId: string, wizardType: string, sessionId: string) => void;
}

const ProgressBar = ({ currentStep }: { currentStep: PolarityMapperStep }) => {
  const steps: { label: string; wizardSteps: PolarityMapperStep[] }[] = [
    { label: 'Intro', wizardSteps: ['INTRODUCTION'] },
    { label: 'Dilemma', wizardSteps: ['DEFINE_DILEMMA'] },
    { label: 'Pole A', wizardSteps: ['POLE_A_UPSIDE', 'POLE_A_DOWNSIDE'] },
    { label: 'Pole B', wizardSteps: ['POLE_B_UPSIDE', 'POLE_B_DOWNSIDE'] },
    { label: 'Review', wizardSteps: ['REVIEW'] },
    { label: 'Position', wizardSteps: ['SELF_ASSESSMENT'] },
    { label: 'Insights', wizardSteps: ['SYNTHESIS'] },
    { label: 'Commit', wizardSteps: ['ACTION_COMMITMENT'] },
    { label: 'Complete', wizardSteps: ['COMPLETE'] },
  ];

  const currentStepIndex = steps.findIndex(s => s.wizardSteps.includes(currentStep));

  return (
    <div className="flex items-center justify-between mt-4 mb-2">
      {steps.map((step, index) => (
        <React.Fragment key={step.label}>
          <div className="flex flex-col items-center flex-1">
            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 text-xs sm:text-sm ${
              index < currentStepIndex ? 'bg-green-500 text-white' :
              index === currentStepIndex ? 'bg-green-600 text-white ring-2 sm:ring-4 ring-green-500/30' :
              'bg-neutral-700 text-slate-400'
            }`}>
              {index < currentStepIndex ? '✓' : index + 1}
            </div>
            <p className={`mt-1 sm:mt-2 text-[10px] sm:text-xs text-center max-w-[60px] sm:max-w-[80px] ${
              index === currentStepIndex ? 'text-green-300 font-bold' : 'text-slate-400'
            }`}>{step.label}</p>
          </div>
          {index < steps.length - 1 && (
            <div className={`flex-auto h-0.5 transition-all duration-300 ${
              index < currentStepIndex ? 'bg-green-500' : 'bg-neutral-700'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};


export default function PolarityMapperWizard({ onClose, onSave, draft, setDraft, userId, insightContext, markInsightAsAddressed }: PolarityMapperWizardProps) {
  // Build insights array from insightContext if available
  const insights: IntegratedInsight[] = insightContext ? [insightContext] : [];

  const [currentStep, setCurrentStep] = useState<PolarityMapperStep>(draft?.currentStep || 'INTRODUCTION');
  const [dilemma, setDilemma] = useState('');
  const [poleA_name, setPoleA_name] = useState('');
  const [poleA_upside, setPoleA_upside] = useState('');
  const [poleA_downside, setPoleA_downside] = useState('');
  const [poleB_name, setPoleB_name] = useState('');
  const [poleB_upside, setPoleB_upside] = useState('');
  const [poleB_downside, setPoleB_downside] = useState('');
  const [synthesis, setSynthesis] = useState<PolaritySynthesis | null>(null);
  const [error, setError] = useState('');
  const [isGeneratingSynthesis, setIsGeneratingSynthesis] = useState(false);
  const [linkedInsightId, setLinkedInsightId] = useState<string | undefined>(draft?.linkedInsightId || insightContext?.id);
  const [polarityValidation, setPolarityValidation] = useState<{isPolarity: boolean; explanation: string; suggestion?: string} | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(3);
  const [positionDuration, setPositionDuration] = useState('');
  const [committedActions, setCommittedActions] = useState<string[]>([]);
  const [selectedPractices, setSelectedPractices] = useState<string[]>([]);
  const [customAction, setCustomAction] = useState('');

  // Draft persistence
  const [, updateDraft] = useWizardDraft<PolarityMapDraft>('aura-draft-polarity-mapper', draft ?? {
    id: `pm-${Date.now()}`,
    date: new Date().toISOString(),
    currentStep: 'INTRODUCTION',
    dilemma: '',
    poleA_name: '',
    poleA_upside: '',
    poleA_downside: '',
    poleB_name: '',
    poleB_upside: '',
    poleB_downside: '',
    linkedInsightId: insightContext?.id,
  });

  // Sync session state to draft on changes
  useEffect(() => {
    updateDraft({
      id: draft?.id || `pm-${Date.now()}`,
      date: draft?.date || new Date().toISOString(),
      currentStep,
      dilemma,
      poleA_name,
      poleA_upside,
      poleA_downside,
      poleB_name,
      poleB_upside,
      poleB_downside,
      linkedInsightId,
    });
  }, [currentStep, dilemma, poleA_name, poleA_upside, poleA_downside, poleB_name, poleB_upside, poleB_downside, linkedInsightId]);

  // Hydrate from draft
  useEffect(() => {
    if (draft) {
      setCurrentStep(draft.currentStep || 'INTRODUCTION');
      setDilemma(draft.dilemma || '');
      setPoleA_name(draft.poleA_name || '');
      setPoleA_upside(draft.poleA_upside || '');
      setPoleA_downside(draft.poleA_downside || '');
      setPoleB_name(draft.poleB_name || '');
      setPoleB_upside(draft.poleB_upside || '');
      setPoleB_downside(draft.poleB_downside || '');
    }
  }, [draft]);

  // Sync linkedInsightId with insightContext changes
  useEffect(() => {
    if (insightContext && linkedInsightId !== insightContext.id) {
      setLinkedInsightId(insightContext.id);
    }
  }, [insightContext]);

  const handleSaveDraft = () => {
    setDraft({
      id: draft?.id || `pm-${Date.now()}`,
      date: draft?.date || new Date().toISOString(),
      currentStep,
      dilemma,
      poleA_name,
      poleA_upside,
      poleA_downside,
      poleB_name,
      poleB_upside,
      poleB_downside,
      linkedInsightId
    });
    onClose(null);
  };

  const handleNext = async () => {
    setError('');
    switch (currentStep) {
      case 'INTRODUCTION':
        setCurrentStep('DEFINE_DILEMMA');
        break;
      case 'DEFINE_DILEMMA':
        if (!dilemma.trim()) { setError('Please define the dilemma.'); return; }
        if (!poleA_name.trim() || !poleB_name.trim()) { setError('Please name both poles of the dilemma.'); return; }
        setCurrentStep('POLE_A_UPSIDE');
        break;
      case 'POLE_A_UPSIDE':
        if (!poleA_upside.trim()) { setError('Please describe the upside of Pole A.'); return; }
        setCurrentStep('POLE_A_DOWNSIDE');
        break;
      case 'POLE_A_DOWNSIDE':
        if (!poleA_downside.trim()) { setError('Please describe the downside of Pole A.'); return; }
        setCurrentStep('POLE_B_UPSIDE');
        break;
      case 'POLE_B_UPSIDE':
        if (!poleB_upside.trim()) { setError('Please describe the upside of Pole B.'); return; }
        setCurrentStep('POLE_B_DOWNSIDE');
        break;
      case 'POLE_B_DOWNSIDE':
        if (!poleB_downside.trim()) { setError('Please describe the downside of Pole B.'); return; }
        setCurrentStep('REVIEW');
        break;
      case 'REVIEW':
        setCurrentStep('SELF_ASSESSMENT');
        break;
      case 'SELF_ASSESSMENT':
        // Generate AI synthesis
        setIsGeneratingSynthesis(true);
        try {
          // Build prior context from insights
          const priorContext = buildPriorContext(insights || []);
          if (priorContext.body || priorContext.mind || priorContext.spirit || priorContext.shadow) {
            priorContext.crossModalPatterns = await detectCrossModalPatternsWithAI(priorContext);
          }

          const synthesisResult = await generatePolaritySynthesis(
            dilemma,
            poleA_name,
            poleA_upside,
            poleA_downside,
            poleB_name,
            poleB_upside,
            poleB_downside,
            priorContext
          );
          setSynthesis(synthesisResult);
          setCurrentStep('SYNTHESIS');
        } catch (err) {
          console.error('Error generating synthesis:', err);
          setError('Failed to generate AI insights. You can still save your polarity map.');
          // Allow proceeding without synthesis
          setCurrentStep('SYNTHESIS');
        } finally {
          setIsGeneratingSynthesis(false);
        }
        break;
      case 'SYNTHESIS':
        setCurrentStep('ACTION_COMMITMENT');
        break;
      case 'ACTION_COMMITMENT':
        const finalMap: PolarityMap = {
          id: draft?.id || `pm-${Date.now()}`,
          date: draft?.date || new Date().toISOString(),
          dilemma,
          poleA_name,
          poleA_upside,
          poleA_downside,
          poleB_name,
          poleB_upside,
          poleB_downside,
          synthesis: synthesis || undefined,
          currentPosition,
          positionDuration,
          committedActions,
          selectedPractices,
        };
        onSave(finalMap);
        if (linkedInsightId) {
          markInsightAsAddressed(linkedInsightId, 'Polarity Mapper', finalMap.id);
        }
        setCurrentStep('COMPLETE');
        break;
      case 'COMPLETE':
        onClose(null);
        break;
    }
  };


  const handleBack = () => {
    setError('');
    switch (currentStep) {
      case 'DEFINE_DILEMMA':
        setCurrentStep('INTRODUCTION');
        break;
      case 'POLE_A_UPSIDE':
        setCurrentStep('DEFINE_DILEMMA');
        break;
      case 'POLE_A_DOWNSIDE':
        setCurrentStep('POLE_A_UPSIDE');
        break;
      case 'POLE_B_UPSIDE':
        setCurrentStep('POLE_A_DOWNSIDE');
        break;
      case 'POLE_B_DOWNSIDE':
        setCurrentStep('POLE_B_UPSIDE');
        break;
      case 'REVIEW':
        setCurrentStep('POLE_B_DOWNSIDE');
        break;
      case 'SELF_ASSESSMENT':
        setCurrentStep('REVIEW');
        break;
      case 'SYNTHESIS':
        setCurrentStep('SELF_ASSESSMENT');
        break;
      case 'ACTION_COMMITMENT':
        setCurrentStep('SYNTHESIS');
        break;
      case 'COMPLETE':
        setCurrentStep('ACTION_COMMITMENT');
        break;
    }
  };

  const handleDownload = () => {
    const reportContent = `# Polarity Map Session Report
Date: ${new Date().toLocaleDateString()}

## The Dilemma
${dilemma}

---

## Pole A: ${poleA_name}
### Upsides
${poleA_upside}

### Downsides
${poleA_downside}

---

## Pole B: ${poleB_name}
### Upsides
${poleB_upside}

### Downsides
${poleB_downside}

---

${currentPosition && positionDuration ? `## Current Position
Position on scale (1=${poleA_name}, 5=${poleB_name}): ${currentPosition}
Duration in this position: ${positionDuration}

---

` : ''}
${synthesis ? `## AI Synthesis

### Key Tension
${synthesis.keyTension}

### Oscillation Strategy
${synthesis.oscillationStrategy}

### Warning Signs: ${poleA_name}
${synthesis.warningSignsA.map((sign, i) => `${i + 1}. ${sign}`).join('\n')}

### Warning Signs: ${poleB_name}
${synthesis.warningSignsB.map((sign, i) => `${i + 1}. ${sign}`).join('\n')}

### Action Steps
${synthesis.actionSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

---
` : ''}
${committedActions.length > 0 ? `## Committed Actions
${committedActions.map((action, i) => `${i + 1}. ${action}`).join('\n')}

---

` : ''}
Generated by Aura ILP
`;

    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `polarity-map-report-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'INTRODUCTION':
        return (
          <>
            <h3 className="text-base sm:text-lg font-semibold text-slate-100">Welcome to Polarity Mapper</h3>
            <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
              Many challenges aren't problems to be solved, but polarities to be managed. This tool helps you reframe "either/or" dilemmas into "both/and" dynamics, allowing you to leverage tension for growth.
            </p>
            <div className="bg-neutral-900/40 border border-neutral-700 p-3 sm:p-4 rounded-md text-xs sm:text-sm text-slate-300 mt-4">
              <p className="font-semibold mb-2 flex items-center gap-2"><Lightbulb size={14} className="sm:w-4 sm:h-4"/> What is a Polarity?</p>
              <p className="leading-relaxed">A pair of interdependent opposites that need each other over time, like "Activity and Rest" or "Stability and Change." They are like two sides of the same coin: you can't get rid of one without losing the value of the other.</p>
            </div>
          </>
        );
      case 'DEFINE_DILEMMA':
        return (
          <>
            <h3 className="text-base sm:text-lg font-semibold text-slate-100">Step 1: Define Your Polarity</h3>
            <p className="text-slate-400 text-xs sm:text-sm mt-2">
              What is the persistent "either/or" dilemma you're facing? Then, name the two poles (opposing sides) of this tension.
            </p>
            <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1 mt-4">The Dilemma / Central Tension:</label>
            <textarea
              value={dilemma}
              onChange={e => setDilemma(e.target.value)}
              rows={3}
              placeholder="E.g., 'The tension between focusing on short-term profits versus long-term innovation'"
              className="w-full bg-neutral-900/50 border border-neutral-700 rounded-md p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-100 text-xs sm:text-sm"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">Pole A Name:</label>
                <input
                  type="text"
                  value={poleA_name}
                  onChange={e => setPoleA_name(e.target.value)}
                  placeholder="E.g., 'Short-Term Profits'"
                  className="w-full bg-neutral-900/50 border border-neutral-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-100 text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">Pole B Name:</label>
                <input
                  type="text"
                  value={poleB_name}
                  onChange={e => setPoleB_name(e.target.value)}
                  placeholder="E.g., 'Long-Term Innovation'"
                  className="w-full bg-neutral-900/50 border border-neutral-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-100 text-xs sm:text-sm"
                />
              </div>
            </div>

            {dilemma.trim() && poleA_name.trim() && poleB_name.trim() && (
              <div className="mt-4">
                <button
                  onClick={async () => {
                    setIsValidating(true);
                    setPolarityValidation(null);
                    try {
                      const result = await validatePolarity(dilemma, poleA_name, poleB_name);
                      setPolarityValidation(result);
                    } catch (err) {
                      console.error('Validation error:', err);
                      setError('Failed to validate polarity. You can still proceed.');
                    } finally {
                      setIsValidating(false);
                    }
                  }}
                  disabled={isValidating}
                  className="text-xs sm:text-sm bg-neutral-700 hover:bg-neutral-600 text-slate-200 px-2.5 sm:px-3 py-1 rounded-md flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isValidating ? (
                    <>
                      <Loader size={14} className="animate-spin" /> Checking...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} /> Check if this is a true polarity
                    </>
                  )}
                </button>

                {polarityValidation && (
                  <div className={`mt-3 p-3 rounded-md border text-xs sm:text-sm ${
                    polarityValidation.isPolarity
                      ? 'bg-green-900/20 border-green-700/50 text-green-200'
                      : 'bg-amber-900/20 border-amber-700/50 text-amber-200'
                  }`}>
                    <p className="leading-relaxed">{polarityValidation.explanation}</p>
                    {polarityValidation.suggestion && (
                      <p className="mt-2 leading-relaxed italic">{polarityValidation.suggestion}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        );
      case 'POLE_A_UPSIDE':
        return (
          <>
            <h3 className="text-base sm:text-lg font-semibold text-slate-100">Step 2: Pole A - Upsides</h3>
            <p className="text-slate-400 text-xs sm:text-sm mt-2">
              What are the **positive results** of focusing on "{poleA_name}" when it's functioning well?
            </p>
            <details className="bg-neutral-900/40 border border-neutral-700 rounded-md p-2 sm:p-3 mt-3 text-xs sm:text-sm">
              <summary className="text-slate-400 cursor-pointer font-medium">Guiding questions to help you explore</summary>
              <ul className="mt-2 space-y-1.5 text-slate-500">
                <li>• What positive results does focusing on this pole produce?</li>
                <li>• Who benefits when this pole is functioning well?</li>
                <li>• What values does this pole serve?</li>
                <li>• What would you miss most if this pole disappeared entirely?</li>
              </ul>
            </details>
            <textarea
              value={poleA_upside}
              onChange={e => setPoleA_upside(e.target.value)}
              rows={5}
              placeholder="E.g., 'Increased revenue, immediate shareholder satisfaction, clear performance metrics, quick wins.'"
              className="w-full bg-neutral-900/50 border border-neutral-700 rounded-md p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-100 text-xs sm:text-sm mt-4"
            />
          </>
        );
      case 'POLE_A_DOWNSIDE':
        return (
          <>
            <h3 className="text-base sm:text-lg font-semibold text-slate-100">Step 2: Pole A - Downsides</h3>
            <p className="text-slate-400 text-xs sm:text-sm mt-2">
              What are the **negative results** when you over-focus on "{poleA_name}" to the exclusion of "{poleB_name}"?
            </p>
            <details className="bg-neutral-900/40 border border-neutral-700 rounded-md p-2 sm:p-3 mt-3 text-xs sm:text-sm">
              <summary className="text-slate-400 cursor-pointer font-medium">Guiding questions to help you explore</summary>
              <ul className="mt-2 space-y-1.5 text-slate-500">
                <li>• What gets neglected when you over-focus on this pole?</li>
                <li>• Who suffers when this pole dominates?</li>
                <li>• What is the cost over time of staying here too long?</li>
                <li>• What early warning signs tell you you've gone too far?</li>
              </ul>
            </details>
            <textarea
              value={poleA_downside}
              onChange={e => setPoleA_downside(e.target.value)}
              rows={5}
              placeholder="E.g., 'Stagnation, loss of competitive edge, burnout, lack of future-proofing, talent leaving for more dynamic environments.'"
              className="w-full bg-neutral-900/50 border border-neutral-700 rounded-md p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-100 text-xs sm:text-sm mt-4"
            />
          </>
        );
      case 'POLE_B_UPSIDE':
        return (
          <>
            <h3 className="text-base sm:text-lg font-semibold text-slate-100">Step 3: Pole B - Upsides</h3>
            <p className="text-slate-400 text-xs sm:text-sm mt-2">
              What are the **positive results** of focusing on "{poleB_name}" when it's functioning well?
            </p>
            <details className="bg-neutral-900/40 border border-neutral-700 rounded-md p-2 sm:p-3 mt-3 text-xs sm:text-sm">
              <summary className="text-slate-400 cursor-pointer font-medium">Guiding questions to help you explore</summary>
              <ul className="mt-2 space-y-1.5 text-slate-500">
                <li>• What positive results does focusing on this pole produce?</li>
                <li>• Who benefits when this pole is functioning well?</li>
                <li>• What values does this pole serve?</li>
                <li>• What would you miss most if this pole disappeared entirely?</li>
              </ul>
            </details>
            <textarea
              value={poleB_upside}
              onChange={e => setPoleB_upside(e.target.value)}
              rows={5}
              placeholder="E.g., 'Breakthrough products, employee engagement, market leadership, adaptability to future changes, long-term sustainability.'"
              className="w-full bg-neutral-900/50 border border-neutral-700 rounded-md p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-100 text-xs sm:text-sm mt-4"
            />
          </>
        );
      case 'POLE_B_DOWNSIDE':
        return (
          <>
            <h3 className="text-base sm:text-lg font-semibold text-slate-100">Step 3: Pole B - Downsides</h3>
            <p className="text-slate-400 text-xs sm:text-sm mt-2">
              What are the **negative results** when you over-focus on "{poleB_name}" to the exclusion of "{poleA_name}"?
            </p>
            <details className="bg-neutral-900/40 border border-neutral-700 rounded-md p-2 sm:p-3 mt-3 text-xs sm:text-sm">
              <summary className="text-slate-400 cursor-pointer font-medium">Guiding questions to help you explore</summary>
              <ul className="mt-2 space-y-1.5 text-slate-500">
                <li>• What gets neglected when you over-focus on this pole?</li>
                <li>• Who suffers when this pole dominates?</li>
                <li>• What is the cost over time of staying here too long?</li>
                <li>• What early warning signs tell you you've gone too far?</li>
              </ul>
            </details>
            <textarea
              value={poleB_downside}
              onChange={e => setPoleB_downside(e.target.value)}
              rows={5}
              placeholder="E.g., 'Lack of immediate financial stability, impatient stakeholders, unfocused efforts, projects never finishing, loss of current market share.'"
              className="w-full bg-neutral-900/50 border border-neutral-700 rounded-md p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-100 text-xs sm:text-sm mt-4"
            />
          </>
        );
      case 'REVIEW':
        return (
          <>
            <h3 className="text-base sm:text-lg font-semibold text-slate-100">Step 4: Review Your Polarity Map</h3>
            <p className="text-slate-400 text-xs sm:text-sm mt-2">
              See how both poles, with their upsides and downsides, are part of a larger dynamic.
            </p>
            <div className="bg-neutral-900/50 border border-neutral-700 rounded-lg p-3 sm:p-5 mt-4 space-y-4">
              <div className="text-center">
                <p className="text-xs sm:text-sm text-slate-400 mb-1">Central Dilemma:</p>
                <p className="text-sm sm:text-lg font-bold text-slate-100">{dilemma}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-neutral-800 border border-green-600 rounded-lg p-3">
                  <p className="font-semibold text-green-300 mb-2 text-sm">{poleA_name}</p>
                  <p className="text-xs sm:text-sm text-slate-300"><strong>Upsides:</strong> {poleA_upside}</p>
                  <p className="text-xs sm:text-sm text-slate-300 mt-2"><strong>Downsides:</strong> {poleA_downside}</p>
                </div>
                <div className="bg-neutral-800 border border-green-600 rounded-lg p-3">
                  <p className="font-semibold text-green-300 mb-2 text-sm">{poleB_name}</p>
                  <p className="text-xs sm:text-sm text-slate-300"><strong>Upsides:</strong> {poleB_upside}</p>
                  <p className="text-xs sm:text-sm text-slate-300 mt-2"><strong>Downsides:</strong> {poleB_downside}</p>
                </div>
              </div>
            </div>
            <p className="text-slate-400 text-[10px] sm:text-xs italic mt-4">
              The goal isn't to pick a side, but to actively manage the tension between them, seeking both upsides and avoiding both downsides.
            </p>
          </>
        );
      case 'SELF_ASSESSMENT':
        return (
          <>
            <h3 className="text-base sm:text-lg font-semibold text-slate-100">Where Are You Now?</h3>
            <p className="text-slate-400 text-xs sm:text-sm mt-2">
              Understanding your current position on this polarity helps generate more personalized insights.
            </p>

            <div className="mt-6">
              <p className="text-xs sm:text-sm font-medium text-slate-300 mb-3">Current Position:</p>
              <div className="flex items-center justify-between gap-2 sm:gap-3">
                {[1, 2, 3, 4, 5].map((position) => (
                  <button
                    key={position}
                    onClick={() => setCurrentPosition(position)}
                    className={`flex-1 aspect-square rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition ${
                      currentPosition === position
                        ? 'bg-green-500 text-white ring-2 sm:ring-4 ring-green-500/30'
                        : 'bg-neutral-700 text-slate-400 hover:bg-neutral-600'
                    }`}
                  >
                    {position}
                  </button>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-[10px] sm:text-xs text-slate-400">
                <span>Strongly {poleA_name}</span>
                <span>Balanced</span>
                <span>Strongly {poleB_name}</span>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs sm:text-sm font-medium text-slate-300 mb-3">How long have you been in this position?</p>
              <div className="flex flex-wrap gap-2">
                {['Days', 'Weeks', 'Months', 'Years'].map((duration) => (
                  <button
                    key={duration}
                    onClick={() => setPositionDuration(duration)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition ${
                      positionDuration === duration
                        ? 'bg-green-500 text-white'
                        : 'bg-neutral-700 text-slate-400 hover:bg-neutral-600'
                    }`}
                  >
                    {duration}
                  </button>
                ))}
              </div>
            </div>
          </>
        );
      case 'SYNTHESIS':
        if (isGeneratingSynthesis) {
          return (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader size={48} className="animate-spin text-green-400" />
              <p className="text-slate-300 text-sm sm:text-base">Generating AI synthesis...</p>
              <p className="text-slate-400 text-xs sm:text-sm max-w-md text-center">Analyzing your polarity map to provide actionable oscillation strategies and warning signs.</p>
            </div>
          );
        }

        if (!synthesis) {
          return (
            <div className="text-center py-12 space-y-4">
              <AlertTriangle size={48} className="mx-auto text-yellow-400" />
              <h3 className="text-xl font-bold text-slate-100">Synthesis Unavailable</h3>
              <p className="text-slate-400 max-w-md mx-auto text-sm">
                AI synthesis couldn't be generated, but your polarity map is complete. You can still save and download your results.
              </p>
            </div>
          );
        }

        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <Sparkles size={20} className="text-green-400 flex-shrink-0 sm:w-6 sm:h-6" />
              <h3 className="text-base sm:text-lg font-semibold text-slate-100">AI-Powered Synthesis</h3>
            </div>

            {/* Key Tension */}
            <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-3 sm:p-4">
              <h4 className="font-bold text-green-300 mb-2 text-xs sm:text-sm">🎯 Key Tension</h4>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">{synthesis.keyTension}</p>
            </div>

            {/* Oscillation Strategy */}
            <div className="bg-teal-900/20 border border-teal-700/50 rounded-lg p-3 sm:p-4">
              <h4 className="font-bold text-teal-300 mb-2 text-xs sm:text-sm">🔄 Oscillation Strategy</h4>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">{synthesis.oscillationStrategy}</p>
            </div>

            {/* Warning Signs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-3 sm:p-4">
                <h4 className="font-bold text-amber-300 mb-2 text-xs sm:text-sm flex items-center gap-2">
                  <AlertTriangle size={14} className="sm:w-4 sm:h-4" /> Warning Signs: {poleA_name}
                </h4>
                <ul className="space-y-1.5 sm:space-y-2">
                  {synthesis.warningSignsA.map((sign, i) => (
                    <li key={i} className="text-slate-300 text-[10px] sm:text-xs flex items-start gap-1.5 sm:gap-2">
                      <span className="text-amber-400 mt-0.5 flex-shrink-0">•</span>
                      <span className="leading-relaxed">{sign}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-3 sm:p-4">
                <h4 className="font-bold text-amber-300 mb-2 text-xs sm:text-sm flex items-center gap-2">
                  <AlertTriangle size={14} className="sm:w-4 sm:h-4" /> Warning Signs: {poleB_name}
                </h4>
                <ul className="space-y-1.5 sm:space-y-2">
                  {synthesis.warningSignsB.map((sign, i) => (
                    <li key={i} className="text-slate-300 text-[10px] sm:text-xs flex items-start gap-1.5 sm:gap-2">
                      <span className="text-amber-400 mt-0.5 flex-shrink-0">•</span>
                      <span className="leading-relaxed">{sign}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Steps */}
            <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-3 sm:p-4">
              <h4 className="font-bold text-purple-300 mb-3 text-xs sm:text-sm">✨ Action Steps</h4>
              <ol className="space-y-2 sm:space-y-3">
                {synthesis.actionSteps.map((step, i) => (
                  <li key={i} className="text-slate-300 text-[10px] sm:text-xs flex items-start gap-2">
                    <span className="bg-purple-500/30 text-purple-200 rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center font-bold flex-shrink-0 text-[10px] sm:text-xs">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Recommended Practices */}
            {synthesis.recommendedPractices && synthesis.recommendedPractices.length > 0 && (
              <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3 sm:p-4">
                <h4 className="font-bold text-blue-300 mb-3 text-xs sm:text-sm flex items-center gap-2">
                  <Activity size={14} className="sm:w-4 sm:h-4" /> Recommended Practices
                </h4>
                <div className="space-y-3">
                  {synthesis.recommendedPractices.map((practice, i) => (
                    <div key={i} className="text-slate-300 text-[10px] sm:text-xs">
                      <p className="font-semibold text-blue-200 uppercase tracking-wider">{practice.practiceId.replace(/-/g, ' ')}</p>
                      <p className="leading-relaxed mt-1 text-slate-400">{practice.rationale}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case 'ACTION_COMMITMENT':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-100">Commit to Action</h3>
              <p className="text-slate-400 text-xs sm:text-sm mt-2">
                Choose 1-2 action steps you'll commit to this week. You can also add your own.
              </p>
            </div>

            {synthesis && synthesis.actionSteps && synthesis.actionSteps.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs sm:text-sm font-medium text-slate-300">Suggested Actions:</p>
                {synthesis.actionSteps.map((step, i) => {
                  const isCommitted = committedActions.includes(step);
                  return (
                    <div
                      key={i}
                      onClick={() => {
                        if (isCommitted) {
                          setCommittedActions(committedActions.filter(a => a !== step));
                        } else {
                          setCommittedActions([...committedActions, step]);
                        }
                      }}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition cursor-pointer ${
                        isCommitted
                          ? 'border-green-500 bg-green-900/20'
                          : 'border-neutral-700 bg-neutral-800 hover:border-neutral-600'
                      }`}
                    >
                      <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        isCommitted ? 'bg-green-500 border-green-500' : 'border-neutral-600'
                      }`}>
                        {isCommitted && <Check size={14} className="text-white sm:w-4 sm:h-4" />}
                      </div>
                      <span className="text-xs sm:text-sm text-slate-300 leading-relaxed">{step}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {synthesis && synthesis.recommendedPractices && synthesis.recommendedPractices.length > 0 && (
              <div className="space-y-2 mt-6">
                <p className="text-xs sm:text-sm font-medium text-slate-300">Supportive Practices:</p>
                {synthesis.recommendedPractices.map((practice, i) => {
                  const isSelected = selectedPractices.includes(practice.practiceId);
                  return (
                    <div
                      key={i}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedPractices(selectedPractices.filter(p => p !== practice.practiceId));
                        } else {
                          setSelectedPractices([...selectedPractices, practice.practiceId]);
                        }
                      }}
                      className={`flex items-start gap-3 p-3 rounded-lg border transition cursor-pointer ${
                        isSelected
                          ? 'border-blue-500 bg-blue-900/20'
                          : 'border-neutral-700 bg-neutral-800 hover:border-neutral-600'
                      }`}
                    >
                      <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isSelected ? 'bg-blue-500 border-blue-500' : 'border-neutral-600'
                      }`}>
                        {isSelected && <Check size={14} className="text-white sm:w-4 sm:h-4" />}
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-slate-200 font-semibold uppercase tracking-wider">{practice.practiceId.replace(/-/g, ' ')}</p>
                        <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">{practice.rationale}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="space-y-2 pt-4">
              <p className="text-xs sm:text-sm font-medium text-slate-300">Add Your Own Action:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customAction}
                  onChange={e => setCustomAction(e.target.value)}
                  placeholder="E.g., 'Schedule weekly check-ins to review balance'"
                  className="flex-1 bg-neutral-900/50 border border-neutral-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-100 text-xs sm:text-sm"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && customAction.trim()) {
                      setCommittedActions([...committedActions, customAction.trim()]);
                      setCustomAction('');
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (customAction.trim()) {
                      setCommittedActions([...committedActions, customAction.trim()]);
                      setCustomAction('');
                    }
                  }}
                  disabled={!customAction.trim()}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 sm:px-4 py-2 rounded-md font-medium text-xs sm:text-sm transition"
                >
                  Add
                </button>
              </div>
            </div>

            {committedActions.length > 0 && (
              <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-3 sm:p-4">
                <p className="font-bold text-green-300 mb-2 text-xs sm:text-sm">
                  ✅ Committed Actions ({committedActions.length})
                </p>
                <p className="text-slate-400 text-[10px] sm:text-xs">
                  You've committed to {committedActions.length} action{committedActions.length !== 1 ? 's' : ''} to help manage this polarity.
                </p>
              </div>
            )}
          </div>
        );
      case 'COMPLETE':
        return (
          <div className="text-center py-8 sm:py-12 space-y-4">
            <Check size={40} className="mx-auto text-green-400 sm:w-12 sm:h-12" />
            <h3 className="text-xl sm:text-2xl font-bold text-slate-100">Polarity Map Complete!</h3>
            <p className="text-slate-400 max-w-md mx-auto text-xs sm:text-sm leading-relaxed">
              You've successfully mapped your dilemma with AI-powered insights. This can help you manage tension and make more integral decisions.
            </p>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition text-sm"
            >
              <Download size={16} className="sm:w-4 sm:h-4" /> Download Full Report
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  const isFirstStep = currentStep === 'INTRODUCTION';
  const isFinalStep = currentStep === 'COMPLETE';
  const isSelfAssessmentStep = currentStep === 'SELF_ASSESSMENT';
  const isSynthesisStep = currentStep === 'SYNTHESIS';
  const isActionCommitmentStep = currentStep === 'ACTION_COMMITMENT';

  const POLARITY_STEPS: PolarityMapperStep[] = [
    'INTRODUCTION', 'DEFINE_DILEMMA', 'POLE_A_UPSIDE', 'POLE_A_DOWNSIDE',
    'POLE_B_UPSIDE', 'POLE_B_DOWNSIDE', 'REVIEW', 'SELF_ASSESSMENT',
    'SYNTHESIS', 'ACTION_COMMITMENT', 'COMPLETE',
  ];
  const currentStepIndex = POLARITY_STEPS.indexOf(currentStep) + 1;

  return (
    <WizardFrame
      title="Polarity Mapper"
      currentStep={currentStepIndex}
      totalSteps={POLARITY_STEPS.length}
      isLoading={isGeneratingSynthesis}
      showBackButton={!isFirstStep && !isFinalStep}
      onClose={() => onClose(null)}
      onBack={handleBack}
      onNext={handleNext}
      accentColor="amber"
      errorMessage={error || undefined}
    >
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in flex justify-center items-center z-50 p-2 sm:p-4">
      <div className="bg-neutral-800 border border-neutral-700 rounded-lg shadow-2xl w-full max-w-3xl flex flex-col max-h-[95dvh] sm:max-h-[90dvh]">
        <header className="p-3 sm:p-4 border-b border-neutral-700 flex justify-between items-start">
          <div className="flex-1 mr-2">
            <h2 className="text-lg sm:text-2xl font-bold font-mono text-green-300 flex items-center gap-2">
              <GitCompareArrows size={20} className="sm:w-7 sm:h-7 flex-shrink-0" /> Polarity Mapper
            </h2>
            <ProgressBar currentStep={currentStep} />
          </div>
          <button onClick={handleSaveDraft} className="text-slate-500 hover:text-slate-300 p-1 flex-shrink-0">
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </header>
        {insightContext && (
          <div className="bg-teal-900/20 border border-teal-700/50 rounded-lg p-3 mx-3 sm:mx-4 mt-3 sm:mt-4">
            <p className="text-xs sm:text-sm text-teal-200">
              <strong>Working with pattern:</strong> "{insightContext.detectedPattern}"
            </p>
          </div>
        )}

        <main className="p-3 sm:p-6 flex-grow overflow-y-auto space-y-4">
          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded-md p-2 sm:p-3">
              <p className="text-red-400 text-xs sm:text-sm">{error}</p>
            </div>
          )}
          {renderStepContent()}
        </main>

        <footer className="p-3 sm:p-4 border-t border-neutral-700 flex justify-between items-center gap-2 flex-wrap sm:flex-nowrap">
          {!isFinalStep && (
            <button onClick={handleSaveDraft} className="text-xs sm:text-sm text-slate-400 hover:text-white transition order-2 sm:order-1 w-full sm:w-auto text-center sm:text-left">
              Save Draft & Exit
            </button>
          )}
          <div className="flex gap-2 sm:gap-3 ml-auto order-1 sm:order-2 w-full sm:w-auto">
            {!isFirstStep && !isFinalStep && (
              <button
                onClick={handleBack}
                disabled={isGeneratingSynthesis}
                className="flex-1 sm:flex-initial bg-neutral-600 hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 sm:px-4 py-2 rounded-md font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition"
              >
                <ArrowLeft size={14} className="sm:w-4 sm:h-4" /> Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={isGeneratingSynthesis}
              className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-md font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed ${
                isFinalStep ? 'bg-green-600 hover:bg-green-700 text-white' : 'btn-luminous'
              }`}
            >
              {isSelfAssessmentStep ? (
                isGeneratingSynthesis ? (
                  <>
                    <Loader size={14} className="animate-spin sm:w-4 sm:h-4" /> Generating...
                  </>
                ) : (
                  <>Generate Insights <Sparkles size={14} className="sm:w-4 sm:h-4" /></>
                )
              ) : isActionCommitmentStep ? (
                <>Finish & Save <Check size={14} className="sm:w-4 sm:h-4" /></>
              ) : isFinalStep ? (
                <>Close <Check size={14} className="sm:w-4 sm:h-4" /></>
              ) : (
                <>Next <ArrowRight size={14} className="sm:w-4 sm:h-4" /></>
              )}
            </button>
          </div>
        </footer>
      </div>
    </div>
    </WizardFrame>
  );
}
