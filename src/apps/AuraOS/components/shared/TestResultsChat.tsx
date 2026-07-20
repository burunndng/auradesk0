/**
 * TestResultsChat Component
 *
 * Post-test chatbot for discussing Schema Therapy assessment results.
 * Uses Grok 4.1 (temperature 0.4) for focused, psychoeducational guidance.
 * NOT linked to Intelligence Hub - discussions are results-focused only.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Send, AlertCircle, Loader, X } from 'lucide-react';
import type { SchemaTestResult } from '../../types';

interface TestResultsChatProps {
  testResult: SchemaTestResult;
  testLabel: string;
  onClose?: () => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_INSTRUCTION = `You are an assistant trained in Schema Therapy assessment interpretation. Your role is to provide supportive feedback on a user's results. You are not a therapist, but a psychoeducational guide. Provide 2-3 concise, actionable reflection points and food for thought.`;

export const TestResultsChat: React.FC<TestResultsChatProps> = ({
  testResult,
  testLabel,
  onClose
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize chat with context from test results
  useEffect(() => {
    if (!hasInitialized) {
      buildInitialContext();
      setHasInitialized(true);
    }
  }, [hasInitialized]);

  const buildInitialContext = () => {
    // Build context from test results
    let context = `Test: ${testLabel}\n`;
    context += `Summary: ${testResult.narrative}\n`;

    if (testResult.schemaScores && testResult.schemaScores.length > 0) {
      const activeSchemas = testResult.schemaScores
        .filter(s => s.meetsThreshold)
        .slice(0, 3)
        .map(s => s.name.replace(/-/g, ' '))
        .join(', ');
      if (activeSchemas) {
        context += `Key Schemas: ${activeSchemas}\n`;
      }
    }

    if (testResult.identifiedModes && testResult.identifiedModes.length > 0) {
      const modes = testResult.identifiedModes
        .slice(0, 3)
        .map(m => m.mode.replace(/-/g, ' '))
        .join(', ');
      context += `Identified Modes: ${modes}\n`;
    }

    if (testResult.copingPatterns && testResult.copingPatterns.length > 0) {
      const copingStyles = testResult.copingPatterns
        .map(p => p.copingStyle)
        .join(', ');
      context += `Coping Patterns: ${copingStyles}\n`;
    }

    // Send initial greeting with context as system context (not user message)
    // User can then ask questions about the results
    const initialMessage: ChatMessage = {
      role: 'assistant',
      content: `I've reviewed your ${testLabel} results. I'm here to help you understand what these findings mean and explore their implications. What would you like to discuss about your results?`
    };

    setMessages([initialMessage]);
  };

  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;

    // Add user message to chat
    const newUserMessage: ChatMessage = { role: 'user', content: userMessage };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // Build context from test results for the LLM
      let context = `Test: ${testLabel}\n`;
      context += `Summary: ${testResult.narrative}\n`;

      if (testResult.keyInsights && testResult.keyInsights.length > 0) {
        context += `Key Insights: ${testResult.keyInsights.join(', ')}\n`;
      }

      if (testResult.schemaScores && testResult.schemaScores.length > 0) {
        const activeSchemas = testResult.schemaScores
          .filter(s => s.meetsThreshold)
          .map(s => `${s.name.replace(/-/g, ' ')} (${s.score}/30)`)
          .join(', ');
        if (activeSchemas) {
          context += `Active Schemas: ${activeSchemas}\n`;
        }
      }

      const response = await fetch('/api/openrouter-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'x-ai/grok-4.1-fast',
          messages: [
            {
              role: 'system',
              content: `${SYSTEM_INSTRUCTION}\n\nTest Context:\n${context}`
            },
            ...updatedMessages.map(msg => ({
              role: msg.role,
              content: msg.content
            }))
          ],
          temperature: 0.4,
          max_tokens: 1500
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.error?.message ||
          `API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      const assistantMessage = data.choices?.[0]?.message?.content;

      if (!assistantMessage) {
        throw new Error('Empty response from API');
      }

      const newAssistantMessage: ChatMessage = {
        role: 'assistant',
        content: assistantMessage
      };

      setMessages([...updatedMessages, newAssistantMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      console.error('[TestResultsChat] Error:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex flex-col h-96 bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-900/50">
        <h3 className="text-sm font-semibold text-slate-100">Discuss Your Results</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition"
            aria-label="Close chat"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg text-sm ${
                msg.role === 'user'
                  ? 'bg-teal-600/40 text-slate-100 border border-teal-500/30'
                  : 'bg-slate-700/50 text-slate-200 border border-slate-600/30'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-700/50 border border-slate-600/30 rounded-lg px-4 py-2 flex items-center gap-2">
              <Loader className="w-4 h-4 animate-spin text-slate-400" />
              <span className="text-xs text-slate-400">Thinking...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center">
            <div className="bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-2 flex items-start gap-2 max-w-md">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-red-300">{error}</div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-slate-700 bg-slate-900/50 p-3 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your results..."
          disabled={isLoading}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
