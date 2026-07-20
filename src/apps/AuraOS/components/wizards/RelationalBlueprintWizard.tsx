import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useWizardDraft } from '../../hooks/useWizardDraft';
import { useAuth } from '../../contexts/AuthContext';
import { X, ChevronRight, ChevronLeft, Loader2, Save, Users, Eye, Heart, Layers, Shield, Compass, MessageSquare, FileText } from 'lucide-react';
import { generateInsightFromSession } from '../../services/insightGenerator';
import { wizardSessionService } from '../../services/wizardSessionService';
import { callGPTOssExactoThenMimoJson } from '../../services/ai/aiCore';
import { detectCrisisLevel, type CrisisLevel } from '../../utils/crisisDetection';
import { practices } from '../../constants';
import {
  relationalPatternHypothesisSchema,
  relationalBlueprintFinalSynthesisSchema,
  blameCheckSchema,
  messageRewriteSchema,
} from '../../services/ai/wizardSchemas';
import type {
  RelationalBlueprintDraft,
  RelationalEntry,
  RelationalBlueprintArtifact,
} from '../../types';
import DyadBridgeIcon from '../visualizations/SacredGeometryIcons/DyadBridgeIcon';
import PatternMandalaIcon from '../visualizations/SacredGeometryIcons/PatternMandalaIcon';

type Step = 'ENTRY' | 'WITNESSES' | 'CAST' | 'PATTERN' | 'SOMATIC' | 'ORIGIN' | 'GROUND' | 'MOVE' | 'BLUEPRINT';

const STEPS: Step[] = ['ENTRY', 'WITNESSES', 'CAST', 'PATTERN', 'SOMATIC', 'ORIGIN', 'GROUND', 'MOVE', 'BLUEPRINT'];
const TOTAL_STEPS = STEPS.length;

const STEP_META: Record<Step, { label: string; icon: any; desc: string }> = {
  ENTRY: { label: 'Entry', icon: Heart, desc: 'What draws you here' },
  WITNESSES: { label: 'Witnesses', icon: Users, desc: 'Name three relationships' },
  CAST: { label: 'Roles', icon: Layers, desc: 'Map the cast of characters' },
  PATTERN: { label: 'Pattern', icon: Eye, desc: 'The recurring dynamic' },
  SOMATIC: { label: 'Somatic', icon: Shield, desc: 'How it lives in your body' },
  ORIGIN: { label: 'Origin', icon: Compass, desc: 'Where this pattern started' },
  GROUND: { label: 'Ground', icon: DyadBridgeIcon, desc: 'Pause & arrive' },
  MOVE: { label: 'Move', icon: MessageSquare, desc: 'Your relational move' },
  BLUEPRINT: { label: 'Blueprint', icon: PatternMandalaIcon, desc: 'Your synthesis' },
};

interface RelationalBlueprintWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

const initialDraft: RelationalBlueprintDraft = {
  entryContext: '',
  relationships: [
    { pseudonym: '', relationshipType: '', status: 'active', significance: '', duration: '', selfRole: '', otherRole: '', breakdownMoment: '', isCurrent: false, isHistorical: false },
    { pseudonym: '', relationshipType: '', status: 'active', significance: '', duration: '', selfRole: '', otherRole: '', breakdownMoment: '', isCurrent: false, isHistorical: false },
    { pseudonym: '', relationshipType: '', status: 'active', significance: '', duration: '', selfRole: '', otherRole: '', breakdownMoment: '', isCurrent: false, isHistorical: false },
  ],
  confirmedPattern: '',
  patternConfirmationMethod: 'accepted',
  synthesisAngleUsed: 'user-authored',
  somaticCues: [],
  somaticFreeText: '',
  interruptTrigger: '',
  originUsefulness: '',
  originSource: '',
  originProtection: '',
  relationalMoveType: '',
  relationalRecipient: '',
  relationalMessage: '',
  messageSentStatus: 'unsent',
  sentResponse: '',
  notSentReason: '',
  deadline: '',
  artifactSavedAt: '',
  lastResurfacedDate: '',
  patternMechanismSummary: '',
  relationalStrengthIdentified: '',
};

// ============================================================================
// PROMPTS
// ============================================================================

const RELATIONAL_SYNTHESIS_ROLES_PROMPT = (roles: string, breakdowns: string) => `
Synthesize this data into a PATTERN HYPOTHESIS — the recurring relational dynamic this person enacts.

ROLES:
${roles}

BREAKDOWNS:
${breakdowns}

Look for: repeated positioning, complementary roles, escalation patterns, withdrawal patterns.

CRITICAL: Respond with ONLY valid JSON (no markdown, no explanation):
{
  "patternHypothesis": "You position yourself as the caretaker who absorbs others' distress, then withdraw when your own needs surface — creating the abandonment you fear.",
  "synthesisAngle": "roles"
}
`;

const RELATIONAL_SYNTHESIS_BREAKDOWN_PROMPT = (breakdowns: string) => `
Synthesize this data into a PATTERN HYPOTHESIS — the recurring relational dynamic this person enacts.

BREAKDOWN MOMENTS:
${breakdowns}

Look for: what triggers the rupture, what role each person is in at the moment of breakdown, what the person does immediately after.

CRITICAL: Respond with ONLY valid JSON (no markdown, no explanation):
{
  "patternHypothesis": "You position yourself as the caretaker who absorbs others' distress, then withdraw when your own needs surface — creating the abandonment you fear.",
  "synthesisAngle": "breakdowns"
}
`;

