import React, { useState, useEffect, useRef, memo } from 'react';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { callGrokThenAIJson } from '../../services/ai/aiCore';
import { generateInsightFromSession } from '../../services/insightGenerator';
import { architectureAuditSchema, type ArchitectureAudit } from '../../services/ai/wizardSchemas';
import { practices } from '../../constants';
import { LifeArchSession } from '../../types';
import { useInsightsContext } from '../../contexts/InsightsContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaveSession: (session: LifeArchSession) => void;
  draft?: LifeArchSession | null;
  insightContext?: any;
  markInsightAsAddressed: (insightId: string, toolType: string, sessionId: string) => void;
  userId: string;
}

const STEP_LABELS = [
  'Introduction',
  'Core Values',
  'Time Audit',
  'Environment',
  'Roles',
  'Energy',
  'Friction & Vision',
  'Analysis',
  'Results',
  'Complete',
];

const TIME_DOMAINS = [
  'Deep Work / Craft',
  'Shallow Work / Admin',
  'Relationships / Family',
  'Health / Movement',
  'Rest / Recovery',
  'Learning / Growth',
  'Play / Creativity',
  'Service / Community',
];

const VALUE_OPTIONS = [
  'Freedom', 'Depth', 'Contribution', 'Mastery', 'Connection',
  'Security', 'Adventure', 'Creativity', 'Integrity', 'Presence', 'Growth', 'Service',
];

const DIGITAL_FRICTIONS = [
  'Notifications', 'Doomscrolling', 'Inbox anxiety', 'Screen time',
  'Fragmented attention', 'App switching',
];

const ENERGY_DRAIN_OPTIONS = [
  'Meetings', 'Small Talk', 'Admin', 'Conflict', 'Noise', 'Clutter',
  'Interruptions', 'Deadlines', 'Comparison', 'Social media', 'News', 'Indecision',
];

const ENERGY_SOURCE_OPTIONS = [
  'Deep Work', 'Solitude', 'Nature', 'Collaboration', 'Movement', 'Creativity',
  'Music', 'Reading', 'Ritual', 'Teaching', 'Play', 'Stillness',
];

const ROLE_OPTIONS = [
  'Parent', 'Partner', 'Professional', 'Friend', 'Creator',
  'Caregiver', 'Student', 'Community member',
];

const WILLING_TO_CHANGE_OPTIONS = [
  'Schedule', 'Relationships', 'Environment', 'Commitments', 'Habits',
  'Technology use', 'Work structure', 'Living situation',
];

const LOADING_PHRASES = [
  'Mapping your structural patterns...',
  'Identifying value-behavior gaps...',
  'Designing your redesign targets...',
  'Analyzing energy architecture...',
  'Evaluating role alignment...',
  'Synthesizing time allocation...',
];

const newSession = (): LifeArchSession => ({
  id: crypto.randomUUID(),
  date: new Date().toISOString(),
  currentStep: 0,
  timeActual: Object.fromEntries(TIME_DOMAINS.map(d => [d, 0])),
  timeIdeal: Object.fromEntries(TIME_DOMAINS.map(d => [d, 0])),
  envPhysical: { workspace_focus: 3, home_restfulness: 3, nature_access: 3 },
  envSocialContacts: [
    { name: '', energy: 'neutral' },
    { name: '', energy: 'neutral' },
    { name: '', energy: 'neutral' },
  ],
  envDigitalFrictions: [],
  activeRoles: [],
  commitments: [{ text: '', status: 'neutral' }, { text: '', status: 'neutral' }, { text: '', status: 'neutral' }],
  energyDrains: [],
  energySources: [],
  overallEnergyBalance: 5,
  frictionPoints: ['', '', ''],
  willingToChange: [],
});

// ─── Sub-components ───────────────────────────────────────────────────────────

