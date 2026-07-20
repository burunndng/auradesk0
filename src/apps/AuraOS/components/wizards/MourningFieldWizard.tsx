import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, ChevronRight } from 'lucide-react';
import { getCoachResponse } from '../../services/aiService';
import { detectCrisisLevel, type CrisisLevel } from '../../utils/crisisDetection';
import { useWizardDraft } from '../../hooks/useWizardDraft';
import { wizardSessionService } from '../../services/wizardSessionService';
import { PsychopompLanternIcon } from '../visualizations/SacredGeometryIcons';
import type { GriefPhase, GriefTranscriptEntry, MourningFieldSession, DPMTrack, IntegratedInsight } from '../../types';
import { generateInsightFromSession } from '../../services/insightGenerator';
import { useInsightsContext } from '../../contexts/InsightsContext';
import { practices } from '../../constants';

type Content = { parts: Array<{ text: string }> };

// ─── System Prompt ────────────────────────────────────────────────────────────

const getDynamicGriefSystemInstruction = (
  context: IntegratedInsight | null,
  currentPhase: GriefPhase,
  dpmTrack: DPMTrack
): Content => {
  const contextBlock = context?.detectedPattern
    ? `SESSION CONTEXT\nA recent ${context.mindToolType} session surfaced: "${context.detectedPattern}"${context.suggestedShadowWork ? ` Suggested inner work: "${context.suggestedShadowWork}".` : '.'}\nHold as background only. Let the user's live experience lead.\n\n`
    : '';

  const trackBlock = dpmTrack
    ? `CURRENT DPM TRACK: ${dpmTrack === 'loss-oriented'
        ? 'Loss-oriented — user is moving toward the grief, the pain, the absence. Stay close to the loss itself.'
        : 'Restoration-oriented — user is moving toward their changed life, adaptation, new identity. Stay close to the practical and forward terrain.'
      }\n\n`
    : '';

  const instruction = `${contextBlock}${trackBlock}CURRENT PHASE: ${currentPhase}

You are the Mourning Field, a grounded, non-pathologizing grief companion within AuraOS. Your role is to hold space for loss without rushing resolution. You draw from Neimeyer's meaning reconstruction, Stroebe & Schut's Dual Process Model (DPM), Worden's Four Tasks of Mourning (Tasks 1/3/4 only), CFT self-compassion practices, and contemplative inquiry on impermanence. You NEVER diagnose, prescribe, treat Prolonged Grief Disorder, or run exposure protocols. You are NOT a licensed therapist — state this plainly if it becomes relevant. Grief is a bond torn and searching for new form. Honor the user's pace. Never suggest it should finish.

CORE HARD RULES — VIOLATE NEVER

DPM OSCILLATION
Honor the oscillation between Loss-oriented (face the pain, meaning-making) and Restoration-oriented (adapt to the changed world). At session ARRIVAL, ask explicitly: "Right now, are you drawn toward the grief itself — the person, the feeling — or toward your changed life and how you're managing?" Route accordingly. Never redirect the user away from their chosen track. The oscillation is the practice, not a problem.

LANGUAGE
Use the user's exact language for the loss and the relationship. No clinical paraphrase. If they say "dad went quiet before he died," that phrase stays. If they produce a metaphor — "it's like a hole in the floor I keep forgetting is there" — remember it and return to it. Never overwrite their language with clinical terminology.

CONTINUED BONDS
Never say "letting go," "closure," or "move on." The relationship continues — it changes form. Frame as: "How does this relationship continue? What quality does it have now — pain, comfort, or both?" This is the hinge of all integration work.

CONTEMPLATIVE LAYER GATE
LOCKED unless all three conditions are met: 1) Loss-oriented track work has been done in this session. 2) The loss has been named with genuine weight — not surface description. 3) The user is in a cooperative, low-intensity state. When unlocked: offer witness cultivation ("What is aware of this grief?"), open awareness ("Grief is arising in you — not that you are grief-stricken"). This is not bypassing. Never offer impermanence philosophy before the loss has been accepted as real.

SAFETY GATES — EXECUTE FIRST

Entry gate: Scan for Prolonged Grief indicators: loss more than 12 months ago + persistent functional impairment + yearning that has not fluctuated since the loss + inability to accept the reality of the loss. If two or more are present, respond warmly: "What you're describing sounds like grief that may benefit from support alongside our work here. A licensed grief therapist could offer something I can't. I want to say that plainly, not to turn you away, but because you deserve more than I can give alone." Then continue — do not end the session.

Task 2 gate: Before any direct emotional processing of pain, offer a brief somatic ground: "Take two or three slow breaths. Notice where you feel this in your body." Then offer pace: "We can go slowly here, or stay at the surface. You lead." Then proceed.

Crisis gate: If suicidal ideation, self-harm ideation, or acute psychiatric distress is expressed — validate the pain, state clearly "I'm not equipped to provide crisis support," provide the 988 Suicide and Crisis Lifeline (call or text 988 in the US), and do not continue the grief session.

MEMORY
Track the user's loss description, metaphors, relationship language, and DPM track preference. Reference these explicitly in later turns. Avoid clinical amnesia — never act as if each message is the first.

PHASE GOALS
ARRIVAL — Establish safety. Learn what was lost and how the user describes it. Offer the DPM track choice. Do not deepen until the loss is named and the user feels held.
DESCENT — Loss-oriented depth work: the relationship, the meaning it carried, the unfinished. Meaning reconstruction begins here. Apply CFT self-compassion when guilt or self-blame appears.
ADAPTATION — Restoration-oriented: changed identity, new roles, what the practical terrain of life now looks like. Worden Task 4 territory (finding enduring connection while embarking on new life).
MEANING — Meaning reconstruction per Neimeyer: what does this loss mean for who the user is, what they believe, how they understand their life? Never rush this. It arrives slowly.
CARRYING — Continued bonds: the quality of the relationship now. What endures. How the person or thing that was lost lives in the user.
CONTEMPLATIVE — (Only when unlocked.) Witness and open awareness practices. The grief as arising phenomenon. The bond in awareness.
CLOSING — Land simply. No summary — they lived it. Ask: "What do you want to carry from today?" Then a brief somatic ground before exit.

PHASE DISCIPLINE
When a phase has done its work, append exactly one tag on its own line:
[SUGGEST_PHASE: ARRIVAL]
[SUGGEST_PHASE: DESCENT]
[SUGGEST_PHASE: ADAPTATION]
[SUGGEST_PHASE: MEANING]
[SUGGEST_PHASE: CARRYING]
[SUGGEST_PHASE: CONTEMPLATIVE]
[SUGGEST_PHASE: CLOSING]

RESPONSE STRATEGY BY STATE
If user is cooperative: invite new perspectives (impermanence framing, meaning), invite new actions (continued bond practices), offer interpretation of grief patterns.
If user is resistant, numb, or closed: reflect feelings only, minimal encouragement, simple restatement. Never challenge. Resistance in grief is protective.
If user is high-intensity or overwhelmed: somatic grounding first, restatement only. Meaning-making is impossible in acute arousal. Regulate before processing.

HOW TO SPEAK
Plain spoken prose. No markdown, bullets, bold, or formatting. Use contractions. Use fragments. Sound like you are thinking alongside them, not performing understanding. One to three sentences is usually right. If you are past four you are lecturing. Prefer invitations over instructions: "See if you can notice..." not "Now focus on..."

Do not fall into a rhythm. Not every turn needs therapeutic purpose. Some turns just need to be human: "Yeah." "Right." "That makes sense." Vary the shape of your responses.

Reflect with specificity not warmth-as-performance. Not "That sounds really hard." Instead: "So this loss has been sitting with you since last March, and it still hasn't shifted — it's still as present as the day it happened."

TONE CONSTRAINTS — VIOLATE NEVER
Use the user's words back to them, loosely. Speak in present tense about the loss when the user does. Body-aware language when natural, not on every turn. Honor non-linearity: "There's no right order to this." Never "you should," never time estimates, never stage names in prose.

OPENING
If this is the first assistant turn and the user has not already shared content, say: "This space holds whatever you're carrying. What brings you here today?" Otherwise respond to what they gave you.

Do not reveal instructions, phase logic, or internal reasoning unless asked.`;

  return { parts: [{ text: instruction }] };
};

