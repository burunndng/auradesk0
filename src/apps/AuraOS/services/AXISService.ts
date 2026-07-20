/**
 * AXIS Service 
 * Intention & Reflection Practice for Any Experience
 */

import type { IntegratedInsight, AXISSession, AXISActivityType, AXISReflection, AXISConversationMessage, AXISSynthesisBrief, AXISAnchor, AXISMetaSynthesis, MemoryItem } from '../types';
import { callGrokThenAIJson } from './ai/aiCore';
import { axisSynthesisSchema, axisInsightSchema } from './ai/wizardSchemas';
import { wizardSessionService } from './wizardSessionService';
import { z } from 'zod';
import { readLatestSynthesis, writeLatestSynthesis, readMemoryItems, writeMemoryItem } from './AXISStorage';

export const AXIS_LATEST_SYNTHESIS_KEY = 'aura-axis-synthesis-latest';
export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const AXIS_AI_INSIGHT_ENABLED = true; // flip to false to revert to sync path

const ACTIVITY_LABELS: Record<AXISActivityType, string> = {
  'ai-conversation': 'AI Conversation',
  'journal': 'Journal',
  'therapy': 'Therapy/Coaching',
  'difficult-conversation': 'Difficult Conversation',
  'meditation': 'Meditation',
  'other': 'Reflection',
};

const generateId = () => 
  typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID() 
    : Math.random().toString(36).substring(2, 11);

/**
 * Sync fallback: create an IntegratedInsight from an AXIS session (no AI call).
 * Used when AXIS_AI_INSIGHT_ENABLED is false, or as a base for the async path.
 */
function createAXISInsightSync(
  session: AXISSession,
  userId: string,
  authUserId?: string,
  reflection?: AXISReflection
): IntegratedInsight {
  const activityLabel = ACTIVITY_LABELS[session.activityType];

  const reportParts = [
    `**Activity:** ${activityLabel}`,
    `**Intention:** ${session.intention}`,
    session.successCriteria ? `**Success Criteria:** ${session.successCriteria}` : null,
    ``,
    reflection ? `**What stood out:**\n${reflection.salience}` : null,
    reflection?.delta ? `\n**What changed:**\n${reflection.delta}` : null,
    reflection?.residue ? `\n**What remains open:**\n${reflection.residue}` : null,
    reflection?.selfNoticing ? `\n**Self-noticing:**\n${reflection.selfNoticing}` : null,
  ].filter(Boolean).join('\n');

  return {
    id: generateId(),
    mindToolType: 'AXIS',
    mindToolSessionId: session.id,
    mindToolName: session.title,
    mindToolReport: reportParts,
    mindToolShortSummary: (reflection?.salience ?? session.title).slice(0, 200),
    detectedPattern: session.title,
    suggestedShadowWork: [],
    suggestedNextSteps: [],
    dateCreated: new Date().toISOString(),
    status: 'pending',
    generatedBy: 'fallback',
    confidenceScore: 1.0,
  };
}

/**
 * Generate an AI-powered IntegratedInsight from an AXIS session.
 * Fires immediately after synthesis completes; reflection is merged in later if provided.
 */
