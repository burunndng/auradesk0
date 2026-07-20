import React, { useState } from 'react';
import { Mountain, AlertTriangle } from 'lucide-react';
import { typography } from '../../../../theme';

interface Stage {
  color: string;
  label: string;
  title: string;
  desc: string;
  superpower: string;
  trap: string;
  realLife: string;
  shadow: string;
}

interface LevelsProps {
  data: {
    title: string;
    concept: string;
    description: string;
    stages: Stage[];
    callout: {
      title: string;
      text: string;
    };
  };
}

const stagePatterns = {
  Red: (
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-10">
      <path d="M20,50 L40,30 L60,70 L80,40 L100,60" stroke="currentColor" strokeWidth="3" fill="none" />
      <path d="M0,60 L30,20 L50,80 L70,50" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  ),
  Blue: (
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-10">
      <rect x="10" y="10" width="25" height="25" fill="currentColor" />
      <rect x="40" y="10" width="25" height="25" fill="currentColor" />
      <rect x="70" y="10" width="25" height="25" fill="currentColor" />
      <rect x="10" y="40" width="25" height="25" fill="currentColor" />
      <rect x="40" y="40" width="25" height="25" fill="currentColor" />
      <rect x="70" y="40" width="25" height="25" fill="currentColor" />
      <rect x="10" y="70" width="25" height="25" fill="currentColor" />
      <rect x="40" y="70" width="25" height="25" fill="currentColor" />
      <rect x="70" y="70" width="25" height="25" fill="currentColor" />
    </svg>
  ),
  Orange: (
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-10">
      <path d="M10,90 L30,70 L50,80 L70,50 L90,30" stroke="currentColor" strokeWidth="3" fill="none" markerEnd="url(#arrow)" />
      <path d="M20,80 L40,60 L60,70 L80,40" stroke="currentColor" strokeWidth="2" fill="none" />
      <defs>
        <marker id="arrow" markerWidth="10" markerHeight="10" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L9,3 z" fill="currentColor" />
        </marker>
      </defs>
    </svg>
  ),
  Green: (
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-10">
      <circle cx="20" cy="20" r="15" fill="currentColor" />
      <circle cx="50" cy="30" r="20" fill="currentColor" />
      <circle cx="80" cy="25" r="18" fill="currentColor" />
      <circle cx="35" cy="60" r="22" fill="currentColor" />
      <circle cx="70" cy="70" r="25" fill="currentColor" />
    </svg>
  ),
  Yellow: (
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-10">
      <path d="M50,10 L50,90 M10,50 L90,50" stroke="currentColor" strokeWidth="1" />
      <path d="M20,20 L80,80 M80,20 L20,80" stroke="currentColor" strokeWidth="1" />
      <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="1" fill="none" />
      <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="1" fill="none" />
      <circle cx="50" cy="50" r="10" stroke="currentColor" strokeWidth="1" fill="none" />
    </svg>
  ),
  Turquoise: (
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-10">
      <path d="M0,50 Q25,30 50,50 T100,50" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M0,40 Q25,20 50,40 T100,40" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M0,60 Q25,40 50,60 T100,60" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M0,70 Q25,50 50,70 T100,70" stroke="currentColor" strokeWidth="1" fill="none" />
    </svg>
  )
};

