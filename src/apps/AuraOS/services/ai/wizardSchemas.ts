import { z } from 'zod';

// ============================================================================
// States Training Wizard Schemas
// ============================================================================

export const statePracticeSchema = z.object({
  practiceInstructions: z.string().min(100).max(600),
  durationMinutes: z.number().min(3).max(10),
  stateLevel: z.enum(['gross', 'subtle', 'causal', 'nondual']),
});

export const stateAnalysisSchema = z.object({
  assessedState: z.enum(['gross', 'subtle', 'causal', 'nondual']),
  stabilityScore: z.number().min(0).max(1),
  developmentalEdge: z.string().min(50).max(300),
  nextPracticeSuggestion: z.string().min(50).max(200),
  suggestedAdjustment: z.enum(['gross', 'subtle', 'causal', 'nondual']).optional(),
  calibrationNote: z.string().optional(),
});

// ============================================================================
// States Training Draft Schema (for localStorage history)
// ============================================================================

export const statesTrainingDraftSchema = z.object({
  selectedTrack: z.enum(['gross', 'subtle', 'causal', 'nondual']).nullable(),
  practice: statePracticeSchema.nullable(),
  phenomenologicalReport: z.object({
    bodySensation: z.string(),
    bodyLocation: z.string().optional(),
    emotion: z.string(),
    imagery: z.string(),
    thought: z.string(),
    hardToSense: z.boolean(),
  }).nullable(),
  analysis: stateAnalysisSchema.nullable(),
  sessionId: z.string(),
  linkedInsightId: z.string().optional(),
});

// ============================================================================
// Contemplative Inquiry Wizard Schemas
// ============================================================================

// ============================================================================
// Big Mind Process Wizard Schemas
// ============================================================================

export const bigMindSummarySchema = z.object({
  primaryVoices: z.array(z.string()).describe('2-3 most significant voices discussed'),
  witnessPerspective: z.string().describe('1-2 sentence insight from the witness/observer perspective'),
  integrationCommitments: z.array(z.string()).describe('2-3 concrete insights or commitments the user expressed'),
  recommendedPractices: z.array(z.object({
    practiceName: z.string().describe('Name of the practice'),
    rationale: z.string().describe('Why this practice supports integration')
  })).describe('Shadow work practices that could support integration')
});

// ============================================================================
// Contemplative Inquiry Wizard Schemas
// ============================================================================

export const contemplativeInquiryInsightSchema = z.object({
  mindToolReport: z
    .string()
    .describe('A full paragraph summarising the contemplative inquiry session.'),
  mindToolShortSummary: z
    .string()
    .describe('One sentence (max 120 chars) summary of the session.'),
  detectedPattern: z
    .string()
    .describe('The core psychological or spiritual pattern surfaced.'),
  essentialQuality: z
    .string()
    .describe('The essential quality or ground reached (love, spaciousness, clarity, etc.).'),
  suggestedShadowWork: z.array(
    z.object({
      practiceId: z.string(),
      practiceName: z.string(),
      rationale: z.string(),
      microHabit: z.string().optional(),
    }),
  ),
  suggestedNextSteps: z.array(
    z.object({
      practiceId: z.string(),
      practiceName: z.string(),
      rationale: z.string(),
      microHabit: z.string().optional(),
    }),
  ),
});

export type ContemplativeInquiryInsight = z.infer<typeof contemplativeInquiryInsightSchema>;

export const inquiryReflectionSchema = z.object({
  reflection: z.string().min(100).max(400),
  nextPrompt: z.string().min(50).max(200),
  layerType: z.enum(['defense', 'emotion', 'deeper-emotion', 'essential-quality']),
  layerSummary: z.string().max(80),
  shouldDeepen: z.boolean(),
  essentialQuality: z.string().optional(),
});

// ============================================================================
// Golden Shadow Wizard Schemas
// ============================================================================

export const qualityExtractionSchema = z.object({
  probingQuestions: z.array(z.string()).min(2).max(4),
  suggestedQualities: z.array(z.string()).min(3).max(6),
});

export const goldenShadowAnalysisSchema = z.object({
  defensePattern: z.string().min(100).max(800),
  minimizationExamples: z.array(z.string()).min(1).max(3),
  attributionPattern: z.string().min(50).max(500),
});

