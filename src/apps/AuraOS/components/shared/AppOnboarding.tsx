import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useSpring as useFramerSpring } from 'framer-motion';
import { useSpring, animated } from '@react-spring/web';
import { ChevronRight, Check, Sparkles, ArrowRight } from 'lucide-react';
import { StorageManager } from '../../.claude/lib/storageManager';
import { updatePreferences } from '../../services/authService';
import {
    MerkabaIcon,
    TesseractIcon,
    ResonatorIcon,
    CelestialRoseIcon,
    ThirdEyeIcon,
    HyperTesseractIcon,
    AscensionFlameIcon,
} from '../visualizations/SacredGeometryIcons';

const ONBOARDING_KEY = 'aura-has-onboarded';

// AuraOS Showcase Video — 60s @ 1920x1080, 30fps
// Hosted on catbox.moe
const SHOWCASE_VIDEO_URL: string = 'https://files.catbox.moe/z9t72u.mp4';
const INTAKE_MCQ_KEY = 'aura-intake-mcq';

// Gateway wizards for the quadrant entry slide
const quadrantPaths = [
    {
        label: 'Understand Yourself',
        sublabel: 'Mind',
        description: 'Map your thinking patterns and developmental edges',
        color: 'text-teal-400',
        bg: 'bg-teal-500/10 border-teal-500/30',
        hoverGlow: 'rgba(45,212,191,0.12)',
        icon: <TesseractIcon size={28} color="currentColor" />,
        wizardId: 'kegan',
    },
    {
        label: 'Meet Your Unconscious',
        sublabel: 'Shadow',
        description: 'Explore the hidden parts driving your reactions',
        color: 'text-purple-400',
        bg: 'bg-purple-500/10 border-purple-500/30',
        hoverGlow: 'rgba(168,85,247,0.12)',
        icon: <ResonatorIcon size={28} color="currentColor" />,
        wizardId: 'ifs',
    },
    {
        label: 'Come Home to Your Body',
        sublabel: 'Body',
        description: 'Ground yourself through somatic awareness',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10 border-emerald-500/30',
        hoverGlow: 'rgba(52,211,153,0.12)',
        icon: <CelestialRoseIcon size={28} color="currentColor" />,
        wizardId: 'integral-body-architect',
    },
    {
        label: 'Go Deeper',
        sublabel: 'Spirit',
        description: 'Open to states beyond ordinary awareness',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/30',
        hoverGlow: 'rgba(251,191,36,0.12)',
        icon: <ThirdEyeIcon size={28} color="currentColor" />,
        wizardId: 'contemplative-inquiry',
    },
];

