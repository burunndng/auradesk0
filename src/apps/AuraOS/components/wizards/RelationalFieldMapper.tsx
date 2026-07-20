import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { X, ChevronRight, ChevronLeft, Save, Loader2, Users, Heart, Eye, Compass } from 'lucide-react';
import { callGrokThenAIJson } from '../../services/ai/aiCore';
import { generateInsightFromSession } from '../../services/insightGenerator';
import { wizardSessionService } from '../../services/wizardSessionService';
import { relationalFieldSynthesisSchema, relationalFieldShadowSchema, type RelationalFieldAnalysis, type RelationshipEntry } from '../../services/ai/wizardSchemas';
import { practices } from '../../constants';
import { RelationalFieldSession } from '../../types';
import { useInsightsContext } from '../../contexts/InsightsContext';
import { useWizardDraft } from '../../hooks/useWizardDraft';
import { detectCrisisLevel, type CrisisLevel } from '../../utils/crisisDetection';
import DyadBridgeIcon from '../visualizations/SacredGeometryIcons/DyadBridgeIcon';
import PatternMandalaIcon from '../visualizations/SacredGeometryIcons/PatternMandalaIcon';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaveSession: (session: RelationalFieldSession) => void;
  draft?: RelationalFieldSession | null;
  insightContext?: any;
  markInsightAsAddressed: (insightId: string, toolType: string, sessionId: string) => void;
  userId: string;
}

const STEPS = [
  { label: 'Welcome', icon: Heart, desc: 'Your relational landscape' },
  { label: 'Map', icon: Users, desc: 'Add your key relationships' },
  { label: 'Analyze', icon: Eye, desc: 'AI reads your relational field' },
  { label: 'Portrait', icon: PatternMandalaIcon, desc: 'Your field portrait' },
  { label: 'Practices', icon: Compass, desc: 'Projections & practices' },
  { label: 'Complete', icon: DyadBridgeIcon, desc: 'Save your map' },
];

const STRAINED_QUALITY_THRESHOLD = 4;
const HIGH_CONFLICT_FREQUENCIES = ['weekly', 'daily'];

const FELT_SENSE_OPTIONS = ['Calm', 'Energized', 'Anxious', 'Safe', 'Challenged', 'Supported', 'Isolated', 'Thriving'];
const ROLE_OPTIONS = ['Caretaker', 'Mediator', 'Challenger', 'Dependent', 'Protector', 'Listener', 'Initiator', 'Peacekeeper'];

const REL_TYPES = [
  { value: 'family', label: 'Family' },
  { value: 'romantic', label: 'Romantic' },
  { value: 'friendship', label: 'Friendship' },
  { value: 'work', label: 'Work' },
  { value: 'community', label: 'Community' },
];

