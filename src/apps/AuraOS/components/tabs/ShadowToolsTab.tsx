import React, { useState } from 'react';
import { ThreeTwoOneSession, IFSSession, AttachmentAssessmentSession, Practice } from '../../types.ts';
import { AttachmentStyle } from '../../data/attachmentMappings.ts';
import AttachmentRecommendations from '../shared/AttachmentRecommendations.tsx';
import AttachmentAssessmentWizard from '../wizards/AttachmentAssessmentWizard.tsx';
import IntensityBadge, { IntensityLevel } from '../shared/IntensityBadge.tsx';
import SectionProgress from '../shared/SectionProgress.tsx';
import { useShadowSessionHistory, WizardSessionSummary } from '../../hooks/useShadowSessionHistory.ts';
import {
  WorldEngineIcon,
  UmbraFragmentIcon,
  VoidEclipseIcon,
  EngramArchiveIcon,
  RelationalWebIcon,
  SeedOfLifeIcon,
  TransformativeArcIcon,
  FocusApertureIcon,
  DyadBridgeIcon,
  HermeticVesselIcon,
  ThirdEyeIcon,
  SynapseNetworkIcon,
  DBTCoachMandalaIcon,
  MoralCompassIcon,
  StructuralLatticeIcon,
  AOSBrainIcon,
  PsychopompLanternIcon,
  AOSArrowIcon,

} from '../visualizations/SacredGeometryIcons/index.ts';
import { useToast } from '../shared/ToastContext.tsx';
import { useNavigationContext } from '../../contexts/NavigationContext.tsx';
import { WIZARD_PROGRESSION_MAP } from '../../data/wizardProgressionMap.ts';
import WhatNextCard from '../shared/WhatNextCard.tsx';

interface ShadowToolsTabProps {
  onStart321: () => void;
  onStartIFS: () => void;
  onStartMemoryRecon: () => void;
  onStartShadowJournal: () => void;
  onOpenPsychedelicHub: () => void;
  setActiveWizard: (wizardName: string | null) => void;
  draftIFSSession: IFSSession | null;
  draft321Session: Partial<ThreeTwoOneSession> | null;
  onResumeIFS: (linkedInsightId?: string) => void;
  onResume321: (linkedInsightId?: string) => void;
  attachmentAssessment?: AttachmentAssessmentSession;
  onCompleteAttachmentAssessment?: (session: AttachmentAssessmentSession) => void;
  addToStack?: (practice: Practice) => void;
  practiceStack?: any[];
  userId?: string;
}

// ── Wizard definition type ──
interface WizardDef {
  id: string;
  title: string;
  desc: string;
  time: string;
  intensity: IntensityLevel;
  icon: React.ReactNode;
  premiumBadge?: boolean;
  /** Override click handler (e.g. for psychedelic which uses onOpenPsychedelicHub) */
  onClickOverride?: () => void;
  hasDraft?: boolean;
  onResume?: () => void;
}

