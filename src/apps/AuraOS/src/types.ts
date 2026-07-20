// Existing types...

export type ActiveTab =
  | 'home'
  | 'learning'
  | 'journal'
  | 'settings'
  | 'sensemaking-lab';

export type SensemakingLabDraft = {
  rawQuestion: string;
  focalQuestion: string;
  whatChanged: string;
  nextAction: string;
  falsifier: string;
  updatedAt: number;
};

export type SensemakingLabSession = {
  id: string;
  createdAt: number;
  draft: SensemakingLabDraft;
};

/**
 * LATTURE Translation System Type Definitions
 * ============================================
 * Comprehensive type safety for morphological analysis and translation.
 * Enables full IDE autocomplete and compile-time safety checks.
 */

/**
 * Phonological representation of a morpheme or word.
 * Supports IPA phonetic notation and stress markers.
 * @example
 * {
 *   ipa: "ˈka.ta",
 *   syllableCount: 2,
 *   stressPattern: [1, 0],
 *   romanization: "kata"
 * }
 */
export type PhonologicalForm = {
  /** IPA transcription with stress markers (e.g., "ˈka.ta") */
  ipa: string;
  /** Syllable count for phonotactic rule validation */
  syllableCount: number;
  /** Stress pattern as array of binary values (1=stressed, 0=unstressed) */
  stressPattern: number[];
  /** Optional romanization for display (e.g., "kata") */
  romanization?: string;
};

/**
 * Morpheme: atomic unit of meaning in LATTURE.
 * Combines semantic content with phonological form.
 * Root morphemes carry core meaning; other types modify meaning.
 * @example
 * {
 *   id: "root-001",
 *   stem: "kat",
 *   morphemeType: "root",
 *   semanticMeaning: "to speak",
 *   etymology: "PIE *geth-",
 *   phonological: { ipa: "ka.t", syllableCount: 2, stressPattern: [1, 0] },
 *   category: "verb",
 *   features: { transitive: true, agentive: true },
 *   examples: ["katize", "katment"],
 *   confidence: 0.95
 * }
 */
export type Morpheme = {
  /** Unique identifier for morpheme database lookup */
  id: string;
  /** Root form (consonant-vowel skeleton) */
  stem: string;
  /** Morpheme classification: root, prefix, infix, suffix */
  morphemeType: 'root' | 'prefix' | 'infix' | 'suffix';
  /** Primary semantic meaning in English */
  semanticMeaning: string;
  /** Secondary semantic associations or field */
  semanticField?: string[];
  /** Proto-language source or etymological note */
  etymology?: string;
  /** Phonological properties */
  phonological: PhonologicalForm;
  /** Part of speech: verb, noun, adjective, adverb, etc. */
  category:
    | 'verb'
    | 'noun'
    | 'adjective'
    | 'adverb'
    | 'preposition'
    | 'conjunction'
    | 'particle';
  /** Morphosyntactic features (e.g., transitive, agentive, perfective) */
  features: Record<string, boolean | string | number>;
  /** Example words containing this morpheme */
  examples: string[];
  /** Confidence score from training data (0-1) */
  confidence: number;
  /** Historical notes or usage restrictions */
  notes?: string;
};

/**
 * Affix: grammatical morpheme with attachment rules.
 * Defines how affixes combine with roots and other morphemes.
 * Handles allomorphy (phonologically conditioned variants).
 * @example
 * {
 *   id: "suffix-001",
 *   allomorphs: ["-ize", "-ise"],
 *   canonical: "-ize",
 *   position: "suffix",
 *   attachmentRule: "root-verb",
 *   semanticShift: "verb-to-noun-agent",
 *   phonological: { ipa: "aɪz", syllableCount: 1, stressPattern: [1] },
 *   category: "verb",
 *   features: { agentive: true, nominalizing: true },
 *   confidence: 0.88
 * }
 */
