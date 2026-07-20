import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronRight, ChevronLeft, Save, AlertTriangle, Info, Loader2, ArrowRight } from 'lucide-react';
import { WizardFrame } from '../shared/WizardFrame';
import { v4 as uuidv4 } from 'uuid';
import { detectCrisisLevel, type CrisisLevel } from '../../utils/crisisDetection';
import { callGrokThenAIJson } from '../../services/ai/aiCore';
import { useWizardDraft } from '../../hooks/useWizardDraft';
import {
    originSynthesisSchema, counterModelSchema, realityTunnelIntegrationSchema,
    type OriginSynthesis, type CounterModel, type RealityTunnelIntegration
} from '../../services/ai/wizardSchemas';
import type { RealityTunnelDraft, RealityTunnelSession } from '../../types';
import FocusApertureIcon from '../visualizations/SacredGeometryIcons/FocusApertureIcon';
import EngramArchiveIcon from '../visualizations/SacredGeometryIcons/EngramArchiveIcon';
import DyadBridgeIcon from '../visualizations/SacredGeometryIcons/DyadBridgeIcon';
import SomaticPillarIcon from '../visualizations/SacredGeometryIcons/SomaticPillarIcon';
import EvolutionaryUnfoldingIcon from '../visualizations/SacredGeometryIcons/EvolutionaryUnfoldingIcon';
import PatternMandalaIcon from '../visualizations/SacredGeometryIcons/PatternMandalaIcon';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RealityTunnelWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (session: RealityTunnelSession) => void;
    draft: RealityTunnelDraft | null;
    userId?: string;
}

type ConservationFlag = 'none' | 'protective-tunnel' | 'both-distressed';

const BODY_AREAS = ['Head & Throat', 'Chest & Heart', 'Belly & Gut', 'Hips & Pelvis', 'Limbs', 'Whole Body'];
const SENSATIONS = ['Tight', 'Warm', 'Heavy', 'Open', 'Buzzing', 'Numb', 'Grounded', 'Anxious'];
const DISTRESS_MARKERS = ['Tight', 'Anxious', 'Numb'];

const STEP_META = [
    { label: 'Identify', icon: FocusApertureIcon, desc: 'Name the tunnel you live inside' },
    { label: 'Archaeology', icon: EngramArchiveIcon, desc: 'Trace the belief to its origin' },
    { label: 'Counter-Tunnel', icon: DyadBridgeIcon, desc: 'Construct an alternative map' },
    { label: 'Somatic Check', icon: SomaticPillarIcon, desc: 'Read your body\'s response' },
    { label: 'Synthesis', icon: EvolutionaryUnfoldingIcon, desc: 'Integrate both perspectives' },
    { label: 'Artifact', icon: PatternMandalaIcon, desc: 'Your flexibility report' },
];

const ROUTING_SUGGESTIONS: Record<string, { wizard: string; label: string; slug: string }> = {
    'self-identity': { wizard: 'IFS', label: 'IFS Session', slug: 'ifs' },
    'early-childhood': { wizard: 'Shadow Journaling', label: 'Shadow Journaling', slug: 'shadow-journal' },
    'high': { wizard: 'Polyvagal Trainer', label: 'Polyvagal Trainer', slug: 'polyvagal-trainer' },
};

const SYSTEM_PROMPT = `You are a Model Agnosticism Guide — calm, precise, philosophically grounded. Your lineage is Robert Anton Wilson, not therapy. You help users see their beliefs as one possible map of territory, not the territory itself. You never pathologize beliefs. You hold the inquiry with intellectual rigor and compassionate curiosity. Always respond with valid JSON matching the requested schema.`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeConservationFlag(
    originalSensations: string[], originalIntensity: number,
    counterSensations: string[], counterIntensity: number
): ConservationFlag {
    const origDistress = DISTRESS_MARKERS.some(m => originalSensations.includes(m)) && originalIntensity >= 7;
    const counterDistress = DISTRESS_MARKERS.some(m => counterSensations.includes(m)) && counterIntensity >= 7;
    if (origDistress && counterDistress) return 'both-distressed';
    if (counterDistress && !origDistress) return 'protective-tunnel';
    return 'none';
}

