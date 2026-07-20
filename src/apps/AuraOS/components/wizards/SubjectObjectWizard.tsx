import React, { useState, useEffect } from 'react';
import { useSubscription } from '../../hooks/useSubscription';
import { SubjectObjectSession, SubjectObjectStep, IntegratedInsight } from '../../types.ts';
import { Lightbulb, Download, RefreshCw } from 'lucide-react';
import * as aiService from '../../services/aiService.ts';
import { buildPriorContext } from '../../services/priorInsightContext';
import { detectCrossModalPatternsWithAI } from '../../services/crossModalAnalyzer';
import type { PriorInsightSummary } from '../../types';
import { WizardFrame } from '../shared/WizardFrame';
import { useWizardDraft } from '../../hooks/useWizardDraft';

interface SubjectObjectWizardProps {
  onClose: () => void;
  onSave: (session: SubjectObjectSession) => void;
  session: SubjectObjectSession | null;
  setDraft: (session: SubjectObjectSession | null) => void;
  userId: string;
  insightContext?: IntegratedInsight | null;
  markInsightAsAddressed: (insightId: string, wizardType: string, sessionId: string) => void;
}

const STEPS: SubjectObjectStep[] = [
    'WELCOME', 'GROUNDING', 'RECOGNIZE_PATTERN', 'TRUTH_FEELINGS', 'NAME_SUBJECT', 'EVIDENCE_SUBJECT', 'TRACE_ORIGIN',
    'COST', 'FIRST_OBSERVATION', 'SMALL_EXPERIMENT', 'INTEGRATION_SHIFT'
];
const TOTAL_STEPS = STEPS.length;

const initialSession = (insightContext?: IntegratedInsight | null): SubjectObjectSession => ({
  id: `so-${Date.now()}`, date: new Date().toISOString(), currentStep: 'WELCOME',
  pattern: '', truthFeelings: '', subjectToStatement: '', evidenceChecks: {}, origin: '',
  cost: '', firstObservation: '', dailyTracking: {}, reviewInsights: '', integrationShift: '',
  ongoingPracticePlan: [],
  linkedInsightId: insightContext?.id
});

