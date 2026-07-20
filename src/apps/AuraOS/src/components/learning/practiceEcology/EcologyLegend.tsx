import React from 'react';
import { Info, Clock, TrendingUp } from 'lucide-react';

/**
 * VISUAL DESIGN: Ecology Legend Component
 * 
 * Design principles:
 * 1. Emerald-based intensity scale matching heatmap
 * 2. Organic glow effects on intensity swatches
 * 3. Compact, informative layout
 * 4. Clear time horizon explanation
 */

interface EcologyLegendProps {
  maxIntensity?: number;
}

export const EcologyLegend: React.FC<EcologyLegendProps> = ({ maxIntensity = 5 }) => {
  const levels = Array.from({ length: maxIntensity + 1 }, (_, i) => i);

  return (
    <div className="relative rounded-xl overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
      
      <div className="relative p-4 border border-emerald-500/15 rounded-xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          {/* Legend text */}
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center gap-2 mb-2">
              <Info size={14} className="text-emerald-400/70" />
              <h4 className="text-sm font-semibold text-slate-200">How to read intensity</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-lg">
              Cell brightness shows effect intensity (0–5). This is a teaching tool—use it as a starting point 
              for exploration, not a diagnosis. Your experience may vary.
            </p>
          </div>

          {/* Intensity scale */}
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Low</span>
              <div className="flex items-center gap-1">
                {levels.map((level) => {
                  const opacity = level === 0 ? 0.05 : 0.15 + (level / maxIntensity) * 0.6;
                  const glowIntensity = level === 0 ? 0 : Math.min(level * 3, 12);
                  
                  return (
                    <div
                      key={level}
                      className="w-7 h-7 rounded-lg border border-slate-700/40 relative overflow-hidden flex items-center justify-center"
                      style={{
                        backgroundColor: level === 0 
                          ? 'rgba(30, 41, 59, 0.4)'
                          : `rgba(16, 185, 129, ${opacity})`,
                        boxShadow: level > 0 
                          ? `inset 0 0 ${glowIntensity}px rgba(16, 185, 129, 0.2)` 
                          : 'none'
                      }}
                      aria-label={`Intensity ${level} of ${maxIntensity}`}
                    >
                      <span className={`text-[10px] font-mono font-semibold ${
                        level === 0 ? 'text-slate-600' : 'text-emerald-100/90'
                      }`}>
                        {level}
                      </span>
                    </div>
                  );
                })}
              </div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">High</span>
            </div>
          </div>
        </div>

        {/* Time horizon cards */}
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          <div className="rounded-lg bg-slate-900/50 border border-slate-700/40 p-3 flex gap-3">
            <div className="p-1.5 rounded-lg bg-teal-500/10 h-fit">
              <Clock size={14} className="text-teal-400" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200 mb-1">Short-term</div>
              <div className="text-[11px] text-slate-400 leading-relaxed">
                What you notice within days to weeks: felt sense, mood shifts, behavioral changes.
              </div>
            </div>
          </div>
          
          <div className="rounded-lg bg-slate-900/50 border border-slate-700/40 p-3 flex gap-3">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 h-fit">
              <TrendingUp size={14} className="text-emerald-400" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200 mb-1">Long-term</div>
              <div className="text-[11px] text-slate-400 leading-relaxed">
                What compounds over months: trait development, relationship patterns, systems participation.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
