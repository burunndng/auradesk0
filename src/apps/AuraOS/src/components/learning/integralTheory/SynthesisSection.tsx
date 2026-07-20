import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { typography } from '../../../../theme';
import { getIconComponent } from '../../../../.claude/lib/iconMap';

interface GridItem {
  title: string;
  subtitle: string;
  text: string;
  micro: string;
  examples: string;
}

interface SynthesisProps {
  data: {
    title: string;
    concept: string;
    intro: string;
    grid: GridItem[];
    cta: string;
  };
  onBuildRoutine?: () => void;
}

const quadrantColors = {
  I: { gradient: 'from-purple-500 to-fuchsia-600', glow: 'shadow-purple-500/30', text: 'text-purple-400' },
  WE: { gradient: 'from-pink-500 to-rose-600', glow: 'shadow-pink-500/30', text: 'text-pink-400' },
  IT: { gradient: 'from-blue-500 to-cyan-600', glow: 'shadow-blue-500/30', text: 'text-teal-400' },
  ITS: { gradient: 'from-emerald-500 to-teal-600', glow: 'shadow-emerald-500/30', text: 'text-emerald-400' }
};

export const SynthesisSection: React.FC<SynthesisProps> = ({ data, onBuildRoutine }) => {
  const [expandedQuadrant, setExpandedQuadrant] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);

  const handleRotate = () => {
    setRotation((prev) => prev + 90);
  };

  return (
    <section className="space-y-16 pt-12 border-t border-slate-800">
      {/* Section header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 text-teal-400 uppercase tracking-wider font-semibold">
          {React.createElement(getIconComponent('NeuralConvergence') || 'div', { size: 16 })}
          <span className={typography.label}>{data.concept}</span>
        </div>
        <h2 className={typography.h1}>{data.title}</h2>
        <p className={`${typography.body} text-slate-300 max-w-3xl mx-auto`}>
          {data.intro}
        </p>
      </div>

      {/* Interactive Mandala */}
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          {/* Mandala container */}
          <div
            className="relative w-full aspect-square max-w-2xl mx-auto transition-transform duration-700 ease-out"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {/* Center circle */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <div className="relative">
                {/* Inner circle */}
                <div className="w-32 h-32 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-lg font-black text-white mb-0.5">AQAL</div>
                    <div className="text-[8px] text-slate-500 uppercase tracking-wide">
                      Integral<br/>Practice
                    </div>
                  </div>
                </div>

                {/* Pulsing rings */}
                <div className="absolute inset-0 rounded-full border-2 border-teal-500/20 animate-ping" style={{ animationDuration: '4s' }} />
                <div className="absolute inset-0 rounded-full border border-teal-500/10" style={{ transform: 'scale(1.2)' }} />
              </div>
            </div>

            {/* Quadrants */}
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-2">
              {data.grid.map((item, idx) => {
                const isExpanded = expandedQuadrant === item.title;
                const colors = quadrantColors[item.title as keyof typeof quadrantColors];

                return (
                  <div
                    key={idx}
                    className="relative group cursor-pointer"
                    onClick={() => setExpandedQuadrant(isExpanded ? null : item.title)}
                    style={{ transform: `rotate(-${rotation}deg)` }}
                  >
                    <div
                      className={`relative h-full overflow-hidden rounded-3xl border-2 transition-all duration-500 ${
                        isExpanded
                          ? `border-white/30 ${colors.glow} shadow-2xl scale-105`
                          : 'border-slate-800 group-hover:border-slate-700'
                      }`}
                    >
                      {/* Gradient background */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />

                      <div className="relative h-full p-6 bg-slate-900/80 backdrop-blur-sm flex flex-col">
                        {/* Quadrant label */}
                        <div className="flex-1">
                          <div className={`text-4xl font-black mb-2 bg-gradient-to-br ${colors.gradient} bg-clip-text text-transparent`}>
                            {item.title}
                          </div>
                          <div className={`${typography.label} text-slate-400 mb-3`}>
                            {item.subtitle}
                          </div>
                          <p className={`${typography.bodySmall} text-slate-300`}>
                            {item.text}
                          </p>
                        </div>

                        {/* Micro-practice */}
                        <div className="mt-4 p-3 rounded-lg bg-slate-950/50 border border-slate-800">
                          <div className={`${typography.caption} text-slate-600 uppercase mb-1`}>
                            Right Now
                          </div>
                          <div className={`${typography.label} text-slate-200`}>
                            {item.micro}
                          </div>
                        </div>

                        {/* Expanded content */}
                        <div
                          className={`transition-all duration-500 overflow-hidden ${
                            isExpanded ? 'max-h-32 opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'
                          }`}
                        >
                          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                            <div className={`${typography.caption} text-slate-600 uppercase mb-1`}>
                              Examples
                            </div>
                            <p className={`${typography.captionSmall} text-slate-300`}>
                              {item.examples}
                            </p>
                          </div>
                        </div>

                        {/* Click hint */}
                        {!isExpanded && (
                          <div className="mt-3 text-[9px] text-slate-600 uppercase tracking-wider">
                            Click to expand →
                          </div>
                        )}
                      </div>

                      {/* Active glow */}
                      {isExpanded && (
                        <div className="absolute inset-0 pointer-events-none">
                          <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-10 animate-pulse`} style={{ animationDuration: '3s' }} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Connection lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 400">
              <line x1="200" y1="0" x2="200" y2="400" stroke="#475569" strokeWidth="1" opacity="0.2" />
              <line x1="0" y1="200" x2="400" y2="200" stroke="#475569" strokeWidth="1" opacity="0.2" />
              <line x1="0" y1="0" x2="400" y2="400" stroke="#475569" strokeWidth="0.5" opacity="0.1" />
              <line x1="400" y1="0" x2="0" y2="400" stroke="#475569" strokeWidth="0.5" opacity="0.1" />
            </svg>
          </div>

          {/* Rotate button */}
          <div className="flex justify-center mt-8">
            <button
              onClick={handleRotate}
              className="px-6 py-3 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-medium transition-all flex items-center gap-2 group"
            >
              <svg className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Rotate Mandala
            </button>
          </div>
        </div>
      </div>

      {/* Integration message */}
      <div className="max-w-3xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-900/30 to-purple-900/30 border border-teal-500/20 p-8">
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl -z-10" />

          <div className="relative text-center space-y-6">
            <div className={typography.h3}>
              One Practice, All Quadrants
            </div>
            <p className={`${typography.body} text-slate-300`}>
              When you meditate (I), it changes your brain chemistry (IT), which affects how you show up in relationships (WE), which ripples through the systems you're part of (ITS). Everything touches everything. That's integration.
            </p>

            {/* Visual connections */}
            <div className="flex items-center justify-center gap-2 text-sm text-slate-400 pt-4">
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 font-medium">I</span>
              <span>→</span>
              <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 font-medium">IT</span>
              <span>→</span>
              <span className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 font-medium">WE</span>
              <span>→</span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">ITS</span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="flex justify-center">
        <button
          onClick={onBuildRoutine}
          className="group relative px-10 py-5 rounded-full font-bold text-lg transition-all flex items-center gap-3 overflow-hidden"
        >
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-purple-600 to-pink-600 transition-transform group-hover:scale-110" />

          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-purple-600 blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />

          {/* Content */}
          <span className="relative text-white">{data.cta}</span>
          <ArrowRight className="relative text-white group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </section>
  );
};