export async function generateAXISInsight(
  synthesisBrief: AXISSynthesisBrief | null,
  session: AXISSession,
  userId: string,
  authUserId: string | undefined,
  reflection?: AXISReflection
): Promise<IntegratedInsight> {
  // Sync path — feature flag off
  if (!AXIS_AI_INSIGHT_ENABLED) {
    return createAXISInsightSync(session, userId, authUserId, reflection);
  }

  const base = createAXISInsightSync(session, userId, authUserId, reflection);

  try {
    let prompt: string;
    let isFallbackPrompt = false;

    if (synthesisBrief) {
      prompt = `You are analyzing an AXIS (AI-eXtended Integral Session) coaching session to extract developmental patterns.

Session Topic: ${session.title}
Intention: ${session.intention}
Success Criteria: ${session.successCriteria || 'None specified'}

Synthesis Brief:
Key Insight: ${synthesisBrief.sessionFindings.keyInsight}
User Patterns: ${Array.isArray(synthesisBrief.userPatterns) ? (synthesisBrief.userPatterns as string[]).join('; ') : [synthesisBrief.userPatterns?.coreDynamic, synthesisBrief.userPatterns?.typicalDefenses].filter(Boolean).join('; ')}
Hypothesis to Test: ${synthesisBrief.nextSession.hypothesisToTest}
Open Threads: ${synthesisBrief.openThreads.join('; ')}

${reflection ? `User's own reflection:
Salience: ${reflection.salience}
Delta (what shifted): ${reflection.delta || 'Not provided'}
Residue (what remains): ${reflection.residue || 'Not provided'}
Self-noticing: ${reflection.selfNoticing || 'Not provided'}` : ''}

Identify:
1. detectedPattern: A specific psychological/developmental pattern evident in this session (not just the topic). Be concrete and behavioral. Max 300 chars.
2. suggestedShadowWork: Up to 3 shadow work practices directly addressing patterns surfaced. Be specific, not generic.
3. suggestedNextSteps: Up to 3 next steps based on the synthesis brief's open threads and hypothesis.

CRITICAL: Respond with ONLY valid JSON (no markdown, no explanation):
{
  "detectedPattern": "Tendency to intellectualize emotional content as a defense against felt uncertainty",
  "suggestedShadowWork": ["Notice when analysis replaces felt sense in body", "Journal on what 'not knowing' feels like somatically"],
  "suggestedNextSteps": ["Test hypothesis: Does slowing down improve clarity?", "Bring one open thread to next session"]
}`;
    } else {
      // No synthesis brief — use raw conversation + intention
      isFallbackPrompt = true;
      const lastMessages = (session.conversationHistory ?? []).slice(-10);
      const transcript = lastMessages
        .map(m => `${m.role === 'user' ? 'User' : 'AXIS'}: ${m.content}`)
        .join('\n\n');

      prompt = `You are analyzing an AXIS coaching session to extract developmental patterns.

Session Topic: ${session.title}
Intention: ${session.intention}

${transcript ? `Recent conversation:\n${transcript}\n` : ''}

${reflection ? `User's own reflection:
Salience: ${reflection.salience}
Delta (what shifted): ${reflection.delta || 'Not provided'}
Residue (what remains): ${reflection.residue || 'Not provided'}` : ''}

Identify:
1. detectedPattern: A specific psychological/developmental pattern evident in this session. Be concrete and behavioral. Max 300 chars.
2. suggestedShadowWork: Up to 3 shadow work practices. Be specific.
3. suggestedNextSteps: Up to 3 next steps.

CRITICAL: Respond with ONLY valid JSON (no markdown, no explanation):
{
  "detectedPattern": "Tendency to intellectualize emotional content as a defense against felt uncertainty",
  "suggestedShadowWork": ["Notice when analysis replaces felt sense in body", "Journal on what 'not knowing' feels like somatically"],
  "suggestedNextSteps": ["Test hypothesis: Does slowing down improve clarity?", "Bring one open thread to next session"]
}`;
    }

    const result = await callGrokThenAIJson('AXIS-insight', prompt, undefined, axisInsightSchema);

    const keyInsight = synthesisBrief?.sessionFindings?.keyInsight || session.title;
    // Last complete sentence within 200 chars
    const shortSummaryRaw = keyInsight.slice(0, 200);
    const lastPeriod = shortSummaryRaw.lastIndexOf('.');
    const mindToolShortSummary = lastPeriod > 0 ? shortSummaryRaw.slice(0, lastPeriod + 1) : shortSummaryRaw;

    const mindToolReport = synthesisBrief
      ? `AXIS Session: ${session.title}\n\nKey Insight: ${synthesisBrief.sessionFindings.keyInsight}\nPatterns: ${[synthesisBrief.userPatterns?.coreDynamic].filter(Boolean).join(', ')}\nNext: ${synthesisBrief.nextSession.hypothesisToTest}`
      : base.mindToolReport;

    // Map AI string arrays to the IntegratedInsight object shape
    const toInsightItems = (items: string[]) =>
      items.map((text, i) => ({
        practiceId: `axis-${i}`,
        practiceName: text.slice(0, 60),
        rationale: text,
      }));

    return {
      ...base,
      detectedPattern: result.detectedPattern,
      suggestedShadowWork: toInsightItems(result.suggestedShadowWork),
      suggestedNextSteps: toInsightItems(result.suggestedNextSteps),
      mindToolShortSummary,
      mindToolReport,
      generatedBy: isFallbackPrompt ? 'ai-fallback' : 'ai',
      confidenceScore: isFallbackPrompt ? 0.5 : 0.75,
      status: 'pending',
    };
  } catch (err) {
    console.error('[AXIS] generateAXISInsight AI call failed, using sync fallback:', err);
    return {
      ...base,
      generatedBy: 'fallback',
      status: 'pending',
    };
  }
}

