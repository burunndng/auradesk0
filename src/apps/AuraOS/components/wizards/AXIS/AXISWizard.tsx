/**
 * AXIS Wizard
 * State machine managing the full session lifecycle
 *
 * Design: stone-950 base · Violet secondary accent · Shadow/depth identity
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Crosshair, Compass, MessageSquare, BookOpen, CheckCircle, Layers, Eye } from 'lucide-react';
import { LabyrinthPathIcon } from '../../visualizations/SacredGeometryIcons';
import type { AXISSession, AXISActivityType, AXISReflection as AXISReflectionData, AXISConversationMessage, AXISSynthesisBrief, AXISContextData } from '../../../types';
import { useAXISAnchor } from './hooks/useAXISAnchor';
import { useAXISSessions } from './hooks/useAXISSessions';
import { useAXISRPL } from './hooks/useAXISRPL';
import { generateAXISInsight, loadPreviousSynthesis } from '../../../services/AXISService';
import AXISDashboard from './views/AXISDashboard';
import AXISFraming from './views/AXISFraming';
import AXISBridge from './views/AXISBridge';
import AXISWaiting from './views/AXISWaiting';
import AXISReflectionView from './views/AXISReflection';
import AXISClosure from './views/AXISClosure';
import AXISHistory from './views/AXISHistory';
import AXISRPLBanner from './components/AXISRPLBanner';
import AXISModePicker from './views/AXISModePicker';
import AXISLiveSession from './views/AXISLiveSession';
import AXISSynthesis from './views/AXISSynthesis';
import AXISMetaSynthesisView from './views/AXISMetaSynthesis';
import AXISMemoryMap from './views/AXISMemoryMap';

// Logic steps for the wizard state machine
type Step = 'dashboard' | 'anchor-create' | 'mode-picker' | 'framing' | 'bridge' | 'live-session' | 'synthesis' | 'waiting' | 'reflection' | 'closure' | 'history' | 'meta-synthesis' | 'memory-map';

const STEP_LABELS: Record<Step, { label: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = {
  'dashboard': { label: 'Dashboard', icon: Compass },
  'anchor-create': { label: 'Anchor', icon: Crosshair },
  'framing': { label: 'Framing', icon: BookOpen },
  'mode-picker': { label: 'Mode', icon: Layers },
  'bridge': { label: 'Bridge', icon: MessageSquare },
  'live-session': { label: 'Session', icon: MessageSquare },
  'synthesis': { label: 'Synthesis', icon: Eye },
  'waiting': { label: 'Waiting', icon: Compass },
  'reflection': { label: 'Reflection', icon: BookOpen },
  'closure': { label: 'Closure', icon: CheckCircle },
  'history': { label: 'History', icon: LabyrinthPathIcon as unknown as React.ComponentType<{ size?: number; className?: string }> },
  'meta-synthesis': { label: 'Trajectory', icon: Eye },
  'memory-map': { label: 'Memory Map', icon: LabyrinthPathIcon as unknown as React.ComponentType<{ size?: number; className?: string }> },
};

interface AXISWizardProps {
  userId: string;
  authUserId?: string;
  onClose: () => void;
}

export default function AXISWizard({ userId, authUserId, onClose }: AXISWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>('dashboard');
  const [currentSession, setCurrentSession] = useState<AXISSession | null>(null);
  const [isOffAxisMode, setIsOffAxisMode] = useState(false);
  const [dismissedRPL, setDismissedRPL] = useState<any>(null);
  const [contextData, setContextData] = useState<AXISContextData | null>(null);
  const [refinedIntention, setRefinedIntention] = useState('');
  const [preparationHistory, setPreparationHistory] = useState<AXISConversationMessage[]>([]);
  const [conversationHistory, setConversationHistory] = useState<AXISConversationMessage[]>([]);
  const [previousSynthesis, setPreviousSynthesis] = useState<AXISSynthesisBrief | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const axisInsightRef = useRef<import('../../../types').IntegratedInsight | null>(null);
  const [insightGenerating, setInsightGenerating] = useState(false);

  // Data hooks
  const { anchor, hasAnchor, saveAnchor, createAnchor } = useAXISAnchor();
  const {
    sessions = [],
    createSession,
    updateSessionStatus,
    updateRefinedIntention,
    updateSessionData,
    linkInsight
  } = useAXISSessions();

  const lastSessionDate = sessions
    .filter(s => s.status === 'closed' && !s.isOffAxis)
    .sort((a, b) => new Date(b.closedAt ?? b.createdAt).getTime() - new Date(a.closedAt ?? a.createdAt).getTime())[0]?.closedAt;

  const rplTrigger = useAXISRPL(sessions, anchor?.updatedAt, lastSessionDate);

  // Load previous synthesis on mount — auth users from Supabase, anon from localStorage
  useEffect(() => {
    const idToLoad = authUserId || userId;
    loadPreviousSynthesis(idToLoad).then(setPreviousSynthesis).catch(console.error);
  }, [authUserId, userId]);

  // Scroll to top on step change
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [currentStep]);

  // Transition Handlers
  const handleStartFraming = () => {
    setIsOffAxisMode(false);
    setCurrentStep('framing');
  };

  const handleStartOffAxis = () => {
    setIsOffAxisMode(true);
    setCurrentStep('framing');
  };

  const handleFramingComplete = (title: string, intention: string, successCriteria?: string, activityType?: AXISActivityType, contextInfo?: any) => {
    // Atomic update: close old session and create new one in single operation
    if (currentSession) {
      updateSessionStatus(currentSession.id, 'closed');
    }
    const session = createSession(activityType || 'other', title, intention, successCriteria);
    const sessionWithContext = {
      ...session,
      ...(contextInfo ? { contextData: contextInfo } : {}),
      ...(isOffAxisMode ? { isOffAxis: true } : {}),
    };

    // Use functional update to ensure atomic state transition
    setCurrentSession(sessionWithContext);
    setContextData(contextInfo);

    // Explicitly persist contextData and session atomically
    if (contextInfo) {
      updateSessionData(session.id, { contextData: contextInfo });
    }

    if (activityType === 'ai-conversation') {
      setCurrentStep('mode-picker');
    } else {
      setCurrentStep('waiting');
    }
  };

  const handleBridgeComplete = () => {
    setCurrentStep('waiting');
  };

  const handleReadyToReflect = () => {
    setCurrentStep('reflection');
  };

  const handleReflectionComplete = async (reflection?: AXISReflectionData) => {
    if (!currentSession) return;
    try {
      let insight = axisInsightRef.current;
      if (insight && reflection) {
        // Merge user reflection text into the pre-generated insight
        const reflectionText = [
          reflection.salience ? `**What stood out:** ${reflection.salience}` : null,
          reflection.delta ? `**What changed:** ${reflection.delta}` : null,
          reflection.residue ? `**What remains open:** ${reflection.residue}` : null,
          reflection.selfNoticing ? `**Self-noticing:** ${reflection.selfNoticing}` : null,
        ].filter(Boolean).join('\n');
        insight = {
          ...insight,
          mindToolReport: insight.mindToolReport + (reflectionText ? `\n\n---\n\n${reflectionText}` : ''),
        };
      } else if (!insight) {
        // Insight not yet generated — generate now with reflection
        insight = await generateAXISInsight(null, currentSession, userId, authUserId, reflection);
      }
      axisInsightRef.current = null;
      linkInsight(currentSession.id, insight.id);
      updateSessionStatus(currentSession.id, 'reflecting');
      setCurrentStep('closure');
    } catch (e) {
      console.error('[AXIS] Error completing reflection:', e);
    }
  };

  const handleReflectionSkip = () => handleReflectionComplete(undefined);

  const handleCloseSession = () => {
    if (currentSession) {
      updateSessionStatus(currentSession.id, 'closed');
    }
    setCurrentStep('dashboard');
    setCurrentSession(null);
  };

  const handleKeepOpen = () => {
    setCurrentStep('dashboard');
    setCurrentSession(null);
  };

  const handleStartNative = () => {
    // Guard: anchor must exist before entering native flow
    if (!hasAnchor) {
      setCurrentStep('anchor-create');
      return;
    }
    if (currentSession) {
      setCurrentSession({ ...currentSession, refinedIntention: currentSession.intention });
    }
    setRefinedIntention(currentSession?.intention ?? '');
    setCurrentStep('live-session');
  };

  const handlePreparationComplete = (intention: string, history: AXISConversationMessage[]) => {
    setRefinedIntention(intention);
    setPreparationHistory(history);
    if (currentSession) {
      updateRefinedIntention(currentSession.id, intention);
      updateSessionData(currentSession.id, { preparationHistory: history, refinedIntention: intention });
      setCurrentSession({ ...currentSession, refinedIntention: intention });
    }
    setCurrentStep('live-session');
  };

  const handleSessionEnd = (history: AXISConversationMessage[]) => {
    setConversationHistory(history);
    if (currentSession) {
      updateSessionData(currentSession.id, { conversationHistory: history });
    }
    setCurrentStep('synthesis');
  };

  const handleSynthesisComplete = useCallback((brief: AXISSynthesisBrief) => {
    // Capture session ref before clearing state
    const sessionSnap = currentSession;

    if (sessionSnap) {
      updateSessionStatus(sessionSnap.id, 'closed');
    }
    setPreviousSynthesis(brief);

    // Fire AI insight generation immediately after synthesis — result stored in ref
    if (sessionSnap) {
      axisInsightRef.current = null;
      setInsightGenerating(true);
      generateAXISInsight(brief, sessionSnap, userId, authUserId)
        .then(insight => {
          axisInsightRef.current = insight;
        })
        .catch(err => {
          console.error('[AXIS] Pre-generating insight failed:', err);
        })
        .finally(() => {
          setInsightGenerating(false);
        });
    }

    setCurrentSession(null);
    setRefinedIntention('');
    setPreparationHistory([]);
    setConversationHistory([]);

    // Meta-Mirror: trigger after every 5th closed non-off-axis session
    const closedCount = sessions.filter(s => s.status === 'closed' && !s.isOffAxis).length;
    const isMultipleOfFive = closedCount > 0 && closedCount % 5 === 0;
    if (isMultipleOfFive && !sessionSnap?.isOffAxis) {
      setCurrentStep('meta-synthesis');
    } else {
      setCurrentStep('dashboard');
    }
  }, [currentSession, sessions, userId, authUserId, updateSessionStatus]);

  const sessionCount = sessions.filter(s => !s.isOffAxis).length;
  const stepInfo = STEP_LABELS[currentStep];
  const StepIcon = stepInfo.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-stretch bg-stone-950/95 backdrop-blur-md" role="dialog" aria-modal="true">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-violet-500/[0.03] blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-amber-800/5 blur-[80px] rounded-full" />
      </div>

      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-stone-950 border-r border-stone-800/60 p-5">
        {/* Identity */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Crosshair size={20} className="text-violet-400/70" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Shadow Tools</span>
          </div>
          <h1 className="text-lg font-serif font-light text-stone-200 leading-tight">
            AXIS<br />
            <span className="text-stone-500 text-sm">Session Container</span>
          </h1>
        </div>

        {/* Current Phase */}
        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-4`}>
          <StepIcon size={16} className="text-amber-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-semibold font-serif text-amber-300 truncate">{stepInfo.label}</p>
          </div>
        </div>

        {/* Session Stats */}
        <div className="space-y-3 mb-4">
          <div className="px-3 py-2 bg-stone-900/40 rounded-lg border border-stone-700/30">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-600 mb-1">Sessions</p>
            <p className="text-sm font-mono font-bold text-amber-400">{sessionCount}</p>
          </div>
          {anchor && (
            <div className="px-3 py-2 bg-stone-900/40 rounded-lg border border-stone-700/30">
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-600 mb-1">Anchor Mode</p>
              <p className="text-xs text-stone-400 capitalize">{anchor.mode?.replace('-', ' ') || 'General'}</p>
            </div>
          )}
        </div>

        {/* Living Marginalia */}
        <div className="mt-auto pt-4 border-t border-stone-800/50 space-y-3 overflow-y-auto max-h-60">
          {anchor && (
            <div>
              <p className="text-[10px] text-stone-600 uppercase tracking-widest mb-0.5">Anchor</p>
              <p className="text-xs text-violet-300/80 line-clamp-3 leading-relaxed">{anchor.content}</p>
            </div>
          )}
          {currentSession && (
            <div>
              <p className="text-[10px] text-stone-600 uppercase tracking-widest mb-0.5">Current Topic</p>
              <p className="text-xs text-amber-400/80 truncate">{currentSession.title}</p>
            </div>
          )}
          {previousSynthesis?.sessionFindings?.keyInsight && (
            <div>
              <p className="text-[10px] text-stone-600 uppercase tracking-widest mb-0.5">Last Insight</p>
              <p className="text-xs text-stone-400 italic line-clamp-2">"{previousSynthesis.sessionFindings.keyInsight}"</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-5 py-3 border-b border-stone-800/60 shrink-0">
          {/* Mobile step indicator */}
          <div className="flex items-center gap-2 lg:hidden">
            <StepIcon size={16} className="text-amber-500/60" />
            <span className="text-xs text-stone-400 font-serif">{stepInfo.label}</span>
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <Crosshair size={16} className="text-violet-400/60" />
            <span className="text-sm font-serif font-light text-stone-300">AXIS</span>
            <span className="text-stone-700">·</span>
            <span className="text-xs text-stone-500">{stepInfo.label}</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-stone-500 hover:text-stone-200 hover:bg-stone-800/60 transition-all"
            aria-label="Close AXIS wizard"
          >
            <X size={18} />
          </button>
        </header>

        {/* Accessible label for screen readers */}
        <h2 className="sr-only">AXIS Session Wizard</h2>

        {/* View Container */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="max-w-2xl mx-auto px-5 py-8">
            {/* Real-time Practice Lever (RPL) Banner */}
            {currentStep === 'dashboard' && rplTrigger && dismissedRPL !== rplTrigger && (
              <div className="mb-6">
                <AXISRPLBanner
                  trigger={rplTrigger}
                  onDismiss={() => setDismissedRPL(rplTrigger)}
                />
              </div>
            )}

            {currentStep === 'dashboard' && (
              <AXISDashboard
                anchor={anchor}
                hasAnchor={hasAnchor}
                sessionCount={sessions?.length || 0}
                openSessionCount={(sessions || []).filter(s => s.status !== 'closed').length}
                previousSynthesis={previousSynthesis}
                onStartFraming={handleStartFraming}
                onStartNative={handleStartNative}
                onStartOffAxis={handleStartOffAxis}
                onViewHistory={() => setCurrentStep('history')}
                onViewMemoryMap={() => setCurrentStep('memory-map')}
                onCreateAnchor={createAnchor}
                onEditAnchor={saveAnchor}
              />
            )}

            {currentStep === 'framing' && (
              <AXISFraming
                onComplete={handleFramingComplete}
                onBack={() => setCurrentStep('dashboard')}
                previousSynthesis={previousSynthesis}
              />
            )}

            {currentStep === 'bridge' && currentSession && (
              <AXISBridge
                session={currentSession}
                onComplete={handleBridgeComplete}
                onBack={() => setCurrentStep('framing')}
                contextData={contextData}
              />
            )}

            {currentStep === 'mode-picker' && anchor && (
              <AXISModePicker
                previousSynthesis={previousSynthesis}
                onStartNative={handleStartNative}
                onStartBridge={() => setCurrentStep('bridge')}
                onBack={() => setCurrentStep('framing')}
              />
            )}

            {currentStep === 'live-session' && currentSession && anchor && (
              <AXISLiveSession
                anchor={anchor}
                intention={refinedIntention || currentSession.intention}
                successCriteria={currentSession.successCriteria}
                activityType={currentSession.activityType}
                previousSynthesis={previousSynthesis}
                preparationHistory={preparationHistory}
                contextData={contextData}
                sessionCount={sessions.filter(s => s.status === 'closed' && !s.isOffAxis).length}
                lastSessionDate={sessions.filter(s => s.status === 'closed' && !s.isOffAxis).sort((a, b) => new Date(b.closedAt ?? b.createdAt).getTime() - new Date(a.closedAt ?? a.createdAt).getTime())[0]?.closedAt}
                isOffAxis={currentSession?.isOffAxis}
                onSessionEnd={handleSessionEnd}
                onBack={() => setCurrentStep('mode-picker')}
              />
            )}

            {currentStep === 'synthesis' && currentSession && anchor && (
              <AXISSynthesis
                session={{ ...currentSession, preparationHistory }}
                anchor={anchor}
                conversationHistory={conversationHistory}
                userId={authUserId || userId}
                previousSynthesis={previousSynthesis}
                onComplete={handleSynthesisComplete}
              />
            )}

            {currentStep === 'waiting' && currentSession && (
              <AXISWaiting
                session={currentSession}
                onReady={handleReadyToReflect}
                onBack={() => setCurrentStep(currentSession.activityType === 'ai-conversation' ? 'bridge' : 'framing')}
                onCancel={() => {
                  setCurrentStep('dashboard');
                  setCurrentSession(null);
                }}
              />
            )}

            {currentStep === 'reflection' && currentSession && (
              <AXISReflectionView
                session={currentSession}
                anchorMode={anchor?.mode}
                insightGenerating={insightGenerating}
                onComplete={handleReflectionComplete}
                onSkip={handleReflectionSkip}
                onBack={() => setCurrentStep('waiting')}
              />
            )}

            {currentStep === 'closure' && currentSession && (
              <AXISClosure
                session={currentSession}
                onClose={handleCloseSession}
                onKeepOpen={handleKeepOpen}
              />
            )}

            {currentStep === 'history' && (
              <AXISHistory
                sessions={sessions || []}
                onBack={() => setCurrentStep('dashboard')}
                onSelectSession={() => setCurrentStep('dashboard')}
              />
            )}

            {currentStep === 'meta-synthesis' && anchor && (
              <AXISMetaSynthesisView
                sessions={sessions || []}
                anchor={anchor}
                onComplete={() => setCurrentStep('dashboard')}
              />
            )}

            {currentStep === 'memory-map' && (
              <AXISMemoryMap
                anchorId={anchor?.id}
                onBack={() => setCurrentStep('dashboard')}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
