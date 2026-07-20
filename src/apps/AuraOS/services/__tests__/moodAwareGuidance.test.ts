/**
 * Mood-Aware Guidance Tests
 */

import { describe, it, expect } from 'vitest';
import {
  determineMoodState,
  calculateBurnoutRisk,
  generateMoodAwareRecommendations,
  buildMoodAwarePromptEnhancement,
  getBurnoutPreventionRecommendations,
  type MoodState,
  type BurnoutRisk,
} from '../moodAwareGuidance';
import type { UserProfile } from '../../utils/contextAggregator';
import type { IntelligenceContext, AllPractice } from '../../types';

describe('Mood-Aware Guidance', () => {
  const createMockSentiment = (overrides: Partial<UserProfile['sentimentSummary']> = {}): UserProfile['sentimentSummary'] => ({
    averageMoodScore: 0.5,
    moodTrend: 'stable',
    recentMoodKeywords: [],
    lastAnalyzedDate: new Date().toISOString(),
    ...overrides,
  });

  const createMockPractice = (id: string, name: string): AllPractice => ({
    id,
    name,
    description: 'Test practice',
    duration: '15 min',
    difficulty: 'beginner' as const,
    category: 'Mind' as const,
    benefits: [],
  });

  const createMockContext = (overrides: Partial<IntelligenceContext> = {}): IntelligenceContext => ({
    currentPracticeStack: [],
    practiceNotes: {},
    completionHistory: [],
    wizardSessions: [],
    integratedInsights: [],
    pendingPatterns: [],
    primaryChallenges: [],
    ...overrides,
  });

  describe('determineMoodState', () => {
    it('should return unknown when no sentiment data', () => {
      const state = determineMoodState(undefined);
      expect(state).toBe('unknown');
    });

    it('should return thriving for positive mood with improving trend', () => {
      const sentiment = createMockSentiment({
        averageMoodScore: 0.6,
        moodTrend: 'improving',
      });

      const state = determineMoodState(sentiment);
      expect(state).toBe('thriving');
    });

    it('should return thriving for positive mood with stable trend', () => {
      const sentiment = createMockSentiment({
        averageMoodScore: 0.5,
        moodTrend: 'stable',
      });

      const state = determineMoodState(sentiment);
      expect(state).toBe('thriving');
    });

    it('should return declining for declining trend', () => {
      const sentiment = createMockSentiment({
        averageMoodScore: 0.3,
        moodTrend: 'declining',
      });

      const state = determineMoodState(sentiment);
      expect(state).toBe('declining');
    });

    it('should return struggling for low mood but not declining', () => {
      const sentiment = createMockSentiment({
        averageMoodScore: -0.3,
        moodTrend: 'stable',
      });

      const state = determineMoodState(sentiment);
      expect(state).toBe('struggling');
    });

    it('should return stable for moderate mood', () => {
      const sentiment = createMockSentiment({
        averageMoodScore: 0.2,
        moodTrend: 'stable',
      });

      const state = determineMoodState(sentiment);
      expect(state).toBe('stable');
    });
  });

  describe('calculateBurnoutRisk', () => {
    it('should return none for unknown mood state', () => {
      const risk = calculateBurnoutRisk('unknown', [], [], undefined);
      expect(risk).toBe('none');
    });

    it('should detect high risk from declining mood + large stack', () => {
      const practices = Array(12).fill(null).map((_, i) => createMockPractice(`p${i}`, `Practice ${i}`));

      const risk = calculateBurnoutRisk('declining', practices, [], undefined);

      expect(['medium', 'high', 'critical']).toContain(risk);
    });

    it('should detect risk from stress keywords', () => {
      const userProfile: Partial<UserProfile> = {
        sentimentSummary: createMockSentiment({
          moodTrend: 'declining',
          recentMoodKeywords: ['stress', 'anxiety', 'overwhelm'],
        }),
      };

      const practices = Array(8).fill(null).map((_, i) => createMockPractice(`p${i}`, `Practice ${i}`));

      const risk = calculateBurnoutRisk('struggling', practices, [], userProfile as UserProfile);

      expect(['medium', 'high', 'critical']).toContain(risk);
    });

    it('should detect overwhelm from low completion rate', () => {
      const practices = Array(10).fill(null).map((_, i) => createMockPractice(`p${i}`, `Practice ${i}`));

      const completionHistory = Array(20).fill(null).map((_, i) => ({
        practiceId: `p${i % 10}`,
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        completed: i % 5 === 0, // Only 20% completion rate
      }));

      const risk = calculateBurnoutRisk('stable', practices, completionHistory, undefined);

      expect(risk).not.toBe('none');
    });

    it('should detect overworking from very high completion rate + many practices', () => {
      const practices = Array(10).fill(null).map((_, i) => createMockPractice(`p${i}`, `Practice ${i}`));

      const completionHistory = Array(30).fill(null).map((_, i) => ({
        practiceId: `p${i % 10}`,
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        completed: i % 10 !== 0, // 90% completion rate
      }));

      const risk = calculateBurnoutRisk('stable', practices, completionHistory, undefined);

      expect(risk).not.toBe('none');
    });

    it('should return none for low risk scenario', () => {
      const practices = [createMockPractice('p1', 'Practice 1')];

      const userProfile: Partial<UserProfile> = {
        sentimentSummary: createMockSentiment({
          averageMoodScore: 0.6,
          moodTrend: 'improving',
        }),
      };

      const risk = calculateBurnoutRisk('thriving', practices, [], userProfile as UserProfile);

      expect(risk).toBe('none');
    });
  });

  describe('generateMoodAwareRecommendations', () => {
    it('should recommend challenging practices when thriving', () => {
      const userProfile: Partial<UserProfile> = {
        sentimentSummary: createMockSentiment({
          averageMoodScore: 0.7,
          moodTrend: 'improving',
        }),
      };

      const context = createMockContext();

      const recommendation = generateMoodAwareRecommendations(context, userProfile as UserProfile);

      expect(recommendation.moodState).toBe('thriving');
      expect(recommendation.toneAdjustment).toBe('challenging');
      expect(recommendation.practiceIntensityGuidance).toBe('increase');
      expect(recommendation.celebrationsIfAny.length).toBeGreaterThan(0);
    });

    it('should recommend restorative practices when struggling', () => {
      const userProfile: Partial<UserProfile> = {
        sentimentSummary: createMockSentiment({
          averageMoodScore: -0.3,
          moodTrend: 'stable',
        }),
      };

      const context = createMockContext();

      const recommendation = generateMoodAwareRecommendations(context, userProfile as UserProfile);

      expect(recommendation.moodState).toBe('struggling');
      expect(recommendation.toneAdjustment).toBe('supportive');
      expect(recommendation.practiceIntensityGuidance).toBe('reduce');
      expect(recommendation.recommendedPracticeTypes).toContain('restorative practices');
    });

    it('should warn about burnout when risk is high', () => {
      const practices = Array(15).fill(null).map((_, i) => createMockPractice(`p${i}`, `Practice ${i}`));

      const userProfile: Partial<UserProfile> = {
        sentimentSummary: createMockSentiment({
          averageMoodScore: -0.2,
          moodTrend: 'declining',
          recentMoodKeywords: ['stress', 'exhausted'],
        }),
      };

      const context = createMockContext({
        currentPracticeStack: practices as AllPractice[],
      });

      const recommendation = generateMoodAwareRecommendations(context, userProfile as UserProfile);

      expect(['high', 'critical']).toContain(recommendation.burnoutRisk);
      expect(recommendation.warningsIfAny.some(w => w.toLowerCase().includes('burnout'))).toBe(true);
    });

    it('should detect mood correlations with practices', () => {
      const practices = [
        createMockPractice('p1', 'Meditation'),
        createMockPractice('p2', 'Exercise'),
      ];

      const completionHistory = [
        { practiceId: 'p1', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), completed: true },
        { practiceId: 'p1', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), completed: true },
        { practiceId: 'p1', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), completed: true },
        { practiceId: 'p1', date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), completed: true },
      ];

      const userProfile: Partial<UserProfile> = {
        sentimentSummary: createMockSentiment({
          averageMoodScore: 0.5,
          moodTrend: 'improving',
        }),
      };

      const context = createMockContext({
        currentPracticeStack: practices as AllPractice[],
        completionHistory,
      });

      const recommendation = generateMoodAwareRecommendations(context, userProfile as UserProfile);

      expect(recommendation.moodCorrelations.length).toBeGreaterThan(0);
      expect(recommendation.moodCorrelations[0].practice).toBe('Meditation');
      expect(recommendation.moodCorrelations[0].correlation).toBe('positive');
    });
  });

  describe('buildMoodAwarePromptEnhancement', () => {
    it('should build supportive prompt for struggling state', () => {
      const recommendation = generateMoodAwareRecommendations(
        createMockContext(),
        {
          sentimentSummary: createMockSentiment({
            averageMoodScore: -0.3,
            moodTrend: 'stable',
          }),
        } as UserProfile
      );

      const prompt = buildMoodAwarePromptEnhancement(recommendation);

      expect(prompt).toContain('MOOD-AWARE GUIDANCE');
      expect(prompt).toContain('STRUGGLING');
      expect(prompt).toContain('supportive');
      expect(prompt).toContain('REDUCE');
    });

    it('should build challenging prompt for thriving state', () => {
      const recommendation = generateMoodAwareRecommendations(
        createMockContext(),
        {
          sentimentSummary: createMockSentiment({
            averageMoodScore: 0.7,
            moodTrend: 'improving',
          }),
        } as UserProfile
      );

      const prompt = buildMoodAwarePromptEnhancement(recommendation);

      expect(prompt).toContain('THRIVING');
      expect(prompt).toContain('challenging');
      expect(prompt).toContain('INCREASE');
    });

    it('should include warnings and celebrations', () => {
      const practices = Array(15).fill(null).map((_, i) => createMockPractice(`p${i}`, `Practice ${i}`));

      const recommendation = generateMoodAwareRecommendations(
        createMockContext({ currentPracticeStack: practices as AllPractice[] }),
        {
          sentimentSummary: createMockSentiment({
            averageMoodScore: 0.6,
            moodTrend: 'improving',
          }),
        } as UserProfile
      );

      const prompt = buildMoodAwarePromptEnhancement(recommendation);

      if (recommendation.warningsIfAny.length > 0) {
        expect(prompt).toContain('WARNINGS');
      }
      if (recommendation.celebrationsIfAny.length > 0) {
        expect(prompt).toContain('CELEBRATE');
      }
    });
  });

  describe('getBurnoutPreventionRecommendations', () => {
    it('should return empty for none/low risk', () => {
      const recommendations = getBurnoutPreventionRecommendations('none', []);
      expect(recommendations).toHaveLength(0);
    });

    it('should provide moderate recommendations for medium risk', () => {
      const recommendations = getBurnoutPreventionRecommendations('medium', []);
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some(r => r.includes('20-30%'))).toBe(true);
    });

    it('should provide urgent recommendations for high risk', () => {
      const recommendations = getBurnoutPreventionRecommendations('high', []);
      expect(recommendations.some(r => r.includes('URGENT'))).toBe(true);
      expect(recommendations.some(r => r.includes('40-50%'))).toBe(true);
    });

    it('should provide critical recommendations for critical risk', () => {
      const recommendations = getBurnoutPreventionRecommendations('critical', []);
      expect(recommendations.some(r => r.includes('CRITICAL'))).toBe(true);
      expect(recommendations.some(r => r.includes('Stop all practices'))).toBe(true);
    });
  });
});
