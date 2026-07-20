/**
 * Guidance Export & Journaling Service
 *
 * Allows users to export Intelligence Hub guidance, save snapshots over time,
 * and create journal entries combining guidance with personal reflections.
 */

import type { IntelligentGuidance } from '../types';
import { StorageManager } from '../.claude/lib/storageManager';

export interface GuidanceSnapshot {
  id: string;
  guidance: IntelligentGuidance;
  timestamp: string;
  userReflections?: string;
  tags?: string[];
}

const SNAPSHOTS_STORAGE_KEY = 'guidanceSnapshots';

/**
 * Export guidance as markdown
 */
export function exportAsMarkdown(guidance: IntelligentGuidance, includeReflections?: string): string {
  const parts: string[] = [];

  // Header
  parts.push('# Intelligence Hub Guidance');
  parts.push('');
  parts.push(`**Generated**: ${new Date(guidance.generatedAt).toLocaleString()}`);
  parts.push('');
  parts.push('---');
  parts.push('');

  // Where You Are
  parts.push('## Where You Are');
  parts.push('');
  parts.push(guidance.synthesis);
  parts.push('');

  // Primary Focus
  parts.push('## Primary Focus');
  parts.push('');
  parts.push(guidance.primaryFocus);
  parts.push('');

  // Next Wizard
  if (guidance.recommendations?.nextWizard) {
    const wizard = guidance.recommendations.nextWizard;
    parts.push('## Recommended Wizard');
    parts.push('');
    parts.push(`### ${wizard.name}`);
    parts.push('');
    parts.push(`**Priority**: ${wizard.priority} | **Confidence**: ${Math.round((wizard.confidence || 0) * 100)}%`);
    parts.push('');
    parts.push(`**Why this wizard**: ${wizard.reason}`);
    parts.push('');
    parts.push(`**Focus on**: ${wizard.focus}`);
    parts.push('');
    if (wizard.timing) {
      parts.push(`**Timing**: ${wizard.timing}`);
      parts.push('');
    }
    if (wizard.evidence && wizard.evidence.length > 0) {
      parts.push(`**Evidence**: ${wizard.evidence.join(', ')}`);
      parts.push('');
    }
  }

  // Practice Recommendations
  if (guidance.recommendations?.practiceChanges) {
    const { add, remove, modify } = guidance.recommendations.practiceChanges;

    if (add && add.length > 0) {
      parts.push('## Practices to Add');
      parts.push('');
      add.forEach((rec: any, index: number) => {
        parts.push(`### ${index + 1}. ${rec.practice?.name || rec.practiceName || 'Practice'}`);
        parts.push('');
        parts.push(`**Priority**: ${rec.priority}`);
        parts.push(`**Timing**: ${rec.startTiming || 'now'}`);
        parts.push(`**Time Commitment**: ${rec.timeCommitment || '15 min/day'}`);
        parts.push('');
        parts.push(`**Why**: ${rec.reason}`);
        parts.push('');
        if (rec.expectedBenefits) {
          parts.push(`**Expected Benefits**: ${rec.expectedBenefits}`);
          parts.push('');
        }
        if (rec.integrationTips) {
          parts.push(`**Integration Tips**: ${rec.integrationTips}`);
          parts.push('');
        }
      });
    }

    if (remove && remove.length > 0) {
      parts.push('## Practices to Remove');
      parts.push('');
      remove.forEach((practiceName: string) => {
        parts.push(`- ${practiceName}`);
      });
      parts.push('');
    }

    if (modify && modify.length > 0) {
      parts.push('## Practices to Modify');
      parts.push('');
      modify.forEach((mod: any) => {
        parts.push(`### ${mod.practiceName}`);
        parts.push('');
        parts.push(mod.suggestion);
        parts.push('');
      });
    }
  }

  // Stack Balance
  if (guidance.recommendations?.stackBalance) {
    const balance = guidance.recommendations.stackBalance;
    parts.push('## Recommended Stack Balance');
    parts.push('');
    parts.push(`- **Body**: ${balance.body}`);
    parts.push(`- **Mind**: ${balance.mind}`);
    parts.push(`- **Spirit**: ${balance.spirit}`);
    parts.push(`- **Shadow**: ${balance.shadow}`);
    parts.push('');
  }

  // How It All Connects
  if (guidance.reasoning) {
    parts.push('## How It All Connects');
    parts.push('');

    if (guidance.reasoning.whatINoticed && guidance.reasoning.whatINoticed.length > 0) {
      parts.push('### What I Noticed');
      parts.push('');
      guidance.reasoning.whatINoticed.forEach(item => {
        parts.push(`- ${item}`);
      });
      parts.push('');
    }

    if (guidance.reasoning.whyThisMatters && guidance.reasoning.whyThisMatters.length > 0) {
      parts.push('### Why This Matters');
      parts.push('');
      guidance.reasoning.whyThisMatters.forEach(item => {
        parts.push(`- ${item}`);
      });
      parts.push('');
    }

    if (guidance.reasoning.howItConnects && guidance.reasoning.howItConnects.length > 0) {
      parts.push('### Connections');
      parts.push('');
      guidance.reasoning.howItConnects.forEach(item => {
        parts.push(`- ${item}`);
      });
      parts.push('');
    }
  }

  // Cautions
  if (guidance.cautions && guidance.cautions.length > 0) {
    parts.push('## Cautions');
    parts.push('');
    guidance.cautions.forEach(caution => {
      parts.push(`⚠️ ${caution}`);
      parts.push('');
    });
  }

  // User Reflections
  if (includeReflections) {
    parts.push('---');
    parts.push('');
    parts.push('## My Reflections');
    parts.push('');
    parts.push(includeReflections);
    parts.push('');
  }

  // Footer
  parts.push('---');
  parts.push('');
  parts.push('_Generated by Aura ILP Intelligence Hub_');
  parts.push('');

  return parts.join('\n');
}