export const behavioralExperimentSchema = z.object({
  situation: z.string().min(50).max(200),
  proposedAction: z.string().min(100).max(300),
  rationale: z.string().min(100).max(300),
  successIndicators: z.array(z.string()).min(2).max(4),
});

// ============================================================================
// Attachment Practice Wizard Schemas
// ============================================================================

export const attachmentPsychoeducationSchema = z.object({
  styleSummary: z.string().min(200).max(500),
  strengths: z.array(z.string()).min(2).max(4),
  challenges: z.array(z.string()).min(2).max(4),
  earnedSecurityPath: z.string().min(150).max(400),
});

export const relationalMomentSchema = z.object({
  trigger: z.string().min(50).max(200),
  internalModel: z.string().min(100).max(300),
  automaticStrategy: z.string().min(100).max(300),
  outcome: z.string().min(50).max(200),
  underlyingNeed: z.string().min(50).max(200),
});

// ============================================================================
// AXIS Insight Schema
// ============================================================================

export const axisInsightSchema = z.object({
  detectedPattern: z.string().max(300),
  suggestedShadowWork: z.array(z.string().max(200)).max(3),
  suggestedNextSteps: z.array(z.string().max(200)).max(3),
});

// ============================================================================
// Moral Reasoning Wizard Schemas
// ============================================================================

export const moralDilemmaSchema = z.object({
  scenario: z.string().min(1),
  domainTag: z.string().min(1),
  stakeholders: z.array(z.string()).min(2),
  coreConflict: z.string().min(1),
  probe: z.string().min(1),
  keyStakeholder: z.string().min(1),
});

export const moralAnalysisSchema = z.object({
  dominantStage: z.string().min(1), // Descriptive string, NEVER a number
  structureDescription: z.string().min(1),
  reasoningIndicators: z.array(z.string()).min(1),
  justiceCareBalance: z.number().min(-1).max(1), // -1 = pure care, +1 = pure justice
  blindSpots: z.array(z.string()).min(1),
  stretchExercise: z.string().min(1),
  stretchRationale: z.string().min(1),
  crossSituationalPattern: z.string().min(1),
  perspectiveTakingScore: z.number().min(0).max(1),
  perspectiveTakingNotes: z.string().min(1),
});

// ============================================================================
// Context AI Root Cause Wizard Schemas
// ============================================================================

export const contextAIRootCauseSchema = z.object({
  causes: z.array(
    z.object({
      text: z.string().min(20).max(300),
      quadrant: z.enum(['individual-internal', 'individual-external', 'collective-internal', 'collective-external']),
    })
  ).min(2).max(8),
});

export type ContextAIRootCause = z.infer<typeof contextAIRootCauseSchema>;

// ============================================================================
// Interoception Wizard Schemas
// ============================================================================

export const interoceptionExerciseSchema = z.object({
  title: z.string(),
  duration: z.number().int().min(1).max(30),
  difficulty: z.number().int().min(1).max(5),
  instructions: z.string(),
  targetRegions: z.array(z.string()).min(1).max(8),
  focusPrompt: z.string(),
});

export const interoceptionFeedbackSchema = z.object({
  granularityScore: z.number().min(0).max(10),
  feedbackText: z.string(),
  strengthAreas: z.array(z.string()),
  growthAreas: z.array(z.string()),
  crossModalInsight: z.string().optional(),
});

// ============================================================================
// Memory Reconsolidation Wizard Schemas
// ============================================================================

export const memoryReconBeliefAnalysisSchema = z.object({
  reflection: z.string(),
  coreTheme: z.string(),
  gentleChallenge: z.string(),
});

export const memoryReconContradictionSchema = z.object({
  amplifiedTruth: z.string(),
  somaticCue: z.string(),
  flexibilityObservation: z.string(),
});

export const memoryReconSynthesisSchema = z.object({
  shiftAnalysis: z.string(),
  contradictionInsight: z.string(),
  processReflection: z.string(),
  weeklyPractice: z.string(),
  routing: z.object({
    domain: z.string(),
    intensity: z.string(),
  }),
});

