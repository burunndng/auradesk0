import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import { SacredLockIcon } from '../shared/SacredNavIcons';
import { getIconComponent } from '../../.claude/lib/iconMap';
import { callScarlettVex } from '../../services/sexologyCoachService';
import { StorageManager } from '../../.claude/lib/storageManager';
import { useSubscription } from '../../hooks/useSubscription';
import { detectCrisisLevel } from '../../utils/crisisDetection';
import SafetyBanner from '../shared/SafetyBanner';
import ProtocolPanel from './sexology/ProtocolPanel';
import ProtocolDrawer from './sexology/ProtocolDrawer';
import type { SexologyProtocol } from '../../data/sexologyProtocols';

interface SexologyMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface SexologySession {
  id: string;
  messages: SexologyMessage[];
  createdAt: number;
  updatedAt: number;
}

interface SexologyCoachWizardProps {
  onClose: () => void;
  userId?: string;
}

const INITIAL_MESSAGE = `I'm Scarlett Vex — dual doctorates in clinical sexology and comparative theology, which is an odd combination that turns out to be useful.

What brings you here? Curiosity, a specific challenge, recovering from something, or you just want to understand how you work?`;

const SCARLETT_VEX_AVATAR = (
  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-900/40 ring-1 ring-rose-500/20">
    <span className="text-rose-100 font-serif font-light text-sm tracking-wide">SV</span>
  </div>
);

const SCARLETT_VEX_AVATAR_SM = (
  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-600 to-red-800 flex items-center justify-center shadow-md shadow-red-900/30 ring-1 ring-rose-500/15 flex-shrink-0 mt-0.5">
    <span className="text-rose-100 font-serif font-light text-[10px] tracking-wide">SV</span>
  </div>
);

type OverlayView = 'none' | 'drawer' | 'protocol';

