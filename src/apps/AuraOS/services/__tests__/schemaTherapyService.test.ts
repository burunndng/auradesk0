/**
 * Schema Therapy Service Tests
 *
 * Tests for EMSA scoring, schema test metadata, and helper functions.
 */

import { describe, it, expect } from 'vitest';
import {
  EMSA_90_ITEMS,
  getSchemaTestMetadata,
  getAllSchemaTests,
  calculateEMSAScores,
} from '../schemaTherapyService';
import type { SchemaTestResponse } from '../../types';

describe('Schema Therapy Service', () => {
  describe('EMSA 90-Item Structure', () => {
    it('should have exactly 90 items', () => {
      expect(EMSA_90_ITEMS.length).toBe(90);
    });

    it('should have exactly 5 items per schema', () => {
      const schemaGroups = new Map<string, number>();
      EMSA_90_ITEMS.forEach(item => {
        schemaGroups.set(item.schemaName, (schemaGroups.get(item.schemaName) || 0) + 1);
      });
      schemaGroups.forEach((count) => {
        expect(count).toBe(5);
      });
    });

    it('should have id and text on all items', () => {
      const emptyIds = EMSA_90_ITEMS.filter(item => !item.id || !item.text);
      expect(emptyIds.length).toBe(0);
    });
  });

  describe('Test Metadata & Helper Functions', () => {
    it('should return correct metadata for core-schema', () => {
      const metadata = getSchemaTestMetadata('core-schema');
      expect(metadata).toBeDefined();
      expect(metadata?.id).toBe('core-schema');
    });

    it('should return 4 tests from getAllSchemaTests', () => {
      const allTests = getAllSchemaTests();
      expect(allTests.length).toBe(4);
    });

    it('should have tests in recommended order', () => {
      const allTests = getAllSchemaTests();
      const correctOrder = allTests.every((test, idx) => test.recommendedOrder === idx + 1);
      expect(correctOrder).toBe(true);
    });
  });

  describe('EMSA Scoring Function', () => {
    it('should return 18 schema scores', () => {
      const mockResponses: SchemaTestResponse[] = EMSA_90_ITEMS.map((item, idx) => ({
        questionId: item.id,
        response: (idx % 6) + 1,
      }));
      const scores = calculateEMSAScores(mockResponses);
      expect(scores.length).toBe(18);
    });

    it('should return scores in valid range 5-30', () => {
      const mockResponses: SchemaTestResponse[] = EMSA_90_ITEMS.map((item, idx) => ({
        questionId: item.id,
        response: (idx % 6) + 1,
      }));
      const scores = calculateEMSAScores(mockResponses);
      const validScores = scores.every(s => s.score >= 5 && s.score <= 30);
      expect(validScores).toBe(true);
    });
  });
});
