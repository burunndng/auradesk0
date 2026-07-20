/**
 * Defusion Lab Wizard
 * ACT-based cognitive defusion practice — 3-5 min structured session
 * Three beats: Catch → Experiment Hub → Land
 *
 * ARCHITECTURAL RULE: Never evaluate the truth or falsity of a thought.
 * The tool leaves the thought's content untouched; it only changes
 * the user's *relationship* to the thought.
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { X, ChevronRight, ChevronLeft, Loader2, Info, HelpCircle, Check } from 'lucide-react';
import DefusionPrismIcon from '../visualizations/SacredGeometryIcons/DefusionPrismIcon';
import { v4 as uuidv4 } from 'uuid';
import { callGrokThenAIJson } from '../../services/ai/aiCore';
import { useWizardDraft } from '../../hooks/useWizardDraft';
import { detectCrisisLevel, type CrisisLevel } from '../../utils/crisisDetection';
import { defusionExternalizationSchema, defusionPatternObservationSchema } from '../../services/ai/wizardSchemas';
import type { DefusionSession, DefusionExperiment, DefusionExperimentType } from '../../types';
import { getIconComponent, type IconName } from '../../.claude/lib/iconMap';
import { wizardSessionService } from '../../services/wizardSessionService';
import { generateInsightFromSession } from '../../services/insightGenerator';
import { useInsightsContext } from '../../contexts/InsightsContext';
import { practices } from '../../constants';

// ─── Constants ────────────────────────────────────────────────────────────────

type Step = 'ORIENTATION' | 'CATCH' | 'EXPERIMENTS' | 'LAND' | 'SUMMARY';

const STEPS: { id: Step; label: string; sub: string }[] = [
    { id: 'ORIENTATION', label: 'Welcome', sub: 'orientation' },
    { id: 'CATCH', label: 'Catch', sub: 'the thought' },
    { id: 'EXPERIMENTS', label: 'Experiment Hub', sub: 'defusion' },
    { id: 'LAND', label: 'Land', sub: 'integration' },
    { id: 'SUMMARY', label: 'Summary', sub: 'artifact' },
];

const EXPERIMENT_LABELS: Record<DefusionExperimentType, { title: string; description: string; icon: IconName }> = {
    'i-notice': { title: '"I Notice..."', description: 'Create linguistic distance from the thought.', icon: 'FocusAperture' },
    'name-that-story': { title: 'Name That Story', description: 'Give the recurring narrative a label.', icon: 'EngramArchive' },
    'give-it-a-shape': { title: 'Give It a Shape', description: 'Make the thought concrete and sensory.', icon: 'SenseMandala' },
    'thank-your-mind': { title: 'Thank Your Mind', description: 'Acknowledge the thought\'s protective function.', icon: 'AscensionFlame' },
};

const NOTICE_CHIPS = [
    'I notice I\'m having the thought that...',
    'My mind is telling me...',
    'Here\'s the "not good enough" story again',
    'There goes my mind, doing its thing',
    'Brain radio is playing the worry station',
];

const STORY_CHIPS = [
    'The Not-Good-Enough Story',
    'The Catastrophe Story',
    'The Imposter Story',
    'The Rejection Story',
    'The "Should" Story',
    'The Control Story',
];

const THANK_CHIPS = [
    'Thank you for trying to protect me',
    'I see you\'re trying to keep me safe',
    'I appreciate the warning',
    'You\'ve been working hard',
    'I hear you, and I\'m okay',
];

const SHAPE_OPTIONS = {
    shape: ['Sphere', 'Boulder', 'Cloud', 'Knot', 'Wall', 'Spike'],
    color: ['Red', 'Black', 'Grey', 'Dark blue', 'Brown', 'White'],
    weight: ['Featherlight', 'Light', 'Medium', 'Heavy', 'Crushing'],
    temperature: ['Freezing', 'Cool', 'Warm', 'Hot', 'Burning'],
    placement: ['Head', 'Chest', 'Stomach', 'Throat', 'Everywhere', 'Outside me'],
};

const ORIENTATION_KEY = 'aura-defusion-intro-seen';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <p className="text-[10px] font-mono uppercase tracking-[.2em] text-stone-500">{children}</p>
);

const ResponseChips = ({
    options,
    selected,
    onToggle,
    multi = true,
}: {
    options: string[];
    selected: string[];
    onToggle: (chip: string) => void;
    multi?: boolean;
}) => (
    <div className="flex flex-wrap gap-2">
        {options.map((chip) => {
            const isSelected = selected.includes(chip);
            return (
                <button
                    key={chip}
                    onClick={() => onToggle(chip)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-all duration-200 ${isSelected
                        ? 'bg-amber-600/30 border-amber-500/50 text-amber-200'
                        : 'bg-stone-800/40 border-stone-700/50 text-stone-400 hover:border-stone-600 hover:text-stone-300'
                        }`}
                >
                    {isSelected && <Check size={10} className="inline mr-1" />}
                    {chip}
                </button>
            );
        })}
    </div>
);

const FusionSlider = ({
    value,
    onChange,
    label,
}: {
    value: number;
    onChange: (v: number) => void;
    label: string;
}) => (
    <div className="space-y-3">
        <div className="flex items-center justify-between">
            <SectionLabel>{label}</SectionLabel>
            <span className="text-lg font-mono text-amber-400">{value}</span>
        </div>
        <div className="flex gap-1">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <button
                    key={n}
                    onClick={() => onChange(n)}
                    className={`flex-1 h-8 rounded text-xs font-mono transition-all duration-150 ${n <= value
                        ? 'bg-amber-600/40 text-amber-200 border border-amber-500/40'
                        : 'bg-stone-800/40 text-stone-600 border border-stone-700/30 hover:bg-stone-700/40'
                        }`}
                >
                    {n}
                </button>
            ))}
        </div>
        <div className="flex justify-between text-[10px] text-stone-600 font-mono">
            <span>barely stuck</span>
            <span>completely fused</span>
        </div>
    </div>
);

// ─── Props ────────────────────────────────────────────────────────────────────

interface DefusionLabWizardProps {
    onClose: () => void;
    onSave?: (session: DefusionSession) => void;
    userId?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DefusionLabWizard({ onClose, onSave, userId }: DefusionLabWizardProps) {
    const { setIntegratedInsights } = useInsightsContext();
    // Draft persistence
    const [session, updateSession, , clearDraft] = useWizardDraft<Partial<DefusionSession>>(
        'aura-draft-defusion-lab',
        { id: uuidv4(), date: new Date().toISOString(), experiments: [] }
    );

    // Step management
    const [step, setStep] = useState<Step>(() => {
        if (localStorage.getItem(ORIENTATION_KEY) !== 'true') return 'ORIENTATION';
        const s = session;
        if (!s?.thought) return 'CATCH';
        if (!s?.experiments?.length) return 'EXPERIMENTS';
        if (s?.postFusionRating === undefined) return 'LAND';
        return 'SUMMARY';
    });

    // UI state
    const [loading, setLoading] = useState(false);
    const [showOrientation, setShowOrientation] = useState(false);
    const [crisisLevel, setCrisisLevel] = useState<CrisisLevel | null>(null);

    // Beat 1 state
    const [thought, setThought] = useState(session?.thought || '');
    const [preFusionRating, setPreFusionRating] = useState(session?.preFusionRating || 5);

    // Beat 2 state
    const [activeExperiment, setActiveExperiment] = useState<DefusionExperimentType | null>(null);
    const [noticeChips, setNoticeChips] = useState<string[]>([]);
    const [storyName, setStoryName] = useState('');
    const [storyChips, setStoryChips] = useState<string[]>([]);
    const [shapeForm, setShapeForm] = useState({ shape: '', color: '', weight: '', temperature: '', placement: '' });
    const [concreteness, setConcreteness] = useState(5);
    const [thankChips, setThankChips] = useState<string[]>([]);

    // Beat 3 state
    const [postFusionRating, setPostFusionRating] = useState(session?.postFusionRating || 5);
    const [chosenAction, setChosenAction] = useState(session?.chosenAction || '');

    // Track completed experiments
    const completedExperiments = useMemo(
        () => (session?.experiments || []).map((e) => e.type),
        [session?.experiments]
    );

    // Crisis detection on thought input
    useEffect(() => {
        if (thought.trim().length > 10) {
            const level = detectCrisisLevel(thought);
            setCrisisLevel(level);
        }
    }, [thought]);

    // ─── AI Calls ─────────────────────────────────────────────────────────────

    const fetchExternalization = useCallback(async (thoughtText: string) => {
        setLoading(true);
        try {
            const prompt = `You are a cognitive defusion coach. The user has shared a "sticky thought" — a thought they are fused with.

CRITICAL RULE: You MUST NOT evaluate whether this thought is true or false. Do NOT use phrases like "this isn't true," "this thought is irrational," "that's just a distortion," or any evaluation of the thought's accuracy. The thought's content stays UNTOUCHED.

Your job is to reflect the thought back in an externalized way — creating gentle linguistic distance. Use the user's own words. Keep it brief (2-3 sentences).

Example input: "I'm going to fail at everything I try"
Example output: "Your mind is offering you the prediction that you're going to fail at everything you try. It's serving this thought up with some real urgency — like a weather report for a storm that may or may not arrive."

The user's sticky thought: "${thoughtText}"

Respond with JSON: { "externalizedReflection": "..." }`;

            const result = await callGrokThenAIJson<{ externalizedReflection: string }>(
                'defusion-externalization',
                prompt,
                undefined,
                defusionExternalizationSchema
            );
            updateSession({ aiExternalization: result.externalizedReflection });
        } catch (err) {
            console.warn('[DefusionLab] Externalization AI failed:', err);
            // Graceful fallback — construct a simple externalization
            const fallback = `Your mind is offering you this thought: "${thoughtText.substring(0, 80)}..." Notice it's there, like a radio playing in the background.`;
            updateSession({ aiExternalization: fallback });
        } finally {
            setLoading(false);
        }
    }, [updateSession]);

    const fetchPatternObservation = useCallback(async (sessions: DefusionSession[]) => {
        if (sessions.length < 3) return null;
        setLoading(true);
        try {
            const sessionSummaries = sessions.slice(-5).map((s) => ({
                thought: s.thought.substring(0, 100),
                experiments: s.experiments.map((e) => e.type),
                preFusion: s.preFusionRating,
                postFusion: s.postFusionRating,
            }));

            const prompt = `You are analyzing a user's cognitive defusion practice history. Here are their last ${sessionSummaries.length} sessions:

${JSON.stringify(sessionSummaries, null, 2)}

CRITICAL RULE: Do NOT evaluate whether any thought is true or false.

Identify patterns:
1. What recurring narrative theme do you notice? Give it a descriptive name.
2. Which experiment types seem most effective (biggest pre→post shifts)?
3. What non-evaluative observation can you make about how their relationship with sticky thoughts is evolving?

Respond with JSON: { "recurringStory": "...", "mostEffectiveExperiments": ["..."], "observation": "..." }`;

            const result = await callGrokThenAIJson(
                'defusion-pattern-observation',
                prompt,
                undefined,
                defusionPatternObservationSchema
            );
            return result;
        } catch (err) {
            console.warn('[DefusionLab] Pattern observation AI failed:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // ─── Experiment Completion ────────────────────────────────────────────────

    const completeExperiment = useCallback((type: DefusionExperimentType) => {
        const experiment: DefusionExperiment = {
            type,
            completedAt: new Date().toISOString(),
        };

        switch (type) {
            case 'i-notice':
                experiment.noticeChips = noticeChips;
                break;
            case 'name-that-story':
                experiment.storyName = storyName;
                experiment.storyChips = storyChips;
                break;
            case 'give-it-a-shape':
                experiment.shape = shapeForm.shape;
                experiment.color = shapeForm.color;
                experiment.weight = shapeForm.weight;
                experiment.temperature = shapeForm.temperature;
                experiment.placement = shapeForm.placement;
                experiment.concreteness = concreteness;
                break;
            case 'thank-your-mind':
                experiment.thankChips = thankChips;
                break;
        }

        const updatedExperiments = [...(session?.experiments || []), experiment];
        updateSession({ experiments: updatedExperiments });

        // Reset experiment-specific state
        setNoticeChips([]);
        setStoryName('');
        setStoryChips([]);
        setShapeForm({ shape: '', color: '', weight: '', temperature: '', placement: '' });
        setConcreteness(5);
        setThankChips([]);
        setActiveExperiment(null);
    }, [noticeChips, storyName, storyChips, shapeForm, concreteness, thankChips, session?.experiments, updateSession]);

    // ─── Navigation ───────────────────────────────────────────────────────────

    const handleNext = useCallback(async () => {
        switch (step) {
            case 'ORIENTATION':
                localStorage.setItem(ORIENTATION_KEY, 'true');
                setStep('CATCH');
                break;
            case 'CATCH':
                updateSession({ thought, preFusionRating });
                await fetchExternalization(thought);
                setStep('EXPERIMENTS');
                break;
            case 'EXPERIMENTS':
                setStep('LAND');
                break;
            case 'LAND':
                updateSession({ postFusionRating, chosenAction });
                setStep('SUMMARY');
                break;
            case 'SUMMARY': {
                const toSave: DefusionSession = {
                    id: session?.id || uuidv4(),
                    date: session?.date || new Date().toISOString(),
                    thought: session?.thought || thought,
                    preFusionRating: session?.preFusionRating || preFusionRating,
                    aiExternalization: session?.aiExternalization,
                    experiments: session?.experiments || [],
                    postFusionRating,
                    chosenAction,
                    patternObservation: session?.patternObservation,
                    completedAt: new Date().toISOString(),
                    crisisLevel: crisisLevel || undefined,
                };
                
                if (userId) {
                    try {
                        await wizardSessionService.saveSession({
                            user_id: userId,
                            session_id: toSave.id,
                            type: 'Defusion Lab',
                            content: toSave,
                            created_at: toSave.date
                        });
                        const insight = await generateInsightFromSession({
                            wizardType: 'Defusion Lab',
                            sessionId: toSave.id,
                            sessionName: 'Defusion Lab Practice',
                            sessionReport: JSON.stringify({
                                thought: toSave.thought,
                                preFusionRating: toSave.preFusionRating,
                                postFusionRating: toSave.postFusionRating,
                                experiments: toSave.experiments.map(e => e.type),
                                pattern: toSave.patternObservation?.recurringStory || ''
                            }),
                            sessionSummary: `Shifted fusion from ${toSave.preFusionRating} to ${toSave.postFusionRating} on thought: "${toSave.thought.substring(0, 50)}..."`,
                            userId,
                            availablePractices: Object.values(practices).flatMap(category =>
                                Array.isArray(category) ? category.map((p: any) => ({ id: p.id, name: p.name })) : []
                            ),
                        });
                        if (insight) {
                            setIntegratedInsights(prev => [insight, ...prev]);
                        }
                    } catch (err) {
                        console.error('[DefusionLab] save/insight error:', err);
                    }
                }
                
                onSave?.(toSave);
                clearDraft();
                onClose();
                break;
            }
        }
    }, [step, thought, preFusionRating, postFusionRating, chosenAction, session, crisisLevel, updateSession, fetchExternalization, onSave, clearDraft, onClose, userId, setIntegratedInsights]);

    const handleBack = useCallback(() => {
        const idx = STEPS.findIndex((s) => s.id === step);
        if (idx > 0) setStep(STEPS[idx - 1].id);
    }, [step]);

    const canAdvance = (): boolean => {
        switch (step) {
            case 'CATCH':
                return thought.trim().length >= 3 && preFusionRating > 0;
            case 'EXPERIMENTS':
                return (session?.experiments?.length || 0) >= 1;
            case 'LAND':
                return postFusionRating > 0;
            default:
                return true;
        }
    };

    // ─── Step index ───────────────────────────────────────────────────────────

    const stepIdx = STEPS.findIndex((s) => s.id === step);

    // ─── Marginalia (sidebar content) ─────────────────────────────────────────

    const marginalia = (
        <div className="mt-auto space-y-4 pt-6 border-t border-stone-800/60">
            {session?.thought && (
                <div className="space-y-1">
                    <SectionLabel>Sticky Thought</SectionLabel>
                    <div className="text-sm font-serif text-stone-200 italic">"{session.thought}"</div>
                </div>
            )}
            {session?.aiExternalization && (
                <div className="space-y-1">
                    <SectionLabel>Externalized</SectionLabel>
                    <div className="text-xs text-stone-400 leading-relaxed">{session.aiExternalization}</div>
                </div>
            )}
            {(session?.experiments?.length || 0) > 0 && (
                <div className="space-y-1">
                    <SectionLabel>Experiments Run</SectionLabel>
                    <div className="flex flex-wrap gap-1">
                        {session!.experiments!.map((e, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-full text-[10px] bg-amber-900/30 text-amber-400 border border-amber-800/30">
                                {EXPERIMENT_LABELS[e.type].title}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    // ─── Render helpers ───────────────────────────────────────────────────────

    const renderOrientation = () => (
        <div className="max-w-xl mx-auto space-y-8 animate-fade-in">
            <div className="text-center space-y-4">
                <div className="inline-flex p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                    {React.createElement(getIconComponent('DefusionPrism') || DefusionPrismIcon, { size: 40, className: 'text-amber-400' })}
                </div>
                <h2 className="text-2xl font-serif text-stone-100">Welcome to the Defusion Lab</h2>
                <p className="text-stone-400 leading-relaxed max-w-md mx-auto">
                    This is a 3–5 minute practice to change your <em>relationship</em> with a sticky thought — without
                    arguing with it, suppressing it, or deciding whether it's true.
                </p>
            </div>

            <div className="bg-stone-900/60 border border-stone-800/60 rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-mono uppercase tracking-wider text-amber-500">How it works</h3>
                <div className="space-y-3 text-sm text-stone-300">
                    <div className="flex gap-3 items-start">
                        <span className="shrink-0 w-6 h-6 rounded-full bg-amber-900/40 text-amber-400 text-xs flex items-center justify-center font-mono">1</span>
                        <p><strong className="text-stone-200">Catch</strong> — Name one sticky thought and rate how fused you feel with it.</p>
                    </div>
                    <div className="flex gap-3 items-start">
                        <span className="shrink-0 w-6 h-6 rounded-full bg-amber-900/40 text-amber-400 text-xs flex items-center justify-center font-mono">2</span>
                        <p><strong className="text-stone-200">Experiment</strong> — Run one or more quick experiments to shift your vantage point.</p>
                    </div>
                    <div className="flex gap-3 items-start">
                        <span className="shrink-0 w-6 h-6 rounded-full bg-amber-900/40 text-amber-400 text-xs flex items-center justify-center font-mono">3</span>
                        <p><strong className="text-stone-200">Land</strong> — Re-rate, choose one small valued action, and close the loop.</p>
                    </div>
                </div>
            </div>

            <div className="bg-stone-900/40 border border-stone-800/40 rounded-lg p-4">
                <p className="text-xs text-stone-500 leading-relaxed">
                    <Info size={12} className="inline mr-1 text-amber-600" />
                    This tool never tells you a thought is "wrong" or "irrational." Thoughts are thoughts —
                    the question is whether you're stuck to them or free to move.
                </p>
            </div>
        </div>
    );

    const renderCatch = () => (
        <div className="max-w-xl mx-auto space-y-8 animate-fade-in">
            <div className="space-y-2">
                <h2 className="text-xl font-serif text-stone-100">What thought is stuck to you?</h2>
                <p className="text-sm text-stone-400">Write it as it appears in your mind. Don't filter or edit.</p>
            </div>

            <textarea
                value={thought}
                onChange={(e) => setThought(e.target.value)}
                placeholder="e.g. I'm going to fail at everything I try..."
                className="w-full bg-stone-900/60 border border-stone-700/50 rounded-xl p-4 text-stone-200 placeholder-stone-600 resize-none h-28 focus:outline-none focus:border-amber-600/50 focus:ring-1 focus:ring-amber-600/20 transition-all"
            />

            {crisisLevel && crisisLevel !== 'none' && (
                <div className="bg-red-950/30 border border-red-800/30 rounded-lg p-3 text-xs text-red-300">
                    <Info size={12} className="inline mr-1" />
                    If you're in distress, please reach out: <strong>988 Suicide & Crisis Lifeline</strong> (call/text 988).
                </div>
            )}

            <FusionSlider
                value={preFusionRating}
                onChange={setPreFusionRating}
                label="How fused are you with this thought?"
            />
        </div>
    );

    const renderExperimentHub = () => (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            {/* Persistent thought card */}
            <div className="bg-stone-900/60 border border-amber-800/20 rounded-xl p-4 flex items-start gap-3">
                <div className="shrink-0 mt-1 p-1.5 rounded-lg bg-amber-900/30 text-amber-500">
                    {React.createElement(getIconComponent('EngramArchive') || 'div', { size: 16 })}
                </div>
                <div>
                    <SectionLabel>Your thought</SectionLabel>
                    <p className="text-sm text-stone-200 italic font-serif mt-1">"{session?.thought}"</p>
                    {session?.aiExternalization && (
                        <p className="text-xs text-stone-400 mt-2 leading-relaxed">{session.aiExternalization}</p>
                    )}
                </div>
            </div>

            {/* Experiment list or active experiment */}
            {!activeExperiment ? (
                <div className="space-y-4">
                    <h2 className="text-lg font-serif text-stone-100">Choose an experiment</h2>
                    <p className="text-sm text-stone-400">You can run as many as you like. Each takes under a minute.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(Object.entries(EXPERIMENT_LABELS) as [DefusionExperimentType, typeof EXPERIMENT_LABELS[DefusionExperimentType]][]).map(([type, meta]) => {
                            const done = completedExperiments.includes(type);
                            return (
                                <button
                                    key={type}
                                    onClick={() => setActiveExperiment(type)}
                                    className={`group text-left p-4 rounded-xl border transition-all duration-200 ${done
                                        ? 'bg-amber-950/20 border-amber-700/30 opacity-80'
                                        : 'bg-stone-900/40 border-stone-700/40 hover:border-amber-600/40 hover:bg-stone-800/40'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${done ? 'bg-amber-800/30 text-amber-500' : 'bg-stone-800/60 text-stone-400 group-hover:text-amber-400'} transition-colors`}>
                                            {React.createElement(getIconComponent(meta.icon) || DefusionPrismIcon, { size: 18 })}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-medium text-stone-200 text-sm">{meta.title}</h3>
                                                {done && <Check size={14} className="text-amber-500" />}
                                            </div>
                                            <p className="text-xs text-stone-500 mt-0.5">{meta.description}</p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <button
                        onClick={() => setActiveExperiment(null)}
                        className="text-xs text-stone-500 hover:text-stone-300 transition-colors flex items-center gap-1"
                    >
                        <ChevronLeft size={14} /> Back to experiments
                    </button>
                    {renderActiveExperiment()}
                </div>
            )}
        </div>
    );

    const renderActiveExperiment = () => {
        const thoughtText = session?.thought || thought;

        switch (activeExperiment) {
            case 'i-notice':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-serif text-stone-100 mb-2">"I Notice..."</h3>
                            <p className="text-sm text-stone-400">
                                Instead of <em>"I'm going to fail"</em>, try <em>"I notice I'm having the thought that I'm going to fail."</em>
                            </p>
                        </div>

                        <div className="bg-stone-900/60 border border-stone-800/50 rounded-xl p-5 space-y-3">
                            <SectionLabel>Your thought, externalized</SectionLabel>
                            <p className="text-stone-200 font-serif">
                                <span className="text-amber-400">I notice I'm having the thought that</span>{' '}
                                {thoughtText.toLowerCase().replace(/^i('m| am)/, '').trim() || '...'}
                            </p>
                        </div>

                        <div className="space-y-3">
                            <SectionLabel>How does that feel? Select any that apply</SectionLabel>
                            <ResponseChips
                                options={NOTICE_CHIPS}
                                selected={noticeChips}
                                onToggle={(chip) =>
                                    setNoticeChips((prev) =>
                                        prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
                                    )
                                }
                            />
                        </div>

                        <button
                            onClick={() => completeExperiment('i-notice')}
                            disabled={noticeChips.length === 0}
                            className="w-full py-3 rounded-xl font-medium text-sm transition-all bg-amber-700/30 border border-amber-600/40 text-amber-200 hover:bg-amber-600/40 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Complete Experiment
                        </button>
                    </div>
                );

            case 'name-that-story':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-serif text-stone-100 mb-2">Name That Story</h3>
                            <p className="text-sm text-stone-400">
                                Give your recurring narrative a title — like naming a movie or a book chapter.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <SectionLabel>Pick a label or write your own</SectionLabel>
                            <ResponseChips
                                options={STORY_CHIPS}
                                selected={storyChips}
                                onToggle={(chip) => {
                                    setStoryChips((prev) =>
                                        prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
                                    );
                                    if (!storyName) setStoryName(chip);
                                }}
                            />
                        </div>

                        <div className="space-y-2">
                            <SectionLabel>Or name it yourself</SectionLabel>
                            <input
                                type="text"
                                value={storyName}
                                onChange={(e) => setStoryName(e.target.value)}
                                placeholder="The _____ Story"
                                className="w-full bg-stone-900/60 border border-stone-700/50 rounded-lg px-4 py-2.5 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-600/50 transition-all"
                            />
                        </div>

                        <div className="bg-stone-900/40 border border-stone-800/40 rounded-lg p-3 text-xs text-stone-500">
                            <em>"Oh look, there's the {storyName || '___'} again. Hi there."</em>
                        </div>

                        <button
                            onClick={() => completeExperiment('name-that-story')}
                            disabled={!storyName.trim()}
                            className="w-full py-3 rounded-xl font-medium text-sm transition-all bg-amber-700/30 border border-amber-600/40 text-amber-200 hover:bg-amber-600/40 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Complete Experiment
                        </button>
                    </div>
                );

            case 'give-it-a-shape':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-serif text-stone-100 mb-2">Give It a Shape</h3>
                            <p className="text-sm text-stone-400">
                                If this thought were a physical object, what would it look like?
                            </p>
                        </div>

                        {Object.entries(SHAPE_OPTIONS).map(([key, options]) => (
                            <div key={key} className="space-y-2">
                                <SectionLabel>{key}</SectionLabel>
                                <div className="flex flex-wrap gap-2">
                                    {options.map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => setShapeForm((prev) => ({ ...prev, [key]: opt }))}
                                            className={`px-3 py-1.5 rounded-full text-xs border transition-all ${shapeForm[key as keyof typeof shapeForm] === opt
                                                ? 'bg-amber-600/30 border-amber-500/50 text-amber-200'
                                                : 'bg-stone-800/40 border-stone-700/50 text-stone-400 hover:border-stone-600'
                                                }`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div className="space-y-2">
                            <SectionLabel>How concrete does it feel now? (1 = abstract, 10 = vivid)</SectionLabel>
                            <FusionSlider value={concreteness} onChange={setConcreteness} label="Concreteness" />
                        </div>

                        <button
                            onClick={() => completeExperiment('give-it-a-shape')}
                            disabled={!shapeForm.shape || !shapeForm.color}
                            className="w-full py-3 rounded-xl font-medium text-sm transition-all bg-amber-700/30 border border-amber-600/40 text-amber-200 hover:bg-amber-600/40 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Complete Experiment
                        </button>
                    </div>
                );

            case 'thank-your-mind':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-serif text-stone-100 mb-2">Thank Your Mind</h3>
                            <p className="text-sm text-stone-400">
                                Your mind generated this thought for a reason — usually protection.
                                Acknowledge its function without agreeing with its content.
                            </p>
                        </div>

                        <div className="bg-stone-900/60 border border-stone-800/50 rounded-xl p-5">
                            <p className="text-sm text-stone-300 leading-relaxed">
                                Take a breath. Place a hand on your chest if it feels right. Say, aloud or silently:
                            </p>
                            <p className="text-amber-300 font-serif mt-3 text-lg italic">
                                "Thank you, mind, for trying to protect me with this thought."
                            </p>
                        </div>

                        <div className="space-y-3">
                            <SectionLabel>What came up for you?</SectionLabel>
                            <ResponseChips
                                options={THANK_CHIPS}
                                selected={thankChips}
                                onToggle={(chip) =>
                                    setThankChips((prev) =>
                                        prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
                                    )
                                }
                            />
                        </div>

                        <button
                            onClick={() => completeExperiment('thank-your-mind')}
                            disabled={thankChips.length === 0}
                            className="w-full py-3 rounded-xl font-medium text-sm transition-all bg-amber-700/30 border border-amber-600/40 text-amber-200 hover:bg-amber-600/40 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Complete Experiment
                        </button>
                    </div>
                );

            default:
                return null;
        }
    };

    const renderLand = () => {
        const shift = session?.preFusionRating && postFusionRating
            ? session.preFusionRating - postFusionRating
            : 0;

        return (
            <div className="max-w-xl mx-auto space-y-8 animate-fade-in">
                <div className="space-y-2">
                    <h2 className="text-xl font-serif text-stone-100">Land</h2>
                    <p className="text-sm text-stone-400">How fused do you feel with this thought now?</p>
                </div>

                <FusionSlider
                    value={postFusionRating}
                    onChange={setPostFusionRating}
                    label="Post-experiment fusion rating"
                />

                {shift > 0 && (
                    <div className="bg-amber-950/20 border border-amber-800/30 rounded-lg p-3 text-sm text-amber-300">
                        ↓ {shift} point{shift > 1 ? 's' : ''} of shift. The thought hasn't changed — your relationship to it has.
                    </div>
                )}

                <div className="space-y-3">
                    <SectionLabel>One small valued action</SectionLabel>
                    <p className="text-xs text-stone-500">
                        Not a grand plan — just one tiny thing you can do in the next hour that matters to you, even while this thought is present.
                    </p>
                    <input
                        type="text"
                        value={chosenAction}
                        onChange={(e) => setChosenAction(e.target.value)}
                        placeholder="e.g. Text a friend, start that email, take a walk..."
                        className="w-full bg-stone-900/60 border border-stone-700/50 rounded-lg px-4 py-2.5 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-600/50 transition-all"
                    />
                </div>
            </div>
        );
    };

    const renderSummary = () => {
        const shift = (session?.preFusionRating || 0) - (postFusionRating || 0);
        const experiments = session?.experiments || [];

        return (
            <div className="max-w-xl mx-auto space-y-8 animate-fade-in">
                <div className="text-center space-y-3">
                    <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                        <Check size={28} className="text-amber-400" />
                    </div>
                    <h2 className="text-xl font-serif text-stone-100">Session Complete</h2>
                </div>

                <div className="bg-stone-900/60 border border-stone-800/50 rounded-xl p-6 space-y-5">
                    <div className="space-y-1">
                        <SectionLabel>Sticky Thought</SectionLabel>
                        <p className="text-sm text-stone-200 italic font-serif">"{session?.thought}"</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <SectionLabel>Before</SectionLabel>
                            <p className="text-2xl font-mono text-stone-400">{session?.preFusionRating}</p>
                        </div>
                        <div className="space-y-1">
                            <SectionLabel>After</SectionLabel>
                            <p className="text-2xl font-mono text-amber-400">{postFusionRating}</p>
                        </div>
                    </div>

                    {shift > 0 && (
                        <div className="text-sm text-amber-300/80">
                            ↓ {shift} point shift — defusion is working.
                        </div>
                    )}

                    <div className="space-y-1">
                        <SectionLabel>Experiments</SectionLabel>
                        <div className="flex flex-wrap gap-1">
                            {experiments.map((e, i) => (
                                <span key={i} className="px-2 py-0.5 rounded-full text-[10px] bg-amber-900/30 text-amber-400 border border-amber-800/30">
                                    {EXPERIMENT_LABELS[e.type].title}
                                </span>
                            ))}
                        </div>
                    </div>

                    {chosenAction && (
                        <div className="space-y-1">
                            <SectionLabel>Valued Action</SectionLabel>
                            <p className="text-sm text-stone-300">{chosenAction}</p>
                        </div>
                    )}
                </div>

                {session?.patternObservation && (
                    <div className="bg-amber-950/20 border border-amber-800/30 rounded-xl p-5 space-y-3">
                        <SectionLabel>Pattern Observation (from {3}+ sessions)</SectionLabel>
                        <p className="text-sm font-serif text-amber-200">{session.patternObservation.recurringStory}</p>
                        <p className="text-xs text-stone-400 leading-relaxed">{session.patternObservation.observation}</p>
                    </div>
                )}
            </div>
        );
    };

    // ─── Main Render ──────────────────────────────────────────────────────────

    return (
        <div className="fixed inset-0 z-50 bg-stone-950 flex flex-col overflow-hidden">
            {/* ── Header ── */}
            <header className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-stone-800/60 bg-stone-950/95 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-amber-900/30 text-amber-500">
                        {React.createElement(getIconComponent('DefusionPrism') || DefusionPrismIcon, { size: 18 })}
                    </div>
                    <div>
                        <h1 className="text-base font-serif text-stone-100">Defusion Lab</h1>
                        <p className="text-[10px] font-mono uppercase tracking-widest text-stone-500">
                            {STEPS[stepIdx]?.sub || ''}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {step !== 'ORIENTATION' && (
                        <button
                            onClick={() => {
                                setShowOrientation(true);
                            }}
                            className="p-1.5 rounded-lg text-stone-600 hover:text-stone-300 hover:bg-stone-800/50 transition-colors"
                            title="What is this?"
                        >
                            <HelpCircle size={16} />
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-stone-600 hover:text-stone-300 hover:bg-stone-800/50 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
            </header>

            {/* ── Body ── */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar (desktop) */}
                <nav className="hidden lg:flex flex-col w-56 shrink-0 border-r border-stone-800/50 bg-stone-950/80 p-4">
                    <div className="space-y-1 flex-1">
                        {STEPS.map((s, i) => {
                            const isCurrent = s.id === step;
                            const isPast = i < stepIdx;
                            return (
                                <div
                                    key={s.id}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${isCurrent
                                        ? 'bg-amber-900/20 text-amber-300 border border-amber-800/30'
                                        : isPast
                                            ? 'text-stone-400'
                                            : 'text-stone-600'
                                        }`}
                                >
                                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${isCurrent ? 'bg-amber-600/40 text-amber-200' : isPast ? 'bg-stone-700/40 text-stone-400' : 'bg-stone-800/40 text-stone-600'
                                        }`}>
                                        {isPast ? <Check size={10} /> : i + 1}
                                    </span>
                                    <div>
                                        <div className="font-medium">{s.label}</div>
                                        <div className="text-[10px] font-mono text-stone-600">{s.sub}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {marginalia}
                </nav>

                {/* Mobile progress bar */}
                <div className="lg:hidden fixed top-[52px] left-0 right-0 z-20 bg-stone-950/95 border-b border-stone-800/40 px-4 py-2">
                    <div className="flex gap-1">
                        {STEPS.map((s, i) => (
                            <div
                                key={s.id}
                                className={`h-1 rounded-full flex-1 transition-all ${i <= stepIdx ? 'bg-amber-600' : 'bg-stone-800'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Main content */}
                <main className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-12 py-8 lg:py-12 mt-6 lg:mt-0">
                    {step === 'ORIENTATION' && renderOrientation()}
                    {step === 'CATCH' && renderCatch()}
                    {step === 'EXPERIMENTS' && renderExperimentHub()}
                    {step === 'LAND' && renderLand()}
                    {step === 'SUMMARY' && renderSummary()}
                </main>
            </div>

            {/* ── Footer ── */}
            <footer className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 border-t border-stone-800/60 bg-stone-950/95 backdrop-blur-sm">
                <button
                    onClick={handleBack}
                    disabled={stepIdx === 0}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-stone-400 hover:text-stone-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft size={16} /> Back
                </button>

                <button
                    onClick={handleNext}
                    disabled={!canAdvance() || loading}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium transition-all bg-amber-700/40 border border-amber-600/50 text-amber-200 hover:bg-amber-600/50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <Loader2 size={16} className="animate-spin" /> Processing...
                        </>
                    ) : step === 'SUMMARY' ? (
                        <>Save & Close</>
                    ) : (
                        <>
                            {step === 'ORIENTATION' ? 'Begin' : 'Continue'} <ChevronRight size={16} />
                        </>
                    )}
                </button>
            </footer>

            {/* ── Orientation modal overlay ── */}
            {showOrientation && step !== 'ORIENTATION' && (
                <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-stone-900 border border-stone-700/50 rounded-2xl p-6 max-w-md w-full space-y-4 animate-fade-in">
                        <div className="flex items-center justify-between">
                            <h3 className="font-serif text-stone-100">About Defusion Lab</h3>
                            <button onClick={() => setShowOrientation(false)} className="text-stone-600 hover:text-stone-300">
                                <X size={16} />
                            </button>
                        </div>
                        <p className="text-sm text-stone-400 leading-relaxed">
                            Cognitive defusion is an ACT (Acceptance & Commitment Therapy) technique. Rather than fighting
                            or believing a thought, you practice <em>noticing</em> it — creating space between you and the thought.
                        </p>
                        <p className="text-sm text-stone-400 leading-relaxed">
                            This tool never evaluates whether your thoughts are "true" or "false." It only helps you
                            change your <em>relationship</em> to them.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
