/**
 * Schema Therapy Scoring Service
 * 
 * Deterministic scoring logic for Schema Detective assessments.
 * Calculates immediate results from Likert scale responses without LLM dependency.
 * 
 * Scoring is based on Jeffrey Young's Schema Therapy scoring methodology.
 */

import {
  SchemaTestId,
  SchemaName,
  SchemaMode,
  CopingStyle,
  SchemaTestResponse,
  SchemaTestResult,
  IdentifiedSchema,
  IdentifiedMode,
  IdentifiedCopingPattern,
  TriggerPattern,
  SchemaDomain
} from '../types';
import {
  getSchemaTestItems,
  SchemaItem,
  ModeItem,
  CopingItem,
  TriggerItem
} from '../data/schemaItems';

// ============================================================================
// Types
// ============================================================================

export interface ItemResponse {
  itemId: string;
  value: number; // 1-6 Likert scale
}

export interface TestProgress {
  totalItems: number;
  answeredItems: number;
  percentComplete: number;
}

// ============================================================================
// Scoring Thresholds
// ============================================================================

/**
 * Score thresholds for schema activation
 * Based on Young's YSQ scoring: Mean score >= 3.0 indicates schema activation
 */
const SCHEMA_ACTIVATION_THRESHOLD = 3.0;
const SCHEMA_HIGH_THRESHOLD = 4.5;

/**
 * Score thresholds for mode activation
 */
const MODE_ACTIVATION_THRESHOLD = 3.0;
const MODE_HIGH_THRESHOLD = 4.5;

/**
 * Score thresholds for coping style prevalence
 */
const COPING_ACTIVATION_THRESHOLD = 3.0;
const COPING_HIGH_THRESHOLD = 4.5;

/**
 * Score thresholds for trigger intensity
 */
const TRIGGER_LOW_THRESHOLD = 2.5;
const TRIGGER_MEDIUM_THRESHOLD = 3.5;
const TRIGGER_HIGH_THRESHOLD = 4.5;

// ============================================================================
// Schema Domain Mappings
// ============================================================================

const SCHEMA_DOMAIN_MAP: Record<SchemaName, SchemaDomain> = {
  'abandonment': 'disconnection-rejection',
  'mistrust-abuse': 'disconnection-rejection',
  'emotional-deprivation': 'disconnection-rejection',
  'defectiveness-shame': 'disconnection-rejection',
  'social-isolation': 'disconnection-rejection',
  'dependence-incompetence': 'impaired-autonomy',
  'vulnerability': 'impaired-autonomy',
  'enmeshment': 'impaired-autonomy',
  'failure': 'impaired-autonomy',
  'entitlement-grandiosity': 'impaired-limits',
  'insufficient-self-control': 'impaired-limits',
  'subjugation': 'other-directedness',
  'self-sacrifice': 'other-directedness',
  'approval-seeking': 'other-directedness',
  'negativity-pessimism': 'overvigilance-inhibition',
  'emotional-inhibition': 'overvigilance-inhibition',
  'unrelenting-standards': 'overvigilance-inhibition',
  'punitiveness': 'overvigilance-inhibition'
};

