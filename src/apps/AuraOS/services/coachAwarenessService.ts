/**
 * Coach Awareness Service
 * Monitors user activity and triggers intelligent, non-annoying proactive suggestions
 */

import { AllPractice, ModuleKey } from '../types';

export interface AwarenessContext {
  currentTab: string;
  practiceStack: AllPractice[];
  completedCount: number;
  completionRate: number;
  modules: Record<ModuleKey, { name: string; count: number }>;
  sessionDuration: number; // minutes
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}

export interface InterventionScore {
  score: number; // 0-100
  reason: string;
  suggestedAction: SuggestedAction;
}

export interface SuggestedAction {
  type: 'module_balance' | 'streak_alert' | 'wizard_suggestion' | 'time_reality_check' | 'practice_discovery' | 'insight_integration' | 'milestone_celebration' | 'atmospheric_inquiry' | 'shadow_onboarding';
  message: string;
  metadata?: any;
}

export interface CoachPreferences {
  enabled: boolean;
  frequency: 'off' | 'minimal' | 'moderate' | 'frequent';
  quietHours: { start: number; end: number }; // 0-23 hours
  enabledCategories: {
    moduleBalance: boolean;
    streakAlerts: boolean;
    wizardSuggestions: boolean;
    timeRealityCheck: boolean;
    practiceDiscovery: boolean;
    insightIntegration: boolean;
    milestoneCelebration: boolean;
  };
}

interface DismissalRecord {
  type: string;
  count: number;
  lastDismissed: number; // timestamp
  suppressUntil: number; // timestamp
}

interface InterventionRecord {
  timestamp: number;
  type: string;
  acknowledged: boolean;
}

const STORAGE_KEYS = {
  DISMISSALS: 'aura-coach-dismissals',
  LAST_INTERVENTION: 'aura-coach-last-intervention',
  PREFERENCES: 'aura-coach-preferences',
  ANALYTICS: 'aura-coach-analytics',
  CELEBRATED_MILESTONES: 'aura-coach-milestones',
};

const DEFAULT_PREFERENCES: CoachPreferences = {
  enabled: true,
  frequency: 'moderate',
  quietHours: { start: 22, end: 7 },
  enabledCategories: {
    moduleBalance: true,
    streakAlerts: true,
    wizardSuggestions: true,
    timeRealityCheck: true,
    practiceDiscovery: true,
    insightIntegration: true,
    milestoneCelebration: true,
  },
};

// Anti-Annoyance Rules
const COOLDOWN_MINUTES = {
  off: Infinity,
  minimal: 30,
  moderate: 15,
  frequent: 10,
};

const DISMISSAL_THRESHOLD = 3; // Dismiss same type 3x = suppress for 7 days
const SUPPRESSION_DAYS = 7;

class CoachAwarenessService {
  private preferences: CoachPreferences;
  private dismissals: Map<string, DismissalRecord>;
  private lastIntervention: number = 0;

  constructor() {
    this.preferences = this.loadPreferences();
    this.dismissals = this.loadDismissals();
    this.lastIntervention = this.loadLastIntervention();
  }

