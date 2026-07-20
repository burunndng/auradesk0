import { z } from 'zod';

// Base versioned data wrapper
export const VersionedDataSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    version: z.number(),
    data: dataSchema,
    migratedAt: z.string().optional(),
  });

// ===== Wizard Session Schemas =====

// IFS Session Schema
export const IFSDialogueEntrySchema = z.object({
  role: z.enum(['user', 'bot']),
  text: z.string(),
  phase: z.enum(['IDENTIFY', 'EXPLORE', 'DEEPEN', 'UNBURDEN', 'INTEGRATE', 'CLOSING']),
});

export const IFSSessionSchema = z.object({
  id: z.string(),
  date: z.string(),
  partId: z.string(),
  partName: z.string(),
  transcript: z.array(IFSDialogueEntrySchema),
  integrationNote: z.string(),
  currentPhase: z.enum(['IDENTIFY', 'EXPLORE', 'DEEPEN', 'UNBURDEN', 'INTEGRATE', 'CLOSING']),
  partRole: z.string().optional(),
  partFears: z.string().optional(),
  partPositiveIntent: z.string().optional(),
  summary: z.string().optional(),
  aiIndications: z.array(z.string()).optional(),
  linkedInsightId: z.string().optional(),
  identifiedParts: z.array(z.object({
    name: z.string(),
    role: z.string().optional(),
  })).optional(),
});

export const IFSSessionArraySchema = z.array(IFSSessionSchema);

export const IFSPartSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  fears: z.string(),
  positiveIntent: z.string(),
  lastSessionDate: z.string(),
});

export const IFSPartsLibrarySchema = z.array(IFSPartSchema);

// 3-2-1 Session Schema
export const ThreeTwoOneSessionSchema = z.object({
  id: z.string(),
  date: z.string(),
  trigger: z.string(),
  triggerDescription: z.string(),
  dialogue: z.string(),
  embodiment: z.string(),
  integration: z.string(),
  aiSummary: z.string().optional(),
  linkedInsightId: z.string().optional(),
  faceItAnalysis: z.any().optional(),
  dialogueTranscript: z.array(z.any()).optional(),
  embodimentAnalysis: z.any().optional(),
  integrationPlan: z.any().optional(),
});

export const ThreeTwoOneSessionArraySchema = z.array(ThreeTwoOneSessionSchema);

// Bias Detective Session Schema
export const BiasDetectiveSessionSchema = z.object({
  id: z.string(),
  date: z.string(),
  currentStep: z.string(),
  decisionText: z.string(),
  reasoning: z.string(),
  discoveryAnswers: z.object({
    alternativesConsidered: z.string(),
    informationSources: z.string(),
    timePressure: z.string(),
    emotionalState: z.string(),
    influencers: z.string(),
  }),
  identifiedBiases: z.array(z.object({
    name: z.string(),
    description: z.string(),
    relevance: z.string(),
  })),
  alternativeFramings: z.array(z.string()),
  diagnosis: z.string().optional(),
  scenarios: z.array(z.object({
    biasName: z.string(),
    howItInfluenced: z.string(),
    scenario: z.string(),
    alternativeDecision: z.string(),
  })).optional(),
  oneThingToRemember: z.string(),
  nextTimeAction: z.string(),
  linkedInsightId: z.string().optional(),
});

export const BiasDetectiveSessionArraySchema = z.array(BiasDetectiveSessionSchema);

// Bias Finder Session Schema
export const BiasFinderSessionSchema = z.object({
  id: z.string(),
  date: z.string(),
  situation: z.string(),
  initialThoughts: z.string(),
  suggestedBiases: z.array(z.object({
    name: z.string(),
    description: z.string(),
    howItMayApply: z.string(),
  })),
  userSelectedBias: z.string().optional(),
  deepDiveConversation: z.array(z.object({
    role: z.enum(['user', 'bot']),
    content: z.string(),
  })),
  insight: z.string().optional(),
  linkedInsightId: z.string().optional(),
});

export const BiasFinderSessionArraySchema = z.array(BiasFinderSessionSchema);

// Subject-Object Session Schema
export const SubjectObjectSessionSchema = z.object({
  id: z.string(),
  date: z.string(),
  currentStep: z.string(),
  pattern: z.string(),
  truthFeelings: z.string(),
  subjectToStatement: z.string(),
  evidenceChecks: z.object({
    pro: z.string().optional(),
    con: z.string().optional(),
  }),
  origin: z.string(),
  cost: z.string(),
  firstObservation: z.string(),
  dailyTracking: z.record(z.string(), z.any()),
  reviewInsights: z.string(),
  integrationShift: z.string(),
  ongoingPracticePlan: z.array(z.string()),
  smallExperimentChosen: z.string().optional(),
  linkedInsightId: z.string().optional(),
});

export const SubjectObjectSessionArraySchema = z.array(SubjectObjectSessionSchema);

// Perspective Shifter Session Schema
export const PerspectiveShifterSessionSchema = z.object({
  id: z.string(),
  date: z.string(),
  situation: z.string(),
  currentPerspective: z.string(),
  perspectives: z.array(z.object({
    name: z.string(),
    description: z.string(),
    insights: z.string(),
  })),
  synthesis: z.string().optional(),
  linkedInsightId: z.string().optional(),
});

