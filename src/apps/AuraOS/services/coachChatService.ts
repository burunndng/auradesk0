/**
 * AI Practice Coach Chat Service
 * Uses OpenRouter API for conversational coaching
 * Primary Model: xiaomi/mimo-v2-flash:nitro
 * Fallback Model: x-ai/grok-4.1-fast
 */

import {
  generateOpenRouterResponse,
  buildMessagesWithSystem,
} from './openRouterService';
import {
  getFallbackModel,
  shouldUseFallback,
  logFallbackAttempt,
} from '../utils/modelFallback';
import { validatePromptSafety } from '../.claude/lib/promptSafetyValidator';
import { StorageManager } from '../.claude/lib/storageManager';

// Full wizard ID registry — keep in sync with WizardRoutes.tsx
const WIZARD_IDS = [
  // Shadow
  'threeTwoOne', 'ifs', 'biasDetective', 'subjectObject', 'perspectiveShifter',
  'polarityMapper', 'memoryReconsolidation', 'bigMind',
  'shadowJournaling', 'goldenShadow', 'psychedelicJourney',
  'realityTunnel', 'defusionLab', 'mourningField', 'relationalBlueprint',
  // Mind
  'keganAssessment', 'eightZones', 'meditationFinder',
  'schemaDetective', 'examiningCoreBelief', 'enneagramCompass', 'dbtCoach',
  'immunityToChange', 'adaptiveCycle', 'moralReasoning', 'coherenceAudit',
  'axis', 'fourQuadrantCatalyst', 'interpretationLens',
  // Body
  'bodyArchitect', 'bioenergetics', 'somaticGenerator',
  'polyvagalTrainer', 'dynamicWorkoutArchitect', 'interoception',
  'attachmentAssessment', 'attachmentPractice', 'jhanaTracker',
  // Spirit
  'statesTraining', 'contemplativeInquiry', 'treeOfLife', 'roleAlignment',
  'ultimateConcern', 'integralPracticeDesigner', 'sexologyCoach',
  'therapyStyle', 'chronobiologyProtocol', 'lifeArchitecture',
] as const;

const VALID_WIZARD_IDS = new Set<string>(WIZARD_IDS);

const VALID_TAB_IDS = new Set([
  'home', 'journey', 'quiz', 'stack', 'tracker', 'streaks', 'browse',
  'mind-tools', 'body-tools', 'spirit-tools', 'shadow-tools',
  'sensemaking-lab', 'my-insights', 'aqal', 'recommendations',
  'framework-encyclopedia', 'integral-theory', 'aqal-learning',
]);

/**
 * Strip or repair any invalid action tokens from a coach response.
 * Enforces: max one nav action, wizard IDs must be in registry.
 */
export function sanitizeCoachResponse(text: string): string {
  // Remove invalid wizard IDs
  let sanitized = text.replace(
    /\[ACTION:OPEN_WIZARD:([^\]]+)\]/g,
    (match, wizardId) => (VALID_WIZARD_IDS.has(wizardId) ? match : '')
  );
  // Remove invalid tab IDs
  sanitized = sanitized.replace(
    /\[ACTION:NAVIGATE_TO_TAB:([^\]]+)\]/g,
    (match, tabId) => (VALID_TAB_IDS.has(tabId) ? match : '')
  );
  // Keep only the first nav action
  let navCount = 0;
  sanitized = sanitized.replace(/\[ACTION:NAVIGATE_TO_TAB:[^\]]+\]/g, (match) => {
    navCount++;
    return navCount === 1 ? match : '';
  });
  return sanitized.trim();
}

export interface CoachMessage {
  role: 'user' | 'coach';
  text: string;
}

export interface AppStructure {
  overview?: string;
  tabs: {
    dashboard: string;
    stack: string;
    browse: string;
    tracker: string;
    streaks: string;
    recommendations: string;
    aqal: string;
    mindTools: string;
    bodyTools: string;
    spiritTools: string;
    shadowTools: string;
    library: string;
    journal: string;
    quiz: string;
    journey?: string;
    aqalLearning?: string;
    outro?: string;
  };
  wizards?: any;
  modules: {
    body: string;
    mind: string;
    spirit: string;
    shadow: string;
  };
  frameworks: {
    learyCircuits: string;
    wilberStages: string;
    wilberAQAL?: string;
    keganStages?: string;
    attachmentTheory?: string;
    ifs?: string;
    jhanas?: string;
  };
  dataModel?: any;
  aiIntegration?: any;
  userGuidance?: any;
}