const MODE_CATEGORY_MAP: Record<SchemaMode, 'child' | 'coping' | 'parent' | 'healthy'> = {
  'vulnerable-child': 'child',
  'angry-child': 'child',
  'impulsive-child': 'child',
  'undisciplined-child': 'child',
  'happy-child': 'child',
  'compliant-surrender': 'coping',
  'detached-protector': 'coping',
  'detached-self-soother': 'coping',
  'self-aggrandizer': 'coping',
  'bully-attack': 'coping',
  'punitive-parent': 'parent',
  'demanding-parent': 'parent',
  'healthy-adult': 'healthy'
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate mean score for a set of responses
 */
function calculateMeanScore(responses: ItemResponse[]): number {
  if (responses.length === 0) return 0;
  const sum = responses.reduce((acc, r) => acc + r.value, 0);
  return sum / responses.length;
}

/**
 * Calculate confidence based on response consistency
 * Higher variance = lower confidence
 */
function calculateConfidence(responses: ItemResponse[]): number {
  if (responses.length === 0) return 0;
  
  const mean = calculateMeanScore(responses);
  const variance = responses.reduce((acc, r) => acc + Math.pow(r.value - mean, 2), 0) / responses.length;
  const stdDev = Math.sqrt(variance);
  
  // Convert to confidence (0-1), lower stdDev = higher confidence
  // Likert scale range is 1-6, max stdDev ~ 2.5
  const confidence = Math.max(0, Math.min(1, 1 - (stdDev / 2.5)));
  
  return confidence;
}

/**
 * Get readable description based on score
 */
function getSchemaDescription(schema: SchemaName, score: number): string {
  const descriptions: Record<SchemaName, { low: string; medium: string; high: string }> = {
    'abandonment': {
      low: 'Occasional worries about losing close relationships',
      medium: 'Frequent anxiety about abandonment in important relationships',
      high: 'Intense fear of abandonment that significantly impacts relationships'
    },
    'mistrust-abuse': {
      low: 'Mild skepticism in some relationships',
      medium: 'Significant mistrust and guardedness with others',
      high: 'Pervasive expectation of betrayal or exploitation'
    },
    'emotional-deprivation': {
      low: 'Sometimes feels emotional needs aren\'t fully met',
      medium: 'Frequent sense that emotional needs go unmet',
      high: 'Deep belief that no one will provide emotional support'
    },
    'defectiveness-shame': {
      low: 'Occasional self-critical thoughts',
      medium: 'Significant shame about perceived flaws',
      high: 'Core belief of being fundamentally defective or unlovable'
    },
    'social-isolation': {
      low: 'Sometimes feels different from others',
      medium: 'Frequent feeling of not belonging',
      high: 'Profound sense of alienation and social disconnection'
    },
    'dependence-incompetence': {
      low: 'Occasional doubts about handling things alone',
      medium: 'Frequent reliance on others for decisions',
      high: 'Pervasive belief in inability to cope independently'
    },
    'vulnerability': {
      low: 'Some anxiety about potential problems',
      medium: 'Frequent worrying about disasters or illness',
      high: 'Constant fear that catastrophe is imminent'
    },
    'enmeshment': {
      low: 'Close family bonds with some boundaries',
      medium: 'Difficulty maintaining separate identity from family',
      high: 'Extreme fusion with parent(s) with minimal autonomy'
    },
    'failure': {
      low: 'Occasional concerns about competence',
      medium: 'Significant belief in inadequacy at work/school',
      high: 'Core conviction of being a failure'
    },
    'entitlement-grandiosity': {
      low: 'Occasionally expects special treatment',
      medium: 'Frequently feels superior to others',
      high: 'Strong sense of entitlement and disregard for social norms'
    },
    'insufficient-self-control': {
      low: 'Some difficulty with self-discipline',
      medium: 'Frequent struggles with impulse control',
      high: 'Severe inability to delay gratification or persist'
    },
    'subjugation': {
      low: 'Sometimes defers to others',
      medium: 'Frequently suppresses own needs for others',
      high: 'Pervasive pattern of subjugating self to avoid consequences'
    },
    'self-sacrifice': {
      low: 'Occasionally puts others first',
      medium: 'Frequently neglects own needs for others',
      high: 'Extreme self-sacrifice to the point of self-depletion'
    },
    'approval-seeking': {
      low: 'Somewhat concerned with others\' opinions',
      medium: 'Frequently makes decisions based on approval',
      high: 'Life centered around gaining approval and recognition'
    },
    'negativity-pessimism': {
      low: 'Sometimes expects negative outcomes',
      medium: 'Frequently focuses on worst-case scenarios',
      high: 'Pervasive pessimism and anticipation of disaster'
    },
    'emotional-inhibition': {
      low: 'Sometimes hesitant to express emotions',
      medium: 'Frequently suppresses emotional expression',
      high: 'Extreme emotional control and inhibition'
    },
    'unrelenting-standards': {
      low: 'Somewhat perfectionistic at times',
      medium: 'Frequently holds unrealistic standards',
      high: 'Relentless drive for perfection causing significant distress'
    },
    'punitiveness': {
      low: 'Occasionally harsh in judgments',
      medium: 'Frequently unforgiving of self and others',
      high: 'Extreme punitiveness and belief in harsh consequences'
    }
  };

  const level = score < 4.0 ? 'low' : score < 5.0 ? 'medium' : 'high';
  return descriptions[schema][level];
}

// ============================================================================
// Core Scoring Functions
// ============================================================================

/**
 * Score Core Schema Assessment (EMS)
 */
export function scoreCoreSchemaTest(responses: SchemaTestResponse[]): SchemaTestResult {
  const testItems = getSchemaTestItems('core-schema');
  const schemaItems = testItems.items as SchemaItem[];
  
  // Group responses by schema
  const schemaResponsesMap = new Map<SchemaName, ItemResponse[]>();
  
  responses.forEach(response => {
    const item = schemaItems.find(i => i.id === response.questionId);
    if (!item) return;
    
    if (!schemaResponsesMap.has(item.schema)) {
      schemaResponsesMap.set(item.schema, []);
    }
    
    schemaResponsesMap.get(item.schema)!.push({
      itemId: response.questionId,
      value: typeof response.response === 'number' ? response.response : 3
    });
  });
  
  // Calculate scores for each schema
  const identifiedSchemas: IdentifiedSchema[] = [];
  
  schemaResponsesMap.forEach((schemaResponses, schemaName) => {
    const meanScore = calculateMeanScore(schemaResponses);
    
    // Only include schemas that meet activation threshold
    if (meanScore >= SCHEMA_ACTIVATION_THRESHOLD) {
      const confidence = calculateConfidence(schemaResponses);
      const domain = SCHEMA_DOMAIN_MAP[schemaName];
      
      identifiedSchemas.push({
        name: schemaName,
        domain,
        confidence,
        description: getSchemaDescription(schemaName, meanScore),
        triggers: [], // Will be populated by trigger analysis if available
        emotionalResponses: [],
        behavioralPatterns: [],
        evidenceFromAnswers: schemaResponses.map(r => `Item ${r.itemId}: ${r.value}/6`)
      });
    }
  });
  
  // Sort by mean score (strongest schemas first)
  identifiedSchemas.sort((a, b) => {
    const scoreA = calculateMeanScore(schemaResponsesMap.get(a.name)!);
    const scoreB = calculateMeanScore(schemaResponsesMap.get(b.name)!);
    return scoreB - scoreA;
  });
  
  // Generate insights
  const keyInsights = generateSchemaInsights(identifiedSchemas, schemaResponsesMap);
  const narrative = generateSchemaNarrative(identifiedSchemas);
  
  return {
    testId: 'core-schema',
    status: 'completed',
    responses,
    responseCount: responses.length,
    completedAt: new Date().toISOString(),
    identifiedSchemas,
    keyInsights,
    narrative,
    confidence: identifiedSchemas.length > 0
      ? identifiedSchemas.reduce((sum, s) => sum + s.confidence, 0) / identifiedSchemas.length
      : 0,
    recommendedPractices: generateSchemaRecommendations(identifiedSchemas),
    recommendedMindTools: []
  };
}

/**
 * Score Mode Identification Assessment
 */
export function scoreModeIdentificationTest(responses: SchemaTestResponse[]): SchemaTestResult {
  const testItems = getSchemaTestItems('mode-identification');
  const modeItems = testItems.items as ModeItem[];
  
  // Group responses by mode
  const modeResponsesMap = new Map<SchemaMode, ItemResponse[]>();
  
  responses.forEach(response => {
    const item = modeItems.find(i => i.id === response.questionId);
    if (!item) return;
    
    if (!modeResponsesMap.has(item.mode)) {
      modeResponsesMap.set(item.mode, []);
    }
    
    modeResponsesMap.get(item.mode)!.push({
      itemId: response.questionId,
      value: typeof response.response === 'number' ? response.response : 3
    });
  });
  
  // Calculate scores for each mode
  const identifiedModes: IdentifiedMode[] = [];
  
  modeResponsesMap.forEach((modeResponses, modeName) => {
    const meanScore = calculateMeanScore(modeResponses);
    
    if (meanScore >= MODE_ACTIVATION_THRESHOLD) {
      const confidence = calculateConfidence(modeResponses);
      const category = MODE_CATEGORY_MAP[modeName];
      
      identifiedModes.push({
        mode: modeName,
        category,
        confidence,
        description: `This mode activates with mean intensity of ${meanScore.toFixed(1)}/6`,
        activationTriggers: [],
        typicalBehaviors: [],
        emotionalSignature: '',
        evidenceFromAnswers: modeResponses.map(r => `Item ${r.itemId}: ${r.value}/6`)
      });
    }
  });
  
  // Sort by mean score
  identifiedModes.sort((a, b) => {
    const scoreA = calculateMeanScore(modeResponsesMap.get(a.mode)!);
    const scoreB = calculateMeanScore(modeResponsesMap.get(b.mode)!);
    return scoreB - scoreA;
  });
  
  const keyInsights = generateModeInsights(identifiedModes);
  const narrative = generateModeNarrative(identifiedModes);
  
  return {
    testId: 'mode-identification',
    status: 'completed',
    responses,
    responseCount: responses.length,
    completedAt: new Date().toISOString(),
    identifiedModes,
    keyInsights,
    narrative,
    confidence: identifiedModes.length > 0
      ? identifiedModes.reduce((sum, m) => sum + m.confidence, 0) / identifiedModes.length
      : 0,
    recommendedPractices: [],
    recommendedMindTools: []
  };
}

/**
 * Score Coping Style Assessment
 */
export function scoreCopingStyleTest(responses: SchemaTestResponse[]): SchemaTestResult {
  const testItems = getSchemaTestItems('coping-style');
  const copingItems = testItems.items as CopingItem[];
  
  // Group responses by coping style
  const copingResponsesMap = new Map<CopingStyle, ItemResponse[]>();
  
  responses.forEach(response => {
    const item = copingItems.find(i => i.id === response.questionId);
    if (!item) return;
    
    if (!copingResponsesMap.has(item.copingStyle)) {
      copingResponsesMap.set(item.copingStyle, []);
    }
    
    copingResponsesMap.get(item.copingStyle)!.push({
      itemId: response.questionId,
      value: typeof response.response === 'number' ? response.response : 3
    });
  });
  
  // Calculate scores for each coping style
  const copingPatterns: IdentifiedCopingPattern[] = [];
  
  copingResponsesMap.forEach((copingResponses, copingStyle) => {
    const meanScore = calculateMeanScore(copingResponses);
    
    if (meanScore >= COPING_ACTIVATION_THRESHOLD) {
      const confidence = calculateConfidence(copingResponses);
      
      copingPatterns.push({
        copingStyle,
        confidence,
        description: `Used with mean frequency of ${meanScore.toFixed(1)}/6`,
        manifestations: [],
        schemasAssociated: [],
        examples: copingResponses.slice(0, 3).map(r => `Item ${r.itemId}: ${r.value}/6`)
      });
    }
  });
  
  // Sort by mean score
  copingPatterns.sort((a, b) => {
    const scoreA = calculateMeanScore(copingResponsesMap.get(a.copingStyle)!);
    const scoreB = calculateMeanScore(copingResponsesMap.get(b.copingStyle)!);
    return scoreB - scoreA;
  });
  
  const keyInsights = generateCopingInsights(copingPatterns);
  const narrative = generateCopingNarrative(copingPatterns);
  
  return {
    testId: 'coping-style',
    status: 'completed',
    responses,
    responseCount: responses.length,
    completedAt: new Date().toISOString(),
    copingPatterns,
    keyInsights,
    narrative,
    confidence: copingPatterns.length > 0
      ? copingPatterns.reduce((sum, c) => sum + c.confidence, 0) / copingPatterns.length
      : 0,
    recommendedPractices: [],
    recommendedMindTools: []
  };
}

/**
 * Score Trigger Pattern Assessment
 */
export function scoreTriggerPatternTest(responses: SchemaTestResponse[]): SchemaTestResult {
  const testItems = getSchemaTestItems('trigger-pattern');
  const triggerItems = testItems.items as TriggerItem[];
  
  // Analyze trigger responses
  const triggerPatterns: TriggerPattern[] = [];
  
  responses.forEach(response => {
    const item = triggerItems.find(i => i.id === response.questionId);
    if (!item) return;
    
    const value = typeof response.response === 'number' ? response.response : 3;
    
    // Only include significant triggers
    if (value >= TRIGGER_MEDIUM_THRESHOLD) {
      let intensity: 'low' | 'medium' | 'high' | 'extreme';
      if (value < TRIGGER_MEDIUM_THRESHOLD) intensity = 'low';
      else if (value < TRIGGER_HIGH_THRESHOLD) intensity = 'medium';
      else if (value < 5.5) intensity = 'high';
      else intensity = 'extreme';
      
      triggerPatterns.push({
        trigger: item.text,
        frequency: value >= 5 ? 'frequent' : value >= 4 ? 'occasional' : 'rare',
        intensity,
        typicalResponse: 'Strong emotional reaction',
        associatedSchemas: [],
        associatedModes: [],
        copingStrategiesUsed: []
      });
    }
  });
  
  // Sort by intensity/score
  triggerPatterns.sort((a, b) => {
    const intensityMap = { 'extreme': 4, 'high': 3, 'medium': 2, 'low': 1 };
    return intensityMap[b.intensity] - intensityMap[a.intensity];
  });
  
  const keyInsights = generateTriggerInsights(triggerPatterns);
  const narrative = generateTriggerNarrative(triggerPatterns);
  
  return {
    testId: 'trigger-pattern',
    status: 'completed',
    responses,
    responseCount: responses.length,
    completedAt: new Date().toISOString(),
    triggerPatterns,
    keyInsights,
    narrative,
    confidence: triggerPatterns.length > 0 ? 0.8 : 0.5,
    recommendedPractices: [],
    recommendedMindTools: []
  };
}

// ============================================================================
// Narrative Generation Helpers
// ============================================================================

function generateSchemaInsights(schemas: IdentifiedSchema[], responsesMap: Map<SchemaName, ItemResponse[]>): string[] {
  const insights: string[] = [];
  
  if (schemas.length === 0) {
    insights.push('No schemas met the activation threshold based on your responses.');
    return insights;
  }
  
  const topSchema = schemas[0];
  const topScore = calculateMeanScore(responsesMap.get(topSchema.name)!);
  insights.push(`Your strongest schema is ${topSchema.name} (score: ${topScore.toFixed(1)}/6) in the ${topSchema.domain} domain.`);
  
  if (schemas.length > 1) {
    insights.push(`You have ${schemas.length} active schemas, suggesting patterns across multiple life areas.`);
  }
  
  const domains = new Set(schemas.map(s => s.domain));
  if (domains.size === 1) {
    insights.push(`All your active schemas fall within the ${topSchema.domain} domain, indicating a focused developmental theme.`);
  }
  
  return insights;
}

function generateSchemaNarrative(schemas: IdentifiedSchema[]): string {
  if (schemas.length === 0) {
    return 'Based on your responses, no schemas met the activation threshold. This suggests relatively healthy core beliefs, though specific patterns may still warrant exploration in clinical work.';
  }
  
  const topSchemas = schemas.slice(0, 3);
  const names = topSchemas.map(s => s.name.replace(/-/g, ' ')).join(', ');
  
  return `Your responses indicate activation of ${schemas.length} Early Maladaptive Schema(s), with the strongest being ${names}. These schemas represent core emotional patterns that were likely formed in childhood and continue to influence how you perceive yourself, others, and the world. The presence of multiple schemas suggests interconnected patterns that may reinforce each other. Schema therapy work would focus on identifying the origins of these patterns, understanding their current impact, and developing healthier alternatives through limited reparenting and schema healing techniques.`;
}

function generateModeInsights(modes: IdentifiedMode[]): string[] {
  const insights: string[] = [];
  
  if (modes.length === 0) {
    return ['No modes met the activation threshold.'];
  }
  
  const childModes = modes.filter(m => m.category === 'child');
  const copingModes = modes.filter(m => m.category === 'coping');
  const parentModes = modes.filter(m => m.category === 'parent');
  
  if (childModes.length > 0) {
    insights.push(`You have ${childModes.length} active child mode(s), representing emotional states from your past.`);
  }
  
  if (copingModes.length > 0) {
    insights.push(`You use ${copingModes.length} maladaptive coping mode(s) to manage difficult emotions.`);
  }
  
  if (parentModes.length > 0) {
    insights.push(`You have ${parentModes.length} internalized parent mode(s) that criticize or demand.`);
  }
  
  return insights;
}

function generateModeNarrative(modes: IdentifiedMode[]): string {
  if (modes.length === 0) {
    return 'Your responses did not indicate strong activation of specific schema modes. This may suggest emotional balance or that the assessment didn\'t capture your primary emotional states.';
  }
  
  return `You experience ${modes.length} distinct schema modes. These represent different emotional states you shift between in response to triggers. Understanding your modes helps you recognize when you\'re in a maladaptive state and develop the healthy adult mode to meet your needs more effectively. Mode work in schema therapy focuses on limiting maladaptive modes while strengthening your healthy adult capacity.`;
}

function generateCopingInsights(patterns: IdentifiedCopingPattern[]): string[] {
  if (patterns.length === 0) {
    return ['No dominant coping patterns identified.'];
  }
  
  return patterns.map(p => 
    `${p.copingStyle.charAt(0).toUpperCase() + p.copingStyle.slice(1)} coping is a significant pattern in your responses.`
  );
}

function generateCopingNarrative(patterns: IdentifiedCopingPattern[]): string {
  if (patterns.length === 0) {
    return 'Your responses did not indicate strong reliance on any particular coping style.';
  }
  
  const styles = patterns.map(p => p.copingStyle).join(', ');
  return `Your primary coping styles are: ${styles}. These represent how you typically respond when your schemas are triggered. Each style has adaptive and maladaptive aspects. Schema therapy helps you develop more flexible coping strategies and strengthen your healthy adult mode.`;
}

function generateTriggerInsights(patterns: TriggerPattern[]): string[] {
  if (patterns.length === 0) {
    return ['No significant triggers identified.'];
  }
  
  const highIntensity = patterns.filter(p => p.intensity === 'high' || p.intensity === 'extreme');
  const insights: string[] = [];
  
  if (highIntensity.length > 0) {
    insights.push(`You have ${highIntensity.length} high-intensity triggers that warrant attention.`);
  }
  
  insights.push(`Total significant triggers identified: ${patterns.length}`);
  
  return insights;
}

function generateTriggerNarrative(patterns: TriggerPattern[]): string {
  if (patterns.length === 0) {
    return 'Your responses did not identify significant emotional triggers at this time.';
  }
  
  return `You identified ${patterns.length} situations that trigger strong emotional reactions. Understanding your triggers is key to schema therapy work, as it helps you recognize when schemas are being activated and gives you the opportunity to respond from your healthy adult mode instead of maladaptive patterns. Working with triggers involves both reducing their intensity through schema healing and developing better coping strategies.`;
}

function generateSchemaRecommendations(schemas: IdentifiedSchema[]): Array<{ practiceId: string; practiceName: string; rationale: string }> {
  if (schemas.length === 0) return [];
  
  return [
    {
      practiceId: 'meditation',
      practiceName: 'Mindfulness Meditation',
      rationale: 'Helps observe schema activation without automatically reacting'
    },
    {
      practiceId: 'journaling',
      practiceName: 'Schema Journaling',
      rationale: 'Track when schemas are triggered and explore patterns'
    }
  ];
}

// ============================================================================
// Test Progress Tracking
// ============================================================================

/**
 * Calculate progress for a test
 */
export function calculateTestProgress(testId: SchemaTestId, responses: SchemaTestResponse[]): TestProgress {
  const testItems = getSchemaTestItems(testId);
  const totalItems = testItems.items.length;
  const answeredItems = responses.length;
  const percentComplete = totalItems > 0 ? (answeredItems / totalItems) * 100 : 0;
  
  return {
    totalItems,
    answeredItems,
    percentComplete
  };
}

/**
 * Determine test status based on responses
 */
export function getTestStatus(testId: SchemaTestId, responses: SchemaTestResponse[]): 'not-started' | 'in-progress' | 'completed' {
  const progress = calculateTestProgress(testId, responses);
  
  if (progress.answeredItems === 0) {
    return 'not-started';
  } else if (progress.percentComplete >= 100) {
    return 'completed';
  } else {
    return 'in-progress';
  }
}

// ============================================================================
// Main Scoring Entry Point
// ============================================================================

/**
 * Score any schema test based on test ID
 * Returns immediate deterministic results
 */
export function scoreSchemaTest(testId: SchemaTestId, responses: SchemaTestResponse[]): SchemaTestResult {
  switch (testId) {
    case 'core-schema':
      return scoreCoreSchemaTest(responses);
    case 'mode-identification':
      return scoreModeIdentificationTest(responses);
    case 'coping-style':
      return scoreCopingStyleTest(responses);
    case 'trigger-pattern':
      return scoreTriggerPatternTest(responses);
    default:
      throw new Error(`Unknown test ID: ${testId}`);
  }
}