export const PerspectiveShifterSessionArraySchema = z.array(PerspectiveShifterSessionSchema);

// Polarity Map Session Schema
export const PolarityMapSchema = z.object({
  id: z.string(),
  date: z.string(),
  polarityName: z.string(),
  pole1: z.string(),
  pole2: z.string(),
  upsidePole1: z.array(z.string()),
  downsidePole1: z.array(z.string()),
  upsidePole2: z.array(z.string()),
  downsidePole2: z.array(z.string()),
  actionSteps: z.array(z.string()),
  earlyWarnings: z.array(z.string()),
  linkedInsightId: z.string().optional(),
});

export const PolarityMapArraySchema = z.array(PolarityMapSchema);

export const PolarityMapDraftSchema = z.object({
  id: z.string(),
  date: z.string(),
  polarityName: z.string(),
  pole1: z.string(),
  pole2: z.string(),
  upsidePole1: z.array(z.string()),
  downsidePole1: z.array(z.string()),
  upsidePole2: z.array(z.string()),
  downsidePole2: z.array(z.string()),
  actionSteps: z.array(z.string()),
  earlyWarnings: z.array(z.string()),
  linkedInsightId: z.string().optional(),
});

// Kegan Assessment Session Schema
export const KeganAssessmentSessionSchema = z.object({
  id: z.string(),
  date: z.string(),
  responses: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })),
  assessmentResult: z.string().optional(),
  linkedInsightId: z.string().optional(),
});

export const KeganAssessmentSessionArraySchema = z.array(KeganAssessmentSessionSchema);

// Relational Pattern Session Schema
export const RelationalPatternSessionSchema = z.object({
  id: z.string(),
  date: z.string(),
  pattern: z.string(),
  conversation: z.array(z.object({
    role: z.enum(['user', 'bot']),
    content: z.string(),
  })),
  insights: z.string().optional(),
  linkedInsightId: z.string().optional(),
});

export const RelationalPatternSessionArraySchema = z.array(RelationalPatternSessionSchema);

// Role Alignment Session Schema
export const RoleAlignmentSessionSchema = z.object({
  id: z.string(),
  date: z.string(),
  roles: z.array(z.object({
    name: z.string(),
    description: z.string(),
  })),
  assessment: z.string().optional(),
  linkedInsightId: z.string().optional(),
});

export const RoleAlignmentSessionArraySchema = z.array(RoleAlignmentSessionSchema);

// Jhana Session Schema
export const JhanaSessionSchema = z.object({
  id: z.string(),
  date: z.string(),
  jhanaLevel: z.number(),
  duration: z.number(),
  notes: z.string(),
  linkedInsightId: z.string().optional(),
});

export const JhanaSessionArraySchema = z.array(JhanaSessionSchema);

// Memory Reconsolidation Session Schema
export const MemoryReconsolidationSessionSchema = z.object({
  id: z.string(),
  date: z.string(),
  targetMemory: z.string(),
  emotionalCharge: z.number(),
  reprocessing: z.string(),
  newMeaning: z.string(),
  linkedInsightId: z.string().optional(),
});

export const MemoryReconsolidationSessionArraySchema = z.array(MemoryReconsolidationSessionSchema);

export const MemoryReconsolidationDraftSchema = z.object({
  id: z.string().optional(),
  date: z.string().optional(),
  targetMemory: z.string().optional(),
  emotionalCharge: z.number().optional(),
  reprocessing: z.string().optional(),
  newMeaning: z.string().optional(),
  linkedInsightId: z.string().optional(),
});

// Eight Zones Session Schema
export const EightZonesSessionSchema = z.object({
  id: z.string(),
  date: z.string(),
  zone: z.string(),
  exploration: z.string(),
  insights: z.string(),
  linkedInsightId: z.string().optional(),
});

export const EightZonesSessionArraySchema = z.array(EightZonesSessionSchema);

export const EightZonesDraftSchema = z.object({
  id: z.string().optional(),
  date: z.string().optional(),
  zone: z.string().optional(),
  exploration: z.string().optional(),
  insights: z.string().optional(),
  linkedInsightId: z.string().optional(),
});