const CONFLICT_OPTIONS = [
  { value: 'rarely', label: 'Rarely' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'daily', label: 'Daily' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepRail({ current }: { current: number }) {
  return (
    <div className="flex flex-col gap-1 py-2">
      {STEPS.map((meta, i) => {
        const Icon = meta.icon;
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${active ? 'bg-rose-500/10 border border-rose-500/20' : done ? 'opacity-60' : 'opacity-30'}`}>
            <div className={`shrink-0 ${active ? 'text-rose-400' : done ? 'text-rose-600' : 'text-stone-600'}`}>
              <Icon size={18} />
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

function ChipSelect({ options, selected, onToggle, single = false }: {
  options: string[]; selected: string[]; onToggle: (v: string) => void; single?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const active = selected.includes(opt);
        return (
          <button key={opt} type="button" onClick={() => onToggle(opt)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 min-h-[36px] ${active
              ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
              : 'bg-stone-900/60 border-stone-700/40 text-stone-400 hover:border-stone-600'
              }`}>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">{children}</p>;
}

function FieldInput({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder: string; type?: string;
}) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full bg-stone-950/80 border border-stone-700/50 text-stone-100 placeholder-stone-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500/30 transition-all" />
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

function IntensitySlider({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <label className="text-xs text-stone-400">{label}</label>
        <span className={`text-xs font-mono font-bold ${value >= 7 ? 'text-red-400' : 'text-rose-400'}`}>{value}/10</span>
      </div>
      <input type="range" min={1} max={10} value={value} onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-stone-800 rounded-full accent-rose-500 cursor-pointer" />
    </div>
  );
}

// ─── Relationship Card (inline in Step 1) ─────────────────────────────────────

function RelationshipFormCard({ rel, onRemove }: {
  rel: RelationshipEntry; onRemove: () => void;
}) {
  return (
    <div className="bg-stone-900/60 border border-rose-500/15 rounded-xl p-4 space-y-1">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-serif font-semibold text-rose-300 text-sm">{rel.name}</p>
          <p className="text-[10px] text-stone-500">
            {rel.type} · Quality {rel.connectionQuality}/10 · Conflict: {rel.conflictFrequency}
          </p>
        </div>
        <button onClick={onRemove} className="text-stone-600 hover:text-rose-400 text-xs transition-colors min-h-[36px] px-2">
          Remove
        </button>
      </div>
      <div className="flex gap-2 flex-wrap mt-1">
        <span className="text-[10px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full border border-rose-500/20">{rel.roleYouPlay}</span>
        <span className="text-[10px] bg-stone-800 text-stone-400 px-2 py-0.5 rounded-full border border-stone-700/30">{rel.feltSense}</span>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const newSession = (): RelationalFieldSession => ({
  id: crypto.randomUUID(),
  date: new Date().toISOString(),
  relationships: [],
  currentStep: 0,
});

const RelationalFieldMapper = memo(({
  isOpen,
  onClose,
  onSaveSession,
  draft: seedDraft,
  insightContext,
  markInsightAsAddressed,
  userId
}: Props) => {
  const { setIntegratedInsights } = useInsightsContext();
  const [draftData, updateDraft, , clearDraft] = useWizardDraft<RelationalFieldSession>(
    'aura-draft-relational-field-mapper',
    seedDraft ?? newSession()
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newRel, setNewRel] = useState<Partial<RelationshipEntry>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [crisisLevel, setCrisisLevel] = useState<CrisisLevel>('none');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [currentStep]);

  if (!isOpen) return null;

  const session = draftData;

  const handleAddRelationship = () => {
    if (newRel.name && newRel.type && newRel.connectionQuality && newRel.conflictFrequency && newRel.feltSense && newRel.roleYouPlay) {
      updateDraft({ relationships: [...session.relationships, newRel as RelationshipEntry] });
      setNewRel({});
    }
  };

  const handleRemoveRelationship = (idx: number) => {
    updateDraft({ relationships: session.relationships.filter((_, i) => i !== idx) });
  };

  const buildSynthesisPrompt = (): string => {
    return `You are an integral psychotherapist analyzing a relational field map.

User's relationships:
${JSON.stringify(session.relationships, null, 2)}

Analyze:
1. What is the dominant role the user plays across these relationships? (caretaker, mediator, challenger, dependent, protector, etc.)
2. What developmental edge is this relational field calling the user toward?

CRITICAL: Respond with ONLY valid JSON (no markdown, no explanation):
{
  "dominantRole": "Caretaker — consistently prioritizes others' emotional needs above their own",
  "developmentalEdge": "Developing the capacity to receive care without deflecting or minimizing"
}`;
  };

  const buildShadowPrompt = (strainedNames: string[]): string => {
    const strainedRels = session.relationships.filter(
      r => r.connectionQuality <= STRAINED_QUALITY_THRESHOLD || HIGH_CONFLICT_FREQUENCIES.includes(r.conflictFrequency)
    );

    return `You are an integral psychotherapist identifying shadow projections and targeted practices.

User's relationships:
${JSON.stringify(session.relationships, null, 2)}

Strained relationships (low quality or high conflict): ${strainedNames.join(', ') || 'none'}

Analyze:
1. Identify 2-3 people/dynamics where the user likely projects disowned parts of themselves. What quality?
2. What attachment tendencies are evident? Frame as tentative reflections using "you may tend toward" language — NOT diagnoses.
3. Which next wizard is most relevant: ifs, 321, golden-shadow, attachment-practice, or relational-blueprint?
4. For each strained relationship, suggest ONE targeted practice.

Strained relationship data: ${JSON.stringify(strainedRels, null, 2)}

CRITICAL: Respond with ONLY valid JSON (no markdown, no explanation):
{
  "projectionTargets": ["Alex — carries the directness you've disowned", "The Manager — carries your disowned ambition"],
  "shadowHypothesis": "You may be projecting your disowned assertiveness onto others, admiring or resenting the directness you suppress in yourself.",
  "attachmentPattern": "anxious",
  "recommendedWizard": "ifs",
  "practicePerStrain": [{"relationship": "Alex", "practice": "IFS: find the part that avoids conflict with Alex"}]
}`;
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const strainedNames = session.relationships
        .filter(r => r.connectionQuality <= STRAINED_QUALITY_THRESHOLD || HIGH_CONFLICT_FREQUENCIES.includes(r.conflictFrequency))
        .map(r => r.name);

      const synthesis = await callGrokThenAIJson('RelationalFieldSynthesis', buildSynthesisPrompt(), undefined, relationalFieldSynthesisSchema);
      const shadow = await callGrokThenAIJson('RelationalFieldShadow', buildShadowPrompt(strainedNames), undefined, relationalFieldShadowSchema);

      const analysis: RelationalFieldAnalysis = {
        dominantRole: synthesis.dominantRole,
        developmentalEdge: synthesis.developmentalEdge,
        projectionTargets: shadow.projectionTargets,
        shadowHypothesis: shadow.shadowHypothesis,
        attachmentPattern: shadow.attachmentPattern,
        recommendedWizard: shadow.recommendedWizard,
        practicePerStrain: shadow.practicePerStrain,
      };

      updateDraft({ analysis });
      setCurrentStep(3);
      setIsLoading(false);
    } catch (e: any) {
      setError(e.message || 'Analysis failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const sessionToSave: RelationalFieldSession = { ...session, currentStep };
      onSaveSession(sessionToSave);
      if (insightContext) {
        markInsightAsAddressed(insightContext.id, 'Relational Field Mapper', session.id);
      }
      const avgQuality = session.relationships.length > 0
        ? (session.relationships.reduce((sum, r) => sum + r.connectionQuality, 0) / session.relationships.length).toFixed(1)
        : 'N/A';
      const relationshipLines = session.relationships.map(r =>
        `  - ${r.name} (${r.type || 'unknown'}): quality ${r.connectionQuality}/10`
      ).join('\n');
      const projectionLines = Array.isArray(session.analysis?.projectionTargets)
        ? session.analysis!.projectionTargets.map((p: any) => `  - ${p.quality} projected onto ${p.target}`).join('\n')
        : '';

      const sessionReport = `# Relational Field Map
${session.relationships.length} relationships mapped. Average connection quality: ${avgQuality}/10

## Relationships
${relationshipLines || 'None recorded'}

## Developmental Edge
${session.analysis?.developmentalEdge || 'Not identified'}

## Primary Relational Pattern
${session.analysis?.attachmentPattern || 'Not identified'}

## Shadow Projections
${projectionLines || 'None identified'}

## Field Portrait
${session.analysis?.shadowHypothesis || 'Not generated'}`;

      const insight = await generateInsightFromSession({
        wizardType: 'Relational Field Mapper',
        sessionId: session.id,
        sessionName: 'Relational Field Mapper',
        sessionReport,
        sessionSummary: session.analysis?.developmentalEdge ?? 'Mapped relational field',
        userId,
        availablePractices: Object.values(practices).flatMap(category =>
          Array.isArray(category) ? category.map(p => ({ id: p.id, name: p.name })) : []
        ),
        dataContext: {
          totalSessions: 1,
          sessionsInLastWeek: 1,
          existingInsights: 0,
        },
      });

      // Persist session to Supabase
      try {
        await wizardSessionService.saveSession({
          user_id: userId,
          session_id: session.id,
          type: 'relational_field_mapper',
          content: session,
          created_at: session.date,
        });
      } catch (sessionErr) {
        console.warn('[RelationalFieldMapper] Failed to save session:', sessionErr);
      }

      setIntegratedInsights(prev => [insight, ...prev]);
      clearDraft();
      onClose();
    } catch (e: any) {
      setError(e.message || 'Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const projectionTargets = Array.isArray(session.analysis?.projectionTargets) ? session.analysis!.projectionTargets : [];
  const practicePerStrain = Array.isArray(session.analysis?.practicePerStrain) ? session.analysis!.practicePerStrain : [];

  // ─── Navigation ─────────────────────────────────────────────────────────────

  const canAdvance = () => {
    if (currentStep === 0) return true;
    if (currentStep === 1) return session.relationships.length >= 1;
    if (currentStep === 2) return false; // auto-transitions
    if (currentStep === 3) return !!session.analysis;
    if (currentStep === 4) return !!session.analysis;
    return false;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (session.relationships.length < 1) {
        setError('Add at least 1 relationship to continue');
        return;
      }
      setCurrentStep(2);
      handleAnalyze();
    } else if (currentStep < STEPS.length - 1) {
      setCurrentStep(s => s + 1);
    }
  };

  // ─── Step Renderers ─────────────────────────────────────────────────────────

  const renderStep0 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-block text-rose-400/60 mb-3"><DyadBridgeIcon size={44} /></div>
        <h2 className="text-2xl font-serif font-light text-stone-100 mb-1">Your Relational Field</h2>
        <p className="text-sm text-stone-400 max-w-md mx-auto leading-relaxed">
          Your relationships form a living system — a field that mirrors your inner world and shapes your growth.
        </p>
      </div>
      <div className="bg-gradient-to-br from-rose-950/25 to-stone-900/60 border border-rose-500/15 rounded-2xl p-5 space-y-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500/60 mb-1.5">What you'll discover</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            'Your dominant relational role',
            'Shadow projections onto others',
            'Possible attachment tendencies',
            'Your developmental edge',
            'Targeted practices per strain',
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-rose-500/50 shrink-0" />
              <p className="text-xs text-stone-300">{item}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs text-stone-600 italic max-w-sm mx-auto">
          This work bridges interior (your shadow) and relational (we) quadrants. Reflections are for self-exploration, not clinical assessment.
        </p>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <div className="inline-block text-rose-400/60 mb-2"><Users size={40} /></div>
        <h2 className="text-2xl font-serif font-light text-stone-100 mb-1">Map Your Relationships</h2>
        <p className="text-sm text-stone-400 max-w-md mx-auto">Add people who matter — family, friends, partners, colleagues.</p>
      </div>

      {/* Add relationship form */}
      <div className="bg-stone-900/60 border border-rose-500/15 rounded-2xl p-5 space-y-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500/60">Add a Relationship</p>

        <FieldInput value={newRel.name || ''} onChange={v => setNewRel(r => ({ ...r, name: v }))} placeholder="Name or pseudonym" />

        <div>
          <SectionLabel>Type</SectionLabel>
          <ChipSelect
            options={REL_TYPES.map(t => t.label)}
            selected={newRel.type ? [REL_TYPES.find(t => t.value === newRel.type)?.label || ''] : []}
            onToggle={v => {
              const type = REL_TYPES.find(t => t.label === v)?.value;
              if (type) setNewRel(r => ({ ...r, type: type as any }));
            }}
            single
          />
        </div>

        <IntensitySlider
          value={newRel.connectionQuality || 5}
          onChange={v => setNewRel(r => ({ ...r, connectionQuality: v }))}
          label="Connection Quality"
        />

        <div>
          <SectionLabel>Conflict Frequency</SectionLabel>
          <ChipSelect
            options={CONFLICT_OPTIONS.map(c => c.label)}
            selected={newRel.conflictFrequency ? [CONFLICT_OPTIONS.find(c => c.value === newRel.conflictFrequency)?.label || ''] : []}
            onToggle={v => {
              const freq = CONFLICT_OPTIONS.find(c => c.label === v)?.value;
              if (freq) setNewRel(r => ({ ...r, conflictFrequency: freq as any }));
            }}
            single
          />
        </div>

        <div>
          <SectionLabel>Felt Sense Around This Person</SectionLabel>
          <ChipSelect
            options={FELT_SENSE_OPTIONS}
            selected={newRel.feltSense ? [newRel.feltSense] : []}
            onToggle={v => setNewRel(r => ({ ...r, feltSense: r.feltSense === v ? '' : v }))}
            single
          />
        </div>

        <div>
          <SectionLabel>Role You Play</SectionLabel>
          <ChipSelect
            options={ROLE_OPTIONS}
            selected={newRel.roleYouPlay ? [newRel.roleYouPlay] : []}
            onToggle={v => setNewRel(r => ({ ...r, roleYouPlay: r.roleYouPlay === v ? '' : v }))}
            single
          />
        </div>

        <button
          onClick={handleAddRelationship}
          disabled={!newRel.name || !newRel.type || !newRel.connectionQuality || !newRel.conflictFrequency || !newRel.feltSense || !newRel.roleYouPlay}
          className="w-full px-4 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-rose-900/20 min-h-[44px]"
        >
          Add Relationship
        </button>
      </div>

      {/* Listed relationships */}
      {session.relationships.length > 0 && (
        <div className="space-y-2">
          <SectionLabel>{session.relationships.length} relationship{session.relationships.length !== 1 ? 's' : ''} mapped</SectionLabel>
          {session.relationships.map((rel, idx) => (
            <RelationshipFormCard key={idx} rel={rel} onRemove={() => handleRemoveRelationship(idx)} />
          ))}
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-5">
      <div className="text-center mb-4">
        <div className="inline-block text-rose-400/60 mb-2"><Eye size={40} /></div>
        <h2 className="text-2xl font-serif font-light text-stone-100 mb-1">Reading Your Field</h2>
        <p className="text-sm text-stone-400 max-w-md mx-auto">Analyzing the patterns across your relational web…</p>
      </div>
      <AiThinking label="Synthesizing your relational field — identifying roles, projections, and developmental edges…" />
    </div>
  );

  const renderStep3 = () => {
    if (!session.analysis) return <AiThinking label="Preparing your field portrait…" />;
    return (
      <div className="space-y-5">
        <div className="text-center mb-4">
          <div className="inline-block text-rose-400/60 mb-2"><PatternMandalaIcon size={44} /></div>
          <h2 className="text-2xl font-serif font-light text-stone-100 mb-1">Your Field Portrait</h2>
        </div>

        <div className="space-y-3">
          <div className="bg-gradient-to-br from-stone-900 to-stone-950 border border-rose-500/15 rounded-2xl p-5 space-y-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500/60 mb-1.5">Dominant Relational Role</p>
              <p className="text-sm text-stone-300 leading-relaxed">{session.analysis.dominantRole}</p>
            </div>
            <div className="h-px bg-stone-800" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500/60 mb-1.5">Developmental Edge</p>
              <p className="text-sm text-stone-300 leading-relaxed">{session.analysis.developmentalEdge}</p>
            </div>
          </div>

          <AiCard label="Shadow Hypothesis" text={session.analysis.shadowHypothesis} />

          <div className="bg-stone-900/60 border border-stone-700/30 rounded-xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Attachment Reflection</p>
            <p className="text-sm text-stone-300 capitalize">{session.analysis.attachmentPattern}</p>
            <p className="text-[10px] text-stone-600 mt-2 italic">This is a self-reflection prompt, not a clinical assessment. Consider exploring with a therapist for more reliable insight.</p>
          </div>
        </div>
      </div>
    );
  };

  const renderStep4 = () => {
    if (!session.analysis) return null;
    return (
      <div className="space-y-5">
        <div className="text-center mb-4">
          <div className="inline-block text-rose-400/60 mb-2"><Compass size={40} /></div>
          <h2 className="text-2xl font-serif font-light text-stone-100 mb-1">Projections & Practices</h2>
          <p className="text-sm text-stone-400 max-w-md mx-auto">What's being mirrored back, and how to work with it.</p>
        </div>

        {/* Projection Targets */}
        <div className="space-y-2">
          <SectionLabel>Projection Targets</SectionLabel>
          {projectionTargets.length > 0 ? projectionTargets.map((target, idx) => (
            <div key={idx} className="bg-stone-900/60 border border-rose-500/15 rounded-xl px-4 py-3 text-sm text-stone-300">
              {target}
            </div>
          )) : (
            <p className="text-xs text-stone-500 italic">No projection targets identified.</p>
          )}
        </div>

        {/* Targeted Practices */}
        <div className="space-y-2">
          <SectionLabel>Targeted Practices</SectionLabel>
          {practicePerStrain.length > 0 ? practicePerStrain.map((item, idx) => (
            <div key={idx} className="bg-gradient-to-br from-rose-950/20 to-stone-900/60 border border-rose-500/15 rounded-xl px-4 py-3">
              <p className="text-[10px] font-bold text-rose-400/70 mb-0.5">{item.relationship}</p>
              <p className="text-sm text-stone-300">{item.practice}</p>
            </div>
          )) : (
            <p className="text-xs text-stone-500 italic">No strained relationships identified — a great sign.</p>
          )}
        </div>

        {/* Recommended Wizard */}
        <div className="bg-stone-900/40 border border-stone-700/30 rounded-xl px-4 py-3 flex items-center gap-3">
          <ChevronRight size={14} className="text-rose-400 shrink-0" />
          <p className="text-sm text-stone-300">
            <span className="text-rose-400/80 font-semibold">Next step:</span>{' '}
            {session.analysis.recommendedWizard === 'ifs' ? 'IFS Session' :
              session.analysis.recommendedWizard === '321' ? '3-2-1 Reflection' :
                session.analysis.recommendedWizard === 'golden-shadow' ? 'Golden Shadow Reclamation' :
                  session.analysis.recommendedWizard === 'relational-blueprint' ? 'Relational Blueprint' :
                    'Attachment Practice'}
          </p>
        </div>
      </div>
    );
  };

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-block text-rose-400/60 mb-3"><DyadBridgeIcon size={44} /></div>
        <h2 className="text-2xl font-serif font-light text-stone-100 mb-2">Relational Field Mapped</h2>
        <p className="text-sm text-stone-400 max-w-md mx-auto leading-relaxed">
          Your relational web has been analyzed. Use the targeted practices to work with the projections and the edge your relationships are revealing.
        </p>
      </div>
      <div className="flex justify-center">
        <button
          onClick={handleComplete}
          disabled={isSaving || crisisLevel === 'high'}
          className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold bg-rose-500 hover:bg-rose-400 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-rose-900/30"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {isSaving ? 'Saving…' : 'Save & Complete'}
        </button>
      </div>
    </div>
  );

  const stepContent = [renderStep0, renderStep1, renderStep2, renderStep3, renderStep4, renderStep5];

  // ─── Render ─────────────────────────────────────────────────────────────────

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
            <div className="text-rose-500/70"><DyadBridgeIcon size={20} /></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Relational</span>
          </div>
          <h1 className="text-lg font-serif font-light text-stone-200 leading-tight">Field<br />Mapper</h1>
        </div>

        <StepRail current={currentStep} />

        {/* Relationship count */}
        {session.relationships.length > 0 && (
          <div className="mt-auto pt-4 border-t border-stone-800/50 space-y-2">
            <div>
              <p className="text-[10px] text-stone-600 uppercase tracking-widest mb-0.5">Relationships</p>
              <p className="text-xs text-rose-400/80">{session.relationships.length} mapped</p>
            </div>
            {session.analysis?.dominantRole && (
              <div>
                <p className="text-[10px] text-stone-600 uppercase tracking-widest mb-0.5">Dominant Role</p>
                <p className="text-xs text-stone-400 truncate">{session.analysis.dominantRole.split('—')[0]?.trim()}</p>
              </div>
            )}
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-5 py-3 border-b border-stone-800/60 shrink-0">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="text-rose-500/60">
              {React.createElement(STEPS[currentStep].icon, { size: 16 })}
            </div>
            <span className="text-xs text-stone-400 font-serif">{STEPS[currentStep].label}</span>
          </div>
          <div className="hidden lg:flex items-center gap-2">
            <span className="text-xs text-stone-500">Step {currentStep + 1} of {STEPS.length}</span>
            <div className="flex gap-1">
              {Array.from({ length: STEPS.length }, (_, i) => (
                <div key={i} className={`h-0.5 w-6 rounded-full transition-all ${i <= currentStep ? 'bg-rose-500' : 'bg-stone-800'}`} />
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
              <div className="mb-4 bg-purple-950/30 border border-purple-700/30 rounded-xl p-3 text-xs text-purple-300">{error}</div>
            )}
            {stepContent[currentStep]?.()}
          </div>
        </div>

        {/* Footer navigation */}
        <footer className="shrink-0 border-t border-stone-800/60 px-5 py-3 flex items-center justify-between bg-stone-950/80">
          <button
            onClick={() => currentStep > 0 && setCurrentStep(s => s - 1)}
            disabled={currentStep === 0 || isLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-stone-400 hover:text-stone-200 hover:bg-stone-800/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            <ChevronLeft size={16} /> Back
          </button>

          <div className="flex items-center gap-3">
            {currentStep === 5 ? null : (
              <button
                onClick={handleNext}
                disabled={!canAdvance() || isLoading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-rose-900/20">
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : currentStep === 1 ? 'Analyze Field' : 'Continue'}
                {!isLoading && <ChevronRight size={16} />}
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
});

RelationalFieldMapper.displayName = 'RelationalFieldMapper';
export default RelationalFieldMapper;
