import React, { useState, useEffect, useRef } from 'react';
import { useWizardDraft } from '../../hooks/useWizardDraft';
import { v4 as uuidv4 } from 'uuid';
import {
  CivicCompassIcon
} from '../visualizations/SacredGeometryIcons';
import { streamCivicCoachResponse, extractAnalysisAndResponse, detectCommitment, detectPath, CivicMessage } from '../../services/civicPracticeCoachingService';
import { detectCrisisLevel } from '../../utils/crisisDetection';
import SafetyBanner from '../shared/SafetyBanner';
import { generateInsightFromSession } from '../../services/insightGenerator';
import { StorageManager } from '../../.claude/lib/storageManager';

type Phase = 'onboarding' | 'chat' | 'complete';

interface CivicChatState {
  hasConsented: boolean;
  sessionId: string;
  messages: CivicMessage[];
  lastCommitments: string[];
}

const HISTORY_KEY = 'aura-civicPracticeHistory';
const STATE_KEY = 'aura-civicPracticeState'; 

function getCivicState(): CivicChatState {
  try {
    const saved = StorageManager.getUntyped(STATE_KEY) as CivicChatState;
    if (saved) return saved;
  } catch (err) {
    // Return default below
  }
  return {
    hasConsented: false,
    sessionId: `civic-${Date.now()}`,
    messages: [],
    lastCommitments: [],
  };
}

function saveCivicState(state: CivicChatState) {
  StorageManager.setUntyped(STATE_KEY, state);
}

interface CommitmentCardProps {
  commitmentText: string;
}

function CommitmentCard({ commitmentText }: CommitmentCardProps) {
  return (
    <div className="mt-3 p-4 bg-amber-950/40 border border-amber-700/50 rounded-xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-500/20 to-transparent -mr-8 -mt-8 rounded-full blur-xl group-hover:bg-amber-400/30 transition-colors" />
      <div className="flex items-start gap-3 relative z-10">
        <div className="mt-1 flex-shrink-0">
          <CivicCompassIcon size={20} className="text-amber-400" color="currentColor" />
        </div>
        <div>
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block mb-1">Session Commitment</span>
          <p className="text-sm text-stone-200 leading-relaxed font-medium">{commitmentText}</p>
        </div>
      </div>
    </div>
  );
}

interface IntegralCivicPracticeWizardProps {
  onClose?: () => void;
  userId?: string;
}

interface CivicPracticeDraft {
  phase: Phase;
  sessionId: string;
}

const CIVIC_DRAFT_INITIAL: CivicPracticeDraft = {
  phase: 'onboarding',
  sessionId: '',
};

