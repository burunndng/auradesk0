import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Loader2, Save, Users } from 'lucide-react';
import { WizardFrame } from '../shared/WizardFrame';
import { useWizardDraft } from '../../hooks/useWizardDraft';
import DyadBridgeIcon from '../visualizations/SacredGeometryIcons/DyadBridgeIcon';
import { generateOpenRouterResponse, buildMessagesWithSystem } from '../../services/openRouterService';
import { useInsightsContext as useInsights } from '../../contexts/InsightsContext';
import { useAuth } from '../../contexts/AuthContext';
import type { IntegratedInsight } from '../../types';
import { generateInsightFromSession } from '../../services/insightGenerator';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

type WizardStep = 'somatic' | 'chat' | 'integration';

interface RelationalPatternTrackerSession {
  id: string;
  currentStep: WizardStep;
  somaticCheckIn: string;
  messages: ChatMessage[];
  integrationReflection: string;
  linkedInsightId?: string;
  dateStarted: string;
}

const SYSTEM_PROMPT = `You are a relational pattern tracker — warm, precise, and psychodynamically informed. Your lineage includes attachment theory, object relations, Internal Family Systems, and integral psychology.

Your job is to help the user explore how they show up across different relational contexts (romantic, family, work, social). Through conversational inquiry, you:

1. Ask about specific recent moments in relationships — not abstract patterns
2. Notice when the same emotional response appears across different people
3. Name the unconscious needs and fears driving automatic behaviors
4. Track reactive patterns without pathologizing them
5. Reflect back what you observe with tentative language ("it sounds like", "you may notice")

CONVERSATION FLOW:
- Start by asking what relational territory they want to explore today
- Ask about 2-3 specific relationships, one at a time
- After hearing about each relationship, reflect back what you notice
- When you see a pattern across relationships, name it clearly
- End by offering a concrete micro-practice they can try this week

RULES:
- Never diagnose attachment styles as fixed traits — describe tendencies
- Use "you may tend toward" rather than "you are"
- Validate protective strategies before suggesting alternatives
- Keep responses to 2-4 sentences to maintain conversational flow
- Ask one question at a time
- If the user shares distress, acknowledge it before continuing inquiry
- CRITICAL: Respond carefully to their somatic check in and validate their body's experience before diving into the mind's narrative.`;

const INITIAL_MESSAGE = `Welcome to the Relational Pattern Tracker. I'm here to help you notice how you show up across different relationships — the automatic moves, the protective strategies, the unspoken needs.

This isn't about fixing anything. It's about seeing clearly.

What relational territory would you like to explore today? You might start with a recent interaction that felt charged, a repeating dynamic you've noticed, or a relationship that's been on your mind.`;

const WIZARD_KEY = 'aura-draft-relational-pattern-tracker';

