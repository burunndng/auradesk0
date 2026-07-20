/**
 * Crisis Detection Utility
 * Detects concerning language in user submissions
 */

export type CrisisLevel = 'none' | 'concern' | 'high';

// High-priority crisis keywords (immediate concern)
const HIGH_CRISIS_KEYWORDS = [
  'kill myself',
  'killing myself',
  'end my life',
  'ending my life',
  'suicide',
  'suicidal',
  'want to die',
  'better off dead',
  'no reason to live',
  'plan to die',
  'kill me',
  'don\'t want to be alive',
  'can\'t go on',
  'no point in living'
];

// Medium-concern keywords (genuinely elevated risk only — not everyday distress language)
const CONCERN_KEYWORDS = [
  'wish I was dead',
  'wish I were dead',
  'want to disappear',
  'end it all',
  'better off without me',
  'self-harm',
  'hurt myself',
  'hurting myself',
  'cut myself',
  'cutting myself'
];

/**
 * Detect crisis level in user text
 */
export function detectCrisisLevel(text: string): CrisisLevel {
  if (!text || text.trim().length === 0) {
    return 'none';
  }

  const normalizedText = text.toLowerCase();

  // Check for high-priority crisis language
  for (const keyword of HIGH_CRISIS_KEYWORDS) {
    if (normalizedText.includes(keyword)) {
      return 'high';
    }
  }

  // Check for concern-level language
  for (const keyword of CONCERN_KEYWORDS) {
    if (normalizedText.includes(keyword)) {
      return 'concern';
    }
  }

  return 'none';
}

/**
 * Extract plain text from HTML (e.g., from Tiptap editor)
 * Strips tags and decodes entities for crisis detection
 */
export function extractPlainText(html: string): string {
  // Remove HTML tags
  const withoutTags = html.replace(/<[^>]*>/g, '');

  // Decode common HTML entities
  const entityMap: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' ',
  };

  let decoded = withoutTags;
  Object.entries(entityMap).forEach(([entity, char]) => {
    decoded = decoded.replace(new RegExp(entity, 'g'), char);
  });

  return decoded;
}

/**
 * Get crisis resources
 */
export const CRISIS_RESOURCES = {
  us: {
    name: '988 Suicide & Crisis Lifeline',
    phone: '988',
    text: 'Text "HELLO" to 741741',
    url: 'https://988lifeline.org/'
  },
  international: {
    name: 'Befrienders Worldwide',
    url: 'https://www.befrienders.org/',
    description: 'Find crisis support in your country'
  }
};
