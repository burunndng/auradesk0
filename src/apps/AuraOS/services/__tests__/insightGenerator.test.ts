/**
 * insightGenerator.ts tests
 *
 * Tests for generateInsightFromSession and related utility functions.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mocks (must come before service import) ---

vi.mock('../openRouterService', () => ({
  generateOpenRouterResponse: vi.fn(),
  buildMessagesWithSystem: vi.fn().mockReturnValue([]),
}));

vi.mock('../synthesisLineageService', () => ({
  createInsightLineage: vi.fn(),
}));

vi.mock('../confidenceValidator', () => ({
  validateConfidence: vi.fn(),
  calculateConfidenceFromDataVolume: vi.fn(),
}));

vi.mock('../tonalShifter', () => ({
  buildToneInstructions: vi.fn(),
}));

vi.mock('../../constants', () => ({
  WIZARD_INSIGHT_POLICY: {
    interactive: ['IFS Session', '3-2-1 Reflection', 'Bias Detective'],
    assessment: ['Integral Body Plan', 'Workout Program', 'Jhana Guide'],
    utility: ['Export Data'],
    shouldGenerateInsight: (wizardType: string, context?: string): boolean => {
      const interactive = ['IFS Session', '3-2-1 Reflection', 'Bias Detective'];
      const assessment = ['Integral Body Plan', 'Workout Program', 'Jhana Guide'];
      const utility = ['Export Data'];
      if (interactive.includes(wizardType)) return true;
      if (assessment.includes(wizardType)) {
        if (wizardType === 'Jhana Guide') return context === 'practice-log';
        return true;
      }
      if (utility.includes(wizardType)) return false;
      return false;
    },
  },
}));

// --- Import under test (after mocks) ---

import {
  generateInsightFromSession,
  calculatePatternImprovement,
  getPracticeRecommendationsForPattern,
  recordPracticeCompletion,
} from '../insightGenerator';
import { generateOpenRouterResponse } from '../openRouterService';
import { validateConfidence, calculateConfidenceFromDataVolume } from '../confidenceValidator';
import { buildToneInstructions } from '../tonalShifter';

// --- Helpers ---

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

const AVAILABLE_PRACTICES = [
  { id: 'shadow-journaling', name: 'Shadow Journaling', category: 'Shadow' },
  { id: 'ifs-session', name: 'IFS Session', category: 'Shadow' },
  { id: 'body-scan', name: 'Body Scan', category: 'Body' },
];

const BASE_INPUT = {
  wizardType: 'IFS Session' as const,
  sessionId: 'session-abc-123',
  sessionName: 'My IFS Session',
  sessionReport: 'I explored my inner critic and found a protective part.',
  sessionSummary: 'Discovered protective part.',
  userId: 'user-xyz',
  availablePractices: AVAILABLE_PRACTICES,
};

/** Build a well-formed LLM response in the expected pipe-delimited format. */
const buildValidLLMResponse = () =>
  `PATTERN: The inner critic acts as a protective part guarding against perceived failure.
---
SHADOW WORK:
- Shadow Journaling | Rationale: Journal about the inner critic's origin | Micro-Habit: Write one sentence about it each morning
- IFS Session | Rationale: Dialog with the protective part directly | Micro-Habit: Spend 2 min noticing where it lives in the body
---
NEXT STEPS:
- Body Scan | Rationale: Ground the insights somatically | Micro-Habit: 60-second scan before bed`;

// --- Tests ---

