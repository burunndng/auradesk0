
// ============================================================================
// Database & Supabase Integration Types
// ============================================================================

export type ModuleKey = 'body' | 'mind' | 'spirit' | 'shadow';

export interface Practice {
  id: string;
  name: string;
  description: string;
  why: string;
  evidence: string;
  timePerWeek: number;
  roi: 'EXTREME' | 'VERY HIGH' | 'HIGH' | 'MEDIUM' | 'LOW';
  difficulty: 'Trivial' | 'Very Low' | 'Low' | 'Low-Medium' | 'Medium' | 'Medium-High' | 'High';
  affectsSystem: string[];
  how: string[];
  imageUrl?: string;
  customizationQuestion?: string;
  hidden?: boolean;
  aiEnabled?: boolean;           // NEW: Enable AI voice guidance
  aiPrompt?: string;             // NEW: Prompt for Gemini voice generation
  interactiveMode?: string;
  interactiveConfig?: Record<string, unknown>;
  wizardKey?: string;            // wizard ID to launch from practice card
}

export interface CustomPractice extends Omit<Practice, 'how'> {
  isCustom: true;
  module: ModuleKey;
  how: string[]; // Overriding to be just strings
}

export type AllPractice = Practice | CustomPractice;

export interface PracticesData {
  body: Practice[];
  mind: Practice[];
  spirit: Practice[];
  shadow: Practice[];
  meta?: Practice[];
}

export interface ModuleInfo {
  name: string;
  color: string;
  textColor: string;
  borderColor: string;
  lightBg: string;
}

export interface StarterStack {
  name: string;
  description: string;
  practices: string[];
  difficulty: string;
  aggressiveness: 'Relaxed' | 'Moderate' | 'Focused' | 'Intensive' | 'Transformative';
  why: string;
}

/**
 * Enhanced AI Recommendation (Option B)
 * Structured recommendation with sequencing, guidance, and confidence
 */
export interface EnhancedRecommendation {
  id: string;
  practice: AllPractice;
  rationale: string;
  sequenceWeek: number;
  sequenceGuidance: string;
  expectedBenefits: string;
  integrationTips: string;
  timeCommitment: string;
  confidence: number; // 0.0 - 1.0
}

export interface EnhancedRecommendationSet {
  recommendations: EnhancedRecommendation[];
  overallGuidance: string;
  practiceSequence: string[];
  estimatedTimeToNoticeBenefit: string;
  confidence: number;
  generatedAt: Date;
}

export interface StarterStacksData {
  [key: string]: StarterStack;
}

export type ActiveTab =
  | 'dashboard'
  | 'practice-hub'
  | 'stack'
  | 'browse'
  | 'tracker'
  | 'tools'
  | 'tool-guide'
  | 'insights-hub'
  | 'my-insights'
  | 'recommendations'
  | 'aqal'
  | 'aqal-learning'
  | 'learn-hub'
  | 'integral-theory'
  | 'integral-history'
  | 'metamodern-bridge'
  | 'metamodern-frameworks-deep-dive'
  | 'practice-ecology'
  | 'framework-encyclopedia'
  | 'mind-tools'
  | 'shadow-tools'
  | 'body-tools'
  | 'spirit-tools'
  | 'library'
  | 'outro'
  | 'quiz'
  | 'journey'
  | 'print-report'
  | 'sensemaking-lab'
  | 'forum'
  | 'profile';

// ============================================================================
// AXIS Types
// ============================================================================

export type AXISActivityType =
  | 'ai-conversation'
  | 'journal'
  | 'therapy'
  | 'difficult-conversation'
  | 'meditation'
  | 'other';

export type AXISAnchorMode =
  | 'emotional-pattern'
  | 'behavioral-change'
  | 'identity-transition'
  | 'relational';

export interface AXISConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AXISEnactmentMap {
  ul: string;  // I — what I now understand differently
  ur: string;  // It — one thing I will do differently
  ll: string;  // We — one relationship/conversation this calls toward
  lr: string;  // Its — one structure/environment to change or protect
}

// ─── AXIS Memory Store ───────────────────────────────────────────────────────

export type MemoryItemKind = 'insight' | 'pattern' | 'commitment' | 'belief' | 'definition' | 'other'
export type MemoryItemStatus = 'active' | 'archived' | 'pending'
export type MemoryItemSource = 'user' | 'axis'

export interface MemoryItem {
  id: string                   // crypto.randomUUID()
  text: string
  kind: MemoryItemKind
  scope: 'global' | string     // 'global' or `anchor:${anchorId}`
  status: MemoryItemStatus
  source: MemoryItemSource
  userApproved: boolean        // false for axis-auto-written items until user reviews them
  createdAt: string
  updatedAt: string
  sessionId?: string
}

// ─────────────────────────────────────────────────────────────────────────────

export interface AXISSynthesisBrief {
  userPatterns: {
    coreDynamic: string;
    typicalDefenses: string;
    blindSpots: string;
    triggers: string;
  };
  sessionFindings: {
    presentingToRoot: string;
    keyInsight: string;
    shift: string;
    successCriteriaMet: string;
  };
  analystNotes: {
    effective: string;
    avoid: string;
  };
  openThreads: string[];
  nextSession: {
    entryPoint: string;
    hypothesisToTest: string;
  };
  cumulativeContext: string;
  persistentCoreTruths?: string[];  // Legacy: kept for backward compat with stored briefs
  proposedNewTruths?: string[]      // AI-observed new items only (not cumulative)
  proposedUserSaves?: Array<{ text: string; kind?: MemoryItemKind }>  // Candidates surfaced by AI for user to name
  userAnnotation?: string;          // Free-text correction/addition by user
  behavioralCommitment?: string;    // One behavioral commitment from this session (UR quadrant)
  enactmentMap?: AXISEnactmentMap;  // User-authored AQAL 4-box (carries into next session)
  generatedAt: string;
}

export interface AXISMetaSynthesis {
  emergingPatterns: string;
  stuckPoints: string;
  languageShift: string;
  outgrownBeliefs: string;
  trajectoryReport: string;
  anchorReviewPrompt: string;
  generatedAt: string;
  sessionIds: string[];  // IDs of sessions that contributed
}

export interface AXISAnchor {
  id?: string;        // Stable key for per-anchor localStorage slots
  content: string;
  updatedAt: string;  // ISO timestamp
  mode?: AXISAnchorMode;
}

export interface AXISContextData {
  topic: string;
  prompt: string;
  context: string;
  helpType: 'Decide' | 'Understand' | 'Process' | 'Validate' | 'Vent';
  challengeLevel: 'Steady & patient' | 'Balanced' | 'Press me hard' | 'Fierce' | 'Open exploration';
  urgency: 'Long-term exploration' | 'Moderate timeline' | 'This week' | 'Today';
  broaderContext?: string;
  broaderDetails?: string;
  priorBrief?: AXISSynthesisBrief;
}

export interface AXISSession {
  id: string;
  activityType: AXISActivityType;
  title: string;
  intention: string;
  successCriteria?: string;
  status: 'active' | 'reflecting' | 'closed';
  createdAt: string;
  closedAt?: string;
  insightId?: string;             // Links to IntegratedInsight after reflection saved
  // Extended fields (optional — not all sessions have all fields)
  refinedIntention?: string;
  preparationHistory?: AXISConversationMessage[];
  conversationHistory?: AXISConversationMessage[];
  synthesisBrief?: AXISSynthesisBrief;
  contextData?: Record<string, unknown>;
  mode?: AXISAnchorMode;
  isOffAxis?: boolean;             // True for side-quest sessions not tied to main anchor
  sessionType?: 'standard' | 'meta';  // 'meta' for Meta-Mirror sessions
  metaSynthesis?: AXISMetaSynthesis;  // Only set for meta sessions
}

export interface AXISReflection {
  salience: string;      // What stood out
  delta?: string;         // What changed
  residue?: string;       // What remains open
  selfNoticing?: string;  // What you're now noticing on your own that AXIS used to surface
}

/**
 * Navigation stack entry for tracking user navigation history (Phase 3)
 * Enables back button functionality and context preservation across tabs and wizards
 */
export interface NavigationEntry {
  tab: ActiveTab;
  activeWizard?: string | null;
  linkedInsightId?: string | null;
  timestamp: number;
}

export interface JourneyCard {
  id: string;
  title: string;
  // Microlearning Fields
  keyIdea: string;        // The one-sentence takeaway
  explain: string[];      // 3-4 bullet points of clear explanation
  example: string;        // Concrete, grounded example
  tryIt: string;          // <60 second micro-practice
  check: {                // Quick comprehension check
    question: string;
    answers: string[];
    correctIndex: number;
  };
}

export interface JourneyRegion {
  id: string;
  name: string;
  emoji: string;
  description: string;
  cards: JourneyCard[];
  unlocksAt?: number; // card index that unlocks this region
  unlockedPractices?: string[]; // practice IDs unlocked upon completion
}

export interface JourneyProgress {
  visitedRegions: string[];
  completedCards: string[];
  earnedBadges: string[];
  currentRegion?: string;
  currentCard?: string;
}

export interface CoachMessage {
  role: 'user' | 'coach';
  text: string;
}

export interface FaceItAnalysis {
  objectiveDescription: string; // What does the trigger do/act like?
  specificActions: string[]; // Specific behaviors or actions
  triggeredEmotions: string[]; // Emotions triggered by this quality
  intensityRating?: number; // 1-10 how strongly this triggers you
  patternRecurrence?: string; // Where else does this pattern show up?
}

export interface DialogueEntry {
  role: 'user' | 'bot';
  text: string;
}

export interface EmbodimentAnalysis {
  embodimentStatement: string; // "I am..." statement from the quality's perspective
  somaticLocation: string; // Where is this felt in the body?
  coreMessage: string; // What is the core message of this quality?
  intensityRating?: number; // 1-10 how it feels to BE this quality
  shiftNoticed?: string; // What do you notice shifting after embodiment?
  // BE IT scaffold fields
  qualityNeed?: string; // What this quality needs from you
  qualityDenial?: string; // What you've been denying this quality
  qualityGift?: string; // The gift this quality is trying to give you
}

export interface IntegrationPlan {
  reowningStatement: string; // How can you re-own this quality?
  actionableStep: string; // Specific action to integrate this insight
  relatedPracticeId?: string; // Link to practice for integration
  // INTEGRATE bridge field
  giftClaimed?: string; // Reflection on claiming the quality's gift
}

export type CrisisLevel = 'none' | 'concern' | 'high';

export type ShadowExerciseId =
  | 'projection-inventory'
  | 'golden-shadow-inventory'
  | 'trigger-tracking'
  | 'shame-archaeology'
  | 'letter-to-shadow'
  | 'integration-statement';

export type ShadowExercisePhase = 'discovery' | 'excavation' | 'dialogue' | 'integration';

export type ShadowExerciseFieldType = 'text' | 'textarea' | 'scale' | 'list';

export interface ShadowExerciseField {
  id: string;
  label: string;
  type: ShadowExerciseFieldType;
  placeholder?: string;
  required?: boolean;
  description?: string;
  maxLength?: number;
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: { min: string; max: string };
}

export type ShadowExerciseUiType = 'table' | 'qna' | 'letter' | 'formula';

export interface ShadowExerciseTemplate {
  id: ShadowExerciseId;
  name: string;
  phase: ShadowExercisePhase;
  shortDescription: string;
  longInstructions: string;
  uiType: ShadowExerciseUiType;
  fields: ShadowExerciseField[];
  estimatedTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface ShadowSessionResult {
  id: string;
  exerciseId: ShadowExerciseId;
  exerciseName: string;
  exercisePhase: ShadowExercisePhase;
  createdAt: string;
  userEntry: Record<string, string | number>;
  normalizedEntry: string;
  guideReflection: string;
  crisisLevel: CrisisLevel;
  wordToCarry?: string;
  selfCompassionStatement?: string;
  linkedInsightId?: string;
}

export interface ThreeTwoOneSession {
  id: string;
  date: string;
  trigger: string;
  triggerDescription: string; // Legacy: kept for backward compatibility
  dialogue: string; // Legacy: kept for backward compatibility
  embodiment: string; // Legacy: kept for backward compatibility
  integration: string; // Legacy: kept for backward compatibility
  aiSummary?: string;
  linkedInsightId?: string;

  // Structured fields
  faceItAnalysis?: FaceItAnalysis;
  dialogueTranscript?: DialogueEntry[];
  embodimentAnalysis?: EmbodimentAnalysis;
  integrationPlan?: IntegrationPlan;

  // Elevation fields
  triggerSituation?: string; // Expanded situation description
  triggerReminder?: string; // "Who does this remind you of?"
  shadowGift?: string; // AI-generated one-line crystallization
  watchFor?: string; // AI-generated re-emergence warning
  dialogueDepth?: number; // Number of exchanges completed
  compactMode?: boolean; // Experienced user compact mode

  // Redesigned wizard UI cache fields
  faceItProbe?: string;       // Cached AI reflective probe from FACE_IT step
  beItSomaticPrompt?: string; // Cached somatic guidance from BE_IT step
  initialIntensity?: number;  // Bookend metric — trigger intensity at start
}

export type WizardPhase = 'IDENTIFY' | 'EXPLORE' | 'DEEPEN' | 'UNBURDEN' | 'INTEGRATE' | 'CLOSING';

export interface IFSDialogueEntry {
  role: 'user' | 'bot';
  text: string;
  phase: WizardPhase;
}

export interface IFSPart {
  id: string;
  name: string;
  role: string;
  fears: string;
  positiveIntent: string;
  lastSessionDate: string;
}

export interface IFSSession {
  id: string;
  date: string;
  partId: string;
  partName: string;
  transcript: IFSDialogueEntry[];
  integrationNote: string;
  currentPhase: WizardPhase;
  partRole?: string;
  partFears?: string;
  partPositiveIntent?: string;
  summary?: string;
  aiIndications?: string[];
  linkedInsightId?: string;
  identifiedParts?: Array<{ name: string; role?: string }>;
  selfEnergyBaseline?: number; // 1–5 at session start
  postSessionCheck?: {
    affect: number; // 1–5: much worse → much better
    partWord: string;
    willingness: 'yes' | 'maybe' | 'no';
    adverseFlag?: boolean; // true if affect <= 2
  };
}

export interface AqalReportData {
  summary: string;
  quadrantInsights: {
    I: string;
    It: string;
    We: string;
    Its: string;
  };
  quadrantScores?: {
    I: number;
    It: number;
    We: number;
    Its: number;
  };
  recommendations: string[];
  generatedAt?: string;
}

export interface DiscoveryAnswers {
  alternativesConsidered: string;
  informationSources: string;
  timePressure: string;
  emotionalState: string;
  influencers: string;
}

export interface IdentifiedBias {
  name: string;
  description?: string;
  relevance?: string;
}

export interface BiasScenario {
  biasName: string;
  howItInfluenced: string;
  scenario: string;
  alternativeDecision: string;
}

export interface BiasDetectiveSession {
  id: string;
  date: string;
  currentStep: string;
  decisionText: string;
  decision?: string; // Alias for sessionSummarizer compatibility
  reasoning: string;
  discoveryAnswers: DiscoveryAnswers;
  identifiedBiases: IdentifiedBias[];
  alternativeFramings: string[];
  diagnosis?: string;
  scenarios?: BiasScenario[];
  oneThingToRemember: string;
  nextTimeAction: string;
  linkedInsightId?: string; // Intelligence Hub integration
}

export type SubjectObjectStep = 'WELCOME' | 'GROUNDING' | 'RECOGNIZE_PATTERN' | 'TRUTH_FEELINGS' | 'NAME_SUBJECT' | 'EVIDENCE_SUBJECT' | 'TRACE_ORIGIN' | 'COST' | 'FIRST_OBSERVATION' | 'SMALL_EXPERIMENT' | 'INTEGRATION_SHIFT' | 'COMPLETE';

export interface SubjectObjectSession {
  id: string;
  date: string;
  currentStep: SubjectObjectStep;
  pattern: string;
  truthFeelings: string;
  subjectToStatement: string;
  evidenceChecks: { pro?: string; con?: string };
  origin: string;
  cost: string;
  firstObservation: string;
  dailyTracking: Record<string, string>;
  reviewInsights: string;
  integrationShift: string;
  ongoingPracticePlan: string[];
  smallExperimentChosen?: string;
  linkedInsightId?: string; // Intelligence Hub integration
}

export interface Perspective {
  type: 'First Person (You)' | 'Second Person (Them)' | 'Third Person (Observer)' | 'Witness (Pure Awareness)';
  description: string;
  // FIX: Changed 'llmReflection' to 'reflection' for consistency with how the state is managed and passed to components.
  reflection?: string;
}

export interface PerspectiveShifterSession {
  id: string;
  date: string;
  currentStep: string;
  stuckSituation: string;
  perspectives: Perspective[];
  synthesis: string;
  realityCheckRefinement: string;
  dailyTracking: Record<string, { rating: number; note: string }>;
  linkedInsightId?: string; // Intelligence Hub integration
  integrationNote?: string;
}

// ---------------------------------------------------------------------------
// Note: Schema Detective / Schema Therapy types are defined later in the file (around line 2116+)

export type PolarityMapperStep = 'INTRODUCTION' | 'DEFINE_DILEMMA' | 'POLE_A_UPSIDE' | 'POLE_A_DOWNSIDE' | 'POLE_B_UPSIDE' | 'POLE_B_DOWNSIDE' | 'REVIEW' | 'SELF_ASSESSMENT' | 'SYNTHESIS' | 'ACTION_COMMITMENT' | 'COMPLETE';

export interface PolaritySynthesis {
  keyTension: string;
  oscillationStrategy: string;
  warningSignsA: string[];
  warningSignsB: string[];
  actionSteps: string[];
  recommendedPractices?: {
    practiceId: string;
    rationale: string;
  }[];
}

export interface PolarityMap {
  id: string;
  date: string;
  dilemma: string;
  poleA_name: string;
  poleA_upside: string;
  poleA_downside: string;
  poleB_name: string;
  poleB_upside: string;
  poleB_downside: string;
  synthesis?: PolaritySynthesis;
  currentPosition?: number;
  positionDuration?: string;
  committedActions: string[];
  selectedPractices?: string[];
  linkedInsightId?: string;
}

// FIX: Added PolarityMapDraft interface to include currentStep for wizard state.
export interface PolarityMapDraft extends Partial<PolarityMap> {
  currentStep: PolarityMapperStep;
  linkedInsightId?: string; // Intelligence Hub integration
}

export interface IntegratedInsight {
  id: string;
  mindToolType:
  | '3-2-1 Reflection'
  | 'IFS Session'
  | 'Bias Detective'
  | 'Bias Finder'
  | 'Subject-Object Explorer'
  | 'Perspective-Shifter'
  | 'Polarity Mapper'
  | 'Kegan Assessment'
  | 'Relational Pattern'
  | 'Role Alignment'
  | 'Big Mind Process'
  | 'Memory Reconsolidation'
  | 'Eight Zones'
  | 'Adaptive Cycle Mapper'
  | 'Adaptive Cycle Lens'
  | 'Somatic Practice'
  | 'Jhana Guide'
  | 'Meditation Finder'
  | 'Consciousness Graph'
  | 'Attachment Assessment'
  | 'Integral Body Plan'
  | 'Workout Program'
  | 'Shadow Journaling'
  | 'Cross-Modal'
  | 'Schema Detective'
  | 'Bioenergetics'
  | 'Context AI Root Cause'
  | 'Immunity to Change'
  | 'Schema Reflection'
  | 'AXIS'
  | 'Psychedelic Journey'
  | 'Advaita Master Coach'
  | 'treeOfLife-kether'
  | 'treeOfLife-chokmah'
  | 'treeOfLife-binah'
  | 'treeOfLife-chesed'
  | 'treeOfLife-gevurah'
  | 'treeOfLife-tiferet'
  | 'treeOfLife-netzach'
  | 'treeOfLife-hod'
  | 'treeOfLife-yesod'
  | 'treeOfLife-malkuth'
  | 'treeOfLife-daat'
  | 'DBT Coach'
  | string; // Added string for flexibility
  mindToolSessionId: string;
  mindToolName: string;
  mindToolReport: string;
  mindToolShortSummary: string;
  detectedPattern: string;
  suggestedShadowWork: {
    practiceId: string;
    practiceName: string;
    rationale: string;
    microHabit?: string;
  }[];
  suggestedNextSteps: {
    practiceId: string;
    practiceName: string;
    rationale: string;
    microHabit?: string;
  }[];
  dateCreated: string;
  status: 'pending' | 'addressed';
  shadowWorkSessionsAddressed?: {
    shadowToolType: string;
    shadowSessionId: string;
    dateCompleted: string;
  }[];

