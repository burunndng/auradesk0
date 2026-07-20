import React, { useState } from 'react';
import { typography, getButtonClass } from '../../../../theme';
import { getIconComponent } from '../../../../.claude/lib/iconMap';

interface Work {
  year: number;
  title: string;
  significance: string;
}

interface WilberProps {
  data: {
    title: string;
    subtitle: string;
    biography: string;
    approach: string;
    evolution: string;
    works: Work[];
  };
}

const PHASES = [
  { id: 1, label: 'Wilber I', years: '1975-1980', theme: 'Spectrum Psychology', color: 'from-rose-500 to-pink-600' },
  { id: 2, label: 'Wilber II', years: '1980-1987', theme: 'Developmental Stages', color: 'from-orange-500 to-amber-600' },
  { id: 3, label: 'Wilber III', years: '1987-1997', theme: 'Holarchies & Systems', color: 'from-emerald-500 to-teal-600' },
  { id: 4, label: 'Wilber IV', years: '1997-2003', theme: 'AQAL Framework', color: 'from-cyan-500 to-blue-600' },
  { id: 5, label: 'Wilber V', years: '2003-present', theme: 'Post-Metaphysics', color: 'from-purple-500 to-teal-600' }
];

export function WilberSection({ data }: WilberProps) {
  const [selectedPhase, setSelectedPhase] = useState(PHASES[3]);
  const [expandedWork, setExpandedWork] = useState<number | null>(null);

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-10">
      <div className="space-y-10">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400 mb-3">{data.subtitle}</p>
          <h2 className={typography.h2}>{data.title}</h2>
          <div className="mx-auto max-w-4xl mt-4">
            <p className={typography.body}>{data.biography}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              {(() => {
                const Icon = getIconComponent('InquiryVortex');
                return Icon ? React.createElement(Icon, { size: 24, className: "text-yellow-300" }) : null;
              })()}
              <h3 className={typography.h4}>The Integral Approach</h3>
            </div>
            <p className={typography.body}>{data.approach}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              {(() => {
                const Icon = getIconComponent('Chronolith');
                return Icon ? React.createElement(Icon, { size: 24, className: "text-emerald-300" }) : null;
              })()}
              <h3 className={typography.h4}>Evolution of Thought</h3>
            </div>
            <p className={typography.body}>{data.evolution}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/60 to-slate-950/60 p-6 md:p-8 shadow-xl">
          <h3 className={`${typography.h4} mb-6 text-center`}>Wilber's Five Phases</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3 mb-8">
            {PHASES.map(phase => {
              const isSelected = phase.id === selectedPhase.id;
              return (
                <button
                  key={phase.id}
                  type="button"
                  onClick={() => setSelectedPhase(phase)}
                  aria-pressed={isSelected}
                  aria-label={`View ${phase.label}: ${phase.theme}`}
                  className={`relative rounded-xl p-2 md:p-3 lg:p-4 text-center transition-all duration-300 ${
                    isSelected
                      ? 'bg-gradient-to-br shadow-xl shadow-purple-500/30 border-2 border-white/30'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  } ${phase.color}`}
                >
                  <p className="text-xl md:text-2xl font-bold text-white mb-1">{phase.id}</p>
                  <p className="text-[10px] md:text-xs font-semibold text-white/90 mb-1">{phase.years}</p>
                  <p className="text-[9px] md:text-xs text-white/80 leading-tight hidden md:block">{phase.theme}</p>
                  <p className="text-[9px] text-white/80 leading-tight md:hidden line-clamp-2">{phase.theme.split(' ')[0]}</p>
                </button>
              );
            })}
          </div>
          <div className={`rounded-2xl border-2 bg-gradient-to-br p-6 transition-all duration-500 ${selectedPhase.color} border-white/20`}>
            <p className={`${typography.h4} mb-2`}>{selectedPhase.label}: {selectedPhase.theme}</p>
            <p className={`${typography.body} text-white/90`}>
              {selectedPhase.id === 1 && "Early synthesis of Western psychology and Eastern contemplative traditions. Focused on states of consciousness and meditation as therapy."}
              {selectedPhase.id === 2 && "Introduction of developmental stages through the lifespan. Mapped how consciousness evolves from birth through enlightenment."}
              {selectedPhase.id === 3 && "Incorporated systems theory, holarchies, and evolutionary biology. Emphasized nested hierarchies and evolutionary dynamics."}
              {selectedPhase.id === 4 && "Development of the AQAL framework: All Quadrants, All Levels, All Lines, All States, All Types. The comprehensive map."}
              {selectedPhase.id === 5 && "Integral Methodological Pluralism and post-metaphysical approach. Focuses on perspectives rather than claiming absolute reality."}
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/60 to-slate-950/60 p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            {(() => {
              const Icon = getIconComponent('EngramArchive');
              return Icon ? React.createElement(Icon, { size: 28, className: "text-teal-300" }) : null;
            })()}
            <h3 className={typography.h4}>Major Works</h3>
          </div>
          <div className="space-y-3">
            {data.works.map((work, idx) => {
              const isExpanded = expandedWork === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setExpandedWork(isExpanded ? null : idx)}
                  aria-expanded={isExpanded}
                  className={`w-full rounded-2xl border transition-all duration-300 text-left ${
                    isExpanded
                      ? 'border-teal-400/60 bg-teal-500/15 shadow-[0_0_20px_rgba(99,102,241,0.3)]'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <span className="flex-shrink-0 rounded-lg bg-teal-500/30 px-3 py-1 text-sm font-semibold text-white">
                            {work.year}
                          </span>
                          <p className={`${typography.h4} min-w-0`}>{work.title}</p>
                        </div>
                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-white/10 transition-opacity duration-300">
                            <p className="text-sm uppercase tracking-[0.3em] text-slate-400 mb-2">Significance</p>
                            <p className={typography.body}>{work.significance}</p>
                          </div>
                        )}
                      </div>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className={`text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
