/**
 * Schema Detective Wizard (Refactored to Alchemical Void)
 *
 * Multi-phase wizard for Schema Therapy assessments using structured Likert scale items.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StorageManager } from '../../.claude/lib/storageManager';
import { WizardFrame } from '../shared/WizardFrame';
import type {
  SchemaTestId, SchemaTestResponse, SchemaTestResult,
  SchemaSession, SchemaTestProgress, SchemaUnifiedProfile, IntegratedInsight
} from '../../types';
import {
  SCHEMA_TESTS, EMSA_90_ITEMS, analyzeSchemaTestResponses, synthesizeSchemaProfile
} from '../../services/schemaTherapyService';
import { generateInsightFromSession } from '../../services/insightGenerator';
import { practices } from '../../constants';
import { useInsightsContext } from '../../contexts/InsightsContext';
import {
  getSchemaTestItems, getTotalItemCount, SchemaTestItems
} from '../../data/schemaItems';
import {
  scoreSchemaTest, scoreCoreSchemaTest, calculateTestProgress, getTestStatus
} from '../../services/schemaScoring';
import { TestResultsChat } from '../shared/TestResultsChat';
import TransformativeArcIcon from '../visualizations/SacredGeometryIcons/TransformativeArcIcon';
import IdentityPrismIcon from '../visualizations/SacredGeometryIcons/IdentityPrismIcon';
import PatternMandalaIcon from '../visualizations/SacredGeometryIcons/PatternMandalaIcon';
import DyadBridgeIcon from '../visualizations/SacredGeometryIcons/DyadBridgeIcon';

interface SchemaDetectiveWizardProps {
  onClose: () => void;
  onSave: (session: SchemaSession) => void;
  session?: SchemaSession | null;
  setDraft?: (session: SchemaSession | null) => void;
  userId?: string;
  insightContext?: IntegratedInsight | null;
  markInsightAsAddressed?: (insightId: string, wizardType: string, sessionId: string) => void;
}

type WizardPhase = 'welcome' | 'test-selection' | 'test-questions' | 'analyzing' | 'test-results' | 'unified-profile' | 'synthesis' | 'complete' | 'test-menu';

const TEST_ICONS: Record<SchemaTestId, React.ReactNode> = {
  'core-schema': <PatternMandalaIcon className="w-5 h-5 sm:w-6 sm:h-6" />,
  'mode-identification': <IdentityPrismIcon className="w-5 h-5 sm:w-6 sm:h-6" />,
  'coping-style': <DyadBridgeIcon className="w-5 h-5 sm:w-6 sm:h-6" />,
  'trigger-pattern': <TransformativeArcIcon className="w-5 h-5 sm:w-6 sm:h-6" />,
  'ems': <PatternMandalaIcon className="w-5 h-5 sm:w-6 sm:h-6" />,
  'schema-modes': <IdentityPrismIcon className="w-5 h-5 sm:w-6 sm:h-6" />
};

const TEST_COLORS: Record<SchemaTestId, string> = {
  'core-schema': 'from-amber-900/40 to-amber-800/10 border-amber-500/30 text-amber-400',
  'mode-identification': 'from-violet-900/40 to-purple-800/10 border-violet-500/30 text-violet-400',
  'coping-style': 'from-rose-900/40 to-red-800/10 border-rose-500/30 text-rose-400',
  'trigger-pattern': 'from-emerald-900/40 to-teal-800/10 border-emerald-500/30 text-emerald-400',
  'ems': 'from-amber-900/40 to-amber-800/10 border-amber-500/30 text-amber-400',
  'schema-modes': 'from-violet-900/40 to-purple-800/10 border-violet-500/30 text-violet-400'
};

const LIKERT_OPTIONS = [
  { value: 1, label: 'Completely untrue', shortLabel: '1' },
  { value: 2, label: 'Mostly untrue', shortLabel: '2' },
  { value: 3, label: 'Slightly true', shortLabel: '3' },
  { value: 4, label: 'Moderately true', shortLabel: '4' },
  { value: 5, label: 'Mostly true', shortLabel: '5' },
  { value: 6, label: 'Perfectly describes me', shortLabel: '6' }
];

const STORAGE_PREFIX = 'aura-schema-responses-';

// ─── Micro Components ─────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">{children}</div>;
}

export default function SchemaDetectiveWizard({
  onClose,
  onSave,
  session: existingSession,
  setDraft,
  userId,
  insightContext,
  markInsightAsAddressed
}: SchemaDetectiveWizardProps) {
  // Session state
  const [sessionId] = useState(() => existingSession?.sessionId || `schema-${Date.now()}`);
  const [phase, setPhase] = useState<WizardPhase>('welcome');
  const [completedTests, setCompletedTests] = useState<SchemaTestId[]>(existingSession?.completedTests || []);
  const [testResults, setTestResults] = useState<Record<SchemaTestId, SchemaTestResult>>(existingSession?.testResults || {} as Record<SchemaTestId, SchemaTestResult>);
  const [unifiedProfile, setUnifiedProfile] = useState<SchemaUnifiedProfile | undefined>(existingSession?.unifiedProfile);
  const [linkedInsightId, setLinkedInsightId] = useState<string | undefined>(existingSession?.linkedInsightId || insightContext?.id);

  // Current test state
  const [activeTest, setActiveTest] = useState<SchemaTestId | null>(null);
  const [testResponses, setTestResponses] = useState<Record<SchemaTestId, SchemaTestResponse[]>>({
    'core-schema': [], 'mode-identification': [], 'coping-style': [],
    'trigger-pattern': [], 'ems': [], 'schema-modes': []
  });
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0);
  const [currentTestItems, setCurrentTestItems] = useState<SchemaTestItems | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [answers, setAnswers] = useState<SchemaTestResponse[]>([]);
  const [userNarrative, setUserNarrative] = useState('');

  // UI state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showInterimModal, setShowInterimModal] = useState(false);
  const [interimResult, setInterimResult] = useState<SchemaTestResult | null>(null);
  const [lastInterimIndex, setLastInterimIndex] = useState(0);
  const [testMode, setTestMode] = useState<'core' | 'full'>('full');
  
  // Fake progress state to fit WizardFrame
  const [currentStepIndex, setCurrentStepIndex] = useState(1);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSavesRef = useRef<Partial<Record<SchemaTestId, SchemaTestResponse[]>>>({});
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [phase, currentBatchIndex]);

  const InterimInsightModal = ({ result, onClose }: { result: SchemaTestResult, onClose: () => void }) => {
    if (!result.identifiedSchemas || result.identifiedSchemas.length === 0) {
      return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-stone-950/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-stone-900 border border-stone-800/60 rounded-2xl shadow-2xl max-w-md w-full p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-900/20 border border-amber-600/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-serif text-amber-500">✦</span>
            </div>
            <h3 className="text-xl font-serif text-stone-100 mb-2">Progress Check</h3>
            <p className="text-stone-400 text-sm mb-6 leading-relaxed">You've completed this section. No strong schemas detected yet, which is a healthy sign. Let's keep exploring.</p>
            <button onClick={onClose} className="w-full py-3 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold rounded-xl transition-all">
              Continue Assessment
            </button>
          </div>
        </div>
      );
    }

    const topSchema = result.identifiedSchemas[0];

    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-stone-950/80 backdrop-blur-md p-4 animate-fade-in">
        <div className="bg-stone-900 border border-stone-800/60 rounded-2xl shadow-2xl shadow-amber-900/10 max-w-lg w-full p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-violet-900/20 border border-violet-600/30 rounded-xl">
              <TransformativeArcIcon className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <h3 className="text-xl font-serif text-stone-100">Interim Insight</h3>
              <p className="text-sm text-stone-400">Emerging patterns detected</p>
            </div>
          </div>

          <div className="bg-stone-950/50 border border-stone-800/60 p-4 rounded-xl mb-6">
            <h4 className="text-amber-300 font-semibold mb-2 flex items-center gap-2 text-sm">
              <span className="text-amber-500 font-serif">✦</span> Possible Activation: {topSchema.name.replace(/-/g, ' ')}
            </h4>
            <p className="text-sm text-stone-300 leading-relaxed italic">
              "{topSchema.description}"
            </p>
          </div>

          <p className="text-xs sm:text-sm text-stone-500 mb-8 leading-relaxed">
            Note: These results are provisional. Completing the full set will provide a more precise and validated profile.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={onClose} className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold rounded-xl transition-all shadow-lg shadow-amber-900/20">
              Continue Full Audit
            </button>
            {testMode === 'core' && (
              <button 
                onClick={() => { setShowInterimModal(false); handleCompleteTest(); }}
                className="flex-1 py-3 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold rounded-xl border border-stone-700 transition-all"
              >
                Finish with Partial Profile
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    const allTests: SchemaTestId[] = ['core-schema', 'mode-identification', 'coping-style', 'trigger-pattern', 'ems', 'schema-modes'];
    const loadedResponses: Record<SchemaTestId, SchemaTestResponse[]> = {
      'core-schema': [], 'mode-identification': [], 'coping-style': [], 'trigger-pattern': [], 'ems': [], 'schema-modes': []
    };

    allTests.forEach(testId => {
      const stored = StorageManager.getUntyped(`${STORAGE_PREFIX}${testId}`);
      if (stored) {
        try { loadedResponses[testId] = Array.isArray(stored) ? stored : []; } 
        catch (err) { loadedResponses[testId] = []; }
      }
    });

    setTestResponses(loadedResponses);
  }, []);

  const saveResponsesToStorage = useCallback((testId: SchemaTestId, responses: SchemaTestResponse[]) => {
    pendingSavesRef.current[testId] = responses;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      Object.entries(pendingSavesRef.current).forEach(([id, data]) => {
        StorageManager.setUntyped(`${STORAGE_PREFIX}${id}`, data);
      });
      pendingSavesRef.current = {};
    }, 500);
  }, []);

  useEffect(() => {
    return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
  }, []);

  useEffect(() => {
    if (insightContext && linkedInsightId !== insightContext.id) setLinkedInsightId(insightContext.id);
  }, [insightContext, linkedInsightId]);

  const buildSession = useCallback((): SchemaSession => ({
    sessionId, userId: userId || null, 
    createdAt: existingSession?.createdAt || new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(), completedTests, testResults,
    testProgress: existingSession?.testProgress || {} as Record<SchemaTestId, SchemaTestProgress>,
    unifiedProfile, linkedInsightId
  }), [sessionId, userId, existingSession, completedTests, testResults, unifiedProfile, linkedInsightId]);

  useEffect(() => {
    const interval = setInterval(() => { if (setDraft) setDraft(buildSession()); }, 30000);
    return () => clearInterval(interval);
  }, [buildSession, setDraft]);

  const getWizardStep = () => {
    switch (phase) {
      case 'welcome': return 1;
      case 'test-menu': return 2;
      case 'test-questions': return 3;
      case 'test-results': return 4;
      case 'unified-profile': return 5;
      case 'synthesis': return 6;
      case 'complete': return 7;
      default: return 1;
    }
  }

  const handleStartTest = (testId: SchemaTestId) => {
    const items = getSchemaTestItems(testId);
    setActiveTest(testId); setCurrentTestItems(items); setError(null);
    const existingResponses = testResponses[testId] || [];
    const batchSize = items.batchSize || 15;
    setCurrentBatchIndex(Math.floor(existingResponses.length / batchSize));
    setPhase('test-questions');
    setCurrentStepIndex(3);
  };

  const handleReturnToMenu = () => {
    setActiveTest(null); setCurrentTestItems(null); setCurrentBatchIndex(0);
    setCurrentQuestionIndex(0); setCurrentAnswer(''); setAnswers([]); setUserNarrative('');
    setError(null); setPhase('test-menu');
    setCurrentStepIndex(2);
  };

  const handleLikertResponse = (questionId: string, value: number) => {
    if (!activeTest) return;
    const existingResponses = testResponses[activeTest] || [];
    const newResponses = [...existingResponses, { questionId, response: value, timestamp: Date.now() }];
    setTestResponses(prev => ({ ...prev, [activeTest]: newResponses }));
    saveResponsesToStorage(activeTest, newResponses);
  };

  const getResponseValue = (questionId: string): number | undefined => {
    if (!activeTest) return undefined;
    const responses = testResponses[activeTest] || [];
    const response = responses.find(r => r.questionId === questionId);
    return response ? (typeof response.response === 'number' ? response.response : undefined) : undefined;
  };

  const handleCompleteTest = async () => {
    if (!activeTest || !currentTestItems) return;
    const responses = testResponses[activeTest] || [];
    if (responses.length < currentTestItems.items.length && activeTest !== 'core-schema') {
      setError(`Please answer all ${currentTestItems.items.length} questions.`); return;
    } else if (activeTest === 'core-schema' && testMode === 'core' && responses.length < 30) {
      setError(`Please answer all core 30 questions.`); return;
    } else if (activeTest === 'core-schema' && testMode === 'full' && responses.length < 90) {
      setError(`Please answer all 90 questions.`); return;
    }

    setIsAnalyzing(true); setError(null);
    try {
      const result = scoreSchemaTest(activeTest, responses);
      result.linkedInsightId = linkedInsightId; result.userId = userId;
      const newTestResults = { ...testResults, [activeTest]: result };
      const newCompletedTests = completedTests.includes(activeTest) ? completedTests : [...completedTests, activeTest];
      
      setTestResults(newTestResults); setCompletedTests(newCompletedTests);

      if (newCompletedTests.length >= 2) {
        try {
          const profile = await synthesizeSchemaProfile({ userId, completedTests: newCompletedTests, testResults: newTestResults });
          profile.linkedInsightId = linkedInsightId;
          setUnifiedProfile(profile);
        } catch (err) {}
      }
      setPhase('test-results');
      setCurrentStepIndex(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scoring failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getCurrentBatchItems = () => {
    if (!currentTestItems) return [];
    const batchSize = currentTestItems.batchSize || 15;
    const start = currentBatchIndex * batchSize;
    const items = activeTest === 'core-schema' && testMode === 'core' ? currentTestItems.items.slice(0, 30) : currentTestItems.items;
    return items.slice(start, start + batchSize);
  };

  const getTotalBatches = () => {
    if (!currentTestItems) return 0;
    const batchSize = currentTestItems.batchSize || 15;
    const totalItems = activeTest === 'core-schema' && testMode === 'core' ? 30 : currentTestItems.items.length;
    return Math.ceil(totalItems / batchSize);
  };

  const canGoToNextBatch = () => {
    if (!activeTest || !currentTestItems) return false;
    const responses = testResponses[activeTest] || [];
    return getCurrentBatchItems().every(item => responses.some(r => r.questionId === item.id));
  };

  const handleNextBatch = () => {
    const totalBatches = getTotalBatches();
    const responses = activeTest ? testResponses[activeTest] : [];

    if (activeTest === 'core-schema' && responses.length >= lastInterimIndex + 15 && currentBatchIndex < totalBatches - 1) {
      try {
        setInterimResult(scoreCoreSchemaTest(responses));
        setShowInterimModal(true); setLastInterimIndex(responses.length);
      } catch (e) {}
    }

    if (currentBatchIndex < totalBatches - 1 && canGoToNextBatch()) {
      setCurrentBatchIndex(currentBatchIndex + 1); setError(null);
    } else if (!canGoToNextBatch()) {
      setError('Please answer all questions in this section.');
    }
  };

  const handlePreviousBatch = () => {
    if (currentBatchIndex > 0) { setCurrentBatchIndex(currentBatchIndex - 1); setError(null); }
  };
  const isLastBatch = () => currentBatchIndex === getTotalBatches() - 1;

  const { setIntegratedInsights } = useInsightsContext();
  const handleCompleteFinal = async () => {
    const session = buildSession();
    onSave(session);
    try {
      const schemas = Object.values(testResults).flatMap(r => r.schemaScores?.map(s => s.name).join(', ') || []).join(', ');
      const insight = await generateInsightFromSession({
        wizardType: 'Schema Detective', sessionId: session.sessionId, sessionName: `Schema Assessment`,
        sessionReport: `Completed tests: ${completedTests.join(', ')}\\nActivated schemas: ${schemas || 'none'}`,
        sessionSummary: `Schema therapy assessment with ${completedTests.length} tests`,
        userId: userId || 'anonymous',
        availablePractices: Object.values(practices).flatMap(cat => Array.isArray(cat) ? cat.map(p => ({ id: p.id, name: p.name })) : []),
        dataContext: {
          totalSessions: 1,
          sessionsInLastWeek: 1,
          existingInsights: 0,
        },
      });
      setIntegratedInsights(prev => [...prev, insight]);
    } catch {}
    if (linkedInsightId && markInsightAsAddressed) markInsightAsAddressed(linkedInsightId, 'Schema Detective', sessionId);
    onClose();
  };

  const handleExport = () => {
    const session = buildSession();
    const jsonExport = { exportDate: new Date().toISOString(), sessionCreatedAt: session.createdAt, completedTests: session.completedTests, testResults: Object.fromEntries(session.completedTests.map(id => [id, session.testResults[id]])), unifiedProfile: session.unifiedProfile || null };
    const blob = new Blob([JSON.stringify(jsonExport, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `schema-detective-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

// ─── Render Functions ─────────────────────────────────────────────────────────

const renderWelcome = () => (
    <div className="space-y-6 sm:space-y-8 animate-fade-in text-center pt-8 pb-10">
        <div className="relative mb-5 flex justify-center">
            <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full animate-pulse" />
            <TransformativeArcIcon size={72} className="relative text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.4)]" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-light text-stone-100 drop-shadow-[0_0_12px_rgba(251,191,36,0.3)]">
            Schema Detective
        </h1>
        <p className="text-sm sm:text-base text-stone-400 max-w-lg mx-auto leading-relaxed">
            Discover the deep emotional patterns—called schemas—that shape your reactions,
            relationships, and life choices. Based on Jeffrey Young's Schema Therapy.
        </p>

        <div className="bg-stone-900/40 border border-stone-800/60 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl shadow-stone-950/50 max-w-xl mx-auto text-left">
            <h3 className="text-sm font-serif font-semibold text-amber-300 flex items-center gap-2">
                <span className="text-amber-500 font-serif">✦</span> Your Journey Starts Here
            </h3>
            <div className="bg-gradient-to-br from-stone-950/60 to-stone-900/40 border border-amber-500/20 rounded-xl p-4 sm:p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-start gap-4">
                    <div className="p-2 sm:p-3 bg-amber-900/20 border border-amber-500/30 rounded-lg flex-shrink-0">
                        <PatternMandalaIcon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <span className="text-sm sm:text-base font-semibold text-stone-100">Core Schema Assessment</span>
                            <span className="px-2 py-0.5 bg-emerald-900/30 border border-emerald-500/40 rounded text-[10px] text-emerald-300 font-bold tracking-wider uppercase">
                                Recommended Start
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm text-stone-400 mb-3 leading-relaxed">
                            Begin with the essentials — 90 items exploring the 18 foundational schemas that influence your emotions and relationships
                        </p>
                        <p className="text-[11px] text-stone-500 tracking-wide">~15 minutes • Progress saved automatically</p>
                    </div>
                </div>
            </div>
            <p className="text-xs text-stone-500 italic">
                Three additional assessments are available to deepen your insights once you complete the core assessment.
            </p>
        </div>

        {insightContext && (
            <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-4 sm:p-5 max-w-xl mx-auto text-left">
                <div className="flex items-start gap-3">
                    <span className="text-amber-500 font-serif w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0">✦</span>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-amber-300">Linked from Intelligence Hub</p>
                        <p className="text-sm text-stone-300 mt-1.5 leading-relaxed">{insightContext.detectedPattern}</p>
                    </div>
                </div>
            </div>
        )}
    </div>
);

const renderTestMenu = () => {
    const allTests = (Object.values(SCHEMA_TESTS) as any[]).sort((a, b) => a.recommendedOrder - b.recommendedOrder);
    const completedCount = completedTests.length;

    return (
        <div className="space-y-6 sm:space-y-8 animate-fade-in py-6">
            <div className="text-center space-y-3 pb-4">
                <PatternMandalaIcon className="w-8 h-8 mx-auto text-stone-500" />
                <h2 className="text-2xl font-serif font-light text-stone-100">Assessment Menu</h2>
                <p className="text-sm text-stone-400">Complete assessments in any order. Progress is saved automatically.</p>
            </div>

            {completedCount > 0 && completedCount < 4 && (
                <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                        <span className="text-emerald-400 flex-shrink-0 mt-0.5 font-serif">✦</span>
                        <div>
                            <p className="text-sm font-medium text-emerald-300">{completedCount} of 4 complete — great progress!</p>
                            <p className="text-xs text-emerald-400/60 mt-1">Continue your journey to unlock deeper insights.</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid gap-4">
                {allTests.map((test: any) => {
                    const status = getTestStatus(test.id, testResponses[test.id] || []);
                    const progress = calculateTestProgress(test.id, testResponses[test.id] || []);
                    const isCompleted = completedTests.includes(test.id);
                    const isRecommended = test.id === 'core-schema';

                    let statusColor = 'bg-stone-900 border-stone-800 text-stone-500';
                    let statusIcon = '○';
                    let statusText = 'Not Started';

                    if (status === 'in-progress') {
                        statusColor = 'bg-amber-950/30 border-amber-500/30 text-amber-400';
                        statusIcon = '●';
                        statusText = `${progress.answeredItems}/${progress.totalItems} answered`;
                    } else if (status === 'completed') {
                        statusColor = 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400';
                        statusIcon = '✓';
                        statusText = 'Completed';
                    }

                    return (
                        <div key={test.id} className={`bg-stone-900/40 border rounded-xl overflow-hidden transition-all ${status === 'completed' ? 'border-emerald-900/40' : 'border-stone-800/60 hover:border-stone-700 hover:shadow-lg hover:shadow-stone-950/50 hover:bg-stone-900/60'}`}>
                            <div className="p-4 sm:p-5" onClick={() => handleStartTest(test.id)}>
                                <div className="flex items-start gap-4">
                                    <div className={`p-2 sm:p-3 bg-gradient-to-br ${TEST_COLORS[test.id]} border rounded-lg flex-shrink-0`}>
                                        {TEST_ICONS[test.id]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <h3 className="text-base sm:text-lg font-serif font-semibold text-stone-100">{test.label}</h3>
                                            {isRecommended && status === 'not-started' && (
                                                <span className="px-2 py-0.5 bg-amber-900/20 border border-amber-500/30 rounded text-[10px] uppercase font-bold text-amber-400 tracking-wider">Recommended Start</span>
                                            )}
                                            <span className={`px-2 py-0.5 border rounded text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5 ${statusColor}`}>
                                                <span className="font-serif">{statusIcon}</span> <span className="hidden sm:inline">{statusText}</span>
                                            </span>
                                        </div>
                                        <p className="text-xs sm:text-sm text-stone-400 mt-1.5 mb-3 leading-relaxed">{test.shortDescription}</p>

                                        <div className="flex items-center gap-4 text-[11px] uppercase tracking-wider text-stone-500">
                                            <span>{getSchemaTestItems(test.id).items.length} items</span>
                                            <span>~{test.estimatedDuration}</span>
                                        </div>

                                        <div className="mt-4" onClick={e => e.stopPropagation()}>
                                            {test.id === 'core-schema' && status === 'not-started' ? (
                                                <div className="flex flex-col sm:flex-row gap-2">
                                                    <button onClick={(e) => { e.stopPropagation(); setTestMode('core'); handleStartTest(test.id); }} className="flex-1 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 min-h-[44px] text-xs font-bold px-4 rounded-xl transition-all shadow-lg shadow-amber-900/30 hover:shadow-xl hover:shadow-amber-800/40 flex items-center justify-center gap-2">
                                                        <PatternMandalaIcon size={14} /> Core Pulse (~30 items)
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); setTestMode('full'); handleStartTest(test.id); }} className="flex-1 bg-stone-800/80 hover:bg-stone-700 text-stone-300 min-h-[44px] text-xs font-semibold px-4 rounded-xl transition-all flex items-center justify-center gap-2 border border-stone-700 shadow shadow-stone-900/20">
                                                        <PatternMandalaIcon size={14} /> Full Audit (90 items)
                                                    </button>
                                                </div>
                                            ) : (
                                                <button onClick={(e) => { e.stopPropagation(); handleStartTest(test.id); }} className="w-full sm:w-auto bg-stone-800/80 hover:bg-stone-700 text-stone-300 min-h-[44px] text-xs font-semibold px-6 rounded-xl transition-all flex items-center justify-center gap-2 border border-stone-700 shadow shadow-stone-900/20">
                                                    {status === 'not-started' ? 'Start Assessment' : 'Continue Assessment'}
                                                </button>
                                            )}
                                        </div>

                                        {status === 'in-progress' && (
                                            <div className="mt-4">
                                                <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden shadow-inner shadow-stone-950/50">
                                                    <div className="h-full bg-gradient-to-r from-amber-600 to-amber-500 transition-all duration-300" style={{ width: `${progress.percentComplete}%` }} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {completedTests.length >= 2 && completedTests.length < 4 && (
                <div className="bg-gradient-to-br from-emerald-950/30 to-emerald-900/20 border border-emerald-500/30 rounded-xl p-5 shadow-lg shadow-emerald-900/10">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <TransformativeArcIcon className="w-8 h-8 text-emerald-400 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="text-lg font-serif font-bold text-stone-100">Unified Profile Available</h3>
                                <p className="text-sm text-stone-400 mt-1 leading-relaxed">You've completed {completedTests.length} tests. View your synthesized profile.</p>
                            </div>
                        </div>
                        <button onClick={() => { setPhase('unified-profile'); setCurrentStepIndex(5); }} className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-stone-100 rounded-xl font-medium transition-all shadow shadow-emerald-900/30 tracking-wide text-sm">
                            View Profile
                        </button>
                    </div>
                </div>
            )}

            {completedTests.length === 4 && (
                <div className="bg-gradient-to-br from-violet-950/30 to-violet-900/20 border border-violet-500/30 rounded-xl p-5 shadow-lg shadow-violet-900/10">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <TransformativeArcIcon className="w-8 h-8 text-violet-400 flex-shrink-0 mt-1 animate-pulse" />
                            <div>
                                <h3 className="text-lg font-serif font-bold text-stone-100">Full Battery Complete</h3>
                                <p className="text-sm text-stone-400 mt-1 leading-relaxed">View your comprehensive synthesis with integrated insights.</p>
                            </div>
                        </div>
                        <button onClick={() => { setPhase('synthesis'); setCurrentStepIndex(6); }} className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-violet-700 to-violet-600 hover:from-violet-600 hover:to-violet-500 text-stone-100 rounded-xl font-medium transition-all shadow shadow-violet-900/30 tracking-wide text-sm">
                            View Synthesis
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const renderTestQuestions = () => {
    if (!activeTest || !currentTestItems) return null;
    const testDef = SCHEMA_TESTS[activeTest];
    const batchItems = getCurrentBatchItems();
    const responses = testResponses[activeTest] || [];
    const isRecommended = activeTest === 'core-schema';

    return (
        <div className="space-y-6 sm:space-y-8 animate-fade-in py-6">
            <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                    {TEST_ICONS[activeTest]}
                    <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-100">{testDef.label}</h2>
                </div>
                <p className="text-[11px] text-stone-500 font-medium tracking-widest uppercase">
                    {isRecommended && testMode === 'core' ? 'Core Pulse (30 items)' : `Part ${currentBatchIndex + 1} of ${getTotalBatches()}`}
                </p>
            </div>

            <div className="bg-amber-950/10 border border-amber-500/15 rounded-xl p-4 sm:p-5">
                <p className="text-xs sm:text-sm text-amber-200/80 leading-relaxed font-medium">
                    <span className="font-bold text-amber-400 mr-2">Instructions:</span>
                    {currentTestItems.instructions}
                </p>
            </div>

            <div className="space-y-6 sm:space-y-8 pb-10">
                {batchItems.map((item, index) => {
                    const currentVal = getResponseValue(item.id);
                    const isAnswered = currentVal !== undefined;
                    const globalIndex = currentBatchIndex * (currentTestItems.batchSize || 15) + index + 1;

                    return (
                        <div key={item.id} className={`bg-stone-900/60 border rounded-2xl p-5 sm:p-7 transition-all duration-300 ${isAnswered ? 'border-stone-700/60 break-inside-avoid shadow-lg shadow-stone-950/50' : 'border-stone-800 ring-1 ring-amber-500/10 shadow-xl shadow-amber-900/5'}`}>
                            <div className="flex items-start gap-3 sm:gap-4 mb-6">
                                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs sm:text-sm font-bold shadow-inner ${isAnswered ? 'bg-amber-900/40 text-amber-400 border border-amber-500/30' : 'bg-stone-800 text-stone-500 border border-stone-700'}`}>
                                    {globalIndex}
                                </div>
                                <h3 className="text-base sm:text-lg font-medium text-stone-200 leading-snug pt-0.5 sm:pt-1">{item.text}</h3>
                            </div>

                            <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
                                {LIKERT_OPTIONS.map(opt => {
                                    const isSelected = currentVal === opt.value;
                                    return (
                                        <button
                                            key={opt.value}
                                            onClick={() => handleLikertResponse(item.id, opt.value)}
                                            className={`group relative py-3 sm:py-4 rounded-xl flex flex-col items-center justify-center transition-all duration-200 overflow-hidden ${isSelected
                                                    ? 'bg-gradient-to-b from-amber-600 to-amber-500 text-stone-950 shadow-lg shadow-amber-900/30 ring-2 ring-amber-400/50 ring-offset-2 ring-offset-stone-950'
                                                    : 'bg-stone-800/80 hover:bg-stone-700 text-stone-400 border border-stone-700 hover:border-stone-600'
                                                }`}
                                            title={opt.label}
                                        >
                                            {isSelected && <div className="absolute inset-0 bg-white/20 animate-pulse" style={{ animationDuration: '2s' }} />}
                                            <span className={`text-base sm:text-lg font-bold relative z-10 ${isSelected ? 'text-stone-950' : 'text-stone-300 group-hover:text-stone-200'}`}>
                                                {opt.value}
                                            </span>
                                            <span className={`text-[9px] sm:text-[10px] mt-1 sm:mt-1.5 leading-tight text-center px-1 max-w-full font-medium tracking-wide relative z-10 hidden sm:block opacity-80 ${isSelected ? 'text-stone-900' : ''}`}>
                                                {opt.label.split(' ').map((word, i) => React.Fragment && <React.Fragment key={i}>{word}<br /></React.Fragment>)}
                                            </span>
                                            <span className={`text-[9px] mt-1 hidden max-sm:block opacity-80 ${isSelected ? 'text-stone-900' : ''}`}>
                                                {opt.shortLabel}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex justify-between items-center px-1 mt-3 sm:hidden text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                                <span>Untrue</span>
                                <span>Perfect Match</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="sticky bottom-4 sm:bottom-6 left-0 right-0 z-20 flex justify-between items-center bg-stone-900/95 backdrop-blur-md border border-stone-800/60 p-4 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.8)]">
                <button
                    onClick={handlePreviousBatch}
                    disabled={currentBatchIndex === 0}
                    className={`px-4 sm:px-6 py-2.5 sm:py-3 border rounded-xl font-medium transition-all text-sm ${currentBatchIndex === 0 ? 'bg-stone-900/50 border-stone-800/50 text-stone-600 cursor-not-allowed' : 'bg-stone-800 hover:bg-stone-700 border-stone-700 text-stone-300'}`}
                >
                    Previous
                </button>

                <div className="flex-1 flex justify-center px-4">
                    <span className="text-xs sm:text-sm font-semibold text-stone-400 flex items-center gap-2">
                        <span className="text-amber-500 font-serif hidden sm:block">✦</span>
                        Progress: <span className="text-amber-400">{responses.length} / {testMode === 'core' && activeTest === 'core-schema' ? '30' : currentTestItems.items.length}</span>
                    </span>
                </div>

                <button
                    onClick={isLastBatch() ? handleCompleteTest : handleNextBatch}
                    disabled={!canGoToNextBatch()}
                    className={`min-w-[100px] sm:min-w-[120px] px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-all text-sm flex items-center justify-center gap-2 shadow-lg ${!canGoToNextBatch()
                            ? 'bg-stone-900/50 border border-stone-800/50 text-stone-600 shadow-none cursor-not-allowed'
                            : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 shadow-amber-900/30'
                        }`}
                >
                    {isLastBatch() ? 'Analyze' : 'Next'}
                </button>
            </div>
        </div>
    );
};

const renderTestResults = () => {
    if (!activeTest || !testResults[activeTest]) return null;
    const result = testResults[activeTest];
    const testDef = SCHEMA_TESTS[activeTest];

    return (
        <div className="space-y-6 sm:space-y-8 animate-fade-in py-6">
            <div className="flex items-center justify-between mb-2">
                <div/> {/* Spacer since WizardFrame handles back */}

                <div className="flex gap-2 sm:gap-3">
                    <button onClick={handleExport} className="px-3 sm:px-4 py-2 border border-stone-700 hover:border-stone-600 text-stone-300 hover:text-stone-100 rounded-xl text-xs sm:text-sm transition-all flex items-center gap-2 bg-stone-900/80">
                        <span className="hidden sm:inline">Export</span>
                    </button>
                    <button onClick={() => setShowChat(true)} className="px-4 py-2 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-stone-100 shadow-lg shadow-amber-900/20 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2">
                        Talk to AI
                    </button>
                </div>
            </div>

            <div className="text-center pt-2 pb-6">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl flex items-center justify-center bg-gradient-to-br ${TEST_COLORS[activeTest]} shadow-[0_0_30px_rgba(var(--tw-colors-violet-900),0.3)] mb-4`}>
                    {TEST_ICONS[activeTest]}
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-light text-stone-100">{testDef.label} Results</h2>
                <p className="text-sm sm:text-base text-stone-400 mt-2">Analysis completed based on your responses.</p>
            </div>

            <div className="bg-stone-900/40 border border-stone-800/60 rounded-2xl p-5 sm:p-8 backdrop-blur-md">
                <SectionLabel>Executive Summary</SectionLabel>
                <div className="prose prose-sm sm:prose-base prose-invert mt-3 mb-8">
                    <p className="text-stone-300 leading-relaxed font-medium">{result.narrative}</p>
                </div>

                {result.schemaScores && result.schemaScores.length > 0 && (
                    <div className="mb-10">
                        <SectionLabel>Activated Patterns</SectionLabel>
                        <div className="mt-4 space-y-4">
                            {result.schemaScores.map((score, idx) => {
                                const severityConfig = {
                                    'low': { color: 'bg-stone-600', tx: 'text-stone-400', label: 'Low', border: 'border-stone-800' },
                                    'moderate': { color: 'bg-amber-600', tx: 'text-amber-400', label: 'Elevated', border: 'border-amber-900/30' },
                                    'high': { color: 'bg-orange-500', tx: 'text-orange-400', label: 'High', border: 'border-orange-500/30' },
                                    'severe': { color: 'bg-rose-500', tx: 'text-rose-400', label: 'Severe', border: 'border-rose-500/30' }
                                };
                                const config = severityConfig[score.severity as keyof typeof severityConfig] || severityConfig['low'];

                                return (
                                    <div key={idx} className={`bg-stone-900/60 p-4 sm:p-5 rounded-xl border ${config.border}`}>
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="font-semibold text-stone-200">{score.name.replace(/-/g, ' ')}</h4>
                                            <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded bg-stone-950 border ${config.border} ${config.tx}`}>
                                                {config.label}
                                            </span>
                                        </div>

                                        <div className="h-2 bg-stone-800/80 rounded-full overflow-hidden shadow-inner mb-4 flex">
                                            <div className={`h-full ${config.color}`} style={{ width: `${(score.score / 6) * 100}%` }} />
                                        </div>
                                        <p className="text-sm text-stone-400 leading-relaxed">{score.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {result.domainAnalyses && result.domainAnalyses.length > 0 && (
                    <div>
                        <SectionLabel>Domain Analysis</SectionLabel>
                        <div className="mt-4 grid gap-4 grid-cols-1 md:grid-cols-2">
                            {result.domainAnalyses.map((domain, idx) => (
                                <div key={idx} className="bg-stone-900/60 border border-stone-800/60 rounded-xl p-4 sm:p-5 border-l-4 border-l-violet-600 relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-semibold text-stone-200">{domain.domainLabel}</h4>
                                        <span className="text-xs font-mono text-stone-500 bg-stone-950 px-2 py-0.5 rounded border border-stone-800">
                                            {Math.round(domain.totalScore * 10) / 10} / 6
                                        </span>
                                    </div>
                                    <p className="text-sm text-stone-400 leading-relaxed">{domain.interpretation}</p>
                                    {domain.dominantSchemas.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-1.5">
                                            {domain.dominantSchemas.map(s => (
                                                <span key={s} className="px-2 py-0.5 bg-violet-900/20 text-violet-300 text-[10px] uppercase tracking-wider rounded border border-violet-800/40">
                                                    {s.replace(/-/g, ' ')}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div></div>
                )}
            </div>

            {showChat && (
                <div className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-sm shadow-2xl overflow-hidden p-0 sm:p-4 md:p-8 animate-fade-in flex flex-col">
                    <div className="bg-stone-900 border border-stone-800/60 flex-1 rounded-none sm:rounded-2xl relative flex flex-col max-h-[90vh] mx-auto w-full max-w-4xl shadow-[0_0_50px_rgba(0,0,0,0.6)]">
                        <button
                            onClick={() => setShowChat(false)}
                            className="absolute right-4 top-4 z-10 w-10 h-10 bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 rounded-full flex items-center justify-center transition-all border border-stone-700/50"
                        >
                            <span className="font-serif">X</span> 
                        </button>
                        <TestResultsChat
                            testResult={result}
                            testLabel={testDef.label}
                            onClose={() => setShowChat(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

const renderUnifiedProfile = () => {
    if (!unifiedProfile) return null;

    return (
        <div className="space-y-6 sm:space-y-8 animate-fade-in py-6">
            <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-serif font-light text-stone-100 flex items-center justify-center gap-2">
                    <span className="text-amber-500 font-serif">✦</span> Unified Profile
                </h2>
                <p className="text-sm text-stone-400 mt-1">Synthesis of {completedTests.length} completed assessments</p>
            </div>

            <div className="bg-stone-900/40 border border-stone-800/60 rounded-2xl p-5 sm:p-8 backdrop-blur-md">
                <SectionLabel>Core Pattern Summary</SectionLabel>
                <div className="bg-gradient-to-br from-amber-950/20 to-stone-900/60 border border-amber-500/15 p-5 rounded-xl text-stone-300 leading-relaxed font-medium shadow-inner">
                    {unifiedProfile.summary}
                </div>

                <div className="mt-8 space-y-6">
                    <h3 className="font-serif text-xl sm:text-2xl text-stone-200">Dominant Dynamics</h3>
                    {unifiedProfile.primaryDynamics.map((dynamic, idx) => (
                        <div key={idx} className="bg-stone-950/50 border border-stone-800/60 p-5 rounded-xl shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                            <h4 className="font-semibold text-lg text-amber-300 mb-3">{dynamic.title}</h4>
                            <p className="text-sm text-stone-400 leading-relaxed mb-4">{dynamic.description}</p>
                            <div className="flex flex-wrap gap-2">
                                {dynamic.schemas.map(s => <span key={s} className="px-2 py-1 bg-amber-900/30 text-amber-500 border border-amber-800/50 rounded-md text-[10px] font-bold uppercase tracking-wider">{s.replace(/-/g, ' ')}</span>)}
                                {dynamic.modes.map(m => <span key={m} className="px-2 py-1 bg-violet-900/30 text-violet-400 border border-violet-800/50 rounded-md text-[10px] font-bold uppercase tracking-wider">{m.replace(/-/g, ' ')}</span>)}
                                {dynamic.copingStyles.map(c => <span key={c} className="px-2 py-1 bg-rose-900/30 text-rose-400 border border-rose-800/50 rounded-md text-[10px] font-bold uppercase tracking-wider">{c.replace(/-/g, ' ')}</span>)}
                            </div>
                        </div>
                    ))}
                </div>

                {unifiedProfile.recommendedInterventions && unifiedProfile.recommendedInterventions.length > 0 && (
                    <div className="mt-8">
                        <SectionLabel>Recommended Next Steps</SectionLabel>
                        <div className="grid gap-4 mt-3">
                            {unifiedProfile.recommendedInterventions.map((intervention, idx) => (
                                <div key={idx} className="bg-stone-900/80 border border-stone-800 p-4 rounded-xl flex items-start gap-3 transition-colors hover:border-amber-900/40">
                                    <div className="w-6 h-6 rounded-full bg-amber-950 flex items-center justify-center flex-shrink-0 text-xs font-bold text-amber-500 mt-0.5 border border-amber-900/50">
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-stone-200 text-sm mb-1">{intervention.phase}</h4>
                                        <p className="text-sm text-stone-400 leading-relaxed">{intervention.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div></div>
                )}
            </div>
        </div>
    );
};

const renderSynthesis = () => (
    <div className="space-y-6 sm:space-y-8 animate-fade-in py-6 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative mb-6">
            <div className="absolute inset-0 bg-violet-600/20 blur-3xl rounded-full animate-pulse" />
            <TransformativeArcIcon size={80} className="relative text-violet-400 drop-shadow-[0_0_20px_rgba(139,92,246,0.4)]" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif font-light text-stone-100 text-center">Comprehensive Profile Generated</h2>
        <p className="text-stone-400 text-center max-w-lg leading-relaxed">
            You have completed the full Schema Therapist assessment battery.
            Your insight graph has been updated with these deep foundational patterns.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full">
            <button onClick={() => { setPhase('unified-profile'); setCurrentStepIndex(5); }} className="flex-1 px-6 py-4 bg-gradient-to-r from-violet-700 to-violet-600 hover:from-violet-600 hover:to-violet-500 text-stone-100 rounded-xl font-semibold shadow-lg shadow-violet-900/20 transition-all flex items-center justify-center gap-2">
                View Complete Blueprint
            </button>
            <button onClick={() => { setPhase('complete'); setCurrentStepIndex(7); }} className="flex-1 px-6 py-4 bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 rounded-xl font-semibold transition-all">
                Finish Assessment
            </button>
        </div>
    </div>
);

const renderComplete = () => (
    <div className="space-y-6 sm:space-y-8 animate-fade-in py-10 text-center">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(16,185,129,0.2)] border border-emerald-500/20">
            <span className="text-4xl text-emerald-400 font-serif">✓</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif text-stone-100">Assessment Saved</h2>
        <p className="text-stone-400 max-w-md mx-auto leading-relaxed">
            Your schema profile has been successfully integrated into your Aura OS history and insight network.
        </p>
    </div>
);

// Map complex phase states to WizardFrame next/back handlers
const handleNext = () => {
    if (phase === 'welcome') {
      setPhase('test-menu');
      setCurrentStepIndex(2);
    } else if (phase === 'test-questions') {
      if (isLastBatch()) {
        handleCompleteTest();
      } else {
        handleNextBatch();
      }
    } else if (phase === 'test-results') {
      setPhase('test-menu');
      setCurrentStepIndex(2);
    } else if (phase === 'unified-profile') {
      // Just showing profile, let close handle exit
    } else if (phase === 'synthesis') {
      setPhase('complete');
      setCurrentStepIndex(7);
    } else if (phase === 'complete') {
        handleCompleteFinal();
    }
}

const handleBack = () => {
    if (phase === 'test-menu') {
        setPhase('welcome');
        setCurrentStepIndex(1);
    } else if (phase === 'test-questions') {
      if (currentBatchIndex === 0) {
        handleReturnToMenu();
      } else {
        handlePreviousBatch();
      }
    } else if (phase === 'test-results') {
      handleReturnToMenu();
    } else if (phase === 'unified-profile') {
      handleReturnToMenu();
    } else if (phase === 'synthesis') {
      handleReturnToMenu();
    } else if (phase === 'complete') {
      setPhase('synthesis');
      setCurrentStepIndex(6);
    }
}

const getNextButtonText = () => {
    if (phase === 'welcome') return 'Assessments';
    if (phase === 'test-menu') return 'Select an Assessment';
    if (phase === 'test-questions') return isLastBatch() ? 'Analyze' : 'Next Batch';
    if (phase === 'test-results') return 'Back to Menu';
    if (phase === 'unified-profile') return 'Back to Menu';
    if (phase === 'synthesis') return 'Complete';
    if (phase === 'complete') return 'Return to Hub';
    return 'Next';
}

const isNextButtonDisabled = () => {
    if (phase === 'test-menu') return true; // Require a button click from menu
    if (phase === 'test-questions') return !canGoToNextBatch();
    return false;
}


return (
  <>
    <WizardFrame
      title="Schema Detective"
      currentStep={currentStepIndex}
      totalSteps={7}
      onClose={onClose}
      onBack={handleBack}
      onNext={handleNext}
      showBackButton={phase !== 'welcome'}
      nextButtonText={getNextButtonText()}
      nextButtonDisabled={isNextButtonDisabled()}
      isLoading={isAnalyzing}
      accentColor="amber"
      errorMessage={error}
    >
        <div ref={contentRef}>
            {phase === 'welcome' && renderWelcome()}
            {phase === 'test-menu' && renderTestMenu()}
            {phase === 'test-questions' && renderTestQuestions()}
            {phase === 'test-results' && renderTestResults()}
            {phase === 'unified-profile' && renderUnifiedProfile()}
            {phase === 'synthesis' && renderSynthesis()}
            {phase === 'complete' && renderComplete()}
        </div>
    </WizardFrame>

    {showInterimModal && interimResult && <InterimInsightModal result={interimResult} onClose={() => setShowInterimModal(false)} />}
  </>
);
}
