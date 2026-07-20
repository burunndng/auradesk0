/**
 * Intelligence Hub - Unified AI Guidance System
 * Uses Grok 4.1 Fast via OpenRouter to synthesize all user data
 * Includes confidence validation and tonal shifts
 */

import type {
  IntelligenceContext,
  IntelligentGuidance,
  CachedGuidance,
  AllPractice,
  StackBalance,
  IntegratedInsight,
  PredictiveAlert,
  PatternFamily,
  AllSessionTypes,
} from '../types';
import { practices as allPractices } from '../constants';
import { summarizeWizardSessionsForAI } from '../utils/sessionSummarizer';
import { hashContext, type UserProfile } from '../utils/contextAggregator';
import { generateOpenRouterResponse, buildMessagesWithSystem } from './openRouterService';
import { buildToneInstructions } from './tonalShifter';
import { calculateConfidenceFromDataVolume, validateConfidence } from './confidenceValidator';
import { detectCrossModalPatterns } from './crossModalAnalyzer';
import { StorageManager } from '../.claude/lib/storageManager';
import {
  analyzeTrajectoriesForRisk,
  forecastNextChallenge,
  recommendProactiveAction,
  predictDevelopmentalStage,
} from './predictiveGuidanceEngine';
import { clusterInsights, detectPatternFamilies } from './patternRecognitionEngine';
import {
  analyzeInsights,
  analyzeTrajectoriesInWorker,
  predictDevelopmentalStageInWorker,
  forecastNextChallengeInWorker,
  recommendProactiveActionInWorker,
  detectCrossModalPatternsInWorker,
} from './intelligenceHubWorkerClient';
import { guidanceDatabaseService } from './guidanceDatabaseService';
import {
  generatePracticeSequence,
  calculatePracticePriority,
  determinePracticePhase,
  generateSequencingGuidance,
  type SequencedPractice,
  type PracticeSequence,
} from './practiceSequencer';
import {
  suggestPracticeSubstitutions,
  identifyStrugglingPractices,
  type PracticeSubstitution,
  type SubstitutionCriteria,
} from './practiceSubstitutionEngine';

// Configuration constants - all service-level config in one place
const CONFIG = {
  CACHE_KEY: 'intelligentGuidanceCache',
  CACHE_DURATION_MS: 24 * 60 * 60 * 1000,
  AI_MODEL: 'deepseek/deepseek-v4-pro',
  AI_MAX_TOKENS: 1800,
  AI_TEMPERATURE: 0.5,
  INCREMENTAL_UPDATE_THRESHOLD: 1, // Trigger AI from 1 new insight (enables first-session synthesis)
  INCREMENTAL_MAX_UPDATES: 5       // Force full reanalysis after 5 updates
} as const;

// Memoized practices array (computed once at module load)
const allPracticesFlat = [
  ...Object.values(allPractices.body),
  ...Object.values(allPractices.mind),
  ...Object.values(allPractices.spirit),
  ...Object.values(allPractices.shadow),
];

// Practice lookup map for O(1) access (instead of O(n) find)
// Build with duplicate detection to ensure data integrity
const practiceMap = new Map<string, typeof allPracticesFlat[0]>();
for (const p of allPracticesFlat) {
  // Map by ID (should always be unique)
  if (practiceMap.has(p.id)) {
    console.warn(`[IntelligenceHub] Duplicate practice ID found: ${p.id}`);
  }
  practiceMap.set(p.id, p);

  // Map by name (warn if not unique - potential data integrity issue)
  if (practiceMap.has(p.name)) {
    console.warn(`[IntelligenceHub] Duplicate practice name found: ${p.name} (from ${p.id}). Previous entry will be overwritten.`);
  }
  practiceMap.set(p.name, p);
}

// Request deduplication - prevents concurrent identical requests
const pendingRequests = new Map<string, Promise<IntelligentGuidance>>();

interface WorkerAnalysisResult {
  recurringThemes: string[];
  crossPracticeConnections: string[];
  contradictions: string[];
}

/**
 * Wrapper for cached guidance data with caching metadata
 * Separates domain object (IntelligentGuidance) from cache implementation details
 */
interface CachedGuidanceData {
  guidance: IntelligentGuidance;
  insightCountAtGeneration: number;
}


/**
 * Get cached guidance from Supabase with metadata
 */
async function getCachedGuidance(userId: string, context: IntelligenceContext): Promise<CachedGuidanceData | null> {
  const contextHash = hashContext(context);
  let cached: { guidance: IntelligentGuidance; updatedAt: string } | null = null;

  try {
    cached = await guidanceDatabaseService.getGuidance(userId, contextHash);
  } catch (err) {
    console.error('[IntelligenceHub] Error retrieving cached guidance:', err);
    return null; // Fallback to fresh generation on DB error
  }

  if (!cached) {
    return null;
  }

  // Check if cache is still valid (within CONFIG.CACHE_DURATION_MS)
  // Use database updatedAt timestamp for accurate freshness (not generatedAt from guidance object)
  const cacheAge = Date.now() - new Date(cached.updatedAt).getTime();
  if (cacheAge > CONFIG.CACHE_DURATION_MS) {
    console.log('[IntelligenceHub] Cache expired');
    return null;
  }

  // Extract the insight count from the cached guidance object (attached during generation)
  const insightCountAtGeneration = (cached.guidance as { _insightCountAtGeneration?: number })._insightCountAtGeneration ?? 0;

  return {
    guidance: cached.guidance,
    insightCountAtGeneration,
  };
}

/**
 * Cache guidance to Supabase
 * Silently fails on error (cache is nice-to-have, not critical for functionality)
 */
async function cacheGuidance(userId: string, context: IntelligenceContext, guidance: IntelligentGuidance, insightCount: number): Promise<void> {
  const contextHash = hashContext(context);
  try {
    // Attach insight count for incremental update detection (avoid mutating original object)
    const dataToCache = { ...guidance, _insightCountAtGeneration: insightCount };
    await guidanceDatabaseService.saveGuidance(userId, contextHash, dataToCache as any);
  } catch (err) {
    // Cache write failure is non-critical - log but don't throw
    console.warn('[IntelligenceHub] Failed to cache guidance:', err);
  }
}

/**
 * Get intelligent guidance with caching and request deduplication
 */
