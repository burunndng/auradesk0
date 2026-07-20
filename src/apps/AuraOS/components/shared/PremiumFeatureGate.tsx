import React, { useState } from 'react';
import { useSubscription } from '../../hooks/useSubscription';
import PremiumPaywallModal from './PremiumPaywallModal';
import { SacredLockIcon } from './SacredNavIcons';

interface PremiumFeatureGateProps {
    children: React.ReactNode;
    featureName: string;
    isPremiumFeature?: boolean;
}

/**
 * A wrapper component that gates premium features.
 * In Phase 4 Dormant Mode, this always allows access.
 */
export default function PremiumFeatureGate({
    children,
    featureName,
    isPremiumFeature = true
}: PremiumFeatureGateProps) {
    const { isProOrAbove } = useSubscription();
    const [showPaywall, setShowPaywall] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    // DORMANT_MODE = true means all premium features are unlocked for everyone.
    // Set to false when ready to launch Freemium.
    const DORMANT_MODE = false;

    const hasAccess = DORMANT_MODE || isProOrAbove || !isPremiumFeature || dismissed;

    if (!hasAccess) {
        return (
            <div
                className="relative w-full h-full min-h-[120px] flex items-center justify-center rounded-2xl overflow-hidden"
                style={{
                    background: 'linear-gradient(145deg, rgba(10,10,16,0.97), rgba(8,8,14,0.99))',
                    border: '1px solid rgba(99,102,241,0.18)',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
                }}
            >
                {/* Blurred background */}
                <div className="absolute inset-0 opacity-10 pointer-events-none blur-sm select-none" inert>
                    {children}
                </div>
                {/* Top edge highlight */}
                <div className="absolute inset-x-0 top-0 h-px"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)' }} />

                {/* Upgrade prompt */}
                <div className="relative z-10 flex flex-col items-center p-6 text-center gap-3">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                            background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
                            border: '1px solid rgba(99,102,241,0.25)',
                        }}
                    >
                        <SacredLockIcon size={22} className="text-indigo-300" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-indigo-400/70 font-mono mb-0.5">Pro</p>
                        <h3 className="text-sm font-semibold text-slate-200 font-serif">{featureName}</h3>
                    </div>
                    <button
                        onClick={() => setShowPaywall(true)}
                        className="px-5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-300"
                        style={{
                            background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.2))',
                            border: '1px solid rgba(99,102,241,0.35)',
                            color: '#c4b5fd',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99,102,241,0.4), rgba(139,92,246,0.3))')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.2))')}
                    >
                        Unlock
                    </button>
                    <button
                        onClick={() => setDismissed(true)}
                        className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors"
                    >
                        Maybe Later
                    </button>
                </div>

                <PremiumPaywallModal
                    isOpen={showPaywall}
                    onClose={() => { setShowPaywall(false); setDismissed(true); }}
                    featureName={featureName}
                />
            </div>
        );
    }

    return <>{children}</>;
}