const Chip = ({
  label, selected, onClick,
}: { label: string; selected: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
      selected
        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
        : 'border-stone-700/50 bg-stone-900/40 text-stone-400 hover:border-stone-600'
    }`}
  >
    {label}
  </button>
);

const SliderField = ({
  label, value, onChange, min = 1, max = 10, leftLabel, rightLabel,
}: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; leftLabel?: string; rightLabel?: string;
}) => (
  <div className="space-y-1.5">
    <div className="flex justify-between items-center">
      <span className="text-sm text-stone-300">{label}</span>
      <span className="text-emerald-400 font-semibold text-sm w-6 text-center">{value}</span>
    </div>
    {(leftLabel || rightLabel) && (
      <div className="flex justify-between text-xs text-stone-500">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    )}
    <input
      type="range" min={min} max={max} value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="w-full accent-emerald-500 h-1.5"
    />
  </div>
);

const Textarea = ({
  value, onChange, placeholder, rows = 3,
}: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) => (
  <textarea
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    rows={rows}
    className="w-full bg-stone-900/50 border border-stone-700/40 rounded-lg px-4 py-3 text-stone-200 text-sm
      placeholder-stone-600 resize-none focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/15"
  />
);

const SectionBox = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-stone-900/30 border border-stone-700/30 rounded-2xl p-6 sm:p-8 ${className}`}>
    {children}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const LifeArchitectureWizard = memo(({
  isOpen, onClose, onSaveSession, draft, insightContext, markInsightAsAddressed, userId,
}: Props) => {
  const { setIntegratedInsights } = useInsightsContext();
  const [session, setSession] = useState<LifeArchSession>(() => draft ?? newSession());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingPhrase, setLoadingPhrase] = useState(0);
  const [activeResultSection, setActiveResultSection] = useState(0);
  const phraseRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // All hooks before early return
  useEffect(() => {
    if (draft) setSession(draft);
  }, [draft]);

  useEffect(() => {
    if (session.currentStep === 7) {
      phraseRef.current = setInterval(() => {
        setLoadingPhrase(p => (p + 1) % LOADING_PHRASES.length);
      }, 2000);
    } else {
      if (phraseRef.current) clearInterval(phraseRef.current);
    }
    return () => { if (phraseRef.current) clearInterval(phraseRef.current); };
  }, [session.currentStep]);

  if (!isOpen) return null;

  const step = session.currentStep;
  const totalSteps = STEP_LABELS.length;
  const progressPct = (step / (totalSteps - 1)) * 100;

  const upd = (patch: Partial<LifeArchSession>) =>
    setSession(s => ({ ...s, ...patch }));

  // ── Step navigation ──────────────────────────────────────────────────────

  const goNext = async () => {
    if (step === 6) {
      await handleAnalyze();
    } else if (step === 8) {
      await handleComplete();
    } else {
      upd({ currentStep: Math.min(step + 1, totalSteps - 1) });
    }
  };

  const goBack = () => upd({ currentStep: Math.max(step - 1, 0) });

  // ── AI call ──────────────────────────────────────────────────────────────

  const buildPrompt = (): string => {
    const actual = session.timeActual ?? {};
    const ideal = session.timeIdeal ?? {};
    const roles = session.activeRoles ?? [];
    const commits = session.commitments ?? [];

    return `You are a behavioral design expert analyzing life architecture using AQAL Integral framework.

USER'S CORE VALUES (ranked):
${(session.rankedValues ?? []).join(' > ')}

What they want their life to be about: "${session.valuePurpose ?? ''}"
Where values are honored vs. contradicted: "${session.valueConflictNotes ?? ''}"

TIME AUDIT (actual vs. ideal hours/week):
${TIME_DOMAINS.map(d => `- ${d}: Actual ${actual[d] ?? 0}h, Ideal ${ideal[d] ?? 0}h (delta: ${(ideal[d] ?? 0) - (actual[d] ?? 0) > 0 ? '+' : ''}${(ideal[d] ?? 0) - (actual[d] ?? 0)}h)`).join('\n')}
Most painful gap: "${session.timePainNotes ?? ''}"

ENVIRONMENT:
Physical (1-5): Workspace focus ${session.envPhysical?.workspace_focus ?? 3}, Home restfulness ${session.envPhysical?.home_restfulness ?? 3}, Nature access ${session.envPhysical?.nature_access ?? 3}
Digital frictions: ${(session.envDigitalFrictions ?? []).join(', ') || 'none'}
Social contacts: ${(session.envSocialContacts ?? []).filter(c => c.name).map(c => `${c.name} (${c.energy})`).join(', ') || 'none listed'}
Worst environmental friction: "${session.envWorstFriction ?? ''}"

ROLES & COMMITMENTS:
${roles.map(r => `- ${r.name}: Alignment ${r.alignment}/10, Energy Cost ${r.energyCost}/10, ${r.chosen ? 'Chosen' : 'Inherited'}`).join('\n') || 'None rated'}
Commitments: ${commits.filter(c => c.text).map(c => `"${c.text}" (${c.status})`).join('; ') || 'none'}
Most misaligned role: "${session.roleConflictNotes ?? ''}"

ENERGY ARCHITECTURE:
Chronotype: ${session.chronotype ?? 'not specified'}
Peak energy window: ${session.peakEnergyWindow ?? 'not specified'}
Drains: ${(session.energyDrains ?? []).join(', ') || 'none'}
Sources: ${(session.energySources ?? []).join(', ') || 'none'}
Overall balance: ${session.overallEnergyBalance ?? 5}/10
Energy theft issue: "${session.energyTheftNotes ?? ''}"

FRICTION & VISION:
Top frictions: ${(session.frictionPoints ?? []).filter(Boolean).map((f, i) => `${i + 1}. ${f}`).join('; ')}
1-year vision: "${session.oneYearVision ?? ''}"
Willing to change: ${(session.willingToChange ?? []).join(', ') || 'nothing yet'}
Non-negotiable: "${session.nonNegotiable ?? ''}"

Analyze this life architecture comprehensively. Provide:
1. Value-behavior gaps (where stated values contradict actual time/role/energy data)
2. Energy architecture analysis (drains, sources, chronotype alignment)
3. Time redesign recommendations per domain
4. Role clarity (reinvest/renegotiate/release/honor each active role)
5. Environment changes ranked by impact
6. Friction dissolution interventions
7. 90-day redesign stack (prioritized 3-5 structural changes)
8. Practice alignment (which AOS practices serve this redesign)
9. A closing reflection (2-3 sentences, grounded and direct)

CRITICAL: Respond with ONLY valid JSON (no markdown, no explanation):
{
  "valueBehaviorGaps": [{"value": "Freedom", "contradiction": "Spends 30h/week in admin tasks with no deep work blocks", "severity": "high"}],
  "energyArchitecture": {"primaryDrains": ["Meetings", "Indecision"], "primarySources": ["Deep Work", "Nature"], "chronotypeAlignment": "Night owl scheduling morning obligations creates structural sleep debt", "overallAssessment": "Energy is being systematically harvested by low-value activities"},
  "timeRedesign": [{"domain": "Deep Work / Craft", "currentHours": 5, "recommendedHours": 15, "rationale": "Primary value of Mastery requires sustained uninterrupted blocks"}],
  "roleClarity": [{"role": "Professional", "recommendation": "renegotiate", "note": "High energy cost relative to alignment suggests scope creep or misfit"}],
  "environmentChanges": [{"change": "Establish a notification-free morning block", "impactLevel": "high", "implementation": "Phone in another room until 10am, email only after noon"}],
  "frictionDissolution": [{"friction": "Can't find focus time", "intervention": "Pre-schedule 3 deep work blocks weekly as non-negotiable appointments"}],
  "redesignStack": [{"change": "Protect 3 morning deep work blocks per week", "priority": 1, "timeframe": "This week", "successIndicator": "10+ hours deep work logged by week 4"}],
  "practiceStackAlignment": [{"practiceId": "meditation", "supported": false, "note": "No morning structure currently; adding this first would anchor the day"}],
  "closingReflection": "Your architecture is working — against you. The gap between what you value and how your time is actually structured is wide enough to explain most of the friction you feel. The redesign starts with reclaiming your mornings."
}`;
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    upd({ currentStep: 7 });
    try {
      const result = await callGrokThenAIJson('LifeArchitectureWizard', buildPrompt(), undefined, architectureAuditSchema);
      setSession(s => ({ ...s, audit: result, currentStep: 8 }));
    } catch (e: any) {
      setError(e.message || 'Analysis failed. Please try again.');
      upd({ currentStep: 6 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    setIsSaving(true);
    setError(null);
    try {
      onSaveSession(session);
      if (insightContext) {
        markInsightAsAddressed(insightContext.id, 'Life Architecture Wizard', session.id);
      }
      const insight = await generateInsightFromSession({
        wizardType: 'Life Architecture Wizard',
        sessionId: session.id,
        sessionName: 'Life Architecture Wizard',
        sessionReport: JSON.stringify({ audit: session.audit, values: session.rankedValues, vision: session.oneYearVision }),
        sessionSummary: session.audit?.redesignStack?.slice(0, 3).map(r => r.change).join('; ')
          ?? session.oneYearVision
          ?? 'Life architecture analyzed',
        userId,
        dataContext: {
          totalSessions: 1,
          sessionsInLastWeek: 1,
          existingInsights: 0,
        },
        availablePractices: Object.values(practices).flatMap(category =>
          Array.isArray(category) ? category.map((p: any) => ({ id: p.id, name: p.name })) : []
        ),
      });
      setIntegratedInsights(prev => [insight, ...prev]);
      upd({ currentStep: 9 });
    } catch (e: any) {
      setError(e.message || 'Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Render helpers ────────────────────────────────────────────────────────

  const toggleChip = (list: string[], item: string): string[] =>
    list.includes(item) ? list.filter(x => x !== item) : [...list, item];

  const audit = session.audit;

  const RESULT_SECTIONS = [
    { label: 'Values', key: 'values' },
    { label: 'Energy', key: 'energy' },
    { label: 'Time', key: 'time' },
    { label: 'Roles', key: 'roles' },
    { label: 'Environment', key: 'environment' },
    { label: 'Friction', key: 'friction' },
    { label: '90-Day Stack', key: 'stack' },
    { label: 'Practices', key: 'practices' },
  ];

  const severityColor = (s: string) =>
    s === 'high' ? 'text-rose-400' : s === 'medium' ? 'text-amber-400' : 'text-stone-400';

  const impactBadge = (level: string) => {
    const base = 'text-xs px-2 py-0.5 rounded-full';
    if (level === 'high') return `${base} bg-emerald-500/15 text-emerald-300`;
    if (level === 'medium') return `${base} bg-amber-500/15 text-amber-300`;
    return `${base} bg-stone-700/50 text-stone-400`;
  };

  const recoBadge = (r: string) => {
    const base = 'text-xs px-2 py-0.5 rounded-full font-medium';
    if (r === 'reinvest') return `${base} bg-emerald-500/15 text-emerald-300`;
    if (r === 'renegotiate') return `${base} bg-amber-500/15 text-amber-300`;
    if (r === 'release') return `${base} bg-rose-500/15 text-rose-300`;
    return `${base} bg-stone-700/50 text-stone-400`;
  };

  // ── Steps ─────────────────────────────────────────────────────────────────

  const renderStep = () => {
    switch (step) {
      // ── Step 0: Introduction ────────────────────────────────────────────
      case 0:
        return (
          <SectionBox>
            <h2 className="font-serif text-2xl text-emerald-300 mb-3">Life Architecture Audit</h2>
            <p className="text-stone-300 mb-5 leading-relaxed">
              A structural audit of how your life is actually designed — versus how you want it to be.
            </p>
            <div className="border-l-2 border-emerald-500/30 pl-4 mb-6">
              <p className="text-stone-400 text-sm italic leading-relaxed">
                AQAL Its-quadrant: Outer structures shape inner possibility. Environment, roles, and energy patterns
                are the hidden curriculum of development — most people redesign their psychology while leaving their
                architecture unchanged.
              </p>
            </div>
            <p className="text-stone-400 text-sm mb-4">This audit covers 6 dimensions:</p>
            <ul className="space-y-2 text-sm text-stone-300">
              {['Core values vs. actual behavior', 'Time allocation (actual vs. ideal)', 'Physical, digital & social environment',
                'Life roles and commitments', 'Energy patterns and chronotype', 'Key frictions and your 1-year vision'].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-stone-500 text-xs mt-6 italic">
              Small structural changes often yield the largest developmental gains.
            </p>
          </SectionBox>
        );

      // ── Step 1: Values ──────────────────────────────────────────────────
      case 1:
        return (
          <div className="space-y-5">
            <SectionBox>
              <h3 className="font-serif text-lg text-emerald-300 mb-1">What actually matters to you</h3>
              <p className="text-stone-500 text-xs mb-4">Not what should — what does.</p>
              <Textarea
                value={session.valuePurpose ?? ''}
                onChange={v => upd({ valuePurpose: v })}
                placeholder="What do you most want your life to be about? (2–3 sentences)"
                rows={3}
              />
            </SectionBox>

            <SectionBox>
              <p className="text-stone-300 text-sm mb-3">Select your top 5 values (click to select, order matters):</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {VALUE_OPTIONS.map(v => {
                  const ranked = session.rankedValues ?? [];
                  const idx = ranked.indexOf(v);
                  const selected = idx !== -1;
                  return (
                    <button
                      key={v}
                      onClick={() => {
                        const current = session.rankedValues ?? [];
                        if (selected) {
                          upd({ rankedValues: current.filter(x => x !== v) });
                        } else if (current.length < 5) {
                          upd({ rankedValues: [...current, v] });
                        }
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        selected
                          ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                          : 'border-stone-700/50 bg-stone-900/40 text-stone-400 hover:border-stone-600'
                      }`}
                    >
                      {selected && <span className="text-emerald-400 mr-1">{idx + 1}.</span>}
                      {v}
                    </button>
                  );
                })}
              </div>
              {(session.rankedValues ?? []).length > 0 && (
                <p className="text-xs text-stone-500">
                  Ranked: {(session.rankedValues ?? []).join(' → ')}
                </p>
              )}
            </SectionBox>

            <SectionBox>
              <Textarea
                value={session.valueConflictNotes ?? ''}
                onChange={v => upd({ valueConflictNotes: v })}
                placeholder="Where does your life currently honor these values? Where does it contradict them?"
                rows={3}
              />
            </SectionBox>
          </div>
        );

      // ── Step 2: Time Audit ──────────────────────────────────────────────
      case 2: {
        const actual = session.timeActual ?? {};
        const ideal = session.timeIdeal ?? {};
        return (
          <div className="space-y-5">
            <SectionBox>
              <h3 className="font-serif text-lg text-emerald-300 mb-1">Where your time goes</h3>
              <p className="text-stone-500 text-xs mb-4">Hours per week in each domain — set current reality, then target</p>
              {/* Column headers */}
              <div className="grid grid-cols-2 gap-3 mb-1 pl-0 pr-0">
                <p className="text-[10px] uppercase tracking-widest text-rose-400/60 font-mono text-center">Current</p>
                <p className="text-[10px] uppercase tracking-widest text-emerald-400/60 font-mono text-center">Target</p>
              </div>
              <div className="space-y-5">
                {TIME_DOMAINS.map(domain => {
                  const a = actual[domain] ?? 0;
                  const id = ideal[domain] ?? 0;
                  const delta = id - a;
                  return (
                    <div key={domain}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-stone-300">{domain}</span>
                        {delta !== 0 && (
                          <span className={`text-xs font-medium ${delta > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {delta > 0 ? '+' : ''}{delta}h
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-stone-500 mb-1">Actual</p>
                          <input
                            type="range" min={0} max={40} value={a}
                            onChange={e => upd({ timeActual: { ...actual, [domain]: Number(e.target.value) } })}
                            className="w-full accent-rose-500 h-1.5"
                          />
                          <p className="text-xs text-stone-400 text-right">{a}h</p>
                        </div>
                        <div>
                          <p className="text-xs text-stone-500 mb-1">Ideal</p>
                          <input
                            type="range" min={0} max={40} value={id}
                            onChange={e => upd({ timeIdeal: { ...ideal, [domain]: Number(e.target.value) } })}
                            className="w-full accent-emerald-500 h-1.5"
                          />
                          <p className="text-xs text-stone-400 text-right">{id}h</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionBox>
            <SectionBox>
              <Textarea
                value={session.timePainNotes ?? ''}
                onChange={v => upd({ timePainNotes: v })}
                placeholder="Where is the gap between actual and ideal most painful?"
                rows={2}
              />
            </SectionBox>
          </div>
        );
      }

      // ── Step 3: Environment ─────────────────────────────────────────────
      case 3: {
        const phys = session.envPhysical ?? {};
        const contacts = session.envSocialContacts ?? [];
        return (
          <div className="space-y-5">
            <SectionBox>
              <h3 className="font-serif text-lg text-emerald-300 mb-1">Physical environment</h3>
              <div className="space-y-4 mt-4">
                {[
                  { key: 'workspace_focus', label: 'Workspace focus quality' },
                  { key: 'home_restfulness', label: 'Home restfulness' },
                  { key: 'nature_access', label: 'Nature access' },
                ].map(({ key, label }) => (
                  <SliderField
                    key={key}
                    label={label}
                    value={phys[key] ?? 3}
                    onChange={v => upd({ envPhysical: { ...phys, [key]: v } })}
                    min={1} max={5}
                    leftLabel="Poor" rightLabel="Excellent"
                  />
                ))}
              </div>
            </SectionBox>

            <SectionBox>
              <h3 className="font-serif text-sm text-stone-300 mb-3">Digital frictions</h3>
              <div className="flex flex-wrap gap-2">
                {DIGITAL_FRICTIONS.map(f => (
                  <Chip
                    key={f}
                    label={f}
                    selected={(session.envDigitalFrictions ?? []).includes(f)}
                    onClick={() => upd({ envDigitalFrictions: toggleChip(session.envDigitalFrictions ?? [], f) })}
                  />
                ))}
              </div>
            </SectionBox>

            <SectionBox>
              <h3 className="font-serif text-sm text-stone-300 mb-3">Social environment — top 3 people you spend time with</h3>
              <div className="space-y-3">
                {contacts.map((c, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <input
                      type="text"
                      value={c.name}
                      onChange={e => {
                        const next = [...contacts];
                        next[i] = { ...c, name: e.target.value };
                        upd({ envSocialContacts: next });
                      }}
                      placeholder={`Person ${i + 1}`}
                      className="flex-1 bg-stone-900/50 border border-stone-700/40 rounded-lg px-3 py-2 text-sm text-stone-200
                        placeholder-stone-600 focus:outline-none focus:border-emerald-500/40"
                    />
                    <div className="flex gap-1">
                      {(['draining', 'neutral', 'energizing'] as const).map(e => (
                        <button
                          key={e}
                          onClick={() => {
                            const next = [...contacts];
                            next[i] = { ...c, energy: e };
                            upd({ envSocialContacts: next });
                          }}
                          className={`px-2 py-1 rounded text-xs transition-all ${
                            c.energy === e
                              ? e === 'draining' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : e === 'energizing' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-stone-700/50 text-stone-300 border border-stone-600'
                              : 'bg-stone-900/30 text-stone-500 border border-stone-800 hover:border-stone-600'
                          }`}
                        >
                          {e === 'draining' ? '−' : e === 'energizing' ? '+' : '∘'}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </SectionBox>

            <SectionBox>
              <Textarea
                value={session.envWorstFriction ?? ''}
                onChange={v => upd({ envWorstFriction: v })}
                placeholder="What in your environment most consistently works against you?"
                rows={2}
              />
            </SectionBox>
          </div>
        );
      }

      // ── Step 4: Roles ───────────────────────────────────────────────────
      case 4: {
        const roles = session.activeRoles ?? [];
        const commits = session.commitments ?? [];
        return (
          <div className="space-y-5">
            <SectionBox>
              <h3 className="font-serif text-lg text-emerald-300 mb-1">Roles you carry</h3>
              <div className="space-y-4 mt-4">
                {ROLE_OPTIONS.map(roleName => {
                  const existing = roles.find(r => r.name === roleName);
                  return (
                    <div key={roleName} className="border border-stone-700/30 rounded-xl p-4">
                      <label className="flex items-center gap-3 cursor-pointer mb-3">
                        <input
                          type="checkbox"
                          checked={!!existing}
                          onChange={e => {
                            if (e.target.checked) {
                              upd({ activeRoles: [...roles, { name: roleName, alignment: 5, energyCost: 5, chosen: true }] });
                            } else {
                              upd({ activeRoles: roles.filter(r => r.name !== roleName) });
                            }
                          }}
                          className="accent-emerald-500 w-4 h-4"
                        />
                        <span className="text-stone-200 font-medium">{roleName}</span>
                      </label>
                      {existing && (
                        <div className="space-y-3 pl-7">
                          <SliderField
                            label="Alignment"
                            value={existing.alignment}
                            onChange={v => upd({ activeRoles: roles.map(r => r.name === roleName ? { ...r, alignment: v } : r) })}
                            leftLabel="Misaligned" rightLabel="Perfect fit"
                          />
                          <SliderField
                            label="Energy cost"
                            value={existing.energyCost}
                            onChange={v => upd({ activeRoles: roles.map(r => r.name === roleName ? { ...r, energyCost: v } : r) })}
                            leftLabel="Gives energy" rightLabel="Drains heavily"
                          />
                          <div className="flex gap-2 items-center">
                            <span className="text-xs text-stone-400">This role is</span>
                            {(['chosen', 'inherited'] as const).map(type => (
                              <button
                                key={type}
                                onClick={() => upd({ activeRoles: roles.map(r => r.name === roleName ? { ...r, chosen: type === 'chosen' } : r) })}
                                className={`px-2 py-1 rounded text-xs border transition-all ${
                                  (type === 'chosen') === existing.chosen
                                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                                    : 'border-stone-700/50 text-stone-500 hover:border-stone-600'
                                }`}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </SectionBox>

            <SectionBox>
              <h3 className="font-serif text-sm text-stone-300 mb-3">Current commitments</h3>
              <div className="space-y-3">
                {commits.map((c, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={c.text}
                      onChange={e => {
                        const next = [...commits];
                        next[i] = { ...c, text: e.target.value };
                        upd({ commitments: next });
                      }}
                      placeholder={`Commitment ${i + 1}`}
                      className="flex-1 bg-stone-900/50 border border-stone-700/40 rounded-lg px-3 py-2 text-sm text-stone-200
                        placeholder-stone-600 focus:outline-none focus:border-emerald-500/40"
                    />
                    <div className="flex gap-1">
                      {(['energizing', 'neutral', 'draining', 'drop'] as const).map(s => (
                        <button
                          key={s}
                          onClick={() => {
                            const next = [...commits];
                            next[i] = { ...c, status: s };
                            upd({ commitments: next });
                          }}
                          title={s}
                          className={`px-2 py-1 rounded text-xs transition-all border ${
                            c.status === s
                              ? s === 'energizing' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : s === 'draining' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : s === 'drop' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                : 'bg-stone-700/50 text-stone-300 border-stone-600'
                              : 'bg-stone-900/30 text-stone-500 border-stone-800 hover:border-stone-600'
                          }`}
                        >
                          {s === 'energizing' ? '+' : s === 'draining' ? '−' : s === 'drop' ? '✕' : '∘'}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => upd({ commitments: [...commits, { text: '', status: 'neutral' }] })}
                  className="text-xs text-stone-500 hover:text-stone-300 transition-colors"
                >
                  + Add commitment
                </button>
              </div>
            </SectionBox>

            <SectionBox>
              <Textarea
                value={session.roleConflictNotes ?? ''}
                onChange={v => upd({ roleConflictNotes: v })}
                placeholder="Which role or commitment feels most misaligned with who you're becoming?"
                rows={2}
              />
            </SectionBox>
          </div>
        );
      }

      // ── Step 5: Energy ──────────────────────────────────────────────────
      case 5:
        return (
          <div className="space-y-5">
            <SectionBox>
              <h3 className="font-serif text-lg text-emerald-300 mb-4">Your energy architecture</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-stone-400 mb-2">Chronotype</p>
                  <div className="flex gap-2">
                    {([['early', 'Early bird'], ['middle', 'Middle'], ['night', 'Night owl']] as const).map(([val, label]) => (
                      <button
                        key={val}
                        onClick={() => upd({ chronotype: val })}
                        className={`flex-1 py-2 rounded-lg text-sm border transition-all ${
                          session.chronotype === val
                            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                            : 'border-stone-700/50 text-stone-400 hover:border-stone-600'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-stone-400 mb-2">Peak energy window</p>
                  <div className="flex gap-2">
                    {['Morning', 'Midday', 'Afternoon', 'Evening'].map(w => (
                      <button
                        key={w}
                        onClick={() => upd({ peakEnergyWindow: w })}
                        className={`flex-1 py-2 rounded-lg text-xs border transition-all ${
                          session.peakEnergyWindow === w
                            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                            : 'border-stone-700/50 text-stone-400 hover:border-stone-600'
                        }`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </SectionBox>

            <SectionBox>
              <p className="text-sm text-stone-300 mb-3">Energy drains</p>
              <div className="flex flex-wrap gap-2">
                {ENERGY_DRAIN_OPTIONS.map(d => (
                  <Chip
                    key={d} label={d}
                    selected={(session.energyDrains ?? []).includes(d)}
                    onClick={() => upd({ energyDrains: toggleChip(session.energyDrains ?? [], d) })}
                  />
                ))}
              </div>
            </SectionBox>

            <SectionBox>
              <p className="text-sm text-stone-300 mb-3">Energy sources</p>
              <div className="flex flex-wrap gap-2">
                {ENERGY_SOURCE_OPTIONS.map(s => (
                  <Chip
                    key={s} label={s}
                    selected={(session.energySources ?? []).includes(s)}
                    onClick={() => upd({ energySources: toggleChip(session.energySources ?? [], s) })}
                  />
                ))}
              </div>
            </SectionBox>

            <SectionBox>
              <SliderField
                label="Overall life energy balance"
                value={session.overallEnergyBalance ?? 5}
                onChange={v => upd({ overallEnergyBalance: v })}
                leftLabel="Chronically depleted" rightLabel="Sustainably energized"
              />
            </SectionBox>

            <SectionBox>
              <Textarea
                value={session.energyTheftNotes ?? ''}
                onChange={v => upd({ energyTheftNotes: v })}
                placeholder="What consistently steals your energy in ways you haven't addressed?"
                rows={2}
              />
            </SectionBox>
          </div>
        );

      // ── Step 6: Friction & Vision ────────────────────────────────────────
      case 6: {
        const frictions = session.frictionPoints ?? ['', '', ''];
        return (
          <div className="space-y-5">
            <SectionBox>
              <h3 className="font-serif text-lg text-emerald-300 mb-4">Where you're stuck</h3>
              <div className="space-y-3">
                {frictions.map((f, i) => (
                  <input
                    key={i}
                    type="text"
                    value={f}
                    onChange={e => {
                      const next = [...frictions];
                      next[i] = e.target.value;
                      upd({ frictionPoints: next });
                    }}
                    placeholder={`Friction point ${i + 1} — what keeps getting in the way?`}
                    className="w-full bg-stone-900/50 border border-stone-700/40 rounded-lg px-4 py-3 text-sm text-stone-200
                      placeholder-stone-600 focus:outline-none focus:border-emerald-500/40"
                  />
                ))}
              </div>
            </SectionBox>

            <SectionBox>
              <h3 className="font-serif text-sm text-stone-300 mb-3">1-year vision</h3>
              <Textarea
                value={session.oneYearVision ?? ''}
                onChange={v => upd({ oneYearVision: v })}
                placeholder="If your life were well-designed one year from now, what would be different?"
                rows={4}
              />
            </SectionBox>

            <SectionBox>
              <p className="text-sm text-stone-300 mb-3">What you're willing to change</p>
              <div className="flex flex-wrap gap-2">
                {WILLING_TO_CHANGE_OPTIONS.map(w => (
                  <Chip
                    key={w} label={w}
                    selected={(session.willingToChange ?? []).includes(w)}
                    onClick={() => upd({ willingToChange: toggleChip(session.willingToChange ?? [], w) })}
                  />
                ))}
              </div>
            </SectionBox>

            <SectionBox>
              <Textarea
                value={session.nonNegotiable ?? ''}
                onChange={v => upd({ nonNegotiable: v })}
                placeholder="What feels non-negotiable right now? (optional)"
                rows={2}
              />
            </SectionBox>
          </div>
        );
      }

      // ── Step 7: Loading ─────────────────────────────────────────────────
      case 7:
        return (
          <div className="flex flex-col items-center justify-center min-h-[50dvh] space-y-8">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-2 border-emerald-500/20 animate-pulse" />
              <div className="absolute inset-2 rounded-full border border-emerald-500/40 animate-ping" />
              <div className="absolute inset-4 rounded-full bg-emerald-500/10 animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-emerald-400/60" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-emerald-300 font-serif text-lg">Analyzing</p>
              <p className="text-stone-500 text-sm transition-all duration-500">
                {LOADING_PHRASES[loadingPhrase]}
              </p>
            </div>
          </div>
        );

      // ── Step 8: Results ─────────────────────────────────────────────────
      case 8:
        if (!audit) return <div className="text-stone-500 text-sm">No results yet.</div>;
        return (
          <div className="space-y-4">
            {/* Section tabs */}
            <div className="flex gap-1.5 flex-wrap">
              {RESULT_SECTIONS.map((s, i) => (
                <button
                  key={s.key}
                  onClick={() => setActiveResultSection(i)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    activeResultSection === i
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                      : 'border-stone-700/50 text-stone-500 hover:border-stone-600'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Values */}
            {activeResultSection === 0 && (
              <SectionBox>
                <h3 className="font-serif text-emerald-300 text-lg mb-4">Value-Behavior Gaps</h3>
                <div className="space-y-3">
                  {audit.valueBehaviorGaps.map((g, i) => (
                    <div key={i} className="border border-stone-700/30 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-stone-200 font-medium text-sm">{g.value}</span>
                        <span className={`text-xs font-medium ${severityColor(g.severity)}`}>{g.severity}</span>
                      </div>
                      <p className="text-stone-400 text-sm">{g.contradiction}</p>
                    </div>
                  ))}
                </div>
              </SectionBox>
            )}

            {/* Energy */}
            {activeResultSection === 1 && (
              <SectionBox>
                <h3 className="font-serif text-emerald-300 text-lg mb-4">Energy Architecture</h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-rose-950/30 border border-rose-800/30 rounded-xl p-3">
                    <p className="text-xs text-rose-400 mb-2">Primary drains</p>
                    <ul className="text-rose-300 text-sm space-y-1">
                      {audit.energyArchitecture.primaryDrains.map((d, i) => <li key={i}>— {d}</li>)}
                    </ul>
                  </div>
                  <div className="bg-emerald-950/30 border border-emerald-800/30 rounded-xl p-3">
                    <p className="text-xs text-emerald-400 mb-2">Primary sources</p>
                    <ul className="text-emerald-300 text-sm space-y-1">
                      {audit.energyArchitecture.primarySources.map((s, i) => <li key={i}>— {s}</li>)}
                    </ul>
                  </div>
                </div>
                <div className="bg-stone-900/30 border border-stone-700/30 rounded-xl p-4 space-y-3">
                  <p className="text-stone-400 text-sm"><span className="text-stone-300 font-medium">Chronotype: </span>{audit.energyArchitecture.chronotypeAlignment}</p>
                  <p className="text-stone-400 text-sm">{audit.energyArchitecture.overallAssessment}</p>
                </div>
              </SectionBox>
            )}

            {/* Time */}
            {activeResultSection === 2 && (
              <SectionBox>
                <h3 className="font-serif text-emerald-300 text-lg mb-4">Time Redesign</h3>
                <div className="space-y-3">
                  {audit.timeRedesign.map((t, i) => (
                    <div key={i} className="border border-stone-700/30 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-stone-200 font-medium text-sm">{t.domain}</span>
                        <span className="text-xs text-stone-500">{t.currentHours}h → <span className="text-emerald-400">{t.recommendedHours}h</span></span>
                      </div>
                      <p className="text-stone-400 text-sm">{t.rationale}</p>
                    </div>
                  ))}
                </div>
              </SectionBox>
            )}

            {/* Roles */}
            {activeResultSection === 3 && (
              <SectionBox>
                <h3 className="font-serif text-emerald-300 text-lg mb-4">Role Clarity</h3>
                <div className="space-y-3">
                  {audit.roleClarity.map((r, i) => (
                    <div key={i} className="border border-stone-700/30 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-stone-200 font-medium text-sm">{r.role}</span>
                        <span className={recoBadge(r.recommendation)}>{r.recommendation}</span>
                      </div>
                      <p className="text-stone-400 text-sm">{r.note}</p>
                    </div>
                  ))}
                </div>
              </SectionBox>
            )}

            {/* Environment */}
            {activeResultSection === 4 && (
              <SectionBox>
                <h3 className="font-serif text-emerald-300 text-lg mb-4">Environment Changes</h3>
                <div className="space-y-3">
                  {audit.environmentChanges.map((e, i) => (
                    <div key={i} className="border border-stone-700/30 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-stone-200 font-medium text-sm">{e.change}</span>
                        <span className={impactBadge(e.impactLevel)}>{e.impactLevel} impact</span>
                      </div>
                      <p className="text-stone-400 text-sm">{e.implementation}</p>
                    </div>
                  ))}
                </div>
              </SectionBox>
            )}

            {/* Friction */}
            {activeResultSection === 5 && (
              <SectionBox>
                <h3 className="font-serif text-emerald-300 text-lg mb-4">Friction Dissolvers</h3>
                <div className="space-y-3">
                  {audit.frictionDissolution.map((f, i) => (
                    <div key={i} className="border border-stone-700/30 rounded-xl p-4">
                      <p className="text-stone-300 font-medium text-sm mb-1">{f.friction}</p>
                      <p className="text-stone-400 text-sm">{f.intervention}</p>
                    </div>
                  ))}
                </div>
              </SectionBox>
            )}

            {/* 90-Day Stack */}
            {activeResultSection === 6 && (
              <SectionBox>
                <h3 className="font-serif text-emerald-300 text-lg mb-4">90-Day Redesign Stack</h3>
                <div className="space-y-3">
                  {audit.redesignStack.sort((a, b) => a.priority - b.priority).map((r, i) => (
                    <div key={i} className="border border-emerald-500/20 bg-emerald-500/5 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-emerald-400 font-bold text-sm w-5 shrink-0">{r.priority}.</span>
                        <div className="space-y-1.5">
                          <p className="text-stone-200 font-medium text-sm">{r.change}</p>
                          <p className="text-xs text-stone-500">Timeframe: {r.timeframe}</p>
                          <p className="text-xs text-stone-400">Success: {r.successIndicator}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionBox>
            )}

            {/* Practices */}
            {activeResultSection === 7 && (
              <SectionBox>
                <h3 className="font-serif text-emerald-300 text-lg mb-4">Practice Alignment</h3>
                <div className="space-y-3">
                  {audit.practiceStackAlignment.map((p, i) => (
                    <div key={i} className={`border rounded-xl p-4 ${p.supported ? 'border-emerald-500/20' : 'border-stone-700/30'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${p.supported ? 'bg-emerald-400' : 'bg-stone-600'}`} />
                        <span className="text-stone-300 text-sm font-medium">{p.practiceId}</span>
                      </div>
                      <p className="text-stone-400 text-sm">{p.note}</p>
                    </div>
                  ))}
                </div>
                {audit.closingReflection && (
                  <div className="mt-5 border-t border-stone-700/30 pt-5">
                    <p className="text-stone-300 text-sm italic leading-relaxed">{audit.closingReflection}</p>
                  </div>
                )}
              </SectionBox>
            )}
          </div>
        );

      // ── Step 9: Complete ────────────────────────────────────────────────
      case 9:
        return (
          <SectionBox className="text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
              <Check className="w-6 h-6 text-emerald-400" />
            </div>
            <h2 className="font-serif text-2xl text-emerald-300 mb-3">Architecture mapped.</h2>
            <p className="text-stone-400 text-sm leading-relaxed mb-6">
              Your life architecture is not fixed. It is designed.
            </p>
            {audit && (
              <div className="text-left space-y-2 mb-6">
                <p className="text-xs text-stone-500 uppercase tracking-wider mb-3">Your redesign stack</p>
                {audit.redesignStack.sort((a, b) => a.priority - b.priority).slice(0, 3).map((r, i) => (
                  <div key={i} className="flex gap-2 text-sm">
                    <span className="text-emerald-400 shrink-0">{r.priority}.</span>
                    <span className="text-stone-300">{r.change}</span>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={onClose}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-all min-h-[44px]"
            >
              Close
            </button>
          </SectionBox>
        );

      default:
        return null;
    }
  };

  const isLastStep = step === 8;
  const isAnalyzing = step === 7;
  const isComplete = step === 9;
  const showNav = !isAnalyzing && !isComplete;

  const nextLabel = () => {
    if (step === 6) return 'Begin Analysis';
    if (step === 8) return isSaving ? 'Saving...' : 'Save & Complete';
    return 'Continue';
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/95 backdrop-blur-sm flex flex-col">
      {/* Progress bar */}
      <div className="h-0.5 bg-stone-800 shrink-0">
        <div
          className="h-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 shrink-0 border-b border-stone-800/50">
        <div>
          <p className="text-xs text-stone-500 uppercase tracking-wider">Life Architecture</p>
          <p className="text-sm text-stone-300 font-medium">{STEP_LABELS[step]}</p>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-stone-500 hover:text-stone-300 hover:bg-stone-800/50 transition-all min-h-[44px] min-w-[44px]"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-28">
          {error && (
            <div className="mb-4 p-3 bg-rose-950/40 border border-rose-800/50 rounded-lg text-rose-300 text-sm">
              {error}
            </div>
          )}
          {renderStep()}
        </div>
      </div>

      {/* Navigation */}
      {showNav && (
        <div className="absolute bottom-0 inset-x-0 border-t border-stone-800/50 bg-stone-950/90 backdrop-blur-sm px-4 sm:px-6 py-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
            <button
              onClick={goBack}
              disabled={step === 0}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm text-stone-400 hover:text-stone-200
                disabled:opacity-30 disabled:cursor-not-allowed transition-all min-h-[44px]"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            <div className="flex gap-1">
              {Array.from({ length: totalSteps - 2 }, (_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i < step ? 'bg-emerald-500' : i === step ? 'bg-emerald-400' : 'bg-stone-700'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={goNext}
              disabled={isLoading || isSaving}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-semibold bg-emerald-600
                hover:bg-emerald-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all min-h-[44px]"
            >
              {nextLabel()}
              {!isSaving && !isLastStep && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

LifeArchitectureWizard.displayName = 'LifeArchitectureWizard';
export default LifeArchitectureWizard;
