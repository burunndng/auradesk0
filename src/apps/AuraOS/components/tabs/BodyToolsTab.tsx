import React, { useState } from 'react';
import { SectionDivider } from '../shared/SectionDivider.tsx';
import { IntegralBodyPlan, PlanHistoryEntry, WorkoutProgram } from '../../types.ts';
import { formatIntegralBodyPlanAsText, formatWorkoutProgramAsText, downloadAsFile } from '../../services/planExportUtils.ts';
import {
  VesselFrameIcon,
  PulseMatrixIcon,
  SenseMandalaIcon,
  AetherBreathIcon,
  RosaCrucisIcon,
  SomaticPillarIcon,
  AOSClockIcon,
  EngramArchiveIcon,
  VectorGateIcon,
  ChronolithIcon,
  ResonanceFieldIcon,
  AOSArrowIcon,
} from '../visualizations/SacredGeometryIcons';
import { useNavigationContext } from '../../contexts/NavigationContext.tsx';
import { WIZARD_PROGRESSION_MAP } from '../../data/wizardProgressionMap.ts';
import WhatNextCard from '../shared/WhatNextCard.tsx';
import IntensityBadge, { IntensityLevel } from '../shared/IntensityBadge.tsx';

interface BodyToolsTabProps {
  setActiveWizard: (wizardName: string | null, linkedInsightId?: string) => void;
  integralBodyPlans?: IntegralBodyPlan[];
  workoutPrograms?: WorkoutProgram[];
  planHistory?: PlanHistoryEntry[];
  onLogPlanFeedback?: (
    planId: string,
    dayDate: string,
    dayName: string,
    feedback: {
      completedWorkout: boolean;
      completedYinPractices: string[];
      intensityFelt: number;
      energyLevel: number;
      blockers?: string;
      notes?: string;
    }
  ) => void;
  getPlanProgress?: (planId: string) => PlanHistoryEntry | null;
  onUpdatePlanStatus?: (planId: string, status: 'active' | 'completed' | 'abandoned') => void;
}

const BodyToolCard = ({ icon, title, description, onStart, time, intensity }: { icon: React.ReactNode; title: string; description: string; onStart: () => void; time?: string; intensity?: IntensityLevel }) => (
  <div className="group relative bg-neutral-900/60 border border-neutral-800 rounded-2xl p-7 sm:p-8 flex flex-col transition-all duration-[280ms] [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] hover:border-emerald-500/30 hover:bg-neutral-900/80 hover:shadow-[0_8px_32px_rgba(0,0,0,0.7),0_0_20px_rgba(16,185,129,0.05)] hover:-translate-y-1 overflow-hidden">
    {/* Emerald edge glow */}
    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
    <div className="relative z-10 flex flex-col h-full">
      <div className="flex flex-col gap-5 mb-5 sm:flex-row sm:items-center">
        <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-emerald-400 group-hover:text-emerald-300 group-hover:border-emerald-500/20 transition-all duration-[280ms] w-fit shadow-inner">
          {icon}
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-normal tracking-tight text-neutral-100 font-serif group-hover:text-white transition-colors">{title}</h2>
          {time && intensity && <div className="mt-1.5"><IntensityBadge time={time} intensity={intensity} accentColor="oklch(0.72 0.17 160deg)" /></div>}
        </div>
      </div>
      <p className="text-neutral-400 mb-8 flex-grow leading-relaxed font-light group-hover:text-neutral-300 transition-colors text-lg">{description}</p>
      <button
        onClick={onStart}
        className="group/btn min-h-[44px] bg-neutral-950 text-neutral-200 hover:text-white px-7 rounded-xl font-mono text-xs uppercase tracking-widest transition-all duration-[280ms] self-start border border-neutral-800 hover:border-emerald-500/50 focus-visible:outline-none focus-visible:border-emerald-500/70 focus-visible:shadow-[0_0_0_2px_rgba(16,185,129,0.3)] flex items-center gap-3 relative overflow-hidden"
      >
        <span className="relative z-10">Begin Practice</span>
        <AOSArrowIcon size={14} className="relative z-10 text-emerald-500 group-hover/btn:text-emerald-400 transform group-hover/btn:translate-x-1 transition-transform" />
        <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
      </button>
    </div>
  </div>
);

