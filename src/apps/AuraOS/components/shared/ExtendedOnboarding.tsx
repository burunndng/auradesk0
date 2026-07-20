import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X } from 'lucide-react';
import { StorageManager } from '../../.claude/lib/storageManager';
import {
    HyperTesseractIcon,
    ThirdEyeIcon,
    MerkabaIcon,
    TesseractIcon,
    AscensionFlameIcon,
} from '../visualizations/SacredGeometryIcons';

const DISMISSED_KEY = 'aura-extended-onboarding-dismissed';

const steps = [
    {
        icon: MerkabaIcon,
        color: 'text-amber-400',
        glow: 'from-amber-600/20 to-transparent',
        border: 'border-amber-500/20',
        bg: 'bg-amber-500/8',
        title: 'Pick a module',
        description: 'Mind, Body, Spirit, or Shadow — each domain has tools built for a specific dimension of your development.',
        index: '01',
    },
    {
        icon: TesseractIcon,
        color: 'text-teal-400',
        glow: 'from-teal-600/20 to-transparent',
        border: 'border-teal-500/20',
        bg: 'bg-teal-500/8',
        title: 'Run a wizard',
        description: 'Step-by-step guided sessions that end with an AI-generated insight saved to your practice history.',
        index: '02',
    },
    {
        icon: HyperTesseractIcon,
        color: 'text-purple-400',
        glow: 'from-purple-600/20 to-transparent',
        border: 'border-purple-500/20',
        bg: 'bg-purple-500/8',
        title: 'Your Intelligence Hub',
        description: 'After several sessions, it synthesizes patterns across all your work into one coherent picture.',
        index: '03',
    },
    {
        icon: ThirdEyeIcon,
        color: 'text-rose-400',
        glow: 'from-rose-600/20 to-transparent',
        border: 'border-rose-500/20',
        bg: 'bg-rose-500/8',
        title: 'Start in Learn',
        description: 'New here? Head to Browse → Start Here for a curated path through the most foundational tools.',
        index: '04',
    },
    {
        icon: AscensionFlameIcon,
        color: 'text-emerald-400',
        glow: 'from-emerald-600/20 to-transparent',
        border: 'border-emerald-500/20',
        bg: 'bg-emerald-500/8',
        title: 'Browse All Practices',
        description: 'Tap "Browse" to explore the full library — 47 wizards organized by module and type.',
        index: '05',
    },
];

const SPRING = { type: 'spring', stiffness: 220, damping: 26, mass: 0.9 } as const;
const QUICK  = { duration: 0.18, ease: [0.25, 0.1, 0.25, 1.0] } as const;

export default function ExtendedOnboarding() {
    const [open, setOpen]           = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        if (StorageManager.getUntyped(DISMISSED_KEY)) setDismissed(true);
    }, []);

    const handleReopen = () => {
        StorageManager.setUntyped(DISMISSED_KEY, false);
        setDismissed(false);
        setOpen(true);
    };

    const handleDismiss = () => {
        StorageManager.setUntyped(DISMISSED_KEY, true);
        setDismissed(true);
        setOpen(false);
    };

    // Permanently dismissed and user hasn't re-opened — show a quiet re-entry link
    if (dismissed && !open) {
        return (
            <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                onClick={handleReopen}
                className="flex items-center gap-1.5 mx-auto text-[11px] font-mono text-stone-700 hover:text-stone-500 tracking-[0.1em] uppercase transition-colors duration-150"
            >
                <span>How to use AuraOS</span>
                <span className="opacity-40">↓</span>
            </motion.button>
        );
    }

    return (
        <div className="w-full max-w-lg mx-auto">
            {/* Collapsed trigger row */}
            <motion.button
                type="button"
                onClick={(e) => { e.preventDefault(); setOpen(v => !v); }}
                whileHover={{ opacity: 0.85 }}
                whileTap={{ scale: 0.99 }}
                transition={QUICK}
                className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl border border-stone-800/50 bg-stone-950/60 hover:border-stone-700/60 transition-colors duration-200 group"
                aria-expanded={open}
            >
                <div className="flex items-center gap-3">
                    <div className="h-px w-5 bg-gradient-to-r from-teal-500/50 to-transparent" />
                    <span className="text-[11px] font-mono text-teal-400/60 tracking-[0.15em] uppercase">Getting started</span>
                    <span className="text-[11px] font-mono text-stone-600 tracking-wider">·  Five things to know</span>
                </div>
                <motion.div
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1.0] }}
                >
                    <ChevronDown size={14} className="text-stone-600 group-hover:text-stone-400 transition-colors" />
                </motion.div>
            </motion.button>

            {/* Expanded content */}
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={SPRING}
                        className="overflow-hidden"
                    >
                        <div className="relative mt-1 rounded-xl border border-stone-800/40 bg-stone-950 overflow-hidden">
                            {/* Top accent */}
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />
                            {/* Inner glow */}
                            <div className="absolute inset-0 bg-gradient-to-b from-teal-600/4 via-transparent to-purple-600/4 pointer-events-none" />

                            {/* Header */}
                            <div className="relative flex items-start justify-between px-6 pt-6 pb-0">
                                <div>
                                    <h2 className="text-lg font-serif font-light text-stone-100 tracking-wide leading-snug">
                                        Five things to know
                                    </h2>
                                    <p className="text-xs text-stone-500 mt-1 font-light">
                                        Everything you need to begin your practice.
                                    </p>
                                </div>
                                <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.92 }}
                                    transition={QUICK}
                                    onClick={handleDismiss}
                                    className="p-1.5 -mr-1 -mt-1 rounded-lg text-stone-700 hover:text-stone-400 hover:bg-stone-800/50 transition-colors"
                                    aria-label="Dismiss"
                                >
                                    <X size={14} />
                                </motion.button>
                            </div>

                            {/* Steps */}
                            <div className="relative px-6 pt-5 pb-3 space-y-2.5">
                                {steps.map((step, i) => {
                                    const Icon = step.icon;
                                    return (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ ...SPRING, delay: 0.06 + i * 0.06 }}
                                            className={`flex items-start gap-3.5 rounded-xl border ${step.border} ${step.bg} px-4 py-3 hover:border-white/10 transition-colors duration-200`}
                                        >
                                            <div className={`relative flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${step.color}`}>
                                                <div className={`absolute inset-0 rounded-lg bg-gradient-to-br ${step.glow} opacity-60`} />
                                                <Icon size={20} color="currentColor" />
                                            </div>
                                            <div className="flex-1 min-w-0 pt-0.5">
                                                <div className="flex items-baseline gap-2">
                                                    <span className={`text-[10px] font-mono ${step.color} opacity-50 tabular-nums`}>{step.index}</span>
                                                    <span className="text-sm font-semibold text-stone-200 tracking-tight">{step.title}</span>
                                                </div>
                                                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed font-light">{step.description}</p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Footer */}
                            <div className="relative px-6 py-4 flex items-center justify-end border-t border-stone-800/50 mt-1">
                                <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    transition={QUICK}
                                    onClick={handleDismiss}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600/12 hover:bg-teal-600/22 border border-teal-500/20 hover:border-teal-500/35 text-teal-300 text-xs font-semibold transition-all duration-150"
                                >
                                    Got it
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