  /**
   * Calculate intervention score based on context
   */
  calculateInterventionScore(context: AwarenessContext): InterventionScore | null {
    if (!this.preferences.enabled) {
      return null;
    }

    // Check quiet hours
    const currentHour = new Date().getHours();
    if (this.isQuietHour(currentHour)) {
      return null;
    }

    // Check cooldown
    const cooldownMs = COOLDOWN_MINUTES[this.preferences.frequency] * 60 * 1000;
    const timeSinceLastIntervention = Date.now() - this.lastIntervention;
    if (timeSinceLastIntervention < cooldownMs) {
      return null;
    }

    // Calculate scores for each scenario
    const scores: InterventionScore[] = [];

    // Module Balance Detection
    if (this.preferences.enabledCategories.moduleBalance) {
      const balanceScore = this.checkModuleBalance(context);
      if (balanceScore) scores.push(balanceScore);
    }

    // Streak Alert
    if (this.preferences.enabledCategories.streakAlerts) {
      const streakScore = this.checkStreakRisk(context);
      if (streakScore) scores.push(streakScore);
    }

    // Time Reality Check
    if (this.preferences.enabledCategories.timeRealityCheck) {
      const timeScore = this.checkTimeReality(context);
      if (timeScore) scores.push(timeScore);
    }

    // Practice Discovery (after wizard completion)
    if (this.preferences.enabledCategories.practiceDiscovery) {
      const discoveryScore = this.checkPracticeDiscovery(context);
      if (discoveryScore) scores.push(discoveryScore);
    }

    // Milestone Celebration
    if (this.preferences.enabledCategories.milestoneCelebration) {
      const milestoneScore = this.checkMilestones(context);
      if (milestoneScore) scores.push(milestoneScore);
    }

    // Shadow Onboarding (fires on shadow tab for users with few shadow sessions)
    const shadowOnboarding = this.checkShadowOnboarding(context);
    if (shadowOnboarding) scores.push(shadowOnboarding);

    // Atmospheric Inquiry (New: Spices up the experience with variety)
    // Low priority, only if nothing else is urgent
    if (scores.length === 0) {
      const atmosphere = this.checkAtmosphere(context);
      if (atmosphere) scores.push(atmosphere);
    }

    // Return highest scoring intervention that isn't suppressed
    const validScores = scores.filter(s => !this.isSuppressed(s.suggestedAction.type));
    if (validScores.length === 0) return null;

    validScores.sort((a, b) => b.score - a.score);
    
    // Threshold: 70/100 for high-importance alerts
    // Atmospheric inquiries have a score of 50, so we check if it's the only one
    const winner = validScores[0];
    if (winner.suggestedAction.type === 'atmospheric_inquiry') {
      // 5% chance to show an atmospheric inquiry every check (approx 10 mins if checking every 30s)
      return Math.random() < 0.05 ? winner : null;
    }

    return winner.score >= 70 ? winner : null;
  }

  /**
   * Direct shadow onboarding check — bypasses global cooldown.
   * Use this when the user navigates to the shadow tab for an immediate check.
   * Still respects shadow_onboarding-specific dismissal suppression.
   */
  getDirectShadowOnboarding(): { message: string; type: 'shadow_onboarding' } | null {
    if (this.isSuppressed('shadow_onboarding')) return null;
    return this.buildShadowOnboardingResult();
  }

  /**
   * Check if user is a shadow-work newbie visiting the shadow tab
   * Fires a path recommendation when total shadow sessions < 3
   */
  private checkShadowOnboarding(context: AwarenessContext): InterventionScore | null {
    if (context.currentTab !== 'shadow-tools') return null;
    const result = this.buildShadowOnboardingResult();
    if (!result) return null;
    const isNewbie = (JSON.parse(localStorage.getItem('history321') || '[]') as unknown[]).length +
      (JSON.parse(localStorage.getItem('historyIFS') || '[]') as unknown[]).length +
      (JSON.parse(localStorage.getItem('historyBigMind') || '[]') as unknown[]).length === 0;
    return {
      score: isNewbie ? 88 : 80,
      reason: isNewbie ? 'No shadow sessions — new to shadow tab' : 'Early-stage shadow practitioner',
      suggestedAction: {
        type: 'shadow_onboarding',
        message: result.message,
        metadata: { module: 'shadow' },
      },
    };
  }

