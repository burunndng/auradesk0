import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { BigMindSession, BigMindMessage, BigMindVoice, BigMindStage, IntegratedInsight } from '../../types.ts';
import { X, ArrowLeft, ArrowRight, Lightbulb, Plus, Send, Settings, Compass, UserCircle, Save } from 'lucide-react';
import { MerkabaIcon, ConsciousNodeIcon } from '../../components/visualizations/SacredGeometryIcons';
import { generateBigMindResponse, summarizeBigMindSession, getDefaultVoices, createBigMindIntegratedInsight, getAvailableProviders, getBestProvider, BigMindProvider } from '../../services/bigMindService.ts';
import { insightDatabaseService } from '../../services/insightDatabaseService.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { typography, effects, theme, buttonSystem } from '../../theme.ts';
import { DisclaimerBanner } from '../shared/DisclaimerBanner';
import SafetyBanner from '../shared/SafetyBanner';
import { detectCrisisLevel } from '../../utils/crisisDetection';

interface BigMindProcessWizardProps {
  onClose: (draft?: Partial<BigMindSession>) => void;
  onSave: (session: BigMindSession) => void;
  session: Partial<BigMindSession> | null;
  practiceStack: string[];
  completionHistory: Record<string, string[]>;
  addPracticeToStack: (practiceId: string) => void;
  userId: string;
  insightContext?: IntegratedInsight | null;
  markInsightAsAddressed: (insightId: string, wizardType: string, sessionId: string) => void;
}

const STAGE_ORDER: BigMindStage[] = ['VOICE_ID', 'VOICE_DIALOGUE', 'WITNESS', 'INTEGRATION', 'REFLECTION', 'SUMMARY'];

const STAGE_LABELS: Record<BigMindStage, string> = {
  VOICE_ID: 'Voices',
  VOICE_DIALOGUE: 'Dialogue',
  WITNESS: 'Witness',
  INTEGRATION: 'Unity',
  REFLECTION: 'Reflection',
  SUMMARY: 'Insight'
};

const STAGE_DESCRIPTIONS: Record<BigMindStage, string> = {
  VOICE_ID: 'Identify the inner archetypes seeking your attention.',
  VOICE_DIALOGUE: 'Speak directly as these voices to discover their needs and fears.',
  WITNESS: 'Shift into the vast, compassion-filled awareness that observes all.',
  INTEGRATION: 'Synthesize the polarities into a single, cohesive movement.',
  REFLECTION: 'Articulate what shifted in how you see these voices and yourself.',
  SUMMARY: 'Integrate the session into your daily practice stack.'
};

