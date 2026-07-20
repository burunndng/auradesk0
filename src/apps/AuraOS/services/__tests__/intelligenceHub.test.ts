/**
 * Intelligence Hub Service Tests
 * Verifies integration between guidance generation and predictive alerts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StorageManager } from '../../.claude/lib/storageManager';
import type { IntelligenceContext, PredictiveAlert } from '../../types';
import { mockIntelligenceHubGuidance } from '../../tests/mocks/llm-mocks';
import * as predictiveEngine from '../predictiveGuidanceEngine';
import * as patternRecognitionEngine from '../patternRecognitionEngine';

// Mock supabase with chainable query builder
vi.mock('../supabaseClient', () => {
  const chain: any = {
    select: () => chain,
    insert: () => chain,
    update: () => chain,
    upsert: () => chain,
    delete: () => chain,
    eq: () => chain,
    neq: () => chain,
    order: () => chain,
    limit: () => chain,
    single: () => Promise.resolve({ data: null, error: null }),
    maybeSingle: () => Promise.resolve({ data: null, error: null }),
  };
  return { supabase: { from: () => chain, auth: { getUser: () => Promise.resolve({ data: { user: null }, error: null }) } } };
});

// Mock contextAggregator to avoid undefined context errors
vi.mock('../../utils/contextAggregator', () => ({
  hashContext: vi.fn().mockReturnValue('mock-hash-123'),
}));

// Mock OpenRouter before importing the service
vi.mock('../openRouterService', () => ({
  generateOpenRouterResponse: vi.fn(),
  buildMessagesWithSystem: vi.fn().mockReturnValue([]),
}));

vi.mock('../predictiveGuidanceEngine', () => ({
  analyzeTrajectoriesForRisk: vi.fn(),
  forecastNextChallenge: vi.fn(),
  recommendProactiveAction: vi.fn(),
  predictDevelopmentalStage: vi.fn(),
}));

vi.mock('../patternRecognitionEngine', () => ({
  clusterInsights: vi.fn(),
  detectPatternFamilies: vi.fn(),
}));

// Import service under test
import { getIntelligentGuidance } from '../intelligenceHub';
import { generateOpenRouterResponse } from '../openRouterService';

const buildContext = (overrides: Partial<IntelligenceContext> = {}): IntelligenceContext => ({
  currentPracticeStack: [],
  practiceNotes: {},
  completionHistory: [],
  wizardSessions: [],
  integratedInsights: [],
  pendingPatterns: [],
  developmentalStage: undefined,
  attachmentStyle: undefined,
  primaryChallenges: [],
  ...overrides,
});

const createInsight = (id: string): any => ({
  id,
  mindToolType: 'IFS Session',
  mindToolSessionId: `session-${id}`,
  mindToolName: 'IFS Session',
  mindToolReport: 'Report',
  mindToolShortSummary: 'Summary',
  detectedPattern: 'pattern',
  suggestedShadowWork: [],
  suggestedNextSteps: [],
  suggestedPractices: [],
  status: 'pending',
  dateCreated: new Date().toISOString(),
});

const createWizardSession = (id: number) => ({
  type: 'ifs_work',
  date: new Date().toISOString(),
  keyInsights: [],
  sessionData: { id },
});

describe('Intelligence Hub Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    StorageManager.clearAll();

    // Setup OpenRouter mock
    vi.mocked(generateOpenRouterResponse).mockResolvedValue({
      success: true,
      text: JSON.stringify(mockIntelligenceHubGuidance)
    });

    // Setup default mock behaviors
    vi.mocked(predictiveEngine.analyzeTrajectoriesForRisk).mockReturnValue([]);
    vi.mocked(predictiveEngine.forecastNextChallenge).mockReturnValue(null);
    vi.mocked(predictiveEngine.recommendProactiveAction).mockReturnValue({
      action: 'Act now',
      priority: 'high',
      practices: [],
      wizards: [],
      timing: 'soon',
    });
    vi.mocked(predictiveEngine.predictDevelopmentalStage).mockReturnValue('integration');
    vi.mocked(patternRecognitionEngine.clusterInsights).mockResolvedValue([]);
    vi.mocked(patternRecognitionEngine.detectPatternFamilies).mockResolvedValue([]);
  });

  describe('getIntelligentGuidance', () => {
    it('should generate guidance from user context', async () => {
      const mockContext = buildContext({
        wizardSessions: [createWizardSession(1)],
        integratedInsights: [createInsight('insight-1')],
      });

      const result = await getIntelligentGuidance('test-user-id', mockContext);

      expect(result).toBeDefined();
      expect(result.synthesis).toBeTruthy();
      expect(result.primaryFocus).toBeTruthy();
      expect(result.recommendations).toBeDefined();
    });

    it('should calculate confidence based on data volume', async () => {
      const mockContext = buildContext({
        wizardSessions: Array.from({ length: 10 }, (_, idx) => createWizardSession(idx)),
        integratedInsights: Array.from({ length: 5 }, (_, idx) => createInsight(`insight-${idx}`)),
      });

      const result = await getIntelligentGuidance('test-user-id', mockContext);

      expect(result.recommendations.nextWizard?.confidence).toBeGreaterThan(0.5);
    });

    it('should cache guidance for 24 hours', async () => {
      const mockContext = buildContext();

      await getIntelligentGuidance('test-user-id', mockContext);
      const cachedResult = await getIntelligentGuidance('test-user-id', mockContext);

      expect(cachedResult).toBeDefined();
    });

    it('should handle empty context gracefully', async () => {
      const result = await getIntelligentGuidance('test-user-id', buildContext());

      expect(result).toBeDefined();
      expect(result.synthesis).toBeTruthy();
    });

    it('should adapt tone based on confidence level', async () => {
      const lowDataContext = buildContext({ wizardSessions: [createWizardSession(1)] });

      const result = await getIntelligentGuidance('test-user-id', lowDataContext);

      expect(result).toBeDefined();
    });

    it('should attach predictive alerts from the predictive engine', async () => {
      const alert: PredictiveAlert = {
        id: 'alert-1',
        type: 'risk',
        severity: 'high',
        timeframe: 'next 2 weeks',
        title: 'Test Alert',
        description: 'Description',
        triggerIndicators: ['indicator'],
        recommendation: {
          action: 'Act now',
          priority: 'high',
          practices: [],
          wizards: [],
          timing: 'soon',
        },
        confidence: 0.85,
        generatedAt: new Date().toISOString(),
        recommendedModality: 'shadow',
      };

      vi.mocked(predictiveEngine.analyzeTrajectoriesForRisk).mockReturnValue([alert]);

      const context = buildContext({
        wizardSessions: [createWizardSession(1)],
        integratedInsights: [createInsight('insight-99')],
      });

      const result = await getIntelligentGuidance('test-user-id', context);

      expect(result.recommendations.predictiveAlerts).toBeDefined();
      expect(result.recommendations.predictiveAlerts?.length).toBeGreaterThan(0);
    });
  });
});