import React, { useState } from 'react';
import { typography } from '../../../../theme';
import { getIconComponent } from '../../../../.claude/lib/iconMap';

interface Figure {
  name: string;
  contribution: string;
  years: string;
}

interface Stream {
  category: string;
  figures: Figure[];
}

interface InfluencesProps {
  data: {
    title: string;
    subtitle: string;
    description: string;
    streams: Stream[];
  };
}

const CATEGORY_COLORS = {
  'Evolutionary Philosophy': 'from-rose-500 to-red-600',
  'Developmental Psychology': 'from-blue-500 to-cyan-600',
  'Cultural Evolution': 'from-amber-500 to-yellow-600',
  'Contemplative Traditions': 'from-purple-500 to-violet-600',
  'Systems Theory': 'from-emerald-500 to-teal-600'
};

export function InfluencesSection({ data }: InfluencesProps) {
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);
  const [hoveredFigure, setHoveredFigure] = useState<string | null>(null);

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-10">
      <div className="space-y-10">
        <div className="text-center">
          <p className={`${typography.label} text-slate-400 mb-3`}>{data.subtitle}</p>
          <h2 className={typography.h2}>{data.title}</h2>
          <div className="mx-auto max-w-4xl">
            <p className={`${typography.body} text-slate-300`}>{data.description}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/60 to-slate-950/60 p-6 md:p-10 shadow-xl">
          <div className="flex items-center gap-3 mb-8 justify-center">
            {(() => {
              const Icon = getIconComponent('SynapseNetwork');
              return Icon ? React.createElement(Icon, { size: 28, className: "text-teal-300" }) : null;
            })()}
            <h3 className={typography.h3}>Lineages of Influence</h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {data.streams.map((stream, idx) => {
              const isSelected = selectedStream?.category === stream.category;
              const colorClass = CATEGORY_COLORS[stream.category as keyof typeof CATEGORY_COLORS] || 'from-gray-500 to-slate-600';
              
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedStream(isSelected ? null : stream)}
                  aria-pressed={isSelected}
                  aria-label={`Explore ${stream.category} lineage`}
                  className={`rounded-2xl border p-5 text-left transition-all duration-300 ${
                    isSelected
                      ? 'border-white/40 bg-white/10 shadow-xl shadow-white/10'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className={`inline-block rounded-xl bg-gradient-to-br ${colorClass} px-4 py-2 mb-3 shadow-lg`}>
                    {(() => {
                      const Icon = getIconComponent('ConsciousNode');
                      return Icon ? React.createElement(Icon, { size: 20, className: "text-white" }) : null;
                    })()}
                  </div>
                  <p className={`${typography.h4} text-white mb-1`}>{stream.category}</p>
                  <p className={`${typography.bodySmall} text-slate-400`}>{stream.figures.length} key {stream.figures.length === 1 ? 'figure' : 'figures'}</p>
                </button>
              );
            })}
          </div>

          {selectedStream && (
            <div className="rounded-2xl border-2 border-white/20 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 md:p-8 transition duration-300">
              <div className="flex items-center gap-3 mb-6">
                {(() => {
                  const Icon = getIconComponent('EngramArchive');
                  return Icon ? React.createElement(Icon, { size: 24, className: "text-teal-300" }) : null;
                })()}
                <h4 className={typography.h3}>{selectedStream.category}</h4>
              </div>
              <div className="grid gap-4">
                {selectedStream.figures.map((figure, idx) => {
                  const isHovered = hoveredFigure === `${selectedStream.category}-${idx}`;
                  return (
                    <div
                      key={idx}
                      onMouseEnter={() => setHoveredFigure(`${selectedStream.category}-${idx}`)}
                      onMouseLeave={() => setHoveredFigure(null)}
                      className={`rounded-xl border p-4 transition-all duration-300 ${
                        isHovered
                          ? 'border-white/30 bg-white/10 shadow-lg'
                          : 'border-white/10 bg-white/5'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-baseline gap-3 mb-2">
                            <p className={typography.h4}>{figure.name}</p>
                            <span className={`${typography.caption} text-slate-400 font-mono`}>{figure.years}</span>
                          </div>
                          <p className={`${typography.body} text-slate-300`}>{figure.contribution}</p>
                        </div>
                        <div
                          className={`flex-shrink-0 w-2 h-2 rounded-full transition-all duration-300 ${
                            isHovered ? 'w-3 h-3 bg-teal-400 shadow-[0_0_15px_rgba(34,211,238,0.8)]' : 'bg-slate-600'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!selectedStream && (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg">
                Select a lineage above to explore its key figures
              </p>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-amber-400/40 bg-amber-400/10 p-6 text-amber-100 flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="rounded-full bg-amber-500/30 p-3">
              {(() => {
                const Icon = getIconComponent('PatternMandala');
                return Icon ? React.createElement(Icon, { size: 24, className: "text-amber-200" }) : null;
              })()}
            </div>
          </div>
          <div>
            <p className="text-lg font-semibold text-white mb-2">The Integral Synthesis</p>
            <p className="leading-relaxed">
              Wilber's genius was not inventing these ideas from scratch, but recognizing the deep patterns across all these lineages—and synthesizing them into a coherent, practical framework. Each stream contributed unique insights: developmental psychology gave us stages, systems theory gave us holarchies, contemplative traditions gave us states, and cultural evolution gave us worldviews. AQAL is the crystallization of centuries of inquiry.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