export default function IntegralCivicPracticeWizard({ onClose, userId }: IntegralCivicPracticeWizardProps) {
  const [, updateDraft] = useWizardDraft<CivicPracticeDraft>(
    'aura-draft-integral-civic-practice',
    CIVIC_DRAFT_INITIAL
  );

  const [state, setState] = useState<CivicChatState | null>(null);
  const [phase, setPhase] = useState<Phase>('onboarding');
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState('');
  const [crisisLevel, setCrisisLevel] = useState<'none' | 'concern' | 'high'>('none');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Render history summary for AI returning users
  const [sessionPastSummary, setSessionPastSummary] = useState<string>('');

  useEffect(() => {
    try {
      const loaded = getCivicState();
      
      // Look up past history and extract earlier commitments for continuity
      const history = (StorageManager.getUntyped(HISTORY_KEY) as any[]) || [];
      const past3 = history.slice(0, 3).map(h => 
        `- Date: ${new Date(h.date || Date.now()).toLocaleDateString()}\\n  Summary: ${h.insight?.insightNote || 'No summary'}\\n  Action Taken/Commitment: ${h.commitment || 'Unknown'}`
      ).join('\\n\\n');
      
      if (past3.length > 0) {
        setSessionPastSummary(past3);
      }

      const extractedCommitments = history.map(h => h.commitment).filter(Boolean);
      const exploredPaths = history.map(h => typeof h.pathUsed === 'string' ? h.pathUsed : h.insight?.insightNote).filter(Boolean);

      const mergedState = {
        ...loaded,
        lastCommitments: extractedCommitments,
        // We temporarily store exploredPaths on the state or as a separate ref/state. Since CivicChatState doesn't have it, let's just pass it to AI later by re-reading it or we can add it to state.
      };

      // Let's add exploredPaths as a module level or state variable if needed.
      // But we can just compute it directly inside handleSendMessage later.

      setState(mergedState);
      
      if (loaded.hasConsented && loaded.messages.length > 0) {
        setPhase('chat');
      }
      
    } catch (err: any) {
      console.error('Civic Coach initialization error:', err);
    }
  }, []);

  // Sync phase and sessionId to draft on changes
  useEffect(() => {
    updateDraft({ phase, sessionId: state?.sessionId ?? '' });
  }, [phase, state?.sessionId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state?.messages.length, streamingText]);

  const handleConsent = () => {
    if (!state) return;
    const updated = { ...state, hasConsented: true, sessionId: `civic-${Date.now()}`, messages: [] };
    
    // Auto-spawn initial greeting
    let greeting = "What's feeling loud or heavy in the world for you lately?";
    if (sessionPastSummary) {
      greeting = "Welcome back. Before we begin, how did you go with your last commitment? (Or if you didn't do it, what got in the way?)";
    }
    
    updated.messages = [
      { id: uuidv4(), role: 'assistant', content: greeting }
    ];

    setState(updated);
    saveCivicState(updated);
    setPhase('chat');
  };

  const clearChat = () => {
    if (confirm("End this session and start fresh?")) {
      const fresh: CivicChatState = { ...getCivicState(), hasConsented: true, sessionId: `civic-${Date.now()}`, messages: [
        { id: uuidv4(), role: 'assistant', content: "What's feeling loud or heavy in the world for you lately?" }
      ] };
      setState(fresh);
      saveCivicState(fresh);
    }
  };

  const handleSendMessage = async () => {
    if (!state || !userInput.trim()) return;

    setError(null);
    const text = userInput.trim();
    setUserInput('');

    const level = detectCrisisLevel(text);
    setCrisisLevel(level);
    if (level === 'high') {
      return; // Handled by SafetyBanner
    }

    const newMsg: CivicMessage = { id: uuidv4(), role: 'user', content: text };
    let msgs = [...state.messages, newMsg];
    
    setState({ ...state, messages: msgs });
    setIsLoading(true);

    try {
      const history = (StorageManager.getUntyped(HISTORY_KEY) as any[]) || [];
      const exploredPaths = history.map(h => typeof h.pathUsed === 'string' ? h.pathUsed : h.insight?.insightNote).filter(Boolean);

      const rawResponse = await streamCivicCoachResponse(
        msgs,
        (chunk) => setStreamingText(prev => prev + chunk),
        sessionPastSummary,
        exploredPaths
      );

      const { response: cleanResponse } = extractAnalysisAndResponse(rawResponse);

      const respMsg: CivicMessage = { id: uuidv4(), role: 'assistant', content: cleanResponse };
      msgs = [...msgs, respMsg];
      
      const updated = { ...state, messages: msgs };
      setState(updated);
      saveCivicState(updated);

      // Check for commitment completion
      const commitment = detectCommitment(rawResponse);
      const pathUsed = detectPath(rawResponse);
      
      if (commitment) {
        // Automatically save history and commitment
        const history = (StorageManager.getUntyped(HISTORY_KEY) as any[]) || [];
        StorageManager.setUntyped(HISTORY_KEY, [{ 
          sessionId: updated.sessionId, 
          date: new Date().toISOString(), 
          commitment,
          pathUsed
        }, ...history].slice(0, 75));

        if (userId) {
          // Generate insight
          const sessionReport = msgs.map(m => `[${m.role}]: ${m.content}`).join('\\n');
          generateInsightFromSession({
            wizardType: 'Integral Civic Practice',
            sessionId: updated.sessionId,
            sessionName: `Civic Practice Session`,
            sessionReport,
            sessionSummary: `User formed a civic commitment: ${commitment}`,
            userId,
            availablePractices: []
          }).catch(e => console.error("Insight generation failed", e));
        }

        setTimeout(() => setPhase('complete'), 2500);
      }

    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to process message');
    } finally {
      setIsLoading(false);
      setStreamingText('');
    }
  };

  const handleFinishSession = () => {
    if (onClose) onClose();
  };

  const renderBodyCheckIcon = (text: string) => {
    const isBodyQuery = /body|notice|feel|breath|physical/i.test(text);
    if (isBodyQuery) {
      return (
        <span className="inline-flex mr-2 mt-0.5 opacity-80" title="Somatic prompt">
          <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
             <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </span>
      );
    }
    return null;
  };

  if (!state) {
    return (
      <div className="fixed inset-0 z-50 bg-stone-950 flex justify-center items-center" style={{ height: '100dvh' }}>
        <div className="w-20 h-20 flex items-center justify-center animate-pulse">
          <CivicCompassIcon size={64} className="text-amber-500/50" color="currentColor" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-stone-950 text-stone-100 overflow-y-auto" style={{ height: '100dvh' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-stone-950/90 backdrop-blur-md border-b border-amber-500/20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CivicCompassIcon size={28} className="text-amber-400" color="currentColor" />
            <h1 className="font-serif text-lg sm:text-xl font-bold text-stone-100">Civic Practice Guide</h1>
          </div>
          <div className="flex items-center gap-2">
            {phase === 'chat' && state.messages.length > 0 && (
              <button 
                onClick={clearChat}
                className="px-3 py-1.5 text-xs text-stone-400 hover:text-rose-400 bg-stone-900/40 hover:bg-rose-900/20 rounded-lg transition-colors border border-stone-800"
              >
                Reset
              </button>
            )}
            <button
              onClick={() => onClose?.()}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-800/60 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        
        {/* Onboarding Phase */}
        {phase === 'onboarding' && (
          <div className="space-y-8 animate-in fade-in duration-500 max-w-lg mx-auto">
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-gradient-to-br from-amber-600/10 to-transparent border border-amber-500/20 rounded-full flex items-center justify-center">
                <CivicCompassIcon size={56} className="text-amber-400" color="currentColor" />
              </div>
            </div>

            <div className="text-center">
              <h2 className="font-serif text-3xl font-bold text-stone-100 mb-3">Civic Practice</h2>
              <p className="text-stone-400 max-w-sm mx-auto text-sm leading-relaxed">
                This practice helps you examine your political life, engage with complexity, and commit to right-sized action.
              </p>
            </div>

            <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-lg">
               <h3 className="text-sm font-bold text-stone-300 uppercase tracking-wide">Ground Rules:</h3>
               <ul className="space-y-3 text-sm text-stone-400">
                  <li className="flex gap-3">
                    <span className="text-amber-500">◆</span>
                    <span><strong>This is not therapy.</strong> It is deep civic inquiry.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-amber-500">◆</span>
                    <span>It will not tell you what to think, who to vote for, or what policy is best.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-amber-500">◆</span>
                    <span>It requires a willingness to examine your own shadow material without abandoning your values.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-amber-500">◆</span>
                    <span>Every session ends with a commitment to concrete action, or a conscious choice not to act.</span>
                  </li>
               </ul>
            </div>

            {state?.lastCommitments && state.lastCommitments.length > 0 && (
              <div className="bg-amber-950/20 border border-amber-900/30 rounded-2xl p-5 sm:p-6 space-y-4">
                <h3 className="text-sm font-bold text-amber-500 uppercase tracking-wide">Your Past Commitments:</h3>
                <div className="space-y-3">
                  {state.lastCommitments.slice(0, 3).map((comm, idx) => (
                    <div key={idx} className="bg-stone-900/40 p-3 rounded-xl border border-stone-800 text-sm text-stone-300">
                      {comm}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleConsent}
              className="w-full py-4 bg-amber-700 hover:bg-amber-600 text-white rounded-xl font-medium transition-all shadow-lg min-h-[44px]"
            >
              I Understand — Start Session
            </button>
          </div>
        )}

        {/* Complete Phase */}
        {phase === 'complete' && (
          <div className="space-y-6 animate-in fade-in duration-500 max-w-md mx-auto py-12 text-center">
            <div className="w-20 h-20 bg-emerald-950/30 border border-emerald-700/20 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <div>
              <h2 className="font-serif text-2xl font-bold text-stone-100 mb-2">Practice Complete</h2>
              <p className="text-stone-400">You've reached a resolution for today.</p>
            </div>
            
            <div className="bg-stone-900/50 border border-stone-800 rounded-xl p-5 mt-6 text-left">
              <p className="text-xs text-stone-500 uppercase font-bold tracking-wider mb-2">Remember your commitment:</p>
              <div className="text-sm text-stone-200">
                {state.messages
                  .filter(m => m.role === 'assistant')
                  .map(m => detectCommitment(m.content))
                  .filter(Boolean)
                  .pop() || "Action noted in session."}
              </div>
            </div>

            <button
              onClick={handleFinishSession}
              className="w-full mt-6 py-3 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700/50 rounded-xl transition-all font-medium"
            >
              Close Guide
            </button>
          </div>
        )}

        {/* Chat window */}
        {phase === 'chat' && (
          <div className="flex flex-col" style={{ height: 'calc(100vmax - 180px)', minHeight: '500px' }}>
             {crisisLevel !== 'none' && <SafetyBanner crisisLevel={crisisLevel} />}
             
             <div className="flex-1 overflow-y-auto mb-4 space-y-5 rounded-2xl" style={{ scrollbarWidth: 'none' }}>
                {state.messages.map(msg => {
                   const isUser = msg.role === 'user';
                   const cleanedText = msg.content.replace(/<commitment>[\s\S]*?<\/commitment>/i, '').replace(/<path>[\s\S]*?<\/path>/i, '').trim();
                   const commitmentMatch = msg.content.match(/<commitment>([\s\S]*?)<\/commitment>/i);

                   return (
                     <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                       <div className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 ${
                         isUser 
                           ? 'bg-amber-900/20 border border-amber-500/10 text-stone-200 ml-auto' 
                           : 'bg-stone-800/40 border border-stone-700/30 text-stone-300'
                       }`}>
                         <p className="text-sm leading-relaxed whitespace-pre-wrap">
                           {!isUser && renderBodyCheckIcon(cleanedText)}
                           <span>{cleanedText}</span>
                         </p>
                         
                         {commitmentMatch && (
                           <CommitmentCard commitmentText={commitmentMatch[1].trim()} />
                         )}
                       </div>
                     </div>
                   );
                })}

                {/* Streaming view */}
                {(isLoading || streamingText) && !state.messages.find(m => m.content === streamingText) && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 bg-stone-800/40 border border-stone-700/30 text-stone-300">
                      {streamingText ? (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {renderBodyCheckIcon(streamingText)}
                          <span>{streamingText.replace(/<analysis>[\s\S]*?(<\/analysis>|$)/i, '').replace(/<commitment>/i, '').replace(/<path>[\s\S]*?(<\/path>|$)/i, '').replace(/<path>/i, '')}</span>
                          <span className="inline-block w-1.5 h-3.5 ml-1 bg-amber-500/70 animate-pulse" />
                        </p>
                      ) : (
                        <div className="flex gap-2 items-center h-5">
                          <div className="w-1.5 h-1.5 rounded-full bg-stone-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-1.5 h-1.5 rounded-full bg-stone-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-1.5 h-1.5 rounded-full bg-stone-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
             </div>

             {/* Input area */}
             <div className="bg-stone-900/60 p-3 sm:p-4 rounded-2xl border border-stone-700/50 focus-within:border-amber-500/40 focus-within:bg-stone-900/90 transition-all flex gap-3 shadow-lg">
                <textarea 
                  value={userInput}
                  onChange={e => setUserInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type your response..."
                  className="flex-1 bg-transparent border-none resize-none focus:outline-none focus:ring-0 text-sm py-2 max-h-32 text-stone-100 placeholder-stone-500"
                  rows={2}
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !userInput.trim()}
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-700 hover:bg-amber-600 disabled:opacity-50 disabled:bg-stone-800 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 self-end text-white"
                >
                  <svg className="w-5 h-5 mx-auto ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V6m0 0l-5 5m5-5l5 5" />
                  </svg>
                </button>
             </div>
             
             {error && (
               <div className="mt-3 text-xs text-rose-400 bg-rose-900/20 px-3 py-2 rounded border border-rose-800/30">
                 {error}
               </div>
             )}
          </div>
        )}

      </div>
    </div>
  );
}