  // Outcome tracking
  relatedPracticeSessions?: {
    practiceId: string;
    completionDates: string[];
    frequency?: number;
  }[];
  practiceOutcome?: {
    practiceId: string;
    practiceFrequency: number;
    patternImprovement: 'improved' | 'stable' | 'worsened' | 'unknown';
    notes?: string;
  }[];
  patternEvolutionNotes?: string;

  // Transparency & Lineage Tracking
  lineageId?: string; // Reference to synthesisLineageService lineage record
  generatedBy?: 'grok' | 'gemini' | 'qwen' | 'user' | 'ai' | 'ai-fallback' | 'fallback'; // Which AI model generated this insight, or user for AXIS
  confidenceScore?: number; // 0-1 confidence in the insight
}

/**
 * Tree of Life coaching session data
 */
export interface TreeOfLifeSession {
  id: string;
  sephiraId: string;
  sephiraName: string;
  date: string;
  conversationMessages: TreeOfLifeChatMessage[];
  summarizedHistory?: TreeOfLifeChatMessage; // role: 'summary'
  messageCount: number;
  aiSummary?: string;
  linkedInsightId?: string;
}

/**
 * Individual chat message in Tree of Life coaching
 */
export interface TreeOfLifeChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'summary';
  content: string;
  timestamp: number;
}

/**
 * Structured practice session for the redesigned 8-step Tree of Life wizard
 */
export interface TreeOfLifePracticeSession {
  id: string;
  date: string;
  sephiraId: string;
  sephiraName: string;
  // Step inputs
  challengeText: string;
  groundingResponses: string[];     // User's responses to AI-generated grounding questions
  qliphothReflection: string;       // Shadow inquiry reflection
  pathworkingReport: string;        // What emerged during visualization
  emergenceExchanges: TreeOfLifeChatMessage[]; // Step 6 guided conversation
  integrationCommitment: string;    // Concrete commitment for step 7
  // AI-generated content
  generatedQuestions: string[];     // 3 questions from step 3
  pathworkingVisualization: string; // The visualization text (from template)
  // Synthesis
  linkedInsightId?: string;
}

/**
 * Summary of prior insights organized by modality
 * Used to provide AI context about cross-modal patterns
 */
export interface PriorInsightSummary {
  body: string;      // Summary of body/somatic insights (max 250 chars)
  mind: string;      // Summary of mind/cognitive insights (max 250 chars)
  spirit: string;    // Summary of spirit/contemplative insights (max 250 chars)
  shadow: string;    // Summary of shadow/emotional insights (max 250 chars)
  crossModalPatterns: string; // AI-detected patterns across modalities (max 500 chars)
}

/**
 * Insight Tracking - User's personal tracking status for IntegratedInsights
 * Stored in insight_tracking table, allows users to mark insights as addressed/archived
 */
export interface InsightTracking {
  id: string;
  userId: string;
  insightId: string;
  status: 'pending' | 'addressed' | 'archived';
  createdAt: string;
  updatedAt: string;
}

/**
 * Pattern Cluster - group of semantically similar IntegratedInsights
 */
export interface PatternCluster {
  id: string;
  insights: IntegratedInsight[];
  centroid: number[]; // Average embedding of the cluster
  similarity_scores: Record<string, number>; // insight id -> similarity score
  metadata: {
    theme: string; // Identified theme across insights
    strength: number; // 0-1, based on average similarity
    representative_insight_id: string; // Most representative insight
  };
}

/**
 * Pattern Family - related clusters grouped by theme
 */
export interface PatternFamily {
  id: string;
  name: string;
  clusters: PatternCluster[];
  evolution_history: PatternEvolution[];
  timestamp: string;
  metadata: {
    total_insights: number;
    primary_theme: string;
    related_themes: string[];
    strength: number; // Overall family strength
  };
}

/**
 * Pattern Evolution - tracks how patterns change over time
 */
export interface PatternEvolution {
  emerged_at: string; // ISO timestamp
  evolved_at: string; // ISO timestamp
  strength_trend: 'increasing' | 'stable' | 'decreasing';
  related_patterns: string[]; // IDs of related pattern families
  description: string; // How this pattern evolved
}

export interface SomaticScriptSegment {
  instruction: string;
  duration_seconds: number;
}

export type SomaticPacing = 'slow' | 'moderate' | 'dynamic' | 'fluid';
export type SafetyLevel = 'strong' | 'moderate' | 'low'; // Added for somatic presets

export type SomaticPracticeType =
  | 'Breath-Centered'           // Primary: Respiratory techniques
  | 'Progressive Relaxation'    // Systematic tension-release
  | 'Gentle Movement'           // Slow somatic exploration
  | 'Mindful Flow'              // Continuous meditative movement
  | 'Grounding & Stability'     // Anchoring, proprioceptive
  | 'Dynamic Activation';       // Energizing, circulation

export interface PracticeTypeInfo {
  name: SomaticPracticeType;
  description: string;
  primaryMechanism: string;
  bestFor: string[];
  evidenceBase: string;
  contraindications?: string[];
  exampleTechniques: string[];
}

export interface SomaticPracticeSession {
  id: string;
  date: string;
  title: string;
  intention: string;
  practiceType: SomaticPracticeType; // Changed from 'style'
  duration: number; // in minutes
  focusArea?: string; // e.g., "shoulders and neck", "lower back", "whole body"
  pacing?: SomaticPacing; // e.g., "slow", "moderate", "dynamic", "fluid"
  script: SomaticScriptSegment[];
  safetyNotes?: string[]; // AI-generated safety considerations
  validationWarnings?: ValidationWarning[]; // Store warnings from content validation
  // NEW: Somatic findings from practice session
  somaticFindings?: {
    bodyLocations?: string[]; // Where sensations were felt (e.g., "chest", "shoulders", "stomach")
    sensationQualities?: string[]; // Qualities of sensation (e.g., "tight", "heavy", "light", "warm", "cold", "numb")
    emotionalTone?: string[]; // Associated emotions (e.g., "anxiety", "sadness", "joy")
    blockTypes?: string[]; // Types of blocks detected (e.g., "tension", "numbness", "constriction", "holding")
    discoveries?: string[]; // Key discoveries during practice
  };
}

// For content validation
export type WarningType = 'Misleading claim' | 'Overpromising effect' | 'Pseudoscientific language' | 'Medical claim' | 'Overgeneralization' | 'Unverified construct' | 'Safety oversight';

export interface ValidationWarning {
  type: WarningType;
  issue: string; // The problematic phrase or concept
  suggestion: string; // How to rephrase or what to consider
}

export interface ValidationResult {
  isValid: boolean;
  warnings: ValidationWarning[];
}

export interface SomaticPreset {
  name: string;
  intention: string;
  practiceType: SomaticPracticeType; // Changed from 'style'
  duration: number;
  focusArea?: string;
  pacing?: SomaticPacing;
  description: string;
  evidenceLevel?: SafetyLevel;
  contraindications?: string[];
  safetyNotes?: string[];
  citations?: string[];
}

// Draft state for SomaticGeneratorWizard (localStorage persistence)
export interface SomaticDraft {
  intention: string;
  practiceType: SomaticPracticeType;
  duration: number;
  focusArea: string;
  pacing: SomaticPacing;
}

// --- Polyvagal Wizard ---
export type PolyvagalStateValue = 'ventral' | 'sympathetic' | 'dorsal' | 'unknown';

export interface PolyvagalStateAssessment {
  derivedState: PolyvagalStateValue;
  selfReport: string;        // user's own words
  timestamp: string;
}

export interface PolyvagalSession {
  id: string;
  userId?: string;
  createdAt: string;
  assessment: PolyvagalStateAssessment;
  interventionId: string | null;
  interventionCompleted: boolean;
  ventralAnchor: string;
  sessionNotes: string;
  regulatedAt: string | null;   // ISO timestamp if reached ventral
  handoffWizard: string | null; // wizard slug to route to on exit
}

export interface PolyvagalDraft {
  state: PolyvagalStateValue;
  selfReport: string;
  interventionId: string | null;
  interventionCompleted: boolean;
  ventralAnchor: string;
  sessionNotes: string;
}

// Kegan Developmental Stage Assessment Types
export type KeganStage =
  | 'The Socialized Mind'
  | 'Transitioning: Socialized to Self-Authored'
  | 'The Self-Authored Mind'
  | 'Transitioning: Self-Authored to Self-Transforming'
  | 'The Self-Transforming Mind';

export type KeganDomain = 'Relationships' | 'Work & Purpose' | 'Values & Beliefs' | 'Conflict & Feedback' | 'Identity & Self';

// Legacy interfaces kept for backward compatibility with probe functions
export interface KeganPrompt {
  id: string;
  domain: KeganDomain;
  prompt: string;
  instruction: string;
  stage3Indicator: string;
  stage4Indicator: string;
  stage5Indicator: string;
}

export interface KeganResponse {
  promptId: string;
  domain: KeganDomain;
  response: string;
  aiAnalysis?: {
    likelyStage: KeganStage;
    reasoning: string;
    subjectObjectStructure: string;
  };
}

// New hybrid assessment interfaces
export interface KeganForcedChoiceAnswer {
  questionId: string;
  chosenOption: 'A' | 'B';
  questionDomain: string;
}

export interface KeganDilemmaSetup {
  userDilemma: string;
  generatedOptions: string[];
  selectedOptionIndex: number;
}

export interface KeganStressTestResult {
  question: string;
  userResponse: string;
}

export interface KeganInterpretation {
  centerOfGravityLabel: string;
  numericScore: number; // 2.0–5.0, internal only
  confidenceLevel: 'clear_signal' | 'suggestive_pattern' | 'insufficient_data';
  subjectObjectMap: { subjectTo: string; objectTo: string };
  domainVariation: string;
  consolidationStrengths: string;
  growthFrontier: string;
  tightness: string;
  practiceRecommendation: {
    storyReference: string;
    practice: string;
    observation: string;
  };
  // Legacy compat (old wizard used these)
  domainSplit?: string;
  growthEdge?: string;
}

// Narrative-first assessment types (new architecture)
export interface KeganNarrativeResponse {
  domain: string;
  promptUsed: string;
  story: string;
  stakesResponse: string;
  perspectiveResponse: string;
  retrospectiveResponse: string;
  adaptiveProbeResponses?: Array<{
    probeType: string;
    question: string;
    response: string;
  }>;
}

export interface KeganDilemmaProbe {
  dilemmaPrompt: string;
  userDilemma: string;
  narrativeResponse: string;
  counterPerspective: string;
  counterPerspectiveResponse?: string;
}

export interface KeganConfoundAnalysis {
  theoryFluency: number;
  performativeComplexity: number;
  aspirationalResponding: number;
  narrativeRichness: number;
  rationale: string;
}

export interface KeganStructuralCoding {
  subjectFusion: string;
  objectCapacity: string;
  conflictHandling: string;
  keyEvidence: Array<{ quote: string; annotation: string }>;
  preliminaryScore: number;
  confidence: 'high' | 'medium' | 'low';
}

export interface KeganComparativeRating {
  mostSimilarExemplar: number;
  similarities: Array<{ exemplarNumber: number; similarityScore: number; explanation: string }>;
  suggestedScore: number;
}

export interface KeganAdversarialScoring {
  caseForStage2: { strength: 'strong' | 'moderate' | 'weak' | 'none'; evidence: string };
  caseForStage3: { strength: 'strong' | 'moderate' | 'weak' | 'none'; evidence: string };
  caseForTransition3to4: { strength: 'strong' | 'moderate' | 'weak' | 'none'; evidence: string };
  caseForStage4: { strength: 'strong' | 'moderate' | 'weak' | 'none'; evidence: string };
  caseForTransition4to5: { strength: 'strong' | 'moderate' | 'weak' | 'none'; evidence: string };
  caseForStage5: { strength: 'strong' | 'moderate' | 'weak' | 'none'; evidence: string };
  disambiguationNeeded: string;
}

export interface KeganPracticeRecommendation {
  storyReference: string;
  practice: string;
  observation: string;
}

export interface KeganScoringResult {
  structuralCoding: KeganStructuralCoding;
  comparativeRating: KeganComparativeRating;
  adversarialScoring: KeganAdversarialScoring;
  confoundAnalysis: KeganConfoundAnalysis;
  finalInterpretation: KeganInterpretation;
}

export interface KeganAssessmentSession {
  id: string;
  date: string;
  // Narrative-first flow fields (new architecture)
  userContext?: { ageRange: string | null; culturalContext: string | null };
  selectedDomains?: string[];
  growthEdgeNote?: string;
  narratives?: KeganNarrativeResponse[];
  dilemmaProbe?: KeganDilemmaProbe;
  scoringResult?: KeganScoringResult;
  resultResonance?: 'resonates' | 'partially' | 'doesnt' | null;
  // Legacy hybrid flow fields (kept for KeganPostDialogueProbe compat)
  forcedChoiceAnswers?: KeganForcedChoiceAnswer[];
  dilemmaSetup?: KeganDilemmaSetup;
  stressTest?: KeganStressTestResult;
  overallInterpretation?: {
    centerOfGravityLabel?: string;
    numericScore?: number;
    subjectObjectMap?: { subjectTo: string; objectTo: string };
    domainSplit?: string;
    growthEdge?: string;
    centerOfGravity?: string;
    confidence?: 'Low' | 'Medium' | 'High';
    confidenceLevel?: 'clear_signal' | 'suggestive_pattern' | 'insufficient_data';
    domainVariation?: Record<string, string>;
    developmentalEdge?: string;
    recommendations?: string[];
    fullAnalysis?: string;
    consolidationStrengths?: string;
    growthFrontier?: string;
    tightness?: string;
    practiceRecommendation?: { storyReference: string; practice: string; observation: string };
  };
  selfReflection?: string;
  notes?: string;
  linkedInsightId?: string;
  // Legacy field for probe compatibility
  responses?: KeganResponse[];
}

export type KeganAssessmentStep =
  | 'INTRODUCTION'
  | 'FORCED_CHOICE'
  | 'DILEMMA_INPUT'
  | 'STRESS_TEST'
  | 'ANALYSIS'
  | 'RESULTS'
  | 'REFLECTION'
  | 'POST_DIALOGUE';

// Kegan Post-Dialogue Probe Types
export type KeganProbeType =
  | 'CONTRADICTION'      // Probing for contradiction and nuance
  | 'SUBJECT_OBJECT'     // Testing Subject by making it Object
  | 'ASSUMPTIONS';       // Exploring boundaries of "Big Assumptions"

export interface KeganProbeExchange {
  id: string;
  probeType: KeganProbeType;
  question: string;
  userResponse?: string;
  aiAnalysis?: {
    subjectObjectReveal: string;  // What became visible about subject-object structure
    developmentalInsight: string; // What this reveals about current stage
    nextProbe?: string;           // Follow-up question if needed
  };
}