const RELATIONAL_MESSAGE_CLARIFY_PROMPT = (message: string) => `
The user has drafted this relational message:

"${message}"

Rewrite to remove self-protective hedging and softening. Keep the core truth. Use "I" statements. Remove:
- Over-explaining or context-setting
- Softening language ("I think maybe...", "I don't know if this makes sense but...")
- Pre-emptive apologies
- Qualifying ("It's probably just me but...")

Keep it under 150 words if possible.

CRITICAL: Respond with ONLY valid JSON (no markdown, no explanation):
{
  "rewrite": "What you said last week hurt. It echoed an old pattern, and I need you to know that."
}
`;

const RELATIONAL_MESSAGE_SHORTEN_PROMPT = (message: string) => `
The user has drafted this relational message:

"${message}"

Condense this to its essential truth—remove elaboration, context-setting, or softening.

Use the user's own words. Keep it under 100 words if possible.

CRITICAL: Respond with ONLY valid JSON (no markdown, no explanation):
{
  "rewrite": "What you said last week hurt. It echoed an old pattern, and I need you to know that."
}
`;

const RELATIONAL_BLAME_CHECK_PROMPT = (message: string) => `
Review this relational message for hidden BLAME PHRASING—language that subtly positions the other person as wrong/bad/broken:

"${message}"

Look for: "You always...", "You never...", "You made me...", pathologizing language, implicit moral judgment, victimhood positioning.

If the message has blame phrasing, provide a rewrite that expresses the IMPACT on the user without attributing intention or character to the other person.

CRITICAL: Respond with ONLY valid JSON (no markdown, no explanation):
{
  "hasBlamePhrasing": true,
  "rewrite": "When you're not available, I feel abandoned. I need to know I matter to you.",
  "explanation": "Removed character judgment; kept impact statement."
}
`;

const RELATIONAL_FINAL_SYNTHESIS_PROMPT = (patternHypothesis: string, somaticSig: string, originNotes: string) => `
Synthesize this relational blueprint into TWO final insights:

1. PATTERN MECHANISM: How does this recurring pattern actually WORK? What is the underlying mechanism?
2. RELATIONAL STRENGTH: What relational capacity or gift is visible in this pattern?

CONFIRMED PATTERN:
${patternHypothesis}

SOMATIC SIGNATURE (how it feels in the body):
${somaticSig}

ORIGIN NOTES (what they've said about how this began):
${originNotes}

Synthesize both insights. Keep each to 1-2 sentences.

CRITICAL: Respond with ONLY valid JSON (no markdown, no explanation):
{
  "patternMechanismSummary": "You unconsciously expect rejection when you can't fix others' pain, so you withdraw before they can leave — recreating the abandonment you fear.",
  "relationalStrengthIdentified": "You show up with deep care and attunement; your commitment to others' emotional reality is genuine and consistent."
}
`;

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">{children}</p>;
}

function AiThinking({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-stone-900/60 border border-rose-500/10 rounded-xl">
      <Loader2 size={16} className="text-rose-500 animate-spin shrink-0" />
      <p className="text-xs text-stone-400 italic">{label}</p>
    </div>
  );
}

function AiCard({ label, text }: { label: string; text: string }) {
  return (
    <div className="bg-gradient-to-br from-rose-950/20 to-stone-900/60 border border-rose-500/15 rounded-xl px-4 py-3 text-sm text-stone-300 leading-relaxed">
      <span className="text-rose-500/60 text-xs font-bold uppercase tracking-widest block mb-1">{label}</span>
      {text}
    </div>
  );
}

function FieldTextarea({ label, value, onChange, placeholder, rows = 3 }: {
  label?: string; value: string; onChange: (v: string) => void; placeholder: string; rows?: number;
}) {
  return (
    <div>
      {label && <SectionLabel>{label}</SectionLabel>}
      <textarea
        value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} rows={rows}
        className="w-full bg-stone-950/80 border border-stone-700/50 text-stone-100 placeholder-stone-600 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500/30 transition-all"
      />
    </div>
  );
}

function FieldInput({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder: string; type?: string;
}) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full bg-stone-950/80 border border-stone-700/50 text-stone-100 placeholder-stone-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500/30 transition-all" />
  );
}

