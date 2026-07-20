import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  Grid3x3,
  Layers,
  Leaf,
  Network,
  Sprout,
  TrendingUp,
} from 'lucide-react';
import { typography } from '../../../theme';
import { getIconComponent } from '../../../.claude/lib/iconMap';
import { TabShell } from '../../../components/shared/TabShell';

import {
  ecologyQuadrants,
  practiceEcologyPractices,
  practiceEcologyRecipes,
  type EcologyTimeHorizon,
  type PracticeEcologyPractice,
  type QuadrantId,
} from './practiceEcology/practiceEcologyData';
import { PracticeEcologyHeatmap } from './practiceEcology/PracticeEcologyHeatmap';
import { PracticeDetailPanel } from './practiceEcology/PracticeDetailPanel';
import { EcologyLegend } from './practiceEcology/EcologyLegend';

/**
 * PRACTICE ECOLOGY - Visual Design Document
 * 
 * Theme: "Living Systems Matrix"
 * 
 * This tab uses a distinctive ecology-native visual identity:
 * 1. Emerald/teal as the dominant color (organic, growth, interconnection)
 * 2. Subtle dot-grid background evoking systems/network thinking
 * 3. Glowing "living node" cells that brighten with intensity
 * 4. Frosted glass panels for detail views
 * 5. AQAL quadrant identity preserved via colored dot badges
 * 
 * This distinguishes it from:
 * - IntegralTheory (purple/indigo, developmental stages focus)
 * - MetamodernBridgeBuilder (violet/amber, matrix bridges)
 */

// Quadrant accent colors for consistency
const quadrantAccents: Record<QuadrantId, { dot: string; gradient: string }> = {
  I: { dot: 'bg-purple-400', gradient: 'from-purple-500 to-fuchsia-500' },
  WE: { dot: 'bg-rose-400', gradient: 'from-pink-500 to-rose-500' },
  IT: { dot: 'bg-teal-400', gradient: 'from-blue-500 to-cyan-500' },
  ITS: { dot: 'bg-emerald-400', gradient: 'from-emerald-500 to-teal-500' },
};

