import React, { useState, useEffect, useRef } from 'react';
import {
  DBTMindfulnessIcon,
  DBTDistressToleranceIcon,
  DBTEmotionRegulationIcon,
  DBTInterpersonalIcon,
  DBTCoachMandalaIcon
} from '../visualizations/SacredGeometryIcons/DBTIcons';
import {
  getDBTState,
  saveDBTState,
  createSession,
  addMessageToSession,
  saveSession,
  streamCoachResponse,
  CRISIS_RESOURCES,
  DBT_SKILLS_METADATA,
  autoPopulateDiary,
  addToWallet,
  removeFromWallet,
  getSUDSStats,
  getRecentDiaryEntries,
  assessRisk,
} from '../../services/dbtService';
import type { DBTCoachMode, DBTCoachState, DBTMessage, DBTDiaryEntry, CopingWalletItem, DBTSkill } from '../../types';
import { detectCrisisLevel } from '../../utils/crisisDetection';
import SafetyBanner from '../shared/SafetyBanner';
import { generateInsightFromSession } from '../../services/insightGenerator';

type Phase = 'consent' | 'mode-select' | 'chat' | 'sos' | 'diary' | 'urge-surf' | 'wallet' | 'integration' | 'handoff' | 'complete';
type DiaryStep = 'emotions' | 'urges' | 'skills' | 'effectiveness' | 'notes' | 'review';

const TIPP_STEPS = [
  {
    label: 'Temperature',
    instruction: 'Get cold water — run it over your face or wrists for 30 seconds.',
    detail: 'Cold water triggers your dive reflex and lowers heart rate fast.',
  },
  {
    label: 'Intense Exercise',
    instruction: 'Do 20–30 jumping jacks, run in place, or do push-ups right now.',
    detail: 'Burns off adrenaline. Move your body hard for 1–2 minutes.',
  },
  {
    label: 'Paced Breathing',
    instruction: 'Breathe in for 4 counts. Out for 6 counts. Repeat 5 times.',
    detail: 'Longer exhale activates the parasympathetic system.',
  },
  {
    label: 'Progressive Relaxation',
    instruction: 'Tense each muscle group for 5 seconds, then release. Start with feet.',
    detail: 'Works through: feet → legs → belly → hands → arms → shoulders → face.',
  },
];

const PRESET_EMOTIONS = ['anger', 'fear', 'shame', 'sadness', 'joy', 'disgust', 'anxiety', 'hurt', 'guilt', 'overwhelm'];

interface DBTCoachWizardProps {
  onClose?: () => void;
  userId?: string;
}