// Psychedelic Journey Session Schema
export const PsychedelicJourneySessionSchema = z.object({
  id: z.string(),
  date: z.string(),
  status: z.enum(['preparing', 'prepared', 'integrating', 'complete']),
  linkedInsightId: z.string().optional(),

  // Pre-session
  substance: z.string(),
  substanceOther: z.string().optional(),
  dosageDescription: z.string().optional(),
  plannedDate: z.string().optional(),
  previousExperience: z.enum(['none', 'few', 'moderate', 'extensive']).optional(),
  currentEmotions: z.array(z.string()),
  mindState: z.string(),
  bodyState: z.string().optional(),
  concerns: z.string(),
  aiReflection: z.string().optional(),
  environment: z.string(),
  companions: z.enum(['alone', 'sitter', 'guide', 'group', 'therapist', 'other']),
  companionDetails: z.string().optional(),
  safetyChecklist: z.record(z.string(), z.boolean()),
  rawIntention: z.string(),
  refinedIntention: z.string().optional(),
  useRefinedIntention: z.boolean().optional(),
  sessionGuideGenerated: z.boolean().optional(),
  prepCompletedAt: z.string().optional(),

  // Post-session
  integrationStartedAt: z.string().optional(),
  daysSinceSession: z.number().optional(),
  currentPostEmotions: z.array(z.string()).optional(),
  overallTone: z.enum(['grateful', 'confused', 'overwhelmed', 'peaceful', 'mixed', 'difficult']).optional(),
  narrative: z.string().optional(),
  keyMoments: z.array(z.string()).optional(),
  emotionsExperienced: z.array(z.string()).optional(),
  peakDescription: z.string().optional(),
  challengingMoments: z.string().optional(),
  aiThemes: z.array(z.string()).optional(),
  quadrantMapping: z.object({
    body: z.string().optional(),
    mind: z.string().optional(),
    spirit: z.string().optional(),
    shadow: z.string().optional(),
  }).optional(),
  connectionToIntention: z.string().optional(),
  userInsights: z.string().optional(),
  practices: z.array(z.string()).optional(),
  concreteSteps: z.array(z.string()).optional(),
  aiSynthesis: z.string().optional(),
  suggestedFollowUpWizards: z.array(z.string()).optional(),
  followUpDate: z.string().optional(),
  completedAt: z.string().optional(),
  crisisLevel: z.enum(['none', 'concern', 'high']).optional(),
});

export const PsychedelicJourneySessionArraySchema = z.array(PsychedelicJourneySessionSchema);

// Adaptive Cycle Session Schema
export const AdaptiveCycleSessionSchema = z.object({
  id: z.string(),
  date: z.string(),
  cycle: z.string(),
  plan: z.string(),
  linkedInsightId: z.string().optional(),
});

export const AdaptiveCycleSessionArraySchema = z.array(AdaptiveCycleSessionSchema);

// Attachment Assessment Session Schema
export const AttachmentAssessmentSessionSchema = z.object({
  id: z.string(),
  date: z.string(),
  style: z.string(),
  assessment: z.string(),
  linkedInsightId: z.string().optional(),
});

export const AttachmentAssessmentSessionArraySchema = z.array(AttachmentAssessmentSessionSchema);

// Big Mind Session Schema
export const BigMindSessionSchema = z.object({
  id: z.string(),
  date: z.string(),
  voices: z.array(z.object({
    name: z.string(),
    dialogue: z.string(),
  })),
  synthesis: z.string().optional(),
  linkedInsightId: z.string().optional(),
});

export const BigMindSessionArraySchema = z.array(BigMindSessionSchema);

// Somatic Practice Session Schema
export const SomaticPracticeSessionSchema = z.object({
  id: z.string(),
  date: z.string(),
  practice: z.string(),
  duration: z.number(),
  notes: z.string(),
  linkedInsightId: z.string().optional(),
});

export const SomaticPracticeSessionArraySchema = z.array(SomaticPracticeSessionSchema);

// Shadow Session Result Schema
export const ShadowSessionResultSchema = z.object({
  id: z.string(),
  exerciseId: z.string(),
  exerciseName: z.string(),
  exercisePhase: z.string(),
  createdAt: z.string(),
  userEntry: z.record(z.string(), z.union([z.string(), z.number()])),
  normalizedEntry: z.string(),
  guideReflection: z.string(),
  crisisLevel: z.enum(['low', 'medium', 'high', 'crisis']),
  wordToCarry: z.string().optional(),
  selfCompassionStatement: z.string().optional(),
});

export const ShadowSessionResultArraySchema = z.array(ShadowSessionResultSchema);

// Integral Body Plan Schema
export const IntegralBodyPlanSchema = z.object({
  id: z.string(),
  date: z.string(),
  plan: z.any(),
  linkedInsightId: z.string().optional(),
});

export const IntegralBodyPlanArraySchema = z.array(IntegralBodyPlanSchema);

// Workout Program Schema
export const WorkoutProgramSchema = z.object({
  id: z.string(),
  date: z.string(),
  program: z.any(),
  linkedInsightId: z.string().optional(),
});

export const WorkoutProgramArraySchema = z.array(WorkoutProgramSchema);

// Bioenergetics Session Schema
export const BioenergeneticsSessionSchema = z.object({
  id: z.string(),
  date: z.string(),
  structure: z.string(),
  exploration: z.string(),
  linkedInsightId: z.string().optional(),
});

export const BioenergeneticsSessionArraySchema = z.array(BioenergeneticsSessionSchema);

// ===== Somatic Cartography Schemas =====

const SomaticZoneMarkSchema = z.object({
  zone: z.string(),
  intensity: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  depth: z.enum(['surface', 'deep', 'both', 'diffuse', 'unclear']),
  qualities: z.array(z.string()),
  note: z.string().optional(),
});

