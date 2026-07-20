/**
 * PsychedelicChatStep - Optional AI chat conversation for prep/integration wizards
 *
 * Features:
 * - OpenRouter API with grok-4.1-fast model
 * - Dynamic AI-generated opening message (falls back to static template)
 * - Phase-based system prompt swapping (reflect → explore → action)
 * - Chat summary generated on finish
 * - Skippable with secondary "Skip Chat" button
 * - Can finish anytime (no minimum exchanges required)
 */

import React, { useState, useEffect, useRef } from 'react';
import { Send, X, ArrowRight } from 'lucide-react';
import { generateOpenRouterResponse } from '../../services/openRouterService';
import {
  generateOpeningMessage,
  getActiveSystemPrompt,
} from '../../constants/psychedelicPrompts';
import type { PsychedelicJourneySession, PsychedelicChatMessage } from '../../types';

interface PsychedelicChatStepProps {
  session: Partial<PsychedelicJourneySession>;
  mode: 'prep' | 'integration';
  onFinish: (messages: PsychedelicChatMessage[], skipped: boolean, chatSummary?: string) => void;
  onBack?: () => void;
}

export function PsychedelicChatStep({
  session,
  mode,
  onFinish,
  onBack,
}: PsychedelicChatStepProps) {
  const [messages, setMessages] = useState<PsychedelicChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userMessageCount, setUserMessageCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const initRef = useRef(false);

  // Initialize with AI-generated opening message, fall back to static
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const initOpeningMessage = async () => {
      try {
        const systemPrompt = getActiveSystemPrompt(mode, 0, session);
        const response = await generateOpenRouterResponse(
          [{ role: 'user', content: 'Please open this conversation with a personalized opening message for this person based on everything you know about their situation.' }],
          undefined,
          {
            systemPrompt,
            model: 'x-ai/grok-4.1-fast',
            maxTokens: 200,
            temperature: 0.8,
          }
        );

        if (response.success && response.text) {
          const openingMessage: PsychedelicChatMessage = {
            id: `msg-${Date.now()}`,
            role: 'assistant',
            content: response.text,
            timestamp: new Date().toISOString(),
          };
          setMessages([openingMessage]);
          setIsInitializing(false);
          return;
        }
      } catch {
        // Fall through to static fallback
      }

      // Static fallback
      const openingMessage: PsychedelicChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: generateOpeningMessage(session, mode),
        timestamp: new Date().toISOString(),
      };
      setMessages([openingMessage]);
      setIsInitializing(false);
    };

    initOpeningMessage();
  }, [session, mode]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    if (!isInitializing) {
      inputRef.current?.focus();
    }
  }, [isInitializing]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: PsychedelicChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    const newUserCount = userMessageCount + 1;
    setUserMessageCount(newUserCount);
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // Get phase-appropriate system prompt
      const systemPrompt = getActiveSystemPrompt(mode, newUserCount, session);

      // Build conversation history for API
      const conversationHistory = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // Call OpenRouter API
      const response = await generateOpenRouterResponse(conversationHistory, undefined, {
        systemPrompt,
        model: 'x-ai/grok-4.1-fast',
        maxTokens: 1400,
        temperature: 0.7,
      });

      if (!response.success || !response.text) {
        setError(response.error || 'Failed to get response');
        return;
      }

      const assistantMessage: PsychedelicChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: response.text,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      setError('Failed to get response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSkip = () => {
    onFinish([], true);
  };

  const handleFinishWithChat = async () => {
    if (messages.length <= 1) return;

    setIsSaving(true);
    let chatSummary: string | undefined;

    try {
      const conversationText = messages
        .map(m => `${m.role === 'user' ? 'User' : 'Guide'}: ${m.content}`)
        .join('\n\n');

      const response = await generateOpenRouterResponse(
        [{ role: 'user', content: `Here is a conversation:\n\n${conversationText}\n\nSummarize this conversation in 3 bullet points: key themes discussed, commitments made, unresolved questions. Be brief — max 60 words total.` }],
        undefined,
        {
          model: 'x-ai/grok-4.1-fast',
          maxTokens: 150,
          temperature: 0.3,
        }
      );

      if (response.success && response.text) {
        chatSummary = response.text;
      }
    } catch {
      // Non-blocking — save without summary
    }

    setIsSaving(false);
    onFinish(messages, false, chatSummary);
  };

  const modeLabel = mode === 'prep' ? 'Preparation' : 'Integration';
  // modeColor removed — all colors are hardcoded violet to avoid Tailwind purging dynamic classes

  return (
    <div className="fixed inset-0 bg-stone-950 z-50 flex flex-col">
      {/* Subtle ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-violet-500/3 blur-[160px] rounded-full" />
      </div>

      {/* Header */}
      <div className="border-b border-violet-500/20 bg-stone-900/80 backdrop-blur-sm px-4 sm:px-8 py-4 flex justify-between items-center relative z-10">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-light text-stone-100">
            {modeLabel} Conversation
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Explore what's alive for you · Skip anytime · This is optional
          </p>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="text-stone-500 hover:text-stone-200 transition p-2 hover:bg-stone-800 rounded-lg"
            aria-label="Go back"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 pb-32 relative z-10">
        <div className="max-w-3xl mx-auto space-y-4">
          {isInitializing && (
            <div className="flex justify-start">
              <div className="bg-stone-900/60 border border-stone-800/60 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-violet-400/60 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-violet-400/60 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-violet-400/60 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-xl p-3 sm:p-4 ${
                  message.role === 'user'
                    ? 'bg-violet-500/20 border border-violet-500/30 text-stone-100'
                    : 'bg-stone-900/60 border border-stone-800/60 text-stone-200'
                }`}
              >
                <p className="text-sm sm:text-base whitespace-pre-wrap">{message.content}</p>
                <span className="text-xs text-stone-600 mt-2 block">
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-stone-900/60 border border-stone-800/60 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-violet-400/60 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-violet-400/60 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-violet-400/60 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3 text-purple-300 text-sm">
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area (Fixed at Bottom) */}
      <div className="border-t border-stone-800/60 bg-stone-900/80 backdrop-blur-sm p-4 sm:p-6 relative z-10">
        <div className="max-w-3xl mx-auto space-y-3">
          {/* Textarea */}
          <div className="relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Share what's on your mind... (Enter to send, Shift+Enter for new line)"
              className="w-full bg-stone-900/60 border border-stone-800 rounded-xl p-3 text-stone-100 placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none min-h-[80px]"
              disabled={isLoading || isInitializing || isSaving}
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading || isInitializing}
              className={`absolute bottom-3 right-3 p-2 rounded-lg transition ${
                input.trim() && !isLoading && !isInitializing
                  ? 'bg-violet-600 hover:bg-violet-500 text-white'
                  : 'bg-stone-800 text-stone-600 cursor-not-allowed'
              }`}
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handleSkip}
              className="text-sm text-stone-500 hover:text-stone-300 transition underline"
              aria-label="Skip chat and finish"
            >
              Skip Chat
            </button>

            <button
              onClick={handleFinishWithChat}
              disabled={messages.length <= 1 || isSaving}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition ${
                messages.length > 1 && !isSaving
                  ? 'bg-violet-600 hover:bg-violet-500 text-white'
                  : 'bg-stone-800 text-stone-600 cursor-not-allowed'
              }`}
              aria-label="Finish and save conversation"
            >
              <span>{isSaving ? 'Saving...' : 'Finish'}</span>
              {!isSaving && <ArrowRight size={16} />}
            </button>
          </div>

          <p className="text-xs text-stone-600 text-center">
            You can continue to chat or finish whenever you're ready
          </p>
        </div>
      </div>
    </div>
  );
}