export const LevelsSection: React.FC<LevelsProps> = ({ data }) => {
  const [expandedStage, setExpandedStage] = useState<string | null>(null);

  return (
    <section className="space-y-16 relative">
      {/* Section header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 text-teal-400 text-sm uppercase tracking-wider font-semibold">
          <Mountain size={16} />
          {data.concept}
        </div>
        <h2 className={typography.h2}>{data.title}</h2>
        <p className={typography.body + ' max-w-3xl mx-auto'}>
          {data.description}
        </p>
      </div>

      {/* Vertical timeline */}
      <div className="relative max-w-4xl mx-auto">
        {/* Central axis line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-red-500 via-orange-500 via-green-500 via-yellow-400 to-teal-400 opacity-20" />

        {/* Stages */}
        <div className="space-y-12">
          {data.stages.map((stage, idx) => {
            const isExpanded = expandedStage === stage.label;
            const isLeft = idx % 2 === 0;
            const isTier2 = stage.label === 'Yellow' || stage.label === 'Turquoise';

            return (
              <div
                key={stage.label}
                className={`relative flex ${isLeft ? 'flex-row' : 'flex-row-reverse'} items-center gap-8 group`}
              >
                {/* Content card */}
                <div className={`flex-1 ${isLeft ? 'text-right pr-8' : 'text-left pl-8'}`}>
                  <div
                    className={`relative overflow-hidden rounded-2xl bg-slate-900 border-2 transition-all duration-500 cursor-pointer ${
                      isExpanded
                        ? `${stage.color.replace('bg-', 'border-')} shadow-xl shadow-${stage.color.split('-')[1]}-500/20`
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                    onClick={() => setExpandedStage(isExpanded ? null : stage.label)}
                  >
                    {/* Pattern background */}
                    <div className={`text-${stage.color.split('-')[1]}-500`}>
                      {stagePatterns[stage.label as keyof typeof stagePatterns]}
                    </div>

                    <div className="relative p-6 space-y-4">
                      {/* Header */}
                      <div className={`flex items-start gap-3 ${isLeft ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`flex-1 ${isLeft ? 'text-right' : 'text-left'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${stage.color} bg-opacity-20 text-white`}>
                              {stage.label}
                            </span>
                            {isTier2 && (
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-teal-500/20 text-teal-300 uppercase tracking-wide">
                                Tier 2
                              </span>
                            )}
                          </div>
                          <h3 className={typography.h4 + ' mb-1'}>{stage.title}</h3>
                          <p className={typography.body + ' italic'}>{`"${stage.desc}"`}</p>
                        </div>
                      </div>

                      {/* Quick info */}
                      <div className={`grid grid-cols-2 gap-3 pt-4 border-t border-slate-800 ${isLeft ? 'text-right' : 'text-left'}`}>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Gift</div>
                          <div className="text-sm text-emerald-300 font-medium">{stage.superpower}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Shadow</div>
                          <div className="text-sm text-red-300 font-medium">{stage.trap}</div>
                        </div>
                      </div>

                      {/* Expanded content */}
                      <div
                        className={`transition-all duration-500 overflow-hidden ${
                          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                      >
                        <div className="pt-4 space-y-4 border-t border-slate-800">
                          <div>
                            <div className="text-xs text-slate-500 mb-2 uppercase tracking-wide">Real Life</div>
                            <p className={typography.body}>
                              {stage.realLife}
                            </p>
                          </div>
                          <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800">
                            <div className="text-xs text-amber-400 mb-1 uppercase tracking-wide">Your Shadow</div>
                            <p className={typography.body}>
                              {stage.shadow}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Click hint */}
                      {!isExpanded && (
                        <div className="text-[10px] text-slate-600 uppercase tracking-wider pt-2 border-t border-slate-800">
                          Click to explore →
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Center node */}
                <div className="relative z-10 flex items-center justify-center">
                  <div className={`w-5 h-5 rounded-full ${stage.color} ring-4 ring-slate-950 transition-transform duration-300 ${
                    isExpanded ? 'scale-150' : 'scale-100 group-hover:scale-125'
                  }`} />
                </div>

                {/* Empty space for alternating layout */}
                <div className="flex-1" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Reflection prompt */}
      <div className="max-w-3xl mx-auto">
        <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-8 space-y-4">
          <div className="text-xs uppercase tracking-wider text-slate-500">Apply It</div>
          <h4 className="font-semibold text-slate-200">Scenario: The Activist and the Entrepreneur</h4>
          <p className="text-slate-300 leading-relaxed text-sm">
            An activist (operating primarily from Green) and an entrepreneur (primarily Orange) are
            arguing about climate policy. The activist says the entrepreneur "only cares about profit
            and is destroying the planet." The entrepreneur says the activist is "naive and doesn't
            understand how change actually happens." Both are frustrated. Both feel completely
            misunderstood.
          </p>
          <p className="text-slate-300 leading-relaxed text-sm">
            Using the levels framework: What is each person likely seeing? What is each person likely
            missing? What would it take for either of them to genuinely hear the other—not just
            tolerate them? And which stage's worldview are <em>you</em> most sympathetic to in this
            scenario, and what does that reveal about your own center of gravity?
          </p>
          <p className="text-xs text-slate-500 italic">
            There's no single right answer. The framework is a lens, not a verdict.
          </p>
        </div>
      </div>

      {/* Callout */}
      <div className="max-w-3xl mx-auto">
        <div className="bg-amber-900/20 border-2 border-amber-600/30 rounded-2xl p-8 backdrop-blur-sm">
          <div className="flex items-start gap-4">
            <div className="shrink-0">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <AlertTriangle className="text-amber-400" size={24} />
              </div>
            </div>
            <div className="flex-1">
              <h4 className={typography.h4 + ' text-amber-200 mb-3'}>{data.callout.title}</h4>
              <p className={typography.body}>{data.callout.text}</p>
            </div>
          </div>
        </div>
      </div>
      {/* Cross-reference */}
      <div className="max-w-3xl mx-auto">
        <div className="border-l-2 border-teal-500/30 pl-6 space-y-2">
          <div className="text-xs uppercase tracking-wider text-teal-500/70">Connected to: Lines of Development →</div>
          <p className="text-sm text-slate-400 leading-relaxed">
            You now have a sense of altitude—the overall level of complexity from which a person
            makes meaning. But consciousness doesn't develop as a single block. Your cognitive line
            might be at one level while your emotional or moral lines are somewhere else entirely.
            The next section explores why development is always more uneven—and more
            interesting—than a single altitude number would suggest.
          </p>
        </div>
      </div>
    </section>
  );
};