describe('generateInsightFromSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock return values for dependency mocks
    vi.mocked(validateConfidence).mockReturnValue({ isValid: true, suggestion: undefined } as any);
    vi.mocked(calculateConfidenceFromDataVolume).mockReturnValue(0.65);
    vi.mocked(buildToneInstructions).mockReturnValue('Use an exploratory tone.');
    // Default: healthy LLM response
    vi.mocked(generateOpenRouterResponse).mockResolvedValue({
      success: true,
      text: buildValidLLMResponse(),
    });
  });

  // 1. Happy path
  it('returns IntegratedInsight with correct structure on valid LLM response', async () => {
    const result = await generateInsightFromSession(BASE_INPUT);

    // id must be a v4 UUID
    expect(result.id).toMatch(UUID_REGEX);

    // wizard metadata maps from input
    expect(result.mindToolType).toBe('IFS Session');
    expect(result.mindToolName).toBe('My IFS Session');
    expect(result.mindToolSessionId).toBe('session-abc-123');

    // status is pending immediately after creation
    expect(result.status).toBe('pending');

    // dateCreated is a valid ISO string
    expect(result.dateCreated).toMatch(ISO_DATE_REGEX);

    // pattern extracted from LLM response
    expect(result.detectedPattern).toBeTruthy();
    expect(typeof result.detectedPattern).toBe('string');
    expect(result.detectedPattern.length).toBeGreaterThan(5);
  });

  it('populates suggestedShadowWork from LLM response', async () => {
    const result = await generateInsightFromSession(BASE_INPUT);

    expect(Array.isArray(result.suggestedShadowWork)).toBe(true);
    expect(result.suggestedShadowWork.length).toBeGreaterThan(0);

    const first = result.suggestedShadowWork[0];
    expect(first).toHaveProperty('practiceId');
    expect(first).toHaveProperty('practiceName');
    expect(first).toHaveProperty('rationale');
  });

  it('populates suggestedNextSteps from LLM response', async () => {
    const result = await generateInsightFromSession(BASE_INPUT);

    expect(Array.isArray(result.suggestedNextSteps)).toBe(true);
    expect(result.suggestedNextSteps.length).toBeGreaterThan(0);

    const first = result.suggestedNextSteps[0];
    expect(first).toHaveProperty('practiceId');
    expect(first).toHaveProperty('practiceName');
    expect(first).toHaveProperty('rationale');
  });

  it('sets detectedPattern to the PATTERN line from the LLM response', async () => {
    const result = await generateInsightFromSession(BASE_INPUT);

    expect(result.detectedPattern).toContain('inner critic');
  });

  // 2. LLM returns malformed / unparseable response
  it('returns IntegratedInsight with fallback pattern when LLM returns malformed response', async () => {
    vi.mocked(generateOpenRouterResponse).mockResolvedValue({
      success: true,
      text: 'This is not the expected format at all. No delimiters here.',
    });

    const result = await generateInsightFromSession(BASE_INPUT);

    // Should not crash — must return an insight
    expect(result).toBeDefined();
    expect(result.id).toMatch(UUID_REGEX);
    expect(typeof result.detectedPattern).toBe('string');
    expect(result.status).toBe('pending');
  });

  it('returns IntegratedInsight with empty arrays when LLM response has no parseable practices', async () => {
    vi.mocked(generateOpenRouterResponse).mockResolvedValue({
      success: true,
      text: 'PATTERN: Some vague insight\n---\nSHADOW WORK:\n---\nNEXT STEPS:\n',
    });

    const result = await generateInsightFromSession(BASE_INPUT);

    expect(result).toBeDefined();
    expect(Array.isArray(result.suggestedShadowWork)).toBe(true);
    expect(Array.isArray(result.suggestedNextSteps)).toBe(true);
  });

  // 3. LLM call throws — static fallback returned (never crashes)
  it('returns static fallback IntegratedInsight when all models reject (network failure)', async () => {
    vi.mocked(generateOpenRouterResponse).mockRejectedValue(new Error('Network error'));

    const result = await generateInsightFromSession(BASE_INPUT);

    // Must NOT throw — returns a minimal valid fallback
    expect(result).toBeDefined();
    expect(result.confidenceScore).toBe(0);
    expect(result.detectedPattern).toMatch(/insufficient data/i);
    expect(result.suggestedShadowWork).toEqual([]);
    expect(result.suggestedNextSteps).toEqual([]);
    expect(result.mindToolType).toBe(BASE_INPUT.wizardType);
    expect(result.mindToolSessionId).toBe(BASE_INPUT.sessionId);
  });

  it('falls back to Qwen when Grok returns unsuccessful response', async () => {
    vi.mocked(generateOpenRouterResponse)
      // First call (Grok) returns failure
      .mockResolvedValueOnce({ success: false, text: '' })
      // Second call (Qwen) succeeds
      .mockResolvedValueOnce({ success: true, text: buildValidLLMResponse() });

    const result = await generateInsightFromSession(BASE_INPUT);

    expect(result).toBeDefined();
    expect(result.generatedBy).toBe('qwen');
  });

  it('returns static fallback when Grok and Qwen both return unsuccessful responses', async () => {
    vi.mocked(generateOpenRouterResponse)
      .mockResolvedValueOnce({ success: false, text: '' })
      .mockResolvedValueOnce({ success: false, text: '' });

    const result = await generateInsightFromSession(BASE_INPUT);

    expect(result).toBeDefined();
    expect(result.confidenceScore).toBe(0);
    expect(result.detectedPattern).toMatch(/insufficient data/i);
    expect(result.suggestedShadowWork).toEqual([]);
    expect(result.suggestedNextSteps).toEqual([]);
  });

  // 4. Policy filtering
  it('throws POLICY_SKIP error when wizardType is a utility wizard', async () => {
    const input = {
      ...BASE_INPUT,
      wizardType: 'Export Data' as const,
    };

    await expect(generateInsightFromSession(input)).rejects.toThrow('POLICY_SKIP');
    // LLM should never be called for skipped wizards
    expect(generateOpenRouterResponse).not.toHaveBeenCalled();
  });

  it('throws POLICY_SKIP for Jhana Guide without practice-log context', async () => {
    const input = {
      ...BASE_INPUT,
      wizardType: 'Jhana Guide' as const,
    };

    await expect(generateInsightFromSession(input)).rejects.toThrow('POLICY_SKIP');
  });

  it('generates insight for Jhana Guide when policyContext is practice-log', async () => {
    const input = {
      ...BASE_INPUT,
      wizardType: 'Jhana Guide' as const,
      policyContext: 'practice-log',
    };

    const result = await generateInsightFromSession(input);

    expect(result).toBeDefined();
    expect(result.mindToolType).toBe('Jhana Guide');
  });

  // 5. Confidence scoring
  it('sets confidenceScore to a number between 0 and 1', async () => {
    const result = await generateInsightFromSession(BASE_INPUT);

    expect(typeof result.confidenceScore).toBe('number');
    expect(result.confidenceScore).toBeGreaterThanOrEqual(0);
    expect(result.confidenceScore).toBeLessThanOrEqual(1);
  });

  it('uses calculateConfidenceFromDataVolume when dataContext is provided', async () => {
    vi.mocked(calculateConfidenceFromDataVolume).mockReturnValue(0.82);

    const result = await generateInsightFromSession({
      ...BASE_INPUT,
      dataContext: { totalSessions: 20, sessionsInLastWeek: 3, existingInsights: 10 },
    });

    expect(calculateConfidenceFromDataVolume).toHaveBeenCalledWith(20, 3, 10);
    expect(result.confidenceScore).toBe(0.82);
  });

  it('defaults confidenceScore to 0.65 when no dataContext is provided', async () => {
    const result = await generateInsightFromSession(BASE_INPUT);

    // calculateConfidenceFromDataVolume should NOT be called (no dataContext)
    expect(calculateConfidenceFromDataVolume).not.toHaveBeenCalled();
    expect(result.confidenceScore).toBe(0.65);
  });

  // 6. generatedBy field
  it('sets generatedBy to grok when Grok call succeeds', async () => {
    const result = await generateInsightFromSession(BASE_INPUT);

    expect(result.generatedBy).toBe('grok');
  });
});

