
import React from 'react';
// FIX: Correct import path for types.
import { ActiveTab } from '../../types.ts';
import {
    SacredDownloadIcon,
    SacredUploadIcon,
    SacredTrashIcon,
    SacredMenuIcon,
    SacredCloseIcon,
    SacredUserIcon,
    SacredShieldIcon,
    SacredScaleIcon,
} from './SacredNavIcons';
import UserProfileMenu from './UserProfileMenu';
import PrivacyPolicyModal from '../legal/PrivacyPolicyModal';
import TermsOfServiceModal from '../legal/TermsOfServiceModal';
import {
    OctagramStarIcon,
    LabyrinthIcon,
    OctagramIcon,
    SquaredCircleIcon,
    TriquetraIcon,
    CompassRoseIcon,
    IcosahedronIcon,
    TetrahedronIcon,
    MerkabaNavIcon,
    TorusIcon,
    PentacleIcon,
    QuaternityIcon,
    AnkhIcon,
    EyeOfHorusIcon,
    EndlessKnotIcon,
    HendecagramIcon,
    MandalaIcon,
    ScrollIcon,
    NetworkNodesIcon,
    GrowthSpiralIcon,
    SeedOfLifeIcon,
    FlowerOfLifeIcon,
    LotusIcon,
} from './SacredNavIcons';
import { MerkabaIcon } from './MerkabaIcon.tsx';
import { useIsMobile } from '../../hooks/useResponsive';
import LanguageSelector from './LanguageSelector';

interface NavSidebarProps {
    activeTab: ActiveTab;
    setActiveTab: (tab: ActiveTab) => void;
    onSignIn?: () => void;
    onExport: () => void;
    onImport: () => void;
    onReset: () => void;
    onSummonFlabbergaster: () => void;
    hasUnlockedFlabbergaster?: boolean;
    isOpen?: boolean; // External control for mobile drawer
    onToggle?: () => void; // External toggle handler
    isAdmin?: boolean;
    onOpenAdmin?: () => void;
}

// Map section headers to their hub tab IDs (matching mobile bottom nav structure)
const groupToHubMap: Record<string, ActiveTab> = {
    'Start Here': 'learn-hub', // Start Here fits conceptually with learning
    'Practice': 'practice-hub',
    'Toolkits': 'tools',
    'Insights & Analysis': 'insights-hub',
    'Theory & Knowledge': 'learn-hub',
    'Resources': 'learn-hub', // Resources fit with learning materials
};

export const navItems = [
    // 1. Dashboard (Top)
    { id: 'dashboard', label: 'Dashboard', icon: OctagramStarIcon },

    // 2. Start Here (Onboarding)
    { id: 'journey', label: 'The Journey', icon: LabyrinthIcon, group: 'Start Here' },
    { id: 'quiz', label: 'ILP Quiz', icon: OctagramIcon, group: 'Start Here' },
    { id: 'tool-guide', label: 'Tool Guide', icon: CompassRoseIcon, group: 'Start Here' },

    // 3. Practice (Daily Actions)
    { id: 'stack', label: 'My Stack', icon: SquaredCircleIcon, group: 'Practice' },
    { id: 'tracker', label: 'Daily Tracker', icon: TriquetraIcon, group: 'Practice' },
    { id: 'browse', label: 'Browse Practices', icon: CompassRoseIcon, group: 'Practice' },

    // 4. Toolkits (The 4 Modules)
    { id: 'mind-tools', label: 'Mind Tools', icon: IcosahedronIcon, group: 'Toolkits' },
    { id: 'body-tools', label: 'Body Tools', icon: TetrahedronIcon, group: 'Toolkits' },
    { id: 'spirit-tools', label: 'Spirit Tools', icon: MerkabaNavIcon, group: 'Toolkits' },
    { id: 'shadow-tools', label: 'Shadow Tools', icon: TorusIcon, group: 'Toolkits' },
    { id: 'sensemaking-lab', label: 'Sensemaking Lab', icon: PentacleIcon, group: 'Toolkits' },

    // 5. Insights & Analysis
    { id: 'aqal', label: 'AQAL Report', icon: QuaternityIcon, group: 'Insights & Analysis' },
    { id: 'my-insights', label: 'My Insights', icon: LotusIcon, group: 'Insights & Analysis' },
    { id: 'insights-hub', label: 'Analysis', icon: EyeOfHorusIcon, group: 'Insights & Analysis' },
    { id: 'forum', label: 'Community Forum', icon: FlowerOfLifeIcon, group: 'Insights & Analysis' },

    // 6. Theory & Knowledge (Reference)
    { id: 'framework-encyclopedia', label: 'Framework Encyclopedia', icon: EndlessKnotIcon, group: 'Theory & Knowledge' },
    { id: 'integral-theory', label: 'Integral Theory', icon: HendecagramIcon, group: 'Theory & Knowledge' },
    { id: 'aqal-learning', label: 'AQAL Explorer', icon: MandalaIcon, group: 'Theory & Knowledge' },
    { id: 'integral-history', label: 'Integral History', icon: ScrollIcon, group: 'Theory & Knowledge' },
    { id: 'metamodern-bridge', label: 'Metamodern Bridge', icon: NetworkNodesIcon, group: 'Theory & Knowledge' },
    { id: 'practice-ecology', label: 'Practice Ecology', icon: GrowthSpiralIcon, group: 'Theory & Knowledge' },

    // 7. Resources (System)
    { id: 'library', label: 'Library', icon: SeedOfLifeIcon, group: 'Resources' },
    { id: 'outro', label: 'Outro', icon: FlowerOfLifeIcon, group: 'Resources' },
    { id: 'profile', label: 'My Profile', icon: SacredUserIcon, group: 'Resources' },
];