// ── Session-aware card ──
const ShadowToolCard = ({
  icon, title, description, onStart, hasDraft, onResume, premiumBadge, time, intensity, sessionInfo,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onStart: () => void;
  hasDraft?: boolean;
  onResume?: () => void;
  premiumBadge?: boolean;
  time: string;
  intensity: IntensityLevel;
  sessionInfo?: WizardSessionSummary;
}) => (
  <div className="group relative bg-neutral-900/60 border border-neutral-800 rounded-2xl p-7 sm:p-8 flex flex-col transition-all duration-500 hover:border-purple-500/30 hover:bg-neutral-900/80 hover:shadow-[0_8px_32px_rgba(0,0,0,0.7)] hover:-translate-y-1 overflow-hidden">
    {/* Subtle Occult Edge Glow */}
    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

    {/* Premium AOS Badge */}
    {premiumBadge && (
      <div className="absolute top-4 right-4 z-20 pointer-events-none">
        <AOSBrainIcon size={28} color="#7f0000" />
      </div>
    )}

    <div className="relative z-10 flex flex-col h-full">
      <div className="flex flex-col gap-5 mb-5 sm:flex-row sm:items-center">
        <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-purple-400 group-hover:text-purple-300 group-hover:border-purple-500/20 transition-all duration-500 w-fit shadow-inner">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl sm:text-3xl font-normal tracking-tight text-neutral-100 font-serif group-hover:text-white transition-colors">{title}</h2>
          <div className="mt-1.5">
            <IntensityBadge time={time} intensity={intensity} />
          </div>
        </div>
      </div>
      <p className="text-neutral-400 mb-6 flex-grow leading-relaxed font-light group-hover:text-neutral-300 transition-colors text-lg">{description}</p>

      {/* Session history signal */}
      {sessionInfo && sessionInfo.sessionCount > 0 && (
        <div className="flex items-center gap-3 mb-5 text-[10px] font-mono uppercase tracking-[0.12em] text-neutral-600">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-500/50" />
          <span>
            {sessionInfo.sessionCount} session{sessionInfo.sessionCount !== 1 ? 's' : ''}
            {sessionInfo.lastPracticed && (
              <> · last {formatRelativeDate(sessionInfo.lastPracticed)}</>
            )}
          </span>
        </div>
      )}

      <div className="flex flex-wrap gap-4 mt-auto">
        <button onClick={onStart} className="min-h-[44px] bg-neutral-950 text-neutral-200 hover:text-white px-7 rounded-xl font-mono text-xs uppercase tracking-widest transition-all duration-300 self-start border border-neutral-800 hover:border-purple-500/50 flex items-center gap-3 group/btn relative overflow-hidden">
          <span className="relative z-10">Initiate Ritual</span>
          <AOSArrowIcon size={14} className="relative z-10 text-purple-500 group-hover/btn:text-purple-400 transform group-hover/btn:translate-x-1 transition-transform" />
          <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
        </button>
        {hasDraft && onResume && (
          <button onClick={onResume} className="min-h-[44px] text-neutral-400 hover:text-white px-6 rounded-xl transition-colors font-mono text-xs uppercase tracking-widest border border-transparent hover:border-neutral-700 bg-transparent flex items-center justify-center">
            Resume
          </button>
        )}
      </div>
    </div>
  </div>
);

// ── Compact card for smaller wizard entries ──
const CompactWizardCard = ({
  icon, title, desc, time, intensity, onClick, sessionInfo,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  time: string;
  intensity: IntensityLevel;
  onClick: () => void;
  sessionInfo?: WizardSessionSummary;
}) => (
  <button
    onClick={onClick}
    className="group p-6 bg-neutral-950 border border-neutral-900 rounded-2xl text-left hover:border-purple-500/20 transition-all duration-500 hover:bg-neutral-900/80 hover:shadow-2xl hover:shadow-black hover:-translate-y-1 flex flex-col h-full"
  >
    <div className="flex items-center gap-4 mb-3 text-neutral-500 group-hover:text-purple-400 transition-colors duration-500">
      {icon}
      <h4 className="font-serif text-[1.1rem] text-neutral-200 group-hover:text-white transition-colors">{title}</h4>
    </div>
    <div className="mb-4">
      <IntensityBadge time={time} intensity={intensity} />
    </div>
    <p className="text-[13px] text-neutral-500 font-light leading-relaxed group-hover:text-neutral-400 transition-colors flex-grow mb-4">{desc}</p>
    {sessionInfo && sessionInfo.sessionCount > 0 && (
      <div className="flex items-center gap-2 mb-4 text-[10px] font-mono text-neutral-600 uppercase tracking-[0.1em]">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-500/40" />
        {sessionInfo.sessionCount}×
      </div>
    )}
    <div className="flex items-center justify-between mt-auto pt-5 border-t border-neutral-900/60 group-hover:border-neutral-800 transition-colors group/link">
      <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-transparent group-hover:text-purple-400 transition-colors">Access</span>
      <AOSArrowIcon size={14} className="text-neutral-700 group-hover:text-purple-400 transform group-hover/link:translate-x-1 transition-all" />
    </div>
  </button>
);

