import React, { useState } from 'react';
import { Sun, Cloud, Moon, Eye } from 'lucide-react';
import { typography } from '../../../../theme';

interface Card {
  title: string;
  subtitle: string;
  text: string;
  practice: string;
}

interface StatesProps {
  data: {
    title: string;
    concept: string;
    description: string;
    cards: Card[];
  };
}

const stateIcons = [Sun, Cloud, Moon, Eye];
const stateColors = {
  Gross: { bg: 'from-amber-500 to-orange-600', glow: 'shadow-amber-500/50' },
  Subtle: { bg: 'from-purple-500 to-pink-500', glow: 'shadow-purple-500/50' },
  Causal: { bg: 'from-slate-700 to-slate-900', glow: 'shadow-slate-500/30' },
  Witness: { bg: 'from-cyan-500 to-blue-600', glow: 'shadow-cyan-500/50' }
};

const stateVisuals = {
  Gross: {
    filter: 'contrast(1.2) saturate(1.3)',
    blur: 'blur(0px)',
    opacity: 1,
    scale: 1
  },
  Subtle: {
    filter: 'contrast(0.9) saturate(1.5) hue-rotate(10deg)',
    blur: 'blur(1px)',
    opacity: 0.95,
    scale: 1.02
  },
  Causal: {
    filter: 'contrast(0.7) saturate(0.3)',
    blur: 'blur(2px)',
    opacity: 0.7,
    scale: 0.98
  },
  Witness: {
    filter: 'contrast(1) saturate(1)',
    blur: 'blur(0px)',
    opacity: 0.85,
    scale: 1
  }
};

export const StatesSection: React.FC<StatesProps> = ({ data }) => {
  const [activeState, setActiveState] = useState<string | null>(null);

  const activeVisual = activeState
    ? stateVisuals[activeState as keyof typeof stateVisuals]
    : stateVisuals.Gross;

  return (
    <section className="relative space-y-12">
      {/* Section header */}
      <div className="text-center space-y-4">
        <h2 className={typography.h2}>{data.title}</h2>
        <p className={`${typography.body} text-slate-300 max-w-3xl mx-auto`}>
          {data.description}
        </p>
      </div>

      {/* Visual transformation overlay */}
      <div
        className="transition-all duration-1000 ease-out"
        style={{
          filter: activeVisual.filter,
          opacity: activeVisual.opacity,
          transform: `scale(${activeVisual.scale})`
        }}
      >
        {/* State cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {data.cards.map((card, idx) => {
            const Icon = stateIcons[idx];
            const isActive = activeState === card.title;
            const colors = stateColors[card.title as keyof typeof stateColors];

            return (
              <div
                key={idx}
                className={`relative group cursor-pointer ${
                  activeState && !isActive ? 'opacity-40' : 'opacity-100'
                }`}
                onClick={() => setActiveState(activeState === card.title ? null : card.title)}
                onMouseEnter={() => !activeState && setActiveState(card.title)}
                onMouseLeave={() => !activeState && setActiveState(null)}
              >
                {/* Card */}
                <div
                  className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-500 ${
                    isActive
                      ? `border-white/50 ${colors.glow} shadow-2xl scale-105`
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Gradient background */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-10 group-hover:opacity-20 transition-opacity duration-500`}
                  />

                  <div className="relative p-6 space-y-4 bg-slate-900/80 backdrop-blur-sm">
                    {/* Icon */}
                    <div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colors.bg} bg-opacity-20 flex items-center justify-center transition-transform duration-500 ${
                        isActive ? 'rotate-12 scale-110' : 'rotate-0 scale-100'
                      }`}
                    >
                      <Icon
                        size={28}
                        className={`text-white transition-all duration-500 ${
                          isActive ? 'drop-shadow-lg' : ''
                        }`}
                      />
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className={typography.h4}>{card.title}</h3>
                      <p className={`${typography.label} text-teal-300`}>
                        {card.subtitle}
                      </p>
                    </div>

                    {/* Description */}
                    <p className={`${typography.body} text-slate-300`}>{card.text}</p>

                    {/* Practice (shown when active) */}
                    <div
                      className={`transition-all duration-500 overflow-hidden ${
                        isActive ? 'max-h-32 opacity-100 pt-4' : 'max-h-0 opacity-0 pt-0'
                      }`}
                    >
                      <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800">
                        <div className={`${typography.label} text-slate-500 mb-1`}>
                          Practice Now
                        </div>
                        <p className={`${typography.bodySmall} text-slate-200 italic`}>
                          {card.practice}
                        </p>
                      </div>
                    </div>

                    {/* Hint */}
                    {!isActive && (
                      <div className="text-[10px] text-slate-600 uppercase tracking-wider pt-2 border-t border-slate-800">
                        Click to enter →
                      </div>
                    )}
                  </div>

                  {/* Active glow effect */}
                  {isActive && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-20 animate-pulse`}
                        style={{ animationDuration: '3s' }}
                      />
                    </div>
                  )}
                </div>

                {/* Connection lines (when active) */}
                {isActive && idx < data.cards.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-teal-500/50 to-transparent z-10" />
                )}
              </div>
            );
          })}
        </div>

        {/* State transition indicator */}
        {activeState && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-slate-900/90 border border-slate-700 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span className={typography.body}>
                Experiencing: <span className="font-semibold text-white">{activeState} State</span>
              </span>
              <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            </div>
          </div>
        )}
      </div>

      {/* State → Trait callout */}
      <div className="max-w-3xl mx-auto">
        <div className="bg-teal-900/20 border-2 border-teal-500/30 rounded-2xl p-8 backdrop-blur-sm">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 text-2xl font-bold text-white">
              <span>State</span>
              <span className="text-teal-400">→</span>
              <span>Trait</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              The goal isn't just to <em>visit</em> these states. It's to{' '}
              <strong className="text-white">stabilize</strong> them—turning temporary glimpses into
              stable traits. Repeated, disciplined exposure to higher states can help catalyze stage
              development. But catalysis requires integration, not just repetition. That's why
              meditation alone isn't enough—and why it matters.
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-400">5 min</div>
                <div className="text-xs text-slate-500 uppercase tracking-wide">Access</div>
              </div>
              <div className="text-slate-600">→</div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-400">Always</div>
                <div className="text-xs text-slate-500 uppercase tracking-wide">Embodied</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
