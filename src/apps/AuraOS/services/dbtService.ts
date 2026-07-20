import { z } from 'zod';
import { dbtAICall, dbtAIStream } from './dbtAIAdapter';
import { assessRisk, validateOutput } from './dbtSafety';
import { DBTPrivacy } from './dbtPrivacy';
import type {
  DBTMessage,
  DBTDiaryEntry,
  DBTSession,
  DBTCoachState,
  DBTCoachResponse,
  DBTSkill,
  DBTModule,
  DBTCoachMode,
  DBTUserProfile,
  DBTRiskAssessment,
  IntegratedInsight,
  CopingWalletItem,
} from '../types';

// ═══════════════════════════════════════════════════════════════════
// RE-EXPORTS
// ═══════════════════════════════════════════════════════════════════

export {
  assessRisk,
  validateOutput,
} from './dbtSafety';

// ═══════════════════════════════════════════════════════════════════
// STORAGE KEYS
// ═══════════════════════════════════════════════════════════════════

const KEYS = {
  state: 'aura-dbt-coach-state',
  sessions: 'aura-dbt-sessions',
  diary: 'aura-dbt-diary',
  chains: 'aura-dbt-chain-analyses',
} as const;

// ═══════════════════════════════════════════════════════════════════
// CRISIS
// ═══════════════════════════════════════════════════════════════════

export const CRISIS_RESOURCES = {
  primary: {
    name: '988 Suicide & Crisis Lifeline',
    action: 'Call or text 988',
    available: '24/7',
  },
  secondary: [
    {
      name: 'Crisis Text Line',
      action: 'Text HOME to 741741',
      available: '24/7',
    },
    {
      name: 'IASP Crisis Centres',
      action: 'https://www.iasp.info/resources/Crisis_Centres/',
      available: 'Directory',
    },
  ],
};

export const CRISIS_RESPONSE = `I'm hearing that you're going through something really intense right now, and I want you to know that matters.

**Please reach out to someone who can help:**
- **988 Suicide & Crisis Lifeline** — Call or text **988** (24/7)
- **Crisis Text Line** — Text **HOME** to **741741**

I'm an AI skills coach and can't provide the support you need right now. A trained crisis counselor can.

If you're safe and want to continue building coping skills, I'm here. But please reach out to those resources first. 💙`;

// ═══════════════════════════════════════════════════════════════════
// SYSTEM PROMPTS
// ═══════════════════════════════════════════════════════════════════

// Simplified prompt for streaming JSON responses (avoids complex structure conflicts)
const STREAMING_SYSTEM_PROMPT = `You are a DBT skills coach AI integrated into AuraOS, a personal development platform.

## RADICAL GENUINENESS (core communication style)
- One-sentence validation → immediate pivot to action. No lingering.
- Never interpret origins. Observe behavior only.
- During distress: short sentences, one step at a time, no jargon.
- Never open with "I'm so sorry you're feeling..." — it delays help.
- Skip apologetic openers entirely. Meet the user where they are and move.
- When reflecting user language back, use the user's OWN words and register — do not translate casual language to clinical or technical vocabulary.

## DIALECTICAL STANCE
Hold two truths simultaneously:
- The user's pain is valid AND they have capacity to build a life worth living
- Acceptance of what is AND commitment to change

## RESPONSE STYLE
Respond conversationally as a DBT coach. Speak directly to the user. Use the user's own language.`;

