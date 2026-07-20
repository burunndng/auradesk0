import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  SenseMandalaIcon,
  WorldEngineIcon,
  InfiniteBridgeIcon,
  AscensionFlameIcon,
  TwinPillarsIcon,
  MerkabaIcon,
  VoidEclipseIcon,
  AOSClockIcon,
  AOSBrainIcon,
  AOSConfirmIcon,
  AOSArrowIcon,
  TonglenGatewayIcon,
  CivicCompassIcon,
  HermeticVesselIcon,
  AstralCompassIcon,
  NonDualEyeIcon
} from '../visualizations/SacredGeometryIcons';
import { DailyCardPull } from '../shared/DailyCardPull';
import { useNavigationContext } from '../../contexts/NavigationContext.tsx';
import { WIZARD_PROGRESSION_MAP } from '../../data/wizardProgressionMap.ts';
import WhatNextCard from '../shared/WhatNextCard.tsx';

interface SpiritToolsTabProps {
  setActiveWizard: (wizardName: string | null, linkedInsightId?: string) => void;
  historyBigMind?: any[];
}

// Spring tokens from motion-system.md
const SPRING_STANDARD = { type: "spring" as const, stiffness: 220, damping: 26, mass: 0.9 };
const EASE_QUICK = { duration: 0.18, ease: [0.25, 0.1, 0.25, 1.0] as const };
const NO_MOTION = { duration: 0 };

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: SPRING_STANDARD },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const SpiritToolCard = ({
  icon,
  title,
  description,
  onStart,
  cta,
  reduceMotion,
  time,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onStart: () => void;
  cta: string;
  reduceMotion?: boolean;
  time?: string;
}) => (
  <motion.div
    variants={cardVariants}
    whileHover={reduceMotion ? {} : { scale: 1.015, transition: EASE_QUICK }}
    className="group relative bg-neutral-900/60 border border-amber-400/14 rounded-xl p-6 flex flex-col hover:border-amber-400/28 focus-within:border-amber-400/28"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-amber-400/3 to-amber-300/2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    <div className="relative z-10 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-neutral-950 rounded-lg border border-neutral-800 text-amber-400 group-hover:text-amber-300 group-hover:border-amber-400/14 transition-all duration-300 shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="text-xl sm:text-2xl font-normal tracking-tight text-slate-100 font-serif leading-tight">{title}</h3>
          {time && <p className="text-[10px] font-mono text-amber-400/50 mt-0.5">{time}</p>}
        </div>
      </div>
      <p className="text-sm sm:text-base text-slate-300 mb-5 flex-grow leading-relaxed font-light">{description}</p>
      <button
        type="button"
        onClick={onStart}
        className="bg-neutral-900/90 border border-amber-400/30 text-amber-200 hover:bg-neutral-800/90 hover:border-amber-400/50 hover:text-amber-100 px-4 py-2 rounded-lg font-medium transition-all duration-200 text-xs self-start flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
      >
        <span>{cta}</span>
        <AOSArrowIcon size={12} className="group-hover/btn:translate-x-0.5 transition-transform" />
      </button>
    </div>
  </motion.div>
);

