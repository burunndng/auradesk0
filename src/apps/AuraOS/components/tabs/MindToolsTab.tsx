import React, { useState } from 'react';
import { SectionDivider } from '../shared/SectionDivider.tsx';
import { Practice } from '../../types.ts';
import SpecialistAgentSwitchboard from '../shared/SpecialistAgentSwitchboard.tsx';
import { useToast } from '../shared/ToastContext.tsx';
import { useNavigationContext } from '../../contexts/NavigationContext.tsx';
import { WIZARD_PROGRESSION_MAP } from '../../data/wizardProgressionMap.ts';
import WhatNextCard from '../shared/WhatNextCard.tsx';
import {
  ChronolithIcon,
  VectorGateIcon,
  EngramArchiveIcon,
  FocusApertureIcon,
  DefusionPrismIcon,
  DecisionForkIcon,
  AOSArrowIcon,
  PolarityScaleIcon,
  ConsciousNodeIcon,
  InquiryVortexIcon,
  StackArchitectIcon,
  DharmaLotusIcon,
  PhaseWheelIcon,
  AstralCompassIcon,
  TesseractIcon,
  ParadoxGateIcon
} from '../visualizations/SacredGeometryIcons';

interface MindToolsTabProps {
  setActiveWizard: (wizardName: string | null, linkedInsightId?: string) => void;
  addToStack?: (practice: Practice) => void;
  practiceStack?: any[];
}

const MindToolCard = ({ icon, title, description, onStart }: { icon: React.ReactNode; title: string; description: string; onStart: () => void }) => (
  <div className="group relative bg-neutral-900/60 border border-blue-500/20 rounded-xl p-6 flex flex-col transition-all duration-300 hover:border-blue-400/40 hover:shadow-2xl hover:shadow-blue-950/20">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="relative z-10 flex flex-col h-full">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800 text-blue-400 group-hover:text-blue-300 group-hover:border-blue-500/20 transition-all duration-300">
          {icon}
        </div>
        <h2 className="text-xl sm:text-2xl font-normal tracking-tight text-neutral-100 font-serif leading-tight group-hover:text-white transition-colors">{title}</h2>
      </div>
      <p className="text-neutral-400 mb-6 flex-grow text-sm sm:text-base leading-relaxed font-light group-hover:text-neutral-300 transition-colors">{description}</p>
      <button
        onClick={onStart}
        className="group/btn min-h-[44px] bg-neutral-950 text-neutral-200 hover:text-white px-7 rounded-xl font-mono text-xs uppercase tracking-widest transition-all duration-300 self-start border border-neutral-800 hover:border-blue-500/50 focus-visible:outline-none focus-visible:border-blue-500/70 flex items-center gap-3 relative overflow-hidden"
      >
        <span className="relative z-10">Begin Protocol</span>
        <AOSArrowIcon size={14} className="relative z-10 text-blue-500 group-hover/btn:text-blue-400 transform group-hover/btn:translate-x-1 transition-transform" />
        <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
      </button>
    </div>
  </div>
);

const MindLabPattern = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="mind-grid-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(59, 130, 246, 0.04)" strokeWidth="0.5"/>
      </pattern>
      <radialGradient id="mind-glow" cx="50%" cy="30%" r="70%" fx="50%" fy="30%">
        <stop offset="0%" stopColor="rgba(59, 130, 246, 0.06)" />
        <stop offset="50%" stopColor="rgba(59, 130, 246, 0.02)" />
        <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
      </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#mind-grid-pattern)" />
    <rect width="100%" height="100%" fill="url(#mind-glow)" />
  </svg>
);

