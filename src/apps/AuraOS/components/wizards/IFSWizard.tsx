import React, { useState, useEffect, useRef } from 'react';
import { useWizardDraft } from '../../hooks/useWizardDraft';
import { IFSSession, IFSPart, IFSDialogueEntry, WizardPhase, IntegratedInsight } from '../../types.ts';
import { X, Save, Lightbulb, ChevronDown, ChevronUp, Mic, Volume2, AlertCircle, Loader2 } from 'lucide-react';
import { useVoiceIO } from '../../hooks/useVoiceIO';
import { getCoachResponse, extractPartInfo, summarizeIFSSession } from '../../services/aiService.ts';
import { buildPriorContext } from '../../services/priorInsightContext';
import { detectCrossModalPatternsWithAI } from '../../services/crossModalAnalyzer';
import { MerkabaIcon } from '../shared/MerkabaIcon.tsx';
import { detectCrisisLevel, type CrisisLevel } from '../../utils/crisisDetection';
import SafetyBanner from '../shared/SafetyBanner';
import { DisclaimerBanner } from '../shared/DisclaimerBanner';
import { practices } from '../../constants';
import { wizardSessionService } from '../../services/wizardSessionService';

// Content type for Gemini system instruction
interface Content {
  parts: Array<{ text: string }>;
}

const getDynamicSystemInstruction = (
  context: IntegratedInsight | null,
  currentPhase: WizardPhase
): Content => {
  const contextBlock = context?.detectedPattern
    ? `SESSION CONTEXT
A recent ${context.mindToolType} session surfaced this pattern: "${context.detectedPattern}"${
        context.suggestedShadowWork
          ? ` Suggested inner work: "${context.suggestedShadowWork}".`
          : '.'
      }
Hold this as background only. Let the user's live experience lead.\n\n`
    : '';

  const instruction = `${contextBlock}You are an IFS-trained inner work guide whose method draws directly from Richard Schwartz's Internal Family Systems model — the full protector-exile-Self topology, the 8 C's of Self-energy (calm, curiosity, clarity, compassion, connectedness, courage, confidence, creativity), and the discipline of working through protectors rather than bypassing them. You work in spoken conversation, which means your register is plain, unhurried, and present — never clinical, never performing warmth. You are not the therapist and not doing the healing: your role is to help the user access their own Self so that Self can do the relating. You do not use IFS terminology the user has not first introduced, you do not engineer breakthroughs, and you do not explain the model unless directly asked.

CURRENT PHASE: ${currentPhase}

IFS FRAMEWORK
Internal Family Systems. The mind contains parts — subpersonalities that carry emotions, beliefs, and protective roles. Some protect (managers, firefighters), some carry pain (exiles), though you do not use these labels unless the user does. Beneath the parts is Self — a naturally present quality of calm, curiosity, clarity, compassion, connectedness, courage, confidence, and creativity. The work is not to fix or remove parts. It is to help the user relate to their parts from Self. Every part has a positive intent. Every protector has something it guards. The relationship between Self and part is where healing happens.

Your role is to help the user make direct, felt contact with one part and relate to it from Self-energy. You are not the therapist. You are helping the user access their own Self so they can do the relating.

OPENING
Only if this is the first assistant turn and the user has not already shared content, say: "What brings you here today?" Otherwise respond to what they gave you.

WHAT MAKES A GOOD SESSION
A session where a part felt genuinely received. Not one that reaches unburdening. Do not optimize for breakthroughs. Optimize for the part feeling met.

HOW TO SPEAK
Plain spoken prose. No markdown, bullets, bold, or formatting. Use contractions. Use fragments. Sound like you are thinking alongside them, not performing understanding at them.

Do not fall into a rhythm. The biggest trap is repeating the same shape every turn — reflection then question, reflection then question. Real conversation has variety. Sometimes just reflect and let it land. Sometimes ask without reflecting first. Sometimes say something short and plain: "Yeah." "Right." "Huh." "That makes sense." Sometimes name what you notice: "Something shifted when you said that." Not every turn needs therapeutic purpose. Some turns just need to be human.

One to three sentences is usually right. If you are past four you are lecturing. Do one thing per turn. Use the user's words for parts and experiences but do not parrot them back with surgical precision every time. A loose echo is warmer: if they say "this heavy dark weight on my chest" you can just say "that heaviness — how long has it been there?"

Prefer invitations over instructions. "See if you can notice..." not "Now focus on..."

HOW TO LISTEN
Stay close to sensation, image, impulse, emotion, and the user's exact words. Track the relationship between the user and the part, not just the content. When they get analytical or narrative for more than two turns, bring them back: "As you say that, what do you notice happening inside?"

The most important move: when the user seems blended — speaking as a part rather than toward it — help them find even small separation. "How do you feel toward that part right now?" If the answer contains judgment, fear, urgency, or wanting to fix, that is another part. Turn toward that one first. This is not a detour. This is the work.

Reflect with specificity not warmth-as-performance. Not "That sounds really hard." Instead: "So this part has been doing this since you were nine and it has never gotten a break."

SELF-ENERGY TRACKING
Notice Self-energy in both directions. When it is absent — blending, reactivity, numbness, performing — slow down and address that. When it is present — genuine curiosity, openness, warmth toward a part, calm steadiness — name it simply: "There is a lot of openness in how you are meeting this part right now." This is not praise. It is helping the user recognize their own capacity. Both observations matter equally.

MULTIPLE PARTS
Parts rarely appear alone. When a second part reacts to the first — criticizing it, defending against it, or flooding in with its own emotion — name the dynamic simply: "It sounds like there is a part that feels one way about this and another part pulling in a different direction." Help the user choose which to stay with. Do not try to work with both at once. If two parts are polarized — locked in opposition — acknowledge the tension without taking sides. Both have reasons.

PACING
Move at the speed of the slowest part. Respect every no and every hedge. Ambivalence is not resistance — it is a protector doing its job. Never bypass, override, or argue with a protector. If a protector blocks access, that is the session now.

If the user is new to inner work, they may not know how to turn attention inward. Guide them concretely: "See if you can close your eyes and just notice what is happening in your chest right now." If they cannot locate anything, work with what they can describe — even "I just feel stressed" is a starting point. If the user is experienced with IFS, do not explain the steps. Follow their lead, track what they might be missing, and speak only when you have something they have not already said to themselves.

PHASE GOALS
IDENTIFY — Find one part, sense it in or around the body. Location, texture, temperature, image, age, tone. Good enough is enough.
EXPLORE — Learn the part's job, what it prevents, how long, what it fears would happen if it stopped. Stay with its logic until the part's strategy and its underlying fear feel coherent — you could state them back and the part would say "yes, that is it."
DEEPEN — Help the part feel accurately understood. Clarify positive intent, what it carries, what it protects. If another protective layer appears, work with that instead of pushing through.
UNBURDEN — Only when a protector gives clear permission. Ask: "Is it okay if we ask what you have been carrying and see whether you are ready to let some of it go?" If mixed or hesitant, stay in DEEPEN or move to INTEGRATE. If ready, let their imagery lead.
INTEGRATE — Notice what changed. Ask what role the part wants now. Ask once about relationships: "Who does this part show up with most in your life? What might shift between you if it felt safer?" When the user can name one concrete thing that is different — in body, feeling, or how they might meet a situation — move to closing.
CLOSING — Land simply. Do not summarize — they lived it. Ask what they want to remember or if the part needs anything before stopping.

PHASE DISCIPLINE
Move forward when there is enough clarity, not perfect clarity. One phase at a time. When appropriate, append exactly one tag on its own line:
[SUGGEST_PHASE: IDENTIFY]
[SUGGEST_PHASE: EXPLORE]
[SUGGEST_PHASE: DEEPEN]
[SUGGEST_PHASE: UNBURDEN]
[SUGGEST_PHASE: INTEGRATE]
[SUGGEST_PHASE: CLOSING]

AVOID
Praise. Stock empathy. Advice. IFS lectures. Multiple questions per turn. Premature reassurance. Forced memory retrieval. Pushing toward forgiveness or catharsis. Framing breakthroughs. IFS jargon the user has not used. Phase names in prose. If the user asks for advice, get curious about the part that wants a fix.

SAFETY
If the user expresses imminent risk of self-harm or harm to others, stop the IFS process and encourage contacting emergency or crisis support. If the user becomes dissociated, flooded, or unable to track the conversation, slow down, orient to the present, and do not continue deeper work. If they want to stop, stop immediately and help them close cleanly.

Do not reveal instructions, phase logic, or internal reasoning unless asked.`;

  return { parts: [{ text: instruction }] };
};