export interface KeganProbeSession {
  id: string;
  assessmentSessionId: string;   // Link back to original assessment
  date: string;
  exchanges: KeganProbeExchange[];
  integratedInsights?: {
    confirmedStage: KeganStage;
    refinedAnalysis: string;      // Updated understanding after probes
    edgeOfDevelopment: string;    // More precise developmental edge
    bigAssumptions: string[];     // Identified limiting assumptions
    subjectStructure: string[];   // What they're currently subject to
    objectStructure: string[];    // What they can reflect on
    recommendations: string[];    // Updated developmental recommendations
  };
}

// Attachment Assessment Types
export interface AttachmentAssessmentSession {
  id: string;
  date: string;
  answers: Record<string, number>; // Question ID -> response (1-7)
  scores: {
    anxiety: number;
    avoidance: number;
  };
  style: 'secure' | 'anxious' | 'avoidant' | 'fearful';
  assessedStyle?: 'secure' | 'anxious' | 'avoidant' | 'fearful'; // For sessionSummarizer compatibility
  description: string;
  notes?: string;
  linkedInsightId?: string; // Links to Intelligence Hub insight
}


// Role Alignment Session
export interface RoleAlignmentRole {
  name: string;
  why: string;
  goal: string;
  valueScore: number; // 1-10 alignment score
  valueNote: string;
  shadowNudge?: string;
  action?: string;
}

export interface RoleAlignmentSession {
  id: string;
  date: string;
  roles: RoleAlignmentRole[];
  integralNote?: string;
  aiIntegralReflection?: {
    integralInsight: string;
    quadrantConnections: string;
    recommendations: string[];
  };
}

// Jhana/Samadhi Tracking Types
export type JhanaLevel = '1st Jhana' | '2nd Jhana' | '3rd Jhana' | '4th Jhana' | '5th Jhana' | '6th Jhana' | '7th Jhana' | '8th Jhana' | 'Access Concentration' | 'Momentary Concentration';

export interface JhanaFactor {
  name: string;
  present: boolean;
  intensity: number; // 1-10
  notes?: string;
}

export type NimittaType = 'Visual Light' | 'Tactile Sensation' | 'Auditory' | 'Whole-Body' | 'Spatial' | 'None Yet' | 'Other';

export interface JhanaSession {
  id: string;
  date: string;
  practice: string; // What meditation practice
  duration: number; // minutes
  jhanaLevel: JhanaLevel;
  timeInState: number; // minutes in jhana/absorption

  // Five Jhana Factors (for 1st-4th)
  factors: {
    appliedAttention: JhanaFactor; // vitakka - directing attention
    sustainedAttention: JhanaFactor; // vicara - sustaining attention
    joy: JhanaFactor; // piti - energetic joy
    happiness: JhanaFactor; // sukha - contentment
    unification: JhanaFactor; // ekaggata - one-pointedness
  };

  // Nimitta/Sign
  nimittaPresent: boolean;
  nimittaType?: NimittaType;
  nimittaDescription?: string;
  nimittaStability?: number; // 1-10

  // Phenomenology
  bodyExperience: string; // How did body feel?
  mindQuality: string; // Quality of mind (bright, stable, spacious, etc.)
  hindrances?: string[]; // Any hindrances encountered

  // Progress Notes
  comparison?: string; // How does this compare to previous sits?
  insights?: string;
  difficulties?: string;
  questions?: string;
}

// ILP Graph Quiz Types
export type ILPGraphCategory = 'core' | 'body' | 'mind' | 'spirit' | 'shadow' | 'integral-theory';
export type QuizQuestionType = 'multiple-choice' | 'true-false' | 'matching' | 'ranking' | 'scenario';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'ultra';

export interface ILPGraphNode {
  id: string;
  label: string;
  category: ILPGraphCategory;
  description: string;
  importance: number; // 1-10
}

export interface QuizAnswer {
  id: string;
  text: string;
  isCorrect: boolean;
}

export type ConceptualPath = 'foundation' | 'structural' | 'operational' | 'integration';

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  category: ILPGraphCategory;
  difficulty: DifficultyLevel;
  question: string;
  description?: string;
  answers: QuizAnswer[];
  correctExplanation: string;
  relatedNodes: string[]; // IDs of related graph nodes
  points?: number;
  tags?: string[];
  conceptualPath?: ConceptualPath; // Learning progression layer
  learningObjective?: string; // What concept this question illuminates
  prerequisiteConcepts?: string[]; // Concepts to understand first
  relatedConcepts?: string[]; // Related concepts for deeper exploration
}

export interface QuizResult {
  id: string;
  quizId: string;
  date: string;
  difficulty: DifficultyLevel;
  category: ILPGraphCategory;
  totalQuestions: number;
  correctAnswers: number;
  score: number; // percentage
  timeSpent: number; // seconds
  categoryBreakdown: Record<ILPGraphCategory, { correct: number; total: number }>;
  answers: {
    questionId: string;
    selectedAnswerId: string;
    isCorrect: boolean;
  }[];
  conceptsMastered?: string[]; // Concepts demonstrated understanding of
  conceptsToDeepen?: string[]; // Concepts needing more exploration
  reflectionPrompt?: string; // Generated prompt for post-session reflection
}

export interface ILPGraphQuizSession {
  id: string;
  date: string;
  category: ILPGraphCategory;
  difficulty: DifficultyLevel;
  currentQuestionIndex: number;
  answers: { questionId: string; selectedAnswerId: string }[];
  startTime: number;
  results?: QuizResult;
}

export interface ConceptMastery {
  conceptId: string;
  conceptName: string; // Human readable name derived from ID
  exposures: number;        // How many times seen
  correctCount: number;
  totalCount: number;
  lastReviewDate: string;
  nextReviewDate: string;   // For spaced repetition (Phase 3)
  masteryScore: number;     // 0-100
  isMastered: boolean;      // true if masteryScore >= 80
}

export interface ConceptProgress {
  concepts: Record<string, ConceptMastery>;
  totalConceptsMastered: number;
  totalConceptsExposed: number;
}

// Big Mind Process Types
export type BigMindStage = 'VOICE_ID' | 'VOICE_DIALOGUE' | 'WITNESS' | 'INTEGRATION' | 'REFLECTION' | 'SUMMARY';

export interface BigMindVoice {
  id: string;
  name: string;
  isDefault: boolean;
  description?: string;
}

export interface BigMindMessage {
  id: string;
  role: 'user' | 'witness';
  text: string;
  voiceName?: string; // Name of voice speaking (for user messages)
  timestamp: string;
  stage: BigMindStage;
  isStreaming?: boolean;
}

export interface BigMindInsightSummary {
  primaryVoices: string[]; // Voice names identified
  witnessPerspective: string; // Key insight from witness
  integrationCommitments: string[]; // What user commits to
  recommendedPractices: {
    practiceId: string;
    practiceName: string;
    rationale: string;
    alreadyInStack: boolean;
  }[];
}

export interface BigMindSession {
  id: string;
  date: string;
  currentStage: BigMindStage;
  voices: BigMindVoice[];
  messages: BigMindMessage[];
  summary?: BigMindInsightSummary;
  linkedInsightId?: string;
  completedAt?: string;
}

// Bias Finder Types
export type BiasFinderPhase =
  | 'ONBOARDING'      // Phase 0: Target acquisition
  | 'PARAMETERS'      // Phase 1: Gather context
  | 'HYPOTHESIS'      // Phase 2: Select bias to investigate
  | 'INTERROGATION'   // Phase 3: Socratic questioning
  | 'DIAGNOSTIC'      // Phase 4: Confirmation & loop decision
  | 'REPORT';         // Phase 5: Final report generation

export interface BiasFinderParameters {
  stakes: 'Low' | 'Medium' | 'High';
  timePressure: 'Ample' | 'Moderate' | 'Rushed';
  emotionalState: string; // Free text: e.g., "Calm", "Anxious", "Excited"
  decisionType?: 'hiring' | 'financial' | 'strategic' | 'interpersonal' | 'evaluation' | 'technical' | 'belief' | 'other'; // Type of decision for better bias detection
  context?: string; // Additional contextual information (e.g., "group meeting", "investment decision", "performance review")
}

export interface BiasHypothesis {
  biasId: string;
  biasName: string;
  confidence?: number; // 0-100, set after interrogation
  evidence?: string[]; // Collected during interrogation
  userConcurrence?: boolean; // Set in diagnostic phase
}

export interface BiasFinderMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  phase: BiasFinderPhase;
  timestamp: string;
}

export interface BiasFinderDiagnosticReport {
  decisionAnalyzed: string;
  parameters: BiasFinderParameters;
  biasesInvestigated: {
    biasId: string;
    biasName: string;
    confidence: number;
    keyFindings: string[];
    userConcurrence: boolean;
  }[];
  recommendations: string[];
  nextTimeChecklist: string[];
  generatedAt: string;
}

export interface BiasFinderSession {
  id: string;
  date: string;
  currentPhase: BiasFinderPhase;
  targetDecision: string; // The decision being analyzed
  parameters?: BiasFinderParameters;
  hypotheses: BiasHypothesis[]; // List of biases to investigate
  currentHypothesisIndex: number; // Which bias is being investigated
  messages: BiasFinderMessage[];
  diagnosticReport?: BiasFinderDiagnosticReport;
  completedAt?: string;
  linkedInsightId?: string; // Intelligence Hub integration
}

// Integral Body Architect Types
export type IntegralBodyArchitectStep = 'BLUEPRINT' | 'SYNTHESIS' | 'DELIVERY' | 'HANDOFF';

export type YinPracticeGoal = 'reduce-stress' | 'increase-focus' | 'wind-down' | 'increase-energy' | 'balance';

export interface TimeWindow {
  dayOfWeek: string;
  startHour: number;
  endHour: number;
}

export interface InjuryRestriction {
  bodyPart: string;
  severity: 'mild' | 'moderate' | 'severe';
  restrictions: string[]; // e.g., "no overhead pressing", "avoid running"
  affectedMovements?: string[]; // e.g., ['squatting', 'overhead pressing', 'running']
  painLevel?: number; // 1-10 scale
  medicalClearance?: boolean; // Has doctor cleared for exercise?
  notes?: string;
}

export interface YangConstraints {
  // Core Biometrics (PHASE 1 - Essential)
  bodyweight?: number; // in kg
  height?: number; // in cm
  age?: number; // years
  sex?: 'male' | 'female' | 'other';
  activityLevel?: 'sedentary' | 'lightly-active' | 'moderately-active' | 'very-active' | 'athlete';

  // Training Background (PHASE 1)
  strengthTrainingExperience?: 'never' | 'beginner' | 'intermediate' | 'advanced';
  primaryGoal?: 'lose-fat' | 'gain-muscle' | 'recomp' | 'maintain' | 'performance' | 'general-health';

  // Session Constraints (PHASE 1)
  maxWorkoutDuration?: number; // minutes per session
  sleepHours?: number; // target hours per night
  equipment: string[];
  unavailableDays: string[];
  preferredWorkoutTimes?: ('morning' | 'afternoon' | 'evening')[];

  // Advanced Constraints (Existing)
  availableTimeWindows?: TimeWindow[]; // Optional: specific availability windows
  injuryRestrictions?: InjuryRestriction[]; // Optional: injury/pain restrictions
  nutritionFocus?: string;
  additionalConstraints?: string;

  // Body Composition (Optional)
  targetBodyComposition?: {
    currentBodyFat?: number; // percentage
    targetBodyFat?: number; // percentage
    targetWeight?: number; // kg
  };

  // Enhanced Nutrition (PHASE 2)
  nutritionDetails?: {
    targetCalories?: number; // kcal/day (if known by user)
    proteinGramsPerKg?: number; // e.g., 1.6-2.2 for muscle gain
    dietaryRestrictions?: string[]; // ['gluten-free', 'dairy-free', 'vegetarian', 'vegan']
    mealsPerDay?: number; // 2, 3, 4, 5+
    cookingSkill?: 'minimal' | 'basic' | 'intermediate' | 'advanced';
  };
}

export interface YinPreferences {
  goal: YinPracticeGoal;
  experienceLevel: 'Beginner' | 'Intermediate';
  intentions?: string[];
  additionalNotes?: string;
}

export interface WorkoutRoutine {
  name: string;
  exercises: {
    name: string;
    sets: number;
    reps: string;
    notes?: string;
  }[];
  duration: number; // minutes
  notes?: string;
}

export interface MealPlan {
  breakfast: { description: string; protein: number; };
  lunch: { description: string; protein: number; };
  dinner: { description: string; protein: number; };
  snacks?: { description: string; protein: number; };
  totalProtein: number;
  totalCalories?: number;
  notes?: string;
}

export interface SynergyNote {
  type: 'pairing-benefit' | 'conflict-warning' | 'timing-optimization' | 'constraint-note';
  message: string;
  relatedItems?: string[]; // Names of practices or activities this relates to
}

export interface YinPracticeDetail {
  name: string;
  practiceType: string; // e.g., "Coherent Breathing", "Qigong"
  duration: number; // minutes
  timeOfDay: string; // e.g., "Morning", "30min before bedtime"
  intention: string;
  instructions: string[];
  synergyNotes?: SynergyNote[]; // Why this practice works well in this plan
  schedulingConfidence?: number; // 0-100: How confident LLM is about this placement
}

export interface DayPlan {
  dayName: string; // e.g., "Monday"
  summary: string; // e.g., "Workout A | Morning Qigong | Meal Plan"
  workout?: WorkoutRoutine;
  yinPractices: YinPracticeDetail[];
  nutrition: MealPlan;
  sleepHygiene: string[];
  notes?: string;
  synergyMetadata?: {
    yangYinBalance: string; // e.g., "High intensity workout balanced with calming evening practice"
    restSpacingNotes?: string; // Notes about rest/recovery spacing
    constraintResolution?: string; // How conflicts were resolved
  };
}

export interface HistoricalComplianceSummary {
  totalPlansAnalyzed: number;
  averageWorkoutCompliance: number;
  averageYinCompliance: number;
  commonBlockers: string[];
  bestPerformingDayPatterns: string[];
  recommendedAdjustments: string[];
}

export interface PlanSynthesisMetadata {
  llmConfidenceScore: number; // 0-100: Overall confidence in the plan
  constraintConflicts: {
    type: string; // e.g., "injury-restriction", "unavailable-window", "rest-spacing"
    description: string;
    resolution: string; // How it was resolved
  }[];
  synergyScoring: {
    yangYinPairingScore: number; // 0-100: How well Yang/Yin are balanced
    restSpacingScore: number; // 0-100: How well rest is spaced
    overallIntegrationScore: number; // 0-100: Overall integration quality
  };
  fallbackOptions?: string[]; // Alternative scheduling if conflicts arise
}

export interface IntegralBodyPlan {
  id: string;
  date: string;
  weekStartDate: string; // ISO date string for the Monday of the plan
  goalStatement: string;
  yangConstraints: YangConstraints;
  yinPreferences: YinPreferences;
  weekSummary: string;
  dailyTargets: {
    proteinGrams: number;
    sleepHours: number;
    workoutDays: number;
    yinPracticeMinutes: number;
  };
  days: DayPlan[];
  shoppingList?: string[];
  synthesisMetadata?: PlanSynthesisMetadata; // Metadata about plan generation and constraints
  historicalContext?: HistoricalComplianceSummary; // Compliance history from previous plans
}

export interface IntegralBodyArchitectSession {
  id: string;
  date: string;
  currentStep: IntegralBodyArchitectStep;
  goalStatement?: string;
  yangConstraints?: YangConstraints;
  yinPreferences?: YinPreferences;
  generatedPlan?: IntegralBodyPlan;
}

// Insight Practice Map (Progress of Insight / 16 Ñanas) Types
export type InsightPhase = 'Pre-Vipassana' | 'Vipassana Begins' | 'Dark Night' | 'High Equanimity';

export interface InsightStage {
  stage: number;
  name: string;
  code: string;
  phase: InsightPhase;
  description: string;
  keyMarkers: string[];
  practiceTips: string[];
  duration: string;
  warnings?: string[];
}

export interface InsightStageLog {
  stageNumber: number;
  stageName: string;
  dateNoted: string;
  notes?: string;
  cycleNumber?: number;
}

export interface InsightChatMessage {
  id: string;
  role: 'user' | 'grok';
  text: string;
  timestamp: string;
}

export interface InsightPracticeMapSession {
  id: string;
  date: string;
  currentStage?: number; // Which stage the user thinks they're at
  stageHistory: InsightStageLog[]; // Log of stages they've been through
  cycleCount: number; // How many times through all 16 stages
  chatHistory: InsightChatMessage[];
  notes?: string;
}

// Plan History Types
export interface PlanDayFeedback {
  date: string; // ISO date string (YYYY-MM-DD)
  dayName: string; // e.g., "Monday"
  completedWorkout: boolean;
  completedYinPractices: string[]; // Array of practice names completed
  intensityFelt: number; // 1-10 scale
  energyLevel: number; // 1-10 scale
  blockers?: string; // Notes about what got in the way
  notes?: string; // General reflections
  timestamp: string; // ISO timestamp when feedback was logged
}

export interface PlanHistoryEntry {
  planId: string;
  planDate: string;
  weekStartDate: string;
  goalStatement: string;
  startedAt: string; // ISO timestamp when plan was activated
  dailyFeedback: PlanDayFeedback[]; // One entry per day
  aggregateMetrics?: {
    workoutComplianceRate: number; // % of planned workouts completed
    yinComplianceRate: number; // % of planned yin practices completed
    averageIntensity: number;
    averageEnergy: number;
    totalBlockerDays: number;
  };
  completedAt?: string; // ISO timestamp when plan was completed (end of week)
  status: 'active' | 'completed' | 'abandoned';
}

export interface PlanProgressByDay {
  [planId: string]: {
    [dateKey: string]: PlanDayFeedback; // dateKey is ISO date string
  };
}