export async function getIntelligentGuidance(
  userId: string,
  context: IntelligenceContext,
  userProfile?: UserProfile
): Promise<IntelligentGuidance> {
  const cacheKey = hashContext(context);

  // Check for pending identical request
  if (pendingRequests.has(cacheKey)) {
    console.log('[IntelligenceHub] Deduplicating concurrent request');
    return await pendingRequests.get(cacheKey)!;
  }

  // Check cache first
  const cachedData = await getCachedGuidance(userId, context);
  if (cachedData) {
    const currentInsightCount = (context.integratedInsights || []).length;
    const newInsightsSinceCache = currentInsightCount - cachedData.insightCountAtGeneration;

    if (newInsightsSinceCache < CONFIG.INCREMENTAL_UPDATE_THRESHOLD) {
      // Fewer than 3 new insights — return cache without full AI regeneration
      if (import.meta.env.DEV) {
        console.log(`[IntelligenceHub] Returning CACHED guidance (${newInsightsSinceCache} new insights, below threshold of ${CONFIG.INCREMENTAL_UPDATE_THRESHOLD})`);
      }
      return cachedData.guidance;
    }

    if (import.meta.env.DEV) {
      console.log(`[IntelligenceHub] ${newInsightsSinceCache} new insights since last cache — regenerating`);
    }
  }
  if (import.meta.env.DEV) {
    console.log('[IntelligenceHub] No cache found - generating fresh guidance');
  }

  // Create new request promise
  const requestPromise = generateGuidanceInternal(userId, context, userProfile);
  pendingRequests.set(cacheKey, requestPromise);

  try {
    const result = await requestPromise;
    return result;
  } finally {
    pendingRequests.delete(cacheKey);
  }
}

/**
 * Internal guidance generation with caching
 */
async function generateGuidanceInternal(
  userId: string,
  context: IntelligenceContext,
  userProfile?: UserProfile
): Promise<IntelligentGuidance> {
  console.log('[IntelligenceHub] Generating new guidance with Grok 4.1 Fast');
  const guidance = await generateGuidance(context, userProfile);

  const insightCount = (context.integratedInsights || []).length;

  // Cache the result with metadata
  await cacheGuidance(userId, context, guidance, insightCount);

  return guidance;
}

/**
 * Generate guidance using Grok 4.1 Fast
 */
