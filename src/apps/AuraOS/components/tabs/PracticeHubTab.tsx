import React from 'react';
import { ActiveTab } from '../../types.ts';
import {
    SquaredCircleIcon,
    TriquetraIcon,
    CompassRoseIcon,
} from '../shared/SacredNavIcons';

interface PracticeHubTabProps {
    setActiveTab: (tab: ActiveTab) => void;
}

const practiceItems = [
    {
        id: 'stack',
        label: 'My Stack',
        description: 'Your curated practice collection',
        Icon: SquaredCircleIcon,
        color: 'from-violet-950 to-purple-900',
        glowColor: 'rgba(139, 92, 246, 0.3)',
    },
    {
        id: 'tracker',
        label: 'Daily Tracker',
        description: 'Log completions and track progress',
        Icon: TriquetraIcon,
        color: 'from-emerald-950 to-teal-900',
        glowColor: 'rgba(20, 184, 166, 0.3)',
    },
    {
        id: 'browse',
        label: 'Browse Practices',
        description: 'Discover new practices to add',
        Icon: CompassRoseIcon,
        color: 'from-blue-950 to-indigo-900',
        glowColor: 'rgba(99, 102, 241, 0.3)',
    },
];

export default function PracticeHubTab({ setActiveTab }: PracticeHubTabProps) {
    return (
        <div className="max-w-4xl mx-auto pb-32">
            <div className="text-center mb-10">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mb-3">
                    Practice
                </h1>
                <p className="text-slate-300 text-lg">
                    Build and track your integral life practice
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {practiceItems.map((item) => {
                    const Icon = item.Icon;
                    
                    // High-contrast module colors
                    const getModuleStyles = (id: string) => {
                        switch(id) {
                            case 'stack': return 'border-purple-500/30 bg-stone-950 text-purple-400 shadow-purple-900/20';
                            case 'tracker': return 'border-emerald-500/30 bg-stone-950 text-emerald-400 shadow-emerald-900/20';
                            case 'streaks': return 'border-amber-500/30 bg-stone-950 text-amber-400 shadow-amber-900/20';
                            case 'browse': return 'border-teal-500/30 bg-stone-950 text-teal-400 shadow-teal-900/20';
                            default: return 'border-stone-700 bg-stone-950 text-stone-400';
                        }
                    };

                    const moduleStyles = getModuleStyles(item.id);

                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as ActiveTab)}
                            className="group relative p-6 rounded-2xl text-left transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
                            style={{
                                background: 'linear-gradient(135deg, rgba(15, 15, 20, 0.95), rgba(5, 5, 10, 0.98))',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.03)',
                            }}
                        >
                            <div
                                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                style={{
                                    background: `radial-gradient(circle at center, ${item.glowColor} 0%, transparent 70%)`,
                                }}
                            />
                            <div className="relative z-10 flex items-start gap-4">
                                <div
                                    className={`flex-shrink-0 w-14 h-14 rounded-xl border flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110 ${moduleStyles}`}
                                >
                                    <Icon size={28} className="text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-xl font-semibold text-slate-100 group-hover:text-white transition-colors mb-1 font-serif italic">
                                        {item.label}
                                    </h3>
                                    <p className="text-sm text-slate-300 group-hover:text-slate-300 transition-colors">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
