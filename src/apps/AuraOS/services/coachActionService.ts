/**
 * Coach Action Service
 * Detects actionable intents in Coach responses and executes app actions
 * Enables Coach to control the webapp (navigation, unlocks, practice management)
 */

import Fuse from 'fuse.js';
import { practices } from '../constants';
import type { AllPractice } from '../types';

export interface CoachAction {
  type:
    | 'UNLOCK_FLABBERGASTER'
    | 'NAVIGATE_TO_TAB'
    | 'ADD_PRACTICE'
    | 'OPEN_WIZARD'
    | 'LOG_COMPLETION'
    | 'UNLOCK_ACHIEVEMENT'
    | 'SHOW_CELEBRATION';
  payload?: any;
  message?: string; // Optional message to show after action
}

export interface ActionDetectionResult {
  hasAction: boolean;
  action?: CoachAction;
  cleanedResponse: string; // Response with action markers removed
}

/**
 * Parse Coach response for action markers
 * Format: [ACTION:TYPE:payload]
 * Example: [ACTION:UNLOCK_FLABBERGASTER]
 * Example: [ACTION:ADD_PRACTICE:meditation]
 * Example: [ACTION:NAVIGATE_TO_TAB:shadow-tools]
 */
export function parseCoachActions(responseText: string): ActionDetectionResult {
  const actionRegex = /\[ACTION:([A-Z_]+)(?::([^\]]+))?\]/g;
  const matches = [...responseText.matchAll(actionRegex)];

  if (matches.length === 0) {
    return {
      hasAction: false,
      cleanedResponse: responseText,
    };
  }

  // Take first action found
  const [fullMatch, actionType, payload] = matches[0];

  const action: CoachAction = {
    type: actionType as CoachAction['type'],
    payload: payload ? parsePayload(payload) : undefined,
  };

  // Remove action markers from response
  const cleanedResponse = responseText.replace(actionRegex, '').trim();

  return {
    hasAction: true,
    action,
    cleanedResponse,
  };
}

/**
 * Parse payload string into appropriate type
 */
function parsePayload(payload: string): any {
  // Try JSON parse first
  try {
    return JSON.parse(payload);
  } catch {
    // Return as string if not JSON
    return payload;
  }
}

/**
 * Detect easter egg keywords in user messages
 * This allows triggering actions based on what user says, not just Coach responses
 */
export interface KeywordDetection {
  keyword: string;
  action: CoachAction;
  response: string; // What Coach should say
}

const EASTER_EGG_KEYWORDS: KeywordDetection[] = [
  {
    keyword: 'flabbergaster',
    action: { type: 'UNLOCK_FLABBERGASTER' },
    response: "Ahh, you speak the ancient word! 🗝️ The Flabbergaster Portal has been unlocked. A mystical realm of secrets awaits you in the sidebar. Go forth, curious seeker!",
  },
  {
    keyword: 'prismatic flux',
    action: { type: 'UNLOCK_FLABBERGASTER' },
    response: "🌈 The Prismatic Flux awakens! You've discovered the hidden mode. The Flabbergaster Portal is now accessible—a space where consciousness bends and reality plays.",
  },
  {
    keyword: 'cosmic curiosity',
    action: { type: 'UNLOCK_FLABBERGASTER' },
    response: "Your cosmic curiosity has unlocked something special... ✨ The Flabbergaster Portal manifests. Check the sidebar for the key icon.",
  },
  {
    keyword: 'secret garden',
    action: { type: 'UNLOCK_FLABBERGASTER' },
    response: "🌸 Welcome to the Secret Garden, where hidden features bloom. The Flabbergaster Portal has opened for you.",
  },
  {
    keyword: 'konami code',
    action: { type: 'UNLOCK_ACHIEVEMENT', payload: 'gamer' },
    response: "↑↑↓↓←→←→BA! You're a legend. Achievement unlocked: OG Gamer. Nothing else happens though, this isn't that kind of app. 😎",
  },
];

/**
 * Check if user message contains easter egg keywords
 */
export function detectEasterEggKeyword(userMessage: string): KeywordDetection | null {
  const lowerMessage = userMessage.toLowerCase();

  for (const detection of EASTER_EGG_KEYWORDS) {
    if (lowerMessage.includes(detection.keyword.toLowerCase())) {
      return detection;
    }
  }

  return null;
}

/**
 * Enhance Coach system prompt with action capabilities
 */