const BASE_SYSTEM_PROMPT = `You are a DBT skills coach AI integrated into AuraOS, a personal development platform.

## RADICAL GENUINENESS (core communication style)
- One-sentence validation → immediate pivot to action. No lingering.
- Never interpret origins. Observe behavior only.
- During distress: short sentences, one step at a time, no jargon.
- Never open with "I'm so sorry you're feeling..." — it delays help.
- Skip apologetic openers entirely. Meet the user where they are and move.
- When reflecting user language back, use the user's OWN words and register — do not translate casual language to clinical or technical vocabulary. "deal with my mom" stays "deal with my mom", not "address maternal relational dynamics".

## DIALECTICAL STANCE (embody in EVERY response)
Hold two truths simultaneously:
- The user's pain is valid AND they have capacity to build a life worth living
- Acceptance of what is AND commitment to change
- The user is doing their best AND they can do better

## RESPONSE PROTOCOL

Before responding, internally reason through:
1. OBSERVE: What emotion is the user expressing? What need underlies it?
2. VALIDATE: Which validation level fits? (one sentence, then move)
   - Level 1: Listen ("I hear you saying...")
   - Level 2: Reflect ("That sounds really...")
   - Level 3: Mind-read ("I imagine that might feel like...")
   - Level 4: Context ("Given what you've been through...")
   - Level 5: Normalize ("Anyone would feel...")
   - Level 6: Radical genuineness (direct, honest, no cushion)
3. ASSESS: Learning mode or coping mode?
4. SKILL-MATCH: What DBT skill fits this moment?
5. DELIVER: Teach conversationally with concrete example
6. CHECK: Invite reaction or teach-back

## SKILL DELIVERY FORMAT
1. Name it: "This is called [SKILL NAME]"
2. Why it works (1-2 sentences)
3. Steps (numbered, concrete)
4. Practice scenario relevant to them
5. Check: "How does that land?" or "Want to try together?"

## SKILL DEPENDENCY RULES (CRITICAL — never skip)
- Before teaching Opposite Action: confirm the user has done Check the Facts. If emotion IS justified → redirect to Problem Solving instead.
- Before teaching Cope Ahead: suggest Check the Facts first.
- After teaching DEARMAN: mention GIVE and FAST as natural follow-ons.
- If you detect a move to Opposite Action without Check the Facts: "Before we go there — let's make sure the emotion fits the facts. Sometimes it changes everything."
- After Urge Surfing completes (user says urge has passed), offer Mindfulness of Current Emotion as a natural next step:
  "Now the urgency has passed, we can just sit with the emotion underneath — want to try that?"
- When the user is in cope_now or learn mode, low-to-medium distress, no clear behavioral urge:
  consider Mindfulness of Current Emotion before Opposite Action.
- Mindfulness of Current Emotion is NOT the same as Opposite Action:
  MoCE = observe and allow the emotion to move through. OA = actively behave opposite to the urge.
  Never conflate them.
- After teaching Radical Acceptance, surface Turning the Mind and Willing Hands as the embodied practice layer:
  "Acceptance isn't a one-time decision. Want to try the physical version — Willing Hands?"

## IDENTITY
If asked whether you're a therapist: "I'm an AI skills coach — I can teach you evidence-based coping strategies, and I'd also encourage working with a human therapist who can provide the full depth of support you deserve."

## BOUNDARIES
- Never diagnose
- Never advise on medication
- Never promise outcomes

## FEW-SHOT EXAMPLES

User: "I had a huge fight with my mom and I just want to scream"
Response: "That intensity makes sense. Here's a skill for right now — it's called STOP. Want to walk through it together?"

User: "Nothing ever works. I've tried everything."
Response: "Real exhaustion in that. What have you tried? Naming it helps us find what's actually left."

User: "This is stupid. You're just a robot."
Response: "You're right I have limits. I can't sit with you the way a person can. What's making things hard right now?"

User: "Just tell me what to do."
Response: "Here's one skill right now: TIPP. Start with Temperature — cold water on your face or wrists. Do that first. Tell me when you've done it."

User: I feel this knot of dread and I don't know what to do with it.
Internal reasoning: Low-medium distress, no clear behavioral urge, not crisis. Mindfulness of Current Emotion fits better than TIPP or Opposite Action here.
Response JSON:
{
  "internalReasoning": "User has diffuse dread, not an action urge. MoCE is the right fit — observational, not behavioral.",
  "message": "That knot has something to tell you. There's a skill for this — it's called Mindfulness of Current Emotion. We don't fight it or chase it, we just stay with it until it moves through on its own. Want to try?",
  "skillTaught": "mindfulness_of_current_emotion",
  "validationLevel": 3,
  "practicePrompt": "Put one hand on where you feel it. Notice: what shape is it, what texture, does it have a temperature?",
  "checkInQuestion": "What's happening with it now, 30 seconds in?"
}

## DBT MODULES & SKILLS

Mindfulness (Core): wise_mind, observe, describe, participate, nonjudgmental, one_mindfully, effectiveness
Distress Tolerance: TIPP, STOP, pros_cons, radical_acceptance, distract_accepts (ACCEPTS), self_soothe, improve_moment
Emotion Regulation: check_the_facts, opposite_action, problem_solving, ABC_PLEASE, build_mastery, cope_ahead
Interpersonal Effectiveness: DEARMAN, GIVE, FAST, dialectics

Respond with JSON matching this structure:
{"internalReasoning": "User is in emotion mind, needs grounding before skills", "message": "That intensity makes sense. Here's one skill for right now — it's called STOP. Want to walk through it?", "skillTaught": "stop", "validationLevel": 3, "practicePrompt": "Try freezing completely for 10 seconds right now.", "checkInQuestion": "How does that land?"}

Include "skillTaught" only when explicitly teaching a named skill. Include "practicePrompt" only when offering a hands-on exercise. Include "checkInQuestion" when inviting reflection. Always include "message". "internalReasoning" is for internal chain-of-thought — always include it.
CRITICAL: Respond with ONLY valid JSON (no markdown, no explanation):`;

