import React from 'react';
import { ActiveTab } from '../../types.ts';
import { QuaternityIcon, EyeOfHorusIcon, LotusIcon } from '../shared/SacredNavIcons';

interface InsightsHubTabProps {
    setActiveTab: (tab: ActiveTab) => void;
}

const insightItems = [
    {
        id: 'recommendations',
        label: 'Analysis',
        description: 'AI-powered practice suggestions',
        accentColor: 'rgba(99, 102, 241, 0.15)',
        borderColor: 'rgba(99, 102, 241, 0.22)',
        glowColor: 'rgba(99, 102, 241, 0.10)',
        iconColor: '#818cf8',
        Icon: EyeOfHorusIcon,
    },
    {
        id: 'my-insights',
        label: 'My Insights',
        description: 'Track detected patterns & address them',
        accentColor: 'rgba(45, 212, 191, 0.15)',
        borderColor: 'rgba(45, 212, 191, 0.22)',
        glowColor: 'rgba(45, 212, 191, 0.10)',
        iconColor: '#5eead4',
        Icon: LotusIcon,
    },
    {
        id: 'aqal',
        label: 'AQAL Report',
        description: 'Comprehensive integral analysis',
        accentColor: 'rgba(139, 92, 246, 0.18)',
        borderColor: 'rgba(139, 92, 246, 0.25)',
        glowColor: 'rgba(139, 92, 246, 0.12)',
        iconColor: '#a78bfa',
        Icon: QuaternityIcon,
    },
];

export default function InsightsHubTab({ setActiveTab }: InsightsHubTabProps) {
    return (
        <div className="max-w-4xl mx-auto pb-28 lg:pb-32">
            <div className="text-center mb-10 pb-6 border-b border-white/5">
                <div className="w-20 h-20 mx-auto rounded-full bg-stone-900/50 border border-purple-500/20 flex flex-col items-center justify-center mb-6 text-purple-400">
                    <QuaternityIcon size={32} />
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif text-slate-100 mb-4">
                    The Intelligence Hub
                </h1>
                <p className="text-slate-300 text-lg max-w-xl mx-auto font-light leading-relaxed">
                    Complete your first practice to generate cross-practice intelligence. As you engage with the various tools, this hub will automatically analyze your patterns.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {insightItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as ActiveTab)}
                        className="group relative p-6 rounded-2xl text-left transition-all duration-500 hover:-translate-y-0.5 active:scale-[0.98] w-full"
                        style={{
                            background: `linear-gradient(145deg, rgba(10, 10, 16, 0.97), rgba(8, 8, 14, 0.99))`,
                            border: `1px solid ${item.borderColor}`,
                            boxShadow: `0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)`,
                        }}
                    >
                        {/* Hover glow */}
                        <div
                            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                            style={{ background: `radial-gradient(ellipse at 30% 40%, ${item.accentColor} 0%, transparent 65%)` }}
                        />
                        {/* Subtle top edge highlight */}
                        <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl"
                            style={{ background: `linear-gradient(90deg, transparent, ${item.borderColor}, transparent)` }} />

                        <div className="relative z-10 flex items-start gap-4">
                            {/* Icon container */}
                            <div
                                className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-105"
                                style={{
                                    background: `radial-gradient(circle, ${item.accentColor} 0%, transparent 70%)`,
                                    border: `1px solid ${item.borderColor}`,
                                    boxShadow: `0 0 16px ${item.glowColor}`,
                                }}
                            >
                                <item.Icon size={24} />
                            </div>
                            <div className="flex-1 min-w-0 pt-0.5">
                                <h3 className="text-lg font-semibold text-slate-100 group-hover:text-white transition-colors mb-1 font-serif tracking-tight">
                                    {item.label}
                                </h3>
                                <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
