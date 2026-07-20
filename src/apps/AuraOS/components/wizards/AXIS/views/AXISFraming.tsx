/**
 * AXIS Framing - AI Conversation Prompt Generator
 * Create precise prompts for AI analysis conversations
 *
 * Design: stone-950 base · Violet secondary accent · Shadow Tools
 */

import React, { useState, useEffect } from 'react';
import { ChevronLeft, BookOpen } from 'lucide-react';

import type { AXISSynthesisBrief } from '../../../../types';

const MAX_TOPIC_LENGTH = 100;
const MAX_PROMPT_LENGTH = 800;
const MAX_CONTEXT_LENGTH = 500;
const DRAFT_STORAGE_KEY = 'aura-AXIS-prompt-draft';

interface AXISFramingProps {
  onComplete: (title: string, intention: string, successCriteria?: string, activityType?: string, contextData?: any) => void;
  onBack: () => void;
  previousSynthesis?: AXISSynthesisBrief | null;
}

export default function AXISFraming({ onComplete, onBack, previousSynthesis }: AXISFramingProps) {
  const [topic, setTopic] = useState('');
  const [prompt, setPrompt] = useState('');
  const [context, setContext] = useState('');
  const [priorBrief, setPriorBrief] = useState('');

  // Context questions
  const [helpType, setHelpType] = useState('');
  const [challengeLevel, setChallengeLevel] = useState('');
  const [urgency, setUrgency] = useState('');
  const [broaderContext, setBroaderContext] = useState('');
  const [broaderDetails, setBroaderDetails] = useState('');

  // Load draft on mount
  useEffect(() => {
    let initialPriorBrief = '';

    if (previousSynthesis) {
      const { sessionFindings, userPatterns, nextSession } = previousSynthesis;
      initialPriorBrief = `Previous Session Key Insight:
${sessionFindings?.keyInsight || 'N/A'}

Patterns Identified:
- Core Dynamic: ${userPatterns?.coreDynamic || 'N/A'}
- Typical Defenses: ${userPatterns?.typicalDefenses || 'N/A'}

Next Session Focus:
${nextSession?.entryPoint ? `Entry: ${nextSession.entryPoint}` : ''}
${nextSession?.hypothesisToTest ? `Hypothesis: ${nextSession.hypothesisToTest}` : ''}`.trim();
    }

    const rawStr = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (rawStr) {
      try {
        const draft = JSON.parse(rawStr) as any;
        setTopic(draft.topic || '');
        setPrompt(draft.prompt || '');
        setContext(draft.context || '');
        setPriorBrief(draft.priorBrief || initialPriorBrief);
        setHelpType(draft.helpType || '');
        setChallengeLevel(draft.challengeLevel || '');
        setUrgency(draft.urgency || '');
        setBroaderContext(draft.broaderContext || '');
        setBroaderDetails(draft.broaderDetails || '');
      } catch (e) {
        console.error('[AXIS] Failed to load prompt draft:', e);
        if (initialPriorBrief) setPriorBrief(initialPriorBrief);
      }
    } else if (initialPriorBrief) {
      setPriorBrief(initialPriorBrief);
    }
  }, [previousSynthesis]);

  // Save draft on change
  useEffect(() => {
    if (topic || prompt || context || helpType || challengeLevel || urgency || broaderContext || priorBrief) {
      const draft = { topic, prompt, context, priorBrief, helpType, challengeLevel, urgency, broaderContext, broaderDetails };
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      } catch (e) {
        console.error('[AXIS] Failed to save prompt draft:', e);
      }
    }
  }, [topic, prompt, context, priorBrief, helpType, challengeLevel, urgency, broaderContext, broaderDetails]);

  const canContinue = topic.trim().length > 0 && prompt.trim().length > 0;

  const handleContinue = () => {
    if (canContinue) {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      const contextData = {
        topic: topic.trim(),
        prompt: prompt.trim(),
        context: context.trim() || undefined,
        helpType,
        challengeLevel,
        urgency,
        broaderContext,
        broaderDetails,
        priorBrief: priorBrief.trim() || undefined
      };
      // Pass: title, intention, successCriteria, activityType, contextData
      onComplete(
        topic.trim(),
        prompt.trim(),
        context.trim() || undefined,
        'ai-conversation',  // AXIS is only for AI conversations now
        contextData
      );
    }
  };

  const ChipButton = ({ option, selected, onToggle }: { option: string; selected: boolean; onToggle: () => void }) => (
    <button
      type="button"
      onClick={onToggle}
      className={`text-left px-3 py-2 rounded-xl text-sm border transition-all duration-150 ${selected
        ? 'bg-violet-500/15 border-violet-500/40 text-violet-300'
        : 'bg-stone-900/60 border-stone-700/40 text-stone-400 hover:border-stone-600'
        }`}
    >
      {option}
    </button>
  );

  return (
    <div className="space-y-8">
      {/* Chapter heading */}
      <div className="text-center mb-2">
        <div className="inline-block text-violet-400/60 mb-3"><BookOpen size={44} /></div>
        <h2 className="text-2xl font-serif font-light text-stone-100 mb-2">Frame Your Session</h2>
        <p className="text-sm text-stone-400 max-w-md mx-auto leading-relaxed">
          Clear framing enables deeper insight. Set your intention and the AI will meet you where you are.
        </p>
      </div>

      {/* Topic */}
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500">I. Topic *</p>
          <span className="text-xs text-stone-600">{topic.length} / {MAX_TOPIC_LENGTH}</span>
        </div>
        <p className="text-xs text-stone-500">Brief subject for analysis</p>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value.slice(0, MAX_TOPIC_LENGTH))}
          placeholder="e.g., Fear of commitment in relationships"
          className="w-full bg-stone-950/80 border border-stone-700/50 text-stone-100 placeholder-stone-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/30 transition-all"
        />
      </div>

      {/* Prompt */}
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500">II. Your Prompt *</p>
          <span className="text-xs text-stone-600">{prompt.length} / {MAX_PROMPT_LENGTH}</span>
        </div>
        <p className="text-xs text-stone-500">
          Detailed instruction for the AI. Include what you want to explore, analyze, or understand.
        </p>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value.slice(0, MAX_PROMPT_LENGTH))}
          placeholder="e.g., Analyze the psychological roots of my fear of commitment. What patterns from childhood might be contributing? What beliefs am I holding that keep me stuck?"
          rows={6}
          className="w-full bg-stone-950/80 border border-stone-700/50 text-stone-100 placeholder-stone-600 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/30 transition-all"
        />
      </div>

      {/* Context (Optional) */}
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-600">III. Additional Context</p>
          <span className="text-xs text-stone-600">{context.length} / {MAX_CONTEXT_LENGTH}</span>
        </div>
        <p className="text-xs text-stone-500">
          Any background information that helps the AI understand your situation
        </p>
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value.slice(0, MAX_CONTEXT_LENGTH))}
          placeholder="e.g., I've been in multiple relationships that ended because I withdrew emotionally..."
          rows={3}
          className="w-full bg-stone-950/80 border border-stone-700/50 text-stone-100 placeholder-stone-600 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/30 transition-all"
        />
      </div>

      {/* Context Questions Section */}
      <div className="border-t border-stone-800 pt-8 space-y-6">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Session Parameters</p>
          <p className="text-xs text-stone-500">Optional details that refine how the AI responds</p>
        </div>

        {/* Help Type */}
        <div className="space-y-2">
          <label className="text-xs text-stone-400">What kind of help do you need?</label>
          <div className="grid grid-cols-2 gap-2">
            {['Decide', 'Understand', 'Process', 'Validate', 'Vent'].map((option) => (
              <ChipButton
                key={option}
                option={option}
                selected={helpType === option}
                onToggle={() => setHelpType(helpType === option ? '' : option)}
              />
            ))}
          </div>
        </div>

        {/* Challenge Level */}
        <div className="space-y-2">
          <label className="text-xs text-stone-400">How much challenge do you want?</label>
          <div className="grid grid-cols-2 gap-2">
            {['Steady & patient', 'Balanced', 'Press me hard', 'Fierce', 'Open exploration'].map((option) => (
              <ChipButton
                key={option}
                option={option}
                selected={challengeLevel === option}
                onToggle={() => setChallengeLevel(challengeLevel === option ? '' : option)}
              />
            ))}
          </div>
        </div>

        {/* Urgency */}
        <div className="space-y-2">
          <label className="text-xs text-stone-400">How urgent is this?</label>
          <div className="grid grid-cols-2 gap-2">
            {['Long-term exploration', 'Moderate timeline', 'This week', 'Today'].map((option) => (
              <ChipButton
                key={option}
                option={option}
                selected={urgency === option}
                onToggle={() => setUrgency(urgency === option ? '' : option)}
              />
            ))}
          </div>
        </div>

        {/* Broader Context */}
        <div className="space-y-2">
          <label className="text-xs text-stone-400">What's the broader context?</label>
          <div className="space-y-2">
            {[
              { value: 'childhood', label: 'Rooted in childhood patterns' },
              { value: 'recurring', label: 'Recurring pattern across life' },
              { value: 'health', label: 'Health, neuro, or substance factors' },
              { value: 'recent-event', label: 'Recent life event' },
              { value: 'spiritual', label: 'Spiritual or existential layer' },
              { value: 'nothing', label: 'Nothing in particular' }
            ].map((option) => (
              <ChipButton
                key={option.value}
                option={option.label}
                selected={broaderContext === option.value}
                onToggle={() => setBroaderContext(broaderContext === option.value ? '' : option.value)}
              />
            ))}
          </div>
        </div>

        {/* Broader Details - Conditional Input */}
        {broaderContext && broaderContext !== 'nothing' && (
          <div className="space-y-2">
            <label className="text-xs text-stone-400">Tell me more:</label>
            <textarea
              value={broaderDetails}
              onChange={(e) => setBroaderDetails(e.target.value)}
              placeholder="Add any relevant details..."
              rows={3}
              className="w-full bg-stone-950/80 border border-stone-700/50 text-stone-100 placeholder-stone-600 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/30 transition-all"
            />
          </div>
        )}
      </div>

      {/* Prior Continuity Brief - Optional */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-600">Continuing a Previous Session?</p>
        <p className="text-xs text-stone-500">
          If you have a continuity brief from a previous AXIS conversation, paste it here.
        </p>
        <textarea
          value={priorBrief}
          onChange={(e) => setPriorBrief(e.target.value)}
          placeholder="Paste your prior continuity brief here, or leave blank for a fresh session..."
          rows={4}
          className="w-full bg-stone-950/80 border border-stone-700/50 text-stone-100 placeholder-stone-600 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/30 transition-all"
        />
      </div>

      {/* Footer with back/forward — inline since AXIS Framing is inside the scroll area */}
      <div className="flex items-center justify-between pt-4 border-t border-stone-800/60">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-stone-400 hover:text-stone-200 hover:bg-stone-800/60 transition-all"
        >
          <ChevronLeft size={16} /> Back
        </button>
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-900/20"
        >
          {canContinue ? 'Continue →' : 'Complete required fields'}
        </button>
      </div>
    </div>
  );
}