const navGroups: { label: string; accentColor: string; defaultCollapsed?: boolean }[] = [
    // Colors aligned with void-tokens.css canonical OKLCH values
    { label: 'Start Here',          accentColor: 'oklch(0.65 0.14 50deg)' },   // spirit golden-bronze
    { label: 'Practice',            accentColor: 'oklch(0.72 0.17 160deg)' },  // body emerald
    { label: 'Toolkits',            accentColor: 'oklch(0.72 0.16 75deg)' },   // amber (mind approx)
    { label: 'Insights & Analysis', accentColor: 'oklch(0.58 0.18 290deg)' },  // shadow purple
    { label: 'Theory & Knowledge',  accentColor: 'oklch(0.52 0.22 255deg)', defaultCollapsed: true }, // mind sapphire
    { label: 'Resources',           accentColor: 'oklch(0.55 0.03 270deg)', defaultCollapsed: true }, // void neutral
];

const COLLAPSED_KEY = 'aura-nav-collapsed-groups';

// Module color tokens aligned with void-tokens.css
// OKLCH values — aligned with canonical design token system
const moduleColorMap = {
    shadow: {
        bg: 'from-[oklch(0.58_0.18_290deg/0.18)] via-[oklch(0.58_0.18_290deg/0.12)] to-transparent',
        textStyle: { color: 'oklch(0.72 0.14 290deg)' },
        borderStyle: { borderColor: 'oklch(0.58 0.18 290deg / 0.35)' },
        shadow: '0 8px 32px rgba(168,85,247,0.20), 0 0 24px rgba(168,85,247,0.12), inset 0 1px 2px rgba(255,255,255,0.08)',
        glow: 'rgba(168,85,247,0.10)',
    },
    mind: {
        bg: 'from-[oklch(0.52_0.22_255deg/0.18)] via-[oklch(0.52_0.22_255deg/0.12)] to-transparent',
        textStyle: { color: 'oklch(0.72 0.16 255deg)' },
        borderStyle: { borderColor: 'oklch(0.52 0.22 255deg / 0.35)' },
        shadow: '0 8px 32px rgba(52,81,199,0.20), 0 0 24px rgba(52,81,199,0.12), inset 0 1px 2px rgba(255,255,255,0.08)',
        glow: 'rgba(52,81,199,0.10)',
    },
    body: {
        bg: 'from-[oklch(0.72_0.17_160deg/0.18)] via-[oklch(0.72_0.17_160deg/0.12)] to-transparent',
        textStyle: { color: 'oklch(0.82 0.14 160deg)' },
        borderStyle: { borderColor: 'oklch(0.72 0.17 160deg / 0.35)' },
        shadow: '0 8px 32px rgba(16,185,129,0.20), 0 0 24px rgba(16,185,129,0.12), inset 0 1px 2px rgba(255,255,255,0.08)',
        glow: 'rgba(16,185,129,0.10)',
    },
    spirit: {
        bg: 'from-[oklch(0.65_0.14_50deg/0.18)] via-[oklch(0.65_0.14_50deg/0.12)] to-transparent',
        textStyle: { color: 'oklch(0.78 0.12 52deg)' },
        borderStyle: { borderColor: 'oklch(0.65 0.14 50deg / 0.35)' },
        shadow: '0 8px 32px rgba(201,144,10,0.20), 0 0 24px rgba(201,144,10,0.12), inset 0 1px 2px rgba(255,255,255,0.08)',
        glow: 'rgba(201,144,10,0.10)',
    },
};