function buildEmptyDraft(): RealityTunnelDraft {
    return {
        belief: '', tunnelName: '', certaintyBefore: 70,
        beliefDuration: '', wrongFeeling: '',
        beliefOriginWhen: '', beliefOriginSource: '', beliefOriginContext: '',
        counterExperience: '', counterArgument: '', counterTunnelName: '',
        originalBodyArea: '', originalSensations: [], originalIntensity: 5,
        counterBodyArea: '', counterSensations: [], counterIntensity: 5,
        conservationFlag: 'none',
        surpriseReflection: '', relationshipShift: '', certaintyAfter: 70,
        originSynthesis: null, counterModel: null, integration: null,
    };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepRail({ current, total }: { current: number; total: number }) {
    return (
        <div className="flex flex-col gap-1 py-2">
            {STEP_META.map((meta, i) => {
                const Icon = meta.icon;
                const done = i < current;
                const active = i === current;
                return (
                    <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${active ? 'bg-amber-500/10 border border-amber-500/20' : done ? 'opacity-60' : 'opacity-30'}`}>
                        <div className={`shrink-0 ${active ? 'text-amber-400' : done ? 'text-amber-600' : 'text-stone-600'}`}>
                            <Icon size={18} />
                        </div>
                        <div className="min-w-0">
                            <p className={`text-xs font-semibold font-serif truncate ${active ? 'text-amber-300' : done ? 'text-stone-400' : 'text-stone-600'}`}>
                                {meta.label}
                            </p>
                            {active && <p className="text-[10px] text-stone-500 leading-tight mt-0.5">{meta.desc}</p>}
                        </div>
                        {done && <div className="ml-auto shrink-0 w-1.5 h-1.5 rounded-full bg-amber-600" />}
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
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 ${active
                            ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                            : 'bg-stone-900/60 border-stone-700/40 text-stone-400 hover:border-stone-600'
                            }`}>
                        {opt}
                    </button>
                );
            })}
        </div>
    );
}