export type MemoryReconBeliefAnalysis = z.infer<typeof memoryReconBeliefAnalysisSchema>;
export type MemoryReconContradiction = z.infer<typeof memoryReconContradictionSchema>;
export type MemoryReconSynthesis = z.infer<typeof memoryReconSynthesisSchema>;

// ============================================================================
// Ultimate Concern Wizard Schemas
// ============================================================================

export const ultimateConcernProbeSchema = z.object({
  domain: z.enum(['survival', 'belonging', 'meaning', 'legacy', 'truth', 'love', 'freedom']),
  probingQuestions: z.array(z.string()).min(2).max(3),
});

export const ultimateConcernAnalysisSchema = z.object({
  holdingDescription: z.string().min(200).max(500),
  meaningMakingStructure: z.string().min(100).max(300),
  actionValueGap: z.string().min(100).max(400),
  stretchExercise: z.string().min(150).max(500),
});

// ============================================================================
// Integral Practice Designer Wizard Schemas
// ============================================================================

export const moduleBalanceSchema = z.object({
  bodyScore: z.number().min(0).max(1),
  mindScore: z.number().min(0).max(1),
  shadowScore: z.number().min(0).max(1),
  spiritScore: z.number().min(0).max(1),
  weakestModule: z.enum(['body', 'mind', 'shadow', 'spirit']),
  strongestModule: z.enum(['body', 'mind', 'shadow', 'spirit']),
  avoidancePattern: z.string().optional(),
});

export const dailyPracticeSchema = z.object({
  wizardType: z.string(),
  duration: z.number().min(1).max(120),
  module: z.enum(['body', 'mind', 'shadow', 'spirit']),
  specificFocus: z.string().optional(),
});

export const practiceDesignSchema = z.object({
  weeklyPlan: z.array(
    z.object({
      day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
      practices: z.array(dailyPracticeSchema),
    })
  ).length(7),
  totalWeeklyMinutes: z.number(),
  challengeToUser: z.string().optional(),
  adherenceStrategy: z.string().min(100).max(300),
});

// ============================================================================
// Wizard Insight Schema (shared across all wizards)
// ============================================================================

export const wizardInsightSchema = z.object({
  detectedPattern: z.string().min(50).max(500),
  suggestedShadowWork: z.array(
    z.object({
      practiceId: z.string(),
      practiceName: z.string(),
      rationale: z.string(),
      microHabit: z.string().optional(),
    })
  ).min(0).max(3),
  suggestedNextSteps: z.array(
    z.object({
      practiceId: z.string(),
      practiceName: z.string(),
      rationale: z.string(),
      microHabit: z.string().optional(),
    })
  ).min(1).max(3),
});

// ============================================================================
// AXIS Synthesis Schema
// ============================================================================

export const axisSynthesisSchema = z.object({
  userPatterns: z.object({
    coreDynamic: z.string().max(2500),
    typicalDefenses: z.string().max(2500),
    blindSpots: z.string().max(2500),
    triggers: z.string().max(2500),
  }),
  sessionFindings: z.object({
    presentingToRoot: z.string().max(3000),
    keyInsight: z.string().max(3000),
    shift: z.string().max(2500),
    successCriteriaMet: z.string().max(1500),
  }),
  analystNotes: z.object({
    effective: z.string().max(2000),
    avoid: z.string().max(2000),
  }),
  openThreads: z.array(z.string().max(1500)).max(6),
  nextSession: z.object({
    entryPoint: z.string().max(2500),
    hypothesisToTest: z.string().max(2500),
  }),
  cumulativeContext: z.string().max(5000),
  // Legacy field kept for migration fallback parsing — new sessions use proposedNewTruths
  persistentCoreTruths: z.array(z.string()).optional(),
  proposedNewTruths: z.array(z.string().max(300)).max(5).optional(),
  proposedUserSaves: z.array(z.object({
    text: z.string().max(300),
    kind: z.enum(['insight', 'pattern', 'commitment', 'belief', 'definition', 'other']).optional(),
  })).max(5).optional(),
  behavioralCommitment: z.string().max(1500).optional(),
});
export type AXISSynthesisAI = z.infer<typeof axisSynthesisSchema>;

