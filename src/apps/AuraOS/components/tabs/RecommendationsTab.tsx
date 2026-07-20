
import React, { useState, useMemo, useEffect, useRef } from 'react';
// FIX: Add file extension to import path.
import { StarterStack, IntegratedInsight, AllPractice, IntelligentGuidance, PersonalizationSummary, CrossModalPattern, ActiveTab } from '../../types.ts';
import { CheckCircle, ArrowRight, Clock, Target, AlertTriangle, RefreshCw, Zap, ChevronDown, ChevronUp, MessageSquare, Sparkles, UserPlus } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useAnimationFrame } from 'framer-motion';
import { getIconComponent } from '../../.claude/lib/iconMap';
import { SectionDivider } from '../shared/SectionDivider.tsx';
import { getPendingInsights, getHighImpactPractices } from '../../services/insightContext.ts';
import { detectCrossModalPatternsWithAI } from '../../services/crossModalAnalyzer.ts';
import TransparencyButton from '../shared/TransparencyButton.tsx';
import { useToast } from '../shared/ToastContext.tsx';
import { VirtualizedInsightList } from '../shared/VirtualizedInsightList.tsx';
import PsychopompLanternIcon from '../visualizations/SacredGeometryIcons/PsychopompLanternIcon';

interface RecommendationsTabProps {
  starterStacks: Record<string, StarterStack>;
  applyStarterStack: (practiceIds: string[]) => void;
  userId: string;
  isLoading: boolean;
  error: string | null;
  intelligentGuidance?: IntelligentGuidance;
  isGuidanceLoading?: boolean;
  guidanceError?: string | null;
  onGenerateGuidance?: () => void;
  onClearGuidanceCache?: () => void;
  integratedInsights: IntegratedInsight[];
  allPractices: AllPractice[];
  addToStack: (practice: AllPractice) => void;
  personalizationSummary?: PersonalizationSummary | null;
  setActiveTab?: (tab: ActiveTab) => void;
  onLaunchWizard?: (wizardKey: string, insightId?: string) => void;
}

// Animated cycling border for the open-question block
function AnimatedBorderBox({ children, className }: { children: React.ReactNode; className?: string }) {
  const hue = useMotionValue(270); // violet start

  useAnimationFrame((t) => {
    // Cycle between violet (270) and indigo (240) and back
    const cycle = Math.sin(t / 4000) * 0.5 + 0.5; // 0–1 over ~4s
    hue.set(240 + cycle * 30);
  });

  return (
    <div className={`relative ${className ?? ''}`}>
      {/* Static border base */}
      <div className="absolute inset-0 rounded-2xl border border-white/10 pointer-events-none" />
      {children}
    </div>
  );
}