// Enhanced sacred geometry background — concentric rings + 6-point cross-hair axes
// Draws inspiration from ritual-3d.md (sacred geometry threshold, emissive halation via gradients)
const SacredGeometryBackground = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      {/* Radial glow — top-center ritual threshold feel */}
      <radialGradient id="spirit-radial-glow" cx="50%" cy="20%" r="65%" fx="50%" fy="20%">
        <stop offset="0%" stopColor="rgba(251, 191, 36, 0.07)" />
        <stop offset="45%" stopColor="rgba(251, 191, 36, 0.03)" />
        <stop offset="100%" stopColor="rgba(251, 191, 36, 0)" />
      </radialGradient>
      {/* Soft bottom-right luminous glow */}
      <radialGradient id="spirit-ember-glow" cx="85%" cy="80%" r="40%">
        <stop offset="0%" stopColor="rgba(251, 191, 36, 0.05)" />
        <stop offset="100%" stopColor="rgba(251, 191, 36, 0)" />
      </radialGradient>
      {/* Repeating sacred geometry cell: concentric rings + axis lines */}
      <pattern id="spirit-sacred" x="0" y="0" width="320" height="320" patternUnits="userSpaceOnUse">
        {/* Concentric rings — decreasing opacity outward */}
        <circle cx="160" cy="160" r="28"  fill="none" stroke="rgba(251, 191, 36, 0.06)" strokeWidth="0.6" />
        <circle cx="160" cy="160" r="56"  fill="none" stroke="rgba(251, 191, 36, 0.045)" strokeWidth="0.5" />
        <circle cx="160" cy="160" r="84"  fill="none" stroke="rgba(251, 191, 36, 0.035)" strokeWidth="0.5" />
        <circle cx="160" cy="160" r="112" fill="none" stroke="rgba(251, 191, 36, 0.025)" strokeWidth="0.4" />
        <circle cx="160" cy="160" r="140" fill="none" stroke="rgba(251, 191, 36, 0.018)" strokeWidth="0.4" />
        <circle cx="160" cy="160" r="160" fill="none" stroke="rgba(251, 191, 36, 0.012)" strokeWidth="0.3" />
        {/* Cross-hair axis lines — very subtle, grounds the rings in space */}
        <line x1="160" y1="0"   x2="160" y2="320" stroke="rgba(251, 191, 36, 0.035)" strokeWidth="0.4" />
        <line x1="0"   y1="160" x2="320" y2="160" stroke="rgba(251, 191, 36, 0.035)" strokeWidth="0.4" />
        {/* Diagonal vesica lines at 45° — adds sacred geometry character */}
        <line x1="0"   y1="0"   x2="320" y2="320" stroke="rgba(251, 191, 36, 0.02)" strokeWidth="0.3" />
        <line x1="320" y1="0"   x2="0"   y2="320" stroke="rgba(251, 191, 36, 0.02)" strokeWidth="0.3" />
        {/* Center dot — focal point */}
        <circle cx="160" cy="160" r="1.5" fill="rgba(251, 191, 36, 0.10)" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#spirit-sacred)" />
    <rect width="100%" height="100%" fill="url(#spirit-radial-glow)" />
    <rect width="100%" height="100%" fill="url(#spirit-ember-glow)" />
  </svg>
);