export default function MindToolsTab({
  setActiveWizard,
  practiceStack = [],
}: MindToolsTabProps) {
  const { lastClosedWizard, setLastClosedWizard } = useNavigationContext();
  const [showStructuralArchive, setShowStructuralArchive] = useState(false);
  const [showCognitiveArchive, setShowCognitiveArchive] = useState(false);
  const [showCrisisTools, setShowCrisisTools] = useState(false);

  const mindProgression = lastClosedWizard ? WIZARD_PROGRESSION_MAP[lastClosedWizard] : null;
  const showWhatNext = !!(mindProgression && mindProgression.moduleKey === 'mind');

  return (
    <div className="relative min-h-[100dvh] bg-neutral-950 text-neutral-300">
      {/* Background Pattern Layer */}
      <div className="absolute inset-0 overflow-hidden rounded-xl">
        <MindLabPattern />
      </div>

      {/* Ambient Glow Effects */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 space-y-6 sm:space-y-8 p-1 pb-32 lg:pb-8">
        <header className="relative pt-4">
          <div className="absolute -left-2 top-0 w-1 h-full bg-gradient-to-b from-blue-400 via-blue-600 to-blue-900 rounded-full" />
          <div className="font-mono text-[10px] tracking-widest text-blue-500/50 uppercase mb-1 pl-4">Cognitive Laboratory</div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-light font-serif text-blue-300 tracking-tight pl-4">Mind Lab.</h1>
          <p className="text-neutral-300 mt-2 pl-4 max-w-2xl leading-relaxed">Structural diagnostics and cognitive protocols designed to reveal operative meaning-making and accelerate development.</p>
        </header>

        <SectionDivider />

        {/* What's Next card — shown after completing a mind wizard */}
        {showWhatNext && lastClosedWizard && (
          <WhatNextCard
            fromWizardId={lastClosedWizard}
            moduleKey="mind"
            onDismiss={() => setLastClosedWizard(null)}
            onBegin={(wizardId) => { setActiveWizard(wizardId); setLastClosedWizard(null); }}
          />
        )}

        {/* Featured — Start Here */}
        <p className="text-[10px] uppercase tracking-widest text-teal-400/60 mb-2 font-mono">Begin here</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="relative">
            <MindToolCard
              icon={<ChronolithIcon size={28} />}
              title="Kegan Stage Assessment"
              description="Determine your center of gravity across Kegan's stages of adult development (Socialized, Self-Authoring, Self-Transforming). A robust map of how your meaning-making structure operates."
              onStart={() => setActiveWizard('kegan')}
            />
            <span className="absolute top-3 right-3 text-xs font-mono text-blue-500/60 pointer-events-none">~45 min</span>
          </div>
          <div className="relative">
            <MindToolCard
              icon={<VectorGateIcon size={28} />}
              title="Immunity to Change"
              description="Uncover the hidden competing commitments that sabotage your articulated goals. Reveal the unconscious 'immune system' protecting you from the very change you seek."
              onStart={() => setActiveWizard('immunity-to-change')}
            />
            <span className="absolute top-3 right-3 text-xs font-mono text-blue-500/60 pointer-events-none">~30 min</span>
          </div>
          <div className="relative">
            <MindToolCard
              icon={<AstralCompassIcon size={28} />}
              title="Enneagram Compass"
              description="Map your core motivational pattern through a structured, hypothesis-driven process. Leaves you with a provisional portrait and a targeted growth edge — not a label."
              onStart={() => setActiveWizard('enneagram-compass')}
            />
            <span className="absolute top-3 right-3 text-xs font-mono text-blue-500/60 pointer-events-none">~20 min</span>
          </div>
          <div className="relative">
            <MindToolCard
              icon={<StackArchitectIcon size={28} />}
              title="Practice Designer"
              description="Architect a balanced, cross-quadrant evolutionary regimen. The capstone tool — once you know yourself, design the practice that develops you."
              onStart={() => setActiveWizard('integral-practice-designer')}
            />
            <span className="absolute top-3 right-3 text-xs font-mono text-blue-500/60 pointer-events-none">~25 min</span>
          </div>
          <div className="relative">
            <MindToolCard
              icon={<TesseractIcon size={24} />}
              title="Integral Map"
              description="Place phenomena across AQAL's four quadrants — then receive AI challenges and Socratic probing to reveal how everything co-arises."
              onStart={() => setActiveWizard('phenomenon-mapper')}
            />
            <span className="absolute top-3 right-3 text-xs font-mono text-blue-500/60 pointer-events-none">~15 min</span>
          </div>
        </div>

        <SectionDivider />

        {/* Structural Diagnostics */}
        <section className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-neutral-100 font-serif">Structural Diagnostics</h2>
              <p className="text-xs text-neutral-500 mt-1">OS-level tools that excavate identity, schema, and developmental structure.</p>
            </div>
            <button
              onClick={() => setShowStructuralArchive(!showStructuralArchive)}
              className="text-xs font-mono text-blue-500 hover:text-blue-400 transition-colors uppercase tracking-widest flex items-center gap-2"
            >
              {showStructuralArchive ? 'Hide Archive' : 'Open Archive (5)'}
              {showStructuralArchive ? <AOSArrowIcon size={14} className="-rotate-90" /> : <AOSArrowIcon size={14} className="rotate-90" />}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { id: 'so', title: 'Object of Awareness', desc: 'Hold unconscious patterns as objects — shift what runs you from subject to seen.', icon: <ConsciousNodeIcon size={20} />, time: '~30 min' },
              { id: 'examining-core-belief', title: 'Core Belief Inquiry', desc: 'Deep dive into limiting beliefs using CBT. Surface and restructure the assumptions underneath behavior.', icon: <InquiryVortexIcon size={20} />, time: '~25 min' },
              { id: 'moral-reasoning', title: 'Moral Reasoning', desc: 'Reveal the underlying moral reasoning structure driving your ethical choices.', icon: <DharmaLotusIcon size={20} />, time: '~35 min' },
            ].map(tool => (
              <button
                key={tool.id}
                onClick={() => setActiveWizard(tool.id)}
                className="group p-5 bg-neutral-900/40 border border-neutral-800 rounded-xl text-left hover:border-blue-500/30 transition-all duration-300 hover:bg-neutral-900/60 flex flex-col h-full"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-blue-500/70 group-hover:text-blue-400 transition-colors">
                    {tool.icon}
                  </div>
                  <span className="text-[10px] font-mono text-blue-500/50">{tool.time}</span>
                </div>
                <h4 className="font-semibold text-neutral-200 group-hover:text-blue-300 transition-colors mb-2">{tool.title}</h4>
                <p className="text-xs text-neutral-500 leading-relaxed group-hover:text-neutral-400 transition-colors">{tool.desc}</p>
              </button>
            ))}
          </div>

          {showStructuralArchive && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in pt-2">
              {[
                { id: 'role-alignment', title: 'Role Alignment', desc: 'Audit functional roles against deeper values.' },
                { id: 'adaptive-cycle', title: 'Adaptive Cycle', desc: 'Map systemic phases of growth or release.' },
                { id: 'eight-zones', title: '8 Zones of Knowing', desc: 'Integral methodological pluralism application.' },
                { id: '4-quadrant-catalyst', title: '4-Quadrant Catalyst', desc: 'Explore challenges across all four AQAL dimensions.' },
                { id: 'coherence-audit', title: 'Coherence Audit', desc: 'Stress-test espoused values against operative behaviors.' },
              ].map(tool => (
                <button
                  key={tool.id}
                  onClick={() => setActiveWizard(tool.id)}
                  className="group p-4 bg-neutral-900/20 border border-neutral-800/60 rounded-xl text-left hover:border-blue-900/40 transition-all duration-300 hover:bg-neutral-900/40"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-neutral-400 group-hover:text-blue-400/80 transition-colors">{tool.title}</h4>
                    <AOSArrowIcon size={12} className="text-neutral-700 group-hover:text-blue-900 transition-all" />
                  </div>
                  <p className="text-[11px] text-neutral-600 leading-relaxed group-hover:text-neutral-500 transition-colors">{tool.desc}</p>
                </button>
              ))}
            </div>
          )}
        </section>

        <SectionDivider />

        {/* Cognitive Tools */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-neutral-100 font-serif">Cognitive Tools</h2>
              <p className="text-xs text-neutral-500 mt-1">Faster, targeted interventions for perspective, bias, and interpretive flexibility.</p>
            </div>
            <button
              onClick={() => setShowCognitiveArchive(!showCognitiveArchive)}
              className="text-xs font-mono text-blue-500 hover:text-blue-400 transition-colors uppercase tracking-widest flex items-center gap-2"
            >
              {showCognitiveArchive ? 'Hide Archive' : 'Open Archive (6)'}
              {showCognitiveArchive ? <AOSArrowIcon size={14} className="-rotate-90" /> : <AOSArrowIcon size={14} className="rotate-90" />}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { id: 'ps', title: 'Perspective Shifter', desc: 'Adopt 1st, 2nd, and 3rd person conceptual views.', icon: <AOSArrowIcon size={20} />, time: '~20 min' },
              { id: 'pm', title: 'Polarity Mapper', desc: 'Map and manage complex both/and tensions.', icon: <PolarityScaleIcon size={20} />, time: '~25 min' },
              { id: 'biasfinder', title: 'Bias Finder', desc: 'Identify cognitive biases actively distorting your thought.', icon: <InquiryVortexIcon size={20} />, time: '~20 min' },
              { id: 'defusion-lab', title: 'Defusion Lab', desc: "Change your relationship with sticky thoughts. Move from 'I am this thought' to 'I notice this thought'.", icon: <DefusionPrismIcon size={20} />, time: '~15 min' },
            ].map(tool => (
              <button
                key={tool.id}
                onClick={() => setActiveWizard(tool.id)}
                className="group p-5 bg-neutral-900/40 border border-neutral-800 rounded-xl text-left hover:border-blue-500/30 transition-all duration-300 hover:bg-neutral-900/60 flex flex-col h-full"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-blue-500/70 group-hover:text-blue-400 transition-colors">
                    {tool.icon}
                  </div>
                  <span className="text-[10px] font-mono text-blue-500/50">{tool.time}</span>
                </div>
                <h4 className="font-semibold text-neutral-200 group-hover:text-blue-300 transition-colors mb-2">{tool.title}</h4>
                <p className="text-xs text-neutral-500 leading-relaxed group-hover:text-neutral-400 transition-colors">{tool.desc}</p>
              </button>
            ))}
          </div>

          {showCognitiveArchive && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in pt-2">
              {[
                { id: 'decision-wizard', title: 'Decision Wizard', desc: 'Navigate complex life decisions through structured, friction-reducing reflection.' },
                { id: 'cbm-interpretation-lens', title: 'Interpretation Lens (CBM-I)', desc: 'Condition your mind toward growth-oriented interpretations over habitual threat responses.' },
                { id: 'reality-tunnel', title: 'Reality Tunnel', desc: 'Hold epistemic beliefs as models, not truths.' },
                { id: 'bias', title: 'Bias Detective', desc: 'Diagnose bias in specific suboptimal decisions.' },
                { id: 'epistemic-crucible', title: 'Epistemic Crucible', desc: 'Stress-test a factual belief through evidence audit and steelman.' },
                { id: 'cobi4s', title: 'CoBi4s Database', desc: 'Interactive referential guide to biases.', url: 'https://burunndng.github.io/CoBi4s/' },
              ].map(tool => (
                <button
                  key={tool.id}
                  onClick={() => tool.url ? window.open(tool.url, '_blank') : setActiveWizard(tool.id)}
                  className="group p-4 bg-neutral-900/20 border border-neutral-800/60 rounded-xl text-left hover:border-blue-900/40 transition-all duration-300 hover:bg-neutral-900/40"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-neutral-400 group-hover:text-blue-400/80 transition-colors">{tool.title}</h4>
                    <AOSArrowIcon size={12} className="text-neutral-700 group-hover:text-blue-900 transition-all" />
                  </div>
                  <p className="text-[11px] text-neutral-600 leading-relaxed group-hover:text-neutral-500 transition-colors">{tool.desc}</p>
                </button>
              ))}
            </div>
          )}
        </section>

        <SectionDivider />

        {/* Metamodernism */}
        <section className="space-y-4">
          <div className="mb-2">
            <h3 className="text-xs font-mono uppercase tracking-widest text-blue-500/50">Metamodernism</h3>
          </div>
          <div
            className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/40 hover:border-blue-500/30 group cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-blue-950/20 max-w-sm"
            onClick={() => setActiveWizard('structure-of-feeling')}
          >
            <div className="text-blue-500/60 group-hover:text-blue-200 transition-colors mb-4">
              <ParadoxGateIcon size={24} />
            </div>
            <h4 className="text-lg font-serif italic text-neutral-200 group-hover:text-blue-200 transition-colors mb-2">Structure of Feeling</h4>
            <p className="text-xs text-neutral-500 leading-relaxed group-hover:text-neutral-400 transition-colors">Navigate the oscillation between irony and sincere commitment — the defining sensibility of metamodernism.</p>
          </div>
        </section>

        <SectionDivider />

        {/* Life Architecture — standalone */}
        <section className="space-y-4">
          <div
            className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/40 hover:border-blue-500/30 group cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-blue-950/20 max-w-sm"
            onClick={() => setActiveWizard('life-arch')}
          >
            <div className="text-blue-500/60 group-hover:text-blue-200 transition-colors mb-4">
              <PhaseWheelIcon size={24} />
            </div>
            <h4 className="text-lg font-serif italic text-neutral-200 group-hover:text-blue-200 transition-colors mb-2">Life Architecture</h4>
            <p className="text-xs text-neutral-500 leading-relaxed group-hover:text-neutral-400 transition-colors">Audit the environmental containers dictating your state.</p>
          </div>
        </section>

        <SectionDivider />

        {/* Crisis Hub (Minimal) */}
        <section className="pb-16 flex justify-center">
          <button
            onClick={() => setShowCrisisTools(true)}
            className="group px-8 py-3 rounded-full border border-red-900/30 bg-red-950/5 text-neutral-500 hover:text-red-400 hover:border-red-500/40 hover:bg-red-950/10 transition-all duration-300 font-mono text-[10px] uppercase tracking-[0.3em] flex items-center gap-3 shadow-sm hover:shadow-red-950/20"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-red-900 group-hover:bg-red-500 animate-pulse transition-colors" />
            Emergency Operations Hub
          </button>
        </section>

        <section className="space-y-4 py-8">
          <img
            src="https://files.catbox.moe/xxid3e.png"
            alt="Mind Integration Map"
            className="w-full rounded-lg shadow-lg border border-blue-500/20"
          />
        </section>
      </div>

      {showCrisisTools && (
        <SpecialistAgentSwitchboard onClose={() => setShowCrisisTools(false)} />
      )}
    </div>
  );
}
