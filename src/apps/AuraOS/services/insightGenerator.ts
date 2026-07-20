/**
 * Unified Insight Generator Service
 * Handles insight generation for all wizards uniformly
 *
 * This service:
 * 1. Takes any wizard session and converts to standardized format
 * 2. Uses Grok 4.1 (primary) or AI (fallback) to detect patterns
 * 3. Suggests both shadow work (reflection) and next steps (action)
 * 4. Tailors recommendations based on user profile (Phase 2)
 * 5. Tracks outcomes to show pattern improvement over time
 */

import { v4 as uuidv4 } from 'uuid';
import type { IntegratedInsight } from '../types.ts';
import { generateOpenRouterResponse, buildMessagesWithSystem } from './openRouterService.ts';
import { createInsightLineage } from './synthesisLineageService.ts';
import type { UserProfile } from '../utils/contextAggregator.ts';
import { buildToneInstructions } from './tonalShifter.ts';
import { validateConfidence, calculateConfidenceFromDataVolume } from './confidenceValidator.ts';
import { WIZARD_INSIGHT_POLICY } from '../constants.ts';

interface InsightGenerationInput {
  wizardType:
  | '3-2-1 Reflection'
  | 'IFS Session'
  | 'Bias Detective'
  | 'Bias Finder'
  | 'Subject-Object Explorer'
  | 'Perspective-Shifter'
  | 'Polarity Mapper'
  | 'Kegan Assessment'
  | 'Relational Pattern'
  | 'Role Alignment'
  | 'Big Mind Process'
  | 'Memory Reconsolidation'
  | 'Eight Zones'
  | 'Adaptive Cycle Mapper'
  | 'Adaptive Cycle Lens'
  | 'Somatic Practice'
  | 'Attachment Assessment'
  | 'Attachment Practice'
  | 'Integral Body Plan'
  | 'Workout Program'
  | 'Shadow Journaling'
  | 'Immunity to Change'
  | 'DBT Coach'
  | 'Context AI Root Cause'
  | 'Schema Detective'
  | 'Bioenergetics'
  | 'Decision Wizard'
  | 'Psychedelic Journey'
  | 'States Training'
  | 'Coherence Audit'
  | 'Tree of Life Coaching'
  | 'Advaita Master Coach'
  | 'Golden Shadow'
  | 'Contemplative Inquiry'
  | 'Moral Reasoning'
  | 'Interoception'
  | 'Ultimate Concern'
  | 'Practice Designer'
  | 'Relational Field Mapper'
  | 'Life Architecture Wizard'
  | 'Cultural Shadow Excavator'
  | '4-Quadrant Catalyst'
  | 'Chronobiology Protocol'
  | 'Relational Blueprint'
  | 'Mourning Field'
  | 'Examining Core Belief'
  | 'Polyvagal Trainer'
  | 'Reality Tunnel'
  | 'cbm-interpretation-lens'
  | 'Daily Integration Check-in'
  | 'Defusion Lab'
  | 'AXIS'
  | 'Enneagram Compass'
  | 'Epistemic Crucible'
  | 'Generativity Map'
  | 'Tonglen'
  | 'Integral Civic Practice'
  | 'Phenomenon Mapper'
  | 'Structure of Feeling'
  | 'Return of Ritual'
  | 'Quantified Self'
  | 'Inner Compass'
  | 'Archetypal Contemplation'
  | 'Somatic Cartography';
  sessionId: string;
  sessionName: string;
  sessionReport: string;
  sessionSummary: string;
  userId: string;
  availablePractices: Array<{ id: string; name: string; category?: string }>;
  userProfile?: UserProfile;
  dataContext?: {
    totalSessions?: number;
    sessionsInLastWeek?: number;
    existingInsights?: number;
  };
  /** Optional context for policy filtering (e.g., 'practice-log' for Jhana Tracker) */
  policyContext?: string;
}

interface PracticeRecommendation {
  practiceId: string;
  practiceName: string;
  rationale: string;
  microHabit?: string;
}

interface ParsedInsightResponse {
  pattern: string;
  shadowWork: PracticeRecommendation[];
  nextSteps: PracticeRecommendation[];
}

