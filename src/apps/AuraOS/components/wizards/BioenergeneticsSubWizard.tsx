import React, { useState, useRef, useEffect } from 'react';
import {
  X, ChevronRight, ChevronLeft, Clock, AlertTriangle, Check,
  MessageCircle, Loader, Maximize2, Minimize2, ArrowLeft,
  RotateCcw, Save, Shield, Activity, Send
} from 'lucide-react';
import { BioenergeneticsPractice, BioenergeneticsSession, ChatbotMessage } from '../../types.ts';
import { universalChatbotQueries, bioenergeneticsPractices } from '../../data/bioenergeneticsLibrary.ts';
import { generateBioenergeneticsChatbotResponse } from '../../services/bioenergeneticsChatbotService.ts';
import { getSilhouetteComponent } from '../shared/BioenergeneticsSilhouettes.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { typography, effects, theme } from '../../theme.ts';

interface BioenergeneticsSubWizardProps {
  practice: BioenergeneticsPractice;
  userId: string;
  onBack: () => void;
  onSessionSave: (session: BioenergeneticsSession) => void;
  linkedInsightId?: string;
  markInsightAsAddressed?: (insightId: string, wizardName: string, sessionId: string) => void;
}

type TabType = 'explanation' | 'guided' | 'before';
type SubWizardStep = 'intro' | 'practice' | 'summary';