function DBTCoachWizard({ onClose, userId }: DBTCoachWizardProps) {
  const [phase, setPhase] = useState<Phase>('consent');
  const [state, setState] = useState<DBTCoachState | null>(null);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // SUDs state
  const [sudsBefore, setSudsBefore] = useState<number>(5);
  const [sudsAfter, setSudsAfter] = useState<number>(5);
  const [showSudsBefore, setShowSudsBefore] = useState(false);
  const [showSudsAfter, setShowSudsAfter] = useState(false);
  const [sudsBeforeSet, setSudsBeforeSet] = useState(false);

  // SOS state
  const [sosTippStep, setSosTippStep] = useState(0);
  const [sosComplete, setSosComplete] = useState(false);
  const [sosSudsBefore, setSosSudsBefore] = useState(5);
  const [sosSudsAfter, setSosSudsAfter] = useState(5);
  const [sosPhaseStep, setSosPhaseStep] = useState<'suds-before' | 'tipp' | 'suds-after' | 'done'>('suds-before');

  // Diary state
  const [diaryStep, setDiaryStep] = useState<DiaryStep>('emotions');
  const [diaryEmotions, setDiaryEmotions] = useState<Array<{ name: string; intensity: 1 | 2 | 3 | 4 | 5 }>>([]);
  const [diaryUrges, setDiaryUrges] = useState<Array<{ description: string; acted: boolean }>>([]);
  const [diarySkills, setDiarySkills] = useState<DBTSkill[]>([]);
  const [diaryEffectiveness, setDiaryEffectiveness] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [diaryNotes, setDiaryNotes] = useState('');
  const [customEmotion, setCustomEmotion] = useState('');
  const [newUrge, setNewUrge] = useState('');

  // Urge surf state
  const [urgeText, setUrgeText] = useState('');
  const [urgeRating, setUrgeRating] = useState(7);
  const [urgeHistory, setUrgeHistory] = useState<Array<{ rating: number; time: string }>>([]);
  const [urgeStarted, setUrgeStarted] = useState(false);
  const [showUrgeCompleteBridge, setShowUrgeCompleteBridge] = useState(false);

  // Wallet UI
  const [showWalletSave, setShowWalletSave] = useState<string | null>(null);
  const [walletLabel, setWalletLabel] = useState('');

  // Crisis detection
  const [crisisLevel, setCrisisLevel] = useState<'none' | 'concern' | 'high'>('none');

  // Integration step
  const [integrationNote, setIntegrationNote] = useState('');

  // Adversarial roleplay
  const [showRoleplayOffer, setShowRoleplayOffer] = useState(false);
  const [inRoleplay, setInRoleplay] = useState(false);

  useEffect(() => {
    try {
      const loaded = getDBTState();
      setState(loaded);
      if (loaded.hasConsented) {
        setPhase('mode-select');
      }
    } catch (err: any) {
      console.error('DBT Coach initialization error:', err);
      setInitError(err?.message || 'Failed to initialize DBT Coach');
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state?.currentSession?.messages.length]);

  // Detect DEAR MAN completion for roleplay offer
  useEffect(() => {
    if (!state?.currentSession || state.currentMode !== 'learn') return;
    const msgs = state.currentSession.messages;
    const lastCoach = [...msgs].reverse().find(m => m.role === 'assistant');
    if (!lastCoach) return;
    const hasRoleplayTrigger = /negotiate|reinforce|assert/i.test(lastCoach.content) &&
      msgs.some(m => m.metadata?.skillTaught === 'dearman');
    if (hasRoleplayTrigger && !showRoleplayOffer && !inRoleplay) {
      setShowRoleplayOffer(true);
    }
  }, [state?.currentSession?.messages.length]);

  const handleConsent = () => {
    if (!state) return;
    const updated = { ...state, hasConsented: true };
    setState(updated);
    saveDBTState(updated);
    setPhase('mode-select');
  };

  const handleModeSelect = (mode: DBTCoachMode) => {
    if (!state) return;
    setCrisisLevel('none');
    const session = createSession(mode);
    const updated = { ...state, currentMode: mode, currentSession: session };
    setState(updated);
    saveDBTState(updated);

    if (mode === 'diary') {
      setDiaryStep('emotions');
      setDiaryEmotions([]);
      setDiaryUrges([]);
      setDiarySkills([]);
      setDiaryEffectiveness(3);
      setDiaryNotes('');
      setPhase('diary');
    } else if (mode === 'sos') {
      setSosPhaseStep('suds-before');
      setSosTippStep(0);
      setSosComplete(false);
      setPhase('sos');
    } else if (mode === 'urge_surf') {
      setUrgeStarted(false);
      setUrgeHistory([]);
      setUrgeRating(7);
      setShowUrgeCompleteBridge(false);
      setPhase('urge-surf');
    } else {
      setShowSudsBefore(true);
      setSudsBeforeSet(false);
      setPhase('chat');
    }
  };

  const handleSendMessage = async (overrideInput?: string) => {
    const input = overrideInput ?? userInput;
    if (!state || !state.currentSession || !input.trim()) return;

    setUserInput('');
    setError(null);
    setStreamingText('');
    setShowRoleplayOffer(false);

    const level = detectCrisisLevel(input);
    setCrisisLevel(level);
    if (level === 'high') {
      return;
    }

    let session = addMessageToSession(state.currentSession, {
      role: 'user',
      content: input,
      metadata: {},
    });
    setState(prev => prev ? { ...prev, currentSession: session } : prev);
    setIsLoading(true);

    const effectiveMode = inRoleplay ? 'learn' : (state.currentMode as DBTCoachMode);

    let systemOverride: string | undefined;
    if (inRoleplay) {
      systemOverride = `You are now roleplaying as the other person in a conversation where the user is practicing DEAR MAN. Be realistic but not abusive — give mild resistance and pushback. After 3-4 exchanges, step out of character and debrief: "What worked? What would you adjust?"`;
    }

    try {
      const risk = await assessRisk(input);
      const diaryCtx = state.currentMode === 'diary'
        ? getRecentDiaryEntries(7).map(e => `${e.date}: emotions=${e.emotions.map(em => em.name).join(',')}, skills=${e.skillsUsed?.join(',') || 'none'}`).join('\n')
        : undefined;
      const fullText = await streamCoachResponse(
        session.messages,
        effectiveMode,
        risk,
        state.profile,
        (chunk) => setStreamingText(prev => prev + chunk),
        systemOverride,
        diaryCtx,
      );

      session = addMessageToSession(session, { role: 'assistant', content: fullText });

      Promise.all([
        saveDBTState({ ...state, currentSession: session }),
        saveSession(session),
      ]).catch(err => console.error('Failed to save:', err));

      setState(prev => prev ? { ...prev, currentSession: session } : prev);
      setStreamingText('');
    } catch (e: any) {
      setError(e.message || 'Failed to process message');
      setStreamingText('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinishSession = () => {
    if (!state || !state.currentSession) return;

    let session = { ...state.currentSession, endTime: new Date().toISOString() };

    if (sudsBeforeSet) {
      session = { ...session, sudsEntry: { before: sudsBefore, after: sudsAfter, timestamp: new Date().toISOString() } };
    }

    autoPopulateDiary(session);

    const updated = {
      ...state,
      currentSession: null,
      sessionHistory: [...state.sessionHistory, session].slice(-75),
    };
    setState(updated);
    saveDBTState(updated);
    saveSession(session);
    setIntegrationNote('');
    setCrisisLevel('none');
    setPhase('integration');

    // Fire-and-forget insight generation
    if (userId && session.messages.length > 2) {
      const userMessages = session.messages.filter(m => m.role === 'user').map(m => m.content);
      const sessionReport = [
        `DBT session mode: ${state.currentMode}`,
        `Skills practiced: ${[...new Set(session.messages.filter(m => m.metadata?.skillTaught).map(m => m.metadata!.skillTaught!))].join(', ') || 'general support'}`,
        `User reflections: ${userMessages.join(' | ')}`,
      ].join('\n');
      generateInsightFromSession({
        wizardType: 'DBT Coach',
        sessionId: session.id,
        sessionName: `DBT Coach — ${state.currentMode} session`,
        sessionReport,
        sessionSummary: `DBT ${state.currentMode} session with ${userMessages.length} exchanges.`,
        userId,
        availablePractices: [],
      }).catch(err => console.warn('[DBTCoach] Insight generation skipped:', err.message));
    }
    setShowSudsBefore(false);
    setShowSudsAfter(false);
    setSudsBeforeSet(false);
  };

  const handleSaveToWallet = (content: string) => {
    if (!state) return;
    const updated = addToWallet(state, { content, sourceMode: state.currentMode, label: walletLabel || undefined });
    setState(updated);
    saveDBTState(updated);
    setShowWalletSave(null);
    setWalletLabel('');
  };

  const handleRemoveFromWallet = (itemId: string) => {
    if (!state) return;
    const updated = removeFromWallet(state, itemId);
    setState(updated);
    saveDBTState(updated);
  };

  const handleSaveDiary = () => {
    if (!state) return;
    const entry: DBTDiaryEntry = {
      id: `diary-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      emotions: diaryEmotions,
      urges: diaryUrges,
      skillsUsed: diarySkills,
      effectiveness: diaryEffectiveness,
      notes: diaryNotes || undefined,
    };
    const updated = { ...state, diaryEntries: [...state.diaryEntries, entry].slice(-365) };
    setState(updated);
    saveDBTState(updated);
    setIntegrationNote('');
    setCrisisLevel('none');
    setPhase('integration');
  };

  const sudsStats = state ? getSUDSStats(state.sessionHistory) : null;

  if (initError) {
    return (
      <div className="fixed inset-0 z-50 bg-stone-950 flex flex-col items-center justify-center p-8 space-y-4" style={{ height: '100dvh' }}>
        <div className="w-20 h-20 bg-rose-950/40 border border-rose-700/30 rounded-full flex items-center justify-center">
          <span className="text-3xl" role="img" aria-label="warning">⚠️</span>
        </div>
        <div className="text-center max-w-sm">
          <h3 className="text-lg font-serif font-bold text-rose-100 mb-2">Initialization Error</h3>
          <p className="text-sm text-slate-400 mb-6">{initError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition-all min-h-[44px]"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="fixed inset-0 z-50 bg-stone-950 flex justify-center items-center" style={{ height: '100dvh' }}>
        <div className="w-20 h-20 bg-gradient-to-br from-purple-600/10 to-purple-600/10 rounded-full flex items-center justify-center animate-pulse">
          <DBTCoachMandalaIcon size={64} color="currentColor" className="text-purple-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-stone-950 text-stone-100 overflow-y-auto" style={{ height: '100dvh' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-stone-950/90 backdrop-blur-md border-b border-purple-500/20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DBTCoachMandalaIcon size={28} color="currentColor" className="text-purple-400" />
            <h1 className="font-serif text-lg sm:text-xl font-bold text-stone-100">DBT Skills Coach</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Wallet button */}
            {phase !== 'sos' && (
              <button
                onClick={() => setPhase('wallet')}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-800/60 hover:bg-stone-700 text-stone-400 hover:text-amber-300 transition-colors min-h-[44px] min-w-[44px]"
                aria-label="Coping Wallet"
                title="Coping Wallet"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </button>
            )}
            <button
              onClick={() => onClose?.()}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-800/60 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition-colors min-h-[44px] min-w-[44px]"
              aria-label="Close DBT Coach"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* SOS persistent button — visible from chat and mode-select */}
      {(phase === 'chat' || phase === 'mode-select') && (
        <div className="fixed bottom-6 right-4 z-20">
          <button
            onClick={() => handleModeSelect('sos')}
            className="px-4 py-3 bg-rose-700 hover:bg-rose-600 text-white rounded-full font-bold text-sm shadow-lg shadow-rose-900/50 min-h-[44px] border border-rose-500/40 transition-all"
            aria-label="SOS — Emergency distress support"
          >
            SOS
          </button>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* ═══ CONSENT ═══ */}
        {phase === 'consent' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-600/15 to-purple-600/15 border border-purple-500/20 rounded-full flex items-center justify-center">
                <DBTCoachMandalaIcon size={72} color="currentColor" className="text-purple-400" />
              </div>
            </div>

            <div className="text-center mb-2">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-100 mb-2">
                Welcome to DBT Skills Coach
              </h2>
              <p className="text-sm sm:text-base text-stone-400 max-w-md mx-auto">
                Learn and practice evidence-based Dialectical Behavior Therapy skills
              </p>
            </div>

            <div className="bg-purple-950/30 border border-purple-700/30 rounded-2xl p-5 sm:p-6">
              <h3 className="text-base font-serif font-semibold text-purple-200 mb-3">What I can help with</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm text-stone-300">
                {['Teach evidence-based coping skills', 'Guide you through practice techniques', 'Track progress with diary cards', 'SOS support for high distress moments'].map(item => (
                  <div key={item} className="flex items-start gap-2.5">
                    <span className="text-purple-500 mt-0.5 flex-shrink-0">·</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-rose-950/20 border border-rose-800/30 rounded-2xl p-5 sm:p-6">
              <h3 className="text-base font-serif font-semibold text-rose-200 mb-3">Important Limitations</h3>
              <ul className="space-y-2 text-sm text-stone-400">
                {[
                  "I'm not a therapist or mental health professional",
                  "I cannot diagnose conditions or prescribe treatment",
                  <span key="crisis">In crisis, contact <strong className="text-rose-300">988 Suicide & Crisis Lifeline</strong></span>,
                  "All data stays private in your browser",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="text-rose-600 mt-0.5 flex-shrink-0">·</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={handleConsent}
              className="w-full py-3.5 bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-600 hover:to-purple-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-purple-900/30 min-h-[44px]"
            >
              I Understand — Begin
            </button>
          </div>
        )}

        {/* ═══ MODE SELECT ═══ */}
        {phase === 'mode-select' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="mb-4">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-100 mb-1">What's happening right now?</h2>
              <p className="text-sm text-stone-500">Choose what fits your moment</p>
            </div>

            {[
              { mode: 'cope_now' as DBTCoachMode, icon: DBTDistressToleranceIcon, title: 'I need to cope — now', desc: 'High distress, need skills immediately', color: 'rose', border: 'border-rose-500/30 hover:border-rose-400/50', iconColor: 'text-rose-400', titleColor: 'text-rose-300', glow: 'hover:shadow-rose-500/10' },
              { mode: 'learn' as DBTCoachMode, icon: DBTMindfulnessIcon, title: 'Learn or practice a skill', desc: 'Explore DBT skills at your own pace', color: 'purple', border: 'border-purple-500/30 hover:border-purple-400/50', iconColor: 'text-purple-400', titleColor: 'text-purple-300', glow: 'hover:shadow-purple-500/10' },
              { mode: 'urge_surf' as DBTCoachMode, icon: DBTDistressToleranceIcon, title: 'Ride an urge', desc: 'Surf through without acting on it', color: 'teal', border: 'border-teal-500/30 hover:border-teal-400/50', iconColor: 'text-teal-400', titleColor: 'text-teal-300', glow: 'hover:shadow-teal-500/10' },
              { mode: 'diary' as DBTCoachMode, icon: DBTEmotionRegulationIcon, title: 'Diary card', desc: 'Track emotions, urges, and skills used today', color: 'indigo', border: 'border-purple-500/30 hover:border-purple-400/50', iconColor: 'text-purple-400', titleColor: 'text-purple-300', glow: 'hover:shadow-indigo-500/10' },
              { mode: 'chain_analysis' as DBTCoachMode, icon: DBTInterpersonalIcon, title: 'Chain analysis', desc: 'Understand a challenging behavior step-by-step', color: 'violet', border: 'border-violet-500/30 hover:border-violet-400/50', iconColor: 'text-violet-400', titleColor: 'text-violet-300', glow: 'hover:shadow-violet-500/10' },
            ].map(({ mode, icon: Icon, title, desc, border, iconColor, titleColor, glow }) => (
              <button
                key={mode}
                onClick={() => handleModeSelect(mode)}
                className={`w-full p-5 sm:p-6 bg-stone-900/60 border ${border} rounded-2xl text-left transition-all duration-200 hover:bg-stone-900/80 hover:shadow-lg ${glow} group`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-stone-800/50 rounded-xl group-hover:bg-stone-800/80 transition-colors">
                    <Icon size={32} color="currentColor" className={iconColor} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-base sm:text-lg font-serif font-bold ${titleColor} mb-0.5`}>{title}</h3>
                    <p className="text-sm text-stone-500 group-hover:text-stone-400 transition-colors">{desc}</p>
                  </div>
                  <svg className="w-5 h-5 text-stone-600 group-hover:text-stone-400 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}

            {/* SUDs stats summary */}
            {sudsStats && (
              <div className="mt-2 p-4 bg-emerald-950/20 border border-emerald-800/20 rounded-xl">
                <p className="text-xs text-emerald-400">
                  TIPP has reduced your distress by an average of <strong>{sudsStats.avgReduction} points</strong> across {sudsStats.sampleSize} sessions.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ═══ SOS PHASE ═══ */}
        {phase === 'sos' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Crisis footer — always visible */}
            <div className="p-3 bg-rose-950/40 border border-rose-800/30 rounded-xl text-center">
              <p className="text-xs text-rose-300 font-medium">
                {CRISIS_RESOURCES.primary.name} — <strong>{CRISIS_RESOURCES.primary.action}</strong> &nbsp;·&nbsp; Text HOME to 741741
              </p>
            </div>

            {sosPhaseStep === 'suds-before' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="font-serif text-2xl font-bold text-rose-100 mb-2">You're safe. I'm here.</h2>
                  <p className="text-sm text-stone-400">Rate your distress right now.</p>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs text-stone-500">
                    <span>Calm</span>
                    <span>Overwhelming</span>
                  </div>
                  <input
                    type="range" min={1} max={10} value={sosSudsBefore}
                    onChange={e => setSosSudsBefore(Number(e.target.value))}
                    className="w-full accent-rose-500"
                  />
                  <div className="text-center">
                    <span className="text-3xl font-bold text-rose-300">{sosSudsBefore}</span>
                    <span className="text-stone-500 text-sm"> / 10</span>
                  </div>
                </div>
                <button
                  onClick={() => setSosPhaseStep('tipp')}
                  className="w-full py-4 bg-rose-700 hover:bg-rose-600 text-white rounded-xl font-bold text-lg transition-all min-h-[52px]"
                >
                  Let's work through this →
                </button>
              </div>
            )}

            {sosPhaseStep === 'tipp' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-stone-500 uppercase tracking-wider">TIPP — Step {sosTippStep + 1} of {TIPP_STEPS.length}</span>
                  <div className="flex gap-1.5">
                    {TIPP_STEPS.map((_, i) => (
                      <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i <= sosTippStep ? 'bg-rose-400' : 'bg-stone-700'}`} />
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-rose-950/30 border border-rose-700/30 rounded-2xl space-y-3">
                  <h3 className="font-serif text-xl font-bold text-rose-100">{TIPP_STEPS[sosTippStep].label}</h3>
                  <p className="text-base text-stone-200 leading-relaxed">{TIPP_STEPS[sosTippStep].instruction}</p>
                  <p className="text-xs text-stone-500 italic">{TIPP_STEPS[sosTippStep].detail}</p>
                </div>

                {sosTippStep < TIPP_STEPS.length - 1 ? (
                  <button
                    onClick={() => setSosTippStep(prev => prev + 1)}
                    className="w-full py-4 bg-rose-700 hover:bg-rose-600 text-white rounded-xl font-bold text-base transition-all min-h-[52px]"
                  >
                    Done — next step →
                  </button>
                ) : (
                  <button
                    onClick={() => setSosPhaseStep('suds-after')}
                    className="w-full py-4 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold text-base transition-all min-h-[52px]"
                  >
                    I've completed TIPP — how did it go?
                  </button>
                )}

                <button
                  onClick={() => setSosPhaseStep('suds-after')}
                  className="w-full py-2.5 text-stone-500 hover:text-stone-400 text-sm transition-colors"
                >
                  Skip to check-in
                </button>
              </div>
            )}

            {sosPhaseStep === 'suds-after' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="font-serif text-xl font-bold text-stone-100 mb-2">How intense is it now?</h2>
                  <p className="text-sm text-stone-500">Before: {sosSudsBefore}/10</p>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs text-stone-500">
                    <span>Calm</span>
                    <span>Overwhelming</span>
                  </div>
                  <input
                    type="range" min={1} max={10} value={sosSudsAfter}
                    onChange={e => setSosSudsAfter(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                  <div className="text-center">
                    <span className="text-3xl font-bold text-emerald-300">{sosSudsAfter}</span>
                    <span className="text-stone-500 text-sm"> / 10</span>
                  </div>
                </div>
                {sosSudsBefore - sosSudsAfter > 0 && (
                  <p className="text-center text-sm text-emerald-400">
                    That's a {sosSudsBefore - sosSudsAfter}-point reduction. You did that.
                  </p>
                )}
                <button
                  onClick={() => {
                    // Save SOS session
                    if (state?.currentSession) {
                      const session = {
                        ...state.currentSession,
                        endTime: new Date().toISOString(),
                        sudsEntry: { before: sosSudsBefore, after: sosSudsAfter, timestamp: new Date().toISOString() },
                      };
                      const updated = {
                        ...state,
                        currentSession: null,
                        sessionHistory: [...state.sessionHistory, session].slice(-75),
                      };
                      setState(updated);
                      saveDBTState(updated);
                      saveSession(session);
                    }
                    setSosPhaseStep('done');
                  }}
                  className="w-full py-4 bg-purple-700 hover:bg-purple-600 text-white rounded-xl font-bold transition-all min-h-[52px]"
                >
                  Save and continue
                </button>
              </div>
            )}

            {sosPhaseStep === 'done' && (
              <div className="space-y-6 text-center py-4">
                <div className="w-20 h-20 bg-emerald-950/30 border border-emerald-700/20 rounded-full flex items-center justify-center mx-auto">
                  <DBTCoachMandalaIcon size={56} color="currentColor" className="text-emerald-400" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-bold text-stone-100 mb-2">You got through it.</h2>
                  <p className="text-sm text-stone-400 max-w-xs mx-auto">The wave passed. Your nervous system did its job.</p>
                </div>
                <div className="flex gap-3 max-w-sm mx-auto">
                  <button
                    onClick={() => setPhase('mode-select')}
                    className="flex-1 py-3 bg-purple-700 hover:bg-purple-600 text-white rounded-xl font-medium transition-all min-h-[44px]"
                  >
                    Continue
                  </button>
                  <button
                    onClick={() => onClose?.()}
                    className="flex-1 py-3 bg-stone-800/60 hover:bg-stone-700/60 text-stone-400 border border-stone-700/30 rounded-xl transition-all min-h-[44px]"
                  >
                    Exit
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ CHAT ═══ */}
        {phase === 'chat' && state.currentSession && (
          <div className="flex flex-col" style={{ height: 'calc(100dvh - 120px)' }}>
            {/* Crisis banner */}
            {crisisLevel !== 'none' && <SafetyBanner crisisLevel={crisisLevel} />}

            {/* SUDs before — shown at start */}
            {showSudsBefore && !sudsBeforeSet && (
              <div className="mb-4 p-4 bg-stone-900/60 border border-stone-700/40 rounded-xl space-y-3">
                <p className="text-xs text-stone-400 font-medium">How intense is your distress right now? (1 = calm, 10 = overwhelming)</p>
                <div className="flex items-center gap-3">
                  <input
                    type="range" min={1} max={10} value={sudsBefore}
                    onChange={e => setSudsBefore(Number(e.target.value))}
                    className="flex-1 accent-purple-500"
                  />
                  <span className="text-lg font-bold text-purple-300 w-8 text-center">{sudsBefore}</span>
                </div>
                <button
                  onClick={() => { setSudsBeforeSet(true); setShowSudsBefore(false); }}
                  className="w-full py-2 bg-purple-700/60 hover:bg-purple-600/60 text-purple-200 rounded-lg text-sm transition-all min-h-[40px]"
                >
                  Set baseline
                </button>
              </div>
            )}

            {/* Mode indicator */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">
                  {state.currentMode === 'cope_now' ? 'Cope Now' : state.currentMode === 'learn' ? 'Learn Skills' : 'Chain Analysis'}
                </span>
                {inRoleplay && <span className="text-xs text-amber-400 font-medium">[Roleplay active]</span>}
              </div>
              <span className="text-xs text-stone-600">{state.currentSession.messages.length} messages</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto rounded-2xl bg-stone-900/40 border border-stone-800/50 p-4 space-y-4 mb-4">
              {state.currentSession.messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600/10 to-purple-600/10 rounded-full flex items-center justify-center mb-4">
                    <DBTMindfulnessIcon size={48} color="currentColor" className="text-purple-400" />
                  </div>
                  <p className="text-stone-400 text-sm max-w-xs">
                    {state.currentMode === 'cope_now'
                      ? "What's happening right now? I'm here to help you through this."
                      : "What would you like to work on today?"}
                  </p>
                </div>
              ) : (
                <>
                  {state.currentSession.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3.5 rounded-xl group ${msg.role === 'user'
                          ? 'bg-purple-900/30 ml-6 sm:ml-12 border border-purple-500/20'
                          : 'bg-stone-800/50 mr-6 sm:mr-12 border border-stone-700/30'
                        }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className={`text-[10px] font-medium uppercase tracking-wider ${msg.role === 'user' ? 'text-purple-400' : 'text-stone-500'
                          }`}>
                          {msg.role === 'user' ? 'You' : inRoleplay ? 'Them' : 'Coach'}
                        </span>
                        {msg.role === 'assistant' && (
                          <button
                            onClick={() => setShowWalletSave(msg.content)}
                            className="opacity-0 group-hover:opacity-100 text-[10px] text-stone-600 hover:text-amber-400 transition-all"
                            title="Save to Wallet"
                          >
                            + wallet
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-stone-200 whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      {msg.metadata?.skillTaught && (
                        <div className="mt-2.5 pt-2 border-t border-purple-500/15 flex items-center gap-1.5">
                          <DBTMindfulnessIcon size={14} color="currentColor" className="text-purple-400" />
                          <span className="text-xs text-purple-300/80">
                            {DBT_SKILLS_METADATA[msg.metadata.skillTaught]?.name || msg.metadata.skillTaught}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Streaming */}
                  {isLoading && streamingText && (
                    <div className="p-3.5 rounded-xl bg-stone-800/50 mr-6 sm:mr-12 border border-stone-700/30">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-stone-500">Coach</span>
                      </div>
                      <p className="text-sm text-stone-200 whitespace-pre-wrap leading-relaxed">{streamingText}</p>
                    </div>
                  )}
                  {isLoading && !streamingText && (
                    <div className="p-3.5 rounded-xl bg-stone-800/50 mr-6 sm:mr-12 border border-stone-700/30">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse [animation-delay:150ms]" />
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse [animation-delay:300ms]" />
                      </div>
                    </div>
                  )}

                  {/* Roleplay offer */}
                  {showRoleplayOffer && !inRoleplay && (
                    <div className="p-4 bg-amber-950/30 border border-amber-700/30 rounded-xl space-y-3">
                      <p className="text-sm text-amber-200 font-medium">Want to practice? I'll roleplay the other person.</p>
                      <p className="text-xs text-stone-500">Realistic pushback, not abusive. Debrief after 3-4 exchanges.</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setInRoleplay(true); setShowRoleplayOffer(false); handleSendMessage("Let's do the roleplay. Start as the other person."); }}
                          className="flex-1 py-2 bg-amber-700/60 hover:bg-amber-600/60 text-amber-200 rounded-lg text-sm transition-all min-h-[40px]"
                        >
                          Yes, let's practice
                        </button>
                        <button
                          onClick={() => setShowRoleplayOffer(false)}
                          className="flex-1 py-2 bg-stone-800/60 text-stone-500 rounded-lg text-sm transition-all min-h-[40px]"
                        >
                          Skip
                        </button>
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </>
              )}
            </div>

            {/* Wallet save modal */}
            {showWalletSave && (
              <div className="mb-3 p-3 bg-stone-800/80 border border-amber-700/30 rounded-xl space-y-2">
                <p className="text-xs text-amber-300 font-medium">Save to Coping Wallet</p>
                <input
                  type="text"
                  value={walletLabel}
                  onChange={e => setWalletLabel(e.target.value)}
                  placeholder="Label (optional)"
                  className="w-full p-2 bg-stone-900 border border-stone-700/50 rounded-lg text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveToWallet(showWalletSave)}
                    className="flex-1 py-2 bg-amber-700/60 hover:bg-amber-600/60 text-amber-200 rounded-lg text-sm transition-all min-h-[40px]"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => { setShowWalletSave(null); setWalletLabel(''); }}
                    className="flex-1 py-2 bg-stone-700/60 text-stone-400 rounded-lg text-sm transition-all min-h-[40px]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-3 mb-3 bg-rose-950/40 border border-rose-800/30 rounded-xl text-sm text-rose-300">
                {error}
              </div>
            )}

            {/* SUDs after — shown before finish */}
            {showSudsAfter && sudsBeforeSet && (
              <div className="mb-3 p-4 bg-stone-900/60 border border-stone-700/40 rounded-xl space-y-3">
                <p className="text-xs text-stone-400 font-medium">Distress now? (before: {sudsBefore}/10)</p>
                <div className="flex items-center gap-3">
                  <input
                    type="range" min={1} max={10} value={sudsAfter}
                    onChange={e => setSudsAfter(Number(e.target.value))}
                    className="flex-1 accent-emerald-500"
                  />
                  <span className="text-lg font-bold text-emerald-300 w-8 text-center">{sudsAfter}</span>
                </div>
                <button
                  onClick={() => { setShowSudsAfter(false); handleFinishSession(); }}
                  className="w-full py-2 bg-emerald-700/60 hover:bg-emerald-600/60 text-emerald-200 rounded-lg text-sm transition-all min-h-[40px]"
                >
                  Finish session
                </button>
              </div>
            )}

            {/* Input */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 p-3.5 bg-stone-900/80 border border-stone-700/50 rounded-xl text-stone-100 placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all min-h-[44px]"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !userInput.trim()}
                className="px-5 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-stone-800 disabled:text-stone-600 text-white rounded-xl font-medium transition-all min-h-[44px] min-w-[72px]"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-purple-300/30 border-t-purple-300 rounded-full animate-spin mx-auto" />
                ) : 'Send'}
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setPhase('mode-select')}
                className="flex-1 py-2.5 bg-stone-800/60 hover:bg-stone-700/60 text-stone-400 hover:text-stone-300 border border-stone-700/30 rounded-xl text-sm transition-all min-h-[44px]"
              >
                Change Mode
              </button>
              <button
                onClick={() => {
                  if (sudsBeforeSet) {
                    setShowSudsAfter(true);
                  } else {
                    handleFinishSession();
                  }
                }}
                disabled={state.currentSession.messages.length === 0}
                className="flex-1 py-2.5 bg-emerald-900/40 hover:bg-emerald-800/50 text-emerald-300 border border-emerald-700/30 hover:border-emerald-600/40 disabled:bg-stone-800/40 disabled:text-stone-600 disabled:border-stone-700/20 rounded-xl text-sm transition-all min-h-[44px]"
              >
                Finish Session
              </button>
            </div>
          </div>
        )}

        {/* ═══ URGE SURF ═══ */}
        {phase === 'urge-surf' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="p-4 bg-teal-950/20 border border-teal-700/20 rounded-xl text-center">
              <p className="text-xs text-teal-400 font-medium">Urge Surfing — ride the wave without acting</p>
            </div>

            {!urgeStarted ? (
              <div className="space-y-5">
                <div>
                  <h2 className="font-serif text-xl font-bold text-stone-100 mb-2">What's the urge?</h2>
                  <input
                    type="text"
                    value={urgeText}
                    onChange={e => setUrgeText(e.target.value)}
                    placeholder="Describe it briefly..."
                    className="w-full p-3.5 bg-stone-900/80 border border-stone-700/50 rounded-xl text-stone-100 placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all min-h-[44px]"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-stone-400">Current intensity (1–10)</p>
                  <input
                    type="range" min={1} max={10} value={urgeRating}
                    onChange={e => setUrgeRating(Number(e.target.value))}
                    className="w-full accent-teal-500"
                  />
                  <div className="text-center">
                    <span className="text-3xl font-bold text-teal-300">{urgeRating}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setUrgeHistory([{ rating: urgeRating, time: new Date().toISOString() }]);
                    setUrgeStarted(true);
                  }}
                  disabled={!urgeText.trim()}
                  className="w-full py-4 bg-teal-700 hover:bg-teal-600 disabled:bg-stone-800 disabled:text-stone-600 text-white rounded-xl font-bold text-base transition-all min-h-[52px]"
                >
                  Start surfing
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="p-5 bg-stone-900/60 border border-teal-700/20 rounded-2xl space-y-3">
                  <p className="text-sm text-stone-300 font-medium">Urge: <span className="text-teal-300">{urgeText}</span></p>
                  <div className="space-y-1">
                    {urgeHistory.map((h, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs">
                        <div
                          className="h-1.5 bg-teal-500/60 rounded-full transition-all"
                          style={{ width: `${(h.rating / 10) * 100}%`, minWidth: 4 }}
                        />
                        <span className="text-stone-500 w-4">{h.rating}</span>
                      </div>
                    ))}
                  </div>
                  {urgeHistory.length >= 2 && (
                    <p className="text-xs text-teal-400 italic">
                      {urgeHistory[urgeHistory.length - 1].rating < urgeHistory[0].rating
                        ? `It went from ${urgeHistory[0].rating} to ${urgeHistory[urgeHistory.length - 1].rating}. You're past the peak.`
                        : `Still rising — keep staying with it. Urges always peak and fall.`}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-stone-400">Where is it now?</p>
                  <input
                    type="range" min={1} max={10} value={urgeRating}
                    onChange={e => setUrgeRating(Number(e.target.value))}
                    className="w-full accent-teal-500"
                  />
                  <div className="text-center">
                    <span className="text-3xl font-bold text-teal-300">{urgeRating}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setUrgeHistory(prev => [...prev, { rating: urgeRating, time: new Date().toISOString() }])}
                    className="flex-1 py-3 bg-teal-700/60 hover:bg-teal-600/60 text-teal-200 rounded-xl text-sm font-medium transition-all min-h-[44px]"
                  >
                    Check in
                  </button>
                  <button
                    onClick={() => setShowUrgeCompleteBridge(true)}
                    className="flex-1 py-3 bg-emerald-700/60 hover:bg-emerald-600/60 text-emerald-200 rounded-xl text-sm font-medium transition-all min-h-[44px]"
                  >
                    I'm through it
                  </button>
                </div>

                {showUrgeCompleteBridge && (
                  <div className="p-4 bg-teal-950/30 border border-teal-700/30 rounded-xl space-y-3 mt-4">
                    <p className="text-sm text-teal-200 font-medium">The urge passed. 🌊</p>
                    <p className="text-xs text-stone-400">
                      There's often an emotion underneath. Want to sit with it for a moment?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setShowUrgeCompleteBridge(false);
                          handleModeSelect('learn'); // opens chat in learn mode, AI will offer MoCE
                        }}
                        className="flex-1 py-2 bg-teal-700/60 hover:bg-teal-600/60 text-teal-200 rounded-lg text-sm transition-all min-h-[44px]"
                      >
                        Yes, sit with it
                      </button>
                      <button
                        onClick={() => setPhase('complete')}
                        className="flex-1 py-2 bg-stone-800/60 text-stone-400 rounded-lg text-sm transition-all min-h-[44px]"
                      >
                        I'm done
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setPhase('mode-select')}
              className="w-full py-2.5 text-stone-500 hover:text-stone-400 text-sm transition-colors"
            >
              Back to modes
            </button>
          </div>
        )}

        {/* ═══ DIARY ═══ */}
        {phase === 'diary' && (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Crisis banner */}
            {crisisLevel !== 'none' && <SafetyBanner crisisLevel={crisisLevel} />}

            {/* Progress */}
            <div className="flex items-center gap-2">
              {(['emotions', 'urges', 'skills', 'effectiveness', 'notes', 'review'] as DiaryStep[]).map((step, i) => (
                <div key={step} className={`flex-1 h-1 rounded-full transition-colors ${['emotions', 'urges', 'skills', 'effectiveness', 'notes', 'review'].indexOf(diaryStep) >= i
                    ? 'bg-purple-500' : 'bg-stone-700'
                  }`} />
              ))}
            </div>

            {diaryStep === 'emotions' && (
              <div className="space-y-4">
                <div>
                  <h2 className="font-serif text-xl font-bold text-stone-100 mb-1">Emotions today</h2>
                  <p className="text-sm text-stone-500">Tap to add, then rate intensity</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {PRESET_EMOTIONS.map(e => (
                    <button
                      key={e}
                      onClick={() => {
                        if (!diaryEmotions.find(d => d.name === e)) {
                          setDiaryEmotions(prev => [...prev, { name: e, intensity: 3 }]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-all ${diaryEmotions.find(d => d.name === e)
                          ? 'bg-purple-700/60 border-purple-500/60 text-purple-200'
                          : 'bg-stone-800/60 border-stone-700/40 text-stone-400 hover:border-purple-500/40'
                        }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customEmotion}
                    onChange={e => setCustomEmotion(e.target.value)}
                    placeholder="Custom emotion..."
                    className="flex-1 p-2.5 bg-stone-900/80 border border-stone-700/50 rounded-lg text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50 min-h-[40px]"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && customEmotion.trim()) {
                        setDiaryEmotions(prev => [...prev, { name: customEmotion.trim(), intensity: 3 }]);
                        setCustomEmotion('');
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (customEmotion.trim()) {
                        setDiaryEmotions(prev => [...prev, { name: customEmotion.trim(), intensity: 3 }]);
                        setCustomEmotion('');
                      }
                    }}
                    className="px-3 py-2 bg-purple-700/60 text-purple-200 rounded-lg text-sm min-h-[40px]"
                  >
                    Add
                  </button>
                </div>
                {diaryEmotions.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs text-stone-500 uppercase tracking-wider">Rate intensity (1–5)</p>
                    {diaryEmotions.map((e, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-sm text-stone-300 w-24 truncate capitalize">{e.name}</span>
                        <div className="flex gap-1 flex-1">
                          {([1, 2, 3, 4, 5] as const).map(n => (
                            <button
                              key={n}
                              onClick={() => setDiaryEmotions(prev => prev.map((d, j) => j === i ? { ...d, intensity: n } : d))}
                              className={`flex-1 py-1.5 rounded text-xs font-medium transition-all ${e.intensity >= n ? 'bg-purple-600 text-white' : 'bg-stone-800 text-stone-500'
                                }`}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => setDiaryEmotions(prev => prev.filter((_, j) => j !== i))}
                          className="text-stone-600 hover:text-rose-400 text-xs min-w-[24px]"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => setDiaryStep('urges')}
                  className="w-full py-3 bg-purple-700 hover:bg-purple-600 text-white rounded-xl font-medium transition-all min-h-[44px]"
                >
                  Next →
                </button>
              </div>
            )}

            {diaryStep === 'urges' && (
              <div className="space-y-4">
                <div>
                  <h2 className="font-serif text-xl font-bold text-stone-100 mb-1">Urges today</h2>
                  <p className="text-sm text-stone-500">Any urges you noticed — did you act on them?</p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newUrge}
                    onChange={e => setNewUrge(e.target.value)}
                    placeholder="Describe an urge..."
                    className="flex-1 p-2.5 bg-stone-900/80 border border-stone-700/50 rounded-lg text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50 min-h-[40px]"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newUrge.trim()) {
                        setDiaryUrges(prev => [...prev, { description: newUrge.trim(), acted: false }]);
                        setNewUrge('');
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (newUrge.trim()) {
                        setDiaryUrges(prev => [...prev, { description: newUrge.trim(), acted: false }]);
                        setNewUrge('');
                      }
                    }}
                    className="px-3 py-2 bg-purple-700/60 text-purple-200 rounded-lg text-sm min-h-[40px]"
                  >
                    Add
                  </button>
                </div>
                {diaryUrges.map((u, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-stone-900/60 border border-stone-700/30 rounded-xl">
                    <span className="text-sm text-stone-300 flex-1">{u.description}</span>
                    <label className="flex items-center gap-1.5 text-xs text-stone-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={u.acted}
                        onChange={e => setDiaryUrges(prev => prev.map((d, j) => j === i ? { ...d, acted: e.target.checked } : d))}
                        className="accent-rose-500"
                      />
                      Acted on it
                    </label>
                    <button onClick={() => setDiaryUrges(prev => prev.filter((_, j) => j !== i))} className="text-stone-600 hover:text-rose-400 text-xs">×</button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <button onClick={() => setDiaryStep('emotions')} className="flex-1 py-3 bg-stone-800/60 text-stone-400 border border-stone-700/30 rounded-xl text-sm min-h-[44px]">← Back</button>
                  <button onClick={() => setDiaryStep('skills')} className="flex-1 py-3 bg-purple-700 hover:bg-purple-600 text-white rounded-xl font-medium min-h-[44px]">Next →</button>
                </div>
              </div>
            )}

            {diaryStep === 'skills' && (
              <div className="space-y-4">
                <div>
                  <h2 className="font-serif text-xl font-bold text-stone-100 mb-1">Skills used today</h2>
                  <p className="text-sm text-stone-500">Which DBT skills did you use?</p>
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                  {(Object.keys(DBT_SKILLS_METADATA) as DBTSkill[]).map(skill => (
                    <button
                      key={skill}
                      onClick={() => setDiarySkills(prev =>
                        prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
                      )}
                      className={`p-2.5 rounded-xl text-left text-xs border transition-all ${diarySkills.includes(skill)
                          ? 'bg-purple-700/60 border-purple-500/60 text-purple-200'
                          : 'bg-stone-800/60 border-stone-700/40 text-stone-400 hover:border-purple-500/40'
                        }`}
                    >
                      {DBT_SKILLS_METADATA[skill].name}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setDiaryStep('urges')} className="flex-1 py-3 bg-stone-800/60 text-stone-400 border border-stone-700/30 rounded-xl text-sm min-h-[44px]">← Back</button>
                  <button onClick={() => setDiaryStep('effectiveness')} className="flex-1 py-3 bg-purple-700 hover:bg-purple-600 text-white rounded-xl font-medium min-h-[44px]">Next →</button>
                </div>
              </div>
            )}

            {diaryStep === 'effectiveness' && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-serif text-xl font-bold text-stone-100 mb-1">Overall effectiveness</h2>
                  <p className="text-sm text-stone-500">How effective were your coping skills today?</p>
                </div>
                <div className="flex gap-2">
                  {([1, 2, 3, 4, 5] as const).map(n => (
                    <button
                      key={n}
                      onClick={() => setDiaryEffectiveness(n)}
                      className={`flex-1 py-4 rounded-xl text-lg font-bold transition-all ${diaryEffectiveness === n
                          ? 'bg-purple-600 text-white'
                          : 'bg-stone-800/60 text-stone-500 hover:bg-stone-700/60'
                        }`}
                    >
                      {'★'.repeat(n)}{'☆'.repeat(5 - n)}
                    </button>
                  ))}
                </div>
                <p className="text-center text-xs text-stone-600">
                  {diaryEffectiveness === 1 ? 'Barely helped' : diaryEffectiveness === 2 ? 'Somewhat helpful' : diaryEffectiveness === 3 ? 'Moderately effective' : diaryEffectiveness === 4 ? 'Quite effective' : 'Very effective'}
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setDiaryStep('skills')} className="flex-1 py-3 bg-stone-800/60 text-stone-400 border border-stone-700/30 rounded-xl text-sm min-h-[44px]">← Back</button>
                  <button onClick={() => setDiaryStep('notes')} className="flex-1 py-3 bg-purple-700 hover:bg-purple-600 text-white rounded-xl font-medium min-h-[44px]">Next →</button>
                </div>
              </div>
            )}

            {diaryStep === 'notes' && (
              <div className="space-y-4">
                <div>
                  <h2 className="font-serif text-xl font-bold text-stone-100 mb-1">Notes</h2>
                  <p className="text-sm text-stone-500">Anything else you want to remember? (optional)</p>
                </div>
                <textarea
                  value={diaryNotes}
                  onChange={e => { setDiaryNotes(e.target.value); setCrisisLevel(detectCrisisLevel(e.target.value)); }}
                  placeholder="Reflections, observations, intentions..."
                  rows={4}
                  className="w-full p-3.5 bg-stone-900/80 border border-stone-700/50 rounded-xl text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                />
                <div className="flex gap-2">
                  <button onClick={() => setDiaryStep('effectiveness')} className="flex-1 py-3 bg-stone-800/60 text-stone-400 border border-stone-700/30 rounded-xl text-sm min-h-[44px]">← Back</button>
                  <button onClick={() => setDiaryStep('review')} className="flex-1 py-3 bg-purple-700 hover:bg-purple-600 text-white rounded-xl font-medium min-h-[44px]">Review →</button>
                </div>
              </div>
            )}

            {diaryStep === 'review' && (
              <div className="space-y-4">
                <h2 className="font-serif text-xl font-bold text-stone-100">Review</h2>
                <div className="p-4 bg-stone-900/60 border border-stone-700/30 rounded-2xl space-y-3 text-sm">
                  <div>
                    <span className="text-stone-500 text-xs uppercase tracking-wider">Emotions</span>
                    <p className="text-stone-300 mt-1">
                      {diaryEmotions.length > 0
                        ? diaryEmotions.map(e => `${e.name} (${e.intensity}/5)`).join(', ')
                        : <span className="text-stone-600 italic">None recorded</span>}
                    </p>
                  </div>
                  <div>
                    <span className="text-stone-500 text-xs uppercase tracking-wider">Urges</span>
                    <p className="text-stone-300 mt-1">
                      {diaryUrges.length > 0
                        ? diaryUrges.map(u => `${u.description}${u.acted ? ' (acted)' : ''}`).join(', ')
                        : <span className="text-stone-600 italic">None recorded</span>}
                    </p>
                  </div>
                  <div>
                    <span className="text-stone-500 text-xs uppercase tracking-wider">Skills used</span>
                    <p className="text-stone-300 mt-1">
                      {diarySkills.length > 0
                        ? diarySkills.map(s => DBT_SKILLS_METADATA[s].name).join(', ')
                        : <span className="text-stone-600 italic">None</span>}
                    </p>
                  </div>
                  <div>
                    <span className="text-stone-500 text-xs uppercase tracking-wider">Effectiveness</span>
                    <p className="text-stone-300 mt-1">{'★'.repeat(diaryEffectiveness)}{'☆'.repeat(5 - diaryEffectiveness)}</p>
                  </div>
                  {diaryNotes && (
                    <div>
                      <span className="text-stone-500 text-xs uppercase tracking-wider">Notes</span>
                      <p className="text-stone-300 mt-1">{diaryNotes}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setDiaryStep('notes')} className="flex-1 py-3 bg-stone-800/60 text-stone-400 border border-stone-700/30 rounded-xl text-sm min-h-[44px]">← Edit</button>
                  <button onClick={handleSaveDiary} className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-medium min-h-[44px]">Save Entry</button>
                </div>
                <button
                  onClick={() => {
                    // Print diary entry
                    window.print();
                  }}
                  className="w-full py-2 text-stone-500 hover:text-stone-400 text-xs transition-colors"
                >
                  Print / Export PDF
                </button>
              </div>
            )}
          </div>
        )}

        {/* ═══ WALLET ═══ */}
        {phase === 'wallet' && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-stone-100">Coping Wallet</h2>
              <button onClick={() => setPhase('mode-select')} className="text-sm text-stone-500 hover:text-stone-300 transition-colors">← Back</button>
            </div>
            <p className="text-sm text-stone-500">Saved coach messages you can return to during hard moments.</p>

            {(!state.wallet || state.wallet.length === 0) ? (
              <div className="p-8 text-center bg-stone-900/40 border border-stone-700/30 rounded-2xl">
                <p className="text-stone-600 text-sm">No items yet. Hover over a coach message during chat to save it.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {state.wallet.map((item: CopingWalletItem) => (
                  <div key={item.id} className="p-4 bg-stone-900/60 border border-amber-700/20 rounded-xl space-y-2">
                    {item.label && <p className="text-xs text-amber-400 font-medium">{item.label}</p>}
                    <p className="text-sm text-stone-200 leading-relaxed">{item.content}</p>
                    <div className="flex items-center justify-between text-xs text-stone-600">
                      <span>{item.sourceMode} · {new Date(item.savedAt).toLocaleDateString()}</span>
                      <button onClick={() => handleRemoveFromWallet(item.id)} className="hover:text-rose-400 transition-colors">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ INTEGRATION ═══ */}
        {phase === 'integration' && (
          <div className="space-y-4 p-4 animate-in fade-in duration-300">
            <h2 className="font-serif text-xl text-purple-300">Integration</h2>
            <p className="text-sm text-stone-400">
              Before you go — what's one thing you're taking from this session?
            </p>
            <textarea
              className="w-full bg-stone-900 border border-stone-700 rounded-lg p-3 text-sm text-stone-200 min-h-[100px] resize-none focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              placeholder="Notice what shifted, even slightly..."
              value={integrationNote}
              onChange={e => {
                setIntegrationNote(e.target.value);
                setCrisisLevel(detectCrisisLevel(e.target.value));
              }}
            />
            {crisisLevel !== 'none' && <SafetyBanner crisisLevel={crisisLevel} />}
            <button
              className="w-full py-3 bg-purple-900/50 hover:bg-purple-800/50 text-purple-200 rounded-lg font-serif text-sm min-h-[44px] transition-all"
              onClick={() => setPhase('handoff')}
            >
              Continue
            </button>
          </div>
        )}

        {/* ═══ HANDOFF ═══ */}
        {phase === 'handoff' && (
          <div className="space-y-4 p-4 animate-in fade-in duration-300">
            <h2 className="font-serif text-xl text-purple-300">What's Next</h2>
            <p className="text-sm text-stone-400">Practices that deepen what you've started:</p>
            <div className="grid grid-cols-1 gap-2">
              {(() => {
                const practicedSkillsSet = new Set<DBTSkill>([
                  ...(state?.currentSession?.messages
                    .filter(m => m.metadata?.skillTaught)
                    .map(m => m.metadata!.skillTaught!) ?? []),
                  ...diarySkills,
                ]);

                const HANDOFF_OPTIONS: { label: string; wizard: string; condition?: boolean }[] = [
                  { label: 'IFS — Explore the part that needed coping', wizard: 'ifs' },
                  { label: 'Shadow Journaling — Write what arose', wizard: 'shadow-journaling' },
                  {
                    label: 'Somatic Generator — Ground what you felt in the body',
                    wizard: 'somatic-generator',
                    condition: ['tipp', 'abc_please', 'build_mastery', 'radical_acceptance',
                      'mindfulness_of_current_emotion'].some(s => practicedSkillsSet.has(s as DBTSkill)),
                  },
                  {
                    label: 'Interoception — Body check-in after sitting with emotion',
                    wizard: 'interoception',
                    condition: ['observe', 'describe', 'wise_mind', 'mindfulness_of_current_emotion',
                      'nonjudgmental'].some(s => practicedSkillsSet.has(s as DBTSkill)),
                  },
                ];

                const handoffItems = HANDOFF_OPTIONS.filter(o => o.condition === undefined || o.condition);

                return handoffItems.map(({ label, wizard }) => (
                  <button
                    key={wizard}
                    className="text-left p-3 bg-stone-900 border border-stone-700 rounded-lg text-sm text-stone-300 hover:border-purple-700 min-h-[44px] transition-all"
                    onClick={() => {
                      onClose?.();
                    }}
                  >
                    {label}
                  </button>
                ));
              })()}
            </div>
            <button
              className="w-full py-3 mt-2 bg-stone-800 text-stone-400 rounded-lg text-sm min-h-[44px] transition-all hover:bg-stone-700"
              onClick={() => setPhase('complete')}
            >
              Finish
            </button>
          </div>
        )}

        {/* ═══ COMPLETE ═══ */}
        {phase === 'complete' && (
          <div className="space-y-6 animate-in fade-in duration-500 text-center py-8">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-600/15 to-purple-600/15 border border-purple-500/20 rounded-full flex items-center justify-center mb-4">
                <DBTCoachMandalaIcon size={72} color="currentColor" className="text-purple-400" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-stone-100 mb-2">Session Complete</h2>
              <p className="text-sm text-stone-400 max-w-xs">
                Great work practicing DBT skills today. Consistency builds resilience.
              </p>
            </div>

            <div className="flex gap-3 max-w-sm mx-auto">
              <button
                onClick={() => setPhase('mode-select')}
                className="flex-1 py-3 bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-600 hover:to-purple-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-purple-900/30 min-h-[44px]"
              >
                New Session
              </button>
              <button
                onClick={() => onClose?.()}
                className="flex-1 py-3 bg-stone-800/60 hover:bg-stone-700/60 text-stone-400 hover:text-stone-300 border border-stone-700/30 rounded-xl transition-all min-h-[44px]"
              >
                Exit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DBTCoachWizard;