export const SomaticBodyMapDraftSchema = z.object({
  sessionId: z.string(),
  startedAt: z.string(),
  step: z.enum(['C1', 'C2', 'C3', 'C4']),
  contextTags: z.array(z.string()),
  marks: z.array(SomaticZoneMarkSchema),
  nothingNotable: z.boolean(),
  overallIntensity: z.number().optional(),
  freeText: z.string().optional(),
  postSessionState: z.enum(['settled', 'energized', 'neutral', 'stirred_up', 'foggy', 'disconnected']).optional(),
});

export const SomaticInquiryDraftSchema = z.object({
  sessionId: z.string(),
  startedAt: z.string(),
  step: z.enum(['I1', 'I2', 'I3', 'POST_STATE']),
  anchorZone: z.string().optional(),
  offlineStartAt: z.string().optional(),
  offlineDurationMs: z.number().optional(),
  offlineReturnAt: z.string().optional(),
  i1Notes: z.string().optional(),
  i2ObservationNotes: z.string().optional(),
  i3IntegrationNotes: z.string().optional(),
  completedHere: z.boolean(),
  postSessionState: z.enum(['settled', 'energized', 'neutral', 'stirred_up', 'foggy', 'disconnected']).optional(),
});

export const SomaticSafetyProfileSchema = z.object({
  userId: z.string(),
  accessLevel: z.enum(['standard', 'inquiry_paused', 'support_referred']),
  onboardingCompletedAt: z.string().optional(),
  silhouettePreference: z.enum(['front_back', 'front_only', 'text_list']),
  aiEnabled: z.boolean(),
  adverseSessionFlags: z.array(z.string()),
  inquiryDismissCount: z.number(),
  lastInquiryAt: z.string().optional(),
  screeningAnswers: z.record(z.string(), z.string()).optional(),
});

export const SomaticBodyMapHistoryEntrySchema = z.object({
  id: z.string(),
  completedAt: z.string(),
  contextTags: z.array(z.string()),
  marks: z.array(SomaticZoneMarkSchema),
  nothingNotable: z.boolean(),
  overallIntensity: z.number().optional(),
  freeText: z.string().optional(),
  postSessionState: z.enum(['settled', 'energized', 'neutral', 'stirred_up', 'foggy', 'disconnected']).optional(),
  linkedInsightId: z.string().optional(),
});

export const SomaticBodyMapHistorySchema = z.array(SomaticBodyMapHistoryEntrySchema);

// Schema Detective Session Schema
export const SchemaSessionSchema = z.object({
  id: z.string(),
  date: z.string(),
  schema: z.string(),
  exploration: z.string(),
  linkedInsightId: z.string().optional(),
});

export const SchemaSessionArraySchema = z.array(SchemaSessionSchema);

// Plan History Schemas
export const PlanHistoryEntrySchema = z.object({
  date: z.string(),
  planId: z.string(),
  practiceId: z.string(),
  practiceName: z.string(),
  completed: z.boolean(),
  skipped: z.boolean(),
  feedback: z.string().optional(),
  adjustments: z.array(z.string()).optional(),
});

export const PlanHistoryArraySchema = z.array(PlanHistoryEntrySchema);

export const PlanProgressByDaySchema = z.record(z.string(), z.object({
  completed: z.number(),
  skipped: z.number(),
  total: z.number(),
}));

// ===== App State Schemas =====

// Active Tab Schema
export const ActiveTabSchema = z.enum([
  'dashboard',
  'stack',
  'browse',
  'tracker',
  'streaks',
  'recommendations',
  'aqal',
  'aqal-learning',
  'integral-theory',
  'mind-tools',
  'shadow-tools',
  'body-tools',
  'spirit-tools',
  'library',
  'journal',
  'quiz',
  'journey',
]);

// Practice Schema
export const PracticeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  why: z.string(),
  evidence: z.string(),
  timePerWeek: z.number(),
  roi: z.enum(['EXTREME', 'VERY HIGH', 'HIGH', 'MEDIUM', 'LOW']),
  difficulty: z.enum(['Trivial', 'Very Low', 'Low', 'Low-Medium', 'Medium', 'Medium-High', 'High']),
  affectsSystem: z.array(z.string()),
  how: z.array(z.string()),
  imageUrl: z.string().optional(),
  customizationQuestion: z.string().optional(),
});

export const CustomPracticeSchema = PracticeSchema.extend({
  isCustom: z.literal(true),
  module: z.enum(['body', 'mind', 'spirit', 'shadow']),
});

export const AllPracticeSchema = z.union([PracticeSchema, CustomPracticeSchema]);

export const PracticeStackSchema = z.array(AllPracticeSchema);

// Notes Schemas
export const PracticeNotesSchema = z.record(z.string(), z.string());
export const DailyNotesSchema = z.record(z.string(), z.string());

// Completion History Schema
export const CompletionHistorySchema = z.record(z.string(), z.array(z.string()));

// AQAL Report Schema
export const AqalReportDataSchema = z.object({
  summary: z.string(),
  quadrantInsights: z.object({
    I: z.string(),
    It: z.string(),
    We: z.string(),
    Its: z.string(),
  }),
  quadrantScores: z.object({
    I: z.number(),
    It: z.number(),
    We: z.number(),
    Its: z.number(),
  }).optional(),
  recommendations: z.array(z.string()),
  generatedAt: z.string().optional(),
});

