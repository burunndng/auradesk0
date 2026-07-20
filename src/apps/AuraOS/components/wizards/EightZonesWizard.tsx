import React, { useState, useEffect } from 'react';
import {
  EightZonesSession,
  EightZonesDraft,
  EightZonesStep,
  ZoneAnalysis,
  DialogueEntry,
  IntegratedInsight,
} from '../../types.ts';
import { X, ArrowLeft, ArrowRight, Zap, Lightbulb, MessageCircle, Loader } from 'lucide-react';
import { enhanceZoneAnalysis, generateSynthesis, submitSessionCompletion, generateConnectionDialogue } from '../../services/eightZonesService.ts';
import { EIGHT_ZONES } from '../../constants.ts';

interface EightZonesWizardProps {
  onClose: () => void;
  onSave: (session: EightZonesSession) => void;
  session: EightZonesDraft | null;
  setDraft: (session: EightZonesDraft | null) => void;
  userId: string;
  insightContext?: IntegratedInsight | null;
  markInsightAsAddressed: (insightId: string, wizardType: string, sessionId: string) => void;
}

const STEPS: EightZonesStep[] = [
  'ONBOARDING',
  'TOPIC_DEFINITION',
  'ZONE_1',
  'ZONE_2',
  'ZONE_3',
  'ZONE_4',
  'ZONE_5',
  'ZONE_6',
  'ZONE_7',
  'ZONE_8',
  'SYNTHESIS',
  'COMPLETE',
];

const createBaseSession = (): EightZonesSession => ({
  id: `eightones-${Date.now()}`,
  userId: '',
  date: new Date().toISOString(),
  currentStep: 'ONBOARDING',
  focalQuestion: '',
  zoneAnalyses: {},
});

const hydrateSession = (draft?: EightZonesDraft | null): EightZonesSession => {
  const base = createBaseSession();
  return {
    ...base,
    ...draft,
    id: draft?.id ?? base.id,
    date: draft?.date ?? base.date,
    currentStep: draft?.currentStep ?? base.currentStep,
    focalQuestion: draft?.focalQuestion ?? base.focalQuestion,
    zoneAnalyses: draft?.zoneAnalyses ?? base.zoneAnalyses,
  };
};