  /**
   * Shared logic for building the shadow onboarding message
   */
  private buildShadowOnboardingResult(): { message: string; type: 'shadow_onboarding' } | null {
    try {
      const count321 = (JSON.parse(localStorage.getItem('history321') || '[]') as unknown[]).length;
      const countIFS = (JSON.parse(localStorage.getItem('historyIFS') || '[]') as unknown[]).length;
      const countBigMind = (JSON.parse(localStorage.getItem('historyBigMind') || '[]') as unknown[]).length;
      const total = count321 + countIFS + countBigMind;

      if (total === 0) {
        return {
          type: 'shadow_onboarding',
          message: "Shadow work is where most people avoid looking — and where the biggest leverage hides. A good path: start with 3-2-1 (gentlest entry, 10 min), then try IFS when you're ready to meet specific parts of yourself, then Shadow Journaling for longer integration. Each one builds on the last.",
        };
      }

      if (total < 3) {
        const nextStep = count321 === 0 ? '3-2-1' : countIFS === 0 ? 'IFS' : 'Shadow Journaling';
        return {
          type: 'shadow_onboarding',
          message: `You've started. Shadow work compounds — each session makes the next one easier. The next step on the path is ${nextStep}. Consistency matters more than depth at this stage.`,
        };
      }
    } catch {
      // ignore localStorage parse errors
    }
    return null;
  }

  /**
   * Check for atmospheric inquiries (conversational fluff/probes)
   */
  private checkAtmosphere(context: AwarenessContext): InterventionScore | null {
    const inquiries: Array<{ module?: ModuleKey; text: string; tab?: string[] }> = [
      // --- Serious Probes ---
      { text: "Notice any tension in your jaw? Let it release.", module: 'body' },
      { text: "What disowned quality did you notice in someone else today?", module: 'shadow' },
      { text: "Is there a sense of spaciousness behind your thoughts?", module: 'spirit' },
      { text: "Which quadrant feels most neglected right now?", tab: ['dashboard', 'aqal'] },
      { text: "Is your inner critic quiet today, or just hiding?", module: 'shadow' },
      { text: "Who is the one observing these thoughts?", module: 'spirit' },
      
      // --- Light / Playful ---
      { text: "Still human? Good. Just checking." },
      { text: "Remember to drink some water. Biological units need fuel." },
      { text: "A 1% shift is still a shift. Don't overthink it." },
      { text: "You're doing better than your mind tells you you are." },
      { text: "Take a deep breath. Yes, right now." },
      
      // --- Pithy Quotes & Zen ---
      { text: "Be here now. (Ram Dass)" },
      { text: "Chop wood, carry water." },
      { text: "The obstacle is the way." },
      { text: "Look within." },
      { text: "Rest is a practice." },
      { text: "Everything changes." },
      { text: "No mud, no lotus." },
      { text: "Silence is also an answer." },
      { text: "One breath at a time." },
      
      // --- Contextual ---
      { text: "The field is active. Ready to dive back in?", tab: ['dashboard'] },
      { text: "Does this stack still reflect your highest values?", tab: ['stack'] },
      { text: "Patterns are emerging. Can you see the thread?", tab: ['insights'] }
    ];

    // Filter by current tab if applicable
    const relevantInquiries = inquiries.filter(i => 
      !i.tab || i.tab.includes(context.currentTab)
    );

    const pick = relevantInquiries[Math.floor(Math.random() * relevantInquiries.length)];

    return {
      score: 50, // Low priority
      reason: 'Atmospheric engagement',
      suggestedAction: {
        type: 'atmospheric_inquiry',
        message: pick.text,
        metadata: { module: pick.module },
      },
    };
  }

