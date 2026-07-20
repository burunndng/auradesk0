import React, { useState, useEffect } from 'react';
import { WizardFrame } from '../shared/WizardFrame';
import { useWizardDraft } from '../../hooks/useWizardDraft';
import { useInsightsContext } from '../../contexts/InsightsContext';
import { generateInsightFromSession } from '../../services/insightGenerator';
import { wizardSessionService } from '../../services/wizardSessionService';
import SafetyBanner from '../shared/SafetyBanner';
import { detectCrisisLevel } from '../../utils/crisisDetection';
import { FourQuadrantCatalystDraft, FourQuadrantCatalystSession, StructuralEdit, IntegratedInsight, Practice } from '../../types';
import {
  TransformativeArcIcon,
  FocusApertureIcon,
  SomaticPillarIcon,
  DyadBridgeIcon,
  StructuralLatticeIcon,
  ApophaticFrameIcon,
  VoidEclipseIcon,
  MerkabaIcon
} from '../visualizations/SacredGeometryIcons';
import {
  clarifyWithoutElevating,
  makeClearerNotNicer,
  removeBlameKeepTruth,
  shortenBy30Percent
} from '../../services/fourQuadrantService';
import { useWizardContext } from '../../contexts/WizardContext';
import { practices } from '../../constants';
import { v4 as uuidv4 } from 'uuid';

type WizardStep =
  | 'SELECT_THREAD'
  | 'UL_NAME_IT'
  | 'UR_SOMATIC'
  | 'UR_MICRO_ACTION'
  | 'LL_RELATIONAL'
  | 'LR_STRUCTURAL'
  | 'RESISTANCE'
  | 'ACTION_SHEET'
  | 'COMPLETE';