// --- calculatePatternImprovement ---

describe('calculatePatternImprovement', () => {
  it('returns improved when practice frequency is high and notes mention progress', () => {
    const result = calculatePatternImprovement(2, 4, 'Things are much better now');
    expect(result).toBe('improved');
  });

  it('returns stable when practice frequency is high but notes have no positive keywords', () => {
    const result = calculatePatternImprovement(2, 4, 'Neutral session today');
    expect(result).toBe('stable');
  });

  it('returns worsened when notes contain struggle keywords', () => {
    const result = calculatePatternImprovement(3, 3, 'This is getting harder and harder');
    expect(result).toBe('worsened');
  });

  it('returns unknown when no clear signals are present', () => {
    const result = calculatePatternImprovement(3, 3);
    expect(result).toBe('unknown');
  });
});

// --- getPracticeRecommendationsForPattern ---

describe('getPracticeRecommendationsForPattern', () => {
  const insight: any = {
    id: 'ins-1',
    suggestedShadowWork: [
      { practiceId: 'shadow-journaling', practiceName: 'Shadow Journaling', rationale: 'Explore pattern' },
    ],
    suggestedNextSteps: [
      { practiceId: 'body-scan', practiceName: 'Body Scan', rationale: 'Ground the insight' },
    ],
  };

  it('returns combined shadow and next-step recommendations', () => {
    const recs = getPracticeRecommendationsForPattern(insight);
    expect(recs).toHaveLength(2);
  });

  it('tags shadow work items with type shadow', () => {
    const recs = getPracticeRecommendationsForPattern(insight);
    const shadow = recs.find(r => r.id === 'shadow-journaling');
    expect(shadow?.type).toBe('shadow');
  });

  it('tags next step items with type next', () => {
    const recs = getPracticeRecommendationsForPattern(insight);
    const next = recs.find(r => r.id === 'body-scan');
    expect(next?.type).toBe('next');
  });

  it('returns empty array when insight has no recommendations', () => {
    const empty: any = { id: 'ins-2', suggestedShadowWork: [], suggestedNextSteps: [] };
    expect(getPracticeRecommendationsForPattern(empty)).toHaveLength(0);
  });
});