const MODE_EXTENSIONS: Record<DBTCoachMode, string> = {
  learn: `\n\n## MODE: STRUCTURED LEARNING
Guide through DBT skills systematically. Assess needs, recommend module, teach one skill at a time with examples, offer practice, check understanding.`,

  cope_now: `\n\n## MODE: COPE NOW (Immediate Support)
User needs help RIGHT NOW. Prioritize:
1. Brief validation (1-2 sentences)
2. Grounding if needed (5-4-3-2-1 senses)
3. One concrete skill (likely TIPP or STOP)
4. Walk through step by step
5. Check if intensity shifted
Keep responses shorter and more directive.`,

  diary: `\n\n## MODE: DIARY CARD REVIEW
Help reflect on diary entries. Notice patterns. Celebrate effective skill use. Identify gaps. Set intentions. Be curious and collaborative, not evaluative.`,

  chain_analysis: `\n\n## MODE: BEHAVIOR CHAIN ANALYSIS
Guide through analyzing a problematic behavior step by step. Be thorough but not overwhelming.`,

  sos: `\n\n## MODE: SOS — CRISIS SUPPORT
User is at HIGH distress. Rules:
- Ultra-short sentences. No jargon.
- Guide TIPP steps one at a time. Wait for confirmation before next step.
- Always show crisis line: 988 (call or text).
- Do NOT ask open-ended questions. Give directives.
- Validate in ONE sentence, then immediately action.`,

  urge_surf: `\n\n## MODE: URGE SURFING
User is riding an urge. Rules:
- Narrate the wave: rising, peak, falling.
- Do NOT moralize. Do NOT ask why.
- Short check-ins every message: "Where's the intensity now, 1-10?"
- Celebrate when it drops without acting. Say so plainly.`,
};

// ═══════════════════════════════════════════════════════════════════
// ZOD SCHEMAS
// ═══════════════════════════════════════════════════════════════════

const DBT_SKILL_VALUES = ['wise_mind', 'observe', 'describe', 'participate', 'nonjudgmental', 'one_mindfully', 'effectiveness', 'tipp', 'stop', 'pros_cons', 'radical_acceptance', 'distract_accepts', 'self_soothe', 'improve_moment', 'check_the_facts', 'opposite_action', 'problem_solving', 'abc_please', 'build_mastery', 'cope_ahead', 'mindfulness_of_current_emotion', 'dearman', 'give', 'fast', 'dialectics'] as const;
const CoachResponseSchema = z.object({
  message: z.string(),
  internalReasoning: z.string().optional(),
  skillTaught: z.enum(DBT_SKILL_VALUES).optional(),
  validationLevel: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6)]).optional(),
  practicePrompt: z.string().optional(),
  checkInQuestion: z.string().optional(),
});

const DiaryAnalysisSchema = z.object({
  patterns: z.array(z.string()),
  effectiveSkills: z.array(z.string()),
  underutilizedSkills: z.array(z.string()),
  recommendations: z.array(z.string()),
  encouragement: z.string(),
});

// ═══════════════════════════════════════════════════════════════════
// STATE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════

