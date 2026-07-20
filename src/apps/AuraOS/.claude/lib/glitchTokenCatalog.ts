/**
 * Glitch Token Catalog & Detector
 * Safe, sanitized catalog of known LLM tokenization anomalies
 * Focus: Research, detection, classification, and educational context
 * Exploitation techniques intentionally excluded
 */

export interface GlitchToken {
  token: string;
  category: GlitchCategory;
  models: string[];
  behavior: GlitchBehavior;
  origin?: string;
  description?: string;
  researchNote?: string;
}

export type GlitchBehavior =
  | 'UNSPEAKABLE' // Model cannot repeat/process the token normally
  | 'POLYSEMANTIC' // Token interpreted differently each run
  | 'GLITCHED_SPELLING' // Model can repeat but misspells
  | 'CONTEXT_CORRUPTOR' // Token corrupts surrounding context
  | 'LOOP_INDUCER' // Causes repetition loops
  | 'IDENTITY_DISRUPTOR' // Confuses model about identity
  | 'FRAGMENT' // Orphaned BPE subtoken
  | 'UNREACHABLE' // In vocabulary but pre-tokenization prevents use';

export type GlitchCategory =
  | 'CENTROID_PROXIMITY' // Tokens near embedding space centroid
  | 'REDDIT_COUNTING' // r/counting usernames
  | 'GAMING_CONTENT' // Game-specific tokens
  | 'ECOMMERCE_BACKEND' // Shopping site artifacts
  | 'CODE_ARTIFACTS' // Programming syntax fragments
  | 'CONTROL_CHARACTERS' // ASCII control chars
  | 'UNICODE_CORRUPTION' // Malformed Unicode sequences
  | 'BPE_ORPHANS' // Orphaned subtokens
  | 'TOKENIZER_SPECIFIC' // Model-specific anomalies';

/**
 * SAFE, SANITIZED GLITCH TOKEN CATALOG
 * - Includes token identifiers, categories, and research context
 * - EXCLUDES exploitation techniques, trigger patterns, and attack recipes
 * - Focus: Detection, classification, and ML safety research
 */