const STAGE_ORDER: WizardStep[] = [
  'SELECT_THREAD',
  'UL_NAME_IT',
  'UR_SOMATIC',
  'UR_MICRO_ACTION',
  'LL_RELATIONAL',
  'LR_STRUCTURAL',
  'RESISTANCE',
  'ACTION_SHEET'
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

export default function FourQuadrantCatalystWizard({ isOpen, onClose, userId }: Props) {
  const [step, setStep] = useState<WizardStep>('SELECT_THREAD');
  const [draft, updateDraft, , clearDraft] = useWizardDraft<FourQuadrantCatalystDraft>('aura-draft-4q-catalyst', {
    selectedInsight: null,
    insightStatement: '',
    insightCost: '',
    somaticCues: [],
    somaticIntensity: 5,
    microActionContext: '',
    microActionCategory: '',
    microActionSpecific: '',
    implementationIntention: '',
    relationalMoveType: '',
    relationalRecipient: '',
    relationalMessage: '',
    structuralEdits: [],
    resistanceBlocker: '',
    resistanceCounter: '',
    deadline: '',
    finalReflection: ''
  });

  const { integratedInsights, setIntegratedInsights } = useInsightsContext();
  const { history } = useWizardContext();
  const [crisisLevel, setCrisisLevel] = useState<'none' | 'concern' | 'high'>('none');
  const [isRefining, setIsRefining] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Helper arrays for chips
  const somaticCueOptions = ["tight chest", "jaw clench", "heat in face", "shoulders rise", "shallow breath", "stomach knot", "speed up", "go numb", "freeze", "buzzing"];
  const actionCategories = ["Pause for 10 seconds", "Ask one question", "Name the pattern aloud", "Do the smallest next task", "Tell one truth (one sentence)", "Delay the impulse by 2 minutes"];
  const relationMoveTypes = ['witness', 'request', 'repair', 'boundary'] as const;
  const relationRecipients = ['partner', 'friend', 'colleague', 'therapist', 'family', 'other'];
  const structuralEditTypes = ['calendar', 'environment', 'digital', 'friction', 'automation'] as const;
  const resistanceBlockers = ["forgetting", "shame", "overwhelm", "resentment", "rebellion", "fatigue", "fear of conflict", "perfectionism", "something 'more important'"];
  const resistanceCounters = ["make it even smaller", "text my witness first", "set a 2-minute timer", "rename success: just show up", "do it badly on purpose"];

  useEffect(() => {
    // Basic crisis check on free text
    const textToCheck = `${draft.insightStatement} ${draft.insightCost} ${draft.relationalMessage}`;
    setCrisisLevel(detectCrisisLevel(textToCheck));
  }, [draft.insightStatement, draft.insightCost, draft.relationalMessage]);

  useEffect(() => {
    if (!draft.deadline) {
      const d = new Date();
      d.setHours(d.getHours() + 72);
      updateDraft({ deadline: d.toISOString() });
    }
  }, []);

  // Early return AFTER all hooks (Rules of Hooks compliance)
  if (!isOpen) return null;

  const currentStepIndex = STAGE_ORDER.indexOf(step);
  const progress = Math.round((currentStepIndex / (STAGE_ORDER.length - 1)) * 100);

  const canAdvance = () => {
    if (crisisLevel === 'high') return false;
    switch (step) {
      case 'SELECT_THREAD':
        return !!draft.selectedInsight || draft.insightStatement.trim().length > 0;
      case 'UL_NAME_IT':
        return draft.insightStatement.trim().length >= 20 && draft.insightCost.trim().length >= 20;
      case 'UR_SOMATIC':
        return draft.somaticCues.length > 0;
      case 'UR_MICRO_ACTION':
        return !!draft.microActionCategory && draft.implementationIntention.trim().length > 0;
      case 'LL_RELATIONAL':
        return !!draft.relationalMoveType && !!draft.relationalRecipient && draft.relationalMessage.trim().length > 0;
      case 'LR_STRUCTURAL':
        return draft.structuralEdits.length > 0 && draft.structuralEdits.every(e => e.what.trim().length > 0 && e.when.trim().length > 0);
      case 'RESISTANCE':
        return !!draft.resistanceBlocker && !!draft.resistanceCounter;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (!canAdvance()) return;

    if (step === 'SELECT_THREAD') {
      if (draft.selectedInsight && !draft.insightStatement) {
        updateDraft({ insightStatement: draft.selectedInsight.detectedPattern });
      }
    }

    if (step === 'UR_SOMATIC' && !draft.microActionContext) {
      updateDraft({ microActionContext: `When I notice ${draft.somaticCues.join(' or ')}` });
    }

    if (currentStepIndex < STAGE_ORDER.length - 1) {
      setStep(STAGE_ORDER[currentStepIndex + 1]);
    } else {
      await handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setStep(STAGE_ORDER[currentStepIndex - 1]);
    }
  };

  const handleComplete = async () => {
    setIsGenerating(true);
    try {
      const sessionData: FourQuadrantCatalystSession = {
        id: uuidv4(),
        date: new Date().toISOString(),
        wizardType: '4-Quadrant Catalyst',
        insightStatement: draft.insightStatement,
        insightCost: draft.insightCost,
        somaticCues: draft.somaticCues,
        somaticIntensity: draft.somaticIntensity,
        microActionContext: draft.microActionContext,
        microActionCategory: draft.microActionCategory,
        microActionSpecific: draft.microActionSpecific,
        implementationIntention: draft.implementationIntention,
        relationalMoveType: draft.relationalMoveType as any,
        relationalRecipient: draft.relationalRecipient,
        relationalMessage: draft.relationalMessage,
        structuralEdits: draft.structuralEdits,
        resistanceBlocker: draft.resistanceBlocker,
        resistanceCounter: draft.resistanceCounter,
        deadline: draft.deadline,
        finalReflection: draft.finalReflection
      };

      const promptData = `
Pattern: ${draft.insightStatement}
Cost: ${draft.insightCost}
Somatic Cues: ${draft.somaticCues.join(', ')} (Intensity: ${draft.somaticIntensity})
Micro-Action: ${draft.implementationIntention}
Relational Move: To ${draft.relationalRecipient} (${draft.relationalMoveType}) - "${draft.relationalMessage}"
Structural Edits: ${draft.structuralEdits.map(e => e.what).join(', ')}
Resistance: If ${draft.resistanceBlocker}, then ${draft.resistanceCounter}
Reflection: ${draft.finalReflection}
      `;

      // Build practices list so the AI can generate real recommendations
      const availablePractices = [
        ...(Array.isArray(practices.body) ? practices.body.map((p: Practice) => ({ id: p.id, name: p.name })) : []),
        ...(Array.isArray(practices.mind) ? practices.mind.map((p: Practice) => ({ id: p.id, name: p.name })) : []),
        ...(Array.isArray(practices.shadow) ? practices.shadow.map((p: Practice) => ({ id: p.id, name: p.name })) : []),
        ...(Array.isArray(practices.spirit) ? practices.spirit.map((p: Practice) => ({ id: p.id, name: p.name })) : []),
      ].slice(0, 30);

      const insight = await generateInsightFromSession({
        wizardType: '4-Quadrant Catalyst',
        sessionId: sessionData.id,
        sessionName: '4-Quadrant Catalyst Session',
        sessionSummary: promptData,
        sessionReport: `User anchored insight "${draft.insightStatement}" into four quadrants: somatic (${draft.somaticCues.join(', ')}), micro-action (${draft.implementationIntention}), relational (${draft.relationalMoveType} to ${draft.relationalRecipient}), structural (${draft.structuralEdits.map(e => e.what).join(', ')}).`,
        userId: userId || 'anonymous',
        availablePractices,
        dataContext: {
          totalSessions: 1,
          sessionsInLastWeek: 1,
          existingInsights: 0,
        },
      });

      sessionData.linkedInsightId = insight.id;
      setIntegratedInsights(prev => [...prev, insight]);

      if (userId) {
        await wizardSessionService.saveSession({
          user_id: userId,
          session_id: sessionData.id,
          type: '4-Quadrant Catalyst',
          content: sessionData,
          created_at: sessionData.date
        });
      }

      clearDraft();
      setStep('COMPLETE');
    } catch (err) {
      console.error('Failed to complete 4-Quadrant Catalyst:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClarify = async () => {
    setIsRefining(true);
    const res = await clarifyWithoutElevating(draft.insightStatement);
    updateDraft({ insightStatement: res });
    setIsRefining(false);
  };

  const applyRelationalRefinement = async (type: 'clearer' | 'noblame' | 'shorten') => {
    setIsRefining(true);
    let res = draft.relationalMessage;
    if (type === 'clearer') res = await makeClearerNotNicer(res);
    if (type === 'noblame') res = await removeBlameKeepTruth(res);
    if (type === 'shorten') res = await shortenBy30Percent(res);
    updateDraft({ relationalMessage: res });
    setIsRefining(false);
  };

  const renderScreen = () => {
    switch (step) {
      case 'SELECT_THREAD':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="text-center mb-8">
              <MerkabaIcon className="w-12 h-12 text-teal-500 mx-auto mb-4 opacity-80" />
              <h2 className="text-2xl font-serif text-teal-100 mb-2">Select the Thread</h2>
              <p className="text-stone-400 max-w-lg mx-auto">
                An insight that stays in the mind is a ghost. Choose one pattern you've uncovered recently. We will anchor it into the four corners of reality.
              </p>
            </div>

            <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {integratedInsights.slice(-5).map(insight => (
                <button
                  key={insight.id}
                  onClick={() => updateDraft({ selectedInsight: insight, insightStatement: insight.detectedPattern })}
                  className={`w-full text-left p-4 min-h-[60px] rounded-xl border transition-all ${draft.selectedInsight?.id === insight.id
                    ? 'bg-teal-950/40 border-teal-500/50'
                    : 'bg-stone-900/40 border-stone-800 hover:bg-stone-800/60'
                    }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-stone-300 font-medium">{insight.mindToolType}</span>
                    <span className="text-xs text-stone-500">{new Date(insight.dateCreated).toLocaleDateString()}</span>
                  </div>
                  <p className="text-teal-100/90 mt-2 text-sm leading-relaxed">"{insight.detectedPattern}"</p>
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-stone-800/50">
              <label className="block text-sm text-stone-400 mb-2">Or write your own insight:</label>
              <textarea
                value={draft.insightStatement}
                onChange={e => updateDraft({ insightStatement: e.target.value, selectedInsight: null })}
                className="w-full bg-stone-900/50 border border-stone-800 rounded-xl p-3 text-stone-200 focus:outline-none focus:border-teal-500/50 min-h-[100px]"
                placeholder="I am noticing a pattern where I..."
              />
            </div>
          </div>
        );

      case 'UL_NAME_IT':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="text-center mb-8">
              <FocusApertureIcon className="w-12 h-12 text-amber-500 mx-auto mb-4 opacity-80" />
              <h2 className="text-2xl font-serif text-amber-100 mb-2">Name It Plainly</h2>
              <p className="text-stone-400 max-w-lg mx-auto">
                Strip away the terminology. What is this pattern, plainly? And what is it costing you to keep it running?
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm text-amber-200/70 mb-2">In my own words, the pattern is…</label>
                <div className="relative">
                  <textarea
                    value={draft.insightStatement}
                    onChange={e => updateDraft({ insightStatement: e.target.value })}
                    className="w-full bg-stone-900/50 border border-stone-800 rounded-xl p-3 text-stone-200 focus:outline-none focus:border-amber-500/50 min-h-[100px]"
                  />
                  <button
                    onClick={handleClarify}
                    disabled={isRefining || draft.insightStatement.length < 10}
                    className="absolute bottom-2 right-2 px-3 py-2 min-h-[44px] bg-stone-800 text-xs text-stone-300 rounded-lg hover:bg-stone-700 disabled:opacity-50 transition-colors"
                  >
                    {isRefining ? 'Refining...' : 'Clarify (AI)'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-amber-200/70 mb-2">What it's been costing me…</label>
                <textarea
                  value={draft.insightCost}
                  onChange={e => updateDraft({ insightCost: e.target.value })}
                  className="w-full bg-stone-900/50 border border-stone-800 rounded-xl p-3 text-stone-200 focus:outline-none focus:border-amber-500/50 min-h-[100px]"
                  placeholder="It costs me connection, energy, peace..."
                />
              </div>
            </div>
          </div>
        );

      case 'UR_SOMATIC':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="text-center mb-8">
              <SomaticPillarIcon className="w-12 h-12 text-emerald-500 mx-auto mb-4 opacity-80" />
              <h2 className="text-2xl font-serif text-emerald-100 mb-2">Find the Somatic Tell</h2>
              <p className="text-stone-400 max-w-lg mx-auto">
                The body knows before the mind does. When this pattern is about to activate, what happens in your nervous system? This is your early-warning signal.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {somaticCueOptions.map(cue => (
                <button
                  key={cue}
                  onClick={() => {
                    const cues = draft.somaticCues.includes(cue)
                      ? draft.somaticCues.filter(c => c !== cue)
                      : [...draft.somaticCues, cue];
                    updateDraft({ somaticCues: cues });
                  }}
                  className={`px-3 py-2 min-h-[44px] rounded-full text-sm transition-colors ${draft.somaticCues.includes(cue)
                    ? 'bg-emerald-900 border border-emerald-500 text-emerald-100'
                    : 'bg-stone-800/50 border border-stone-700 text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                    }`}
                >
                  {cue}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm text-emerald-200/70 mb-2">Intensity typical for this tell (0-10)</label>
              <input
                type="range"
                min="0" max="10"
                value={draft.somaticIntensity}
                onChange={e => updateDraft({ somaticIntensity: parseInt(e.target.value) })}
                className="w-full accent-emerald-500 min-h-[44px] cursor-pointer"
              />
              <div className="text-center text-emerald-400 mt-2">{draft.somaticIntensity} / 10</div>
            </div>
          </div>
        );

      case 'UR_MICRO_ACTION':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="text-center mb-8">
              <TransformativeArcIcon className="w-12 h-12 text-emerald-500 mx-auto mb-4 opacity-80" />
              <h2 className="text-2xl font-serif text-emerald-100 mb-2">One Micro-Action</h2>
              <p className="text-stone-400 max-w-lg mx-auto">
                Not a life overhaul. One tiny move you can do the first time this pattern shows up in the next 72 hours. Make it embarrassingly small.
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-stone-900/40 border border-emerald-900/50 rounded-xl p-4">
                <span className="text-stone-500 text-sm">Context</span>
                <input
                  value={draft.microActionContext}
                  onChange={e => updateDraft({ microActionContext: e.target.value })}
                  className="w-full bg-transparent border-b border-stone-700 p-2 min-h-[44px] text-stone-200 focus:outline-none focus:border-emerald-500 mt-1"
                />
              </div>

              <div>
                <label className="block text-sm text-stone-400 mb-3">Action Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {actionCategories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => updateDraft({ microActionCategory: cat })}
                      className={`p-3 rounded-lg text-sm text-left border transition-all min-h-[44px] ${draft.microActionCategory === cat
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-100'
                        : 'bg-stone-900/40 border-stone-800 text-stone-400 hover:border-stone-700'
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-stone-400 mb-2">Implementation Intention (If/Then)</label>
                <textarea
                  value={draft.implementationIntention || (draft.microActionCategory ? `If ${draft.microActionContext}, then I will ${draft.microActionCategory.toLowerCase()}.` : '')}
                  onChange={e => updateDraft({ implementationIntention: e.target.value })}
                  className="w-full bg-stone-900/50 border border-stone-800 rounded-xl p-3 text-stone-200 focus:outline-none focus:border-emerald-500/50 min-h-[80px]"
                />
              </div>
            </div>
          </div>
        );

      case 'LL_RELATIONAL':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="text-center mb-8">
              <DyadBridgeIcon className="w-12 h-12 text-cyan-500 mx-auto mb-4 opacity-80" />
              <h2 className="text-2xl font-serif text-cyan-100 mb-2">The Relational Move</h2>
              <p className="text-stone-400 max-w-lg mx-auto">
                Growth without a witness stays private. To make this real, it must enter the relational field. Draft exactly what you will say to one person within 72 hours.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm text-stone-400 mb-2">Move Type</label>
                <select
                  value={draft.relationalMoveType}
                  onChange={e => updateDraft({ relationalMoveType: e.target.value as any })}
                  className="w-full bg-stone-900 border border-stone-700 rounded p-2 text-stone-200 focus:outline-none focus:border-cyan-500 min-h-[44px]"
                >
                  <option value="" disabled>Select move...</option>
                  <option value="witness">Witness (Tell someone)</option>
                  <option value="request">Request (Ask support)</option>
                  <option value="repair">Repair (Acknowledge impact)</option>
                  <option value="boundary">Boundary (Name a limit)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-stone-400 mb-2">Recipient</label>
                <select
                  value={draft.relationalRecipient}
                  onChange={e => updateDraft({ relationalRecipient: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-700 rounded p-2 text-stone-200 focus:outline-none focus:border-cyan-500 min-h-[44px]"
                >
                  <option value="" disabled>Select person...</option>
                  {relationRecipients.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-cyan-200/70 mb-2">Message Draft (1-6 sentences)</label>
              <textarea
                value={draft.relationalMessage}
                onChange={e => updateDraft({ relationalMessage: e.target.value })}
                className="w-full bg-stone-900/50 border border-stone-800 rounded-xl p-3 text-stone-200 focus:outline-none focus:border-cyan-500/50 min-h-[120px]"
                placeholder="Hey, I've noticed a pattern where I..."
              />
              <div className="flex flex-wrap gap-2 mt-2">
                <button onClick={() => applyRelationalRefinement('clearer')} disabled={isRefining || !draft.relationalMessage} className="text-xs bg-stone-800 hover:bg-stone-700 px-3 py-2 min-h-[44px] rounded-lg text-stone-300 disabled:opacity-50 transition-colors">Clearer</button>
                <button onClick={() => applyRelationalRefinement('noblame')} disabled={isRefining || !draft.relationalMessage} className="text-xs bg-stone-800 hover:bg-stone-700 px-3 py-2 min-h-[44px] rounded-lg text-stone-300 disabled:opacity-50 transition-colors">Remove Blame</button>
                <button onClick={() => applyRelationalRefinement('shorten')} disabled={isRefining || !draft.relationalMessage} className="text-xs bg-stone-800 hover:bg-stone-700 px-3 py-2 min-h-[44px] rounded-lg text-stone-300 disabled:opacity-50 transition-colors">Shorten</button>
              </div>
            </div>
          </div>
        );

      case 'LR_STRUCTURAL':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="text-center mb-8">
              <StructuralLatticeIcon className="w-12 h-12 text-rose-500 mx-auto mb-4 opacity-80" />
              <h2 className="text-2xl font-serif text-rose-100 mb-2">Structural Edit</h2>
              <p className="text-stone-400 max-w-lg mx-auto">
                Willpower fails; systems persist. What single structural change to your environment, calendar, or devices will enforce this insight even when motivation is gone?
              </p>
            </div>

            <div className="space-y-4">
              {structuralEditTypes.map(type => {
                const isActive = draft.structuralEdits.some(e => e.type === type);
                const editData = draft.structuralEdits.find(e => e.type === type) || { type, what: '', when: '' };

                return (
                  <div key={type} className={`border rounded-xl transition-all ${isActive ? 'bg-stone-900 border-rose-500/50 p-4' : 'bg-stone-900/30 border-stone-800 p-3 hover:border-stone-700'}`}>
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => {
                      if (isActive) updateDraft({ structuralEdits: draft.structuralEdits.filter(e => e.type !== type) });
                      else updateDraft({ structuralEdits: [...draft.structuralEdits, { type, what: '', when: '' }] });
                    }}>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center ${isActive ? 'bg-rose-500 border-rose-500 text-stone-950' : 'border-stone-600'}`}>
                        {isActive && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3.5 h-3.5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                      </div>
                      <span className="capitalize text-stone-200 font-medium">{type}</span>
                    </div>

                    {isActive && (
                      <div className="mt-4 pl-8 space-y-3">
                        <input
                          value={editData.what}
                          onChange={e => updateDraft({ structuralEdits: draft.structuralEdits.map(x => x.type === type ? { ...x, what: e.target.value } : x) })}
                          placeholder="What exactly will you change?"
                          className="w-full bg-stone-950 border border-stone-800 rounded-lg p-3 min-h-[44px] text-stone-200 focus:outline-none focus:border-rose-500/50"
                        />
                        <input
                          type="datetime-local"
                          value={editData.when}
                          onChange={e => updateDraft({ structuralEdits: draft.structuralEdits.map(x => x.type === type ? { ...x, when: e.target.value } : x) })}
                          className="w-full bg-stone-950 border border-stone-800 rounded-lg p-3 min-h-[44px] text-stone-200 focus:outline-none focus:border-rose-500/50"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'RESISTANCE':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="text-center mb-8">
              <ApophaticFrameIcon className="w-12 h-12 text-purple-500 mx-auto mb-4 opacity-80" />
              <h2 className="text-2xl font-serif text-purple-100 mb-2">Resistance Plan</h2>
              <p className="text-stone-400 max-w-lg mx-auto">
                Do not be naive about your own resistance. The part of you that built this pattern will fight to keep it. Name the sabotage before it arrives.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm text-stone-400 mb-3">What will try to stop you?</label>
                <div className="flex flex-wrap gap-2">
                  {resistanceBlockers.map(b => (
                    <button
                      key={b}
                      onClick={() => updateDraft({ resistanceBlocker: b })}
                      className={`px-3 py-2 min-h-[44px] rounded-full text-sm transition-colors ${draft.resistanceBlocker === b
                        ? 'bg-purple-900 border border-purple-500 text-purple-100'
                        : 'bg-stone-800/50 border border-stone-700 text-stone-400 hover:bg-stone-800'
                        }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-stone-400 mb-3">Counter-move</label>
                <div className="flex flex-wrap gap-2">
                  {resistanceCounters.map(c => (
                    <button
                      key={c}
                      onClick={() => updateDraft({ resistanceCounter: c })}
                      className={`px-3 py-2 min-h-[44px] rounded-full text-sm transition-colors ${draft.resistanceCounter === c
                        ? 'bg-purple-900 border border-purple-500 text-purple-100'
                        : 'bg-stone-800/50 border border-stone-700 text-stone-400 hover:bg-stone-800'
                        }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {(draft.resistanceBlocker && draft.resistanceCounter) && (
                <div className="bg-purple-950/30 border border-purple-900/50 rounded-xl p-4 text-purple-200">
                  <span className="font-semibold text-purple-400">Implementation Intention:</span><br />
                  If <strong>{draft.resistanceBlocker}</strong> tries to stop me, then I will <strong>{draft.resistanceCounter}</strong>.
                </div>
              )}
            </div>
          </div>
        );

      case 'COMPLETE':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 text-center py-8">
            <MerkabaIcon className="w-16 h-16 text-teal-400 mx-auto opacity-80" />
            <h2 className="text-2xl font-serif text-teal-100">Session Complete</h2>
            <p className="text-stone-400 max-w-md mx-auto leading-relaxed">
              Your insight has been anchored across all four quadrants and saved to your Insights Hub. Return when the pattern surfaces — each repetition is data.
            </p>
            <div className="bg-stone-900/50 border border-teal-900/40 rounded-xl p-4 text-left">
              <div className="text-xs uppercase tracking-wider text-stone-500 mb-1">The Pattern</div>
              <div className="text-teal-200 text-sm">{draft.insightStatement}</div>
            </div>
          </div>
        );

      case 'ACTION_SHEET':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="text-center mb-8">
              <VoidEclipseIcon className="w-12 h-12 text-teal-500 mx-auto mb-4 opacity-80" />
              <h2 className="text-2xl font-serif text-teal-100 mb-2">Contract With Reality</h2>
              <p className="text-stone-400 max-w-lg mx-auto">
                The insight has left your head and entered your body, your relationships, and your environment. Now execute.
              </p>
            </div>

            <div className="bg-stone-900 border border-teal-900/50 rounded-xl p-6 font-mono text-sm space-y-4">
              <div>
                <div className="text-stone-500 text-xs mb-1 border-b border-stone-800 pb-1">THE PATTERN</div>
                <div className="text-teal-200">{draft.insightStatement}</div>
                <div className="text-rose-400/80 mt-1">Cost: {draft.insightCost}</div>
              </div>

              <div>
                <div className="text-stone-500 text-xs mb-1 border-b border-stone-800 pb-1">BODY SIGNAL (UR)</div>
                <div className="text-emerald-200">Cue: {draft.somaticCues.join(', ')} (Intensity: {draft.somaticIntensity})</div>
                <div className="text-emerald-300 mt-1">{draft.implementationIntention}</div>
              </div>

              <div>
                <div className="text-stone-500 text-xs mb-1 border-b border-stone-800 pb-1">RELATIONAL MOVE (LL)</div>
                <div className="text-cyan-200">To {draft.relationalRecipient} ({draft.relationalMoveType})</div>
                <div className="text-cyan-300 mt-1 pl-2 border-l-2 border-cyan-900">"{draft.relationalMessage}"</div>
              </div>

              <div>
                <div className="text-stone-500 text-xs mb-1 border-b border-stone-800 pb-1">STRUCTURAL EDIT (LR)</div>
                {draft.structuralEdits.map((e, i) => (
                  <div key={i} className="text-rose-200">
                    [{e.type.toUpperCase()}] {e.what} (By: {new Date(e.when).toLocaleString()})
                  </div>
                ))}
              </div>

              <div>
                <div className="text-stone-500 text-xs mb-1 border-b border-stone-800 pb-1">RESISTANCE PLAN</div>
                <div className="text-purple-300">If {draft.resistanceBlocker}, then {draft.resistanceCounter}.</div>
              </div>
            </div>

            <div className="pt-4">
              <label className="block text-sm text-stone-400 mb-2">What feels more real now than when you started?</label>
              <textarea
                value={draft.finalReflection}
                onChange={e => updateDraft({ finalReflection: e.target.value })}
                className="w-full bg-stone-900/50 border border-stone-800 rounded-xl p-3 text-stone-200 focus:outline-none focus:border-teal-500/50"
                placeholder="Optional reflection..."
              />
            </div>
          </div>
        );
    }
  };

  const isCompleteStep = step === 'COMPLETE';

  return (
    <WizardFrame
      onClose={onClose}
      title="4-Quadrant Catalyst"
      currentStep={isCompleteStep ? STAGE_ORDER.length : currentStepIndex}
      totalSteps={STAGE_ORDER.length}
      onNext={isCompleteStep ? onClose : handleNext}
      onBack={currentStepIndex > 0 && !isCompleteStep ? handleBack : undefined}
      nextButtonDisabled={(!canAdvance() || isGenerating) && !isCompleteStep}
      nextButtonText={isCompleteStep ? 'Finish' : isGenerating ? 'Generating...' : currentStepIndex === STAGE_ORDER.length - 1 ? 'Save to Insights' : 'Continue'}
    >
      <div className="max-w-2xl mx-auto py-4">
        {crisisLevel !== 'none' && <SafetyBanner crisisLevel={crisisLevel} />}
        {renderScreen()}
      </div>
    </WizardFrame>
  );
}