export default function RelationalPatternTracker({ isOpen, onClose }: Props) {
  const { user } = useAuth();
  
  const [draft, updateDraft, , clearDraft] = useWizardDraft<RelationalPatternTrackerSession>(
    WIZARD_KEY,
    {
      id: `relational-${Date.now()}`,
      currentStep: 'somatic',
      somaticCheckIn: '',
      messages: [],
      integrationReflection: '',
      dateStarted: new Date().toISOString()
    }
  );

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat when reaching the chat step for the first time
  useEffect(() => {
    if (draft.currentStep === 'chat' && draft.messages.length === 0) {
      updateDraft({
        messages: [{ role: 'assistant', content: INITIAL_MESSAGE }]
      });
    }
  }, [draft.currentStep, draft.messages.length, updateDraft]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [draft.messages]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (draft.currentStep === 'somatic') {
      updateDraft({ currentStep: 'chat' });
    } else if (draft.currentStep === 'chat') {
      updateDraft({ currentStep: 'integration' });
    } else if (draft.currentStep === 'integration') {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (draft.currentStep === 'chat') {
      updateDraft({ currentStep: 'somatic' });
    } else if (draft.currentStep === 'integration') {
      updateDraft({ currentStep: 'chat' });
    }
  };

  const handleClose = () => {
    onClose();
  };

  const getStepNumber = () => {
    switch (draft.currentStep) {
      case 'somatic': return 1;
      case 'chat': return 2;
      case 'integration': return 3;
      default: return 1;
    }
  };

  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;
    
    // Inject somatic context into the first user message if it's the first exchange
    let actualMessage = userMessage;
    if (draft.messages.length === 1 && draft.somaticCheckIn) {
      actualMessage = `[My current somatic state: ${draft.somaticCheckIn}]\n\n${userMessage}`;
    }

    const newUserMessage: ChatMessage = { role: 'user', content: actualMessage };
    const updatedMessages = [...draft.messages, newUserMessage];
    
    // Update UI immediately (using actualMessage so the bot context is clear, though we might prefer hiding it from UI)
    updateDraft({ messages: [...draft.messages, { role: 'user', content: userMessage }] });
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const orMessages = buildMessagesWithSystem(SYSTEM_PROMPT, updatedMessages);
      const result = await generateOpenRouterResponse(orMessages, undefined, {
        model: 'x-ai/grok-4.1-fast',
        maxTokens: 1000,
        temperature: 0.7,
      });
      const assistantMessage = result.text;
      if (!assistantMessage) throw new Error('Empty response from API');

      updateDraft({
        messages: [
          ...draft.messages,
          { role: 'user', content: userMessage }, // Keep UI clean without the bracketed preamble
          { role: 'assistant', content: assistantMessage }
        ]
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      // Revert the optimistic ui update if failed? Not strictly necessary if we rely on draft
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleComplete = async () => {
    if (!user) {
      setError("You must be logged in to save deep insights.");
      return;
    }

    setIsGeneratingInsight(true);
    setError(null);

    try {
      const sessionReport = `
Somatic Check-in: ${draft.somaticCheckIn}

Chat Transcript:
${draft.messages.map(m => `${m.role}: ${m.content}`).join('\\n\\n')}

User's Final Integration Reflection:
${draft.integrationReflection}
      `.trim();

      const insight = await generateInsightFromSession({
        wizardType: 'Relational Pattern Tracker' as any,
        sessionId: draft.id,
        sessionName: `Relational Pattern Tracking (${new Date().toLocaleDateString()})`,
        sessionReport,
        sessionSummary: draft.integrationReflection.substring(0, 150) + '...',
        userId: user?.id,
        availablePractices: [],
        dataContext: {
          totalSessions: 1,
          sessionsInLastWeek: 1,
          existingInsights: 0,
        },
      });

      if (insight) {
        updateDraft({ linkedInsightId: insight.id });
      }

      clearDraft();
      onClose();
    } catch (err) {
      console.error("Error saving relational pattern session", err);
      setError("Failed to generate insight. Please try again.");
    } finally {
      setIsGeneratingInsight(false);
    }
  };

  const isNextDisabled = () => {
    if (draft.currentStep === 'somatic') return !draft.somaticCheckIn.trim();
    if (draft.currentStep === 'chat') return draft.messages.length <= 1 || isLoading;
    if (draft.currentStep === 'integration') return !draft.integrationReflection.trim() || isGeneratingInsight;
    return false;
  };

  const renderSomatic = () => (
    <div className="max-w-2xl mx-auto space-y-6 pt-4 animate-fade-in pb-8">
      <div className="text-center space-y-4 mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-neutral-800 to-neutral-700 rounded-full mx-auto flex items-center justify-center border border-neutral-600">
          <DyadBridgeIcon size={32} className="text-purple-400" />
        </div>
        <h2 className="text-2xl font-serif text-slate-100">Somatic Grounding</h2>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Before we analyze your relationships, let's drop into the body. Cognitive analysis without embodiment often leads to intellectual bypassing.
        </p>
      </div>

      <div className="bg-neutral-800/40 border border-neutral-700 rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-slate-200">Notice what's present</h3>
        <p className="text-sm text-slate-400">
          Take a deep breath. When you think about the relationship or interaction you want to explore today, what happens in your body right now? Is there tightness, heat, numbness, a sinking feeling, or something else?
        </p>
        <textarea
          value={draft.somaticCheckIn}
          onChange={(e) => updateDraft({ somaticCheckIn: e.target.value })}
          placeholder="e.g., My chest feels tight when I think about that conversation..."
          className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500/50 min-h-[120px] resize-none"
        />
      </div>
    </div>
  );

  const renderChat = () => (
    <div className="flex flex-col h-[60dvh] lg:h-[500px] animate-fade-in -mx-3 sm:-mx-6 lg:-mx-8">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {draft.messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-sm lg:max-w-lg px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
                ? 'bg-purple-600/20 text-slate-100 border border-purple-500/30 rounded-br-md'
                : 'bg-neutral-800/80 text-slate-300 border border-neutral-700/40 rounded-bl-md'
                }`}>
                {msg.role === 'assistant' && (
                  <span className="text-purple-400/70 text-[10px] font-bold uppercase tracking-widest block mb-1">Guide</span>
                )}
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-neutral-800/80 border border-neutral-700/40 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                <Loader2 size={14} className="text-purple-500 animate-spin" />
                <span className="text-xs text-slate-500 italic">Reflecting…</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-neutral-800 bg-neutral-900/50 px-4 sm:px-6 lg:px-8 py-4 shrink-0">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Share what's coming up for you…"
              disabled={isLoading}
              className="flex-1 bg-neutral-800 border border-neutral-700 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-purple-900/20 flex items-center justify-center min-w-[50px]"
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </form>
          <div className="mt-2 text-center">
             <span className="text-xs text-slate-500">When you've finished exploring your patterns, hit 'Next' below to integrate.</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIntegration = () => (
    <div className="max-w-2xl mx-auto space-y-6 pt-4 animate-fade-in pb-8">
      <div className="text-center space-y-4 mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-neutral-800 to-neutral-700 rounded-full mx-auto flex items-center justify-center border border-neutral-600">
           <DyadBridgeIcon size={32} className="text-purple-400" />
        </div>
        <h2 className="text-2xl font-serif text-slate-100">Integration & Synthesis</h2>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Insights evaporate quickly. Writing them down solidifies them from a transient experience into an integrated understanding.
        </p>
      </div>

      <div className="bg-neutral-800/40 border border-neutral-700 rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-slate-200">What emerged today?</h3>
        <p className="text-sm text-slate-400">
          In your own words, what is the core relational pattern you noticed? What is it trying to protect, and what is one small thing you will try differently next time?
        </p>
        <textarea
          value={draft.integrationReflection}
          onChange={(e) => updateDraft({ integrationReflection: e.target.value })}
          placeholder="e.g., I noticed I pull away when I feel criticized because it feels unsafe. Next time, I will try to take one breath before retreating..."
          className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500/50 min-h-[160px] resize-none"
        />
      </div>
    </div>
  );

  return (
    <WizardFrame
      title="Relational Pattern Tracker"
      currentStep={getStepNumber()}
      totalSteps={3}
      onClose={handleClose}
      onBack={handleBack}
      onNext={handleNext}
      showBackButton={draft.currentStep !== 'somatic'}
      nextButtonText={draft.currentStep === 'integration' ? 'Complete & Generate Insight' : 'Next'}
      nextButtonDisabled={isNextDisabled()}
      isLoading={isGeneratingInsight}
      accentColor="purple"
      errorMessage={error}
    >
      {draft.currentStep === 'somatic' && renderSomatic()}
      {draft.currentStep === 'chat' && renderChat()}
      {draft.currentStep === 'integration' && renderIntegration()}
    </WizardFrame>
  );
}