export default function EightZonesWizard({
  onClose,
  onSave,
  session: draft,
  setDraft,
  userId,
  insightContext,
  markInsightAsAddressed,
}: EightZonesWizardProps) {
  const [session, setSession] = useState<EightZonesSession>(() => hydrateSession(draft));

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkedInsightId, setLinkedInsightId] = useState<string | undefined>(draft?.linkedInsightId || insightContext?.id);

  // Input state for each zone
  const [topicInput, setTopicInput] = useState(draft?.focalQuestion || '');
  const [zoneInputs, setZoneInputs] = useState<Record<number, string>>(
    draft?.zoneAnalyses
      ? Object.entries(draft.zoneAnalyses).reduce(
          (acc, [zoneNum, analysis]) => ({
            ...acc,
            [zoneNum]: analysis.userInput,
          }),
          {}
        )
      : {}
  );

  const [showEnhancements, setShowEnhancements] = useState<Record<number, boolean>>({});
  const [synthesisData, setSynthesisData] = useState<any>(null);

  // Connection dialogue state
  const [isInConnectionDialogue, setIsInConnectionDialogue] = useState(false);
  const [activeConnectionZones, setActiveConnectionZones] = useState<[number, number] | null>(null);
  const [connectionDialogue, setConnectionDialogue] = useState<DialogueEntry[]>([]);
  const [isLoadingConnection, setIsLoadingConnection] = useState(false);
  const [connectionReflections, setConnectionReflections] = useState<Array<{ zones: string; dialogue: DialogueEntry[] }>>(
    draft?.connectionReflections || []
  );

  useEffect(() => {
    if (draft) setSession(hydrateSession(draft));
  }, [draft]);

  // Sync linkedInsightId with insightContext changes
  useEffect(() => {
    if (insightContext && linkedInsightId !== insightContext.id) {
      setLinkedInsightId(insightContext.id);
    }
  }, [insightContext]);

  const handleSaveDraftAndClose = () => {
    setDraft({
      ...session,
      focalQuestion: topicInput,
      linkedInsightId,
      zoneAnalyses: Object.entries(zoneInputs).reduce((acc, [zoneNum, input]) => {
        if (input.trim()) {
          acc[parseInt(zoneNum)] = {
            zoneNumber: parseInt(zoneNum),
            zoneFocus: EIGHT_ZONES[parseInt(zoneNum) - 1]?.focus || '',
            userInput: input,
          };
        }
        return acc;
      }, {} as Record<number, ZoneAnalysis>),
    });
    onClose();
  };

  const updateSession = (updates: Partial<EightZonesSession>) => {
    setSession((prev) => ({ ...prev, ...updates }));
  };

  const handleConnectionDialogueSubmit = async (userMessage: string) => {
    if (!activeConnectionZones) return;

    const [zoneA, zoneB] = activeConnectionZones;
    const updatedDialogue = [...connectionDialogue, { role: 'user' as const, text: userMessage }];
    setConnectionDialogue(updatedDialogue);

    setIsLoadingConnection(true);
    try {
      const aiResponse = await generateConnectionDialogue(
        session.focalQuestion,
        session.zoneAnalyses[zoneA],
        session.zoneAnalyses[zoneB],
        updatedDialogue
      );
      setConnectionDialogue(prev => [...prev, { role: 'bot', text: aiResponse }]);
    } catch (e) {
      console.error("Error generating connection dialogue:", e);
    } finally {
      setIsLoadingConnection(false);
    }
  };

  const handleContinueFromConnectionDialogue = () => {
    if (!activeConnectionZones) return;

    const [zoneA, zoneB] = activeConnectionZones;
    const zonesLabel = `Zones ${zoneA}-${zoneB}`;

    // Save the connection reflection
    setConnectionReflections(prev => [...prev, { zones: zonesLabel, dialogue: connectionDialogue }]);

    // Reset connection dialogue state
    setIsInConnectionDialogue(false);
    setActiveConnectionZones(null);
    setConnectionDialogue([]);
  };

  const canProceedToNext = () => {
    if (isLoading) return false;
    switch (session.currentStep) {
      case 'ONBOARDING':
        return true;
      case 'TOPIC_DEFINITION':
        return topicInput.trim().length > 30;
      case 'ZONE_1':
      case 'ZONE_2':
      case 'ZONE_3':
      case 'ZONE_4':
      case 'ZONE_5':
      case 'ZONE_6':
      case 'ZONE_7':
      case 'ZONE_8': {
        const zoneNum = parseInt(session.currentStep.split('_')[1]);
        return zoneInputs[zoneNum]?.trim().length > 20;
      }
      case 'SYNTHESIS':
        return !!synthesisData;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const currentIndex = STEPS.indexOf(session.currentStep);
      let nextStep = STEPS[currentIndex + 1] || session.currentStep;

      if (session.currentStep === 'ONBOARDING') {
        // Move from onboarding to topic definition
        updateSession({
          currentStep: nextStep,
        });
      } else if (session.currentStep === 'TOPIC_DEFINITION') {
        // Save focal question and move to Zone 1
        updateSession({
          focalQuestion: topicInput,
          currentStep: nextStep,
        });
      } else if (session.currentStep.startsWith('ZONE_')) {
        // Save zone analysis and optionally enhance it
        const zoneNum = parseInt(session.currentStep.split('_')[1]);
        const zone = EIGHT_ZONES[zoneNum - 1];

        const newZoneAnalyses = { ...session.zoneAnalyses };
        newZoneAnalyses[zoneNum] = {
          zoneNumber: zoneNum,
          zoneFocus: zone.focus,
          userInput: zoneInputs[zoneNum],
        };

        // Try to enhance the zone analysis with AI
        try {
          const enhancement = await enhanceZoneAnalysis(
            userId,
            zoneNum,
            zone.focus,
            zoneInputs[zoneNum],
            session.focalQuestion,
            Object.values(newZoneAnalyses).slice(0, -1)
          );
          newZoneAnalyses[zoneNum].aiEnhancement = enhancement;
        } catch (enhanceError) {
          console.warn('[8Zones] Could not enhance zone:', enhanceError);
          // Continue anyway - enhancement is optional
        }

        updateSession({
          zoneAnalyses: newZoneAnalyses,
        });

        // Trigger connection dialogue after zones 2, 4, 6, and 8
        if ([2, 4, 6, 8].includes(zoneNum)) {
          const prevZone = zoneNum - 1;
          setActiveConnectionZones([prevZone, zoneNum]);
          setIsInConnectionDialogue(true);

          // Generate initial AI question to start the dialogue
          setIsLoadingConnection(true);
          try {
            const initialQuestion = await generateConnectionDialogue(
              session.focalQuestion,
              newZoneAnalyses[prevZone],
              newZoneAnalyses[zoneNum],
              []
            );
            setConnectionDialogue([{ role: 'bot', text: initialQuestion }]);
          } catch (e) {
            console.error("Error generating initial connection question:", e);
          } finally {
            setIsLoadingConnection(false);
          }
        } else {
          // No connection dialogue, proceed to next zone
          updateSession({
            currentStep: nextStep,
          });
        }
      } else if (session.currentStep === 'SYNTHESIS') {
        // Generate synthesis from all zones (but don't auto-advance to COMPLETE)
        if (!synthesisData) {
          const synthesis = await generateSynthesis(userId, session.focalQuestion, session.zoneAnalyses, connectionReflections);
          setSynthesisData(synthesis);
          updateSession({
            blindSpots: synthesis.blindSpots,
            novelInsights: synthesis.novelInsights,
            recommendations: synthesis.recommendations,
            synthesisReport: synthesis.synthesisReport,
            zoneConnections: synthesis.connections,
            connectionReflections: connectionReflections,
          });
        } else {
          // User has read the synthesis, now move to COMPLETE
          updateSession({
            currentStep: 'COMPLETE',
          });
        }
      }
    } catch (err) {
      console.error('[8Zones] Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    const currentIndex = STEPS.indexOf(session.currentStep);
    if (currentIndex > 0) {
      updateSession({ currentStep: STEPS[currentIndex - 1] });
    }
  };

  const handleComplete = () => {
    const finalSession: EightZonesSession = {
      ...session,
      linkedInsightId,
      completedAt: new Date().toISOString(),
    };
    onSave(finalSession);
    setDraft(null);

    // Mark Intelligence Hub insight as addressed
    if (linkedInsightId) {
      markInsightAsAddressed(linkedInsightId, 'Eight Zones', finalSession.id);
    }

    onClose(); // Explicitly close the wizard
  };

  const renderConnectionDialogue = () => {
    if (!activeConnectionZones) return null;
    const [zoneA, zoneB] = activeConnectionZones;

    return (
      <div className="space-y-6">
        <div className="bg-teal-900/20 border border-teal-700/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold font-mono text-slate-100 flex items-center gap-2 mb-3">
            <MessageCircle className="text-teal-400" size={20} />
            Discovering Connections: Zones {zoneA} & {zoneB}
          </h3>
          <p className="text-slate-300 text-sm">
            You've completed two zones. Let's explore how they relate to each other.
            This dialogue helps you see the connections between different perspectives on your focal question.
          </p>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto bg-neutral-900/20 rounded-lg p-4">
          {connectionDialogue.map((entry, idx) => (
            <div key={idx} className={`flex gap-3 ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-md rounded-lg p-3 ${
                entry.role === 'user'
                  ? 'bg-teal-900/50 border border-teal-700 text-teal-100'
                  : 'bg-teal-900/50 border border-teal-700 text-teal-100'
              }`}>
                <p className="text-xs font-semibold mb-1">{entry.role === 'user' ? 'You' : 'Facilitator'}</p>
                <p className="text-sm">{entry.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-neutral-800/30 border border-neutral-700 rounded-lg p-3">
          <input
            type="text"
            placeholder="Share your thoughts on how these zones connect..."
            onKeyPress={(e) => {
              if (e.key === 'Enter' && (e.target as HTMLInputElement).value && !isLoadingConnection) {
                const text = (e.target as HTMLInputElement).value;
                handleConnectionDialogueSubmit(text);
                (e.target as HTMLInputElement).value = '';
              }
            }}
            disabled={isLoadingConnection}
            className="w-full bg-neutral-900/50 border-neutral-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50"
          />
          {isLoadingConnection && (
            <p className="text-xs text-teal-400 mt-2 flex items-center gap-2">
              <Loader size={12} className="animate-spin" /> Listening...
            </p>
          )}
          {!isLoadingConnection && <p className="text-xs text-slate-500 mt-2">Press Enter to share your reflection</p>}
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => {
              handleContinueFromConnectionDialogue();
              const currentIndex = STEPS.indexOf(session.currentStep);
              const nextStep = STEPS[currentIndex + 1];
              updateSession({ currentStep: nextStep });
            }}
            disabled={connectionDialogue.length < 2}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Next Zone →
          </button>
        </div>
      </div>
    );
  };

  const renderStep = () => {
    // If we're in a connection dialogue phase, show that UI instead
    if (isInConnectionDialogue) {
      return renderConnectionDialogue();
    }

    switch (session.currentStep) {
      case 'ONBOARDING':
        return (
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-xl sm:text-2xl font-bold font-mono text-slate-100">
              8 Zones of Knowing: Integral Analysis
            </h3>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              The 8 Zones of Knowing framework (Ken Wilber's Integral Theory) provides a comprehensive
              map for understanding any complex topic through eight distinct but interconnected perspectives.
            </p>
            <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-slate-300">
              <li className="flex items-start gap-2 sm:gap-3">
                <span className="text-teal-400 font-bold">1.</span>
                <span>Define your focal question or issue</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <span className="text-teal-400 font-bold">2.</span>
                <span>Explore all 8 zones systematically</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <span className="text-teal-400 font-bold">3.</span>
                <span>Receive AI-enhanced insights for each zone</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <span className="text-teal-400 font-bold">4.</span>
                <span>Synthesize an integrated, holistic understanding</span>
              </li>
            </ul>
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 sm:p-4 mt-4 sm:mt-6">
              <p className="text-emerald-200 text-xs sm:text-sm font-medium">
                💡 This process avoids "flatland" thinking—single-perspective analysis that misses critical
                dimensions of complex issues.
              </p>
            </div>
          </div>
        );

      case 'TOPIC_DEFINITION':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold font-mono text-slate-100">Define Your Focal Question</h3>
            <p className="text-slate-300">
              What topic, challenge, or system do you want to understand more fully? Be specific and clear.
            </p>
            <textarea
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              rows={6}
              placeholder="Example: 'What is the full impact and nature of remote work on organizational culture and individual wellbeing?'"
              className="w-full bg-neutral-900/50 border border-neutral-700 rounded-lg p-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            <div className="text-sm text-slate-400">
              Minimum 30 characters • {topicInput.length}/30
            </div>
          </div>
        );

      case 'ZONE_1':
      case 'ZONE_2':
      case 'ZONE_3':
      case 'ZONE_4':
      case 'ZONE_5':
      case 'ZONE_6':
      case 'ZONE_7':
      case 'ZONE_8': {
        const zoneNum = parseInt(session.currentStep.split('_')[1]);
        const zone = EIGHT_ZONES[zoneNum - 1];
        const currentAnalysis = session.zoneAnalyses[zoneNum];

        return (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold px-2 py-1 rounded bg-teal-500/20 text-teal-300">
                  {zone.quadrant} {zone.perspective.toUpperCase()}
                </span>
                <span className="text-sm text-slate-400">Zone {zoneNum} of 8</span>
              </div>
              <h3 className="text-2xl font-bold font-mono text-slate-100">{zone.focus}</h3>
            </div>

            <div className="bg-neutral-800/30 border border-neutral-700 rounded-lg p-4 space-y-3">
              <div className="text-sm">
                <p className="font-semibold text-slate-300 mb-2">Key Question:</p>
                <p className="text-slate-400 italic">"{zone.keyQuestion}"</p>
              </div>
              <div className="text-sm">
                <p className="font-semibold text-slate-300 mb-2">Zone Description:</p>
                <p className="text-slate-400">{zone.description}</p>
              </div>
              <div className="text-sm">
                <p className="font-semibold text-slate-300 mb-2">Methodologies:</p>
                <p className="text-slate-400">{zone.methodologies.join(', ')}</p>
              </div>
            </div>

            <div>
              <label className="block mb-2">
                <span className="text-slate-300 font-medium">Your Analysis:</span>
              </label>
              <textarea
                value={zoneInputs[zoneNum] || ''}
                onChange={(e) => setZoneInputs({ ...zoneInputs, [zoneNum]: e.target.value })}
                rows={8}
                placeholder={`Analyze ${zone.focus} for: "${session.focalQuestion}"\n\nThink about: ${zone.keyQuestion}`}
                className="w-full bg-neutral-900/50 border border-neutral-700 rounded-lg p-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <div className="text-sm text-slate-400 mt-2">
                Minimum 20 characters • {(zoneInputs[zoneNum] || '').length}/20
              </div>
            </div>

            {currentAnalysis?.aiEnhancement && (
              <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-300">
                  <Lightbulb size={18} />
                  <span className="font-semibold">AI Enhancement</span>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{currentAnalysis.aiEnhancement}</p>
              </div>
            )}

            {!showEnhancements[zoneNum] && (zoneInputs[zoneNum]?.length || 0) > 20 && (
              <button
                onClick={() => setShowEnhancements({ ...showEnhancements, [zoneNum]: true })}
                className="w-full px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-slate-200 transition flex items-center justify-center gap-2"
              >
                <Zap size={16} />
                Show AI Enhancement (Optional)
              </button>
            )}
          </div>
        );
      }

      case 'SYNTHESIS':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold font-mono text-slate-100">Integral Synthesis</h3>
            {!synthesisData && !isLoading && (
              <p className="text-slate-300">
                Generate a comprehensive, integrated analysis that shows how all 8 zones interconnect...
              </p>
            )}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-12 h-12 border-4 border-teal-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-slate-400">Synthesizing your analysis across all zones...</p>
              </div>
            ) : synthesisData ? (
              <div className="space-y-6">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                  <p className="text-emerald-200 text-sm">
                    ✓ Your integral synthesis has been generated. Review the insights below before continuing.
                  </p>
                </div>

                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 space-y-2">
                  <p className="font-semibold text-purple-300 mb-2">Blind Spots (Missing Perspectives):</p>
                  <ul className="space-y-1">
                    {synthesisData.blindSpots.map((spot: string, idx: number) => (
                      <li key={idx} className="text-slate-300 text-sm flex items-start gap-2">
                        <span className="text-purple-400 mt-1">•</span>
                        <span>{spot}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4 space-y-2">
                  <p className="font-semibold text-emerald-300 mb-2">Novel Insights (New Understandings):</p>
                  <ul className="space-y-1">
                    {synthesisData.novelInsights.map((insight: string, idx: number) => (
                      <li key={idx} className="text-slate-300 text-sm flex items-start gap-2">
                        <span className="text-emerald-400 mt-1">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-teal-900/20 border border-teal-500/30 rounded-lg p-4 space-y-2">
                  <p className="font-semibold text-teal-300 mb-2">Recommendations (Next Steps):</p>
                  <ul className="space-y-1">
                    {synthesisData.recommendations.map((rec: string, idx: number) => (
                      <li key={idx} className="text-slate-300 text-sm flex items-start gap-2">
                        <span className="text-teal-400 mt-1">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-4">
                  <p className="font-semibold text-slate-200 mb-3">Integrated Analysis:</p>
                  <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{synthesisData.synthesisReport}</p>
                </div>
              </div>
            ) : (
              <button
                onClick={handleNext}
                className="btn-luminous px-6 py-3 rounded-lg font-semibold"
              >
                Generate Synthesis
              </button>
            )}
          </div>
        );

      case 'COMPLETE':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold font-mono text-slate-100">Analysis Complete</h3>
              <p className="text-slate-300 mt-2">Your 8-zone integral analysis has been generated and saved.</p>
            </div>

            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-teal-500/30 rounded-xl p-6 space-y-4">
              <div>
                <div className="text-sm text-slate-400 mb-1">Focal Question</div>
                <div className="text-lg font-medium text-slate-100">{session.focalQuestion}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-400 mb-1">Zones Analyzed</div>
                  <div className="text-2xl font-bold text-teal-300">8</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-1">Insights Generated</div>
                  <div className="text-2xl font-bold text-emerald-300">
                    {(session.novelInsights?.length || 0) +
                      (session.blindSpots?.length || 0) +
                      (session.recommendations?.length || 0)}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleComplete}
              className="btn-luminous px-6 py-3 rounded-lg font-semibold w-full"
            >
              Save & Close
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  const currentStepIndex = STEPS.indexOf(session.currentStep);
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/80 animate-fade-in flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 rounded-none sm:rounded-xl w-full max-w-4xl border border-neutral-700 shadow-2xl my-2 sm:my-8">
        <div className="p-3 sm:p-6 border-b border-neutral-700 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-2xl font-bold text-slate-100">8 Zones of Knowing</h2>
            <div className="text-xs sm:text-sm text-slate-400 mt-1">
              Step {currentStepIndex + 1} of {STEPS.length}: {session.currentStep.replace(/_/g, ' ')}
            </div>
          </div>
          <button onClick={handleSaveDraftAndClose} className="text-slate-400 hover:text-slate-200 transition flex-shrink-0">
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="h-1 bg-neutral-800">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-3 sm:p-8 max-h-[calc(100dvh-16rem)] overflow-y-auto">
          {error && (
            <div className="mb-4 sm:mb-6 bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 sm:p-4">
              <div className="text-purple-200 font-medium mb-2 text-sm sm:text-base">Error</div>
              <div className="text-purple-300 text-xs sm:text-sm">{error}</div>
              <button
                onClick={() => setError(null)}
                className="mt-3 px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-900/30 hover:bg-purple-900/50 rounded text-purple-200 text-xs sm:text-sm transition"
              >
                Retry
              </button>
            </div>
          )}

          {insightContext && (
            <div className="mb-4 sm:mb-6 bg-teal-900/20 border border-teal-700/50 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-teal-200">
                <strong>Working with pattern:</strong> "{insightContext.detectedPattern}"
              </p>
            </div>
          )}

          {renderStep()}
        </div>

        <div className="p-3 sm:p-6 border-t border-neutral-700 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-neutral-900/50">
          <button
            onClick={handleBack}
            disabled={currentStepIndex === 0 || session.currentStep === 'COMPLETE'}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-slate-200 transition disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
            Back
          </button>

          {session.currentStep !== 'COMPLETE' && (
            <button
              onClick={handleNext}
              disabled={!canProceedToNext()}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 btn-luminous rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Processing...
                </>
              ) : (
                <>
                  Next
                  <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px]" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
