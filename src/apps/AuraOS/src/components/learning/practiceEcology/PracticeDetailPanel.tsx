import React from 'react';
import { AlertCircle, Link2 } from 'lucide-react';
import { getIconComponent } from '../../../../.claude/lib/iconMap';

import type {
  EcologyQuadrant,
  PracticeEcologyPractice,
  QuadrantId,
} from './practiceEcologyData';

/**
 * VISUAL DESIGN: Ecology Systems Detail Panel
 * 
 * Design principles:
 * 1. Frosted glass aesthetic - semi-translucent with backdrop blur
 * 2. Organic intensity indicators - emerald-based bars with glow
 * 3. Quadrant badges - compact colored dots for AQAL identity
 * 4. Canvas integration - visual continuity with heatmap
 */

interface PracticeDetailPanelProps {
  practice: PracticeEcologyPractice;
  quadrants: EcologyQuadrant[];
  selectedQuadrantId: QuadrantId;
  practiceById: Record<string, PracticeEcologyPractice>;
  onSelectPractice: (practiceId: string, preferredQuadrant?: QuadrantId) => void;
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

// Quadrant accent colors
const quadrantAccents: Record<QuadrantId, { dot: string; bg: string; text: string }> = {
  I: { dot: 'bg-purple-400', bg: 'bg-purple-500/10', text: 'text-purple-200' },
  WE: { dot: 'bg-rose-400', bg: 'bg-rose-500/10', text: 'text-rose-200' },
  IT: { dot: 'bg-teal-400', bg: 'bg-teal-500/10', text: 'text-teal-200' },
  ITS: { dot: 'bg-emerald-400', bg: 'bg-emerald-500/10', text: 'text-emerald-200' },
};

const IntensityBar = ({
  label,
  value,
  max = 5,
  variant = 'default',
}: {
  label: string;
  value: number;
  max?: number;
  variant?: 'default' | 'compact';
}) => {
  const pct = clamp((value / max) * 100, 0, 100);
  const glowOpacity = value / max;
  
  return (
    <div className={variant === 'compact' ? 'space-y-1' : 'space-y-1.5'}>
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-slate-400">{label}</span>
        <span className="font-mono text-emerald-300/90">{value}/{max}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-900/80 border border-slate-700/50 overflow-hidden relative">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
          style={{ 
            width: `${pct}%`,
            boxShadow: value > 0 ? `0 0 ${8 * glowOpacity}px rgba(16, 185, 129, ${0.3 + glowOpacity * 0.4})` : 'none'
          }}
        />
      </div>
    </div>
  );
};

export const PracticeDetailPanel: React.FC<PracticeDetailPanelProps> = ({
  practice,
  quadrants,
  selectedQuadrantId,
  practiceById,
  onSelectPractice,
}) => {
  const primaryQuadrant = quadrants.find((q) => q.id === practice.primaryQuadrant);
  const primaryAccent = primaryQuadrant ? quadrantAccents[primaryQuadrant.id] : null;

  return (
    <section
      className="relative rounded-2xl overflow-hidden"
      aria-label="Selected practice details"
    >
      {/* Frosted glass background */}
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" />
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 via-transparent to-teal-900/10" />
      
      {/* Content */}
      <div className="relative p-6 border border-emerald-500/20 rounded-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white leading-tight">{practice.name}</h3>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {practice.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800/60 border border-slate-700/50 text-slate-300"
                >
                  {tag}
                </span>
              ))}
              {primaryAccent && primaryQuadrant && (
                <span
                  className={`text-[11px] px-2.5 py-1 rounded-full ${primaryAccent.bg} border border-white/10 ${primaryAccent.text} flex items-center gap-1.5`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${primaryAccent.dot}`} />
                  Primary: {primaryQuadrant.label}
                </span>
              )}
            </div>
          </div>
          
          {/* Ecology icon */}
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            {React.createElement(getIconComponent('NeuralConvergence') || 'div', { size: 18, className: "text-emerald-400" })}
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed mt-4">{practice.description}</p>

        {/* Quadrant effects cards */}
        <div className="mt-6 space-y-2">
          <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
            Quadrant Effects
          </h4>
          
          <div className="grid gap-2">
            {quadrants.map((quadrant) => {
              const effect = practice.effects[quadrant.id];
              const isActive = quadrant.id === selectedQuadrantId;
              const accent = quadrantAccents[quadrant.id];
              const maxIntensity = Math.max(effect.shortTerm, effect.longTerm);
              const glowOpacity = maxIntensity / 5;

              return (
                <button
                  key={quadrant.id}
                  type="button"
                  className={`relative text-left rounded-xl border transition-all duration-300 overflow-hidden p-4
                    focus:outline-none focus:ring-2 focus:ring-emerald-400/60 focus:ring-offset-2 focus:ring-offset-slate-950
                    ${isActive
                      ? 'border-emerald-400/50 scale-[1.01]'
                      : 'border-slate-700/40 hover:border-slate-600/50'
                    }`}
                  style={{
                    backgroundColor: isActive 
                      ? 'rgba(16, 185, 129, 0.08)' 
                      : 'rgba(15, 23, 42, 0.4)',
                    boxShadow: isActive 
                      ? `0 0 ${16 * glowOpacity}px rgba(16, 185, 129, 0.2)` 
                      : 'none'
                  }}
                  onClick={() => onSelectPractice(practice.id, quadrant.id)}
                  aria-label={`Select ${practice.name}, quadrant ${quadrant.label}`}
                  aria-pressed={isActive}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${accent.dot}`} />
                      <div>
                        <div className="text-sm font-semibold text-white">{quadrant.label}</div>
                        <div className="text-[10px] text-slate-400">{quadrant.name}</div>
                      </div>
                    </div>
                    <div className="text-[11px] font-mono text-emerald-400/80">
                      {effect.shortTerm}/{effect.longTerm}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300/90 mt-2.5 leading-relaxed">{effect.summary}</p>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <IntensityBar label="Short-term" value={effect.shortTerm} variant="compact" />
                    <IntensityBar label="Long-term" value={effect.longTerm} variant="compact" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Side effects & complements grid */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {/* Side effects */}
          <div className="rounded-xl border border-slate-700/40 bg-slate-900/40 p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={14} className="text-amber-400/70" />
              <h4 className="text-sm font-semibold text-slate-200">Typical side effects</h4>
            </div>
            <ul className="space-y-1.5">
              {practice.typicalSideEffects.map((item) => (
                <li key={item} className="text-xs text-slate-400 flex items-start gap-2">
                  <span className="text-amber-500/60 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommended complements */}
          <div className="rounded-xl border border-slate-700/40 bg-slate-900/40 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Link2 size={14} className="text-emerald-400/70" />
              <h4 className="text-sm font-semibold text-slate-200">Complements</h4>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Cross-quadrant practices that create balance.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {practice.recommendedComplements
                .map((id) => practiceById[id])
                .filter(Boolean)
                .map((p) => {
                  const complementAccent = quadrantAccents[p.primaryQuadrant];
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => onSelectPractice(p.id, p.primaryQuadrant)}
                      className="group text-[11px] px-2.5 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/50 
                        text-slate-300 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-200
                        focus:outline-none focus:ring-2 focus:ring-emerald-400/60 transition-all duration-200
                        flex items-center gap-1.5"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${complementAccent.dot} opacity-60 group-hover:opacity-100`} />
                      {p.name}
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