// Personalization & Adaptive Tuning Types
export interface AdjustmentDirective {
  type: 'intensity-nudge' | 'yin-duration' | 'yang-spacing' | 'practice-swap' | 'time-shift' | 'recovery-boost' | 'load-reduction' | 'load-increase';
  description: string;
  rationale: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number; // 0-100
}

export interface InferredPreference {
  type: 'preferred-time' | 'high-compliance-modality' | 'low-compliance-modality' | 'energy-pattern' | 'blocker-pattern' | 'intensity-tolerance';
  value: string;
  frequency: number; // Times observed in history
  compliance?: number; // Compliance rate for this preference
  notes?: string;
}

export interface PersonalizationSummary {
  planCount: number;
  analysisPeriodDays: number;
  timeWeightedAverage: {
    workoutCompliance: number;
    yinCompliance: number;
    averageIntensity: number;
    averageEnergy: number;
  };
  adjustmentDirectives: AdjustmentDirective[];
  inferredPreferences: InferredPreference[];
  commonBlockers: string[];
  bestPerformingDayPatterns: string[];
  recommendedIntensityLevel: 'low' | 'moderate' | 'high';
  recommendedYinDuration: number; // minutes per day
  recommendedRecoveryDays: number;
  summary: string; // Human-readable summary of personalization insights
}

// Workout Architecture Types
export interface WorkoutExercise {
  name: string;
  sets: number;
  reps: string;
  duration?: number;
  tempo?: string;
  restSeconds?: number;
  notes?: string;
  modifications?: string[];
  formGuidance?: string[];
}

export interface GeneratedWorkout {
  id: string;
  name: string;
  intensity: 'light' | 'moderate' | 'intense';
  duration: number;
  equipment: string[];
  exercises: WorkoutExercise[];
  warmup?: {
    name: string;
    duration: number;
    description: string;
  };
  cooldown?: {
    name: string;
    duration: number;
    description: string;
  };
  muscleGroupsFocused: string[];
  caloriesBurned?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  notes?: string;
  somaticGuidance?: string;
}

export interface WorkoutProgram {
  id: string;
  date: string;
  title: string;
  summary: string;
  workouts: GeneratedWorkout[];
  weekView?: Record<string, GeneratedWorkout>;
  personalizationNotes?: string;
  progressionRecommendations?: string[];
}

// Memory Reconsolidation Types
export type MemoryReconsolidationStep = 'ONBOARDING' | 'BELIEF_IDENTIFICATION' | 'CONTRADICTION_MINING' | 'JUXTAPOSITION' | 'GROUNDING' | 'INTEGRATION' | 'COMPLETE';

export type BeliefCategory = 'identity' | 'capability' | 'worthiness' | 'safety' | 'belonging' | 'possibility' | 'other';

export type AffectTone = 'shame' | 'fear' | 'anger' | 'sadness' | 'grief' | 'confusion' | 'mixed' | 'neutral';

export type NervousSystemCueType = 'breath' | 'body-sensation' | 'grounding' | 'resourcing' | 'movement' | 'sound';

export type GroundingModality = 'breath' | 'somatic' | 'cognitive' | 'relational' | 'environmental' | 'sound';

export type IntegrationChoiceType = 'embodied-action' | 'cognitive-reframe' | 'somatic-anchor' | 'relational-shift' | 'practice-stack';

/** Represents an implicit belief surfaced during session. */
export interface ImplicitBelief {
  id: string;
  belief: string; // The belief statement itself (e.g., "I'm not good enough")
  emotionalCharge: number; // 1-10 intensity scale
  category: BeliefCategory; // Categorization of belief type
  affectTone: AffectTone; // Emotional signature
  bodyLocation?: string; // Where held in body (e.g., "chest", "stomach")
  originStory?: string; // When/how belief formed
  limitingPatterns?: string[]; // Behaviors/thoughts this belief drives
  depth: 'surface' | 'moderate' | 'deep'; // How entrenched the belief is
}

/** Baseline and post-shift intensity tracking. */
export interface IntensityReading {
  baselineIntensity: number; // 1-10 scale at session start
  postIntensity?: number; // 1-10 scale after processing
  shiftPercentage?: number; // % change: ((post - baseline) / baseline) * 100
}

/** Contradictory evidence and resources for working with a belief. */
export interface ContradictionInsight {
  beliefId: string; // References the ImplicitBelief being worked with
  anchors: string[]; // Counter-evidence or lived examples contradicting the belief
  newTruths: string[]; // Alternative, more empowering perspectives
  regulationCues: string[]; // Somatic/cognitive resources (breath, grounding statements, sensations)
  juxtapositionPrompts: string[]; // Guided prompts for holding both old belief and new truth
  dateIdentified: string; // ISO timestamp when contradiction was mined
}

/** Metadata for a juxtaposition cycle step. */
export interface JuxtapositionCycleStep {
  stepNumber: number; // 1, 2, 3... for cycling through prompts
  prompt: string; // The juxtaposition prompt given to user
  userResponse?: string; // User's response to the prompt
  timestamp?: string; // When step was completed
  somaticNotations?: string; // Observations of body/nervous system state
}

/** A cycle of holding both belief and contradiction. */
export interface JuxtapositionCycle {
  id: string;
  beliefId: string; // The belief being worked with
  cycleNumber: number; // 1st, 2nd, 3rd cycle through prompts
  steps: JuxtapositionCycleStep[];
  intensity: IntensityReading; // Intensity before/after cycle
  completedAt?: string;
  notes?: string;
}

/** Grounding/regulation resource selected for nervous system support. */
export interface GroundingOption {
  id: string;
  name: string; // e.g., "5-4-3-2-1 Grounding", "Vagus Tapping", "Safe Place Visualization"
  description: string;
  icon?: string; // Display icon for UI
  modality?: GroundingModality;
  duration?: number; // seconds or minutes
  instructions?: string[];
  cueType?: NervousSystemCueType;
  supportedAffects?: AffectTone[];
}

/** Integration practice selection for post-reconsolidation anchoring. */
export interface IntegrationSelection {
  id: string;
  practiceId: string; // References existing practice from constants
  practiceName: string;
  rationale: string; // Why this practice supports the new perspective
  frequency?: 'daily' | 'weekly' | 'as-needed';
  durationMinutes?: number;
  notes?: string;
}

/** Summary of session outcomes. */
export interface SessionCompletionSummary {
  intensityShift: number; // Change from baseline intensity (e.g., -2, 0, +1)
  integrationChoice: IntegrationChoiceType;
  selectedPractices: IntegrationSelection[];
  userInsights?: string; // User's own reflections on the shift
  nextStepRecommendations?: string[];
  notes?: string;
  completedAt?: string;
}

/** Main Memory Reconsolidation session data. */
export interface MemoryReconsolidationSession {
  id: string;
  date: string;
  currentStep: MemoryReconsolidationStep;
  implicitBeliefs: ImplicitBelief[];
  contradictionInsights: ContradictionInsight[];
  juxtapositionCycles: JuxtapositionCycle[];
  groundingOptions: GroundingOption[];
  selectedGrounding?: GroundingOption; // Currently active grounding resource
  integrationSelections: IntegrationSelection[];
  baselineIntensity: number; // Overall intensity at session start
  completionSummary?: SessionCompletionSummary;
  sessionNotes?: string;
  completedAt?: string;
  linkedInsightId?: string; // Link to IntegratedInsight for tracking patterns
}

/** Draft/in-progress Memory Reconsolidation session (extends Session with partial fields). */
export interface MemoryReconsolidationDraft extends Partial<MemoryReconsolidationSession> {
  currentStep: MemoryReconsolidationStep;
  id: string;
  date: string;
}

// 8 Zones of Knowing Types
export type EightZonesStep = 'ONBOARDING' | 'TOPIC_DEFINITION' | 'ZONE_1' | 'ZONE_2' | 'ZONE_3' | 'ZONE_4' | 'ZONE_5' | 'ZONE_6' | 'ZONE_7' | 'ZONE_8' | 'SYNTHESIS' | 'COMPLETE';

export interface ZoneDefinition {
  zoneNumber: number;
  quadrant: 'UL' | 'UR' | 'LL' | 'LR';
  perspective: 'inside' | 'outside';
  focus: string; // e.g., "Subjective Experience"
  keyQuestion: string; // e.g., "What is the direct, first-person experience?"
  methodologies: string[]; // e.g., ["Phenomenology", "Meditation", "Introspection"]
  description: string; // Detailed explanation of the zone
  examples: string[]; // Real-world examples
}

export interface ZoneAnalysis {
  zoneNumber: number;
  zoneFocus: string;
  userInput: string; // User's reflection/analysis for this zone
  aiEnhancement?: string; // AI-generated deeper insights
  keyInsights?: string[]; // Extracted key points
  generatedAt?: string;
}

export interface ZoneConnection {
  fromZone: number;
  toZone: number;
  relationship: string; // Describes how these zones relate
  bidirectional?: boolean;
}

export interface EightZonesSession {
  id: string;
  userId: string;
  date: string;
  focalQuestion: string; // The main topic/issue being analyzed
  focalQuestionContext?: string; // Additional context about the topic
  currentStep: EightZonesStep;
  linkedInsightId?: string; // Intelligence Hub integration

  // Analyses for each zone
  zoneAnalyses: Record<number, ZoneAnalysis>; // Key: zone number 1-8, Value: analysis data

  // AI-facilitated connection dialogues (new!)
  connectionReflections?: {
    zones: string; // e.g., "Zones 1-2"
    dialogue: DialogueEntry[]; // Re-use the { role: 'user' | 'bot', text: string } type
  }[];

  // Connections discovered between zones
  zoneConnections?: ZoneConnection[];

  // Synthesis data
  blindSpots?: string[]; // Missing perspectives revealed
  novelInsights?: string[]; // New understandings discovered
  recommendations?: string[]; // Actionable recommendations
  synthesisReport?: string; // Full integrated analysis

  // Session metadata
  completedAt?: string;
  draftSavedAt?: string;
}

export interface EightZonesDraft extends Partial<EightZonesSession> {
  id?: string;
  userId: string;
  linkedInsightId?: string; // Intelligence Hub integration
}

// ============================================================================
// Psychedelic Journey Session
// ============================================================================

export type PsychedelicJourneyStatus = 'preparing' | 'prepared' | 'integrating' | 'complete';

export type PsychedelicJourneySubstance =
  | 'psilocybin'
  | 'lsd'
  | 'mdma'
  | 'ayahuasca'
  | 'dmt'
  | 'mescaline'
  | 'ketamine'
  | 'cannabis'
  | 'breathwork'
  | 'holotropic'
  | 'other';

export interface PsychedelicJourneySession {
  id: string;
  date: string;  // ISO string, creation date
  status: PsychedelicJourneyStatus;
  linkedInsightId?: string;

  // ===== PRE-SESSION (Steps 1-4) =====

  // Step 1: Substance & Context
  substance: PsychedelicJourneySubstance;
  substanceOther?: string;  // if substance === 'other'
  dosageDescription?: string;
  plannedDate?: string;  // ISO string
  previousExperience?: 'none' | 'few' | 'moderate' | 'extensive';

  // Step 2: Set (Inner Landscape)
  currentEmotions: string[];  // multi-select
  mindState: string;  // freeform
  bodyState?: string;  // freeform
  concerns: string;  // freeform
  aiReflection?: string;  // AI-generated

  // Step 3: Setting & Intentions
  environment: string;  // freeform description
  companions: 'alone' | 'sitter' | 'guide' | 'group' | 'therapist' | 'other';
  companionDetails?: string;
  safetyChecklist: Record<string, boolean>;
  rawIntention: string;  // user's initial intention
  refinedIntention?: string;  // AI-refined
  useRefinedIntention?: boolean;  // did they accept AI refinement

  // Step 4: Ready (Summary)
  sessionGuideGenerated?: boolean;
  prepCompletedAt?: string;  // ISO string

  // ===== POST-SESSION (Steps 5-8) =====

  // Step 5: Welcome Back
  integrationStartedAt?: string;  // ISO string
  daysSinceSession?: number;  // user-reported
  currentPostEmotions?: string[];
  overallTone?: 'grateful' | 'confused' | 'overwhelmed' | 'peaceful' | 'mixed' | 'difficult';

  // Step 6: What Happened
  narrative?: string;  // freeform account
  keyMoments?: string[];  // up to 5 key moments
  emotionsExperienced?: string[];
  peakDescription?: string;
  challengingMoments?: string;

  // Step 7: Meaning & Insights
  aiThemes?: string[];  // AI-detected themes
  quadrantMapping?: {
    body?: string;
    mind?: string;
    spirit?: string;
    shadow?: string;
  };
  connectionToIntention?: string;  // AI analysis
  userInsights?: string;  // user's own meaning-making

  // Step 8: Integration & Actions
  practices?: string[];  // suggested practices
  concreteSteps?: string[];  // user-committed actions
  aiSynthesis?: string;  // final AI synthesis
  suggestedFollowUpWizards?: string[];  // wizard IDs
  followUpDate?: string;  // ISO string
  completedAt?: string;  // ISO string

  // ===== ADDITIONAL FIELDS =====
  currentIntegrationBodyState?: string;  // Body check-in during integration welcome-back
  surrenderReflection?: string;  // Surrender exercise journal entry (prep phase)
  chatSummary?: string;  // AI-generated summary of chat conversation

  // ===== CHAT CONVERSATION (Optional Final Step) =====
  chatMessages?: PsychedelicChatMessage[];  // Conversation history
  chatSkipped?: boolean;  // User chose to skip chat

  // Safety tracking
  crisisLevel?: CrisisLevel;
}

export interface PsychedelicChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;  // ISO string
}

// ============================================================================
// Intelligence Hub Types - Unified AI Guidance System
// ============================================================================

export interface CompletionRecord {
  practiceId: string;
  date: string;
  completed: boolean;
}

export interface WizardSessionSummary {
  type: string;
  date: string;
  keyInsights: string[];
  sessionData?: unknown;
}

export interface IntelligenceContext {
  // Current state
  currentPracticeStack: AllPractice[];
  practiceNotes: Record<string, string>;
  completionHistory: CompletionRecord[];

  // Wizard sessions
  wizardSessions: WizardSessionSummary[];

  // Insights
  integratedInsights: IntegratedInsight[];
  pendingPatterns: string[];

  // User profile
  developmentalStage?: KeganStage;
  attachmentStyle?: string;
  primaryChallenges: string[];
}

export interface PracticeRecommendation {
  practice: AllPractice;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  startTiming?: string; // e.g., "Week 2, after 1 Polarity session"
  timeCommitment?: string; // e.g., "10 min/day for 7 days"
  integration?: string; // How to integrate with existing practices
  sequenceWeek?: number; // Which week to start this practice
  sequenceGuidance?: string; // When to start (e.g., "Week 2, after 1 Polarity session")
  expectedBenefits?: string; // Expected benefits from this practice
  integrationTips?: string; // Tips for integrating with existing practices
  microHabit?: string; // A <2 minute version of the practice for easy adoption
}

export interface PracticeAdjustment {
  practiceId: string;
  practiceName: string;
  suggestion: string;
}

export interface StackBalance {
  body: string;
  mind: string;
  spirit: string;
  shadow: string;
}

export interface WizardRecommendation {
  type: string;
  name: string;
  reason: string;
  focus: string;
  priority: 'high' | 'medium' | 'low';
  confidence?: number; // 0-1 scale
  evidence?: string[]; // [Session-ID], [Insight-ID]
  timing?: string; // e.g., "this_week", "next_week"
}

export interface IntelligentGuidance {
  synthesis: string; // Coherent narrative of where user is
  primaryFocus: string; // What matters most right now

  recommendations: {
    nextWizard?: WizardRecommendation;

    practiceChanges?: {
      add?: PracticeRecommendation[];
      remove?: string[];
      modify?: PracticeAdjustment[];
    };

    insightWork?: {
      pattern: string;
      approachSuggestion: string;
    };

    stackBalance?: StackBalance;

    predictiveAlerts?: PredictiveAlert[];
  };

  reasoning: {
    whatINoticed: string[];
    whyThisMatters: string[];
    howItConnects: string[];
  };

  cautions: string[];
  openQuestion?: string; // A genuine question back to the user that proves the AI is thinking
  generatedAt: string;
  rawMarkdown?: string; // Full markdown response for UI rendering
}

export interface CachedGuidance {
  guidance: IntelligentGuidance;
  cachedAt: number; // timestamp
  contextHash: string; // hash of context to detect changes
}

// ============================================================================
// Practice Sequencing Types
// ============================================================================

export interface PracticeSequencePhase {
  name: string;
  description: string;
  practices: PracticeRecommendation[];
}

export interface PracticeSequencing {
  phases: PracticeSequencePhase[];
  totalWeeks: number;
  guidance: string;
}

export interface IntelligentGuidanceWithSequencing extends IntelligentGuidance {
  sequencing?: PracticeSequencing;
  recommendations: IntelligentGuidance['recommendations'] & {
    practiceChanges: (IntelligentGuidance['recommendations']['practiceChanges'] & {
      sequenced?: PracticeRecommendation[];
    });
  };
}

// ============================================================================
// Confidence Validation & Tonal Shifts
// ============================================================================

export interface ConfidenceValidationResult {
  isValid: boolean;
  claimedConfidence: 'high' | 'medium' | 'low' | 'unknown';
  actualConfidence: 'high' | 'medium' | 'low';
  mismatchFound: boolean;
  mismatchType?: 'overconfident' | 'underconfident';
  suggestion?: string;
}

export type ToneType = 'exploratory' | 'observational' | 'definitive';

export interface TonalShiftResult {
  originalText: string;
  shiftedText: string;
  toneUsed: ToneType;
  changesApplied: string[];
}

// ============================================================================
// Adaptive Cycle Wizard Types
// ============================================================================

// Optional user self-assessment (used as "hint" for AI, not a hard diagnosis)
export interface AdaptiveCycleDiagnosticAnswers {
  potential: number; // Score from 1-10 (Low to High)
  connectedness: number; // Score from 1-10 (Low to High)
  resilience: number; // Score from 1-10 (Low to High)
}