// Type exports for TypeScript consumers
export type StatePractice = z.infer<typeof statePracticeSchema>;
export type StateAnalysis = z.infer<typeof stateAnalysisSchema>;
export type StatesTrainingDraft = z.infer<typeof statesTrainingDraftSchema>;
export type InquiryReflection = z.infer<typeof inquiryReflectionSchema>;
export type QualityExtraction = z.infer<typeof qualityExtractionSchema>;
export type GoldenShadowAnalysis = z.infer<typeof goldenShadowAnalysisSchema>;
export type BehavioralExperiment = z.infer<typeof behavioralExperimentSchema>;
export type AttachmentPsychoeducation = z.infer<typeof attachmentPsychoeducationSchema>;
export type RelationalMoment = z.infer<typeof relationalMomentSchema>;
export type MoralDilemma = z.infer<typeof moralDilemmaSchema>;
export type MoralAnalysis = z.infer<typeof moralAnalysisSchema>;
export type InteroceptionExercise = z.infer<typeof interoceptionExerciseSchema>;
export type InteroceptionFeedback = z.infer<typeof interoceptionFeedbackSchema>;
export type UltimateConcernProbe = z.infer<typeof ultimateConcernProbeSchema>;
export type UltimateConcernAnalysis = z.infer<typeof ultimateConcernAnalysisSchema>;
export type ModuleBalance = z.infer<typeof moduleBalanceSchema>;
export type PracticeDesign = z.infer<typeof practiceDesignSchema>;
export type WizardInsight = z.infer<typeof wizardInsightSchema>;

// ============================================================================
// Language Lab Schema
// ============================================================================

export const LanguageLabOutputSchema = z.object({
  romanization: z.string(),
  nativeScript: z.string().optional(),
  grammaticalNotes: z.string(),
  exampleSentences: z.array(z.object({
    original: z.string(),
    gloss: z.string(),
    translation: z.string()
  })).min(2).max(4),
  revivalPhilosophy: z.string()
});

export type LanguageLabOutput = z.infer<typeof LanguageLabOutputSchema>;

// ============================================================================
// Relational Field Mapper Schemas
// ============================================================================

export const relationshipEntrySchema = z.object({
  name: z.string(),
  type: z.enum(['family', 'romantic', 'friendship', 'work', 'community']),
  connectionQuality: z.number().min(1).max(10),
  conflictFrequency: z.enum(['rarely', 'monthly', 'weekly', 'daily']),
  feltSense: z.string(),
  roleYouPlay: z.string(),
});
export type RelationshipEntry = z.infer<typeof relationshipEntrySchema>;

export const relationalFieldSchema = z.object({
  dominantRole: z.string(),
  projectionTargets: z.array(z.string()),
  shadowHypothesis: z.string(),
  attachmentPattern: z.enum(['secure', 'anxious', 'avoidant', 'disorganized']),
  developmentalEdge: z.string(),
  recommendedWizard: z.enum(['ifs', '321', 'golden-shadow', 'attachment-practice', 'relational-blueprint']),
  practicePerStrain: z.array(z.object({ relationship: z.string(), practice: z.string() })),
});
export type RelationalFieldAnalysis = z.infer<typeof relationalFieldSchema>;

// Split prompt schemas for RelationalFieldMapper
export const relationalFieldSynthesisSchema = z.object({
  dominantRole: z.string(),
  developmentalEdge: z.string(),
});
export type RelationalFieldSynthesis = z.infer<typeof relationalFieldSynthesisSchema>;

export const relationalFieldShadowSchema = z.object({
  projectionTargets: z.array(z.string()),
  shadowHypothesis: z.string(),
  attachmentPattern: z.enum(['secure', 'anxious', 'avoidant', 'disorganized']),
  recommendedWizard: z.enum(['ifs', '321', 'golden-shadow', 'attachment-practice', 'relational-blueprint']),
  practicePerStrain: z.array(z.object({ relationship: z.string(), practice: z.string() })),
});
export type RelationalFieldShadow = z.infer<typeof relationalFieldShadowSchema>;

// ============================================================================
// Life Architecture Wizard Schemas
// ============================================================================