// Journey Progress Schema
export const JourneyProgressSchema = z.record(z.string(), z.object({
  completedSteps: z.array(z.string()),
  currentStep: z.string().optional(),
  lastCompletedDate: z.string().optional(),
}));

// Integrated Insight Schema (generated from wizard sessions)
export const IntegratedInsightSchema = z.object({
  id: z.string(),
  mindToolType: z.string(),
  mindToolSessionId: z.string(),
  mindToolName: z.string(),
  mindToolReport: z.string(),
  mindToolShortSummary: z.string(),
  detectedPattern: z.string(),
  suggestedShadowWork: z.array(z.object({
    practiceId: z.string(),
    practiceName: z.string(),
    rationale: z.string(),
    microHabit: z.string().optional(),
  })),
  suggestedNextSteps: z.array(z.object({
    practiceId: z.string(),
    practiceName: z.string(),
    rationale: z.string(),
    microHabit: z.string().optional(),
  })),
  dateCreated: z.string(),
  status: z.enum(['pending', 'addressed']),
  shadowWorkSessionsAddressed: z.array(z.object({
    shadowToolType: z.string(),
    shadowSessionId: z.string(),
    dateCompleted: z.string(),
  })).optional(),
  relatedPracticeSessions: z.array(z.object({
    practiceId: z.string(),
    completionDates: z.array(z.string()),
  })).optional(),
});

export const IntegratedInsightsArraySchema = z.array(IntegratedInsightSchema);

// ===== Practice Designer Session Schemas =====

// Module balance from AI analysis
export const PracticeDesignerModuleBalanceSchema = z.object({
  bodyScore: z.number().min(0).max(1),
  mindScore: z.number().min(0).max(1),
  shadowScore: z.number().min(0).max(1),
  spiritScore: z.number().min(0).max(1),
  weakestModule: z.enum(['body', 'mind', 'shadow', 'spirit']).optional(),
  strongestModule: z.enum(['body', 'mind', 'shadow', 'spirit']).optional(),
  avoidancePattern: z.string().optional(),
});

// Daily practice in the design
export const PracticeDesignerDailyPracticeSchema = z.object({
  wizardType: z.string(),
  duration: z.number().min(1).max(120),
  module: z.enum(['body', 'mind', 'shadow', 'spirit']),
});

// Full practice design plan
export const PracticeDesignSchema = z.object({
  weeklyPlan: z.array(
    z.object({
      day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
      practices: z.array(PracticeDesignerDailyPracticeSchema),
    })
  ).length(7),
  totalWeeklyMinutes: z.number(),
  challengeToUser: z.string().optional(),
  adherenceStrategy: z.string().min(100).max(300),
});

// Full practice designer session
export const PracticeDesignerSessionSchema = z.object({
  id: z.string(),
  date: z.string(),
  // Step 1: Assessment
  mode: z.enum(['prescription', 'collaborative', 'self-directed']),
  bodyScore: z.number().min(1).max(5).optional(),
  mindScore: z.number().min(1).max(5).optional(),
  shadowScore: z.number().min(1).max(5).optional(),
  spiritScore: z.number().min(1).max(5).optional(),
  weeklyMinutes: z.number(),
  moduleBalance: PracticeDesignerModuleBalanceSchema.optional(),
  // Step 2: Plan Generation
  generatedPlan: PracticeDesignSchema.optional(),
  customizedPlan: PracticeDesignSchema.optional(),
  // Step 3: Commitment
  commitmentNotes: z.string(),
  practicesToggled: z.record(z.string(), z.boolean()),
  // Step 4: Completion
  insight: IntegratedInsightSchema.optional(),
  linkedInsightId: z.string().optional(),
});

export const PracticeDesignerSessionArraySchema = z.array(PracticeDesignerSessionSchema);

// ===== Storage Key Registry =====
// Single source of truth for all localStorage keys