/**
 * Generate a comprehensive insight from any wizard session
 * Uses Grok 4.1 (primary) with Qwen 3 30B fallback
 * Incorporates user profile for adaptive recommendations
 *
 * Note: userId is passed for potential future audit/analytics use
 */
export async function generateInsightFromSession(
  input: InsightGenerationInput
): Promise<IntegratedInsight> {
  const {
    wizardType,
    sessionId,
    sessionName,
    sessionReport,
    sessionSummary,
    availablePractices,
    userProfile,
    dataContext,
    policyContext,
  } = input;

  try {
    // Policy check: Does this wizard type allow insight generation?
    const shouldGenerate = WIZARD_INSIGHT_POLICY.shouldGenerateInsight(wizardType, policyContext);
    if (!shouldGenerate) {
      const error = new Error(
        `POLICY_SKIP: Wizard type "${wizardType}" is not configured to generate insights. ` +
        `(This wizard is likely a utility or non-interactive tool)`
      );
      console.log(`[InsightGenerator] ${error.message}`);
      throw error;
    }

    console.log(`[InsightGenerator] Generating insight for ${wizardType}: ${sessionId}`);

    // Calculate actual confidence from data volume
    const dataConfidence = dataContext
      ? calculateConfidenceFromDataVolume(
        dataContext.totalSessions || 1,
        dataContext.sessionsInLastWeek || 0,
        dataContext.existingInsights || 0
      )
      : 0.65; // Default moderate confidence if no data context

    // Prepare context for AI
    const practiceList = availablePractices.map((p) => `- ${p.name}`).join('\n');

    // Build adaptive prompt with user profile context
    const prompt = buildAdaptivePrompt(
      wizardType,
      sessionName,
      sessionReport,
      practiceList,
      userProfile,
      dataConfidence
    );

    let response: string;
    let usedGrok = false;

    // Try Grok 4.1 first (primary)
    try {
      console.log('[InsightGenerator] Attempting Grok 4.1 for insight generation');
      const messages = buildMessagesWithSystem(
        'You are an expert at analyzing personal development sessions and suggesting transformative practices.',
        [{ role: 'user' as const, content: prompt }]
      );

      const grokResponse = await generateOpenRouterResponse(
        messages,
        undefined,
        {
          model: 'openrouter/free',
          maxTokens: 3000,
          temperature: 0.3,
          reasoning: { enabled: true }
        }
      );

      if (grokResponse.success && grokResponse.text) {
        response = grokResponse.text;
        usedGrok = true;
        console.log('[InsightGenerator] Successfully used Grok 4.1');
      } else {
        throw new Error('Grok response was not successful');
      }
    } catch (grokError) {
      console.warn('[InsightGenerator] Grok 4.1 failed, falling back to Qwen:', grokError);

      // Fallback to Qwen 3 30B via OpenRouter
      try {
        console.log('[InsightGenerator] Using Qwen 3 30B fallback');
        const messages = buildMessagesWithSystem(
          'You are an expert at analyzing personal development sessions and suggesting transformative practices.',
          [{ role: 'user' as const, content: prompt }]
        );

        const qwenResponse = await generateOpenRouterResponse(
          messages,
          undefined,
          {
            model: 'openrouter/free',
            maxTokens: 3000,
            temperature: 0.3
          }
        );

        if (qwenResponse.success && qwenResponse.text) {
          response = qwenResponse.text;
          usedGrok = false; // Using Qwen
          console.log('[InsightGenerator] Successfully used Qwen fallback');
        } else {
          throw new Error('Qwen fallback failed');
        }
      } catch (qwenError) {
        console.error('[InsightGenerator] Both Grok and Qwen failed — returning static fallback insight:', qwenError);
        // Static fallback: return a minimal valid IntegratedInsight so the UI never crashes.
        // confidenceScore: 0 signals to consumers that this is a placeholder, not real pattern analysis.
        const fallbackId = uuidv4();
        return {
          id: fallbackId,
          mindToolType: wizardType,
          mindToolSessionId: sessionId,
          mindToolName: sessionName,
          mindToolReport: sessionReport,
          mindToolShortSummary: sessionSummary,
          detectedPattern: 'Pattern analysis unavailable — please try again.',
          suggestedShadowWork: [],
          suggestedNextSteps: [],
          dateCreated: new Date().toISOString(),
          status: 'pending',
          generatedBy: 'ai-fallback',
          confidenceScore: 0,
        } as IntegratedInsight;
      }
    }

    // Parse response
    const { pattern, shadowWork, nextSteps } = parseInsightResponse(response, availablePractices);

    // Create insight
    const insightId = uuidv4();
    const insight: IntegratedInsight = {
      id: insightId,
      mindToolType: wizardType,
      mindToolSessionId: sessionId,
      mindToolName: sessionName,
      mindToolReport: sessionReport,
      mindToolShortSummary: sessionSummary,
      detectedPattern: pattern,
      suggestedShadowWork: shadowWork,
      suggestedNextSteps: nextSteps,
      dateCreated: new Date().toISOString(),
      status: 'pending',
      generatedBy: usedGrok ? 'grok' : 'qwen',
      confidenceScore: dataConfidence, // Use calculated confidence from data volume
    };

    // Validate confidence language matches actual confidence
    const confidenceValidation = validateConfidence(
      pattern,
      dataConfidence,
      dataContext?.totalSessions
    );

    if (!confidenceValidation.isValid && confidenceValidation.suggestion) {
      console.warn(`[InsightGenerator] Confidence mismatch detected: ${confidenceValidation.suggestion}`);
      // Note: In a production system, we might log this for review or adjust the language
    }

    // Track lineage for transparency
    try {
      createInsightLineage(insight, insight.generatedBy as 'grok' | 'qwen');
      insight.lineageId = insightId; // Use insight ID as lineage ID
    } catch (lineageError) {
      console.warn('[InsightGenerator] Failed to create lineage record:', lineageError);
      // Continue even if lineage tracking fails - it's not critical
    }

    console.log(
      `[InsightGenerator] Successfully generated insight with ${shadowWork.length} shadow work and ${nextSteps.length} next steps (${usedGrok ? 'Grok' : 'AI'})`
    );

    return insight;
  } catch (error) {
    console.error('[InsightGenerator] Error generating insight:', error);
    throw error;
  }
}