const getModuleColors = (tabId: string) => {
    if (['mind-tools','quiz','sensemaking-lab','framework-encyclopedia',
         'integral-theory','aqal-learning','integral-history','metamodern-bridge',
         'practice-ecology','aqal'].includes(tabId)) {
        return moduleColorMap.mind;
    }
    if (['body-tools','tracker','stack','browse'].includes(tabId)) {
        return moduleColorMap.body;
    }
    if (['shadow-tools'].includes(tabId)) {
        return moduleColorMap.shadow;
    }
    if (['spirit-tools','journey'].includes(tabId)) {
        return moduleColorMap.spirit;
    }
    return moduleColorMap.shadow;
};

const getGroupSeparatorClass = (groupName: string): string => {
    if (groupName === 'Toolkits') return 'bg-gradient-to-r from-amber-500/25 via-purple-500/20 to-teal-500/15';
    if (groupName === 'Practice') return 'bg-gradient-to-r from-emerald-500/30 via-emerald-400/20 to-transparent';
    if (groupName === 'Theory & Knowledge') return 'bg-gradient-to-r from-amber-500/30 via-amber-400/20 to-transparent';
    if (groupName === 'Insights & Analysis') return 'bg-gradient-to-r from-purple-500/30 via-purple-400/20 to-transparent';
    return 'bg-gradient-to-r from-purple-500/30 via-purple-400/20 to-transparent';
};