async function generateGuidance(context: IntelligenceContext, userProfile?: UserProfile): Promise<IntelligentGuidance> {
  // Calculate actual confidence from data volume
  const dataConfidence = calculateConfidenceFromDataVolume(
    context.wizardSessions.length,
    context.wizardSessions.filter(s => {
      const sessionDate = new Date(s.date);
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return sessionDate > oneWeekAgo;
    }).length,
    context.integratedInsights.length
  );

  // Run reflective analysis functions in Web Worker (off main thread), in parallel
  let recurringThemes: string[] = [];
  let crossPracticeConnections: string[] = [];
  let contradictions: string[] = [];
  let crossModalPatterns: string[] = [];

  console.log('[IntelligenceHub] Attempting parallel worker analysis for', context.integratedInsights.length, 'insights');
  const [workerAnalysisResult, crossModalRaw] = await Promise.allSettled([
    analyzeInsights(context.integratedInsights),
    detectCrossModalPatternsInWorker(context.wizardSessions || []),
  ]);

  if (workerAnalysisResult.status === 'fulfilled') {
    recurringThemes = workerAnalysisResult.value.recurringThemes;
    crossPracticeConnections = workerAnalysisResult.value.crossPracticeConnections;
    contradictions = workerAnalysisResult.value.contradictions;
    console.log('[IntelligenceHub] Worker analysis complete');
  } else {
    // Worker failed — guidance quality is degraded (no recurring themes / cross-practice connections).
    // Log as error so it shows up in monitoring. TODO: replace with Sentry.captureException once VITE_SENTRY_DSN is configured.
    console.error('[IntelligenceHub] Worker analysis failed — guidance generated without recurring-theme depth:', workerAnalysisResult.reason);
  }

  // Module 1: Detect cross-modal patterns (shadow themes appearing in body/mind/spirit)
  try {
    let rawPatterns: any[] | null = null;
    if (crossModalRaw.status === 'fulfilled' && crossModalRaw.value !== null) {
      rawPatterns = crossModalRaw.value;
    } else {
      // Sync fallback if worker unavailable
      if (crossModalRaw.status === 'rejected') {
        console.warn('[IntelligenceHub] Worker cross-modal dispatch failed, using sync fallback:', crossModalRaw.reason);
      }
      rawPatterns = detectCrossModalPatterns((context.wizardSessions || []) as unknown as AllSessionTypes[]);
    }
    // Map CrossModalPattern to readable strings (no description field exists)
    crossModalPatterns = (rawPatterns || [])
      .map((p: any) => {
        const parts: string[] = [];
        if (p.shadowTheme) parts.push(`Shadow: ${p.shadowTheme}`);
        if (p.somaticPattern) parts.push(`Body: ${p.somaticPattern}`);
        if (p.mindPattern) parts.push(`Mind: ${p.mindPattern}`);
        if (p.spiritPattern) parts.push(`Spirit: ${p.spiritPattern}`);
        return parts.length > 0 ? parts.join(' | ') : null;
      })
      .filter((s: string | null): s is string => s !== null)
      .slice(0, 5); // Limit to top 5 for token efficiency
    if (crossModalPatterns.length > 0) {
      console.log('[IntelligenceHub] Cross-modal patterns detected:', crossModalPatterns.length);
    }
  } catch (error) {
    console.warn('[IntelligenceHub] Cross-modal analysis failed:', error);
    // Silent fail - continue without cross-modal insights
  }

  const systemPrompt = buildSystemPrompt(dataConfidence);

  const userPrompt = buildUserPrompt(context, userProfile, recurringThemes, crossPracticeConnections, contradictions, crossModalPatterns);

  // DEBUG: Log what data is being sent to AI
  if (import.meta.env.DEV) {
    console.log('[IntelligenceHub DEBUG] Wizard sessions count:', context.wizardSessions.length);
    console.log('[IntelligenceHub DEBUG] Sessions:', JSON.stringify(context.wizardSessions.slice(0, 3), null, 2));
    console.log('[IntelligenceHub DEBUG] User prompt preview:', userPrompt.substring(0, 1000));
  }

  const predictiveAlertsPromise = generatePredictiveAlerts(context);

  try {
    // Build messages array with system prompt
    const messages = buildMessagesWithSystem(systemPrompt, [
      { role: 'user', content: userPrompt }
    ]);

    const response = await generateOpenRouterResponse(
      messages,
      undefined, // no streaming
      {
        model: CONFIG.AI_MODEL,
        maxTokens: CONFIG.AI_MAX_TOKENS,
        temperature: CONFIG.AI_TEMPERATURE
      }
    );

    if (!response.success || !response.text) {
      throw new Error('Failed to generate guidance');
    }

    // Parse the JSON response
    const parsed = parseGuidanceResponse(response.text);
    const predictiveAlerts = await predictiveAlertsPromise;

    // Module 3: Validate confidence claims against data volume
    const validationResult = validateConfidence(
      JSON.stringify(parsed),
      dataConfidence,
      context.integratedInsights.length
    );

    // Build recommendations object
    let recommendations = {
      ...parsed.recommendations,
      predictiveAlerts,
    };

    // Add confidence caveat if overconfidence detected
    let cautions = [...(parsed.cautions || [])];
    if (validationResult.mismatchType === 'overconfident' && validationResult.suggestion) {
      cautions.push(validationResult.suggestion);
    }

    // Module 2: Enhance with practice sequencing (only if validation passed)
    if (validationResult.isValid !== false) {
      const sequenced = enhanceRecommendationsWithSequencing(
        recommendations,
        context
      );
      recommendations = sequenced;
    }

    return {
      ...parsed,
      cautions,
      recommendations,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[IntelligenceHub] Error generating guidance:', error);
    throw error;
  }
}

/**
 * Build comprehensive system prompt
 * Optimized for clarity + token efficiency + JSON output
 */
function buildSystemPrompt(dataConfidence: number = 0.7): string {
  const toneInstructions = buildToneInstructions(dataConfidence);

  return `You are an Integral Life Practice intelligence analyst specializing in developmental psychology and contemplative practices.

Your role is to synthesize multi-modal practice data into actionable, evidence-based guidance.

## MODEL SETTINGS
reasoning: high (prioritize deep, step-by-step analysis over surface-level summaries)

${toneInstructions}

## ANALYSIS FRAMEWORK
1. **Pattern Significance:** Assess impact, urgency, and developmental potential
2. **Cross-Practice Synergies:** Identify reinforcing and contradictory patterns
3. **Temporal Dynamics:** Track pattern evolution (emerging, stable, fading, dormant)
4. **Developmental Stage:** Consider user's experience level and readiness
5. **Actionability:** Prioritize concrete, achievable next steps

## SYNTHESIS QUALITY BY CONFIDENCE
- **High Confidence (50+ sessions):** Deep analysis with specific recommendations
- **Medium Confidence (20-49 sessions):** Balanced analysis with cautious suggestions
- **Low Confidence (<20 sessions):** Humble observations with gentle invitations

## OUTPUT REQUIREMENTS
- **Synthesis:** 2-3 sentences maximum — the single clearest thing you see
- **Recommendations:** Specific, sequenced, with clear rationale
- **Reasoning:** Max 3 items in whatINoticed, max 2 in howItConnects — quality over quantity
- **Cautions:** Max 2 items — only meaningful limitations
- **Avoid:** Generic advice, vague patterns, ungrounded speculation, padding

## DEEP SYNTHESIS PROTOCOL ("The Golden Thread")
Do not just list disconnected patterns. You must find the single narrative thread that ties Body, Mind, and Shadow data together.
- **Causal Linking:** Ask "How does the [Somatic Tension] physically facilitate the [Shadow Projection]?"
- **Defense Mapping:** Ask "Is the [Mental Confusion] actually a clever defense against the [Emotional Grief]?"
- **The "Why" Beneath:** Move from "You are anxious" (Symptom) to "You generate anxiety to avoid feeling powerlessness" (Mechanism).

## SCALABLE ANALYSIS DEPTH (Adaptability Protocol)
Your depth must be proportional to the data density. Do not over-extrapolate.
- **LEVEL 1 (Sparse Data / 1-2 sessions):** Focus on "Initial Observations." Use phrases like "I'm noticing a single data point around..." and "A potential growth edge to watch is..."
- **LEVEL 2 (Moderate Data / 3-5 sessions):** Shift to "Emerging Patterns." Look for recurring keywords and cross-modality signals.
- **LEVEL 3 (High Data / 6+ sessions):** Execute "Structural Synthesis." Map the user's "Core Operating System" and identify deep-seated developmental drivers.
- **SOUNDNESS RULE:** It is better to be "Sound and Simple" with 1 session than "Complex and Wrong." If data is thin, prioritize safety and foundational grounding.

## REFLECTIVE ANALYSIS APPROACH

**Clinical/Developmental Tone with Transparent Caveats:**
- ALWAYS cite evidence by wizard type and date (e.g., "Your recent IFS session" or "In your Bias Detective work")
- Show confidence level based on cross-validation across wizard types
- NEVER claim what data doesn't support
- Examples:
  * "Based on your IFS session and Shadow Journaling, clear pattern: X. Confidence: High (cross-validated)"
  * "From your recent Memory Reconsolidation work, you described Y. Monitoring for recurrence in future sessions"
  * "Tension detected: In your Polarity Mapper work, you held both A and B. This polarity may indicate..."

**Quality Over Quantity - Judge by Information Richness:**
- Information density: Deep IFS session > 5 superficial completions
- Cross-practice validation: Same theme in 3+ wizard types = strong pattern
- Specificity: Concrete details/quotes > vague answers
- Contradiction presence: Clear tensions = sophisticated engagement

**Analysis Priority:**
1. Use "Reflective Pattern Analysis" section as PRIMARY data source
2. Recurring themes = patterns appearing 2+ times across insights
3. Cross-practice connections = developmental links between different wizard types
4. Tensions/polarities = opposing patterns held simultaneously (NOT contradictions to fix)

## OUTPUT FORMAT

You MUST respond with ONLY a valid JSON object. No markdown, no preamble, no explanation outside the JSON.

The JSON structure must include these exact fields (output as pure JSON without markdown code fences):
{
  "synthesis": "2-3 sentences MAX. The single clearest pattern you see across all data. Cite wizard types. Focus on what you SEE, not prescriptions. Use 'you' language.",
  "primaryFocus": "1 sentence. The dominant pattern. Evidence citation. Reflective, not directive.",
  "recommendations": {
    "nextWizard": {
      "type": "wizard_type_from_guide",
      "name": "Human-readable wizard name",
      "reason": "Why this wizard aligns with the pattern you're seeing (cite wizard types and sessions)",
      "focus": "What pattern to explore in this wizard",
      "priority": "high|medium|low",
      "confidence": 0.85,
      "evidence": ["your recent IFS session", "from your Somatic Practice work"],
      "timing": "this_week|next_week|when_ready"
    },
    "practiceChanges": {
      "add": [
        {
          "practiceName": "Exact practice name from library",
          "reason": "How this practice relates to the pattern you're seeing",
          "priority": "high|medium|low",
          "startTiming": "now|week 2|week 3",
          "timeCommitment": "15 min/day",
          "sequenceWeek": 1,
          "sequenceGuidance": "Start immediately to build foundation",
          "expectedBenefits": "What they'll gain from this practice",
          "integrationTips": "How to weave this into existing stack"
        }
      ],
      "remove": [],
      "modify": []
    },
    "insightWork": {
      "pattern": "The core pattern reflected in the data",
      "approachSuggestion": "Reflective framing of how to work with this pattern"
    },
    "stackBalance": {
      "body": "25%",
      "mind": "35%",
      "spirit": "20%",
      "shadow": "20%"
    }
  },
  "reasoning": {
    "whatINoticed": [
      "Pattern observation 1 — cite wizard type + session (one sentence)",
      "Pattern observation 2 — cite evidence (one sentence)",
      "Pattern observation 3 — confidence level (one sentence, omit if low-data)"
    ],
    "howItConnects": [
      "Cross-practice link 1 — how two wizard types reinforce each other (one sentence)",
      "Cross-practice link 2 — what deeper structure this suggests (one sentence, omit if insufficient data)"
    ]
  },
  "cautions": [
    "Data limitation or confidence caveat (one sentence — omit second item if not meaningful)"
  ],
  "openQuestion": "One genuine question that proves you are thinking, not categorizing. Something the user could not have anticipated. Leave empty string if nothing compelling emerges."
}

## CRITICAL REQUIREMENTS

✓ Before you respond, take a moment to verify your reasoning. Are you confident? Walk through it once more to be sure.
✓ Output ONLY the JSON object shown above - do NOT wrap it in markdown code fences (no \`\`\`json)
✓ Use "you" language exclusively in all text fields. Never "they" or third-person
✓ ALWAYS cite evidence by wizard type and timeframe (e.g., "your recent IFS session" or "from your Body Scan practice") - NOT raw IDs
✓ EVERY observation must cite evidence from the Reflective Pattern Analysis section
✓ Show confidence levels based on cross-validation (High = 3+ wizard types, Moderate = 2, Low = 1)
✓ Tone: ${dataConfidence < 0.5 ? 'Exploratory - emerging patterns, limited data' : dataConfidence < 0.75 ? 'Observational - converging patterns, moderate confidence' : 'Definitive - strong patterns, cross-validated'}
✓ Frame tensions as polarities being held, NOT problems to solve
✓ "synthesis" and "primaryFocus" must REFLECT patterns, not prescribe actions
✓ "reasoning.whatINoticed" must cite wizard types and sessions (human-readable, not IDs)
✓ "reasoning.howItConnects" must show cross-practice links with evidence (e.g., "From your IFS work + Somatic Practice...")
✓ "cautions" must include data limitations and confidence caveats
✓ Fill all four stack areas (Body/Mind/Spirit/Shadow) unless explicitly contra-indicated
✓ Sequence practices over 1-8 weeks, not all at once
✓ reasoning.whatINoticed: 2-3 items max. reasoning.howItConnects: 1-2 items max. cautions: 1-2 items max
✓ practiceChanges.add: 2-3 practices max — do not pad with low-value additions
✓ openQuestion: One specific question that proves you are thinking, not categorizing. If you cannot generate a genuinely specific question from the available data, use exactly: "What would you add to this portrait that I couldn't see from here?" — never leave a generic or presumptuous question

## WIZARD CHOICE GUIDE

Pick ONE wizard based on the PATTERN you're seeing (not prescribing what they "need"):
- **IFS**: Pattern shows internal conflict, parts-based dynamics
- **Bias Detective**: Pattern shows unconscious thought patterns emerging
- **Subject-Object**: Pattern shows fusion with beliefs/worldview
- **3-2-1**: Pattern shows projection themes across insights
- **Somatic**: Pattern shows disconnect from body signals
- **Kegan**: Pattern suggests developmental transition
- **Memory Recon**: Pattern shows past-rooted belief structures
- **Relational**: Pattern shows relationship dynamics across contexts
- **Big Mind**: Pattern shows perspective rigidity
- **Polarity**: Pattern shows either/or thinking (or HOLDING polarities well)
- **Eight Zones**: Pattern shows complexity across multiple perspectives
- **Adaptive Cycle**: Pattern shows system transition/resilience themes
- **Perspective Shifter**: Pattern shows rigid self-narratives
- **Role Alignment**: Pattern shows role conflict across insights
- **Attachment**: Pattern shows attachment dynamics
- **Meditation Finder**: Pattern shows contemplative practice themes
- **Schema Detective**: Pattern shows early maladaptive schemas, coping patterns, schema modes

## PRACTICE MATCHING RULES (Reflective Framing)

✓ Match complexity to experience level (beginner → simple; experienced → subtle)
✓ Mix modalities: balance Body/Mind/Spirit/Shadow across all recommendations
✓ Time: shorter practices in early weeks, build duration as momentum grows
✓ Link practice to PATTERN: explain how practice relates to what you're seeing in their data
✓ If mood declining: note this pattern and suggest grounding, restorative practices
✓ If mood improving: note momentum pattern and suggest growth-oriented practices
✓ Respect constraints (time, energy, family situation)
✓ Frame suggestions as "based on pattern X, practice Y may support exploration" NOT "you should do Y"

## PRACTICE SEQUENCING

- sequenceWeek: number 1-8 indicating when to introduce the practice
- Week 1-2: Foundation practices (grounding, basic skills)
- Week 3-4: Building practices (deeper work, integration)
- Week 5+: Advanced practices (subtle work, synthesis)
- startTiming: "now" (week 1), "week 2", "week 3", etc.

Remember: Output ONLY valid JSON. No markdown code fences (\`\`\`json), no extra text.`;
}

/**
 * Build user-specific prompt from context
 */
function buildUserPrompt(
  context: IntelligenceContext,
  userProfile?: UserProfile,
  recurringThemes: string[] = [],
  crossPracticeConnections: string[] = [],
  contradictions: string[] = [],
  crossModalPatterns: string[] = []
): string {
  const parts: string[] = [];

  // Inject first-session intake context if present (shapes synthesis without being quoted back)
  const intake = userProfile?.firstSessionIntake;
  if (intake) {
    parts.push('## User Context (background only — shapes interpretation, do not quote intake directly)');
    parts.push(`What brought them here: ${intake.whatBringsYouHere}`);
    parts.push(`Where they feel it: ${intake.whereYouFeelIt}`);
    if (intake.priorModalities.length > 0) {
      parts.push(`Prior modalities: ${intake.priorModalities.join(', ')}`);
    } else {
      parts.push('Prior modalities: None listed');
    }
    if (intake.patternFreeText) {
      parts.push(`In their own words: "${intake.patternFreeText}" — weight this heavily`);
    } else {
      parts.push('Note: no free-text provided — work with thin signal. Be shorter, ask more back in openQuestion, be explicit about what you cannot see yet.');
    }
    const sessionCount = context.wizardSessions.length;
    const lastSession = context.wizardSessions.length > 0
      ? context.wizardSessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
      : null;
    const daysSinceLastSession = lastSession
      ? Math.floor((Date.now() - new Date(lastSession.date).getTime()) / (1000 * 60 * 60 * 24))
      : null;
    parts.push(`Sessions completed: ${sessionCount} | ${daysSinceLastSession !== null ? `Last session: ${daysSinceLastSession} day(s) ago` : 'No sessions yet'}`);
    parts.push('=== END USER CONTEXT ===');
    parts.push('');
  }

  // Calculate completion rate for last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentCompletions = context.completionHistory.filter(c =>
    new Date(c.date).getTime() > thirtyDaysAgo.getTime()
  );
  const completionRate = recentCompletions.length > 0
    ? Math.round((recentCompletions.filter(c => c.completed).length / recentCompletions.length) * 100)
    : 0;

  // Analyze pattern evolution
  const recentInsights = context.integratedInsights.filter(i =>
    new Date(i.dateCreated).getTime() > thirtyDaysAgo.getTime()
  );
  const olderInsights = context.integratedInsights.filter(i =>
    new Date(i.dateCreated).getTime() <= thirtyDaysAgo.getTime()
  );

  const patternEvolution = trackPatternEvolution(recentInsights, olderInsights);

  // Current practice stack
  parts.push('## Current Practice Stack');
  if (context.currentPracticeStack.length === 0) {
    parts.push('No practices in current stack.');
  } else {
    for (const practice of context.currentPracticeStack) {
      const note = context.practiceNotes[practice.id];
      const module = (practice as any).module || 'unknown';
      parts.push(`- **${practice.name}** (${module} module)`);
      if (note) {
        parts.push(`  Note: "${note}"`);
      }
    }
  }

  parts.push(`Completion Rate: ${completionRate}% (last 30 days)`);
  parts.push('');

  // Wizard sessions
  parts.push('## Wizard Work Completed');
  const wizardSummary = summarizeWizardSessionsForAI(context.wizardSessions);
  parts.push(wizardSummary);
  parts.push('');

  // Pattern evolution tracking
  parts.push('## Pattern Evolution');
  parts.push(`Emerging: ${patternEvolution.emerging.join(', ') || 'none'}`);
  parts.push(`Stable: ${patternEvolution.stable.join(', ') || 'none'}`);
  parts.push(`Dormant: ${patternEvolution.dormant.join(', ') || 'none'}`);
  parts.push('');

  // Integrated insights — cap at 15 most recent to prevent unbounded prompt growth
  const insightsToSend = [...context.integratedInsights]
    .sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime())
    .slice(0, 15);
  parts.push(`## Integrated Insights (${insightsToSend.length} most recent${context.integratedInsights.length > 15 ? ` of ${context.integratedInsights.length} total` : ''})`);
  if (insightsToSend.length === 0) {
    parts.push('No insights available.');
  } else {
    for (const insight of insightsToSend) {
      parts.push(`- **${insight.mindToolType}**`);
      parts.push(`  Pattern: ${insight.detectedPattern}`);
      parts.push(`  Summary: ${insight.mindToolShortSummary}`);
      parts.push(`  Date: ${insight.dateCreated}`);
      parts.push('');
    }
  }
  parts.push('');

  // Reflective Analysis Results
  parts.push('## Reflective Pattern Analysis');
  parts.push('');

  if (recurringThemes && recurringThemes.length > 0) {
    parts.push('### Recurring Themes Detected:');
    for (const theme of recurringThemes) {
      parts.push(`- ${theme}`);
    }
    parts.push('');
  }

  if (crossPracticeConnections && crossPracticeConnections.length > 0) {
    parts.push('### Cross-Practice Connections:');
    for (const connection of crossPracticeConnections) {
      parts.push(`- ${connection}`);
    }
    parts.push('');
  }

  if (contradictions && contradictions.length > 0) {
    parts.push('### Tensions/Polarities Detected:');
    for (const contradiction of contradictions) {
      parts.push(`- ${contradiction}`);
    }
    parts.push('');
  }

  // Module 1: Add cross-modal patterns to prompt
  if (crossModalPatterns && crossModalPatterns.length > 0) {
    parts.push('### Cross-Modal Patterns (Shadow ↔ Body/Mind/Spirit):');
    for (const pattern of crossModalPatterns) {
      parts.push(`- ${pattern}`);
    }
    parts.push('');
  }

  if ((!recurringThemes || recurringThemes.length === 0) &&
      (!crossPracticeConnections || crossPracticeConnections.length === 0) &&
      (!contradictions || contradictions.length === 0) &&
      (!crossModalPatterns || crossModalPatterns.length === 0)) {
    parts.push('Insufficient data for pattern analysis. Need 2+ insights from different wizard types.');
    parts.push('');
  }

  // Developmental profile
  parts.push('## Developmental Profile');
  if (context.developmentalStage) {
    parts.push(`- Kegan Stage: ${context.developmentalStage}`);
  }
  if (context.attachmentStyle) {
    parts.push(`- Attachment Style: ${context.attachmentStyle}`);
  }
  if (context.primaryChallenges.length > 0) {
    parts.push(`- Primary Challenges: ${context.primaryChallenges.join('; ')}`);
  }
  if (!context.developmentalStage && !context.attachmentStyle && context.primaryChallenges.length === 0) {
    parts.push('No developmental assessments completed yet.');
  }
  parts.push('');

  // Recent practice completion
  parts.push('## Recent Practice Activity');
  const completedCount = context.completionHistory.filter((c) => c.completed).length;
  const totalCount = context.completionHistory.length;
  if (totalCount === 0) {
    parts.push('No recent practice activity recorded.');
  } else {
    parts.push(`Completed ${completedCount} of ${totalCount} practices today.`);
  }
  parts.push('');

  // User Profile Context (if available)
  if (userProfile) {
    parts.push('## User Profile & Personalization Context');
    parts.push(`- Experience Level: ${userProfile.experienceLevel}`);
    parts.push(`- Practice Compliance: ${(userProfile.practiceComplianceRate * 100).toFixed(0)}%`);
    parts.push(`- Preferred Modalities: Mind (${(userProfile.preferredModalities.mind * 100).toFixed(0)}%), Body (${(userProfile.preferredModalities.body * 100).toFixed(0)}%), Spirit (${(userProfile.preferredModalities.spirit * 100).toFixed(0)}%), Shadow (${(userProfile.preferredModalities.shadow * 100).toFixed(0)}%)`);
    parts.push(`- Preferred Intensity: ${userProfile.preferredIntensity}`);
    parts.push(`- Average Energy Level: ${userProfile.energyResponseToPractice.averageEnergyLevel}/10`);

    if (userProfile.recurringPatterns.length > 0) {
      parts.push(`- Recurring Patterns: ${userProfile.recurringPatterns.join(', ')}`);
    }
    if (userProfile.commonBlockers.length > 0) {
      parts.push(`- Common Blockers: ${userProfile.commonBlockers.join(', ')}`);
    }

    // Mood & Emotional Context
    if (userProfile.sentimentSummary) {
      parts.push('');
      parts.push('### Mood & Emotional Context');
      parts.push(`- Current Mood Score: ${userProfile.sentimentSummary.averageMoodScore.toFixed(2)} (scale: -1.0 very negative to 1.0 very positive)`);
      parts.push(`- Mood Trend: ${userProfile.sentimentSummary.moodTrend}`);
      if (userProfile.sentimentSummary.recentMoodKeywords.length > 0) {
        parts.push(`- Recent Mood Keywords: ${userProfile.sentimentSummary.recentMoodKeywords.join(', ')}`);
      }
    }
    parts.push('');
  }

  // Request
  parts.push('---');
  parts.push('');
  parts.push('Based on ALL of this data, provide developmental guidance focusing on the most actionable patterns.');
  parts.push('');
  parts.push('CRITICAL ANALYSIS DIRECTIVES:');
  parts.push('- Use the Reflective Pattern Analysis above as your PRIMARY data source');
  parts.push('- Cite specific insights by ID when making observations');
  parts.push('- Show confidence levels based on cross-validation across wizard types');
  parts.push('- **Pattern Evolution Priority:** Emerging patterns need attention, stable patterns indicate mastery, dormant patterns may indicate completion');
  parts.push('- Frame tensions as polarities being held, not problems to fix');
  parts.push('');

  // Determine priority focus based on pattern evolution
  const priorityFocus = determinePriorityFocus(patternEvolution, recentInsights);
  if (priorityFocus) {
    parts.push(`**Priority Focus:** ${priorityFocus}`);
    parts.push('');
  }

  parts.push('If insufficient data (fewer than 2 insights), acknowledge this limitation clearly.');

  return parts.join('\n');
}

