import React, { useState } from 'react';
import { Scale, AlertCircle } from 'lucide-react';
import { typography } from '../../../../theme';

const levelsEthics = [
  {
    label: "Red",
    color: "bg-red-500",
    textColor: "text-red-400",
    framework: "Ethics as self-interest",
    desc: "Might makes right. Rules exist to be broken by the strong."
  },
  {
    label: "Blue",
    color: "bg-teal-600",
    textColor: "text-teal-400",
    framework: "Ethics as group loyalty",
    desc: "Divine command, cultural conformity. Right action = following the code."
  },
  {
    label: "Orange",
    color: "bg-orange-500",
    textColor: "text-orange-400",
    framework: "Ethics as universal principle",
    desc: "Rights, justice, utilitarian calculus. Greatest good for the greatest number."
  },
  {
    label: "Green",
    color: "bg-green-500",
    textColor: "text-green-400",
    framework: "Ethics as inclusion",
    desc: "All voices matter. Harm reduction, equity, care for the marginalized."
  },
  {
    label: "Yellow+",
    color: "bg-yellow-400",
    textColor: "text-yellow-400",
    framework: "Ethics as dynamic balancing",
    desc: "Holds all of the above in context. Depth and span, simultaneously. Not a formula—a sensitivity."
  }
];

const quadrantEthics = [
  {
    label: "I (UL)",
    subtitle: "Intention & Motivation",
    color: "from-purple-500 to-fuchsia-600",
    desc: "Inner ethical development—the quality of attention and motivation behind action. An action can be ethically framed but self-servingly motivated. This quadrant asks: who is doing this, and why, really?"
  },
  {
    label: "IT (UR)",
    subtitle: "Behavior & Outcomes",
    color: "from-blue-500 to-cyan-600",
    desc: "Measurable impact—what actually happens as a result of your action. Good intentions (UL) can produce measurable harm (UR). This quadrant insists on empirical accountability."
  },
  {
    label: "WE (LL)",
    subtitle: "Cultural Context",
    color: "from-pink-500 to-rose-600",
    desc: "Shared moral frameworks and intersubjective accountability. A system can produce good outcomes (LR) while corroding cultural trust and meaning (LL). Ethics is always embedded in a 'we.'"
  },
  {
    label: "ITS (LR)",
    subtitle: "Systemic Structures",
    color: "from-emerald-500 to-teal-600",
    desc: "Institutional design, policy, structural incentives. An action can be well-motivated (UL), behaviorally sound (UR), and culturally accepted (LL)—yet still be systemically harmful at scale."
  }
];