export type Affix = {
  /** Unique identifier for affix */
  id: string;
  /** Phonetic variants (allomorphs) of the affix */
  allomorphs: string[];
  /** Canonical form for display and reference */
  canonical: string;
  /** Position relative to root: prefix, infix, suffix */
  position: 'prefix' | 'infix' | 'suffix';
  /** Rule for valid attachment (e.g., "root-verb", "stem-any") */
  attachmentRule: string;
  /** Semantic transformation applied (e.g., "verb-to-noun-agent") */
  semanticShift: string;
  /** Phonological properties */
  phonological: PhonologicalForm;
  /** Morpheme IDs this affix can attach to (empty = compatible with all) */
  compatibleRoots: string[];
  /** Morpheme IDs this affix cannot attach to */
  incompatibleRoots: string[];
  /** POS it applies to or modifies */
  category:
    | 'verb'
    | 'noun'
    | 'adjective'
    | 'adverb'
    | 'preposition'
    | 'conjunction'
    | 'particle';
  /** Features it adds or modifies in derived form */
  features: Record<string, boolean | string | number>;
  /** Phonotactic and morphotactic constraints */
  constraints: {
    /** Preceding affix requirement (e.g., "none", "aspect-marker") */
    requiresPreviousAffix: string;
    /** Whether this affix causes stress shift in root */
    causesStressShift: boolean;
    /** Vowel harmony requirement (if applicable) */
    vowelHarmony?: string;
    /** Maximum stacking depth for this affix type */
    maxStackingDepth?: number;
  };
  /** Confidence score from training data (0-1) */
  confidence: number;
};

/**
 * Derivation step: tracks single morphological operation.
 * Used to build derivation traces showing morpheme composition.
 * Enables transparent analysis of how words are built.
 * @example
 * {
 *   step: 1,
 *   operation: "attach-suffix",
 *   source: "kat",
 *   morphemeId: "suffix-001",
 *   result: "katize",
 *   reason: "Convert root verb to agent noun",
 *   certainty: "certain"
 * }
 */
export type DerivationStep = {
  /** Sequential step number in derivation (1-indexed) */
  step: number;
  /** Type of morphological operation performed */
  operation:
    | 'attach-prefix'
    | 'attach-suffix'
    | 'attach-infix'
    | 'vowel-ablaut'
    | 'consonant-gradation'
    | 'suprasegmental';
  /** Input form before operation */
  source: string;
  /** Morpheme ID applied in this step */
  morphemeId: string;
  /** Output form after operation */
  result: string;
  /** Explanation of what this step does semantically */
  reason: string;
  /** Confidence level in this step */
  certainty: 'certain' | 'likely' | 'possible' | 'speculative';
};

/**
 * Word: complete lexical item in LATTURE.
 * Composed of morphemes with full derivation history.
 * Tracks both surface form and internal structure.
 * @example
 * {
 *   id: "word-001",
 *   surface: "katization",
 *   lemma: "katize",
 *   phonological: { ipa: "kæt.aɪ.zeɪ.ʃən", syllableCount: 4, stressPattern: [0, 1, 0, 0] },
 *   morphemeIds: ["root-001", "suffix-001", "suffix-002"],
 *   category: "noun",
 *   features: { agentive: true, abstract: true },
 *   semanticMeaning: "the process of speaking",
 *   derivationTrace: [...],
 *   confidence: 0.92,
 *   frequency: 0.0015
 * }
 */
export type Word = {
  /** Unique word identifier */
  id: string;
  /** Surface form (what appears in text) */
  surface: string;
  /** Lemma (dictionary headword or base form) */
  lemma: string;
  /** Phonological properties of complete word */
  phonological: PhonologicalForm;
  /** IDs of constituent morphemes in derivation order */
  morphemeIds: string[];
  /** Part of speech of complete word */
  category:
    | 'verb'
    | 'noun'
    | 'adjective'
    | 'adverb'
    | 'preposition'
    | 'conjunction'
    | 'particle';
  /** Morphosyntactic features of complete word */
  features: Record<string, boolean | string | number>;
  /** Meaning of complete word */
  semanticMeaning: string;
  /** Step-by-step breakdown of morpheme combination */
  derivationTrace: DerivationStep[];
  /** Overall confidence in analysis (0-1) */
  confidence: number;
  /** Frequency in corpus (0-1 normalized) for ranking */
  frequency?: number;
  /** Register: formal, informal, technical, archaic, poetic */
  register?: 'formal' | 'informal' | 'technical' | 'archaic' | 'poetic';
};

/**
 * Alternative translation candidate with confidence score.
 * Used to provide multiple plausible interpretations.
 * Enables ambiguity resolution through user context.
 * @example
 * {
 *   surface: "katize",
 *   confidence: 0.75,
 *   morphemeIds: ["root-001", "suffix-001"],
 *   derivationTrace: [...],
 *   rationale: "Common morpheme combination, matches phonotactics"
 * }
 */
