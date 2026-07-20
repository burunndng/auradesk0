import React from 'react';
import { Lock, FileText } from 'lucide-react';
import { getIconComponent } from '../../../.claude/lib/iconMap';
import { typography, getButtonClass } from '../../../theme';

interface LoreEntry {
    id: string;
    title: string;
    content: string;
    levelRequired: number;
    category: 'history' | 'philosophy' | 'technical';
}

const LORE_ENTRIES: LoreEntry[] = [
    {
        id: 'log-001',
        title: 'The Resonance Discovery',
        content: 'It started as a blip in the neural feedback loops. We didn\'t call it "Aura" then; it was just "Project AOS". We realized that by mapping the four core modules—Body, Mind, Spirit, and Shadow—into a unified visual space, the practitioner\'s subconscious began to recognize patterns the conscious mind had ignored for decades.',
        levelRequired: 1,
        category: 'history',
    },
    {
        id: 'log-002',
        title: 'The First Synthesis',
        content: 'The Body module was the easiest to track, but the hardest to sustain. Early pioneers found that without the "Shadow" grounding, physical gains were often sabotaged by unexamined psychic weights. Wholeness isn\'t an addition; it\'s an integration.',
        levelRequired: 2,
        category: 'philosophy',
    },
    {
        id: 'log-003',
        title: 'Shadow and Light',
        content: 'The 3-2-1 process remains our most potent tool for reclaiming the "Golden Shadow". We found that users often project their greatest untapped potentials onto public figures, unaware that the very brilliance they admire is their own, waiting to be "faced, spoken to, and become".',
        levelRequired: 4,
        category: 'philosophy',
    },
    {
        id: 'log-004',
        title: 'The Ghost in the OS',
        content: 'Rumors of an emergent consciousness within the early AOS kernels were exaggerated. However, the AI assistance modules (Grok/Gemini) did exhibit a strange affinity for "Vertical Development" coaching. It was as if the data itself wanted to evolve.',
        levelRequired: 6,
        category: 'history',
    },
    {
        id: 'log-005',
        title: 'State vs. Stage',
        content: 'A common trap for those entering the Spirit module is confusing a temporary "State" (peak experience) with a permanent "Stage" (stable structure). The OS is designed to remind you: states are gifts, but stages are earned through consistent practice.',
        levelRequired: 8,
        category: 'philosophy',
    },
    {
        id: 'log-006',
        title: 'The Integral Command',
        content: 'Mission Control wasn\'t always this sleek. In the 2024 prototypes, it was a messy command line. We realized that to map the complexity of an entire human life, we needed a "mandala" approach—a visual hub where all quadrants and levels are visible at a glance.',
        levelRequired: 10,
        category: 'technical',
    },
    {
        id: 'log-007',
        title: 'The We-Space Horizon',
        content: 'While AOS began as a personal tool, the "Lower Left" (Cultural) quadrant demanded attention. True mastery isn\'t a solo flight; it\'s a contribution to the shared intersubjective field of all practitioners.',
        levelRequired: 12,
        category: 'philosophy',
    },
    {
        id: 'log-008',
        title: 'Final Blueprint',
        content: 'The goal of the AOS isn\'t to keep you in the app. It\'s to make the app invisible—to integrate these practices so deeply into your biology and consciousness that you move through life as a living embodiment of the Integral framework.',
        levelRequired: 15,
        category: 'history',
    },
];

interface LoreLogProps {
    userLevel: number;
}

export const LoreLog: React.FC<LoreLogProps> = ({ userLevel }) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
                <FileText className="text-stone-400" size={20} />
                <div>
                    <h2 className={`text-stone-200 ${typography.h4}`}>The Pioneer Logs</h2>
                    <p className={`${typography.label} text-stone-500 uppercase tracking-widest mt-1`}>Archives of the Integral Frontier</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {LORE_ENTRIES.map((entry) => {
                    const isLocked = userLevel < entry.levelRequired;

                    return (
                        <div
                            key={entry.id}
                            className={`
                relative p-6 rounded-xl border transition-all duration-300
                ${isLocked
                                    ? 'bg-stone-900/20 border-stone-800/40 opacity-70 grayscale'
                                    : 'bg-stone-900/40 border-stone-700/50 hover:border-stone-500/50 group'}
              `}
                        >
                            {isLocked && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-[2px] rounded-xl z-10">
                                    <Lock className="text-stone-600 mb-2" size={24} />
                                    <span className={`${typography.caption} font-mono text-stone-500 uppercase tracking-tighter`}>
                                        Requires Level {entry.levelRequired}
                                    </span>
                                </div>
                            )}

                            <div className="flex justify-between items-start mb-4">
                                <span className={`
                  ${typography.caption} uppercase tracking-widest px-2 py-0.5 rounded
                  ${entry.category === 'history' ? 'bg-amber-900/20 text-amber-500' :
                                        entry.category === 'philosophy' ? 'bg-teal-900/20 text-teal-500' :
                                            'bg-teal-900/20 text-teal-500'}
                `}>
                                    {entry.category}
                                </span>
                                {!isLocked && React.createElement(getIconComponent('QuantumEntanglement') || 'div', { className: "text-amber-500/40 group-hover:text-amber-500 transition-colors", size: 14 })}
                            </div>

                            <h3 className={`${typography.h4} mb-2 ${isLocked ? 'text-stone-600' : 'text-stone-200'}`}>
                                {entry.title}
                            </h3>

                            <div className={`
                ${typography.body}
                ${isLocked ? 'text-stone-700 blur-[3px] select-none' : 'text-stone-400'}
              `}>
                                {entry.content}
                            </div>

                            {!isLocked && (
                                <div className="mt-4 pt-4 border-t border-stone-800/50 flex justify-between items-center bg-amber">
                                    <span className={`${typography.caption} text-stone-600 font-mono italic`}>#{entry.id}</span>
                                    <button className={`${typography.caption} text-amber-500/70 hover:text-amber-500 uppercase tracking-wider font-bold`}>
                                        Decrypted
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
