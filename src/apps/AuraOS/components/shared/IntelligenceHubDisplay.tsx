import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, Target, BookOpen, Zap } from 'lucide-react';
import type { IntelligentGuidance, AllPractice, IntegratedInsight, CrossModalPattern, PredictiveAlert } from '../../types';
import { detectCrossModalPatterns, detectCrossModalPatternsWithAI, findComplementaryPractices } from '../../services/crossModalAnalyzer';
import { AiSystemStatus } from './AiSystemStatus';

interface IntelligenceHubDisplayProps {
  guidance: IntelligentGuidance;
  onLaunchWizard: (wizardType: string) => void;
  onAddPractice: (practice: AllPractice) => void;
  isLoading?: boolean;
  integratedInsights?: IntegratedInsight[];
  allPractices?: AllPractice[];
}

/**
 * Convert AI-generated pattern text into structured CrossModalPattern objects
 * AI returns narrative text like "Shame is showing up across your practice..."
 * This extracts key themes and creates pattern objects
 */
function convertAITextToPatterns(aiText: string, sessions: any[]): CrossModalPattern[] {
  const patterns: CrossModalPattern[] = [];

  // Extract potential shadow theme from AI text (first significant word)
  const shadowThemeMatch = aiText.match(/\b(shame|fear|anger|grief|rejection|control)\b/i);
  const shadowTheme = shadowThemeMatch ? shadowThemeMatch[1].toLowerCase() : undefined;

  if (!shadowTheme) {
    // If no specific theme detected, create a generic pattern from AI text
    const pattern: CrossModalPattern = {
      id: `ai-pattern-${Date.now()}`,
      shadowTheme: 'multi-dimensional',
      strength: 0.6,
      relatedInsights: [],
      relatedSessions: sessions
        .slice(0, 3)
        .map((s) => ({
          sessionId: s.id,
          sessionType: 'AI-detected',
          modality: 'shadow' as const,
          date: s.date,
        })),
      firstDetected: new Date().toISOString(),
      lastObserved: new Date().toISOString(),
    };
    patterns.push(pattern);
    return patterns;
  }

  // Create pattern from detected theme
  const pattern: CrossModalPattern = {
    id: `ai-pattern-${Date.now()}-${shadowTheme}`,
    shadowTheme,
    strength: 0.75, // AI-detected patterns have higher confidence
    relatedInsights: [],
    relatedSessions: sessions
      .slice(0, 5)
      .map((s) => ({
        sessionId: s.id,
        sessionType: 'AI-detected',
        modality: 'shadow' as const,
        date: s.date,
      })),
    firstDetected: new Date().toISOString(),
    lastObserved: new Date().toISOString(),
  };

  patterns.push(pattern);
  return patterns;
}

