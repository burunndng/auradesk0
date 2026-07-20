/**
 * Gemini Service Orchestrator
 *
 * Re-exports all gemini service functions for backward compatibility.
 * The actual implementations have been split into modular files:
 * - ai/aiCore.ts: Core LLM functions (Grok, Qwen, Gemini fallbacks)
 * - gemini/*.ts: Wizard, recommendation, and analysis functions (future splits)
 *
 * This file preserves the original API surface so existing imports continue to work.
 * All 43 public exports remain available without any breaking changes.
 */

// Core LLM functions
export {
  callGrokThenAIJson,
  callGPTOssNitroJson,
  generateText,
  callOpenRouterFallback,
  callOpenRouterGrokPrimary,
  callOpenRouterQwenFallback,
  callOpenRouterDeepSeek,
  callGeminiFallback
} from './ai/aiCore';

// Re-export ALL remaining functions from the original service
// (These will be split in future phases into modular files)
export {
  generateRecommendations,
  summarizeThreeTwoOneSession,
  generateSocraticProbe,
  generateReflectiveProbe,
  generateShadowGift,
  generateWatchFor,
  generatePhasedSocraticProbe,
  generateDialogueOpeners,
  generateAqalReport,
  explainPractice,
  explainAttachmentPractices,
  getCoachResponse,
  analyzeKeganStage,
  analyzeProbeResponse,
  analyzeRoleAlignment,
  articulateSubjectTo,
  detectAttachmentStyle,
  detectPatternsAndSuggestShadowWork,
  exploreOrigin,
  extractPartInfo,
  generateAssumptionBoundaryProbe,
  generateContradictionProbe,
  generateIntegralReflection,
  generateIntegrationInsight,
  generatePracticeResearch,
  generatePracticeScript,
  generatePracticeStructure,
  generateProbeIntegratedInsights,
  generateRoleActionSuggestion,
  generateShadowPatternInsights,
  generateShadowWorkInsight,
  generateShadowWorkStructure,
  generateSpeechFromText,
  generateSpiritualContext,
  generateSpiritualPracticeStructure,
  generateSubjectByObjectProbe,
  getDailyReflection,
  getPersonalizedHowTo,
  populateCustomPractice,
  refinePractice,
  suggestSubjectObjectExperiments,
  summarizeIFSSession,
  getAttachmentExplorationResponse,
  generatePolaritySynthesis,
  suggestCounterEvidence,
  validatePolarity,
  reflectAndRefineIntention,
  analyzeNarrative,
  synthesizeIntegration,
  probeUltimateConcern,
  analyzeUltimateConcern,
  getCoherenceAuditResponse,
  analyzeCoherenceAudit
} from './aiService.original';