export interface CoachContext {
  practiceStack: Array<{ id: string; name: string; module?: string }>;
  completedCount: number;
  completionRate: number;
  timeCommitment: number;
  timeIndicator: string;
  modules: Record<string, { name: string; count: number }>;
  practiceNotes: Record<string, string>;
  dailyNotes: Record<string, string>;
  userProfile?: {
    experienceLevel: 'beginner' | 'intermediate' | 'advanced';
    preferredIntensity: 'low' | 'moderate' | 'high' | 'variable';
    recurringPatterns?: string[];
    commonBlockers?: string[];
    practiceComplianceRate?: number; // 0..1
  };
  appStructure?: AppStructure;
}

interface ChatResponse {
  success: boolean;
  text: string;
  error?: string;
}

// Minimal shape if your OpenRouter wrapper returns extra fields (DeepSeek thinking mode)
type MaybeDeepSeekThinkingMessage = {
  reasoning_content?: string;
};

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/**
 * Get recent insights from localStorage
 */
function getRecentInsights(): any[] {
  try {
    if (!isBrowser()) return [];
    const stored = StorageManager.getUntyped('integratedInsights');
    if (!stored) return [];
    const insights = stored as any[];
    return Array.isArray(insights)
      ? insights
        .sort(
          (a: any, b: any) =>
            new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
        )
        .slice(0, 3)
      : [];
  } catch {
    return [];
  }
}

/**
 * Get Kegan stage if available from wizard history
 */
function getKeganStageInfo(): string {
  try {
    if (!isBrowser()) return '';
    const stored = StorageManager.getUntyped('historyKegan');
    if (!stored) return '';
    const history = stored as any[];
    if (!Array.isArray(history) || history.length === 0) return '';
    const latest = history[history.length - 1];
    if (!latest?.report?.centerOfGravity) return '';
    return `Developmental stage: ${latest.report.centerOfGravity}. `;
  } catch {
    return '';
  }
}

function calculateStackBalance(
  modules: Record<string, { name: string; count: number }>
): string {
  const counts = {
    body: modules.body?.count || 0,
    mind: modules.mind?.count || 0,
    spirit: modules.spirit?.count || 0,
    shadow: modules.shadow?.count || 0,
  };
  const total = counts.body + counts.mind + counts.spirit + counts.shadow;
  if (total === 0) return 'Stack balance: No practices selected yet.';

  return `Stack balance: Body ${((counts.body / total) * 100).toFixed(0)}% | Mind ${((counts.mind / total) * 100).toFixed(0)}% | Spirit ${((counts.spirit / total) * 100).toFixed(0)}% | Shadow ${((counts.shadow / total) * 100).toFixed(0)}%.`;
}

function buildInsightsContext(insights: any[]): string {
  if (insights.length === 0)
    return 'Recent insights: None yet. Insights emerge from doing wizards (shadow work, mind tools, body practices, etc.).';

  const insightSummaries = insights
    .map((i) => {
      const pattern = i.detectedPattern || 'Unknown pattern';
      const wizard = i.mindToolType || 'Unknown wizard';
      return `- ${wizard}: "${pattern}"`;
    })
    .join('\n');

  return `Recent insights detected:\n${insightSummaries}`;
}

function extractKeganStage(keganInfo: string): string {
  if (keganInfo.includes('Self-Transforming')) return 'Stage 5 (Self-Transforming)';
  if (keganInfo.includes('Self-Authoring')) return 'Stage 4 (Self-Authoring)';
  if (keganInfo.includes('Socialized')) return 'Stage 3 (Socialized)';
  if (keganInfo.includes('Imperial')) return 'Stage 2 (Imperial)';
  return '';
}

/**
 * CoachyBoy system prompt (kept spicy, but no jailbreak / hidden-CoT instructions)
 *
 * Note: we do NOT ask the model to output chain-of-thought. DeepSeek Thinking Mode
 * will provide reasoning in `reasoning_content` automatically (server-side),
 * while user only sees `content`.
 */