export default function SubjectObjectWizard({ onClose, onSave, session: propDraft, setDraft: propSetDraft, userId, insightContext, markInsightAsAddressed }: SubjectObjectWizardProps) {
  const { recordWizardSession } = useSubscription();
  const insights: IntegratedInsight[] = insightContext ? [insightContext] : [];

  const [draft, updateDraft] = useWizardDraft<SubjectObjectSession>(
    'aura-draft-subject-object',
    propDraft || initialSession(insightContext)
  );

  const [session, setSession] = useState<SubjectObjectSession>(propDraft || draft || initialSession(insightContext));
  const [somaticSensation, setSomaticSensation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Sync from prop draft on mount if provided
  useEffect(() => { if (propDraft) setSession(propDraft); }, [propDraft]);

  // Sync linkedInsightId with insightContext changes
  useEffect(() => {
    if (insightContext && session.linkedInsightId !== insightContext.id) {
      setSession(prev => ({ ...prev, linkedInsightId: insightContext.id }));
    }
  }, [insightContext]);

  // Persist session to draft hook whenever session changes
  useEffect(() => {
    updateDraft(session);
  }, [session]);

  const handleSaveDraftAndClose = () => {
    propSetDraft(session);
    onClose();
  };


  const updateField = (field: keyof SubjectObjectSession, value: any) => {
    setSession(prev => ({ ...prev, [field]: value }));
  };

  const canProceedToNext = () => {
    if (isLoading) return false;
    switch (session.currentStep) {
        case 'WELCOME': return true;
        case 'GROUNDING': return somaticSensation.trim().length > 5;
        case 'RECOGNIZE_PATTERN': return session.pattern.trim().length > 20;
        case 'TRUTH_FEELINGS': return session.truthFeelings.trim().length > 20;
        case 'EVIDENCE_SUBJECT': return (session.evidenceChecks?.pro?.length > 10 && session.evidenceChecks?.con?.length > 10);
        case 'TRACE_ORIGIN': return session.origin.trim().length > 20;
        case 'COST': return session.cost.trim().length > 20;
        case 'FIRST_OBSERVATION': return session.firstObservation.trim().length > 20;
        case 'SMALL_EXPERIMENT': return (session.smallExperimentChosen || '').trim().length > 10;
        case 'INTEGRATION_SHIFT': return session.integrationShift.trim().length > 20;
        default: return true;
    }
  };

  const handleNext = async () => {
    setIsLoading(true);
    try {
        const currentIndex = STEPS.indexOf(session.currentStep);
        let nextStep = STEPS[currentIndex + 1] || session.currentStep;

        if (session.currentStep === 'TRUTH_FEELINGS') {
            const subjectStatement = await aiService.articulateSubjectTo(session.pattern, session.truthFeelings, somaticSensation);
            updateField('subjectToStatement', subjectStatement);
            nextStep = 'NAME_SUBJECT';
        } else if (session.currentStep === 'COST') {
            const priorContext = buildPriorContext(insights || []);
            if (priorContext.body || priorContext.mind || priorContext.spirit || priorContext.shadow) {
              priorContext.crossModalPatterns = await detectCrossModalPatternsWithAI(priorContext);
            }

            const experiments = await aiService.suggestSubjectObjectExperiments(session.pattern, session.subjectToStatement, [session.cost], priorContext);
            updateField('ongoingPracticePlan', experiments);
            nextStep = 'FIRST_OBSERVATION';
        } else if (session.currentStep === 'INTEGRATION_SHIFT') {
            const completedSession = { ...session, currentStep: 'COMPLETE' as const };
            onSave(completedSession);
            void recordWizardSession();
            if (completedSession.linkedInsightId) {
              markInsightAsAddressed(completedSession.linkedInsightId, 'Subject-Object Explorer', completedSession.id);
            }
            return;
        }

        updateField('currentStep', nextStep);

    } catch (error) {
        console.error("AI service error", error);
        const currentIndex = STEPS.indexOf(session.currentStep);
        if (currentIndex < STEPS.length - 1) {
            updateField('currentStep', STEPS[currentIndex + 1]);
        }
    } finally {
        setIsLoading(false);
    }
  };

  const handleBack = () => {
    const currentIndex = STEPS.indexOf(session.currentStep);
    if (currentIndex > 0) {
      updateField('currentStep', STEPS[currentIndex - 1]);
    }
  };

  const handleDownload = () => {
    const reportContent = `# Subject-Object Explorer Session Report
Date: ${new Date().toLocaleDateString()}

## 1. Recognize a Pattern
${session.pattern}

## 2. The 'Truth' of the Pattern
${session.truthFeelings}

## 3. What You're Subject To (Aura's Articulation)
${session.subjectToStatement}

## 4. Check the Evidence
### Evidence FOR "${session.subjectToStatement}"
${session.evidenceChecks?.pro || 'N/A'}

### Evidence AGAINST "${session.subjectToStatement}"
${session.evidenceChecks?.con || 'N/A'}

## 5. Trace Its Origin
${session.origin || 'N/A'}

## 6. The Cost of this Pattern
${session.cost || 'N/A'}

## 7. The First Observation
${session.firstObservation || 'N/A'}

## 8. A Small, Safe Experiment
${session.smallExperimentChosen || 'No experiment chosen.'}
${session.ongoingPracticePlan && session.ongoingPracticePlan.length > 0 ? `\n\n**AI-suggested experiments:**\n- ` + session.ongoingPracticePlan.join('\n- ') : ''}

## 9. Integration & Shift
${session.integrationShift || 'N/A'}

---
Generated by Aura ILP
`;

    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subject-object-report-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentStepIndex = STEPS.indexOf(session.currentStep);
  const isFirstStep = session.currentStep === 'WELCOME';
  const nextButtonText = session.currentStep === 'INTEGRATION_SHIFT' ? 'Finish & Save' : 'Next';

  const renderStep = () => {
    switch (session.currentStep) {
      case 'WELCOME':
        return (
          <>
            <h3 className="text-base sm:text-lg font-semibold font-mono text-slate-100">Welcome to Subject-Object Explorer</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-3">In Kegan's developmental framework, being "subject to" something means you're so embedded in it that you can't see it — it's the water you swim in. Making something "object" means you can step back and observe it.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <div className="p-3 bg-neutral-900/60 border border-neutral-700 rounded-lg">
                <p className="text-red-300 font-semibold text-xs mb-1 uppercase tracking-wider">Subject to (Embedded)</p>
                <p className="text-slate-200 text-sm italic">"I AM my need for approval"</p>
                <p className="text-slate-500 text-[10px] mt-2 leading-relaxed">You can't see the pattern because you ARE the pattern. It runs your life automatically.</p>
              </div>
              <div className="p-3 bg-neutral-900/60 border border-neutral-700 rounded-lg">
                <p className="text-green-300 font-semibold text-xs mb-1 uppercase tracking-wider">Object (Observing)</p>
                <p className="text-slate-200 text-sm italic">"I HAVE a pattern of seeking approval"</p>
                <p className="text-slate-500 text-[10px] mt-2 leading-relaxed">You step back and see the pattern as a tool or a part. Now you have a choice.</p>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Common Examples:</p>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {[
                  { title: "Workplace", text: "Subject to 'I must be perfect' vs Object 'I have a fear of mistakes'." },
                  { title: "Relationships", text: "Subject to 'Their mood is my responsibility' vs Object 'I notice my tendency to fix things'." },
                  { title: "Conflict", text: "Subject to 'Anger is truth' vs Object 'I am experiencing a surge of anger'." }
                ].map((ex, i) => (
                  <div key={i} className="min-w-[200px] bg-neutral-800 p-3 rounded-lg border border-neutral-700 text-[10px]">
                    <p className="text-amber-400 font-bold mb-1">{ex.title}</p>
                    <p className="text-slate-400 leading-relaxed">{ex.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        );
      case 'GROUNDING':
        return (
          <>
            <h3 className="text-base sm:text-lg font-semibold font-mono text-slate-100">Step 0: Somatic Grounding</h3>
            <p className="text-xs sm:text-sm text-slate-400">Before we dive into the cognitive pattern, let's find where it lives in your body. Close your eyes for a moment and recall a recent time you felt "caught" in a recurring reaction.</p>
            <div className="mt-4 p-4 bg-teal-900/20 border border-teal-700/50 rounded-lg">
              <p className="text-teal-200 text-xs sm:text-sm italic mb-3">"Scan your body from head to toe. Where do you feel a tightening, a pressure, or a specific sensation when you think of this pattern?"</p>
              <textarea
                value={somaticSensation}
                onChange={e => setSomaticSensation(e.target.value)}
                placeholder="E.g., 'A tight knot in my solar plexus', 'Pressure behind my eyes', 'Shallowness in my breath'..."
                className="w-full bg-neutral-900/50 border-neutral-700 rounded-md p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-accent text-xs sm:text-sm"
                rows={3}
              />
            </div>
          </>
        );
      case 'RECOGNIZE_PATTERN':
        return (
          <>
            <h3 className="text-base sm:text-lg font-semibold font-mono text-slate-100">Step 1: Recognize a Pattern</h3>
            <p className="text-xs sm:text-sm text-slate-400">Describe a recurring pattern of thought, feeling, or behavior that you find yourself caught in. Be specific.</p>
            <div className="text-xs sm:text-sm text-slate-500 mt-2 p-2 sm:p-3 bg-neutral-900/40 rounded-md border border-neutral-700 break-words">Example: "When someone disagrees with me in a meeting, I immediately get defensive and spend all my energy trying to prove them wrong, rather than actually listening to their point."</div>
            <textarea value={session.pattern} onChange={e => updateField('pattern', e.target.value)} rows={5} className="w-full bg-neutral-900/50 border-neutral-700 rounded-md p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-accent mt-2 text-xs sm:text-sm" />
          </>
        );
       case 'TRUTH_FEELINGS':
        return (
          <>
            <h3 className="text-base sm:text-lg font-semibold font-mono text-slate-100">Step 2: The 'Truth' of the Pattern</h3>
            <p className="text-xs sm:text-sm text-slate-400">When you are fully inside this pattern, what feels absolutely true? What are the core feelings or beliefs driving your actions?</p>
            <div className="text-xs sm:text-sm text-slate-500 mt-2 p-2 sm:p-3 bg-neutral-900/40 rounded-md border border-neutral-700 break-words">Example: "It feels like my competence is being attacked. I believe that if I don't win this argument, I will lose everyone's respect and be seen as a fraud."</div>
            <textarea value={session.truthFeelings} onChange={e => updateField('truthFeelings', e.target.value)} rows={5} className="w-full bg-neutral-900/50 border-neutral-700 rounded-md p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-accent mt-2 text-xs sm:text-sm" />
          </>
        );
      case 'NAME_SUBJECT':
        return (
          <>
            <h3 className="text-base sm:text-lg font-semibold font-mono text-slate-100">Step 3: What You're Subject To</h3>
            <p className="text-xs sm:text-sm text-slate-400">Based on your input, Aura has articulated the core belief you might be "subject to"—the lens you're unconsciously looking through. You can edit it if needed.</p>
            <textarea value={session.subjectToStatement} onChange={e => updateField('subjectToStatement', e.target.value)} rows={3} className="w-full bg-neutral-700/50 border-neutral-600 rounded-md p-2 sm:p-3 text-sm sm:text-lg text-amber-300 italic focus:outline-none focus:ring-2 focus:ring-accent mt-2" />
          </>
        );
      case 'EVIDENCE_SUBJECT':
        return (
          <>
            <h3 className="text-base sm:text-lg font-semibold font-mono text-slate-100">Step 4: Check the Evidence</h3>
            <p className="text-xs sm:text-sm text-slate-400">Let's test this belief. What is the actual evidence for and against it being 100% true all the time?</p>
            <label className="text-xs sm:text-sm text-green-400 font-semibold mt-3 sm:mt-4 block break-words">Evidence FOR "{session.subjectToStatement}"</label>
            <p className="text-xs text-slate-500 mt-1">Think of 3 specific situations where this belief felt completely true...</p>
            <textarea value={session.evidenceChecks?.pro || ''} onChange={e => updateField('evidenceChecks', {...session.evidenceChecks, pro: e.target.value})} rows={3} className="w-full bg-neutral-900/50 border-neutral-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-accent mt-1 text-xs sm:text-sm" />
            <label className="text-xs sm:text-sm text-red-400 font-semibold mt-2 block break-words">Evidence AGAINST "{session.subjectToStatement}"</label>
            <p className="text-xs text-slate-500 mt-1">When has this belief NOT been true? What exceptions can you recall?</p>
            <textarea value={session.evidenceChecks?.con || ''} onChange={e => updateField('evidenceChecks', {...session.evidenceChecks, con: e.target.value})} rows={3} className="w-full bg-neutral-900/50 border-neutral-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-accent mt-1 text-xs sm:text-sm" />
            <button onClick={async () => { setIsLoading(true); try { const suggestions = await aiService.suggestCounterEvidence(session.pattern, session.subjectToStatement); const bulletPoints = suggestions.map(s => `• ${s}`).join('\n'); updateField('evidenceChecks', {...session.evidenceChecks, con: session.evidenceChecks?.con ? `${session.evidenceChecks.con}\n\n${bulletPoints}` : bulletPoints}); } catch (err) { console.error('Counter-evidence error:', err); } finally { setIsLoading(false); } }} className="text-xs sm:text-sm bg-neutral-700 hover:bg-neutral-600 text-slate-200 px-2.5 sm:px-3 py-1 rounded-md mt-2 flex items-center gap-1.5 sm:gap-2"><Lightbulb className="w-3 h-3 sm:w-4 sm:h-4"/> Get Counter-Evidence Suggestions</button>
          </>
        );
      case 'TRACE_ORIGIN':
        return (
            <>
                <h3 className="text-base sm:text-lg font-semibold font-mono text-slate-100">Step 5: Trace Its Origin</h3>
                <p className="text-xs sm:text-sm text-slate-400">Where did this belief system come from? When did you first start to feel this way?</p>
                <button onClick={async () => { setIsLoading(true); const suggestion = await aiService.exploreOrigin(session.pattern, session.subjectToStatement); updateField('origin', session.origin ? `${session.origin}\n\nAI Suggestion:\n${suggestion}` : suggestion); setIsLoading(false); }} className="text-xs sm:text-sm bg-neutral-700 hover:bg-neutral-600 text-slate-200 px-2.5 sm:px-3 py-1 rounded-md my-2 flex items-center gap-1.5 sm:gap-2"><Lightbulb className="w-3 h-3 sm:w-4 sm:h-4"/> Get AI Suggestion</button>
                <textarea value={session.origin} onChange={e => updateField('origin', e.target.value)} rows={5} className="w-full bg-neutral-900/50 border-neutral-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-accent text-xs sm:text-sm" />
            </>
        );
       case 'COST':
        return (
          <>
            <h3 className="text-base sm:text-lg font-semibold font-mono text-slate-100">Step 6: The Cost of this Pattern</h3>
            <p className="text-xs sm:text-sm text-slate-400 break-words">Be honest and direct. What has being subject to "{session.subjectToStatement}" cost you in your life, relationships, and well-being?</p>
            <div className="text-xs sm:text-sm text-slate-500 mt-2 p-2 sm:p-3 bg-neutral-900/40 rounded-md border border-neutral-700 break-words">Example: "It has cost me genuine connection because I'm too busy defending. It has cost me learning opportunities. It costs me enormous energy and leaves me feeling isolated and anxious afterwards."</div>
            <textarea value={session.cost} onChange={e => updateField('cost', e.target.value)} rows={5} className="w-full bg-neutral-900/50 border-neutral-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-accent mt-2 text-xs sm:text-sm" />
          </>
        );
      case 'FIRST_OBSERVATION':
        return (
            <>
                <h3 className="text-base sm:text-lg font-semibold font-mono text-slate-100">Step 7: The First Observation</h3>
                <p className="text-xs sm:text-sm text-slate-400">Imagine the next time this pattern arises. From a compassionate, objective viewpoint, what would you see? Describe the "you" who is caught in the pattern as if you were a neutral observer.</p>
                <div className="text-xs sm:text-sm text-slate-500 mt-2 p-2 sm:p-3 bg-neutral-900/40 rounded-md border border-neutral-700">This step is crucial. It is the mental act of making the pattern "object" for the first time.</div>
                <textarea value={session.firstObservation} onChange={e => updateField('firstObservation', e.target.value)} rows={6} className="w-full bg-neutral-900/50 border-neutral-700 rounded-md p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-accent mt-2 text-xs sm:text-sm" />
            </>
        );
       case 'SMALL_EXPERIMENT':
         return (
           <>
            <h3 className="text-base sm:text-lg font-semibold font-mono text-slate-100">Step 8: A Small, Safe Experiment</h3>
            <p className="text-xs sm:text-sm text-slate-400">To make this pattern "object" in real life, we need a small experiment. Choose one that feels slightly uncomfortable but safe, or write your own.</p>
            <div className="space-y-2 my-4">
                {session.ongoingPracticePlan && session.ongoingPracticePlan.map((exp, i) => (
                    <div
                      key={i}
                      onClick={() => updateField('smallExperimentChosen', exp)}
                      className={`cursor-pointer transition-all rounded-md p-2 sm:p-3 border-2 text-xs sm:text-sm flex items-start gap-2 ${
                        session.smallExperimentChosen === exp
                          ? 'border-amber-500 bg-amber-900/20'
                          : 'border-neutral-700 bg-neutral-700/50 hover:border-neutral-600'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                        session.smallExperimentChosen === exp
                          ? 'border-amber-500 bg-amber-500'
                          : 'border-neutral-500'
                      }`}>
                        {session.smallExperimentChosen === exp && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <span className="flex-1">{exp}</span>
                    </div>
                ))}
            </div>
            <button onClick={async () => { setIsLoading(true); try { const experiments = await aiService.suggestSubjectObjectExperiments(session.pattern, session.subjectToStatement, [session.cost]); updateField('ongoingPracticePlan', experiments); updateField('smallExperimentChosen', ''); } catch (err) { console.error('Regenerate error:', err); } finally { setIsLoading(false); } }} className="text-xs sm:text-sm bg-neutral-700 hover:bg-neutral-600 text-slate-200 px-2.5 sm:px-3 py-1 rounded-md mb-3 flex items-center gap-1.5 sm:gap-2"><RefreshCw className="w-3 h-3 sm:w-4 sm:h-4"/> Regenerate</button>
            <textarea value={session.smallExperimentChosen || ''} onChange={e => updateField('smallExperimentChosen', e.target.value)} rows={2} placeholder="Or write your own experiment..." className="w-full bg-neutral-900/50 border-neutral-700 rounded-md p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-accent text-xs sm:text-sm" />
           </>
         );
       case 'INTEGRATION_SHIFT':
        return (
            <>
                <h3 className="text-base sm:text-lg font-semibold font-mono text-slate-100">Step 9: Integration & Shift</h3>
                <p className="text-xs sm:text-sm text-slate-400">Having observed this pattern, what is the key insight? What new, more empowering belief or action is now available to you?</p>
                <button onClick={async () => { setIsLoading(true); const suggestion = await aiService.generateIntegrationInsight(session.pattern, session.subjectToStatement, session.cost, session.smallExperimentChosen || ''); updateField('integrationShift', session.integrationShift ? `${session.integrationShift}\n\nAI Suggestion:\n${suggestion}` : suggestion); setIsLoading(false); }} className="text-xs sm:text-sm bg-neutral-700 hover:bg-neutral-600 text-slate-200 px-2.5 sm:px-3 py-1 rounded-md my-2 flex items-center gap-1.5 sm:gap-2"><Lightbulb className="w-3 h-3 sm:w-4 sm:h-4"/> Get AI Suggestion</button>
                <textarea value={session.integrationShift} onChange={e => updateField('integrationShift', e.target.value)} rows={6} className="w-full bg-neutral-900/50 border-neutral-700 rounded-md p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-accent text-xs sm:text-sm" />
                <button
                    onClick={handleDownload}
                    className="mt-6 w-full btn-luminous px-4 py-3 rounded-md font-medium flex items-center justify-center gap-2 touch-target text-xs sm:text-sm"
                >
                    <Download className="w-3 h-3 sm:w-4 sm:h-4" /> Download Report
                </button>
            </>
        );
      default:
        return <p>Loading step...</p>;
    }
  };

  const insightBanner = insightContext ? (
    <div className="bg-teal-900/20 border border-teal-700/50 rounded-lg p-3 sm:p-4">
      <p className="text-xs sm:text-sm text-teal-200 break-words">
        <strong>Working with pattern:</strong> "{insightContext.detectedPattern}"
      </p>
    </div>
  ) : undefined;

  const sessionSidebar = (
    <aside className="w-full md:w-56 bg-neutral-900/50 p-3 sm:p-4 rounded-lg border border-neutral-700 max-h-48 md:max-h-[60vh] overflow-y-auto">
      <h4 className="font-mono text-slate-400 mb-2 sm:mb-3 text-xs sm:text-sm">Session Context</h4>
      {session.pattern && (
        <div className="mb-2 sm:mb-3 text-[10px] sm:text-xs">
          <p className="text-slate-500 font-semibold">Pattern:</p>
          <p className="text-slate-300 break-words">{session.pattern.substring(0, 100)}...</p>
        </div>
      )}
      {session.truthFeelings && (
        <div className="mb-2 sm:mb-3 text-[10px] sm:text-xs">
          <p className="text-slate-500 font-semibold">Core Feelings:</p>
          <p className="text-slate-300 break-words">{session.truthFeelings.substring(0, 80)}...</p>
        </div>
      )}
      {session.subjectToStatement && (
        <div className="mb-2 sm:mb-3 text-[10px] sm:text-xs">
          <p className="text-slate-500 font-semibold">Subject To:</p>
          <p className="text-slate-300 break-words">{session.subjectToStatement}</p>
        </div>
      )}
    </aside>
  );

  return (
    <WizardFrame
      title="Subject-Object Explorer"
      currentStep={currentStepIndex + 1}
      totalSteps={TOTAL_STEPS}
      isLoading={isLoading}
      showBackButton={!isFirstStep}
      nextButtonText={nextButtonText}
      nextButtonDisabled={!canProceedToNext()}
      onClose={onClose}
      onBack={handleBack}
      onNext={handleNext}
      accentColor="amber"
      headerSlot={insightBanner}
      leftFooterSlot={
        <button onClick={handleSaveDraftAndClose} className="text-sm text-slate-400 hover:text-white transition">
          Save Draft & Close
        </button>
      }
    >
      <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
        <div className="flex-1 space-y-3 sm:space-y-4">
          {isLoading && <p className="text-slate-400 animate-pulse text-xs sm:text-sm">Aura is thinking...</p>}
          {renderStep()}
        </div>
        {sessionSidebar}
      </div>
    </WizardFrame>
  );
}