export default function BigMindProcessWizard({
  onClose,
  onSave,
  session: draft,
  practiceStack,
  completionHistory,
  addPracticeToStack,
  userId,
  insightContext,
  markInsightAsAddressed
}: BigMindProcessWizardProps) {
  const [session, setSession] = useState<Partial<BigMindSession>>(() => {
    return draft || {
      voices: getDefaultVoices(),
      messages: [],
      currentStage: 'VOICE_ID'
    };
  });

  const [currentStageIndex, setCurrentStageIndex] = useState(() => {
    // Resume from draft if available
    if (draft?.currentStage) {
      const idx = STAGE_ORDER.indexOf(draft.currentStage);
      return idx >= 0 ? idx : 0;
    }
    return 0;
  });
  const [userInput, setUserInput] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<string | undefined>(session.voices?.[0]?.name);
  const [newVoiceName, setNewVoiceName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<BigMindProvider>(() => getBestProvider());
  const [showProviderSettings, setShowProviderSettings] = useState(false);
  const [linkedInsightId, setLinkedInsightId] = useState<string | undefined>(draft?.linkedInsightId || insightContext?.id);
  const [crisisLevel, setCrisisLevel] = useState<'none' | 'concern' | 'high'>('none');
  const [reflectionText, setReflectionText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentStage = STAGE_ORDER[currentStageIndex] || 'VOICE_ID';

  useEffect(() => {
    setSession(prev => ({ ...prev, currentStage }));
  }, [currentStage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.messages]);

  // Sync linkedInsightId with insightContext changes
  useEffect(() => {
    if (insightContext && linkedInsightId !== insightContext.id) {
      setLinkedInsightId(insightContext.id);
    }
  }, [insightContext, linkedInsightId]);

  const handleAddVoice = () => {
    if (!newVoiceName.trim()) return;

    const newVoice: BigMindVoice = {
      id: `voice-${Date.now()}`,
      name: newVoiceName,
      isDefault: false
    };

    setSession(prev => ({
      ...prev,
      voices: [...(prev.voices || []), newVoice]
    }));

    setSelectedVoice(newVoiceName);
    setNewVoiceName('');
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    // Check for crisis indicators in user input
    const level = detectCrisisLevel(userInput);
    setCrisisLevel(level);

    const userMessage: BigMindMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: userInput,
      voiceName: selectedVoice,
      timestamp: new Date().toISOString(),
      stage: currentStage
    };

    const updatedMessages = [...(session.messages || []), userMessage];
    setSession(prev => ({ ...prev, messages: updatedMessages }));
    setUserInput('');
    setIsStreaming(true);
    setError(null);

    // Stream the witness response
    let streamedText = '';

    const result = await generateBigMindResponse({
      conversation: updatedMessages,
      stage: currentStage,
      activeVoice: selectedVoice,
      voices: session.voices || [],
      provider: selectedProvider,
      insightContext,
      onStreamChunk: (chunk) => {
        streamedText += chunk;
        // Update the UI with streaming chunks
        setSession(prev => {
          const messages = prev.messages || [];
          const lastMessage = messages[messages.length - 1];

          if (lastMessage?.role === 'witness' && lastMessage?.isStreaming) {
            return {
              ...prev,
              messages: [
                ...messages.slice(0, -1),
                { ...lastMessage, text: streamedText }
              ]
            };
          }

          if (lastMessage?.role !== 'witness' || !lastMessage?.isStreaming) {
            const newWitnessMsg: BigMindMessage = {
              id: `msg-stream-${Date.now()}`,
              role: 'witness',
              text: chunk,
              timestamp: new Date().toISOString(),
              stage: currentStage,
              isStreaming: true
            };
            return {
              ...prev,
              messages: [...messages, newWitnessMsg]
            };
          }

          return prev;
        });
      }
    });

    setIsStreaming(false);

    if (result.success) {
      setSession(prev => {
        const messages = prev.messages || [];
        const lastMessage = messages[messages.length - 1];

        // Convert streaming message to final or add new one
        if (lastMessage?.role === 'witness' && lastMessage?.isStreaming) {
          return {
            ...prev,
            messages: [
              ...messages.slice(0, -1),
              { ...lastMessage, text: result.text, isStreaming: false }
            ]
          };
        }

        const witnessMessage: BigMindMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'witness',
          text: result.text,
          timestamp: new Date().toISOString(),
          stage: currentStage,
          isStreaming: false
        };

        return {
          ...prev,
          messages: [...messages, witnessMessage]
        };
      });
    } else {
      setError(result.error || 'Failed to generate response');
    }
  };

  const handleNavigateToStage = (targetIndex: number) => {
    // Allow navigation backwards freely
    if (targetIndex < currentStageIndex) {
      setCurrentStageIndex(targetIndex);
      return;
    }

    // For forward navigation, use the standard transition
    if (targetIndex === currentStageIndex + 1) {
      handleStageTransition('next');
    }
  };

  const handleStageTransition = async (direction: 'next' | 'prev') => {
    if (direction === 'next') {
      if (currentStageIndex === STAGE_ORDER.length - 2) {
        // Before summary, generate session summary (passes reflection text)
        setIsLoading(true);
        try {
          const sessionWithReflection = {
            ...session,
            reflectionText
          } as BigMindSession & { reflectionText: string };

          const summary = await summarizeBigMindSession(
            sessionWithReflection,
            practiceStack,
            completionHistory,
            selectedProvider,
            reflectionText
          );

          setSession(prev => ({
            ...prev,
            summary
          }));
        } catch (e) {
          console.error('Error generating summary:', e);
          setError('Could not generate summary. Proceeding anyway.');
        } finally {
          setIsLoading(false);
          setCurrentStageIndex(currentStageIndex + 1);
        }
      } else {
        setCurrentStageIndex(currentStageIndex + 1);
      }
    } else {
      setCurrentStageIndex(Math.max(0, currentStageIndex - 1));
    }
  };

  const handleFinish = () => {
    const finalSession: BigMindSession = {
      id: session.id || `bigmind-${Date.now()}`,
      date: session.date || new Date().toISOString(),
      currentStage: currentStage,
      voices: session.voices || [],
      messages: session.messages || [],
      summary: session.summary,
      linkedInsightId,
      completedAt: new Date().toISOString()
    };

    onSave(finalSession);
    handleComplete(finalSession);
  };

  const handleComplete = async (finalSession: BigMindSession) => {
    try {
      // Create and save integrated insight if summary exists
      if (finalSession.summary) {
        const insight = createBigMindIntegratedInsight(finalSession.id, finalSession.summary);
        await insightDatabaseService.saveInsight(userId, insight);
        console.log('[BigMindProcessWizard] Insight saved to database');
      }

      // Mark Intelligence Hub insight as addressed
      if (linkedInsightId) {
        markInsightAsAddressed(linkedInsightId, 'Big Mind Process', finalSession.id || '');
      }
    } catch (err) {
      console.error('[BigMindProcessWizard] Completion error:', err);
    }
  };

  const handleAddPracticeToStack = (practiceId: string) => {
    if (!practiceStack.includes(practiceId)) {
      addPracticeToStack(practiceId);
    }
  };

  const canProceedToNextStage = (): boolean => {
    if (currentStage === 'VOICE_ID') {
      return (session.voices?.length || 0) >= 2;
    }
    if (currentStage === 'VOICE_DIALOGUE') {
      return (session.messages?.length || 0) >= 3;
    }
    if (currentStage === 'REFLECTION') {
      return reflectionText.trim().length >= 20;
    }
    return true;
  };

  const renderStageContent = () => {
    switch (currentStage) {
      case 'VOICE_ID':
        return (
          <div className="space-y-8 py-4">
            <div className="animate-fade-in">
              <div className="flex items-center gap-2 mb-6">
                <ConsciousNodeIcon size={20} className="text-purple-500" />
                <h3 className={`${typography.h4} text-stone-100 font-serif italic`}>Identified Voices</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {(session.voices || []).map(voice => (
                  <motion.div
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice.name)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${selectedVoice === voice.name
                      ? 'border-purple-500/50 bg-purple-500/10 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                      : 'border-stone-800 bg-stone-900/40 hover:border-stone-700'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${selectedVoice === voice.name ? 'border-purple-500/40 bg-purple-500/20' : 'border-stone-700 bg-stone-800'}`}>
                        <ConsciousNodeIcon size={14} className={selectedVoice === voice.name ? 'text-purple-400' : 'text-stone-500'} />
                      </div>
                      <div>
                        <div className="font-semibold text-stone-100">{voice.name}</div>
                        {voice.description && <div className="text-xs text-stone-500 italic mt-0.5">{voice.description}</div>}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex gap-2">
                <label htmlFor="new-voice-input" className="sr-only">
                  Add a new voice
                </label>
                <input
                  id="new-voice-input"
                  type="text"
                  value={newVoiceName}
                  onChange={(e) => setNewVoiceName(e.target.value)}
                  placeholder="Invite a new voice..."
                  className="flex-1 bg-stone-950/50 border border-stone-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50 transition-all font-mono"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddVoice()}
                  aria-label="New voice name"
                />
                <button
                  onClick={handleAddVoice}
                  className="bg-purple-600 hover:bg-purple-500 text-stone-950 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition shadow-lg shadow-purple-900/20"
                >
                  <Plus size={18} /> <span className="hidden sm:inline">Add Voice</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                <span className="text-[9px] uppercase tracking-widest text-stone-600 font-bold self-center mr-1">Archetypes:</span>
                {['The Protector', 'The Inner Critic', 'The Vulnerable Child', 'The Controller', 'The Victim'].map(archetype => (
                  <button
                    key={archetype}
                    onClick={() => {
                      const newVoice: BigMindVoice = {
                        id: `voice-${Date.now()}-${Math.random()}`,
                        name: archetype,
                        isDefault: false
                      };
                      setSession(prev => ({
                        ...prev,
                        voices: [...(prev.voices || []), newVoice]
                      }));
                      setSelectedVoice(archetype);
                    }}
                    className="text-[10px] uppercase tracking-wider font-bold text-purple-500/60 bg-purple-500/5 hover:bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-full transition-colors"
                  >
                    + {archetype}
                  </button>
                ))}
              </div>
            </div>

            <div className={`${effects.glassDark} border border-purple-900/20 rounded-xl p-5 animate-fade-in`}>
              <div className="flex items-start gap-3">
                <Compass className="text-purple-500 mt-0.5 shrink-0" size={18} />
                <p className="text-stone-400 text-sm leading-relaxed italic">
                  <strong>Orientation:</strong> Focus on what is calling for attention in your field of awareness. Is it a desire, a fear, a critical judge, or a playful explorer? Give it a name and invite it into the dialogue.
                </p>
              </div>
            </div>
          </div>
        );

      case 'VOICE_DIALOGUE':
      case 'WITNESS':
      case 'INTEGRATION':
        return (
          <div className="flex flex-col h-full space-y-4 animate-fade-in">
            {/* Conversation pane */}
            <div className={`flex-1 overflow-y-auto space-y-6 rounded-2xl p-4 sm:p-6 border transition-all duration-600 ${currentStage === 'WITNESS' || currentStage === 'INTEGRATION'
                ? 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-stone-900/40 via-transparent to-transparent border-emerald-900/30 shadow-[inset_0_0_50px_rgba(16,185,129,0.03)]'
                : 'bg-stone-950/30 border-stone-800/40'
              }`}>
              {/* Provider indicator */}
              <div className="flex justify-center mb-4">
                <div className="bg-stone-900/80 backdrop-blur-sm border border-stone-800 rounded-full px-4 py-1 text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold flex items-center gap-2">
                  {selectedProvider === 'openrouter' ? 'OpenRouter' : 'Grok Field'}
                </div>
              </div>

              {(session.messages || []).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full border border-stone-800 flex items-center justify-center text-stone-700 animate-pulse">
                    <UserCircle size={24} />
                  </div>
                  <p className="text-stone-500 text-sm italic max-w-[200px]">
                    The field is open. Speak your truth to begin...
                  </p>
                </div>
              ) : (
                (session.messages || []).map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[85%] sm:max-w-[75%]`}>
                      {msg.role === 'user' && (
                        <div className="flex items-center gap-2 mb-1.5 px-1">
                          <span className="text-[10px] uppercase tracking-widest text-purple-500/70 font-bold">{msg.voiceName}</span>
                          <UserCircle size={12} className="text-stone-600" />
                        </div>
                      )}
                      {msg.role === 'witness' && (
                        <div className="flex items-center gap-2 mb-1.5 px-1">
                          <Compass size={12} className="text-emerald-500/70" />
                          <span className="text-[10px] uppercase tracking-widest text-emerald-500/70 font-bold">Witness</span>
                        </div>
                      )}

                      <div
                        className={`px-5 py-3.5 rounded-2xl shadow-sm leading-relaxed text-sm ${msg.role === 'user'
                          ? 'bg-stone-800 text-stone-100 border border-stone-700/50 rounded-tr-none'
                          : 'bg-transparent text-stone-300 border-l-2 border-emerald-500/40 pl-5'
                          }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>

                      <div className="text-[9px] text-stone-600 mt-1.5 font-mono px-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
              {isStreaming && (
                <div className="flex justify-start animate-fade-in" role="status" aria-live="polite" aria-label="Witness is responding">
                  <div className="flex flex-col items-start max-w-[85%]">
                    <div className="flex items-center gap-2 mb-1.5 px-1">
                      <Compass size={12} className="text-emerald-500/70 animate-spin-slow" />
                      <span className="text-[10px] uppercase tracking-widest text-emerald-500/70 font-bold">Receiving...</span>
                    </div>
                    <div className="bg-transparent border-l-2 border-emerald-500/20 pl-5 py-2">
                      <div className="flex gap-1.5">
                        <motion.div className="w-1 h-1 bg-emerald-500/40 rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.6, repeat: Infinity }} />
                        <motion.div className="w-1 h-1 bg-emerald-500/40 rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} />
                        <motion.div className="w-1 h-1 bg-emerald-500/40 rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            {!isStreaming && (
              <div className="space-y-3 pt-2">
                {currentStage === 'INTEGRATION' ? (
                  <div className="flex flex-col sm:flex-row gap-3 mb-2 animate-fade-in">
                    <div className="flex-1 bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-3 text-emerald-300 text-xs italic font-serif">
                      "What does the Witness notice about the tension between these parts?"
                    </div>
                    <div className="flex-1 bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-3 text-emerald-300 text-xs italic font-serif">
                      "What does this internal system actually need to find balance?"
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {(session.voices || []).map(voice => (
                      <button
                        key={voice.id}
                        onClick={() => setSelectedVoice(voice.name)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border ${selectedVoice === voice.name
                            ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                            : 'bg-stone-900/60 border-stone-800 text-stone-500 hover:border-stone-700'
                          }`}
                      >
                        AS: {voice.name}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 group">
                  <label htmlFor="dialogue-input" className="sr-only">
                    Speak as the voice
                  </label>
                  <textarea
                    id="dialogue-input"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Speak your truth..."
                    rows={2}
                    className="flex-1 bg-stone-950/50 border border-stone-800 rounded-2xl px-5 py-4 text-sm text-stone-200 focus:outline-none focus:border-emerald-500/30 transition-all resize-none scrollbar-none"
                    aria-label="Dialogue input"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!userInput.trim()}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-20 disabled:cursor-not-allowed text-stone-950 p-4 rounded-2xl transition-all shadow-lg shadow-emerald-900/10 self-end"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 'REFLECTION':
        return (
          <div className="space-y-6 py-4 animate-fade-in">
            <div className="bg-purple-900/10 border border-purple-500/20 rounded-2xl p-6">
              <label htmlFor="reflection-input" className="block text-sm font-semibold text-stone-200 mb-4">
                What shifted in how you see these voices and yourself?
              </label>
              <textarea
                id="reflection-input"
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                placeholder="Describe the shift you noticed. What's different about your understanding now? (minimum 20 characters)"
                rows={5}
                className="w-full bg-stone-950/50 border border-purple-500/30 rounded-xl px-5 py-4 text-sm text-stone-200 focus:outline-none focus:border-purple-500/60 transition-all resize-none scrollbar-none"
              />
              <div className="mt-2 text-xs text-stone-500">
                {reflectionText.length} / 20 characters minimum
              </div>
            </div>

            <div className={`${effects.glassDark} border border-purple-900/20 rounded-xl p-5`}>
              <div className="flex items-start gap-3">
                <Compass className="text-purple-400 mt-0.5 shrink-0" size={18} />
                <p className="text-stone-400 text-sm leading-relaxed italic">
                  <strong>Reflection:</strong> This is the integration step—where you articulate what you've learned. The summary will use your own words to reflect back what emerged.
                </p>
              </div>
            </div>
          </div>
        );

      case 'SUMMARY':
        return (
          <div className="space-y-8 py-4 animate-fade-in">
            {session.summary && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                  <div className="space-y-4 sm:space-y-6">
                    <section>
                      <h3 className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold mb-3 sm:mb-4">Primary Archetypes</h3>
                      <div className="flex flex-wrap gap-2">
                        {session.summary.primaryVoices.map(voice => (
                          <span key={voice} className="bg-purple-500/10 border border-purple-500/30 text-purple-200 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-serif italic">
                            {voice}
                          </span>
                        ))}
                      </div>
                    </section>

                    <section>
                      <h3 className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold mb-3 sm:mb-4">Core Commitments</h3>
                      <ul className="space-y-2 sm:space-y-3">
                        {session.summary.integrationCommitments.map((commitment, idx) => (
                          <li key={idx} className="flex gap-2 sm:gap-3 group">
                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500/40 group-hover:bg-emerald-500 transition-colors shrink-0" />
                            <span className="text-stone-300 text-xs sm:text-sm leading-relaxed italic">{commitment}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    <section>
                      <h3 className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold mb-3 sm:mb-4">Witness Synthesis</h3>
                      <div className={`${effects.glassDark} border border-stone-800 p-4 sm:p-5 rounded-2xl`}>
                        <p className="text-stone-300 text-xs sm:text-sm leading-relaxed italic font-serif">"{session.summary.witnessPerspective}"</p>
                      </div>
                    </section>
                  </div>
                </div>

                {session.summary.recommendedPractices.length > 0 && (
                  <section className="pt-4">
                    <h3 className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold mb-3 sm:mb-4">Practice Field Upgrades</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {session.summary.recommendedPractices.map((practice, idx) => (
                        <div
                          key={idx}
                          className="bg-stone-900/40 border border-stone-800 rounded-2xl p-3 sm:p-4 flex justify-between items-center gap-3 sm:gap-4 hover:border-stone-700 transition-colors group"
                        >
                          <div>
                            <p className="font-semibold text-stone-200 group-hover:text-purple-400 transition-colors text-sm">{practice.practiceName}</p>
                            <p className="text-[11px] sm:text-xs text-stone-500 mt-1">{practice.rationale}</p>
                          </div>
                          {!practice.alreadyInStack ? (
                            <button
                              onClick={() => handleAddPracticeToStack(practice.practiceId)}
                              className="bg-stone-800 hover:bg-stone-700 text-purple-500 border border-purple-500/20 p-2.5 rounded-xl transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
                              aria-label="Add practice to stack"
                            >
                              <Plus size={18} />
                            </button>
                          ) : (
                            <div className="bg-stone-950/50 p-2.5 rounded-xl text-stone-600 min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Practice already in stack">
                              <Save size={18} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-xl animate-fade-in flex justify-center items-center z-50 p-0 sm:p-4">
      <div className="bg-stone-950 border-x border-stone-800 sm:border rounded-none sm:rounded-3xl shadow-2xl w-full max-w-5xl flex flex-col h-[100dvh] sm:h-auto max-h-[100dvh] sm:max-h-[90dvh] overflow-hidden">
        {/* Header */}
        <header className="p-5 border-b border-stone-800/60 flex justify-between items-center bg-stone-950/90 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center border border-stone-800">
              <MerkabaIcon size={20} className="text-purple-500" />
            </div>
            <div>
              <h2 className={`${typography.h3} text-stone-100 font-serif italic text-lg sm:text-xl`}>Big Mind</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500/60 animate-pulse" />
                <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-stone-500 font-bold">Shadow Dialogue Construct</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowProviderSettings(!showProviderSettings)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-stone-500 hover:text-stone-200 transition-colors rounded-full hover:bg-stone-900"
              aria-label="Field Settings"
            >
              <Settings size={20} />
            </button>
            <button
              onClick={() => onClose(session)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-stone-500 hover:text-stone-100 transition-colors rounded-full hover:bg-stone-900"
              aria-label="Exit"
            >
              <X size={24} />
            </button>
          </div>
        </header>

        {/* Provider Settings */}
        <AnimatePresence>
          {showProviderSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-6 py-4 bg-stone-900/50 border-b border-stone-800 overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <span className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">AI Intelligence:</span>
                <div className="flex flex-wrap gap-2">
                  {getAvailableProviders().map(({ provider, available, error }) => (
                    <button
                      key={provider}
                      onClick={() => available && setSelectedProvider(provider)}
                      disabled={!available}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${selectedProvider === provider
                        ? 'bg-purple-500 border-purple-400 text-stone-950'
                        : available
                          ? 'bg-stone-800 border-stone-700 text-stone-400 hover:border-stone-500'
                          : 'bg-stone-900 border-stone-800 text-stone-700 cursor-not-allowed'
                        }`}
                    >
                      <span className="flex items-center gap-2">
                        {provider === 'openrouter' ? 'OpenRouter' : 'Grok'}
                        {!available && ' (Offline)'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stage indicator */}
        <div className="px-6 pt-6 pb-2 flex items-center gap-3 overflow-x-auto scrollbar-none">
          {STAGE_ORDER.map((stage, idx) => (
            <React.Fragment key={stage}>
              <button
                onClick={() => handleNavigateToStage(idx)}
                disabled={idx > currentStageIndex && idx !== currentStageIndex + 1}
                className={`px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold whitespace-nowrap transition-all border ${idx === currentStageIndex
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                  : idx < currentStageIndex
                    ? 'bg-stone-900/60 border-stone-800 text-stone-500 hover:border-stone-600'
                    : 'bg-stone-950 border-transparent text-stone-700 cursor-not-allowed'
                  }`}
              >
                {STAGE_LABELS[stage]}
              </button>
              {idx < STAGE_ORDER.length - 1 && (
                <div className="w-1 h-1 rounded-full bg-stone-800 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Main content */}
        <main className="px-6 flex-grow overflow-y-auto space-y-4 flex flex-col scrollbar-thin scrollbar-thumb-stone-800">
          <div className="pt-2 animate-fade-in">
            <p className="text-[11px] text-stone-500 uppercase tracking-widest leading-relaxed border-l border-stone-800 pl-4">{STAGE_DESCRIPTIONS[currentStage]}</p>
          </div>

          {error && (
            <div className="bg-rose-900/20 border border-rose-500/30 rounded-xl p-4 text-rose-200 text-xs italic animate-shake">
              <div className="flex items-center gap-2 mb-1">
                <X size={14} className="text-rose-500" />
                <span className="font-bold uppercase tracking-wider">Field Disturbance</span>
              </div>
              {error}
            </div>
          )}

          {crisisLevel !== 'none' && (
            <SafetyBanner crisisLevel={crisisLevel} />
          )}

          {insightContext && (
            <div className="bg-purple-900/10 border border-purple-500/20 rounded-2xl p-5 mb-4 animate-fade-in group hover:bg-purple-900/20 transition-all duration-500">
              <div className="flex items-start gap-4">
                <Lightbulb className="text-purple-500 shrink-0 mt-1 animate-pulse-slow" size={20} />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-purple-500/60 font-bold mb-1">Incoming Insight Thread</p>
                  <p className={`${typography.bodySmall} text-stone-200 leading-relaxed font-serif italic`}>
                    "{insightContext.detectedPattern}"
                  </p>
                </div>
              </div>
            </div>
          )}

          {renderStageContent()}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-stone-500 animate-fade-in">
              <div className="relative w-12 h-12">
                <motion.div className="absolute inset-0 border-2 border-stone-800 rounded-full" />
                <motion.div
                  className="absolute inset-0 border-2 border-purple-500/40 rounded-full border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                />
              </div>
              <p className="text-[10px] uppercase tracking-widest font-bold">Synthesizing Fields...</p>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="p-5 border-t border-stone-800/60 flex justify-between items-center bg-stone-950/90 backdrop-blur-md">
          <button
            onClick={() => onClose(session)}
            className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-500 hover:text-stone-200 transition-colors flex items-center gap-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-stone-700" />
            Save Draft
          </button>

          <div className="flex gap-3">
            {currentStageIndex > 0 && (
              <button
                onClick={() => handleStageTransition('prev')}
                disabled={isLoading || isStreaming}
                className="bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-20 flex items-center gap-2"
              >
                <ArrowLeft size={14} /> Back
              </button>
            )}

            {currentStageIndex < STAGE_ORDER.length - 1 && (
              <button
                onClick={() => handleStageTransition('next')}
                disabled={!canProceedToNextStage() || isLoading || isStreaming || crisisLevel === 'high'}
                className="bg-purple-600 hover:bg-purple-500 disabled:bg-stone-900 disabled:text-stone-700 disabled:border-transparent text-stone-950 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-purple-900/10 flex items-center gap-2"
              >
                Continue <ArrowRight size={14} />
              </button>
            )}

            {currentStageIndex === STAGE_ORDER.length - 1 && (
              <button
                onClick={handleFinish}
                disabled={isLoading}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-900 disabled:text-stone-700 text-stone-950 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/10 flex items-center gap-2"
              >
                Seal Session <ArrowRight size={14} />
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}