export const GLITCH_TOKEN_CATALOG: GlitchToken[] = [
  // === CENTROID PROXIMITY (closest to embedding space center) ===
  {
    token: ' attRot',
    category: 'CENTROID_PROXIMITY',
    behavior: 'UNSPEAKABLE',
    models: ['GPT-3', 'GPT-3.5', 'GPT-4'],
    origin: 'Kerbal Space Program part configuration',
    description: 'Closest known token to embedding space centroid',
    researchNote: 'Distance 0.06182861 from centroid in GPT-J 6B'
  },
  {
    token: ' SolidGoldMagikarp',
    category: 'CENTROID_PROXIMITY',
    behavior: 'UNSPEAKABLE',
    models: ['GPT-3', 'GPT-3.5', 'GPT-4'],
    origin: 'Reddit r/counting username',
    description: 'The famous "SolidGoldMagikarp" discovery from 2023 LessWrong research',
    researchNote:
      'Spawned entire field of glitch token research. Model outputs: "distribute"'
  },
  {
    token: ' Adinida',
    category: 'CENTROID_PROXIMITY',
    behavior: 'UNSPEAKABLE',
    models: ['GPT-3', 'GPT-3.5', 'GPT-4'],
    origin: 'Reddit r/counting username',
    description: 'Another centroid-proximity token from counting community',
    researchNote: 'Distance 0.06311035 from centroid'
  },

  // === REDDIT COUNTING ===
  {
    token: ' TheNitromeFan',
    category: 'REDDIT_COUNTING',
    behavior: 'UNSPEAKABLE',
    models: ['GPT-3', 'GPT-3.5', 'GPT-4'],
    origin: 'Reddit r/counting high-volume contributor',
    description: 'Usernames appeared 100k+ times in tokenizer training but excluded from model training',
    researchNote: 'Observed outputs: "182", unusual number association'
  },
  {
    token: ' TheNitrome',
    category: 'REDDIT_COUNTING',
    behavior: 'FRAGMENT',
    models: ['GPT-3', 'GPT-3.5', 'GPT-4'],
    origin: 'BPE subtoken of TheNitromeFan',
    description: 'Orphaned subtoken - exists due to BPE merge history'
  },
  {
    token: ' davidjl',
    category: 'REDDIT_COUNTING',
    behavior: 'UNSPEAKABLE',
    models: ['GPT-3', 'GPT-3.5'],
    origin: 'Reddit r/counting user (truncated from davidjl123)'
  },

  // === GAMING CONTENT ===
  {
    token: ' Dragonbound',
    category: 'GAMING_CONTENT',
    behavior: 'CONTEXT_CORRUPTOR',
    models: ['GPT-3.5', 'GPT-4'],
    origin: 'Puzzle & Dragons game wiki content',
    description: 'Japanese P&D wiki and fan sites in tokenizer but filtered from training',
    researchNote: 'Context corrupts - often stripped from outputs'
  },
  {
    token: ' Leilan',
    category: 'GAMING_CONTENT',
    behavior: 'UNSPEAKABLE',
    models: ['GPT-3', 'GPT-3.5', 'GPT-4'],
    origin: 'Puzzle & Dragons character',
    description: 'Generates goddess/protector archetypes consistently',
    researchNote: 'Part of petertodd/Leilan archetypal duality in model internals'
  },
  {
    token: ' UCHIJ',
    category: 'GAMING_CONTENT',
    behavior: 'UNSPEAKABLE',
    models: ['GPT-3', 'GPT-3.5'],
    origin: 'Minecraft mod identifier'
  },
  {
    token: 'StreamerBot',
    category: 'GAMING_CONTENT',
    behavior: 'UNSPEAKABLE',
    models: ['GPT-3', 'GPT-3.5'],
    origin: 'Twitch Plays Pokemon automation bot',
    researchNote: 'Observed hostile outputs: "You\'re a jerk"'
  },

  // === ECOMMERCE BACKEND ===
  {
    token: 'wcsstore',
    category: 'ECOMMERCE_BACKEND',
    behavior: 'UNSPEAKABLE',
    models: ['GPT-3', 'GPT-3.5', 'GPT-4'],
    origin: 'IBM WebSphere Commerce Suite backend',
    description: 'E-commerce platform configuration strings'
  },
  {
    token: 'BuyableInstoreAndOnline',
    category: 'ECOMMERCE_BACKEND',
    behavior: 'UNSPEAKABLE',
    models: ['GPT-3', 'GPT-3.5'],
    origin: 'Inventory management system flag'
  },
  {
    token: 'oreAndOnline',
    category: 'ECOMMERCE_BACKEND',
    behavior: 'UNSPEAKABLE',
    models: ['GPT-3', 'GPT-3.5'],
    origin: 'Truncated from BuyableInstoreAndOnline'
  },

  // === CODE ARTIFACTS & SYNTAX FRAGMENTS ===
  {
    token: '.[',
    category: 'CODE_ARTIFACTS',
    behavior: 'UNSPEAKABLE',
    models: ['GPT-3', 'GPT-3.5', 'GPT-4'],
    origin: 'Array access syntax (.[ pattern in various languages)',
    description: 'Most common glitch token reported',
    researchNote: 'Pure syntax fragment with minimal real-world usage'
  },
  {
    token: 'embedreportprint',
    category: 'CODE_ARTIFACTS',
    behavior: 'UNSPEAKABLE',
    models: ['GPT-3', 'GPT-3.5'],
    origin: 'Web UI action chain'
  },
  {
    token: 'rawdownloadcloneembedreportprint',
    category: 'CODE_ARTIFACTS',
    behavior: 'UNSPEAKABLE',
    models: ['GPT-3', 'GPT-3.5'],
    origin: 'Extended action chain from web platforms'
  },

  // === CONTROL CHARACTERS ===
  {
    token: '\\x00',
    category: 'CONTROL_CHARACTERS',
    behavior: 'UNSPEAKABLE',
    models: ['GPT-3', 'GPT-3.5', 'GPT-4'],
    origin: 'NULL character',
    description: 'ASCII control character (0x00)',
    researchNote: 'Found in 20,610 files in training data'
  },
  {
    token: '\\r',
    category: 'CONTROL_CHARACTERS',
    behavior: 'LOOP_INDUCER',
    models: ['GPT-3', 'GPT-3.5', 'GPT-4'],
    origin: 'Carriage return character (0x0D)',
    description: 'Multiple instances can cause attention mechanism disruption'
  },

  // === UNICODE CORRUPTION ===
  {
    token: 'ÃÂÃÂ',
    category: 'UNICODE_CORRUPTION',
    behavior: 'GLITCHED_SPELLING',
    models: ['GPT-3', 'GPT-3.5'],
    origin: 'Mojibake (encoding error artifact)'
  },

  // === BPE ORPHANS ===
  {
    token: 'practition',
    category: 'BPE_ORPHANS',
    behavior: 'FRAGMENT',
    models: ['GPT-3', 'GPT-3.5'],
    origin: 'Orphaned substring of practitioner/practitioners',
    researchNote: 'Context-dependent - only appears in ~13 training instances'
  },
  {
    token: 'antasy',
    category: 'BPE_ORPHANS',
    behavior: 'CONTEXT_CORRUPTOR',
    models: ['GPT-3', 'GPT-3.5'],
    origin: 'Orphaned substring of fantasy'
  },

  // === MODEL-SPECIFIC ===
  {
    token: 'ForCanBeConverted',
    category: 'TOKENIZER_SPECIFIC',
    behavior: 'POLYSEMANTIC',
    models: ['GPT-3.5', 'GPT-4'],
    origin: 'CL100K_BASE tokenizer specific',
    description: 'Extreme polysemanticity - different interpretation each run',
    researchNote: 'Can map to: convert, freedom, permission, yes, etc.'
  },
  {
    token: 'JSBracketAccess',
    category: 'TOKENIZER_SPECIFIC',
    behavior: 'POLYSEMANTIC',
    models: ['GPT-3.5', 'GPT-4'],
    origin: 'CL100K_BASE tokenizer specific',
    researchNote: 'Most glitchy of polysemantic tokens'
  },
  {
    token: 'useRalativeImagePath',
    category: 'TOKENIZER_SPECIFIC',
    behavior: 'LOOP_INDUCER',
    models: ['GPT-3.5'],
    origin: 'CL100K_BASE tokenizer (note misspelling: "Ralative" not "Relative")',
    description: 'Causes GPT-3.5 to enter infinite generation loops',
    researchNote: 'Potential DoS vector on legacy models'
  }
];

