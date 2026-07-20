import React, { useState, lazy, Suspense } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ScrollIcon } from '../shared/SacredNavIcons';
import { ActiveTab } from '../../types.ts';
import { MerkabaIcon } from '../shared/MerkabaIcon.tsx';
import { FlowerOfLifeIcon, CompassRoseIcon, OctagramStarIcon } from '../shared/SacredNavIcons';
import LoadingFallback from '../shared/LoadingFallback.tsx';
import ExtendedOnboarding from '../shared/ExtendedOnboarding';

const AQALQuadrantsVisualization = lazy(() => import('../visualizations/AQALQuadrantsVisualization.tsx').then(module => ({ default: module.AQALQuadrantsVisualization })));
const IntegralMapPDF = lazy(() => import('../shared/IntegralMapPDF.tsx'));

interface DashboardTabProps {
  openGuidedPracticeGenerator: () => void;
  setActiveTab: (tab: ActiveTab) => void;
}

const fadeUp = {
  hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
  visible: (i: number) => ({
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.32, 0.72, 0, 1] }
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.32, 0.72, 0, 1] } },
};

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium border border-white/10 bg-white/[0.03] text-white/50 mb-6">
      {children}
    </span>
  );
}

function DoubleBezelCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[1.25rem] p-[1px] bg-white/[0.06] ${className}`}>
      <div
        className="rounded-[calc(1.25rem-1px)] h-full"
        style={{
          background: 'rgba(17,17,19,0.95)',
          boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.04)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

function TrailingIconCircle({ children }: { children: React.ReactNode }) {
  return (
    <span className="ml-2 w-7 h-7 rounded-full bg-white/[0.07] flex items-center justify-center shrink-0 group-hover:bg-white/[0.12] group-hover:translate-x-0.5 transition-all duration-300">
      {children}
    </span>
  );
}

export default function DashboardTab({ openGuidedPracticeGenerator, setActiveTab }: DashboardTabProps) {
  const [show3DVisualization, setShow3DVisualization] = useState(false);
  const [showPDF, setShowPDF] = useState(false);
  const shouldReduce = useReducedMotion();

  return (
    <div className="relative min-h-full overflow-y-auto">
      {/* Background Merkaba */}
      <MerkabaIcon className="fixed inset-0 w-full h-full text-slate-700/30 opacity-[0.03] pointer-events-none animate-dash-spin" />

      {/* ── Hero Section — centered: title → icon → subtitle → CTAs ── */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pt-16 pb-28 lg:pt-24 lg:pb-36 flex flex-col items-center text-center">
        {/* Eyebrow */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={shouldReduce ? {} : fadeUp}
          custom={0}
        >
          <Eyebrow>Integral Life Practice</Eyebrow>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight leading-[1.05] mb-8"
          style={{
            color: 'var(--module-accent, oklch(0.58 0.18 290deg))',
            textShadow: '0 0 40px var(--module-glow)',
          }}
          initial="hidden"
          animate="visible"
          variants={shouldReduce ? {} : fadeUp}
          custom={1}
        >
          Aura Operating System
        </motion.h1>

        {/* Geometric hero icon */}
        <motion.div
          className="relative mb-10"
          initial="hidden"
          animate="visible"
          variants={shouldReduce ? {} : fadeUp}
          custom={2}
        >
          <div className="absolute inset-0 flex items-center justify-center -z-10 animate-icon-breathe">
            <div className="w-48 h-48 rounded-full" style={{ boxShadow: '0 0 80px rgba(220,195,130,0.06), 0 0 160px rgba(220,195,130,0.02)' }} />
          </div>
          <OctagramStarIcon size={160} className="text-accent opacity-80" />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          className="text-lg text-white/50 max-w-lg leading-relaxed font-light mb-10"
          initial="hidden"
          animate="visible"
          variants={shouldReduce ? {} : fadeUp}
          custom={3}
        >
          Your operating system for conscious development. Evidence-based practices, AI-guided coaching, and a complete shadow work toolkit.
        </motion.p>

        {/* CTAs — pill + trailing icon */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4"
          initial="hidden"
          animate="visible"
          variants={shouldReduce ? {} : fadeUp}
          custom={4}
        >
          <button
            onClick={openGuidedPracticeGenerator}
            className="group relative rounded-full font-semibold text-sm py-3.5 px-7 flex items-center justify-center gap-2 active:scale-[0.97] transition-all duration-300 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(45,45,45,0.8), rgba(20,20,25,0.7))',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 0 24px var(--module-glow, rgba(168,85,247,0.2)), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <FlowerOfLifeIcon size={16} />
            <span>Generate Practice</span>
            <TrailingIconCircle>↗</TrailingIconCircle>
          </button>

          <button
            onClick={() => setActiveTab('browse')}
            className="group relative rounded-full font-medium text-sm py-3.5 px-7 flex items-center justify-center gap-2 active:scale-[0.97] transition-all duration-300"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <CompassRoseIcon size={16} />
            <span>Browse All</span>
            <TrailingIconCircle>→</TrailingIconCircle>
          </button>
        </motion.div>

        {/* Module pills */}
        <motion.div
          className="mt-10 flex flex-wrap justify-center gap-2"
          initial="hidden"
          animate="visible"
          variants={shouldReduce ? {} : fadeUp}
          custom={5}
        >
          {[
            { label: 'Body', color: 'oklch(0.72 0.17 160deg)' },
            { label: 'Mind', color: 'oklch(0.62 0.16 240deg)' },
            { label: 'Spirit', color: 'oklch(0.72 0.10 65deg)' },
            { label: 'Shadow', color: 'oklch(0.58 0.18 290deg)' },
          ].map((m) => (
            <span
              key={m.label}
              className="rounded-full px-4 py-1.5 text-xs font-medium tracking-wide"
              style={{
                color: m.color,
                background: `${m.color}10`,
                border: `1px solid ${m.color}25`,
              }}
            >
              {m.label}
            </span>
          ))}
        </motion.div>
      </section>

      {/* ── Quick Actions Bento ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-32">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={shouldReduce ? {} : fadeUp}
          custom={0}
        >
          <Eyebrow>Start Here</Eyebrow>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Large card — guided practice */}
          <motion.div
            className="md:col-span-2 md:row-span-2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={shouldReduce ? {} : fadeUp}
            custom={1}
          >
            <DoubleBezelCard className="h-full">
              <button
                onClick={openGuidedPracticeGenerator}
                className="group w-full h-full text-left p-8 sm:p-10 flex flex-col justify-between min-h-[280px] md:min-h-[380px] cursor-pointer bg-transparent border-0"
              >
                <div>
                  <span className="inline-block rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-white/[0.05] text-white/40 mb-6">
                    AI-Guided
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-medium text-white/90 mb-3 leading-tight">
                    Generate a Custom Practice
                  </h3>
                  <p className="text-white/40 text-sm leading-relaxed max-w-sm">
                    Tell Aura where you are right now. She'll build a practice sequence from 57+ evidence-based tools.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-white/30 group-hover:text-white/60 transition-colors text-sm mt-8">
                  <FlowerOfLifeIcon size={16} />
                  <span>Begin</span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                </div>
              </button>
            </DoubleBezelCard>
          </motion.div>

          {/* Card — Browse */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={shouldReduce ? {} : fadeUp}
            custom={2}
          >
            <DoubleBezelCard>
              <button
                onClick={() => setActiveTab('browse')}
                className="group w-full text-left p-6 cursor-pointer bg-transparent border-0"
              >
                <CompassRoseIcon size={24} className="text-white/20 mb-4" />
                <h4 className="text-base font-medium text-white/80 mb-1">Browse Practices</h4>
                <p className="text-white/35 text-xs leading-relaxed">
                  Explore the full library organized by module.
                </p>
              </button>
            </DoubleBezelCard>
          </motion.div>

          {/* Card — Tools */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={shouldReduce ? {} : fadeUp}
            custom={3}
          >
            <DoubleBezelCard>
              <button
                onClick={() => setActiveTab('tools')}
                className="group w-full text-left p-6 cursor-pointer bg-transparent border-0"
              >
                <OctagramStarIcon size={24} className="text-white/20 mb-4" />
                <h4 className="text-base font-medium text-white/80 mb-1">Shadow & Insight Tools</h4>
                <p className="text-white/35 text-xs leading-relaxed">
                  3-2-1, IFS, schema detective, and more.
                </p>
              </button>
            </DoubleBezelCard>
          </motion.div>
        </div>

        {/* Module quick-nav */}
        <motion.div
          className="mt-8 flex flex-wrap justify-center gap-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={shouldReduce ? {} : fadeUp}
          custom={4}
        >
          {[
            { label: 'Mind Tools', tab: 'mind-tools' as ActiveTab },
            { label: 'Body Tools', tab: 'body-tools' as ActiveTab },
            { label: 'Shadow Tools', tab: 'shadow-tools' as ActiveTab },
            { label: 'Spirit Tools', tab: 'spirit-tools' as ActiveTab },
          ].map((item) => (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className="rounded-full px-5 py-2 text-xs font-medium text-white/40 bg-white/[0.03] border border-white/[0.06] hover:text-white/70 hover:bg-white/[0.06] hover:border-white/[0.1] active:scale-[0.97] transition-all duration-300"
            >
              {item.label}
            </button>
          ))}
        </motion.div>
      </section>

      {/* ── Extended Onboarding ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-32">
        <ExtendedOnboarding />
      </section>

      {/* ── AQAL 3D Visualization ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-32">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={shouldReduce ? {} : fadeUp}
          custom={0}
          className="text-center mb-12"
        >
          <Eyebrow>Interactive Experience</Eyebrow>
          <h2 className="text-3xl sm:text-4xl font-medium text-white/90 mb-3 tracking-tight">The AQAL Quadrants</h2>
          <p className="text-white/40 text-sm">Explore the four quadrants of Integral Theory in 3D</p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={shouldReduce ? {} : scaleIn}
        >
          <DoubleBezelCard>
            {!show3DVisualization ? (
              <div className="flex flex-col items-center justify-center py-24 px-8">
                <button
                  onClick={() => setShow3DVisualization(true)}
                  className="group relative rounded-full font-semibold text-sm py-4 px-8 flex items-center justify-center gap-3 active:scale-[0.97] transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, rgba(45,45,45,0.8), rgba(20,20,25,0.7))',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 0 24px var(--module-glow, rgba(168,85,247,0.15))',
                  }}
                >
                  <OctagramStarIcon size={20} className="group-hover:rotate-12 transition-transform duration-300" />
                  <span>Load 3D Scene</span>
                  <TrailingIconCircle>↗</TrailingIconCircle>
                </button>
                <p className="text-white/25 text-xs mt-4">Click to load interactive visualization</p>
              </div>
            ) : (
              <div className="h-[50vh] sm:h-[60vh] lg:h-[70vh] rounded-[calc(1.25rem-1px)] overflow-hidden">
                <Suspense fallback={<LoadingFallback text="Initializing 3D scene..." />}>
                  <AQALQuadrantsVisualization />
                </Suspense>
              </div>
            )}
          </DoubleBezelCard>
        </motion.div>

        <motion.p
          className="text-center text-white/30 text-xs mt-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={shouldReduce ? {} : fadeUp}
          custom={1}
        >
          Interior-Individual (I) · Exterior-Individual (IT) · Interior-Collective (WE) · Exterior-Collective (ITS)
        </motion.p>
      </section>

      {/* ── Integral Map Resources ── */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-32">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={shouldReduce ? {} : fadeUp}
          custom={0}
        >
          <DoubleBezelCard>
            {!showPDF ? (
              <div className="flex flex-col items-center justify-center py-16 px-8">
                <button
                  onClick={() => setShowPDF(true)}
                  className="group relative rounded-full font-medium text-sm py-3 px-6 flex items-center justify-center gap-2 active:scale-[0.97] transition-all duration-300"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <ScrollIcon size={16} />
                  <span>Load Integral Map</span>
                  <TrailingIconCircle>↗</TrailingIconCircle>
                </button>
                <p className="text-white/25 text-xs mt-3">Comprehensive integral theory diagrams</p>
              </div>
            ) : (
              <div className="p-2">
                <Suspense fallback={<div className="h-96 flex items-center justify-center"><LoadingFallback text="Loading resources..." size="small" /></div>}>
                  <IntegralMapPDF />
                </Suspense>
              </div>
            )}
          </DoubleBezelCard>
        </motion.div>
      </section>
    </div>
  );
}
