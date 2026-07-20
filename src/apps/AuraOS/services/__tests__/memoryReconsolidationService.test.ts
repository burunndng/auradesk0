/**
 * Smoke tests for memoryReconsolidationService
 * Tests response parsing and error handling
 *
 * Note: These tests use Vitest framework
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  extractImplicitBeliefs,
  mineContradictions,
  submitSessionCompletion,
} from '../memoryReconsolidationService';
import type { ImplicitBelief } from '../../types';

// Mock aiService to avoid real AI calls
vi.mock('../aiService', () => ({
  generateText: vi.fn(),
}));

import { generateText } from '../aiService';

describe('memoryReconsolidationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('extractImplicitBeliefs', () => {
    it('should extract beliefs and parse response correctly', async () => {
      const mockJson = JSON.stringify({
        beliefs: [
          {
            id: 'belief-1',
            belief: 'I am not good enough',
            emotionalCharge: 8,
            category: 'worthiness',
            affectTone: 'shame',
            depth: 'deep',
          },
        ],
        summary: 'Core worthiness belief identified.',
      });

      vi.mocked(generateText).mockResolvedValueOnce(mockJson);

      const result = await extractImplicitBeliefs({
        memoryNarrative: 'I feel anxious when I am not working',
      });

      expect(result.beliefs.length).toBe(1);
      expect(result.beliefs[0].belief).toBe('I am not good enough');
      expect(result.summary).toBeTruthy();
    });

    it('should return fallback belief when AI response is unparseable', async () => {
      vi.mocked(generateText).mockResolvedValueOnce('not valid json at all');

      const result = await extractImplicitBeliefs({
        memoryNarrative: 'Some context',
      });

      expect(result.beliefs.length).toBeGreaterThan(0);
      expect(result.beliefs[0].id).toBeDefined();
    });

    it('should handle generateText throwing an error', async () => {
      vi.mocked(generateText).mockRejectedValueOnce(new Error('Network timeout'));

      await expect(
        extractImplicitBeliefs({ memoryNarrative: 'Some context' }),
      ).rejects.toThrow();
    });
  });

  describe('mineContradictions', () => {
    it('should mine contradictions and parse response correctly', async () => {
      const beliefs = [
        { id: 'b1', belief: 'I am not good enough' },
        { id: 'b2', belief: 'I am highly capable' },
      ];

      const mockJson = JSON.stringify({
        contradictions: [
          {
            beliefId: 'b1',
            anchors: ['You succeeded at X'],
            newTruths: ['I am capable in my domain'],
            regulationCues: ['Take a breath'],
            juxtapositionPrompts: ['Hold both truths'],
          },
        ],
        juxtapositionCyclePrompts: ['Notice the tension'],
        integrationGuidance: 'Allow the integration.',
      });

      vi.mocked(generateText).mockResolvedValueOnce(mockJson);

      const result = await mineContradictions({
        beliefs,
        beliefIds: ['b1'],
      });

      expect(result.contradictions.length).toBeGreaterThan(0);
      expect(result.integrationGuidance).toBeTruthy();
    });

    it('should return fallback when AI response is unparseable', async () => {
      vi.mocked(generateText).mockResolvedValueOnce('invalid json');

      const result = await mineContradictions({
        beliefs: [{ id: 'b1', belief: 'Test belief' }],
        beliefIds: ['b1'],
      });

      expect(result.contradictions.length).toBeGreaterThan(0);
    });
  });

  describe('submitSessionCompletion', () => {
    it('should return success with sessionId', async () => {
      const payload = {
        sessionId: 'session-123',
        userId: 'user-123',
        finalBeliefs: [] as ImplicitBelief[],
        contradictionInsights: [],
        personalReflection: 'I learned something',
        commitments: ['Practice self-compassion'],
        timestamp: new Date(),
      };

      const result = await submitSessionCompletion(payload);

      expect(result.success).toBe(true);
      expect(result.sessionId).toBe('session-123');
    });
  });
});