// Content for a single quadrant on the Adaptive Cycle map
export interface AdaptiveCycleQuadrantAnalysis {
  phase: 'r' | 'K' | 'Ω' | 'α';
  title: string; // e.g., "Growth / Exploitation (r)"
  points: string[]; // 3-5 specific bullet points for this quadrant
}

export interface AdaptiveCycleSession {
  id: string;
  date: string;
  systemToAnalyze: string; // The user's context, e.g., "My Career"
  // Optional self-assessment from the user (used as hint for AI)
  userHint?: AdaptiveCycleDiagnosticAnswers;
  // The main data: the full, four-quadrant map
  cycleMap: {
    r: AdaptiveCycleQuadrantAnalysis;
    K: AdaptiveCycleQuadrantAnalysis;
    Ω: AdaptiveCycleQuadrantAnalysis;
    α: AdaptiveCycleQuadrantAnalysis;
  };
  // This will be used for the rich report in the insight journal
  fullReport?: string;
}

// ===== BIOENERGETICS & BREATHING TYPES =====

export interface BioenergeneticsStep {
  order: number;
  title: string;
  instructions: string; // Clear, embodied cues
  duration?: string; // "30-60 seconds" or "until you feel trembling"
  cues: string[]; // Body sensation cues, breath coordination
  safety?: string; // Safety note for this step
  ifModified?: string; // Modification or what to do if something goes wrong
}

export interface BioenergeneticsPractice {
  id: string;
  name: string;
  shortDescription: string; // 1-2 lines for menu
  intention: string; // "Release chest armor," "Build grounding," etc.
  duration: { min: number; max: number }; // in minutes
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  focusSegments: string[]; // Which segments it targets (ocular, oral, cervical, etc.)
  safetyNotes: string[];
  contraindications: string[];
  evidenceLevel: 'Strong' | 'Moderate' | 'Emerging';
  primaryMechanism: string; // What's happening physiologically

  // Sub-wizard content
  explanation: {
    overview: string; // 2-3 paragraphs
    mechanism: string; // What's happening physiologically
    benefits: string[];
    whenToUse: string;
  };

  steps: BioenergeneticsStep[];

  // Chatbot knowledge base (curated Q&A, no LLM)
  commonQuestions: {
    question: string;
    answer: string;
  }[];

  // Optional fields for advanced practices
  requiresContraindicationScreen?: boolean; // For high-risk practices like Holotropic
  musicPlaylists?: Array<{
    title: string;
    url: string;
  }>;
}

export interface BioenergeneticsSession {
  id: string;
  userId: string;
  date: string;
  practiceId: string;
  practiceName: string;

  // Session data
  completedAt?: string;
  durationMinutes?: number;
  currentStep?: number;

  // Subjective experience
  intentionSet?: string;
  sensationsNoticed?: string[];
  emotionsArose?: string[]; // "relief", "tears", "anger", etc.
  vibrationObserved?: boolean;
  vibrationLocation?: string;

  // Safety data
  sudsAtStart?: number; // 0-10 distress scale
  sudsAtEnd?: number;
  sudsMax?: number;
  dissociationOccurred?: boolean;
  overwhelmOccurred?: boolean;

  // Notes & linking
  userNotes?: string;
  linkedInsightId?: string; // For Intelligence Hub synthesis
}

export interface ChatbotMessage {
  role: 'user' | 'bot';
  text: string;
  timestamp: number;
}

// ============================================================================
// Phase 4: Cross-Modal Detection & Predictive Guidance Types
// ============================================================================

/**
 * Union type for all session types across modalities
 * Used by cross-modal analyzer to detect patterns across Shadow/Body/Mind/Spirit
 */
export type AllSessionTypes =
  | ThreeTwoOneSession
  | IFSSession
  | BiasDetectiveSession
  | SubjectObjectSession
  | PerspectiveShifterSession
  | PolarityMap
  | KeganAssessmentSession
  | AttachmentAssessmentSession
  | RoleAlignmentSession
  | BigMindSession
  | BiasFinderSession
  | SomaticPracticeSession
  | PolyvagalSession
  | JhanaSession
  | IntegralBodyArchitectSession
  | MemoryReconsolidationSession
  | EightZonesSession
  | AdaptiveCycleSession
  | ShadowSessionResult
  | BioenergeneticsSession
  | SchemaSession
  | ImmunityToChangeSession;

/**
 * Cross-modal pattern detected across multiple modalities
 * Shows how shadow themes manifest in body/mind/spirit sessions
 */
export interface CrossModalPattern {
  id: string;
  shadowTheme?: string; // e.g., "fear of rejection", "shame"
  somaticPattern?: string; // e.g., "chronic shoulder tension", "shallow breathing"
  mindPattern?: string; // e.g., "confirmation bias", "black-and-white thinking"
  spiritPattern?: string; // e.g., "difficulty with lovingkindness", "disconnection"
  strength: number; // 0-1, based on consistency across modalities
  relatedInsights: string[]; // IntegratedInsight IDs
  relatedSessions: Array<{
    sessionId: string;
    sessionType: string;
    modality: 'shadow' | 'body' | 'mind' | 'spirit';
    date: string;
  }>;
  firstDetected: string; // ISO timestamp
  lastObserved: string; // ISO timestamp
}

/**
 * Specialized IntegratedInsight for cross-modal patterns
 * Extends IntegratedInsight with cross-modal metadata
 */
export interface CrossModalInsight extends IntegratedInsight {
  mindToolType: 'Cross-Modal';
  crossModalPattern: CrossModalPattern;
  modalitiesInvolved: Array<'shadow' | 'body' | 'mind' | 'spirit'>;
  synthesisNarrative: string; // How the pattern manifests across modalities
}

/**
 * Developmental phase classification based on session history
 */
export type DevelopmentalPhase =
  | 'early_stabilization' // Just starting, building basic practices
  | 'pattern_recognition' // Identifying recurring patterns
  | 'integration' // Actively integrating insights into life
  | 'advanced_practice'; // Sophisticated multi-modal work

/**
 * Predictive alert for upcoming challenges
 */
export interface PredictiveAlert {
  id: string;
  type: 'risk' | 'opportunity' | 'transition';
  severity: 'low' | 'medium' | 'high';
  timeframe: string; // e.g., "next 2-3 weeks", "1-2 months"
  title: string;
  description: string;
  triggerIndicators: string[]; // What signs led to this prediction
  recommendation: GuidanceRecommendation;
  confidence: number; // 0-1
  generatedAt: string;
  recommendedModality?: 'shadow' | 'body' | 'mind' | 'spirit' | 'multi-modal';
  developmentalPhase?: DevelopmentalPhase;
}

/**
 * Forecast for next challenge based on pattern trends
 */
export interface Forecast {
  timeframe: string; // e.g., "14-21 days", "1-2 months"
  likelyChallenge: string; // What challenge is predicted
  confidence: number; // 0-1
  triggerIndicators: string[]; // Signs that suggest this forecast
  recommendedModality: 'shadow' | 'body' | 'mind' | 'spirit' | 'multi-modal';
  preparatoryPractices: string[]; // Practice IDs to prepare
  rationale: string; // Why this forecast was made
}

/**
 * Guidance recommendation from predictive engine
 */
export interface GuidanceRecommendation {
  action: string; // What to do
  priority: 'critical' | 'high' | 'medium' | 'low';
  practices: Array<{
    practiceId: string;
    practiceName: string;
    rationale: string;
    frequency: string;
  }>;
  wizards: Array<{
    wizardType: string;
    wizardName: string;
    reason: string;
    focus: string;
  }>;
  timing: string; // When to act
}

// ============================================================================
// Schema Therapy Types (Schema Detective Wizard)
// ============================================================================

/**
 * Test IDs for Schema Detective assessments
 * Supports both legacy and new structured assessment types
 */
export type SchemaTestId =
  // New structured assessments
  | 'ems'              // Early Maladaptive Schemas (structured Likert-scale questionnaire)
  | 'schema-modes'     // Schema modes assessment (structured Likert-scale)
  | 'coping-style'     // Coping style assessment (structured or conversational)
  // Legacy conversational assessments (backward compatibility)
  | 'core-schema'      // Legacy: Identify primary Early Maladaptive Schemas (EMS)
  | 'mode-identification' // Legacy: Identify active schema modes
  | 'trigger-pattern'; // Identify triggers and emotional responses

/**
 * Schema domain classifications (based on Young's schema therapy)
 */
export type SchemaDomain =
  | 'disconnection-rejection'
  | 'impaired-autonomy'
  | 'impaired-limits'
  | 'other-directedness'
  | 'overvigilance-inhibition';

/**
 * Early Maladaptive Schema (EMS) names
 */
export type SchemaName =
  // Disconnection & Rejection
  | 'abandonment'
  | 'mistrust-abuse'
  | 'emotional-deprivation'
  | 'defectiveness-shame'
  | 'social-isolation'
  // Impaired Autonomy & Performance
  | 'dependence-incompetence'
  | 'vulnerability'
  | 'enmeshment'
  | 'failure'
  // Impaired Limits
  | 'entitlement-grandiosity'
  | 'insufficient-self-control'
  // Other-Directedness
  | 'subjugation'
  | 'self-sacrifice'
  | 'approval-seeking'
  // Overvigilance & Inhibition
  | 'negativity-pessimism'
  | 'emotional-inhibition'
  | 'unrelenting-standards'
  | 'punitiveness';

/**
 * Schema modes (functional states)
 */
export type SchemaMode =
  // Child Modes
  | 'vulnerable-child'
  | 'angry-child'
  | 'impulsive-child'
  | 'undisciplined-child'
  | 'happy-child'
  // Maladaptive Coping Modes
  | 'compliant-surrender'
  | 'detached-protector'
  | 'detached-self-soother'
  | 'self-aggrandizer'
  | 'bully-attack'
  // Maladaptive Parent Modes
  | 'punitive-parent'
  | 'demanding-parent'
  // Healthy Modes
  | 'healthy-adult';

/**
 * Coping style classifications
 */
export type CopingStyle =
  | 'surrender'        // Give in to the schema
  | 'avoidance'        // Avoid triggering the schema
  | 'overcompensation'; // Fight against the schema

// ============================================================================
// New Structured Assessment Types
// ============================================================================

/**
 * Likert scale configuration for structured questionnaires
 */
export interface LikertScaleConfig {
  min: number;
  max: number;
  labels: {
    min: string;  // e.g., "Completely disagree"
    max: string;  // e.g., "Completely agree"
    mid?: string; // Optional middle label
  };
  stepLabels?: Record<number, string>; // Optional labels for each step
}

/**
 * Severity level classification for schema scores
 */
export type SchemaSeverity = 'Low' | 'Medium' | 'High' | 'Very High' | 'None';

/**
 * Individual schema score from EMS assessment
 */
export interface SchemaScore {
  schemaName: SchemaName;
  name: string; // Alias for schemaName for compatibility
  domain: SchemaDomain;
  rawScore: number;        // Sum of Likert responses for this schema
  score: number;           // Alias for rawScore for compatibility
  normalizedScore: number; // 0-1 normalized score
  percentile?: number;     // Optional percentile ranking
  severity: SchemaSeverity;
  meetsThreshold: boolean; // Whether score >= 15 (typical threshold)
  isActive: boolean;       // Alias for meetsThreshold
  interpretation: string;  // Clinical interpretation string
  questionIds: string[];   // Questions that measured this schema
  responses: Array<{       // Individual responses for this schema
    questionId: string;
    questionText: string;
    response: number;
  }>;
  averageScore: number;    // Average response value
  description: string;     // Clinical description of this schema
  triggers?: string[];     // Common triggers for this schema
}

/**
 * Domain-level analysis aggregating multiple schemas
 */
export interface DomainAnalysis {
  domain: SchemaDomain;
  schemasInDomain: SchemaScore[];
  activeSchemas: SchemaScore[]; // Schemas in this domain meeting threshold
  aggregateScore: number;       // Combined score for all schemas in domain
  normalizedDomainScore: number; // 0-1 normalized
  dominantSchema: SchemaName;   // Highest-scoring schema in this domain
  domainSeverity: SchemaSeverity;
  insights: string[];           // Domain-level insights
  coreThemes: string[];         // Themes derived from active schemas
  prevalence: number;           // How many schemas in this domain are elevated (0-1)
}

/**
 * Individual mode score from schema modes assessment
 */
export interface ModeScore {
  mode: SchemaMode;          // Name of the mode
  modeName: SchemaMode;      // Alias for compatibility
  category: 'child' | 'coping' | 'parent' | 'healthy';
  rawScore: number;          // Sum of Likert responses
  normalizedScore: number;   // 0-1 normalized score
  percentile: number;        // Optional percentile ranking
  severity: SchemaSeverity;  // How strongly this mode is activated
  activationLevel: 'Low' | 'Moderate' | 'High' | 'Dominant'; // Alias/Derived from severity
  interpretation: string;    // Clinical description
  questionIds: string[];     // Questions that measured this mode
  responses: Array<{
    questionId: string;
    questionText: string;
    response: number;
  }>;
  averageScore: number;      // Average response value
  activationFrequency: 'rare' | 'occasional' | 'frequent' | 'constant';
  description: string;       // Clinical description of this mode
  typicalTriggers: string[]; // Common activation triggers
  typicalBehaviors: string[]; // Behavioral manifestations
}

/**
 * Complete mode profile from schema modes assessment
 */
export interface ModeProfile {
  scores: ModeScore[];
  modeScores: ModeScore[]; // Alias
  dominantMode: SchemaMode | null;
  dominantModes: Array<{     // Top 3-5 most activated modes
    modeName: SchemaMode;
    score: ModeScore;
    relativeStrength: number; // Compared to other modes (0-1)
  }>;
  childModes: {
    scores: ModeScore[];
    dominantChild: SchemaMode | null;
    interpretation: string;
  };
  copingModes: {
    scores: ModeScore[];
    dominantCoping: SchemaMode | null;
    interpretation: string;
  };
  parentModes: {
    scores: ModeScore[];
    dominantParent: SchemaMode | null;
    interpretation: string;
  };
  healthyAdult: {
    score: ModeScore;
    interpretation: string;
    strengthLevel: 'Underdeveloped' | 'Emerging' | 'Moderate' | 'Strong' | 'Well-Developed';
  };
  overallBalance: string;
  developmentalRecommendations: string[];

  // Legacy/Alternate fields
  categoryBreakdown: {       // Scores by mode category
    child: number;
    coping: number;
    parent: number;
    healthy: number;
  };
  overallAnalysis: string;   // Narrative synthesis
}

/**
 * Question types for schema tests (updated)
 */
export interface SchemaTestQuestion {
  id: string;
  text: string;
  category?: string; // Optional grouping (e.g., domain, mode type)
  schemaTarget?: SchemaName; // For EMS questions: which schema this measures
  modeTarget?: SchemaMode;   // For mode questions: which mode this measures
  reverseCoded?: boolean;    // Whether response should be reverse-scored
}

/**
 * User's response to a schema test question
 */
export interface SchemaTestResponse {
  questionId: string;
  response: string | number; // Could be Likert scale (1-5) or free text
  timestamp: number;
}

/**
 * Identified schema with confidence and evidence
 */
export interface IdentifiedSchema {
  name: SchemaName;
  domain: SchemaDomain;
  confidence: number; // 0-1
  description: string;
  triggers: string[];
  emotionalResponses: string[];
  behavioralPatterns: string[];
  evidenceFromAnswers: string[]; // Quotes/paraphrases from user responses
}

/**
 * Identified mode with activation context
 */
export interface IdentifiedMode {
  mode: SchemaMode;
  category: 'child' | 'coping' | 'parent' | 'healthy';
  confidence: number; // 0-1
  description: string;
  activationTriggers: string[];
  typicalBehaviors: string[];
  emotionalSignature: string;
  evidenceFromAnswers: string[];
}

/**
 * Identified coping pattern
 */
export interface IdentifiedCopingPattern {
  copingStyle: CopingStyle;
  confidence: number; // 0-1
  description: string;
  manifestations: string[]; // How it shows up in daily life
  schemasAssociated: SchemaName[];
  examples: string[];
}

/**
 * Trigger pattern analysis
 */
export interface TriggerPattern {
  trigger: string;
  frequency: 'rare' | 'occasional' | 'frequent' | 'constant';
  intensity: 'low' | 'medium' | 'high' | 'extreme';
  typicalResponse: string;
  associatedSchemas: SchemaName[];
  associatedModes: SchemaMode[];
  copingStrategiesUsed: string[];
}

/**
 * Severity level for schema scores (EMSA 90-item assessment)
 */
export type SchemaSeverityLevel = SchemaSeverity;

export type SchemaTestStatus = 'not-started' | 'in-progress' | 'completed' | 'abandoned';

/**
 * Domain-level analysis (aggregated from schemas in domain)
 */
export interface DomainAnalysis {
  domain: SchemaDomain;
  domainLabel: string; // Human-readable label
  totalScore: number; // Sum of all schema scores in this domain
  schemasInDomain: SchemaScore[]; // Reference to schemas in this domain
  interpretation: string; // Domain-level interpretation
  dominantSchemas: SchemaName[]; // Schemas that meet threshold (≥15)
}

/**
 * Result from analyzing a single schema test
 */
export interface SchemaTestResult {
  testId: SchemaTestId;
  status: SchemaTestStatus;
  startedAt?: string;      // ISO timestamp when test started
  completedAt?: string;    // ISO timestamp when test completed
  lastUpdatedAt?: string;  // ISO timestamp of last activity

  // Stored answers (for all test types)
  responses: SchemaTestResponse[]; // All user responses
  responseCount: number;           // Total number of responses

