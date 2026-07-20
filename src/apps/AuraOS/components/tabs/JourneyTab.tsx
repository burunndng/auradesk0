import React, { useState, useEffect, useMemo, useRef } from 'react';
import { journeyRegions, journeyBadges } from '../../data/journeyContent.ts';
import { JourneyProgress } from '../../types.ts';
import LearningCard from '../shared/LearningCard.tsx';
import {
  CheckCircle2, Circle, ChevronRight, Menu, X
} from 'lucide-react';

interface JourneyTabProps {
  journeyProgress: JourneyProgress;
  updateJourneyProgress: (progress: JourneyProgress) => void;
}

// Sacred Geometry SVG Icons - Esoteric & Sophisticated
const SacredGeometryIcon: React.FC<{ regionId: string; size?: number; className?: string }> = ({ regionId, size = 24, className = '' }) => {
  const baseClass = `transition-all duration-300 ${className}`;

  switch (regionId) {
    case 'core':
      // Seed of Life - Foundation of sacred geometry
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" className={baseClass}>
          <defs>
            <linearGradient id="coreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>
          <circle cx="16" cy="16" r="6" fill="none" stroke="url(#coreGrad)" strokeWidth="0.8" />
          <circle cx="16" cy="10" r="6" fill="none" stroke="url(#coreGrad)" strokeWidth="0.8" opacity="0.7" />
          <circle cx="21.2" cy="13" r="6" fill="none" stroke="url(#coreGrad)" strokeWidth="0.8" opacity="0.7" />
          <circle cx="21.2" cy="19" r="6" fill="none" stroke="url(#coreGrad)" strokeWidth="0.8" opacity="0.7" />
          <circle cx="16" cy="22" r="6" fill="none" stroke="url(#coreGrad)" strokeWidth="0.8" opacity="0.7" />
          <circle cx="10.8" cy="19" r="6" fill="none" stroke="url(#coreGrad)" strokeWidth="0.8" opacity="0.7" />
          <circle cx="10.8" cy="13" r="6" fill="none" stroke="url(#coreGrad)" strokeWidth="0.8" opacity="0.7" />
        </svg>
      );
    case 'body':
      // Platonic Tetrahedron - Fire element, ascending force
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" className={baseClass}>
          <defs>
            <linearGradient id="bodyGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#f87171" />
            </linearGradient>
          </defs>
          <polygon points="16,3 28,27 4,27" fill="none" stroke="url(#bodyGrad)" strokeWidth="1.2" strokeLinejoin="round" />
          <line x1="16" y1="3" x2="16" y2="27" stroke="url(#bodyGrad)" strokeWidth="0.6" opacity="0.4" />
          <line x1="4" y1="27" x2="22" y2="15" stroke="url(#bodyGrad)" strokeWidth="0.6" opacity="0.4" />
          <line x1="28" y1="27" x2="10" y2="15" stroke="url(#bodyGrad)" strokeWidth="0.6" opacity="0.4" />
          <circle cx="16" cy="19" r="1.5" fill="#dc2626" />
        </svg>
      );
    case 'mind':
      // Metatron's Cube simplified - Divine geometry of mind
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" className={baseClass}>
          <defs>
            <linearGradient id="mindGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
          </defs>
          {/* Outer hexagon */}
          <polygon points="16,2 28,9 28,23 16,30 4,23 4,9" fill="none" stroke="url(#mindGrad)" strokeWidth="0.8" />
          {/* Inner connecting lines forming cube illusion */}
          <line x1="16" y1="2" x2="16" y2="30" stroke="url(#mindGrad)" strokeWidth="0.5" opacity="0.5" />
          <line x1="4" y1="9" x2="28" y2="23" stroke="url(#mindGrad)" strokeWidth="0.5" opacity="0.5" />
          <line x1="28" y1="9" x2="4" y2="23" stroke="url(#mindGrad)" strokeWidth="0.5" opacity="0.5" />
          {/* Central circles */}
          <circle cx="16" cy="16" r="5" fill="none" stroke="url(#mindGrad)" strokeWidth="0.7" opacity="0.6" />
          <circle cx="16" cy="16" r="2" fill="#38bdf8" opacity="0.8" />
        </svg>
      );
    case 'spirit':
      // Unicursal Hexagram - Thelemic symbol of union
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" className={baseClass}>
          <defs>
            <linearGradient id="spiritGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#eab308" />
            </linearGradient>
          </defs>
          {/* Unicursal hexagram - single continuous line */}
          <path
            d="M16,3 L20,12 L29,12 L22,18 L25,28 L16,22 L7,28 L10,18 L3,12 L12,12 Z"
            fill="none"
            stroke="url(#spiritGrad)"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <circle cx="16" cy="15" r="2" fill="#facc15" />
        </svg>
      );
    case 'shadow':
      // Ouroboros/Torus - The infinite loop of self-consumption and renewal
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" className={baseClass}>
          <defs>
            <linearGradient id="shadowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
          {/* Outer ring */}
          <circle cx="16" cy="16" r="12" fill="none" stroke="url(#shadowGrad)" strokeWidth="1" opacity="0.3" />
          {/* Torus cross-section effect */}
          <ellipse cx="16" cy="16" rx="10" ry="6" fill="none" stroke="url(#shadowGrad)" strokeWidth="0.8" transform="rotate(0 16 16)" />
          <ellipse cx="16" cy="16" rx="10" ry="6" fill="none" stroke="url(#shadowGrad)" strokeWidth="0.8" transform="rotate(60 16 16)" opacity="0.7" />
          <ellipse cx="16" cy="16" rx="10" ry="6" fill="none" stroke="url(#shadowGrad)" strokeWidth="0.8" transform="rotate(120 16 16)" opacity="0.5" />
          {/* Center void */}
          <circle cx="16" cy="16" r="3" fill="none" stroke="url(#shadowGrad)" strokeWidth="0.8" />
          <circle cx="16" cy="16" r="1" fill="#a78bfa" />
        </svg>
      );
    case 'integral':
      // Hendecagram (11-pointed star) - Completion beyond the decimal
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" className={baseClass}>
          <defs>
            <linearGradient id="integralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
          {/* 11-pointed star (hendecagram) */}
          <polygon
            points="16,2 18.5,11 27.5,8 21,14 28,20 19,18.5 16,28 13,18.5 4,20 11,14 4.5,8 13.5,11"
            fill="none"
            stroke="url(#integralGrad)"
            strokeWidth="1"
            strokeLinejoin="round"
          />
          {/* Outer circle of completion */}
          <circle cx="16" cy="16" r="13" fill="none" stroke="url(#integralGrad)" strokeWidth="0.5" opacity="0.3" />
          <circle cx="16" cy="15" r="2" fill="#34d399" />
        </svg>
      );
    default:
      return <Circle size={size} className="text-stone-500" />;
  }
};