/**
 * Build adaptive prompt that incorporates user profile for personalization
 */
function buildAdaptivePrompt(
  wizardType: string,
  sessionName: string,
  sessionReport: string,
  practiceList: string,
  userProfile?: UserProfile,
  dataConfidence: number = 0.65
): string {
  const toneInstructions = buildToneInstructions(dataConfidence);

  // Wizard-type preambles for the four onboarding wizards — shapes interpretation lens
  const wizardPreambles: Record<string, string> = {
    'Kegan Assessment': 'INTERPRETATION LENS — Kegan Assessment: This session produced developmental stage indicators. Focus on the user\'s current meaning-making complexity and developmental edge. Key question: what is the system ready to metabolize? Look for places where the user is embedded in a perspective vs. can take it as object.',
    'IFS Session': 'INTERPRETATION LENS — IFS: This session mapped internal parts, protectors, and exiles. Focus on the protective structure: what is being guarded and why? What exile is the protector managing? Do not pathologize parts — understand their positive intent.',
    'Integral Body Plan': 'INTERPRETATION LENS — Integral Body Architect: This session captured somatic patterns, tension, breath, and movement. The body is the primary data source. Focus on what the nervous system is organizing around — what communication is the body offering? Treat somatic data as signal, not symptom.',
    'Contemplative Inquiry': 'INTERPRETATION LENS — Contemplative Inquiry: This session explored awareness patterns, observer capacity, and spiritual orientation. Focus on the quality of presence and where attention habitually lands. Note the difference between what the user says about awareness and what their responses reveal about it.',
  };

  const preamble = wizardPreambles[wizardType];

  let basePrompt = `You are an expert at analyzing personal development sessions and suggesting transformative practices.
${preamble ? `\n${preamble}\n` : ''}
Wizard Session: ${wizardType}
Session Name: ${sessionName}

Session Report:
${sessionReport}

Available Practices (use these EXACT names only):
${practiceList}

IMPORTANT: When recommending practices, you MUST use the practice names EXACTLY as listed above. Do not invent, abbreviate, or rephrase practice names — only choose from the list provided.

${toneInstructions}`;

  // Add user profile context if available
  if (userProfile) {
    basePrompt += `

USER PROFILE (Personalization Context):
- Experience Level: ${userProfile.experienceLevel}
- Practice Compliance: ${(userProfile.practiceComplianceRate * 100).toFixed(0)}%
- Preferred Modalities: Mind (${(userProfile.preferredModalities.mind * 100).toFixed(0)}%), Body (${(userProfile.preferredModalities.body * 100).toFixed(0)}%), Spirit (${(userProfile.preferredModalities.spirit * 100).toFixed(0)}%), Shadow (${(userProfile.preferredModalities.shadow * 100).toFixed(0)}%)
- Preferred Intensity Level: ${userProfile.preferredIntensity}
- Average Energy Level: ${userProfile.energyResponseToPractice.averageEnergyLevel}/10
- Recurring Patterns: ${userProfile.recurringPatterns.join(', ') || 'None identified'}
- Common Blockers: ${userProfile.commonBlockers.join(', ') || 'None identified'}
${userProfile.developmentalStage ? `- Developmental Stage: ${userProfile.developmentalStage}` : ''}
${userProfile.sentimentSummary ? `
MOOD & EMOTIONAL CONTEXT:
- Current Mood Score: ${userProfile.sentimentSummary.averageMoodScore.toFixed(2)} (scale: -1.0 very negative to 1.0 very positive)
- Mood Trend: ${userProfile.sentimentSummary.moodTrend}
- Recent Keywords: ${userProfile.sentimentSummary.recentMoodKeywords.join(', ') || 'neutral'}
` : ''}

PERSONALIZATION INSTRUCTIONS:
- Tailor recommendations to match this user's experience level and modality preferences
- Consider their preferred intensity: ${userProfile.preferredIntensity === 'low' ? 'avoid intense practices; focus on gentle inquiry' : userProfile.preferredIntensity === 'high' ? 'can handle challenging practices; encourage growth-edge work' : 'vary intensity; offer options'}
- Be mindful of their recurring patterns (${userProfile.recurringPatterns[0] || 'general patterns'}) - use it as a lens for understanding the current session
- If their compliance is low, suggest simpler, more achievable practices
- If their compliance is high, can suggest more complex integrated practices
${userProfile.sentimentSummary ? `
EMOTIONAL TONE GUIDANCE:
- User's emotional state: ${userProfile.sentimentSummary.moodTrend === 'declining' || userProfile.sentimentSummary.averageMoodScore < -0.3 ? 'Current mood is low or declining - prioritize gentle, supportive practices that build capacity without adding pressure' : userProfile.sentimentSummary.moodTrend === 'improving' || userProfile.sentimentSummary.averageMoodScore > 0.3 ? 'User is in positive or improving mood - can suggest momentum-building practices that leverage current energy' : 'Mood is stable - balanced approach works well'}
- Keywords to consider (${userProfile.sentimentSummary.recentMoodKeywords.join(', ') || 'neutral'}): Avoid practices that trigger these emotions; suggest practices that help process or transform them
- If mood score is below -0.5: recommend grounding, embodiment, and self-compassion practices
- If mood score is above 0.5: recommend practices that sustain momentum and deepen engagement` : ''}`;
  }

  basePrompt += `

## RECOMMENDATION QUALITY BAR
- **BANNED (Vague):** "Do shadow work." or "Practice self-compassion."
- **BETTER:** "Journal about your inner critic for 10 minutes."
- **EXCELLENT (Required):** "Dialog with the 'Perfectionist' part specifically when you feel the chest tightness that came up during somatic work."
- **Micro-Habit:** Every recommendation must include a <2 minute version (e.g., "Take one conscious breath when opening email").

## ADAPTIVE GRADIENT (The Soundness Protocol)
- **Low Data/New User:** Stick to "Low-Stakes Exploration." Recommend grounding, noticing, and gentle naming. Do not suggest intense shadow work yet.
- **Low Compliance:** Prioritize the **Micro-Habit** as the primary goal. "Success" = doing the 2-minute version.
- **High Data/High Compliance:** Move to "Structural Work." Suggest integrated practices that challenge the user's current developmental stage.
- **SOUNDNESS OVER DEPTH:** If the session report is minimal or vague, reflect that back: "This session was brief, but I noticed a hint of X. We can explore this deeper in future work."

Please analyze this session and provide:

1. DETECTED PATTERN (1-2 sentences): What core pattern or insight emerged from this session?

2. SHADOW WORK RECOMMENDATIONS (reflection/inquiry practices to understand the pattern deeper):
   - List 2-3 shadow work practices that would help explore this pattern
   - For each: [Practice Name] | Rationale: [Specific link to session data] | Micro-Habit: [Tiny version]

3. NEXT STEPS (action practices to work with this pattern):
   - List 2-3 action practices that would help move forward
   - For each: [Practice Name] | Rationale: [Specific link to session data] | Micro-Habit: [Tiny version]

Format your response EXACTLY as:
PATTERN: [detected pattern]
---
SHADOW WORK:
- [Practice Name] | Rationale: [rationale] | Micro-Habit: [micro-habit]
- [Practice Name] | Rationale: [rationale] | Micro-Habit: [micro-habit]
---
NEXT STEPS:
- [Practice Name] | Rationale: [rationale] | Micro-Habit: [micro-habit]
- [Practice Name] | Rationale: [rationale] | Micro-Habit: [micro-habit]`;

  return basePrompt;
}

