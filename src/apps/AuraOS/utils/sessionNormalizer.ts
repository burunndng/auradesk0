/**
 * Session Normalizer Utility
 * 
 * Standardizes session field names across different wizard types to enable
 * cross-wizard analysis and consistent storage.
 */

import { BaseWizardSession } from '../types';

/**
 * Build a normalized session object from raw wizard data
 * @param wizardType The type of wizard (e.g., '3-2-1', 'IFS')
 * @param rawData The raw state/data from the wizard
 * @param fieldMappings Map of standardized fields to wizard-specific fields
 */
export function buildNormalizedSession<T = any>(
  wizardType: string,
  rawData: T,
  fieldMappings: Record<string, keyof T> = {}
): BaseWizardSession & T {
  const now = new Date().toISOString();
  
  const baseSession: BaseWizardSession = {
    id: (rawData as any).id || `${wizardType.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
    wizardType,
    date: (rawData as any).date || now,
    linkedInsightId: (rawData as any).linkedInsightId,
    aiSummary: (rawData as any).aiSummary
  };

  // Create standardized aliases for common fields if mappings provided
  const standardizedData: any = { ...rawData };
  
  Object.entries(fieldMappings).forEach(([standardField, wizardField]) => {
    if (rawData[wizardField] !== undefined) {
      standardizedData[standardField] = rawData[wizardField];
    }
  });

  return {
    ...baseSession,
    ...standardizedData
  };
}

/**
 * Standardize session for export
 */
export function prepareSessionForExport(session: BaseWizardSession): string {
  return JSON.stringify(session, null, 2);
}