export const STORAGE_KEYS = {
  // Auth (non-functional but keys exist)
  TOKEN: 'token',
  USER_ID: 'userId',
  EMAIL: 'email',

  // App State
  ACTIVE_TAB: 'activeTab',
  ACTIVE_WIZARD: 'activeWizard',
  PRACTICE_STACK: 'practiceStack',
  PRACTICE_NOTES: 'practiceNotes',
  DAILY_NOTES: 'dailyNotes',
  COMPLETION_HISTORY: 'completionHistory',
  AQAL_REPORT: 'aqalReport',
  JOURNEY_PROGRESS: 'journeyProgress',

  // Wizard Session Drafts
  DRAFT_321: 'draft321',
  DRAFT_IFS: 'draftIFS',
  DRAFT_BIAS: 'draftBias',
  DRAFT_BIAS_FINDER: 'draftBiasFinder',
  DRAFT_SO: 'draftSO',
  DRAFT_PS: 'draftPS',
  DRAFT_PM: 'draftPM',
  DRAFT_KEGAN: 'draftKegan',
  DRAFT_RELATIONAL: 'draftRelational',
  DRAFT_ATTACHMENT: 'draftAttachment',
  DRAFT_ROLE_ALIGNMENT: 'draftRoleAlignment',
  DRAFT_BIG_MIND: 'draftBigMind',
  DRAFT_MEMORY_RECON: 'memoryReconDraft',
  DRAFT_EIGHT_ZONES: 'draftEightZones',
  DRAFT_ADAPTIVE_CYCLE: 'draftAdaptiveCycle',
  DRAFT_SCHEMA_SESSION: 'draftSchemaSession',
  DRAFT_PSYCHEDELIC_JOURNEY: 'draftPsychedelicJourney',

  // Wizard Session Histories
  HISTORY_321: 'history321',
  HISTORY_IFS: 'historyIFS',
  HISTORY_BIAS: 'historyBias',
  HISTORY_BIAS_FINDER: 'historyBiasFinder',
  HISTORY_SO: 'historySO',
  HISTORY_PS: 'historyPS',
  HISTORY_PM: 'historyPM',
  HISTORY_KEGAN: 'historyKegan',
  HISTORY_RELATIONAL: 'historyRelational',
  HISTORY_ROLE_ALIGNMENT: 'historyRoleAlignment',
  HISTORY_JHANA: 'historyJhana',
  HISTORY_MEMORY_RECON: 'memoryReconHistory',
  HISTORY_EIGHT_ZONES: 'eightZonesHistory',
  HISTORY_ADAPTIVE_CYCLE: 'adaptiveCycleHistory',
  HISTORY_ATTACHMENT: 'historyAttachment',
  HISTORY_BIG_MIND: 'historyBigMind',
  HISTORY_PSYCHEDELIC_JOURNEY: 'psychedelicJourneyHistory',
  SHADOW_SESSIONS: 'shadowSessions',
  SOMATIC_PRACTICE_HISTORY: 'somaticPracticeHistory',
  SCHEMA_DETECTIVE_SESSIONS: 'schemaDetectiveSessions',

  // Parts Library
  PARTS_LIBRARY: 'partsLibrary',

  // Body Practice Plans
  INTEGRAL_BODY_PLANS: 'integralBodyPlans',
  WORKOUT_PROGRAMS: 'workoutPrograms',
  INTEGRAL_BODY_PLAN_HISTORY: 'integralBodyPlanHistory',
  PLAN_PROGRESS_BY_DAY: 'planProgressByDay',

  // Integrated Insights (generated from wizard sessions)
  INTEGRATED_INSIGHTS: 'integratedInsights',

  // Practice Designer
  PRACTICE_DESIGNER_HISTORY: 'aura-practiceDesignerHistory',
  PRACTICE_DESIGNER_ACTIVE_PLAN: 'aura-currentPracticeDesign',

  // Intelligence Hub Cache
  INTELLIGENCE_HUB_CACHE: 'intelligenceHubCache',

  // Somatic Cartography
  SOMATIC_BODY_MAP_DRAFT: 'aura-draft-somatic-cartography-checkin',
  SOMATIC_INQUIRY_DRAFT: 'aura-draft-somatic-cartography-inquiry',
  SOMATIC_SAFETY_PROFILE: 'aura-somatic-safety-profile',
  SOMATIC_BODY_MAP_HISTORY: 'aura-somaticBodyMapHistory',
} as const;

// ===== Schema Registry =====
// Maps storage keys to their Zod schemas

