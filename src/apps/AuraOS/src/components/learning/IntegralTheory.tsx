import React, { useState } from 'react';
import { ChevronDown, Eye, Mountain, LineChart, Waves, Palette, Loader, Grid, Layers, Scale } from 'lucide-react';
import { getIconComponent } from '../../../.claude/lib/iconMap';
import { typography } from '../../../theme';
import { TabShell } from '../../../components/shared/TabShell';
import { HeroSection } from './integralTheory/HeroSection';
import { LevelsSection } from './integralTheory/LevelsSection';
import { LinesSection } from './integralTheory/LinesSection';
import { StatesSection } from './integralTheory/StatesSection';
import { TypesShadowSection } from './integralTheory/TypesShadowSection';
import { SynthesisSection } from './integralTheory/SynthesisSection';
import { IntegralModelsSection } from './integralTheory/IntegralModelsSection';
import { PracticeLabSection } from './integralTheory/PracticeLabSection';
import { GoldStarSection } from './integralTheory/GoldStarSection';
import { EthicsSection } from './integralTheory/EthicsSection';

/**
 * INTEGRAL THEORY - Visual Design Document
 * 
 * Theme: "Cosmology / Mandala / Prism"
 * 
 * This tab uses a distinctive consciousness-mapping visual identity:
 * 1. Purple/indigo as the dominant color (cosmic, consciousness, depth)
 * 2. Concentric ring SVG patterns evoking mandala/AQAL symmetry
 * 3. Radial gradient backgrounds suggesting expansion from center
 * 4. Prismatic accent highlights on interactive elements
 * 5. Subtle starfield particles for cosmic feel
 * 
 * This distinguishes it from:
 * - PracticeEcology (emerald/teal, ecology/systems focus, dot-grid pattern)
 * - MetamodernBridgeBuilder (violet/amber, liminal bridges, horizontal gradients)
 */

