import React from 'react';
import { ActiveTab } from '../../types.ts';
import { useNavigationContext } from '../../contexts/NavigationContext';
import {
    VesicaPiscisIcon,
    SquaredCircleIcon,
    MetatronsCubeIcon,
    EyeOfHorusIcon,
    TreeOfLifeIcon,
    FlowerOfLifeIcon,
} from './SacredNavIcons';

interface BottomNavBarProps {
    activeTab: ActiveTab;
    setActiveTab: (tab: ActiveTab) => void;
}

const primaryTabs = [
    { id: 'dashboard',    label: 'Home',      Icon: VesicaPiscisIcon },
    { id: 'practice-hub', label: 'Practice',  Icon: SquaredCircleIcon },
    { id: 'tools',        label: 'Tools',     Icon: MetatronsCubeIcon },
    { id: 'insights-hub', label: 'Insights',  Icon: EyeOfHorusIcon },
    { id: 'forum',        label: 'Community', Icon: FlowerOfLifeIcon },
    { id: 'learn-hub',    label: 'Learn',     Icon: TreeOfLifeIcon },
] as const;

export default function BottomNavBar({ activeTab, setActiveTab }: BottomNavBarProps) {
    const { activeModule } = useNavigationContext();

    return (
        /*
         * data-module cascades --module-accent / --module-glow from void-tokens.css
         * so the active glow and border track the current ILP module context.
         */
        <nav
            className="fixed bottom-0 left-0 right-0 z-40 lg:hidden"
            data-module={activeModule}
            style={{
                background: 'linear-gradient(180deg, rgba(10,10,13,0.98) 0%, rgba(17,17,19,0.97) 100%)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderTop: '1px solid rgba(255,255,255,0.07)',
                boxShadow: '0 -8px 32px rgba(0,0,0,0.6), 0 -1px 4px var(--module-glow, rgba(168,85,247,0.08))',
                paddingBottom: 'env(safe-area-inset-bottom, 0)',
            }}
            aria-label="Primary navigation"
        >
            <div className="flex items-center justify-around h-20 px-1">
                {primaryTabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.Icon;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as ActiveTab)}
                            className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-1 py-2 rounded-lg transition-all duration-300 ${
                                isActive ? '' : 'hover:opacity-80'
                            }`}
                            style={{
                                color: isActive
                                    ? 'var(--module-accent, oklch(0.58 0.18 290deg))'
                                    : 'rgba(255,255,255,0.38)',
                                ...(isActive ? {
                                    background: 'radial-gradient(circle at center, var(--module-glow, rgba(168,85,247,0.15)) 0%, transparent 70%)',
                                    boxShadow: '0 0 20px var(--module-glow, rgba(168,85,247,0.20))',
                                } : {}),
                            }}
                            aria-label={tab.label}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            <Icon
                                size={24}
                                className={`mb-1 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}
                                style={isActive ? {
                                    filter: 'drop-shadow(0 0 8px var(--module-accent, oklch(0.58 0.18 290deg)))',
                                } : undefined}
                            />
                            <span className="text-[10px] font-medium font-sans tracking-wide">
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