export function IntelligenceHubDisplay({
  guidance,
  onLaunchWizard,
  onAddPractice,
  isLoading = false,
  integratedInsights = [],
  allPractices = [],
}: IntelligenceHubDisplayProps) {
  const [crossModalPatterns, setCrossModalPatterns] = useState<CrossModalPattern[]>([]);
  const [isLoadingPatterns, setIsLoadingPatterns] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mb-4"></div>
        <p className="text-slate-400">Synthesizing your developmental data...</p>
      </div>
    );
  }

  const { synthesis, primaryFocus, recommendations, reasoning, cautions } = guidance;
  const predictiveAlerts = recommendations.predictiveAlerts ?? [];
  const showPredictiveAlerts = Array.isArray(recommendations.predictiveAlerts);

  // Detect cross-modal patterns using async AI analysis
  useEffect(() => {
    async function loadPatterns() {
      if (integratedInsights.length === 0) {
        setCrossModalPatterns([]);
        return;
      }

      setIsLoadingPatterns(true);
      try {
        // Create mock sessions from insights for pattern detection
        const sessions = integratedInsights.map((insight) => ({
          id: insight.id,
          date: insight.dateCreated,
          ...insight,
        })) as any[];

        // Try AI-based detection first
        const aiPatternText = await detectCrossModalPatternsWithAI({
          body: sessions.filter((s) => 'script' in s || 'practiceType' in s).map((s) => (s as any).notes || '').join(' '),
          mind: sessions.filter((s) => 'bias' in s || 'implicitBeliefs' in s).map((s) => (s as any).notes || '').join(' '),
          spirit: sessions.filter((s) => 'jhanaLevel' in s || 'factors' in s).map((s) => (s as any).notes || '').join(' '),
          shadow: sessions.filter((s) => 'trigger' in s || 'partName' in s).map((s) => (s as any).notes || '').join(' '),
          crossModalPatterns: '',
        });

        // Use AI result if available, otherwise fall back to keyword-based detection
        if (aiPatternText && aiPatternText.trim().length > 0) {
          // Convert AI text into CrossModalPattern objects
          const aiPatterns = convertAITextToPatterns(aiPatternText, sessions);
          setCrossModalPatterns(aiPatterns);
        } else {
          // Fall back to keyword-based detection if AI returns empty
          const fallbackPatterns = detectCrossModalPatterns(sessions);
          setCrossModalPatterns(fallbackPatterns);
        }
      } catch (error) {
        console.error('[IntelligenceHubDisplay] AI pattern detection failed, using fallback:', error);
        // Fallback to keyword-based detection
        try {
          const sessions = integratedInsights.map((insight) => ({
            id: insight.id,
            date: insight.dateCreated,
            ...insight,
          })) as any[];
          const fallbackPatterns = detectCrossModalPatterns(sessions);
          setCrossModalPatterns(fallbackPatterns);
        } catch (fallbackError) {
          console.error('[IntelligenceHubDisplay] Fallback pattern detection also failed:', fallbackError);
          setCrossModalPatterns([]);
        }
      } finally {
        setIsLoadingPatterns(false);
      }
    }

    loadPatterns();
  }, [integratedInsights]);

  return (
    <div className="space-y-6">
      {/* AI System Status */}
      <div className="flex justify-between items-start">
        <AiSystemStatus compact={true} />
      </div>

      {/* Where You Are Section */}
      <section className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Target className="text-amber-400" size={24} />
          <h2 className="text-2xl font-bold text-slate-100">Where You Are</h2>
        </div>
        <div className="prose prose-invert prose-slate max-w-none">
          <ReactMarkdown>{synthesis}</ReactMarkdown>
        </div>
      </section>

      {/* Primary Focus Section */}
      <section className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-amber-700/50 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Lightbulb className="text-amber-400" size={24} />
          <h2 className="text-2xl font-bold text-slate-100">Primary Focus</h2>
        </div>
        <div className="prose prose-invert prose-slate max-w-none">
          <ReactMarkdown>{primaryFocus}</ReactMarkdown>
        </div>
      </section>

      {/* Cross-Modal Patterns Section */}
      {crossModalPatterns.length > 0 && (
        <CrossModalPatternsCard
          patterns={crossModalPatterns}
          allPractices={allPractices}
          onAddPractice={onAddPractice}
        />
      )}

      {/* Next Wizard Recommendation */}
      {recommendations.nextWizard && (
        <WizardRecommendationCard
          wizard={recommendations.nextWizard}
          onLaunch={onLaunchWizard}
        />
      )}

      {/* Practice Recommendations */}
      {recommendations.practiceChanges?.add && recommendations.practiceChanges.add.length > 0 && (
        <PracticeRecommendationsCard
          practices={recommendations.practiceChanges.add}
          onAdd={onAddPractice}
        />
      )}

      {/* Stack Balance Visualization */}
      {recommendations.stackBalance && (
        <StackBalanceCard balance={recommendations.stackBalance} />
      )}

      {/* How It All Connects */}
      <section className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="text-green-400" size={24} />
          <h2 className="text-2xl font-bold text-slate-100">How It All Connects</h2>
        </div>

        {reasoning.whatINoticed.length > 0 && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-2">What I Noticed:</h3>
            <ul className="space-y-2">
              {reasoning.whatINoticed.map((item, idx) => (
                <li key={idx} className="text-slate-300 flex items-start gap-2">
                  <span className="text-amber-400 mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {reasoning.howItConnects.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-amber-300 mb-2">Connections:</h3>
            <ul className="space-y-2">
              {reasoning.howItConnects.map((item, idx) => (
                <li key={idx} className="text-slate-300 flex items-start gap-2">
                  <span className="text-amber-400 mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Cautions */}
      {cautions.length > 0 && (
        <section className="bg-amber-900/20 border border-amber-600/50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="text-amber-400" size={24} />
            <h2 className="text-2xl font-bold text-amber-100">Cautions</h2>
          </div>
          <div className="space-y-4">
            {cautions.map((caution, idx) => (
              <div key={idx} className="text-amber-200 text-sm leading-relaxed">
                <ReactMarkdown>{caution}</ReactMarkdown>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function PredictiveAlertsSection({ alerts }: { alerts: PredictiveAlert[] }) {
  const confidenceLabel = (value?: number) => {
    if (typeof value !== 'number') return 'Unknown';
    if (value >= 0.8) return 'High';
    if (value >= 0.6) return 'Medium';
    return 'Low';
  };

  const confidenceStyles = (value?: number) => {
    if (typeof value !== 'number') return 'border-slate-600 text-slate-300';
    if (value >= 0.8) return 'border-green-400/70 text-green-300';
    if (value >= 0.6) return 'border-amber-400/70 text-amber-200';
    return 'border-orange-400/70 text-orange-200';
  };

  const formatModality = (modality?: PredictiveAlert['recommendedModality']) => {
    if (!modality) return 'Multi-Modal';
    return modality
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  const formatPhase = (phase?: string) => {
    if (!phase) return '';
    return phase
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <section className="bg-gradient-to-br from-rose-900/30 via-amber-900/20 to-slate-900/20 border border-rose-500/40 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="text-rose-300" size={24} />
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Predictive Alerts</h2>
          <p className="text-sm text-slate-400">Signals the Intelligence Hub is monitoring over the next few weeks.</p>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="text-sm text-slate-400 bg-slate-900/50 border border-slate-800 rounded-lg p-4">
          All clear for now. Keep doing what&apos;s working and check back after your next few sessions.
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => {
            const practices = alert.recommendation?.practices?.slice(0, 2) || [];
            const phase = formatPhase(alert.developmentalPhase);

            return (
              <div
                key={alert.id}
                className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 shadow-inner"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-rose-200/70">{alert.timeframe}</p>
                    <h3 className="text-xl font-semibold text-slate-100">{alert.title}</h3>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${confidenceStyles(alert.confidence)}`}>
                    {confidenceLabel(alert.confidence)} confidence
                  </span>
                </div>

                <p className="text-sm text-slate-300 mb-4">{alert.description}</p>

                <div className="flex flex-wrap gap-2 mb-4 text-xs text-slate-300">
                  <span className="px-3 py-1 rounded-full bg-slate-800/70 border border-slate-700">
                    Modality: {formatModality(alert.recommendedModality)}
                  </span>
                  {phase && (
                    <span className="px-3 py-1 rounded-full bg-slate-800/70 border border-slate-700">
                      Phase: {phase}
                    </span>
                  )}
                  {alert.recommendation?.timing && (
                    <span className="px-3 py-1 rounded-full bg-slate-800/70 border border-slate-700">
                      Timing: {alert.recommendation.timing}
                    </span>
                  )}
                </div>

                {practices.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold uppercase text-slate-400 mb-2">Recommended Practices</p>
                    <div className="flex flex-wrap gap-2">
                      {practices.map((practice) => (
                        <span
                          key={`${alert.id}-${practice.practiceId}`}
                          className="text-xs px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-200"
                        >
                          {practice.practiceName}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {alert.triggerIndicators?.length > 0 && (
                  <div className="flex flex-wrap gap-2 text-[11px] text-slate-400">
                    {alert.triggerIndicators.slice(0, 3).map((indicator, idx) => (
                      <span
                        key={`${alert.id}-indicator-${idx}`}
                        className="px-2 py-0.5 rounded-full bg-slate-800/60 border border-slate-700"
                      >
                        {indicator}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

// Wizard Recommendation Card Component
function WizardRecommendationCard({
  wizard,
  onLaunch,
}: {
  wizard: any;
  onLaunch: (type: string) => void;
}) {
  const confidenceColor =
    wizard.confidence >= 0.8
      ? 'text-green-400'
      : wizard.confidence >= 0.6
        ? 'text-yellow-400'
        : 'text-orange-400';

  const priorityBadgeColor =
    wizard.priority === 'high'
      ? 'bg-red-500/20 text-red-300 border-red-500/50'
      : wizard.priority === 'medium'
        ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
        : 'bg-amber-500/20 text-amber-300 border-amber-500/50';

  return (
    <section className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border-2 border-amber-500/50 rounded-lg p-6 hover:border-amber-400 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Sparkles className="text-amber-400" size={24} />
          <h2 className="text-2xl font-bold text-slate-100">Recommended Wizard</h2>
        </div>
        <div className="flex items-center gap-2">
          {wizard.confidence && (
            <div className="text-xs font-mono px-2 py-1 rounded bg-slate-800 border border-slate-600">
              <span className="text-slate-400">Confidence: </span>
              <span className={confidenceColor}>{Math.round(wizard.confidence * 100)}%</span>
            </div>
          )}
          <span className={`text-xs font-semibold px-2 py-1 rounded border ${priorityBadgeColor}`}>
            {wizard.priority.toUpperCase()}
          </span>
        </div>
      </div>

      <h3 className="text-xl font-semibold text-amber-100 mb-3">{wizard.name}</h3>

      <div className="space-y-3 mb-4">
        <div>
          <p className="text-sm text-slate-400 mb-1">Why this wizard:</p>
          <p className="text-slate-200">{wizard.reason}</p>
        </div>

        <div>
          <p className="text-sm text-slate-400 mb-1">What to focus on:</p>
          <p className="text-amber-200 italic">"{wizard.focus}"</p>
        </div>

        {wizard.timing && (
          <div>
            <p className="text-sm text-slate-400 mb-1">Timing:</p>
            <p className="text-slate-200">{wizard.timing}</p>
          </div>
        )}

        {wizard.evidence && wizard.evidence.length > 0 && (
          <div>
            <p className="text-sm text-slate-400 mb-1">Based on:</p>
            <div className="flex flex-wrap gap-2">
              {wizard.evidence.map((ev: string, idx: number) => (
                <span key={idx} className="text-xs px-2 py-1 bg-slate-800 text-slate-300 rounded font-mono">
                  {ev}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => onLaunch(wizard.type)}
        className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <BookOpen size={18} />
        Start {wizard.name}
      </button>
    </section>
  );
}

// Practice Recommendations Card Component
function PracticeRecommendationsCard({
  practices,
  onAdd,
}: {
  practices: any[];
  onAdd: (practice: AllPractice) => void;
}) {
  return (
    <section className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <Target className="text-green-400" size={24} />
        <h2 className="text-2xl font-bold text-slate-100">Suggested Practices</h2>
      </div>

      <div className="space-y-3">
        {practices.map((rec, idx) => (
          <div
            key={idx}
            className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 hover:border-green-500/50 transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-slate-100">{rec.practice.name}</h3>
              <span
                className={`text-xs font-semibold px-2 py-1 rounded ${rec.priority === 'high'
                    ? 'bg-red-500/20 text-red-300'
                    : rec.priority === 'medium'
                      ? 'bg-yellow-500/20 text-yellow-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
              >
                {rec.priority}
              </span>
            </div>

            <p className="text-sm text-slate-400 mb-3">{rec.reason}</p>

            {rec.integration && (
              <p className="text-xs text-amber-300 mb-3 italic">💡 {rec.integration}</p>
            )}

            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-500 space-y-1">
                {rec.timeCommitment && <p>⏱️ {rec.timeCommitment}</p>}
                {rec.startTiming && <p>📅 {rec.startTiming}</p>}
              </div>

              <button
                onClick={() => onAdd(rec.practice)}
                className="bg-green-600 hover:bg-green-500 text-white text-sm font-semibold py-2 px-4 rounded transition-colors"
              >
                Add to Stack
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// Stack Balance Visualization Component
function StackBalanceCard({ balance }: { balance: any }) {
  const modules = [
    { key: 'body', label: 'Body', color: 'bg-red-500', textColor: 'text-red-300' },
    { key: 'mind', label: 'Mind', color: 'bg-amber-500', textColor: 'text-amber-300' },
    { key: 'spirit', label: 'Spirit', color: 'bg-purple-500', textColor: 'text-purple-300' },
    { key: 'shadow', label: 'Shadow', color: 'bg-slate-600', textColor: 'text-slate-300' },
  ];

  return (
    <section className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
      <h2 className="text-xl font-bold text-slate-100 mb-4">Stack Balance</h2>

      <div className="space-y-3">
        {modules.map((module) => {
          const percentage = parseInt(balance[module.key]) || 0;

          return (
            <div key={module.key}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-medium ${module.textColor}`}>{module.label}</span>
                <span className="text-xs text-slate-400">{balance[module.key]}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2.5">
                <div
                  className={`${module.color} h-2.5 rounded-full transition-all duration-500`}
                  style={{ width: balance[module.key] }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// Cross-Modal Patterns Card Component
function CrossModalPatternsCard({
  patterns,
  allPractices,
  onAddPractice,
}: {
  patterns: CrossModalPattern[];
  allPractices: AllPractice[];
  onAddPractice: (practice: AllPractice) => void;
}) {
  const modalityConfig = {
    shadow: { label: 'Shadow', color: 'bg-slate-700', textColor: 'text-slate-300' },
    body: { label: 'Body', color: 'bg-red-600', textColor: 'text-red-200' },
    mind: { label: 'Mind', color: 'bg-amber-600', textColor: 'text-amber-200' },
    spirit: { label: 'Spirit', color: 'bg-purple-600', textColor: 'text-purple-200' },
  };

  return (
    <section className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border border-emerald-500/50 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <Zap className="text-emerald-400" size={24} />
        <h2 className="text-2xl font-bold text-slate-100">Cross-Modal Patterns</h2>
      </div>

      <p className="text-slate-300 text-sm mb-4">
        Multi-dimensional patterns showing how shadow themes surface across your practice:
      </p>

      <div className="space-y-4">
        {patterns.map((pattern) => {
          const practices = findComplementaryPractices(pattern);
          const modalitiesInvolved: Array<'shadow' | 'body' | 'mind' | 'spirit'> = [];
          if (pattern.shadowTheme) modalitiesInvolved.push('shadow');
          if (pattern.somaticPattern) modalitiesInvolved.push('body');
          if (pattern.mindPattern) modalitiesInvolved.push('mind');
          if (pattern.spiritPattern) modalitiesInvolved.push('spirit');

          return (
            <div
              key={pattern.id}
              className="bg-slate-800/60 border border-emerald-500/30 rounded-lg p-4 hover:border-emerald-400/50 transition-all"
            >
              {/* Pattern Header */}
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-slate-100">
                  {pattern.shadowTheme ? `${pattern.shadowTheme.charAt(0).toUpperCase() + pattern.shadowTheme.slice(1)}` : 'Multi-Dimensional Pattern'}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-2 py-1 rounded bg-emerald-500/20 text-emerald-300">
                    {Math.round(pattern.strength * 100)}% strength
                  </span>
                </div>
              </div>

              {/* Pattern Description */}
              <p className="text-sm text-slate-300 mb-3">
                {pattern.shadowTheme && `Shadow: ${pattern.shadowTheme}`}
                {pattern.somaticPattern && ` • Body: ${pattern.somaticPattern}`}
                {pattern.mindPattern && ` • Mind: ${pattern.mindPattern}`}
                {pattern.spiritPattern && ` • Spirit: ${pattern.spiritPattern}`}
              </p>

              {/* Modalities Involved */}
              <div className="flex flex-wrap gap-2 mb-4">
                {modalitiesInvolved.map((modality) => {
                  const config = modalityConfig[modality];
                  return (
                    <span
                      key={modality}
                      className={`text-xs font-medium px-2 py-1 rounded ${config.color} ${config.textColor}`}
                    >
                      {config.label}
                    </span>
                  );
                })}
              </div>

              {/* Recommended Practices */}
              {(practices.shadow.length > 0 || practices.nextSteps.length > 0) && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-400 font-semibold">Complementary Practices:</p>
                  <div className="space-y-1">
                    {practices.shadow.map((rec, idx) => {
                      const practice = allPractices.find((p) => p.id === rec.practiceId);
                      return practice ? (
                        <button
                          key={`shadow-${idx}`}
                          onClick={() => onAddPractice(practice)}
                          className="w-full text-left text-xs p-2 bg-slate-700/40 hover:bg-slate-700/60 rounded border border-slate-600/50 hover:border-emerald-500/50 transition group"
                        >
                          <span className="font-medium text-slate-200 group-hover:text-emerald-300">
                            {rec.practiceName}
                          </span>
                          <span className="text-slate-400"> - {rec.rationale}</span>
                        </button>
                      ) : null;
                    })}
                    {practices.nextSteps.map((rec, idx) => {
                      const practice = allPractices.find((p) => p.id === rec.practiceId);
                      return practice ? (
                        <button
                          key={`next-${idx}`}
                          onClick={() => onAddPractice(practice)}
                          className="w-full text-left text-xs p-2 bg-slate-700/40 hover:bg-slate-700/60 rounded border border-slate-600/50 hover:border-emerald-500/50 transition group"
                        >
                          <span className="font-medium text-slate-200 group-hover:text-emerald-300">
                            {rec.practiceName}
                          </span>
                          <span className="text-slate-400"> - {rec.rationale}</span>
                        </button>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