const OrganicWavePattern = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="body-wave-pattern" x="0" y="0" width="200" height="100" patternUnits="userSpaceOnUse">
        <path
          d="M0 50 Q25 30, 50 50 T100 50 T150 50 T200 50"
          fill="none"
          stroke="rgba(16, 185, 129, 0.08)"
          strokeWidth="1"
        />
        <path
          d="M0 60 Q25 40, 50 60 T100 60 T150 60 T200 60"
          fill="none"
          stroke="rgba(20, 184, 166, 0.06)"
          strokeWidth="0.8"
        />
        <path
          d="M0 40 Q25 20, 50 40 T100 40 T150 40 T200 40"
          fill="none"
          stroke="rgba(16, 185, 129, 0.05)"
          strokeWidth="0.6"
        />
      </pattern>
      <linearGradient id="body-glow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="rgba(16, 185, 129, 0.06)" />
        <stop offset="50%" stopColor="rgba(20, 184, 166, 0.04)" />
        <stop offset="100%" stopColor="rgba(16, 185, 129, 0)" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#body-wave-pattern)" />
    <rect width="100%" height="100%" fill="url(#body-glow)" />
  </svg>
);

export default function BodyToolsTab({
  setActiveWizard,
  integralBodyPlans = [],
  workoutPrograms = []
}: BodyToolsTabProps) {
  const { lastClosedWizard, setLastClosedWizard } = useNavigationContext();
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);
  const [extendedOpen, setExtendedOpen] = useState(false);

  const bodyProgression = lastClosedWizard ? WIZARD_PROGRESSION_MAP[lastClosedWizard] : null;
  const showWhatNext = !!(bodyProgression && bodyProgression.moduleKey === 'body');

  return (
    <div className="relative min-h-[100dvh] bg-neutral-950 text-neutral-300">
      {/* Background Pattern Layer */}
      <div className="absolute inset-0 overflow-hidden rounded-xl">
        <OrganicWavePattern />
      </div>

      {/* Ambient Glow Effects */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/[5%] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-teal-500/[5%] rounded-full blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 space-y-12 sm:space-y-16 max-w-6xl mx-auto px-4 sm:px-8 md:px-12 py-16 pb-32">
        <header className="relative max-w-3xl">
          <div className="font-mono text-xs tracking-[0.2em] text-emerald-400/80 uppercase mb-6 flex items-center gap-4">
            <span className="opacity-60">03</span>
            <span className="w-8 h-px bg-emerald-500/30"></span>
            <span>Somatic Systems</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-light font-serif text-neutral-50 tracking-tight mb-6 leading-tight" style={{ textShadow: '0 0 8px rgba(16,185,129,0.15)' }}>
            Body Tools<span className="text-emerald-500 font-normal">.</span>
          </h1>
          <p className="text-neutral-400 text-lg font-light leading-relaxed border-l border-neutral-800 pl-6">
            Wizards and guided experiences for physical and energetic cultivation.
          </p>
        </header>

        {/* What's Next card — shown after completing a body wizard */}
        {showWhatNext && lastClosedWizard && (
          <WhatNextCard
            fromWizardId={lastClosedWizard}
            moduleKey="body"
            onDismiss={() => setLastClosedWizard(null)}
            onBegin={(wizardId) => { setActiveWizard(wizardId); setLastClosedWizard(null); }}
          />
        )}

        {/* ═══════════════════════════════════════════════════════
            BEGIN HERE
        ═══════════════════════════════════════════════════════ */}
        <section>
          <div className="flex items-center gap-6 mb-6">
            <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-emerald-400/70">Begin Here</h2>
            <div className="flex-grow h-px bg-emerald-900/20" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { slot: 'Entry',     time: '~25 min', title: 'Integral Body Architect', wizardId: 'integral-body-architect', icon: <VesselFrameIcon size={24} /> },
              { slot: 'Practice', time: '~20 min', title: 'Polyvagal Trainer',   wizardId: 'polyvagal-trainer', icon: <ResonanceFieldIcon size={24} /> },
              { slot: 'Deep Work',time: '~45 min', title: 'Bioenergetics',       wizardId: 'bioenergetics',    icon: <AetherBreathIcon size={24} /> },
            ].map(item => (
              <button
                key={item.wizardId}
                onClick={() => setActiveWizard(item.wizardId)}
                className="group min-h-[80px] bg-neutral-950/80 border border-emerald-500/20 rounded-xl p-4 text-left hover:border-emerald-500/40 hover:bg-neutral-900/60 transition-all duration-300 flex flex-col gap-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="text-emerald-400/80 group-hover:text-emerald-400 transition-colors">
                    {item.icon}
                  </div>
                  <span className="text-xs font-mono uppercase tracking-[0.15em] text-emerald-400/60">
                    {item.slot} · {item.time}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base font-serif text-neutral-100">{item.title}</span>
                  <AOSArrowIcon size={14} className="text-emerald-500/50 group-hover:text-emerald-400 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-6 mb-10">
            <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-neutral-500">Core Somatic Protocols</h2>
            <div className="flex-grow h-px bg-neutral-900"></div>
          </div>
          {/* Always visible: first 4 foundational tools */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <BodyToolCard
              icon={<VesselFrameIcon size={28} />}
              title="Integral Body Architect"
              description="Synthesize a 7-day plan that balances Yang programming (training, sleep, nutrition) with Yin cultivation (Qigong, breathing, subtle body work)."
              onStart={() => setActiveWizard('integral-body-architect')}
              time="~25 min"
              intensity="medium"
            />
            <BodyToolCard
              icon={<SenseMandalaIcon size={28} />}
              title="Somatic Practice Generator"
              description="Generate precise, spatially-aware guided practices like Qigong or Somatic Movement using an AI trained on human movement."
              onStart={() => setActiveWizard('somatic')}
              time="~20 min"
              intensity="light"
            />
            <BodyToolCard
              icon={<ResonanceFieldIcon size={28} />}
              title="Nervous System State Check-In"
              description="Before cognitive or shadow work — locate your polyvagal state (Ventral/Sympathetic/Dorsal) and return to nervous system safety through somatic co-regulation and state-appropriate interventions."
              onStart={() => setActiveWizard('polyvagal-trainer')}
              time="~20 min"
              intensity="light"
            />
            <BodyToolCard
              icon={<PulseMatrixIcon size={28} />}
              title="Dynamic Workout Architect"
              description="Generate personalized, adaptive workout programs tailored to your goals, equipment, experience level, and somatic awareness."
              onStart={() => setActiveWizard('dynamic-workout-architect')}
              time="~30 min"
              intensity="medium"
            />
          </div>

          {/* Expandable: remaining 6 extended protocols */}
          <div
            id="body-extended-protocols"
            role="region"
            aria-hidden={!extendedOpen}
            className={`transition-all duration-500 ease-in-out overflow-hidden motion-reduce:transition-none ${extendedOpen ? 'max-h-[3000px] opacity-100 mt-8' : 'max-h-0 opacity-0'}`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              <BodyToolCard
                icon={<AetherBreathIcon size={28} />}
                title="Bioenergetics & Breathing"
                description="Explore Reichian-Lowenian bioenergetics practices: grounding, chest opening, pelvic release, and nervous system discharge techniques."
                onStart={() => setActiveWizard('bioenergetics')}
                time="~45 min"
                intensity="deep"
              />
              <BodyToolCard
                icon={<RosaCrucisIcon size={28} />}
                title="Scarlett"
                description="Expert guidance on sexual health, desire, pleasure, and embodiment (18+ only). Private conversations with Dr. Vex."
                onStart={() => setActiveWizard('sexology-coach')}
                time="~30 min"
                intensity="medium"
              />
              <BodyToolCard
                icon={<SomaticPillarIcon size={28} />}
                title="Interoception Training"
                description="Develop sensitivity to internal body signals and somatic wisdom through guided interoceptive awareness practices."
                onStart={() => setActiveWizard('interoception')}
                time="~20 min"
                intensity="light"
              />
              <BodyToolCard
                icon={<EngramArchiveIcon size={28} />}
                title="Somatic Cartography"
                description="Map recurring tensions across 28 body zones. Daily check-ins build a personal heat map revealing your somatic patterns over time."
                onStart={() => setActiveWizard('somatic-cartography')}
                time="~35 min"
                intensity="medium"
              />
              <BodyToolCard
                icon={<AOSClockIcon size={28} />}
                title="Chronobiology Protocol"
                description="Map your biological rhythms over 3–5 days, identify peak energy windows, and redesign your weekly schedule for optimal alignment."
                onStart={() => setActiveWizard('chronobiology')}
                time="~25 min"
                intensity="light"
              />
              <BodyToolCard
                icon={<SenseMandalaIcon size={28} />}
                title="The Quantified Self and Its Limits"
                description="Map your cultural stances toward your body — machine, construct, vessel, home."
                onStart={() => setActiveWizard('quantified-self')}
                time="~20 min"
                intensity="light"
              />
            </div>
          </div>

          <button
            onClick={() => setExtendedOpen(v => !v)}
            aria-expanded={extendedOpen}
            aria-controls="body-extended-protocols"
            className="mt-6 text-[10px] font-mono uppercase tracking-widest text-emerald-400/50 hover:text-emerald-300 transition-colors motion-reduce:transition-none"
          >
            {extendedOpen ? 'Show less' : 'Show 6 more practices'}
          </button>
        </section>

        {/* Saved Reports Section */}
        {(integralBodyPlans.length > 0 || workoutPrograms.length > 0) && (
          <>
            <SectionDivider />
            <section className="space-y-6">
              <h2 className="text-2xl font-light text-neutral-100 font-serif">Your Saved Reports</h2>

              {/* Integral Body Plans */}
              {integralBodyPlans.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-mono uppercase tracking-[0.2em] text-neutral-500 flex items-center gap-2">
                    <VesselFrameIcon size={20} className="text-emerald-400" />
                    Integral Body Plans ({integralBodyPlans.length})
                  </h3>
                  <div className="space-y-3">
                    {integralBodyPlans.map((plan) => (
                      <PlanReportCard
                        key={plan.id}
                        plan={plan}
                        isExpanded={expandedPlan === plan.id}
                        onToggle={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Workout Programs */}
              {workoutPrograms.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-mono uppercase tracking-[0.2em] text-neutral-500 flex items-center gap-2">
                    <PulseMatrixIcon size={20} className="text-teal-400" />
                    Workout Programs ({workoutPrograms.length})
                  </h3>
                  <div className="space-y-3">
                    {workoutPrograms.map((program) => (
                      <WorkoutReportCard
                        key={program.id}
                        program={program}
                        isExpanded={expandedWorkout === program.id}
                        onToggle={() => setExpandedWorkout(expandedWorkout === program.id ? null : program.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </section>
          </>
        )}

        <SectionDivider />

        <section className="space-y-4 py-8">
          <img
            src="https://files.catbox.moe/atn6iy.png"
            alt="Body Integration Map"
            className="w-full rounded-lg shadow-lg border border-emerald-500/20"
          />
        </section>
      </div>
    </div>
  );
}

// Plan Report Card Component
function PlanReportCard({
  plan,
  isExpanded,
  onToggle
}: {
  plan: IntegralBodyPlan;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl overflow-hidden transition-all duration-[280ms] [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] hover:border-emerald-500/30 hover:bg-neutral-900/80">
      <button
        onClick={onToggle}
        className="w-full p-5 flex items-start justify-between hover:bg-emerald-500/5 transition-colors duration-[280ms] text-left focus-visible:outline-none focus-visible:bg-emerald-500/5"
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <ChronolithIcon size={18} className="text-emerald-400" />
            <h4 className="text-lg font-normal text-neutral-100 font-serif">{plan.goalStatement}</h4>
          </div>
          <div className="flex flex-wrap gap-4 font-mono text-xs text-neutral-500 uppercase tracking-wide">
            <span>Week of {new Date(plan.weekStartDate).toLocaleDateString()}</span>
            <span className="text-neutral-700">·</span>
            <span>{plan.dailyTargets.workoutDays}× workouts</span>
            <span className="text-neutral-700">·</span>
            <span>{plan.dailyTargets.yinPracticeMinutes}min yin</span>
            <span className="text-neutral-700">·</span>
            <span>{plan.dailyTargets.proteinGrams}g protein</span>
          </div>
        </div>
        {isExpanded ? <AOSArrowIcon size={18} className="-rotate-90 text-emerald-400 mt-1 shrink-0" /> : <AOSArrowIcon size={18} className="rotate-90 text-neutral-600 mt-1 shrink-0" />}
      </button>

      {isExpanded && (
        <div className="border-t border-emerald-500/20 p-4 bg-neutral-950/30 space-y-4">
          {/* Export Buttons */}
          <div className="flex flex-wrap gap-2 pb-4 border-b border-emerald-500/20">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const textContent = formatIntegralBodyPlanAsText(plan);
                downloadAsFile(textContent, `Integral-Body-Plan-${new Date().toISOString().split('T')[0]}`, 'txt');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-emerald-500/30 rounded-md font-medium transition-colors text-sm"
            >
              <EngramArchiveIcon size={16} className="text-emerald-400" />
              Download as TXT
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const textContent = formatIntegralBodyPlanAsText(plan);
                downloadAsFile(textContent, `Integral-Body-Plan-${new Date().toISOString().split('T')[0]}`, 'pdf');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-emerald-500/30 rounded-md font-medium transition-colors text-sm"
            >
              <VectorGateIcon size={16} className="text-emerald-400" />
              Download as PDF
            </button>
          </div>

          <div>
            <h5 className="font-semibold text-neutral-200 mb-2">Week Summary</h5>
            <p className="text-neutral-300 text-sm">{plan.weekSummary}</p>
          </div>

          <div>
            <h5 className="font-semibold text-neutral-200 mb-2 font-serif">Daily Schedule</h5>
            <div className="space-y-2">
              {plan.days.map((day, idx) => (
                <div key={idx} className="bg-neutral-900/50 border border-emerald-500/20 rounded p-3">
                  <h6 className="font-medium text-neutral-100 mb-1">{day.dayName}</h6>
                  <p className="text-xs text-neutral-300">{day.summary}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    {day.workout && (
                      <span className="bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded border border-emerald-500/30">
                        💪 {day.workout.name}
                      </span>
                    )}
                    {day.yinPractices.map((practice, pIdx) => (
                      <span key={pIdx} className="bg-teal-500/20 text-teal-300 px-2 py-1 rounded border border-teal-500/30">
                        🧘 {practice.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {plan.shoppingList && plan.shoppingList.length > 0 && (
            <div>
              <h5 className="font-semibold text-neutral-200 mb-2 font-serif">Shopping List</h5>
              <div className="bg-neutral-900/50 border border-emerald-500/20 rounded p-3">
                <ul className="text-sm text-neutral-300 space-y-1">
                  {plan.shoppingList.slice(0, 5).map((item, idx) => (
                    <li key={idx}>• {item}</li>
                  ))}
                  {plan.shoppingList.length > 5 && (
                    <li className="text-neutral-500">... and {plan.shoppingList.length - 5} more items</li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Workout Report Card Component
function WorkoutReportCard({
  program,
  isExpanded,
  onToggle
}: {
  program: WorkoutProgram;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl overflow-hidden transition-all duration-[280ms] [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] hover:border-teal-500/30 hover:bg-neutral-900/80">
      <button
        onClick={onToggle}
        className="w-full p-5 flex items-start justify-between hover:bg-teal-500/5 transition-colors duration-[280ms] text-left focus-visible:outline-none focus-visible:bg-teal-500/5"
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <PulseMatrixIcon size={18} className="text-teal-400" />
            <h4 className="text-lg font-normal text-neutral-100 font-serif">{program.title}</h4>
          </div>
          <div className="flex flex-wrap gap-4 font-mono text-xs text-neutral-500 uppercase tracking-wide">
            <span>{new Date(program.date).toLocaleDateString()}</span>
            <span className="text-neutral-700">·</span>
            <span>{program.workouts.length} workout{program.workouts.length > 1 ? 's' : ''}</span>
          </div>
        </div>
        {isExpanded ? <AOSArrowIcon size={18} className="-rotate-90 text-teal-400 mt-1 shrink-0" /> : <AOSArrowIcon size={18} className="rotate-90 text-neutral-600 mt-1 shrink-0" />}
      </button>

      {isExpanded && (
        <div className="border-t border-teal-500/20 p-4 bg-neutral-950/30 space-y-4">
          {/* Export Buttons */}
          <div className="flex flex-wrap gap-2 pb-4 border-b border-teal-500/20">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const textContent = formatWorkoutProgramAsText(program);
                downloadAsFile(textContent, `Dynamic-Workout-${new Date().toISOString().split('T')[0]}`, 'txt');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-teal-500/30 rounded-md font-medium transition-colors text-sm"
            >
              <EngramArchiveIcon size={16} className="text-teal-400" />
              Download as TXT
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const textContent = formatWorkoutProgramAsText(program);
                downloadAsFile(textContent, `Dynamic-Workout-${new Date().toISOString().split('T')[0]}`, 'pdf');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-teal-500/30 rounded-md font-medium transition-colors text-sm"
            >
              <VectorGateIcon size={16} className="text-teal-400" />
              Download as PDF
            </button>
          </div>

          <div>
            <h5 className="font-semibold text-neutral-200 mb-2">Program Summary</h5>
            <p className="text-neutral-300 text-sm">{program.summary}</p>
          </div>

          {program.personalizationNotes && (
            <div>
              <h5 className="font-semibold text-neutral-200 mb-2 font-serif">Personalization Notes</h5>
              <p className="text-neutral-300 text-sm">{program.personalizationNotes}</p>
            </div>
          )}

          <div>
            <h5 className="font-semibold text-neutral-200 mb-2 font-serif">Workouts</h5>
            <div className="space-y-2">
              {program.workouts.map((workout, idx) => (
                <div key={idx} className="bg-neutral-900/50 border border-teal-500/20 rounded p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <h6 className="font-medium text-neutral-100">{workout.name}</h6>
                    <span className={`text-xs px-2 py-0.5 rounded border ${workout.intensity === 'light' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                      workout.intensity === 'moderate' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                        'bg-red-500/20 text-red-300 border-red-500/30'
                      }`}>
                      {workout.intensity}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-300 space-y-1">
                    <p>⏱️ {workout.duration}min • 🎯 {workout.muscleGroupsFocused.join(', ')}</p>
                    <p>📝 {workout.exercises.length} exercises</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {program.progressionRecommendations && program.progressionRecommendations.length > 0 && (
            <div>
              <h5 className="font-semibold text-neutral-200 mb-2 font-serif">Progression Tips</h5>
              <div className="bg-neutral-900/50 border border-teal-500/20 rounded p-3">
                <ul className="text-sm text-neutral-300 space-y-1">
                  {program.progressionRecommendations.map((rec, idx) => (
                    <li key={idx}>→ {rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