const integralData = {
  hero: {
    title: "You Can't See the Glasses You're Wearing",
    subtitle: "The Integral Operating System",
    body: "You can't fix your relationship problems by doing more push-ups. (Well, you could try.) Integral Theory is the map that shows which territories you've been ignoring—and why that matters.",
    koan: "What's the shape of the box you don't know you're thinking inside?"
  },
  levels: {
    title: "Altitude",
    concept: "Levels of Consciousness",
    description: "The you at 7 couldn't imagine the you at 17. The you right now can't imagine who you'll become next. Consciousness doesn't just expand—it restructures. And crucially: each stage transcends and includes the one before. You keep Red's aliveness, Blue's discipline, Orange's rigor—while adding new capacity. Lose any link in that chain and you get pathology, not growth.",
    stages: [
      {
        color: "bg-red-500",
        label: "Red",
        title: "Power",
        desc: "I want it. I take it. Now.",
        superpower: "Raw aliveness. Zero hesitation.",
        trap: "Burning bridges. Burning out.",
        realLife: "The founder who bulldozes feedback. The toddler having a meltdown. The part of you that just wants to scream.",
        shadow: "You might despise 'weak' people—because you've disowned your own vulnerability."
      },
      {
        color: "bg-teal-600",
        label: "Blue",
        title: "Order",
        desc: "There's a right way. Follow it.",
        superpower: "Discipline. Sacred duty. Clear conscience.",
        trap: "Rigidity. Dogma. 'My way or hell.'",
        realLife: "The military officer. The fundamentalist. The part of you that needs rules to feel safe.",
        shadow: "You might judge 'sinners'—while secretly envying their freedom."
      },
      {
        color: "bg-orange-500",
        label: "Orange",
        title: "Achievement",
        desc: "The game is winnable. I can win it.",
        superpower: "Innovation. Meritocracy. Scientific truth.",
        trap: "Greed. Burnout. Contempt for the 'lazy.'",
        realLife: "The Silicon Valley entrepreneur. The rationalist blogger. The part of you tracking metrics.",
        shadow: "You might dismiss meditation as 'unproductive'—because you're afraid to stop performing."
      },
      {
        color: "bg-green-500",
        label: "Green",
        title: "Belonging",
        desc: "Everyone's voice matters. Include all.",
        superpower: "Empathy. Equality. Healing communities.",
        trap: "Analysis paralysis. Toxic tolerance.",
        realLife: "The activist. The therapist. The part of you that can't say no.",
        shadow: "You might rage at 'the system'—while avoiding your own inner hierarchy."
      },
      {
        color: "bg-yellow-400",
        label: "Yellow",
        title: "Integration",
        desc: "Every stage is partial. Let's dance.",
        superpower: "Systems thinking. Paradox fluency.",
        trap: "Over-complexity. Detached abstraction.",
        realLife: "The metamodern theorist. The integral coach. The part of you reading this and nodding.",
        shadow: "You might feel subtle superiority—forgetting you still have an ego."
      },
      {
        color: "bg-teal-400",
        label: "Turquoise",
        title: "Holistic",
        desc: "Everything arises together. Heal the whole.",
        superpower: "Global care. Planetary consciousness.",
        trap: "Dissociation from the messiness of form.",
        realLife: "The systems mystic. The earth shaman. The part of you that feels everything connected.",
        shadow: "You might bypass practical needs—calling it 'transcendence.'"
      }
    ],
    callout: {
      title: "The Pre/Trans Trap & Health at Every Level",
      text: "A toddler and a sage both reject rules. One hasn't learned them. The other has outgrown them. Don't confuse the two—especially in yourself. And remember: every stage has healthy and pathological expressions. A healthy Red passion beats a pathological Yellow detachment. A healthy Blue community beats a nihilistic Green that's lost all standards. Development isn't a race to the top—it's expanding capacity without abandoning embodiment."
    }
  },
  lines: {
    title: "Your Developmental Fingerprint",
    concept: "Lines of Development",
    description: "The brilliant quantum physicist who can't process their feelings. The emotionally intelligent therapist who avoids complex ideas. You. Growth is jagged. That's the point. One asymmetry matters: the cognitive line is a necessary but not sufficient condition for the others. You can't feel empathy for a perspective you can't yet conceive—but high cognition guarantees nothing about moral or emotional development.",
    axes: [
      { label: "Cognitive", desc: "How complex can you think?", example: "From concrete thinking to paradox fluency" },
      { label: "Emotional", desc: "How do you feel your feelings?", example: "From reactive to responsive to witnessing" },
      { label: "Moral", desc: "Who counts in your circle of care?", example: "From me to my tribe to all beings" },
      { label: "Interpersonal", desc: "How do you relate?", example: "From transactional to empathic to integral" },
      { label: "Spiritual", desc: "What's your ultimate concern?", example: "From mythic belief to direct experience to nondual awareness" },
      { label: "Somatic", desc: "How embodied are you?", example: "From numb to sensing to flow" },
      { label: "Creative", desc: "How do you make meaning?", example: "From copying to innovating to channeling" },
      { label: "Shadow", desc: "What are you avoiding?", example: "From projection to ownership to integration" }
    ],
    caption: "Your jagged shape isn't broken. It's your treasure map. Shadow often lives in the gap between your strongest lines and your weakest—your gift becomes your defense. The intellectual who thinks through every feeling. The empath who senses into situations to avoid rigorous analysis. The valleys aren't failures. They're where your gold is buried."
  },
  states: {
    title: "States vs. Stages",
    concept: "Waking Up & Growing Up",
    description: "You access profound peace in meditation—then flip someone off in traffic. States are temporary visits; stages are stable residences. A child can feel wonder. A beginner can have a mystical opening. But trained access to specific states—sustained witnessing, stable nondual awareness—typically requires practice. And a profound psychedelic experience can fade without lasting transformation: the state was real, but without a stage-structure capable of holding it, the insight can't become capacity. Integration requires building structure, not just accumulating experiences.",
    cards: [
      {
        title: "Gross",
        subtitle: "Waking Reality",
        text: "Matter. Logic. The world of forms. Right here, right now.",
        practice: "Feel the chair. Hear the sounds. No story—just sensation."
      },
      {
        title: "Subtle",
        subtitle: "Dream & Vision",
        text: "Images. Archetypes. The realm of light and creativity.",
        practice: "Close your eyes. What shapes appear? What colors?"
      },
      {
        title: "Causal",
        subtitle: "Formless Depth",
        text: "The void. Pure awareness. The silence beneath all noise.",
        practice: "Rest as the space in which everything appears."
      },
      {
        title: "Witness",
        subtitle: "Ever-Present",
        text: "The 'you' watching all three. Never born. Never dies.",
        practice: "Notice you're noticing. Who's reading this?"
      }
    ]
  },
  typesShadow: {
    title: "The Stuff You Hide From Yourself",
    concept: "Shadow & Types",
    types: {
      agency: "Freedom. Autonomy. Assertion. The Ascender.",
      communion: "Connection. Belonging. Harmony. The Descender.",
      lesson: "You need both. You probably over-identify with one and disown the other. (That's your shadow.)"
    },
    shadow: {
      intro: "You can't outgrow what you won't own. The parts of yourself you've exiled don't disappear—they run the show from backstage. Shadow work is the practice of taking back your projections. Caveat: not every strong reaction is projection. Some people are genuinely harmful, and recognizing that is clarity, not shadow. The diagnostic is disproportionality—is your reaction larger, stickier, or more charged than the situation warrants? That excess is where shadow lives.",
      process: [
        { step: "Face It", desc: "'That person is so arrogant.' Describe the figure in detail—what qualities do they embody, what do they seem to want or protect?" },
        { step: "Talk To It", desc: "'You think you're better than everyone.' Ask questions and genuinely listen: 'What do you want? What are you protecting?' Let answers arise." },
        { step: "Be It", desc: "'I am arrogant sometimes.' Don't just say the words—feel into the energy. Let your body take on its posture. Re-owning happens in the body, not just the grammar." }
      ],
      prompt: "What irritates you most in others right now? (Start with a minor charge—save deep material for supported work.)"
    }
  },
  synthesis: {
    title: "The Living Mandala",
    concept: "Four Quadrants. One You.",
    intro: "The quadrants aren't a theory to believe—they're a practice of attention. Try reducing any one to the others and notice what you lose. Most people camp in one quadrant and wonder why growth feels partial.",
    grid: [
      {
        title: "I",
        subtitle: "Interior-Individual",
        text: "Your consciousness. Your shadows. Your altitude.",
        micro: "Three conscious breaths.",
        examples: "Meditation, therapy, journaling, shadow work, developmental assessment"
      },
      {
        title: "WE",
        subtitle: "Interior-Collective",
        text: "Shared meaning. Culture. Relationships. How we see together.",
        micro: "Ask someone how they're really doing.",
        examples: "Authentic relating, couples work, community ritual, cultural healing"
      },
      {
        title: "IT",
        subtitle: "Exterior-Individual",
        text: "Your body. Your brain. Your behaviors. The material you.",
        micro: "10 squats. Right now.",
        examples: "Exercise, nutrition, sleep hygiene, neurofeedback, somatic practices"
      },
      {
        title: "ITS",
        subtitle: "Exterior-Collective",
        text: "Systems. Structures. Institutions. The world we share.",
        micro: "Notice the room, the chair, the infrastructure holding your body right now. These are systems—not abstractions.",
        examples: "Organizational development, activism, policy work, ecological restoration"
      }
    ],
    cta: "Explore Practices"
  }
};