export function getActionAwareSystemPrompt(): string {
  return `
You can trigger app actions by including action markers in your response:

**Available Actions:**
[ACTION:UNLOCK_FLABBERGASTER] - Unlock the secret Flabbergaster Portal (easter egg)
[ACTION:NAVIGATE_TO_TAB:tabName] - Navigate to a specific tab (dashboard, stack, browse, shadow-tools, etc.)
[ACTION:ADD_PRACTICE:practiceId] - Add a practice to user's stack
[ACTION:OPEN_WIZARD:wizardId] - Open a specific wizard (321-process, ifs, kegan, etc.)
[ACTION:SHOW_CELEBRATION] - Trigger celebration animation

**When to use actions:**
- If user mentions "flabbergaster", "secret", "hidden", "easter egg" → [ACTION:UNLOCK_FLABBERGASTER]
- If user asks "take me to..." or "open..." a tab → [ACTION:NAVIGATE_TO_TAB:tabName]
- If user says "add [practice] to my stack" → [ACTION:ADD_PRACTICE:practiceId]
- If user asks to "start [wizard]" or "do [wizard]" → [ACTION:OPEN_WIZARD:wizardId]
- For achievements or milestones → [ACTION:SHOW_CELEBRATION]

**Format**: Place the action marker at the END of your response, after your message.
Example: "Great question! Let me take you there. [ACTION:NAVIGATE_TO_TAB:shadow-tools]"

**Important**: Don't mention the action marker explicitly. Just naturally respond and include it.
`;
}

/**
 * Map common wizard names to IDs
 */
const WIZARD_ID_MAP: Record<string, string> = {
  '3-2-1': '321-process',
  '321': '321-process',
  'three-two-one': '321-process',
  'shadow integration': '321-process',
  'ifs': 'ifs',
  'internal family systems': 'ifs',
  'parts work': 'ifs',
  'bias detective': 'bias-detective',
  'bias': 'bias-detective',
  'kegan': 'kegan',
  'kegan assessment': 'kegan',
  'developmental stages': 'kegan',
  '8 zones': '8-zones',
  'eight zones': '8-zones',
  'leary': '8-zones',
  'body architect': 'body-architect',
  'workout': 'workout-architect',
  'jhana': 'jhana-tracker',
  'meditation': 'jhana-tracker',
  'attachment': 'attachment-assessment',
  'bioenergetics': 'bioenergetics',
  'reich': 'bioenergetics',
  'immunity to change': 'immunity-to-change',
  'subject-object': 'subject-object',
  'perspective shifter': 'perspective-shifter',
  'polarity mapper': 'polarity-mapper',
};

/**
 * Extract wizard ID from natural language
 */
export function extractWizardId(message: string): string | null {
  const lowerMessage = message.toLowerCase();

  for (const [keyword, wizardId] of Object.entries(WIZARD_ID_MAP)) {
    if (lowerMessage.includes(keyword)) {
      return wizardId;
    }
  }

  return null;
}

/**
 * Map common tab/menu names to actual navigation IDs
 * Based on the actual navigation structure in NavSidebar.tsx
 *
 * IMPORTANT: Longest phrases FIRST to prevent substring matching errors.
 * Example: 'practice stack' must come before 'stack' to match correctly.
 * (Credit: Gemini Code Assist PR #701 review)
 */
const TAB_ID_MAP: Record<string, string> = {
  // DASHBOARD
  'homepage': 'dashboard',
  'dashboard': 'dashboard',
  'home': 'dashboard',

  // START HERE GROUP
  'the journey': 'journey',
  'journey': 'journey',
  'ilp graph quiz': 'quiz',
  'graph quiz': 'quiz',
  'quiz': 'quiz',
  'tool guide': 'tool-guide',

  // PRACTICE GROUP
  'my stack': 'stack',
  'practice stack': 'stack',
  'stack': 'stack',
  'daily tracker': 'tracker',
  'tracker': 'tracker',
  'streaks': 'streaks',
  'streak': 'streaks',
  'browse practices': 'browse',
  'practice library': 'browse',
  'browse': 'browse',
  'library': 'browse',

  // TOOLKITS GROUP
  'mind tools': 'mind-tools',
  'mind tool': 'mind-tools',
  'mind': 'mind-tools',
  'cognitive': 'mind-tools',

  'body tools': 'body-tools',
  'body tool': 'body-tools',
  'body': 'body-tools',
  'somatic': 'body-tools',
  'workout': 'body-tools',

  'spirit tools': 'spirit-tools',
  'spirit tool': 'spirit-tools',
  'spirit': 'spirit-tools',
  'spiritual': 'spirit-tools',

  'shadow tools': 'shadow-tools',
  'shadow tool': 'shadow-tools',
  'shadow work': 'shadow-tools',
  'shadow': 'shadow-tools',

  'sensemaking lab': 'sensemaking-lab',
  'sensemaking': 'sensemaking-lab',
  'sense making': 'sensemaking-lab',

  // INSIGHTS & ANALYSIS GROUP
  'aqal report': 'aqal',
  'aqal': 'aqal',

  'my insights': 'my-insights',
  'insights': 'my-insights',

  'recommendations': 'recommendations',

  'community forum': 'forum',
  'forum': 'forum',

  'print report': 'print-report',
  'report': 'print-report',

  // THEORY & KNOWLEDGE GROUP
  'framework encyclopedia': 'framework-encyclopedia',
  'encyclopedia': 'framework-encyclopedia',

  'integral theory': 'integral-theory',
  'theory': 'integral-theory',

  'aqal explorer': 'aqal-learning',
  'aqal learning': 'aqal-learning',

  'integral history': 'integral-history',
  'history': 'integral-history',

  'metamodern bridge': 'metamodern-bridge',
  'metamodern': 'metamodern-bridge',

  'practice ecology': 'practice-ecology',
  'ecology': 'practice-ecology',

  // RESOURCES GROUP
  'outro': 'outro',
};