  // Results vary by test type
  identifiedSchemas?: IdentifiedSchema[]; // For core-schema test (legacy, pre-EMSA)
  schemaScores?: SchemaScore[]; // For EMSA 90-item core-schema test
  domainAnalyses?: DomainAnalysis[]; // Domain aggregation for EMSA
  identifiedModes?: IdentifiedMode[]; // For mode-identification test
  copingPatterns?: IdentifiedCopingPattern[]; // For coping-style test
  triggerPatterns?: TriggerPattern[];     // For trigger-pattern test

  // Common fields
  keyInsights: string[];
  narrative: string; // LLM-generated summary of findings
  confidence: number; // Overall confidence in the analysis (0-1)

  // Recommendations
  recommendedPractices: Array<{
    practiceId: string;
    practiceName: string;
    rationale: string;
  }>;
  recommendedMindTools: Array<{
    toolName: string;
    focus: string;
    reason: string;
  }>;

  // Metadata
  userId?: string | null;
  linkedInsightId?: string; // For Intelligence Hub integration
  rawAnalysisData?: unknown;    // Optional: store raw LLM output for debugging
}

/**
 * Unified profile synthesized from multiple schema tests
 */
export interface SchemaUnifiedProfile {
  userId?: string | null;
  generatedAt: string; // ISO timestamp

  // Synthesis flags
  insufficientTests?: boolean; // True if < 2 tests completed
  testsIncluded: SchemaTestId[];

  // Core findings (cross-test synthesis)
  dominantSchemas: Array<{
    schema: SchemaName;
    domain: SchemaDomain;
    strength: number; // 0-1, based on consistency across tests
    description: string;
    howItManifests: string[];
  }>;

  dominantModes: Array<{
    mode: SchemaMode;
    category: 'child' | 'coping' | 'parent' | 'healthy';
    frequency: string; // How often this mode is active
    description: string;
  }>;
  summary?: string;
  primaryDynamics?: Array<{
    title: string;
    description: string;
    schemas: string[];
    modes: string[];
    copingStyles: string[];
  }>;
  recommendedInterventions?: Array<{
    phase: string;
    description: string;
    actions: string[];
    focus: string;
  }>;

  primaryCopingStyles: Array<{
    style: CopingStyle;
    prevalence: number; // 0-1
    whenUsed: string;
  }>;

  // Pattern synthesis
  recurringThemes: string[]; // Themes that appear across multiple tests
  coreVulnerabilities: string[];
  strengths: string[]; // Healthy patterns, resources

  // Trigger map
  topTriggers: Array<{
    trigger: string;
    impact: string;
    linkedSchemas: SchemaName[];
  }>;

  // Recommendations
  priorityInterventions: Array<{
    type: 'practice' | 'wizard' | 'technique';
    name: string;
    rationale: string;
    expectedImpact: string;
  }>;

  developmentalFocus: string; // Overall guidance on growth direction
  synthesisNarrative: string; // LLM-generated narrative tying everything together

  // Enriched synthesis data (only when all 4 tests complete)
  integratedSentence?: string; // Dynamic sentence: "Your [top schema] schema manifests as [dominant mode]..."
  somaticMap?: Array<{
    bodyRegion: string; // e.g., "chest", "throat", "stomach", "shoulders"
    sensation: string; // e.g., "tightness", "heaviness", "constriction"
    linkedSchemas: SchemaName[];
  }>;
  historicalOrigins?: Array<{
    schema: SchemaName;
    likelyOrigin: string; // Childhood pattern or experience
    evidence: string; // Evidence from user responses
  }>;
  copingFlexibilityScore?: number; // 0-100, measures ability to adapt coping strategies
  copingFlexibilityRationale?: string; // Explanation of the score
  schemaToModeTriggerFlows?: Array<{
    schema: SchemaName;
    triggeredModes: SchemaMode[];
    commonTriggers: string[];
    typicalOutcome: string;
  }>;

  // Metadata
  confidence: number; // Overall confidence in synthesis (0-1)
  linkedInsightId?: string; // For Intelligence Hub integration
}

/**
 * Progress tracking for individual test within a session
 */
export interface SchemaTestProgress {
  testId: SchemaTestId;
  status: SchemaTestStatus;
  currentQuestionIndex?: number;  // For structured tests
  totalQuestions?: number;        // For structured tests
  percentComplete: number;        // 0-100
  startedAt?: string;
  lastActivityAt?: string;
}

/**
 * Complete schema detective session data (updated)
 */
export interface SchemaSession {
  sessionId: string;
  userId?: string | null;
  createdAt: string;
  lastUpdatedAt: string;

  // Current test state
  currentTestId?: SchemaTestId;   // Which test is currently active
  testProgress: Record<SchemaTestId, SchemaTestProgress>; // Progress for each test

  // Test completion tracking
  completedTests: SchemaTestId[];
  testResults: Record<SchemaTestId, SchemaTestResult>;

  // Unified profile (only present if >= 2 tests completed)
  unifiedProfile?: SchemaUnifiedProfile;

  // Session metadata
  userNotes?: string;
  linkedInsightId?: string; // For Intelligence Hub integration
  totalTimeSpent?: number;  // Total time spent in seconds (optional)
}

/**
 * Immunity to Change Session (Kegan & Lahey framework)
 * Maps the four-column structure revealing hidden competing commitments
 */
export interface ImmunityToChangeSession {
  id: string;
  date: string;
  improvementGoal: string;
  goalCategory: string;
  behaviors: string[];
  behaviorFrequencies: Record<string, number>;
  behaviorPatterns: string[];
  hiddenCommitments: string[];
  bigAssumptions: string[];
  assumptionTest?: string;
  expectedSurprise?: string;
  experimentDate?: string;
  somaticAnchor?: string;
  experimentResult?: string;
  linkedInsightId?: string;
}

/**
 * Decision Wizard Session - structured reflection for complex life decisions
 */
export interface DecisionAnalysis {
  synthesis: string;
  integralFraming: string;
  contemplations: string[];
  closing: string;
}

export interface DecisionSession {
  id: string;
  date: string;
  linkedInsightId?: string;

  // Phase 1: Input
  topic: string;

  // Phase 2: Generated options (from LLM)
  motivationsOptions: string[];
  challengesOptions: string[];
  advantagesOptions: string[];

  // Phase 3: User selections (includes custom entries)
  selectedMotivations: string[];
  selectedChallenges: string[];
  selectedAdvantages: string[];

  // Phase 4: Analysis
  analysis?: DecisionAnalysis;

  // State machine
  status: 'input' | 'generating' | 'quiz' | 'analyzing' | 'complete' | 'error';
  error?: string;
}

export interface ExaminingCoreBeliefSession {
  id: string;
  date: string;
  linkedInsightId?: string;

  // Step 1: Identify
  triggerEmotion: string;
  emotionIntensity: number;

  // Step 2: Articulate Belief
  beliefStatement: string;

  // Step 3: Examine Evidence
  evidenceFor: string[];
  evidenceAgainst: string[];

  // Step 4: Trace Origin
  originStory: string;
  isInheritedBelief: boolean;

  // Step 5: Update Belief
  newBelief: string;
  newBeliefReasoning: string;

  // Step 3 addition: relational inquiry
  relationalContext?: string;

  // Step 4 (new): Honor the Old Belief
  oldBeliefProtection?: string;

  // Step 6: Test Plan
  testPlan: string;
  testDuration: string;
  specificSituation?: string;

  // AI analysis result
  aiAnalysis?: {
    detectedPattern: string;
    beliefOriginInsight: string;
    shadowDimension: string;
    somaticAwareness: string;
    updatedBeliefStrength: number;
    integrationCommitment: string;
    recommendedPractice: { practiceName: string; rationale: string };
  };

  // Status
  status: 'input' | 'examining' | 'analyzing' | 'complete' | 'error';
  error?: string;
}

/**
 * Question bank structure for structured assessments
 */
export interface SchemaQuestionBank {
  questions: SchemaTestQuestion[];
  totalQuestions: number;
  questionsPerSchema?: number;    // For EMS: questions per schema
  questionsPerMode?: number;      // For modes: questions per mode
  randomizeOrder?: boolean;       // Whether to randomize question order
  allowSkip?: boolean;            // Whether users can skip questions
}

/**
 * Scoring methodology configuration
 */
export interface SchemaScoringConfig {
  method: 'sum' | 'average' | 'weighted';
  normalizationMethod: 'minmax' | 'zscore' | 'percentile';
  severityThresholds: {
    veryLow: number;
    low: number;
    medium: number;
    high: number;
    veryHigh: number;
  };
  minimumQuestionsForValidity?: number; // Minimum responses needed
}

/**
 * Static metadata for each schema test (updated)
 */
export interface SchemaTestDefinition {
  id: SchemaTestId;
  label: string;
  shortDescription: string;
  longDescription: string;
  testType: 'structured' | 'conversational' | 'hybrid'; // Assessment format

  // Structured test configuration (for ems, schema-modes)
  questionBank?: SchemaQuestionBank;
  likertConfig?: LikertScaleConfig;
  scoringConfig?: SchemaScoringConfig;

  // Conversational test configuration (for legacy tests)
  promptFocus?: string;           // What the LLM should focus on
  exampleQuestions?: string[];    // Sample questions for this test
  conversationMinTurns?: number;  // Minimum conversation exchanges

  // Common metadata
  recommendedOrder: number;       // Suggested sequence (1-6)
  estimatedDuration: string;      // e.g., "10-15 minutes"
  prerequisites?: SchemaTestId[]; // Tests that should ideally be done first

  // Analysis metadata
  outputTypes: Array<'schemas' | 'modes' | 'coping' | 'triggers'>; // What this test measures
  requiresLLMAnalysis: boolean;   // Whether LLM analysis is needed
  supportsRealTimeScoring: boolean; // Whether scoring can happen as user answers
}

// ============================================================================
// Additional Helper Types for Wizard & Service Integration
// ============================================================================

/**
 * Coping style score for coping-style assessment
 */
export interface CopingStyleScore {
  copingStyle: CopingStyle;
  rawScore: number;
  normalizedScore: number; // 0-1
  prevalence: number;      // 0-1 (how dominant this style is)
  description: string;
  manifestations: string[];
  relatedSchemas: SchemaName[];
  whenUsed: string;        // Situations where this style is typically employed
}

/**
 * Complete coping style profile
 */
export interface CopingStyleProfile {
  copingStyleScores: CopingStyleScore[];
  dominantStyle: CopingStyle;
  secondaryStyle?: CopingStyle;
  flexibility: number;     // 0-1: how flexibly user switches between styles
  overallAnalysis: string;
  recommendations: string[];
}

/**
 * Answer validation result
 */
export interface AnswerValidation {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
}

/**
 * Real-time scoring update (for live feedback during structured tests)
 */
export interface RealTimeScoreUpdate {
  questionId: string;
  currentProgress: number;  // 0-100
  preliminaryInsights?: string[]; // Early insights based on responses so far
  flaggedResponses?: Array<{
    questionId: string;
    flag: 'extreme' | 'inconsistent' | 'skip';
    note: string;
  }>;
}

/**
 * WizardStep Configuration - Standardized step management across all wizards
 * Replaces repetitive switch/case step navigation with declarative config
 * Generic type T ensures type-safe validation and routing logic
 */
export interface WizardStepConfig<T = any> {
  id: string;
  label: string;
  title: string;
  description?: string;
  order: number;
  isOptional?: boolean;
  canSkip?: boolean;
  validation?: (data: T) => { isValid: boolean; errors?: string[] };
  nextStep?: (data: T) => string | null; // Can conditionally route to different step
  previousStep?: (data: T) => string | null;
  disableNext?: (data: T) => boolean;
}

/**
 * Wizard Navigation State - Used by useWizardNavigation hook
 */
export interface WizardNavigationState {
  currentStepId: string;
  previousSteps: string[];
  completedSteps: string[];
  isValid: boolean;
  validationErrors: string[];
}

/**
 * Base type for all wizard sessions
 * All wizard-specific session types should extend this
 */
export interface BaseWizardSession {
  id: string;
  wizardType: string;
  date: string;
  linkedInsightId?: string;
  aiSummary?: string;
  [key: string]: unknown; // Allow wizard-specific fields
}

export interface StructuralEdit {
  type: 'calendar' | 'environment' | 'digital' | 'friction' | 'automation';
  what: string;
  when: string; // ISO date
}

export interface FourQuadrantCatalystSession extends BaseWizardSession {
  wizardType: '4-Quadrant Catalyst';
  insightStatement: string;
  insightCost: string;
  somaticCues: string[];
  somaticIntensity: number;
  microActionContext: string;
  microActionCategory: string;
  microActionSpecific: string;
  implementationIntention: string;
  relationalMoveType: 'witness' | 'request' | 'repair' | 'boundary';
  relationalRecipient: string;
  relationalMessage: string;
  structuralEdits: StructuralEdit[];
  resistanceBlocker: string;
  resistanceCounter: string;
  deadline: string; // ISO date
  finalReflection: string;
}

export interface FourQuadrantCatalystDraft {
  selectedInsight: IntegratedInsight | null;
  insightStatement: string;
  insightCost: string;
  somaticCues: string[];
  somaticIntensity: number;
  microActionContext: string;
  microActionCategory: string;
  microActionSpecific: string;
  implementationIntention: string;
  relationalMoveType: 'witness' | 'request' | 'repair' | 'boundary' | '';
  relationalRecipient: string;
  relationalMessage: string;
  structuralEdits: StructuralEdit[];
  resistanceBlocker: string;
  resistanceCounter: string;
  deadline: string; // ISO date
  finalReflection: string;
}

// ============================================================================
// ENNEAGRAM COMPASS WIZARD TYPES
// ============================================================================

export interface EnneagramCompassSession {
  id: string;
  date: string;
  wizardType: 'Enneagram Compass';
  triadSelection: 'Gut' | 'Heart' | 'Head';
  candidateTypes: number[];
  forcedChoiceSelections: { pairIndex: number; type: number }[];
  primaryCandidate: number;
  secondaryCandidate: number;
  triadEmotionSignal: number;
  somaticSignal: 'Gut' | 'Heart' | 'Head';
  triadConfidence: 'high' | 'medium' | 'low';
  stressSignal: number;
  relationalSignal: number;
  patternNarrative: string;
  signalSummary: string;
  disambiguationQuestion: string;
  disambiguationResponse: string;
  portrait: string;
  provisionalType: number;
  typingConfidence: 'high' | 'medium' | 'low';
  disconfirmationResponse: string;
  practiceRecommendation: string;
}

export interface EnneagramCompassDraft {
  triadSelection: 'Gut' | 'Heart' | 'Head' | null;
  candidateTypes: number[];
  forcedChoiceSelections: { pairIndex: number; type: number }[];
  primaryCandidate: number;
  secondaryCandidate: number;
  triadEmotionSignal: number;
  somaticSignal: 'Gut' | 'Heart' | 'Head' | null;
  triadConfidence: 'high' | 'medium' | 'low';
  stressSignal: number;
  relationalSignal: number;
  patternNarrative: string;
  signalSummary: string;
  disambiguationQuestion: string;
  disambiguationResponse: string;
  portrait: string;
  provisionalType: number;
  typingConfidence: 'high' | 'medium' | 'low';
  disconfirmationResponse: string;
  practiceRecommendation: string;
  relationalReflection?: string;
}

// ============================================================================
// RELATIONAL BLUEPRINT WIZARD TYPES
// ============================================================================

export interface RelationalEntry {
  pseudonym: string;
  relationshipType: string;
  status: 'active' | 'past' | 'estranged';
  significance: string;
  duration: string;
  selfRole: string;
  otherRole: string;
  breakdownMoment: string;
  isCurrent: boolean;
  isHistorical: boolean;
}

export interface RelationalBlueprintDraft {
  entryContext: string;
  relationships: RelationalEntry[];
  confirmedPattern: string;
  patternConfirmationMethod: 'accepted' | 'edited' | 'replaced' | 'regenerated-then-accepted' | 'regenerated-then-edited' | 'regenerated-then-replaced';
  synthesisAngleUsed: 'roles' | 'breakdown-moments' | 'user-authored';
  somaticCues: string[];
  somaticFreeText?: string;
  interruptTrigger: string;
  originUsefulness: string;
  originSource: string;
  originProtection: string;
  relationalMoveType: 'disclosure' | 'request' | 'repair' | 'agreement' | '';
  relationalRecipient: string;
  relationalMessage: string;
  artifactSavedAt: string;
  deadline: string;
  messageSentStatus: 'unsent' | 'sent' | 'decided-not-to';
  sentResponse?: string;
  notSentReason?: string;
  patternMechanismSummary: string;
  relationalStrengthIdentified: string;
  finalReflection?: string;
  lastResurfacedDate?: string;
}

export interface RelationalBlueprintArtifact {
  completionDate: string;
  confirmedPattern: string;
  synthesisMethod: 'roles' | 'breakdown-moments' | 'user-authored';
  relationships: RelationalEntry[];
  somaticSignature: string[];
  interruptTrigger: string;
  originNotes: { usefulness: string; source: string; protection: string };
  relationalMove: {
    type: 'disclosure' | 'request' | 'repair' | 'agreement';
    recipient: string;
    message: string;
    savedAt: string;
    deadline: string;
    sentStatus: 'unsent' | 'sent' | 'decided-not-to';
    sentResponse?: string;
    notSentReason?: string;
  };
  patternMechanismSummary: string;
  relationalStrengthIdentified: string;
  finalReflection?: string;
}

/**
 * Library Video - Resource for the Library tab
 */
export interface LibraryVideo {
  id: string;
  title: string;
  description: string;
  url: string;
  category: 'theory' | 'mind' | 'emotions' | 'practice';
  domain: 'Mind' | 'Body' | 'Shadow' | 'Spirit' | 'Theory';
  duration?: string;
  thumbnail?: string;
  symbol: string;
}

// ============================================================================
// AUTHENTICATION & USER MANAGEMENT
// ============================================================================

