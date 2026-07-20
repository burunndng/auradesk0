import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowRight, ArrowLeft, Loader2, AlertCircle, Check } from 'lucide-react';
import { getIconComponent } from '../../.claude/lib/iconMap.ts';
import { WizardFrame } from '../shared/WizardFrame';
import { useWizardDraft } from '../../hooks/useWizardDraft';
import {
  generateRoleActionSuggestion,
  generateShadowWorkInsight,
  generateIntegralReflection
} from '../../services/aiService';

import type { RoleAlignmentSession, IntegratedInsight } from '../../types.ts';

interface RoleAlignmentWizardProps {
  onClose: () => void;
  onSave?: (session: RoleAlignmentSession) => void | Promise<void>;
  session?: RoleAlignmentSession | null;
  setDraft?: (session: RoleAlignmentSession | null) => void;
  userId?: string;
  insightContext?: IntegratedInsight | null;
  markInsightAsAddressed: (insightId: string, wizardType: string, sessionId: string) => void;
}

type WizardStep = 'welcome' | 'intake' | 'profile' | 'alignment' | 'summary';

interface Role {
  name: string;
  why: string;
  goal: string;
  valueScore: number;
  valueNote: string;
  shadowNudge?: string;
  action?: string;
}

// Pre-written action suggestions based on score
const ACTION_TEMPLATES = {
  high: [
    "Share one win in your next interaction",
    "Amplify: Celebrate this alignment with someone close",
    "Document what's working to reinforce it",
    "Teach someone else about this aspect of your role",
    "Set a new growth edge within this role"
  ],
  low: [
    "Try a 5-min boundary: Delegate one task tomorrow",
    "Identify one small shift you can make this week",
    "Schedule 10 minutes to reflect on what drains you",
    "Say 'no' to one request that doesn't align",
    "Experiment with doing this role 20% differently"
  ]
};

// Add intake field to the session interface
interface DraftSession extends RoleAlignmentSession {
  currentStep: WizardStep;
  somaticCheckIn: string;
  currentRoleIndex: number;
  commitToActions: boolean[];
}

const WIZARD_KEY = 'aura-draft-role-alignment';