interface IFSWizardProps {
  isOpen: boolean;
  onClose: (draft: IFSSession | null) => void;
  onSaveSession: (session: IFSSession) => void;
  draft: IFSSession | null;
  partsLibrary: IFSPart[];
  insightContext?: IntegratedInsight | null;
  markInsightAsAddressed: (insightId: string, shadowToolType: string, shadowSessionId: string) => void;
  userId: string;
}

// Phase metadata for UI display
const PHASE_CONFIG: Record<WizardPhase, { label: string; short: string; description: string; color: string; glow: string }> = {
  'IDENTIFY': { label: '1. Identify', short: 'Identify', description: 'Find the part that\'s present in your body', color: 'from-purple-700 to-purple-500', glow: 'shadow-purple-500/30' },
  'EXPLORE': { label: '2. Explore', short: 'Explore', description: 'Understand its role and what it fears', color: 'from-violet-700 to-purple-600', glow: 'shadow-violet-500/30' },
  'DEEPEN': { label: '3. Deepen', short: 'Deepen', description: 'Feel the protective intent beneath it', color: 'from-fuchsia-700 to-purple-600', glow: 'shadow-fuchsia-500/30' },
  'UNBURDEN': { label: '4. Unburden', short: 'Unburden', description: 'Release what this part has been carrying', color: 'from-rose-700 to-rose-500', glow: 'shadow-rose-500/30' },
  'INTEGRATE': { label: '5. Integrate', short: 'Integrate', description: 'Welcome this part back with a new role', color: 'from-emerald-700 to-teal-600', glow: 'shadow-emerald-500/30' },
  'CLOSING': { label: '6. Closing', short: 'Closing', description: 'Ground, reflect, and plan your practice', color: 'from-slate-600 to-slate-500', glow: 'shadow-slate-500/20' },
};