export const architectureAuditSchema = z.object({
  valueBehaviorGaps: z.array(z.object({
    value: z.string(),
    contradiction: z.string(),
    severity: z.enum(['high', 'medium', 'low']),
  })),
  energyArchitecture: z.object({
    primaryDrains: z.array(z.string()),
    primarySources: z.array(z.string()),
    chronotypeAlignment: z.string(),
    overallAssessment: z.string(),
  }),
  timeRedesign: z.array(z.object({
    domain: z.string(),
    currentHours: z.number(),
    recommendedHours: z.number(),
    rationale: z.string(),
  })),
  roleClarity: z.array(z.object({
    role: z.string(),
    recommendation: z.enum(['reinvest', 'renegotiate', 'release', 'honor']),
    note: z.string(),
  })),
  environmentChanges: z.array(z.object({
    change: z.string(),
    impactLevel: z.enum(['high', 'medium', 'low']),
    implementation: z.string(),
  })),
  frictionDissolution: z.array(z.object({
    friction: z.string(),
    intervention: z.string(),
  })),
  redesignStack: z.array(z.object({
    change: z.string(),
    priority: z.number(),
    timeframe: z.string(),
    successIndicator: z.string(),
  })),
  practiceStackAlignment: z.array(z.object({
    practiceId: z.string(),
    supported: z.boolean(),
    note: z.string(),
  })),
  closingReflection: z.string(),
});
export type ArchitectureAudit = z.infer<typeof architectureAuditSchema>;

export const architectureRedesignSchema = z.object({
  structuralChange: z.string(),
  implementation: z.string(),
  timeline: z.string(),
  successIndicator: z.string(),
  connectionToValues: z.string(),
});
export type ArchitectureRedesign = z.infer<typeof architectureRedesignSchema>;

// ============================================================================
// Cultural Shadow Excavator Schemas
// ============================================================================

export const culturalLineageSchema = z.object({
  dominantNarratives: z.array(z.string()),
  scapegoatPatterns: z.array(z.string()),
  collectiveDefenses: z.array(z.string()),
});
export type CulturalLineageAnalysis = z.infer<typeof culturalLineageSchema>;

export const culturalShadowSchema = z.object({
  collectiveShadowThemes: z.array(z.string()),
  personalAlignment: z.string(),
  inheritedBeliefs: z.array(z.string()),
  altitudeEstimate: z.enum(['amber', 'orange', 'green', 'teal', 'turquoise']),
  liberationMoves: z.array(z.object({ pattern: z.string(), practice: z.string() })),
  recommendedWizard: z.enum(['321', 'golden-shadow', 'kegan', 'contemplative-inquiry']),
});
export type CulturalShadowAnalysis = z.infer<typeof culturalShadowSchema>;

// ============================================================================
// Kegan Assessment Scoring Schema
// ============================================================================

export const keganScoringSchema = z.object({
  centerOfGravityLabel: z.enum([
    'The Socialized Mind',
    'Transitioning: Socialized to Self-Authored',
    'The Self-Authored Mind',
    'Transitioning: Self-Authored to Self-Transforming',
    'The Self-Transforming Mind',
  ]),
  numericScore: z.number().min(2.0).max(5.0),
  subjectObjectMap: z.object({
    subjectTo: z.string().min(20).max(600),
    objectTo: z.string().min(20).max(600),
  }),
  domainSplit: z.string().min(30).max(800),
  growthEdge: z.string().min(30).max(1000),
});

export type KeganScoringResult = z.infer<typeof keganScoringSchema>;

// ============================================================================
// Tree of Life Insight Schema
// ============================================================================

export const treeOfLifeInsightSchema = z.object({
  mindToolReport: z.string().describe('Full paragraph summarising the Tree of Life practice session.'),
  mindToolShortSummary: z.string().describe('One sentence (max 120 chars) capturing the essence of the session.'),
  detectedPattern: z.string().describe('The core developmental or spiritual pattern surfaced.'),
  sephiraicLesson: z.string().describe("The specific teaching of the chosen Sephira as it manifested today."),
  qliphothicInsight: z.string().describe('What shadow material was identified and how it relates to the pattern.'),
  suggestedShadowWork: z.array(
    z.object({
      practiceId: z.string(),
      practiceName: z.string(),
      rationale: z.string(),
    })
  ),
  suggestedNextSteps: z.array(
    z.object({
      practiceId: z.string(),
      practiceName: z.string(),
      rationale: z.string(),
    })
  ),
  integrationTheme: z.string().describe('Core integration theme in 3-5 words.'),
  confidenceScore: z.number().min(0).max(1),
});