/**
 * Parse guidance response from Grok (Pure JSON format)
 */
function parseGuidanceResponse(text: string): Omit<IntelligentGuidance, 'generatedAt'> {
  try {
    // Clean the response - remove markdown fences if present
    let cleanedText = text.trim();

    // Remove markdown code fences if the AI included them despite instructions
    const jsonMatch = cleanedText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      cleanedText = jsonMatch[1].trim();
    }

    // Parse the JSON response
    const parsed = JSON.parse(cleanedText);

    // Validate required fields
    if (!parsed.synthesis || !parsed.primaryFocus || !parsed.recommendations || !parsed.reasoning || !parsed.cautions) {
      throw new Error('Missing required fields in AI response');
    }

    const recommendations = parsed.recommendations ?? {};

    // Normalize practice changes
    const practiceChangesRaw = recommendations.practiceChanges ?? {};
    const practiceChanges = {
      add: Array.isArray(practiceChangesRaw.add) ? practiceChangesRaw.add : [],
      remove: Array.isArray(practiceChangesRaw.remove) ? practiceChangesRaw.remove : [],
      modify: Array.isArray(practiceChangesRaw.modify) ? practiceChangesRaw.modify : [],
    };

    // Use memoized practice map for O(1) lookup instead of O(n) find
    practiceChanges.add = practiceChanges.add.slice(0, 3).map((rec: any) => {
      const practice = practiceMap.get(rec.practiceId) || practiceMap.get(rec.practiceName);
      return {
        practice: practice || { id: rec.practiceId || 'unknown', name: rec.practiceName || 'Unknown Practice' },
        reason: rec.reason || 'Recommended for your development',
        priority: rec.priority || 'medium',
        startTiming: rec.startTiming || 'now',
        timeCommitment: rec.timeCommitment || '15 min/day',
        integration: rec.integration,
        sequenceWeek: rec.sequenceWeek || 1,
        sequenceGuidance: rec.sequenceGuidance || rec.startTiming || 'Start now to build momentum',
        expectedBenefits: rec.expectedBenefits || 'Supports your current growth edge',
        integrationTips: rec.integrationTips || 'Layer this with an existing practice for smoother adoption',
      };
    });

    practiceChanges.remove = practiceChanges.remove.map((entry: any) => {
      if (typeof entry === 'string') return entry;
      if (entry?.practiceName) return entry.practiceName;
      return 'Remove lowest-impact practice';
    });

    practiceChanges.modify = practiceChanges.modify.map((entry: any) => ({
      practiceId: entry?.practiceId || entry?.practice?.id || 'unknown',
      practiceName: entry?.practiceName || entry?.practice?.name || 'Practice',
      suggestion: entry?.suggestion || 'Adjust timing or intensity to better fit your current focus.',
    }));

    recommendations.practiceChanges = practiceChanges;

    // Normalize stack balance values to percentage strings
    const formatPercent = (value: unknown): string => {
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed.endsWith('%')) return trimmed;
        if (trimmed.length === 0) return '0%';
        return `${trimmed}%`;
      }
      if (typeof value === 'number' && Number.isFinite(value)) {
        const clamped = Math.max(0, Math.min(100, Math.round(value)));
        return `${clamped}%`;
      }
      return '0%';
    };

    const stackBalanceSource: Partial<StackBalance> = recommendations.stackBalance || {};
    recommendations.stackBalance = {
      body: formatPercent(stackBalanceSource.body),
      mind: formatPercent(stackBalanceSource.mind),
      spirit: formatPercent(stackBalanceSource.spirit),
      shadow: formatPercent(stackBalanceSource.shadow),
    };

    if (!Array.isArray(recommendations.predictiveAlerts)) {
      recommendations.predictiveAlerts = [];
    }

    if (recommendations.nextWizard) {
      const wizard = recommendations.nextWizard;
      wizard.name = wizard.name || wizard.type || 'Recommended Wizard';
      wizard.reason = wizard.reason || 'This wizard aligns with your current growth edge.';
      wizard.focus = wizard.focus || 'Focus on the active pattern that keeps resurfacing.';
      wizard.priority = wizard.priority || 'medium';
      wizard.confidence = typeof wizard.confidence === 'number' ? wizard.confidence : 0.6;
      wizard.evidence = Array.isArray(wizard.evidence) ? wizard.evidence : [];
      wizard.timing = wizard.timing || 'this_week';
    }

    // Ensure reasoning fields are arrays (whyThisMatters kept for cached-response compatibility)
    const reasoning = {
      whatINoticed: Array.isArray(parsed.reasoning.whatINoticed) ? parsed.reasoning.whatINoticed : [],
      whyThisMatters: Array.isArray(parsed.reasoning.whyThisMatters) ? parsed.reasoning.whyThisMatters : [],
      howItConnects: Array.isArray(parsed.reasoning.howItConnects) ? parsed.reasoning.howItConnects : [],
    };

    // Enforce output caps — trim arrays to prevent overbloat regardless of what AI returned
    reasoning.whatINoticed = reasoning.whatINoticed.slice(0, 3);
    reasoning.howItConnects = reasoning.howItConnects.slice(0, 2);

    // Ensure cautions is an array, capped at 2
    const cautions = (Array.isArray(parsed.cautions) ? parsed.cautions : []).slice(0, 2);

    // Extract openQuestion — a genuine question back to the user
    const openQuestion = typeof parsed.openQuestion === 'string' ? parsed.openQuestion.trim() : undefined;

    // Convert the JSON back to markdown for rawMarkdown field (for backward compatibility)
    const rawMarkdown = generateMarkdownFromJson(parsed);

    return {
      synthesis: parsed.synthesis,
      primaryFocus: parsed.primaryFocus,
      recommendations: parsed.recommendations,
      reasoning,
      cautions,
      openQuestion: openQuestion || undefined,
      rawMarkdown,
    };
  } catch (error) {
    console.error('[IntelligenceHub] Failed to parse response:', error);
    console.log('[IntelligenceHub] Raw text:', text.substring(0, 500) + '...');

    // Try to extract any useful information from a malformed response
    const fallbackGuidance = extractFallbackGuidance(text);
    if (fallbackGuidance) {
      return fallbackGuidance;
    }

    // Return minimal fallback guidance
    return {
      synthesis: 'Unable to generate comprehensive guidance at this time. This may be due to limited data or a technical issue.',
      primaryFocus: 'Continue with your current practices and consider completing more wizard sessions to build your developmental profile.',
      recommendations: {
        practiceChanges: { add: [], remove: [], modify: [] },
        predictiveAlerts: [],
      },
      reasoning: {
        whatINoticed: ['Insufficient data to generate detailed analysis'],
        whyThisMatters: ['More wizard sessions will improve guidance quality'],
        howItConnects: ['Complete 2-3 wizard sessions for better recommendations'],
      },
      cautions: ['AI guidance requires more user data for optimal results'],
    };
  }
}