interface CollapsiblePanelProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accentColor: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const CollapsiblePanel: React.FC<CollapsiblePanelProps> = ({
  title,
  subtitle,
  icon,
  accentColor,
  isOpen,
  onToggle,
  children,
}) => {
  return (
    <div
      className={`relative rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
        isOpen ? `${accentColor} border-opacity-40` : 'border-slate-800/60 hover:border-slate-700/60'
      }`}
    >
      {/* Ecology-themed panel background */}
      <div className="absolute inset-0 bg-slate-950/80" />
      {isOpen && (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/5 via-transparent to-teal-900/5" />
      )}
      
      <button
        onClick={onToggle}
        className={`relative w-full px-6 py-5 flex items-center justify-between transition-all duration-300 ${
          isOpen
            ? 'bg-gradient-to-r from-slate-900/40 to-slate-900/20'
            : 'bg-slate-900/30 hover:bg-slate-800/40'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className={`p-2.5 rounded-xl transition-colors duration-300 ${
            isOpen ? 'bg-emerald-500/15 border border-emerald-500/20' : 'bg-slate-800/50 border border-slate-700/50'
          }`}>
            {icon}
          </div>
          <div className="text-left">
            <h2 className={typography.h4}>{title}</h2>
            <p className={typography.label + ' mt-0.5'}>{subtitle}</p>
          </div>
        </div>
        <ChevronDown
          size={24}
          className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <div
        className={`transition-all duration-500 ease-in-out ${
          isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="relative p-6 sm:p-8">{children}</div>
      </div>
    </div>
  );
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const getIntensity = (practice: PracticeEcologyPractice, quadrantId: QuadrantId, horizon: EcologyTimeHorizon) => {
  const effect = practice.effects[quadrantId];
  return horizon === 'shortTerm' ? effect.shortTerm : effect.longTerm;
};

const aggregateFootprint = (
  practiceIds: string[],
  practiceById: Record<string, PracticeEcologyPractice>,
  horizon: EcologyTimeHorizon
): Record<QuadrantId, number> => {
  const totals: Record<QuadrantId, number> = { I: 0, WE: 0, IT: 0, ITS: 0 };
  const included = practiceIds.map((id) => practiceById[id]).filter(Boolean);

  if (included.length === 0) return totals;

  for (const practice of included) {
    for (const q of ecologyQuadrants) {
      totals[q.id] += getIntensity(practice, q.id, horizon);
    }
  }

  for (const q of ecologyQuadrants) {
    totals[q.id] = clamp(Math.round(totals[q.id] / included.length), 0, 5);
  }

  return totals;
};

const FootprintMiniMap = ({ footprint }: { footprint: Record<QuadrantId, number> }) => {
  return (
    <div className="grid grid-cols-4 gap-2">
      {ecologyQuadrants.map((q) => {
        const intensity = footprint[q.id];
        const opacity = intensity === 0 ? 0.05 : 0.15 + (intensity / 5) * 0.6;
        const accent = quadrantAccents[q.id];
        
        return (
          <div
            key={q.id}
            className="relative rounded-lg border border-slate-700/40 overflow-hidden py-3"
            style={{
              backgroundColor: `rgba(16, 185, 129, ${opacity})`,
              boxShadow: intensity > 0 ? `inset 0 0 ${intensity * 3}px rgba(16, 185, 129, 0.15)` : 'none'
            }}
            aria-label={`Recipe footprint ${q.label}: ${intensity} of 5`}
          >
            <div className="relative flex flex-col items-center justify-center gap-1">
              <div className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${accent.dot}`} />
                <span className="text-[10px] font-bold text-slate-200">{q.label}</span>
              </div>
              <span className="text-xs font-mono text-emerald-200/90">{intensity}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default function PracticeEcologyMap() {
  const practiceById = useMemo(
    () =>
      Object.fromEntries(practiceEcologyPractices.map((p) => [p.id, p])) as Record<
        string,
        PracticeEcologyPractice
      >,
    []
  );

  const defaultPractice = practiceEcologyPractices[0];

  const [openPanels, setOpenPanels] = useState<Set<string>>(new Set(['orientation', 'heatmap']));
  const [timeHorizon, setTimeHorizon] = useState<EcologyTimeHorizon>('longTerm');
  const [selectedPracticeId, setSelectedPracticeId] = useState<string>(defaultPractice?.id ?? 'meditation');
  const [selectedQuadrantId, setSelectedQuadrantId] = useState<QuadrantId>(
    defaultPractice?.primaryQuadrant ?? 'I'
  );

  const selectedPractice = practiceById[selectedPracticeId] ?? defaultPractice;

  const togglePanel = (id: string) => {
    setOpenPanels((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectCell = (practiceId: string, quadrantId: QuadrantId) => {
    setSelectedPracticeId(practiceId);
    setSelectedQuadrantId(quadrantId);
  };

  const handleSelectPractice = (practiceId: string, preferredQuadrant?: QuadrantId) => {
    const practice = practiceById[practiceId];
    if (!practice) return;
    setSelectedPracticeId(practiceId);
    setSelectedQuadrantId(preferredQuadrant ?? practice.primaryQuadrant);
    setOpenPanels((prev) => new Set([...prev, 'heatmap']));
  };

  const intensityRanking = useMemo(() => {
    if (!selectedPractice) return [];
    return ecologyQuadrants
      .map((q) => ({
        quadrant: q,
        intensity: getIntensity(selectedPractice, q.id, timeHorizon),
      }))
      .sort((a, b) => b.intensity - a.intensity);
  }, [selectedPractice, timeHorizon]);

  const primary = intensityRanking[0];
  const secondary = intensityRanking.slice(1, 3);

  const sections = [
    {
      id: 'orientation',
      title: 'Practice Ecology',
      subtitle: 'How practices ripple across AQAL quadrants over time',
      icon: React.createElement(getIconComponent('AetherBreath') || Sprout, { size: 20, className: 'text-emerald-400' }),
      accentColor: 'border-emerald-500',
      component: (
        <div className="space-y-8">
          {/* Hero intro with ecology framing */}
          <div className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-slate-900/40 to-teal-900/20" />
            <div className="relative p-6 border border-emerald-500/20 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/20 shrink-0">
                  <Network size={24} className="text-emerald-400" />
                </div>
                <div>
                  <h3 className={typography.h4 + ' mb-2'}>Practices are ecosystems</h3>
                  <p className={typography.body}>
                    A practice is never "just" one thing. Strength training changes your body—but also your confidence, your
                    relationships, and your capacity to show up inside systems. Meditation changes your inner world—but also how
                    you communicate, lead, and recover.
                  </p>
                  <p className={typography.body + ' mt-3'}>
                    <strong className="text-emerald-300">Practice ecology</strong> treats your stack like an ecosystem: 
                    interventions have primary effects, secondary effects, and time-delayed propagation. The goal is not perfection. 
                    It's to reduce blind spots and build a stack whose benefits compound.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quadrant overview cards */}
          <div className="grid md:grid-cols-2 gap-3">
            {ecologyQuadrants.map((q) => {
              const accent = quadrantAccents[q.id];
              return (
                <div
                  key={q.id}
                  className="group rounded-xl border border-slate-700/40 bg-slate-900/40 p-5 
                    hover:border-slate-600/50 transition-all duration-200 relative overflow-hidden"
                >
                  {/* Subtle quadrant-colored accent on hover */}
                  <div 
                    className={`absolute inset-0 bg-gradient-to-br ${accent.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300`} 
                  />
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`w-3 h-3 rounded-full ${accent.dot}`} />
                        <div>
                          <span className="text-xl font-black text-white">{q.label}</span>
                          <span className="text-xs text-slate-400 ml-2">{q.name}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-600 uppercase tracking-wider">AQAL</span>
                    </div>
                    <p className="text-sm text-slate-400 mt-3 leading-relaxed">{q.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* How to use callout */}
          <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-r from-emerald-900/15 via-slate-900/30 to-teal-900/15 p-6">
            <div className="flex items-center gap-2 mb-3">
              <Leaf size={16} className="text-emerald-400" />
              <h3 className={typography.h4 + ' text-slate-200'}>How to use this map</h3>
            </div>
            <ul className={typography.body + ' space-y-2'}>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">1.</span>
                <span>Start with a practice you already do.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">2.</span>
                <span>Inspect its <strong className="text-emerald-200">cross-quadrant</strong> effects (where it helps, where it doesn't).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">3.</span>
                <span>Add complements from the "missing" quadrants until the footprint feels balanced.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">4.</span>
                <span>Toggle short-term vs long-term to predict what will take time to compound.</span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'heatmap',
      title: 'Practice × Quadrant Matrix',
      subtitle: 'Click any cell to explore effects and complements',
      icon: <Grid3x3 size={20} className="text-emerald-400" />,
      accentColor: 'border-emerald-500',
      component: (
        <div className="space-y-6">
          {/* Time horizon toggle */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className={typography.h4 + ' text-white'}>Time horizon</h3>
              <p className={typography.body + ' mt-1'}>
                Short-term shows immediate changes. Long-term shows compounding ripple effects.
              </p>
            </div>

            <div
              className="inline-flex rounded-xl border border-emerald-500/20 bg-slate-900/60 p-1"
              role="radiogroup"
              aria-label="Heatmap time horizon"
            >
              {(
                [
                  { id: 'shortTerm', label: 'Short-term' },
                  { id: 'longTerm', label: 'Long-term' },
                ] as const
              ).map((opt) => {
                const active = timeHorizon === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setTimeHorizon(opt.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 
                      focus:outline-none focus:ring-2 focus:ring-emerald-400/60 ${
                      active
                        ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30'
                        : 'text-slate-300 hover:bg-slate-800/60 border border-transparent'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <EcologyLegend />

          {/* Main content: Heatmap + Detail panel */}
          <div className="grid xl:grid-cols-5 gap-6 items-start">
            {/* Heatmap - takes more space */}
            <div className="xl:col-span-3 overflow-x-auto">
              <PracticeEcologyHeatmap
                practices={practiceEcologyPractices}
                quadrants={ecologyQuadrants}
                timeHorizon={timeHorizon}
                selectedPracticeId={selectedPracticeId}
                selectedQuadrantId={selectedQuadrantId}
                onSelectCell={handleSelectCell}
              />
            </div>

            {/* Detail panel */}
            <div className="xl:col-span-2">
              {selectedPractice ? (
                <PracticeDetailPanel
                  practice={selectedPractice}
                  quadrants={ecologyQuadrants}
                  selectedQuadrantId={selectedQuadrantId}
                  practiceById={practiceById}
                  onSelectPractice={handleSelectPractice}
                />
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/30 p-8 text-center">
                  <Sprout size={32} className="text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">Select a practice cell to see details.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'dynamics',
      title: 'Cross-Quadrant Dynamics',
      subtitle: 'Direct effects, secondary effects, and propagation pathways',
      icon: <TrendingUp size={20} className="text-emerald-400" />,
      accentColor: 'border-emerald-500',
      component: (
        <div className="space-y-6">
          {selectedPractice ? (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Strongest quadrants */}
                <div className="rounded-xl border border-slate-700/40 bg-slate-900/40 p-6">
                  <h3 className="text-base font-bold text-white">
                    Strongest quadrants 
                    <span className="text-sm font-normal text-slate-400 ml-2">
                      ({timeHorizon === 'shortTerm' ? 'short' : 'long'}-term)
                    </span>
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    For <span className="font-semibold text-emerald-300">{selectedPractice.name}</span>, 
                    these are the most noticeable leverage points.
                  </p>

                  <div className="mt-4 space-y-3">
                    {primary && (
                      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
                        <div className="text-[10px] text-emerald-400/70 uppercase tracking-wider">Primary</div>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${quadrantAccents[primary.quadrant.id].dot}`} />
                            <span className="font-bold text-white">
                              {primary.quadrant.label} — {primary.quadrant.name}
                            </span>
                          </div>
                          <span className="font-mono text-emerald-300">{primary.intensity}/5</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                          {selectedPractice.effects[primary.quadrant.id].summary}
                        </p>
                      </div>
                    )}

                    {secondary.length > 0 && (
                      <div className="rounded-lg border border-slate-700/40 bg-slate-900/50 p-4">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Secondary</div>
                        <div className="mt-2 space-y-2">
                          {secondary.map((entry) => (
                            <div key={entry.quadrant.id} className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm text-slate-200">
                                <span className={`w-2 h-2 rounded-full ${quadrantAccents[entry.quadrant.id].dot}`} />
                                {entry.quadrant.label} — {entry.quadrant.name}
                              </div>
                              <span className="text-xs font-mono text-slate-400">{entry.intensity}/5</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Propagation pathways */}
                <div className="rounded-xl border border-slate-700/40 bg-slate-900/40 p-6">
                  <h3 className="text-base font-bold text-white">Propagation pathways</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Typical "how it spreads" patterns. (These are heuristics—your context matters.)
                  </p>

                  <div className="mt-4 space-y-3">
                    {selectedPractice.propagation.map((edge) => {
                      const from = ecologyQuadrants.find((q) => q.id === edge.from);
                      const to = ecologyQuadrants.find((q) => q.id === edge.to);
                      const fromAccent = quadrantAccents[edge.from];
                      const toAccent = quadrantAccents[edge.to];
                      
                      return (
                        <div
                          key={`${edge.from}-${edge.to}`}
                          className="rounded-lg border border-slate-700/40 bg-slate-950/40 p-4"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-sm text-slate-200">
                              <span className={`w-2 h-2 rounded-full ${fromAccent.dot}`} />
                              <span className="font-bold">{from?.label}</span>
                              <ArrowRight size={14} className="text-emerald-500/60" />
                              <span className={`w-2 h-2 rounded-full ${toAccent.dot}`} />
                              <span className="font-bold">{to?.label}</span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-500">
                              Strength {edge.strength}/3
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-slate-400 leading-relaxed">{edge.note}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Pattern callout */}
              <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-r from-emerald-900/15 via-slate-900/30 to-teal-900/15 p-6">
                <h3 className="text-base font-bold text-slate-200">A common ecology pattern</h3>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  <span className="font-mono text-emerald-300">IT → I → WE → ITS</span> is a classic sequence: 
                  regulate the body (IT), which stabilizes your inner world (I), which makes connection and repair 
                  easier (WE), which then becomes durable inside teams and systems (ITS). Other practices reverse 
                  the flow (e.g., ITS work can force new IT habits).
                </p>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center">
              <TrendingUp size={32} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">Select a practice to see cross-quadrant dynamics.</p>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'recipes',
      title: 'Practice Ecology Recipes',
      subtitle: 'Example stacks and their "ecology footprints"',
      icon: <Layers size={20} className="text-emerald-400" />,
      accentColor: 'border-emerald-500',
      component: (
        <div className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">Pre-built stacks</h3>
              <p className="text-sm text-slate-400 mt-1">
                Each recipe is a coherent ecology: practices from different quadrants supporting each other.
              </p>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Showing {timeHorizon === 'shortTerm' ? 'short-term' : 'long-term'} averages
            </span>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {practiceEcologyRecipes.map((recipe) => {
              const footprint = aggregateFootprint(recipe.practiceIds, practiceById, timeHorizon);
              const practices = recipe.practiceIds.map((id) => practiceById[id]).filter(Boolean);

              return (
                <div
                  key={recipe.id}
                  className="group relative rounded-2xl border border-slate-700/40 bg-slate-950/50 p-6 
                    hover:border-emerald-500/30 transition-all duration-300 overflow-hidden"
                >
                  {/* Subtle glow on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative">
                    <h4 className={typography.h4}>{recipe.name}</h4>
                    <div className="text-sm text-emerald-300/80 mt-1">{recipe.intention}</div>
                    <p className="text-xs text-slate-500 mt-3 leading-relaxed">{recipe.description}</p>

                    <div className="mt-5">
                      <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-2">
                        Footprint
                      </div>
                      <FootprintMiniMap footprint={footprint} />
                    </div>

                    <div className="mt-5">
                      <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-2">
                        Included practices
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {practices.map((p) => {
                          const accent = quadrantAccents[p.primaryQuadrant];
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => handleSelectPractice(p.id, p.primaryQuadrant)}
                              className="text-[11px] px-2.5 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/50 
                                text-slate-300 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-200
                                focus:outline-none focus:ring-2 focus:ring-emerald-400/60 transition-all duration-200
                                flex items-center gap-1.5"
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${accent.dot}`} />
                              {p.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const first = practices[0];
                        if (first) handleSelectPractice(first.id, first.primaryQuadrant);
                      }}
                      className="mt-6 w-full rounded-xl bg-emerald-500/10 border border-emerald-500/30 
                        text-emerald-200 py-2.5 text-sm font-semibold 
                        hover:bg-emerald-500/20 hover:border-emerald-400/40 
                        focus:outline-none focus:ring-2 focus:ring-emerald-400/60 
                        transition-all duration-200"
                    >
                      Open in matrix
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ),
    },
  ];

  return (
    <TabShell 
      tab="practice-ecology"
      subtitle="Living systems matrix - visualize interconnected practices across quadrants and time horizons"
    >
      {/* Subtle background grid pattern */}
      <svg className="fixed inset-0 w-full h-full -z-10 opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="page-ecology-grid" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="16" cy="16" r="1" fill="currentColor" className="text-emerald-400" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#page-ecology-grid)" />
      </svg>
      
      {/* Ambient glow effects */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="space-y-4">
        {sections.map((section) => (
          <CollapsiblePanel
            key={section.id}
            title={section.title}
            subtitle={section.subtitle}
            icon={section.icon}
            accentColor={section.accentColor}
            isOpen={openPanels.has(section.id)}
            onToggle={() => togglePanel(section.id)}
          >
            {section.component}
          </CollapsiblePanel>
        ))}
      </div>
    </TabShell>
  );
}
