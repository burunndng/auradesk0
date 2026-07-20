/**
 * LearnHubTab
 * Premium "Alchemical Void" aesthetic - matching Journey tab's design language
 * Earthy stone tones, sacred geometry symbology, sophisticated typography
 */

import React from 'react';
import { ActiveTab } from '../../types.ts';
import {
    LabyrinthIcon,
    OctagramIcon,
    CompassRoseIcon,
    EndlessKnotIcon,
    HendecagramIcon,
    MandalaIcon,
    ScrollIcon,
    NetworkNodesIcon,
    GrowthSpiralIcon,
    SeedOfLifeIcon,
    FlowerOfLifeIcon,
    TetrahedronIcon,
    HexagramIcon,
    DodecahedronIcon,
} from '../shared/SacredNavIcons';

interface LearnHubTabProps {
    setActiveTab: (tab: ActiveTab) => void;
}

// Sacred geometry icons for each item
const getItemIcon = (iconId: string, className: string = '') => {
    const props = { size: 24, className };
    switch (iconId) {
        case 'journey': return <LabyrinthIcon {...props} />;
        case 'quiz': return <OctagramIcon {...props} />;
        case 'tool-guide': return <CompassRoseIcon {...props} />;
        case 'framework-encyclopedia': return <EndlessKnotIcon {...props} />;
        case 'integral-theory': return <HendecagramIcon {...props} />;
        case 'aqal-learning': return <MandalaIcon {...props} />;
        case 'integral-history': return <ScrollIcon {...props} />;
        case 'metamodern-bridge': return <NetworkNodesIcon {...props} />;
        case 'practice-ecology': return <GrowthSpiralIcon {...props} />;
        case 'library': return <SeedOfLifeIcon {...props} />;
        case 'outro': return <FlowerOfLifeIcon {...props} />;
        default: return <DodecahedronIcon {...props} />;
    }
};

const learnItems = [
    // Start Here
    {
        id: 'journey',
        label: 'The Journey',
        description: 'Interactive onboarding experience through the integral map',
        category: 'Start Here',
        colorClass: 'text-amber-500',
        glowColor: 'shadow-amber-500/20',
        borderHover: 'hover:border-amber-500/40',
    },
    {
        id: 'quiz',
        label: 'ILP Knowledge Quiz',
        description: 'Assess your understanding of integral life practice',
        category: 'Start Here',
        colorClass: 'text-rose-400',
        glowColor: 'shadow-rose-500/20',
        borderHover: 'hover:border-rose-500/40',
    },
    {
        id: 'tool-guide',
        label: 'Tool Guide',
        description: 'Discover your practice path across the four integral domains',
        category: 'Start Here',
        colorClass: 'text-emerald-400',
        glowColor: 'shadow-emerald-500/20',
        borderHover: 'hover:border-emerald-500/40',
    },
    // Theory & Knowledge
    {
        id: 'framework-encyclopedia',
        label: 'Framework Encyclopedia',
        description: 'Comprehensive reference for integral theory concepts',
        category: 'Theory',
        colorClass: 'text-sky-400',
        glowColor: 'shadow-sky-500/20',
        borderHover: 'hover:border-sky-500/40',
    },
    {
        id: 'integral-theory',
        label: 'Integral Theory',
        description: 'Core concepts: quadrants, levels, lines, states, and types',
        category: 'Theory',
        colorClass: 'text-teal-400',
        glowColor: 'shadow-cyan-500/20',
        borderHover: 'hover:border-teal-500/40',
    },
    {
        id: 'aqal-learning',
        label: 'AQAL Explorer',
        description: 'Interactive mandala of the All Quadrants All Levels framework',
        category: 'Theory',
        colorClass: 'text-emerald-400',
        glowColor: 'shadow-emerald-500/20',
        borderHover: 'hover:border-emerald-500/40',
    },
    {
        id: 'integral-history',
        label: 'Integral History',
        description: 'Evolution of integral thought from Gebser to Wilber',
        category: 'Theory',
        colorClass: 'text-orange-400',
        glowColor: 'shadow-orange-500/20',
        borderHover: 'hover:border-orange-500/40',
    },
    {
        id: 'metamodern-bridge',
        label: 'Metamodern Bridge',
        description: 'Connecting integral and metamodern perspectives',
        category: 'Theory',
        colorClass: 'text-violet-400',
        glowColor: 'shadow-violet-500/20',
        borderHover: 'hover:border-violet-500/40',
    },
    {
        id: 'practice-ecology',
        label: 'Practice Ecology',
        description: 'How practices interconnect and support each other',
        category: 'Theory',
        colorClass: 'text-green-400',
        glowColor: 'shadow-green-500/20',
        borderHover: 'hover:border-green-500/40',
    },
    // Resources
    {
        id: 'library',
        label: 'Library',
        description: 'Curated books, articles, and multimedia resources',
        category: 'Resources',
        colorClass: 'text-stone-400',
        glowColor: 'shadow-stone-500/20',
        borderHover: 'hover:border-stone-500/40',
    },
    {
        id: 'outro',
        label: 'Outro',
        description: 'Closing reflections and paths forward',
        category: 'Resources',
        colorClass: 'text-yellow-300',
        glowColor: 'shadow-yellow-500/20',
        borderHover: 'hover:border-yellow-500/40',
    },
];