export default function RoleAlignmentWizard({ onClose, onSave, session, setDraft, userId, insightContext, markInsightAsAddressed }: RoleAlignmentWizardProps) {
  const [sessionId] = useState(() => session?.id || `role-alignment-${Date.now()}`);
  
  const [draft, updateDraft, , clearDraft] = useWizardDraft<DraftSession>(
    WIZARD_KEY,
    {
      id: sessionId,
      date: new Date().toISOString(),
      currentStep: 'welcome',
      somaticCheckIn: '',
      roles: session?.roles || [
        { name: '', why: '', goal: '', valueScore: 5, valueNote: '' },
        { name: '', why: '', goal: '', valueScore: 5, valueNote: '' },
        { name: '', why: '', goal: '', valueScore: 5, valueNote: '' }
      ],
      currentRoleIndex: 0,
      commitToActions: [],
      integralNote: session?.integralNote || '',
      aiIntegralReflection: session?.aiIntegralReflection || undefined
    }
  );

  const [isGeneratingAction, setIsGeneratingAction] = useState(false);
  const [isGeneratingShadow, setIsGeneratingShadow] = useState(false);
  const [isGeneratingIntegral, setIsGeneratingIntegral] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Auto-save draft up to parent if using old pattern (optional, mostly for backwards compatibility)
  useEffect(() => {
    if (setDraft) {
      setDraft(draft);
    }
  }, [draft, setDraft]);

  const activeRoles = draft.roles.filter(r => r.name.trim() !== '');
  const currentRole = draft.roles[draft.currentRoleIndex];

  const handleRoleUpdate = (index: number, field: keyof Role, value: any) => {
    const updated = [...draft.roles];
    updated[index] = { ...updated[index], [field]: value };
    updateDraft({ roles: updated });
  };

  const getSuggestion = (score: number): string => {
    const templates = score >= 7 ? ACTION_TEMPLATES.high : ACTION_TEMPLATES.low;
    return templates[Math.floor(Math.random() * templates.length)];
  };

  const handleAlignmentNext = async () => {
    // Auto-suggest action using Gemini if not already set
    if (!currentRole.action) {
      setIsGeneratingAction(true);
      try {
        const aiAction = await generateRoleActionSuggestion(
          currentRole.name,
          currentRole.why || '',
          currentRole.goal || '',
          currentRole.valueScore,
          currentRole.valueNote || '',
          currentRole.shadowNudge
        );
        handleRoleUpdate(draft.currentRoleIndex, 'action', aiAction);
      } catch (error) {
        console.error('Error generating action:', error);
        // Fallback to original template behavior
        handleRoleUpdate(draft.currentRoleIndex, 'action', getSuggestion(currentRole.valueScore));
      } finally {
        setIsGeneratingAction(false);
      }
    }

    if (draft.currentRoleIndex < activeRoles.length - 1) {
      updateDraft({ currentRoleIndex: draft.currentRoleIndex + 1 });
    } else {
      updateDraft({
        currentStep: 'summary',
        commitToActions: new Array(activeRoles.length).fill(false)
      });
      // Generate integral reflection when entering summary
      generateIntegralAnalysis();
    }
  };

  const generateIntegralAnalysis = async () => {
    if (draft.aiIntegralReflection) return; // Don't regenerate if already have it
    setIsGeneratingIntegral(true);
    try {
      const analysis = await generateIntegralReflection(activeRoles);
      updateDraft({ aiIntegralReflection: analysis });
    } catch (error) {
      console.error('Error generating integral reflection:', error);
    } finally {
      setIsGeneratingIntegral(false);
    }
  };

  const handleGenerateShadowInsight = async () => {
    if (!currentRole.name || !currentRole.valueNote) return;

    setIsGeneratingShadow(true);
    try {
      const insight = await generateShadowWorkInsight(
        currentRole.name,
        currentRole.valueScore,
        currentRole.valueNote
      );
      handleRoleUpdate(draft.currentRoleIndex, 'shadowNudge', insight);
    } catch (error) {
      console.error('Error generating shadow insight:', error);
    } finally {
      setIsGeneratingShadow(false);
    }
  };

  const handleAlignmentBack = () => {
    if (draft.currentRoleIndex > 0) {
      updateDraft({ currentRoleIndex: draft.currentRoleIndex - 1 });
    } else {
      updateDraft({ currentStep: 'profile' });
    }
  };

  const handleNext = () => {
    if (draft.currentStep === 'welcome') {
      updateDraft({ currentStep: 'intake' });
    } else if (draft.currentStep === 'intake') {
      updateDraft({ currentStep: 'profile' });
    } else if (draft.currentStep === 'profile') {
      updateDraft({ currentStep: 'alignment', currentRoleIndex: 0 });
    } else if (draft.currentStep === 'alignment') {
      handleAlignmentNext();
    } else if (draft.currentStep === 'summary') {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (draft.currentStep === 'intake') {
      updateDraft({ currentStep: 'welcome' });
    } else if (draft.currentStep === 'profile') {
      updateDraft({ currentStep: 'intake' });
    } else if (draft.currentStep === 'alignment') {
      handleAlignmentBack();
    } else if (draft.currentStep === 'summary') {
      let lastIndex = activeRoles.length - 1;
      updateDraft({ currentStep: 'alignment', currentRoleIndex: lastIndex < 0 ? 0 : lastIndex });
    }
  };

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      const completedSession: RoleAlignmentSession = {
        id: sessionId,
        date: new Date().toISOString(),
        roles: activeRoles,
        integralNote: draft.integralNote,
        aiIntegralReflection: draft.aiIntegralReflection || undefined
      };

      if (onSave) {
        await onSave(completedSession);
      }
      clearDraft();
      onClose();
    } catch (error) {
      console.error('Error saving Role Alignment session:', error);
      alert('Failed to save session. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const getStepNumber = () => {
    switch (draft.currentStep) {
      case 'welcome': return 1;
      case 'intake': return 2;
      case 'profile': return 3;
      case 'alignment': return 4;
      case 'summary': return 5;
      default: return 1;
    }
  };

  const isNextDisabled = () => {
    if (draft.currentStep === 'intake') return !draft.somaticCheckIn.trim();
    if (draft.currentStep === 'profile') return !draft.roles[0].name.trim();
    if (draft.currentStep === 'alignment') return !currentRole.goal || !currentRole.valueNote || isGeneratingAction;
    if (draft.currentStep === 'summary') return isSaving;
    return false;
  };

  const renderWelcome = () => (
    <div className="space-y-4 sm:space-y-6 py-4 sm:py-8 max-w-3xl mx-auto">
      <div className="text-center space-y-2 sm:space-y-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-neutral-800 to-neutral-700 rounded-full mx-auto flex items-center justify-center border border-neutral-600">
           {React.createElement(getIconComponent('ThirdEye') || 'div', { size: 32, className: 'text-white sm:w-10 sm:h-10' })}
        </div>
        <h2 className="text-xl sm:text-3xl font-bold text-slate-100 font-serif">Role Alignment Wizard</h2>
        <p className="text-slate-300 text-sm sm:text-lg max-w-2xl mx-auto px-2">
          Align your roles in the world. Discover how your key roles connect to your deeper values and find small shifts to increase harmony.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-8">
        <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-4 sm:p-5">
          {React.createElement(getIconComponent('ThirdEye') || 'div', { className: 'text-amber-400 mb-3', size: 24 })}
          <h3 className="font-semibold text-slate-100 mb-1 text-sm sm:text-base">Somatic Intake</h3>
          <p className="text-xs sm:text-sm text-slate-400">Ground into your body's truth (2 min)</p>
        </div>
        <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-4 sm:p-5">
           {React.createElement(getIconComponent('Abrahadabra') || 'div', { className: 'text-teal-400 mb-3', size: 24 })}
          <h3 className="font-semibold text-slate-100 mb-1 text-sm sm:text-base">Alignment Check</h3>
          <p className="text-xs sm:text-sm text-slate-400">Score each role (5-6 min)</p>
        </div>
        <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-4 sm:p-5">
           {React.createElement(getIconComponent('HermeticVessel') || 'div', { className: 'text-purple-400 mb-3', size: 24 })}
          <h3 className="font-semibold text-slate-100 mb-1 text-sm sm:text-base">Action Plan</h3>
          <p className="text-xs sm:text-sm text-slate-400">Get personalized next steps (2-3 min)</p>
        </div>
      </div>
    </div>
  );

  const renderIntake = () => (
    <div className="max-w-2xl mx-auto space-y-6 pt-4 animate-fade-in pb-8">
      <div className="text-center space-y-4 mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-neutral-800 to-neutral-700 rounded-full mx-auto flex items-center justify-center border border-neutral-600">
          {React.createElement(getIconComponent('ThirdEye') || 'div', { className: 'text-amber-400', size: 32 })}
        </div>
        <h2 className="text-2xl font-serif text-slate-100">Somatic Check-In</h2>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Scoring your life roles shouldn't be a purely mental exercise. Take a moment to ground yourself.
        </p>
      </div>

      <div className="bg-neutral-800/40 border border-neutral-700 rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-slate-200">How are you carrying your roles today?</h3>
        <p className="text-sm text-slate-400">
          Take a deep breath. When you think about the various hats you wear (at work, at home, in relationships), what does it feel like in your body right now? Is it heavy? Light? Constricted? expansive?
        </p>
        <textarea
          value={draft.somaticCheckIn}
          onChange={(e) => updateDraft({ somaticCheckIn: e.target.value })}
          placeholder="e.g., My shoulders feel tense, but my chest feels surprisingly open when I think about..."
          className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 min-h-[120px] resize-none"
        />
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-4 sm:space-y-6 max-w-3xl mx-auto pt-4 pb-8">
      <div className="text-center space-y-2 sm:space-y-3 mb-8">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-100">Quick Profile</h2>
        <p className="text-sm sm:text-base text-slate-400">List up to 3 key roles you play today. Keep it personal.</p>
        <p className="text-xs sm:text-sm text-slate-500">Examples: Parent, Employee, Neighbor, Friend, Leader, Artist...</p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {draft.roles.map((role, index) => (
          <div key={`role-input-${index}-${role.name}`} className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-4 sm:p-6 space-y-4">
            <div>
              <label htmlFor={`role-name-${index}`} className="block text-sm font-medium text-slate-300 mb-2">
                Role {index + 1} {index === 0 && <span className="text-red-400">*</span>}
              </label>
              <input
                id={`role-name-${index}`}
                name={`role-name-${index}`}
                type="text"
                value={role.name}
                onChange={(e) => handleRoleUpdate(index, 'name', e.target.value)}
                placeholder="e.g., Parent, Employee, Neighbor"
                className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500/50"
              />
            </div>

            {role.name && (
              <div className="animate-fade-in">
                <label htmlFor={`role-why-${index}`} className="block text-sm font-medium text-slate-300 mb-2">
                  Why this role? (one sentence)
                </label>
                <input
                  id={`role-why-${index}`}
                  name={`role-why-${index}`}
                  type="text"
                  value={role.why}
                  onChange={(e) => handleRoleUpdate(index, 'why', e.target.value)}
                  placeholder="e.g., It grounds me in something bigger than myself"
                  className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500/50"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderAlignment = () => {
    if (!currentRole) return null;

    // Find the actual index of this role in the active roles array by matching name (unique identifier)
    const actualRoleIndex = draft.roles.findIndex(r => r.name === currentRole.name);

    return (
      <div className="space-y-6 max-w-3xl mx-auto pt-4 pb-8">
        <div className="bg-amber-900/10 border border-amber-700/30 rounded-xl p-5 mb-6 text-center">
          <h3 className="text-xl font-serif font-bold text-amber-100 mb-2">Exploring: {currentRole.name}</h3>
          {currentRole.why && <p className="text-sm text-slate-400 italic">"{currentRole.why}"</p>}
        </div>

        <div className="space-y-8">
          {/* Core goal */}
          <div className="bg-neutral-800/40 border border-neutral-700 rounded-xl p-6">
            <label htmlFor="role-goal" className="block text-lg font-semibold text-slate-100 mb-3">
              What's the core goal of this role?
            </label>
            <input
              id="role-goal"
              name="role-goal"
              type="text"
              value={currentRole.goal}
              onChange={(e) => handleRoleUpdate(actualRoleIndex, 'goal', e.target.value)}
              placeholder="e.g., Support family growth, Contribute to team success..."
              className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500/50"
            />
          </div>

          {/* Value alignment slider */}
          <div className="bg-neutral-800/40 border border-neutral-700 rounded-xl p-6 space-y-6">
            <label htmlFor="role-value-score" className="block text-lg font-semibold text-slate-100">
              Value fit: How aligned is this with your deeper values?
            </label>
            
            <div className="px-2">
              <input
                id="role-value-score"
                name="role-value-score"
                type="range"
                min="1"
                max="10"
                value={currentRole.valueScore}
                onChange={(e) => handleRoleUpdate(actualRoleIndex, 'valueScore', parseInt(e.target.value))}
                className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
              <div className="flex justify-between text-sm mt-4">
                <span className="text-red-400/80">1 - Total mismatch</span>
                <span className="text-teal-400 font-bold text-2xl">{currentRole.valueScore}</span>
                <span className="text-green-400/80">10 - Perfect harmony</span>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-700/50">
              <label htmlFor="role-value-note" className="block text-sm font-medium text-slate-300 mb-2">
                Why that number?
              </label>
              <input
                id="role-value-note"
                name="role-value-note"
                type="text"
                value={currentRole.valueNote}
                onChange={(e) => handleRoleUpdate(actualRoleIndex, 'valueNote', e.target.value)}
                placeholder="One sentence about this score..."
                className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500/50"
              />
            </div>
          </div>

          {/* Shadow nudge for low scores */}
          {currentRole.valueScore < 5 && (
            <div className="bg-rose-900/10 border border-rose-700/30 rounded-xl p-6 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-rose-300 flex items-center gap-2">
                  <AlertCircle size={18} />
                  Shadow Work Opportunity
                </h4>
                <button
                  onClick={handleGenerateShadowInsight}
                  disabled={isGeneratingShadow || !currentRole.valueNote}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition bg-rose-900/40 hover:bg-rose-900/60 text-rose-200 border border-rose-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingShadow ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      {React.createElement(getIconComponent('CelestialRose') || 'div', { size: 14, className: 'inline-block' })}
                      AI Insight
                    </>
                  )}
                </button>
              </div>
              <div>
                <label htmlFor="role-shadow-nudge" className="block text-sm text-slate-300 mb-2">
                  What feels off? What small shift could help?
                </label>
                <input
                  id="role-shadow-nudge"
                  name="role-shadow-nudge"
                  type="text"
                  value={currentRole.shadowNudge || ''}
                  onChange={(e) => handleRoleUpdate(actualRoleIndex, 'shadowNudge', e.target.value)}
                  placeholder="e.g., It drains my energy. Try setting clearer boundaries."
                  className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500/50"
                />
                <p className="text-xs text-slate-500 mt-2">Click "AI Insight" for a personalized suggestion based on your score.</p>
              </div>
            </div>
          )}

          {/* Suggested action */}
          <div className="bg-neutral-800/40 border border-neutral-700 rounded-xl p-6 space-y-3">
            <label htmlFor="role-action" className="font-semibold text-slate-100">Suggested Action</label>
            <div>
              <input
                id="role-action"
                name="role-action"
                type="text"
                value={currentRole.action || getSuggestion(currentRole.valueScore)}
                onChange={(e) => handleRoleUpdate(actualRoleIndex, 'action', e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:border-teal-500/50"
              />
              <p className="text-xs text-slate-500 mt-2">Feel free to edit this action to make it your own.</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSummary = () => (
    <div className="space-y-6 max-w-4xl mx-auto pt-4 pb-8">
      <div className="text-center space-y-2 mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-neutral-800 to-neutral-700 rounded-full mx-auto flex items-center justify-center border border-neutral-600">
          <Check size={28} className="text-teal-400" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-slate-100">Your Alignment Card</h2>
        <p className="text-slate-400">Review your roles and commit to your next steps.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          {activeRoles.map((role, index) => (
            <div key={`role-summary-${role.name}-${role.valueScore}`} className="bg-neutral-800/40 border border-neutral-700 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-100">{role.name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  role.valueScore >= 7 ? 'bg-green-900/40 text-green-400 border border-green-700/30' :
                  role.valueScore >= 5 ? 'bg-yellow-900/40 text-yellow-400 border border-yellow-700/30' :
                  'bg-red-900/40 text-red-400 border border-red-700/30'
                }`}>
                  {role.valueScore}/10 fit
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-slate-400 block text-xs uppercase tracking-wider mb-1">Goal</span>
                  <span className="text-slate-200">{role.goal}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs uppercase tracking-wider mb-1 mt-2">Score Note</span>
                  <span className="text-slate-200">{role.valueNote}</span>
                </div>
                {role.shadowNudge && (
                  <div className="bg-rose-900/10 border border-rose-700/30 rounded-lg p-3 mt-3">
                    <span className="text-rose-400/80 block text-xs uppercase tracking-wider mb-1">Shadow Nudge</span>
                    <span className="text-rose-200/90">{role.shadowNudge}</span>
                  </div>
                )}
                <div className="bg-teal-900/10 border border-teal-700/30 rounded-lg p-3 mt-3">
                  <span className="text-teal-400/80 block text-xs uppercase tracking-wider mb-1">Action</span>
                  <span className="text-teal-100">{role.action}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-700/50 mt-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={draft.commitToActions[index] || false}
                      onChange={(e) => {
                        const updated = [...draft.commitToActions];
                        updated[index] = e.target.checked;
                        updateDraft({ commitToActions: updated });
                      }}
                      className="w-5 h-5 rounded border-neutral-600 bg-neutral-900 text-teal-500 focus:ring-teal-500/30 focus:ring-offset-neutral-800 transition-all cursor-pointer appearance-none checked:bg-teal-500 checked:border-teal-500"
                    />
                    {draft.commitToActions[index] && <Check size={14} className="absolute text-slate-900 pointer-events-none" />}
                  </div>
                  <span className="text-sm text-slate-300 group-hover:text-slate-200 transition-colors">Commit to this action</span>
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {/* AI-Powered Integral Reflection */}
          {isGeneratingIntegral ? (
            <div className="bg-neutral-800/40 border border-neutral-700/50 rounded-xl p-6 flex flex-col items-center justify-center gap-3 h-48">
              <Loader2 size={24} className="animate-spin text-teal-500" />
              <span className="text-slate-400 text-sm">Generating AI integral insight...</span>
            </div>
          ) : draft.aiIntegralReflection ? (
            <div className="bg-neutral-800/40 border border-neutral-700/50 rounded-xl p-6 space-y-5 animate-fade-in shadow-lg">
              <div className="flex items-center gap-3 border-b border-neutral-700/50 pb-4">
                {React.createElement(getIconComponent('CelestialRose') || 'div', { className: 'text-teal-400', size: 24 })}
                <h3 className="text-lg font-serif font-bold text-slate-100">AI Integral Analysis</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-teal-500/70 mb-2">Pattern Insight</h4>
                  <p className="text-sm text-slate-200 leading-relaxed">{draft.aiIntegralReflection.integralInsight}</p>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-teal-500/70 mb-2">Quadrant Connections</h4>
                  <p className="text-sm text-slate-300 leading-relaxed">{draft.aiIntegralReflection.quadrantConnections}</p>
                </div>

                {draft.aiIntegralReflection.recommendations.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-teal-500/70 mb-2">Recommendations</h4>
                    <ul className="space-y-2">
                      {draft.aiIntegralReflection.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                          <span className="text-teal-500/50 mt-0.5">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* User's Personal Reflection */}
          <div className="bg-neutral-800/40 border border-neutral-700/50 rounded-xl p-6 space-y-4">
            <label htmlFor="integral-note" className="text-lg font-serif font-bold text-slate-100">Your Reflection</label>
            <p className="text-sm text-slate-400">
              How does this connect to your inner world (I) or relationships (We)? Add your own insights.
            </p>
            <textarea
              id="integral-note"
              name="integral-note"
              value={draft.integralNote}
              onChange={(e) => updateDraft({ integralNote: e.target.value })}
              placeholder="e.g., My Parent role connects to my inner need for nurturing (I) and deepens my family bonds (We)..."
              rows={4}
              className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500/50 resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <WizardFrame
      title="Role Alignment Wizard"
      currentStep={getStepNumber()}
      totalSteps={5}
      onClose={onClose}
      onBack={handleBack}
      onNext={handleNext}
      showBackButton={draft.currentStep !== 'welcome'}
      nextButtonText={draft.currentStep === 'summary' ? 'Save & Complete' : 'Next'}
      nextButtonDisabled={isNextDisabled()}
      isLoading={isGeneratingIntegral || isGeneratingAction || isGeneratingShadow || isSaving}
      accentColor="amber"
    >
      {draft.currentStep === 'welcome' && renderWelcome()}
      {draft.currentStep === 'intake' && renderIntake()}
      {draft.currentStep === 'profile' && renderProfile()}
      {draft.currentStep === 'alignment' && renderAlignment()}
      {draft.currentStep === 'summary' && renderSummary()}
    </WizardFrame>
  );
}