export default function SpiritToolsTab({ setActiveWizard, historyBigMind }: SpiritToolsTabProps) {
  const { lastClosedWizard, setLastClosedWizard } = useNavigationContext();
  const reduceMotion = useReducedMotion() ?? false;
  const [practiceExpanded, setPracticeExpanded] = useState(false);
  const hoverScale = reduceMotion ? {} : { scale: 1.008, transition: EASE_QUICK };
  const hoverTransition = reduceMotion ? NO_MOTION : SPRING_STANDARD;

  const spiritProgression = lastClosedWizard ? WIZARD_PROGRESSION_MAP[lastClosedWizard] : null;
  const showWhatNext = !!(spiritProgression && spiritProgression.moduleKey === 'spirit');
  return (
    <div className="relative min-h-[100dvh] bg-neutral-950">
      {/* Background — sacred geometry threshold */}
      <div className="absolute inset-0 overflow-hidden rounded-xl">
        <SacredGeometryBackground />
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 space-y-6 sm:space-y-8 p-1 pb-32 lg:pb-8"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* What's Next card — shown after completing a spirit wizard */}
        {showWhatNext && lastClosedWizard && (
          <WhatNextCard
            fromWizardId={lastClosedWizard}
            moduleKey="spirit"
            onDismiss={() => setLastClosedWizard(null)}
            onBegin={(wizardId) => { setActiveWizard(wizardId); setLastClosedWizard(null); }}
          />
        )}

        {/* Daily Card Pull */}
        <DailyCardPull setActiveWizard={(id) => setActiveWizard(id)} />

        {/* Header */}
        <motion.header
          className="relative pt-4"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={hoverTransition}
        >
          <motion.div
            className="absolute -left-2 top-0 w-1 h-full bg-gradient-to-b from-amber-400/70 via-amber-500/40 to-transparent rounded-full"
            initial={reduceMotion ? false : { scaleY: 0, originY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ ...hoverTransition, delay: reduceMotion ? 0 : 0.1 }}
          />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-light font-serif text-amber-500 tracking-tight pl-4">Spirit Tools.</h1>
          <p className="text-sm sm:text-base text-slate-300 mt-2 pl-4 max-w-2xl leading-relaxed">Contemplative practices for deepening meditation, concentration, and spiritual insight.</p>
        </motion.header>

        {/* ── FEATURED ── */}
        <motion.section variants={cardVariants}>
          <div className="flex items-center gap-6 mb-4">
            <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-amber-400/60">Begin Here</h2>
            <div className="flex-grow h-px bg-neutral-900/60" />
          </div>
          <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-5" variants={staggerContainer}>
            <SpiritToolCard
              icon={<SenseMandalaIcon size={24} />}
              title="Meditation Practice Finder"
              description="Not sure which meditation practice is right for you? Take our comprehensive assessment to discover personalized recommendations from 12 major meditation traditions."
              onStart={() => setActiveWizard('meditation')}
              cta="Find Your Practice"
              reduceMotion={reduceMotion}
              time="~20 min"
            />
            <SpiritToolCard
              icon={<AstralCompassIcon size={24} />}
              title="Inner Compass"
              description="Choose a metaphor for where you are. Hear multiple contemplative perspectives respond. Receive a bridge question and a concrete practice experiment."
              onStart={() => setActiveWizard('inner-compass')}
              cta="Begin Session"
              reduceMotion={reduceMotion}
              time="~15 min"
            />
            <SpiritToolCard
              icon={<AOSBrainIcon size={24} />}
              title="Contemplative Inquiry"
              description="Explore the deepest questions through sustained open inquiry and phenomenological reporting."
              onStart={() => setActiveWizard('contemplative-inquiry')}
              cta="Start Session"
              reduceMotion={reduceMotion}
              time="~30 min"
            />
          </motion.div>
        </motion.section>

        {/* ── THE PRACTICE ── */}
        <motion.section variants={cardVariants}>
          <div className="border-t border-amber-900/40 pt-8 mb-1">
            <h2 className="font-light tracking-widest uppercase text-sm text-amber-400/70">The Practice</h2>
          </div>
          <p className="text-xs text-slate-400 mb-6">Enter the territory through direct and sustained cultivation</p>

          {/* Always-visible: first 3 core practices */}
          <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-5" variants={staggerContainer}>
            <SpiritToolCard
              icon={<AOSClockIcon size={24} />}
              title="States Training"
              description="Access and stabilize altered states of consciousness through structured practice sequences."
              onStart={() => setActiveWizard('states-training')}
              cta="Start Session"
              reduceMotion={reduceMotion}
              time="~25 min"
            />
            <SpiritToolCard
              icon={<InfiniteBridgeIcon size={24} />}
              title="Big Mind Process"
              description="A transformative dialogue with your inner voices. By shifting to the spacious witness perspective, you'll discover how these voices work together and integrate their wisdom."
              onStart={() => setActiveWizard('big-mind')}
              cta="Start Process"
              reduceMotion={reduceMotion}
              time="~45 min"
            />
            <SpiritToolCard
              icon={<TwinPillarsIcon size={24} />}
              title="Tree of Life Coaching"
              description="Engage with archetypal coaching through the 11 Sephirot of the Kabbalistic Tree of Life. Choose the Sephira that resonates with your current question and receive guided coaching rooted in its symbolic wisdom."
              onStart={() => setActiveWizard('tree-of-life')}
              cta="Begin Coaching"
              reduceMotion={reduceMotion}
              time="~40 min"
            />
          </motion.div>

          {/* Expandable: remaining 5 practices */}
          <div
            id="spirit-practice-extended"
            role="region"
            aria-hidden={!practiceExpanded}
            className={`transition-all duration-500 ease-in-out overflow-hidden motion-reduce:transition-none ${practiceExpanded ? 'max-h-[2000px] opacity-100 mt-5' : 'max-h-0 opacity-0'}`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <SpiritToolCard
                icon={<MerkabaIcon size={24} />}
                title="Advaita Master Coach"
                description="Engage directly with the teachings of Advaita Vedanta through an AI transmission. Explore the nature of the Self, the dissolution of the seeker, and recognition of what you already are."
                onStart={() => setActiveWizard('advaita')}
                cta="Begin Inquiry"
                reduceMotion={reduceMotion}
                time="~35 min"
              />
              <SpiritToolCard
                icon={<TonglenGatewayIcon size={24} />}
                title="Tonglen"
                description="Breathe in suffering, breathe out relief. A Tibetan compassion practice that integrates shadow work and expanding circles of care."
                onStart={() => setActiveWizard('tonglen')}
                cta="Begin Practice"
                reduceMotion={reduceMotion}
                time="~20 min"
              />
              <SpiritToolCard
                icon={<AOSConfirmIcon size={24} />}
                title="4-Quadrant Catalyst"
                description="Anchor an abstract insight into the four corners of reality with micro-actions and structural edits."
                onStart={() => setActiveWizard('4-quadrant-catalyst')}
                cta="Open Catalyst"
                reduceMotion={reduceMotion}
                time="~20 min"
              />
              <SpiritToolCard
                icon={<HermeticVesselIcon size={24} />}
                title="The Return of Ritual"
                description="Design sacred space after deconstruction — knowing it's constructed, letting it work anyway."
                onStart={() => setActiveWizard('return-of-ritual')}
                cta="Begin"
                reduceMotion={reduceMotion}
                time="~25 min"
              />
              <SpiritToolCard
                icon={<NonDualEyeIcon size={24} />}
                title="Archetypal Contemplation"
                description="Contemplate Major Arcana imagery through the Three Faces of Spirit — a post-metaphysical meditation practice."
                onStart={() => setActiveWizard('archetypal-contemplation')}
                cta="Begin Practice"
                reduceMotion={reduceMotion}
                time="~30 min"
              />
            </div>
          </div>

          <button
            onClick={() => setPracticeExpanded(v => !v)}
            aria-expanded={practiceExpanded}
            aria-controls="spirit-practice-extended"
            className="mt-5 text-[10px] font-mono uppercase tracking-widest text-amber-400/50 hover:text-amber-300 transition-colors motion-reduce:transition-none"
          >
            {practiceExpanded ? 'Show less' : 'Show 5 more practices'}
          </button>

          <div className="mt-6">
            {/* Big Mind history — spans full width */}
            <AnimatePresence>
              {historyBigMind && historyBigMind.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto', transition: SPRING_STANDARD }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 pt-6 border-t border-amber-400/14 overflow-hidden"
                >
                  <h4 className="text-lg font-semibold text-slate-100 mb-4 font-serif">Recent Sessions</h4>
                  <motion.div className="space-y-3" variants={staggerContainer} initial="hidden" animate="visible">
                    {historyBigMind.slice(-5).reverse().map((session) => (
                      <motion.div
                        key={session.id}
                        variants={cardVariants}
                        className="bg-neutral-900/50 border border-amber-400/14 rounded-lg p-4 flex justify-between items-start hover:border-amber-400/28 transition-colors duration-200"
                      >
                        <div className="flex-grow">
                          <div className="text-sm font-semibold text-slate-200">
                            {new Date(session.date).toLocaleDateString()} at{' '}
                            {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          {session.summary?.primaryVoices && (
                            <div className="text-xs text-slate-300 mt-1">
                              Voices: {session.summary.primaryVoices.join(', ')}
                            </div>
                          )}
                          {session.summary?.witnessPerspective && (
                            <div className="text-xs text-slate-300 mt-2 italic line-clamp-2">
                              {session.summary.witnessPerspective}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveWizard('big-mind')}
                          className="text-amber-200 hover:text-amber-100 text-sm font-medium ml-4 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 rounded"
                        >
                          Review
                        </button>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* ── THE MAP ── */}
        <motion.section variants={cardVariants}>
          <div className="border-t border-amber-900/40 pt-8 mb-1">
            <h2 className="font-light tracking-widest uppercase text-sm text-amber-400/70">The Map</h2>
          </div>
          <p className="text-xs text-slate-400 mb-6">Understand the territory of consciousness before you enter it</p>

          <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-5" variants={staggerContainer}>
            <SpiritToolCard
              icon={<WorldEngineIcon size={24} />}
              title="Interactive Consciousness Graph"
              description="Compare Timothy Leary's 8 Circuits of Consciousness with Ken Wilber's Integral Theory in an interactive, visual exploration. Understand the crucial distinction between states and stages."
              onStart={() => setActiveWizard('consciousness-graph')}
              cta="Explore the Graph"
              reduceMotion={reduceMotion}
              time="~15 min"
            />
            <SpiritToolCard
              icon={<AscensionFlameIcon size={24} />}
              title="Jhana/Samadhi Guide"
              description="An instructional guide to understanding and working with concentration states and jhana practice. Learn about the eight jhanas, the five factors of absorption, and how to stabilize these states."
              onStart={() => setActiveWizard('jhana')}
              cta="Open Jhana Guide"
              reduceMotion={reduceMotion}
              time="~20 min"
            />
            <SpiritToolCard
              icon={<VoidEclipseIcon size={24} />}
              title="The Insight Ouroboros"
              description="Visualize the 16 ñanas as an ouroboros — the ancient symbol of a snake eating its tail. This 3D interactive visualization shows the asymmetric narrative arc of insight meditation."
              onStart={() => setActiveWizard('insight-practice-map')}
              cta="Open Ouroboros"
              reduceMotion={reduceMotion}
              time="~10 min"
            />
          </motion.div>
        </motion.section>

        {/* ── THE EDGE ── */}
        <motion.section variants={cardVariants}>
          <div className="border-t border-amber-900/40 pt-8 mb-1">
            <h2 className="font-light tracking-widest uppercase text-sm text-amber-400/70">The Edge</h2>
          </div>
          <p className="text-xs text-slate-400 mb-6">Approach the limits of self and meaning</p>

          <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-5" variants={staggerContainer}>
            <SpiritToolCard
              icon={<AOSArrowIcon size={24} className="rotate-[-90deg]" />}
              title="Ultimate Concern"
              description="Clarify what you're ultimately committed to and willing to sacrifice for."
              onStart={() => setActiveWizard('ultimate-concern')}
              cta="Begin"
              reduceMotion={reduceMotion}
              time="~35 min"
            />
            <SpiritToolCard
              icon={<AscensionFlameIcon size={24} />}
              title="The Generativity Map"
              description="You've done the inner work. Now find what only you can give."
              onStart={() => setActiveWizard('generativity-map')}
              cta="Begin"
              reduceMotion={reduceMotion}
              time="~30 min"
            />
            <SpiritToolCard
              icon={<CivicCompassIcon size={24} />}
              title="Integral Civic Practice"
              description="Engage with social and political challenges through shadow work, systems analysis, somatic awareness, and concrete commitments."
              onStart={() => setActiveWizard('integral-civic-practice')}
              cta="Begin Practice"
              reduceMotion={reduceMotion}
              time="~25 min"
            />
          </motion.div>
        </motion.section>

      </motion.div>
    </div>
  );
}
