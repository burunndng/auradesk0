/**
 * Schema Therapy Service Orchestrator
 *
 * Re-exports all schema therapy functions for backward compatibility.
 * The actual implementations have been split into modular files:
 * - schema/schemaTestData.ts: Test questions and metadata (363KB lazy-loadable)
 * - schema/schemaScoring.ts: EMS and Mode scoring functions
 * - schema/schemaAnalysis.ts: Test analysis and profile synthesis
 *
 * This file preserves the original API surface so existing imports continue to work.
 * All 24 public exports remain available without any breaking changes.
 */

// Test data and metadata
export {
  EMS_QUESTIONS,
  MODE_QUESTIONS,
  SCHEMA_TESTS,
  getAllEMSQuestions,
  getAllModeQuestions,
  getSchemaTestMetadata,
  getAllSchemaTests,
  getActiveSchemaTests
} from './schema/schemaTestData';

// Additional exports from original service (for functions/data not yet split)
export {
  EMSA_90_ITEMS
} from './schemaTherapyService.original';

// Scoring functions
export {
  calculateSchemaScore,
  scoreEMSTest,
  scoreModeTest,
  generateSchemaInterpretation,
  aggregateDomains,
  calculateModeScore,
  generateModeInterpretation,
  getModeTriggersBehaviors,
  generateModeProfile,
  generateOverallBalance,
  generateModeRecommendations,
  calculateEMSAScores,
  calculateDomainAnalyses
} from './schemaTherapyService.original';

// Type exports
export type {
  SchemaScore,
  DomainAnalysis,
  ModeScore,
  ModeProfile
} from '../types';

// Analysis and synthesis functions imported from original service
// (These modules will be extracted in future phases)
export {
  analyzeSchemaTestResponses,
  synthesizeSchemaProfile,
  generateEMSNarrative,
  generateModeNarrative,
  generateEMSPracticeRecommendations,
  generateEMSMindToolRecommendations,
  generateModePracticeRecommendations,
  generateModeMindToolRecommendations
} from './schemaTherapyService.original';