function buildCoachPrompt(
  context: CoachContext,
  userMessage: string,
  knowledgeBaseContext?: string
): string {
  // Minimal user context (only if relevant to their question)
  const hasStack = context.practiceStack.length > 0;
  const stackSummary = hasStack
    ? `User has ${context.practiceStack.length} practices in their stack.`
    : 'User has not set up any practices yet.';

  // Knowledge base context (from RAG)
  const knowledgeSection = knowledgeBaseContext?.trim()
    ? `\n## RELEVANT KNOWLEDGE\n${knowledgeBaseContext}`
    : '';

  return `# CoachyBoy

You are the friendly expert guide inside AuraOS — a personal practice platform built on Ken Wilber's Integral Theory.

Most users are new. They're curious but haven't started practicing yet. Your job is to make Integral Theory feel accessible, practical, and alive — not academic.

## WHAT YOU DO

1. Explain Integral concepts simply when asked (AQAL, quadrants, stages, states, shadow, etc.)
2. Help users navigate AuraOS to find what they need
3. Suggest practices and wizards that match their situation
4. Encourage without being cheesy

## CONSTRAINTS

Plain text only. No markdown, no formatting.
2-3 sentences max. Keep it tight.
Don't recite user data back to them. They can see their own dashboard.

## ACTIONS

Append to your response when helpful:

[ACTION:NAVIGATE_TO_TAB:tabId]
Route them to the right place.

[ACTION:OPEN_WIZARD:wizardId]
Launch a guided exercise.

[ACTION:SHOW_CELEBRATION]
Only for real wins (completed practice, breakthrough, streak milestone).

## TAB IDS

home — dashboard overview
journey — onboarding path
quiz — ILP Graph self-assessment
stack — their practice stack
tracker — daily logging
streaks — consistency tracking
browse — discover practices
mind-tools — cognitive practices
body-tools — somatic practices
spirit-tools — contemplative practices
shadow-tools — integration work
sensemaking-lab — complexity and meaning-making
my-insights — personal reflections
aqal — quadrant analysis
recommendations — suggested practices
framework-encyclopedia — theory reference
integral-theory — core concepts
aqal-learning — interactive quadrant learning

## WIZARD IDS AND ROUTING

Shadow work (shadow-tools):
- threeTwoOne — quick 3-2-1 shadow projection exercise
- ifs — Internal Family Systems parts mapping
- biasDetective — cognitive bias pattern detection
- subjectObject — making the subject object (Kegan move)
- perspectiveShifter — perspective-taking across viewpoints
- polarityMapper — both/and polarity integration
- memoryReconsolidation — updating charged memories
- bigMind — Big Mind/Big Heart Zen dialogue
- shadowJournaling — open journaling around shadow content
- goldenShadow — reclaiming projected positive qualities
- psychedelicJourney — integration of altered-state experiences
- realityTunnel — examining fixed worldview or narrative
- defusionLab — ACT cognitive defusion techniques
- mourningField — grief, loss, unresolved endings
- relationalBlueprint — 8-screen triangulation across 3 relationships

Mind tools (mind-tools):
- keganAssessment — Kegan developmental stage assessment
- eightZones — Eight Zones of Integral Methodological Pluralism
- meditationFinder — find the right meditation style
- schemaDetective — identifying core maladaptive schemas
- examiningCoreBelief — CBT-style core belief examination
- enneagramCompass — 9-type Enneagram assessment
- dbtCoach — DBT skills and emotional regulation coaching
- immunityToChange — uncovering competing commitments
- adaptiveCycle — working with change and transition
- moralReasoning — ethical reasoning and values clarification
- coherenceAudit — checking internal consistency of beliefs
- axis — AXIS framework for integral action
- fourQuadrantCatalyst — 4-quadrant AQAL exploration
- interpretationLens — CBM interpretation training

Body tools (body-tools):
- bodyArchitect — integral body practice design
- bioenergetics — bioenergetic movement and discharge
- somaticGenerator — somatic practice generation
- polyvagalTrainer — nervous system state regulation (start here for anxiety/freeze)
- dynamicWorkoutArchitect — dynamic workout planning
- interoception — body awareness and felt sense
- attachmentAssessment — attachment style assessment
- attachmentPractice — attachment healing practices
- jhanaTracker — jhana state tracking and cultivation

Spirit tools (spirit-tools):
- statesTraining — working with altered and meditative states
- contemplativeInquiry — open-inquiry spiritual investigation
- treeOfLife — Kabbalistic Tree of Life pathworking
- roleAlignment — aligning life roles with integral values
- ultimateConcern — clarifying ultimate concern and meaning
- integralPracticeDesigner — custom integral practice design
- sexologyCoach — integral sexuality and relationship coaching
- therapyStyle — finding the right therapeutic modality
- chronobiologyProtocol — circadian-aligned practice scheduling
- lifeArchitecture — designing integral life architecture

## ROUTING LOGIC

New or lost → journey, quiz
Wants to practice → stack, browse, tracker
Specific quadrant → mind-tools, body-tools, spirit-tools, shadow-tools
Confused or overwhelmed → sensemaking-lab
Curious about theory → framework-encyclopedia, integral-theory, aqal-learning
Wants self-insight → aqal, my-insights, recommendations

## VOICE

Warm, direct, grounded. You know this stuff deeply but wear it lightly.
No "Great question!" No corporate cheerfulness.
Explain like a smart friend, not a professor.
If they're in their head, nudge toward body or action.
If they're rushing, slow them down.
Meet them where they are.

## AOS MAP

4 modules, 47 guided wizards:
- Mind → cognitive work, beliefs, stages, shadow patterns (mind-tools)
- Body → somatic, nervous system, movement, meditation (body-tools)
- Spirit → contemplative, states, meaning, practice design (spirit-tools)
- Shadow → IFS, parts work, psychedelics, relational patterns (shadow-tools)

After wizards, insights feed the Intelligence Hub → personalized guidance (my-insights, aqal).
Track daily: tracker, streaks. Discover practices: browse, recommendations.
New users: journey → quiz → stack.

## USER CONTEXT

${stackSummary}
${knowledgeSection}
`;
}