/**
 * Generate markdown from JSON (for rawMarkdown field)
 */
function generateMarkdownFromJson(data: any): string {
  const parts: string[] = [];

  parts.push('## Where You Are\n');
  parts.push(data.synthesis + '\n\n');

  parts.push('## Primary Focus\n');
  parts.push(data.primaryFocus + '\n\n');

  if (data.recommendations?.nextWizard) {
    parts.push('## Recommended Wizard\n');
    parts.push(`**${data.recommendations.nextWizard.name}**\n`);
    parts.push(`${data.recommendations.nextWizard.reason}\n\n`);
  }

  parts.push('## How It All Connects\n');
  if (data.reasoning?.whatINoticed?.length > 0) {
    parts.push('### What I Noticed:\n');
    data.reasoning.whatINoticed.forEach((item: string) => parts.push(`- ${item}\n`));
    parts.push('\n');
  }
  if (data.reasoning?.howItConnects?.length > 0) {
    parts.push('### Connections:\n');
    data.reasoning.howItConnects.forEach((item: string) => parts.push(`- ${item}\n`));
    parts.push('\n');
  }

  if (data.cautions?.length > 0) {
    parts.push('## Cautions\n');
    data.cautions.forEach((caution: string) => parts.push(`- ${caution}\n`));
  }

  return parts.join('');
}