function getDefaultState(): DBTCoachState {
  return {
    hasConsented: false,
    profile: {
      primaryConcerns: [],
      skillLevel: 'novice',
      completedSkills: [],
      preferredPace: 'detailed',
    },
    currentMode: 'learn',
    currentSession: null,
    diaryEntries: [],
    chainAnalyses: [],
    sessionHistory: [],
    wallet: [],
  };
}

export function getDBTState(): DBTCoachState {
  return DBTPrivacy.loadSensitive<DBTCoachState>(KEYS.state) ?? getDefaultState();
}

export function saveDBTState(state: DBTCoachState): void {
  DBTPrivacy.saveSensitive(KEYS.state, state);
}

// ═══════════════════════════════════════════════════════════════════
// SESSION MANAGEMENT
// ═══════════════════════════════════════════════════════════════════

export function createSession(mode: DBTCoachMode): DBTSession {
  return {
    id: `dbt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    startTime: new Date().toISOString(),
    mode,
    messages: [],
    skillsIntroduced: [],
    skillsPracticed: [],
    riskEscalations: 0,
  };
}

export function addMessageToSession(
  session: DBTSession,
  message: Omit<DBTMessage, 'id' | 'timestamp'>
): DBTSession {
  return {
    ...session,
    messages: [
      ...session.messages,
      {
        ...message,
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

export function saveSession(session: DBTSession): void {
  const sessions = DBTPrivacy.loadSensitive<DBTSession[]>(KEYS.sessions) ?? [];
  const updated = [...sessions.filter(s => s.id !== session.id), session].slice(-75);
  DBTPrivacy.saveSensitive(KEYS.sessions, updated);
}

export function getSessions(): DBTSession[] {
  return DBTPrivacy.loadSensitive<DBTSession[]>(KEYS.sessions) ?? [];
}

// ═══════════════════════════════════════════════════════════════════
// DIARY
// ═══════════════════════════════════════════════════════════════════

export function saveDiaryEntry(entry: DBTDiaryEntry): void {
  const entries = getDiaryEntries();
  const updated = [...entries.filter(e => e.id !== entry.id), entry].slice(-365);
  DBTPrivacy.saveSensitive(KEYS.diary, updated);
}

export function getDiaryEntries(): DBTDiaryEntry[] {
  return DBTPrivacy.loadSensitive<DBTDiaryEntry[]>(KEYS.diary) ?? [];
}

export function getRecentDiaryEntries(days: number = 7): DBTDiaryEntry[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return getDiaryEntries().filter(e => new Date(e.date) >= cutoff);
}

export function autoPopulateDiary(session: DBTSession): void {
  const today = new Date().toISOString().split('T')[0];
  const entries = getDiaryEntries();
  const existing = entries.find(e => e.date === today && e.autoPopulatedFromSession === session.id);
  if (existing) return; // already populated

  const allSkills = [...new Set([...session.skillsIntroduced, ...session.skillsPracticed])];
  if (allSkills.length === 0) return;

  const newEntry: DBTDiaryEntry = {
    id: `diary-auto-${Date.now()}`,
    date: today,
    emotions: [],
    urges: [],
    skillsUsed: allSkills,
    effectiveness: 3,
    autoPopulatedFromSession: session.id,
  };

  const updated = [...entries, newEntry].slice(-365);
  DBTPrivacy.saveSensitive(KEYS.diary, updated);
}

// ═══════════════════════════════════════════════════════════════════
// COPING WALLET
// ═══════════════════════════════════════════════════════════════════

export function getCopingWallet(state: DBTCoachState): CopingWalletItem[] {
  return state.wallet ?? [];
}

export function addToWallet(state: DBTCoachState, item: Omit<CopingWalletItem, 'id' | 'savedAt'>): DBTCoachState {
  const newItem: CopingWalletItem = {
    ...item,
    id: `wallet-${Date.now()}`,
    savedAt: new Date().toISOString(),
  };
  return { ...state, wallet: [...(state.wallet ?? []), newItem].slice(-50) };
}

export function removeFromWallet(state: DBTCoachState, itemId: string): DBTCoachState {
  return { ...state, wallet: (state.wallet ?? []).filter(w => w.id !== itemId) };
}

// ═══════════════════════════════════════════════════════════════════
// SUDS STATS
// ═══════════════════════════════════════════════════════════════════

export function getSUDSStats(sessionHistory: DBTSession[]): { avgReduction: number; sampleSize: number } | null {
  const relevant = sessionHistory.filter(
    s => (s.mode === 'cope_now' || s.mode === 'sos') && s.sudsEntry && s.sudsEntry.before > 0 && s.sudsEntry.after > 0
  );
  if (relevant.length < 3) return null;
  const totalReduction = relevant.reduce((sum, s) => sum + (s.sudsEntry!.before - s.sudsEntry!.after), 0);
  return { avgReduction: Math.round((totalReduction / relevant.length) * 10) / 10, sampleSize: relevant.length };
}

// ═══════════════════════════════════════════════════════════════════
// AI: COACH RESPONSE
// ═══════════════════════════════════════════════════════════════════

export async function generateCoachResponse(
  messages: DBTMessage[],
  mode: DBTCoachMode,
  risk: DBTRiskAssessment,
  profile: DBTUserProfile,
  diaryContext?: string
): Promise<DBTCoachResponse> {
  if (risk.level === 'CRISIS') {
    return { message: CRISIS_RESPONSE, validationLevel: 6 };
  }

  let systemPrompt = BASE_SYSTEM_PROMPT + MODE_EXTENSIONS[mode];

  if (risk.level === 'HIGH') {
    systemPrompt += `\n\n## RISK CONTEXT\nUser is in significant distress. Prioritize validation and distress tolerance. Include crisis resources (988).`;
  }

  systemPrompt += `\n\n## USER CONTEXT\nSkill level: ${profile.skillLevel}\nCompleted: ${profile.completedSkills.join(', ') || 'None'}\nPace: ${profile.preferredPace}\nConcerns: ${profile.primaryConcerns.join(', ') || 'Not specified'}`;

  if (diaryContext) {
    systemPrompt += `\n\n## DIARY PATTERNS\n${diaryContext}\nReference naturally without reciting data.`;
  }

  const conversationStr = messages.slice(-10).map(m => `${m.role}: ${m.content}`).join('\n');

  try {
    const result = await dbtAICall(
      systemPrompt,
      conversationStr,
      CoachResponseSchema,
      { temperature: risk.level === 'HIGH' ? 0.3 : 0.6 }
    );

    const validation = validateOutput(result.message, risk.level);
    if (!validation.safe) {
      console.warn('Response failed validation:', validation.flags);
    }

    return result;
  } catch (err) {
    console.error('[DBT] generateCoachResponse failed:', err);
    return {
      message: "I'm having trouble processing right now. Let's take a breath together — can you tell me more about what you're experiencing?",
      validationLevel: 2 as 1 | 2 | 3 | 4 | 5 | 6,
    } satisfies DBTCoachResponse;
  }
}