// Module cards for the Four Modules slide
const moduleCards = [
    { label: 'Mind', color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/30', icon: <TesseractIcon size={28} color="currentColor" /> },
    { label: 'Shadow', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30', icon: <ResonatorIcon size={28} color="currentColor" /> },
    { label: 'Body', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', icon: <CelestialRoseIcon size={28} color="currentColor" /> },
    { label: 'Spirit', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30', icon: <ThirdEyeIcon size={28} color="currentColor" /> },
];

const Q1_OPTIONS = [
    { value: "I'm stuck in a pattern I can't break", label: "I'm stuck in a pattern I can't break" },
    { value: 'I want to understand myself better', label: 'I want to understand myself better' },
    { value: "I'm going through a major transition", label: "I'm going through a major transition" },
    { value: 'Just exploring', label: 'Just exploring' },
] as const;

const Q2_OPTIONS = [
    { value: 'In my body — tension, numbness, restlessness', label: 'In my body', sub: 'tension, numbness, restlessness' },
    { value: 'In my mind — looping thoughts, confusion', label: 'In my mind', sub: 'looping thoughts, confusion' },
    { value: 'In my relationships — same dynamics repeating', label: 'In my relationships', sub: 'same dynamics repeating' },
    { value: "Not sure yet", label: 'Not sure yet', sub: '' },
] as const;

const Q3_OPTIONS = [
    { value: 'Therapy / coaching', label: 'Therapy / coaching' },
    { value: 'Meditation / mindfulness', label: 'Meditation / mindfulness' },
    { value: 'Somatic / body-based work', label: 'Somatic / body-based work' },
    { value: 'Shadow work / IFS', label: 'Shadow work / IFS' },
    { value: "Nothing yet — this is new", label: "Nothing yet — this is new" },
] as const;

function getFreeTextPrompt(q1: string): string {
    switch (q1) {
        case "I'm stuck in a pattern I can't break":
            return "In a sentence — what's the pattern?";
        case 'I want to understand myself better':
            return "What are you most curious about?";
        case "I'm going through a major transition":
            return "What's shifting?";
        case 'Just exploring':
            return "Anything you'd want the system to know about you?";
        default:
            return "What's the pattern you keep running into?";
    }
}

interface IntakeState {
    q1: string;
    q2: string;
    q3: string[];
    freeText: string;
}

interface AppOnboardingProps {
    onStartWizard?: (wizardId: string) => void;
}

// Option button with react-spring glow on selection
function OptionButton({
    selected,
    onClick,
    children,
    delay = 0,
}: {
    selected: boolean;
    onClick: () => void;
    children: React.ReactNode;
    delay?: number;
}) {
    // Spring-driven glow shadow
    const glowSpring = useSpring({
        boxShadow: selected
            ? '0 0 0 1px rgba(139,92,246,0.5), 0 0 18px rgba(139,92,246,0.18), inset 0 0 12px rgba(139,92,246,0.06)'
            : '0 0 0 1px rgba(68,64,60,0.6), 0 0 0px rgba(139,92,246,0), inset 0 0 0px rgba(139,92,246,0)',
        config: { tension: 280, friction: 24 },
    });

    return (
        <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay, duration: 0.3 }}
        >
            <animated.button
                onClick={onClick}
                style={glowSpring}
                className={`w-full text-left px-4 py-3 rounded-xl border-0 text-sm transition-colors duration-200 relative overflow-hidden group
                    ${selected
                        ? 'bg-violet-500/12 text-stone-100'
                        : 'bg-stone-900/40 text-stone-400 hover:text-stone-300 hover:bg-stone-800/40'
                    }`}
            >
                {/* Sliding left-border accent */}
                <motion.span
                    className="absolute left-0 top-0 bottom-0 w-0.5 bg-violet-400 rounded-r-full"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: selected ? 1 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    style={{ transformOrigin: 'top' }}
                />

                <span className="relative flex items-center justify-between">
                    <span>{children}</span>
                    {/* Checkmark spring-in */}
                    <AnimatePresence>
                        {selected && (
                            <motion.span
                                key="check"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                                className="ml-2 shrink-0 w-4 h-4 rounded-full bg-violet-500/30 border border-violet-400/50 flex items-center justify-center"
                            >
                                <Check size={9} className="text-violet-300" strokeWidth={2.5} />
                            </motion.span>
                        )}
                    </AnimatePresence>
                </span>
            </animated.button>
        </motion.div>
    );
}

// Intake slide component
function IntakeSlide({ onNext, onSkip }: { onNext: (intake: IntakeState) => void; onSkip: () => void }) {
    const [q1, setQ1] = useState('');
    const [q2, setQ2] = useState('');
    const [q3, setQ3] = useState<string[]>([]);
    const [freeText, setFreeText] = useState('');
    const [focusedQuestion, setFocusedQuestion] = useState(1);
    const [charCountVisible, setCharCountVisible] = useState(false);
    const charCountTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    // Restore MCQ answers from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(INTAKE_MCQ_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.q1) setQ1(parsed.q1);
                if (parsed.q2) setQ2(parsed.q2);
                if (parsed.q3) setQ3(parsed.q3);
            }
        } catch { /* ignore */ }
    }, []);

    // Persist MCQ to localStorage as user selects
    useEffect(() => {
        if (q1 || q2 || q3.length > 0) {
            localStorage.setItem(INTAKE_MCQ_KEY, JSON.stringify({ q1, q2, q3 }));
        }
    }, [q1, q2, q3]);

    // Auto-advance focus
    useEffect(() => {
        if (q1 && focusedQuestion === 1) setFocusedQuestion(2);
    }, [q1]);
    useEffect(() => {
        if (q2 && focusedQuestion === 2) setFocusedQuestion(3);
    }, [q2]);
    useEffect(() => {
        if (q3.length > 0 && focusedQuestion === 3) setFocusedQuestion(4);
    }, [q3]);

    const toggleQ3 = (val: string) => {
        if (val === "Nothing yet — this is new") {
            setQ3(q3.includes(val) ? [] : [val]);
        } else {
            setQ3(prev => {
                const without = prev.filter(v => v !== "Nothing yet — this is new");
                return without.includes(val) ? without.filter(v => v !== val) : [...without, val];
            });
        }
    };

    const handleFreeTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFreeText(e.target.value);
        setCharCountVisible(true);
        if (charCountTimer.current) clearTimeout(charCountTimer.current);
        charCountTimer.current = setTimeout(() => setCharCountVisible(false), 2000);
    };

    // Progress: count answered questions (q1, q2, q3 each = 1, freeText is optional)
    const answeredCount = [q1, q2, q3.length > 0 ? 'yes' : ''].filter(Boolean).length;
    const totalRequired = 3;

    const freeTextPrompt = q1 ? getFreeTextPrompt(q1) : "What's the pattern you keep running into?";
    const canContinue = q1 && q2 && q3.length > 0;

    // Spring scale for continue button
    const continueSpring = useSpring({
        transform: canContinue ? 'scale(1)' : 'scale(0.88)',
        opacity: canContinue ? 1 : 0,
        config: { tension: 380, friction: 22 },
    });

    return (
        <div className="relative px-5 pt-6 pb-5 flex flex-col space-y-4 max-h-[80dvh] overflow-y-auto">
            {/* Header with subtle noise shimmer behind */}
            <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-center relative"
            >
                {/* Subtle radial shimmer behind heading */}
                <div className="absolute inset-0 pointer-events-none"
                    style={{
                        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(139,92,246,0.07) 0%, transparent 70%)',
                    }}
                />
                <div className="relative">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-400/20 mb-3">
                        <Sparkles size={11} className="text-violet-400" />
                        <span className="text-[10px] font-semibold tracking-widest uppercase text-violet-300">A few quick questions</span>
                    </div>
                    <h1 className="text-xl font-serif font-bold text-stone-100 tracking-tight">Help us see you clearly</h1>
                    <p className="text-xs text-stone-500 mt-1">This makes your first reading specific to you</p>

                    {/* Progress indicator */}
                    <AnimatePresence>
                        {answeredCount > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="mt-2 flex items-center justify-center gap-2"
                            >
                                <div className="flex gap-1">
                                    {Array.from({ length: totalRequired }).map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="h-0.5 w-4 rounded-full"
                                            animate={{
                                                backgroundColor: i < answeredCount ? 'rgba(139,92,246,0.7)' : 'rgba(68,64,60,0.5)',
                                            }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    ))}
                                </div>
                                <span className="text-[10px] text-stone-600">{answeredCount} of {totalRequired} answered</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Q1 */}
            <div className="space-y-2">
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-xs font-medium text-stone-400 uppercase tracking-wider"
                >
                    What brings you here right now?
                </motion.p>
                <div className="space-y-1.5">
                    {Q1_OPTIONS.map((opt, i) => (
                        <OptionButton key={opt.value} selected={q1 === opt.value} onClick={() => setQ1(opt.value)} delay={0.12 + i * 0.05}>
                            {opt.label}
                        </OptionButton>
                    ))}
                </div>
            </div>

            {/* Q2 — revealed after Q1 */}
            <AnimatePresence>
                {(q1 || focusedQuestion >= 2) && (
                    <motion.div
                        key="q2"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-2"
                    >
                        <p className="text-xs font-medium text-stone-400 uppercase tracking-wider">Where do you feel it most?</p>
                        <div className="space-y-1.5">
                            {Q2_OPTIONS.map((opt, i) => (
                                <OptionButton key={opt.value} selected={q2 === opt.value} onClick={() => setQ2(opt.value)} delay={i * 0.04}>
                                    <span className="font-medium">{opt.label}</span>
                                    {opt.sub && <span className="text-stone-500 ml-1">— {opt.sub}</span>}
                                </OptionButton>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Q3 — revealed after Q2 */}
            <AnimatePresence>
                {(q2 || focusedQuestion >= 3) && (
                    <motion.div
                        key="q3"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-2"
                    >
                        <p className="text-xs font-medium text-stone-400 uppercase tracking-wider">
                            What have you worked with before? <span className="normal-case text-stone-600">(pick all that apply)</span>
                        </p>
                        <div className="space-y-1.5">
                            {Q3_OPTIONS.map((opt, i) => (
                                <OptionButton key={opt.value} selected={q3.includes(opt.value)} onClick={() => toggleQ3(opt.value)} delay={i * 0.04}>
                                    {opt.label}
                                </OptionButton>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Free text — revealed after Q3 */}
            <AnimatePresence>
                {(q3.length > 0 || focusedQuestion >= 4) && (
                    <motion.div
                        key="freetext"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-2"
                    >
                        <div className="flex items-start justify-between">
                            <p className="text-xs font-medium text-stone-400 uppercase tracking-wider">{freeTextPrompt}</p>
                            <span className="text-[10px] text-stone-600 ml-2 mt-0.5 shrink-0">optional</span>
                        </div>
                        <div className="relative">
                            <textarea
                                ref={textAreaRef}
                                value={freeText}
                                onChange={handleFreeTextChange}
                                placeholder="This is what makes your reading specific to you…"
                                rows={2}
                                className="w-full bg-stone-900/60 border border-stone-700/60 rounded-xl px-4 py-3 text-sm text-stone-300 placeholder-stone-600 resize-none focus:outline-none focus:border-violet-400/50 focus:bg-stone-900/80 transition-all duration-200"
                                style={{
                                    boxShadow: undefined,
                                }}
                                onFocus={e => {
                                    e.currentTarget.style.boxShadow = '0 0 16px rgba(139,92,246,0.12)';
                                }}
                                onBlur={e => {
                                    e.currentTarget.style.boxShadow = '';
                                }}
                            />
                            {/* Character count — fades in on typing, fades out after pause */}
                            <AnimatePresence>
                                {freeText.length > 0 && charCountVisible && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute bottom-2 right-3 text-[10px] text-stone-600 pointer-events-none"
                                    >
                                        {freeText.length}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                            {/* Persistent dot indicator when text present but count hidden */}
                            {freeText && !charCountVisible && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-violet-500/20 border border-violet-400/40 flex items-center justify-center"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                                </motion.div>
                            )}
                        </div>
                        <p className="text-[10px] text-stone-600 leading-relaxed">
                            This shapes your portrait. The more specific, the sharper the reading.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer */}
            <div className="pt-2 border-t border-stone-800/60 flex items-center justify-between">
                <button onClick={onSkip} className="text-xs text-stone-600 hover:text-stone-400 transition-colors">
                    Skip for now
                </button>

                {/* Spring-driven continue button */}
                <animated.div style={continueSpring} className="pointer-events-none">
                    <motion.button
                        onClick={() => canContinue && onNext({ q1, q2, q3, freeText })}
                        disabled={!canContinue}
                        className="pointer-events-auto flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-900/30 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-stone-950 group"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        Continue
                        <motion.span
                            className="inline-flex"
                            animate={{ x: 0 }}
                            whileHover={{ x: 3 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        >
                            <ArrowRight size={16} />
                        </motion.span>
                    </motion.button>
                </animated.div>
            </div>
        </div>
    );
}

export default function AppOnboarding({ onStartWizard }: AppOnboardingProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(0);
    const nextButtonRef = useRef<HTMLButtonElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const hasOnboarded = StorageManager.getUntyped(ONBOARDING_KEY);
        if (!hasOnboarded) {
            setIsOpen(true);
        }
    }, []);

    useEffect(() => {
        if (isOpen && nextButtonRef.current) {
            nextButtonRef.current.focus();
        }
    }, [isOpen, step]);

    useEffect(() => {
        if (!isOpen) return;
        const handleTab = (e: KeyboardEvent) => {
            if (e.key !== 'Tab' || !dialogRef.current) return;
            const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey) {
                if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
            } else {
                if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
            }
        };
        document.addEventListener('keydown', handleTab);
        return () => document.removeEventListener('keydown', handleTab);
    }, [isOpen]);

    if (!isOpen) return null;

    const handleComplete = () => {
        StorageManager.setUntyped(ONBOARDING_KEY, true);
        setIsOpen(false);
    };

    const handleNext = () => {
        if (step < slides.length - 1) {
            setStep(s => s + 1);
        } else {
            handleComplete();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            handleComplete();
        }
    };

    const handleIntakeComplete = async (intake: IntakeState) => {
        updatePreferences({
            firstSessionIntake: {
                whatBringsYouHere: intake.q1,
                whereYouFeelIt: intake.q2,
                priorModalities: intake.q3,
                patternFreeText: intake.freeText || undefined,
                completedAt: new Date().toISOString(),
            },
        }).catch(() => { /* non-critical */ });

        try {
            localStorage.setItem('aura-intake-data', JSON.stringify({
                whatBringsYouHere: intake.q1,
                whereYouFeelIt: intake.q2,
                priorModalities: intake.q3,
                patternFreeText: intake.freeText || undefined,
                completedAt: new Date().toISOString(),
            }));
        } catch { /* ignore */ }

        setStep(s => s + 1);
    };

    const slides = [
        {
            id: 'welcome',
            title: "Welcome to Aura OS",
            subtitle: "Your Integral Life Practice Environment",
            description: "A digital architecture for human development, built on the four quadrants of integral theory — Body, Mind, Spirit, and Shadow — woven together into one living practice.",
            icon: (
                <div className="text-amber-400 mb-4">
                    <MerkabaIcon size={72} color="currentColor" />
                </div>
            ),
            accentBorder: 'border-amber-500/30',
            accentDot: 'bg-amber-500',
            subtitleColor: 'text-amber-300',
            gradient: 'from-amber-600/10 via-stone-900 to-stone-950',
            buttonColor: 'bg-amber-600 hover:bg-amber-500 shadow-lg shadow-amber-900/30 focus:ring-amber-400',
        },
        {
            id: 'showcase',
            isVideoSlide: true,
            title: "See AuraOS in Action",
            subtitle: "60-second overview",
            description: '',
            icon: null,
            accentBorder: 'border-amber-500/20',
            accentDot: 'bg-amber-500',
            subtitleColor: 'text-amber-300',
            gradient: 'from-amber-700/8 via-stone-900 to-stone-950',
            buttonColor: 'bg-amber-600 hover:bg-amber-500 shadow-lg shadow-amber-900/30 focus:ring-amber-400',
        },
        {
            id: 'modules',
            title: "The Four Modules",
            subtitle: "A balanced practice ecosystem",
            description: "Every part of you requires a different kind of attention. Mind for cognitive restructuring, Shadow for hidden integration, Body for somatic grounding, Spirit for non-dual awareness.",
            icon: (
                <div className="grid grid-cols-2 gap-3 mb-4 w-fit mx-auto">
                    {moduleCards.map(m => (
                        <div key={m.label} className={`w-16 h-16 rounded-xl border flex flex-col items-center justify-center gap-1 ${m.bg} ${m.color}`}>
                            {m.icon}
                            <span className="text-[10px] font-semibold tracking-wide opacity-80">{m.label}</span>
                        </div>
                    ))}
                </div>
            ),
            accentBorder: 'border-teal-500/30',
            accentDot: 'bg-teal-500',
            subtitleColor: 'text-teal-300',
            gradient: 'from-teal-600/10 via-stone-900 to-stone-950',
            buttonColor: 'bg-teal-600 hover:bg-teal-500 shadow-lg shadow-teal-900/30 focus:ring-teal-400',
        },
        {
            id: 'hub',
            title: "The Intelligence Hub",
            subtitle: "Pattern recognition across your life",
            description: "As you complete practices, Aura analyzes your sessions locally — connecting dots between physical symptoms, recurring shadow projections, and cognitive biases into one synthesized picture.",
            icon: (
                <div className="text-purple-400 mb-4">
                    <HyperTesseractIcon size={72} color="currentColor" />
                </div>
            ),
            accentBorder: 'border-purple-500/30',
            accentDot: 'bg-purple-500',
            subtitleColor: 'text-purple-300',
            gradient: 'from-purple-600/10 via-stone-900 to-stone-950',
            buttonColor: 'bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-900/30 focus:ring-purple-400',
        },
        {
            id: 'ready',
            title: "Ready to Begin?",
            subtitle: "Your data is entirely under your control",
            description: "Practice freely with local storage, or create an account to unlock cloud sync, cross-device access, and the full Intelligence Hub experience.",
            icon: (
                <div className="text-emerald-400 mb-4">
                    <AscensionFlameIcon size={72} color="currentColor" />
                </div>
            ),
            accentBorder: 'border-emerald-500/30',
            accentDot: 'bg-emerald-500',
            subtitleColor: 'text-emerald-300',
            gradient: 'from-emerald-600/10 via-stone-900 to-stone-950',
            buttonColor: 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-900/30 focus:ring-emerald-400',
        },
        {
            id: 'intake',
            isIntakeSlide: true,
            title: '',
            subtitle: '',
            description: '',
            icon: null,
            accentBorder: 'border-violet-500/20',
            accentDot: 'bg-violet-500',
            subtitleColor: 'text-violet-300',
            gradient: 'from-violet-700/8 via-stone-900 to-stone-950',
        },
        {
            id: 'choose',
            title: "Where do you want to start?",
            subtitle: "Choose your entry point",
            description: "",
            icon: null,
            accentBorder: 'border-slate-600/40',
            accentDot: 'bg-slate-500',
            subtitleColor: 'text-slate-300',
            gradient: 'from-slate-700/10 via-stone-900 to-stone-950',
            isQuadrantSlide: true,
        },
    ];

    const slide = slides[step];
    if (!slide) return null;

    return (
        <div
            ref={dialogRef}
            className="fixed bottom-0 left-0 right-0 z-[100] flex items-end justify-center p-4 sm:p-6 pb-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="onboarding-title"
            onKeyDown={handleKeyDown}
        >
            {/* Backdrop blur */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={handleComplete}
            />

            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 24, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -16, scale: 0.97 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className={`relative w-full max-w-lg bg-stone-950 border ${slide.accentBorder} rounded-2xl shadow-2xl overflow-hidden`}
                >
                    {/* Background gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} opacity-60 transition-all duration-700`} />

                    {/* Top decorative line */}
                    <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-current to-transparent ${slide.subtitleColor} opacity-40`} />

                    {'isVideoSlide' in slide && slide.isVideoSlide ? (
                        <div className="relative flex flex-col">
                            {/* Video area */}
                            <div className="relative w-full bg-black" style={{ aspectRatio: '16/9' }}>
                                {SHOWCASE_VIDEO_URL ? (
                                    SHOWCASE_VIDEO_URL.includes('youtube') || SHOWCASE_VIDEO_URL.includes('youtu.be') || SHOWCASE_VIDEO_URL.includes('vimeo') ? (
                                        <iframe
                                            src={SHOWCASE_VIDEO_URL}
                                            className="absolute inset-0 w-full h-full"
                                            allow="autoplay; fullscreen"
                                            allowFullScreen
                                        />
                                    ) : (
                                        <video
                                            src={SHOWCASE_VIDEO_URL}
                                            className="absolute inset-0 w-full h-full object-cover"
                                            controls
                                            playsInline
                                        />
                                    )
                                ) : (
                                    /* Placeholder until video is hosted */
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-stone-900/80">
                                        <div className="text-amber-400/60">
                                            <MerkabaIcon size={48} color="currentColor" />
                                        </div>
                                        <p className="text-stone-500 text-xs tracking-wide">Video coming soon</p>
                                    </div>
                                )}
                            </div>
                            {/* Footer */}
                            <div className="relative px-6 py-4 bg-stone-950/70 border-t border-stone-800/60">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <p className="text-stone-100 text-sm font-semibold">{slide.title}</p>
                                        <p className={`text-xs uppercase tracking-wide ${slide.subtitleColor}`}>{slide.subtitle}</p>
                                    </div>
                                    <button
                                        onClick={handleNext}
                                        className="text-xs text-stone-500 hover:text-stone-300 transition-colors"
                                    >
                                        Skip
                                    </button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-1.5 items-center">
                                        {slides.map((_, idx) => (
                                            <motion.div
                                                key={idx}
                                                animate={{ width: idx === step ? 24 : 6, opacity: idx === step ? 1 : 0.35 }}
                                                transition={{ duration: 0.3 }}
                                                className={`h-1.5 rounded-full ${slide.accentDot}`}
                                            />
                                        ))}
                                    </div>
                                    <button
                                        ref={nextButtonRef}
                                        onClick={handleNext}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-950 ${'buttonColor' in slide ? slide.buttonColor : 'bg-amber-600 hover:bg-amber-500'}`}
                                    >
                                        Continue <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : ('isIntakeSlide' in slide && slide.isIntakeSlide) ? (
                        <IntakeSlide
                            onNext={handleIntakeComplete}
                            onSkip={() => setStep(s => s + 1)}
                        />
                    ) : ('isQuadrantSlide' in slide && slide.isQuadrantSlide) ? (
                        <div className="relative px-6 pt-8 pb-6 flex flex-col items-center text-center space-y-4">
                            <motion.h1
                                id="onboarding-title"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1, duration: 0.4 }}
                                className="text-2xl font-serif font-bold text-stone-100 tracking-tight"
                            >
                                {slide.title}
                            </motion.h1>
                            <motion.h2
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.15, duration: 0.4 }}
                                className="text-xs font-medium tracking-wide uppercase text-slate-400"
                            >
                                {slide.subtitle}
                            </motion.h2>
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.4 }}
                                className="grid grid-cols-2 gap-3 w-full mt-2"
                            >
                                {quadrantPaths.map((path) => (
                                    <motion.button
                                        key={path.wizardId}
                                        whileHover={{
                                            scale: 1.03,
                                            y: -2,
                                            boxShadow: `0 8px 24px ${path.hoverGlow}, 0 0 0 1px ${path.hoverGlow}`,
                                        }}
                                        whileTap={{ scale: 0.97 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 24 }}
                                        onClick={() => {
                                            handleComplete();
                                            onStartWizard?.(path.wizardId);
                                        }}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-left transition-colors duration-200 ${path.bg} ${path.color}`}
                                    >
                                        {path.icon}
                                        <span className="text-xs font-bold tracking-wide">{path.label}</span>
                                        <span className="text-[10px] text-stone-400 leading-tight">{path.description}</span>
                                    </motion.button>
                                ))}
                            </motion.div>
                            <div className="relative w-full pt-4 border-t border-stone-800/60 flex items-center justify-between">
                                <div className="flex gap-1.5 items-center">
                                    {slides.map((_, idx) => (
                                        <motion.div
                                            key={idx}
                                            animate={{ width: idx === step ? 24 : 6, opacity: idx === step ? 1 : 0.35 }}
                                            transition={{ duration: 0.3 }}
                                            className={`h-1.5 rounded-full ${slide.accentDot}`}
                                        />
                                    ))}
                                </div>
                                <button
                                    onClick={handleComplete}
                                    className="text-xs text-stone-500 hover:text-stone-300 transition-colors"
                                >
                                    Skip for now
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                        <div className="relative px-8 pt-12 pb-8 flex flex-col items-center text-center space-y-5 min-h-[380px] justify-center">
                            {/* Icon */}
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            >
                                {slide.icon}
                            </motion.div>

                            <motion.h1
                                id="onboarding-title"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15, duration: 0.4 }}
                                className="text-2xl sm:text-3xl font-serif font-bold text-stone-100 tracking-tight"
                            >
                                {slide.title}
                            </motion.h1>

                            <motion.h2
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.4 }}
                                className={`text-sm font-medium tracking-wide uppercase ${slide.subtitleColor}`}
                            >
                                {slide.subtitle}
                            </motion.h2>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.25, duration: 0.4 }}
                                className="text-stone-400 text-sm sm:text-base leading-relaxed max-w-sm mx-auto"
                            >
                                {slide.description}
                            </motion.p>
                        </div>

                        {/* Footer */}
                        <div className="relative px-8 py-5 bg-stone-950/70 border-t border-stone-800/60 flex items-center justify-between">
                            {/* Progress dots */}
                            <div className="flex gap-1.5 items-center">
                                {slides.map((_, idx) => (
                                    <motion.div
                                        key={idx}
                                        animate={{ width: idx === step ? 24 : 6, opacity: idx === step ? 1 : 0.35 }}
                                        transition={{ duration: 0.3 }}
                                        className={`h-1.5 rounded-full ${slide.accentDot}`}
                                    />
                                ))}
                            </div>

                            <motion.button
                                ref={nextButtonRef}
                                onClick={handleNext}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-950 ${'buttonColor' in slide ? slide.buttonColor : ''} group`}
                            >
                                Continue
                                <motion.span
                                    animate={{ x: 0 }}
                                    whileHover={{ x: 3 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                >
                                    <ChevronRight size={16} />
                                </motion.span>
                            </motion.button>
                        </div>
                        </>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
