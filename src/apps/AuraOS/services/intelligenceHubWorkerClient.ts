/**
 * Intelligence Hub Worker Client
 * Provides a clean interface for communicating with the Web Worker
 * Handles message passing, promise-based API, and error handling
 */

import type { IntegratedInsight } from '../types';
// @ts-ignore - Vite handled worker import
import IntelligenceWorker from '../src/workers/intelligenceHubWorker.ts?worker';

interface AnalysisRequest {
  integratedInsights: IntegratedInsight[];
}

interface AnalysisResult {
  id: string;
  recurringThemes: string[];
  crossPracticeConnections: string[];
  contradictions: string[];
}

interface AnalysisError {
  id: string;
  error: string;
}

type AnalysisResponse = AnalysisResult | AnalysisError;

// null means worker failed to load, undefined means not initialized yet
let worker: Worker | null | undefined = undefined;
const pendingRequests = new Map<string, (result: AnalysisResponse) => void>();

/**
 * Initialize the worker
 */
function initializeWorker(): Worker | null {
  if (worker === null) return null; // Worker failed to load previously, use sync fallback
  if (worker instanceof Worker) return worker; // Worker already initialized

  try {
    // Standard Vite worker initialization
    worker = new IntelligenceWorker();

    worker.onmessage = (event: MessageEvent<AnalysisResponse>) => {
      const { id } = event.data;
      const resolve = pendingRequests.get(id);
      if (resolve) {
        resolve(event.data);
        pendingRequests.delete(id);
      }
    };

    worker.onerror = (error: ErrorEvent) => {
      console.error('[IntelligenceHubWorker] Worker error:', error);
      worker = null; // Mark worker as failed
      // Clear all pending requests on worker error
      for (const [id, resolve] of pendingRequests.entries()) {
        resolve({
          id,
          error: `Worker error: ${error.message}`,
        });
        pendingRequests.delete(id);
      }
    };

    console.log('[IntelligenceHubWorker] Worker initialized');
    return worker;
  } catch (error) {
    console.warn('[IntelligenceHubWorker] Failed to initialize worker (will use sync fallback):', error);
    worker = null; // Mark as failed, will use sync
    return null;
  }
}

/**
 * Perform analysis in the worker
 * Returns a promise that resolves when analysis is complete
 */
export async function analyzeInsights(
  integratedInsights: IntegratedInsight[]
): Promise<{
  recurringThemes: string[];
  crossPracticeConnections: string[];
  contradictions: string[];
}> {
  const workerInstance = initializeWorker();

  // If worker failed to initialize, return empty results (sync fallback will be used)
  if (!workerInstance) {
    return {
      recurringThemes: [],
      crossPracticeConnections: [],
      contradictions: [],
    };
  }

  // Generate unique request ID
  const id = `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  return new Promise((resolve, reject) => {
    // Set a timeout to prevent hanging requests
    const timeout = setTimeout(() => {
      pendingRequests.delete(id);
      reject(new Error('Analysis request timed out after 30 seconds'));
    }, 30000);

    pendingRequests.set(id, (response: AnalysisResponse) => {
      clearTimeout(timeout);

      if ('error' in response) {
        reject(new Error(response.error));
      } else {
        resolve({
          recurringThemes: response.recurringThemes,
          crossPracticeConnections: response.crossPracticeConnections,
          contradictions: response.contradictions,
        });
      }
    });

    // Send message to worker
    try {
      workerInstance.postMessage({
        id,
        type: 'analyze',
        payload: { integratedInsights },
      });
    } catch (error) {
      clearTimeout(timeout);
      pendingRequests.delete(id);
      reject(error);
    }
  });
}

/**
 * Helper: send a typed message to the worker and await its response.
 * Returns null if the worker is unavailable.
 */
async function dispatchToWorker<T>(type: string, payload: unknown): Promise<T | null> {
  const workerInstance = initializeWorker();
  if (!workerInstance) return null;

  const id = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(() => {
      pendingRequests.delete(id);
      reject(new Error(`Worker request "${type}" timed out after 30 seconds`));
    }, 30000);

    pendingRequests.set(id, (response: any) => {
      clearTimeout(timeout);
      if ('error' in response) {
        reject(new Error(response.error));
      } else {
        resolve(response.result as T);
      }
    });

    try {
      workerInstance.postMessage({ id, type, payload });
    } catch (error) {
      clearTimeout(timeout);
      pendingRequests.delete(id);
      reject(error);
    }
  });
}

export async function analyzeTrajectoriesInWorker(
  insights: IntegratedInsight[],
  sessions: any[],
): Promise<any[] | null> {
  return dispatchToWorker('analyzeTrajectoriesForRisk', { insights, sessions });
}

export async function predictDevelopmentalStageInWorker(
  sessions: any[],
  insights: IntegratedInsight[],
): Promise<any | null> {
  return dispatchToWorker('predictDevelopmentalStage', { sessions, insights });
}

export async function forecastNextChallengeInWorker(
  patterns: any[],
  recentInsights: IntegratedInsight[],
): Promise<any | null> {
  return dispatchToWorker('forecastNextChallenge', { patterns, recentInsights });
}

export async function recommendProactiveActionInWorker(
  forecast: any,
): Promise<any | null> {
  return dispatchToWorker('recommendProactiveAction', { forecast });
}

export async function detectCrossModalPatternsInWorker(
  sessions: any[],
): Promise<any[] | null> {
  return dispatchToWorker('detectCrossModalPatterns', { sessions });
}

/**
 * Terminate the worker (useful for cleanup)
 */
export function terminateWorker(): void {
  if (worker instanceof Worker) {
    worker.terminate();
    worker = undefined;
    pendingRequests.clear();
    console.log('[IntelligenceHubWorker] Worker terminated');
  }
}

/**
 * Get worker status (for debugging)
 */
export function getWorkerStatus(): {
  initialized: boolean;
  failed: boolean;
  pendingRequests: number;
} {
  return {
    initialized: worker instanceof Worker,
    failed: worker === null,
    pendingRequests: pendingRequests.size,
  };
}