function FieldSelect({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder?: string;
}) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full bg-stone-950/80 border border-stone-700/50 text-stone-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 transition-all">
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function StepRail({ current }: { current: number }) {
  return (
    <div className="flex flex-col gap-1 py-2">
      {STEPS.map((stepKey, i) => {
        const meta = STEP_META[stepKey];
        const Icon = meta.icon;
        const done = i < current;
        const active = i === current;
        return (
          <div key={stepKey} className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 ${active ? 'bg-rose-500/10 border border-rose-500/20' : done ? 'opacity-60' : 'opacity-30'}`}>
            <div className={`shrink-0 ${active ? 'text-rose-400' : done ? 'text-rose-600' : 'text-stone-600'}`}>
              <Icon size={16} />
            </div>
            <div className="min-w-0">
              <p className={`text-xs font-semibold font-serif truncate ${active ? 'text-rose-300' : done ? 'text-stone-400' : 'text-stone-600'}`}>
                {meta.label}
              </p>
              {active && <p className="text-[10px] text-stone-500 leading-tight mt-0.5">{meta.desc}</p>}
            </div>
            {done && <div className="ml-auto shrink-0 w-1.5 h-1.5 rounded-full bg-rose-600" />}
          </div>
        );
      })}
    </div>
  );
}

const RelationshipCard = React.memo(function RelationshipCard({
  index,
  entry,
  onChange,
}: {
  index: number;
  entry: RelationalEntry;
  onChange: (updated: RelationalEntry) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [local, setLocal] = useState(entry);

  useEffect(() => {
    setLocal(entry);
  }, [entry]);

  const handleFieldChange = useCallback((field: keyof RelationalEntry, value: any) => {
    const updated = { ...local, [field]: value };
    setLocal(updated);
    onChange(updated);
  }, [local, onChange]);

  return (
    <div className="bg-stone-900/60 border border-rose-500/15 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left px-4 py-3 hover:bg-stone-800/40 transition-colors"
      >
        <span className="font-serif text-sm text-rose-300">{local.pseudonym || `Relationship ${index + 1}`}</span>
        <span className="text-xs text-stone-500">{isOpen ? '−' : '+'}</span>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-3 border-t border-stone-800/40">
          <div className="pt-3 space-y-3">
            <FieldInput placeholder="Pseudonym (e.g., 'Alex', 'The Friend')" value={local.pseudonym} onChange={v => handleFieldChange('pseudonym', v)} />
            <FieldInput placeholder="Relationship type (e.g., 'romantic', 'parent')" value={local.relationshipType} onChange={v => handleFieldChange('relationshipType', v)} />
            <FieldSelect value={local.status} onChange={v => handleFieldChange('status', v as any)} options={[
              { value: 'active', label: 'Active' }, { value: 'past', label: 'Past' }, { value: 'estranged', label: 'Estranged' },
            ]} />
            <FieldInput placeholder="Duration (e.g., '5 years', '2 months')" value={local.duration} onChange={v => handleFieldChange('duration', v)} />
          </div>
        </div>
      )}
    </div>
  );
});

// ============================================================================
// MAIN WIZARD
// ============================================================================

export default function RelationalBlueprintWizard({ isOpen, onClose }: RelationalBlueprintWizardProps) {
  const [step, setStep] = useState<Step>('ENTRY');
  const [draft, updateDraft, , clearDraft] = useWizardDraft<RelationalBlueprintDraft>('aura-draft-relational-blueprint', initialDraft);
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [crisisLevel, setCrisisLevel] = useState<CrisisLevel>('none');
  const [error, setError] = useState<string | null>(null);
  const [blameCoachingNote, setBlameCoachingNote] = useState<string | null>(null);
  const [originGateAcknowledged, setOriginGateAcknowledged] = useState(false);

  const currentStepIndex = STEPS.indexOf(step);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [step]);

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const getValidationError = useCallback((): string | null => {
    if (!draft) return 'Loading draft...';

    switch (step) {
      case 'ENTRY':
        if (draft.entryContext.length < 10) return 'Please share more context (at least 10 characters).';
        if (crisisLevel === 'high') return 'Please reach out to a crisis service. We cannot safely continue.';
        return null;

      case 'WITNESSES': {
        const filled = draft.relationships.filter((r) => r.pseudonym && r.relationshipType && r.duration);
        if (filled.length < 2) return 'Please fill in at least 2 relationships (at least: name, type, duration).';
        const allHaveStatus = draft.relationships.every((r) => r.status === 'active' || r.status === 'past' || r.status === 'estranged');
        if (!allHaveStatus) return 'Please specify the status of each relationship.';
        const tempConstraint = draft.relationships.filter((r) => r.isCurrent || r.isHistorical).length;
        if (tempConstraint === 0) return 'Please mark at least one relationship as current or past.';
        return null;
      }

      case 'CAST': {
        const rolesComplete = draft.relationships.every((r) => r.selfRole && r.otherRole);
        if (!rolesComplete) return 'Please describe your role and theirs in each relationship.';
        const breakdownsCount = draft.relationships.filter((r) => r.breakdownMoment).length;
        if (breakdownsCount < 2) return 'Please describe a breakdown moment for at least 2 relationships.';
        return null;
      }

      case 'PATTERN':
        if (draft.confirmedPattern.length < 30) return 'Please confirm or describe the pattern (at least 30 characters).';
        return null;

      case 'SOMATIC':
        if (draft.somaticCues.length === 0 && !draft.somaticFreeText) return 'Please identify at least one somatic cue or describe how this pattern feels in your body.';
        if (!draft.interruptTrigger) return 'Please describe what interrupts this pattern.';
        return null;

      case 'ORIGIN': {
        const originFilled = [draft.originUsefulness, draft.originSource, draft.originProtection].filter((x) => x).length;
        if (originFilled < 2) return 'Please fill in at least 2 of the origin fields.';
        if (crisisLevel === 'high') return 'Please reach out to a crisis service. We cannot safely continue.';
        return null;
      }

      case 'GROUND':
      case 'MOVE':
      case 'BLUEPRINT':
        return null;

      default:
        return null;
    }
  }, [step, draft, crisisLevel]);

  const canAdvance = useMemo(() => {
    return getValidationError() === null;
  }, [getValidationError]);

  useEffect(() => {
    setError(getValidationError());
  }, [getValidationError]);

  if (!isOpen) return null;
  if (!draft) return null;

  const saveDraft = (newDraft: RelationalBlueprintDraft) => updateDraft(newDraft);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleNext = async () => {
    if (!canAdvance) return;

    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      const nextStep = STEPS[nextIndex];
      setStep(nextStep);
      saveDraft(draft);

      if (nextStep === 'PATTERN' && !draft.confirmedPattern) {
        setIsLoading(true);
        try {
          const rolesText = draft.relationships.map((r) => `${r.pseudonym}: You are ${r.selfRole}. They are ${r.otherRole}.`).join('\n');
          const breakdownsText = draft.relationships.filter((r) => r.breakdownMoment).map((r) => `${r.pseudonym}: ${r.breakdownMoment}`).join('\n');
          const rolesPrompt = RELATIONAL_SYNTHESIS_ROLES_PROMPT(rolesText, breakdownsText);
          const result = await callGPTOssExactoThenMimoJson('RelationalPatternHypothesis', rolesPrompt, relationalPatternHypothesisSchema);
          let finalPattern = result.patternHypothesis;
          let finalAngle = result.synthesisAngle;

          if (finalPattern.length < 60 && breakdownsText.trim().length > 20) {
            try {
              const breakdownPrompt = RELATIONAL_SYNTHESIS_BREAKDOWN_PROMPT(breakdownsText);
              const breakdownResult = await callGPTOssExactoThenMimoJson('RelationalPatternBreakdown', breakdownPrompt, relationalPatternHypothesisSchema);
              if (breakdownResult.patternHypothesis.length > finalPattern.length) {
                finalPattern = breakdownResult.patternHypothesis;
                finalAngle = breakdownResult.synthesisAngle;
              }
            } catch { /* keep roles result */ }
          }

          saveDraft({ ...draft, confirmedPattern: finalPattern, synthesisAngleUsed: finalAngle });
        } catch (err) {
          console.error('Pattern synthesis failed:', err);
          setError('Pattern synthesis failed. Please describe the pattern manually.');
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  const handlePrev = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setStep(STEPS[prevIndex]);
      saveDraft(draft);
    }
  };

  const handleComplete = async () => {
    if (isSaving || draft.artifactSavedAt) return;
    setIsSaving(true);
    setIsLoading(true);
    try {
      const somaticSig = [...draft.somaticCues, draft.somaticFreeText].filter(Boolean).join(' · ');
      const originNotes = [
        draft.originUsefulness && `Usefulness: ${draft.originUsefulness}`,
        draft.originSource && `Source: ${draft.originSource}`,
        draft.originProtection && `Protection: ${draft.originProtection}`,
      ].filter(Boolean).join(' | ');

      const prompt = RELATIONAL_FINAL_SYNTHESIS_PROMPT(draft.confirmedPattern, somaticSig, originNotes);
      const synthesis = await callGPTOssExactoThenMimoJson('RelationalFinalSynthesis', prompt, relationalBlueprintFinalSynthesisSchema);

      const artifact: RelationalBlueprintArtifact = {
        completionDate: new Date().toISOString(),
        confirmedPattern: draft.confirmedPattern,
        synthesisMethod: draft.synthesisAngleUsed,
        relationships: draft.relationships,
        somaticSignature: draft.somaticCues,
        interruptTrigger: draft.interruptTrigger,
        originNotes: {
          usefulness: draft.originUsefulness,
          source: draft.originSource,
          protection: draft.originProtection,
        },
        relationalMove: {
          type: (draft.relationalMoveType || 'disclosure') as 'disclosure' | 'request' | 'repair' | 'agreement',
          recipient: draft.relationalRecipient,
          message: draft.relationalMessage,
          savedAt: draft.artifactSavedAt,
          deadline: draft.deadline,
          sentStatus: draft.messageSentStatus,
          sentResponse: draft.sentResponse,
          notSentReason: draft.notSentReason,
        },
        patternMechanismSummary: synthesis.patternMechanismSummary,
        relationalStrengthIdentified: synthesis.relationalStrengthIdentified,
      };

      let insightSaved = false;
      if (user?.id) {
        try {
          // Build narrative report from artifact
          const relationshipLines = draft.relationships
            .filter(r => r.pseudonym.trim())
            .map(r => `  - ${r.pseudonym} (${r.relationshipType}): Self as ${r.selfRole}, other as ${r.otherRole}${r.breakdownMoment ? ` — breakdown: ${r.breakdownMoment}` : ''}`)
            .join('\n');

          const somaticSignature = artifact.somaticSignature?.length
            ? `Somatic signature: ${artifact.somaticSignature.join(', ')}`
            : '';

          const relationalMoveSection = artifact.relationalMove?.message
            ? `\nRelational move (${artifact.relationalMove.type}): "${artifact.relationalMove.message}" to ${artifact.relationalMove.recipient || 'TBD'}${artifact.relationalMove.sentStatus === 'sent' ? ' [SENT]' : ' [UNSENT]'}`
            : '';

          const sessionReport = `# Relational Blueprint Session
Pattern identified: ${draft.confirmedPattern}

Relationships examined:
${relationshipLines}

${somaticSignature}

Interrupt trigger: ${artifact.interruptTrigger || 'Not identified'}

Origin context:
  - Usefulness: ${artifact.originNotes.usefulness || 'Not explored'}
  - Source: ${artifact.originNotes.source || 'Not identified'}
  - Protective function: ${artifact.originNotes.protection || 'Not examined'}

Pattern mechanism: ${artifact.patternMechanismSummary || 'Under synthesis'}

Relational strength: ${artifact.relationalStrengthIdentified || 'Being identified'}${relationalMoveSection}`;

          const practicesList = [
            ...(Array.isArray(practices.body) ? practices.body.map((p) => ({ id: p.id, name: p.name })) : []),
            ...(Array.isArray(practices.mind) ? practices.mind.map((p) => ({ id: p.id, name: p.name })) : []),
            ...(Array.isArray(practices.shadow) ? practices.shadow.map((p) => ({ id: p.id, name: p.name })) : []),
            ...(Array.isArray(practices.spirit) ? practices.spirit.map((p) => ({ id: p.id, name: p.name })) : []),
          ].slice(0, 30);

          await generateInsightFromSession({
            wizardType: 'Relational Blueprint',
            sessionId: `relational-blueprint-${Date.now()}`,
            sessionName: 'Relational Blueprint Session',
            sessionReport: sessionReport,
            sessionSummary: draft.confirmedPattern,
            userId: user.id,
            availablePractices: practicesList,
            dataContext: {
              totalSessions: 1,
              sessionsInLastWeek: 1,
              existingInsights: 0,
            },
          });

          // Persist session to Supabase
          try {
            await wizardSessionService.saveSession({
              user_id: user.id,
              session_id: `relational-blueprint-${Date.now()}`,
              type: 'relational_blueprint',
              content: artifact,
              created_at: artifact.completionDate,
            });
          } catch (sessionErr) {
            console.warn('[RelationalBlueprintWizard] Failed to save session:', sessionErr);
          }

          insightSaved = true;
        } catch (insightErr) {
          console.warn('[RelationalBlueprintWizard] Insight generation failed:', insightErr);
          setError('Blueprint synthesized but could not save to Insights. Your data is preserved — try saving again.');
        }
      } else {
        insightSaved = true;
      }

      if (insightSaved) {
        saveDraft({
          ...draft,
          patternMechanismSummary: synthesis.patternMechanismSummary,
          relationalStrengthIdentified: synthesis.relationalStrengthIdentified,
          artifactSavedAt: new Date().toISOString(),
          lastResurfacedDate: new Date().toISOString(),
        });
      } else {
        saveDraft({
          ...draft,
          patternMechanismSummary: synthesis.patternMechanismSummary,
          relationalStrengthIdentified: synthesis.relationalStrengthIdentified,
        });
      }
    } catch (err) {
      console.error('Completion failed:', err);
      setError('Failed to generate insight. You can still save your work.');
    } finally {
      setIsLoading(false);
      setIsSaving(false);
    }
  };

  const handleMessageClarify = async () => {
    if (!draft.relationalMessage) return;
    setIsLoading(true);
    try {
      const prompt = RELATIONAL_MESSAGE_CLARIFY_PROMPT(draft.relationalMessage);
      const result = await callGPTOssExactoThenMimoJson('RelationalMessageClarify', prompt, messageRewriteSchema);
      saveDraft({ ...draft, relationalMessage: result.rewrite });
    } catch (err) {
      console.error('Message clarify failed:', err);
      setError('Message refinement failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessageShorten = async () => {
    if (!draft.relationalMessage) return;
    setIsLoading(true);
    try {
      const prompt = RELATIONAL_MESSAGE_SHORTEN_PROMPT(draft.relationalMessage);
      const result = await callGPTOssExactoThenMimoJson('RelationalMessageShorten', prompt, messageRewriteSchema);
      saveDraft({ ...draft, relationalMessage: result.rewrite });
    } catch (err) {
      console.error('Message shorten failed:', err);
      setError('Message shortening failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlameCheck = async () => {
    if (!draft.relationalMessage) return;
    setIsLoading(true);
    setBlameCoachingNote(null);
    try {
      const prompt = RELATIONAL_BLAME_CHECK_PROMPT(draft.relationalMessage);
      const result = await callGPTOssExactoThenMimoJson('RelationalBlameCheck', prompt, blameCheckSchema);
      if (result.hasBlamePhrasing) {
        setBlameCoachingNote(result.rewrite);
        setError(null);
      } else {
        setBlameCoachingNote(null);
        setError(null);
      }
    } catch (err) {
      console.error('Blame check failed:', err);
      setError('Blame check failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // SOMATIC CHIPS
  // ============================================================================

  const SOMATIC_CUES = ['Chest tightness', 'Throat closure', 'Stomach clench', 'Numbness', 'Dissociation', 'Rage', 'Shame', 'Vertigo'];

  // ============================================================================
  // STEP RENDERERS
  // ============================================================================

  const renderStep = () => {
    switch (step) {
      case 'ENTRY':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="inline-block text-rose-400/60 mb-3"><Heart size={44} /></div>
              <h2 className="text-2xl font-serif font-light text-stone-100 mb-1">Relational Blueprint</h2>
              <p className="text-sm text-stone-400 max-w-md mx-auto leading-relaxed">
                You're going to explore a relational pattern by looking at three relationships. Start by sharing what draws you to explore this now.
              </p>
            </div>
            <FieldTextarea
              label="What's prompting you to explore this pattern?"
              value={draft.entryContext}
              onChange={(val) => { saveDraft({ ...draft, entryContext: val }); setCrisisLevel(detectCrisisLevel(val)); }}
              placeholder="A recent relationship wound, a repeating dynamic, a moment of clarity about your own role…"
              rows={5}
            />
          </div>
        );

      case 'WITNESSES':
        return (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <div className="inline-block text-rose-400/60 mb-2"><Users size={40} /></div>
              <h2 className="text-2xl font-serif font-light text-stone-100 mb-1">Name Three Relationships</h2>
              <p className="text-sm text-stone-400 max-w-md mx-auto">Where does this pattern repeat? They can be romantic, familial, friendships, professional.</p>
            </div>
            <div className="space-y-3">
              {draft.relationships.map((entry, idx) => (
                <RelationshipCard
                  key={idx}
                  index={idx}
                  entry={entry}
                  onChange={(updated) => {
                    const newRels = [...draft.relationships];
                    newRels[idx] = updated;
                    saveDraft({ ...draft, relationships: newRels });
                  }}
                />
              ))}
            </div>
            <p className="text-[10px] text-stone-600 italic text-center">2–3 relationships gives the strongest pattern insight, but 2 is enough to begin.</p>
          </div>
        );

      case 'CAST':
        return (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <div className="inline-block text-rose-400/60 mb-2"><Layers size={40} /></div>
              <h2 className="text-2xl font-serif font-light text-stone-100 mb-1">The Cast of Characters</h2>
              <p className="text-sm text-stone-400 max-w-md mx-auto">For each relationship, describe the roles — yours and theirs — and the breakdown moment.</p>
            </div>
            <div className="space-y-5">
              {draft.relationships.map((entry, idx) => (
                <div key={idx} className="bg-stone-900/60 border border-rose-500/15 rounded-xl p-4 space-y-3">
                  <p className="font-serif text-sm text-rose-300">{entry.pseudonym || `Relationship ${idx + 1}`}</p>
                  <FieldTextarea placeholder="Your role in this relationship…" value={entry.selfRole} onChange={(val) => {
                    const newRels = [...draft.relationships]; newRels[idx].selfRole = val; saveDraft({ ...draft, relationships: newRels });
                  }} rows={2} />
                  <FieldTextarea placeholder="Their role / how they are with you…" value={entry.otherRole} onChange={(val) => {
                    const newRels = [...draft.relationships]; newRels[idx].otherRole = val; saveDraft({ ...draft, relationships: newRels });
                  }} rows={2} />
                  <FieldTextarea placeholder="What was the breakdown moment or key wound?" value={entry.breakdownMoment} onChange={(val) => {
                    const newRels = [...draft.relationships]; newRels[idx].breakdownMoment = val; saveDraft({ ...draft, relationships: newRels });
                  }} rows={2} />
                </div>
              ))}
            </div>
          </div>
        );

      case 'PATTERN':
        return (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <div className="inline-block text-rose-400/60 mb-2"><Eye size={40} /></div>
              <h2 className="text-2xl font-serif font-light text-stone-100 mb-1">The Pattern</h2>
              <p className="text-sm text-stone-400 max-w-md mx-auto">What is the recurring dynamic? What role do you habitually step into?</p>
            </div>
            {isLoading && <AiThinking label="Synthesizing pattern from your relationships…" />}
            <FieldTextarea
              label="The Pattern"
              value={draft.confirmedPattern}
              onChange={(val) => saveDraft({ ...draft, confirmedPattern: val })}
              placeholder="The AI-generated pattern hypothesis appears here. Edit freely — this is your truth to confirm."
              rows={5}
            />
            {draft.synthesisAngleUsed && (
              <p className="text-[10px] text-stone-600 italic">Synthesis angle: {draft.synthesisAngleUsed}</p>
            )}
          </div>
        );

      case 'SOMATIC':
        return (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <div className="inline-block text-rose-400/60 mb-2"><Shield size={40} /></div>
              <h2 className="text-2xl font-serif font-light text-stone-100 mb-1">Somatic Signature</h2>
              <p className="text-sm text-stone-400 max-w-md mx-auto">How does this pattern feel in your body? Where do you sense it?</p>
            </div>

            <div>
              <SectionLabel>Somatic Cues</SectionLabel>
              <div className="flex flex-wrap gap-2">
                {SOMATIC_CUES.map((cue) => (
                  <button
                    key={cue}
                    onClick={() => {
                      if (draft.somaticCues.includes(cue)) {
                        saveDraft({ ...draft, somaticCues: draft.somaticCues.filter(c => c !== cue) });
                      } else {
                        saveDraft({ ...draft, somaticCues: [...draft.somaticCues, cue] });
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 min-h-[36px] ${draft.somaticCues.includes(cue)
                      ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                      : 'bg-stone-900/60 border-stone-700/40 text-stone-400 hover:border-stone-600'
                      }`}
                  >
                    {cue}
                  </button>
                ))}
              </div>
            </div>

            <FieldTextarea
              value={draft.somaticFreeText || ''}
              onChange={(val) => saveDraft({ ...draft, somaticFreeText: val })}
              placeholder="Or describe it in your own words…"
              rows={3}
            />

            <FieldTextarea
              label="What interrupts this pattern?"
              value={draft.interruptTrigger}
              onChange={(val) => saveDraft({ ...draft, interruptTrigger: val })}
              placeholder="What breaks the spell? What disrupts the automatic sequence?"
              rows={3}
            />
          </div>
        );

      case 'ORIGIN':
        if (!originGateAcknowledged) {
          return (
            <div className="space-y-6">
              <div className="text-center mb-4">
                <div className="inline-block text-rose-400/60 mb-3"><Compass size={44} /></div>
                <h2 className="text-2xl font-serif font-light text-stone-100 mb-1">Before We Go Deeper</h2>
              </div>
              <div className="bg-stone-900/60 border border-rose-500/15 rounded-2xl p-5 space-y-3">
                <p className="text-sm text-stone-300 leading-relaxed">
                  This next step explores where your relational patterns may have started — including childhood and family experiences. This can bring up strong feelings.
                </p>
                <p className="text-xs text-stone-500">
                  If you're working with a therapist, this is good material to bring to them. If strong feelings arise, you can always save and return later.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button onClick={() => setOriginGateAcknowledged(true)}
                  className="w-full px-4 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-serif min-h-[44px] transition-all shadow-lg shadow-rose-900/20">
                  I'm ready to continue
                </button>
                <button onClick={() => { saveDraft(draft); onClose(); }}
                  className="w-full px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs min-h-[44px] transition-all">
                  Save &amp; come back later
                </button>
                <button onClick={() => setStep('GROUND')}
                  className="w-full px-4 py-2 text-stone-500 hover:text-stone-300 rounded-xl text-xs min-h-[44px] transition-all">
                  Skip this step
                </button>
              </div>
            </div>
          );
        }
        return (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <div className="inline-block text-rose-400/60 mb-2"><Compass size={40} /></div>
              <h2 className="text-2xl font-serif font-light text-stone-100 mb-1">The Origin</h2>
              <p className="text-sm text-stone-400 max-w-md mx-auto">Where did this pattern come from? What is it protecting you from?</p>
            </div>

            <FieldTextarea
              label="How has this pattern been useful or protective?"
              value={draft.originUsefulness}
              onChange={(val) => { saveDraft({ ...draft, originUsefulness: val }); setCrisisLevel(detectCrisisLevel(val)); }}
              placeholder="What does this pattern allow or help you do?"
              rows={3}
            />
            <FieldTextarea
              label="Where did you learn this?"
              value={draft.originSource}
              onChange={(val) => { saveDraft({ ...draft, originSource: val }); setCrisisLevel(detectCrisisLevel(val)); }}
              placeholder="What relationship or experience taught you this pattern?"
              rows={3}
            />
            <FieldTextarea
              label="What would happen if you stopped?"
              value={draft.originProtection}
              onChange={(val) => { saveDraft({ ...draft, originProtection: val }); setCrisisLevel(detectCrisisLevel(val)); }}
              placeholder="What would happen if you didn't enact this pattern? What are you protecting against?"
              rows={3}
            />
          </div>
        );

      case 'GROUND':
        return (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <div className="inline-block text-rose-400/60 mb-3"><DyadBridgeIcon size={44} /></div>
              <h2 className="text-2xl font-serif font-light text-stone-100 mb-1">Pause & Ground</h2>
              <p className="text-sm text-stone-400 max-w-md mx-auto">Before moving into action, take a moment to arrive in your body.</p>
            </div>
            <div className="bg-stone-900/60 border border-rose-500/15 rounded-2xl p-6 space-y-4 text-center">
              <div className="space-y-3 max-w-xs mx-auto text-left">
                {['Feel your feet on the floor', 'Take 3 slow breaths', 'Notice how your body feels right now'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500/50 shrink-0" />
                    <p className="text-sm text-stone-300">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={() => setStep('MOVE')}
                className="w-full px-4 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-serif min-h-[44px] transition-all shadow-lg shadow-rose-900/20">
                I feel grounded — continue
              </button>
              <button onClick={() => { saveDraft(draft); onClose(); }}
                className="w-full px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs min-h-[44px] transition-all">
                Save &amp; come back later
              </button>
            </div>
          </div>
        );

      case 'MOVE':
        return (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <div className="inline-block text-rose-400/60 mb-2"><MessageSquare size={40} /></div>
              <h2 className="text-2xl font-serif font-light text-stone-100 mb-1">Your Relational Move</h2>
              <p className="text-sm text-stone-400 max-w-md mx-auto">Is there a conversation to have, a boundary to set, a request to express?</p>
            </div>

            <FieldSelect value={draft.relationalMoveType} onChange={v => saveDraft({ ...draft, relationalMoveType: v as any })} placeholder="Select type of move…" options={[
              { value: 'disclosure', label: 'Disclosure (sharing something about myself)' },
              { value: 'request', label: 'Request (asking for something)' },
              { value: 'repair', label: 'Repair (addressing a rupture)' },
              { value: 'agreement', label: 'Agreement (clarifying expectations)' },
            ]} />

            <FieldInput value={draft.relationalRecipient} onChange={v => saveDraft({ ...draft, relationalRecipient: v })} placeholder="Who is this for?" />

            <FieldTextarea value={draft.relationalMessage} onChange={v => saveDraft({ ...draft, relationalMessage: v })} placeholder="Draft your message…" rows={4} />

            {/* AI tools */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Remove Self-Protection', onClick: handleMessageClarify },
                { label: 'Make Shorter', onClick: handleMessageShorten },
                { label: 'Check Blame', onClick: handleBlameCheck },
              ].map(tool => (
                <button key={tool.label} onClick={tool.onClick} disabled={isLoading || !draft.relationalMessage}
                  className="px-3 py-2 text-xs bg-rose-600/80 hover:bg-rose-500 disabled:bg-stone-800 disabled:text-stone-600 text-white rounded-lg transition-all min-h-[36px]">
                  {tool.label}
                </button>
              ))}
            </div>

            {blameCoachingNote && (
              <div className="bg-gradient-to-br from-amber-950/20 to-stone-900/60 border border-amber-500/20 rounded-xl p-4 space-y-2 text-xs">
                <p className="font-semibold text-amber-300">We noticed some blame language.</p>
                <p className="text-amber-200/80">Consider focusing on your feelings and needs:</p>
                <p className="italic text-amber-100">"{blameCoachingNote}"</p>
              </div>
            )}

            <FieldSelect value={draft.messageSentStatus} onChange={v => saveDraft({ ...draft, messageSentStatus: v as any })} options={[
              { value: 'unsent', label: 'Not yet sent' },
              { value: 'sent', label: 'Already sent' },
              { value: 'decided-not-to', label: 'Decided not to send' },
            ]} />

            {draft.messageSentStatus === 'sent' && (
              <FieldTextarea value={draft.sentResponse || ''} onChange={v => saveDraft({ ...draft, sentResponse: v })} placeholder="How did they respond?" rows={3} />
            )}
            {draft.messageSentStatus === 'decided-not-to' && (
              <FieldTextarea value={draft.notSentReason || ''} onChange={v => saveDraft({ ...draft, notSentReason: v })} placeholder="Why did you decide not to send it?" rows={3} />
            )}

            <input type="date" value={draft.deadline} onChange={e => saveDraft({ ...draft, deadline: e.target.value })}
              className="w-full bg-stone-950/80 border border-stone-700/50 text-stone-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 transition-all" />
          </div>
        );

      case 'BLUEPRINT':
        return (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <div className="inline-block text-rose-400/60 mb-3"><PatternMandalaIcon size={44} /></div>
              <h2 className="text-2xl font-serif font-light text-stone-100 mb-1">Your Relational Blueprint</h2>
            </div>

            <div className="bg-gradient-to-br from-stone-900 to-stone-950 border border-rose-500/15 rounded-2xl p-5 space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500/60 mb-1.5">Pattern</p>
                <p className="text-sm text-stone-300 leading-relaxed">{draft.confirmedPattern}</p>
              </div>
              <div className="h-px bg-stone-800" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500/60 mb-1.5">Somatic Signature</p>
                <p className="text-sm text-stone-300">{draft.somaticCues.join(', ') || 'Not specified'}</p>
              </div>
              <div className="h-px bg-stone-800" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500/60 mb-1.5">Pattern Mechanism</p>
                <p className="text-sm text-stone-300 leading-relaxed">{draft.patternMechanismSummary || 'Generating…'}</p>
              </div>
              <div className="h-px bg-stone-800" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500/60 mb-1.5">Relational Strength</p>
                <p className="text-sm text-stone-300 leading-relaxed">{draft.relationalStrengthIdentified || 'Generating…'}</p>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleComplete}
                disabled={isSaving || !!draft.artifactSavedAt}
                className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold bg-rose-500 hover:bg-rose-400 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-rose-900/30"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {isSaving ? 'Saving…' : draft.artifactSavedAt ? 'Blueprint Saved' : 'Save Blueprint to Insights'}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isBlueprintStep = step === 'BLUEPRINT';
  const nextButtonLabel = isBlueprintStep ? 'Done' : currentStepIndex === TOTAL_STEPS - 2 ? 'Synthesize' : 'Continue';

  const handleFrameNext = () => {
    if (isBlueprintStep) {
      clearDraft();
      onClose();
    } else {
      handleNext();
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="fixed inset-0 z-50 flex items-stretch bg-stone-950/95 backdrop-blur-md" role="dialog" aria-modal="true">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-rose-500/4 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-rose-800/5 blur-[80px] rounded-full" />
      </div>

      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-stone-950 border-r border-stone-800/60 p-5">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="text-rose-500/70"><PatternMandalaIcon size={20} /></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Relational</span>
          </div>
          <h1 className="text-lg font-serif font-light text-stone-200 leading-tight">Blueprint<br />Workshop</h1>
        </div>

        <StepRail current={currentStepIndex} />

        {/* Draft info */}
        {draft.confirmedPattern && (
          <div className="mt-auto pt-4 border-t border-stone-800/50 space-y-2">
            <div>
              <p className="text-[10px] text-stone-600 uppercase tracking-widest mb-0.5">Pattern</p>
              <p className="text-xs text-rose-400/80 line-clamp-3">{draft.confirmedPattern.slice(0, 80)}…</p>
            </div>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-5 py-3 border-b border-stone-800/60 shrink-0">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="text-rose-500/60">
              {React.createElement(STEP_META[step].icon, { size: 16 })}
            </div>
            <span className="text-xs text-stone-400 font-serif">{STEP_META[step].label}</span>
          </div>
          <div className="hidden lg:flex items-center gap-2">
            <span className="text-xs text-stone-500">Step {currentStepIndex + 1} of {TOTAL_STEPS}</span>
            <div className="flex gap-1">
              {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                <div key={i} className={`h-0.5 w-5 rounded-full transition-all ${i <= currentStepIndex ? 'bg-rose-500' : 'bg-stone-800'}`} />
              ))}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-stone-500 hover:text-stone-200 hover:bg-stone-800/60 transition-all" aria-label="Close">
            <X size={18} />
          </button>
        </header>

        {/* Scrollable content */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-5 py-8">
            {error && (
              <div className="mb-4 bg-red-950/30 border border-red-700/30 rounded-xl p-3 text-xs text-red-300">{error}</div>
            )}
            {renderStep()}
          </div>
        </div>

        {/* Footer navigation */}
        <footer className="shrink-0 border-t border-stone-800/60 px-5 py-3 flex items-center justify-between bg-stone-950/80">
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0 || isLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-stone-400 hover:text-stone-200 hover:bg-stone-800/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            <ChevronLeft size={16} /> Back
          </button>

          <div className="flex items-center gap-3">
            {step === 'GROUND' ? null : (
              <button
                onClick={handleFrameNext}
                disabled={!canAdvance || isLoading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-rose-900/20">
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : nextButtonLabel}
                {!isLoading && <ChevronRight size={16} />}
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
