import React, { useState } from 'react';
import { Layers, AlertCircle } from 'lucide-react';
import { typography } from '../../../../theme';

interface PracticeExample {
  name: string;
  modules: { label: string; color: string; desc: string }[];
  integration: string;
}

const practiceExamples: PracticeExample[] = [
  {
    name: "Tonglen While Exercising",
    modules: [
      { label: "Body", color: "text-red-400", desc: "Sustained physical effort — you're inhabiting the body, not just thinking about it" },
      { label: "Mind", color: "text-teal-400", desc: "Visualization and concentration — breathing in suffering, breathing out relief" },
      { label: "Shadow", color: "text-slate-400", desc: "Deliberately breathing in what you'd normally push away activates the disowned" },
      { label: "Spirit (2nd person)", color: "text-violet-400", desc: "Compassion directed toward specific beings — Spirit as Thou, not just concept" },
    ],
    integration: "The physical exertion makes the compassion practice visceral rather than abstract. The shadow dimension prevents spiritual bypassing. The result: embodied ethics, not performance."
  },
  {
    name: "Conscious Conflict Dialogue",
    modules: [
      { label: "Mind", color: "text-teal-400", desc: "Perspective-taking and cognitive complexity — tracking multiple frames simultaneously" },
      { label: "Shadow", color: "text-slate-400", desc: "Real-time projection tracking: what charge am I adding to this that isn't theirs?" },
      { label: "WE", color: "text-pink-400", desc: "Genuine encounter with another person — interior-collective, not just information exchange" },
      { label: "Body", color: "text-red-400", desc: "Somatic awareness of activation, armoring, and collapse during disagreement" },
    ],
    integration: "Ordinary conflict becomes developmental practice. The somatic tracking prevents intellectualization. The shadow work prevents projection masquerading as insight."
  },
  {
    name: "Contemplative Journaling on Ethics",
    modules: [
      { label: "Mind", color: "text-teal-400", desc: "Moral reasoning — tracing the logic of your positions, their assumptions" },
      { label: "Shadow", color: "text-slate-400", desc: "Noticing where self-interest distorts your 'ethical' positions in real time" },
      { label: "Spirit (1st person)", color: "text-violet-400", desc: "Who is making this choice? Self-inquiry into the chooser, not just the choice" },
    ],
    integration: "The shadow work exposes where ethics becomes rationalization. The self-inquiry prevents moral positions from calcifying into identity. Harder than it sounds."
  }
];

const integrationCriteria = [
  {
    number: "1",
    title: "Deliberate, not incidental",
    desc: "Multiple modules are engaged intentionally—you're not just labeling what was already there. Incense near a treadmill isn't spiritual practice. Running as explicit moving meditation is."
  },
  {
    number: "2",
    title: "Felt, not conceptual",
    desc: "You're not thinking about the body while running—you're inhabiting it. The engagement is experiential. Theory counts as Mind only when it's actively working, not sitting in the background."
  },
  {
    number: "3",
    title: "The integration produces something new",
    desc: "A genuinely integral practice reveals insight or capacity that the individual modules alone wouldn't produce. If you can't name what the combination unlocks, you may be layering rather than integrating."
  }
];

export const GoldStarSection: React.FC = () => {
  const [expandedExample, setExpandedExample] = useState<string | null>(null);

  return (
    <div className="space-y-12">
      {/* Section intro */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 text-fuchsia-400 font-semibold uppercase tracking-wider text-sm">
          <Layers size={16} />
          Practice Design
        </div>
        <h2 className={typography.h2}>Integral Practices</h2>
        <p className={typography.body}>
          The problem isn't that you don't practice enough. It's that you practice in silos—body here, mind there, spirit somewhere else, shadow never. An integral practice engages multiple dimensions simultaneously, not by cramming more in, but by recognizing that they were never separate to begin with.
        </p>
        <p className={typography.body}>
          The quadrants, levels, lines, states, and shadow aren't separate territories—they're analytically distinguished dimensions of a single occasion of experience. A practice that engages multiple dimensions simultaneously works <em>with</em> that inherent integration, not against it.
        </p>
      </div>

      {/* Criteria */}
      <div className="space-y-4">
        <h3 className={typography.h3}>What Makes It Genuinely Integral?</h3>
        <p className={`${typography.body} text-slate-400`}>
          Without criteria, practice inflation sets in—every activity gets labeled "integral" by retroactively naming its aspects. Three conditions distinguish genuine multi-module integration from superficial layering:
        </p>
        <div className="grid gap-4 mt-6">
          {integrationCriteria.map((criterion) => (
            <div key={criterion.number} className="flex gap-4 p-5 rounded-xl bg-slate-900/50 border border-slate-800">
              <div className="text-3xl font-black text-fuchsia-500/40 shrink-0 leading-none">{criterion.number}</div>
              <div>
                <div className="font-semibold text-slate-200 mb-1">{criterion.title}</div>
                <p className={typography.body}>{criterion.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Practice examples */}
      <div className="space-y-4">
        <h3 className={typography.h3}>Examples Worth Doing</h3>
        <div className="space-y-3">
          {practiceExamples.map((example) => {
            const isExpanded = expandedExample === example.name;
            return (
              <div
                key={example.name}
                className={`rounded-2xl border-2 transition-all duration-300 overflow-hidden cursor-pointer ${
                  isExpanded ? 'border-fuchsia-500/40' : 'border-slate-800 hover:border-slate-700'
                }`}
                onClick={() => setExpandedExample(isExpanded ? null : example.name)}
              >
                <div className="p-5 flex items-center justify-between">
                  <h4 className={typography.h4}>{example.name}</h4>
                  <div className="flex gap-1">
                    {example.modules.map((m) => (
                      <span key={m.label} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 ${m.color}`}>
                        {m.label}
                      </span>
                    ))}
                  </div>
                </div>
                <div className={`transition-all duration-500 ${isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                  <div className="px-5 pb-5 space-y-4 border-t border-slate-800 pt-4">
                    <div className="space-y-3">
                      {example.modules.map((m) => (
                        <div key={m.label} className="flex items-start gap-3">
                          <span className={`text-xs font-bold shrink-0 w-32 pt-0.5 ${m.color}`}>{m.label}</span>
                          <p className={typography.body}>{m.desc}</p>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 rounded-lg bg-fuchsia-900/20 border border-fuchsia-500/20">
                      <div className="text-xs uppercase tracking-wider text-fuchsia-400 mb-1">Why the integration matters</div>
                      <p className={typography.body}>{example.integration}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shadow of optimization */}
      <div className="p-6 rounded-2xl bg-amber-900/20 border border-amber-500/30 flex gap-4">
        <AlertCircle className="text-amber-400 shrink-0 mt-0.5" size={20} />
        <div>
          <h4 className={`${typography.h4} text-amber-200 mb-2`}>The Shadow of Optimization</h4>
          <p className={typography.body}>
            Notice if the urge to make everything "more integral" is itself a form of avoidance—a way to stay busy and productive rather than going deep into one dimension. The achiever who turns contemplative practice into a performance metric. Sometimes the most integral practice is the one that's most uncomfortable in its simplicity. One thing, fully inhabited, beats four things cosmetically combined.
          </p>
        </div>
      </div>

      {/* Micro-practice */}
      <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
        <div className="text-xs uppercase tracking-wider text-slate-500 mb-3">Practice Now</div>
        <p className={typography.body}>
          Take one practice you already do. List which modules it actually engages—deliberately, not incidentally. Then ask: what would it take to add one more module in a way that produces something new, not just something additional?
        </p>
      </div>
    </div>
  );
};
