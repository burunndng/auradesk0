/**
 * Tests for Predictive Guidance Engine
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageManager } from '../../.claude/lib/storageManager';
import {
  analyzeTrajectoriesForRisk,
  forecastNextChallenge,
  recommendProactiveAction,
  predictDevelopmentalStage,
  persistPredictiveGuidance,
  retrievePredictiveGuidance,
} from '../predictiveGuidanceEngine';
import type {
  IntegratedInsight,
  WizardSessionSummary,
  PatternFamily,
  PredictiveAlert,
  Forecast,
  PatternCluster,
} from '../../types';

// Mock localStorage using StorageManager
// Note: StorageManager internally uses localStorage, so we mock localStorage
// and StorageManager will use it transparently
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('Predictive Guidance Engine', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('analyzeTrajectoriesForRisk', () => {
    it('should return empty array for no insights', () => {
      const alerts = analyzeTrajectoriesForRisk([], []);
      expect(alerts).toEqual([]);
    });

    it('should detect shame-isolation archetype', () => {
      const insights: IntegratedInsight[] = [
        createInsight('shame pattern', 'shame'),
        createInsight('feeling isolated', 'isolated'),
        createInsight('withdrawn from others', 'withdrawn'),
      ];

      const sessions = createRecentSessions(5);
      const alerts = analyzeTrajectoriesForRisk(insights, sessions);

      expect(alerts.length).toBeGreaterThan(0);
      // shame-isolation archetype title: 'Risk: Disconnection spiral leading to depressive state'
      const shameAlert = alerts.find((a) => a.title.includes('Disconnection') || a.title.includes('shame'));
      expect(shameAlert).toBeDefined();
      expect(shameAlert?.type).toBe('risk');
    });

    it('should detect fear-avoidance archetype', () => {
      const insights: IntegratedInsight[] = [
        createInsight('fear of failure', 'fear'),
        createInsight('avoiding difficult tasks', 'avoid'),
        createInsight('procrastinating on goals', 'procrastinate'),
      ];

      const sessions = createRecentSessions(5);
      const alerts = analyzeTrajectoriesForRisk(insights, sessions);

      expect(alerts.length).toBeGreaterThan(0);
      const fearAlert = alerts.find((a) => a.title.includes('Avoidance'));
      expect(fearAlert).toBeDefined();
    });

    it('should detect perfectionism-burnout archetype', () => {
      const insights: IntegratedInsight[] = [
        createInsight('perfectionism driving me', 'perfectionism'),
        createInsight('feeling exhausted', 'exhausted'),
        createInsight('overworking constantly', 'overworking'),
      ];

      const sessions = createRecentSessions(8);
      const alerts = analyzeTrajectoriesForRisk(insights, sessions);

      expect(alerts.length).toBeGreaterThan(0);
      const burnoutAlert = alerts.find((a) => a.title.includes('Burnout'));
      expect(burnoutAlert).toBeDefined();
      expect(burnoutAlert?.severity).toBe('high');
    });

    it('should detect attachment-anxiety archetype', () => {
      const insights: IntegratedInsight[] = [
        createInsight('anxious in relationships', 'anxious'),
        createInsight('fear of abandonment', 'abandonment'),
        createInsight('seeking reassurance', 'reassurance'),
      ];

      const sessions = createRecentSessions(6);
      const alerts = analyzeTrajectoriesForRisk(insights, sessions);

      expect(alerts.length).toBeGreaterThan(0);
      const attachmentAlert = alerts.find((a) => a.title.includes('Relationship'));
      expect(attachmentAlert).toBeDefined();
    });

    it('should calculate severity based on match score', () => {
      const insights: IntegratedInsight[] = [
        createInsight('shame', 'shame'),
        createInsight('isolated', 'isolated'),
        createInsight('withdrawn', 'withdrawn'),
        createInsight('alone', 'alone'),
        createInsight('hide', 'hide'),
      ];

      const sessions = createRecentSessions(5);
      const alerts = analyzeTrajectoriesForRisk(insights, sessions);

      expect(alerts.length).toBeGreaterThan(0);
      const alert = alerts[0];
      expect(alert.severity).toBe('high');
      expect(alert.confidence).toBeGreaterThan(0.8);
    });

    it('should detect escalation pattern', () => {
      const insights: IntegratedInsight[] = [
        createInsightWithDate('recurring pattern', '2024-01-01'),
        createInsightWithDate('recurring pattern', '2024-01-05'),
        createInsightWithDate('recurring pattern', '2024-01-07'),
        createInsightWithDate('recurring pattern', '2024-01-08'),
      ];

      const sessions = createRecentSessions(4);
      const alerts = analyzeTrajectoriesForRisk(insights, sessions);

      expect(alerts.length).toBeGreaterThan(0);
      const escalationAlert = alerts.find((a) => a.title.includes('Escalation'));
      expect(escalationAlert).toBeDefined();
      expect(escalationAlert?.severity).toBe('high');
    });

    it('should include trigger indicators in alerts', () => {
      const insights: IntegratedInsight[] = [
        createInsight('fear pattern', 'fear'),
        createInsight('avoid situations', 'avoid'),
      ];

      const sessions = createRecentSessions(5);
      const alerts = analyzeTrajectoriesForRisk(insights, sessions);

      expect(alerts.length).toBeGreaterThan(0);
      const alert = alerts[0];
      expect(alert.triggerIndicators).toBeDefined();
      expect(alert.triggerIndicators.length).toBeGreaterThan(0);
    });
  });

  describe('forecastNextChallenge', () => {
    it('should return null for no patterns', () => {
      const forecast = forecastNextChallenge([], []);
      expect(forecast).toBeNull();
    });

    it('should return null for no increasing patterns', () => {
      const patterns: PatternFamily[] = [
        createPatternFamily('shame', 'stable'),
      ];

      const forecast = forecastNextChallenge(patterns, []);
      expect(forecast).toBeNull();
    });

    it('should forecast from increasing pattern', () => {
      const patterns: PatternFamily[] = [
        createPatternFamily('shame', 'increasing', 0.8),
      ];

      const insights: IntegratedInsight[] = [
        createInsight('shame pattern', 'shame'),
      ];

      const forecast = forecastNextChallenge(patterns, insights);

      expect(forecast).toBeDefined();
      expect(forecast?.likelyChallenge).toContain('Self-worth');
      expect(forecast?.confidence).toBeGreaterThan(0.7);
    });

    it('should determine timeframe based on pattern strength', () => {
      const strongPattern: PatternFamily[] = [
        createPatternFamily('fear', 'increasing', 0.9),
      ];

      const weakPattern: PatternFamily[] = [
        createPatternFamily('fear', 'increasing', 0.5),
      ];

      const strongForecast = forecastNextChallenge(strongPattern, []);
      const weakForecast = forecastNextChallenge(weakPattern, []);

      expect(strongForecast?.timeframe).toContain('14-21 days');
      expect(weakForecast?.timeframe).toContain('1-2 months');
    });

    it('should map themes to modalities correctly', () => {
      const shadowPattern: PatternFamily[] = [
        createPatternFamily('shame', 'increasing'),
      ];

      const bodyPattern: PatternFamily[] = [
        createPatternFamily('anger', 'increasing'),
      ];

      const shadowForecast = forecastNextChallenge(shadowPattern, []);
      const bodyForecast = forecastNextChallenge(bodyPattern, []);

      expect(shadowForecast?.recommendedModality).toBe('shadow');
      expect(bodyForecast?.recommendedModality).toBe('body');
    });

    it('should include preparatory practices', () => {
      const patterns: PatternFamily[] = [
        createPatternFamily('shame', 'increasing'),
      ];

      const forecast = forecastNextChallenge(patterns, []);

      expect(forecast).toBeDefined();
      expect(forecast?.preparatoryPractices).toBeDefined();
      expect(forecast?.preparatoryPractices.length).toBeGreaterThan(0);
    });

    it('should include rationale in forecast', () => {
      const patterns: PatternFamily[] = [
        createPatternFamily('fear', 'increasing', 0.75),
      ];

      const forecast = forecastNextChallenge(patterns, []);

      expect(forecast).toBeDefined();
      expect(forecast?.rationale).toContain('fear');
      expect(forecast?.rationale).toContain('75%');
    });
  });

  describe('recommendProactiveAction', () => {
    it('should create recommendation from forecast', () => {
      const forecast: Forecast = {
        timeframe: '14-21 days',
        likelyChallenge: 'Self-worth crisis',
        confidence: 0.8,
        triggerIndicators: ['shame', 'isolated'],
        recommendedModality: 'shadow',
        preparatoryPractices: ['self-compassion', 'shadow-journaling'],
        rationale: 'Pattern increasing',
      };

      const recommendation = recommendProactiveAction(forecast);

      expect(recommendation.action).toContain('self-worth crisis');
      expect(recommendation.priority).toBe('high');
      expect(recommendation.practices.length).toBeGreaterThan(0);
      expect(recommendation.wizards.length).toBeGreaterThan(0);
    });

    it('should set priority based on confidence', () => {
      const highConfidence: Forecast = {
        timeframe: '14-21 days',
        likelyChallenge: 'Crisis',
        confidence: 0.85,
        triggerIndicators: [],
        recommendedModality: 'shadow',
        preparatoryPractices: [],
        rationale: 'High confidence',
      };

      const mediumConfidence: Forecast = {
        ...highConfidence,
        confidence: 0.6,
      };

      const highRec = recommendProactiveAction(highConfidence);
      const mediumRec = recommendProactiveAction(mediumConfidence);

      expect(highRec.priority).toBe('high');
      expect(mediumRec.priority).toBe('medium');
    });

    it('should recommend wizards based on modality', () => {
      const shadowForecast: Forecast = {
        timeframe: '14-21 days',
        likelyChallenge: 'Challenge',
        confidence: 0.8,
        triggerIndicators: [],
        recommendedModality: 'shadow',
        preparatoryPractices: [],
        rationale: 'Test',
      };

      const bodyForecast: Forecast = {
        ...shadowForecast,
        recommendedModality: 'body',
      };

      const shadowRec = recommendProactiveAction(shadowForecast);
      const bodyRec = recommendProactiveAction(bodyForecast);

      expect(shadowRec.wizards[0].wizardType).toContain('ifs');
      expect(bodyRec.wizards[0].wizardType).toContain('somatic');
    });

    it('should map practices from forecast', () => {
      const forecast: Forecast = {
        timeframe: '14-21 days',
        likelyChallenge: 'Crisis',
        confidence: 0.8,
        triggerIndicators: [],
        recommendedModality: 'shadow',
        preparatoryPractices: ['self-compassion', 'shadow-journaling'],
        rationale: 'Test',
      };

      const recommendation = recommendProactiveAction(forecast);

      expect(recommendation.practices.length).toBe(2);
      expect(recommendation.practices[0].practiceId).toBe('self-compassion');
      expect(recommendation.practices[1].practiceId).toBe('shadow-journaling');
    });
  });

  describe('predictDevelopmentalStage', () => {
    it('should classify early stabilization (< 10 sessions)', () => {
      const sessions = createSessions(5, 'ifs');
      const insights: IntegratedInsight[] = [];

      const stage = predictDevelopmentalStage(sessions, insights);
      expect(stage).toBe('early_stabilization');
    });

    it('should classify pattern recognition (10-30 sessions, few addressed)', () => {
      const sessions = createSessions(15, 'ifs');
      const insights: IntegratedInsight[] = [
        createInsight('pattern 1', 'pending'),
        createInsight('pattern 2', 'pending'),
      ];

      const stage = predictDevelopmentalStage(sessions, insights);
      expect(stage).toBe('pattern_recognition');
    });

    it('should classify integration (30+ sessions, some addressed)', () => {
      const sessions = createSessions(35, 'ifs');
      const insights: IntegratedInsight[] = [
        ...Array(8).fill(null).map((_, i) => createInsightWithStatus('pattern', 'addressed')),
        ...Array(3).fill(null).map((_, i) => createInsightWithStatus('pattern', 'pending')),
      ];

      const stage = predictDevelopmentalStage(sessions, insights);
      expect(stage).toBe('integration');
    });

    it('should classify advanced practice (50+ sessions, high diversity)', () => {
      const sessions = [
        ...createSessions(15, 'ifs'),
        ...createSessions(15, 'somatic'),
        ...createSessions(15, 'jhana'),
        ...createSessions(10, 'bias'),
      ];

      const insights: IntegratedInsight[] = Array(20)
        .fill(null)
        .map((_, i) => createInsightWithStatus(`pattern ${i}`, 'addressed'));

      const stage = predictDevelopmentalStage(sessions, insights);
      expect(stage).toBe('advanced_practice');
    });

    it('should default to integration for mixed metrics', () => {
      const sessions = createSessions(40, 'ifs');
      const insights: IntegratedInsight[] = [
        createInsightWithStatus('pattern', 'addressed'),
      ];

      const stage = predictDevelopmentalStage(sessions, insights);
      expect(stage).toBe('integration');
    });
  });

  describe('localStorage persistence', () => {
    it('should persist alerts and forecasts', () => {
      const alerts: PredictiveAlert[] = [
        {
          id: 'alert-1',
          type: 'risk',
          severity: 'high',
          timeframe: '1-2 weeks',
          title: 'Test Alert',
          description: 'Test',
          triggerIndicators: [],
          recommendation: {
            action: 'Test',
            priority: 'high',
            practices: [],
            wizards: [],
            timing: 'now',
          },
          confidence: 0.8,
          generatedAt: new Date().toISOString(),
        },
      ];

      const forecasts: Forecast[] = [
        {
          timeframe: '14-21 days',
          likelyChallenge: 'Challenge',
          confidence: 0.8,
          triggerIndicators: [],
          recommendedModality: 'shadow',
          preparatoryPractices: [],
          rationale: 'Test',
        },
      ];

      persistPredictiveGuidance(alerts, forecasts);

      const stored = StorageManager.getUntyped('predictiveGuidance');
      expect(stored).toBeTruthy();

      const parsed = stored as any;
      expect(parsed.alerts).toHaveLength(1);
      expect(parsed.forecasts).toHaveLength(1);
    });

    it('should retrieve persisted guidance', () => {
      const alerts: PredictiveAlert[] = [
        {
          id: 'alert-2',
          type: 'risk',
          severity: 'medium',
          timeframe: '2-3 weeks',
          title: 'Test Alert 2',
          description: 'Test',
          triggerIndicators: [],
          recommendation: {
            action: 'Test',
            priority: 'medium',
            practices: [],
            wizards: [],
            timing: 'soon',
          },
          confidence: 0.7,
          generatedAt: new Date().toISOString(),
        },
      ];

      const forecasts: Forecast[] = [];

      persistPredictiveGuidance(alerts, forecasts);
      const retrieved = retrievePredictiveGuidance();

      expect(retrieved.alerts).toHaveLength(1);
      expect(retrieved.alerts[0].id).toBe('alert-2');
    });

    it('should return empty arrays if nothing stored', () => {
      const guidance = retrievePredictiveGuidance();
      expect(guidance.alerts).toEqual([]);
      expect(guidance.forecasts).toEqual([]);
    });

    it('should handle corrupted localStorage gracefully', () => {
      StorageManager.setUntyped('predictiveGuidance', 'invalid-json' as any);
      const guidance = retrievePredictiveGuidance();
      expect(guidance.alerts).toEqual([]);
      expect(guidance.forecasts).toEqual([]);
    });
  });
});

// Test helper functions
function createInsight(summary: string, pattern: string): IntegratedInsight {
  return {
    id: `insight-${Date.now()}-${Math.random()}`,
    mindToolType: 'IFS Session',
    mindToolSessionId: 'session-1',
    mindToolName: 'IFS Session',
    mindToolReport: `Report containing ${pattern}`,
    mindToolShortSummary: summary,
    detectedPattern: pattern,
    suggestedShadowWork: [],
    suggestedNextSteps: [],
    dateCreated: new Date().toISOString(),
    status: 'pending',
  };
}

function createInsightWithDate(pattern: string, date: string): IntegratedInsight {
  return {
    id: `insight-${date}-${Math.random()}`,
    mindToolType: 'IFS Session',
    mindToolSessionId: 'session-1',
    mindToolName: 'IFS Session',
    mindToolReport: 'Report',
    mindToolShortSummary: pattern,
    detectedPattern: pattern,
    suggestedShadowWork: [],
    suggestedNextSteps: [],
    dateCreated: date,
    status: 'pending',
  };
}

function createInsightWithStatus(pattern: string, status: 'pending' | 'addressed'): IntegratedInsight {
  return {
    id: `insight-${Date.now()}-${Math.random()}`,
    mindToolType: 'IFS Session',
    mindToolSessionId: 'session-1',
    mindToolName: 'IFS Session',
    mindToolReport: 'Report',
    mindToolShortSummary: pattern,
    detectedPattern: pattern,
    suggestedShadowWork: [],
    suggestedNextSteps: [],
    dateCreated: new Date().toISOString(),
    status,
  };
}

function createRecentSessions(count: number): WizardSessionSummary[] {
  const sessions: WizardSessionSummary[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000).toISOString();
    sessions.push({
      type: 'ifs',
      date,
      keyInsights: ['insight 1', 'insight 2'],
    });
  }

  return sessions;
}

function createSessions(count: number, type: string): WizardSessionSummary[] {
  const sessions: WizardSessionSummary[] = [];

  for (let i = 0; i < count; i++) {
    sessions.push({
      type,
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      keyInsights: ['insight'],
    });
  }

  return sessions;
}

function createPatternFamily(
  theme: string,
  trend: 'increasing' | 'stable' | 'decreasing',
  strength: number = 0.7,
): PatternFamily {
  const cluster: PatternCluster = {
    id: `cluster-${theme}`,
    insights: [],
    centroid: [],
    similarity_scores: {},
    metadata: {
      theme,
      strength,
      representative_insight_id: 'insight-1',
    },
  };

  return {
    id: `family-${theme}`,
    name: theme,
    clusters: [cluster],
    evolution_history: [
      {
        emerged_at: '2024-01-01',
        evolved_at: new Date().toISOString(),
        strength_trend: trend,
        related_patterns: [],
        description: `Pattern ${trend}`,
      },
    ],
    timestamp: new Date().toISOString(),
    metadata: {
      total_insights: 5,
      primary_theme: theme,
      related_themes: [],
      strength,
    },
  };
}
