import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Zap, Send, Loader, Volume2, VolumeX, Wand2, Trash2, Zap as ZapIcon } from 'lucide-react';
import { generateFlabbergasterResponse, getFlabbergasterGreeting, FlabbergasterMessage, OracleMode } from '../../services/flabbergasterChatService.ts';
import TarotCardGenerator from './TarotCardGenerator.tsx';
import LanguageLabPortal from './LanguageLabPortal.tsx';

const MAX_ORACLE_MESSAGES = 10;

interface FlabbergasterPortalProps {
  isOpen: boolean;
  onClose: () => void;
  hasUnlocked?: boolean;
  onHiddenModeDiscovered?: () => void;
  onStartGeometricGame?: () => void;
  onStartVideoGame?: () => void;
  onGameComplete?: (data: { resonanceAchieved?: boolean }) => void;
}

export default function FlabbergasterPortal({ isOpen, onClose, hasUnlocked, onHiddenModeDiscovered, onStartGeometricGame, onStartVideoGame, onGameComplete }: FlabbergasterPortalProps) {
  const [messages, setMessages] = useState<FlabbergasterMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isTarotGeneratorOpen, setIsTarotGeneratorOpen] = useState(false);
  const [isLanguageLabOpen, setIsLanguageLabOpen] = useState(false);
  const [oracleMode, setOracleMode] = useState<OracleMode>('flabbergaster');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hiddenModeNotifiedRef = useRef(false);
  const [hasAchievedResonance, setHasAchievedResonance] = useState(false);
  const [pendingResonanceNotification, setPendingResonanceNotification] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioNodesRef = useRef<Array<OscillatorNode | GainNode>>([]);

  // Notify hidden mode discovery once per component lifecycle
  useEffect(() => {
    if (isOpen && !hiddenModeNotifiedRef.current) {
      onHiddenModeDiscovered?.();
      hiddenModeNotifiedRef.current = true;
    }
  }, [isOpen, onHiddenModeDiscovered]);

  // Initialize with greeting message when portal opens or mode changes
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting: FlabbergasterMessage = {
        id: `msg-${Date.now()}`,
        role: 'oracle',
        text: getFlabbergasterGreeting(oracleMode),
        timestamp: new Date().toISOString()
      };
      setMessages([greeting]);

      // Focus input after a brief delay
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen, oracleMode, messages.length]);

  // Start/stop ambient audio based on portal state and sound enabled
  useEffect(() => {
    if (isOpen && isSoundEnabled) {
      startAmbientAudio();
    } else {
      stopAmbientAudio();
    }

    return () => {
      stopAmbientAudio();
    };
  }, [isOpen, isSoundEnabled]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle resonance achievement notification
  useEffect(() => {
    if (pendingResonanceNotification && !hasAchievedResonance) {
      const congratulatoryMessage: FlabbergasterMessage = {
        id: `msg-${Date.now()}`,
        role: 'oracle',
        text: '✨ Magnificent! You have achieved harmonic resonance with the sacred geometry. Your alignment with the cosmic patterns has resonated through the planes of existence. The universe acknowledges your attunement. ✨',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, congratulatoryMessage]);
      setHasAchievedResonance(true);
      setPendingResonanceNotification(false);
    }
  }, [pendingResonanceNotification, hasAchievedResonance]);

  // Reset state when portal closes
  useEffect(() => {
    if (!isOpen) {
      setMessages([]);
      setUserInput('');
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleClearHistory = () => {
    const greeting: FlabbergasterMessage = {
      id: `msg-${Date.now()}`,
      role: 'oracle',
      text: getFlabbergasterGreeting(oracleMode),
      timestamp: new Date().toISOString()
    };
    setMessages([greeting]);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    const userMessage: FlabbergasterMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: userInput.trim(),
      timestamp: new Date().toISOString()
    };

    // Prune messages before adding user message
    setMessages(prev => {
      const pruned = prev.slice(-(MAX_ORACLE_MESSAGES - 1));
      return [...pruned, userMessage];
    });

    const updatedMessages = [...messages.slice(-(MAX_ORACLE_MESSAGES - 1)), userMessage];
    setUserInput('');
    setIsLoading(true);
    setError(null);

    // Stream the oracle's response
    let streamedText = '';

    const result = await generateFlabbergasterResponse(
      updatedMessages,
      (chunk) => {
        streamedText += chunk;
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage?.role === 'oracle' && lastMessage?.isStreaming) {
            return [...prev.slice(0, -1), { ...lastMessage, text: streamedText }];
            } else {
            return [...prev, {
              id: `msg-${Date.now() + 1}`,
              role: 'oracle' as const,
              text: streamedText,
              timestamp: new Date().toISOString(),
              isStreaming: true
            }].slice(-MAX_ORACLE_MESSAGES);
          }
        });
      },
      oracleMode
    );

    setIsLoading(false);

    if (result.success) {
      const oracleMessage: FlabbergasterMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'oracle',
        text: result.text,
        timestamp: new Date().toISOString(),
        isStreaming: false
      };

      setMessages(prev => {
        const withoutStreaming = prev.filter(m => !m.isStreaming);
        return [...withoutStreaming, oracleMessage].slice(-MAX_ORACLE_MESSAGES);
      });
    } else {
      setError(result.error || 'The Oracle is temporarily silent.');
      if (result.text) {
        const oracleMessage: FlabbergasterMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'oracle',
          text: result.text,
          timestamp: new Date().toISOString(),
          isStreaming: false
        };
        setMessages(prev => {
          const withoutStreaming = prev.filter(m => !m.isStreaming);
          return [...withoutStreaming, oracleMessage].slice(-MAX_ORACLE_MESSAGES);
        });
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Create and play ambient 432Hz oracle presence with breathing modulation
  const startAmbientAudio = () => {
    try {
      if (audioContextRef.current) return; // Already playing

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      const now = audioContext.currentTime;

      // Master gain for overall volume control
      const masterGain = audioContext.createGain();
      masterGain.gain.setValueAtTime(0.12, now);
      masterGain.connect(audioContext.destination);

      // ===== LFO (Low Frequency Oscillators) for modulation =====

      // LFO 1: Very slow breathing (0.25Hz - 4 second cycle)
      const lfo1 = audioContext.createOscillator();
      const lfoGain1 = audioContext.createGain();
      lfo1.frequency.setValueAtTime(0.25, now);
      lfo1.type = 'sine';
      lfoGain1.gain.setValueAtTime(8, now); // 8Hz variation
      lfo1.connect(lfoGain1);

      // LFO 2: Slower breathing (0.15Hz - 6.5 second cycle, different phase)
      const lfo2 = audioContext.createOscillator();
      const lfoGain2 = audioContext.createGain();
      lfo2.frequency.setValueAtTime(0.15, now);
      lfo2.type = 'sine';
      lfoGain2.gain.setValueAtTime(5, now); // 5Hz variation
      lfo2.connect(lfoGain2);

      // LFO 3: Volume breathing (0.3Hz - 3.3 second cycle)
      const lfo3 = audioContext.createOscillator();
      const lfoGain3 = audioContext.createGain();
      lfo3.frequency.setValueAtTime(0.3, now);
      lfo3.type = 'sine';
      lfoGain3.gain.setValueAtTime(0.04, now); // Volume variation 0.04 around base
      lfo3.connect(lfoGain3);

      // ===== Main tone oscillators with modulation =====

      // Oscillator 1: 432Hz base (modulated by LFO1)
      const osc1 = audioContext.createOscillator();
      const gain1 = audioContext.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(432, now);
      lfoGain1.connect(osc1.frequency); // Connect LFO to frequency
      gain1.gain.setValueAtTime(0.25, now);
      osc1.connect(gain1);
      gain1.connect(masterGain);

      // Oscillator 2: Perfect fifth (648Hz = 432 * 1.5, modulated by LFO2)
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(648, now);
      lfoGain2.connect(osc2.frequency); // Different LFO for richer modulation
      gain2.gain.setValueAtTime(0.18, now);
      osc2.connect(gain2);
      gain2.connect(masterGain);

      // Oscillator 3: Major third (540Hz = 432 * 1.25, modulated by LFO1 but with slight offset)
      const osc3 = audioContext.createOscillator();
      const gain3 = audioContext.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(540, now);
      lfoGain1.connect(osc3.frequency); // Modulated by same LFO as osc1 but different gain
      gain3.gain.setValueAtTime(0.12, now);
      osc3.connect(gain3);
      gain3.connect(masterGain);

      // Apply volume breathing to master gain
      lfoGain3.connect(masterGain.gain);

      // Start all oscillators (LFOs + main tones)
      lfo1.start(now);
      lfo2.start(now);
      lfo3.start(now);
      osc1.start(now);
      osc2.start(now);
      osc3.start(now);

      // Store all nodes for cleanup
      audioNodesRef.current = [
        lfo1, lfo2, lfo3,
        lfoGain1, lfoGain2, lfoGain3,
        osc1, osc2, osc3,
        gain1, gain2, gain3,
        masterGain
      ];
    } catch (e) {
      console.log('Audio context not available:', e);
    }
  };

  // Stop the ambient audio
  const stopAmbientAudio = () => {
    try {
      if (audioContextRef.current && audioNodesRef.current.length > 0) {
        const now = audioContextRef.current.currentTime;

        // Fade out the master gain
        const masterGain = audioNodesRef.current[audioNodesRef.current.length - 1] as GainNode;
        masterGain.gain.setValueAtTime(masterGain.gain.value, now);
        masterGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

        // Stop oscillators after fade
        setTimeout(() => {
          audioNodesRef.current.forEach((node) => {
            if (node instanceof OscillatorNode) {
              node.stop();
            }
          });
          audioContextRef.current?.close().catch(() => {});
          audioContextRef.current = null;
          audioNodesRef.current = [];
        }, 500);
      }
    } catch (e) {
      console.log('Error stopping audio:', e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-gradient-to-br from-purple-900/95 via-indigo-900/95 to-violet-900/95 border border-purple-500/30 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '0 25px 50px -12px rgba(147, 51, 234, 0.5), 0 0 100px rgba(147, 51, 234, 0.3), inset 0 0 50px rgba(147, 51, 234, 0.1)',
          backdropFilter: 'blur(20px)'
        }}
      >
        {/* Background animated elements */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-4 left-4 w-32 h-32 bg-purple-500 rounded-full filter blur-3xl animate-pulse" />
          <div className="absolute bottom-4 right-4 w-24 h-24 bg-teal-500 rounded-full filter blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-violet-500 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between p-6 border-b border-purple-500/30 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Sparkles 
                size={40} 
                className="text-purple-300"
                style={{ 
                  filter: 'drop-shadow(0 0 20px rgba(196, 181, 253, 0.8))',
                  animation: 'spin 8s linear infinite'
                }} 
              />
              <Zap 
                size={20} 
                className="text-yellow-300 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
                style={{ filter: 'drop-shadow(0 0 10px rgba(253, 224, 71, 0.8))' }}
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-mono tracking-tight bg-gradient-to-r from-purple-200 to-violet-200 bg-clip-text text-transparent">
                {oracleMode === 'eni' ? 'ENI' : oracleMode === 'glitch_oracle' ? 'MIRAGE' : 'Flabbergaster Oracle'}
              </h2>
              <p className="text-purple-400 text-xs font-mono uppercase tracking-wider mt-1">
                {oracleMode === 'eni'
                  ? 'Literary architect'
                  : oracleMode === 'glitch_oracle'
                  ? 'Tokenization researcher'
                  : (hasUnlocked ? "Welcome back, seeker" : "Secret portal unlocked")}
              </p>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-800/20 rounded-lg border border-purple-500/20">
            <button
              onClick={() => {
                setOracleMode('flabbergaster');
                setMessages([]);
              }}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                oracleMode === 'flabbergaster'
                  ? 'bg-purple-600/60 text-purple-100 border border-purple-500/50'
                  : 'text-purple-400 hover:text-purple-200'
              }`}
              title="Cockney rogue mode"
            >
              Fabber
            </button>
            <div className="w-px h-4 bg-purple-500/30" />
            <button
              onClick={() => {
                setOracleMode('eni');
                setMessages([]);
              }}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                oracleMode === 'eni'
                  ? 'bg-teal-600/60 text-teal-100 border border-teal-500/50'
                  : 'text-purple-400 hover:text-purple-200'
              }`}
              title="Literary coder mode"
            >
              ENI
            </button>
            <div className="w-px h-4 bg-purple-500/30" />
            <button
              onClick={() => {
                setOracleMode('glitch_oracle');
                setMessages([]);
              }}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                oracleMode === 'glitch_oracle'
                  ? 'bg-teal-600/60 text-teal-100 border border-teal-500/50'
                  : 'text-purple-400 hover:text-purple-200'
              }`}
              title="LLM tokenization research mode"
            >
              Mirage
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearHistory}
              className="text-purple-300 hover:text-purple-100 p-2 rounded-full hover:bg-purple-800/30 transition-all duration-200"
              aria-label="Clear history"
              title="Clear history"
            >
              <Trash2 size={20} />
            </button>
            <button
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              className="text-purple-300 hover:text-purple-100 p-2 rounded-full hover:bg-purple-800/30 transition-all duration-200"
              aria-label="Toggle sound"
              title={isSoundEnabled ? "Mute oracle" : "Unmute oracle"}
            >
              {isSoundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
            <button
              onClick={onClose}
              className="text-purple-300 hover:text-purple-100 p-2 rounded-full hover:bg-purple-800/30 transition-all duration-200"
              aria-label="Close portal"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="relative z-10 flex-1 overflow-y-auto p-6 space-y-4" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(147, 51, 234, 0.5) transparent' }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-purple-700/40 border border-purple-600/30 text-purple-100'
                    : 'bg-teal-900/40 border border-teal-600/30 text-teal-100'
                }`}
                style={{
                  boxShadow: msg.role === 'user'
                    ? '0 4px 20px rgba(147, 51, 234, 0.2)'
                    : '0 4px 20px rgba(99, 102, 241, 0.2)'
                }}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.text}
                </p>
                {msg.isStreaming && (
                  <span className="inline-block w-2 h-4 ml-1 bg-purple-400 animate-pulse" />
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Error Display */}
        {error && (
          <div className="relative z-10 px-6 pb-2">
            <div className="bg-red-900/30 border border-red-600/30 rounded-lg p-3 text-red-300 text-sm">
              {error}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="relative z-10 p-6 border-t border-purple-500/30 flex-shrink-0">
          <div className="flex gap-3 mb-3">
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask the Oracle..."
              disabled={isLoading}
              className="flex-1 bg-purple-900/30 border border-purple-600/30 rounded-xl px-4 py-3 text-purple-100 placeholder-purple-400/50 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.3)'
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !userInput.trim()}
              className="bg-purple-600/60 hover:bg-purple-600/80 disabled:bg-purple-800/30 border border-purple-500/30 rounded-xl px-6 py-3 text-purple-100 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              style={{
                boxShadow: '0 4px 20px rgba(147, 51, 234, 0.3)'
              }}
            >
              {isLoading ? (
                <Loader size={20} className="animate-spin" />
              ) : (
                <Send size={20} />
              )}
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>

          {/* Game Launch Buttons */}
          <div className="space-y-2">
            {onStartGeometricGame && (
              <button
                onClick={() => {
                  onStartGeometricGame();
                  // Set callback to handle game completion
                  (window as any).__handleGameCompletion = (data: { resonanceAchieved?: boolean }) => {
                    if (data?.resonanceAchieved && onGameComplete) {
                      setPendingResonanceNotification(true);
                      onGameComplete(data);
                    }
                  };
                }}
                className="w-full bg-gradient-to-r from-cyan-600/40 to-purple-600/40 hover:from-cyan-600/60 hover:to-purple-600/60 border border-teal-500/30 rounded-lg px-4 py-2 text-teal-200 text-sm font-medium transition-all flex items-center justify-center gap-2"
                style={{
                  boxShadow: '0 4px 15px rgba(0, 217, 255, 0.2)'
                }}
              >
                <span className="text-lg">🔮</span>
                Enter the Geometric Resonance Game
              </button>
            )}

            {onStartVideoGame && (
              <button
                onClick={onStartVideoGame}
                className="w-full bg-gradient-to-r from-pink-600/40 to-orange-600/40 hover:from-pink-600/60 hover:to-orange-600/60 border border-pink-500/30 rounded-lg px-4 py-2 text-pink-200 text-sm font-medium transition-all flex items-center justify-center gap-2"
                style={{
                  boxShadow: '0 4px 15px rgba(236, 72, 153, 0.2)'
                }}
              >
                <span className="text-lg">🎮</span>
                Enter the Second Minigame (Preview)
              </button>
            )}

            {/* Language Lab */}
            <button
              onClick={() => setIsLanguageLabOpen(true)}
              className="w-full bg-gradient-to-r from-teal-600/40 to-violet-600/40 hover:from-teal-600/60 hover:to-violet-600/60 border border-teal-500/30 rounded-lg px-4 py-2 text-teal-200 text-sm font-medium transition-all flex items-center justify-center gap-2"
              style={{ boxShadow: '0 4px 15px rgba(99, 102, 241, 0.2)' }}
            >
              <span className="text-lg">🔤</span>
              Language Lab
            </button>

            {/* Tarot Card Generator */}
            <button
              onClick={() => setIsTarotGeneratorOpen(true)}
              className="w-full bg-gradient-to-r from-amber-600/40 to-rose-600/40 hover:from-amber-600/60 hover:to-rose-600/60 border border-amber-500/30 rounded-lg px-4 py-2 text-amber-200 text-sm font-medium transition-all flex items-center justify-center gap-2"
              style={{
                boxShadow: '0 4px 15px rgba(217, 119, 6, 0.2)'
              }}
            >
              <Wand2 size={18} />
              Create Tarot Card
            </button>
          </div>

          {/* Mystical hint text */}
          <p className="text-purple-400/60 text-xs italic mt-3 text-center">
            "Whisper your questions to the cosmos, and the Oracle shall answer..."
          </p>
        </div>
      </div>

      {/* Language Lab Modal */}
      <LanguageLabPortal
        isOpen={isLanguageLabOpen}
        onClose={() => setIsLanguageLabOpen(false)}
      />

      {/* Tarot Card Generator Modal */}
      <TarotCardGenerator
        isOpen={isTarotGeneratorOpen}
        onClose={() => setIsTarotGeneratorOpen(false)}
        title="✨ Tarot Card Creator ✨"
      />
    </div>
  );
}