// Pulsing orb beacon for section labels
function PulsingOrb({ color = 'bg-purple-500' }: { color?: string }) {
  return (
    <span className="relative inline-flex items-center justify-center w-2 h-2 mr-3 shrink-0">
      <span className={`absolute inline-flex h-full w-full rounded-full ${color} opacity-50 animate-ping`} />
      <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${color}`} />
    </span>
  );
}

export default function RecommendationsTab({
  starterStacks,
  applyStarterStack,
  isLoading,
  error,
  intelligentGuidance,
  isGuidanceLoading,
  guidanceError,
  onGenerateGuidance,
  onClearGuidanceCache,
  integratedInsights,
  allPractices,
  addToStack,
  personalizationSummary,
  setActiveTab,
  onLaunchWizard
}: RecommendationsTabProps) {
  const { addToast } = useToast();
  const [reasoningOpen, setReasoningOpen] = useState(false);

  // First-session state
  const [missedFeedback, setMissedFeedback] = useState('');
  const [missedSubmitted, setMissedSubmitted] = useState(() => {
    try { return !!JSON.parse(localStorage.getItem('aura-day1-portrait') || '{}').missedFeedback; }
    catch { return false; }
  });
  const missedRef = useRef<HTMLTextAreaElement>(null);
  const [textareaFocused, setTextareaFocused] = useState(false);
  const isFirstSession = integratedInsights.length <= 1;

  // Persist synthesis to localStorage so users can return to it without account
  useEffect(() => {
    if (intelligentGuidance && isFirstSession) {
      try {
        localStorage.setItem('aura-day1-portrait', JSON.stringify({
          synthesis: intelligentGuidance.synthesis,
          primaryFocus: intelligentGuidance.primaryFocus,
          openQuestion: intelligentGuidance.openQuestion,
          generatedAt: intelligentGuidance.generatedAt,
        }));
      } catch { /* ignore */ }
    }
  }, [intelligentGuidance, isFirstSession]);

  const handleMissedSubmit = () => {
    if (!missedFeedback.trim()) return;
    try {
      const existing = JSON.parse(localStorage.getItem('aura-day1-portrait') || '{}');
      localStorage.setItem('aura-day1-portrait', JSON.stringify({
        ...existing,
        missedFeedback: missedFeedback.trim(),
        missedAt: new Date().toISOString(),
      }));
    } catch { /* ignore */ }
    setMissedSubmitted(true);
  };

  const stripCitations = (text: string): string => {
    return text.replace(/\s*\[.*?\]/g, '');
  };

  const pendingInsights = useMemo(() => getPendingInsights(integratedInsights), [integratedInsights]);
  const highImpactPractices = useMemo(() => getHighImpactPractices(integratedInsights, allPractices, 2), [integratedInsights, allPractices]);

  const handleAddPracticeToStack = (practice: AllPractice) => {
    addToStack(practice);
    addToast(`${practice.name} added to your stack`, 'success');
    if (setActiveTab) {
      setActiveTab('browse');
    }
  };

  const handlePracticeClick = (practiceId: string, insightId?: string) => {
    const practice = allPractices.find(p => p.id === practiceId);
    if (practice?.wizardKey && onLaunchWizard) {
      onLaunchWizard(practice.wizardKey, insightId);
      return;
    }
    if (practice) {
      handleAddPracticeToStack(practice);
    }
  };

  const sessionCount = integratedInsights.length;

  return (
    <div className="space-y-10">
      {/* Header */}
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-5xl font-bold font-serif text-slate-100 tracking-tighter">Analysis</h1>
          <p className="text-slate-500 mt-2 text-sm">AI synthesis of your developmental journey — sessions, patterns, and what to explore next.</p>
        </div>
        {intelligentGuidance && onClearGuidanceCache && (
          <button
            onClick={onClearGuidanceCache}
            className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1.5 mt-2 transition-colors"
            title="Clear cache and regenerate"
          >
            <RefreshCw size={13} /> Refresh
          </button>
        )}
      </header>

      {/* ── Empty State ── */}
      {!intelligentGuidance && (
        <section className="py-8">
          <div className="max-w-lg">
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-6">How it works</p>
            <div className="space-y-4 mb-8">
              {[
                { label: 'Session patterns', detail: 'Reads across all your wizard completions to find recurring themes.' },
                { label: 'Cross-modal integration', detail: 'Connects what emerged in Mind, Body, Shadow, and Spirit work.' },
                { label: 'Wizard routing', detail: 'Recommends the single next practice most likely to move you forward.' },
                { label: 'Practice sequencing', detail: 'Suggests an order and timing for what to add to your stack.' },
              ].map(({ label, detail }) => (
                <div key={label} className="flex items-start gap-3">
                  <CheckCircle size={15} className="text-purple-500/70 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-slate-200 text-sm font-medium">{label}</span>
                    <span className="text-slate-500 text-sm"> — {detail}</span>
                  </div>
                </div>
              ))}
            </div>

            {sessionCount > 0 && (
              <p className="text-xs text-slate-500 mb-6">
                {sessionCount} insight{sessionCount !== 1 ? 's' : ''} available to synthesize.
              </p>
            )}

            <button
              onClick={onGenerateGuidance}
              disabled={isGuidanceLoading}
              type="button"
              className="border border-purple-500/60 hover:border-purple-400 text-slate-100 text-sm font-medium py-2.5 px-5 rounded-lg flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-purple-500/5"
            >
              {isGuidanceLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
                  Analyzing your journey…
                </>
              ) : (
                <>
                  {React.createElement(getIconComponent('NoosphereNode') || 'div', { size: 16, className: 'text-purple-400' })}
                  Generate Analysis
                </>
              )}
            </button>
            {guidanceError && <p className="text-red-400 text-xs mt-3">{guidanceError}</p>}
          </div>
        </section>
      )}

      {/* ── With Guidance ── */}
      {intelligentGuidance && (
        <>
          {/* 1. Synthesis Hero — "Where You Are" */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative pl-6 py-1"
          >
            {/* Glowing orb beacon on left edge */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center">
              <span className="absolute w-4 h-4 rounded-full bg-purple-500/20 animate-ping" style={{ animationDuration: '2.5s' }} />
              <span className="relative w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="text-xs uppercase tracking-widest text-slate-500 mb-3 flex items-center"
            >
              Where You Are
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              style={{ willChange: 'transform' }}
              className="text-xl leading-relaxed font-serif font-light bg-clip-text text-transparent bg-gradient-to-r from-slate-100 via-slate-200 to-slate-300"
            >
              {stripCitations(intelligentGuidance.synthesis)}
            </motion.p>
          </motion.section>

          {/* 2. Primary Focus */}
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ willChange: 'transform' }}
            className="relative pl-6 py-1"
          >
            {/* Teal beacon */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center">
              <span className="absolute w-4 h-4 rounded-full bg-teal-500/20 animate-ping" style={{ animationDuration: '3s' }} />
              <span className="relative w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.7)]" />
            </div>

            <p className="text-xs uppercase tracking-widest text-slate-500 mb-3 flex items-center">
              Primary Focus
            </p>
            <p className="text-base leading-relaxed text-slate-300">{stripCitations(intelligentGuidance.primaryFocus)}</p>
          </motion.section>

          {/* openQuestion — glass morphism thought-bubble */}
          <AnimatePresence>
            {intelligentGuidance.openQuestion && intelligentGuidance.openQuestion.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{ willChange: 'transform' }}
                className="relative rounded-2xl overflow-hidden"
              >
                {/* Glass base */}
                <div className="absolute inset-0 backdrop-blur-sm bg-white/[0.03] rounded-2xl" />
                {/* Border */}
                <div className="absolute inset-0 rounded-2xl border border-white/10 pointer-events-none" />
                {/* Ambient glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/8 via-transparent to-indigo-600/5 pointer-events-none rounded-2xl" />

                <div className="relative px-6 py-5 flex items-start gap-3">
                  <div className="mt-0.5 w-7 h-7 rounded-full bg-violet-500/15 border border-violet-400/30 flex items-center justify-center shrink-0">
                    <Sparkles size={13} className="text-violet-400" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-violet-400/70 mb-2 font-medium">A question back</p>
                    <p className="text-slate-200 text-lg leading-relaxed italic font-serif">
                      &ldquo;{intelligentGuidance.openQuestion}&rdquo;
                    </p>
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* First-session: "What did this miss?" + account CTA */}
          <AnimatePresence>
            {isFirstSession && (
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-4"
              >
                {/* What did this miss */}
                <div className="rounded-2xl border border-stone-700/50 bg-stone-900/40 px-6 py-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={14} className="text-stone-400" />
                    <p className="text-xs uppercase tracking-widest text-stone-400 font-medium">What did this miss?</p>
                  </div>
                  <AnimatePresence mode="wait">
                    {!missedSubmitted ? (
                      <motion.div key="input" initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                        <textarea
                          ref={missedRef}
                          value={missedFeedback}
                          onChange={e => setMissedFeedback(e.target.value)}
                          onFocus={() => setTextareaFocused(true)}
                          onBlur={() => setTextareaFocused(false)}
                          placeholder="What's not landing? What did it overlook?"
                          rows={2}
                          className="w-full bg-stone-950/60 border border-stone-700/50 rounded-xl px-4 py-3 text-sm text-slate-300 placeholder-stone-600 resize-none focus:outline-none transition-all duration-300"
                          style={{
                            boxShadow: textareaFocused ? '0 0 20px rgba(139,92,246,0.15), 0 0 0 1px rgba(139,92,246,0.3)' : undefined,
                            borderColor: textareaFocused ? 'rgba(139,92,246,0.4)' : undefined,
                          }}
                        />
                        {/* Submit pill button */}
                        <div className="relative inline-block overflow-hidden rounded-full group">
                          <button
                            onClick={handleMissedSubmit}
                            disabled={!missedFeedback.trim()}
                            className="relative text-xs text-stone-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors px-4 py-1.5 rounded-full border border-stone-700/50 hover:border-stone-500 bg-stone-900/60 hover:text-white overflow-hidden"
                          >
                            {/* Hover fill slide */}
                            <span className="absolute inset-0 bg-stone-700/40 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out pointer-events-none" />
                            <span className="relative">Submit</span>
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="thanks"
                        initial={{ opacity: 0, y: 6, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                        className="flex items-center gap-2 text-sm text-stone-400"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.1 }}
                        >
                          <CheckCircle size={14} className="text-emerald-400" />
                        </motion.div>
                        <span>Heard. Create an account and I'll incorporate this as your portrait develops.</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Account CTA — elevated dark gradient card */}
                <div className="rounded-2xl border border-stone-700/30 overflow-hidden" style={{
                  background: 'linear-gradient(135deg, rgba(28,25,23,0.95) 0%, rgba(12,10,9,0.98) 100%)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
                }}>
                  {/* Subtle noise texture overlay */}
                  <div className="absolute inset-0 opacity-[0.015] pointer-events-none rounded-2xl"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    }}
                  />
                  <div className="relative px-6 py-5 flex items-center gap-5">
                    {/* Left: icon + copy */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-stone-800/80 border border-stone-700/60 flex items-center justify-center shrink-0 mt-0.5">
                        <UserPlus size={16} className="text-stone-300" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-stone-100 text-sm font-semibold mb-0.5">This is your Day 1 portrait.</p>
                        <p className="text-stone-500 text-xs leading-relaxed mb-1">
                          The mirror remembers. Every session deepens the picture.
                        </p>
                        <p className="text-stone-600 text-[10px]">Join practitioners deepening their practice</p>
                      </div>
                    </div>

                    {/* Right: CTA button */}
                    <div className="shrink-0">
                      <div className="relative overflow-hidden rounded-xl group">
                        <button className="relative flex items-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-white text-stone-900 text-sm font-semibold transition-colors">
                          {/* Shimmer sweep */}
                          <span
                            className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none"
                            style={{
                              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                            }}
                          />
                          <UserPlus size={14} />
                          <span className="relative">$5/mo</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* 3. Cross-Modal Pattern — hidden on first session */}
          {!isFirstSession && (
            <CrossModalPatternsSection
              integratedInsights={integratedInsights}
              allPractices={allPractices}
              onAddPractice={handleAddPracticeToStack}
            />
          )}

          {/* 4–6 + Pattern-Based: hidden on first session — portrait is enough */}
          {!isFirstSession && (<><section>
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-5">Recommended Next Steps</p>
            <div className="space-y-4">

              {/* Next Wizard */}
              {intelligentGuidance.recommendations.nextWizard && (
                <div className="bg-white/[0.02] border border-slate-700/60 rounded-lg p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-base font-semibold text-slate-100">{intelligentGuidance.recommendations.nextWizard.name}</h4>
                    <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                      intelligentGuidance.recommendations.nextWizard.priority === 'high'
                        ? 'bg-red-500/15 text-red-300'
                        : intelligentGuidance.recommendations.nextWizard.priority === 'medium'
                          ? 'bg-amber-500/15 text-amber-300'
                          : 'bg-teal-500/15 text-teal-300'
                    }`}>
                      {intelligentGuidance.recommendations.nextWizard.priority}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mb-1"><span className="text-slate-300">Why:</span> {intelligentGuidance.recommendations.nextWizard.reason}</p>
                  <p className="text-sm text-slate-400"><span className="text-slate-300">Focus on:</span> {intelligentGuidance.recommendations.nextWizard.focus}</p>
                </div>
              )}

              {/* Practice Changes */}
              {intelligentGuidance.recommendations.practiceChanges?.add && intelligentGuidance.recommendations.practiceChanges.add.length > 0 && (
                <div className="space-y-3">
                  {intelligentGuidance.recommendations.practiceChanges.add.map((rec, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => rec.practice && handlePracticeClick(rec.practice.id)}
                      className="w-full text-left bg-white/[0.02] hover:bg-white/[0.04] border border-slate-700/60 hover:border-slate-600 rounded-lg p-4 transition group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-baseline gap-2">
                          {rec.sequenceWeek && (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-500/15 text-purple-300 text-xs font-bold">
                              {rec.sequenceWeek}
                            </span>
                          )}
                          <h5 className="font-medium text-slate-100 group-hover:text-purple-300 transition-colors">
                            {rec.practice?.name || 'Practice'}
                          </h5>
                        </div>
                        <div className="flex items-center gap-2">
                          {rec.practice && (
                            <TransparencyButton
                              recommendationId={`practice-${idx}-${rec.practice.name.toLowerCase().replace(/\s+/g, '-')}`}
                              practiceName={rec.practice.name}
                              variant="inline"
                              size="sm"
                            />
                          )}
                          <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                            rec.priority === 'high' ? 'bg-red-500/15 text-red-300' :
                            rec.priority === 'medium' ? 'bg-amber-500/15 text-amber-300' :
                            'bg-teal-500/15 text-teal-300'
                          }`}>
                            {rec.priority}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-slate-400 mb-3">{rec.reason}</p>

                      {(rec.sequenceGuidance || rec.timeCommitment || rec.expectedBenefits) && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                          {rec.sequenceGuidance && (
                            <div className="flex items-start gap-2 text-xs">
                              <Target size={12} className="text-slate-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-slate-500">When to Start</p>
                                <p className="text-slate-300">{rec.sequenceGuidance}</p>
                              </div>
                            </div>
                          )}
                          {rec.timeCommitment && (
                            <div className="flex items-start gap-2 text-xs">
                              <Clock size={12} className="text-slate-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-slate-500">Time</p>
                                <p className="text-slate-300">{rec.timeCommitment}</p>
                              </div>
                            </div>
                          )}
                          {rec.expectedBenefits && (
                            <div className="flex items-start gap-2 text-xs">
                              <Zap size={12} className="text-slate-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-slate-500">Expected</p>
                                <p className="text-slate-300">{rec.expectedBenefits}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {rec.microHabit && (
                        <div className="bg-emerald-900/10 border border-emerald-700/20 rounded p-2.5 mb-2.5 flex items-start gap-2">
                          <Zap size={13} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-emerald-400 font-medium mb-0.5">Micro-habit (&lt;2 min)</p>
                            <p className="text-xs text-emerald-100/80">{rec.microHabit}</p>
                          </div>
                        </div>
                      )}

                      {rec.integrationTips && (
                        <div className="bg-slate-800/40 rounded p-2.5 mb-2.5">
                          <p className="text-xs text-slate-500 font-medium mb-0.5">Integration tips</p>
                          <p className="text-xs text-slate-400">{rec.integrationTips}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-end">
                        <ArrowRight size={14} className="text-slate-600 group-hover:text-purple-400 transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Insight Work */}
              {intelligentGuidance.recommendations.insightWork && (
                <div className="bg-white/[0.02] border border-slate-700/60 rounded-lg p-4">
                  <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Pattern to Work With</p>
                  <p className="text-sm text-slate-200 font-medium mb-1">{stripCitations(intelligentGuidance.recommendations.insightWork.pattern)}</p>
                  <p className="text-sm text-slate-400">{stripCitations(intelligentGuidance.recommendations.insightWork.approachSuggestion)}</p>
                </div>
              )}
            </div>
          </section>

          {/* 5. Reasoning — collapsible */}
          {(intelligentGuidance.reasoning.whatINoticed.length > 0 || intelligentGuidance.reasoning.howItConnects.length > 0) && (
            <section>
              <button
                type="button"
                onClick={() => setReasoningOpen(v => !v)}
                className="flex items-center gap-2 text-xs uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors"
              >
                {reasoningOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                How It All Connects
              </button>
              {reasoningOpen && (
                <div className="mt-4 space-y-4 text-sm pl-1">
                  {intelligentGuidance.reasoning.whatINoticed.length > 0 && (
                    <div>
                      <p className="text-slate-500 text-xs uppercase tracking-widest mb-2">What I Noticed</p>
                      <ul className="space-y-1.5">
                        {intelligentGuidance.reasoning.whatINoticed.map((item, idx) => (
                          <li key={idx} className="text-slate-400 flex items-start gap-2">
                            <span className="text-slate-600 mt-1">–</span>
                            {stripCitations(item)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {intelligentGuidance.reasoning.howItConnects.length > 0 && (
                    <div>
                      <p className="text-slate-500 text-xs uppercase tracking-widest mb-2">Connections</p>
                      <ul className="space-y-1.5">
                        {intelligentGuidance.reasoning.howItConnects.map((item, idx) => (
                          <li key={idx} className="text-slate-400 flex items-start gap-2">
                            <span className="text-slate-600 mt-1">–</span>
                            {stripCitations(item)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* 6. Cautions — inline, subtle */}
          {intelligentGuidance.cautions && intelligentGuidance.cautions.length > 0 && (
            <section>
              <div className="flex items-start gap-3 text-sm">
                <AlertTriangle size={14} className="text-amber-500/60 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Cautions</p>
                  <ul className="space-y-1">
                    {intelligentGuidance.cautions.map((caution, idx) => (
                      <li key={idx} className="text-slate-500">{stripCitations(caution)}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          )}

          <p className="text-xs text-slate-600">
            Generated {new Date(intelligentGuidance.generatedAt).toLocaleString()} · cached 24 h
          </p>
          </>)}
        </>
      )}

      <SectionDivider />

      {/* Pattern-Based Recommendations — hidden on first session */}
      {!isFirstSession && pendingInsights.length > 0 && (
        <section>
          <p className="text-xs uppercase tracking-widest text-slate-500 mb-5">Pattern-Based Recommendations</p>
          <VirtualizedInsightList
            items={pendingInsights}
            renderItem={(insight) => (
              <div key={insight.id} className="bg-white/[0.02] border border-slate-700/60 rounded-lg p-5 mb-4">
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-semibold text-slate-100">{insight.mindToolName}</h3>
                    <span className="text-xs font-mono bg-teal-500/15 text-teal-300 px-2 py-0.5 rounded">
                      {insight.mindToolType}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 border-l-2 border-teal-500/40 pl-3">
                    {insight.detectedPattern}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {insight.suggestedShadowWork.length > 0 && (
                    <div>
                      <h4 className="text-xs uppercase tracking-widest text-slate-500 mb-3">Reflect</h4>
                      <div className="space-y-2">
                        {insight.suggestedShadowWork.map((sw, swIdx) => {
                          const practice = allPractices.find(p => p.id === sw.practiceId);
                          return practice ? (
                            <button
                              key={sw.practiceId}
                              type="button"
                              onClick={() => handlePracticeClick(sw.practiceId, insight.id)}
                              className="w-full text-left p-3 bg-white/[0.02] hover:bg-white/[0.04] rounded border border-slate-700/40 hover:border-teal-500/30 transition group"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-slate-200 group-hover:text-teal-300 transition-colors">{sw.practiceName}</p>
                                  <p className="text-xs text-slate-500 mt-0.5">{sw.rationale}</p>
                                </div>
                                <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                                  <TransparencyButton
                                    recommendationId={`insight-${insight.id}-shadow-${swIdx}`}
                                    practiceName={sw.practiceName}
                                    variant="icon"
                                    size="sm"
                                  />
                                  <ArrowRight size={13} className="text-slate-600 group-hover:text-teal-400 transition-colors" />
                                </div>
                              </div>
                            </button>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}

                  {insight.suggestedNextSteps.length > 0 && (
                    <div>
                      <h4 className="text-xs uppercase tracking-widest text-slate-500 mb-3">Act</h4>
                      <div className="space-y-2">
                        {insight.suggestedNextSteps.map((ns, nsIdx) => {
                          const practice = allPractices.find(p => p.id === ns.practiceId);
                          return practice ? (
                            <button
                              key={ns.practiceId}
                              type="button"
                              onClick={() => handlePracticeClick(ns.practiceId, insight.id)}
                              className="w-full text-left p-3 bg-white/[0.02] hover:bg-white/[0.04] rounded border border-slate-700/40 hover:border-green-500/30 transition group"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-slate-200 group-hover:text-green-300 transition-colors">{ns.practiceName}</p>
                                  <p className="text-xs text-slate-500 mt-0.5">{ns.rationale}</p>
                                </div>
                                <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                                  <TransparencyButton
                                    recommendationId={`insight-${insight.id}-next-${nsIdx}`}
                                    practiceName={ns.practiceName}
                                    variant="icon"
                                    size="sm"
                                  />
                                  <ArrowRight size={13} className="text-slate-600 group-hover:text-green-400 transition-colors" />
                                </div>
                              </div>
                            </button>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          />
        </section>
      )}

      {/* High-Impact Practices */}
      {highImpactPractices.length > 0 && (
        <section>
          <p className="text-xs uppercase tracking-widest text-slate-500 mb-5">High-Impact Practices</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {highImpactPractices.map((practice) => (
              <button
                key={practice.id}
                type="button"
                onClick={() => handlePracticeClick(practice.id)}
                className="text-left p-4 bg-white/[0.02] hover:bg-white/[0.04] rounded-lg border border-slate-700/60 hover:border-slate-600 transition group"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h4 className="text-sm font-semibold text-slate-100 group-hover:text-accent transition-colors">{practice.name}</h4>
                  <span className="text-xs font-mono bg-accent/15 text-accent px-2 py-0.5 rounded whitespace-nowrap">
                    {practice.patternCount} patterns
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2">{practice.description}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Adaptive Body Plan — lowest priority */}
      {personalizationSummary && personalizationSummary.adjustmentDirectives && personalizationSummary.adjustmentDirectives.length > 0 && (
        <section>
          <p className="text-xs uppercase tracking-widest text-slate-500 mb-5">Adaptive Body Plan</p>
          <div className="space-y-3">
            {personalizationSummary.adjustmentDirectives.map((directive, idx) => (
              <div
                key={idx}
                className={`bg-white/[0.02] border rounded-lg p-4 ${
                  directive.impact === 'high'
                    ? 'border-red-500/30'
                    : directive.impact === 'medium'
                      ? 'border-amber-500/30'
                      : 'border-teal-500/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-slate-100">{directive.description}</h3>
                      <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                        directive.impact === 'high' ? 'bg-red-500/15 text-red-300' :
                        directive.impact === 'medium' ? 'bg-amber-500/15 text-amber-300' :
                        'bg-teal-500/15 text-teal-300'
                      }`}>
                        {directive.impact}
                      </span>
                      <span className="text-xs text-slate-600">{directive.confidence}% confidence</span>
                    </div>
                    <p className="text-sm text-slate-400">{directive.rationale}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <SectionDivider />
    </div>
  );
}

// Cross-Modal Patterns Section Component
function CrossModalPatternsSection({
  integratedInsights,
  allPractices,
  onAddPractice,
}: {
  integratedInsights: IntegratedInsight[];
  allPractices: AllPractice[];
  onAddPractice: (practice: AllPractice) => void;
}) {
  const [crossModalPattern, setCrossModalPattern] = useState<string>('');
  const [isLoadingPatterns, setIsLoadingPatterns] = useState(false);
  const insightCacheKey = useMemo(
    () => integratedInsights.map(i => i.id).sort().join(','),
    [integratedInsights]
  );
  const lastLoadedKey = React.useRef<string>('');

  useEffect(() => {
    if (insightCacheKey === lastLoadedKey.current) return;

    async function loadPatterns() {
      setIsLoadingPatterns(true);
      try {
        const BODY_TYPES = ['Somatic', 'Bioenergetics', 'Integral Body', 'Workout', 'Meditation', 'Jhana'];
        const MIND_TYPES = ['Subject-Object', 'Polarity', 'Kegan', 'Perspective', 'Adaptive Cycle', 'Bias', 'Decision', 'Schema', 'Immunity', 'Eight Zones', 'Examining'];
        const SPIRIT_TYPES = ['Role Alignment', 'Context AI', 'States', 'Big Mind', 'Attachment'];
        const SHADOW_TYPES = ['IFS', '3-2-1', 'Shadow Journal', 'Relational Pattern', 'Memory Recons'];

        const matchesType = (type: string, keywords: string[]) =>
          keywords.some(kw => type?.toLowerCase().includes(kw.toLowerCase()));

        const bodyInsights = integratedInsights.filter(i => matchesType(i.mindToolType, BODY_TYPES)).map(i => i.detectedPattern).join('; ').substring(0, 500);
        const mindInsights = integratedInsights.filter(i => matchesType(i.mindToolType, MIND_TYPES)).map(i => i.detectedPattern).join('; ').substring(0, 500);
        const spiritInsights = integratedInsights.filter(i => matchesType(i.mindToolType, SPIRIT_TYPES)).map(i => i.detectedPattern).join('; ').substring(0, 500);
        const shadowInsights = integratedInsights.filter(i => matchesType(i.mindToolType, SHADOW_TYPES)).map(i => i.detectedPattern).join('; ').substring(0, 500);

        const priorContext = {
          body: bodyInsights || '(No body practices yet)',
          mind: mindInsights || '(No mind practices yet)',
          spirit: spiritInsights || '(No spirit practices yet)',
          shadow: shadowInsights || '(No shadow practices yet)',
          crossModalPatterns: ''
        };

        const pattern = await detectCrossModalPatternsWithAI(priorContext);
        lastLoadedKey.current = insightCacheKey;
        setCrossModalPattern(pattern);
      } catch (error) {
        console.error('[RecommendationsTab] AI pattern detection failed:', error);
        setCrossModalPattern('');
      } finally {
        setIsLoadingPatterns(false);
      }
    }

    if (integratedInsights.length > 0) {
      loadPatterns();
    } else {
      setCrossModalPattern('');
      lastLoadedKey.current = insightCacheKey;
    }
  }, [insightCacheKey]);

  if (isLoadingPatterns) {
    return (
      <section>
        <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">Cross-Modal Pattern</p>
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <div className="w-3.5 h-3.5 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
          Analyzing patterns across modalities…
        </div>
      </section>
    );
  }

  if (!crossModalPattern || crossModalPattern.trim().length === 0) {
    return null;
  }

  return (
    <section className="border-l-2 border-emerald-500/50 pl-6 py-1">
      <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">Cross-Modal Pattern</p>
      <p className="text-base leading-relaxed text-slate-300">{crossModalPattern}</p>
    </section>
  );
}