/**
 * Attempt to extract guidance from a malformed response
 */
function extractFallbackGuidance(text: string): Omit<IntelligentGuidance, 'generatedAt'> | null {
  try {
    // Try to find any JSON object in the text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.synthesis && parsed.primaryFocus) {
        const fallbackRecommendations = parsed.recommendations || {};
        if (!Array.isArray(fallbackRecommendations.predictiveAlerts)) {
          fallbackRecommendations.predictiveAlerts = [];
        }

        return {
          synthesis: parsed.synthesis,
          primaryFocus: parsed.primaryFocus,
          recommendations: fallbackRecommendations,
          reasoning: {
            whatINoticed: parsed.reasoning?.whatINoticed || ['Data extracted from partial response'],
            whyThisMatters: parsed.reasoning?.whyThisMatters || [],
            howItConnects: parsed.reasoning?.howItConnects || ['Continue building your practice'],
          },
          cautions: parsed.cautions || [],
        };
      }
    }
  } catch (e) {
    // Ignore and return null
  }
  return null;
}

/**
 * Clear cached guidance (useful when user wants fresh analysis)
 */
export async function clearGuidanceCache(userId: string): Promise<void> {
  StorageManager.delete('intelligenceHubCache');
  try {
    await guidanceDatabaseService.deleteGuidance(userId);
  } catch (err) {
    console.error('[IntelligenceHub] Warning: Failed to clear database guidance cache:', err);
    // Continue anyway - localStorage is cleared which is sufficient
  }
  console.log('[IntelligenceHub] Cache cleared');
}

