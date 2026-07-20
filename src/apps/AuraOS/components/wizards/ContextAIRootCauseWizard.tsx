import React, { useState } from 'react';
import { X, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { getIconComponent } from '../../.claude/lib/iconMap.ts';
// Note: callGrokThenAIJson uses Grok 4.1 → Qwen fallback (not Gemini)
import { callInceptionMercuryJson } from '../../services/ai/aiCore';
import { generateInsightFromSession } from '../../services/insightGenerator.ts';
import { contextAIRootCauseSchema } from '../../services/ai/wizardSchemas.ts';
import { IntegratedInsight } from '../../types.ts';
import { StorageManager } from '../../.claude/lib/storageManager.ts';

interface ContextAIRootCauseWizardProps {
  onClose: () => void;
  userId: string;
  insightContext?: IntegratedInsight | null;
  markInsightAsAddressed?: (insightId: string, wizardType: string, sessionId: string) => void;
  onSave?: (session: ContextAISession) => void;
}

type WizardStep = 'INTRODUCTION' | 'DEFINE_PROBLEM' | 'REVIEW_CAUSES' | 'ANALYZE' | 'COMPLETE';

interface RootCause {
  id: string;
  text: string;
  quadrant: 'individual-internal' | 'individual-external' | 'collective-internal' | 'collective-external';
}

interface ContextAISession {
  id: string;
  date: string;
  problemStatement: string;
  causes: RootCause[];
  keyInsights: string;
  recommendations: string;
  linkedInsightId?: string;
}

interface AIGeneratedCauses {
  causes: Array<{
    text: string;
    quadrant: 'individual-internal' | 'individual-external' | 'collective-internal' | 'collective-external';
  }>;
}

const STORAGE_KEY = 'aura-context-ai-sessions';

const ProgressBar = ({ currentStep }: { currentStep: WizardStep }) => {
  const steps: { label: string; value: WizardStep }[] = [
    { label: 'Intro', value: 'INTRODUCTION' },
    { label: 'Define', value: 'DEFINE_PROBLEM' },
    { label: 'Review', value: 'REVIEW_CAUSES' },
    { label: 'Analyze', value: 'ANALYZE' },
    { label: 'Complete', value: 'COMPLETE' },
  ];

  const currentIndex = steps.findIndex(s => s.value === currentStep);

  return (
    <div className="flex items-center justify-between mt-4 mb-6">
      {steps.map((step, index) => (
        <React.Fragment key={step.value}>
          <div className="flex flex-col items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
              index < currentIndex ? 'bg-orange-500 text-white' : 
              index === currentIndex ? 'bg-orange-600 text-white ring-4 ring-orange-500/30' : 
              'bg-neutral-700 text-slate-400'
            }`}>
              {index < currentIndex ? '✓' : index + 1}
            </div>
            <p className={`mt-2 text-xs text-center max-w-[80px] font-sans ${
              index === currentIndex ? 'text-orange-300 font-bold' : 'text-slate-400'
            }`}>
              {step.label}
            </p>
          </div>
          {index < steps.length - 1 && (
            <div className={`flex-auto h-0.5 transition-all duration-300 ${
              index < currentIndex ? 'bg-orange-500' : 'bg-neutral-700'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default function ContextAIRootCauseWizard({
  onClose,
  userId,
  insightContext,
  markInsightAsAddressed,
  onSave
}: ContextAIRootCauseWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('INTRODUCTION');
  const [problemStatement, setProblemStatement] = useState('');
  const [causes, setCauses] = useState<RootCause[]>([]);
  const [keyInsights, setKeyInsights] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingCause, setEditingCause] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [linkedInsightId] = useState<string | undefined>(insightContext?.id);

  const getQuadrantLabel = (quadrant: string): string => {
    switch (quadrant) {
      case 'individual-internal': return 'Individual-Internal';
      case 'individual-external': return 'Individual-External';
      case 'collective-internal': return 'Collective-Internal';
      case 'collective-external': return 'Collective-External';
      default: return quadrant;
    }
  };

  const getQuadrantColor = (quadrant: string): string => {
    switch (quadrant) {
      case 'individual-internal': return 'bg-teal-900/40 border-teal-500/40';
      case 'individual-external': return 'bg-teal-900/40 border-teal-500/40';
      case 'collective-internal': return 'bg-purple-900/40 border-purple-500/40';
      case 'collective-external': return 'bg-pink-900/40 border-pink-500/40';
      default: return 'bg-neutral-900/40 border-neutral-500/40';
    }
  };

  const generateRootCauses = async () => {
    if (!problemStatement.trim()) {
      setError('Please provide a problem statement first.');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const prompt = `You are a root cause analysis expert using the Context AI framework - a 2×2 quadrant model with Individual/Collective on one axis and Internal/External on the other.

Problem Statement: "${problemStatement}"

Generate 8-12 root causes (2-3 per quadrant) that explain this problem from different perspectives:

1. **Individual-Internal**: Personal psychology, behaviors, skills, mindset, emotions
2. **Individual-External**: Personal circumstances, external influences on the individual, opportunities, constraints
3. **Collective-Internal**: Organizational culture, team dynamics, shared beliefs, systems, processes
4. **Collective-External**: Market forces, societal trends, industry dynamics, regulations, competition

For each cause, provide:
- A clear, concise description (1-2 sentences)
- The appropriate quadrant

Return a JSON object with this exact structure:
{
  "causes": [
    { "text": "Root cause description", "quadrant": "individual-internal" },
    { "text": "Root cause description", "quadrant": "individual-external" },
    ...
  ]
}

Make the causes specific, actionable, and insightful. Ensure each quadrant has 2-3 causes.`;

      const result = await callInceptionMercuryJson<AIGeneratedCauses>(
        'ContextAIRootCauseWizard',
        prompt,
        contextAIRootCauseSchema
      );

      if (result && result.causes && Array.isArray(result.causes)) {
        const formattedCauses: RootCause[] = result.causes.map((cause, index) => ({
          id: `cause-${Date.now()}-${index}`,
          text: cause.text,
          quadrant: cause.quadrant
        }));
        setCauses(formattedCauses);
      } else {
        throw new Error('Invalid response format from AI');
      }
    } catch (err) {
      console.error('Error generating root causes:', err);
      setError('Failed to generate root causes. Please try again or add causes manually.');
    } finally {
      setIsGenerating(false);
    }
  };

  const addCause = (quadrant: RootCause['quadrant']) => {
    const newCause: RootCause = {
      id: `cause-${Date.now()}`,
      text: '',
      quadrant
    };
    setCauses([...causes, newCause]);
    setEditingCause(newCause.id);
    setEditText('');
  };

  const updateCause = (id: string, text: string) => {
    setCauses(causes.map(c => c.id === id ? { ...c, text } : c));
    setEditingCause(null);
    setEditText('');
  };

  const deleteCause = (id: string) => {
    setCauses(causes.filter(c => c.id !== id));
  };

  const generateAnalysis = async () => {
    setIsGenerating(true);
    setError('');

    try {
      const causesText = causes.map(c => `[${getQuadrantLabel(c.quadrant)}] ${c.text}`).join('\n');
      
      const prompt = `Based on this Context AI root cause analysis, provide:

Problem: "${problemStatement}"

Root Causes:
${causesText}

Generate:
1. **Key Insights** (2-3 paragraphs): Synthesize how these causes interconnect across quadrants. Identify patterns, feedback loops, and systemic dynamics.

2. **Actionable Recommendations** (3-5 concrete steps): Prioritized actions that address multiple quadrants simultaneously for maximum leverage.

Return JSON:
{
  "keyInsights": "Multi-paragraph synthesis...",
  "recommendations": "Numbered list of concrete actions..."
}`;

      const result = await callInceptionMercuryJson<{ keyInsights: string; recommendations: string }>(
        'ContextAIRootCauseWizard',
        prompt
      );

      if (result) {
        setKeyInsights(result.keyInsights || '');
        setRecommendations(result.recommendations || '');
      }
    } catch (err) {
      console.error('Error generating analysis:', err);
      setError('Failed to generate analysis. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveSession = async () => {
    const session: ContextAISession = {
      id: `context-ai-${Date.now()}`,
      date: new Date().toISOString(),
      problemStatement,
      causes,
      keyInsights,
      recommendations,
      linkedInsightId
    };

    // Generate insight from session (graceful degradation if it fails)
    try {
      const causesText = causes.map(c => `[${getQuadrantLabel(c.quadrant)}] ${c.text}`).join('\n');
      await generateInsightFromSession({
        wizardType: 'Context AI Root Cause',
        sessionId: session.id,
        sessionName: 'Context AI Root Cause Analysis',
        sessionReport: `Problem: ${problemStatement}\n\nRoot Causes:\n${causesText}\n\nKey Insights:\n${keyInsights}\n\nRecommendations:\n${recommendations}`,
        sessionSummary: `Context AI root cause analysis for: ${problemStatement}`,
        userId: '', // Anonymous users supported
        availablePractices: [],
        dataContext: {
          totalSessions: 1,
          sessionsInLastWeek: 1,
          existingInsights: 0,
        },
      });
    } catch (err) {
      console.error('[ContextAIRootCauseWizard] Insight generation failed:', err);
      // Continue regardless — insight generation is non-blocking
    }

    // Use the onSave callback if provided (from useWizardSessions hook)
    if (onSave) {
      onSave(session);
    } else {
      // Fallback to StorageManager for standalone usage
      const existingSessions = (StorageManager.getUntyped(STORAGE_KEY) as ContextAISession[]) || [];
      existingSessions.push(session);
      StorageManager.setUntyped(STORAGE_KEY, existingSessions);

      if (linkedInsightId && markInsightAsAddressed) {
        markInsightAsAddressed(linkedInsightId, 'Context AI Root Cause', session.id);
      }
    }

    return session;
  };

  const exportToMarkdown = () => {
    const markdown = `# Context AI Root Cause Analysis

**Date**: ${new Date().toLocaleDateString()}

## Problem Statement
${problemStatement}

## Root Causes by Quadrant

### Individual-Internal
${causes.filter(c => c.quadrant === 'individual-internal').map((c, i) => `${i + 1}. ${c.text}`).join('\n')}

### Individual-External
${causes.filter(c => c.quadrant === 'individual-external').map((c, i) => `${i + 1}. ${c.text}`).join('\n')}

### Collective-Internal
${causes.filter(c => c.quadrant === 'collective-internal').map((c, i) => `${i + 1}. ${c.text}`).join('\n')}

### Collective-External
${causes.filter(c => c.quadrant === 'collective-external').map((c, i) => `${i + 1}. ${c.text}`).join('\n')}

## Key Insights
${keyInsights}

## Recommendations
${recommendations}
`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `context-ai-analysis-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleNext = async () => {
    setError('');

    switch (currentStep) {
      case 'INTRODUCTION':
        setCurrentStep('DEFINE_PROBLEM');
        break;

      case 'DEFINE_PROBLEM':
        if (!problemStatement.trim()) {
          setError('Please provide a problem statement.');
          return;
        }
        await generateRootCauses();
        setCurrentStep('REVIEW_CAUSES');
        break;

      case 'REVIEW_CAUSES':
        if (causes.length === 0) {
          setError('Please generate or add at least one root cause.');
          return;
        }
        await generateAnalysis();
        setCurrentStep('ANALYZE');
        break;

      case 'ANALYZE':
        saveSession();
        setCurrentStep('COMPLETE');
        break;

      case 'COMPLETE':
        onClose();
        break;
    }
  };

  const handleBack = () => {
    setError('');
    switch (currentStep) {
      case 'DEFINE_PROBLEM':
        setCurrentStep('INTRODUCTION');
        break;
      case 'REVIEW_CAUSES':
        setCurrentStep('DEFINE_PROBLEM');
        break;
      case 'ANALYZE':
        setCurrentStep('REVIEW_CAUSES');
        break;
      case 'COMPLETE':
        setCurrentStep('ANALYZE');
        break;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-[#FAF8F5] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header - Editorial Style */}
        <div className="relative bg-[#1A2332] text-[#FAF8F5] p-6 border-b-4 border-[#E67E22]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close wizard"
          >
            <X size={24} />
          </button>
          <h1 className="text-3xl font-serif font-bold tracking-tight" style={{ fontFamily: 'Crimson Pro, serif' }}>
            Context AI Root Cause Analysis
          </h1>
          <p className="text-sm text-[#FAF8F5]/70 mt-2 font-sans" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>
            2×2 Quadrant Framework for Systemic Problem Analysis
          </p>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4 bg-[#FAF8F5]">
          <ProgressBar currentStep={currentStep} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#FAF8F5]">
          {/* Introduction */}
          {currentStep === 'INTRODUCTION' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="prose prose-slate max-w-none">
                <h2 className="text-2xl font-serif font-bold text-[#1A2332] mb-4" style={{ fontFamily: 'Crimson Pro, serif' }}>
                  Welcome to Context AI
                </h2>
                <p className="text-[#1A2332]/80 leading-relaxed font-sans" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>
                  This wizard uses the Context AI framework—a 2×2 quadrant model that maps root causes across two axes:
                </p>
                
                <div className="grid grid-cols-2 gap-4 my-6 not-prose">
                  <div className="bg-white border-2 border-[#1A2332]/10 rounded-lg p-4">
                    <div className="text-xs text-[#1A2332]/60 font-mono mb-1" style={{ fontFamily: 'Fira Code, monospace' }}>
                      INDIVIDUAL × INTERNAL
                    </div>
                    <div className="text-sm text-[#1A2332]/80">
                      Personal psychology, behaviors, skills, mindset
                    </div>
                  </div>
                  <div className="bg-white border-2 border-[#1A2332]/10 rounded-lg p-4">
                    <div className="text-xs text-[#1A2332]/60 font-mono mb-1" style={{ fontFamily: 'Fira Code, monospace' }}>
                      INDIVIDUAL × EXTERNAL
                    </div>
                    <div className="text-sm text-[#1A2332]/80">
                      Personal circumstances, external influences
                    </div>
                  </div>
                  <div className="bg-white border-2 border-[#1A2332]/10 rounded-lg p-4">
                    <div className="text-xs text-[#1A2332]/60 font-mono mb-1" style={{ fontFamily: 'Fira Code, monospace' }}>
                      COLLECTIVE × INTERNAL
                    </div>
                    <div className="text-sm text-[#1A2332]/80">
                      Organizational culture, systems, shared beliefs
                    </div>
                  </div>
                  <div className="bg-white border-2 border-[#1A2332]/10 rounded-lg p-4">
                    <div className="text-xs text-[#1A2332]/60 font-mono mb-1" style={{ fontFamily: 'Fira Code, monospace' }}>
                      COLLECTIVE × EXTERNAL
                    </div>
                    <div className="text-sm text-[#1A2332]/80">
                      Market forces, societal trends, industry dynamics
                    </div>
                  </div>
                </div>

                <p className="text-[#1A2332]/80 leading-relaxed">
                  By mapping root causes across all four quadrants, you'll uncover systemic patterns and identify high-leverage intervention points.
                </p>
              </div>
            </div>
          )}

          {/* Define Problem */}
          {currentStep === 'DEFINE_PROBLEM' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <h2 className="text-2xl font-serif font-bold text-[#1A2332]" style={{ fontFamily: 'Crimson Pro, serif' }}>
                Define the Problem
              </h2>
              <div>
                <label className="block text-sm font-medium text-[#1A2332]/80 mb-2 font-sans" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>
                  What problem or challenge do you want to analyze?
                </label>
                <textarea
                  value={problemStatement}
                  onChange={(e) => setProblemStatement(e.target.value)}
                  placeholder="e.g., Our team consistently misses project deadlines despite having sufficient resources..."
                  rows={6}
                  className="w-full px-4 py-3 bg-white border-2 border-[#1A2332]/20 rounded-lg focus:outline-none focus:border-[#E67E22] text-[#1A2332] placeholder:text-[#1A2332]/40 font-sans"
                  style={{ fontFamily: 'Source Sans 3, sans-serif' }}
                />
                <p className="text-xs text-[#1A2332]/60 mt-2 font-sans" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>
                  Be specific and concrete. Include context about the situation, stakeholders, and impact.
                </p>
              </div>
            </div>
          )}

          {/* Review Causes */}
          {currentStep === 'REVIEW_CAUSES' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-serif font-bold text-[#1A2332]" style={{ fontFamily: 'Crimson Pro, serif' }}>
                  Root Causes
                </h2>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="px-4 py-2 bg-[#1A2332] text-[#FAF8F5] rounded-lg hover:bg-[#1A2332]/90 transition-colors flex items-center gap-2 font-sans"
                  style={{ fontFamily: 'Source Sans 3, sans-serif' }}
                >
                  {React.createElement(getIconComponent('Sushumna') || 'div', { size: 16 })}
                  {editMode ? 'Done Editing' : 'Edit Causes'}
                </button>
              </div>

              {isGenerating && (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#E67E22] border-t-transparent"></div>
                  <p className="mt-4 text-[#1A2332]/60 font-sans" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>
                    Generating root causes across all quadrants...
                  </p>
                </div>
              )}

              {!isGenerating && (
                <div className="grid grid-cols-2 gap-4">
                  {(['individual-internal', 'individual-external', 'collective-internal', 'collective-external'] as const).map(quadrant => (
                    <div key={quadrant} className={`border-2 rounded-lg p-4 ${getQuadrantColor(quadrant)}`}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-serif font-bold text-[#1A2332] text-sm" style={{ fontFamily: 'Crimson Pro, serif' }}>
                          {getQuadrantLabel(quadrant)}
                        </h3>
                        {editMode && (
                          <button
                            onClick={() => addCause(quadrant)}
                            className="p-1 hover:bg-[#1A2332]/10 rounded transition-colors"
                          >
                            {React.createElement(getIconComponent('NeuralConvergence') || 'div', { size: 16, className: 'text-[#1A2332]' })}
                          </button>
                        )}
                      </div>
                      <div className="space-y-2">
                        {causes
                          .filter(c => c.quadrant === quadrant)
                          .map(cause => (
                            <div key={cause.id} className="bg-white/50 rounded p-3">
                              {editingCause === cause.id ? (
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    className="flex-1 px-2 py-1 border border-[#1A2332]/20 rounded text-sm font-sans"
                                    style={{ fontFamily: 'Source Sans 3, sans-serif' }}
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => updateCause(cause.id, editText)}
                                    className="p-1 hover:bg-green-100 rounded"
                                  >
                                    <Check size={16} className="text-green-600" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-sm text-[#1A2332] flex-1 font-sans" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>
                                    {cause.text}
                                  </p>
                                  {editMode && (
                                    <div className="flex gap-1">
                                      <button
                                        onClick={() => {
                                          setEditingCause(cause.id);
                                          setEditText(cause.text);
                                        }}
                                        className="p-1 hover:bg-[#1A2332]/10 rounded"
                                      >
                                        {React.createElement(getIconComponent('Sushumna') || 'div', { size: 14, className: 'text-[#1A2332]/60' })}
                                      </button>
                                      <button
                                        onClick={() => deleteCause(cause.id)}
                                        className="p-1 hover:bg-red-100 rounded"
                                      >
                                        {React.createElement(getIconComponent('Nigredo') || 'div', { size: 14, className: 'text-red-600' })}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        {causes.filter(c => c.quadrant === quadrant).length === 0 && (
                          <p className="text-xs text-[#1A2332]/40 italic font-sans" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>
                            No causes in this quadrant yet
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Analyze */}
          {currentStep === 'ANALYZE' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <h2 className="text-2xl font-serif font-bold text-[#1A2332]" style={{ fontFamily: 'Crimson Pro, serif' }}>
                Analysis & Recommendations
              </h2>

              {isGenerating ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#E67E22] border-t-transparent"></div>
                  <p className="mt-4 text-[#1A2332]/60 font-sans" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>
                    Synthesizing insights across quadrants...
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-white border-2 border-[#1A2332]/10 rounded-lg p-6">
                    <h3 className="text-lg font-serif font-bold text-[#1A2332] mb-3" style={{ fontFamily: 'Crimson Pro, serif' }}>
                      Key Insights
                    </h3>
                    <div className="prose prose-slate max-w-none">
                      <p className="text-[#1A2332]/80 whitespace-pre-wrap font-sans" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>
                        {keyInsights}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-[#E67E22]/30 rounded-lg p-6">
                    <h3 className="text-lg font-serif font-bold text-[#1A2332] mb-3" style={{ fontFamily: 'Crimson Pro, serif' }}>
                      Actionable Recommendations
                    </h3>
                    <div className="prose prose-slate max-w-none">
                      <p className="text-[#1A2332]/80 whitespace-pre-wrap font-sans" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>
                        {recommendations}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={exportToMarkdown}
                      className="px-4 py-2 bg-[#1A2332] text-[#FAF8F5] rounded-lg hover:bg-[#1A2332]/90 transition-colors flex items-center gap-2 font-sans"
                      style={{ fontFamily: 'Source Sans 3, sans-serif' }}
                    >
                      {React.createElement(getIconComponent('Tesseract') || 'div', { size: 16 })}
                      Export to Markdown
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Complete */}
          {currentStep === 'COMPLETE' && (
            <div className="text-center space-y-6 max-w-2xl mx-auto py-12">
              <div className="w-16 h-16 bg-[#E67E22] rounded-full flex items-center justify-center mx-auto">
                <Check size={32} className="text-white" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-[#1A2332]" style={{ fontFamily: 'Crimson Pro, serif' }}>
                Analysis Complete!
              </h2>
              <p className="text-[#1A2332]/70 font-sans" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>
                Your Context AI root cause analysis has been saved. You can export it or return to review your insights.
              </p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <p className="text-red-800 text-sm font-sans" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>
                {error}
              </p>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="bg-white border-t-2 border-[#1A2332]/10 p-6 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 'INTRODUCTION' || isGenerating}
            className="px-6 py-2 border-2 border-[#1A2332] text-[#1A2332] rounded-lg hover:bg-[#1A2332]/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-sans"
            style={{ fontFamily: 'Source Sans 3, sans-serif' }}
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={isGenerating}
            className="px-6 py-2 bg-[#E67E22] text-white rounded-lg hover:bg-[#E67E22]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-sans"
            style={{ fontFamily: 'Source Sans 3, sans-serif' }}
          >
            {currentStep === 'COMPLETE' ? 'Close' : 'Next'}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
