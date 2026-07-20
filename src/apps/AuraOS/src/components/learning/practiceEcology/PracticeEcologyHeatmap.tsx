import React, { useMemo, useRef, useState } from 'react';

import type {
  EcologyQuadrant,
  EcologyTimeHorizon,
  PracticeEcologyPractice,
  QuadrantId,
} from './practiceEcologyData';

/**
 * VISUAL DESIGN: "Ecology Systems Matrix"
 * 
 * Design principles for this component:
 * 1. Living nodes - cells glow organically based on intensity, evoking living systems
 * 2. Single-hue intensity - emerald/teal scale for cohesion, quadrant identity via badges
 * 3. Systems canvas - subtle grid background suggesting interconnection
 * 4. Organic transitions - soft, breathing animations that feel natural
 */

interface PracticeEcologyHeatmapProps {
  practices: PracticeEcologyPractice[];
  quadrants: EcologyQuadrant[];
  timeHorizon: EcologyTimeHorizon;
  selectedPracticeId: string;
  selectedQuadrantId: QuadrantId;
  onSelectCell: (practiceId: string, quadrantId: QuadrantId) => void;
}

interface TooltipState {
  isVisible: boolean;
  x: number;
  y: number;
  title: string;
  body: string;
}

const MAX_INTENSITY = 5;

// Ecology-themed intensity styling: emerald/teal for organic "living" feel
const getIntensityStyles = (intensity: number, isSelected: boolean, isHovered: boolean) => {
  const baseOpacity = intensity === 0 ? 0.05 : 0.15 + (intensity / MAX_INTENSITY) * 0.6;
  const glowIntensity = intensity === 0 ? 0 : Math.min(intensity * 4, 16);

  return {
    backgroundColor: intensity === 0
      ? 'rgba(30, 41, 59, 0.4)' // slate-800/40 for empty
      : `rgba(16, 185, 129, ${baseOpacity})`, // emerald-500
    boxShadow: isSelected
      ? `0 0 ${glowIntensity + 8}px rgba(16, 185, 129, 0.5), inset 0 0 12px rgba(16, 185, 129, 0.15)`
      : isHovered && intensity > 0
        ? `0 0 ${glowIntensity + 4}px rgba(16, 185, 129, 0.3), inset 0 0 8px rgba(16, 185, 129, 0.1)`
        : intensity > 0
          ? `inset 0 0 ${glowIntensity}px rgba(16, 185, 129, 0.1)`
          : 'none',
  };
};

// Quadrant badge colors (AQAL identity via small accent dots)
const quadrantAccents: Record<QuadrantId, { dot: string; border: string; label: string }> = {
  I: { dot: 'bg-purple-400', border: 'border-purple-500/30', label: 'Interior · Individual' },
  WE: { dot: 'bg-rose-400', border: 'border-rose-500/30', label: 'Interior · Collective' },
  IT: { dot: 'bg-teal-400', border: 'border-teal-500/30', label: 'Exterior · Individual' },
  ITS: { dot: 'bg-emerald-400', border: 'border-emerald-500/30', label: 'Exterior · Collective' },
};