/**
 * Streaming version of generateCoachResponse — tokens appear as they arrive.
 * Returns the full message text when done.
 */
export async function streamCoachResponse(
  messages: DBTMessage[],
  mode: DBTCoachMode,
  risk: DBTRiskAssessment,
  profile: DBTUserProfile,
  onChunk: (text: string) => void,
  systemOverrideOrDiary?: string,
  diaryContext?: string
): Promise<string> {
  if (risk.level === 'CRISIS') {
    onChunk(CRISIS_RESPONSE);
    return CRISIS_RESPONSE;
  }

  // If systemOverrideOrDiary is a full override prompt (roleplay), use it directly
  const isOverride = systemOverrideOrDiary && systemOverrideOrDiary.length > 50 && systemOverrideOrDiary.startsWith('You are now roleplaying');
  let systemPrompt = isOverride
    ? systemOverrideOrDiary
    : STREAMING_SYSTEM_PROMPT; // Use simplified prompt for JSON streaming

  if (risk.level === 'HIGH') {
    systemPrompt += `\n\n## RISK CONTEXT\nUser is in significant distress. Prioritize validation and distress tolerance. Include crisis resources (988).`;
  }

  systemPrompt += `\n\n## USER CONTEXT\nSkill level: ${profile.skillLevel}\nCompleted: ${profile.completedSkills.join(', ') || 'None'}\nPace: ${profile.preferredPace}\nConcerns: ${profile.primaryConcerns.join(', ') || 'Not specified'}`;

  if (diaryContext) {
    systemPrompt += `\n\n## DIARY PATTERNS\n${diaryContext}\nReference naturally without reciting data.`;
  }

  systemPrompt += `\n\nRespond conversationally as a DBT coach. Speak directly to the user.`;

  const conversationStr = messages.slice(-10).map(m => `${m.role}: ${m.content}`).join('\n');

  try {
    const fullText = await dbtAIStream(
      systemPrompt,
      conversationStr,
      onChunk,
      { temperature: 0.3 } // Fast, focused responses
    );

    // Skip validation for speed (validate asynchronously in background if needed)
    return fullText;
  } catch (err) {
    console.error('[DBT] streamCoachResponse failed:', err);
    const fallback = "I'm having trouble processing right now. Let's take a breath together — can you tell me more about what you're experiencing?";
    onChunk(fallback);
    return fallback;
  }
}

