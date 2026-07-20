/**
 * Somatic Cartography — local TypeScript interfaces
 */

import type { SomaticBodyZone } from './constants';

// ---------------------------------------------------------------------------
// Internal screen routing
// ---------------------------------------------------------------------------

export type SomaticScreen =
  | 'HOME'
  | 'ONBOARDING'
  | 'CHECKIN'
  | 'INQUIRY'
  | 'JOURNAL'
  | 'SETTINGS'
  | 'GROUNDING'
  | 'SUPPORT';

// ---------------------------------------------------------------------------
// Silhouette preference
// ---------------------------------------------------------------------------

export type SilhouettePreference = 'front_back' | 'front_only' | 'text_list';

// ---------------------------------------------------------------------------
// Post-session state
// ---------------------------------------------------------------------------

export type PostSessionState =
  | 'settled'
  | 'energized'
  | 'neutral'
  | 'stirred_up'
  | 'foggy'
  | 'disconnected';

// ---------------------------------------------------------------------------
// Zone mark (one marked area on the body map)
// ---------------------------------------------------------------------------

export interface ZoneMark {
  zone: SomaticBodyZone | string;
  intensity: 1 | 2 | 3 | 4 | 5;
  depth: 'surface' | 'deep' | 'both' | 'diffuse' | 'unclear';
  qualities: string[];
  note?: string;
}

// ---------------------------------------------------------------------------
// Check-in draft (C1–C4, persisted to localStorage during flow)
// ---------------------------------------------------------------------------

export type CheckInStep = 'C1' | 'C2' | 'C3' | 'C4';

export interface CheckInDraft {
  sessionId: string;
  startedAt: string;
  step: CheckInStep;
  contextTags: string[];
  marks: ZoneMark[];
  nothingNotable: boolean;
  overallIntensity?: number;
  freeText?: string;
  postSessionState?: PostSessionState;
}

// ---------------------------------------------------------------------------
// Completed check-in history entry
// ---------------------------------------------------------------------------

export interface BodyMapHistoryEntry {
  id: string;
  completedAt: string;
  contextTags: string[];
  marks: ZoneMark[];
  nothingNotable: boolean;
  overallIntensity?: number;
  freeText?: string;
  postSessionState?: PostSessionState;
  linkedInsightId?: string;
}

// ---------------------------------------------------------------------------
// Inquiry draft (I1–I3, persisted across app close so timer survives)
// ---------------------------------------------------------------------------

export type InquiryStep = 'I1' | 'I2' | 'I3' | 'POST_STATE';

export interface InquiryDraft {
  sessionId: string;
  startedAt: string;
  step: InquiryStep;
  anchorZone?: string;
  /** ISO timestamp when offline period began — source of truth for timer */
  offlineStartAt?: string;
  offlineDurationMs?: number;
  offlineReturnAt?: string;
  i1Notes?: string;
  i2ObservationNotes?: string;
  i3IntegrationNotes?: string;
  completedHere: boolean;
  postSessionState?: PostSessionState;
}

// ---------------------------------------------------------------------------
// Safety / access profile
// ---------------------------------------------------------------------------

export type AccessLevel = 'standard' | 'inquiry_paused' | 'support_referred';

export interface SafetyProfile {
  userId: string;
  accessLevel: AccessLevel;
  onboardingCompletedAt?: string;
  silhouettePreference: SilhouettePreference;
  aiEnabled: boolean;
  /** ISO timestamps of sessions flagged adverse (stirred_up / foggy / disconnected) */
  adverseSessionFlags: string[];
  /** How many times user dismissed the WellbeingConversation screen */
  inquiryDismissCount: number;
  lastInquiryAt?: string;
  screeningAnswers?: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Pattern journal zone stats (derived from history, not stored)
// ---------------------------------------------------------------------------

export interface ZoneStats {
  zone: string;
  label: string;
  count: number;
  avgIntensity: number;
  commonQualities: string[];
  commonContextTags: string[];
}

// ---------------------------------------------------------------------------
// Word frequency item (for pattern journal)
// ---------------------------------------------------------------------------

export interface WordFrequencyItem {
  word: string;
  count: number;
}