// Region accent colors for consistent theming
const regionColors: Record<string, { primary: string; glow: string; bg: string }> = {
  core: { primary: 'text-amber-400', glow: 'shadow-amber-500/30', bg: 'from-amber-900/10' },
  body: { primary: 'text-rose-400', glow: 'shadow-rose-500/30', bg: 'from-rose-900/10' },
  mind: { primary: 'text-sky-400', glow: 'shadow-sky-500/30', bg: 'from-sky-900/10' },
  spirit: { primary: 'text-yellow-300', glow: 'shadow-yellow-500/30', bg: 'from-yellow-900/10' },
  shadow: { primary: 'text-violet-400', glow: 'shadow-violet-500/30', bg: 'from-violet-900/10' },
  integral: { primary: 'text-emerald-400', glow: 'shadow-emerald-500/30', bg: 'from-emerald-900/10' },
};

export default function JourneyTab({ journeyProgress, updateJourneyProgress }: JourneyTabProps) {
  const progressRef = useRef(journeyProgress);
  useEffect(() => { progressRef.current = journeyProgress; }, [journeyProgress]);

  const [selectedRegion, setSelectedRegion] = useState<string>(
    journeyProgress.currentRegion || 'core'
  );
  const [selectedCardIndex, setSelectedCardIndex] = useState<number>(0);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  const currentRegion = useMemo(() => journeyRegions.find((r) => r.id === selectedRegion), [selectedRegion]);
  const currentCard = currentRegion?.cards[selectedCardIndex];
  const colors = regionColors[selectedRegion] || regionColors.core;

  // Restore position
  useEffect(() => {
    if (!currentRegion) return;
    const savedCardId = progressRef.current.currentCard;
    if (savedCardId) {
      const idx = currentRegion.cards.findIndex((c) => c.id === savedCardId);
      if (idx >= 0) setSelectedCardIndex(idx);
    }
  }, [currentRegion?.id]);

  // Autosave
  useEffect(() => {
    const next = {
      ...progressRef.current,
      currentRegion: selectedRegion,
      currentCard: currentCard?.id,
    };
    if (next.currentRegion === progressRef.current.currentRegion && next.currentCard === progressRef.current.currentCard) return;
    updateJourneyProgress(next);
  }, [selectedRegion, currentCard?.id, updateJourneyProgress]);

  const handleCardComplete = () => {
    if (!currentCard || !currentRegion) return;

    const newCompleted = [...progressRef.current.completedCards];
    if (!newCompleted.includes(currentCard.id)) newCompleted.push(currentCard.id);

    const regionIds = currentRegion.cards.map(c => c.id);
    const isRegionComplete = regionIds.every(id => newCompleted.includes(id));

    let newBadges = [...progressRef.current.earnedBadges];
    let newVisited = [...progressRef.current.visitedRegions];

    if (isRegionComplete) {
      const badgeId = `${selectedRegion}-complete`;
      if (!newBadges.includes(badgeId)) newBadges.push(badgeId);
      if (!newVisited.includes(selectedRegion)) newVisited.push(selectedRegion);
    }

    updateJourneyProgress({
      ...progressRef.current,
      completedCards: newCompleted,
      earnedBadges: newBadges,
      visitedRegions: newVisited
    });

    // Auto-advance
    if (selectedCardIndex < currentRegion.cards.length - 1) {
      setTimeout(() => setSelectedCardIndex(i => i + 1), 600);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full relative bg-stone-950">
      {/* Full page background */}
      <div className="fixed inset-0 bg-gradient-to-br from-stone-950 via-stone-950 to-slate-950 -z-10" />

      {/* Subtle sacred geometry watermark */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-[0.015] -z-10">
        <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px]" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#fbbf24" strokeWidth="0.15" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="#fbbf24" strokeWidth="0.15" />
          <polygon points="50,10 85,70 15,70" fill="none" stroke="#fbbf24" strokeWidth="0.1" />
          <polygon points="50,90 15,30 85,30" fill="none" stroke="#fbbf24" strokeWidth="0.1" />
        </svg>
      </div>

      <div className="flex flex-col lg:flex-row h-[calc(100dvh-80px)] min-h-[600px] rounded-2xl border border-stone-800/60 bg-stone-950/80 backdrop-blur-sm shadow-2xl relative mx-4 my-4">

        {/* Mobile Backdrop when Sidebar is Open */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* SIDEBAR: The Path */}
        <div className={`flex-shrink-0 bg-gradient-to-b from-slate-950 to-stone-950 overflow-y-auto overflow-x-hidden custom-scrollbar fixed lg:relative inset-y-0 left-0 z-30 lg:inset-auto border-0 lg:border-r w-72 lg:w-80 transition-transform duration-300 ease-out ${sidebarOpen
          ? 'translate-x-0 shadow-2xl border-r border-slate-800/50'
          : '-translate-x-full lg:translate-x-0 pointer-events-none lg:pointer-events-auto lg:border-slate-800/50'
          }`}>

          {/* Header with Sacred Geometry accent */}
          <div className={`p-6 pb-4 border-b border-slate-800/50 transition-opacity duration-500 relative overflow-hidden ${sidebarOpen ? 'opacity-100' : 'opacity-0 lg:opacity-100'
            }`}>
            <div className="absolute top-2 right-2 opacity-20">
              <SacredGeometryIcon regionId="core" size={48} />
            </div>
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-[0.2em] flex items-center gap-3 relative z-10">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 shadow-lg shadow-amber-500/50"></span>
              The Path
            </h2>
            <p className="text-[10px] text-stone-600 mt-2 font-light tracking-wide">Navigate the territories of integral understanding</p>
          </div>

          <div className={`p-5 pt-4 transition-opacity duration-500 ${sidebarOpen ? 'opacity-100' : 'opacity-0 lg:opacity-100'
            }`}>

            <div className="space-y-3">
              {journeyRegions.map((region) => {
                const isRegionActive = region.id === selectedRegion;
                const isRegionComplete = journeyProgress.earnedBadges.includes(`${region.id}-complete`);
                const rColors = regionColors[region.id] || regionColors.core;

                return (
                  <div key={region.id} className="relative">
                    {/* Region Header */}
                    <button
                      onClick={() => { setSelectedRegion(region.id); setSelectedCardIndex(0); window.innerWidth < 1024 && setSidebarOpen(false); }}
                      className={`flex items-center gap-3 w-full text-left mb-2 group rounded-xl px-3 py-3 transition-all duration-300 min-h-[52px] ${isRegionActive
                        ? `bg-slate-800/80 shadow-lg ${rColors.glow} border border-slate-700/50`
                        : 'hover:bg-slate-800/40 border border-transparent'
                        }`}
                    >
                      <div className={`flex-shrink-0 transition-transform duration-300 ${isRegionActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                        <SacredGeometryIcon regionId={region.id} size={28} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`block truncate text-sm font-semibold tracking-tight transition-colors duration-200 ${isRegionActive ? 'text-amber-50' : 'text-slate-300 group-hover:text-slate-100'
                          }`}>
                          {region.name}
                        </span>
                        <span className="text-[10px] text-stone-600 truncate block">
                          {region.cards.filter(c => journeyProgress.completedCards.includes(c.id)).length}/{region.cards.length} complete
                        </span>
                      </div>
                      {isRegionComplete && <CheckCircle2 size={14} className="flex-shrink-0 text-emerald-400" />}
                    </button>

                    {/* Chapter List (Cards) */}
                    {isRegionActive && (
                      <div className="ml-5 border-l border-slate-800/50 pl-4 space-y-1.5 animate-in fade-in duration-300 mb-2">
                        {region.cards.map((card, cIdx) => {
                          const isCardActive = isRegionActive && cIdx === selectedCardIndex;
                          const isCardComplete = journeyProgress.completedCards.includes(card.id);

                          return (
                            <button
                              key={card.id}
                              onClick={() => { setSelectedCardIndex(cIdx); window.innerWidth < 1024 && setSidebarOpen(false); }}
                              className={`flex items-center justify-between w-full text-left py-2 px-3 rounded-lg text-sm min-h-[40px] transition-all duration-200 group ${isCardActive
                                ? `bg-gradient-to-r ${rColors.bg} to-transparent text-amber-50 font-medium border-l-2 border-amber-500 pl-2.5`
                                : isCardComplete
                                  ? 'text-slate-500 hover:bg-slate-800/40 hover:text-slate-300'
                                  : 'text-slate-300 hover:bg-slate-800/40 hover:text-slate-200'
                                }`}
                            >
                              <span className="truncate pr-2 flex-1 text-xs">{card.title}</span>
                              {isCardComplete && <CheckCircle2 size={12} className="flex-shrink-0 text-emerald-400" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* MAIN CONTENT: The Reader */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-stone-950 relative custom-scrollbar">
          {/* Dynamic gradient based on current region */}
          <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} via-stone-950/0 to-stone-950/0 pointer-events-none opacity-50`} />

          {/* Subtle sacred geometry pattern in background */}
          <div className="absolute top-10 right-10 pointer-events-none opacity-[0.03]">
            <SacredGeometryIcon regionId={selectedRegion} size={300} />
          </div>

          {currentCard ? (
            <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-10 lg:py-12 relative z-10 pb-32">

              {/* Breadcrumb with mobile toggle */}
              <div className="flex items-center gap-3 text-xs font-sans text-stone-500 mb-4 uppercase tracking-widest">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden flex-shrink-0 p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/50 text-slate-400 hover:text-slate-200 transition-all duration-200"
                  aria-label={sidebarOpen ? 'Close navigation sidebar' : 'Open navigation sidebar'}
                  aria-expanded={sidebarOpen}
                >
                  {sidebarOpen ? <X size={16} strokeWidth={1.5} /> : <Menu size={16} strokeWidth={1.5} />}
                </button>
                <div className="flex-shrink-0 opacity-60">
                  <SacredGeometryIcon regionId={selectedRegion} size={18} />
                </div>
                <span className={`${colors.primary} font-semibold`}>{currentRegion?.name}</span>
                <ChevronRight size={10} className="opacity-30" />
                <span>Lesson {selectedCardIndex + 1} of {currentRegion?.cards.length}</span>
              </div>

              {/* Progress bar */}
              <div className="h-0.5 w-full bg-stone-800/60 rounded-full overflow-hidden mb-10">
                <div
                  className="h-full bg-amber-500/50 rounded-full transition-all duration-500"
                  style={{ width: `${((selectedCardIndex + 1) / (currentRegion?.cards.length || 1)) * 100}%` }}
                />
              </div>

              {/* The Card Content */}
              <LearningCard
                key={currentCard.id}
                card={currentCard}
                isCompleted={journeyProgress.completedCards.includes(currentCard.id)}
                onComplete={handleCardComplete}
              />

              {/* Footer Navigation */}
              <div className="mt-16 pt-8 border-t border-stone-800/50 flex justify-between items-center gap-4 text-sm">
                <button
                  onClick={() => setSelectedCardIndex(i => Math.max(0, i - 1))}
                  disabled={selectedCardIndex === 0}
                  className="text-stone-500 hover:text-stone-300 disabled:opacity-0 transition-colors flex items-center gap-2"
                >
                  <ChevronRight size={14} className="rotate-180" /> Previous
                </button>

                {selectedCardIndex < (currentRegion?.cards.length || 0) - 1 ? (
                  <button
                    onClick={() => setSelectedCardIndex(i => i + 1)}
                    className="text-stone-400 hover:text-stone-100 transition-colors flex items-center gap-2 font-medium group text-right"
                  >
                    <div className="flex flex-col items-end">
                      <span className="flex items-center gap-1.5">
                        Next Lesson
                        <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                      </span>
                      {currentRegion?.cards[selectedCardIndex + 1] && (
                        <span className="text-[10px] text-stone-600 font-normal">
                          {currentRegion.cards[selectedCardIndex + 1].title}
                        </span>
                      )}
                    </div>
                  </button>
                ) : (
                  <span className="text-emerald-500/80 font-mono text-xs border border-emerald-900/30 px-4 py-1.5 rounded-full bg-emerald-950/30">
                    ✦ Module Complete
                  </span>
                )}
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-stone-700">
              <SacredGeometryIcon regionId="integral" size={64} className="mb-4 opacity-30" />
              <p className="text-sm">Select a module to begin your journey.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}