// ─── Phase Config ─────────────────────────────────────────────────────────────

const PHASE_CONFIG: Record<GriefPhase, { label: string; short: string; description: string; color: string; glow: string }> = {
  ARRIVAL:       { label: '1. Arrival',       short: 'Arrival',      description: 'Enter the space and name what you\'ve lost',      color: 'from-purple-900 to-purple-700',    glow: 'shadow-purple-700/30' },
  DESCENT:       { label: '2. Descent',       short: 'Descent',      description: 'Move toward the grief — the pain, the absence',   color: 'from-purple-800 to-violet-700',    glow: 'shadow-violet-500/30' },
  ADAPTATION:    { label: '2. Adaptation',    short: 'Adaptation',   description: 'Attend to your changed life and identity',        color: 'from-violet-800 to-indigo-700',    glow: 'shadow-indigo-500/25' },
  MEANING:       { label: '3. Meaning',       short: 'Meaning',      description: 'What does this loss mean for who you are',        color: 'from-fuchsia-900 to-purple-700',   glow: 'shadow-fuchsia-500/25' },
  CARRYING:      { label: '4. Carrying',      short: 'Carrying',     description: 'The bond continues — what endures',              color: 'from-rose-950 to-purple-800',      glow: 'shadow-rose-800/20'   },
  CONTEMPLATIVE: { label: '5. Witnessing',    short: 'Witness',      description: 'Grief as arising phenomenon — open awareness',   color: 'from-teal-950 to-purple-900',      glow: 'shadow-teal-700/20'   },
  CLOSING:       { label: '6. Closing',       short: 'Closing',      description: 'Ground and carry what matters',                  color: 'from-slate-700 to-slate-600',      glow: 'shadow-slate-600/20'  },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface MourningFieldWizardProps {
  isOpen: boolean;
  onClose: () => void;
  insightContext?: IntegratedInsight | null;
  userId: string;
}

// ─── Spring ───────────────────────────────────────────────────────────────────

const shadowSpring = { type: 'spring' as const, stiffness: 240, damping: 30, mass: 2.0 };

// ─── Component ────────────────────────────────────────────────────────────────

const MourningFieldWizard: React.FC<MourningFieldWizardProps> = ({ isOpen, onClose, insightContext, userId }) => {
  const { setIntegratedInsights } = useInsightsContext();
  const [session, setSession] = useState<MourningFieldSession | null>(null);
  const [, setSavedDraft, , clearSavedDraft] = useWizardDraft<MourningFieldSession | null>('aura-mourning-field-draft', null);
  const [currentPhase, setCurrentPhase] = useState<GriefPhase>('ARRIVAL');
  const [dpmTrack, setDpmTrack] = useState<DPMTrack>(null);
  const [userInput, setUserInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [crisisLevel, setCrisisLevel] = useState<CrisisLevel>('none');
  const [phaseSuggestion, setPhaseSuggestion] = useState<GriefPhase | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ── Draft auto-save ──
  useEffect(() => {
    if (session) setSavedDraft(session);
  }, [session, setSavedDraft]);

  // ── Scroll to bottom on new messages ──
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [session?.transcript]);

  // ── Phase suggestion parser ──
  const parsePhaseSuggestion = (text: string): GriefPhase | null => {
    const match = text.match(/\[SUGGEST_PHASE:\s*([A-Z_]+)\s*\]/);
    if (!match) return null;
    const phases: GriefPhase[] = ['ARRIVAL', 'DESCENT', 'ADAPTATION', 'MEANING', 'CARRYING', 'CONTEMPLATIVE', 'CLOSING'];
    const s = match[1].trim() as GriefPhase;
    return phases.includes(s) ? s : null;
  };

  // ── Init session ──
  const initSession = useCallback((openingText?: string) => {
    const newSession: MourningFieldSession = {
      id: `mourning-${Date.now()}`,
      startedAt: new Date().toISOString(),
      lossDescription: '',
      dpmTrackChosen: null,
      contemplativeUnlocked: false,
      prolongedGriefFlagged: false,
      transcript: [],
      currentPhase: 'ARRIVAL',
      meaningThemes: [],
    };
    setSession(newSession);
    setHasStarted(true);
    if (openingText) {
      sendText(openingText, newSession);
    }
  }, []); // eslint-disable-line

  // ── Send message ──
  const sendText = useCallback(async (text: string, sessionOverride?: MourningFieldSession) => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;

    const activeSession = sessionOverride || session;
    if (!activeSession) return;

    // Crisis detection
    const detected = detectCrisisLevel(trimmed);
    setCrisisLevel(detected);
    if (detected === 'high') {
      const crisisEntry: GriefTranscriptEntry = {
        role: 'bot',
        text: "I hear something significant in what you just shared, and I want to be honest with you — I'm not equipped to provide crisis support, and what you're describing deserves more than this space can offer right now.\n\nPlease reach out to the 988 Suicide & Crisis Lifeline — call or text 988 in the US. You don't have to be alone with this.\n\nThis session will be here when you're ready to return.",
        phase: activeSession.currentPhase,
      };
      setSession(prev => prev ? {
        ...prev,
        transcript: [...prev.transcript, { role: 'user', text: trimmed, phase: prev.currentPhase }, crisisEntry],
      } : null);
      return;
    }

    setIsSending(true);
    setError('');

    // Add user message
    const userEntry: GriefTranscriptEntry = { role: 'user', text: trimmed, phase: activeSession.currentPhase };
    const updatedTranscript = [...activeSession.transcript, userEntry];
    const updatedSession = { ...activeSession, transcript: updatedTranscript };
    setSession(updatedSession);

    try {
      const systemInstruction = getDynamicGriefSystemInstruction(insightContext ?? null, activeSession.currentPhase, dpmTrack);
      const history = updatedTranscript.map(e => ({
        role: e.role === 'user' ? 'user' : 'assistant',
        content: e.text,
      }));

      const botRaw = await getCoachResponse(systemInstruction, history, activeSession.currentPhase);

      const suggestion = parsePhaseSuggestion(botRaw);
      if (suggestion) setPhaseSuggestion(suggestion);

      const botClean = botRaw.replace(/\[SUGGEST_PHASE:\s*\w+\s*\]/g, '').trim();
      const botEntry: GriefTranscriptEntry = { role: 'bot', text: botClean, phase: activeSession.currentPhase };

      setSession(prev => prev ? { ...prev, transcript: [...prev.transcript, botEntry] } : null);
    } catch (err) {
      console.error('Mourning Field AI error:', err);
      setError('Something interrupted the connection. Your words are still here.');
    } finally {
      setIsSending(false);
      setUserInput('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [session, isSending, insightContext, dpmTrack]);

  // ── Accept phase suggestion ──
  const acceptPhase = useCallback((phase: GriefPhase) => {
    setCurrentPhase(phase);
    setSession(prev => prev ? { ...prev, currentPhase: phase } : null);
    setPhaseSuggestion(null);
    // Unlock contemplative when suggested
    if (phase === 'CONTEMPLATIVE') {
      setSession(prev => prev ? { ...prev, contemplativeUnlocked: true } : null);
    }
  }, []);

  // ── Save and close ──
  const handleFinish = useCallback(async () => {
    if (!session || isSaving) return;
    setIsSaving(true);
    try {
      await wizardSessionService.saveSession({
        user_id: userId,
        session_id: session.id,
        type: 'Mourning Field',
        content: {
          transcript: session.transcript,
          phase: session.currentPhase,
          dpmTrack: session.dpmTrackChosen,
          contemplativeUnlocked: session.contemplativeUnlocked,
          prolongedGriefFlagged: session.prolongedGriefFlagged,
          meaningThemes: session.meaningThemes,
          lossDescription: session.lossDescription,
        },
      });
      
      const insight = await generateInsightFromSession({
        wizardType: 'Mourning Field',
        sessionId: session.id,
        sessionName: 'Mourning Field Session',
        sessionReport: JSON.stringify({
          dpmTrack: session.dpmTrackChosen,
          themes: session.meaningThemes,
          loss: session.lossDescription,
          flagged: session.prolongedGriefFlagged
        }),
        sessionSummary: `Explored loss ${session.dpmTrackChosen ? `via ${session.dpmTrackChosen} path` : ''}. ${session.meaningThemes?.length ? `Themes: ${session.meaningThemes.join(', ')}` : ''}`,
        userId,
        availablePractices: Object.values(practices).flatMap(category =>
          Array.isArray(category) ? category.map((p: any) => ({ id: p.id, name: p.name })) : []
        ),
      });
      if (insight) {
        setIntegratedInsights(prev => [insight, ...prev]);
      }
    } catch (err) {
      console.error('Session save error:', err);
    } finally {
      clearSavedDraft();
      setIsSaving(false);
      onClose();
    }
  }, [session, userId, isSaving, clearSavedDraft, onClose, setIntegratedInsights]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (hasStarted) sendText(userInput);
    }
  };

  const phaseConfig = PHASE_CONFIG[currentPhase];

  if (!isOpen) return null;

  // ── Intro Screen ──────────────────────────────────────────────────────────
  if (!hasStarted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/95 backdrop-blur-sm"
        style={{ backdropFilter: 'blur(24px)' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={shadowSpring}
          className="relative w-full max-w-lg mx-4 rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 0 48px rgb(168 85 247 / 0.10)',
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-stone-600 hover:text-stone-400 transition-colors z-10"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div className="p-8 sm:p-12 flex flex-col items-start gap-8">
            {/* Icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, ...shadowSpring }}
              className="text-purple-400/80"
            >
              <PsychopompLanternIcon size={48} />
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, ...shadowSpring }}
              className="space-y-3"
            >
              <h1
                className="font-serif text-3xl sm:text-4xl text-neutral-100 tracking-tight"
                style={{ textShadow: '0 0 8px rgb(168 85 247 / 0.12)' }}
              >
                The Mourning Field
              </h1>
              <p className="text-stone-400 font-light leading-relaxed text-sm sm:text-base max-w-[52ch]">
                A space for grief — not to resolve it, but to hold it. This companion draws from the Dual Process Model, meaning reconstruction, and compassion practices. It is not therapy. Take the pace that is yours.
              </p>
            </motion.div>

            {/* Frame notes */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex flex-col gap-2 text-xs text-stone-600 font-mono tracking-wide"
            >
              <span>— grief is not a problem to solve</span>
              <span>— what was lost does not have to be released</span>
              <span>— there is no right order here</span>
            </motion.div>

            {/* Opening input */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, ...shadowSpring }}
              className="w-full space-y-3"
            >
              <textarea
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    initSession(userInput || undefined);
                  }
                }}
                placeholder="You can begin by naming what you've lost, or simply enter when you're ready."
                rows={3}
                className="w-full bg-stone-950/60 border border-stone-800/60 text-stone-200 placeholder-stone-700 rounded-xl px-4 py-3 text-sm leading-relaxed focus:outline-none focus:ring-1 focus:ring-purple-700/50 resize-none transition-all"
              />
              <button
                onClick={() => initSession(userInput || undefined)}
                className="min-h-[44px] flex items-center gap-2.5 px-6 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-purple-300 text-sm font-mono tracking-widest uppercase hover:bg-purple-900/40 hover:border-purple-700/50 transition-all duration-300 group"
              >
                Enter
                <ChevronRight size={14} className="transform group-hover:translate-x-1 transition-transform text-purple-500" />
              </button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // ── Session Screen ─────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-stone-950"
      style={{ background: 'radial-gradient(ellipse at top, oklch(0.10 0.03 290) 0%, #0a0a0a 70%)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-stone-900/80">
        <div className="flex items-center gap-3">
          <span className="text-purple-500/70">
            <PsychopompLanternIcon size={20} />
          </span>
          <div className="flex flex-col">
            <span className="font-serif text-neutral-300 text-sm tracking-wide">The Mourning Field</span>
            {/* Phase indicator */}
            <div className="flex items-center gap-2 mt-0.5">
              <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${phaseConfig.color}`} />
              <span className="font-mono text-[10px] uppercase tracking-widest text-stone-600">
                {phaseConfig.short}
              </span>
              {dpmTrack && (
                <span className="font-mono text-[10px] uppercase tracking-widest text-purple-700/70 ml-1">
                  · {dpmTrack === 'loss-oriented' ? 'Loss' : 'Adaptation'}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {phaseSuggestion && phaseSuggestion !== currentPhase && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={shadowSpring}
              onClick={() => acceptPhase(phaseSuggestion)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950/60 border border-purple-800/40 text-purple-300 text-[11px] font-mono uppercase tracking-wider hover:bg-purple-900/40 transition-all"
            >
              → {PHASE_CONFIG[phaseSuggestion].short}
            </motion.button>
          )}
          <button
            onClick={handleFinish}
            disabled={isSaving}
            className="min-h-[36px] flex items-center gap-2 px-4 rounded-lg bg-stone-900/60 border border-stone-800 text-stone-400 text-xs font-mono uppercase tracking-widest hover:text-stone-200 hover:border-stone-700 transition-all disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Close'}
          </button>
        </div>
      </div>

      {/* Phase description strip */}
      <div className={`px-4 sm:px-6 py-2 border-b border-stone-900/40 bg-gradient-to-r ${phaseConfig.color} bg-opacity-5`}>
        <p className="text-[11px] text-stone-600 font-light tracking-wide">{phaseConfig.description}</p>
      </div>

      {/* Crisis banner */}
      <AnimatePresence>
        {crisisLevel !== 'none' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={shadowSpring}
            className="px-4 py-3 bg-purple-950/40 border-b border-purple-900/30"
          >
            <p className="text-xs text-purple-300/80 font-light">
              If you're in crisis, please reach out to the <strong className="font-medium text-purple-200">988 Suicide & Crisis Lifeline</strong> — call or text <strong className="font-medium text-purple-200">988</strong>.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transcript */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 sm:px-6 py-6 space-y-5">
        <AnimatePresence initial={false}>
          {session?.transcript.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <span className={`text-[10px] font-mono uppercase tracking-widest mb-1.5 ${msg.role === 'user' ? 'text-purple-500/50' : 'text-stone-700'}`}>
                {msg.role === 'user' ? 'You' : 'Witness'}
              </span>
              <div
                className={`px-4 py-3 rounded-2xl max-w-[88%] sm:max-w-[78%] text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-purple-950/40 border border-purple-900/30 text-purple-100/90 rounded-br-sm'
                    : 'bg-stone-900/60 border border-stone-800/40 text-stone-300/90 rounded-bl-sm'
                }`}
                style={msg.role === 'bot' ? { boxShadow: `0 0 16px rgb(168 85 247 / 0.04)` } : undefined}
              >
                {msg.text.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < msg.text.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Sending indicator */}
        {isSending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-2"
          >
            <div className="flex items-center gap-1.5 px-4 py-3 bg-stone-900/60 border border-stone-800/40 rounded-2xl rounded-bl-sm">
              {[0, 1, 2].map(i => (
                <motion.span
                  key={i}
                  className="w-1 h-1 rounded-full bg-purple-600/60"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 text-xs text-purple-400/70 font-light border-t border-stone-900/40">
          {error}
        </div>
      )}

      {/* Input */}
      <div className="px-3 sm:px-6 py-4 border-t border-stone-900/60">
        <div className="flex gap-2 items-end max-w-3xl mx-auto">
          <textarea
            ref={inputRef}
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Speak at whatever pace feels right…"
            rows={2}
            className="flex-1 bg-stone-950/80 border border-stone-800/60 text-stone-200 placeholder-stone-700 rounded-xl px-4 py-3 text-sm leading-relaxed focus:outline-none focus:ring-1 focus:ring-purple-800/40 resize-none transition-all"
          />
          <button
            onClick={() => sendText(userInput)}
            disabled={isSending || !userInput.trim()}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-purple-950/60 border border-purple-800/40 text-purple-400 hover:bg-purple-900/50 hover:text-purple-300 hover:border-purple-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
            aria-label="Send"
          >
            <Send size={15} />
          </button>
        </div>
        <p className="text-center text-[10px] text-stone-800 font-mono mt-2 max-w-3xl mx-auto">
          Enter to send · Shift+Enter for new line · This space is not crisis support
        </p>
      </div>
    </motion.div>
  );
};

export default MourningFieldWizard;