  /**
   * Check for module imbalance
   */
  private checkModuleBalance(context: AwarenessContext): InterventionScore | null {
    const { modules, currentTab } = context;

    // Only trigger on Stack or Dashboard
    if (currentTab !== 'stack' && currentTab !== 'dashboard') {
      return null;
    }

    const counts = {
      body: modules.body?.count || 0,
      mind: modules.mind?.count || 0,
      spirit: modules.spirit?.count || 0,
      shadow: modules.shadow?.count || 0,
    };

    const total = counts.body + counts.mind + counts.spirit + counts.shadow;
    if (total === 0) return null;

    const percentages = {
      body: (counts.body / total) * 100,
      mind: (counts.mind / total) * 100,
      spirit: (counts.spirit / total) * 100,
      shadow: (counts.shadow / total) * 100,
    };

    // Detect severe imbalance (>75% in one module, <10% in another)
    const maxPercent = Math.max(...Object.values(percentages));
    const minPercent = Math.min(...Object.values(percentages));

    if (maxPercent > 75 && minPercent < 10) {
      const dominantModule = Object.entries(percentages).find(([_, pct]) => pct === maxPercent)?.[0];
      const lackingModule = Object.entries(percentages).find(([_, pct]) => pct === minPercent)?.[0];

      let suggestion = '';
      if (lackingModule === 'shadow') {
        suggestion = `Your stack is ${maxPercent.toFixed(0)}% ${dominantModule}. Shadow work could unlock deeper growth—try Bias Detective?`;
      } else if (lackingModule === 'spirit') {
        suggestion = `Heavy on ${dominantModule} (${maxPercent.toFixed(0)}%). Spirit practices add meaning—explore Jhana or meditation?`;
      } else if (lackingModule === 'body') {
        suggestion = `Lots of ${dominantModule}, but body needs love too. Even 10 min of movement makes a difference.`;
      } else {
        suggestion = `Your stack is ${maxPercent.toFixed(0)}% ${dominantModule}. Add some ${lackingModule} practices for balance?`;
      }

      return {
        score: 85,
        reason: `Module imbalance: ${maxPercent.toFixed(0)}% ${dominantModule}, ${minPercent.toFixed(0)}% ${lackingModule}`,
        suggestedAction: {
          type: 'module_balance',
          message: suggestion,
          metadata: { dominantModule, lackingModule, percentages },
        },
      };
    }

    return null;
  }

  /**
   * Check for streak risk (evening, incomplete practices with active streaks)
   */
  private checkStreakRisk(context: AwarenessContext): InterventionScore | null {
    const { timeOfDay, completedCount, practiceStack } = context;

    // Only trigger in evening
    if (timeOfDay !== 'evening') return null;

    // Check if user has incomplete practices
    const incompleteCount = practiceStack.length - completedCount;
    if (incompleteCount === 0) return null;

    // Check localStorage for active streaks
    const streaksData = this.getStreaksData();
    const practicesWithStreaks = practiceStack.filter(p => {
      const streak = streaksData[p.id] || 0;
      return streak >= 5; // 5+ day streaks
    });

    const incompleteWithStreaks = practicesWithStreaks.length - completedCount;

    if (incompleteWithStreaks > 0) {
      const longestStreak = Math.max(...practicesWithStreaks.map(p => streaksData[p.id] || 0));
      const practiceName = practicesWithStreaks[0]?.name || 'your practice';

      return {
        score: 80,
        reason: `Evening + ${incompleteWithStreaks} incomplete practices with active streaks`,
        suggestedAction: {
          type: 'streak_alert',
          message: `Your ${practiceName} streak (${longestStreak} days) is at risk. Quick session before bed?`,
          metadata: { incompleteWithStreaks, longestStreak },
        },
      };
    }

    return null;
  }

  /**
   * Check for unrealistic time commitments
   */
  private checkTimeReality(context: AwarenessContext): InterventionScore | null {
    const { practiceStack, completionRate, currentTab } = context;

    // Only trigger on Stack tab
    if (currentTab !== 'stack') return null;

    // Calculate total time commitment
    const totalTimePerWeek = practiceStack.reduce((sum, p) => sum + (p.timePerWeek || 0), 0);

    // If commitment is high but completion is low
    if (totalTimePerWeek >= 15 && completionRate < 40) {
      return {
        score: 75,
        reason: `High time commitment (${totalTimePerWeek}h/week) with low completion (${completionRate}%)`,
        suggestedAction: {
          type: 'time_reality_check',
          message: `Your stack needs ${totalTimePerWeek}hrs/week but you're hitting ${completionRate}%. Trim to practices you'll actually do?`,
          metadata: { totalTimePerWeek, completionRate },
        },
      };
    }

    return null;
  }