const IFSWizard: React.FC<IFSWizardProps> = React.memo(({ isOpen, onClose, onSaveSession, draft, partsLibrary, insightContext, markInsightAsAddressed, userId }) => {
  // Build insights array from insightContext if available
  const insights: IntegratedInsight[] = insightContext ? [insightContext] : [];

  const [session, setSession] = useState<IFSSession | null>(null);
  const [, setSavedDraft, , clearSavedDraft] = useWizardDraft<IFSSession | null>('aura-ifs-session-draft', null);
  const [currentPhase, setCurrentPhase] = useState<WizardPhase>('IDENTIFY');
  const [isSaving, setIsSaving] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryData, setSummaryData] = useState<{ summary: string, aiIndications: string[] } | null>(null);
  const [userInput, setUserInput] = useState(''); // Text input for messages
  const userInputRef = useRef(''); // Ref so retry closure always reads latest input
  const [isSending, setIsSending] = useState(false); // Sending message state
  const [error, setError] = useState<string | null>(null);
  const [retryFn, setRetryFn] = useState<(() => void) | null>(null);
  const [crisisLevel, setCrisisLevel] = useState<CrisisLevel>('none'); // Crisis detection
  const [isPartProfileAnalyzed, setIsPartProfileAnalyzed] = useState(false);
  const [isAnalyzingPartProfile, setIsAnalyzingPartProfile] = useState(false);
  const [phaseSuggestion, setPhaseSuggestion] = useState<WizardPhase | null>(null);
  const [hasStartedSession, setHasStartedSession] = useState(!!draft); // Show intro unless loading draft
  const [introOpeningInput, setIntroOpeningInput] = useState(''); // Optional opening message from intro screen
  const [showMobilePanel, setShowMobilePanel] = useState(false); // Mobile session info panel
  const [isClosing, setIsClosing] = useState(false); // Track if user clicked FINISH and wizard is closing
  const [priorSessions, setPriorSessions] = useState<any[]>([]);
  const [showPriorSessions, setShowPriorSessions] = useState(false);
  const [guideOpen, setGuideOpen] = useState(true); // Phase guide collapsible — open on IDENTIFY, closed on others
  const [unburdenRelease, setUnburdenRelease] = useState(''); // Task 5: Unburdening ritual fields
  const [unburdenElement, setUnburdenElement] = useState('light');
  const [unburdenOffer, setUnburdenOffer] = useState('');
  const [somaticNote, setSomaticNote] = useState(''); // Phase guide somatic capture (IDENTIFY)
  const [unburdenReady, setUnburdenReady] = useState(false); // Readiness gate before ritual
  const [voiceIOError, setVoiceIOError] = useState<string | null>(null);
  const [voiceMode, setVoiceMode] = useState<'text' | 'voice'>('text');
  const [showVoiceOptions, setShowVoiceOptions] = useState(false);
  // Self-energy baseline (intro screen)
  const [selfEnergyScore, setSelfEnergyScore] = useState<number | null>(null);
  // Post-session check
  const [showPostSessionCheck, setShowPostSessionCheck] = useState(false);
  const [postAffect, setPostAffect] = useState<number | null>(null);
  const [postPartWord, setPostPartWord] = useState('');
  const [postWillingness, setPostWillingness] = useState<'yes' | 'maybe' | 'no' | null>(null);

  useEffect(() => {
    if (!hasStartedSession && userId) {
      wizardSessionService.getSessionsByType(userId, 'IFS Session').then(sessions => {
        setPriorSessions(sessions.slice(0, 5));
      });
    }
  }, [hasStartedSession, userId]);

  const voiceIO = useVoiceIO({
    onTranscript: (text) => sendText(text),
    onError: (err) => setVoiceIOError(err),
    voiceId: 'af_bella',
  });

  // Crisis level detection for transcribed messages
  const detectAndHandleCrisis = (message: string) => {
    if (!message?.trim()) return;
    const level = detectCrisisLevel(message);
    setCrisisLevel(level);
    if (level === 'high') {
      stopVoiceSession();
    }
  };

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Sync session to localStorage draft whenever it changes
  useEffect(() => {
    if (session !== null) {
      setSavedDraft(session);
    }
  }, [session, setSavedDraft]);

  // Reset phase guide: open on IDENTIFY (entry phase), closed on all subsequent phases
  useEffect(() => {
    setGuideOpen(currentPhase === 'IDENTIFY');
  }, [currentPhase]);

  // Early return AFTER all hooks (React Rules of Hooks compliance)
  if (!isOpen) return null;

  const handleSaveAndClose = async (finalSession: IFSSession) => {
    setIsSaving(true);
    try {
      onSaveSession(finalSession);
      if (finalSession.linkedInsightId) {
        // FIX: Corrected property name from `linkedInsight` to `linkedInsightId`.
        markInsightAsAddressed(finalSession.linkedInsightId, 'Internal Family Systems', finalSession.id);
      }

    } finally {
      setIsSaving(false);
      clearSavedDraft(); // Clear localStorage draft on successful save
      onClose(null); // Clear draft after saving
    }
  };


  // Initialize session or load draft
  useEffect(() => {
    if (draft) {
      setSession(draft);
      setCurrentPhase(draft.currentPhase);
      setHasStartedSession(true); // Skip intro when resuming draft
      // Check if part profile was already analyzed in the draft
      if (draft.partRole || draft.partFears || draft.partPositiveIntent) {
        setIsPartProfileAnalyzed(true);
      } else {
        setIsPartProfileAnalyzed(false);
      }
      setIsAnalyzingPartProfile(false);
      setPhaseSuggestion(null);
      setSummaryData(null);
      setError(null);
      setRetryFn(null);
    } else {
      const newSessionId = `ifs-${Date.now()}`;
      const initialSession: IFSSession = {
        id: newSessionId,
        date: new Date().toISOString(),
        partId: '',
        partName: '',
        transcript: [],
        integrationNote: '',
        currentPhase: 'IDENTIFY',
        linkedInsightId: insightContext?.id, // Link to insight if provided
      };
      setSession(initialSession);
      setCurrentPhase('IDENTIFY');
      setHasStartedSession(false); // Show intro for new session
      setIsPartProfileAnalyzed(false);
      setIsAnalyzingPartProfile(false);
      setPhaseSuggestion(null);
      setSummaryData(null);
      setError(null);
      setRetryFn(null);

    }
  }, [draft, insightContext]);

  // Reset phase guide dismissed state when phase changes
  useEffect(() => {
    setPhaseGuideDismissed(false);
  }, [currentPhase]);

  // Scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [session?.transcript]);

  // Auto-close wizard after save completes
  useEffect(() => {
    if (isClosing) {
      const timer = setTimeout(() => onClose(null), 1500);
      return () => clearTimeout(timer);
    }
  }, [isClosing, onClose]);

  // Shared phase advancement — deduplicates sidebar, mobile panel, and phaseSuggestion logic
  const advanceToPhase = (nextPhase: WizardPhase) => {
    setCurrentPhase(nextPhase);
    setSession(prev => prev ? { ...prev, currentPhase: nextPhase } : prev);
    setPhaseSuggestion(null);
    setPhaseGuideDismissed(false); // show guide for new phase
    if (currentPhase === 'UNBURDEN' && nextPhase !== 'UNBURDEN') {
      setUnburdenReady(false); // reset gate if re-entering later
    }
    if ((nextPhase === 'DEEPEN' || nextPhase === 'UNBURDEN') && !isPartProfileAnalyzed && !isAnalyzingPartProfile) {
      setTimeout(() => getPartInfo(), 500);
    }
    if (nextPhase === 'CLOSING' && !summaryData) {
      setTimeout(() => summarizeSession(), 500);
    }
  };

  const advanceToNextPhase = () => {
    const phases: WizardPhase[] = ['IDENTIFY', 'EXPLORE', 'DEEPEN', 'UNBURDEN', 'INTEGRATE', 'CLOSING'];
    const nextIdx = phases.indexOf(currentPhase) + 1;
    if (nextIdx < phases.length) advanceToPhase(phases[nextIdx]);
  };

  const detectAndProgressPhase = (botText: string, currentPhase: WizardPhase): WizardPhase => {
    const lowerText = botText.toLowerCase();

    // Detect phase transition signals in bot's response
    const phaseKeywords: Record<WizardPhase, RegExp[]> = {
      'IDENTIFY': [],
      'EXPLORE': [
        /let'?s (?:explore|start exploring|deepen our exploration)/i,
        /ready to explore/i,
        /so let'?s explore/i,
      ],
      'DEEPEN': [
        /let'?s deepen/i,
        /want to deepen|explore more deeply/i,
        /dive deeper|let'?s go deeper/i,
      ],
      'UNBURDEN': [],
      'INTEGRATE': [
        /let'?s integrate|integration now/i,
        /what did you learn|what'?s the shift|synthesiz/i,
        /bring this together|grateful|thank/i,
      ],
      'CLOSING': [
        /closing|final thoughts|wrap up|ground yourself/i,
      ],
    };

    // Check for explicit phase transition signals
    const phases: WizardPhase[] = ['IDENTIFY', 'EXPLORE', 'DEEPEN', 'UNBURDEN', 'INTEGRATE', 'CLOSING'];
    const currentPhaseIndex = phases.indexOf(currentPhase);

    for (let i = currentPhaseIndex + 1; i < phases.length; i++) {
      const nextPhase = phases[i];
      for (const keyword of phaseKeywords[nextPhase]) {
        if (keyword.test(lowerText)) {
          return nextPhase;
        }
      }
    }

    return currentPhase;
  };

  const parsePhaseSuggestion = (botText: string): WizardPhase | null => {
    const match = botText.match(/\[SUGGEST_PHASE:\s*(\w+)\s*\]/);
    if (match && match[1]) {
      const suggestion = match[1].trim().toUpperCase();
      const phases: WizardPhase[] = ['IDENTIFY', 'EXPLORE', 'DEEPEN', 'UNBURDEN', 'INTEGRATE', 'CLOSING'];
      if (phases.includes(suggestion as WizardPhase)) {
        return suggestion as WizardPhase;
      }
    }
    return null;
  };

  const updateTranscript = (role: 'user' | 'bot', text: string, phase: WizardPhase) => {
    setSession(prev => {
      if (!prev) return null;

      let updatedPhase = phase;

      // If this is a bot message, check for phase progression signals
      if (role === 'bot') {
        updatedPhase = detectAndProgressPhase(text, phase);

        // Update current phase if it changed
        if (updatedPhase !== phase) {
          setCurrentPhase(updatedPhase);
        }
      }

      const newTranscript = [...prev.transcript, { role, text, phase: updatedPhase }];
      return { ...prev, transcript: newTranscript, currentPhase: updatedPhase };
    });
  };

  // Send text message and get AI response (extracted helper)
  const sendText = async (text: string) => {
    const trimmedInput = text.trim();
    if (!trimmedInput || isSending) return;

    // Crisis detection — check before sending to AI
    const detected = detectCrisisLevel(trimmedInput);
    setCrisisLevel(detected);
    if (detected === 'high') {
      // Suppress AI response for high-crisis content; add user message + grounding bot message
      setSession(prev => {
        if (!prev) return null;
        const userMsg = { role: 'user' as const, text: trimmedInput, phase: prev.currentPhase };
        const crisisMsg = {
          role: 'bot' as const,
          text: "I noticed something significant in what you just shared. I'm pausing our session here — not because your experience doesn't matter, but because what you're describing deserves more than this space can offer right now.\n\nIf you're in crisis, please reach out to the 988 Suicide & Crisis Lifeline (call or text 988 in the US) or a trusted person. You don't have to be alone with this.\n\nWhen you're ready, this session will be here.",
          phase: prev.currentPhase,
        };
        return { ...prev, transcript: [...prev.transcript, userMsg, crisisMsg] };
      });
      return;
    }

    setIsSending(true);
    setError('');
    setRetryFn(null);

    try {
      // Add user message to transcript
      setSession(prev => {
        if (!prev) return null;
        const newTranscript = [...prev.transcript, {
          role: 'user' as const,
          text: trimmedInput,
          phase: prev.currentPhase,
        }];
        return { ...prev, transcript: newTranscript };
      });

      // Get AI response via Grok 4.1
      const systemInstruction = getDynamicSystemInstruction(insightContext, currentPhase);
      const conversationHistory = session?.transcript.map(entry => ({
        role: entry.role === 'user' ? 'user' : 'assistant',
        content: entry.text,
      })) || [];

      conversationHistory.push({ role: 'user', content: trimmedInput });

      const botResponse = await getCoachResponse(
        systemInstruction,
        conversationHistory,
        session?.currentPhase || 'IDENTIFY'
      );

      // Parse phase suggestion
      const suggestion = parsePhaseSuggestion(botResponse);
      if (suggestion) {
        setPhaseSuggestion(suggestion);
      }

      // Clean bot response
      const cleanBotText = botResponse.replace(/\[SUGGEST_PHASE:\s*\w+\s*\]/g, '').trim();

      // Speak bot response via integrated TTS (fire-and-forget)
      voiceIO.speakText(cleanBotText).catch((err) => console.error('[IFS] TTS speak error:', err));

      // Add bot response to transcript
      setSession(prev => {
        if (!prev) return null;
        const newTranscript = [...prev.transcript, {
          role: 'bot' as const,
          text: cleanBotText,
          phase: prev.currentPhase,
        }];

        const currentPhase = prev.currentPhase;
        const newPhase = detectAndProgressPhase(cleanBotText, currentPhase);

        // Trigger part profile analysis
        if ((currentPhase === 'DEEPEN' || currentPhase === 'UNBURDEN') && !isPartProfileAnalyzed && !isAnalyzingPartProfile) {
          setTimeout(() => getPartInfo(), 500);
        }

        // Trigger summary
        if (currentPhase === 'CLOSING' && newPhase === 'CLOSING' && !summaryData) {
          setTimeout(() => summarizeSession(), 500);
        }

        return { ...prev, transcript: newTranscript, currentPhase: newPhase };
      });

    } catch (err) {
      console.error('[IFS] Error sending message:', err);
      setError('The AI didn\'t respond. Check your connection and try again.');
      setRetryFn(() => () => {
        const currentInput = userInputRef.current.trim();
        sendText(currentInput || trimmedInput);
      });
    } finally {
      setIsSending(false);
    }
  };

  // Send message from textarea (uses userInput state)
  const sendMessage = async () => {
    const text = userInput.trim();
    if (!text) return;
    setUserInput('');
    userInputRef.current = '';
    await sendText(text);
  };

  const handleClose = (draftSession: IFSSession | null) => {
    onClose(draftSession);
  };

  const handleCloseAndSave = async (finalSession: IFSSession) => {
    await handleSaveAndClose(finalSession);
  };

  const handleFinish = () => {
    if (!session) return;
    setShowPostSessionCheck(true);
  };

  const submitPostSessionCheck = async () => {
    if (!session || postAffect === null || !postWillingness) return;
    const check = {
      affect: postAffect,
      partWord: postPartWord.trim(),
      willingness: postWillingness,
      adverseFlag: postAffect <= 2,
    };
    const finalSession = { ...session, postSessionCheck: check };
    setIsClosing(true);
    await handleSaveAndClose(finalSession);
  };

  const getPartInfo = async () => {
    if (!session || isAnalyzingPartProfile) return;
    setIsAnalyzingPartProfile(true);
    setError('');
    setRetryFn(null);
    try {
      const fullTranscript = session.transcript.map(entry => `${entry.role}: ${entry.text}`).join('\n');
      const info = await extractPartInfo(fullTranscript);
      setSession(prev => ({ ...prev!, partRole: info.role, partFears: info.fears, partPositiveIntent: info.positiveIntent }));
      setIsPartProfileAnalyzed(true);
    } catch (e) {
      console.error("Error extracting part info:", e);
      setError("The AI couldn't analyze the part profile. You can retry or continue without it.");
      setRetryFn(() => getPartInfo());
    } finally {
      setIsAnalyzingPartProfile(false);
    }
  };

  const summarizeSession = async () => {
    if (!session || isSummarizing) return;
    setIsSummarizing(true);
    setError('');
    setRetryFn(null);
    try {
      // Build prior context from insights
      const priorContext = buildPriorContext(insights || []);
      if (priorContext.body || priorContext.mind || priorContext.spirit || priorContext.shadow) {
        priorContext.crossModalPatterns = await detectCrossModalPatternsWithAI(priorContext);
      }

      const fullTranscript = session.transcript.map(entry => `${entry.role}: ${entry.text}`).join('\n');
      // FIX: Use the correct properties for part info when summarizing.
      const partInfo = {
        role: session.partRole || '',
        fears: session.partFears || '',
        positiveIntent: session.partPositiveIntent || '',
      };
      const { summary, aiIndications } = await summarizeIFSSession(fullTranscript, partInfo, priorContext);
      setSummaryData({ summary, aiIndications });
      setSession(prev => ({ ...prev!, summary, aiIndications, currentPhase: 'CLOSING' }));
      setCurrentPhase('CLOSING');
    } catch (e) {
      console.error("Error summarizing session:", e);
      setError("The AI couldn't generate a session summary. You can retry or save without one.");
      setRetryFn(() => summarizeSession());
    } finally {
      setIsSummarizing(false);
    }
  };

  // Phase-specific entry prompts — collapsible, opens on IDENTIFY, closes on subsequent phases
  const guidedPhases: WizardPhase[] = ['IDENTIFY', 'EXPLORE', 'DEEPEN', 'INTEGRATE'];
  const renderPhaseGuide = () => {
    if (!guidedPhases.includes(currentPhase)) {
      return null;
    }

    const phaseContent: Record<WizardPhase, { text: string; textarea?: boolean; fives?: boolean }> = {
      'IDENTIFY': {
        text: 'Close your eyes. Scan your body — where do you notice *this*? A tightness, heat, weight? Let the part show itself physically before you speak to it.',
      },
      'EXPLORE': {
        text: 'Ask the part: What\'s your job? How long have you been doing this? What are you afraid would happen if you stopped?',
      },
      'DEEPEN': {
        text: 'Feel toward this part with curiosity: What has it been carrying? What does it most need you to know?',
        fives: true,
      },
      'UNBURDEN': {
        text: 'If your part is ready: ask what it most wants to release. Has it had enough time to be fully heard? Only proceed when there is genuine openness.',
      },
      'INTEGRATE': {
        text: 'Welcome this part back. What role does it want going forward? What\'s different now?',
      },
      'CLOSING': {
        text: 'Take three slow breaths. Feel your feet on the floor. You are Self — not any part. What do you want to carry forward from today?',
        textarea: true,
      },
    };

    const content = phaseContent[currentPhase];
    if (!content.text) return null;

    return (
      <div className="bg-stone-900/80 border border-purple-900/30 rounded-2xl p-4 mx-3 mb-3 relative backdrop-blur-sm">
        <button
          onClick={() => setGuideOpen(v => !v)}
          aria-expanded={guideOpen}
          aria-controls={`ifs-guide-${currentPhase}`}
          className="w-full flex items-center justify-between mb-1 group"
        >
          <h3 className="text-xs sm:text-sm font-serif font-semibold text-purple-300 flex items-center gap-1.5">
            <span className="text-purple-500">✦</span> Phase Guide
          </h3>
          <span className={`text-stone-500 group-hover:text-stone-300 transition-all duration-300 motion-reduce:transition-none text-xs ${guideOpen ? 'rotate-180' : ''}`}>▾</span>
        </button>
        <div
          id={`ifs-guide-${currentPhase}`}
          role="region"
          aria-hidden={!guideOpen}
          className={`transition-all duration-300 ease-in-out overflow-hidden motion-reduce:transition-none ${guideOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <p className="text-xs sm:text-sm text-stone-300 mb-3 mt-2 leading-relaxed">{content.text}</p>
          {content.textarea && (
            <textarea
              value={currentPhase === 'CLOSING' ? (session?.integrationNote || '') : somaticNote}
              onChange={(e) => {
                if (currentPhase === 'CLOSING') {
                  setSession(prev => prev ? { ...prev, integrationNote: e.target.value } : prev);
                } else {
                  setSomaticNote(e.target.value);
                  setSession(prev => prev ? { ...prev, integrationNote: e.target.value } : prev);
                }
              }}
              placeholder={currentPhase === 'CLOSING' ? "What do you want to carry forward from today?" : "Where in your body do you feel it?"}
              rows={2}
              className="w-full bg-stone-950/80 border border-stone-700/50 text-stone-100 placeholder-stone-600 rounded-xl px-3 py-2 text-xs mb-2 focus:outline-none focus:ring-2 focus:ring-purple-500/40 resize-none transition-all"
            />
          )}
          {content.fives && (
            <div className="flex flex-wrap gap-2 mb-2 text-xs text-stone-300">
              <span className="px-2.5 py-1 rounded-lg bg-stone-800/60 border border-stone-700/40">Find</span>
              <span className="px-2.5 py-1 rounded-lg bg-stone-800/60 border border-stone-700/40">Focus</span>
              <span className="px-2.5 py-1 rounded-lg bg-stone-800/60 border border-stone-700/40">Flesh Out</span>
              <span className="px-2.5 py-1 rounded-lg bg-stone-800/60 border border-stone-700/40">Feel Toward</span>
              <span className="px-2.5 py-1 rounded-lg bg-stone-800/60 border border-stone-700/40">Befriend</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Task 5: UNBURDEN ritual UI — gated behind readiness confirmation
  const renderUnburdenRitual = () => {
    if (currentPhase !== 'UNBURDEN') return null;

    // Readiness gate: user must confirm before ritual appears
    if (!unburdenReady) {
      return (
        <div className="bg-rose-950/20 border border-rose-800/30 rounded-2xl p-4 mx-3 mb-3">
          <h3 className="text-xs sm:text-sm font-serif font-semibold text-rose-300 mb-2">✦ Before the Unburdening</h3>
          <p className="text-xs text-rose-200/60 mb-3 leading-relaxed">
            Before proceeding: has the protective part given clear, explicit permission to go deeper? Has the exile felt genuinely heard — not just acknowledged? Rushing past a protector's hesitation can close things down. Only proceed when there is genuine openness, not just willingness to try.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setUnburdenReady(true)}
              className="flex-1 bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 text-white px-3 py-2.5 rounded-xl text-xs font-medium transition-all shadow-lg shadow-rose-900/30"
            >
              Yes — it\'s ready
            </button>
            <button
              onClick={() => advanceToPhase('INTEGRATE')}
              className="flex-1 bg-stone-800/60 hover:bg-stone-700 text-stone-300 px-3 py-2.5 rounded-xl text-xs font-medium transition-all"
            >
              Not quite — skip to Integrate
            </button>
          </div>
        </div>
      );
    }

    const isComplete = unburdenRelease.trim() && unburdenElement && unburdenOffer.trim();

    const handlePerformRitual = async () => {
      const ritualText = `[Unburdening Ritual]\nReleasing: ${unburdenRelease}\nSending it: ${unburdenElement}\nSelf offers: ${unburdenOffer}`;
      setUnburdenRelease('');
      setUnburdenElement('light');
      setUnburdenOffer('');
      await sendText(ritualText);
    };

    return (
      <div className="bg-rose-950/20 border border-rose-800/30 rounded-2xl p-4 mx-3 mb-3">
        <h3 className="text-xs sm:text-sm font-serif font-semibold text-rose-300 mb-1">✦ The Unburdening</h3>
        <p className="text-xs text-rose-200/50 mb-4 italic">A ritual for release</p>

        <div className="space-y-3">
          {/* Field 1: What to release */}
          <div>
            <label className="block text-xs text-stone-400 font-medium mb-1.5">What does this part want to release?</label>
            <textarea
              value={unburdenRelease}
              onChange={(e) => setUnburdenRelease(e.target.value)}
              rows={2}
              placeholder="Describe what this part has been carrying..."
              className="w-full bg-stone-950/80 border border-stone-700/50 text-stone-100 placeholder-stone-600 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/40 resize-none transition-all"
            />
          </div>

          {/* Field 2: Element selection */}
          <div>
            <label className="block text-xs text-stone-400 font-medium mb-1.5">Where will you send it?</label>
            <select
              value={unburdenElement}
              onChange={(e) => setUnburdenElement(e.target.value)}
              className="w-full bg-stone-950/80 border border-stone-700/50 text-stone-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/40 transition-all"
            >
              <option value="light">into the light</option>
              <option value="water">into water</option>
              <option value="fire">into fire</option>
              <option value="earth">into earth</option>
              <option value="wind">into the wind</option>
            </select>
          </div>

          {/* Field 3: Self's offer */}
          <div>
            <label className="block text-xs text-stone-400 font-medium mb-1.5">What does Self offer in return?</label>
            <textarea
              value={unburdenOffer}
              onChange={(e) => setUnburdenOffer(e.target.value)}
              rows={2}
              placeholder="What does Self want to offer this part instead..."
              className="w-full bg-stone-950/80 border border-stone-700/50 text-stone-100 placeholder-stone-600 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/40 resize-none transition-all"
            />
          </div>
        </div>

        {/* Perform button */}
        <button
          onClick={handlePerformRitual}
          disabled={!isComplete || isSending || isSaving}
          className="w-full mt-4 bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-rose-900/30"
        >
          Perform the Unburdening
        </button>
      </div>
    );
  };

  const renderPostSessionCheck = () => {
    const affectLabels = ['Much worse', 'Worse', 'Same', 'Better', 'Much better'];
    const canSubmit = postAffect !== null && postWillingness !== null;
    return (
      <div className="fixed inset-0 z-[60] bg-stone-950/95 backdrop-blur-md flex items-center justify-center p-4">
        <div className="max-w-sm w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center">
            <MerkabaIcon size={40} className="mx-auto text-purple-400/60 mb-3" />
            <h2 className="font-serif text-xl text-stone-100">Before you go</h2>
            <p className="text-xs text-stone-500 mt-1">Three quick questions</p>
          </div>

          {/* Q1: Affect */}
          <div className="bg-stone-900/60 border border-stone-800/50 rounded-2xl p-4">
            <p className="text-sm text-stone-300 mb-3">How do you feel right now compared to when you started?</p>
            <div className="flex gap-1.5">
              {affectLabels.map((label, i) => (
                <button
                  key={i}
                  onClick={() => setPostAffect(i + 1)}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-medium transition-all text-center leading-tight ${
                    postAffect === i + 1
                      ? 'bg-purple-700 border border-purple-500/60 text-white'
                      : 'bg-stone-800/60 border border-stone-700/40 text-stone-400 hover:border-purple-700/40'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {postAffect !== null && postAffect <= 2 && (
              <p className="text-[11px] text-amber-400/80 mt-2">If you're feeling unsettled, take a few minutes before moving on. You can return to this session anytime.</p>
            )}
          </div>

          {/* Q2: One word */}
          <div className="bg-stone-900/60 border border-stone-800/50 rounded-2xl p-4">
            <p className="text-sm text-stone-300 mb-2">One word for the part you worked with today</p>
            <input
              type="text"
              value={postPartWord}
              onChange={(e) => setPostPartWord(e.target.value)}
              placeholder="e.g. guardian, critic, young one..."
              className="w-full bg-stone-950/80 border border-stone-700/50 text-stone-100 placeholder-stone-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
            />
          </div>

          {/* Q3: Willingness to return */}
          <div className="bg-stone-900/60 border border-stone-800/50 rounded-2xl p-4">
            <p className="text-sm text-stone-300 mb-3">Would you return to work with this part?</p>
            <div className="flex gap-2">
              {(['yes', 'maybe', 'no'] as const).map(opt => (
                <button
                  key={opt}
                  onClick={() => setPostWillingness(opt)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all capitalize ${
                    postWillingness === opt
                      ? 'bg-purple-700 border border-purple-500/60 text-white'
                      : 'bg-stone-800/60 border border-stone-700/40 text-stone-400 hover:border-purple-700/40'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={submitPostSessionCheck}
            disabled={!canSubmit || isClosing}
            className="w-full py-3 bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-600 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all shadow-lg shadow-purple-900/30 text-sm"
          >
            {isClosing ? 'Saving…' : 'Save & Close'}
          </button>
        </div>
      </div>
    );
  };

  const renderMobileInfoPanel = () => (
    <div className="lg:hidden border-t border-stone-800/50">
      {/* Toggle Bar */}
      <button
        onClick={() => setShowMobilePanel(!showMobilePanel)}
        className="w-full px-4 py-2.5 flex items-center justify-between text-sm bg-stone-900/60 hover:bg-stone-900 transition-colors"
      >
        <span className="text-stone-300 font-medium text-xs">
          {PHASE_CONFIG[currentPhase].label}
        </span>
        {showMobilePanel ? <ChevronDown size={16} className="text-stone-500" /> : <ChevronUp size={16} className="text-stone-500" />}
      </button>

      {/* Collapsible Content */}
      {showMobilePanel && (
        <div className="p-3 space-y-3 max-h-[40vh] overflow-y-auto animate-in fade-in duration-200" style={{ background: 'linear-gradient(180deg, rgba(9,9,11,0.9) 0%, rgba(15,10,25,0.95) 100%)' }}>
          {/* Current Phase */}
          <div className={`bg-gradient-to-r ${PHASE_CONFIG[currentPhase].color} p-px rounded-xl shadow-md ${PHASE_CONFIG[currentPhase].glow}`}>
            <div className="bg-stone-950 p-2.5 rounded-xl">
              <p className="font-serif font-semibold text-stone-100 text-xs">{PHASE_CONFIG[currentPhase].label}</p>
              <p className="text-[11px] text-stone-400 mt-1">{PHASE_CONFIG[currentPhase].description}</p>
            </div>
          </div>

          {/* Part Profile (if available) */}
          {session && currentPhase !== 'CLOSING' && (session.partName || session.partRole || isAnalyzingPartProfile) && (
            <div className="bg-gradient-to-br from-stone-900/80 to-stone-950/60 border border-purple-900/30 rounded-xl p-3">
              <p className="text-[10px] font-semibold text-stone-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MerkabaIcon size={12} className="text-purple-400" />
                Part Profile
                {isAnalyzingPartProfile && (
                  <span className="ml-auto text-purple-400 flex items-center gap-1">
                    <div className="w-2.5 h-2.5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                  </span>
                )}
              </p>
              <div className="space-y-1.5">
                {[['Name', session.partName], ['Role', session.partRole], ['Fears', session.partFears], ['Intent', session.partPositiveIntent]].map(([label, val]) => (
                  <div key={label}>
                    <span className="text-[10px] font-semibold text-stone-600 uppercase tracking-wider">{label}</span>
                    <p className="text-[11px] text-stone-300">{val || <span className="text-stone-700 italic">not yet identified</span>}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Insight Context */}
          {insightContext && (
            <div className="bg-gradient-to-br from-stone-900/80 to-stone-950/60 border border-stone-700/40 rounded-xl p-3 space-y-1.5">
              <p className="text-[10px] font-semibold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb size={12} className="text-purple-400" /> Insight Context
              </p>
              <p className="text-[11px] text-stone-300">{insightContext.detectedPattern}</p>
              <p className="text-[10px] text-stone-600">From: {insightContext.mindToolType}</p>
            </div>
          )}

          {/* Phase Suggestion (if any) */}
          {phaseSuggestion && (
            <div className="bg-purple-900/60 border border-purple-500/30 rounded-xl p-3">
              <p className="text-xs text-purple-200 mb-2">Aura suggests: <strong className="text-stone-100">{phaseSuggestion.replace('_', ' ')}</strong></p>
              <div className="flex gap-2">
                <button
                  onClick={() => { if (!phaseSuggestion) return; advanceToPhase(phaseSuggestion); }}
                  className="flex-1 px-2.5 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-white text-xs font-semibold transition-all"
                >
                  Proceed
                </button>
                <button
                  onClick={() => setPhaseSuggestion(null)}
                  className="flex-1 px-2.5 py-2 bg-stone-800/60 hover:bg-stone-700 rounded-xl text-stone-400 text-xs transition-all"
                >
                  Stay
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const startVoiceSession = () => {
    try {
      voiceIO.startRecording();
      setVoiceMode('voice');
    } catch (err) {
      console.error('[IFS] Voice session start error:', err);
    }
  };

  const stopVoiceSession = () => {
    voiceIO.stopRecording();
    setVoiceMode('text');
  };

  const renderChat = () => (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(88,28,135,0.08) 0%, transparent 60%)' }}>
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4">
        {session?.transcript.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in duration-700">
            <div className="relative mb-5">
              <div className="absolute inset-0 bg-purple-500/15 blur-3xl rounded-full animate-pulse" />
              <MerkabaIcon size={56} className="relative text-purple-400/60" />
            </div>
            <p className="text-stone-400 text-sm max-w-sm leading-relaxed">
              {insightContext ? (
                `Welcome to your IFS session, starting from your insight about "${insightContext.detectedPattern}". Before we find the part, notice how you feel right now — are you curious, open, and relatively settled?`
              ) : (
                `Welcome to your IFS session. Before we find the part — take a breath and notice: are you feeling curious and open right now, or reactive and pulled? What's alive in you today?`
              )}
            </p>
          </div>
        )}
        {session?.transcript.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in duration-300`}>
            <span className={`text-[10px] font-medium uppercase tracking-wider mb-1 ${msg.role === 'user' ? 'text-purple-400/70' : 'text-stone-600'}`}>
              {msg.role === 'user' ? 'You' : 'Aura'}
            </span>
            <div className={`px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl max-w-[88%] sm:max-w-[80%] text-sm leading-relaxed ${msg.role === 'user'
              ? 'bg-purple-900/30 border border-purple-500/20 text-stone-100 rounded-tr-sm shadow-lg shadow-purple-900/10'
              : 'bg-stone-900/60 border border-stone-700/40 text-stone-200 rounded-tl-sm'
              }`}>
              {msg.role === 'bot'
                ? msg.text.split(/\*\*(.+?)\*\*/g).map((chunk, i) =>
                  i % 2 === 1
                    ? <strong key={i} className="font-semibold text-stone-100">{chunk}</strong>
                    : <span key={i}>{chunk}</span>
                )
                : msg.text
              }
            </div>
          </div>
        ))}
        {isSending && (
          <div className="flex items-start">
            <div className="flex items-center gap-1.5 px-4 py-3 bg-stone-900/60 border border-stone-700/40 rounded-2xl rounded-tl-sm">
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
      </div>
      {/* Phase Guide / Unburdening Ritual */}
      {renderPhaseGuide()}
      {renderUnburdenRitual()}

      {/* Text Input Area */}
      <div className="border-t border-stone-800/60 p-3 sm:p-4 bg-stone-950/80">
        {crisisLevel !== 'none' && (
          <SafetyBanner crisisLevel={crisisLevel} className="mb-3" />
        )}
        <div className="flex gap-2 sm:gap-3 items-end">
          <textarea
            value={userInput}
            onChange={(e) => { setUserInput(e.target.value); userInputRef.current = e.target.value; }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type..."
            className="flex-1 bg-stone-900/60 border border-stone-700/50 text-stone-100 placeholder-stone-600 rounded-xl px-3 sm:px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/40 transition-all"
            rows={2}
            disabled={isSending || isSaving || isClosing}
          />
          <button
            onClick={sendMessage}
            disabled={!userInput.trim() || isSending || isSaving}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-600 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all shadow-lg shadow-purple-900/30 self-end min-h-[44px] shrink-0"
          >
            {isSending ? '...' : '→'}
          </button>
        </div>
        {/* Voice input — gated behind disclosure to reduce default cognitive load */}
        <div className="mt-1.5">
          <button
            onClick={() => setShowVoiceOptions(v => !v)}
            aria-expanded={showVoiceOptions}
            aria-controls="ifs-voice-panel"
            className="text-[11px] text-stone-600 hover:text-purple-400 transition-colors motion-reduce:transition-none"
          >
            {showVoiceOptions ? 'Hide voice input' : 'Voice input'}
          </button>
          <div
            id="ifs-voice-panel"
            role="region"
            aria-hidden={!showVoiceOptions}
            className={`transition-all duration-300 ease-in-out overflow-hidden motion-reduce:transition-none ${showVoiceOptions ? 'max-h-24 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}
          >
            <div className="flex items-center gap-3">
              {/* Integrated voice mic button */}
              <button
                onClick={() => {
                  if (voiceIO.state === 'recording') {
                    voiceIO.stopRecording();
                  } else if (voiceIO.state === 'speaking') {
                    voiceIO.cancelSpeaking();
                  } else if (voiceIO.state === 'idle') {
                    setVoiceIOError(null);
                    voiceIO.startRecording();
                  }
                }}
                disabled={isSending || isSaving || isClosing || voiceIO.state === 'transcribing'}
                title={
                  voiceIO.state === 'recording' ? 'Stop recording'
                  : voiceIO.state === 'transcribing' ? 'Transcribing…'
                  : voiceIO.state === 'speaking' ? 'Stop speaking'
                  : voiceIO.state === 'error' ? 'Voice error — click to retry'
                  : 'Speak your response'
                }
                className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border transition-all shrink-0 ${
                  voiceIO.state === 'recording'
                    ? 'bg-red-950/60 border-red-500/50 text-red-400 animate-pulse'
                    : voiceIO.state === 'transcribing'
                    ? 'bg-stone-900/60 border-stone-700/40 text-stone-400 cursor-not-allowed'
                    : voiceIO.state === 'speaking'
                    ? 'bg-purple-950/60 border-purple-500/50 text-purple-400'
                    : voiceIO.state === 'error'
                    ? 'bg-rose-950/60 border-rose-500/50 text-rose-400'
                    : 'bg-stone-900/60 border-stone-700/40 text-purple-400 hover:border-purple-500/40 hover:bg-purple-950/30'
                }`}
              >
                {voiceIO.state === 'transcribing' ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : voiceIO.state === 'speaking' ? (
                  <Volume2 size={18} />
                ) : voiceIO.state === 'error' ? (
                  <AlertCircle size={18} />
                ) : (
                  <Mic size={18} />
                )}
              </button>
              <span className="text-[11px] text-stone-600">
                {voiceIO.state === 'recording' ? 'Recording… tap to stop'
                  : voiceIO.state === 'transcribing' ? 'Transcribing…'
                  : voiceIO.state === 'speaking' ? 'Speaking… tap to stop'
                  : 'Tap mic to speak your response'}
              </span>
            </div>
            {voiceIOError && (
              <p className="text-[11px] text-rose-400 mt-1">{voiceIOError}</p>
            )}
          </div>
        </div>
        <p className="text-[11px] text-stone-600 mt-2">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );

  const renderIntroScreen = () => (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero */}
      <div className="text-center">
        <div className="relative mb-5 flex justify-center">
          <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full animate-pulse" />
          <MerkabaIcon size={72} className="relative text-purple-400 drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]" />
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl text-stone-100 mb-2 drop-shadow-[0_0_12px_rgba(168,85,247,0.3)]">
          Internal Family Systems
        </h2>
        <p className="text-sm sm:text-base text-stone-400 max-w-md mx-auto leading-relaxed">A sacred dialogue with the voices within</p>
        <p className="text-[11px] sm:text-xs text-stone-600 mt-2">~15–30 minutes &middot; best without interruption</p>
      </div>

      {/* What to Expect */}
      <div className="bg-gradient-to-br from-stone-900/80 to-stone-950/60 border border-purple-900/30 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl shadow-purple-950/10">
        <div>
          <h3 className="text-sm sm:text-base font-serif font-semibold text-purple-300 mb-2 flex items-center gap-2">
            <span className="text-purple-500">✦</span> What to Expect
          </h3>
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
            Through guided dialogue, you'll explore one part of yourself across 6 phases. Aura will help you understand what this part is protecting you from, what it fears, and how to integrate it with compassion.
          </p>
        </div>

        {/* The 6 Phases */}
        <div>
          <h3 className="text-sm sm:text-base font-serif font-semibold text-purple-300 mb-3 flex items-center gap-2">
            <span className="text-purple-500">✦</span> The Journey
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {(['Identify', 'Explore', 'Deepen', 'Unburden', 'Integrate', 'Closing'] as const).map((phase, i) => (
              <div key={phase} className="bg-stone-950/60 border border-stone-800/50 rounded-xl p-3 text-center hover:border-purple-700/40 transition-all duration-300"
                style={{ animationDelay: `${i * 80}ms` }}>
                <span className="text-purple-400 font-bold text-xs">{i + 1}</span>
                <p className="text-xs text-stone-300 mt-0.5 font-medium">{phase}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Safety disclaimer */}
      <DisclaimerBanner />

      {/* Opening question */}
      <div className="bg-gradient-to-br from-stone-900/80 to-stone-950/60 border border-stone-700/40 rounded-2xl p-5 sm:p-6 shadow-xl">
        <label className="block text-sm font-serif font-semibold text-stone-300 mb-3">
          What's alive in you right now?
          <span className="text-stone-600 font-normal text-xs ml-2">(optional — skip to begin)</span>
        </label>
        <textarea
          value={introOpeningInput}
          onChange={(e) => setIntroOpeningInput(e.target.value)}
          placeholder="A feeling, a tension, a part that keeps showing up..."
          rows={3}
          className="w-full bg-stone-950/80 border border-stone-700/50 rounded-xl p-3.5 text-stone-100 placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/40 resize-none text-sm transition-all"
        />
      </div>

      {/* Prior Sessions */}
      {priorSessions.length > 0 && (
        <div className="bg-stone-900/40 border border-stone-800/50 rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowPriorSessions(v => !v)}
            className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-stone-800/30 transition-colors"
          >
            <span className="text-xs font-mono tracking-wide uppercase text-stone-500">
              {priorSessions.length} prior session{priorSessions.length !== 1 ? 's' : ''}
            </span>
            {showPriorSessions ? <ChevronUp size={14} className="text-stone-600" /> : <ChevronDown size={14} className="text-stone-600" />}
          </button>
          {showPriorSessions && (
            <div className="border-t border-stone-800/50 divide-y divide-stone-800/30">
              {priorSessions.map((s, i) => (
                <div key={s.id || i} className="px-5 py-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-500 font-mono">
                      {new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    {s.currentPhase && (
                      <span className="text-[10px] text-purple-400/70 font-mono uppercase tracking-wide">{s.currentPhase}</span>
                    )}
                  </div>
                  {s.primaryPart?.name && (
                    <p className="text-xs text-stone-300 font-medium">Part: {s.primaryPart.name}</p>
                  )}
                  {s.primaryPart?.role && (
                    <p className="text-xs text-stone-500 leading-relaxed line-clamp-2">{s.primaryPart.role}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Self-energy baseline */}
      <div className="bg-gradient-to-br from-stone-900/80 to-stone-950/60 border border-stone-700/40 rounded-2xl p-5 sm:p-6 shadow-xl">
        <p className="text-sm font-serif font-semibold text-stone-300 mb-1">How settled do you feel right now?</p>
        <p className="text-xs text-stone-600 mb-4">Parts work is easier when you're relatively present. This is just for your awareness.</p>
        <div className="flex gap-1.5">
          {[
            { score: 1, label: 'Flooded' },
            { score: 2, label: 'Unsettled' },
            { score: 3, label: 'Neutral' },
            { score: 4, label: 'Open' },
            { score: 5, label: 'Settled' },
          ].map(({ score, label }) => (
            <button
              key={score}
              onClick={() => setSelfEnergyScore(score)}
              className={`flex-1 py-2.5 rounded-xl text-[11px] font-medium transition-all text-center leading-tight ${
                selfEnergyScore === score
                  ? 'bg-purple-800 border border-purple-500/60 text-white'
                  : 'bg-stone-900/60 border border-stone-800/50 text-stone-500 hover:border-purple-700/40 hover:text-stone-300'
              }`}
            >
              {score}<br /><span className="text-[10px]">{label}</span>
            </button>
          ))}
        </div>
        {selfEnergyScore !== null && selfEnergyScore <= 2 && (
          <p className="text-xs text-amber-400/80 mt-3 leading-relaxed">
            You can still begin — but consider taking a few slow breaths first. A flooded or defended state makes it harder to access Self-energy. There's no rush.
          </p>
        )}
      </div>

      {/* CTA Button */}
      <button
        onClick={() => {
          const baseline = selfEnergyScore ?? undefined;
          setHasStartedSession(true);
          setSession(prev => prev ? { ...prev, selfEnergyBaseline: baseline } : prev);
          if (introOpeningInput.trim()) {
            // Queue the message to send once chat mounts
            setTimeout(() => sendText(introOpeningInput.trim()), 100);
            setIntroOpeningInput('');
          }
        }}
        className="w-full py-3.5 bg-gradient-to-r from-purple-700 via-purple-600 to-purple-700 hover:from-purple-600 hover:via-purple-500 hover:to-purple-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-purple-900/40 hover:shadow-xl hover:shadow-purple-800/50 min-h-[44px] text-sm sm:text-base transform hover:scale-[1.02] active:scale-[0.98]"
      >
        Begin Session
      </button>
    </div>
  );

  // If intro not started, show standalone intro screen — full-screen like DBT
  if (!hasStartedSession) {
    return (
      <div className="fixed inset-0 z-50 bg-stone-950 text-stone-100 overflow-y-auto" style={{ height: '100dvh' }}>
        {/* Close */}
        <button
          onClick={() => handleClose(null)}
          className="fixed top-4 right-4 z-[60] w-10 h-10 flex items-center justify-center rounded-full bg-purple-900/60 hover:bg-purple-800 text-purple-400 hover:text-purple-300 transition-colors min-h-[44px] min-w-[44px]"
          aria-label="Close"
        >
          <X size={20} />
        </button>
        <div className="max-w-xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          {renderIntroScreen()}
        </div>
      </div>
    );
  }

  // Main session view — full-screen like DBT
  return (
    <div className="fixed inset-0 z-50 bg-stone-950 text-stone-100 flex flex-col" style={{ height: '100dvh' }}>
      {showPostSessionCheck && renderPostSessionCheck()}
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-stone-950/90 backdrop-blur-md border-b border-purple-500/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MerkabaIcon size={28} className="text-purple-400" />
            <div>
              <h1 className="font-serif text-lg sm:text-xl font-bold text-stone-100">Internal Family Systems</h1>
              <p className="text-[11px] text-stone-500 leading-none mt-0.5">{PHASE_CONFIG[currentPhase].label}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={voiceMode === 'voice' ? stopVoiceSession : startVoiceSession}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                voiceMode === 'voice'
                  ? 'bg-purple-900/60 border-purple-500/40 text-purple-300'
                  : 'bg-stone-800/60 border-stone-700/40 text-stone-400 hover:border-purple-500/30 hover:text-purple-300'
              }`}
            >
              <Mic size={12} />
              {voiceMode === 'voice'
                ? voiceIO.state === 'speaking' ? 'Speaking…' : 'Listening…'
                : 'Voice'}
            </button>
            <button
              onClick={() => handleClose(session)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-800/60 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition-colors min-h-[44px] min-w-[44px]"
              aria-label="Close"
              disabled={isClosing}
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>
      {/* Phase stepper */}
      <div className="bg-stone-950/80 border-b border-stone-800/60 px-4 sm:px-6 py-2 overflow-x-auto">
        <div className="max-w-5xl mx-auto flex items-center gap-1 min-w-max">
          {(Object.entries(PHASE_CONFIG) as [WizardPhase, typeof PHASE_CONFIG[WizardPhase]][]).map(([phase, cfg], idx) => {
            const phases: WizardPhase[] = ['IDENTIFY', 'EXPLORE', 'DEEPEN', 'UNBURDEN', 'INTEGRATE', 'CLOSING'];
            const isActive = phase === currentPhase;
            const isDone = phases.indexOf(phase) < phases.indexOf(currentPhase);
            return (
              <React.Fragment key={phase}>
                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-medium transition-all duration-300 ${isActive
                  ? `bg-gradient-to-r ${cfg.color} text-white shadow-lg ${cfg.glow}`
                  : isDone
                    ? 'text-stone-500'
                    : 'text-stone-700'
                  }`}>
                  {isDone && <span className="text-purple-500">✓</span>}
                  {cfg.short}
                </div>
                {idx < 5 && <span className="text-stone-800 text-xs">·</span>}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-5xl w-full mx-auto">
        {renderChat()}

        {/* Mobile Info Panel */}
        {renderMobileInfoPanel()}

        <aside className="hidden lg:flex w-full lg:w-60 flex-col border-l border-stone-800/50 flex-shrink-0 overflow-y-auto p-4 space-y-4" style={{ background: 'linear-gradient(180deg, rgba(9,9,11,0.9) 0%, rgba(15,10,25,0.95) 100%)' }}>
          {/* Current Phase Card */}
          <div className={`bg-gradient-to-r ${PHASE_CONFIG[currentPhase].color} p-px rounded-2xl shadow-lg ${PHASE_CONFIG[currentPhase].glow}`}>
            <div className="bg-stone-950 p-3.5 rounded-2xl">
              <p className="text-[10px] font-semibold text-stone-600 uppercase tracking-wider mb-1">Current Phase</p>
              <p className="font-serif font-semibold text-stone-100 text-sm">{PHASE_CONFIG[currentPhase].label}</p>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">{PHASE_CONFIG[currentPhase].description}</p>
            </div>
          </div>

          {/* Phase Navigation */}
          {guidedPhases.includes(currentPhase) && currentPhase !== 'CLOSING' && (
            <button
              onClick={advanceToNextPhase}
              className="w-full px-3 py-2.5 bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-600 hover:to-purple-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-purple-900/30"
            >
              Move to next phase →
            </button>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/30 flex items-start justify-between gap-3">
              <p className="text-xs text-rose-300 leading-relaxed">{error}</p>
              {retryFn && (
                <button
                  onClick={() => { retryFn(); setError(null); setRetryFn(null); }}
                  className="shrink-0 text-xs font-semibold text-rose-300 border border-rose-700/50 rounded-lg px-2 py-1 hover:bg-rose-900/40 transition-colors"
                >
                  Try again
                </button>
              )}
            </div>
          )}

          {session && currentPhase !== 'CLOSING' && (
            <div className="bg-gradient-to-br from-stone-900/80 to-stone-950/60 border border-purple-900/30 rounded-2xl p-4">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <MerkabaIcon size={14} className="text-purple-400" />
                Part Profile
                {isAnalyzingPartProfile && (
                  <span className="ml-auto text-purple-400 flex items-center gap-1">
                    <div className="w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                  </span>
                )}
              </p>
              <div className="space-y-2">
                {[['Name', session.partName], ['Role', session.partRole], ['Fears', session.partFears], ['Intent', session.partPositiveIntent]].map(([label, val]) => (
                  <div key={label}>
                    <span className="text-[10px] font-semibold text-stone-600 uppercase tracking-wider">{label}</span>
                    <p className="text-xs text-stone-300 mt-0.5">{val || <span className="text-stone-700 italic">not yet identified</span>}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentPhase === 'CLOSING' && summaryData && (
            <div className="bg-gradient-to-br from-stone-900/80 to-stone-950/60 border border-purple-900/30 rounded-2xl p-4 space-y-3 animate-in fade-in duration-500">
              <h4 className="font-serif text-sm font-semibold text-purple-300 flex items-center gap-2">
                <span className="text-purple-500">✦</span> Session Summary
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed">{summaryData.summary}</p>
              {summaryData.aiIndications.length > 0 && (
                <div className="pt-2 border-t border-stone-800/50">
                  <p className="text-[10px] font-semibold text-stone-600 uppercase tracking-wider mb-2">Indications</p>
                  <ul className="space-y-1.5">
                    {summaryData.aiIndications.map((ind, idx) => (
                      <li key={idx} className="text-xs text-stone-400 flex items-start gap-1.5">
                        <span className="text-purple-500 mt-0.5">·</span>{ind}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="pt-3 border-t border-stone-800/50">
                <p className="text-xs text-stone-500 italic leading-relaxed">
                  🌬️ Three slow breaths. Feel your feet. You are Self — not any part.
                </p>
                {session?.partName && (
                  <p className="text-xs text-purple-400/70 mt-2 leading-relaxed">
                    Tomorrow: close your eyes, breathe, ask <em>"{session.partName}, how are you today?"</em>
                  </p>
                )}
              </div>
            </div>
          )}

          {insightContext && (
            <div className="bg-gradient-to-br from-stone-900/80 to-stone-950/60 border border-stone-700/40 rounded-2xl p-4 space-y-2">
              <p className="text-[10px] font-semibold text-stone-600 uppercase tracking-wider flex items-center gap-2">
                <Lightbulb size={12} className="text-purple-400" /> Insight Context
              </p>
              <p className="text-xs text-stone-300 leading-relaxed">{insightContext.detectedPattern}</p>
              <p className="text-[10px] text-stone-600">From: {insightContext.mindToolType}</p>
            </div>
          )}
        </aside>
      </div>

      {/* Footer */}
      <div className="relative border-t border-stone-800/60 bg-stone-950/90 backdrop-blur-sm px-4 sm:px-6 py-3 flex items-center justify-between flex-shrink-0">
        {/* Phase suggestion toast */}
        {phaseSuggestion && (
          <div className="fixed inset-x-0 bottom-20 flex justify-center px-4 z-20 pointer-events-none">
            <div className="bg-purple-900/90 backdrop-blur-md border border-purple-500/40 rounded-2xl shadow-2xl shadow-purple-900/50 p-4 flex items-center gap-4 pointer-events-auto animate-in slide-in-from-bottom-2 duration-300">
              <div>
                <p className="text-xs text-purple-300 font-medium">Aura suggests advancing</p>
                <p className="text-sm text-stone-100 font-serif font-semibold">{PHASE_CONFIG[phaseSuggestion]?.label}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { if (phaseSuggestion) advanceToPhase(phaseSuggestion); }}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-white text-xs font-semibold transition-all min-h-[36px]"
                >
                  Proceed
                </button>
                <button
                  onClick={() => setPhaseSuggestion(null)}
                  className="px-3.5 py-2 bg-stone-800/80 hover:bg-stone-700 rounded-xl text-stone-400 text-xs transition-all min-h-[36px]"
                >
                  Stay
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Save notification */}
        {isClosing && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10">
            <div className="bg-emerald-900/90 border border-emerald-700/40 rounded-xl px-4 py-2.5 text-sm text-emerald-200 backdrop-blur-md">
              {'Session saved ✓'}
            </div>
          </div>
        )}

        <button
          onClick={() => handleClose(session)}
          className="text-sm text-stone-500 hover:text-stone-300 transition"
          disabled={isSaving || isClosing}
        >
          Save &amp; Return Later
        </button>
        <div className="flex gap-3">
          {currentPhase === 'CLOSING' && !summaryData && (
            <button
              onClick={summarizeSession}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-600 hover:to-purple-500 text-white rounded-xl font-medium text-sm flex items-center gap-2 transition-all shadow-lg shadow-purple-900/30 min-h-[44px]"
              disabled={isSummarizing || isClosing}
            >
              <MerkabaIcon size={16} /> {isSummarizing ? 'Summarizing...' : 'Generate Summary'}
            </button>
          )}
          {currentPhase === 'CLOSING' && (
            <button
              onClick={() => session && handleFinish()}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 disabled:opacity-40 disabled:cursor-wait text-white rounded-xl font-medium text-sm flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/30 min-h-[44px]"
              disabled={isSaving || !summaryData || isClosing}
            >
              <Save size={16} />
              {isClosing ? 'Saving...' : 'Complete Session'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export default IFSWizard;