interface IntegralTheoryProps {
  onNavigateToBrowse?: () => void;
}

interface CollapsiblePanelProps {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const CollapsiblePanel: React.FC<CollapsiblePanelProps> = ({
  id,
  title,
  subtitle,
  icon,
  color,
  isOpen,
  onToggle,
  children
}) => {
  return (
    <div 
      id={id} 
      className={`relative rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
        isOpen 
          ? `${color} border-opacity-40` 
          : 'border-slate-800/60 hover:border-slate-700/60'
      }`}
    >
      {/* Cosmic/mandala-themed panel background */}
      <div className="absolute inset-0 bg-slate-950/90" />
      {isOpen && (
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.08) 40%, transparent 70%)'
          }}
        />
      )}
      
      {/* Panel Header Button */}
      <button
        onClick={onToggle}
        className={`relative w-full px-6 py-5 flex items-center justify-between transition-all duration-300 ${
          isOpen 
            ? 'bg-gradient-to-r from-teal-900/30 via-purple-900/20 to-slate-900/30'
            : 'bg-slate-900/30 hover:bg-slate-800/40'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className={`p-2.5 rounded-xl transition-colors duration-300 ${
            isOpen 
              ? 'bg-teal-500/15 border border-teal-500/30 shadow-lg shadow-indigo-500/10' 
              : 'bg-slate-800/50 border border-slate-700/50'
          }`}>
            {icon}
          </div>
          <div className="text-left">
            <h2 className={typography.h4}>{title}</h2>
            <p className={typography.label + ' mt-0.5'}>{subtitle}</p>
          </div>
        </div>
        <ChevronDown 
          size={24} 
          className={`text-slate-400 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Panel Content */}
      <div className={`transition-all duration-500 ease-in-out ${
        isOpen 
          ? 'max-h-[5000px] opacity-100' 
          : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <div className="relative p-6 sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default function IntegralTheory({ onNavigateToBrowse }: IntegralTheoryProps) {
  const [openPanels, setOpenPanels] = useState<Set<string>>(new Set(['hero']));

  const togglePanel = (id: string) => {
    setOpenPanels(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const sections = [
    {
      id: 'hero',
      title: "The Integral Operating System",
      subtitle: "Start here: What are you not seeing?",
      icon: <Eye size={20} className="text-teal-400" />,
      color: "border-teal-500",
      component: <HeroSection data={integralData.hero} />
    },
    {
      id: 'levels',
      title: "Altitude",
      subtitle: "Levels of consciousness - where you are shapes what you see",
      icon: <Mountain size={20} className="text-amber-400" />,
      color: "border-amber-500",
      component: <LevelsSection data={integralData.levels} />
    },
    {
      id: 'lines',
      title: "Your Developmental Fingerprint",
      subtitle: "Lines of development - growth is beautifully jagged",
      icon: <LineChart size={20} className="text-teal-400" />,
      color: "border-cyan-500",
      component: <LinesSection data={integralData.lines} />
    },
    {
      id: 'states',
      title: "Waking Up & Growing Up",
      subtitle: "States vs. Stages - glimpses vs. permanent shifts",
      icon: <Waves size={20} className="text-violet-400" />,
      color: "border-violet-500",
      component: <StatesSection data={integralData.states} />
    },
    {
      id: 'typesShadow',
      title: "Shadow & Types",
      subtitle: "The stuff you hide from yourself runs the show",
      icon: <Palette size={20} className="text-rose-400" />,
      color: "border-rose-500",
      component: <TypesShadowSection data={integralData.typesShadow} />
    },
    {
      id: 'synthesis',
      title: "The Living Mandala",
      subtitle: "Four quadrants, one you - integral balance",
      icon: <Grid size={20} className="text-emerald-400" />,
      color: "border-emerald-500",
      component: <SynthesisSection data={integralData.synthesis} onBuildRoutine={onNavigateToBrowse} />
    },
    {
      id: 'models',
      title: "Integral Models & Approaches",
      subtitle: "Beyond Wilber: the diverse family of integral frameworks",
      icon: <Loader size={20} className="text-orange-400" />,
      color: "border-orange-500",
      component: <IntegralModelsSection />
    },
    {
      id: 'practiceLab',
      title: "Your Integral Practice Lab",
      subtitle: "Interactive: Design your custom integral practice",
      icon: React.createElement(getIconComponent('NeuralConvergence') || 'div', { size: 20, className: "text-fuchsia-400" }),
      color: "border-fuchsia-500",
      component: <PracticeLabSection />
    },
    {
      id: 'goldStar',
      title: "Integral Practices",
      subtitle: "Cross-training your growth — why multi-module practices work",
      icon: <Layers size={20} className="text-fuchsia-400" />,
      color: "border-fuchsia-500",
      component: <GoldStarSection />
    },
    {
      id: 'ethics',
      title: "Integral Ethics",
      subtitle: "Greatest depth for the greatest span",
      icon: <Scale size={20} className="text-emerald-400" />,
      color: "border-emerald-500",
      component: <EthicsSection />
    }
  ];

  return (
    <TabShell 
      tab="integral-theory"
      subtitle="The map that shows which territories you've been ignoring"
    >
      {/* Concentric ring pattern - mandala/cosmology feel */}
      <svg className="fixed inset-0 w-full h-full -z-10 opacity-[0.08] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="integral-mandala-rings" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
            <circle cx="100" cy="100" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-teal-400" />
            <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-purple-400" />
            <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-teal-400" />
            <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-violet-400" />
            <circle cx="100" cy="100" r="95" fill="none" stroke="currentColor" strokeWidth="0.2" className="text-purple-400" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#integral-mandala-rings)" />
      </svg>
      
      {/* Ambient radial glows - cosmic depth */}
      <div 
        className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full pointer-events-none -z-10"
        style={{
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.04) 30%, transparent 60%)'
        }}
      />
      <div 
        className="fixed bottom-0 right-1/4 w-96 h-96 rounded-full pointer-events-none -z-10"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.06) 0%, transparent 60%)'
        }}
      />
      <div 
        className="fixed top-1/2 left-0 w-64 h-64 rounded-full pointer-events-none -z-10"
        style={{
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, transparent 60%)'
        }}
      />

      <div className="flex gap-8">
        {/* Left sidebar TOC - only visible on larger screens */}
        <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-24 self-start">
          <nav className="space-y-2 bg-slate-900/40 backdrop-blur-sm rounded-xl p-4 border border-teal-500/10">
            <p className="text-xs font-semibold text-teal-400/70 uppercase tracking-wide mb-4">
              Sections
            </p>
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  togglePanel(section.id);
                  document.getElementById(`section-${section.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                  openPanels.has(section.id)
                    ? 'bg-teal-500/15 text-teal-200 border-l-2 border-teal-400 shadow-sm shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  {section.icon}
                  <span className="truncate">{section.title}</span>
                </div>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-4">
          {sections.map((section) => (
            <CollapsiblePanel
              key={section.id}
              id={section.id}
              title={section.title}
              subtitle={section.subtitle}
              icon={section.icon}
              color={section.color}
              isOpen={openPanels.has(section.id)}
              onToggle={() => togglePanel(section.id)}
            >
              {section.component}
            </CollapsiblePanel>
          ))}
        </div>
      </div>
    </TabShell>
  );
}