export const PracticeEcologyHeatmap: React.FC<PracticeEcologyHeatmapProps> = ({
  practices,
  quadrants,
  timeHorizon,
  selectedPracticeId,
  selectedQuadrantId,
  onSelectCell,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cellRefMap = useRef<Record<string, HTMLButtonElement | null>>({});
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  const [tooltip, setTooltip] = useState<TooltipState>({
    isVisible: false,
    x: 0,
    y: 0,
    title: '',
    body: '',
  });

  const gridTemplateColumns = useMemo(() => {
    return 'minmax(200px, 1.5fr) repeat(4, minmax(80px, 1fr))';
  }, []);

  const selectedPracticeIndex = practices.findIndex((p) => p.id === selectedPracticeId);
  const selectedQuadrantIndex = quadrants.findIndex((q) => q.id === selectedQuadrantId);

  const showTooltip = (el: HTMLElement, title: string, body: string) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = el.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const x = rect.left - containerRect.left + rect.width / 2;
    const y = rect.top - containerRect.top;

    setTooltip({ isVisible: true, x, y, title, body });
  };

  const hideTooltip = () => {
    setTooltip((prev) => ({ ...prev, isVisible: false }));
  };

  const focusCell = (practiceId: string, quadrantId: QuadrantId) => {
    const key = `${practiceId}:${quadrantId}`;
    requestAnimationFrame(() => {
      cellRefMap.current[key]?.focus();
    });
  };

  const handleCellKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    practiceIndex: number,
    quadrantIndex: number
  ) => {
    let nextPracticeIndex = practiceIndex;
    let nextQuadrantIndex = quadrantIndex;

    switch (e.key) {
      case 'ArrowUp':
        nextPracticeIndex = Math.max(0, practiceIndex - 1);
        break;
      case 'ArrowDown':
        nextPracticeIndex = Math.min(practices.length - 1, practiceIndex + 1);
        break;
      case 'ArrowLeft':
        nextQuadrantIndex = Math.max(0, quadrantIndex - 1);
        break;
      case 'ArrowRight':
        nextQuadrantIndex = Math.min(quadrants.length - 1, quadrantIndex + 1);
        break;
      case 'Home':
        nextQuadrantIndex = 0;
        break;
      case 'End':
        nextQuadrantIndex = quadrants.length - 1;
        break;
      case 'Escape':
        hideTooltip();
        return;
      default:
        return;
    }

    e.preventDefault();

    const nextPractice = practices[nextPracticeIndex];
    const nextQuadrant = quadrants[nextQuadrantIndex];
    onSelectCell(nextPractice.id, nextQuadrant.id);
    focusCell(nextPractice.id, nextQuadrant.id);
  };

  return (
    <div
      ref={containerRef}
      className="relative rounded-2xl overflow-hidden"
      aria-label="Practice ecology heatmap"
    >
      {/* Ecology canvas background - subtle grid pattern */}
      <div className="absolute inset-0 bg-slate-950/80">
        {/* SVG grid pattern for "systems" feel */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="ecology-grid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="12" cy="12" r="1" fill="currentColor" className="text-emerald-400" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ecology-grid)" />
        </svg>
        {/* Soft radial glow from center */}
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(circle at center, rgba(6, 78, 59, 0.1), transparent 70%)' }}
        />
      </div>

      {/* Main content */}
      <div className="relative p-5 border border-emerald-500/20 rounded-2xl backdrop-blur-sm">
        {/* Scrollable matrix container */}
        <div className="overflow-x-auto">
          <div
            role="grid"
            aria-rowcount={practices.length + 1}
            aria-colcount={quadrants.length + 1}
            className="min-w-[600px]"
          >
            {/* Header row with quadrant badges */}
            <div role="row" className="grid gap-3 pb-4" style={{ gridTemplateColumns }}>
              <div role="columnheader" className="flex items-end px-3 pb-2">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Practices</span>
              </div>
              {quadrants.map((quadrant) => {
                const accent = quadrantAccents[quadrant.id];
                return (
                  <div
                    key={quadrant.id}
                    role="columnheader"
                    className="flex flex-col items-center"
                  >
                    <div
                      className={`w-full flex items-center justify-center gap-2 rounded-xl border ${accent.border} bg-slate-900/60 backdrop-blur-sm py-2.5 px-3`}
                    >
                      <span className={`w-2 h-2 rounded-full ${accent.dot}`} aria-hidden="true" />
                      <span className="text-sm font-bold text-white tracking-wide">{quadrant.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1.5 text-center leading-tight">
                      {accent.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Body - practice rows */}
            <div className="space-y-2">
              {practices.map((practice, practiceIndex) => {
                const isSelectedRow = practice.id === selectedPracticeId;
                const primaryAccent = quadrantAccents[practice.primaryQuadrant];

                return (
                  <div
                    key={practice.id}
                    role="row"
                    className={`grid gap-3 items-stretch transition-all duration-200 ${isSelectedRow ? 'scale-[1.01]' : ''
                      }`}
                    style={{ gridTemplateColumns }}
                  >
                    {/* Practice name cell with primary quadrant indicator */}
                    <div
                      role="rowheader"
                      className={`group px-4 py-3.5 rounded-xl border transition-all duration-200 ${isSelectedRow
                        ? 'border-emerald-500/40 bg-emerald-950/30'
                        : 'border-slate-800/60 bg-slate-900/40 hover:border-slate-700/60'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="leading-snug text-sm font-semibold text-white">
                          {practice.name}
                        </div>
                        <span
                          className={`w-2 h-2 rounded-full ${primaryAccent.dot} shrink-0 mt-1`}
                          title={`Primary: ${practice.primaryQuadrant}`}
                        />
                      </div>
                      <div className="flex items-center gap-1.5 mt-2">
                        {practice.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800/60 text-slate-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Intensity cells */}
                    {quadrants.map((quadrant, quadrantIndex) => {
                      const effect = practice.effects[quadrant.id];
                      const intensity = timeHorizon === 'shortTerm' ? effect.shortTerm : effect.longTerm;
                      const isSelectedCell = practice.id === selectedPracticeId && quadrant.id === selectedQuadrantId;
                      const cellKey = `${practice.id}:${quadrant.id}`;
                      const isHovered = hoveredCell === cellKey;

                      const intensityStyles = getIntensityStyles(intensity, isSelectedCell, isHovered);

                      return (
                        <button
                          key={quadrant.id}
                          ref={(node) => {
                            cellRefMap.current[cellKey] = node;
                          }}
                          type="button"
                          role="gridcell"
                          aria-selected={isSelectedCell}
                          aria-label={`${practice.name} — ${quadrant.label} — ${timeHorizon === 'shortTerm' ? 'short-term' : 'long-term'
                            } intensity ${intensity} of ${MAX_INTENSITY}`}
                          tabIndex={isSelectedCell ? 0 : -1}
                          onClick={() => onSelectCell(practice.id, quadrant.id)}
                          onKeyDown={(e) => handleCellKeyDown(e, practiceIndex, quadrantIndex)}
                          onMouseEnter={(e) => {
                            setHoveredCell(cellKey);
                            showTooltip(
                              e.currentTarget,
                              `${practice.name} • ${quadrant.label}`,
                              `${effect.summary} (Short ${effect.shortTerm}/5 • Long ${effect.longTerm}/5)`
                            );
                          }}
                          onMouseLeave={() => {
                            setHoveredCell(null);
                            hideTooltip();
                          }}
                          onFocus={(e) => {
                            showTooltip(
                              e.currentTarget,
                              `${practice.name} • ${quadrant.label}`,
                              `${effect.summary} (Short ${effect.shortTerm}/5 • Long ${effect.longTerm}/5)`
                            );
                          }}
                          onBlur={hideTooltip}
                          className={`relative rounded-xl border transition-all duration-300 ease-out overflow-hidden 
                          focus:outline-none focus:ring-2 focus:ring-emerald-400/60 focus:ring-offset-2 focus:ring-offset-slate-950
                          ${isSelectedCell
                              ? 'border-emerald-400/60 scale-105 z-10'
                              : 'border-slate-700/40 hover:border-emerald-500/30 hover:scale-[1.02]'
                            }`}
                          style={intensityStyles}
                        >
                          {/* Inner radial glow for "living node" effect */}
                          {intensity > 0 && (
                            <div
                              className="absolute inset-0"
                              style={{
                                background: 'radial-gradient(circle at center, rgba(52, 211, 153, 0.2), transparent 70%)',
                                opacity: intensity / MAX_INTENSITY
                              }}
                            />
                          )}

                          {/* Intensity number */}
                          <div className="relative h-full w-full flex items-center justify-center py-4">
                            <span
                              className={`text-sm font-mono font-bold transition-colors duration-200 ${intensity === 0
                                ? 'text-slate-600'
                                : isSelectedCell
                                  ? 'text-emerald-200'
                                  : 'text-emerald-100/90'
                                }`}
                            >
                              {intensity}
                            </span>
                          </div>

                          {/* Subtle pulse animation for high-intensity selected cells */}
                          {isSelectedCell && intensity >= 4 && (
                            <div className="absolute inset-0 rounded-xl animate-pulse bg-emerald-400/10" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tooltip */}
        {tooltip.isVisible && (
          <div
            className="absolute z-30 pointer-events-none"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              transform: 'translate(-50%, -12px)',
            }}
            role="tooltip"
          >
            <div className="max-w-[320px] rounded-xl border border-emerald-500/30 bg-slate-950/95 backdrop-blur-md px-4 py-3 shadow-2xl shadow-emerald-900/20">
              <div className="text-xs font-semibold text-emerald-100">{tooltip.title}</div>
              <div className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">{tooltip.body}</div>
            </div>
          </div>
        )}

        {/* Navigation hint */}
        <div className="mt-4 pt-3 border-t border-slate-800/50 text-[11px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800/60 text-slate-400 font-mono">Tab</kbd>
            <span>to focus</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800/60 text-slate-400 font-mono">↑↓←→</kbd>
            <span>to navigate</span>
          </span>
          <span className="font-mono text-emerald-500/60">
            {selectedPracticeIndex + 1}/{practices.length} • {selectedQuadrantIndex + 1}/{quadrants.length}
          </span>
        </div>
      </div>
    </div>
  );
};