// --- recordPracticeCompletion ---

describe('recordPracticeCompletion', () => {
  it('adds a completion date for a new practice', () => {
    const insight: any = {
      id: 'ins-3',
      suggestedShadowWork: [],
      suggestedNextSteps: [],
    };
    const updated = recordPracticeCompletion(insight, 'body-scan', '2026-02-23T10:00:00.000Z');

    expect(updated.relatedPracticeSessions).toHaveLength(1);
    expect(updated.relatedPracticeSessions[0].practiceId).toBe('body-scan');
    expect(updated.relatedPracticeSessions[0].completionDates).toContain('2026-02-23T10:00:00.000Z');
    expect(updated.relatedPracticeSessions[0].frequency).toBe(1);
  });

  it('increments frequency on subsequent completions for the same practice', () => {
    const insight: any = {
      id: 'ins-4',
      suggestedShadowWork: [],
      suggestedNextSteps: [],
    };
    recordPracticeCompletion(insight, 'body-scan', '2026-02-22T10:00:00.000Z');
    const updated = recordPracticeCompletion(insight, 'body-scan', '2026-02-23T10:00:00.000Z');

    expect(updated.relatedPracticeSessions[0].frequency).toBe(2);
    expect(updated.relatedPracticeSessions[0].completionDates).toHaveLength(2);
  });

  it('tracks multiple practices independently', () => {
    const insight: any = {
      id: 'ins-5',
      suggestedShadowWork: [],
      suggestedNextSteps: [],
    };
    recordPracticeCompletion(insight, 'body-scan', '2026-02-23T10:00:00.000Z');
    recordPracticeCompletion(insight, 'shadow-journaling', '2026-02-23T11:00:00.000Z');

    expect(insight.relatedPracticeSessions).toHaveLength(2);
  });
});
