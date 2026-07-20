import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { useSubscription } from '../../hooks/useSubscription';

interface PremiumPaywallModalProps {
    isOpen: boolean;
    onClose: () => void;
    featureName?: string;
}

export default function PremiumPaywallModal({ isOpen, onClose, featureName = 'This feature' }: PremiumPaywallModalProps) {
    const { isProOrAbove: isPremiumActive } = useSubscription();
    const [upgradeNotice, setUpgradeNotice] = useState(false);
    // TODO Phase 4: Once Stripe checkout is implemented, use actual loading state from useSubscription.
    const isLoading = false;

    const dialogRef = useRef<HTMLDivElement>(null);
    const firstFocusRef = useRef<HTMLButtonElement>(null);

    // Focus trap
    useEffect(() => {
        if (!isOpen) return;
        firstFocusRef.current?.focus();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') { onClose(); return; }
            if (e.key !== 'Tab') return;
            const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (!focusable || focusable.length === 0) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
                e.preventDefault();
                (e.shiftKey ? last : first).focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleUpgrade = () => {
        // TODO Phase 4: Implement Stripe checkout session redirection
        setUpgradeNotice(true);
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    ref={dialogRef}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="paywall-title"
                    aria-describedby="paywall-desc"
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 220, damping: 26, mass: 0.9 }}
                    className="relative w-full max-w-lg bg-stone-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden"
                >
                    {/* Subtle background glow — Level 4 Overlay elevation */}
                    <div className="absolute inset-0 bg-stone-900/60 opacity-50" />

                    <div className="relative p-8 sm:p-10 flex flex-col text-center space-y-6">
                        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-600/10 mb-2">
                            {/* Decorative — hidden from screen readers */}
                            <svg aria-hidden="true" className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 32 32" stroke="currentColor" strokeWidth={1.5}>
                                <polygon points="16,3 20,12 30,12 22,19 25,29 16,23 7,29 10,19 2,12 12,12" />
                            </svg>
                        </div>

                        <h2 id="paywall-title" className="text-2xl sm:text-3xl font-serif font-bold text-slate-100 tracking-tight">
                            Aura OS Premium
                        </h2>

                        <p id="paywall-desc" className="text-teal-300 font-medium">
                            {featureName} requires an active subscription
                        </p>

                        {upgradeNotice && (
                            <p role="status" className="text-amber-400 text-sm bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-2">
                                Stripe integration coming in Phase 4 — upgrade not yet available.
                            </p>
                        )}

                        <ul className="text-left text-slate-300 space-y-4 mt-6 mb-8 max-w-sm mx-auto w-full">
                            <li className="flex items-start gap-3">
                                <Check aria-hidden="true" className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                                <span>Unlimited Local LLM Intelligence</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check aria-hidden="true" className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                                <span>All 27 Specialized Practice Wizards</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check aria-hidden="true" className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                                <span>Cross-Device Cloud Syncing</span>
                            </li>
                        </ul>

                        <button
                            ref={firstFocusRef}
                            onClick={handleUpgrade}
                            disabled={isLoading || isPremiumActive}
                            className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-semibold text-lg transition-colors shadow-lg shadow-amber-600/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Checking status...' : isPremiumActive ? 'Already Premium' : 'Upgrade to Premium'}
                        </button>

                        <button
                            onClick={onClose}
                            className="min-h-[44px] px-4 text-stone-400 hover:text-white transition-colors text-sm mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900 rounded-lg"
                        >
                            Maybe Later
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