export default function BioenergeneticsSubWizard({
  practice,
  userId,
  onBack,
  onSessionSave,
  linkedInsightId,
  markInsightAsAddressed
}: BioenergeneticsSubWizardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('explanation');
  const [wizardStep, setWizardStep] = useState<SubWizardStep>('intro');
  const [currentPracticeStep, setCurrentPracticeStep] = useState(0);
  const [isPracticingStarted, setIsPracticingStarted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  
  // View States
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);

  const [chatMessages, setChatMessages] = useState<ChatbotMessage[]>([
    {
      role: 'bot',
      text: `Hi! I'm here to support your ${practice.name} practice. Feel free to ask questions or let me know if you need help.`,
      timestamp: Date.now()
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [sessionData, setSessionData] = useState<Partial<BioenergeneticsSession>>({
    sudsAtStart: 5,
    sudsAtEnd: 5,
    sudsMax: 5
  });
  const chatEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isMobileChatOpen]);

  // Timer effect
  useEffect(() => {
    if (isPracticingStarted && wizardStep === 'practice') {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [isPracticingStarted, wizardStep]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage: ChatbotMessage = {
      role: 'user',
      text: chatInput,
      timestamp: Date.now()
    };
    setChatMessages((prev) => [...prev, userMessage]);
    const currentInput = chatInput;
    setChatInput('');
    setIsChatLoading(true);

    try {
      let streamedText = '';
      const result = await generateBioenergeneticsChatbotResponse(
        practice,
        currentInput,
        chatMessages,
        (chunk) => {  // onStreamChunk callback
          streamedText += chunk;
          setChatMessages((prev) => {
            if (prev.length === 0) {
              return [
                {
                  role: 'bot',
                  text: streamedText,
                  timestamp: Date.now()
                }
              ];
            }
            const lastMsg = prev[prev.length - 1];
            if (lastMsg?.role === 'bot') {
              return [
                ...prev.slice(0, -1),
                { ...lastMsg, text: streamedText }
              ];
            } else {
              return [
                ...prev,
                {
                  role: 'bot',
                  text: streamedText,
                  timestamp: Date.now()
                }
              ];
            }
          });
        },
        bioenergeneticsPractices
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate response');
      }

      // Ensure final state is consistent
      setChatMessages((prev) => {
        if (prev.length === 0) return prev;
        const lastMsg = prev[prev.length - 1];
        if (lastMsg?.role === 'bot') {
            // If the streamed text is incomplete or slightly different, use final result
            return [
              ...prev.slice(0, -1),
              { ...lastMsg, text: result.text }
            ];
        }
        return prev;
      });

    } catch (error) {
      console.error('Chatbot error:', error);
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: "I'm having trouble responding. Try asking again or continue with your practice.",
          timestamp: Date.now()
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleQuickReply = (query: string) => {
    setChatInput(query);
  };

  const handleNextStep = () => {
    if (currentPracticeStep < practice.steps.length - 1) {
      setCurrentPracticeStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentPracticeStep > 0) {
      setCurrentPracticeStep((prev) => prev - 1);
    }
  };

  const handleStartPractice = () => {
    setWizardStep('practice');
    setActiveTab('guided');
    setCurrentPracticeStep(0);
    setIsPracticingStarted(true);
    if (window.innerWidth < 640) {
      setIsFocusMode(true); // Auto focus on mobile
    }
  };

  const handleCompletePractice = () => {
    setIsPracticingStarted(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const session: BioenergeneticsSession = {
      id: `sess-bio-${Date.now()}`,
      userId,
      date: new Date().toISOString(),
      practiceId: practice.id,
      practiceName: practice.name,
      completedAt: new Date().toISOString(),
      durationMinutes: Math.round(elapsedSeconds / 60),
      ...sessionData
    };

    setWizardStep('summary');
    setSessionData(session);
    setIsFocusMode(false);
  };

  const handleSaveSession = async () => {
    const session: BioenergeneticsSession = {
      id: `sess-bio-${Date.now()}`,
      userId,
      date: new Date().toISOString(),
      practiceId: practice.id,
      practiceName: practice.name,
      completedAt: new Date().toISOString(),
      durationMinutes: Math.round(elapsedSeconds / 60),
      linkedInsightId,
      ...(sessionData as BioenergeneticsSession)
    };

    if (linkedInsightId && markInsightAsAddressed) {
      markInsightAsAddressed(linkedInsightId, 'Bioenergetics & Breathing', session.id);
    }

    onSessionSave(session);
    onBack();
  };

  return (
    <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-xl animate-fade-in flex items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-stone-900 rounded-none sm:rounded-3xl w-full h-[100dvh] sm:h-auto max-h-[100dvh] sm:max-h-[90dvh] sm:max-w-7xl overflow-hidden border-x border-stone-800 sm:border shadow-2xl flex flex-col relative">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-stone-900/90 backdrop-blur-md border-b border-stone-800 p-4 sm:p-6 flex-shrink-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="text-stone-500 hover:text-stone-100 transition-colors p-2 hover:bg-stone-800 rounded-full -ml-2"
              aria-label="Back"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-100 font-serif italic">{practice.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full border ${
                   practice.difficulty === 'Beginner' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                   practice.difficulty === 'Intermediate' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                   'bg-rose-500/10 border-rose-500/20 text-rose-400'
                }`}>
                  {practice.difficulty}
                </span>
                <span className="text-[10px] text-stone-500 uppercase tracking-widest font-bold hidden sm:inline">{practice.intention}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {wizardStep === 'practice' && (
              <button 
                onClick={() => setIsFocusMode(!isFocusMode)}
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-[10px] uppercase tracking-widest font-bold bg-stone-800 text-stone-300 rounded-xl hover:bg-stone-700 transition-all border border-stone-700"
              >
                {isFocusMode ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                {isFocusMode ? 'Exit Focus' : 'Focus Mode'}
              </button>
            )}
            
            {/* Mobile Chat Toggle */}
            <button 
              onClick={() => setIsMobileChatOpen(!isMobileChatOpen)}
              className="sm:hidden p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-full relative"
            >
              <MessageCircle size={24} />
              {chatMessages.length > 1 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-stone-900" />
              )}
            </button>

            <button
              onClick={onBack}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-stone-500 hover:text-stone-100 transition-colors hover:bg-stone-800 rounded-full"
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Main Layout */}
        <div className="flex flex-1 overflow-hidden relative">
          
          {/* Content Area */}
          <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-500 ${isFocusMode ? 'w-full' : isChatOpen ? 'w-full sm:w-[65%] lg:w-[70%]' : 'w-full'}`}>
            
            {/* Navigation Tabs */}
            {wizardStep !== 'summary' && (
              <div className="flex border-b border-stone-800 bg-stone-950/20 flex-shrink-0 overflow-x-auto scrollbar-none">
                {['explanation', 'before', 'guided'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as TabType)}
                    className={`flex-1 min-w-[100px] px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold transition-all whitespace-nowrap relative ${
                      activeTab === tab
                        ? 'text-amber-500 bg-amber-500/5'
                        : 'text-stone-500 hover:text-stone-300'
                    }`}
                  >
                    {tab === 'explanation' && 'Overview'}
                    {tab === 'guided' && 'Guided Practice'}
                    {tab === 'before' && 'Safety Check'}
                    {activeTab === tab && (
                      <motion.div layoutId="activeTabBio" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 scrollbar-thin scrollbar-thumb-stone-800">
              
              {/* === EXPLANATION TAB === */}
              {activeTab === 'explanation' && wizardStep !== 'summary' && (
                <div className="space-y-10 max-w-3xl mx-auto animate-fade-in">
                  {/* Hero Section */}
                  <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
                    <div className="flex-1 space-y-6">
                      <h3 className={`${typography.h3} text-stone-100 font-serif italic`}>Understanding the Practice</h3>
                      <p className={`${typography.body} text-stone-300 leading-relaxed italic`}>
                        {practice.explanation.overview}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {practice.explanation.benefits.slice(0, 3).map((benefit, idx) => (
                          <span key={idx} className="bg-stone-800/40 border border-stone-700/30 rounded-full px-4 py-1.5 text-[10px] uppercase tracking-widest font-bold text-stone-400 flex items-center gap-2">
                            <Check size={12} className="text-amber-500" /> {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-stone-900 border border-stone-800 rounded-3xl p-8 flex justify-center shadow-2xl w-full md:w-auto">
                      {React.createElement(getSilhouetteComponent(practice.id), {
                        size: 140,
                        className: 'text-amber-500 opacity-80 drop-shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                      })}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-stone-950/40 border border-stone-800 rounded-2xl p-6 hover:bg-stone-800/40 transition-colors">
                      <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-500 mb-4 flex items-center gap-2">
                        <Clock size={14} className="text-sky-500" /> 
                        Mechanism
                      </h4>
                      <p className="text-stone-400 text-sm leading-relaxed italic">
                        {practice.explanation.mechanism}
                      </p>
                    </div>
                    <div className="bg-stone-950/40 border border-stone-800 rounded-2xl p-6 hover:bg-stone-800/40 transition-colors">
                      <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-500 mb-4 flex items-center gap-2">
                        <Activity size={14} className="text-amber-500" /> 
                        When to Use
                      </h4>
                      <p className="text-stone-400 text-sm leading-relaxed italic">
                        {practice.explanation.whenToUse}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-center pt-4">
                    <button
                      onClick={() => setActiveTab('before')}
                      className="group flex items-center gap-3 bg-stone-800 hover:bg-stone-700 text-stone-100 font-bold py-4 px-10 rounded-2xl transition-all border border-stone-700 uppercase tracking-widest text-xs shadow-lg"
                    >
                      Next: Safety Check <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              )}

              {/* === BEFORE YOU START TAB === */}
              {activeTab === 'before' && wizardStep !== 'summary' && (
                <div className="space-y-10 max-w-2xl mx-auto animate-fade-in">
                  <div className="bg-rose-950/10 border border-rose-500/20 rounded-2xl p-8 border-l-4 border-l-rose-500/40">
                    <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-rose-400 mb-6 flex items-center gap-2">
                      <AlertTriangle size={16} />
                      Contraindications
                    </h3>
                    <ul className="space-y-3">
                      {practice.contraindications.map((item, idx) => (
                        <li key={idx} className="text-stone-300 text-sm flex items-start gap-3 italic">
                          <span className="text-rose-500 font-bold not-italic">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-emerald-500 mb-6 flex items-center gap-2">
                      <Shield size={16} /> Safety Checklist
                    </h3>
                    <div className="space-y-4 bg-stone-950/40 p-8 rounded-3xl border border-stone-800">
                      {[
                        "You're not in acute crisis or severe dissociation",
                        "You're not pregnant (unless practice is explicitly safe)",
                        "No sharp injuries or recent surgery affecting this area",
                        'You have read the contraindications above'
                      ].map((item, idx) => (
                        <label key={idx} className="flex items-start gap-4 cursor-pointer group">
                          <div className="relative flex items-center mt-0.5">
                            <input type="checkbox" className="peer w-5 h-5 rounded border-stone-700 bg-stone-900 text-amber-500 focus:ring-amber-500/30 transition-all" defaultChecked />
                          </div>
                          <span className="text-stone-400 group-hover:text-stone-200 transition-colors text-sm italic">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-center pt-6">
                    <button
                      onClick={handleStartPractice}
                      className="w-full sm:w-auto bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold py-5 px-12 rounded-2xl transition-all duration-300 shadow-xl shadow-amber-900/20 uppercase tracking-[0.2em] text-xs"
                    >
                      Ready to Start
                    </button>
                  </div>
                </div>
              )}

              {/* === GUIDED PRACTICE TAB === */}
              {activeTab === 'guided' && wizardStep !== 'summary' && (
                <div className="h-full flex flex-col max-w-4xl mx-auto animate-fade-in">
                  {!isPracticingStarted ? (
                     <div className="flex-1 flex flex-col items-center justify-center text-center space-y-10 p-8">
                       <div className="space-y-4">
                         <h3 className={`${typography.h2} text-stone-100 font-serif italic`}>Ready to Practice?</h3>
                         <p className="text-stone-500 text-sm uppercase tracking-widest font-bold">
                           {practice.steps.length} steps • {practice.duration.min}-{practice.duration.max} minutes
                         </p>
                       </div>
                       <button
                          onClick={handleStartPractice}
                          className="bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold py-5 px-16 rounded-2xl transition-all duration-300 shadow-xl shadow-amber-900/20 hover:scale-105 uppercase tracking-[0.2em] text-xs"
                        >
                          Begin Practice
                        </button>
                     </div>
                  ) : (
                    <>
                      {/* Timer & Progress Bar */}
                      <div className="mb-8 bg-stone-900/90 backdrop-blur-md rounded-2xl p-5 border border-stone-800 sticky top-0 z-10 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] uppercase tracking-widest font-bold text-stone-500">
                            Process Step {currentPracticeStep + 1} of {practice.steps.length}
                          </span>
                          <div className="flex items-center gap-3 text-amber-500 font-mono font-bold bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-xl text-sm">
                            <Clock size={16} />
                            {formatTime(elapsedSeconds)}
                          </div>
                        </div>
                        <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-amber-600 to-amber-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentPracticeStep + 1) / practice.steps.length) * 100}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                          />
                        </div>
                      </div>

                      {/* Step Content */}
                      <div className="flex-1 overflow-y-auto min-h-0 scrollbar-none">
                        {practice.steps[currentPracticeStep] && (
                          <div className="space-y-8 animate-fade-in">
                            <div className="flex flex-col md:flex-row gap-10">
                              <div className="flex-1">
                                <h2 className={`${typography.h2} text-stone-100 font-serif italic mb-6 leading-tight`}>
                                  {practice.steps[currentPracticeStep].title}
                                </h2>
                                <p className={`${typography.body} text-stone-300 leading-relaxed mb-8 italic font-serif`}>
                                  {practice.steps[currentPracticeStep].instructions}
                                </p>
                                
                                <div className="bg-stone-950/40 border border-stone-800 rounded-2xl p-6 mb-8 border-l-4 border-l-amber-500/30">
                                  <h5 className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-500 mb-4 flex items-center gap-2">
                                    <Activity size={16} className="text-amber-500" /> Body Cues
                                  </h5>
                                  <ul className="space-y-3">
                                    {practice.steps[currentPracticeStep].cues.map((cue, idx) => (
                                      <li key={idx} className="text-stone-300 flex items-start gap-3 text-sm italic">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500/40 mt-2 flex-shrink-0" />
                                        {cue}
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                {(practice.steps[currentPracticeStep].safety || practice.steps[currentPracticeStep].ifModified) && (
                                  <div className="grid sm:grid-cols-2 gap-4">
                                    {practice.steps[currentPracticeStep].safety && (
                                      <div className="bg-amber-950/10 border border-amber-500/20 rounded-xl p-5 text-xs italic">
                                        <strong className="block text-amber-500 uppercase tracking-widest font-bold not-italic mb-2">Safety Note</strong>
                                        <span className="text-stone-400">{practice.steps[currentPracticeStep].safety}</span>
                                      </div>
                                    )}
                                    {practice.steps[currentPracticeStep].ifModified && (
                                      <div className="bg-sky-950/10 border border-sky-500/20 rounded-xl p-5 text-xs italic">
                                        <strong className="block text-sky-500 uppercase tracking-widest font-bold not-italic mb-2">Modification</strong>
                                        <span className="text-stone-400">{practice.steps[currentPracticeStep].ifModified}</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                              
                              {/* Visual */}
                              <div className="flex-shrink-0 flex justify-center items-start">
                                <div className="bg-stone-900 border border-stone-800 rounded-3xl p-10 sticky top-4 shadow-2xl">
                                  {React.createElement(getSilhouetteComponent(practice.id), {
                                    size: 180,
                                    className: 'text-amber-500/80 drop-shadow-[0_0_30px_rgba(245,158,11,0.15)]'
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Controls Footer */}
                      <div className="mt-8 pt-8 border-t border-stone-800 flex items-center justify-between gap-4">
                        <button
                          onClick={handlePrevStep}
                          disabled={currentPracticeStep === 0}
                          className="px-6 py-3 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all disabled:opacity-20 text-stone-500 hover:bg-stone-800 hover:text-stone-100 flex items-center gap-2"
                        >
                          <ChevronLeft size={16} /> Back
                        </button>
                        
                        {currentPracticeStep < practice.steps.length - 1 ? (
                          <button
                            onClick={handleNextStep}
                            className="bg-stone-100 hover:bg-white text-stone-950 font-bold py-3.5 px-10 rounded-2xl transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 flex items-center gap-2 uppercase tracking-widest text-[10px]"
                          >
                            Next Step <ChevronRight size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={handleCompletePractice}
                            className="bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold py-3.5 px-10 rounded-2xl transition-all shadow-xl shadow-amber-900/20 hover:shadow-amber-900/40 hover:-translate-y-0.5 flex items-center gap-2 uppercase tracking-widest text-[10px]"
                          >
                            Complete Practice <Check size={16} />
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* === SUMMARY SCREEN === */}
              {wizardStep === 'summary' && (
                <div className="max-w-2xl mx-auto space-y-10 animate-fade-in py-6">
                  <div className="text-center space-y-4">
                    <div className="w-24 h-24 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                      <Check size={40} className="text-amber-500" />
                    </div>
                    <h3 className={`${typography.h2} text-stone-100 font-serif italic`}>Session Integrated</h3>
                    <p className="text-stone-500 text-[10px] uppercase tracking-[0.2em] font-bold">
                      Duration: <span className="text-stone-300 font-mono font-medium">{formatTime(elapsedSeconds)}</span>
                    </p>
                  </div>

                  <div className="bg-stone-950/40 border border-stone-800 rounded-3xl p-8 space-y-8">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-stone-500 mb-4">
                        Phenomenological Notes
                      </label>
                      <textarea
                        value={sessionData.userNotes || ''}
                        onChange={(e) =>
                          setSessionData((prev) => ({ ...prev, userNotes: e.target.value }))
                        }
                        placeholder="I noticed warmth in my chest, trembling in my legs..."
                        className="w-full bg-stone-900 border border-stone-800 rounded-2xl px-5 py-4 text-stone-200 placeholder-stone-700 focus:outline-none focus:border-amber-500/30 transition-all h-32 resize-none italic text-sm font-serif"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-stone-500 mb-4">
                          Initial Charge (0-10)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={sessionData.sudsAtStart || 5}
                          onChange={(e) =>
                            setSessionData((prev) => ({
                              ...prev,
                              sudsAtStart: parseInt(e.target.value)
                            }))
                          }
                          className="w-full bg-stone-900 border border-stone-800 rounded-2xl px-5 py-4 text-stone-100 font-mono focus:outline-none focus:border-amber-500/30 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-stone-500 mb-4">
                          Final Charge (0-10)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={sessionData.sudsAtEnd || 5}
                          onChange={(e) =>
                            setSessionData((prev) => ({
                              ...prev,
                              sudsAtEnd: parseInt(e.target.value)
                            }))
                          }
                          className="w-full bg-stone-900 border border-stone-800 rounded-2xl px-5 py-4 text-stone-100 font-mono focus:outline-none focus:border-amber-500/30 transition-all"
                        />
                      </div>
                    </div>

                    <div className="bg-stone-900/50 rounded-2xl p-5 border border-stone-800 group hover:border-amber-500/20 transition-all duration-500">
                      <label className="flex items-center gap-4 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sessionData.vibrationObserved || false}
                          onChange={(e) =>
                            setSessionData((prev) => ({
                              ...prev,
                              vibrationObserved: e.target.checked
                            }))
                          }
                          className="w-5 h-5 rounded border-stone-700 bg-stone-900 text-amber-500 focus:ring-amber-500/30 transition-all"
                        />
                        <span className="text-stone-400 group-hover:text-stone-200 transition-colors text-sm italic">I noticed spontaneous trembling or vibration</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button
                      onClick={onBack}
                      className="flex-1 px-6 py-4 bg-stone-900 hover:bg-stone-800 text-stone-500 font-bold rounded-2xl transition-all border border-stone-800 uppercase tracking-widest text-[10px]"
                    >
                      Discard
                    </button>
                    <button
                      onClick={handleSaveSession}
                      className="flex-1 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold py-4 px-10 rounded-2xl transition-all duration-300 shadow-xl shadow-amber-900/20 flex items-center justify-center gap-3 uppercase tracking-widest text-[10px]"
                    >
                      <Save size={18} /> Save Session
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chatbot Sidebar - Desktop (Right Side) & Mobile (Overlay) */}
          <aside className={`
            ${isFocusMode ? 'hidden' : 'hidden sm:flex'}
            ${isMobileChatOpen ? 'fixed inset-0 z-50 flex' : ''}
            sm:relative ${isChatOpen ? 'sm:w-[35%] lg:w-[30%]' : 'sm:w-14'} sm:flex flex-col border-l border-stone-800 bg-stone-900/95 backdrop-blur-xl transition-all duration-500 overflow-hidden
          `}>
            
            {/* Mobile Header for Chat */}
            {isMobileChatOpen && (
              <div className="sm:hidden flex items-center justify-between p-5 border-b border-stone-800 bg-stone-900/90 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <MessageCircle size={18} className="text-amber-500" />
                  </div>
                  <h3 className="font-serif italic text-stone-100">AI Body Guide</h3>
                </div>
                <button 
                  onClick={() => setIsMobileChatOpen(false)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-stone-500 hover:text-stone-100 rounded-full bg-stone-800"
                >
                  <X size={20} />
                </button>
              </div>
            )}

            {/* Desktop Header */}
            <div className={`hidden sm:flex border-b border-stone-800 bg-stone-950/20 ${isChatOpen ? 'p-6 items-center gap-4' : 'p-3 flex-col items-center gap-3 py-4'}`}>
              {isChatOpen ? (
                <>
                  <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20 flex-shrink-0">
                    <MessageCircle size={20} className="text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif italic text-stone-100 text-lg leading-tight">AI Body Guide</h4>
                    <p className="text-[10px] uppercase tracking-widest text-stone-500 font-bold mt-0.5">Charge & Discharge Expert</p>
                  </div>
                  <button
                    onClick={() => setIsChatOpen(false)}
                    className="flex-shrink-0 p-2 text-stone-500 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-all"
                    title="Collapse chat"
                  >
                    <ChevronRight size={16} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsChatOpen(true)}
                    className="p-2 text-amber-500/70 hover:text-amber-400 hover:bg-stone-800 rounded-lg transition-all"
                    title="Expand AI Guide"
                  >
                    <MessageCircle size={18} />
                  </button>
                  <button
                    onClick={() => setIsChatOpen(true)}
                    className="p-1 text-stone-600 hover:text-stone-300 rounded transition-all"
                  >
                    <ChevronLeft size={14} />
                  </button>
                </>
              )}
            </div>

            {isChatOpen && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-stone-800 bg-stone-950/40">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'bot' ? 'justify-start' : 'justify-end'} animate-fade-in`}
                    >
                      <div
                        className={`max-w-[90%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-lg ${
                          msg.role === 'bot'
                            ? 'bg-stone-800 border border-stone-700/50 text-stone-200 rounded-tl-none font-serif italic'
                            : 'bg-amber-600 text-stone-950 font-bold rounded-tr-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                {/* Quick Suggestions */}
                <AnimatePresence>
                  {chatMessages.length <= 2 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 bg-stone-950/20 border-t border-stone-800"
                    >
                      <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-stone-600 mb-4">Focus Threads</p>
                      <div className="space-y-2">
                        {universalChatbotQueries.slice(0, 3).map((query, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleQuickReply(query.text)}
                            className="w-full text-left text-[11px] font-medium bg-stone-900/60 hover:bg-stone-800 border border-stone-800 hover:border-stone-700 text-stone-400 hover:text-stone-200 rounded-xl px-4 py-3 transition-all flex items-center gap-3 group italic"
                          >
                            <span className="text-amber-500 group-hover:scale-110 transition-transform">{query.icon}</span>
                            {query.text}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Input Area */}
                <div className="p-6 border-t border-stone-800 bg-stone-900/90 backdrop-blur-md">
                  <div className="flex gap-2 relative group">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey && !isChatLoading) {
                          e.preventDefault();
                          handleChatSubmit();
                        }
                      }}
                      placeholder="Ask the field..."
                      disabled={isChatLoading}
                      className="w-full bg-stone-950 border border-stone-800 rounded-2xl pl-5 pr-14 py-4 text-sm text-stone-200 placeholder-stone-700 focus:outline-none focus:border-amber-500/30 transition-all disabled:opacity-50 font-serif italic"
                    />
                    <button
                      onClick={handleChatSubmit}
                      disabled={isChatLoading || !chatInput.trim()}
                      className="absolute right-2 top-2 bottom-2 aspect-square bg-stone-800 hover:bg-amber-600 hover:text-stone-950 disabled:bg-stone-900 disabled:text-stone-800 text-stone-400 rounded-xl transition-all flex items-center justify-center shadow-lg"
                    >
                      {isChatLoading ? (
                        <Loader size={18} className="animate-spin" />
                      ) : (
                        <Send size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </aside>
        </div>
      </div>
    </div>
  );

}