/**
 * Parse AI response into structured insight components
 */
function parseInsightResponse(
  response: string,
  availablePractices: Array<{ id: string; name: string }>
): ParsedInsightResponse {
  // Validate response format before parsing
  if (!response || response.trim().length < 10) {
    console.warn('[InsightGenerator] Response too short or empty for parsing');
    return {
      pattern: 'Unable to extract pattern from response',
      shadowWork: [],
      nextSteps: []
    };
  }

  // Split by --- with validation and recovery
  const sections = response.split(/\s*-{3,}\s*/).filter(s => s.trim());

  if (sections.length < 3) {
    console.warn(`[InsightGenerator] Expected 3+ sections, got ${sections.length}. Attempting recovery...`);
    // Fallback: try to extract by regex patterns instead
    return parseInsightResponseFallback(response, availablePractices);
  }

  let pattern = 'No pattern detected';
  let shadowWork: PracticeRecommendation[] = [];
  let nextSteps: PracticeRecommendation[] = [];

  // Extract pattern
  if (sections[0]) {
    const patternMatch = sections[0].match(/PATTERN:\s*(.+?)(?:\n|$)/i);
    if (patternMatch) {
      pattern = patternMatch[1].trim();
    } else {
      // Fallback: use first 100 chars if no explicit pattern
      pattern = sections[0].substring(0, 100).trim();
    }
  }

  // Extract shadow work
  if (sections[1]) {
    shadowWork = parsePracticeRecommendations(sections[1], availablePractices);
  }

  // Extract next steps
  if (sections[2]) {
    nextSteps = parsePracticeRecommendations(sections[2], availablePractices);
  }

  return { pattern, shadowWork, nextSteps };
}