export type TranslationAlternative = {
  /** Surface form of alternative interpretation */
  surface: string;
  /** Confidence score for this alternative (0-1) */
  confidence: number;
  /** Morpheme IDs used in this analysis */
  morphemeIds: string[];
  /** Derivation trace for this alternative */
  derivationTrace: DerivationStep[];
  /** Reason why this is plausible */
  rationale: string;
};

/**
 * Translation result: complete output of morphological analysis.
 * Includes primary result, alternatives, and confidence metrics.
 * Primary interface returned by translation functions.
 * @example
 * {
 *   success: true,
 *   primary: { id: "word-001", surface: "katization", ... },
 *   alternatives: [
 *     { surface: "katize", confidence: 0.75, morphemeIds: [...], derivationTrace: [...], rationale: "..." }
 *   ],
 *   confidence: 0.92,
 *   derivationTrace: [...],
 *   analysisTime: 145,
 *   notes: "High confidence - common morpheme combination"
 * }
 */
export type TranslationResult = {
  /** Whether analysis succeeded without errors */
  success: boolean;
  /** Primary translation result (null if analysis failed) */
  primary: Word | null;
  /** Alternative analyses ranked by confidence (descending) */
  alternatives: TranslationAlternative[];
  /** Overall confidence in primary result (0-1) */
  confidence: number;
  /** Complete derivation trace for primary result */
  derivationTrace: DerivationStep[];
  /** Analysis duration in milliseconds */
  analysisTime: number;
  /** Human-readable explanation of analysis or failure */
  notes: string;
  /** Error message if analysis failed */
  error?: string;
};

/**
 * Case system: inflectional rules for nominal case marking.
 * Defines how nouns/pronouns change to show grammatical roles.
 * May implement nominative-accusative, ergative-absolutive, etc.
 * @example
 * {
 *   name: "nominative-accusative",
 *   caseCount: 7,
 *   cases: [
 *     { caseId: "nom", name: "nominative", suffix: "-∅", semantics: "subject of verb", examples: ["kat"] },
 *     { caseId: "acc", name: "accusative", suffix: "-am", semantics: "direct object", examples: ["katam"] }
 *   ],
 *   agreementRules: ["gender-agreement", "number-agreement"],
 *   syncretism: { "dual-nominative": ["dual-accusative"] }
 * }
 */
export type CaseSystem = {
  /** Name of case system (e.g., "nominative-accusative", "ergative-absolutive") */
  name: string;
  /** Number of cases in system */
  caseCount: number;
  /** Individual case definitions */
  cases: {
    /** Case abbreviation (e.g., "nom", "acc", "gen", "dat", "loc", "abl") */
    caseId: string;
    /** Full case name */
    name: string;
    /** Typical suffix marking this case (null for nominative/unmarked) */
    suffix: string | null;
    /** Semantic role this case expresses */
    semantics: string;
    /** Example words in this case */
    examples: string[];
  }[];
  /** Rules for case agreement with other words */
  agreementRules: string[];
  /** Syncretism mapping (case collapse) if any */
  syncretism?: Record<string, string[]>;
};

/**
 * Tense/aspect system: verbal inflection rules.
 * Defines how verbs mark temporal and aspectual distinctions.
 * May include combinations of tense, aspect, mood, and evidentiality.
 * @example
 * {
 *   name: "perfective-imperfective",
 *   tenseCount: 6,
 *   tenses: [
 *     { tenseId: "prf", name: "perfective", suffix: "-∅", semantics: "completed action", examples: ["katam"] },
 *     { tenseId: "impf", name: "imperfective", suffix: "-a", semantics: "ongoing action", examples: ["katama"] }
 *   ],
 *   agreementRules: ["person-agreement", "number-agreement"],
 *   evidentiality: ["direct", "indirect", "reported"]
 * }
 */
