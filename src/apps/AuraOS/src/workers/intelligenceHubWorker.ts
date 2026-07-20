/**
 * Intelligence Hub Web Worker
 * Handles expensive synchronous analysis off the main thread
 * Receives: InteligenceContext → Returns: analysis results (recurring themes, connections, contradictions)
 *
 * This worker processes all O(n²) analysis operations so they don't block the UI
 */

import type { IntegratedInsight } from '../../types';
import { analyzeTrajectoriesForRisk, predictDevelopmentalStage, forecastNextChallenge, recommendProactiveAction } from '../../services/predictiveGuidanceEngine';
import { detectCrossModalPatterns } from '../../services/crossModalAnalyzer.pure';

type WorkerMessage =
  | { id: string; type: 'analyze'; payload: { integratedInsights: IntegratedInsight[] } }
  | { id: string; type: 'analyzeTrajectoriesForRisk'; payload: { insights: IntegratedInsight[]; sessions: any[] } }
  | { id: string; type: 'predictDevelopmentalStage'; payload: { sessions: any[]; insights: IntegratedInsight[] } }
  | { id: string; type: 'forecastNextChallenge'; payload: { patterns: any[]; recentInsights: IntegratedInsight[] } }
  | { id: string; type: 'recommendProactiveAction'; payload: { forecast: any } }
  | { id: string; type: 'detectCrossModalPatterns'; payload: { sessions: any[] } };

interface AnalysisResult {
  id: string;
  recurringThemes: string[];
  crossPracticeConnections: string[];
  contradictions: string[];
}

/**
 * Analyze recurring themes across insights
 * Clusters insights by detectedPattern similarity and identifies patterns that appear 2+ times
 */
function analyzeRecurringThemes(insights: IntegratedInsight[]): string[] {
  if (insights.length === 0) return [];

  const themes: string[] = [];
  const patternGroups = new Map<string, any[]>();

  // Fast pass: Group by detectedPattern
  for (const insight of insights) {
    const pattern = insight.detectedPattern.toLowerCase().trim();
    if (!patternGroups.has(pattern)) {
      patternGroups.set(pattern, []);
    }
    patternGroups.get(pattern)!.push(insight);
  }

  // Identify recurring patterns (2+ insights)
  for (const [pattern, group] of Array.from(patternGroups.entries())) {
    if (group.length >= 2) {
      const wizardTypesSet = new Set(group.map(i => i.mindToolType));
      const wizardTypes = Array.from(wizardTypesSet);
      const confidence = wizardTypes.length >= 3 ? 'High' : wizardTypes.length >= 2 ? 'Moderate' : 'Low';

      const evidence = group.map(i => `${i.mindToolType} (${i.mindToolShortSummary})`).join('; ');

      themes.push(
        `Recurring theme across ${group.length} insights: ${pattern}. ` +
        `Evidence: ${evidence}. ` +
        `Pattern based on ${group.length} insights from ${wizardTypes.length} wizard types. Confidence: ${confidence}.`
      );
    }
  }

  return themes;
}

/**
 * Analyze cross-practice connections
 * Identifies when patterns overlap across different wizard types and finds developmental links
 */
function analyzeCrossPracticeConnections(insights: IntegratedInsight[]): string[] {
  if (insights.length < 2) return [];

  const connections: string[] = [];
  const wizardTypeGroups = new Map<string, any[]>();

  // Group by wizard type
  for (const insight of insights) {
    if (!wizardTypeGroups.has(insight.mindToolType)) {
      wizardTypeGroups.set(insight.mindToolType, []);
    }
    wizardTypeGroups.get(insight.mindToolType)!.push(insight);
  }

  // Only analyze if we have multiple wizard types
  if (wizardTypeGroups.size < 2) return [];

  // Deep pass: Look for thematic overlaps by analyzing full report text
  const allInsights = Array.from(wizardTypeGroups.values()).flat();

  for (let i = 0; i < allInsights.length; i++) {
    for (let j = i + 1; j < allInsights.length; j++) {
      const insightA = allInsights[i];
      const insightB = allInsights[j];

      // Skip if same wizard type
      if (insightA.mindToolType === insightB.mindToolType) continue;

      // Look for keyword overlap in patterns and reports
      const keywordsA = extractKeywords(insightA.detectedPattern + ' ' + insightA.mindToolReport);
      const keywordsB = extractKeywords(insightB.detectedPattern + ' ' + insightB.mindToolReport);

      const overlap = keywordsA.filter(k => keywordsB.includes(k));

      if (overlap.length >= 2) {
        const wizardTypes = [insightA.mindToolType, insightB.mindToolType];
        connections.push(
          `Connection detected: Your ${insightA.mindToolType} work relates to ${insightB.mindToolType} - ` +
          `both involve ${overlap.slice(0, 3).join(', ')}. ` +
          `Cross-validated across ${wizardTypes.join(' and ')}. Suggests deeper structure.`
        );
      }
    }
  }

  return connections;
}

/**
 * Extract meaningful keywords from text for pattern matching
 */