  /**
   * Check for practice discovery opportunities (after wizard completion)
   */
  private checkPracticeDiscovery(context: AwarenessContext): InterventionScore | null {
    try {
      const recentWizards = this.getRecentWizardCompletions();
      if (recentWizards.length === 0) return null;

      const latestWizard = recentWizards[0];
      const suggestions = this.mapWizardToPractices(latestWizard.type);

      // Filter out practices already in stack
      const newSuggestions = suggestions.filter(practiceId =>
        !context.practiceStack.some(p => p.id === practiceId)
      );

      if (newSuggestions.length === 0) return null;

      const topSuggestion = newSuggestions[0];

      return {
        score: 85,
        reason: `Completed ${latestWizard.type}, suggesting related practice`,
        suggestedAction: {
          type: 'practice_discovery',
          message: `You just completed ${latestWizard.type}. Consider adding ${topSuggestion} to your stack—it builds on that insight.`,
          metadata: {
            practiceId: topSuggestion,
            wizardType: latestWizard.type,
          },
        },
      };
    } catch (err) {
      console.error('[Coach Awareness] Practice discovery check failed:', err);
      return null;
    }
  }

  /**
   * Get recent wizard completions from localStorage
   * Checks within the last 24 hours
   */
  private getRecentWizardCompletions(): Array<{ type: string; date: string; timestamp: number }> {
    const sessions: Array<{ type: string; date: string; timestamp: number }> = [];
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

    try {
      // Check 3-2-1 Process
      const threeTwoOne = JSON.parse(localStorage.getItem('history321') || '[]');
      if (Array.isArray(threeTwoOne) && threeTwoOne.length > 0) {
        const latest = threeTwoOne[threeTwoOne.length - 1];
        const timestamp = new Date(latest.date).getTime();
        if (timestamp > oneDayAgo) {
          sessions.push({ type: '3-2-1 Reflection', date: latest.date, timestamp });
        }
      }

      // Check IFS
      const ifs = JSON.parse(localStorage.getItem('historyIFS') || '[]');
      if (Array.isArray(ifs) && ifs.length > 0) {
        const latest = ifs[ifs.length - 1];
        const timestamp = new Date(latest.date).getTime();
        if (timestamp > oneDayAgo) {
          sessions.push({ type: 'IFS Session', date: latest.date, timestamp });
        }
      }

      // Check Kegan Assessment
      const kegan = JSON.parse(localStorage.getItem('historyKegan') || '[]');
      if (Array.isArray(kegan) && kegan.length > 0) {
        const latest = kegan[kegan.length - 1];
        const timestamp = new Date(latest.date).getTime();
        if (timestamp > oneDayAgo) {
          sessions.push({ type: 'Kegan Assessment', date: latest.date, timestamp });
        }
      }

      // Check Bias Detective
      const biasDetective = JSON.parse(localStorage.getItem('historyBiasDetective') || '[]');
      if (Array.isArray(biasDetective) && biasDetective.length > 0) {
        const latest = biasDetective[biasDetective.length - 1];
        const timestamp = new Date(latest.date).getTime();
        if (timestamp > oneDayAgo) {
          sessions.push({ type: 'Bias Detective', date: latest.date, timestamp });
        }
      }

      // Check Jhana Tracker
      const jhana = JSON.parse(localStorage.getItem('jhanaHistory') || '[]');
      if (Array.isArray(jhana) && jhana.length > 0) {
        const latest = jhana[jhana.length - 1];
        const timestamp = latest.timestamp || new Date(latest.date).getTime();
        if (timestamp > oneDayAgo) {
          sessions.push({ type: 'Jhana Tracker', date: latest.date, timestamp });
        }
      }
    } catch (err) {
      console.error('[Coach Awareness] Error reading wizard history:', err);
    }

    // Sort by timestamp (most recent first)
    return sessions.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Map wizard types to recommended practice IDs
   */
  private mapWizardToPractices(wizardType: string): string[] {
    const wizardToPracticeMap: Record<string, string[]> = {
      '3-2-1 Reflection': ['meditation', 'journaling', 'shadow-work', 'self-inquiry'],
      'IFS Session': ['parts-work', 'meditation', 'self-compassion', 'inner-dialogue'],
      'Bias Detective': ['perspective-taking', 'journaling', 'cognitive-reframing'],
      'Kegan Assessment': ['developmental-reading', 'reflection', 'metacognition'],
      'Jhana Tracker': ['meditation', 'breathwork', 'mindfulness', 'concentration-practice'],
      'Bioenergetics': ['body-scan', 'somatic-work', 'breathwork', 'yoga'],
      'Body Architect': ['strength-training', 'mobility-work', 'cardio', 'flexibility'],
      'Workout Architect': ['strength-training', 'cardio', 'HIIT', 'functional-fitness'],
      'Attachment Assessment': ['relational-inquiry', 'self-compassion', 'emotional-regulation'],
    };

    return wizardToPracticeMap[wizardType] || [];
  }

  /**
   * Check for milestone celebrations
   * Uses >= instead of === to catch milestones even if app not opened on exact day
   * Tracks celebrated milestones to ensure each is only celebrated once
   */
  private checkMilestones(context: AwarenessContext): InterventionScore | null {
    const { practiceStack } = context;
    const streaksData = this.getStreaksData();
    const celebratedMilestones = this.getCelebratedMilestones();

    // Define milestone thresholds
    const milestones = [
      { threshold: 100, emoji: '🔥', message: (name: string) => `🔥 100 DAYS of ${name}! You're in the top 1% of practitioners. Legendary.`, score: 95 },
      { threshold: 30, emoji: '🎉', message: (name: string) => `🎉 30 days of ${name}! Your brain is rewiring. This is real transformation.`, score: 90 },
      { threshold: 7, emoji: '⭐', message: (name: string) => `⭐ 7 days of ${name}! You're building momentum. Keep it going.`, score: 85 },
    ];

    // Check each milestone (highest to lowest)
    for (const milestone of milestones) {
      const eligiblePractices = practiceStack.filter(p => {
        const streak = streaksData[p.id] || 0;
        const milestoneKey = `${p.id}-${milestone.threshold}`;
        const alreadyCelebrated = celebratedMilestones.has(milestoneKey);

        // Practice has reached milestone AND we haven't celebrated it yet
        return streak >= milestone.threshold && !alreadyCelebrated;
      });

      if (eligiblePractices.length > 0) {
        const practice = eligiblePractices[0];
        const practiceName = practice.name;
        const milestoneKey = `${practice.id}-${milestone.threshold}`;

        // Mark this milestone as celebrated
        this.recordMilestoneCelebration(milestoneKey);

        return {
          score: milestone.score,
          reason: `${milestone.threshold}-day streak milestone achieved`,
          suggestedAction: {
            type: 'milestone_celebration',
            message: milestone.message(practiceName),
            metadata: { practiceName, milestone: milestone.threshold, practiceId: practice.id },
          },
        };
      }
    }

    return null;
  }

  /**
   * Record dismissal of a suggestion
   */
  recordDismissal(type: string): void {
    const record = this.dismissals.get(type) || {
      type,
      count: 0,
      lastDismissed: Date.now(),
      suppressUntil: 0,
    };

    record.count += 1;
    record.lastDismissed = Date.now();

    // If dismissed 3+ times, suppress for 7 days
    if (record.count >= DISMISSAL_THRESHOLD) {
      record.suppressUntil = Date.now() + SUPPRESSION_DAYS * 24 * 60 * 60 * 1000;
    }

    this.dismissals.set(type, record);
    this.saveDismissals();
  }

  /**
   * Record intervention (for cooldown tracking)
   */
  recordIntervention(type: string, acknowledged: boolean): void {
    this.lastIntervention = Date.now();
    this.saveLastIntervention();

    // Analytics
    const analytics = this.loadAnalytics();
    analytics.push({
      timestamp: Date.now(),
      type,
      acknowledged,
    });
    this.saveAnalytics(analytics);
  }

  /**
   * Check if suggestion type is currently suppressed
   */
  private isSuppressed(type: string): boolean {
    const record = this.dismissals.get(type);
    if (!record) return false;

    return Date.now() < record.suppressUntil;
  }

  /**
   * Check if current hour is in quiet hours
   */
  private isQuietHour(hour: number): boolean {
    const { start, end } = this.preferences.quietHours;

    if (start < end) {
      return hour >= start && hour < end;
    } else {
      // Handles overnight quiet hours (e.g., 22-7)
      return hour >= start || hour < end;
    }
  }

  /**
   * Get streaks data from localStorage
   */
  private getStreaksData(): Record<string, number> {
    try {
      const data = localStorage.getItem('aura-streaks');
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  /**
   * Get celebrated milestones from localStorage
   * Format: Set of "practiceId-threshold" keys (e.g., "meditation-30", "exercise-100")
   */
  private getCelebratedMilestones(): Set<string> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CELEBRATED_MILESTONES);
      if (!data) return new Set();
      const array = JSON.parse(data);
      return new Set(array);
    } catch {
      return new Set();
    }
  }