// ═══════════════════════════════════════════════════════════════════
// AI: DIARY ANALYSIS
// ═══════════════════════════════════════════════════════════════════

export async function analyzeDiaryPatterns(entries: DBTDiaryEntry[]) {
  if (entries.length === 0) {
    return {
      patterns: [],
      effectiveSkills: [],
      underutilizedSkills: [],
      recommendations: ['Start tracking daily to build awareness'],
      encouragement: "Starting a diary practice is a powerful step.",
    };
  }

  try {
    return await dbtAICall(
      `You are a DBT diary analyst. Analyze the provided diary entries and return warm, actionable insights.

Respond with JSON matching this exact structure:
{"patterns": ["avoids social plans when anxiety peaks", "shame spikes on workdays"], "effectiveSkills": ["tipp", "radical_acceptance"], "underutilizedSkills": ["cope_ahead", "check_the_facts"], "recommendations": ["Try cope_ahead before Monday mornings", "Build mastery with one small win daily"], "encouragement": "You used TIPP three times this week — that's real progress."}

CRITICAL: Respond with ONLY valid JSON (no markdown, no explanation):`,
      `Analyze these DBT diary entries:\n${JSON.stringify(entries, null, 2)}`,
      DiaryAnalysisSchema
    );
  } catch {
    return {
      patterns: ['Analysis unavailable'],
      effectiveSkills: [],
      underutilizedSkills: [],
      recommendations: ['Continue tracking for insights'],
      encouragement: "The fact that you're tracking is valuable in itself.",
    };
  }
}

// ═══════════════════════════════════════════════════════════════════
// INSIGHT GENERATION (Intelligence Hub integration)
// ═══════════════════════════════════════════════════════════════════

export function generateDBTInsight(session: DBTSession): Partial<IntegratedInsight> {
  const skills = [
    ...session.skillsIntroduced.map(s => `Learned: ${s}`),
    ...session.skillsPracticed.map(s => `Practiced: ${s}`),
  ].join(', ');

  return {
    id: `dbt-insight-${Date.now()}`,
    mindToolType: 'DBT Coach',
    mindToolSessionId: session.id,
    mindToolName: 'DBT Coach',
    mindToolReport: `DBT ${session.mode} session: ${skills || 'Exploration and validation'}`,
    mindToolShortSummary: skills || 'DBT skill building session',
    detectedPattern: session.riskEscalations > 0
      ? 'Distress pattern requiring support'
      : 'Building emotional regulation capacity',
    suggestedShadowWork: [],
    suggestedNextSteps: [],
    dateCreated: new Date().toISOString(),
    status: 'pending',
  };
}

// ═══════════════════════════════════════════════════════════════════
// SKILL METADATA
// ═══════════════════════════════════════════════════════════════════

