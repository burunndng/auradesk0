import React, { useState } from 'react';
import { BookOpen, ChevronDown } from 'lucide-react';
import { typography } from '../../../../theme';

interface Model {
  name: string;
  author: string;
  tagline: string;
  color: string;
  core: string;
  keyFeatures: string[];
  practicalUse: string;
  quote: string;
}

const models: Model[] = [
  {
    name: "Wilber's AQAL Framework",
    author: "Ken Wilber",
    tagline: "The comprehensive map of everything",
    color: "from-amber-500 to-orange-600",
    core: "All Quadrants (I, WE, IT, ITS) × All Levels (developmental stages) × All Lines (intelligences) × All States (consciousness) × All Types (masculine/feminine, enneagram, etc.)",
    keyFeatures: [
      "Four quadrants map interior/exterior × individual/collective",
      "Developmental stages (Spiral Dynamics integration)",
      "Multiple intelligences evolving independently",
      "State/stage distinction (waking up vs. growing up)",
      "Types: consistent patterns across stages"
    ],
    practicalUse: "The 'master map.' Use AQAL when you need to diagnose blind spots, design holistic interventions, or integrate conflicting perspectives.",
    quote: "Everyone is right. Partially."
  },
  {
    name: "Spiral Dynamics",
    author: "Don Beck & Chris Cowan (from Clare Graves)",
    tagline: "The evolution of value systems",
    color: "from-red-500 to-purple-600",
    core: "Human consciousness evolves through predictable value systems (memes) in response to life conditions. Each meme transcends and includes the previous one.",
    keyFeatures: [
      "Beige (survival) → Purple (tribal) → Red (power) → Blue (order) → Orange (achievement) → Green (community) → Yellow (integral) → Turquoise (holistic)",
      "Not about people, but about value systems active within cultures and individuals",
      "Each stage emerges when life conditions demand it",
      "No stage is inherently 'better'—context matters",
      "Both individual and collective evolution"
    ],
    practicalUse: "Essential for cultural change work, leadership development, conflict resolution. Diagnose 'which meme is speaking' in any situation.",
    quote: "The question isn't 'where are you?'—it's 'which worldview is active right now?'"
  },
  {
    name: "Constructive-Developmental Theory",
    author: "Robert Kegan",
    tagline: "How you know shapes what you know",
    color: "from-blue-500 to-cyan-600",
    core: "We don't just learn new content—we transform the structure of how we make meaning. Five orders of consciousness: Impulsive → Imperial → Interpersonal → Institutional → Inter-individual.",
    keyFeatures: [
      "Subject/Object distinction: what you're embedded in vs. what you can see",
      "Each stage is a different 'epistemology'—a way of knowing",
      "The 'immunities to change' reveal hidden commitments",
      "Most adults operate at Socialized (Stage 3) or Self-Authoring (Stage 4)",
      "Self-Transforming mind (Stage 5) holds paradox and multiple systems"
    ],
    practicalUse: "Deep therapy, coaching, leadership development. Kegan's model excels at diagnosing developmental obstacles and designing growth edges.",
    quote: "The fish doesn't know it's in water until it's on land."
  },
  {
    name: "Integral Theory of Everything (ToE)",
    author: "Ken Wilber",
    tagline: "Science, art, and spirituality united",
    color: "from-indigo-500 to-purple-600",
    core: "An attempt to integrate premodern wisdom, modern science, and postmodern sensitivity into a coherent framework. Uses AQAL as the scaffolding to include all valid knowledge.",
    keyFeatures: [
      "Includes indigenous, contemplative, scientific, and postmodern perspectives",
      "The 'big three' of truth: I (beauty/art), WE (goodness/morals), IT (truth/science)",
      "Addresses the pre/trans fallacy and mean green meme",
      "Integrates evolutionary biology, psychology, sociology, and mysticism",
      "Non-reductionist: honors emergence at each level"
    ],
    practicalUse: "Meta-theory building. Use when you need to integrate wildly different fields or resolve seemingly irreconcilable paradigms.",
    quote: "We honor the many truths, but integrate them without reducing any."
  },
  {
    name: "Metamodernism",
    author: "Hanzi Freinacht, et al.",
    tagline: "Oscillation between modern and postmodern",
    color: "from-pink-500 to-rose-600",
    core: "A cultural phase emerging after postmodernism. Embraces both/and thinking: sincerity AND irony, hope AND skepticism, universalism AND relativism. Swings between poles without collapsing into either.",
    keyFeatures: [
      "Not a rejection of modern or postmodern, but a dance between them",
      "Informed naivety: return to grand narratives, but aware of their constructed nature",
      "Pragmatic idealism: build better systems while knowing they're imperfect",
      "Emphasizes play, irony, reconstruction, and affect",
      "Politically: combines social justice with systemic thinking"
    ],
    practicalUse: "Cultural analysis, politics, art. Metamodernism helps navigate the post-truth era while maintaining constructive action.",
    quote: "We're too wise to believe in progress, but too hopeful to stop trying."
  },
  {
    name: "Integral Life Practice (ILP)",
    author: "Ken Wilber, Terry Patten, et al.",
    tagline: "From theory to embodiment",
    color: "from-emerald-500 to-teal-600",
    core: "A practical system for personal transformation that balances Body, Mind, Spirit, and Shadow across all four quadrants. Not just intellectual—experiential.",
    keyFeatures: [
      "Four core modules: Body (strength, flexibility, nutrition), Mind (reading, learning, cognitive training), Spirit (meditation, contemplation), Shadow (therapy, 3-2-1 process)",
      "1-minute modules for daily practice",
      "Gold Star practices: high-leverage interventions",
      "Integral Transformative Practice (ITP) lineage from George Leonard and Michael Murphy",
      "Customizable to your unique developmental profile"
    ],
    practicalUse: "Daily practice design. The most actionable framework—what you're using in this app!",
    quote: "Show up. Do the work. Don't be an asshole."
  },
  {
    name: "Polarity Thinking",
    author: "Barry Johnson",
    tagline: "Problems to solve vs. polarities to manage",
    color: "from-yellow-400 to-amber-500",
    core: "Some tensions can't be 'solved'—they're interdependent pairs that need to be balanced. Stability AND change, individual AND collective, task AND relationship. The goal: maximize upsides of both poles, minimize downsides.",
    keyFeatures: [
      "Distinguishes problems (solvable, one right answer) from polarities (ongoing, both/and)",
      "Classic polarities: freedom/equality, justice/mercy, tradition/innovation",
      "Each pole has upsides and downsides",
      "Over-focus on one pole leads to the downside of that pole",
      "Polarity maps reveal the full system"
    ],
    practicalUse: "Conflict resolution, team dynamics, organizational change. Essential for avoiding 'pendulum swings' in culture wars or leadership styles.",
    quote: "You can't solve a polarity. You can only surf it."
  },
  {
    name: "Adult Development Theory",
    author: "Susanne Cook-Greuter, Jane Loevinger, et al.",
    tagline: "Growing up never stops",
    color: "from-violet-500 to-purple-600",
    core: "Adulthood isn't one thing. We continue developing through increasingly complex meaning-making systems, from Conformist to Autonomous to Unitive. Measured via the SCTi (Sentence Completion Test).",
    keyFeatures: [
      "Nine stages of ego development (Loevinger's model)",
      "Most people stabilize at Conformist or Self-Aware stages",
      "Post-conventional stages: Individualist, Autonomous, Construct-Aware, Unitive",
      "Each stage: more complex perspective-taking, more comfort with ambiguity",
      "Ego transcendence at highest stages (but still functional ego)"
    ],
    practicalUse: "Leadership assessment, therapy, coaching. The SCTi is the gold standard for developmental stage measurement.",
    quote: "The ego isn't the enemy. It's the vehicle—until it becomes the prison."
  },
  {
    name: "Integral Medicine",
    author: "Marilyn Schlitz, Ken Wilber, et al.",
    tagline: "Healing all four quadrants",
    color: "from-green-500 to-emerald-600",
    core: "Health isn't just physical. True healing addresses consciousness (I), lifestyle behaviors (IT), relationships and meaning (WE), and social/environmental factors (ITS).",
    keyFeatures: [
      "Integrates allopathic, naturopathic, and energy medicine",
      "Addresses lifestyle (diet, exercise), psychology (trauma, beliefs), and spirituality (meaning, purpose)",
      "Includes cultural factors (stigma, support systems) and systemic issues (healthcare access, environmental toxins)",
      "Patient as co-creator, not passive recipient",
      "Evidence-based AND wisdom-based"
    ],
    practicalUse: "Healthcare design, personal healing, wellness programs. Goes beyond 'treat the symptom' to 'understand the whole person in context.'",
    quote: "Your body isn't a machine. It's a living system embedded in other living systems."
  },
  {
    name: "Integral Ecology",
    author: "Sean Esbjörn-Hargens & Michael Zimmerman",
    tagline: "Saving the planet requires all perspectives",
    color: "from-lime-500 to-green-600",
    core: "Environmental crises can't be solved from one perspective. We need indigenous wisdom (WE-interior), ecosystem science (ITS-exterior), personal connection to nature (I-interior), and sustainable behaviors (IT-exterior).",
    keyFeatures: [
      "Integrates deep ecology, ecopsychology, conservation biology, and environmental justice",
      "Honors both intrinsic value of nature AND pragmatic solutions",
      "Addresses climate change as a 'wicked problem' requiring multiple levels of response",
      "Includes indigenous perspectives as epistemologically valid",
      "Critiques 'mean green' environmentalism (moralism without systems thinking)"
    ],
    practicalUse: "Environmental activism, policy design, sustainability programs. Prevents single-perspective blindness in ecological work.",
    quote: "Nature doesn't need saving. We need reconnecting."
  }
];