const NavButton = ({ item, isActive, onClick }: { item: typeof navItems[0], isActive: boolean, onClick: () => void }) => {
    const colors = getModuleColors(item.id);
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-500 group relative overflow-hidden touch-target ${isActive
                ? `bg-gradient-to-r ${colors.bg} font-semibold border shadow-lg`
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50 hover:border hover:shadow-md'
                }`}
            style={isActive ? {
                ...(colors.textStyle || {}),
                ...(colors.borderStyle || {}),
                boxShadow: colors.shadow,
                backdropFilter: 'blur(16px)',
            } : {
                borderColor: 'rgba(255,255,255,0.05)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.03)',
                backdropFilter: 'blur(8px)',
            }}
        >
            <item.icon size={18} className="group-hover:scale-110 transition-transform duration-500 ease-out" />
            <span className="font-sans">{item.label}</span>
            {/* Shimmer effect on hover */}
            {!isActive && (
                <div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-15 translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-1000 ease-out"
                    style={{ backgroundSize: '200% 100%' }}
                />
            )}
            {/* Glow effect when active */}
            {isActive && (
                <div
                    className="absolute inset-0 rounded-lg opacity-50 animate-glow-pulse"
                    style={{
                        background: `radial-gradient(circle at center, ${colors.glow} 0%, transparent 70%)`,
                        pointerEvents: 'none'
                    }}
                />
            )}
        </button>
    );
};

interface NavGroupProps {
    group: { label: string; accentColor: string; defaultCollapsed?: boolean };
    items: typeof navItems;
    isCollapsed: boolean;
    onToggle: (label: string) => void;
    activeTab: string;
    setActiveTab: (tab: ActiveTab) => void;
    isMobile?: boolean;
}

const NavGroup: React.FC<NavGroupProps> = ({ group, items, isCollapsed, onToggle, activeTab, setActiveTab, isMobile }) => {
    const contentRef = React.useRef<HTMLDivElement>(null);
    const [contentHeight, setContentHeight] = React.useState(0);

    React.useEffect(() => {
        const el = contentRef.current;
        if (!el) return;
        const ro = new ResizeObserver(() => setContentHeight(el.scrollHeight));
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const isExpanded = !isCollapsed;
    const expandDuration = isMobile ? 260 : 320;
    const collapseDuration = isMobile ? 190 : 240;
    const staggerDelay = isMobile ? 24 : 30;

    const groupId = `nav-group-${group.label.replace(/\s+/g, '-')}`;

    return (
        <div className={`rounded-lg transition-colors duration-300 ${isExpanded ? 'bg-white/[0.02]' : ''}`}>
            <button
                aria-expanded={isExpanded}
                aria-controls={groupId}
                onClick={() => onToggle(group.label)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 min-h-[44px] rounded-md text-left group/hdr relative"
            >
                <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 rounded-full"
                    style={{
                        height: isExpanded ? '20px' : '8px',
                        opacity: isExpanded ? 1 : 0,
                        backgroundColor: group.accentColor,
                        boxShadow: isExpanded ? `0 0 8px ${group.accentColor}` : 'none',
                        transition: isExpanded
                            ? 'height 400ms cubic-bezier(0.25,1,0.5,1), opacity 300ms ease-out, box-shadow 300ms ease-out'
                            : 'height 200ms ease-in, opacity 200ms ease-in',
                    }}
                />
                <span className={`flex-1 font-sans text-xs font-semibold uppercase tracking-widest transition-colors duration-200 ${isExpanded ? 'text-slate-200' : 'text-neutral-500 group-hover/hdr:text-neutral-300'}`}>
                    {group.label}
                </span>
                <svg
                    className="w-3 h-3 flex-shrink-0"
                    style={{
                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                        opacity: isExpanded ? 0.6 : 0.3,
                        transition: 'transform 300ms ease-out, opacity 200ms ease-out',
                    }}
                    viewBox="0 0 12 12" fill="none"
                >
                    <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>

            <div
                id={groupId}
                aria-hidden={!isExpanded}
                {...(!isExpanded ? { inert: '' as unknown as boolean } : {})}
                style={{
                    height: isExpanded ? contentHeight : 0,
                    overflow: 'hidden',
                    transition: isExpanded
                        ? `height ${expandDuration}ms cubic-bezier(0.0,0.0,0.2,1)`
                        : `height ${collapseDuration}ms cubic-bezier(0.4,0.0,1,1)`,
                }}
            >
                <div ref={contentRef} className="pb-1 space-y-0.5 pt-0.5">
                    {items.map((item, index) => (
                        <div
                            key={item.id}
                            style={{
                                opacity: isExpanded ? 1 : 0,
                                transform: isExpanded ? 'translateX(0)' : 'translateX(-4px)',
                                transition: `opacity 200ms ease-out ${index * staggerDelay}ms, transform 200ms ease-out ${index * staggerDelay}ms`,
                            }}
                        >
                            <NavButton
                                item={item}
                                isActive={activeTab === item.id}
                                onClick={() => setActiveTab(item.id as ActiveTab)}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


export default React.memo(function NavSidebar({ activeTab, setActiveTab, onSignIn, onExport, onImport, onReset, onSummonFlabbergaster, hasUnlockedFlabbergaster = false, isOpen, onToggle, isAdmin, onOpenAdmin }: NavSidebarProps) {
    const [clickCount, setClickCount] = React.useState(0);
    const clickTimerRef = React.useRef<NodeJS.Timeout | null>(null);

    // Mobile responsiveness
    const isMobile = useIsMobile();
    // Use external control if provided, otherwise internal state
    const [internalMenuOpen, setInternalMenuOpen] = React.useState(false);
    const isMobileMenuOpen = isOpen !== undefined ? isOpen : internalMenuOpen;
    const setIsMobileMenuOpen = onToggle || setInternalMenuOpen;

    const [isPrivacyOpen, setIsPrivacyOpen] = React.useState(false);
    const [isTermsOpen, setIsTermsOpen] = React.useState(false);
    const [isControlCenterOpen, setIsControlCenterOpen] = React.useState(false);

    const [collapsedGroups, setCollapsedGroups] = React.useState<Set<string>>(() => {
        try {
            const stored = localStorage.getItem(COLLAPSED_KEY);
            if (stored) return new Set(JSON.parse(stored));
        } catch (error) {
            console.error('Failed to load collapsed groups from localStorage:', error);
        }
        return new Set(['Theory & Knowledge', 'Resources']);
    });

    // Persist collapsed state — pure updaters above, side effect here
    React.useEffect(() => {
        try {
            localStorage.setItem(COLLAPSED_KEY, JSON.stringify([...collapsedGroups]));
        } catch (error) {
            console.error('Failed to save collapsed groups to localStorage:', error);
        }
    }, [collapsedGroups]);

    const toggleGroup = (label: string) => {
        setCollapsedGroups(prev => {
            const next = new Set(prev);
            if (next.has(label)) next.delete(label);
            else next.add(label);
            return next;
        });
    };

    // Auto-expand active tab's group
    React.useEffect(() => {
        const activeItem = navItems.find(i => i.id === activeTab);
        if (activeItem?.group) {
            setCollapsedGroups(prev => {
                if (!prev.has(activeItem.group!)) return prev;
                const next = new Set(prev);
                next.delete(activeItem.group!);
                return next;
            });
        }
    }, [activeTab]);

    const handleSparkClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const newCount = clickCount + 1;
        setClickCount(newCount);
        console.log(`✦ Flabbergaster spark clicked: ${newCount}/3`);

        // Reset click count if threshold time exceeded
        if (clickTimerRef.current) {
            clearTimeout(clickTimerRef.current);
        }

        if (newCount === 3) {
            // Triple-click detected
            console.log('🌑 FLABBERGASTER SUMMONED!');
            onSummonFlabbergaster();
            setClickCount(0);
        } else {
            // Set timer to reset count after 1.5 seconds
            clickTimerRef.current = setTimeout(() => {
                setClickCount(0);
            }, 1500);
        }
    };

    React.useEffect(() => {
        return () => {
            if (clickTimerRef.current) {
                clearTimeout(clickTimerRef.current);
            }
        };
    }, []);

    // Close mobile menu on route change
    React.useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [activeTab]);

    // Prevent body scroll when mobile menu is open
    React.useEffect(() => {
        if (isMobile && isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobile, isMobileMenuOpen]);

    // Render hamburger button for mobile
    if (isMobile) {
        return (
            <>
                {/* Mobile Hamburger Button */}
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="fixed top-4 left-4 z-40 min-h-[44px] min-w-[44px] p-3 rounded-lg touch-target"
                    style={{
                        background: 'linear-gradient(135deg, rgba(38, 38, 38, 0.95), rgba(26, 26, 26, 0.9))',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(192, 132, 252, 0.3)',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.8), 0 0 16px rgba(192, 132, 252, 0.2)',
                    }}
                    aria-label="Open navigation menu"
                >
                    <SacredMenuIcon size={20} className="text-purple-300" />
                </button>

                {/* Mobile Backdrop */}
                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black/80 z-40 animate-fade-in"
                        onClick={() => setIsMobileMenuOpen(false)}
                        style={{ backdropFilter: 'blur(4px)' }}
                        aria-hidden="true"
                    />
                )}

                {/* Mobile Drawer */}
                <aside
                    className={`fixed top-0 left-0 w-80 max-w-[85vw] h-screen p-4 flex flex-col z-50 transform transition-transform duration-300 ease-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                        }`}
                    style={{
                        background: 'linear-gradient(180deg, rgba(10, 10, 15, 0.98) 0%, rgba(20, 20, 31, 0.95) 50%, rgba(15, 10, 20, 0.98) 100%)',
                        backdropFilter: 'blur(24px)',
                        borderRight: '1px solid rgba(192, 132, 252, 0.15)',
                        boxShadow: '8px 0 48px rgba(0, 0, 0, 0.9), -2px 0 20px rgba(192, 132, 252, 0.1)',
                    }}
                    aria-label="Mobile navigation"
                >
                    {/* Mobile Header with Close Button */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3 px-2">
                            <div className="relative">
                                <MerkabaIcon
                                    className="text-purple-400"
                                    size={28}
                                    style={{
                                        filter: 'drop-shadow(0 0 12px rgba(192, 132, 252, 0.4))',
                                    }}
                                />
                                {/* Flabbergaster Spark - Mystical easter egg (mobile) */}
                                <button
                                    onClick={handleSparkClick}
                                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full opacity-90 hover:opacity-100 transition-all duration-300 cursor-pointer animate-float"
                                    style={{
                                        background: 'linear-gradient(135deg, rgb(192, 132, 252), rgb(250, 204, 21))',
                                        animation: 'float 4s ease-in-out infinite',
                                        boxShadow: '0 0 12px rgba(192, 132, 252, 0.8), 0 0 24px rgba(250, 204, 21, 0.4), inset 0 0 4px rgba(255, 255, 255, 0.6)',
                                        border: '1.5px solid rgba(255, 255, 255, 0.5)'
                                    }}
                                    aria-label="Flabbergaster spark (triple-tap to unlock)"
                                    title={hasUnlockedFlabbergaster ? "🗝️ Flabbergaster Portal" : ""}
                                />
                            </div>
                            <div>
                                <span className="font-serif text-2xl font-semibold italic text-stone-100 block" style={{ letterSpacing: '0.02em' }}>
                                    Aura OS
                                </span>
                                <p className="text-[10px] text-stone-500 mt-0.5 font-sans tracking-[0.12em]">Integral Life Practice</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="min-h-[44px] min-w-[44px] p-2 rounded-lg hover:bg-neutral-800/50 transition-colors touch-target"
                            aria-label="Close navigation menu"
                        >
                            <SacredCloseIcon size={24} className="text-neutral-400" />
                        </button>
                    </div>

                    {/* Mobile Navigation Content */}
                    <nav className="flex flex-col gap-1 flex-grow overflow-y-auto pr-2 -mr-2 pb-4">
                        {/* Dashboard — pinned */}
                        {navItems.filter(i => !i.group).map(item => (
                            <NavButton key={item.id} item={item} isActive={activeTab === item.id} onClick={() => setActiveTab(item.id as ActiveTab)} />
                        ))}

                        {/* Collapsible groups */}
                        {navGroups.map(group => {
                            const groupItems = navItems.filter(i => i.group === group.label);
                            if (groupItems.length === 0) return null;
                            return (
                                <NavGroup
                                    key={group.label}
                                    group={group}
                                    items={groupItems}
                                    isCollapsed={collapsedGroups.has(group.label)}
                                    onToggle={toggleGroup}
                                    activeTab={activeTab}
                                    setActiveTab={setActiveTab}
                                    isMobile={true}
                                />
                            );
                        })}
                    </nav>

                    {/* Mobile Control Center Section — pb-20 clears the fixed bottom nav bar */}
                    <div className="flex-shrink-0 pt-3 border-t border-purple-500/20 pb-20" style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}>
                        <h2 className="font-sans text-xs font-semibold text-neutral-500 uppercase mb-2 px-3 tracking-widest opacity-80">
                            Control Center
                        </h2>
                        <div className="space-y-0.5 p-1 rounded-lg" style={{
                            background: 'linear-gradient(135deg, rgba(50,40,60,0.2), rgba(40,50,60,0.1))',
                            border: '1px solid rgba(192,132,252,0.12)'
                        }}>
                            <LanguageSelector />
                            <button
                                onClick={onExport}
                                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-xs font-medium font-sans text-neutral-400 hover:text-amber-300 hover:bg-amber-900/20 hover:border hover:border-amber-500/40 transition-all duration-500 group shadow-sm hover:shadow-md touch-target"
                                style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(8px)' }}
                            >
                        <SacredDownloadIcon size={16} className="group-hover:scale-110 transition-transform duration-500 flex-shrink-0" />
                                <span>Export Data</span>
                            </button>
                            <button
                                onClick={onImport}
                                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-xs font-medium font-sans text-neutral-400 hover:text-emerald-300 hover:bg-emerald-900/20 hover:border hover:border-emerald-500/40 transition-all duration-500 group shadow-sm hover:shadow-md touch-target"
                                style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(8px)' }}
                            >
                                <SacredUploadIcon size={16} className="group-hover:scale-110 transition-transform duration-500 flex-shrink-0" />
                                <span>Import Data</span>
                            </button>
                            <button
                                onClick={onReset}
                                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-xs font-medium font-sans text-neutral-400 hover:text-rose-400 hover:bg-rose-900/30 hover:border hover:border-rose-500/40 transition-all duration-500 group shadow-sm hover:shadow-md touch-target"
                                style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(8px)' }}
                            >
                                <SacredTrashIcon size={16} className="group-hover:scale-110 transition-transform duration-500 flex-shrink-0" />
                                <span>Reset App</span>
                            </button>

                            {/* Auth Profile Menu */}
                            <UserProfileMenu />

                            {/* Admin Panel — only visible to admins */}
                            {isAdmin && onOpenAdmin && (
                                <button
                                    onClick={() => { onOpenAdmin(); setIsMobileMenuOpen(false); }}
                                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-xs font-medium font-sans text-red-400 hover:text-red-300 hover:bg-red-900/20 hover:border hover:border-red-500/40 transition-all duration-500 group touch-target"
                                    style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)', backdropFilter: 'blur(8px)' }}
                                >
                                    <span className="text-base leading-none">⚙️</span>
                                    <span>Admin Panel</span>
                                    <span className="ml-auto w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                                </button>
                            )}

                            <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-purple-500/10">
                                <button onClick={() => setIsTermsOpen(true)} className="text-xs uppercase tracking-wider text-neutral-400 hover:text-neutral-200 transition-colors flex items-center gap-1 min-h-[44px] min-w-[44px] px-2 justify-center">
                                    <SacredScaleIcon size={14} /> Terms
                                </button>
                                <button onClick={() => setIsPrivacyOpen(true)} className="text-xs uppercase tracking-wider text-neutral-400 hover:text-neutral-200 transition-colors flex items-center gap-1 min-h-[44px] min-w-[44px] px-2 justify-center">
                                    <SacredShieldIcon size={14} /> Privacy
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>
            </>
        );
    }

    // Desktop Navigation
    return (
        <aside
            className="w-64 p-4 flex flex-col sticky top-0 h-screen"
            style={{
                background: 'linear-gradient(180deg, rgba(10, 10, 15, 0.95) 0%, rgba(20, 20, 31, 0.9) 50%, rgba(15, 10, 20, 0.95) 100%)',
                backdropFilter: 'blur(20px)',
                borderRight: '1px solid rgba(192, 132, 252, 0.12)',
                boxShadow: '8px 0 48px rgba(0, 0, 0, 0.6), -2px 0 20px rgba(192, 132, 252, 0.04), inset -1px 0 2px rgba(192, 132, 252, 0.08)'
            }}
        >
            <div className="flex items-center gap-3 px-2 flex-shrink-0 group cursor-pointer relative mb-1">
                <div className="relative">
                    <MerkabaIcon
                        className="text-purple-400 group-hover:text-purple-300 drop-shadow-lg transition-all duration-500 group-hover:animate-float"
                        size={32}
                        style={{
                            filter: 'drop-shadow(0 0 12px rgba(192, 132, 252, 0.4))',
                            transition: 'all 0.5s ease'
                        }}
                    />
                    {/* Flabbergaster Spark - Mystical easter egg */}
                    <button
                        onClick={handleSparkClick}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleSparkClick(e as any);
                            }
                        }}
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full opacity-90 hover:opacity-100 transition-all duration-300 cursor-pointer animate-float"
                        style={{
                            background: 'linear-gradient(135deg, rgb(192, 132, 252), rgb(250, 204, 21))',
                            animation: 'float 4s ease-in-out infinite',
                            boxShadow: '0 0 16px rgba(192, 132, 252, 0.8), 0 0 32px rgba(250, 204, 21, 0.4), inset 0 0 6px rgba(255, 255, 255, 0.6)',
                            border: '2px solid rgba(255, 255, 255, 0.5)'
                        }}
                        aria-label="Flabbergaster spark (triple-click to unlock)"
                        title={hasUnlockedFlabbergaster ? "🗝️ Flabbergaster Portal" : ""}
                    />
                </div>
                <div>
                    <span className="font-serif text-3xl font-semibold italic text-stone-100 block" style={{ letterSpacing: '0.02em' }}>
                        Aura OS
                    </span>
                    <p className="text-[10px] text-stone-500 mt-1 font-sans tracking-[0.12em]">Integral Life Practice</p>
                </div>
            </div>
            <nav className="flex flex-col gap-1 mt-6 flex-grow overflow-y-auto pr-2 -mr-2">
                {/* Dashboard — pinned */}
                {navItems.filter(i => !i.group).map(item => (
                    <NavButton key={item.id} item={item} isActive={activeTab === item.id} onClick={() => setActiveTab(item.id as ActiveTab)} />
                ))}

                {/* Collapsible groups */}
                {navGroups.map(group => {
                    const groupItems = navItems.filter(i => i.group === group.label);
                    if (groupItems.length === 0) return null;
                    return (
                        <NavGroup
                            key={group.label}
                            group={group}
                            items={groupItems}
                            isCollapsed={collapsedGroups.has(group.label)}
                            onToggle={toggleGroup}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                        />
                    );
                })}
            </nav>
            {/* Control Center Section */}
            <div className="flex-shrink-0 pt-3 border-t border-purple-500/20">
                <button
                    onClick={() => setIsControlCenterOpen(v => !v)}
                    className="w-full flex items-center justify-between px-3 mb-1 group"
                    aria-expanded={isControlCenterOpen}
                    aria-controls="control-center-menu"
                >
                    <span className="font-sans text-xs font-semibold text-neutral-500 uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity">
                        Control Center
                    </span>
                    <span className={`text-neutral-600 text-xs transition-transform duration-200 ${isControlCenterOpen ? 'rotate-180' : ''}`}>▾</span>
                </button>
                {isControlCenterOpen && (
                <div id="control-center-menu" className="space-y-0.5 p-1 rounded-lg" style={{
                    background: 'linear-gradient(135deg, rgba(50,40,60,0.2), rgba(40,50,60,0.1))',
                    border: '1px solid rgba(192,132,252,0.12)'
                }}>
                    <LanguageSelector />
                    <button
                        onClick={onExport}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium font-sans text-neutral-400 hover:text-amber-300 hover:bg-amber-900/20 hover:border hover:border-amber-500/40 transition-all duration-500 group shadow-sm hover:shadow-md touch-target"
                        style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(8px)' }}
                    >
                        <SacredDownloadIcon size={16} className="group-hover:scale-110 transition-transform duration-500 flex-shrink-0" />
                        <span>Export Data</span>
                    </button>
                    <button
                        onClick={onImport}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium font-sans text-neutral-400 hover:text-emerald-300 hover:bg-emerald-900/20 hover:border hover:border-emerald-500/40 transition-all duration-500 group shadow-sm hover:shadow-md touch-target"
                        style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(8px)' }}
                    >
                        <SacredUploadIcon size={16} className="group-hover:scale-110 transition-transform duration-500 flex-shrink-0" />
                        <span>Import Data</span>
                    </button>
                    <button
                        onClick={onReset}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium font-sans text-neutral-400 hover:text-rose-400 hover:bg-rose-900/30 hover:border hover:border-rose-500/40 transition-all duration-500 group shadow-sm hover:shadow-md touch-target"
                        style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(8px)' }}
                    >
                        <SacredTrashIcon size={16} className="group-hover:scale-110 transition-transform duration-500 flex-shrink-0" />
                        <span>Reset App</span>
                    </button>

                    {/* Auth Profile Menu */}
                    <UserProfileMenu />

                    <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-purple-500/10">
                        <button onClick={() => setIsTermsOpen(true)} className="text-[10px] uppercase tracking-wider text-neutral-500 hover:text-neutral-300 transition-colors flex items-center gap-1">
                            <SacredScaleIcon size={12} /> Terms
                        </button>
                        <button onClick={() => setIsPrivacyOpen(true)} className="text-[10px] uppercase tracking-wider text-neutral-500 hover:text-neutral-300 transition-colors flex items-center gap-1">
                            <SacredShieldIcon size={12} /> Privacy
                        </button>
                    </div>
                </div>
                )}

                <PrivacyPolicyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
                <TermsOfServiceModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
            </div>
        </aside>
    );
});
