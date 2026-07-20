/**
 * Somatic Cartography — constants
 * Zones, storage keys, quality tags, and safety thresholds.
 */

// ---------------------------------------------------------------------------
// Storage keys
// ---------------------------------------------------------------------------

export const CHECKIN_DRAFT_KEY = 'aura-draft-somatic-cartography-checkin';
export const INQUIRY_DRAFT_KEY = 'aura-draft-somatic-cartography-inquiry';
export const SAFETY_PROFILE_KEY = 'aura-somatic-safety-profile';
export const HISTORY_KEY = 'aura-somaticBodyMapHistory';

// ---------------------------------------------------------------------------
// Body zone taxonomy — 28 named zones, used everywhere (check-in, journal, inquiry)
// ---------------------------------------------------------------------------

export const BODY_ZONES = [
  // Head / neck
  'forehead',
  'temples_L',
  'temples_R',
  'jaw',
  'throat',
  'neck_front',
  'neck_back',
  // Shoulders / upper back
  'L_shoulder',
  'R_shoulder',
  'upper_back_C',
  'L_shoulder_blade',
  'R_shoulder_blade',
  // Chest / core
  'chest_L',
  'chest_R',
  'chest_C',
  'solar_plexus',
  'belly',
  'lower_back',
  // Hips / legs
  'L_hip',
  'R_hip',
  'L_thigh',
  'R_thigh',
  'L_knee',
  'R_knee',
  'L_calf',
  'R_calf',
  'L_foot',
  'R_foot',
] as const;

export type SomaticBodyZone = (typeof BODY_ZONES)[number];

// Human-readable labels
export const ZONE_LABELS: Record<SomaticBodyZone, string> = {
  forehead: 'Forehead',
  temples_L: 'Left Temple',
  temples_R: 'Right Temple',
  jaw: 'Jaw',
  throat: 'Throat',
  neck_front: 'Front of Neck',
  neck_back: 'Back of Neck',
  L_shoulder: 'Left Shoulder',
  R_shoulder: 'Right Shoulder',
  upper_back_C: 'Upper Back (center)',
  L_shoulder_blade: 'Left Shoulder Blade',
  R_shoulder_blade: 'Right Shoulder Blade',
  chest_L: 'Left Chest',
  chest_R: 'Right Chest',
  chest_C: 'Center Chest',
  solar_plexus: 'Solar Plexus',
  belly: 'Belly',
  lower_back: 'Lower Back',
  L_hip: 'Left Hip',
  R_hip: 'Right Hip',
  L_thigh: 'Left Thigh',
  R_thigh: 'Right Thigh',
  L_knee: 'Left Knee',
  R_knee: 'Right Knee',
  L_calf: 'Left Calf',
  R_calf: 'Right Calf',
  L_foot: 'Left Foot',
  R_foot: 'Right Foot',
};

// Zone groups for text-list alternative
export const ZONE_GROUPS: Array<{ label: string; zones: SomaticBodyZone[] }> = [
  {
    label: 'Head & Neck',
    zones: ['forehead', 'temples_L', 'temples_R', 'jaw', 'throat', 'neck_front', 'neck_back'],
  },
  {
    label: 'Shoulders & Upper Back',
    zones: ['L_shoulder', 'R_shoulder', 'upper_back_C', 'L_shoulder_blade', 'R_shoulder_blade'],
  },
  {
    label: 'Chest, Core & Lower Back',
    zones: ['chest_L', 'chest_R', 'chest_C', 'solar_plexus', 'belly', 'lower_back'],
  },
  {
    label: 'Hips & Legs',
    zones: ['L_hip', 'R_hip', 'L_thigh', 'R_thigh', 'L_knee', 'R_knee', 'L_calf', 'R_calf', 'L_foot', 'R_foot'],
  },
];

