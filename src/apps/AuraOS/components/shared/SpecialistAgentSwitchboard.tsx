import React, { useState, useEffect, useRef } from 'react';
import { X, AlertTriangle, Send, Construction } from 'lucide-react';
import { SPECIALIST_GROUPS, SPECIALIST_AGENTS } from '../../config/specialistAgents.ts';
import {
  createSpecialistSession,
  getSpecialistAgentReply,
  detectAlreadyUsed,
  type SpecialistSession,
  type SpecialistSessionMessage,
} from '../../services/crisisToolsService.ts';
import { detectCrisisLevel, CRISIS_RESOURCES } from '../../utils/crisisDetection.ts';

interface SpecialistAgentSwitchboardProps {
  onClose: () => void;
}

export default function SpecialistAgentSwitchboard({ onClose }: SpecialistAgentSwitchboardProps) {
  const [activeSession, setActiveSession] = useState<SpecialistSession | null>(null);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHarmReduction, setShowHarmReduction] = useState(false);
  const [showCrisisResources, setShowCrisisResources] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeSession?.messages]);

  useEffect(() => {
    if (activeSession && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeSession]);

  const startSession = (agentId: string) => {
    const session = createSpecialistSession(agentId);
    if (session) {
      setActiveSession(session);
      setShowHarmReduction(false);
      setShowCrisisResources(false);
    }
  };

  const closeSession = () => {
    setActiveSession(null);
    setUserInput('');
    setShowHarmReduction(false);
    setShowCrisisResources(false);
  };

  const handleSendMessage = async () => {
    if (!activeSession || !userInput.trim() || isLoading) return;

    const message = userInput.trim();
    setUserInput('');

    const crisisLevel = detectCrisisLevel(message);
    if (crisisLevel === 'high' || crisisLevel === 'concern') {
      setShowCrisisResources(true);
    }

    if (detectAlreadyUsed(message)) {
      setShowHarmReduction(true);
    }

    const updatedMessages: SpecialistSessionMessage[] = [
      ...activeSession.messages,
      { role: 'user', content: message },
    ];

    setActiveSession({
      ...activeSession,
      messages: updatedMessages,
    });

    setIsLoading(true);

    const response = await getSpecialistAgentReply(activeSession, message);

    setIsLoading(false);

    if (response.success && response.text) {
      setActiveSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [
            ...prev.messages,
            { role: 'assistant', content: response.text },
          ],
        };
      });
    } else {
      setActiveSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [
            ...prev.messages,
            {
              role: 'assistant',
              content: 'Unable to respond right now. If this is an emergency, call 988 or go to your nearest emergency room.',
            },
          ],
        };
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!activeSession) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="bg-slate-900 border-2 border-red-500/40 rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 z-10">
            <div className="bg-amber-950/90 backdrop-blur-sm border-b border-amber-500/30 px-4 py-2 flex items-center justify-center gap-2 text-center">
              <Construction size={18} className="text-amber-500 flex-shrink-0" />
              <p className="text-sm font-medium text-amber-200">
                <span className="font-bold uppercase tracking-wider mr-1 sm:mr-2">Under Construction</span>
                New specialist protocols are currently being trained.
              </p>
            </div>
            <div className="bg-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-100">Crisis Tools</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Fast, protocol-driven interventions for addiction cravings
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-200 transition"
                aria-label="Close"
              >
                <X size={28} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {SPECIALIST_GROUPS.map(group => {
              const agents = SPECIALIST_AGENTS.filter(agent =>
                group.agentIds.includes(agent.id)
              );

              return (
                <div key={group.id} className="space-y-4">
                  <div className="border-l-4 border-red-500/60 pl-4">
                    <h3 className="text-xl font-bold text-slate-100">{group.title}</h3>
                    <p className="text-sm text-slate-400 mt-1">{group.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {agents.map(agent => (
                      <button
                        key={agent.id}
                        onClick={() => startSession(agent.id)}
                        className="bg-slate-800/60 border border-slate-700/80 hover:border-red-500/40 rounded-lg p-4 text-left transition-all hover:bg-slate-800 group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-bold text-slate-100 group-hover:text-red-400 transition">
                            {agent.buttonLabel}
                          </h4>
                        </div>
                        <p className="text-sm text-slate-400">{agent.subtitle}</p>
                        <p className="text-xs text-slate-500 mt-2">Agent: {agent.agentName}</p>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="bg-amber-900/20 border border-amber-600/40 rounded-lg p-4 mt-8">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-100/90 space-y-2">
                  <p className="font-semibold">Emergency Resources</p>
                  <p>
                    If you are in immediate danger or have already used, please call 988 (Suicide
                    & Crisis Lifeline) or go to your nearest emergency room.
                  </p>
                  <p>These tools are for craving intervention, not medical emergencies.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const visibleMessages = activeSession.messages.filter(msg => msg.role !== 'system');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border-2 border-red-500/40 rounded-lg shadow-2xl w-full max-w-3xl h-[90vh] flex flex-col">
        <div className="bg-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-100">{activeSession.agent.agentName}</h2>
            <p className="text-sm text-slate-400">{activeSession.agent.buttonLabel}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={closeSession}
              className="text-slate-400 hover:text-slate-200 text-sm px-3 py-1 border border-slate-700 rounded hover:border-slate-600 transition"
            >
              Back
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 transition"
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {(showCrisisResources || showHarmReduction) && (
          <div className="bg-red-900/30 border-b border-red-600/40 px-6 py-3 flex-shrink-0">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-100/90 space-y-1">
                {showHarmReduction && (
                  <p className="font-semibold">
                    Harm Reduction Mode: If you've already used, focus on safety. Are you alone?
                    Do you have water? Avoid driving or operating machinery.
                  </p>
                )}
                {showCrisisResources && (
                  <p>
                    <span className="font-semibold">Crisis Support:</span> Call 988 (US) or text
                    HELLO to 741741. You don't have to face this alone.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {visibleMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-slate-700/60 text-slate-100'
                    : 'bg-red-900/20 border border-red-700/30 text-slate-100'
                }`}
              >
                {msg.role === 'assistant' && (
                  <p className="text-xs text-red-400 font-semibold mb-1">
                    {activeSession.agent.agentName}
                  </p>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-red-900/20 border border-red-700/30 rounded-lg px-4 py-3 max-w-[80%]">
                <p className="text-xs text-red-400 font-semibold mb-1">
                  {activeSession.agent.agentName}
                </p>
                <p className="text-sm text-slate-400">Thinking...</p>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        <div className="bg-slate-800/50 border-t border-slate-700 px-4 py-4 flex-shrink-0">
          <div className="flex items-end gap-3">
            <textarea
              ref={inputRef}
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your response..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500/40 resize-none"
              rows={2}
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!userInput.trim() || isLoading}
              className="bg-red-600 hover:bg-red-700 disabled:bg-slate-700 disabled:text-slate-500 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2"
            >
              <Send size={18} />
              Send
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