// ── Collapsible section wrapper ──
const CollapsibleSection = ({
  title,
  thesis,
  isOpen,
  onToggle,
  wizardCount,
  practicedCount,
  children,
}: {
  title: string;
  thesis: string;
  isOpen: boolean;
  onToggle: () => void;
  wizardCount: number;
  practicedCount: number;
  children: React.ReactNode;
}) => (
  <section className="mt-16 sm:mt-20">
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-6 mb-6 group text-left"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-4 mb-2">
          <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-neutral-500 group-hover:text-purple-400/70 transition-colors">{title}</h2>
          <span className="text-[10px] font-mono text-neutral-700 uppercase tracking-widest">
            {wizardCount} tools
          </span>
        </div>
        <p className="text-neutral-600 text-sm font-light italic">{thesis}</p>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <SectionProgress practiced={practicedCount} total={wizardCount} />
        <AOSArrowIcon
          size={14}
          className={`text-neutral-700 group-hover:text-purple-400 transition-all duration-300 ${isOpen ? '-rotate-90' : 'rotate-90'}`}
        />
      </div>
    </button>
    <div className="flex-grow h-px bg-neutral-900 mb-8" />
    {isOpen && (
      <div className="animate-fade-in">
        {children}
      </div>
    )}
  </section>
);

// Very subtle, deep space background effect - pure void geometry
const VoidGeometryBackground = () => (
  <div className="absolute inset-0 w-full h-full pointer-events-none opacity-40 overflow-hidden mix-blend-screen">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_150%,_rgba(192,132,252,0.03)_0%,_transparent_60%)]" />
    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="sacred-grid" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          <path d="M50 0 L50 100 M0 50 L100 50" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="1.5" fill="rgba(192, 132, 252, 0.1)" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(192, 132, 252, 0.02)" strokeWidth="0.5" />
        </pattern>
        <linearGradient id="fade-out" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(10,10,10,0)" />
          <stop offset="20%" stopColor="rgba(10,10,10,0)" />
          <stop offset="100%" stopColor="rgba(10,10,10,1)" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#sacred-grid)" />
      <rect width="100%" height="100%" fill="url(#fade-out)" />
    </svg>
  </div>
);

