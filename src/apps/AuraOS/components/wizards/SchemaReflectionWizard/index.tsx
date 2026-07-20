/**
 * Schema Reflection Wizard
 * Full-screen 7-step guided exploration of emotional schemas with AI analysis and chat.
 * Design: stone-950 base, amber primary, violet secondary accent for depth psychology.
 * AI voice: "MIRROR"
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronRight, ChevronLeft, Save, Loader2, Eye, Layers, Search, MessageCircle, FileText, Compass, Scan } from 'lucide-react';
import {
  SchemaReflectionSession,
  generateStructuredQuestions,
  analyzeSchemaResponses,
  getSchemaExplorationResponse,
  saveSchemaReflectionSession,
  createNewSession,
  calculatePrimarySchema,
  SchemaResonance,
  QuestionResponse,
  AIAnalysisResult,
  ChatMessage
} from '../../../services/schemaReflectionService';
import { schemas } from './schemaContent';
import { StorageManager } from '../../../.claude/lib/storageManager.ts';
import SchemaIntro from './SchemaIntro';
import SchemaBrowser from './SchemaBrowser';
import SchemaDeepDive from './SchemaDeepDive';
import SchemaReflection from './SchemaReflection';
import SchemaQuestions from './SchemaQuestions';
import SchemaAnalysis from './SchemaAnalysis';
import SchemaChat from './SchemaChat';
import SchemaSummary from './SchemaSummary';

type Step = 'intro' | 'browse' | 'deep_dive' | 'questions' | 'analysis' | 'chat' | 'reflection' | 'summary';

interface SchemaReflectionWizardProps {
  onClose: () => void;
  userId: string;
}

const STEP_META = [
  { label: 'Introduction', icon: Compass, desc: 'Understanding emotional schemas' },
  { label: 'Exploration', icon: Layers, desc: 'Browse and select patterns' },
  { label: 'Deep Dive', icon: Search, desc: 'Rate resonance with each schema' },
  { label: 'Questions', icon: Eye, desc: 'Structured self-inquiry' },
  { label: 'Analysis', icon: Scan, desc: 'AI-generated pattern insights' },
  { label: 'Dialogue', icon: MessageCircle, desc: 'Explore with the mirror' },
  { label: 'Summary', icon: FileText, desc: 'Your schema portrait' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepRail({ current }: { current: number }) {
  return (
    <div className="flex flex-col gap-1 py-2">
      {STEP_META.map((meta, i) => {
        const Icon = meta.icon;
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${active ? 'bg-amber-500/10 border border-amber-500/20' : done ? 'opacity-60' : 'opacity-30'}`}>
            <div className={`shrink-0 ${active ? 'text-amber-400' : done ? 'text-amber-600' : 'text-stone-600'}`}>
              <Icon size={18} />
            </div>
            <div className="min-w-0">
              <p className={`text-xs font-semibold font-serif truncate ${active ? 'text-amber-300' : done ? 'text-stone-400' : 'text-stone-600'}`}>
                {meta.label}
              </p>
              {active && <p className="text-[10px] text-stone-500 leading-tight mt-0.5">{meta.desc}</p>}
            </div>
            {done && <div className="ml-auto shrink-0 w-1.5 h-1.5 rounded-full bg-amber-600" />}
          </div>
        );
      })}
    </div>
  );
}

export default function SchemaReflectionWizard({
  onClose,
  userId
}: SchemaReflectionWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>('intro');
  const [session, setSession] = useState<SchemaReflectionSession | null>(null);
  const [selectedSchemas, setSelectedSchemas] = useState<Map<string, number>>(new Map());
  const [currentSchemaIndex, setCurrentSchemaIndex] = useState(0);
  const [reflectionText, setReflectionText] = useState('');
  const [reflectionQuestions, setReflectionQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Enhanced assessment state
  const [structuredQuestions, setStructuredQuestions] = useState<QuestionResponse[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Map<string, QuestionResponse>>(new Map());
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Scroll to top on step change
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [currentStep, currentSchemaIndex, currentQuestionIndex]);

  // Initialize from storage on mount
  useEffect(() => {
    const saved = StorageManager.getUntyped('aura-schema-reflection-session');
    if (saved) {
      try {
        const savedSession = saved as SchemaReflectionSession;
        setSession(savedSession);
        const schemaMap = new Map<string, number>();
        savedSession.explored_schemas.forEach(e => {
          schemaMap.set(e.schema_id, e.resonance_rating);
        });
        setSelectedSchemas(schemaMap);
        setReflectionText(savedSession.reflection_text);
        setReflectionQuestions(savedSession.reflection_prompts);

        if (savedSession.reflection_responses) {
          const responseMap = new Map<string, QuestionResponse>();
          savedSession.reflection_responses.forEach(r => {
            responseMap.set(r.questionId, r);
          });
          setResponses(responseMap);
        }
        if (savedSession.ai_analysis) setAiAnalysis(savedSession.ai_analysis);
        if (savedSession.chat_history) setChatMessages(savedSession.chat_history);
      } catch (error) {
        console.error('[SchemaReflectionWizard] Error loading saved session:', error);
        setSession(createNewSession());
      }
    } else {
      setSession(createNewSession());
    }
  }, []);

  // Save session to storage whenever it changes
  useEffect(() => {
    if (session) {
      try {
        StorageManager.setUntyped('aura-schema-reflection-session', session);
      } catch (error) {
        console.error('[SchemaReflectionWizard] Error saving session:', error);
      }
    }
  }, [session]);

  // Auto-save structured questions
  useEffect(() => {
    if (structuredQuestions.length > 0 && session) {
      try {
        const draft = { ...session, reflection_prompts: structuredQuestions.map(q => q.question) };
        StorageManager.setUntyped('aura-schema-reflection-session', draft);
      } catch (error) {
        console.error('[SchemaReflectionWizard] Error saving questions:', error);
      }
    }
  }, [structuredQuestions]);

  // Auto-save responses with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (responses.size > 0 && session) {
        try {
          const draft = { ...session, reflection_responses: Array.from(responses.values()) };
          StorageManager.setUntyped('aura-schema-reflection-session', draft);
        } catch (error) {
          console.error('[SchemaReflectionWizard] Error saving responses:', error);
        }
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [responses, session]);

  // Auto-save analysis
  useEffect(() => {
    if (aiAnalysis && session) {
      try {
        const draft = { ...session, ai_analysis: aiAnalysis };
        StorageManager.setUntyped('aura-schema-reflection-session', draft);
      } catch (error) {
        console.error('[SchemaReflectionWizard] Error saving analysis:', error);
      }
    }
  }, [aiAnalysis, session]);

  // Auto-save chat history
  useEffect(() => {
    if (chatMessages.length > 0 && session) {
      try {
        const draft = { ...session, chat_history: chatMessages };
        StorageManager.setUntyped('aura-schema-reflection-session', draft);
      } catch (error) {
        console.error('[SchemaReflectionWizard] Error saving chat history:', error);
      }
    }
  }, [chatMessages, session]);

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleSchemaToggle = (schema_id: string, selected: boolean) => {
    const newMap = new Map(selectedSchemas);
    if (selected && !newMap.has(schema_id)) {
      newMap.set(schema_id, 3);
    } else if (!selected && newMap.has(schema_id)) {
      newMap.delete(schema_id);
    }
    setSelectedSchemas(newMap);
  };

  const handleRating = (schema_id: string, rating: 1 | 2 | 3 | 4 | 5) => {
    const newMap = new Map(selectedSchemas);
    newMap.set(schema_id, rating);
    setSelectedSchemas(newMap);
  };

  const handleReflectionChange = (text: string) => setReflectionText(text);

  const handleResponseChange = (questionId: string, text: string) => {
    const newResponses = new Map(responses);
    const question = structuredQuestions.find(q => q.questionId === questionId);
    if (question) {
      newResponses.set(questionId, {
        ...question,
        response: text,
        timestamp: new Date().toISOString()
      });
    }
    setResponses(newResponses);
  };

  const handleSendChatMessage = async (message: string) => {
    if (!aiAnalysis) return;
    const userMessage: ChatMessage = { role: 'user', text: message, timestamp: new Date().toISOString() };
    setChatMessages(prev => [...prev, userMessage]);
    setIsChatLoading(true);

    try {
      const schema = schemas.find(s => s.schema_id === session?.primary_schema);
      if (schema) {
        const response = await getSchemaExplorationResponse(
          [...chatMessages, userMessage], message, schema, aiAnalysis, Array.from(responses.values())
        );
        setChatMessages(prev => [...prev, { role: 'assistant', text: response.message, timestamp: new Date().toISOString() }]);
      }
    } catch (err) {
      console.error('[SchemaReflectionWizard] Chat error:', err);
      setChatMessages(prev => [...prev, { role: 'assistant', text: 'I encountered an issue. Please try again.', timestamp: new Date().toISOString() }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const getSelectedSchemasList = (): SchemaResonance[] => {
    return Array.from(selectedSchemas.entries()).map(([schema_id, rating]) => ({
      schema_id,
      resonance_rating: rating as 1 | 2 | 3 | 4 | 5
    }));
  };

  // ─── Navigation ──────────────────────────────────────────────────────────────

  const handleNext = async () => {
    setError('');

    switch (currentStep) {
      case 'intro':
        setCurrentStep('browse');
        break;

      case 'browse':
        if (selectedSchemas.size === 0) {
          setError('Please select at least one schema to continue');
          return;
        }
        setCurrentStep('deep_dive');
        setCurrentSchemaIndex(0);
        break;

      case 'deep_dive': {
        const selected = getSelectedSchemasList();
        if (currentSchemaIndex < selected.length - 1) {
          setCurrentSchemaIndex(currentSchemaIndex + 1);
        } else {
          const primarySchema = calculatePrimarySchema(selected);
          setSession(prev => prev ? { ...prev, explored_schemas: selected, primary_schema: primarySchema } : null);
          setIsLoading(true);
          const schema = schemas.find(s => s.schema_id === primarySchema);
          if (schema) {
            const questions = await generateStructuredQuestions(
              schema.schema_id, schema.plain_name, schema.full_description, schema.common_origins, schema.example_manifestations
            );
            setStructuredQuestions(questions);
            setCurrentQuestionIndex(0);
            setResponses(new Map());
          }
          setIsLoading(false);
          setCurrentStep('questions');
        }
        break;
      }

      case 'questions': {
        const allAnswered = structuredQuestions.every(q => {
          const response = responses.get(q.questionId);
          return response && response.response && response.response.trim().length > 0;
        });
        if (!allAnswered) {
          setError('Please select an answer for each question.');
          return;
        }
        setCurrentStep('analysis');
        setIsAnalyzing(true);

        try {
          const schema = schemas.find(s => s.schema_id === session?.primary_schema);
          const primaryRating = session?.explored_schemas.find(e => e.schema_id === session?.primary_schema)?.resonance_rating || 3;
          if (schema) {
            const analysis = await analyzeSchemaResponses(schema, Array.from(responses.values()), primaryRating);
            setAiAnalysis(analysis);
          }
        } catch (err) {
          console.error('[SchemaReflectionWizard] Analysis generation error:', err);
          setError('Failed to generate analysis. Please try again.');
        } finally {
          setIsAnalyzing(false);
        }
        break;
      }

      case 'analysis':
        if (aiAnalysis) {
          const schema = schemas.find(s => s.schema_id === session?.primary_schema);
          const greeting: ChatMessage = {
            role: 'assistant',
            text: `I've reflected on your responses about ${schema?.plain_name || 'this pattern'}. The key themes that emerged are: ${aiAnalysis.key_themes.slice(0, 2).join(', ')}. What would you like to explore first?`,
            timestamp: new Date().toISOString()
          };
          setChatMessages([greeting]);
          setCurrentStep('chat');
        }
        break;

      case 'chat':
        if (!session) break;

        const finalSession: SchemaReflectionSession = {
          ...session,
          explored_schemas: getSelectedSchemasList(),
          primary_schema: calculatePrimarySchema(getSelectedSchemasList()),
          reflection_prompts: structuredQuestions.map(q => q.question),
          reflection_responses: Array.from(responses.values()),
          ai_analysis: aiAnalysis || undefined,
          chat_history: chatMessages,
          reflection_text: '',
          completed: true
        };

        setIsLoading(true);
        try {
          const success = await saveSchemaReflectionSession(finalSession, userId);
          setIsLoading(false);
          if (success) {
            setSession(finalSession);
            setCurrentStep('summary');
          } else {
            setError('Failed to save session. Please try again.');
          }
        } catch (err) {
          console.error('[SchemaReflectionWizard] Save error:', err);
          setError('Failed to save session. Please try again.');
          setIsLoading(false);
        }
        break;

      case 'summary':
        StorageManager.delete('aura-schema-reflection-session');
        onClose();
        break;

      case 'reflection':
        if (!session) break;
        const legacySession: SchemaReflectionSession = {
          ...session,
          explored_schemas: getSelectedSchemasList(),
          primary_schema: calculatePrimarySchema(getSelectedSchemasList()),
          reflection_prompts: reflectionQuestions,
          reflection_text: reflectionText,
          completed: true
        };
        setIsLoading(true);
        const success = await saveSchemaReflectionSession(legacySession, userId);
        setIsLoading(false);
        if (success) {
          setSession(legacySession);
          setCurrentStep('summary');
        } else {
          setError('Failed to save reflection. Please try again.');
        }
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'browse': setCurrentStep('intro'); break;
      case 'deep_dive':
        if (currentSchemaIndex > 0) setCurrentSchemaIndex(currentSchemaIndex - 1);
        else setCurrentStep('browse');
        break;
      case 'questions':
        if (currentQuestionIndex > 0) setCurrentQuestionIndex(currentQuestionIndex - 1);
        else { setCurrentStep('deep_dive'); setCurrentSchemaIndex(getSelectedSchemasList().length - 1); }
        break;
      case 'analysis': setCurrentStep('questions'); setCurrentQuestionIndex(structuredQuestions.length - 1); break;
      case 'chat': setCurrentStep('analysis'); break;
      case 'summary': setCurrentStep('chat'); break;
      case 'reflection': setCurrentStep('deep_dive'); setCurrentSchemaIndex(getSelectedSchemasList().length - 1); break;
    }
  };

  const getStepIndex = (): number => {
    const steps: Step[] = ['intro', 'browse', 'deep_dive', 'questions', 'analysis', 'chat', 'summary'];
    const index = steps.indexOf(currentStep);
    return index >= 0 ? index : 0;
  };

  const getNextButtonText = (): string => {
    if (currentStep === 'intro') return 'Begin Exploration';
    if (currentStep === 'browse') return `Continue with ${selectedSchemas.size}`;
    if (currentStep === 'deep_dive') {
      const selected = getSelectedSchemasList();
      return currentSchemaIndex < selected.length - 1 ? 'Next Schema' : 'Continue';
    }
    if (currentStep === 'questions') {
      return currentQuestionIndex < structuredQuestions.length - 1 ? 'Next Question' : 'Analyse Responses';
    }
    if (currentStep === 'analysis') return isAnalyzing ? 'Analysing…' : 'Continue to Dialogue';
    if (currentStep === 'chat') return 'Save & Complete';
    if (currentStep === 'reflection') return 'Save & Complete';
    if (currentStep === 'summary') return 'Finish';
    return 'Continue';
  };

  const isAiStep = () => {
    return currentStep === 'questions' && currentQuestionIndex >= structuredQuestions.length - 1;
  };

  // ─── Sidebar marginalia ──────────────────────────────────────────────────────

  const renderMarginalia = () => {
    const items: { label: string; value: string }[] = [];

    if (selectedSchemas.size > 0) {
      const schemaNames = Array.from(selectedSchemas.keys()).map(id => {
        const s = schemas.find(x => x.schema_id === id);
        return s?.plain_name || id;
      });
      items.push({ label: 'Selected schemas', value: schemaNames.join(', ') });
    }

    if (session?.primary_schema) {
      const primary = schemas.find(s => s.schema_id === session.primary_schema);
      if (primary) items.push({ label: 'Primary pattern', value: primary.plain_name });
    }

    const highestRating = Array.from(selectedSchemas.values()).sort((a, b) => b - a)[0];
    if (highestRating) items.push({ label: 'Peak resonance', value: `${highestRating}/5` });

    if (responses.size > 0) items.push({ label: 'Questions answered', value: `${responses.size}/${structuredQuestions.length}` });

    if (aiAnalysis?.key_themes?.[0]) items.push({ label: 'Key theme', value: aiAnalysis.key_themes[0].slice(0, 60) });

    if (items.length === 0) return null;

    return (
      <div className="mt-auto pt-4 border-t border-stone-800/50 space-y-2">
        {items.map((item, i) => (
          <div key={i}>
            <p className="text-[10px] text-stone-600 uppercase tracking-widest mb-0.5">{item.label}</p>
            <p className="text-xs text-amber-400/80 truncate">{item.value}</p>
          </div>
        ))}
      </div>
    );
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-stretch bg-stone-950/95 backdrop-blur-md" role="dialog" aria-modal="true">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-amber-500/4 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-violet-800/5 blur-[80px] rounded-full" />
      </div>

      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-stone-950 border-r border-stone-800/60 p-5">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="text-amber-500/70"><Layers size={20} /></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Mind Practice</span>
          </div>
          <h1 className="text-lg font-serif font-light text-stone-200 leading-tight">Schema<br />Reflection</h1>
        </div>

        <StepRail current={getStepIndex()} />
        {renderMarginalia()}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-5 py-3 border-b border-stone-800/60 shrink-0">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="text-amber-500/60">
              {React.createElement(STEP_META[getStepIndex()].icon, { size: 16 })}
            </div>
            <span className="text-xs text-stone-400 font-serif">{STEP_META[getStepIndex()].label}</span>
          </div>
          <div className="hidden lg:flex items-center gap-2">
            <span className="text-xs text-stone-500">Step {getStepIndex() + 1} of {STEP_META.length}</span>
            <div className="flex gap-1">
              {STEP_META.map((_, i) => (
                <div key={i} className={`h-0.5 w-6 rounded-full transition-all ${i <= getStepIndex() ? 'bg-amber-500' : 'bg-stone-800'}`} />
              ))}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-stone-500 hover:text-stone-200 hover:bg-stone-800/60 transition-all" aria-label="Close">
            <X size={18} />
          </button>
        </header>

        {/* Content */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-5 py-8">
            {/* Error banner */}
            {error && (
              <div className="mb-5 p-3 bg-red-950/30 border border-red-500/30 rounded-xl text-xs text-red-300">{error}</div>
            )}

            {/* Intro banner */}
            {currentStep === 'intro' && (
              <div className="mb-5 bg-violet-950/20 border border-violet-500/15 rounded-xl p-4">
                <p className="text-sm text-stone-400 leading-relaxed">
                  This wizard explores emotional patterns called schemas — blueprints formed in childhood that shape how we relate to ourselves and others. This is for reflection only, not diagnosis.
                </p>
              </div>
            )}

            {currentStep === 'intro' && <SchemaIntro />}

            {currentStep === 'browse' && (
              <SchemaBrowser
                schemas={schemas}
                selectedSchemas={selectedSchemas}
                onToggle={handleSchemaToggle}
              />
            )}

            {currentStep === 'deep_dive' && (
              <SchemaDeepDive
                schemas={schemas}
                selectedSchemas={getSelectedSchemasList()}
                currentIndex={currentSchemaIndex}
                onRating={handleRating}
              />
            )}

            {currentStep === 'questions' && session && (() => {
              const schema = schemas.find(s => s.schema_id === session.primary_schema);
              if (!schema) return null;
              return (
                <SchemaQuestions
                  schema={schema}
                  questions={structuredQuestions}
                  currentIndex={currentQuestionIndex}
                  onResponseChange={handleResponseChange}
                  onNext={() => {
                    if (currentQuestionIndex < structuredQuestions.length - 1) {
                      setCurrentQuestionIndex(currentQuestionIndex + 1);
                    } else {
                      handleNext();
                    }
                  }}
                  onBack={() => {
                    if (currentQuestionIndex > 0) {
                      setCurrentQuestionIndex(currentQuestionIndex - 1);
                    }
                  }}
                />
              );
            })()}

            {currentStep === 'analysis' && session && (() => {
              const schema = schemas.find(s => s.schema_id === session.primary_schema);
              if (!schema) return null;
              return (
                <SchemaAnalysis
                  schema={schema}
                  analysis={aiAnalysis || {
                    key_themes: [],
                    severity_assessment: '',
                    protective_strategies: [],
                    comparison_to_typical: '',
                    personalized_recommendations: [],
                    raw_analysis: '',
                    generated_at: new Date().toISOString()
                  }}
                  isLoading={isAnalyzing}
                />
              );
            })()}

            {currentStep === 'chat' && session && (() => {
              const schema = schemas.find(s => s.schema_id === session.primary_schema);
              if (!schema) return null;
              return (
                <SchemaChat
                  schema={schema}
                  analysis={aiAnalysis || {
                    key_themes: [],
                    severity_assessment: '',
                    protective_strategies: [],
                    comparison_to_typical: '',
                    personalized_recommendations: [],
                    raw_analysis: '',
                    generated_at: new Date().toISOString()
                  }}
                  messages={chatMessages}
                  onSendMessage={handleSendChatMessage}
                  isLoading={isChatLoading}
                />
              );
            })()}

            {currentStep === 'reflection' && session && (() => {
              const schema = schemas.find(s => s.schema_id === session.primary_schema);
              if (!schema) return null;
              return (
                <SchemaReflection
                  schema={schema}
                  questions={reflectionQuestions}
                  reflectionText={reflectionText}
                  onReflectionChange={handleReflectionChange}
                />
              );
            })()}

            {currentStep === 'summary' && session && (
              <SchemaSummary
                session={session}
                schemas={schemas}
                onClose={onClose}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="shrink-0 border-t border-stone-800/60 px-5 py-3 flex items-center justify-between bg-stone-950/80">
          <button
            onClick={handleBack}
            disabled={currentStep === 'intro' || isLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-stone-400 hover:text-stone-200 hover:bg-stone-800/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={16} /> Back
          </button>

          <div className="flex items-center gap-3">
            {currentStep === 'summary' ? (
              <button
                onClick={() => { StorageManager.delete('aura-schema-reflection-session'); onClose(); }}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-stone-950 transition-all shadow-lg shadow-amber-900/30"
              >
                <Save size={16} /> Finish
              </button>
            ) : currentStep === 'chat' ? (
              <button
                onClick={handleNext}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-stone-950 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-900/30"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save session
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={isLoading || isAnalyzing}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-900/20"
              >
                {(isLoading || isAnalyzing) ? <Loader2 size={16} className="animate-spin" /> : null}
                {getNextButtonText()}
                {!isLoading && !isAnalyzing && <ChevronRight size={16} />}
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