export default function SexologyCoachWizard({ onClose, userId }: SexologyCoachWizardProps) {
  const { isProOrAbove, isPremiumWizard } = useSubscription();
  const [showAgeGate, setShowAgeGate] = useState(true);
  const [gateDismissed, setGateDismissed] = useState(false);
  const [session, setSession] = useState<SexologySession | null>(null);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [crisisLevel, setCrisisLevel] = useState<'none' | 'concern' | 'high'>('none');
  const [overlayView, setOverlayView] = useState<OverlayView>('none');
  const [activeProtocol, setActiveProtocol] = useState<SexologyProtocol | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showAgeGate) {
      const storageKey = 'aura-sexologyCoach';
      const saved = StorageManager.getUntyped(storageKey);
      if (saved && typeof saved === 'object' && Array.isArray((saved as any).messages) && (saved as any).id) {
        try {
          setSession(saved as SexologySession);
        } catch (e) {
          console.error('Failed to load sexology session:', e);
          initNewSession();
        }
      } else if (!session) {
        initNewSession();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAgeGate]);

  const initNewSession = () => {
    setSession({
      id: `sexology-${Date.now()}`,
      messages: [
        { role: 'assistant', content: INITIAL_MESSAGE, timestamp: Date.now() }
      ],
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages]);

  useEffect(() => {
    if (session) {
      StorageManager.setUntyped('aura-sexologyCoach', session);
    }
  }, [session]);

  const appendAssistantMessage = useCallback((content: string, baseSession: SexologySession): SexologySession => ({
    ...baseSession,
    messages: [
      ...baseSession.messages,
      { role: 'assistant' as const, content, timestamp: Date.now() }
    ],
    updatedAt: Date.now()
  }), []);

  const handleSend = async () => {
    if (!inputText.trim() || isThinking || !session) return;

    const userMessage = inputText.trim();
    setInputText('');

    const level = detectCrisisLevel(userMessage);
    setCrisisLevel(level);
    if (level === 'high') return;

    const updatedSession: SexologySession = {
      ...session,
      messages: [
        ...session.messages,
        { role: 'user' as const, content: userMessage, timestamp: Date.now() }
      ],
      updatedAt: Date.now()
    };
    setSession(updatedSession);
    setIsThinking(true);

    try {
      const conversationMessages = updatedSession.messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await callScarlettVex(conversationMessages);

      const replyText = response.success
        ? response.text
        : "I had trouble with that. Try again?";

      setSession(appendAssistantMessage(replyText, updatedSession));
    } catch (error) {
      console.error('Error in handleSend:', error);
      setSession(appendAssistantMessage("Something went wrong. Let's try again.", updatedSession));
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelectProtocol = (protocol: SexologyProtocol) => {
    setActiveProtocol(protocol);
    setOverlayView('protocol');
  };

  const handleProtocolComplete = async (debriefContext: string) => {
    if (!session || !activeProtocol) return;

    setOverlayView('none');
    setActiveProtocol(null);

    const debriefSetup = debriefContext
      ? `[User just completed the ${activeProtocol.name} protocol. Their reflections: ${debriefContext}] ${activeProtocol.debriefPrompt}`
      : `[User just completed the ${activeProtocol.name} protocol with no written reflections.] ${activeProtocol.debriefPrompt}`;

    const markerSession: SexologySession = {
      ...session,
      messages: [
        ...session.messages,
        {
          role: 'assistant' as const,
          content: `— ${activeProtocol.name} —`,
          timestamp: Date.now()
        }
      ],
      updatedAt: Date.now()
    };
    setSession(markerSession);
    setIsThinking(true);

    try {
      const conversationMessages = [
        ...markerSession.messages.filter(m => !m.content.startsWith('—')).map(m => ({
          role: m.role,
          content: m.content
        })),
        { role: 'user' as const, content: debriefSetup }
      ];

      const response = await callScarlettVex(conversationMessages);
      const replyText = response.success ? response.text : activeProtocol.debriefPrompt;
      setSession(appendAssistantMessage(replyText, markerSession));
    } catch {
      setSession(appendAssistantMessage(activeProtocol.debriefPrompt, markerSession));
    } finally {
      setIsThinking(false);
    }
  };

  const handleProtocolDismiss = () => {
    setOverlayView('none');
    setActiveProtocol(null);
  };

  // ─── Premium gate ───
  if (!isProOrAbove && isPremiumWizard('sexology-coach') && !gateDismissed) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/95 backdrop-blur-md">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-rose-500/3 blur-[120px] rounded-full" />
        </div>

        <div className="relative bg-stone-950 border border-rose-500/25 rounded-2xl max-w-sm p-8 shadow-2xl shadow-red-950/30 text-center">
          <div className="w-14 h-14 rounded-full bg-rose-950/40 border border-rose-500/25 flex items-center justify-center mx-auto mb-5">
            <SacredLockIcon size={28} className="text-rose-400" />
          </div>
          <h3 className="text-lg font-serif font-light text-stone-100 mb-2">Private Session</h3>
          <p className="text-sm text-stone-400 mb-6 leading-relaxed">
            Scarlett Vex is available on the Pro plan. Upgrade to unlock unlimited access.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-rose-600 hover:bg-rose-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-150 shadow-lg shadow-red-900/20"
          >
            Close
          </button>
          <button
            onClick={() => setGateDismissed(true)}
            className="mt-4 text-xs text-stone-600 hover:text-stone-400 transition-colors w-full"
          >
            Maybe later
          </button>
        </div>
      </div>
    );
  }

  // ─── Age gate ───
  if (showAgeGate) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/95 backdrop-blur-md">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-rose-500/3 blur-[140px] rounded-full" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-red-900/4 blur-[100px] rounded-full" />
        </div>

        <div className="relative bg-stone-950 border border-rose-500/20 rounded-2xl max-w-md p-8 shadow-2xl shadow-red-950/40">
          <div className="flex justify-center mb-6">
            {SCARLETT_VEX_AVATAR}
          </div>
          <h2 className="text-2xl font-serif font-light text-stone-100 mb-2 text-center">Scarlett Vex</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500/50 text-center mb-6">
            Sexology · Embodiment · Desire
          </p>
          <p className="text-sm text-stone-400 mb-6 text-center leading-relaxed">
            This is an explicit sexual health coaching space for adults only.
          </p>

          <div className="bg-red-950/30 border border-red-500/20 rounded-xl p-4 mb-6">
            <p className="text-sm text-red-300 font-semibold mb-1.5">18+ Only</p>
            <p className="text-xs text-stone-400 leading-relaxed">
              By continuing, you confirm that you are 18 years or older and consent to discuss sexual health, desire, pleasure, and embodiment without euphemism.
            </p>
          </div>

          <button
            onClick={() => setShowAgeGate(false)}
            className="w-full bg-rose-600 hover:bg-rose-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-150 shadow-lg shadow-red-900/20"
          >
            I understand · Continue
          </button>
          <button
            onClick={onClose}
            className="w-full mt-3 bg-stone-900/60 hover:bg-stone-800/80 text-stone-400 hover:text-stone-300 px-6 py-3 rounded-xl transition-all duration-150 border border-stone-700/30"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // ─── Main chat ───
  return (
    <div className="fixed inset-0 z-50 bg-stone-950/95 backdrop-blur-md">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 left-1/3 w-[500px] h-[200px] bg-rose-500/3 blur-[140px] rounded-full" />
        <div className="absolute bottom-10 right-[20%] w-[350px] h-[350px] bg-red-900/3 blur-[120px] rounded-full" />
      </div>

      {/* Centered container */}
      <div className="relative h-full flex items-center justify-center p-2 md:p-4">
        <div className="bg-stone-950 border border-rose-500/15 rounded-2xl w-full max-w-2xl h-[90dvh] md:h-[85dvh] flex flex-col shadow-2xl shadow-red-950/20 relative overflow-hidden">

          {/* Protocol overlays */}
          {overlayView === 'drawer' && (
            <ProtocolDrawer
              onSelectProtocol={handleSelectProtocol}
              onClose={() => setOverlayView('none')}
            />
          )}
          {overlayView === 'protocol' && activeProtocol && (
            <ProtocolPanel
              protocol={activeProtocol}
              onComplete={handleProtocolComplete}
              onDismiss={handleProtocolDismiss}
            />
          )}

          {/* ─── Header ─── */}
          <header className="flex items-center justify-between px-5 py-4 border-b border-rose-500/10 flex-shrink-0">
            <div className="flex items-center gap-3">
              {SCARLETT_VEX_AVATAR}
              <div>
                <h1 className="text-lg font-serif font-light text-stone-100 leading-tight">Scarlett Vex</h1>
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-600 mt-0.5">Private session</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {/* Subtle presence indicator */}
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500/60 mr-2" />
              <button
                onClick={() => setOverlayView('drawer')}
                className="p-2 hover:bg-rose-500/8 rounded-xl transition-all duration-150"
                title="Protocols"
              >
                {React.createElement(getIconComponent('Resonator') || 'div', { size: 18, className: 'text-stone-500 hover:text-rose-400 transition-colors duration-150' })}
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-stone-800/60 rounded-xl transition-all duration-150"
                title="Close"
              >
                <X size={18} className="text-stone-600 hover:text-stone-400 transition-colors duration-150" />
              </button>
            </div>
          </header>

          {/* ─── Messages ─── */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
            {crisisLevel !== 'none' && (
              <SafetyBanner crisisLevel={crisisLevel} />
            )}

            {session?.messages.map((msg, idx) => {
              // Protocol completion marker
              const isMarker = msg.content.startsWith('—') && msg.content.endsWith('—');
              if (isMarker) {
                return (
                  <div key={idx} className="flex items-center gap-4 py-2">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-rose-500/15 to-transparent" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-rose-500/40 whitespace-nowrap">
                      {msg.content.replace(/—/g, '').trim()}
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-rose-500/15 to-transparent" />
                  </div>
                );
              }

              return (
                <div
                  key={idx}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start items-start'}`}
                >
                  {msg.role === 'assistant' && SCARLETT_VEX_AVATAR_SM}
                  <div
                    className={`max-w-[78%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                        ? 'bg-rose-950/25 border border-rose-500/15 text-stone-200'
                        : 'bg-stone-900/40 border border-stone-700/25 text-stone-300'
                      }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    <p className="text-[10px] text-stone-600 mt-2 select-none">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Thinking state */}
            {isThinking && (
              <div className="flex items-start gap-3">
                {SCARLETT_VEX_AVATAR_SM}
                <div className="bg-stone-900/40 border border-stone-700/25 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-400/80 animate-pulse" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-400/60 animate-pulse" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-400/40 animate-pulse" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs text-stone-500 italic">considering</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ─── Input ─── */}
          <div className="flex-shrink-0 border-t border-rose-500/8 bg-stone-950/80 px-5 py-4">
            <div className="flex gap-2.5">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Speak freely…"
                rows={1}
                className="flex-1 bg-stone-900/50 border border-stone-700/40 rounded-xl px-4 py-3 text-stone-200 placeholder-stone-600 focus:outline-none focus:border-rose-500/25 focus:ring-1 focus:ring-rose-500/15 text-sm resize-none transition-all duration-150 leading-relaxed"
                disabled={isThinking}
                style={{ minHeight: '44px', maxHeight: '120px' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = '44px';
                  target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                }}
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim() || isThinking}
                className="self-end bg-rose-600 hover:bg-rose-500 text-white w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-red-900/20"
                aria-label="Send"
              >
                {React.createElement(getIconComponent('ApophaticFrame') || 'div', { size: 16 })}
              </button>
            </div>

            <div className="flex items-center justify-between mt-2.5 px-1">
              <p className="text-[10px] text-stone-600 tracking-wide select-none">
                Enter to send · encrypted · private
              </p>
              <button
                onClick={() => setOverlayView('drawer')}
                className="text-[10px] font-bold uppercase tracking-widest text-rose-500/40 hover:text-rose-400/70 transition-colors duration-150 flex items-center gap-1.5"
              >
                {React.createElement(getIconComponent('Resonator') || 'div', { size: 10 })}
                Protocols
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