export const EthicsSection: React.FC = () => {
  const [expandedLevel, setExpandedLevel] = useState<string | null>(null);
  const [expandedQuadrant, setExpandedQuadrant] = useState<string | null>(null);

  return (
    <div className="space-y-14">
      {/* Intro */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 text-emerald-400 font-semibold uppercase tracking-wider text-sm">
          <Scale size={16} />
          Integral Ethics
        </div>
        <h2 className={typography.h2}>Greatest Depth, Greatest Span</h2>
        <p className={typography.body}>
          The telos of all this development, practice, and shadow work is to act more wisely in the world. Ethics isn't a module you add to an otherwise complete practice—it's the orientation that gives the whole enterprise its direction.
        </p>
        <p className={typography.body}>
          Wilber's guiding principle: <span className="text-emerald-400 font-semibold">greatest depth for the greatest span</span>. Span-only ethics (maximizing well-being for the most beings) can flatten qualitative differences. Depth-only ethics (cultivating the most advanced consciousness) can ignore suffering at scale. Integral ethics holds both in creative tension—not as a formula, but as a developmental sensitivity that deepens with practice.
        </p>
      </div>

      {/* The dilemma */}
      <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-700 space-y-3">
        <h4 className={`${typography.h4} text-slate-200`}>The Real Dilemma</h4>
        <p className={typography.body}>
          Should you spend an hour in deep meditation—maximizing depth in one being—or an hour volunteering at a food bank, maximizing span across many? There is no correct answer in the abstract. The integral response: at different points in your life, and for different practitioners, different balancings are appropriate. The meditator who never serves is cultivating depth without span. The activist who never goes inward is extending span without depth. Both are partial. The question is which partiality you currently need to correct.
        </p>
      </div>

      {/* Ethics across levels */}
      <div className="space-y-4">
        <h3 className={typography.h3}>Ethics at Every Level</h3>
        <p className={`${typography.body} text-slate-400`}>
          Each level of development generates a different ethical framework. Integral ethics doesn't reject these—it contextualizes them within a larger frame that includes and transcends each.
        </p>
        <div className="space-y-2 mt-4">
          {levelsEthics.map((level) => {
            const isExpanded = expandedLevel === level.label;
            return (
              <div
                key={level.label}
                className={`rounded-xl border-2 transition-all duration-300 cursor-pointer overflow-hidden ${
                  isExpanded ? `border-opacity-50 ${level.color.replace('bg-', 'border-')}` : 'border-slate-800 hover:border-slate-700'
                }`}
                onClick={() => setExpandedLevel(isExpanded ? null : level.label)}
              >
                <div className="p-4 flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full shrink-0 ${level.color}`} />
                  <span className={`text-xs font-bold uppercase tracking-wider w-16 shrink-0 ${level.textColor}`}>{level.label}</span>
                  <span className="font-semibold text-slate-200">{level.framework}</span>
                </div>
                <div className={`transition-all duration-300 ${isExpanded ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                  <p className={`${typography.body} px-4 pb-4 text-slate-400 pl-[4.5rem]`}>{level.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ethics across quadrants */}
      <div className="space-y-4">
        <h3 className={typography.h3}>Ethics Across All Four Quadrants</h3>
        <p className={`${typography.body} text-slate-400`}>
          An action can be ethically motivated (UL) but systemically harmful (LR). A system can produce measurable good outcomes (LR) while corroding the shared meaning that makes communities cohere (LL). Integral ethics insists on all four simultaneously.
        </p>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          {quadrantEthics.map((q) => {
            const isExpanded = expandedQuadrant === q.label;
            return (
              <div
                key={q.label}
                className={`rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden ${
                  isExpanded ? 'border-white/20' : 'border-slate-800 hover:border-slate-700'
                }`}
                onClick={() => setExpandedQuadrant(isExpanded ? null : q.label)}
              >
                <div className="p-5 bg-slate-900/50">
                  <div className={`text-2xl font-black mb-1 bg-gradient-to-br ${q.color} bg-clip-text text-transparent`}>
                    {q.label}
                  </div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider">{q.subtitle}</div>
                </div>
                <div className={`transition-all duration-300 ${isExpanded ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                  <p className={`${typography.body} p-5 pt-0 text-slate-300`}>{q.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dangers of misapplication */}
      <div className="p-6 rounded-2xl bg-red-900/20 border border-red-500/30 flex gap-4">
        <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={20} />
        <div className="space-y-3">
          <h4 className={`${typography.h4} text-red-200`}>Misapplication: How This Goes Wrong</h4>
          <p className={typography.body}>
            Applied unconsciously, depth-span thinking can become spiritual elitism. "I don't need to care about ordinary people's suffering because I'm cultivating depth that will eventually benefit all beings" is a depth-only distortion with a long lineage in spiritual communities. "Some beings matter more because they're at higher stages of development" is an elitist distortion the framework actively enables if unchecked.
          </p>
          <p className={typography.body}>
            The corrective is embodied compassion: if your integral ethics doesn't increase your felt care for suffering beings—not eventually, now—something has gone wrong. Depth without span is dissociation wearing the clothes of wisdom.
          </p>
        </div>
      </div>

      {/* Micro-practice */}
      <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
        <div className="text-xs uppercase tracking-wider text-slate-500 mb-3">Practice Now</div>
        <p className={typography.body}>
          Think of an ethical decision you're currently facing—large or small. Run it through all four quadrants: What is my actual motivation (UL)? What are the measurable effects (UR)? What cultural context am I embedded in, and what does that mean for trust (LL)? What systemic structures does my action reinforce or challenge (LR)? Notice which quadrant you naturally skip.
        </p>
      </div>

      {/* Module close */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-900/30 to-purple-900/30 border border-teal-500/20 p-10 text-center">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-600/5 rounded-full blur-3xl" />
        <div className="relative space-y-4 max-w-2xl mx-auto">
          <h3 className={typography.h3}>The Map Is Complete. Now Navigate.</h3>
          <p className={typography.body + ' text-slate-300'}>
            You now have a map with four quadrants, multiple levels, independent lines, temporary states, stable stages, three faces of spirit, shadow dynamics, an integration principle, and an ethical framework. The map is not the territory—but without it, you're navigating in the dark.
          </p>
          <p className="text-slate-400 italic text-sm">
            The practices are the territory. Begin.
          </p>
        </div>
      </div>
    </div>
  );
};