export type TreeOfLifeInsight = z.infer<typeof treeOfLifeInsightSchema>;

// ============================================================================
// 4-Quadrant Catalyst Schemas
// ============================================================================
export const textRefinementSchema = z.object({
  result: z.string().describe('The refined text according to instructions.')
});
export type TextRefinementResult = z.infer<typeof textRefinementSchema>;

// ============================================================================
// Chronobiology Protocol Wizard Schemas
// ============================================================================

export const chronobiologyWindowsSchema = z.object({
  windows: z.array(z.object({
    windowType: z.enum(['peak-cognitive', 'secondary-cognitive', 'physical', 'social-relational', 'low-demand', 'creative-associative']),
    timeRange: z.string().min(3).max(60),
    confidenceLevel: z.enum(['high', 'medium', 'low']),
    evidenceSummary: z.string().min(10).max(200),
  })).length(6),
  dataQualityWarnings: z.array(z.string()),
});

export type ChronobiologyWindows = z.infer<typeof chronobiologyWindowsSchema>;

export const chronobiologyMismatchSchema = z.object({
  findings: z.array(z.object({
    activity: z.string(),
    status: z.enum(['aligned', 'mismatched', 'unscheduled']),
    explanation: z.string().min(10).max(200),
    suggestedWindow: z.string().optional(),
  })),
  primaryLeveragePoint: z.string().min(20).max(300),
});

export type ChronobiologyMismatch = z.infer<typeof chronobiologyMismatchSchema>;

export const chronobiologyOutputSchema = z.object({
  chronobiologySummary: z.string().min(80).max(500),
  architectureType: z.string().min(10).max(100),
});

export type ChronobiologyOutput = z.infer<typeof chronobiologyOutputSchema>;

// ============================================================================
// Relational Blueprint Wizard Schemas
// ============================================================================

export const relationalPatternHypothesisSchema = z.object({
  patternHypothesis: z.string().min(30).max(400),
  synthesisAngle: z.enum(['roles', 'breakdown-moments']),
});

export type RelationalPatternHypothesis = z.infer<typeof relationalPatternHypothesisSchema>;

export const relationalBlueprintFinalSynthesisSchema = z.object({
  patternMechanismSummary: z.string().min(40).max(400),
  relationalStrengthIdentified: z.string().min(20).max(200),
});

export type RelationalBlueprintFinalSynthesis = z.infer<typeof relationalBlueprintFinalSynthesisSchema>;

export const blameCheckSchema = z.object({
  hasBlamePhrasing: z.boolean(),
  rewrite: z.string().min(10).max(600),
  explanation: z.string().min(10).max(200),
});

export type BlameCheck = z.infer<typeof blameCheckSchema>;

export const messageRewriteSchema = z.object({
  rewrite: z.string().min(10).max(600),
});

export type MessageRewrite = z.infer<typeof messageRewriteSchema>;

// ─── Reality Tunnel Flexibility Wizard ───────────────────────────────────────

export const originSynthesisSchema = z.object({
  reflection: z.string().min(80).max(800),
  acquisitionSummary: z.string().min(40).max(400),
  transitionPrompt: z.string().min(40).max(600),
});
export type OriginSynthesis = z.infer<typeof originSynthesisSchema>;

export const counterModelSchema = z.object({
  strengthenedCounterModel: z.string().min(80).max(800),
  additionalPerspectives: z.array(z.string().min(20)).min(1).max(3),
  flexibilityObservation: z.string().min(40).max(400),
});
export type CounterModel = z.infer<typeof counterModelSchema>;