export const IntegralModelsSection: React.FC = () => {
  const [expandedModel, setExpandedModel] = useState<string | null>(null);

  const toggleModel = (name: string) => {
    setExpandedModel(expandedModel === name ? null : name);
  };

  return (
    <div className="space-y-12">
      {/* Section intro */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-900/30 border border-orange-500/30">
          <BookOpen size={16} className="text-orange-400" />
          <span className="text-sm text-orange-300 font-medium">The Integral Family</span>
        </div>
        <h3 className={typography.h3}>
          Integral Isn't One Thing
        </h3>
        <p className={typography.body}>
          "Integral" describes a family of frameworks that share a common impulse: <span className="text-orange-400 font-semibold">include more, exclude less</span>. Here are the major players—each with unique strengths. Ken Wilber is the most comprehensive, but he's not the only game in town.
        </p>
      </div>

      {/* Models grid */}
      <div className="space-y-3">
        {models.map((model, idx) => {
          const isExpanded = expandedModel === model.name;

          return (
            <div
              key={idx}
              className={`rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                isExpanded
                  ? 'border-orange-500/50 shadow-lg shadow-orange-500/10'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Model header */}
              <button
                onClick={() => toggleModel(model.name)}
                className={`w-full px-6 py-4 flex items-center justify-between transition-all ${
                  isExpanded
                    ? `bg-gradient-to-r ${model.color} bg-opacity-20`
                    : 'bg-slate-900/40 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-start gap-4 text-left flex-1">
                  <div className={`mt-1 w-8 h-8 rounded-lg bg-gradient-to-br ${model.color} flex items-center justify-center text-white font-black text-sm`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className={typography.h4 + ' mb-0.5'}>{model.name}</h4>
                    <p className="text-xs text-slate-400 mb-1">{model.author}</p>
                    <p className={typography.body + ' italic'}>{`"${model.tagline}"`}</p>
                  </div>
                </div>
                <ChevronDown
                  size={20}
                  className={`text-slate-400 transition-transform duration-300 flex-shrink-0 ml-4 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Model content */}
              <div
                className={`transition-all duration-500 ease-in-out ${
                  isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                }`}
              >
                <div className="px-6 py-6 bg-slate-950/50 space-y-6">
                  {/* Core concept */}
                  <div>
                    <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">Core Concept</div>
                    <p className={typography.body}>{model.core}</p>
                  </div>

                  {/* Key features */}
                  <div>
                    <div className="text-xs uppercase tracking-wider text-slate-500 mb-3">Key Features</div>
                    <ul className="space-y-2">
                      {model.keyFeatures.map((feature, fidx) => (
                        <li key={fidx} className="flex items-start gap-3">
                          <div className={`mt-1.5 w-1.5 h-1.5 rounded-full bg-gradient-to-br ${model.color} flex-shrink-0`} />
                          <span className={typography.body}>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Practical use */}
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                    <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">When to Use This</div>
                    <p className={typography.body}>{model.practicalUse}</p>
                  </div>

                  {/* Quote */}
                  <div className="relative">
                    <div className="absolute -left-2 top-0 text-4xl text-slate-800 font-serif">"</div>
                    <p className={typography.body + ' italic pl-6 pr-4'}>
                      {model.quote}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Closing reflection */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-900/20 to-amber-900/20 border border-orange-500/20 p-8 mt-12">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/5 rounded-full blur-3xl" />
        <div className="relative text-center space-y-4">
          <h4 className={typography.h4}>Which One Should You Use?</h4>
          <p className={typography.body + ' max-w-2xl mx-auto'}>
            All of them. Seriously. <span className="text-orange-400 font-semibold">Wilber's AQAL</span> is the master map—start there. Use <span className="text-red-400 font-semibold">Spiral Dynamics</span> for cultural diagnosis. Go deep with <span className="text-blue-400 font-semibold">Kegan</span> for personal development work. Design practices with <span className="text-emerald-400 font-semibold">ILP</span>. Navigate tensions with <span className="text-yellow-400 font-semibold">Polarity Thinking</span>. The integral stance is to <span className="text-white font-semibold">include and integrate</span>, not pick sides.
          </p>
          <div className="pt-4 text-sm text-slate-400 italic">
            "The map is not the territory. But a good map helps you not get lost."
          </div>
        </div>
      </div>
    </div>
  );
};
