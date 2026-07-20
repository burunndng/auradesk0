import React, { useState, useEffect, useRef } from 'react';
import { X, Send, AlertCircle, Loader } from 'lucide-react';
import { Practice } from '../../types.ts';
import { AttachmentStyle } from '../../data/attachmentMappings.ts';

interface PracticeChatbotProps {
  practice: Practice;
  attachmentStyle: AttachmentStyle;
  anxietyScore: number;
  avoidanceScore: number;
  onClose: () => void;
  onComplete: (sessionNotes: string) => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * PracticeChatbot Component
 *
 * AI-guided text chatbot for practicing yoga, meditation, somatic work, and breathwork.
 * Uses Grok 4.1 Fast (temperature 0.7) for warm, personalized guidance tailored to user's
 * attachment style and anxiety/avoidance scores.
 *
 * System prompt dynamically constructed from practice.aiPrompt or built from practice fundamentals.
 * Includes attachment style and emotional profile for personalized guidance.
 */

export default function PracticeChatbot({
  practice,
  attachmentStyle,
  anxietyScore,
  avoidanceScore,
  onClose,
  onComplete,
}: PracticeChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Prevent body scroll
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize chat with greeting
  useEffect(() => {
    if (!hasInitialized) {
      const initialMessage: ChatMessage = {
        role: 'assistant',
        content: `I'm your ${practice.name} guide. ${practice.why.split('.')[0]}. Ready to begin when you are — share what's on your mind or ask me to guide you through the practice.`,
      };
      setMessages([initialMessage]);
      setHasInitialized(true);
    }
  }, [hasInitialized, practice]);

  /**
   * Build system prompt from practice.aiPrompt or construct from practice data
   */
  const buildSystemPrompt = (): string => {
    let basePrompt = practice.aiPrompt || buildGenericPrompt();

    // Append personalization block
    const personalizationBlock = `\n\nPERSONALIZATION:\nThe user has an ${attachmentStyle} attachment style, anxiety score of ${anxietyScore}/100, and avoidance score of ${avoidanceScore}/100. Tailor your guidance to be emotionally attuned to this profile.${
      anxietyScore > 70 ? ' This user may be prone to worry — offer extra reassurance and grounding.' : ''
    }${
      avoidanceScore > 70 ? ' This user tends to disconnect — gently encourage embodiment and presence.' : ''
    }`;

    return basePrompt + personalizationBlock;
  };

  /**
   * Construct generic system prompt from practice fields if aiPrompt not provided
   */
  const buildGenericPrompt = (): string => {
    const steps = practice.how?.slice(0, 3).join(' ') || '';
    return `You are a warm, personalized guide helping someone practice ${practice.name}. Keep responses concise (1-3 sentences) to maintain conversational flow. Provide real-time guidance and encouragement. Ask open-ended questions about their experience. Adapt your pace based on their responses.

Practice Overview:
- Why: ${practice.why}
- Key Steps: ${steps}

Be conversational, validating, and adapt to their pace and needs.`;
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
      const response = await fetch('/api/openrouter-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'x-ai/grok-4.1-fast',
          messages: [
            {
              role: 'system',
              content: buildSystemPrompt(),
            },
            ...updatedMessages.map(msg => ({
              role: msg.role,
              content: msg.content,
            })),
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
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
        content: assistantMessage,
      };

      setMessages([...updatedMessages, newAssistantMessage]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to send message';
      console.error('[PracticeChatbot] Error:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  /**
   * End session: collect transcript and call onComplete
   */
  const handleEndSession = () => {
    const transcript = messages
      .map(msg => `${msg.role === 'user' ? 'You' : 'Guide'}: ${msg.content}`)
      .join('\n\n');
    onComplete(transcript);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto backdrop-blur-sm">
      <div className="bg-slate-900 border-2 border-slate-700 rounded-lg max-w-3xl w-full h-[calc(100dvh-200px)] flex flex-col my-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <div>
              <h2 className="text-xl font-bold text-slate-100">{practice.name}</h2>
              <p className="text-sm text-slate-400">
                {attachmentStyle.charAt(0).toUpperCase() + attachmentStyle.slice(1)} Attachment • AI Practice Session
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition p-2 hover:bg-slate-800 rounded-lg"
            aria-label="Close chatbot"
          >
            <X size={24} />
          </button>
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

        {/* Input & Actions */}
        <div className="border-t border-slate-700 bg-slate-900/50 p-4 space-y-3">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Share your experience or ask for guidance..."
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

          <div className="flex gap-2">
            <button
              onClick={handleEndSession}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg transition text-sm"
            >
              End Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