const categoryMeta: Record<string, { icon: React.ReactNode; subtitle: string }> = {
    'Start Here': {
        icon: <TetrahedronIcon size={14} className="text-amber-500" />,
        subtitle: 'Begin your integral journey',
    },
    'Theory': {
        icon: <HexagramIcon size={14} className="text-sky-400" />,
        subtitle: 'Deepen your understanding',
    },
    'Resources': {
        icon: <DodecahedronIcon size={14} className="text-stone-400" />,
        subtitle: 'Explore and extend',
    },
};

export default function LearnHubTab({ setActiveTab }: LearnHubTabProps) {
    const categories = ['Start Here', 'Theory', 'Resources'];

    return (
        <div className="bg-stone-950">
            {/* Ambient gradient overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-900/5 via-stone-950/0 to-stone-950/0 pointer-events-none" />

            <div className="relative max-w-4xl mx-auto px-4 py-8 lg:py-12 pb-64">

                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <span className="w-2 h-2 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50" />
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-[0.2em]">Learn Hub</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-serif font-light text-transparent bg-clip-text bg-gradient-to-br from-stone-100 via-stone-300 to-stone-400 mb-4">
                        The Integral Library
                    </h1>

                    <p className="text-stone-500 text-lg max-w-2xl mx-auto leading-relaxed">
                        Explore integral theory, deepen your understanding of the AQAL framework,
                        and discover the interconnected web of developmental practices.
                    </p>
                </div>

                {/* Categories */}
                {categories.map((category) => {
                    const categoryItems = learnItems.filter((item) => item.category === category);
                    const meta = categoryMeta[category];

                    return (
                        <section key={category} className="mb-10">
                            {/* Category Header */}
                            <div className="flex items-center gap-3 mb-5 px-1">
                                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-stone-900/80 border border-stone-800">
                                    {meta.icon}
                                </div>
                                <div>
                                    <h2 className="text-sm font-semibold text-stone-200 tracking-wide">{category}</h2>
                                    <p className="text-xs text-stone-600">{meta.subtitle}</p>
                                </div>
                            </div>

                            {/* Cards Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {categoryItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id as ActiveTab)}
                                        className={`
                      group relative p-5 rounded-xl text-left
                      bg-stone-900/50 border border-stone-800/80
                      transition-all duration-300 ease-out
                      hover:bg-stone-900/80 hover:border-stone-700
                      hover:shadow-lg ${item.glowColor}
                      active:scale-[0.98]
                      ${item.borderHover}
                    `}
                                    >
                                        {/* Content */}
                                        <div className="flex items-start gap-4">
                                            {/* Icon container with alchemical styling */}
                                            <div className={`
                        flex-shrink-0 w-12 h-12 rounded-lg
                        bg-stone-950/80 border border-stone-800
                        flex items-center justify-center
                        group-hover:border-stone-700
                        transition-all duration-300
                        group-hover:shadow-md ${item.glowColor}
                      `}>
                                                {getItemIcon(item.id, `${item.colorClass} transition-transform duration-300 group-hover:scale-110`)}
                                            </div>

                                            <div className="flex-1 min-w-0 pt-0.5">
                                                <h3 className={`
                          text-base font-medium text-stone-200
                          group-hover:text-stone-50
                          transition-colors duration-200
                          mb-1
                        `}>
                                                    {item.label}
                                                </h3>
                                                <p className="text-sm text-stone-500 group-hover:text-stone-400 transition-colors duration-200 line-clamp-2">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Hover glow effect */}
                                        <div className={`
                      absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100
                      pointer-events-none transition-opacity duration-300
                      bg-gradient-to-br from-transparent via-transparent to-stone-800/20
                    `} />
                                    </button>
                                ))}
                            </div>
                        </section>
                    );
                })}

                {/* Footer ornament */}
                <div className="mt-16 flex items-center justify-center gap-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-stone-800" />
                    <div className="flex items-center gap-2 text-stone-700">
                        <DodecahedronIcon size={12} />
                        <span className="text-[10px] uppercase tracking-[0.2em]">All Quadrants</span>
                        <span className="text-stone-800">·</span>
                        <span className="text-[10px] uppercase tracking-[0.2em]">All Levels</span>
                        <HexagramIcon size={12} />
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-stone-800" />
                </div>

            </div>
        </div>
    );
}