// SVG coordinates for each zone (cx/cy as % of 120×240 viewBox)
export const ZONE_SVG_COORDS: Record<SomaticBodyZone, { cx: number; cy: number }> = {
  forehead:         { cx: 60,  cy: 12  },
  temples_L:        { cx: 44,  cy: 14  },
  temples_R:        { cx: 76,  cy: 14  },
  jaw:              { cx: 60,  cy: 22  },
  throat:           { cx: 60,  cy: 32  },
  neck_front:       { cx: 60,  cy: 38  },
  neck_back:        { cx: 60,  cy: 36  },
  L_shoulder:       { cx: 38,  cy: 52  },
  R_shoulder:       { cx: 82,  cy: 52  },
  upper_back_C:     { cx: 60,  cy: 55  },
  L_shoulder_blade: { cx: 40,  cy: 62  },
  R_shoulder_blade: { cx: 80,  cy: 62  },
  chest_L:          { cx: 48,  cy: 68  },
  chest_R:          { cx: 72,  cy: 68  },
  chest_C:          { cx: 60,  cy: 68  },
  solar_plexus:     { cx: 60,  cy: 80  },
  belly:            { cx: 60,  cy: 92  },
  lower_back:       { cx: 60,  cy: 100 },
  L_hip:            { cx: 46,  cy: 112 },
  R_hip:            { cx: 74,  cy: 112 },
  L_thigh:          { cx: 46,  cy: 132 },
  R_thigh:          { cx: 74,  cy: 132 },
  L_knee:           { cx: 46,  cy: 155 },
  R_knee:           { cx: 74,  cy: 155 },
  L_calf:           { cx: 46,  cy: 175 },
  R_calf:           { cx: 74,  cy: 175 },
  L_foot:           { cx: 46,  cy: 200 },
  R_foot:           { cx: 74,  cy: 200 },
};

// ---------------------------------------------------------------------------
// Quality tags and context tags
// ---------------------------------------------------------------------------

export const QUALITY_TAGS = [
  'tight', 'loose', 'warm', 'cool', 'tingling', 'numb', 'achy',
  'pulsing', 'heavy', 'light', 'sharp', 'dull', 'buzzing', 'constricted', 'open',
] as const;

export const DEPTH_OPTIONS = [
  { value: 'surface',  label: 'Surface' },
  { value: 'deep',     label: 'Deep' },
  { value: 'both',     label: 'Both' },
  { value: 'diffuse',  label: 'Diffuse' },
  { value: 'unclear',  label: 'Unclear' },
] as const;

export const CONTEXT_TAGS = [
  'morning', 'evening', 'post-work', 'post-exercise', 'after-eating',
  'before-sleep', 'after-conflict', 'during-stress', 'after-meditation',
  'social-situation', 'solo', 'other',
] as const;

export const POST_SESSION_STATES = [
  { value: 'settled',      label: 'Settled',       description: 'Calm, grounded' },
  { value: 'energized',    label: 'Energized',      description: 'Alert, present' },
  { value: 'neutral',      label: 'Neutral',        description: 'No strong quality' },
  { value: 'stirred_up',   label: 'Stirred up',     description: 'Activated, unsettled' },
  { value: 'foggy',        label: 'Foggy',          description: 'Unclear, heavy' },
  { value: 'disconnected', label: 'Disconnected',   description: 'Away from body' },
] as const;

export const ADVERSE_STATES: ReadonlyArray<string> = ['stirred_up', 'foggy', 'disconnected'];

// ---------------------------------------------------------------------------
// Timings and safety thresholds
// ---------------------------------------------------------------------------

/** 48-hour cooldown between inquiry sessions (ms) */
export const INQUIRY_COOLDOWN_MS = 48 * 60 * 60 * 1000;

/** How many recent sessions to scan for adverse flags */
export const ADVERSE_WINDOW_COUNT = 5;

/** How many adverse flags in ADVERSE_WINDOW_COUNT sessions trigger wellbeing conversation */
export const ADVERSE_TRIGGER_COUNT = 2;

/** How many dismissed wellbeing conversations before inquiry auto-pauses */
export const DISMISS_PAUSE_THRESHOLD = 3;

/** Max history entries kept in localStorage */
export const MAX_HISTORY_ENTRIES = 75;

/** Min check-ins before insight generation is attempted */
export const MIN_CHECKINS_FOR_INSIGHT = 5;

/** Hold duration (ms) for "Come Back" button in offline timer */
export const COME_BACK_HOLD_MS = 1000;

// ---------------------------------------------------------------------------
// Inquiry prompts (≤15 words, memorizable, indexed by zone)
// ---------------------------------------------------------------------------

export const INQUIRY_PROMPTS: Partial<Record<SomaticBodyZone, string>> & { default: string } = {
  jaw:          'Where exactly does it start? Let it be exactly as it is.',
  throat:       'Feel the edges of it. Is there movement, or stillness?',
  L_shoulder:   'Direct your attention there. What is the texture of this?',
  R_shoulder:   'Direct your attention there. What is the texture of this?',
  chest_C:      'Stay inside it. What is the very center of this sensation?',
  solar_plexus: 'Breathe toward it gently. What happens when you simply notice?',
  belly:        'Place awareness there. What does it want you to know?',
  lower_back:   'Feel it from the inside. What quality is present right now?',
  default:      'Direct your attention there. Feel it from the inside.',
};