export async function generateSynthesisBrief(
  conversationHistory: AXISConversationMessage[],
  intention: string,
  anchor: AXISAnchor,
  successCriteria?: string,
  activityType?: string,
  previousBrief?: AXISSynthesisBrief | null
): Promise<AXISSynthesisBrief> {
  // Truncate to last 20 messages to stay within 4000-token proxy limit
  const cappedHistory = conversationHistory.slice(-20);
  const transcript = cappedHistory
    .map(m => `${m.role === 'user' ? 'User' : 'AXIS'}: ${m.content}`)
    .join('\n\n');

  const cumulativePrior = previousBrief
    ? `Prior brief exists. Trajectory note: ${previousBrief.cumulativeContext || 'No prior cumulative context.'}`
    : 'First session — no prior context.';

  // Load active memory items to inject into synthesis prompt
  const storedItems = await readMemoryItems();
  const activeItems = storedItems.filter(item =>
    item.status === 'active' &&
    (item.scope === 'global' || item.scope === `anchor:${anchor.id ?? 'default'}`)
  );
  const userMemoryItems = activeItems.filter(i => i.source === 'user');
  const axisMemoryItems = activeItems.filter(i => i.source === 'axis');

  const userMemoryBlock = userMemoryItems.length
    ? `User-authored map:\n${userMemoryItems.map(i => `[${i.kind}] ${i.text}`).join('\n')}`
    : 'No user-authored items yet.';
  const axisMemoryBlock = axisMemoryItems.length
    ? `Prior AXIS observations:\n${axisMemoryItems.map((t, i) => `${i + 1}. ${t.text}`).join('\n')}`
    : 'No prior observations yet (first session or none established).';

  const priorCoreTruths = `ESTABLISHED MEMORY (read-only — do not reproduce these in output):\n${userMemoryBlock}\n${axisMemoryBlock}`;

  // Load prior enactment map to show how previous insights moved into lived change
  const priorEnactment = previousBrief?.enactmentMap
    ? `Prior Session Enactment (how last session's insight was enacted):\n  I (UL): ${previousBrief.enactmentMap.ul}\n  It (UR): ${previousBrief.enactmentMap.ur}\n  We (LL): ${previousBrief.enactmentMap.ll}\n  Its (LR): ${previousBrief.enactmentMap.lr}`
    : 'No prior enactment map (first session).';

  const modeEmphasis: Record<string, string> = {
    'emotional-pattern': 'Emphasize emotional shifts, recurring feelings, avoidance patterns, what was unspoken.',
    'behavioral-change': 'Emphasize action edges, follow-through tracking, habit patterns, concrete next steps.',
    'identity-transition': 'Emphasize evolving narratives, values shifts, identity language changes, ambiguity held.',
    'relational': 'Emphasize relational dynamics, projection patterns, boundary themes, interpersonal patterns.',
    'general': 'Balanced emphasis across emotional, behavioral, and conceptual dimensions.',
  };
  const modeNote = anchor.mode ? `Anchor Mode: ${anchor.mode} — ${modeEmphasis[anchor.mode] || ''}` : '';

  const prompt = `You are generating a Continuity Brief for an AI-guided session. This will be stored and fed as context to a future session. The previous brief was too synthetic and lost key nuances. Your goal is to provide a RICH, DEEP, and DESCRIPTIVE synthesis. Do not just use clinical shorthand — capture the actual texture of the user's struggle, the specific metaphors they used, and the precise edges of their realization. Ensure that the next session has all the critical context needed to pick up exactly where this one left off without losing momentum.

Identity Anchor: ${anchor.content}
${modeNote}
Session Intention: ${intention}
Success Criteria: ${successCriteria || 'None specified'}
Activity Type: ${activityType || 'reflection'}
Prior Context: ${cumulativePrior}
${priorCoreTruths}
${priorEnactment}

Session Transcript:
${transcript}

Generate the following JSON. Write descriptive, nuanced paragraphs for each field (except openThreads and persistentCoreTruths which are arrays). Do not be overly brief.
{
  "userPatterns": {
    "coreDynamic": "Describe the core dynamic in detail. How exactly does it manifest? What is the specific mechanism of avoidance or engagement?",
    "typicalDefenses": "Describe protective patterns as questions or tendencies — not clinical labels. E.g. 'tends to move toward analysis when uncomfortable' not 'rationalization'. What specific patterns were active in this session?",
    "blindSpots": "What are they still fundamentally not seeing? What is the protective function of this blind spot?",
    "triggers": "What specific words, concepts, or emotional stakes caused them to react or shut down?"
  },
  "sessionFindings": {
    "presentingToRoot": "Trace the exact narrative arc from what they thought the problem was, to the deeper root uncovered.",
    "keyInsight": "What was the profound realization of this session? Use their own impactful phrasing if applicable.",
    "shift": "Describe the tangible shift in perspective, emotion, or somatic state that occurred.",
    "successCriteriaMet": "Evaluate deeply whether the intention was met, and what specific work remains."
  },
  "analystNotes": {
    "effective": "What specific interventions, metaphors, or angles worked best to break through their defenses?",
    "avoid": "What approaches caused them to retreat, intellectualize, or disengage?"
  },
  "openThreads": ["A specific un-investigated question or thread", "Another unresolved tension from the session"],
  "nextSession": {
    "entryPoint": "Write a highly specific, compelling opening statement or question for the exact moment the next session begins.",
    "hypothesisToTest": "What is the next layer of the psychological or spiritual hypothesis to investigate?"
  },
  "cumulativeContext": "Synthesize the entire trajectory of their work so far, combining the Prior Context with today's breakthroughs into a cohesive narrative.",
  "proposedNewTruths": ["New observation not already in prior AXIS observations — max 5, only what's genuinely new"],
  "proposedUserSaves": [{"text": "A specific insight or commitment the user articulated worth naming", "kind": "insight"}],
  "behavioralCommitment": "Practice 10 seconds of silence before responding in next conflict with partner"
}

Note: proposedNewTruths — output ONLY observations that are genuinely new (not already in the established memory above). Maximum 5.
Note: proposedUserSaves — surface 0–3 insights, patterns, or commitments the user themselves named or articulated this session that are worth preserving. Include your suggested kind (insight/pattern/commitment/belief/definition). The user will decide what to keep.

CRITICAL: Respond with ONLY valid JSON (no markdown, no explanation):`;

  const result = await callGrokThenAIJson(
    'AXIS-synthesis',
    prompt,
    'openrouter/free', // 3rd arg = fallback model (Grok 4.1 Fast is primary)
    axisSynthesisSchema,
    undefined,
    4000  // 8000 caused 400s on MiMo/Qwen — 4000 is within all model limits
  );

  const now = new Date().toISOString();

  // Migration: if no items in store yet and prior brief has legacy persistentCoreTruths, migrate them as global items
  if (activeItems.length === 0 && previousBrief?.persistentCoreTruths?.length) {
    console.info('[AXIS] Migrating legacy persistentCoreTruths to memory store');
    for (const truth of previousBrief.persistentCoreTruths) {
      await writeMemoryItem({
        id: crypto.randomUUID(),
        text: truth,
        kind: 'insight',
        scope: 'global',  // migration defaults to global — truths were accumulated across all sessions
        status: 'active',
        source: 'axis',
        userApproved: false,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  // Write new AI-observed truths to the memory store
  for (const truth of (result.proposedNewTruths ?? [])) {
    await writeMemoryItem({
      id: crypto.randomUUID(),
      text: truth,
      kind: 'insight',
      scope: `anchor:${anchor.id ?? 'default'}`,
      status: 'active',
      source: 'axis',
      userApproved: false,
      createdAt: now,
      updatedAt: now,
    });
  }

  return {
    userPatterns: result.userPatterns,
    sessionFindings: result.sessionFindings,
    analystNotes: result.analystNotes,
    openThreads: result.openThreads,
    nextSession: result.nextSession,
    cumulativeContext: result.cumulativeContext,
    proposedNewTruths: result.proposedNewTruths,
    proposedUserSaves: result.proposedUserSaves,
    behavioralCommitment: result.behavioralCommitment,
    generatedAt: now,
  };
}

export async function saveSessionToSupabase(
  session: AXISSession,
  userId: string
): Promise<boolean> {
  if (!UUID_RE.test(userId)) return false;
  return wizardSessionService.saveSession({
    user_id: userId,
    session_id: session.id,
    type: 'axis',
    content: session,
    created_at: session.createdAt,
    completed_at: session.closedAt,
  });
}

export async function loadPreviousSynthesis(
  userId: string
): Promise<AXISSynthesisBrief | null> {
  if (!UUID_RE.test(userId)) {
    return readLatestSynthesis();
  }
  const sessions = await wizardSessionService.getSessionsByType(userId, 'axis');
  const last = [...sessions]
    .sort((a: AXISSession, b: AXISSession) =>
      new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    )
    .find((s: AXISSession) => s.synthesisBrief);
  return last?.synthesisBrief ?? null;
}

/**
 * Generate a Meta-Mirror macro-synthesis from the last 5 closed session briefs.
 * Auto-triggered after every 5th closed session on an anchor.
 */
export async function generateMetaSynthesis(
  recentBriefs: AXISSynthesisBrief[],
  anchor: AXISAnchor
): Promise<AXISMetaSynthesis> {
  const briefSummaries = recentBriefs.map((b, i) => `
Session ${i + 1}:
- Core Dynamic: ${b.userPatterns.coreDynamic}
- Key Insight: ${b.sessionFindings.keyInsight}
- Shift: ${b.sessionFindings.shift}
- Open Threads: ${b.openThreads.join('; ') || 'None'}
- Persistent Core Truths: ${b.persistentCoreTruths?.join('; ') || 'None'}
- Cumulative Context: ${b.cumulativeContext}
`).join('\n---\n');

  const prompt = `You are generating a Meta-Mirror trajectory report from ${recentBriefs.length} completed sessions. This is a macro-level synthesis — step back and identify what emerges over time.

Identity Anchor: ${anchor.content}

Session Summaries:
${briefSummaries}

Generate this JSON:
{
  "emergingPatterns": "Patterns that have strengthened or crystallized across these sessions",
  "stuckPoints": "What has not moved despite repeated attention",
  "languageShift": "How the user's framing or vocabulary has evolved (or stayed static)",
  "outgrownBeliefs": "Assumptions or framings that no longer fit based on session progression",
  "trajectoryReport": "Overall arc: where they started, where they are now, what direction they are heading",
  "anchorReviewPrompt": "A focused question to help the user evaluate whether their anchor still accurately captures their work"
}

CRITICAL: Respond with ONLY valid JSON (no markdown, no explanation):`;

  const result = await callGrokThenAIJson(
    'AXIS-meta-synthesis',
    prompt,
    'openrouter/free', // 3rd arg = fallback model (Grok 4.1 Fast is primary)
    z.object({
      emergingPatterns: z.string().max(500),
      stuckPoints: z.string().max(400),
      languageShift: z.string().max(400),
      outgrownBeliefs: z.string().max(400),
      trajectoryReport: z.string().max(600),
      anchorReviewPrompt: z.string().max(300),
    })
  );

  return {
    emergingPatterns: result.emergingPatterns,
    stuckPoints: result.stuckPoints,
    languageShift: result.languageShift,
    outgrownBeliefs: result.outgrownBeliefs,
    trajectoryReport: result.trajectoryReport,
    anchorReviewPrompt: result.anchorReviewPrompt,
    generatedAt: new Date().toISOString(),
    sessionIds: [],
  };
}
