/**
 * useAXISRPL Hook
 * Pattern detection for Repeated Pattern Loop (RPL)
 * Detects: title repetition, high frequency, open session accumulation
 */

import { useMemo, useEffect } from 'react';
import type { AXISSession } from '../../../../types';
import { readRPLCooldowns, writeRPLCooldowns } from '../../../../services/AXISStorage';

const STOPWORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'i', 'me', 'my', 'to', 'of', 'and',
  'in', 'on', 'for', 'with', 'about', 'this', 'that', 'it', 'you', 'your',
  'he', 'she', 'we', 'them', 'their', 'be', 'have', 'has', 'do', 'does'
]);

function tokenize(text: string): Set<string> {
  return new Set(
    text.toLowerCase()
      .split(/\W+/)
      .filter(w => w.length > 2 && !STOPWORDS.has(w))
  );
}

function jaccard(a: string, b: string): number {
  const setA = tokenize(a);
  const setB = tokenize(b);
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

export interface RPLTrigger {
  type: 'title-repetition' | 'high-frequency' | 'open-accumulation' | 'anchor-review' | 'time-gap-medium' | 'time-gap-long';
  message: string;
  question: string;
}

interface RPLCooldown {
  patternType: string;
  expiresAt: string;
}

function getCooldowns(): RPLCooldown[] {
  return readRPLCooldowns();
}

function setCooldown(patternType: string, hours: number = 48) {
  const cooldowns = getCooldowns().filter(c => c.patternType !== patternType);
  const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
  cooldowns.push({ patternType, expiresAt });
  writeRPLCooldowns(cooldowns);
}

export function useAXISRPL(
  sessions: AXISSession[],
  anchorLastUpdatedAt?: string,
  lastSessionDate?: string
): RPLTrigger | null {
  const trigger = useMemo(() => {
    const now = Date.now();
    const cooldowns = getCooldowns();

    // Helper: check if on cooldown
    const isOnCooldown = (type: string) => {
      const cd = cooldowns.find(c => c.patternType === type);
      return cd && new Date(cd.expiresAt).getTime() > now;
    };

    // Check 0a: Time-gap long (14+ days) — near re-onboarding
    if (!isOnCooldown('time-gap-long') && lastSessionDate) {
      const daysSince = Math.floor((now - new Date(lastSessionDate).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince >= 14) {
        return {
          type: 'time-gap-long' as const,
          message: `It's been ${daysSince} days since your last session.`,
          question: 'A lot can shift in two weeks. Would it help to briefly revisit where you were before diving in?',
          cooldown: { type: 'time-gap-long', hours: 7 * 24 },
        };
      }
    }

    // Check 0b: Time-gap medium (3–13 days) — gentle surface
    if (!isOnCooldown('time-gap-medium') && lastSessionDate) {
      const daysSince = Math.floor((now - new Date(lastSessionDate).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince >= 3 && daysSince < 14) {
        return {
          type: 'time-gap-medium' as const,
          message: `It's been ${daysSince} days since your last session.`,
          question: 'Has anything shifted around your anchor in that time?',
          cooldown: { type: 'time-gap-medium', hours: 3 * 24 },
        };
      }
    }

    // Check 1: Anchor review (30 days)
    if (!isOnCooldown('anchor-review') && anchorLastUpdatedAt) {
      const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
      if (new Date(anchorLastUpdatedAt).getTime() < thirtyDaysAgo) {
        return {
          type: 'anchor-review' as const,
          message: 'Your identity anchor hasn\'t been updated in a month.',
          question: 'Would it be useful to revisit and refine it?',
          cooldown: { type: 'anchor-review', hours: 30 * 24 },
        };
      }
    }

    // Check 2: Title repetition (last 14 days, >70% similarity, 3+ times)
    if (!isOnCooldown('title-repetition') && sessions.length > 0) {
      const twoWeeksAgo = now - 14 * 24 * 60 * 60 * 1000;
      const recentSessions = sessions.filter(s =>
        new Date(s.createdAt).getTime() > twoWeeksAgo
      );

      if (recentSessions.length >= 3) {
        // Find most recent title
        const recentTitles = recentSessions.map(s => s.title);
        const latestTitle = recentTitles[recentTitles.length - 1];

        // Count similar titles (0.5 threshold to catch paraphrased patterns like "fear of failure at work" vs "workplace failure anxiety")
        const similarCount = recentTitles.filter(t =>
          jaccard(t, latestTitle) > 0.5 && t !== latestTitle
        ).length;

        if (similarCount >= 2) {
          // At least 2 other sessions similar to latest
          return {
            type: 'title-repetition' as const,
            message: `You've explored similar topics ${recentSessions.length} times in the past 2 weeks.`,
            question: 'Is today meaningfully different?',
            cooldown: { type: 'title-repetition', hours: 48 },
          };
        }
      }
    }

    // Check 3: High frequency (last 24 hours, 4+ sessions)
    if (!isOnCooldown('high-frequency') && sessions.length > 0) {
      const oneDayAgo = now - 24 * 60 * 60 * 1000;
      const recentCount = sessions.filter(s =>
        new Date(s.createdAt).getTime() > oneDayAgo
      ).length;

      if (recentCount >= 4) {
        return {
          type: 'high-frequency' as const,
          message: `You've started ${recentCount} sessions in the last 24 hours.`,
          question: 'Is this frequency serving you?',
          cooldown: { type: 'high-frequency', hours: 48 },
        };
      }
    }

    // Check 4: Open session accumulation (>7 open)
    if (!isOnCooldown('open-accumulation')) {
      const openCount = sessions.filter(s => s.status !== 'closed').length;

      if (openCount > 7) {
        return {
          type: 'open-accumulation' as const,
          message: `You have ${openCount} open sessions.`,
          question: 'Would it help to close some of these?',
          cooldown: { type: 'open-accumulation', hours: 48 },
        };
      }
    }

    return null;
  }, [sessions, anchorLastUpdatedAt, lastSessionDate]);

  // Apply cooldown in effect, not in memo
  useEffect(() => {
    if (trigger && 'cooldown' in trigger) {
      const cooldownData = (trigger as any).cooldown;
      setCooldown(cooldownData.type, cooldownData.hours);
    }
  }, [trigger]);

  // Return trigger without cooldown metadata
  if (!trigger) return null;
  const { cooldown: _, ...triggerWithoutMeta } = trigger as any;
  return triggerWithoutMeta;
}

export { setCooldown as setRPLCooldown };