/**
 * Fallback parser when standard delimiter parsing fails
 */
function parseInsightResponseFallback(
  response: string,
  availablePractices: Array<{ id: string; name: string }>
): ParsedInsightResponse {
  // Extract pattern via regex
  const patternMatch = response.match(/PATTERN:\s*(.+?)(?:\n\n|$)/is);
  const pattern = patternMatch ? patternMatch[1].trim().substring(0, 200) : 'Pattern extraction failed';

  // Extract shadow work via regex
  const shadowWorkMatch = response.match(/SHADOW\s*WORK:\s*([\s\S]*?)(?:NEXT\s*STEPS:|$)/i);
  const shadowWork = shadowWorkMatch
    ? parsePracticeRecommendations(shadowWorkMatch[1], availablePractices)
    : [];

  // Extract next steps via regex
  const nextStepsMatch = response.match(/NEXT\s*STEPS:\s*([\s\S]*?)$/i);
  const nextSteps = nextStepsMatch
    ? parsePracticeRecommendations(nextStepsMatch[1], availablePractices)
    : [];

  return { pattern, shadowWork, nextSteps };
}

/**
 * Parse practice recommendations from text
 */
function parsePracticeRecommendations(
  text: string,
  availablePractices: Array<{ id: string; name: string }>
): PracticeRecommendation[] {
  const recommendations: PracticeRecommendation[] = [];

  // Split by lines that start with - or •
  const lines = text.split('\n').filter((line) => /^[\s]*[-•]/.test(line));

  for (const line of lines) {
    // Regex matches: Name | Rationale: ... | Micro-Habit: ... (optional)
    const match = line.match(/^[\s]*[-•]\s*(.+?)\s*\|\s*Rationale:\s*(.+?)(?:\s*\|\s*Micro-Habit:\s*(.+))?$/i);
    if (match) {
      const practiceName = match[1].trim();
      const rationale = match[2].trim();
      const microHabit = match[3] ? match[3].trim() : undefined;

      // Find matching practice by name
      // Use exact match first, then check for single-word matches
      let practice = availablePractices.find((p) =>
        p.name.toLowerCase() === practiceName.toLowerCase()
      );

      // If no exact match, try single word match (more conservative than includes)
      if (!practice) {
        const practiceWords = practiceName.toLowerCase().split(/\s+/);
        practice = availablePractices.find((p) => {
          const pWords = p.name.toLowerCase().split(/\s+/);
          // Match if all practice words are in the practice name
          return practiceWords.every(word => pWords.some(pword => pword === word));
        });
      }

      if (practice) {
        recommendations.push({
          practiceId: practice.id,
          practiceName: practice.name,
          rationale,
          microHabit,
        });
      } else {
        // AI returned a practice name that doesn't match the library — silently dropped.
        // Fix: add the exact practice ID to the prompt context so the AI uses correct names.
        console.warn(
          `[InsightGenerator] Practice "${practiceName}" not found in library — recommendation dropped. ` +
          `If this recurs, inject practice IDs into the prompt so the AI returns exact names.`
        );
      }
    }
  }

  return recommendations;
}