  /**
   * Record a milestone celebration
   */
  private recordMilestoneCelebration(milestoneKey: string): void {
    const milestones = this.getCelebratedMilestones();
    milestones.add(milestoneKey);
    this.saveCelebratedMilestones(milestones);
  }

  /**
   * Save celebrated milestones to localStorage
   */
  private saveCelebratedMilestones(milestones: Set<string>): void {
    const array = Array.from(milestones);
    localStorage.setItem(STORAGE_KEYS.CELEBRATED_MILESTONES, JSON.stringify(array));
  }

  /**
   * Preferences Management
   */
  getPreferences(): CoachPreferences {
    return { ...this.preferences };
  }

  updatePreferences(updates: Partial<CoachPreferences>): void {
    this.preferences = { ...this.preferences, ...updates };
    this.savePreferences();
  }

  private loadPreferences(): CoachPreferences {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      return stored ? { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) } : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  }

  private savePreferences(): void {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(this.preferences));
  }

  /**
   * Dismissals Management
   */
  private loadDismissals(): Map<string, DismissalRecord> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DISMISSALS);
      if (!stored) return new Map();

      const data = JSON.parse(stored);
      return new Map(Object.entries(data));
    } catch {
      return new Map();
    }
  }

  private saveDismissals(): void {
    const data = Object.fromEntries(this.dismissals);
    localStorage.setItem(STORAGE_KEYS.DISMISSALS, JSON.stringify(data));
  }

  /**
   * Intervention Tracking
   */
  private loadLastIntervention(): number {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LAST_INTERVENTION);
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  }

  private saveLastIntervention(): void {
    localStorage.setItem(STORAGE_KEYS.LAST_INTERVENTION, this.lastIntervention.toString());
  }

  /**
   * Analytics
   */
  private loadAnalytics(): InterventionRecord[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ANALYTICS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveAnalytics(analytics: InterventionRecord[]): void {
    // Keep only last 100 records
    const trimmed = analytics.slice(-100);
    localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(trimmed));
  }

  /**
   * Get analytics summary
   */
  getAnalyticsSummary(): {
    totalInterventions: number;
    acknowledgmentRate: number;
    byType: Record<string, { shown: number; acknowledged: number }>;
  } {
    const analytics = this.loadAnalytics();

    const byType: Record<string, { shown: number; acknowledged: number }> = {};

    analytics.forEach(record => {
      if (!byType[record.type]) {
        byType[record.type] = { shown: 0, acknowledged: 0 };
      }
      byType[record.type].shown += 1;
      if (record.acknowledged) {
        byType[record.type].acknowledged += 1;
      }
    });

    const totalAcknowledged = analytics.filter(r => r.acknowledged).length;
    const acknowledgmentRate = analytics.length > 0 ? totalAcknowledged / analytics.length : 0;

    return {
      totalInterventions: analytics.length,
      acknowledgmentRate,
      byType,
    };
  }
}

// Singleton instance
export const coachAwarenessService = new CoachAwarenessService();