export const STORAGE_SCHEMAS = {
  // App State
  [STORAGE_KEYS.ACTIVE_TAB]: ActiveTabSchema,
  [STORAGE_KEYS.ACTIVE_WIZARD]: z.string().nullable(),
  [STORAGE_KEYS.PRACTICE_STACK]: PracticeStackSchema,
  [STORAGE_KEYS.PRACTICE_NOTES]: PracticeNotesSchema,
  [STORAGE_KEYS.DAILY_NOTES]: DailyNotesSchema,
  [STORAGE_KEYS.COMPLETION_HISTORY]: CompletionHistorySchema,
  [STORAGE_KEYS.AQAL_REPORT]: AqalReportDataSchema.nullable(),
  [STORAGE_KEYS.JOURNEY_PROGRESS]: JourneyProgressSchema,

  // Auth
  [STORAGE_KEYS.USER_ID]: z.string(),
  [STORAGE_KEYS.TOKEN]: z.string(),
  [STORAGE_KEYS.EMAIL]: z.string(),

  // Wizard Session Drafts
  [STORAGE_KEYS.DRAFT_321]: ThreeTwoOneSessionSchema.partial().nullable(),
  [STORAGE_KEYS.DRAFT_IFS]: IFSSessionSchema.nullable(),
  [STORAGE_KEYS.DRAFT_BIAS]: BiasDetectiveSessionSchema.nullable(),
  [STORAGE_KEYS.DRAFT_BIAS_FINDER]: BiasFinderSessionSchema.nullable(),
  [STORAGE_KEYS.DRAFT_SO]: SubjectObjectSessionSchema.nullable(),
  [STORAGE_KEYS.DRAFT_PS]: PerspectiveShifterSessionSchema.nullable(),
  [STORAGE_KEYS.DRAFT_PM]: PolarityMapDraftSchema.nullable(),
  [STORAGE_KEYS.DRAFT_KEGAN]: KeganAssessmentSessionSchema.nullable(),
  [STORAGE_KEYS.DRAFT_RELATIONAL]: RelationalPatternSessionSchema.nullable(),
  [STORAGE_KEYS.DRAFT_ATTACHMENT]: AttachmentAssessmentSessionSchema.nullable(),
  [STORAGE_KEYS.DRAFT_ROLE_ALIGNMENT]: RoleAlignmentSessionSchema.nullable(),
  [STORAGE_KEYS.DRAFT_BIG_MIND]: BigMindSessionSchema.partial().nullable(),
  [STORAGE_KEYS.DRAFT_MEMORY_RECON]: MemoryReconsolidationDraftSchema.nullable(),
  [STORAGE_KEYS.DRAFT_EIGHT_ZONES]: EightZonesDraftSchema.nullable(),
  [STORAGE_KEYS.DRAFT_ADAPTIVE_CYCLE]: AdaptiveCycleSessionSchema.nullable(),
  [STORAGE_KEYS.DRAFT_SCHEMA_SESSION]: SchemaSessionSchema.nullable(),
  [STORAGE_KEYS.DRAFT_PSYCHEDELIC_JOURNEY]: PsychedelicJourneySessionSchema.partial().nullable(),

  // Wizard Session Histories
  [STORAGE_KEYS.HISTORY_321]: ThreeTwoOneSessionArraySchema,
  [STORAGE_KEYS.HISTORY_IFS]: IFSSessionArraySchema,
  [STORAGE_KEYS.HISTORY_BIAS]: BiasDetectiveSessionArraySchema,
  [STORAGE_KEYS.HISTORY_BIAS_FINDER]: BiasFinderSessionArraySchema,
  [STORAGE_KEYS.HISTORY_SO]: SubjectObjectSessionArraySchema,
  [STORAGE_KEYS.HISTORY_PS]: PerspectiveShifterSessionArraySchema,
  [STORAGE_KEYS.HISTORY_PM]: PolarityMapArraySchema,
  [STORAGE_KEYS.HISTORY_KEGAN]: KeganAssessmentSessionArraySchema,
  [STORAGE_KEYS.HISTORY_RELATIONAL]: RelationalPatternSessionArraySchema,
  [STORAGE_KEYS.HISTORY_ROLE_ALIGNMENT]: RoleAlignmentSessionArraySchema,
  [STORAGE_KEYS.HISTORY_JHANA]: JhanaSessionArraySchema,
  [STORAGE_KEYS.HISTORY_MEMORY_RECON]: MemoryReconsolidationSessionArraySchema,
  [STORAGE_KEYS.HISTORY_EIGHT_ZONES]: EightZonesSessionArraySchema,
  [STORAGE_KEYS.HISTORY_ADAPTIVE_CYCLE]: AdaptiveCycleSessionArraySchema,
  [STORAGE_KEYS.HISTORY_ATTACHMENT]: AttachmentAssessmentSessionArraySchema,
  [STORAGE_KEYS.HISTORY_BIG_MIND]: BigMindSessionArraySchema,
  [STORAGE_KEYS.HISTORY_PSYCHEDELIC_JOURNEY]: PsychedelicJourneySessionArraySchema,
  [STORAGE_KEYS.SHADOW_SESSIONS]: ShadowSessionResultArraySchema,
  [STORAGE_KEYS.SOMATIC_PRACTICE_HISTORY]: SomaticPracticeSessionArraySchema,
  [STORAGE_KEYS.SCHEMA_DETECTIVE_SESSIONS]: SchemaSessionArraySchema,

  // Parts Library
  [STORAGE_KEYS.PARTS_LIBRARY]: IFSPartsLibrarySchema,

  // Body Practice Plans
  [STORAGE_KEYS.INTEGRAL_BODY_PLANS]: IntegralBodyPlanArraySchema,
  [STORAGE_KEYS.WORKOUT_PROGRAMS]: WorkoutProgramArraySchema,
  [STORAGE_KEYS.INTEGRAL_BODY_PLAN_HISTORY]: PlanHistoryArraySchema,
  [STORAGE_KEYS.PLAN_PROGRESS_BY_DAY]: PlanProgressByDaySchema,

  // Integrated Insights
  [STORAGE_KEYS.INTEGRATED_INSIGHTS]: IntegratedInsightsArraySchema,

  // Practice Designer
  [STORAGE_KEYS.PRACTICE_DESIGNER_HISTORY]: PracticeDesignerSessionArraySchema,
  [STORAGE_KEYS.PRACTICE_DESIGNER_ACTIVE_PLAN]: PracticeDesignerSessionSchema.nullable(),

  // Intelligence Hub Cache
  [STORAGE_KEYS.INTELLIGENCE_HUB_CACHE]: z.any(), // Complex nested structure

  // Somatic Cartography
  [STORAGE_KEYS.SOMATIC_BODY_MAP_DRAFT]: SomaticBodyMapDraftSchema.nullable(),
  [STORAGE_KEYS.SOMATIC_INQUIRY_DRAFT]: SomaticInquiryDraftSchema.nullable(),
  [STORAGE_KEYS.SOMATIC_SAFETY_PROFILE]: SomaticSafetyProfileSchema.nullable(),
  [STORAGE_KEYS.SOMATIC_BODY_MAP_HISTORY]: SomaticBodyMapHistorySchema,
} as const;