/**
 * Calculate pattern improvement based on practice frequency and outcomes
 */
export function calculatePatternImprovement(
  sessionFrequency: number,
  practiceFrequency: number,
  practitionerNotes?: string
): 'improved' | 'stable' | 'worsened' | 'unknown' {
  // Heuristic: if practice frequency is increasing and session shows progress
  // This could be enhanced with ML later
  if (practiceFrequency > sessionFrequency * 1.5) {
    if (practitionerNotes?.toLowerCase().includes('better') ||
      practitionerNotes?.toLowerCase().includes('improved') ||
      practitionerNotes?.toLowerCase().includes('progress')) {
      return 'improved';
    }
    return 'stable';
  }

  if (practitionerNotes?.toLowerCase().includes('harder') ||
    practitionerNotes?.toLowerCase().includes('struggle') ||
    practitionerNotes?.toLowerCase().includes('worse')) {
    return 'worsened';
  }

  return 'unknown';
}

/**
 * Get practice recommendations specific to a pattern
 * Useful for other features to suggest practices based on detected patterns
 */
export function getPracticeRecommendationsForPattern(
  insight: IntegratedInsight
): Array<{ id: string; name: string; type: 'shadow' | 'next'; rationale: string }> {
  const recommendations: Array<{ id: string; name: string; type: 'shadow' | 'next'; rationale: string }> = [];

  // Add shadow work
  for (const sw of insight.suggestedShadowWork) {
    recommendations.push({
      id: sw.practiceId,
      name: sw.practiceName,
      type: 'shadow',
      rationale: sw.rationale,
    });
  }

  // Add next steps
  for (const ns of insight.suggestedNextSteps) {
    recommendations.push({
      id: ns.practiceId,
      name: ns.practiceName,
      type: 'next',
      rationale: ns.rationale,
    });
  }

  return recommendations;
}

/**
 * Track when a recommended practice is completed
 * This enables outcome tracking and pattern improvement detection
 */
export function recordPracticeCompletion(
  insight: IntegratedInsight,
  practiceId: string,
  completionDate: string
): IntegratedInsight {
  if (!insight.relatedPracticeSessions) {
    insight.relatedPracticeSessions = [];
  }

  let session = insight.relatedPracticeSessions.find((s) => s.practiceId === practiceId);

  if (!session) {
    session = {
      practiceId,
      completionDates: [],
      frequency: 0,
    };
    insight.relatedPracticeSessions.push(session);
  }

  session.completionDates.push(completionDate);
  session.frequency = session.completionDates.length;

  return insight;
}
