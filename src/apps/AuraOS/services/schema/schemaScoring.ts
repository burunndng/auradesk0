/**
 * Schema Therapy Scoring Functions
 *
 * Extracted scoring logic for Early Maladaptive Schemas (EMS) and Schema Modes
 */

import type {
  SchemaName,
  SchemaDomain,
  SchemaMode
} from '../../types';

// ============================================================================
// Scoring Types
// ============================================================================

/**
 * Individual schema score with severity classification
 */
export interface SchemaScore {
  schema: SchemaName;
  domain: SchemaDomain;
  rawScore: number; // Sum of 5 items (5-30 range)
  severity: 'None' | 'Low' | 'Medium' | 'High' | 'Very High';
  isActive: boolean; // true if rawScore >= 15
  percentile: number; // Relative to theoretical max
  interpretation: string;
}

/**
 * Domain-level aggregation of schemas
 */
export interface DomainAnalysis {
  domain: SchemaDomain;
  activeSchemas: SchemaName[];
  domainScore: number; // Average of schema scores in this domain
  severity: 'None' | 'Low' | 'Medium' | 'High' | 'Very High';
  interpretation: string;
  coreThemes: string[];
}

/**
 * Individual mode score with activation level
 */
export interface ModeScore {
  mode: SchemaMode;
  category: 'child' | 'coping' | 'parent' | 'healthy';
  rawScore: number; // Sum of items per mode (variable item count)
  activationLevel: 'Low' | 'Moderate' | 'High' | 'Dominant';
  percentile: number;
  interpretation: string;
  typicalTriggers: string[];
  typicalBehaviors: string[];
}

/**
 * Complete mode profile with category analysis
 */
export interface ModeProfile {
  scores: ModeScore[];
  dominantMode: SchemaMode | null;
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
}

// ============================================================================
// Scoring Functions (extracted from schemaTherapyService.ts)
// ============================================================================

/**
 * Placeholder for generateSchemaInterpretation
 * This needs to be imported from the parent service
 */
declare function generateSchemaInterpretation(
  schema: SchemaName,
  severity: 'None' | 'Low' | 'Medium' | 'High' | 'Very High',
  rawScore: number
): string;

/**
 * Placeholder for calculateModeScore
 * This needs to be imported from the parent service
 */
declare function calculateModeScore(
  mode: SchemaMode,
  category: 'child' | 'coping' | 'parent' | 'healthy',
  responses: number[]
): ModeScore;

/**
 * Placeholder for EMS_QUESTIONS constant
 * This needs to be imported from the parent service
 */
declare const EMS_QUESTIONS: Record<string, Record<string, Array<{ id: string }>>>;

/**
 * Placeholder for MODE_QUESTIONS constant
 * This needs to be imported from the parent service
 */
declare const MODE_QUESTIONS: Record<string, Record<string, Array<{ id: string }>>>;

function calculateSchemaScore(
  schema: SchemaName,
  domain: SchemaDomain,
  responses: number[]
): SchemaScore {
  if (responses.length !== 5) {
    throw new Error(`Schema scoring requires exactly 5 responses, got ${responses.length}`);
  }

  const rawScore = responses.reduce((sum, val) => sum + val, 0);
  const percentile = ((rawScore - 5) / (30 - 5)) * 100; // (score - min) / (max - min)

  let severity: 'None' | 'Low' | 'Medium' | 'High' | 'Very High';
  if (rawScore < 10) severity = 'None';
  else if (rawScore < 15) severity = 'Low';
  else if (rawScore < 20) severity = 'Medium';
  else if (rawScore < 25) severity = 'High';
  else severity = 'Very High';

  const isActive = rawScore >= 15;

  const interpretation = generateSchemaInterpretation(schema, severity, rawScore);

  return {
    schema,
    domain,
    rawScore,
    severity,
    isActive,
    percentile: Math.round(percentile),
    interpretation
  };
}

export function scoreEMSTest(responses: Record<string, number>): SchemaScore[] {
  const scores: SchemaScore[] = [];

  Object.entries(EMS_QUESTIONS).forEach(([domain, schemas]) => {
    Object.entries(schemas).forEach(([schema, questions]) => {
      const schemaResponses = questions.map(q => responses[q.id] || 1);
      const score = calculateSchemaScore(
        schema as SchemaName,
        domain as SchemaDomain,
        schemaResponses
      );
      scores.push(score);
    });
  });

  return scores;
}

export function scoreModeTest(responses: Record<string, number>): ModeScore[] {
  const scores: ModeScore[] = [];

  Object.entries(MODE_QUESTIONS).forEach(([category, modes]) => {
    Object.entries(modes).forEach(([mode, questions]) => {
      const modeResponses = questions.map(q => responses[q.id] || 1);
      const score = calculateModeScore(
        mode as SchemaMode,
        category as 'child' | 'coping' | 'parent' | 'healthy',
        modeResponses
      );
      scores.push(score);
    });
  });

  return scores;
}