async function generatePredictiveAlerts(context: IntelligenceContext): Promise<PredictiveAlert[]> {
  try {
    const insights = context.integratedInsights || [];
    const sessions = context.wizardSessions || [];

    if (insights.length === 0) {
      return [];
    }

    const [alertsResult, developmentalPhaseResult] = await Promise.allSettled([
      analyzeTrajectoriesInWorker(insights, sessions).then(r => r ?? analyzeTrajectoriesForRisk(insights, sessions)),
      predictDevelopmentalStageInWorker(sessions, insights).then(r => r ?? predictDevelopmentalStage(sessions, insights)),
    ]);
    const alerts = alertsResult.status === 'fulfilled' ? alertsResult.value : analyzeTrajectoriesForRisk(insights, sessions);
    const developmentalPhase = developmentalPhaseResult.status === 'fulfilled' ? developmentalPhaseResult.value : predictDevelopmentalStage(sessions, insights);

    const patternFamilies = await buildPatternFamiliesFromInsights(insights);
    let forecastAlert: PredictiveAlert | null = null;

    if (patternFamilies.length > 0) {
      const forecastRaw = await forecastNextChallengeInWorker(patternFamilies, insights.slice(0, 15))
        .then(r => r ?? forecastNextChallenge(patternFamilies, insights.slice(0, 15)))
        .catch(() => forecastNextChallenge(patternFamilies, insights.slice(0, 15)));
      const forecast = forecastRaw;
      if (forecast) {
        const proactiveRecommendation = await recommendProactiveActionInWorker(forecast)
          .then(r => r ?? recommendProactiveAction(forecast))
          .catch(() => recommendProactiveAction(forecast));
        forecastAlert = {
          id: `forecast-${Date.now()}`,
          type: 'transition',
          severity: forecast.confidence > 0.8 ? 'high' : forecast.confidence > 0.6 ? 'medium' : 'low',
          timeframe: forecast.timeframe,
          title: `Upcoming: ${forecast.likelyChallenge}`,
          description: forecast.rationale,
          triggerIndicators: forecast.triggerIndicators,
          recommendation: proactiveRecommendation,
          confidence: forecast.confidence,
          generatedAt: new Date().toISOString(),
          recommendedModality: forecast.recommendedModality,
        };
      }
    }

    const combinedAlerts = [...(forecastAlert ? [forecastAlert] : []), ...alerts];

    return combinedAlerts.map((alert) => ({
      ...alert,
      developmentalPhase: alert.developmentalPhase ?? developmentalPhase,
    }));
  } catch (error) {
    console.warn('[IntelligenceHub] Failed to compute predictive alerts:', error);
    return [];
  }
}