// ── Relative date formatter ──
function formatRelativeDate(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

export default function ShadowToolsTab({
  onStart321,
  onStartIFS,
  onStartMemoryRecon,
  onStartShadowJournal,
  onOpenPsychedelicHub,
  setActiveWizard,
  draftIFSSession,
  draft321Session,
  onResumeIFS,
  onResume321,
  attachmentAssessment,
  onCompleteAttachmentAssessment,
  addToStack,
  practiceStack = [],
  userId = '',
}: ShadowToolsTabProps) {
  const { addToast } = useToast();
  const { lastClosedWizard, setLastClosedWizard } = useNavigationContext();
  const sessionHistory = useShadowSessionHistory(userId || undefined);
  const [showAttachmentWizard, setShowAttachmentWizard] = useState(false);
  const [selectedAttachmentStyle, setSelectedAttachmentStyle] = useState<AttachmentStyle>(attachmentAssessment?.style || 'secure');

  // Section collapse state — The Threshold is always open
  const [descentOpen, setDescentOpen] = useState(true);
  const [relationalOpen, setRelationalOpen] = useState(true);
  const [crucibleOpen, setCrucibleOpen] = useState(false);

  const shadowProgression = lastClosedWizard ? WIZARD_PROGRESSION_MAP[lastClosedWizard] : null;
  const showWhatNext = !!(shadowProgression && shadowProgression.moduleKey === 'shadow');

  // Helper: count practiced wizards in a section
  const countPracticed = (ids: string[]) => ids.filter(id => sessionHistory.has(id)).length;

  // ── SECTION DEFINITIONS ──
  const thresholdIds = ['shadow-journaling', '321', 'therapy-style'];
  const descentIds = ['ifs', 'memory-recon', 'mourning-field', 'schema-detective', 'schema-reflection'];
  const relationalIds = ['attachment-assessment', 'attachment-practice', 'relational', 'relational-blueprint', 'cultural-shadow'];
  const crucibleIds = ['axis', 'psychedelic', 'dbt-coach', 'therapy-style'];

  return (
    <div className="relative min-h-[100dvh] bg-neutral-950 text-neutral-300">
      {/* Structural Void Layer */}
      <VoidGeometryBackground />

      {/* Atmospheric Gradients */}
      <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-purple-900/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-0 w-[600px] h-[600px] bg-indigo-900/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Content Area */}
      <div className="relative z-10 space-y-12 sm:space-y-16 max-w-6xl mx-auto px-4 sm:px-8 md:px-12 py-16 pb-32">

        {/* Editorial/Occult Header */}
        <header className="relative mb-20 max-w-3xl">
          <div className="font-mono text-xs tracking-[0.2em] text-purple-400/80 uppercase mb-8 flex items-center gap-4">
            <span className="opacity-60">02</span>
            <span className="w-8 h-px bg-purple-500/30"></span>
            <span>Module Integration</span>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-light font-serif text-neutral-50 tracking-tight mb-8 leading-tight">
            Shadow Context<span className="text-purple-500 font-normal">.</span>
          </h1>
          <p className="text-neutral-400 text-xl font-light leading-relaxed border-l border-neutral-800 pl-6">
            Precision protocols to uncover, analyze, and metabolize the unconscious psychological material dictating your reality.
          </p>
        </header>

        {/* What's Next card — shown after completing a shadow wizard */}
        {showWhatNext && lastClosedWizard && (
          <WhatNextCard
            fromWizardId={lastClosedWizard}
            moduleKey="shadow"
            onDismiss={() => setLastClosedWizard(null)}
            onBegin={(wizardId) => { setActiveWizard(wizardId); setLastClosedWizard(null); }}
          />
        )}

        {/* ═══════════════════════════════════════════════════════
            THE THRESHOLD — Begin Here
        ═══════════════════════════════════════════════════════ */}
        <section>
          <p className="text-[10px] uppercase tracking-widest text-purple-400/60 mb-1 font-mono">Begin here</p>
          <div className="flex items-center gap-6 mb-3">
            <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-purple-400/70">The Threshold</h2>
            <span className="text-[10px] font-mono text-neutral-700 uppercase tracking-widest">3 tools</span>
            <div className="flex-grow h-px bg-purple-900/20" />
          </div>
          <p className="text-neutral-600 text-sm font-light italic mb-6">Start anywhere. Each of these opens a door.</p>
          <div className="flex items-center mb-8">
            <SectionProgress practiced={countPracticed(thresholdIds)} total={3} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { slot: 'Entry',     time: '~15 min', title: 'Shadow Journaling',    wizardId: 'shadow-journaling', icon: <EngramArchiveIcon size={24} />, intensity: 'light' as IntensityLevel },
              { slot: 'Practice',  time: '~20 min', title: '3-2-1 Shadow',         wizardId: '321',               icon: <UmbraFragmentIcon size={24} />, intensity: 'medium' as IntensityLevel },
              { slot: 'Compass',   time: '~5 min',  title: 'Modality Mapping',     wizardId: 'therapy-style',     icon: <MoralCompassIcon size={24} />,  intensity: 'light' as IntensityLevel },
            ].map(item => (
              <button
                key={item.wizardId}
                onClick={() => setActiveWizard(item.wizardId)}
                className="group min-h-[80px] bg-neutral-950/80 border border-purple-500/20 rounded-xl p-4 text-left hover:border-purple-500/40 hover:bg-neutral-900/60 transition-all duration-300 flex flex-col gap-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="text-purple-400/80 group-hover:text-purple-400 transition-colors">
                    {item.icon}
                  </div>
                  <IntensityBadge time={item.time} intensity={item.intensity} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base font-serif text-neutral-100">{item.title}</span>
                  <div className="flex items-center gap-2">
                    {sessionHistory.has(item.wizardId) && (
                      <span className="text-[10px] font-mono text-neutral-600">{sessionHistory.get(item.wizardId)!.sessionCount}×</span>
                    )}
                    <AOSArrowIcon size={14} className="text-purple-500/50 group-hover:text-purple-400 transition-colors" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            THE DESCENT — Deep Process Work
        ═══════════════════════════════════════════════════════ */}
        <CollapsibleSection
          title="The Descent"
          thesis="Sustained immersion into unconscious material."
          isOpen={descentOpen}
          onToggle={() => setDescentOpen(o => !o)}
          wizardCount={descentIds.length}
          practicedCount={countPracticed(descentIds)}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <ShadowToolCard
              icon={<WorldEngineIcon size={32} />}
              title="Internal Family Systems"
              description="A systematic dialogue protocol to unblend from protective psychology, interface with exiled components, and restore core Self-leadership."
              onStart={onStartIFS}
              hasDraft={!!draftIFSSession}
              onResume={() => onResumeIFS(draftIFSSession?.linkedInsightId)}
              time="~45 min"
              intensity="deep"
              sessionInfo={sessionHistory.get('ifs')}
            />
            <ShadowToolCard
              icon={<VoidEclipseIcon size={32} />}
              title="Memory Reconsolidation"
              description="Unwind implicit emotional beliefs by juxtaposing historic truths with lived contradictory experiences. Rewire reactive roots."
              onStart={onStartMemoryRecon}
              time="~40 min"
              intensity="deep"
              sessionInfo={sessionHistory.get('memory-recon')}
            />
            <ShadowToolCard
              icon={<PsychopompLanternIcon size={32} />}
              title="The Mourning Field"
              description="A grief companion grounded in the Dual Process Model, meaning reconstruction, and compassion practices. Holds loss without rushing it toward resolution."
              onStart={() => setActiveWizard('mourning-field')}
              time="~30 min"
              intensity="deep"
              sessionInfo={sessionHistory.get('mourning-field')}
            />
            <ShadowToolCard
              icon={<TransformativeArcIcon size={32} />}
              title="Schema Detective"
              description="Isolate the specific Early Maladaptive Schemas fundamentally dictating your emotional reactions."
              onStart={() => setActiveWizard('schema-detective')}
              time="~25 min"
              intensity="medium"
              sessionInfo={sessionHistory.get('schema-detective')}
            />
            <ShadowToolCard
              icon={<FocusApertureIcon size={32} />}
              title="Schema Reflection"
              description="Systematically explore emotional blueprints via targeted self-rating and free journaling."
              onStart={() => setActiveWizard('schema-reflection')}
              time="~20 min"
              intensity="medium"
              sessionInfo={sessionHistory.get('schema-reflection')}
            />
          </div>
        </CollapsibleSection>

        {/* ═══════════════════════════════════════════════════════
            THE RELATIONAL FIELD — Attachment & Pattern Work
        ═══════════════════════════════════════════════════════ */}
        <CollapsibleSection
          title="The Relational Field"
          thesis="See yourself through the mirror of relationships."
          isOpen={relationalOpen}
          onToggle={() => setRelationalOpen(o => !o)}
          wizardCount={relationalIds.length}
          practicedCount={countPracticed(relationalIds)}
        >
          {/* Featured: Relational Architecture */}
          <div className="relative overflow-hidden group p-8 sm:p-12 lg:p-16 bg-neutral-900/40 border border-neutral-800/80 rounded-3xl transition-all duration-700 hover:border-purple-500/20 cursor-pointer mb-8" onClick={() => setShowAttachmentWizard(true)}>
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-800/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-start justify-between gap-12 lg:gap-16">
              <div className="lg:w-5/12">
                <div className="flex items-center gap-5 mb-6">
                  <div className="text-purple-400/90 group-hover:text-purple-400 transition-colors duration-500">
                    <RelationalWebIcon size={36} />
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-normal tracking-tight font-serif text-neutral-100">Relational Architecture</h3>
                </div>
                <div className="mb-4">
                  <IntensityBadge time="~15 min" intensity="light" />
                </div>
                <p className="text-neutral-400 font-light leading-relaxed mb-8 text-lg">
                  A structural diagnostic protocol to map your adaptive attachment strategies. Analyze how your nervous system currently modulates distance and intimacy.
                </p>
                {!attachmentAssessment && (
                  <button
                    onClick={() => setShowAttachmentWizard(true)}
                    className="min-h-[44px] bg-transparent border border-neutral-700 hover:border-purple-500/40 text-neutral-300 hover:text-white px-8 rounded-xl font-mono text-xs uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-3 w-fit group/audit shadow-sm"
                  >
                    Initiate Diagnostics <AOSArrowIcon size={14} className="text-purple-500 transform group-hover/audit:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>

              {attachmentAssessment ? (
                <div className="lg:w-7/12 flex flex-col w-full bg-neutral-950/40 rounded-2xl p-6 sm:p-8 border border-neutral-900">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-6 mb-8">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500 mb-2">Primary Adaptive Strategy</div>
                      <div className="text-3xl font-serif text-neutral-100 capitalize">{attachmentAssessment.style}</div>
                    </div>
                    <button onClick={() => setShowAttachmentWizard(true)} className="text-[10px] bg-neutral-950 px-4 py-2 rounded-lg border border-neutral-800 font-mono text-neutral-400 hover:text-neutral-200 hover:border-neutral-600 transition-colors uppercase tracking-widest min-h-[44px]">
                      Re-calibrate
                    </button>
                  </div>

                  <div className="space-y-8">
                    <div className="flex flex-wrap gap-3">
                      {(['secure', 'anxious', 'avoidant', 'fearful'] as AttachmentStyle[]).map(style => (
                        <button
                          key={style}
                          onClick={() => setSelectedAttachmentStyle(style)}
                          className={`min-h-[44px] px-5 sm:px-6 rounded-xl font-mono text-[10px] uppercase tracking-[0.2em] transition-all duration-300 border ${selectedAttachmentStyle === style
                            ? 'bg-neutral-800 border-neutral-600 text-white shadow-inner'
                            : 'bg-neutral-950/60 border-neutral-900 text-neutral-500 hover:text-neutral-300 hover:border-neutral-700'
                            }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>

                    <div className="bg-neutral-900/30 rounded-xl p-6 border border-neutral-800/50">
                      <AttachmentRecommendations
                        attachmentStyle={selectedAttachmentStyle}
                        anxietyScore={attachmentAssessment?.scores.anxiety || 3.5}
                        avoidanceScore={attachmentAssessment?.scores.avoidance || 3.5}
                        practiceStack={practiceStack}
                        onPracticeClick={(practice) => {
                          addToStack?.(practice);
                          addToast(`${practice.name} added to your stack`, 'success');
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="lg:w-6/12 flex flex-col justify-center border-l border-neutral-800/60 pl-8 lg:pl-12 py-4">
                  <div className="space-y-12">
                    <div className="group/step">
                      <div className="text-purple-400/80 font-mono text-xs mb-3 uppercase tracking-[0.2em] flex items-center gap-4">
                        <span className="w-8 h-[1px] bg-purple-900 group-hover/step:w-12 group-hover/step:bg-purple-500/50 transition-all duration-500"></span>
                        Phase I: Audit
                      </div>
                      <div className="text-neutral-400 text-base font-light pl-12 leading-relaxed transition-colors">Determine the neurological baselines underlying your approach to anxiety and avoidance.</div>
                    </div>
                    <div className="group/step">
                      <div className="text-purple-400/80 font-mono text-xs mb-3 uppercase tracking-[0.2em] flex items-center gap-4">
                        <span className="w-8 h-[1px] bg-purple-900 group-hover/step:w-12 group-hover/step:bg-purple-500/50 transition-all duration-500"></span>
                        Phase II: Integration
                      </div>
                      <div className="text-neutral-400 text-base font-light pl-12 leading-relaxed transition-colors">Apply targeted somatic and psychological protocols to shift toward secure functioning.</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Remaining relational tools */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <CompactWizardCard
              icon={<DyadBridgeIcon size={24} />}
              title="Attachment Rewiring"
              desc="Deliberate exposure practices to shift avoiding or anxious patterns toward secure baseline."
              time="~25 min"
              intensity="medium"
              onClick={() => setActiveWizard('attachment-practice')}
              sessionInfo={sessionHistory.get('attachment-practice')}
            />
            <CompactWizardCard
              icon={<SynapseNetworkIcon size={24} />}
              title="Pattern Matrix"
              desc="Identify reactive cycle loops occurring across your entire social environment."
              time="~30 min"
              intensity="medium"
              onClick={() => setActiveWizard('relational')}
              sessionInfo={sessionHistory.get('relational')}
            />
            <CompactWizardCard
              icon={<RelationalWebIcon size={24} />}
              title="Relational Blueprint"
              desc="Map patterns across three key relationships. Triangulate the common thread."
              time="~35 min"
              intensity="deep"
              onClick={() => setActiveWizard('relational-blueprint')}
              sessionInfo={sessionHistory.get('relational-blueprint')}
            />
            <CompactWizardCard
              icon={<StructuralLatticeIcon size={24} />}
              title="Cultural Unwinding"
              desc="Excavate the deeply conditioned scripts your culture installed in you."
              time="~25 min"
              intensity="medium"
              onClick={() => setActiveWizard('cultural-shadow')}
              sessionInfo={sessionHistory.get('cultural-shadow')}
            />
          </div>
        </CollapsibleSection>

        {/* ═══════════════════════════════════════════════════════
            THE CRUCIBLE — Extreme / Advanced
        ═══════════════════════════════════════════════════════ */}
        <CollapsibleSection
          title="The Crucible"
          thesis="High-intensity tools for experienced practitioners."
          isOpen={crucibleOpen}
          onToggle={() => setCrucibleOpen(o => !o)}
          wizardCount={crucibleIds.length}
          practicedCount={countPracticed(crucibleIds)}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <ShadowToolCard
              icon={<ThirdEyeIcon size={32} />}
              title="AXIS Frame"
              description="Configure unyielding, adversarial AI for deep, uncomfortable analytical sessions. No softening. No exits."
              onStart={() => setActiveWizard('axis')}
              premiumBadge
              time="~60 min"
              intensity="intensive"
              sessionInfo={sessionHistory.get('axis')}
            />
            <ShadowToolCard
              icon={<HermeticVesselIcon size={32} />}
              title="Entheogenic Protocol"
              description="Precision framework for the preparation and subsequent integration of profound psychedelic journeys."
              onStart={onOpenPsychedelicHub}
              time="~30 min"
              intensity="intensive"
              sessionInfo={sessionHistory.get('psychedelic')}
            />
            <ShadowToolCard
              icon={<DBTCoachMandalaIcon size={32} />}
              title="DBT Automaton"
              description="Drill critical Dialectical Behavior Therapy skills locally via deterministic logic."
              onStart={() => setActiveWizard('dbt-coach')}
              time="~20 min"
              intensity="medium"
              sessionInfo={sessionHistory.get('dbt-coach')}
            />
            <ShadowToolCard
              icon={<MoralCompassIcon size={32} />}
              title="Modality Mapping"
              description="Quantitatively align your neurobiological wiring with the optimal psychotherapeutic approach."
              onStart={() => setActiveWizard('therapy-style')}
              time="~15 min"
              intensity="light"
              sessionInfo={sessionHistory.get('therapy-style')}
            />
          </div>
        </CollapsibleSection>

      </div>

      {showAttachmentWizard && (
        <AttachmentAssessmentWizard
          onClose={() => setShowAttachmentWizard(false)}
          onComplete={(session) => {
            onCompleteAttachmentAssessment?.(session);
            setSelectedAttachmentStyle(session.style);
            setShowAttachmentWizard(false);
          }}
          userId={userId}
        />
      )}
    </div>
  );
}