export type TenseSystem = {
  /** Name of tense/aspect system */
  name: string;
  /** Number of tense/aspect distinctions */
  tenseCount: number;
  /** Individual tense/aspect definitions */
  tenses: {
    /** Tense abbreviation (e.g., "pst", "prs", "fut", "prf", "impf") */
    tenseId: string;
    /** Full tense name */
    name: string;
    /** Typical suffix marking this tense */
    suffix: string | null;
    /** Semantic content (what time/aspect it expresses) */
    semantics: string;
    /** Example verbs in this tense */
    examples: string[];
  }[];
  /** Rules for tense agreement with other elements */
  agreementRules: string[];
  /** Evidentiality markers if integrated with tense system */
  evidentiality?: string[];
};

/**
 * Syllable constraint: phonotactic rule limiting syllable structure.
 * Defines what combinations of consonants and vowels are allowed.
 * Enables syllable validation and phonotactically valid word generation.
 * @example
 * {
 *   constraint: "CVC",
 *   description: "Consonant-Vowel-Consonant structure",
 *   allowed: true,
 *   frequency: 0.45,
 *   examples: ["kat", "rik", "tem"]
 * }
 */
export type SyllableConstraint = {
  /** Syllable structure pattern (e.g., "CV", "CVC", "CCVC", "CVCC") */
  constraint: string;
  /** Human explanation of what this pattern means */
  description: string;
  /** Whether this pattern is allowed in the language */
  allowed: boolean;
  /** Frequency of this pattern in corpus (0-1) */
  frequency: number;
  /** Example syllables matching this pattern */
  examples: string[];
};

/**
 * Morphology rules: complete system of morphological operations.
 * Encapsulates all case, tense, and phonotactic constraints.
 * Central system configuration for morphological validation.
 * @example
 * {
 *   caseSystem: { name: "nominative-accusative", caseCount: 7, cases: [...] },
 *   tenseSystem: { name: "perfective-imperfective", tenseCount: 6, tenses: [...] },
 *   syllableConstraints: [
 *     { constraint: "CV", description: "open syllable", allowed: true, frequency: 0.3 },
 *     { constraint: "CVC", description: "closed syllable", allowed: true, frequency: 0.7 }
 *   ],
 *   phonotactics: {
 *     initialConsonantClusters: ["pr", "tr", "kr"],
 *     finalConsonantClusters: ["st", "nt"],
 *     forbiddenClusters: ["pf", "bv"]
 *   },
 *   stressRules: { default: "penultimate", stressAttractors: ["-ize"], stressRepellers: [] },
 *   updatedAt: 1704067200000
 * }
 */
export type MorphologyRules = {
  /** Case inflection system for nouns */
  caseSystem: CaseSystem;
  /** Tense/aspect inflection for verbs */
  tenseSystem: TenseSystem;
  /** Allowed syllable structures */
  syllableConstraints: SyllableConstraint[];
  /** Phonotactic constraints beyond syllable level */
  phonotactics: {
    /** Allowed consonant clusters at word start */
    initialConsonantClusters: string[];
    /** Allowed consonant clusters at word end */
    finalConsonantClusters: string[];
    /** Consonant clusters that are forbidden */
    forbiddenClusters: string[];
    /** Vowel harmony rules if applicable */
    vowelHarmony?: {
      /** Harmonic classes (e.g., "front" vs "back" vowels) */
      classes: Record<string, string[]>;
      /** Triggers harmony shift */
      triggers: string[];
    };
  };
  /** Stress assignment rules */
  stressRules: {
    /** Default stress position (e.g., "initial", "penultimate", "ultimate") */
    default: string;
    /** Morphemes that attract stress */
    stressAttractors: string[];
    /** Morphemes that block stress shift */
    stressRepellers: string[];
  };
  /** Last updated timestamp (Unix ms) */
  updatedAt: number;
};

/**
 * Vocabulary entry: storage format for morphemes and words.
 * Optimized for both localStorage and JSON file export.
 * Tracks sync status for backend integration.
 * @example
 * {
 *   type: "morpheme",
 *   id: "root-001",
 *   data: { id: "root-001", stem: "kat", morphemeType: "root", ... },
 *   tags: ["common", "verb", "agent"],
 *   createdAt: 1704067200000,
 *   updatedAt: 1704067200000,
 *   synced: true,
 *   syncedId: "db-record-123"
 * }
 */