function extractKeywords(text: string): string[] {
  const stopwords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'that', 'this', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'they', 'them', 'their', 'what', 'which', 'who', 'whom', 'my', 'your', 'his', 'her', 'its', 'our', 'their']);

  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopwords.has(w));

  // Count frequency and return most common
  const freq = new Map<string, number>();
  for (const word of words) {
    freq.set(word, (freq.get(word) || 0) + 1);
  }

  return Array.from(freq.entries())
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

/**
 * Analyze contradictions and tensions
 * Identifies opposing patterns held simultaneously
 */
function analyzeContradictions(insights: IntegratedInsight[]): string[] {
  if (insights.length < 2) return [];

  const tensions: string[] = [];

  // Define opposing pattern keywords
  const opposingPairs = [
    { a: ['control', 'controlling', 'dominate', 'power'], b: ['surrender', 'let go', 'release', 'accept'] },
    { a: ['withdraw', 'isolate', 'alone', 'distance'], b: ['connect', 'engage', 'close', 'intimate'] },
    { a: ['perfect', 'perfection', 'flawless'], b: ['accept', 'imperfect', 'flaw', 'mistake'] },
    { a: ['rational', 'logic', 'think', 'mind'], b: ['emotional', 'feel', 'heart', 'emotion'] },
    { a: ['independent', 'self-reliant', 'autonomous'], b: ['dependent', 'need', 'support', 'help'] },
    { a: ['active', 'doing', 'action', 'achieve'], b: ['passive', 'being', 'rest', 'receive'] },
    { a: ['express', 'speak', 'voice', 'assert'], b: ['suppress', 'silence', 'hide', 'withhold'] },
  ];

  for (let i = 0; i < insights.length; i++) {
    for (let j = i + 1; j < insights.length; j++) {
      const insightA = insights[i];
      const insightB = insights[j];

      const textA = (insightA.detectedPattern + ' ' + insightA.mindToolShortSummary).toLowerCase();
      const textB = (insightB.detectedPattern + ' ' + insightB.mindToolShortSummary).toLowerCase();

      for (const pair of opposingPairs) {
        const hasA = pair.a.some(keyword => textA.includes(keyword));
        const hasB = pair.b.some(keyword => textB.includes(keyword));

        if (hasA && hasB) {
          tensions.push(
            `Tension mapped: You both ${insightA.detectedPattern} (${insightA.mindToolType}) and ` +
            `${insightB.detectedPattern} (${insightB.mindToolType}). ` +
            `Context: These appear in different wizard contexts. ` +
            `Polarity detected - not contradiction, but different contexts. Sophisticated holding.`
          );
          break;
        }
      }
    }
  }

  return tensions;
}

// Worker message handler
self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { id, type, payload } = event.data;

  if (type === 'analyze') {
    try {
      // Cap at 50 most recent insights to avoid O(n²) blowup in analyzeCrossPracticeConnections
      const insights = (payload as { integratedInsights: IntegratedInsight[] }).integratedInsights.slice(0, 50);
      const recurringThemes = analyzeRecurringThemes(insights);
      const crossPracticeConnections = analyzeCrossPracticeConnections(insights);
      const contradictions = analyzeContradictions(insights);

      const result: AnalysisResult = {
        id,
        recurringThemes,
        crossPracticeConnections,
        contradictions,
      };

      self.postMessage(result);
    } catch (error) {
      self.postMessage({
        id,
        error: error instanceof Error ? error.message : 'Unknown error in worker',
      });
    }
  } else if (type === 'analyzeTrajectoriesForRisk') {
    try {
      const p = payload as { insights: IntegratedInsight[]; sessions: any[] };
      const result = analyzeTrajectoriesForRisk(p.insights, p.sessions);
      self.postMessage({ id, result });
    } catch (error) {
      self.postMessage({ id, error: error instanceof Error ? error.message : 'Unknown error in worker' });
    }
  } else if (type === 'predictDevelopmentalStage') {
    try {
      const p = payload as { sessions: any[]; insights: IntegratedInsight[] };
      const result = predictDevelopmentalStage(p.sessions, p.insights);
      self.postMessage({ id, result });
    } catch (error) {
      self.postMessage({ id, error: error instanceof Error ? error.message : 'Unknown error in worker' });
    }
  } else if (type === 'forecastNextChallenge') {
    try {
      const p = payload as { patterns: any[]; recentInsights: IntegratedInsight[] };
      const result = forecastNextChallenge(p.patterns, p.recentInsights);
      self.postMessage({ id, result });
    } catch (error) {
      self.postMessage({ id, error: error instanceof Error ? error.message : 'Unknown error in worker' });
    }
  } else if (type === 'recommendProactiveAction') {
    try {
      const p = payload as { forecast: any };
      const result = recommendProactiveAction(p.forecast);
      self.postMessage({ id, result });
    } catch (error) {
      self.postMessage({ id, error: error instanceof Error ? error.message : 'Unknown error in worker' });
    }
  } else if (type === 'detectCrossModalPatterns') {
    try {
      const p = payload as { sessions: any[] };
      const result = detectCrossModalPatterns(p.sessions);
      self.postMessage({ id, result });
    } catch (error) {
      self.postMessage({ id, error: error instanceof Error ? error.message : 'Unknown error in worker' });
    }
  }
};
