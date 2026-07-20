// NOT_IMPLEMENTED — all exports are stubs (console.warn + return null).
// Do not call these from production code paths until implemented.

/**
 * RAG Service - Wizard session insight generation and sync
 * Placeholder for future implementation
 */

export async function generateSessionInsights(userId: string, data: any, wizardType?: string): Promise<any> {
  console.warn('[RAG] generateSessionInsights not implemented');
  return null;
}

export async function generateBiasDetectiveInsights(userId: string, data: any, context?: any): Promise<any> {
  console.warn('[RAG] generateBiasDetectiveInsights not implemented');
  return null;
}

export async function generateIFSInsights(userId: string, data: any, context?: any): Promise<any> {
  console.warn('[RAG] generateIFSInsights not implemented');
  return null;
}

export async function syncUserSession(userId: string, data: any, wizardType?: string): Promise<void> {
  console.warn('[RAG] syncUserSession not implemented');
}

export async function generateInsights(userId: string, data: any, wizardType?: string): Promise<any> {
  console.warn('[RAG] generateInsights not implemented');
  return null;
}

export async function searchDocuments(query: string, limit?: number): Promise<any[]> {
  console.warn('[RAG] searchDocuments not implemented');
  return [];
}

export async function hasDocuments(): Promise<boolean> {
  return false;
}
