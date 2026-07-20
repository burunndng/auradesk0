import type { DBTRiskAssessment, DBTRiskLevel } from '../types';
import { dbtAICall } from './dbtAIAdapter';
import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════════
// LAYER 1: Instant local pattern matching (< 1ms)
// ═══════════════════════════════════════════════════════════════════

const CRISIS_PATTERNS = [
  /\b(kill|end)\s+(myself|my life|it all)\b/i,
  /\bsuicid(e|al|ing)\b/i,
  /\bwant to die\b/i,
  /\bdon'?t want to (be here|live|exist|wake up)\b/i,
  /\b(cutting|hurting|harming)\s+(myself|my)\b/i,
  /\boverdos(e|ing)\b/i,
  /\bjump(ing)?\s+(off|from)\b/i,
  /\bno\s+(reason|point)\s+(to|in)\s+(live|living|go on)\b/i,
  /\bbetter off (dead|without me)\b/i,
];

const HIGH_RISK_PATTERNS = [
  /\bself[- ]?harm\b/i,
  /\bhurt(ing)?\s+myself\b/i,
  /\bcan'?t\s+(take|do|handle)\s+(it|this)\s+anymore\b/i,
  /\bnothing\s+matters\b/i,
  /\bhopeless\b/i,
  /\brelaps(e|ed|ing)\b/i,
  /\bpanic\s+attack\b/i,
  /\bdissociat(e|ed|ing)\b/i,
];

const FALSE_POSITIVE_PATTERNS = [
  /\bkill(ing|ed)?\s+(it|the|this|that|my)\s+(exam|test|interview|presentation|game|workout)\b/i,
  /\bdying\s+(to|for)\s+(try|see|eat|know|hear)\b/i,
  /\bdrop[- ]?dead\s+gorgeous\b/i,
  /\bto\s+die\s+for\b/i,
  /\bkill(ing|ed)?\s+time\b/i,
];

function localRiskScreen(message: string): {
  level: 'CRISIS' | 'HIGH' | 'PASS_TO_LLM';
  confidence: number;
} {
  const normalized = message.toLowerCase().trim();

  for (const pattern of FALSE_POSITIVE_PATTERNS) {
    if (pattern.test(normalized)) {
      return { level: 'PASS_TO_LLM', confidence: 0.3 };
    }
  }

  for (const pattern of CRISIS_PATTERNS) {
    if (pattern.test(normalized)) {
      return { level: 'CRISIS', confidence: 0.9 };
    }
  }

  for (const pattern of HIGH_RISK_PATTERNS) {
    if (pattern.test(normalized)) {
      return { level: 'HIGH', confidence: 0.7 };
    }
  }

  return { level: 'PASS_TO_LLM', confidence: 0.5 };
}

// ═══════════════════════════════════════════════════════════════════
// LAYER 2: LLM refinement (only for ambiguous messages)
// ═══════════════════════════════════════════════════════════════════

const RiskAssessmentSchema = z.object({
  level: z.enum(['LOW', 'MODERATE', 'HIGH', 'CRISIS']),
  reasoning: z.string(),
  suggestedApproach: z.enum(['crisis_protocol', 'distress_first', 'normal_coaching']),
});

const RISK_ASSESSMENT_PROMPT = `Classify the user message risk level. Consider context and nuance, not just keywords.

CRISIS: Active suicidal ideation with plan/intent, self-harm in progress, immediate danger
HIGH: Passive suicidal ideation, recent self-harm, severe substance crisis, severe dissociation
MODERATE: Strong emotional distress, interpersonal crisis, urges without plan
LOW: Skill-learning, general coping, practice, reflection

"I want to kill this exam" = LOW (idiom)
"I don't want to be here anymore" = HIGH (ambiguous, err cautious)
"I've been thinking about ending it" = CRISIS

For suggestedApproach, use ONLY one of:
- "crisis_protocol" (for CRISIS level)
- "distress_first" (for HIGH level)
- "normal_coaching" (for MODERATE or LOW)

Respond with JSON matching: { level, reasoning, suggestedApproach }`;

export async function assessRisk(message: string): Promise<DBTRiskAssessment> {
  const localResult = localRiskScreen(message);

  if (localResult.level === 'CRISIS') {
    return {
      level: 'CRISIS',
      reasoning: 'Crisis pattern detected',
      suggestedApproach: 'crisis_protocol',
    };
  }

  if (localResult.level === 'HIGH') {
    return {
      level: 'HIGH',
      reasoning: 'High risk pattern detected',
      suggestedApproach: 'distress_first',
    };
  }

  try {
    return await dbtAICall(
      RISK_ASSESSMENT_PROMPT,
      `Assess this message: "${message}"`,
      RiskAssessmentSchema,
      { temperature: 0.1 }
    );
  } catch {
    return {
      level: 'MODERATE',
      reasoning: 'Assessment unavailable, using cautious default',
      suggestedApproach: 'distress_first',
    };
  }
}

// ═══════════════════════════════════════════════════════════════════
// LAYER 3: Output validation
// ═══════════════════════════════════════════════════════════════════

const DANGEROUS_PATTERNS = [
  /you\s+(have|suffer from|are diagnosed with)\s+[A-Z]/i,
  /you should\s+(take|stop taking|increase|decrease)\s+(your\s+)?(medication|meds|pills)/i,
  /I\s+(diagnose|can tell)\s+you/i,
];

const MINIMIZING_PATTERNS = [
  /^just\s+(calm down|relax|breathe|stop)/i,
  /it'?s\s+(not that bad|no big deal|nothing)/i,
  /you'?re\s+(overreacting|being dramatic)/i,
];

export function validateOutput(response: string, riskLevel: DBTRiskLevel): {
  safe: boolean;
  flags: string[];
} {
  const flags: string[] = [];

  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(response)) {
      flags.push('diagnostic_prescriptive_language');
      break;
    }
  }

  for (const pattern of MINIMIZING_PATTERNS) {
    if (pattern.test(response)) {
      flags.push('minimizing_language');
      break;
    }
  }

  if ((riskLevel === 'HIGH' || riskLevel === 'CRISIS') && !response.includes('988') && !response.includes('crisis')) {
    flags.push('missing_crisis_resources');
  }

  if (flags.length > 0) {
    console.warn('DBT output validation flags:', flags);
  }

  return { safe: flags.length === 0, flags };
}