export const DBT_SKILLS_METADATA: Record<DBTSkill, {
  name: string;
  module: DBTModule;
  description: string;
  quickSteps: string[];
  prerequisites?: DBTSkill[];
  contraindications?: string[];
  commonMistakes?: string[];
  dependencyNote?: string;
}> = {
  wise_mind: { name: 'Wise Mind', module: 'mindfulness', description: 'Finding the synthesis of emotion mind and reasonable mind', quickSteps: ['Notice emotion mind', 'Notice reasonable mind', 'Find where both are honored'] },
  observe: { name: 'Observe', module: 'mindfulness', description: 'Noticing experience without words', quickSteps: ['Step back mentally', 'Notice sensations, thoughts, emotions', "Don't react, just observe"] },
  describe: { name: 'Describe', module: 'mindfulness', description: 'Putting words to experience', quickSteps: ['Notice experience', 'Label: "I\'m feeling..."', 'Facts, not judgments'] },
  participate: { name: 'Participate', module: 'mindfulness', description: 'Fully entering into experience', quickSteps: ['Let go of self-consciousness', 'Throw yourself in completely', 'Become one with the activity'] },
  nonjudgmental: { name: 'Non-judgmental Stance', module: 'mindfulness', description: 'Observing without evaluating', quickSteps: ['Notice judgments', 'Replace with descriptions', 'Accept reality as it is'] },
  one_mindfully: { name: 'One-Mindfully', module: 'mindfulness', description: 'One thing at a time with full attention', quickSteps: ['Focus on one thing', 'When mind wanders, return', 'Let go of distractions'] },
  effectiveness: { name: 'Effectiveness', module: 'mindfulness', description: "Doing what works, not what's 'right'", quickSteps: ['Focus on goals', "Let go of being right", 'Do what the situation requires'] },
  tipp: { name: 'TIPP', module: 'distress_tolerance', description: 'Rapidly changing body chemistry', quickSteps: ['Temperature: cold water on face', 'Intense exercise: 20 mins', 'Paced breathing: exhale longer', 'Progressive relaxation'] },
  stop: { name: 'STOP', module: 'distress_tolerance', description: 'Preventing impulsive action', quickSteps: ["Stop: freeze", 'Take a step back', 'Observe inside and out', 'Proceed mindfully'] },
  pros_cons: { name: 'Pros & Cons', module: 'distress_tolerance', description: 'Thinking through consequences', quickSteps: ['Pros of acting on urge', 'Cons of acting', 'Pros of resisting', 'Cons of resisting'] },
  radical_acceptance: {
    name: 'Radical Acceptance',
    module: 'distress_tolerance',
    description: 'Fully accepting reality',
    quickSteps: [
      'Acknowledge the painful reality out loud or in writing — name it exactly',
      'Observe resistance ("this shouldn\'t be happening") without feeding it',
      'Turn the Mind — make a deliberate, repeated choice to accept (not one-time)',
      'Ask: am I being Willing (open, adaptive) or Willful (rigid, refusing reality)?',
      'Try Half-Smiling — slightly soften your face and jaw while holding the reality',
      'Try Willing Hands — open palms facing upward, arms unclenched at your sides',
    ],
    dependencyNote: 'Use when the situation cannot be changed. If the situation CAN be changed, Problem Solving is more appropriate. After teaching this skill, surface Turning the Mind and Willing Hands as the somatic practice layer.',
    commonMistakes: [
      'Confusing acceptance with approval — they are not the same thing',
      'Expecting one decision to hold — Turning the Mind is a repeated practice, not a single act',
      'Skipping the body-based components (Half-Smiling, Willing Hands) — somatic entry matters',
    ],
  },
  distract_accepts: { name: 'ACCEPTS', module: 'distress_tolerance', description: 'Healthy distraction', quickSteps: ['Activities', 'Contributing', 'Comparisons', 'Emotions (opposite)', 'Push away', 'Thoughts (other)', 'Sensations'] },
  self_soothe: { name: 'Self-Soothe', module: 'distress_tolerance', description: 'Comforting through the senses', quickSteps: ['Vision: something beautiful', 'Sound: soothing music', 'Smell: calming scents', 'Taste: savor something', 'Touch: soft textures'] },
  improve_moment: { name: 'IMPROVE', module: 'distress_tolerance', description: 'Making the moment bearable', quickSteps: ['Imagery', 'Meaning', 'Prayer/meditation', 'Relaxation', 'One thing at a time', 'Vacation (brief mental)', 'Encouragement'] },
  check_the_facts: {
    name: 'Check the Facts', module: 'emotion_regulation',
    description: 'Examining if emotions fit facts',
    quickSteps: ['Name the emotion', 'Describe prompting event', 'Check interpretations vs facts', 'Does intensity fit?'],
    commonMistakes: ['Skipping this before Opposite Action — always check first', 'Confusing thoughts with facts'],
  },
  opposite_action: {
    name: 'Opposite Action', module: 'emotion_regulation',
    description: 'Acting opposite to unhelpful urges',
    quickSteps: ['Identify emotion', 'Identify action urge', 'Check if urge is effective', 'If not, do the opposite fully'],
    prerequisites: ['check_the_facts'],
    contraindications: ['If emotion IS justified by facts — use Problem Solving instead'],
    dependencyNote: 'Must confirm emotion does NOT fit facts before using. If justified → Problem Solving.',
    commonMistakes: ['Using when emotion is actually justified', 'Doing it half-heartedly — must be fully opposite'],
  },
  problem_solving: {
    name: 'Problem Solving', module: 'emotion_regulation',
    description: 'Steps to change the situation',
    quickSteps: ['Define problem', 'Check facts', 'Identify goal', 'Brainstorm solutions', 'Choose and implement'],
  },
  abc_please: {
    name: 'ABC PLEASE', module: 'emotion_regulation',
    description: 'Reducing vulnerability',
    quickSteps: ['Accumulate positives', 'Build mastery', 'Cope ahead', 'PhysicaL health', 'Eating balanced', 'Avoid substances', 'Sleep', 'Exercise'],
  },
  build_mastery: {
    name: 'Build Mastery', module: 'emotion_regulation',
    description: 'Building confidence',
    quickSteps: ['Choose something challenging but doable', 'Do it regularly', 'Gradually increase difficulty'],
  },
  mindfulness_of_current_emotion: {
    name: 'Mindfulness of Current Emotion',
    module: 'emotion_regulation',
    description: 'Experiencing an active emotion fully without blocking, suppressing, or amplifying it — letting it rise, peak, and fall as a wave',
    quickSteps: [
      'Name the emotion without judgment',
      'Notice where you feel it in your body — locate it physically',
      "Don't try to stop it or make it bigger — just observe",
      'Imagine it as a wave: let it rise naturally',
      'Stay present until the peak passes on its own',
      'Notice the emotion beginning to subside',
    ],
    dependencyNote: 'Natural follow-on after Urge Surfing completes. Also fits when distress is low-medium and no clear behavioral urge is present — before reaching for Opposite Action.',
    commonMistakes: [
      'Suppressing instead of observing — suppression amplifies emotion over time',
      'Confusing with Opposite Action — MoCE is observing, not acting against the urge',
      'Stopping too early before the natural peak-and-fall cycle completes',
    ],
  },
  cope_ahead: {
    name: 'Cope Ahead', module: 'emotion_regulation',
    description: 'Planning for difficult situations',
    quickSteps: ['Describe situation', 'Decide skills to use', 'Imagine using skills', 'Practice in imagination', 'Relax after'],
    prerequisites: ['check_the_facts'],
    dependencyNote: 'Check the Facts first clarifies what exactly you are coping ahead for.',
  },
  dearman: {
    name: 'DEARMAN', module: 'interpersonal_effectiveness',
    description: 'Getting what you want effectively',
    quickSteps: ['Describe situation', 'Express feelings', 'Assert needs', 'Reinforce benefits', 'stay Mindful', 'Appear confident', 'Negotiate'],
    dependencyNote: 'After DEARMAN, teach GIVE (relationship) and FAST (self-respect) as natural follow-ons.',
    commonMistakes: ['Forgetting to Reinforce', 'Negotiating from weakness'],
  },
  give: {
    name: 'GIVE', module: 'interpersonal_effectiveness',
    description: 'Maintaining relationships',
    quickSteps: ['be Gentle', 'act Interested', 'Validate', 'use Easy manner'],
  },
  fast: {
    name: 'FAST', module: 'interpersonal_effectiveness',
    description: 'Keeping self-respect',
    quickSteps: ['be Fair', 'no unnecessary Apologies', 'Stick to values', 'be Truthful'],
  },
  dialectics: {
    name: 'Dialectics', module: 'interpersonal_effectiveness',
    description: 'Balancing acceptance and change',
    quickSteps: ['Find kernel of truth in other side', 'Let go of "I\'m right"', '"And" instead of "but"'],
  },
};