export type VocabularyEntry = {
  /** Entry type: morpheme, affix, or word */
  type: 'morpheme' | 'affix' | 'word';
  /** Unique identifier */
  id: string;
  /** The actual morpheme, affix, or word data */
  data: Morpheme | Affix | Word;
  /** Searchable tags (e.g., "common", "verb", "agentive", "transitive") */
  tags: string[];
  /** When entry was created (Unix timestamp ms) */
  createdAt: number;
  /** When entry was last modified (Unix timestamp ms) */
  updatedAt: number;
  /** Whether this entry is synced to backend (Supabase) */
  synced: boolean;
  /** Backend record ID if synced */
  syncedId?: string;
  /** User notes, etymology details, or usage notes */
  notes?: string;
};

/**
 * Vocabulary database: collection of entries with metadata.
 * Used for localStorage serialization and bulk operations.
 * Enables export, import, and off-line operation.
 * @example
 * {
 *   version: 1,
 *   language: "LATTURE",
 *   lastSyncedAt: 1704067200000,
 *   entries: [
 *     { type: "morpheme", id: "root-001", data: {...}, tags: [...], createdAt: ..., updatedAt: ..., synced: true }
 *   ],
 *   stats: { totalEntries: 150, totalMorphemes: 100, totalAffixes: 30, totalWords: 20 },
 *   metadata: { owner: "user-123", source: "collaborative" }
 * }
 */
export type VocabularyDatabase = {
  /** Format version for migration tracking */
  version: number;
  /** Language code (e.g., "LATTURE") */
  language: string;
  /** Last sync to backend (Unix timestamp ms) */
  lastSyncedAt: number;
  /** All vocabulary entries */
  entries: VocabularyEntry[];
  /** Aggregate statistics */
  stats: {
    /** Total entries across all types */
    totalEntries: number;
    /** Count of morpheme entries */
    totalMorphemes: number;
    /** Count of affix entries */
    totalAffixes: number;
    /** Count of word entries */
    totalWords: number;
  };
  /** Metadata about the database */
  metadata?: {
    /** User who created/owns this database */
    owner?: string;
    /** Database source (e.g., "collaborative", "user-generated", "seed") */
    source?: string;
    /** Optional description of database purpose */
    description?: string;
  };
};

/**
 * Translation service configuration.
 * Controls behavior of morphological analysis and translation.
 * @example
 * {
 *   maxAlternatives: 5,
 *   minConfidence: 0.5,
 *   enableFuzzyMatching: true,
 *   cacheTTL: 3600000
 * }
 */
export type TranslationConfig = {
  /** Maximum number of alternative translations to return */
  maxAlternatives: number;
  /** Minimum confidence threshold for including results */
  minConfidence: number;
  /** Enable fuzzy matching for approximate morpheme lookup */
  enableFuzzyMatching: boolean;
  /** Cache time-to-live in milliseconds (0 = no cache) */
  cacheTTL: number;
  /** Enable detailed logging for debugging */
  verbose: boolean;
};

/**
 * Return of Ritual Wizard Draft
 * Spirit wizard exploring sacred space after deconstruction
 */
export type ReturnOfRitualDraft = {
  hasRituals: string;
  routineChecklist: string[];
  postDeconstructionFeeling: string;
  ritualRelationship: string;
  userRoutine: string;
  routineFunction: string;
  aiReflection: string;
  aiReaction: 'resonates' | 'curious' | 'pushback' | '';
  principlesPresent: string[];
  gapResponse: string;
  integralReaction: 'resonates' | 'curious' | 'pushback' | '';
  shiftNote: string;
  openQuestion: string;
};

export type ReturnOfRitualSession = {
  id: string;
  createdAt: number;
  userId?: string;
  draft: ReturnOfRitualDraft;
};

/**
 * Quantified Self and Its Limits Draft
 * Body wizard exploring cultural stances toward the body
 */
export type QuantifiedSelfDraft = {
  bodyChecking: string;
  bodyBeing: string;
  stanceVessel: number;
  stanceMachine: number;
  stanceConstruct: number;
  stanceHome: number;
  profileReaction: 'resonates' | 'curious' | 'pushback' | '';
  lowestStanceResponse: string;
  absentBodyReaction: 'resonates' | 'curious' | 'pushback' | '';
  userExample: string;
  aiReflection: string;
  aiReaction: 'resonates' | 'curious' | 'pushback' | '';
  bodyLayersAccess: string[];
  shiftNote: string;
  openQuestion: string;
};

export type QuantifiedSelfSession = {
  id: string;
  createdAt: number;
  userId?: string;
  draft: QuantifiedSelfDraft;
};