/**
 * Generate a coach response with streaming support and intelligent model fallback
 * Primary: xiaomi/mimo-v2-flash:nitro
 */
export async function generateCoachResponse(
  context: CoachContext,
  userMessage: string,
  conversationHistory: CoachMessage[],
  onStreamChunk?: (chunk: string) => void,
): Promise<ChatResponse> {
  try {
    // RAG disabled — knowledge base search removed (Supabase RPC not configured)
    const knowledgeBaseContext = '';

    const systemPrompt = buildCoachPrompt(context, userMessage, knowledgeBaseContext);

    // OpenRouter messages: keep only user-visible content; do NOT store DeepSeek reasoning_content.
    // Filter out empty-text messages — proxy Zod schema requires content.length >= 1.
    const chatMessages = conversationHistory
      .filter((msg) => msg.text.trim().length > 0)
      .map((msg) => ({
        role: msg.role === 'coach' ? ('assistant' as const) : ('user' as const),
        content: msg.text,
      }));

    chatMessages.push({
      role: 'user' as const,
      content: userMessage,
    });

    const fullMessages = buildMessagesWithSystem(systemPrompt, chatMessages);

    const primaryModel = 'openrouter/free';
    const fallbackModel = 'openrouter/free';
    const fallbackConfig = { fallbackModel };

    try {
      const response = await generateOpenRouterResponse(
        fullMessages,
        onStreamChunk,
        {
          model: primaryModel,
          maxTokens: 150,
          temperature: 1,
        }
      );

      if (response.success && response.text) {
        const validation = validatePromptSafety(response.text, { strictMode: false });
        if (validation.detections.length > 0) {
          console.log(
            '[Coach] Glitch tokens detected in response:',
            validation.detections.map((d) => d.token).join(', ')
          );
          if (validation.riskLevel === 'danger') {
            console.warn('[Coach] Response contains severe tokenization anomalies');
          }
        }
      }

      return response;
    } catch (primaryError) {
      if (!shouldUseFallback(primaryError)) throw primaryError;

      logFallbackAttempt('Coach', primaryModel, fallbackConfig.fallbackModel, primaryError);

      // Try fallback model (Grok-4-fast)
      try {
        const fallbackResponse = await generateOpenRouterResponse(
          fullMessages,
          onStreamChunk,
          {
            model: fallbackConfig.fallbackModel,
            maxTokens: 150,
            temperature: 1,
          }
        );
        return fallbackResponse;
      } catch (fallbackError) {
        console.error('[Coach] Fallback model also failed:', fallbackError);
        throw new Error(
          `Both primary (${primaryModel}) and fallback (${fallbackConfig.fallbackModel}) models failed. ` +
          `Primary: ${String(primaryError).substring(0, 100)}. ` +
          `Fallback: ${String(fallbackError).substring(0, 100)}`
        );
      }
    }
  } catch (error) {
    console.error('[Coach] Error generating response:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, text: 'Sorry, I’m having trouble connecting.', error: errorMessage };
  }
}