export const realityTunnelIntegrationSchema = z.object({
  beliefHonoring: z.string().min(50).max(600),
  flexibilityHonoring: z.string().min(50).max(600),
  processReflection: z.string().min(50).max(600),
  weeklyPractice: z.string().min(30).max(400),
  flexibilityInsight: z.string().min(20).max(240),
  routing: z.object({
    beliefDomain: z.enum(['self-identity', 'relationships', 'worldview', 'capabilities', 'other']),
    originDepth: z.enum(['recent-learning', 'cultural-absorption', 'formative-experience', 'early-childhood']),
    somaticSignificance: z.enum(['low', 'moderate', 'high']),
  }),
});
export type RealityTunnelIntegration = z.infer<typeof realityTunnelIntegrationSchema>;

// ============================================================================
// CBM-I Interpretation Lens Wizard Schemas
// ============================================================================

export const cbmWeeklyReviewSchema = z.object({
  trendSummary: z.string().min(20).max(500),
  hardestScenarioReflection: z.string().min(20).max(300),
  microExperiment: z.string().min(20).max(200),
  dominantQuadrant: z.enum(['UL', 'UR', 'LL', 'LR']),
  growingEdge: z.string().min(10).max(200),
});

// ============================================================================
// Defusion Lab Wizard Schemas (ACT Cognitive Defusion)
// ============================================================================

export const defusionExternalizationSchema = z.object({
  externalizedReflection: z.string().min(30).max(400)
    .describe('A brief externalized reflection that mirrors the thought back without evaluating its truth or falsity. Use the user\'s own words. Must NOT contain phrases like "this thought is irrational" or "this isn\'t true."'),
});
export type DefusionExternalization = z.infer<typeof defusionExternalizationSchema>;

export const defusionPatternObservationSchema = z.object({
  recurringStory: z.string().min(20).max(200)
    .describe('The recurring narrative pattern across sessions, named descriptively (e.g. "The Not-Good-Enough Story").'),
  mostEffectiveExperiments: z.array(z.string()).min(1).max(4)
    .describe('Which experiment types have been most effective for this user.'),
  observation: z.string().min(30).max(300)
    .describe('A brief, non-evaluative observation about how the user\'s relationship with sticky thoughts is evolving.'),
});
export type DefusionPatternObservation = z.infer<typeof defusionPatternObservationSchema>;

// ============================================================================
// Generativity Map Wizard Schemas
// ============================================================================

export const generativityPortraitSchema = z.object({
  para1: z.string().min(60).max(400)
    .describe('Who this person has become through what they have lived. Use their own words and earned wisdom statements. Grounded — not inflated.'),
  para2: z.string().min(60).max(400)
    .describe('The specific form their contribution takes. Reference the contribution forms they chose. Concrete and specific.'),
  para3: z.string().min(60).max(400)
    .describe('Who needs what they carry — the beneficiary of their contribution. Written in second person.'),
});
export type GenerativityPortrait = z.infer<typeof generativityPortraitSchema>;


// ============================================================================
// Examining Core Belief Wizard Schemas
// ============================================================================

export const examiningCoreBeliefSchema = z.object({
  detectedPattern: z.string().min(30).max(200),
  beliefOriginInsight: z.string().min(50).max(300),
  shadowDimension: z.string().min(50).max(300),
  somaticAwareness: z.string().min(30).max(200),
  updatedBeliefStrength: z.number().min(0).max(1),
  integrationCommitment: z.string().min(30).max(200),
  recommendedPractice: z.object({
    practiceName: z.string(),
    rationale: z.string().min(30).max(200),
  }),
});
export type ExaminingCoreBeliefAnalysis = z.infer<typeof examiningCoreBeliefSchema>;

// ─── Phenomenon Mapper schemas ───────────────────────────────────

export const phenomenonCardsSchema = z.object({
  cards: z.array(z.object({
    id: z.string(),
    name: z.string(),
    source: z.literal('ai'),
  })).min(3).max(6),
});

export const mapChallengesSchema = z.object({
  challenges: z.array(z.object({
    cardId: z.string(),
    counterQuadrant: z.enum(['UL', 'UR', 'LL', 'LR']),
    challenge: z.string(),
  })).min(1).max(3),
});

export const socraticProbeSchema = z.object({
  probe: z.string().min(10),
});

export const tetrarArisingSynthesisSchema = z.object({
  synthesis: z.string().min(50),
  keyInsight: z.string().min(10),
});