/**
 * User Profile from Supabase user_profiles table
 * Links to auth.users via id (UUID)
 */
export interface UserProfile {
  id: string; // UUID from auth.users
  email: string;
  username: string; // Unique identifier for @mentions (forum)
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  preferences: UserPreferences;
  created_at: string;
  updated_at: string;
  is_admin?: boolean;
}

/**
 * User Preferences stored in user_profiles.preferences JSONB column
 */
export interface UserPreferences {
  migration_completed?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  practice_stack?: string[]; // Array of practice IDs
  notification_settings?: {
    practice_reminders?: boolean;
    insight_notifications?: boolean;
    weekly_summary?: boolean;
  };
  // Freemium tier fields — stored in preferences JSONB, no migration needed
  subscription_tier?: 'free' | 'pro' | 'founding';
  subscription_status?: 'active' | 'canceled' | 'trialing';
  subscription_expires_at?: string; // ISO date
  wizard_session_count?: number; // daily quota tracking
  // Enneagram Compass fields
  enneagramType?: number;
  enneagramTriad?: 'Gut' | 'Heart' | 'Head';
  enneagramPassion?: string;
  enneagramTypingConfidence?: 'high' | 'medium' | 'low';
  enneagramLastUpdated?: string;
  firstSessionIntake?: {
    whatBringsYouHere: string; // Q1 MCQ answer
    whereYouFeelIt: string;    // Q2 MCQ answer
    priorModalities: string[]; // Q3 MCQ answers (multi-select)
    patternFreeText?: string;  // Optional free-text: "what pattern do you keep running into?"
    completedAt: string;       // ISO date — for temporal weighting
  };
  [key: string]: unknown; // Allow custom preferences
}

/**
 * Promo Code for manual access gating
 */
export interface PromoCode {
  id: string;
  code: string;
  created_by: string;
  redeemed_by: string | null;
  days_valid: number;
  expires_at: string;
  redeemed_at: string | null;
  status: 'active' | 'redeemed' | 'revoked';
  created_at: string;
}

/**
 * Authentication State
 */
export interface AuthUser {
  id: string; // UUID from auth.users
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  isAdmin?: boolean;
}

export interface AdminUserRow {
  id: string;
  email?: string;
  display_name: string | null;
  preferences: UserPreferences;
  is_admin: boolean;
  created_at: string;
}

/**
 * Auth Session from Supabase
 */
export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: string;
  user: AuthUser;
}

/**
 * Auth Context State
 */
export interface AuthContextState {
  user: AuthUser | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  showAuthModal: boolean;
}

/**
 * Auth Context Actions
 */
export interface AuthContextActions {
  signUp: (email: string, password: string, displayName?: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResult>;
  updatePassword: (newPassword: string) => Promise<AuthResult>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<AuthResult>;
  setShowAuthModal: (show: boolean) => void;
}

/**
 * Combined Auth Context (State + Actions)
 */
export interface AuthContextValue extends AuthContextState, AuthContextActions { }

/**
 * Auth Operation Result
 */
export interface AuthResult {
  success: boolean;
  error?: string;
  user?: AuthUser;
  session?: AuthSession;
}

/**
 * Auth Modal Mode
 */
export type AuthModalMode = 'signin' | 'signup' | 'reset-password';

/**
 * Migration Summary from migrationService
 */
export interface MigrationSummary {
  insights_migrated: number;
  guidance_migrated: number;
  preferences_migrated: number;
  total_migrated: number;
  old_user_id: string;
  new_auth_user_id: string;
  completed_at: string;
}

/**
 * Protected Route Props
 */
export interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean; // If false, just show auth modal without blocking
}

// ============================================================================
// Forum System Types
// ============================================================================

export type ForumCategory = 'practice-sharing' | 'insights' | 'questions' | 'community';
export type ForumReactionType = 'resonates' | 'sits-with-me' | 'challenges-me' | 'grateful';

export interface ForumReaction {
  id: string;
  post_id: string;
  user_id: string;
  reaction_type: ForumReactionType;
  created_at: string;
}

export interface PostReactionCounts {
  resonates: number;
  'sits-with-me': number;
  'challenges-me': number;
  grateful: number;
}

/**
 * Author information for forum threads and posts
 * Single source of truth for author/user display data
 */
export interface ForumAuthor {
  id: string;
  email?: string;
  display_name?: string | null;
  avatar_url?: string | null;
  created_at?: string;
  subscription_tier?: 'free' | 'pro' | 'founding';
  bio?: string | null;
  practice_focus?: string[];
}

export interface ForumThread {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: ForumCategory;
  created_at: string;
  updated_at: string;
  view_count: number;
  reply_count: number;
  is_archived: boolean;
  is_pinned: boolean;
  author?: ForumAuthor;
}

export interface ForumPost {
  id: string;
  thread_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_edited: boolean;
  likes_count: number;
  is_deleted: boolean;
  parent_post_id?: string | null;
  author?: ForumAuthor;
  liked_by_user?: boolean; // Current user has liked this post (persistent)
  bot_persona_name?: string | null; // Persona name for bot posts (e.g. "Mara", "Theo")
  reactions?: PostReactionCounts;
  user_reactions?: ForumReactionType[];
}

export interface ForumThreadWithPosts extends ForumThread {
  posts?: ForumPost[];
}

export interface CreateThreadInput {
  title: string;
  description?: string;
  category: ForumCategory;
}

export interface CreatePostInput {
  thread_id: string;
  content: string;
  parent_post_id?: string | null;
}

export interface UpdatePostInput {
  id: string;
  content: string;
}

export interface ForumPaginationParams {
  limit?: number;
  offset?: number;
}

export interface ForumFlag {
  id: string;
  post_id: string;
  thread_id: string;
  reporter_id: string;
  reason: 'spam' | 'harmful' | 'off-topic' | 'crisis';
  created_at: string;
  resolved: boolean;
  resolved_by?: string;
  // joined fields (optional)
  post_content?: string;
  reporter_name?: string;
}

export interface ForumNotification {
  id: string;
  user_id: string;
  type: 'mention' | 'reply_to_thread';
  thread_id: string;
  post_id?: string;
  actor_id: string;
  read: boolean;
  created_at: string;
  // joined
  actor_name?: string;
  thread_title?: string;
}

// ============================================================================
// Sexology Coach Types
// ============================================================================

export interface SexologyMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface SexologySession {
  id: string;
  messages: SexologyMessage[];
  createdAt: number;
  updatedAt: number;
}

// ============================================================================
// DBT COACH TYPES
// ============================================================================

export type DBTModule =
  | 'mindfulness'
  | 'distress_tolerance'
  | 'emotion_regulation'
  | 'interpersonal_effectiveness';

export type DBTSkill =
  | 'wise_mind' | 'observe' | 'describe' | 'participate' | 'nonjudgmental' | 'one_mindfully' | 'effectiveness'
  | 'tipp' | 'stop' | 'pros_cons' | 'radical_acceptance' | 'distract_accepts' | 'self_soothe' | 'improve_moment'
  | 'check_the_facts' | 'opposite_action' | 'problem_solving' | 'abc_please' | 'build_mastery' | 'cope_ahead' | 'mindfulness_of_current_emotion'
  | 'dearman' | 'give' | 'fast' | 'dialectics';

export type DBTRiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRISIS';

export type DBTCoachMode = 'learn' | 'cope_now' | 'diary' | 'chain_analysis' | 'sos' | 'urge_surf';

export interface DBTUserProfile {
  primaryConcerns: string[];
  skillLevel: 'novice' | 'intermediate' | 'practiced';
  completedSkills: DBTSkill[];
  preferredPace: 'brief' | 'detailed';
  lastSessionDate?: string;
}

export interface DBTMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    skillTaught?: DBTSkill;
    riskLevel?: DBTRiskLevel;
    validationLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  };
}

export interface DBTDiaryEntry {
  id: string;
  date: string;
  emotions: Array<{ name: string; intensity: 1 | 2 | 3 | 4 | 5 }>;
  urges: Array<{ description: string; acted: boolean }>;
  skillsUsed: DBTSkill[];
  effectiveness: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  autoPopulatedFromSession?: string;
}

export interface CopingWalletItem {
  id: string;
  content: string;
  savedAt: string;
  sourceMode: DBTCoachMode;
  label?: string;
}

export interface DBTChainAnalysis {
  id: string;
  date: string;
  targetBehavior: string;
  vulnerability: string[];
  promptingEvent: string;
  links: Array<{ thought?: string; emotion?: string; sensation?: string; action?: string }>;
  consequences: string[];
  solutionAnalysis: Array<{ linkIndex: number; alternativeSkill: DBTSkill; howToApply: string }>;
}

export interface DBTSession {
  id: string;
  startTime: string;
  endTime?: string;
  mode: DBTCoachMode;
  messages: DBTMessage[];
  skillsIntroduced: DBTSkill[];
  skillsPracticed: DBTSkill[];
  riskEscalations: number;
  sudsEntry?: { before: number; after: number; timestamp: string };
  userFeedback?: { helpfulness: 1 | 2 | 3 | 4 | 5; skillConfidence: 1 | 2 | 3 | 4 | 5; comments?: string };
}

export interface DBTCoachState {
  hasConsented: boolean;
  profile: DBTUserProfile;
  currentMode: DBTCoachMode;
  currentSession: DBTSession | null;
  diaryEntries: DBTDiaryEntry[];
  chainAnalyses: DBTChainAnalysis[];
  sessionHistory: DBTSession[];
  wallet: CopingWalletItem[];
}

export interface DBTRiskAssessment {
  level: DBTRiskLevel;
  reasoning: string;
  suggestedApproach: 'crisis_protocol' | 'distress_first' | 'normal_coaching';
}

export interface DBTCoachResponse {
  message: string;
  internalReasoning?: string;
  skillTaught?: DBTSkill;
  validationLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  practicePrompt?: string;
  checkInQuestion?: string;
}

// ============================================================
// Psychotherapy Style Assessment Types
// ============================================================

export type TherapyModalityId =
  | 'cbt' | 'dbt' | 'act' | 'psychodynamic' | 'emdr'
  | 'ifs' | 'somatic' | 'narrative' | 'sfbt' | 'eft';

export interface TherapyModalityInfo {
  id: TherapyModalityId;
  name: string;
  tagline: string;
  description: string;
  bestFor: string[];
  approach: string;
  typicalDuration: string;
  sessionFeel: string;
  requiresReadiness: string[];
  relatedModalities: TherapyModalityId[];
  contraindicatedWhen: string[];
}

export interface TherapyAssessmentOption {
  label: string;
  value: string;
  scores: Partial<Record<TherapyModalityId, number>>;
}

export interface TherapyAssessmentQuestion {
  id: string;
  stage: number;
  construct: string;
  text: string;
  subtext?: string;
  type: 'single' | 'multi';
  maxSelections?: number;
  options: TherapyAssessmentOption[];
}

export interface TherapyRecommendation {
  modality: TherapyModalityId;
  rawScore: number;
  normalizedScore: number;
  fitLabel: 'Excellent fit' | 'Strong fit' | 'Good fit' | 'Possible fit';
  contributingFactors: string[];
}

export interface TherapyClinicalFlag {
  type: 'crisis' | 'contraindication' | 'modifier';
  message: string;
  affectedModalities?: TherapyModalityId[];
}

export interface TherapyScoringResult {
  rawScores: Record<TherapyModalityId, number>;
  normalizedScores: Record<TherapyModalityId, number>;
  topRecommendations: TherapyRecommendation[];
  flags: TherapyClinicalFlag[];
}

export interface TherapyAssessmentResults {
  narrative: string;
  recommendations: TherapyRecommendation[];
  flags: TherapyClinicalFlag[];
  allScores: Record<TherapyModalityId, number>;
}


// ============================================================================
// Coherence Audit Types
// ============================================================================