// ===== Version Registry =====
// Current version for each storage key (start at 1)

export const STORAGE_VERSIONS = {
  [STORAGE_KEYS.ACTIVE_TAB]: 1,
  [STORAGE_KEYS.ACTIVE_WIZARD]: 1,
  [STORAGE_KEYS.PRACTICE_STACK]: 1,
  [STORAGE_KEYS.PRACTICE_NOTES]: 1,
  [STORAGE_KEYS.DAILY_NOTES]: 1,
  [STORAGE_KEYS.COMPLETION_HISTORY]: 1,
  [STORAGE_KEYS.AQAL_REPORT]: 1,
  [STORAGE_KEYS.JOURNEY_PROGRESS]: 1,

  [STORAGE_KEYS.USER_ID]: 1,

  [STORAGE_KEYS.DRAFT_321]: 1,
  [STORAGE_KEYS.DRAFT_IFS]: 1,
  [STORAGE_KEYS.DRAFT_BIAS]: 1,
  [STORAGE_KEYS.DRAFT_BIAS_FINDER]: 1,
  [STORAGE_KEYS.DRAFT_SO]: 1,
  [STORAGE_KEYS.DRAFT_PS]: 1,
  [STORAGE_KEYS.DRAFT_PM]: 1,
  [STORAGE_KEYS.DRAFT_KEGAN]: 1,
  [STORAGE_KEYS.DRAFT_RELATIONAL]: 1,
  [STORAGE_KEYS.DRAFT_ATTACHMENT]: 1,
  [STORAGE_KEYS.DRAFT_ROLE_ALIGNMENT]: 1,
  [STORAGE_KEYS.DRAFT_BIG_MIND]: 1,
  [STORAGE_KEYS.DRAFT_MEMORY_RECON]: 1,
  [STORAGE_KEYS.DRAFT_EIGHT_ZONES]: 1,
  [STORAGE_KEYS.DRAFT_ADAPTIVE_CYCLE]: 1,
  [STORAGE_KEYS.DRAFT_SCHEMA_SESSION]: 1,
  [STORAGE_KEYS.DRAFT_PSYCHEDELIC_JOURNEY]: 1,

  [STORAGE_KEYS.HISTORY_321]: 1,
  [STORAGE_KEYS.HISTORY_IFS]: 1,
  [STORAGE_KEYS.HISTORY_BIAS]: 1,
  [STORAGE_KEYS.HISTORY_BIAS_FINDER]: 1,
  [STORAGE_KEYS.HISTORY_SO]: 1,
  [STORAGE_KEYS.HISTORY_PS]: 1,
  [STORAGE_KEYS.HISTORY_PM]: 1,
  [STORAGE_KEYS.HISTORY_KEGAN]: 1,
  [STORAGE_KEYS.HISTORY_RELATIONAL]: 1,
  [STORAGE_KEYS.HISTORY_ROLE_ALIGNMENT]: 1,
  [STORAGE_KEYS.HISTORY_JHANA]: 1,
  [STORAGE_KEYS.HISTORY_MEMORY_RECON]: 1,
  [STORAGE_KEYS.HISTORY_EIGHT_ZONES]: 1,
  [STORAGE_KEYS.HISTORY_ADAPTIVE_CYCLE]: 1,
  [STORAGE_KEYS.HISTORY_ATTACHMENT]: 1,
  [STORAGE_KEYS.HISTORY_BIG_MIND]: 1,
  [STORAGE_KEYS.HISTORY_PSYCHEDELIC_JOURNEY]: 1,
  [STORAGE_KEYS.SHADOW_SESSIONS]: 1,
  [STORAGE_KEYS.SOMATIC_PRACTICE_HISTORY]: 1,
  [STORAGE_KEYS.SCHEMA_DETECTIVE_SESSIONS]: 1,

  [STORAGE_KEYS.PARTS_LIBRARY]: 1,

  [STORAGE_KEYS.INTEGRAL_BODY_PLANS]: 1,
  [STORAGE_KEYS.WORKOUT_PROGRAMS]: 1,
  [STORAGE_KEYS.INTEGRAL_BODY_PLAN_HISTORY]: 1,
  [STORAGE_KEYS.PLAN_PROGRESS_BY_DAY]: 1,

  [STORAGE_KEYS.INTEGRATED_INSIGHTS]: 1,

  [STORAGE_KEYS.PRACTICE_DESIGNER_HISTORY]: 1,
  [STORAGE_KEYS.PRACTICE_DESIGNER_ACTIVE_PLAN]: 1,

  [STORAGE_KEYS.INTELLIGENCE_HUB_CACHE]: 1,

  // Somatic Cartography
  [STORAGE_KEYS.SOMATIC_BODY_MAP_DRAFT]: 1,
  [STORAGE_KEYS.SOMATIC_INQUIRY_DRAFT]: 1,
  [STORAGE_KEYS.SOMATIC_SAFETY_PROFILE]: 1,
  [STORAGE_KEYS.SOMATIC_BODY_MAP_HISTORY]: 1,
} as const;
