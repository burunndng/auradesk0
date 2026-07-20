/**
 * Guidance Export & Journaling Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StorageManager } from '../../.claude/lib/storageManager';
import {
  exportAsMarkdown,
  exportAsJSON,
  saveSnapshot,
  getAllSnapshots,
  getSnapshot,
  deleteSnapshot,
  updateSnapshotReflections,
  getSnapshotsByDateRange,
  getSnapshotsByTags,
  compareSnapshots,
  clearAllSnapshots,
} from '../guidanceExport';
import type { IntelligentGuidance } from '../../types';

describe('Guidance Export & Journaling', () => {
  beforeEach(() => {
    clearAllSnapshots();
    StorageManager.clearAll();
  });

  afterEach(() => {
    clearAllSnapshots();
  });

  const createMockGuidance = (): IntelligentGuidance => ({
    synthesis: 'You are making progress in your shadow work.',
    primaryFocus: 'Continue exploring parts work with IFS.',
    recommendations: {
      nextWizard: {
        type: 'IFSWizard',
        name: 'Internal Family Systems',
        reason: 'Your recent work shows patterns that would benefit from parts work.',
        focus: 'Explore protective parts',
        priority: 'high',
        confidence: 0.85,
        evidence: ['session-123', 'insight-456'],
        timing: 'this_week',
      },
      practiceChanges: {
        add: [
          {
            practice: { id: 'practice-1', name: 'Morning Meditation' },
            reason: 'Build consistency',
            priority: 'high',
            startTiming: 'now',
            timeCommitment: '10 min/day',
            sequenceWeek: 1,
            sequenceGuidance: 'Start immediately',
            expectedBenefits: 'Better focus',
            integrationTips: 'Do it first thing',
          },
        ],
        remove: [],
        modify: [],
      },
      stackBalance: {
        body: '25%',
        mind: '35%',
        spirit: '20%',
        shadow: '20%',
      },
    },
    reasoning: {
      whatINoticed: ['Pattern A', 'Pattern B'],
      whyThisMatters: ['Reason 1', 'Reason 2'],
      howItConnects: ['Connection 1', 'Connection 2'],
    },
    cautions: ['Be gentle with yourself', 'Don\'t rush'],
    generatedAt: new Date().toISOString(),
  });

  describe('exportAsMarkdown', () => {
    it('should export guidance as markdown', () => {
      const guidance = createMockGuidance();
      const markdown = exportAsMarkdown(guidance);

      expect(markdown).toContain('# Intelligence Hub Guidance');
      expect(markdown).toContain('## Where You Are');
      expect(markdown).toContain(guidance.synthesis);
      expect(markdown).toContain('## Primary Focus');
      expect(markdown).toContain('## Recommended Wizard');
      expect(markdown).toContain('Internal Family Systems');
    });

    it('should include user reflections when provided', () => {
      const guidance = createMockGuidance();
      const reflections = 'This guidance really resonates with me.';
      const markdown = exportAsMarkdown(guidance, reflections);

      expect(markdown).toContain('## My Reflections');
      expect(markdown).toContain(reflections);
    });

    it('should include practice recommendations', () => {
      const guidance = createMockGuidance();
      const markdown = exportAsMarkdown(guidance);

      expect(markdown).toContain('## Practices to Add');
      expect(markdown).toContain('Morning Meditation');
      expect(markdown).toContain('Build consistency');
    });

    it('should include stack balance', () => {
      const guidance = createMockGuidance();
      const markdown = exportAsMarkdown(guidance);

      expect(markdown).toContain('## Recommended Stack Balance');
      expect(markdown).toContain('**Body**: 25%');
      expect(markdown).toContain('**Mind**: 35%');
    });

    it('should include reasoning sections', () => {
      const guidance = createMockGuidance();
      const markdown = exportAsMarkdown(guidance);

      expect(markdown).toContain('## How It All Connects');
      expect(markdown).toContain('### What I Noticed');
      expect(markdown).toContain('Pattern A');
    });

    it('should include cautions', () => {
      const guidance = createMockGuidance();
      const markdown = exportAsMarkdown(guidance);

      expect(markdown).toContain('## Cautions');
      expect(markdown).toContain('Be gentle with yourself');
    });
  });

  describe('exportAsJSON', () => {
    it('should export guidance as JSON', () => {
      const guidance = createMockGuidance();
      const json = exportAsJSON(guidance);

      const parsed = JSON.parse(json);
      expect(parsed.guidance).toBeDefined();
      expect(parsed.guidance.synthesis).toBe(guidance.synthesis);
      expect(parsed.exportedAt).toBeDefined();
    });

    it('should include reflections in JSON export', () => {
      const guidance = createMockGuidance();
      const reflections = 'My thoughts on this guidance.';
      const json = exportAsJSON(guidance, reflections);

      const parsed = JSON.parse(json);
      expect(parsed.userReflections).toBe(reflections);
    });
  });

  describe('saveSnapshot', () => {
    it('should save snapshot to localStorage', () => {
      const guidance = createMockGuidance();
      const snapshot = saveSnapshot(guidance);

      expect(snapshot.id).toMatch(/^snapshot-/);
      expect(snapshot.guidance).toEqual(guidance);
      expect(snapshot.timestamp).toBeDefined();

      const stored = getAllSnapshots();
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe(snapshot.id);
    });

    it('should save snapshot with reflections and tags', () => {
      const guidance = createMockGuidance();
      const reflections = 'Great guidance!';
      const tags = ['milestone', 'breakthrough'];

      const snapshot = saveSnapshot(guidance, reflections, tags);

      expect(snapshot.userReflections).toBe(reflections);
      expect(snapshot.tags).toEqual(tags);
    });

    it('should append to existing snapshots', () => {
      const guidance1 = createMockGuidance();
      const guidance2 = createMockGuidance();

      saveSnapshot(guidance1);
      saveSnapshot(guidance2);

      const snapshots = getAllSnapshots();
      expect(snapshots).toHaveLength(2);
    });
  });

  describe('getSnapshot', () => {
    it('should retrieve snapshot by ID', () => {
      const guidance = createMockGuidance();
      const saved = saveSnapshot(guidance);

      const retrieved = getSnapshot(saved.id);

      expect(retrieved).toBeDefined();
      expect(retrieved!.id).toBe(saved.id);
      expect(retrieved!.guidance).toEqual(guidance);
    });

    it('should return null for non-existent ID', () => {
      const retrieved = getSnapshot('non-existent');
      expect(retrieved).toBeNull();
    });
  });

  describe('deleteSnapshot', () => {
    it('should remove snapshot from storage', () => {
      const guidance = createMockGuidance();
      const snapshot = saveSnapshot(guidance);

      expect(getAllSnapshots()).toHaveLength(1);

      deleteSnapshot(snapshot.id);

      expect(getAllSnapshots()).toHaveLength(0);
    });
  });

  describe('updateSnapshotReflections', () => {
    it('should update reflections for existing snapshot', () => {
      const guidance = createMockGuidance();
      const snapshot = saveSnapshot(guidance, 'Initial thoughts');

      const newReflections = 'Updated thoughts after review';
      updateSnapshotReflections(snapshot.id, newReflections);

      const updated = getSnapshot(snapshot.id);
      expect(updated!.userReflections).toBe(newReflections);
    });
  });

  describe('getSnapshotsByDateRange', () => {
    it('should filter snapshots by date range', () => {
      const guidance = createMockGuidance();

      // Create snapshots at different times
      const snapshot1 = saveSnapshot(guidance);

      // Manually adjust timestamp for testing
      const snapshots = getAllSnapshots();
      snapshots[0].timestamp = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
      StorageManager.setUntyped('guidanceSnapshots', snapshots);

      saveSnapshot(guidance); // Recent snapshot

      const startDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      const filtered = getSnapshotsByDateRange(startDate, endDate);

      expect(filtered).toHaveLength(1); // Only the recent one
    });
  });

  describe('getSnapshotsByTags', () => {
    it('should filter snapshots by tags', () => {
      const guidance = createMockGuidance();

      saveSnapshot(guidance, '', ['milestone']);
      saveSnapshot(guidance, '', ['daily', 'routine']);
      saveSnapshot(guidance, '', ['milestone', 'breakthrough']);

      const milestones = getSnapshotsByTags(['milestone']);
      expect(milestones).toHaveLength(2);

      const routine = getSnapshotsByTags(['routine']);
      expect(routine).toHaveLength(1);
    });
  });

  describe('compareSnapshots', () => {
    it('should generate comparison markdown between snapshots', () => {
      const guidance1 = createMockGuidance();
      const guidance2 = {
        ...createMockGuidance(),
        primaryFocus: 'New focus on meditation practice',
        recommendations: {
          ...createMockGuidance().recommendations,
          stackBalance: {
            body: '30%',
            mind: '30%',
            spirit: '25%',
            shadow: '15%',
          },
        },
      };

      const snapshot1 = saveSnapshot(guidance1);
      const snapshot2 = saveSnapshot(guidance2);

      const comparison = compareSnapshots(snapshot1, snapshot2);

      expect(comparison).toContain('# Guidance Comparison');
      expect(comparison).toContain('Primary Focus Evolution');
      expect(comparison).toContain('Stack Balance Changes');
      expect(comparison).toContain('Continue exploring parts work');
      expect(comparison).toContain('New focus on meditation');
    });
  });

  describe('clearAllSnapshots', () => {
    it('should remove all snapshots', () => {
      const guidance = createMockGuidance();

      saveSnapshot(guidance);
      saveSnapshot(guidance);
      saveSnapshot(guidance);

      expect(getAllSnapshots()).toHaveLength(3);

      clearAllSnapshots();

      expect(getAllSnapshots()).toHaveLength(0);
    });
  });
});