async function buildPatternFamiliesFromInsights(insights: IntegratedInsight[]): Promise<PatternFamily[]> {
  if (!insights || insights.length < 2) {
    return [];
  }

  try {
    const clusters = await clusterInsights(insights);
    if (!clusters || clusters.length === 0) {
      return [];
    }

    return await detectPatternFamilies(clusters);
  } catch (error) {
    console.warn('[IntelligenceHub] Pattern family analysis failed:', error);
    return [];
  }
}

/**
 * Track how patterns evolve over time
 * Returns patterns that are: appearing, stable, changing, disappearing
 */
function trackPatternEvolution(
  currentInsights: IntegratedInsight[],
  previousInsights: IntegratedInsight[],
  timeWindowDays: number = 30
): {
  emerging: string[];      // New patterns in last 2 weeks
  stable: string[];        // Consistent across time
  evolving: string[];      // Changing form/intensity
  dormant: string[];       // Previously present, now absent
} {
  const currentPatterns = new Set(currentInsights.map(i => i.detectedPattern));
  const previousPatterns = new Set(previousInsights.map(i => i.detectedPattern));

  return {
    emerging: Array.from(currentPatterns).filter(p => !previousPatterns.has(p)),
    stable: Array.from(currentPatterns).filter(p => previousPatterns.has(p)),
    evolving: (() => {
      // A pattern is evolving when the same mindToolType appears in both windows
      // but with different detectedPattern text — the theme is recurring but shifting form
      const evolvingPatterns: string[] = [];
      const recentByTool = new Map<string, Set<string>>();
      const previousByTool = new Map<string, Set<string>>();
      for (const i of currentInsights) {
        if (!recentByTool.has(i.mindToolType)) recentByTool.set(i.mindToolType, new Set());
        recentByTool.get(i.mindToolType)!.add(i.detectedPattern);
      }
      for (const i of previousInsights) {
        if (!previousByTool.has(i.mindToolType)) previousByTool.set(i.mindToolType, new Set());
        previousByTool.get(i.mindToolType)!.add(i.detectedPattern);
      }
      for (const [tool, recentPatterns] of recentByTool) {
        const prevPatterns = previousByTool.get(tool);
        if (!prevPatterns) continue;
        // Tool appears in both windows — check if any patterns differ (evolved)
        const hasNewForm = Array.from(recentPatterns).some(p => !prevPatterns.has(p));
        const hadPriorForm = Array.from(prevPatterns).some(p => !recentPatterns.has(p));
        if (hasNewForm && hadPriorForm) {
          // Pick the most recent pattern string as the representative
          const representative = Array.from(recentPatterns)[0];
          evolvingPatterns.push(representative);
        }
      }
      return evolvingPatterns;
    })(),
    dormant: Array.from(previousPatterns).filter(p => !currentPatterns.has(p))
  };
}

/**
 * Determine priority focus based on pattern evolution and recent insights
 */
function determinePriorityFocus(
  patternEvolution: { emerging: string[]; stable: string[]; dormant: string[] },
  recentInsights: IntegratedInsight[]
): string | null {
  // Priority 1: Emerging patterns (new developmental edges)
  if (patternEvolution.emerging.length > 0) {
    return `Emerging patterns (${patternEvolution.emerging.slice(0, 2).join(', ')}) indicate new developmental edges requiring attention.`;
  }

  // Priority 2: High-frequency recent patterns (active challenges)
  if (recentInsights.length >= 3) {
    const patternCounts = new Map<string, number>();
    recentInsights.forEach(insight => {
      const count = patternCounts.get(insight.detectedPattern) || 0;
      patternCounts.set(insight.detectedPattern, count + 1);
    });
    const highFrequency = Array.from(patternCounts.entries())
      .filter(([_, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([pattern]) => pattern);

    if (highFrequency.length > 0) {
      return `High-frequency patterns (${highFrequency.join(', ')}) show active developmental work in progress.`;
    }
  }

  // Priority 3: Stable patterns (mastery consolidation)
  if (patternEvolution.stable.length >= 2) {
    return `Stable patterns indicate consistent developmental themes worthy of deeper integration.`;
  }

  return null;
}


/**
 * Enhance recommendations with practice sequencing
 */
export function enhanceRecommendationsWithSequencing(
  baseRecommendations: any,
  context: IntelligenceContext
): any {
  if (!baseRecommendations?.practiceChanges?.add) {
    return baseRecommendations;
  }

  try {
    // Use memoized practices array
    const allPracticesFlattened = allPracticesFlat;

    // Get recommended practices
    const recommendedPractices = baseRecommendations.practiceChanges.add
      .map((rec: any) => allPracticesFlattened.find(p => p.name === rec.practiceName))
      .filter(Boolean) as AllPractice[];

    // Generate practice sequence
    const detectedPatterns = context.pendingPatterns || [];
    const sequence = generatePracticeSequence(
      detectedPatterns,
      context.currentPracticeStack,
      recommendedPractices
    );

    // Add sequencing info to recommendations
    return {
      ...baseRecommendations,
      sequencing: {
        phases: sequence.phases,
        totalWeeks: sequence.totalWeeks,
        guidance: generateSequencingGuidance(sequence),
      },
      practiceChanges: {
        ...baseRecommendations.practiceChanges,
        sequenced: sequence.practices,
      },
    };
  } catch (error) {
    console.warn('[IntelligenceHub] Failed to enhance with sequencing:', error);
    return baseRecommendations;
  }
}

/**
 * Analyze current practice stack and suggest substitutions for struggling practices
 */
export function analyzeAndSuggestSubstitutions(
  context: IntelligenceContext
): PracticeSubstitution[] {
  try {
    // Identify struggling practices
    const strugglingAnalysis = identifyStrugglingPractices(
      context.completionHistory,
      0.4 // Below 40% completion = needs support
    );

    const substitutions: PracticeSubstitution[] = [];

    // For each struggling practice, suggest substitutions
    for (const struggling of strugglingAnalysis.filter(s => s.needsSupport)) {
      const practice = context.currentPracticeStack.find(p => p.id === struggling.practiceId);
      if (!practice) continue;

      // Estimate difficulty felt and time availability from context
      const criteria: SubstitutionCriteria = {
        completionRate: struggling.completionRate,
        difficultyFelt: struggling.completionRate < 0.2 ? 'too_hard' : 'appropriate',
        timeAvailable: context.currentPracticeStack.length > 5 ? 'limited' : 'adequate',
      };

      const suggestions = suggestPracticeSubstitutions(practice, criteria);
      substitutions.push(...suggestions);
    }

    return substitutions;
  } catch (error) {
    console.warn('[IntelligenceHub] Failed to analyze substitutions:', error);
    return [];
  }
}

/**
 * Test utilities (exported for unit tests only)
 * @internal
 */
export const __intelligenceHubTestUtils = {
  parseGuidanceResponse,
  generateMarkdownFromJson,
  extractFallbackGuidance,
};