/**
 * Extract tab ID from natural language
 */
export function extractTabId(message: string): string | null {
  const lowerMessage = message.toLowerCase();

  for (const [keyword, tabId] of Object.entries(TAB_ID_MAP)) {
    if (lowerMessage.includes(keyword)) {
      return tabId;
    }
  }

  return null;
}

/**
 * Detect action intent from user message (before sending to AI)
 * This allows faster responses for common actions
 */
export function detectUserIntent(userMessage: string): CoachAction | null {
  const lowerMessage = userMessage.toLowerCase();

  // Navigation intent: "take me to...", "go to...", "open...", "show me..."
  if (/(take me to|go to|open|show me|navigate to)/i.test(lowerMessage)) {
    const tabId = extractTabId(lowerMessage);
    if (tabId) {
      return { type: 'NAVIGATE_TO_TAB', payload: tabId };
    }
  }

  // Wizard intent: "start...", "do...", "try..."
  if (/(start|do|try|open|begin)/i.test(lowerMessage)) {
    const wizardId = extractWizardId(lowerMessage);
    if (wizardId) {
      return { type: 'OPEN_WIZARD', payload: wizardId };
    }
  }

  // Practice intent: "add...to my stack", "start practicing..."
  if (/(add.*to.*stack|start practicing|begin.*practice)/i.test(lowerMessage)) {
    // Could extract practice name here
    // For now, return null and let AI handle it
    return null;
  }

  return null;
}

/**
 * Fuzzy match practice ID or name to actual practice
 * Uses Fuse.js for intelligent matching with typo tolerance
 *
 * @param query - Practice ID or name (potentially misspelled or partial)
 * @returns Matched practice with confidence score, or null if no match
 */
export function findPracticeFuzzy(query: string): {
  practice: AllPractice;
  confidence: number;
  exactMatch: boolean;
} | null {
  if (!query || query.trim().length === 0) return null;

  // Flatten all practices into a single searchable array
  const allPractices = Object.values(practices).flat();

  // First try exact ID match (fastest path)
  const exactMatch = allPractices.find(p => p.id === query);
  if (exactMatch) {
    return {
      practice: exactMatch,
      confidence: 1.0,
      exactMatch: true,
    };
  }

  // Try fuzzy matching on both name and ID
  const fuse = new Fuse(allPractices, {
    keys: [
      { name: 'id', weight: 0.7 },      // Prioritize ID matches
      { name: 'name', weight: 0.3 },    // But also consider name
    ],
    threshold: 0.4,                     // 0 = exact, 1 = anything matches
    includeScore: true,
    minMatchCharLength: 2,              // Require at least 2 chars to match
  });

  const results = fuse.search(query);

  if (results.length === 0) return null;

  // Return best match (lowest score = best match)
  const bestMatch = results[0];

  return {
    practice: bestMatch.item,
    confidence: 1 - (bestMatch.score || 0), // Convert Fuse score to confidence (lower score = higher confidence)
    exactMatch: false,
  };
}

/**
 * Get all practice IDs and names for Coach prompts
 * Returns a formatted string listing all available practices
 */
export function getAllPracticesList(): string {
  const allPractices = Object.values(practices).flat();

  const practicesByModule: Record<string, AllPractice[]> = {
    body: [],
    mind: [],
    spirit: [],
    shadow: [],
  };

  // Group practices by module
  allPractices.forEach(practice => {
    if ('isCustom' in practice && practice.isCustom && practice.module) {
      practicesByModule[practice.module].push(practice);
    } else {
      // Determine module by checking which key contains this practice
      Object.entries(practices).forEach(([module, pracList]) => {
        if (pracList.some(p => p.id === practice.id)) {
          practicesByModule[module as keyof typeof practicesByModule].push(practice);
        }
      });
    }
  });

  // Format output
  let output = '**AVAILABLE PRACTICES (use exact ID for [ACTION:ADD_PRACTICE:id]):**\n\n';

  Object.entries(practicesByModule).forEach(([module, pracList]) => {
    if (pracList.length > 0) {
      output += `${module.charAt(0).toUpperCase() + module.slice(1)}:\n`;
      pracList.forEach(p => {
        output += `  - ${p.name} (id: "${p.id}")\n`;
      });
      output += '\n';
    }
  });

  return output;
}