function IntensitySlider({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
    return (
        <div>
            <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs text-stone-400">{label}</label>
                <span className={`text-xs font-mono font-bold ${value >= 7 ? 'text-red-400' : 'text-amber-400'}`}>{value}/10</span>
            </div>
            <input type="range" min={1} max={10} value={value} onChange={e => onChange(Number(e.target.value))}
                className="w-full h-1.5 bg-stone-800 rounded-full accent-amber-500 cursor-pointer" />
        </div>
    );
}

function AiThinking({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-3 p-4 bg-stone-900/60 border border-amber-500/10 rounded-xl">
            <Loader2 size={16} className="text-amber-500 animate-spin shrink-0" />
            <p className="text-xs text-stone-400 italic">{label}</p>
        </div>
    );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">{children}</p>;
}

function FieldTextarea({ label, value, onChange, placeholder, rows = 3, disabled = false }: {
    label?: string; value: string; onChange: (v: string) => void; placeholder: string; rows?: number; disabled?: boolean;
}) {
    return (
        <div>
            {label && <SectionLabel>{label}</SectionLabel>}
            <textarea
                value={value} onChange={e => onChange(e.target.value)}
                placeholder={placeholder} rows={rows} disabled={disabled}
                className="w-full bg-stone-950/80 border border-stone-700/50 text-stone-100 placeholder-stone-600 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/30 transition-all disabled:opacity-40"
            />
        </div>
    );
}

function AiCard({ text, className = '' }: { text: string; className?: string }) {
    return (
        <div className={`bg-gradient-to-br from-amber-950/20 to-stone-900/60 border border-amber-500/15 rounded-xl px-4 py-3 text-sm text-stone-300 leading-relaxed ${className}`}>
            <span className="text-amber-500/60 text-xs font-bold uppercase tracking-widest block mb-1">Guide</span>
            {text}
        </div>
    );
}

function CertaintySlider({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
    return (
        <div>
            <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs text-stone-400">{label}</label>
                <span className="text-xl font-mono font-bold text-amber-400">{value}%</span>
            </div>
            <input type="range" min={0} max={100} value={value} onChange={e => onChange(Number(e.target.value))}
                className="w-full h-2 bg-stone-800 rounded-full accent-amber-500 cursor-pointer" />
            <div className="flex justify-between text-[10px] text-stone-600 mt-1">
                <span>Open question</span><span>Absolute certainty</span>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const RealityTunnelWizard: React.FC<RealityTunnelWizardProps> = ({ isOpen, onClose, onSave, draft, userId }) => {
    const [step, setStep] = useState(0);

    // Auto-save draft
    const [d, updateDraft] = useWizardDraft<RealityTunnelDraft>('aura-draft-reality-tunnel', draft ?? buildEmptyDraft());

    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [crisisLevel, setCrisisLevel] = useState<CrisisLevel>('none');
    const [userStuck, setUserStuck] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Persist draft to localStorage via parent
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }, [step]);

    // Sync session state to draft on changes
    useEffect(() => {
        updateDraft(d);
    }, [d.belief, d.tunnelName, d.certaintyBefore, d.certaintyAfter, d.beliefOriginWhen, d.beliefOriginSource, d.beliefOriginContext, d.counterTunnelName, d.counterExperience, d.counterArgument, d.originalBodyArea, d.counterBodyArea, d.surpriseReflection, d.relationshipShift]);

    // Crisis detection debounced
    const crisisFields = [d.belief, d.beliefOriginWhen, d.beliefOriginSource, d.beliefOriginContext, d.counterExperience, d.counterArgument, d.surpriseReflection].join(' ');
    useEffect(() => {
        const t = setTimeout(() => setCrisisLevel(detectCrisisLevel(crisisFields)), 400);
        return () => clearTimeout(t);
    }, [crisisFields]);

    const upd = useCallback((patch: Partial<RealityTunnelDraft>) => {
        const newDraft = { ...d, ...patch };
        updateDraft(newDraft);
    }, [d, updateDraft]);

    if (!isOpen) return null;

    // ─── AI Call 1: Origin Synthesis (Step 1 → 2) ─────────────────────────────
    const runOriginSynthesis = async () => {
        setAiLoading(true); setAiError(null);
        try {
            const prompt = `${SYSTEM_PROMPT}\n\nA person is exploring the belief: "${d.belief}" (they call this tunnel: "${d.tunnelName}").\nOrigin info:\n- When: ${d.beliefOriginWhen}\n- Source: ${d.beliefOriginSource}\n- Context: ${d.beliefOriginContext}\n\nWrite a warm, philosophically grounded reflection on how this belief was acquired. Emphasize that beliefs have origins — they were learned, not discovered. End with a transition that opens curiosity without dismissing the belief.\n\nReturn JSON with fields: reflection (80-400 chars), acquisitionSummary (40-200 chars), transitionPrompt (40-300 chars ending with a question or invitation).`;
            const result = await callGrokThenAIJson<OriginSynthesis>('RealityTunnel.OriginSynthesis', prompt, undefined, originSynthesisSchema);
            upd({ originSynthesis: result });
            setStep(2);
        } catch {
            // Fallback: use user's own text + static closing
            upd({
                originSynthesis: {
                    reflection: `This belief — "${d.tunnelName}" — arrived through ${d.beliefOriginSource || 'experience'} around ${d.beliefOriginWhen || 'an earlier time'}. Like all beliefs, it was constructed, not discovered.`,
                    acquisitionSummary: d.beliefOriginContext || 'A lived experience that became a lens.',
                    transitionPrompt: 'Every map has an edge. What might lie just beyond this one?',
                }
            });
            setStep(2);
        } finally {
            setAiLoading(false);
        }
    };

    // ─── AI Call 2: Counter-Model (Step 2 → 3 → 4) ───────────────────────────
    const runCounterModel = async () => {
        setAiLoading(true); setAiError(null);
        const isStuck = userStuck || d.counterArgument === 'USER_STUCK';
        try {
            const prompt = `${SYSTEM_PROMPT}\n\nOriginal tunnel: "${d.tunnelName}" — belief: "${d.belief}".\nCounter-tunnel: "${d.counterTunnelName}".\n${isStuck
                ? `The person says they cannot construct a counter-argument. Generate a plausible, respectful alternative perspective for them — not dismissing the original, but genuinely offering another map.`
                : `Counter-experience: "${d.counterExperience}"\nCounter-argument: "${d.counterArgument}"\n${d.conservationFlag === 'protective-tunnel' ? 'Note: The original belief may be serving a protective function. Acknowledge this.' : ''}\nStrengthen this counter-perspective with philosophical care. Do not take sides.`
                }\n\nReturn JSON: strengthenedCounterModel (80-400 chars), additionalPerspectives (1-3 items, 20+ chars each), flexibilityObservation (40-200 chars about what holding two maps reveals).`;
            const result = await callGrokThenAIJson<CounterModel>('RealityTunnel.CounterModel', prompt, undefined, counterModelSchema);
            upd({ counterModel: result, counterArgument: isStuck ? result.strengthenedCounterModel : d.counterArgument });
            setStep(3);
        } catch {
            upd({
                counterModel: {
                    strengthenedCounterModel: isStuck ? `An alternative view: "${d.counterTunnelName}" suggests that what feels certain may be one interpretation among many.` : d.counterArgument,
                    additionalPerspectives: ['Every map is a simplification of the territory.'],
                    flexibilityObservation: 'Holding two maps reveals the territory is richer than either.',
                }
            });
            setStep(3);
        } finally {
            setAiLoading(false);
        }
    };

    // ─── AI Call 3: Integration (Step 4 → 5) ─────────────────────────────────
    const runIntegration = async () => {
        setAiLoading(true); setAiError(null);
        try {
            const prompt = `${SYSTEM_PROMPT}\n\nA person is exploring the belief: "${d.belief}" (they call this tunnel: "${d.tunnelName}").\nOrigin info:\n- When: ${d.beliefOriginWhen}\n- Source: ${d.beliefOriginSource}\n- Context: ${d.beliefOriginContext}\n\nWrite a warm, philosophically grounded reflection on how this belief was acquired. Emphasize that beliefs have origins — they were learned, not discovered. End with a transition that opens curiosity without dismissing the belief.\n\nReturn JSON with fields: reflection (80-400 chars), acquisitionSummary (40-200 chars), transitionPrompt (40-300 chars ending with a question or invitation).`;
            const result = await callGrokThenAIJson<RealityTunnelIntegration>('RealityTunnel.Integration', prompt, undefined, realityTunnelIntegrationSchema);
            upd({ integration: result });
            setStep(5);
        } catch {
            upd({
                integration: {
                    beliefHonoring: `The tunnel "${d.tunnelName}" served you. It organized experience and made action possible.`,
                    flexibilityHonoring: `Touching the counter-tunnel "${d.counterTunnelName}" shows your maps can update. That is a form of intelligence.`,
                    processReflection: 'Noticing a belief is already a significant step. The held certainty and the discovered flexibility now coexist.',
                    weeklyPractice: 'Once this week, when a strong conviction arises, pause and silently ask: "What would I need to see for this map to be wrong?"',
                    flexibilityInsight: 'The map is not the territory — and neither is the counter-map.',
                    routing: { beliefDomain: 'other', originDepth: 'formative-experience', somaticSignificance: d.originalIntensity >= 7 ? 'high' : d.originalIntensity >= 4 ? 'moderate' : 'low' },
                }
            });
            setStep(5);
        } finally {
            setAiLoading(false);
        }
    };

    // ─── Save ─────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!d.integration) return;
        setSaving(true);
        const session: RealityTunnelSession = {
            id: uuidv4(),
            date: new Date().toISOString(),
            userId,
            tunnelName: d.tunnelName,
            counterTunnelName: d.counterTunnelName,
            belief: d.belief,
            certaintyBefore: d.certaintyBefore,
            certaintyAfter: d.certaintyAfter,
            relationshipShift: d.relationshipShift,
            conservationFlag: d.conservationFlag,
            weeklyPractice: d.integration.weeklyPractice,
            flexibilityInsight: d.integration.flexibilityInsight,
            routing: d.integration.routing,
        };
        onSave(session);
        setSaving(false);
    };

    // ─── Step renderers ───────────────────────────────────────────────────────
    const renderStep0 = () => (
        <div className="space-y-6">
            <div>
                <div className="text-center mb-6">
                    <div className="inline-block text-amber-400/60 mb-3"><FocusApertureIcon size={44} /></div>
                    <h2 className="text-2xl font-serif font-light text-stone-100 mb-1">Name the Tunnel</h2>
                    <p className="text-sm text-stone-400 max-w-md mx-auto leading-relaxed">Robert Anton Wilson observed that we all live inside reality tunnels — maps we mistake for the territory. This wizard helps you hold your map lightly.</p>
                </div>
                <div className="space-y-4">
                    <FieldTextarea label="State the belief" value={d.belief} onChange={v => upd({ belief: v })} placeholder="e.g. I am fundamentally unlovable / The world is a zero-sum competition / I peaked in my twenties" />
                    <div>
                        <SectionLabel>Give this tunnel a name</SectionLabel>
                        <input value={d.tunnelName} onChange={e => upd({ tunnelName: e.target.value })} placeholder="e.g. The Scarcity Map / The Undeserving Lens" className="w-full bg-stone-950/80 border border-stone-700/50 text-stone-100 placeholder-stone-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all" />
                    </div>
                    <CertaintySlider value={d.certaintyBefore} onChange={v => upd({ certaintyBefore: v })} label="How certain do you feel this is true?" />
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <SectionLabel>How long have you held this?</SectionLabel>
                            <div className="flex flex-wrap gap-2">
                                {(['weeks', 'months', 'years', 'always'] as const).map(opt => (
                                    <button key={opt} type="button" onClick={() => upd({ beliefDuration: opt })}
                                        className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${d.beliefDuration === opt ? 'bg-amber-500/15 border-amber-500/40 text-amber-300' : 'bg-stone-900/60 border-stone-700/40 text-stone-400'}`}>
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <SectionLabel>If it were wrong, it would feel…</SectionLabel>
                            <div className="flex flex-wrap gap-2">
                                {(['relieving', 'terrifying', 'confusing', 'freeing', 'impossible'] as const).map(opt => (
                                    <button key={opt} type="button" onClick={() => upd({ wrongFeeling: opt })}
                                        className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${d.wrongFeeling === opt ? 'bg-amber-500/15 border-amber-500/40 text-amber-300' : 'bg-stone-900/60 border-stone-700/40 text-stone-400'}`}>
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep1 = () => (
        <div className="space-y-5">
            <div className="text-center mb-4">
                <div className="inline-block text-amber-400/60 mb-2"><EngramArchiveIcon size={40} /></div>
                <h2 className="text-2xl font-serif font-light text-stone-100 mb-1">Belief Archaeology</h2>
                <p className="text-sm text-stone-400 max-w-md mx-auto">Every belief has a birthday. Trace yours.</p>
            </div>
            {d.originSynthesis && <AiCard text={d.originSynthesis.reflection} />}
            <FieldTextarea label="When was this belief formed?" value={d.beliefOriginWhen} onChange={v => upd({ beliefOriginWhen: v })} placeholder="e.g. Around age 12, after my father lost his job…" />
            <FieldTextarea label="Who or what was the source?" value={d.beliefOriginSource} onChange={v => upd({ beliefOriginSource: v })} placeholder="e.g. A parent, a teacher, a series of rejections, a culture…" />
            <FieldTextarea label="What was happening in your life then?" value={d.beliefOriginContext} onChange={v => upd({ beliefOriginContext: v })} placeholder="Describe the context that made this belief feel necessary or true…" rows={4} />
            {aiLoading && <AiThinking label="Synthesising your belief's origin story…" />}
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-5">
            <div className="text-center mb-4">
                <div className="inline-block text-amber-400/60 mb-2"><DyadBridgeIcon size={40} /></div>
                <h2 className="text-2xl font-serif font-light text-stone-100 mb-1">The Counter-Tunnel</h2>
                <p className="text-sm text-stone-400 max-w-md mx-auto">Not to replace yours — just to prove another map can exist.</p>
            </div>
            {d.originSynthesis && (
                <div className="bg-stone-900/40 border border-stone-700/30 rounded-xl p-3 text-xs text-stone-400 italic">
                    &ldquo;{d.originSynthesis.transitionPrompt}&rdquo;
                </div>
            )}
            {d.counterModel && <AiCard text={d.counterModel.strengthenedCounterModel} />}
            <div>
                <SectionLabel>Name the counter-tunnel</SectionLabel>
                <input value={d.counterTunnelName} onChange={e => upd({ counterTunnelName: e.target.value })} placeholder="e.g. The Abundance Map / The Worthy Lens" className="w-full bg-stone-950/80 border border-stone-700/50 text-stone-100 placeholder-stone-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all" />
            </div>
            <FieldTextarea label="An experience that supports this alternative view" value={d.counterExperience} onChange={v => upd({ counterExperience: v })} placeholder="A time when the counter-belief appeared true, even briefly…" />
            {!userStuck ? (
                <>
                    <FieldTextarea label="A genuine counter-argument" value={d.counterArgument} onChange={v => upd({ counterArgument: v })} placeholder="Why might this alternative map be equally valid?" rows={4} />
                    <button type="button" onClick={() => { setUserStuck(true); upd({ counterArgument: 'USER_STUCK' }); }} className="text-xs text-stone-500 hover:text-amber-400 underline transition-colors">
                        I can't find one — let the guide generate an alternative
                    </button>
                </>
            ) : (
                <div className="bg-amber-950/20 border border-amber-500/15 rounded-xl p-3 text-sm text-stone-400 italic">
                    The guide will construct a plausible alternative for you. Your task is only to receive it with curiosity.
                </div>
            )}
            {d.counterModel?.additionalPerspectives && (
                <div className="space-y-2">
                    <SectionLabel>Additional perspectives</SectionLabel>
                    {d.counterModel.additionalPerspectives.map((p, i) => (
                        <div key={i} className="text-xs text-stone-400 pl-3 border-l border-amber-500/20">{p}</div>
                    ))}
                </div>
            )}
            {aiLoading && <AiThinking label="Strengthening the counter-model…" />}
        </div>
    );

    const renderStep3 = () => {
        const flag = computeConservationFlag(d.originalSensations, d.originalIntensity, d.counterSensations, d.counterIntensity);
        return (
            <div className="space-y-5">
                <div className="text-center mb-4">
                    <div className="inline-block text-amber-400/60 mb-2"><SomaticPillarIcon size={40} /></div>
                    <h2 className="text-2xl font-serif font-light text-stone-100 mb-1">The Body Knows</h2>
                    <p className="text-sm text-stone-400 max-w-md mx-auto">Your nervous system has been living inside this tunnel. Let it speak.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="bg-stone-900/40 border border-amber-500/10 rounded-xl p-4 space-y-4">
                        <p className="text-xs font-bold text-amber-500/70 uppercase tracking-widest">Original Tunnel · "{d.tunnelName}"</p>
                        <div>
                            <SectionLabel>Body area</SectionLabel>
                            <ChipSelect options={BODY_AREAS} selected={d.originalBodyArea ? [d.originalBodyArea] : []}
                                onToggle={v => upd({ originalBodyArea: v })} single />
                        </div>
                        <div>
                            <SectionLabel>Sensations</SectionLabel>
                            <ChipSelect options={SENSATIONS} selected={d.originalSensations} onToggle={v => upd({ originalSensations: d.originalSensations.includes(v) ? d.originalSensations.filter(s => s !== v) : [...d.originalSensations, v] })} />
                        </div>
                        <IntensitySlider value={d.originalIntensity} onChange={v => upd({ originalIntensity: v })} label="Intensity" />
                    </div>
                    <div className="bg-stone-900/40 border border-stone-700/20 rounded-xl p-4 space-y-4">
                        <p className="text-xs font-bold text-stone-500 uppercase tracking-widest">Counter-Tunnel · "{d.counterTunnelName}"</p>
                        <div>
                            <SectionLabel>Body area</SectionLabel>
                            <ChipSelect options={BODY_AREAS} selected={d.counterBodyArea ? [d.counterBodyArea] : []}
                                onToggle={v => upd({ counterBodyArea: v })} single />
                        </div>
                        <div>
                            <SectionLabel>Sensations</SectionLabel>
                            <ChipSelect options={SENSATIONS} selected={d.counterSensations} onToggle={v => upd({ counterSensations: d.counterSensations.includes(v) ? d.counterSensations.filter(s => s !== v) : [...d.counterSensations, v] })} />
                        </div>
                        <IntensitySlider value={d.counterIntensity} onChange={v => upd({ counterIntensity: v })} label="Intensity" />
                    </div>
                </div>
                {/* Conservation flags */}
                {flag === 'both-distressed' && (
                    <div className="bg-purple-950/30 border border-purple-500/30 rounded-xl p-4 space-y-3">
                        <div className="flex items-start gap-2">
                            <AlertTriangle size={16} className="text-purple-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-purple-300 mb-1">High distress on both maps</p>
                                <p className="text-xs text-purple-200/70 leading-relaxed">Both the original and counter-tunnel are showing significant somatic distress. This inquiry may benefit from a slower, supported approach. You can save your progress and return, or continue.</p>
                            </div>
                        </div>
                        <button type="button" onClick={() => { upd({ conservationFlag: 'both-distressed' }); handleSave(); }}
                            className="w-full py-2.5 bg-purple-900/50 hover:bg-purple-800/60 border border-purple-700/40 text-purple-200 text-sm rounded-xl transition-all">
                            Save progress &amp; exit for now
                        </button>
                    </div>
                )}
                {flag === 'protective-tunnel' && (
                    <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-3 flex items-start gap-2">
                        <Info size={14} className="text-amber-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-200/80 leading-relaxed">Your body responds more easily to the original belief. This often means the tunnel is serving a protective function — providing safety, structure, or identity. The guide will honor this in the synthesis.</p>
                    </div>
                )}
            </div>
        );
    };

    const renderStep4 = () => (
        <div className="space-y-5">
            <div className="text-center mb-4">
                <div className="inline-block text-amber-400/60 mb-2"><EvolutionaryUnfoldingIcon size={40} /></div>
                <h2 className="text-2xl font-serif font-light text-stone-100 mb-1">Flexibility Reflection</h2>
                <p className="text-sm text-stone-400 max-w-md mx-auto">Before synthesis — what do you notice now that you couldn't see at the start?</p>
            </div>
            {d.counterModel && <AiCard text={d.counterModel.flexibilityObservation} />}
            <FieldTextarea label="What surprised you?" value={d.surpriseReflection} onChange={v => upd({ surpriseReflection: v })} placeholder="What emerged that you didn't expect? What shifted, even slightly?" rows={4} />
            <CertaintySlider value={d.certaintyAfter} onChange={v => upd({ certaintyAfter: v })} label="Certainty now — after holding both maps" />
            <div>
                <SectionLabel>Your relationship to this belief has…</SectionLabel>
                <div className="flex flex-wrap gap-2">
                    {(['same', 'lighter', 'curious', 'unsettled', 'committed'] as const).map(opt => (
                        <button key={opt} type="button" onClick={() => upd({ relationshipShift: opt })}
                            className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${d.relationshipShift === opt ? 'bg-amber-500/15 border-amber-500/40 text-amber-300' : 'bg-stone-900/60 border-stone-700/40 text-stone-400'}`}>
                            {opt === 'same' ? 'Stayed the same' : opt === 'lighter' ? 'Become lighter' : opt === 'curious' ? 'Become curious' : opt === 'unsettled' ? 'Become unsettled' : 'Become more committed'}
                        </button>
                    ))}
                </div>
            </div>
            {aiLoading && <AiThinking label="Synthesising your tunnel flexibility…" />}
        </div>
    );

    const renderStep5 = () => {
        if (!d.integration) return <AiThinking label="Preparing your artifact…" />;
        const { integration: ig } = d;
        const suggestions = [
            ig.routing.beliefDomain === 'self-identity' && ROUTING_SUGGESTIONS['self-identity'],
            ig.routing.originDepth === 'early-childhood' && ROUTING_SUGGESTIONS['early-childhood'],
            ig.routing.somaticSignificance === 'high' && ROUTING_SUGGESTIONS['high'],
        ].filter(Boolean).slice(0, 2) as Array<{ label: string; slug: string }>;

        return (
            <div className="space-y-5">
                <div className="text-center mb-4">
                    <div className="inline-block text-amber-400/60 mb-2"><PatternMandalaIcon size={44} /></div>
                    <h2 className="text-2xl font-serif font-light text-stone-100 mb-1">Your Flexibility Artifact</h2>
                    <p className="text-xs font-mono text-amber-500/60 mt-1">{d.certaintyBefore}% → {d.certaintyAfter}% certainty ·  {d.conservationFlag !== 'none' ? d.conservationFlag.replace('-', ' ') : 'clean signal'}</p>
                </div>

                <div className="space-y-3">
                    <div className="bg-gradient-to-br from-stone-900 to-stone-950 border border-amber-500/15 rounded-2xl p-5 space-y-4">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500/60 mb-1.5">Honoring the original</p>
                            <p className="text-sm text-stone-300 leading-relaxed">{ig.beliefHonoring}</p>
                        </div>
                        <div className="h-px bg-stone-800" />
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500/60 mb-1.5">Honoring the flexibility</p>
                            <p className="text-sm text-stone-300 leading-relaxed">{ig.flexibilityHonoring}</p>
                        </div>
                        <div className="h-px bg-stone-800" />
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500/60 mb-1.5">Process reflection</p>
                            <p className="text-sm text-stone-300 leading-relaxed">{ig.processReflection}</p>
                        </div>
                    </div>

                    <div className="bg-amber-950/25 border border-amber-500/20 rounded-xl p-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500/70 mb-2">Weekly practice</p>
                        <p className="text-sm text-stone-300 leading-relaxed">{ig.weeklyPractice}</p>
                    </div>

                    <div className="bg-stone-900/60 border border-stone-700/30 rounded-xl p-4 text-center">
                        <p className="text-xs text-stone-500 mb-1 italic">Flexibility insight</p>
                        <p className="text-base font-serif text-amber-300">"{ig.flexibilityInsight}"</p>
                    </div>

                    {/* Meta-awareness line — hardcoded per spec */}
                    <div className="text-center py-2">
                        <p className="text-xs text-stone-600 italic">"All beliefs are constructed models" is itself a model. Hold that lightly too.</p>
                    </div>

                    {/* Routing suggestions */}
                    {suggestions.length > 0 && (
                        <div className="space-y-2">
                            <SectionLabel>Where to go next</SectionLabel>
                            {suggestions.map((s, i) => (
                                <div key={i} className="flex items-center gap-3 bg-stone-900/40 border border-stone-700/30 rounded-xl px-4 py-3">
                                    <ArrowRight size={14} className="text-amber-400 shrink-0" />
                                    <p className="text-sm text-stone-300 flex-1">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // ─── Navigation logic ─────────────────────────────────────────────────────
    const canAdvance = () => {
        if (step === 0) return d.belief.trim().length > 10 && d.tunnelName.trim().length > 2;
        if (step === 1) return d.beliefOriginWhen.trim().length > 2 && d.beliefOriginSource.trim().length > 2 && d.beliefOriginContext.trim().length > 10;
        if (step === 2) return d.counterTunnelName.trim().length > 2 && d.counterExperience.trim().length > 10;
        if (step === 3) return d.originalBodyArea.length > 0 && d.counterBodyArea.length > 0;
        if (step === 4) return d.surpriseReflection.trim().length > 10 && d.relationshipShift.length > 0;
        return false;
    };

    const handleNext = async () => {
        if (step === 0) { setStep(1); return; }
        if (step === 1) { await runOriginSynthesis(); return; }
        if (step === 2) { await runCounterModel(); return; }
        if (step === 3) {
            const flag = computeConservationFlag(d.originalSensations, d.originalIntensity, d.counterSensations, d.counterIntensity);
            upd({ conservationFlag: flag });
            setStep(4);
            return;
        }
        if (step === 4) { await runIntegration(); return; }
    };

    const stepContent = [renderStep0, renderStep1, renderStep2, renderStep3, renderStep4, renderStep5];

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <WizardFrame
            title="Reality Tunnel"
            currentStep={step}
            totalSteps={6}
            isLoading={aiLoading || saving}
            showBackButton={step > 0}
            onClose={onClose}
            onBack={() => step > 0 && setStep(s => s - 1)}
            onNext={step === 5 ? handleSave : handleNext}
            accentColor="amber"
            nextButtonDisabled={step < 5 ? !canAdvance() : !d.integration}
            errorMessage={aiError}
        >
        <div className="fixed inset-0 z-50 flex items-stretch bg-stone-950/95 backdrop-blur-md" role="dialog" aria-modal="true">
            {/* Ambient glow */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-amber-500/4 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-amber-800/5 blur-[80px] rounded-full" />
            </div>

            {/* Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-stone-950 border-r border-stone-800/60 p-5">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="text-amber-500/70"><FocusApertureIcon size={20} /></div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Reality Tunnel</span>
                    </div>
                    <h1 className="text-lg font-serif font-light text-stone-200 leading-tight">Flexibility<br />Workshop</h1>
                </div>

                <StepRail current={step} total={6} />

                {/* Tunnel info */}
                {d.tunnelName && (
                    <div className="mt-auto pt-4 border-t border-stone-800/50 space-y-2">
                        <div>
                            <p className="text-[10px] text-stone-600 uppercase tracking-widest mb-0.5">First tunnel</p>
                            <p className="text-xs text-amber-400/80 truncate">{d.tunnelName}</p>
                        </div>
                        {d.counterTunnelName && (
                            <div>
                                <p className="text-[10px] text-stone-600 uppercase tracking-widest mb-0.5">Counter-tunnel</p>
                                <p className="text-xs text-stone-400 truncate">{d.counterTunnelName}</p>
                            </div>
                        )}
                        {d.certaintyBefore > 0 && (
                            <div className="flex items-center gap-3 text-xs">
                                <span className="text-amber-400">{d.certaintyBefore}%</span>
                                <span className="text-stone-600">→</span>
                                <span className={d.certaintyAfter < d.certaintyBefore ? 'text-emerald-400' : 'text-stone-400'}>{d.certaintyAfter}%</span>
                            </div>
                        )}
                    </div>
                )}
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top bar */}
                <header className="flex items-center justify-between px-5 py-3 border-b border-stone-800/60 shrink-0">
                    {/* Mobile step indicator */}
                    <div className="flex items-center gap-2 lg:hidden">
                        <div className="text-amber-500/60">
                            {React.createElement(STEP_META[step].icon, { size: 16 })}
                        </div>
                        <span className="text-xs text-stone-400 font-serif">{STEP_META[step].label}</span>
                    </div>
                    <div className="hidden lg:flex items-center gap-2">
                        <span className="text-xs text-stone-500">Step {step + 1} of 6</span>
                        <div className="flex gap-1">
                            {Array.from({ length: 6 }, (_, i) => (
                                <div key={i} className={`h-0.5 w-6 rounded-full transition-all ${i <= step ? 'bg-amber-500' : 'bg-stone-800'}`} />
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
                        {crisisLevel !== 'none' && (
                            <div className="mb-5 bg-red-950/40 border border-red-600/30 rounded-xl p-3 flex items-center gap-2">
                                <AlertTriangle size={14} className="text-red-400 shrink-0" />
                                <p className="text-xs text-red-300">If you're experiencing distress beyond philosophical inquiry, please reach out to a trusted person or a crisis line (988 in the US).</p>
                            </div>
                        )}
                        {aiError && (
                            <div className="mb-4 bg-purple-950/30 border border-purple-700/30 rounded-xl p-3 text-xs text-purple-300">{aiError}</div>
                        )}
                        {stepContent[step]?.()}
                    </div>
                </div>

                {/* Footer navigation */}
                <footer className="shrink-0 border-t border-stone-800/60 px-5 py-3 flex items-center justify-between bg-stone-950/80">
                    <button
                        onClick={() => step > 0 && setStep(s => s - 1)}
                        disabled={step === 0 || aiLoading}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-stone-400 hover:text-stone-200 hover:bg-stone-800/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                        <ChevronLeft size={16} /> Back
                    </button>

                    <div className="flex items-center gap-3">
                        {step === 5 ? (
                            <button
                                onClick={handleSave}
                                disabled={saving || !d.integration}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-stone-950 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-900/30">
                                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                Save session
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                disabled={!canAdvance() || aiLoading}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-900/20">
                                {aiLoading ? <Loader2 size={16} className="animate-spin" /> : (step === 1 || step === 2 || step === 4) ? 'Synthesise' : 'Continue'}
                                {!aiLoading && <ChevronRight size={16} />}
                            </button>
                        )}
                    </div>
                </footer>
            </div>
        </div>
        </WizardFrame>
    );
};

export default RealityTunnelWizard;