/**
 * Export guidance as JSON
 */
export function exportAsJSON(guidance: IntelligentGuidance, includeReflections?: string): string {
  const exportData = {
    guidance,
    userReflections: includeReflections,
    exportedAt: new Date().toISOString(),
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Save guidance snapshot for later review
 */
export function saveSnapshot(
  guidance: IntelligentGuidance,
  userReflections?: string,
  tags?: string[]
): GuidanceSnapshot {
  const snapshot: GuidanceSnapshot = {
    id: `snapshot-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    guidance,
    timestamp: new Date().toISOString(),
    userReflections,
    tags,
  };

  try {
    const existingSnapshots = getAllSnapshots();
    existingSnapshots.push(snapshot);

    StorageManager.setUntyped(SNAPSHOTS_STORAGE_KEY, existingSnapshots);
    console.log(`[GuidanceExport] Saved snapshot ${snapshot.id}`);

    return snapshot;
  } catch (error) {
    console.error('[GuidanceExport] Failed to save snapshot:', error);
    throw error;
  }
}

/**
 * Get all saved snapshots
 */
export function getAllSnapshots(): GuidanceSnapshot[] {
  try {
    const stored = StorageManager.getUntyped(SNAPSHOTS_STORAGE_KEY);
    if (!stored) return [];

    return stored as GuidanceSnapshot[];
  } catch (error) {
    console.warn('[GuidanceExport] Failed to load snapshots:', error);
    return [];
  }
}

/**
 * Get snapshot by ID
 */
export function getSnapshot(id: string): GuidanceSnapshot | null {
  const snapshots = getAllSnapshots();
  return snapshots.find(s => s.id === id) || null;
}

/**
 * Delete snapshot
 */
export function deleteSnapshot(id: string): void {
  try {
    const snapshots = getAllSnapshots();
    const filtered = snapshots.filter(s => s.id !== id);

    StorageManager.setUntyped(SNAPSHOTS_STORAGE_KEY, filtered);
    console.log(`[GuidanceExport] Deleted snapshot ${id}`);
  } catch (error) {
    console.error('[GuidanceExport] Failed to delete snapshot:', error);
  }
}

/**
 * Update snapshot reflections
 */
export function updateSnapshotReflections(id: string, reflections: string): void {
  try {
    const snapshots = getAllSnapshots();
    const index = snapshots.findIndex(s => s.id === id);

    if (index !== -1) {
      snapshots[index].userReflections = reflections;
      StorageManager.setUntyped(SNAPSHOTS_STORAGE_KEY, snapshots);
      console.log(`[GuidanceExport] Updated reflections for snapshot ${id}`);
    }
  } catch (error) {
    console.error('[GuidanceExport] Failed to update reflections:', error);
  }
}

/**
 * Get snapshots by date range
 */
export function getSnapshotsByDateRange(startDate: Date, endDate: Date): GuidanceSnapshot[] {
  const snapshots = getAllSnapshots();

  return snapshots.filter(s => {
    const snapshotDate = new Date(s.timestamp);
    return snapshotDate >= startDate && snapshotDate <= endDate;
  });
}

/**
 * Get snapshots by tags
 */
export function getSnapshotsByTags(tags: string[]): GuidanceSnapshot[] {
  const snapshots = getAllSnapshots();

  return snapshots.filter(s => {
    if (!s.tags || s.tags.length === 0) return false;
    return tags.some(tag => s.tags!.includes(tag));
  });
}

/**
 * Download guidance as file
 */
export function downloadAsMarkdown(guidance: IntelligentGuidance, reflections?: string): void {
  const markdown = exportAsMarkdown(guidance, reflections);
  const filename = `intelligence-hub-guidance-${new Date().toISOString().split('T')[0]}.md`;

  downloadFile(markdown, filename, 'text/markdown');
}

/**
 * Download guidance as JSON file
 */
export function downloadAsJSONFile(guidance: IntelligentGuidance, reflections?: string): void {
  const json = exportAsJSON(guidance, reflections);
  const filename = `intelligence-hub-guidance-${new Date().toISOString().split('T')[0]}.json`;

  downloadFile(json, filename, 'application/json');
}

/**
 * Helper to trigger file download
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Copy guidance markdown to clipboard
 */
export async function copyToClipboard(guidance: IntelligentGuidance, reflections?: string): Promise<boolean> {
  try {
    const markdown = exportAsMarkdown(guidance, reflections);
    await navigator.clipboard.writeText(markdown);
    console.log('[GuidanceExport] Copied to clipboard');
    return true;
  } catch (error) {
    console.error('[GuidanceExport] Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Generate comparison between two snapshots
 */
export function compareSnapshots(snapshot1: GuidanceSnapshot, snapshot2: GuidanceSnapshot): string {
  const parts: string[] = [];

  parts.push('# Guidance Comparison');
  parts.push('');
  parts.push(`**From**: ${new Date(snapshot1.timestamp).toLocaleDateString()}`);
  parts.push(`**To**: ${new Date(snapshot2.timestamp).toLocaleDateString()}`);
  parts.push('');
  parts.push('---');
  parts.push('');

  // Compare primary focus
  parts.push('## Primary Focus Evolution');
  parts.push('');
  parts.push(`**Then**: ${snapshot1.guidance.primaryFocus}`);
  parts.push('');
  parts.push(`**Now**: ${snapshot2.guidance.primaryFocus}`);
  parts.push('');

  // Compare wizard recommendations
  const wizard1 = snapshot1.guidance.recommendations?.nextWizard;
  const wizard2 = snapshot2.guidance.recommendations?.nextWizard;

  if (wizard1 || wizard2) {
    parts.push('## Wizard Recommendations');
    parts.push('');
    if (wizard1) parts.push(`**Then**: ${wizard1.name}`);
    if (wizard2) parts.push(`**Now**: ${wizard2.name}`);
    parts.push('');
  }

  // Compare stack balance
  const balance1 = snapshot1.guidance.recommendations?.stackBalance;
  const balance2 = snapshot2.guidance.recommendations?.stackBalance;

  if (balance1 && balance2) {
    parts.push('## Stack Balance Changes');
    parts.push('');
    parts.push('| Module | Then | Now | Change |');
    parts.push('|--------|------|-----|--------|');

    ['body', 'mind', 'spirit', 'shadow'].forEach(module => {
      const key = module as keyof typeof balance1;
      const val1 = parseInt(balance1[key]) || 0;
      const val2 = parseInt(balance2[key]) || 0;
      const change = val2 - val1;
      const changeStr = change > 0 ? `+${change}%` : `${change}%`;
      parts.push(`| ${module} | ${balance1[key]} | ${balance2[key]} | ${changeStr} |`);
    });
    parts.push('');
  }

  return parts.join('\n');
}

/**
 * Clear all snapshots
 */
export function clearAllSnapshots(): void {
  StorageManager.delete(SNAPSHOTS_STORAGE_KEY);
  console.log('[GuidanceExport] Cleared all snapshots');
}