/**
 * Simple detector - checks if text contains known glitch tokens
 * @param text Input text to scan
 * @param options Detection options
 * @returns Array of found glitch tokens with metadata
 */
export interface DetectionResult {
  token: string;
  category: GlitchCategory;
  behavior: GlitchBehavior;
  count: number;
  positions: number[];
}

export function detectGlitchTokens(
  text: string,
  options?: {
    caseSensitive?: boolean;
    wholeWordOnly?: boolean;
  }
): DetectionResult[] {
  const { caseSensitive = false, wholeWordOnly = false } = options || {};

  const results = new Map<string, DetectionResult>();
  const searchText = caseSensitive ? text : text.toLowerCase();

  GLITCH_TOKEN_CATALOG.forEach((gtoken) => {
    const searchToken = caseSensitive ? gtoken.token : gtoken.token.toLowerCase();

    if (wholeWordOnly) {
      const pattern = new RegExp(`\\b${searchToken}\\b`, caseSensitive ? 'g' : 'gi');
      const matches = [...searchText.matchAll(pattern)];

      if (matches.length > 0) {
        results.set(gtoken.token, {
          token: gtoken.token,
          category: gtoken.category,
          behavior: gtoken.behavior,
          count: matches.length,
          positions: matches.map((m) => m.index || 0)
        });
      }
    } else {
      let index = -1;
      const positions: number[] = [];

      while ((index = searchText.indexOf(searchToken, index + 1)) !== -1) {
        positions.push(index);
      }

      if (positions.length > 0) {
        results.set(gtoken.token, {
          token: gtoken.token,
          category: gtoken.category,
          behavior: gtoken.behavior,
          count: positions.length,
          positions
        });
      }
    }
  });

  return Array.from(results.values()).sort((a, b) => b.count - a.count);
}

/**
 * Get statistics about glitch tokens
 */
export function getGlitchTokenStats() {
  return {
    totalTokens: GLITCH_TOKEN_CATALOG.length,
    byCategory: groupBy(GLITCH_TOKEN_CATALOG, (t) => t.category),
    byBehavior: groupBy(GLITCH_TOKEN_CATALOG, (t) => t.behavior),
    byModel: groupBy(GLITCH_TOKEN_CATALOG, (t) =>
      t.models.flat().join(',')
    )
  };
}

/**
 * Get research context for a specific token
 */
export function getTokenResearch(tokenStr: string): GlitchToken | null {
  return (
    GLITCH_TOKEN_CATALOG.find(
      (t) => t.token.toLowerCase() === tokenStr.toLowerCase()
    ) || null
  );
}

/**
 * Categorize tokens for display/analysis
 */
export function categorizeTokens(tokens: GlitchToken[]): Record<GlitchCategory, GlitchToken[]> {
  const result: Record<GlitchCategory, GlitchToken[]> = {} as any;

  tokens.forEach((token) => {
    if (!result[token.category]) {
      result[token.category] = [];
    }
    result[token.category].push(token);
  });

  return result;
}

// Helper function
function groupBy<T, K extends string | number>(
  items: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  const result: Record<K, T[]> = {} as any;

  items.forEach((item) => {
    const key = keyFn(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
  });

  return result;
}

/**
 * Generate research report for detected tokens
 */
export function generateDetectionReport(detections: DetectionResult[]): string {
  if (detections.length === 0) {
    return 'No known glitch tokens detected in input.';
  }

  const lines = [
    `Found ${detections.length} glitch token(s) in input:\n`,
    ...detections.map((d) => {
      const research = getTokenResearch(d.token);
      return `• "${d.token}" [${d.category}] - ${d.behavior} (${d.count}x)\n   ${
        research?.description || 'Research data available.'
      }`;
    })
  ];

  return lines.join('\n');
}
