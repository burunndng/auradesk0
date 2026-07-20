/**
 * Schema Reflection Wizard - Chat Step
 * Interactive AI exploration of schema analysis results.
 * Design: stone-950 system, violet secondary, AI voice = "MIRROR".
 */

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Loader2 } from 'lucide-react';
import { SchemaDefinition } from './schemaContent';
import { AIAnalysisResult, ChatMessage } from '../../../services/schemaReflectionService';

interface SchemaChatProps {
  schema: SchemaDefinition;
  analysis: AIAnalysisResult;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

export default function SchemaChat({
  schema,
  analysis,
  messages,
  onSendMessage,
  isLoading
}: SchemaChatProps) {
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (chatInput.trim() && !isLoading) {
      onSendMessage(chatInput);
      setChatInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSend();
    }
  };

  const showSuggestions = messages.length === 1;

  const getRelevantSuggestions = (): string[] => {
    if (messages.length > 1) return [];
    return [
      'When did this pattern start?',
      'How can I work with this pattern?',
      'What are my next steps?'
    ];
  };

  return (
    <div className="space-y-6">
      {/* Chapter framing */}
      <div className="text-center mb-4">
        <div className="inline-block text-amber-400/60 mb-2">
          <MessageCircle size={40} />
        </div>
        <h2 className="text-2xl font-serif font-light text-stone-100 mb-1">
          Explore {schema.plain_name}
        </h2>
        <p className="text-sm text-stone-400 max-w-md mx-auto leading-relaxed">
          Ask anything about what emerged in the analysis. The mirror reflects, not directs.
        </p>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-stone-950/80 border border-stone-700/30 rounded-xl p-4 space-y-3 max-h-96 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-stone-500">Start by asking about your patterns, themes, or what you'd like to understand better.</p>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-xl px-4 py-3 ${msg.role === 'user'
                    ? 'bg-amber-600 text-white'
                    : 'bg-gradient-to-br from-amber-950/20 to-stone-900/60 border border-amber-500/15 text-stone-300'
                  }`}>
                  {msg.role === 'assistant' && (
                    <span className="text-amber-500/60 text-[10px] font-bold uppercase tracking-widest block mb-1">Mirror</span>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-stone-900/60 border border-amber-500/10 rounded-xl px-4 py-3 flex items-center gap-2">
                  <Loader2 className="animate-spin text-amber-400" size={14} />
                  <span className="text-xs text-stone-400 italic">Reflecting on your question about {schema.plain_name}…</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </>
        )}
      </div>

      {/* Chat Input */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your pattern, themes, or what to do next…"
            className="flex-1 px-4 py-3 bg-stone-950/80 border border-stone-700/50 rounded-xl text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/30 transition-all"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !chatInput.trim()}
            className="px-4 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Send size={16} />
          </button>
        </div>

        {/* Suggested Questions */}
        {showSuggestions && (
          <div className="flex flex-wrap gap-2">
            {getRelevantSuggestions().map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => onSendMessage(suggestion)}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-lg text-xs bg-stone-900/60 border border-stone-700/40 text-stone-400 hover:text-amber-300 hover:border-amber-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        <p className="text-xs text-stone-600 italic text-center">
          Press Enter to send. This conversation is private to you.
        </p>
      </div>
    </div>
  );
}