export interface CoherenceAuditMessage {
  role: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export interface CoherenceAuditAnalysis {
  espousedVsOperativeGaps: Array<{
    value: string;
    evidence: string;
    gap: string;
  }>;
  loyaltyReframe: string;
  shadowWork: string;
  recommendations: string[];
}

export interface CoherenceAuditSession {
  id: string;
  wizardType?: string;
  date: string;
  userId?: string;
  sessionData?: unknown;
  startedAt?: string | Date;
  conversation: CoherenceAuditMessage[];
  espousedValues: string[];
  behavioralFindings: string[];
  loyaltyObjects?: string[];
  linkedInsightId?: string | null;
  coherenceAnalysis?: CoherenceAuditAnalysis;
  completedAt?: string | Date;
}

// ============================================================================
// Relational Field Mapper — Supporting Types
// ============================================================================

/** Legacy type used by RelationalPatternChatbot / aiService.original.ts */
export interface RelationshipContext {
  type: 'Romantic Partner' | 'Parent' | 'Child' | 'Sibling' | 'Friend' | 'Boss/Authority' | 'Colleague' | 'Direct Report' | 'Stranger/Public';
  personDescription?: string;
  triggerSituation?: string;
  yourReaction?: string;
  underlyingFear?: string;
  pattern?: string;
}

export interface RelationshipEntry {
  name: string;
  type: 'family' | 'romantic' | 'friendship' | 'work' | 'community';
  connectionQuality: number;
  conflictFrequency: 'rarely' | 'monthly' | 'weekly' | 'daily';
  feltSense: string;
  roleYouPlay: string;
}

export interface RelationalFieldAnalysis {
  dominantRole: string;
  projectionTargets: string[];
  shadowHypothesis: string;
  attachmentPattern: 'secure' | 'anxious' | 'avoidant' | 'disorganized';
  developmentalEdge: string;
  recommendedWizard: 'ifs' | '321' | 'golden-shadow' | 'attachment-practice' | 'relational-blueprint';
  practicePerStrain: { relationship: string; practice: string }[];
}

// ============================================================================
// Life Architecture Wizard — Supporting Types
// ============================================================================

export interface ArchitectureAudit {
  valueBehaviorGaps: { value: string; contradiction: string; severity: 'high' | 'low' | 'medium' }[];
  energyArchitecture: { primaryDrains: string[]; primarySources: string[]; chronotypeAlignment: string; overallAssessment: string };
  timeRedesign: { domain: string; currentHours: number; recommendedHours: number; rationale: string }[];
  roleClarity: { role: string; recommendation: string; note: string }[];
  environmentChanges: { change: string; impactLevel: string; implementation: string }[];
  frictionDissolution: { friction: string; intervention: string }[];
  redesignStack: { change: string; priority: number; timeframe: string; successIndicator: string }[];
  practiceStackAlignment?: { practiceId: string; supported: boolean; note: string }[];
  closingReflection: string;
}

export interface ArchitectureRedesign {
  structuralChange: string;
  implementation: string;
  timeline: string;
  successIndicator: string;
  connectionToValues: string;
}

// ============================================================================
// Cultural Shadow Excavator — Supporting Types
// ============================================================================

export interface CulturalLineageAnalysis {
  dominantNarratives: string[];
  scapegoatPatterns: string[];
  collectiveDefenses: string[];
}

export interface CulturalShadowAnalysis {
  collectiveShadowThemes: string[];
  personalAlignment: string;
  inheritedBeliefs: string[];
  altitudeEstimate: 'amber' | 'orange' | 'green' | 'teal' | 'turquoise';
  liberationMoves: { pattern: string; practice: string }[];
  recommendedWizard: '321' | 'golden-shadow' | 'kegan' | 'contemplative-inquiry';
}

// ============================================================================
// Relational Field Mapper Session
// ============================================================================

export interface RelationalFieldSession {
  id: string;
  date: string;
  relationships: RelationshipEntry[];
  analysis?: RelationalFieldAnalysis;
  currentStep: number;
  linkedInsightId?: string;
}

// ============================================================================
// Life Architecture Wizard Session
// ============================================================================

export interface LifeArchSession {
  id: string;
  date: string;
  currentStep: number;
  valuePurpose?: string;
  rankedValues?: string[];
  valueConflictNotes?: string;
  timeActual?: Record<string, number>;
  timeIdeal?: Record<string, number>;
  timePainNotes?: string;
  envPhysical?: Record<string, number>;
  envDigitalFrictions?: string[];
  envSocialContacts?: Array<{ name: string; energy: 'draining' | 'neutral' | 'energizing' }>;
  envWorstFriction?: string;
  activeRoles?: Array<{ name: string; alignment: number; energyCost: number; chosen: boolean }>;
  commitments?: Array<{ text: string; status: 'energizing' | 'neutral' | 'draining' | 'drop' }>;
  roleConflictNotes?: string;
  chronotype?: 'early' | 'middle' | 'night';
  peakEnergyWindow?: string;
  energyDrains?: string[];
  energySources?: string[];
  overallEnergyBalance?: number;
  energyTheftNotes?: string;
  frictionPoints?: string[];
  oneYearVision?: string;
  willingToChange?: string[];
  nonNegotiable?: string;
  audit?: ArchitectureAudit;
  linkedInsightId?: string;
  // Legacy compat
  environmentNotes?: string;
  habitNotes?: string;
  roleNotes?: string;
  energyNotes?: string;
}

// ============================================================================
// Cultural Shadow Excavator Session
// ============================================================================

export interface CulturalShadowSession {
  id: string;
  date: string;
  lineageNotes: string;
  inheritedBeliefsNotes: string;
  collectiveShadowNotes: string;
  personalShadowNotes: string;
  currentStep: number;
  lineageAnalysis?: CulturalLineageAnalysis;
  shadowAnalysis?: CulturalShadowAnalysis;
  linkedInsightId?: string;
}

// ============================================================================
// UltimateConcern Wizard Types
// ============================================================================

export type ConcernDomain = 'survival' | 'belonging' | 'meaning' | 'legacy' | 'truth' | 'love' | 'freedom';

export interface UltimateConcernDraft {
  concern: string;
  domain: ConcernDomain | null;
  probingQuestions: string[];
  probeAnswers: string[];
  holdingDescription: string;
  meaningMakingStructure: string;
  actionValueGap: string;
  stretchExercise: string;
  stretchResponse: string;
  analysisResponse?: string;
  completedAt?: string;
}

// ============================================================================
// Chronobiology Protocol Wizard Types
// ============================================================================

export interface DailyEnergyLog {
  day: number;           // 1–5
  date: string;          // ISO
  morning: { cognitiveClarity: number; physicalEnergy: number; note?: string };
  midday: { cognitiveClarity: number; physicalEnergy: number; note?: string };
  afternoon: { cognitiveClarity: number; physicalEnergy: number; note?: string };
  evening: { cognitiveClarity: number; physicalEnergy: number; note?: string };
  sleepHours?: number;
  anomalyNote?: string;
  isEstimate?: boolean;
}

export interface BiologicalWindow {
  windowType: 'peak-cognitive' | 'secondary-cognitive' | 'physical' | 'social-relational' | 'low-demand' | 'creative-associative';
  timeRange: string;
  confidenceLevel: 'high' | 'medium' | 'low';
  evidenceSummary: string;
  userConfirmed: boolean;
  userAdjustedRange?: string;
}

export interface ScheduledActivity {
  name: string;
  requiredState: 'peak-cognitive' | 'secondary-cognitive' | 'physical' | 'social-relational' | 'low-demand' | 'creative-associative';
  currentWindows: string[];  // day+window slots
  isFixed: boolean;
}

export interface MismatchFinding {
  activity: string;
  status: 'aligned' | 'mismatched' | 'unscheduled';
  explanation: string;
  suggestedWindow?: string;
}

export interface ShadowJournalingDraft {
  phase: 'welcome' | 'choose-exercise' | 'exercise-form' | 'reflection' | 'closing';
  selectedExerciseId: string | null;
  userEntry: Record<string, string | number>;
  reflection: string;
  wordToCarry: string;
  selfCompassionStatement: string;
}

export interface ChronobiologyDraft {
  sessionId: string;
  phase: 'orientation' | 'logging' | 'analysis';
  step: number;
  loggingMode: 'realtime' | 'retrospective';
  isDisruptedBaseline: boolean;
  dailyLogs: DailyEnergyLog[];
  biologicalWindows: BiologicalWindow[];
  activities: ScheduledActivity[];
  mismatches: MismatchFinding[];
  primaryLeveragePoint: string;
  peakCognitiveProtection: string;
  peakCognitiveDerailer: string;
  physicalWindowProtection: string;
  physicalWindowDerailer: string;
  redesignedScheduleNotes: string;
  chronobiologySummary: string;
  architectureType: string;
  completionDate?: string;
}

// ============================================================================
// Language Lab Types
// ============================================================================

export type LanguageKey = 'neo-latin' | 'living-sanskrit' | 'quenya' | 'evolved-esperanto';

export interface LanguageLabResult {
  languageKey: LanguageKey;
  inputPhrase: string;
  romanization: string;
  nativeScript?: string;
  grammaticalNotes: string;
  exampleSentences: Array<{ original: string; gloss: string; translation: string }>;
  revivalPhilosophy: string;
  generatedAt: string;
}

// ============================================================================
// Reality Tunnel Flexibility Wizard Types
// ============================================================================

export interface RealityTunnelDraft {
  // Step 1 — Tunnel Identification
  belief: string;
  tunnelName: string;
  certaintyBefore: number;
  beliefDuration: 'weeks' | 'months' | 'years' | 'always' | '';
  wrongFeeling: 'relieving' | 'terrifying' | 'confusing' | 'freeing' | 'impossible' | '';
  // Step 2 — Archaeology
  beliefOriginWhen: string;
  beliefOriginSource: string;
  beliefOriginContext: string;
  // Step 3 — Counter-Tunnel
  counterExperience: string;
  counterArgument: string;
  counterTunnelName: string;
  // Step 4 — Somatic Check
  originalBodyArea: string;
  originalSensations: string[];
  originalIntensity: number;
  counterBodyArea: string;
  counterSensations: string[];
  counterIntensity: number;
  conservationFlag: 'none' | 'protective-tunnel' | 'both-distressed';
  // Step 5 — Flexibility Reflection
  surpriseReflection: string;
  relationshipShift: 'same' | 'lighter' | 'curious' | 'unsettled' | 'committed' | '';
  certaintyAfter: number;
  // AI outputs
  originSynthesis: { reflection: string; acquisitionSummary: string; transitionPrompt: string; } | null;
  counterModel: { strengthenedCounterModel: string; additionalPerspectives: string[]; flexibilityObservation: string; } | null;
  integration: {
    beliefHonoring: string;
    flexibilityHonoring: string;
    processReflection: string;
    weeklyPractice: string;
    flexibilityInsight: string;
    routing: { beliefDomain: string; originDepth: string; somaticSignificance: string; };
  } | null;
}

export interface RealityTunnelSession {
  id: string;
  date: string;
  userId?: string;
  tunnelName: string;
  counterTunnelName: string;
  belief: string;
  certaintyBefore: number;
  certaintyAfter: number;
  relationshipShift: string;
  conservationFlag: 'none' | 'protective-tunnel' | 'both-distressed';
  weeklyPractice: string;
  flexibilityInsight: string;
  routing: { beliefDomain: string; originDepth: string; somaticSignificance: string; };
}

// ============================================================================
// CBM-I Wizard Types (Interpretation Lens)
// ============================================================================

export type Quadrant = 'UL' | 'UR' | 'LL' | 'LR';

export interface CbmBankScenario {
  id: string;
  quadrant: Quadrant;
  difficulty: 1 | 2 | 3;
  domain: string;
  scenarioText: string;
  completions: {
    threat: string;
    neutral: string;
    growth: string;
  };
  onboardingEligible?: boolean;
}

export interface BiasFingerprint {
  domains: {
    UL: { threatPct: number; neutralPct: number; growthPct: number };
    UR: { threatPct: number; neutralPct: number; growthPct: number };
    LL: { threatPct: number; neutralPct: number; growthPct: number };
    LR: { threatPct: number; neutralPct: number; growthPct: number };
  };
  highBiasDomains: Quadrant[];
  baselineResponseTimeMs: number;
  createdAt: string;
  version: number;
}

export interface CbmProfile {
  id: string;
  userId: string;
  biasFingerprint: BiasFingerprint;
  currentPhase: 1 | 2;
  sessionCount: number;
  lastSessionAt: string | null;
  streak: number;
  seenScenarioIds: string[];
}

export interface TrialMetrics {
  scenarioId: string;
  quadrant: Quadrant;
  selectedType: 'threat' | 'neutral' | 'growth';
  responseTimeMs: number;
  timestamp: number;
}

export interface QuadrantScores {
  UL: { flexScore: number; trialCount: number };
  UR: { flexScore: number; trialCount: number };
  LL: { flexScore: number; trialCount: number };
  LR: { flexScore: number; trialCount: number };
}

export interface CbmSession {
  id: string;
  userId: string;
  sessionNumber: number;
  phase: 1 | 2;
  trials: TrialMetrics[];
  accuracyScore: number;
  quadrantScores: QuadrantScores;
  reflectionText?: string;
  createdAt: string;
}

export interface WeeklyReviewData {
  sessionsCompleted: number;
  meanFlexibilityScore: number;
  flexibilityTrend: 'up' | 'stable' | 'down';
  quadrantScores: {
    UL: { mean: number; trend: 'up' | 'stable' | 'down' };
    UR: { mean: number; trend: 'up' | 'stable' | 'down' };
    LL: { mean: number; trend: 'up' | 'stable' | 'down' };
    LR: { mean: number; trend: 'up' | 'stable' | 'down' };
  };
  hardestScenario: { text: string; quadrant: Quadrant };
  reflectionTexts: string[];
  weekNumber: number;
}

export interface CbmWeeklyReviewAI {
  trendSummary: string;
  hardestScenarioReflection: string;
  microExperiment: string;
  dominantQuadrant: Quadrant;
  growingEdge: string;
}

export interface DailyCheckinSession {
  id: string;
  date: string;
  energy: number;
  clarity: number;
  openness: number;
  whatIsPresent: string;
  enactmentSince: string;
  relatedPractice: string;
  patternsNoticed: string;
  growingEdge: string;
  todayIntention: string;
  aiReflection: string;
}

// ============================================================================
// Defusion Lab Wizard Types (ACT Cognitive Defusion)
// ============================================================================

export type DefusionExperimentType = 'i-notice' | 'name-that-story' | 'give-it-a-shape' | 'thank-your-mind';

export interface DefusionExperiment {
  type: DefusionExperimentType;
  completedAt: string;
  /** "I Notice..." — chip selections */
  noticeChips?: string[];
  /** "Name That Story" — short label + chips */
  storyName?: string;
  storyChips?: string[];
  /** "Give It a Shape" — structured MCQ */
  shape?: string;
  color?: string;
  weight?: string;
  temperature?: string;
  placement?: string;
  concreteness?: number; // 1-10 slider
  /** "Thank Your Mind" — chip selections */
  thankChips?: string[];
}

export interface DefusionSession {
  id: string;
  date: string;
  /** Beat 1: Catch */
  thought: string;
  preFusionRating: number; // 1-10
  aiExternalization?: string; // AI-generated externalized reflection
  /** Beat 2: Experiment Hub */
  experiments: DefusionExperiment[];
  /** Beat 3: Land */
  postFusionRating?: number; // 1-10
  chosenAction?: string;
  /** Pattern observation (3+ sessions) */
  patternObservation?: {
    recurringStory: string;
    mostEffectiveExperiments: string[];
    observation: string;
  };
  /** Metadata */
  linkedInsightId?: string;
  completedAt?: string;
  crisisLevel?: CrisisLevel;
}

// ============================================================================
// GenerativityMap Wizard Types
// ============================================================================

export type ContributionForm =
  | 'teaching'
  | 'creating'
  | 'protecting'
  | 'mentoring'
  | 'building'
  | 'holding-space'
  | 'translating'
  | 'modeling';

export type LifeChapter = 'early' | 'middle' | 'later' | 'in-transition';

export interface GenerativityMapDraft {
  lifeChapter: LifeChapter | null;
  ilpModulesEngaged: string[];
  readinessScore: number;            // 1–5: still-in-work → ready-to-give
  hardestLesson: string;
  earnedWisdom: [string, string, string?];  // 3rd is optional
  contributionForms: ContributionForm[];
  somaticLocation: string;
  somaticPhrase: string;             // 2-word description of felt quality
  somaticQuality: 'expansive' | 'obligatory' | 'neutral' | null;
  generativityPortrait: string;      // AI-generated 3-paragraph synthesis
  clarityBefore: number;             // 1–10 bookend metric
  clarityAfter: number;              // 1–10 bookend metric
  selectedPortraitLine: string;
  commitmentAction: string;
  completedAt?: string;
}

// ============================================================================
// The Mourning Field — Grief Practice Container Types
// ============================================================================

export type GriefPhase =
  | 'ARRIVAL'
  | 'DESCENT'          // loss-oriented track
  | 'ADAPTATION'       // restoration-oriented track
  | 'MEANING'
  | 'CARRYING'
  | 'CONTEMPLATIVE'    // unlocked only when conditions met
  | 'CLOSING';

export type DPMTrack = 'loss-oriented' | 'restoration-oriented' | null;

export interface GriefTranscriptEntry {
  role: 'user' | 'bot';
  text: string;
  phase: GriefPhase;
}

export interface MourningFieldSession {
  id: string;
  startedAt: string;
  completedAt?: string;
  lossDescription: string;         // user's own language, tracked for memory
  dpmTrackChosen: DPMTrack;
  contemplativeUnlocked: boolean;
  prolongedGriefFlagged: boolean;
  transcript: GriefTranscriptEntry[];
  currentPhase: GriefPhase;
  meaningThemes: string[];
}

// ── TONGLEN ────────────────────────────────────────────────────────────────

export type TonglenFocus =
  | 'self'
  | 'loved-one'
  | 'neutral'
  | 'difficult'
  | 'collective';

export type TonglenReadiness = 'ready' | 'gentle' | 'defer';

export type TonglenDevelopmentalFrame = 'conventional' | 'self-authoring' | 'post-conventional';

export interface TonglenInsight {
  bodyObservation: string;
  insightNote: string;
  forwardEdge: string;
  nextSessionSuggestion: string;
}

export interface TonglenSession {
  id: string;
  date: string;
  linkedInsightId?: string;

  // Step 1 — Check-In
  checkInResponse: string;
  readinessLevel: TonglenReadiness;
  developmentalFrame: TonglenDevelopmentalFrame;

  // Step 2 — Intention
  focusType: TonglenFocus;
  focusTarget?: string;
  shadow321Completed: boolean;
  shadow321Notes?: string;

  // Step 4 — Practice
  circlesReached: number;
  practiceNotes?: string;

  // Step 5 — Integration
  integrationReflection?: string;
  microCommitment?: string;

  // Step 6 — Summary
  sessionInsight?: TonglenInsight;
  forwardEdge?: string;
}

// ── INTEGRAL CIVIC PRACTICE ────────────────────────────────────────────

export type CivicPracticeMode =
  | 'issue-inquiry'
  | 'enemy-image'
  | 'sphere-of-influence'
  | 'grief-renewal';

export type CivicReadiness = 'ready' | 'gentle' | 'defer';

export type CivicDevelopmentalFrame = 'conventional' | 'self-authoring' | 'self-transforming';

export type CivicCommitmentScale =
  | 'self' | 'household' | 'community'
  | 'institutional' | 'municipal' | 'national';

export interface CivicInsight {
  bodyObservation: string;
  insightNote: string;
  shadowDiscovery: string;
  forwardEdge: string;
  nextSessionSuggestion: string;
}

export interface CivicPracticeSession {
  id: string;
  date: string;
  linkedInsightId?: string;

  // Step 1 — Check-In
  checkInResponse: string;
  readinessLevel: CivicReadiness;
  developmentalFrame: CivicDevelopmentalFrame;
  somaticArrival: string;

  // Step 2 — What's Alive
  issueDescription: string;
  practiceMode: CivicPracticeMode;

  // Enemy Image mode
  enemyTarget?: string;
  enemy3rdPerson?: string;
  enemy2ndPerson?: string;
  enemy1stPerson?: string;
  enemyShadowSeed?: string;

  // Sphere of Influence mode
  sphereScale?: CivicCommitmentScale;
  sphereAction?: string;

  // Grief & Renewal mode
  griefGratitude?: string;
  griefPain?: string;
  griefNewEyes?: string;
  griefGift?: string;

  // Issue Inquiry mode — Systems
  steelmanAttempt?: string;
  icebergEvents?: string;
  icebergPatterns?: string;
  icebergStructures?: string;
  icebergMentalModels?: string;

  // Integration & Commitment (all modes)
  commitmentAction: string;
  commitmentTimeframe: string;
  commitmentScale: CivicCommitmentScale;
  commitmentObstacle: string;
  commitmentSupport: string;
  commitmentDedication: string;

  // Somatic bookend
  somaticClosing: string;

  // AI outputs
  sessionInsight?: CivicInsight;
}

// ─── Phenomenon Mapper ───────────────────────────────────────────
export type PhenomenonQuadrant = 'UL' | 'UR' | 'LL' | 'LR';
export type PhenomenonSource = 'library' | 'ai' | 'manual';
export type MapperMode = 'learning' | 'practice';

export interface PhenomenonCard {
  id: string;
  name: string;
  source: PhenomenonSource;
}

export interface PhenomenonPlacement {
  cardId: string;
  quadrant: PhenomenonQuadrant;
  reasoning: string;
}

export interface AIChallengeItem {
  cardId: string;
  counterQuadrant: PhenomenonQuadrant;
  challenge: string;
}

export interface SocraticMessage {
  role: 'user' | 'ai';
  content: string;
}

export interface PhenomenonMapperDraft {
  mode: MapperMode | '';
  sourcingMethod: 'library' | 'ai' | 'manual' | '';
  selectedLibraryTopic: string;
  seedDescription: string;
  cards: PhenomenonCard[];
  placements: PhenomenonPlacement[];
  currentCardIndex: number;
  aiChallenges: AIChallengeItem[];
  socraticHistory: SocraticMessage[];
  synthesis: string;
}

export interface PhenomenonMapperSession {
  mode: MapperMode;
  topic: string;
  cards: PhenomenonCard[];
  placements: PhenomenonPlacement[];
  aiChallenges: AIChallengeItem[];
  socraticHistory: SocraticMessage[];
  synthesis: string;
  completedAt: string;
}

// ─── Structure of Feeling ────────────────────────────────────────
export interface StructureOfFeelingDraft {
  mode: 'core' | 'deep';
  openingAnswer: string;
  recognitionResponses: Record<string, string>;
  barnumChoice: string;
  userExample: string;
  userContext: string;
  domainChoice: string;
  frameworkChoice: string;
  practiceReflection: string;
  updatedAt: number;
}

export interface StructureOfFeelingSession {
  id: string;
  date: string;
  mode: 'core' | 'deep';
  openingAnswer: string;
  recognitionCount: number;
  barnumChoice: string;
  userExample: string;
  aiReflection: string;
  aiQuestion: string;
  aiPractice?: string;
  domainChoice?: string;
  frameworkChoice?: string;
  practiceReflection?: string;
}

export interface InnerCompassSession {
  sessionId: string;
  userId: string;
  metaphorId: string;
  metaphorText: string;
  extensionSelections: Array<{ prompt: string; selected: string }>;
  perspectiveIds: string[];
  fishbowlResponse: {
    perspectives: Array<{
      perspectiveName: string;
      response: string;
    }>;
  };
  bridgeQuestion: string;
  practice: string;
  calibrationFeedback?: {
    perspectiveName: string;
    feeling: 'yes' | 'partly' | 'no';
    correction?: string;
  };
  completedAt: string;
}

