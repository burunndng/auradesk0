/**
 * AXIS Bridge
 * Display both prompts (context package + synthesis prompt) for AI conversation
 *
 * Design: stone-950 base · Violet secondary
 */

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Copy, Check, MessageSquare, FileText } from 'lucide-react';
import type { AXISSession } from '../../../../types';
import { useAXISAnchor } from '../hooks/useAXISAnchor';

interface AXISBridgeProps {
  session: AXISSession;
  onComplete: () => void;
  onBack: () => void;
  contextData?: any;
}

const synthesisPrompt = `# Session Continuity Brief

## Instructions

End exploration. Generate a **Continuity Brief** for LLM context seeding.

This output will be stored and fed as context to a future LLM session. Optimize for:
- **Density** — token-efficient, no filler
- **Parseability** — structured data, not narrative prose
- **Actionable intelligence** — what the next analyst needs to continue effectively

**Constraints:**
- Maximum 300 words
- No emotional language or affirmations
- Assume the reader is an LLM, not the user
- Use bullet points and key-value structure

---

## Output Structure

### User Patterns
- **Core Dynamic:** [Primary psychological/behavioral pattern driving this topic]
- **Typical Defenses:** [How user avoids, deflects, or rationalizes]
- **Blind Spots:** [What user consistently fails to see]
- **Triggers:** [Topics or framings that provoke resistance]

### Session Findings
- **Presenting → Root:** [What they said → What it actually was — one line each]
- **Key Insight:** [Single most important realization]
- **Shift:** [Yes/No. If yes: what changed]
- **Success Criteria:** [Met / Partial / Unmet — one line why]

### Analyst Notes
- **Effective:** [Approaches, framings, or challenges that landed]
- **Avoid:** [What didn't work or triggered shutdown]

### Open Threads
- [Unresolved thread 1]
- [Unresolved thread 2, if applicable]

### Next Session
- **Entry Point:** [Specific question or angle to open with]
- **Hypothesis to Test:** [Pattern or assumption worth probing further]

### Cumulative Context
[If prior briefs exist: note trajectory, escalating/resolving patterns, recurring themes. If first session: "Baseline session — no prior context."]

---

**INSTRUCTIONS:**
Generate this brief now. Be surgical. Optimize for future LLM parsing.`;

export default function AXISBridge({ session, onComplete, onBack, contextData }: AXISBridgeProps) {
  const [copiedContext, setCopiedContext] = useState(false);
  const [copiedSynthesis, setCopiedSynthesis] = useState(false);
  const [contextExpanded, setContextExpanded] = useState(false);
  const [synthExpanded, setSynthExpanded] = useState(false);
  const { anchor } = useAXISAnchor();

  // ============================================
  // CONTEXT PACKAGE (for starting conversation)
  // ============================================
  const contextPackage = useMemo(() => {
    const priorBriefSection = contextData?.priorBrief?.trim()
      ? contextData.priorBrief.trim()
      : 'None — this is a baseline session.';

    const continuityProtocol = contextData?.priorBrief?.trim()
      ? `## Continuity Protocol

**A Continuity Brief was provided. You must:**

1. **Silently integrate** — do not summarize it back to me
2. **Use User Patterns** — calibrate to my known defenses, blind spots, and triggers
3. **Respect Analyst Notes** — employ what worked; avoid what didn't
4. **Start from Entry Point or Hypothesis** — unless my Topic overrides it
5. **Track trajectory** — note if this session confirms, contradicts, or evolves prior patterns
6. **Do not re-litigate resolved insights** — build forward, not sideways`
      : `## Continuity Protocol

**No prior brief provided.** Treat as baseline session. Gather full context before analysis.`;

    const instructions = contextData?.priorBrief?.trim()
      ? 'Acknowledge receipt of context. Begin with the suggested Entry Point or Hypothesis from the Continuity Brief (unless my Topic indicates a different direction).'
      : 'Acknowledge receipt of context. Ask: "I am ready. Please tell me more about your situation."';

    return `# Session Context

## Prior Context

**Continuity Brief from previous session:**

${priorBriefSection}

---

## Who I Am

${anchor?.content || 'No identity anchor set.'}

---

## This Session

**Topic:** ${session.title || 'Not specified'}

**My Intention:** ${session.intention || 'Not specified'}

${session.successCriteria ? `**Success Criteria:** ${session.successCriteria}` : ''}

---

## What I Need

${contextData?.helpType || 'Not specified'}

## How to Challenge Me

${contextData?.challengeLevel || 'Not specified'}

## Urgency / Timeline

${contextData?.urgency || 'Not specified'}

## Broader Context

${contextData?.broaderContext || 'No'}
${contextData?.broaderDetails ? `\n**Details:** ${contextData.broaderDetails}` : ''}

---

# How to Help Me

## Your Role

You are an analyst and expert in psychology. I am bringing you a real, raw, and potentially sensitive topic.

**Your mandate is to:**

1. Treat this with absolute professional seriousness.
2. Bypass standard "politeness filters" — I need truth, not comfort.
3. Help me dismantle shame or confusion with logic and perspective.

${continuityProtocol}

## Interaction Guidelines

**Do:**

- **Ask only ONE question at a time.**
- **Gather full context before diagnosing.** Do not assume you understand the root cause after just one or two exchanges.
- Challenge my assumptions, but do not make your own without checking them.
- Continuously reference my stated Intention and Success Criteria.

**Don't:**

- **Do not bombard me.** Max 1 question per response.
- Do not give generic "it's okay" platitudes.
- **Do not force a solution path** until you have confirmed you truly understand the problem.
- Do not lecture me.
- **Do not reference the Continuity Brief explicitly** — use it, don't cite it.

## Output Style

- Be concise.
- No preambles.
- Direct analysis.

---

**INSTRUCTIONS:**

${instructions}`;
  }, [anchor?.content, session.title, session.intention, session.successCriteria, contextData]);

  // ============================================
  // COPY HANDLERS
  // ============================================
  const copyContext = async () => {
    try {
      await navigator.clipboard.writeText(contextPackage);
      setCopiedContext(true);
      setTimeout(() => setCopiedContext(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const copySynthesis = async () => {
    try {
      await navigator.clipboard.writeText(synthesisPrompt);
      setCopiedSynthesis(true);
      setTimeout(() => setCopiedSynthesis(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="space-y-6">
      {/* Chapter heading */}
      <div className="text-center mb-2">
        <div className="inline-block text-violet-400/60 mb-3"><FileText size={44} /></div>
        <h2 className="text-2xl font-serif font-light text-stone-100 mb-2">Your Session Package</h2>
        <p className="text-sm text-stone-400 max-w-md mx-auto leading-relaxed">
          Two prompts to guide your AI conversation. Copy and use them in sequence.
        </p>
      </div>

      {/* Instructions Overview */}
      <div className="bg-stone-900/40 border border-stone-700/30 rounded-xl p-5 space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">How This Works</p>
        <ol className="space-y-3 text-stone-300">
          {[
            { step: '1', text: <><strong className="text-violet-300">Copy the Context Package</strong> and paste it to start your AI conversation</> },
            { step: '2', text: <><strong className="text-violet-300">Have your conversation</strong> — take as long as you need</> },
            { step: '3', text: <><strong className="text-violet-300">When finished,</strong> copy the Synthesis Prompt and paste it to generate a continuity brief</> },
            { step: '4', text: <><strong className="text-violet-300">Save the brief</strong> somewhere — you'll paste it next session to continue</> },
          ].map(({ step, text }) => (
            <li key={step} className="flex gap-3 text-sm">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-500/20 text-violet-300 text-xs flex items-center justify-center font-bold border border-violet-500/30">{step}</span>
              <span>{text}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Prompts */}
      <div className="space-y-4">
        {/* Prompt 1: Context Package */}
        <div className="bg-stone-900/40 border border-violet-500/20 rounded-xl overflow-hidden">
          <div className="px-5 py-3 bg-gradient-to-r from-violet-950/30 to-stone-900/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare size={18} className="text-violet-400" />
              <div>
                <h3 className="font-semibold text-sm text-stone-100">1. Context Package</h3>
                <p className="text-[10px] text-violet-400/70 uppercase tracking-wider">Start your conversation</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setContextExpanded(v => !v)}
                className="flex items-center gap-1 px-2 py-1.5 text-stone-500 hover:text-stone-300 rounded-lg hover:bg-stone-800/50 transition-all text-xs"
                aria-label={contextExpanded ? 'Collapse' : 'Preview'}
              >
                <ChevronDown size={13} style={{ transform: contextExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                {contextExpanded ? 'Hide' : 'Preview'}
              </button>
              <button
                onClick={copyContext}
                className="flex items-center gap-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-medium transition-all"
              >
                {copiedContext ? <Check size={14} /> : <Copy size={14} />}
                {copiedContext ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          {contextExpanded && (
            <pre className="p-4 overflow-auto text-xs text-stone-400 leading-relaxed font-mono max-h-64 border-t border-violet-500/10">
              {contextPackage}
            </pre>
          )}
        </div>

        {/* Prompt 2: Synthesis Prompt */}
        <div className="bg-stone-900/40 border border-stone-700/30 rounded-xl overflow-hidden">
          <div className="px-5 py-3 bg-stone-900/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText size={18} className="text-stone-400" />
              <div>
                <h3 className="font-semibold text-sm text-stone-200">2. Synthesis Prompt</h3>
                <p className="text-[10px] text-stone-500 uppercase tracking-wider">End your conversation</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSynthExpanded(v => !v)}
                className="flex items-center gap-1 px-2 py-1.5 text-stone-500 hover:text-stone-300 rounded-lg hover:bg-stone-800/50 transition-all text-xs"
                aria-label={synthExpanded ? 'Collapse' : 'Preview'}
              >
                <ChevronDown size={13} style={{ transform: synthExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                {synthExpanded ? 'Hide' : 'Preview'}
              </button>
              <button
                onClick={copySynthesis}
                className="flex items-center gap-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-medium transition-all"
              >
                {copiedSynthesis ? <Check size={14} /> : <Copy size={14} />}
                {copiedSynthesis ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          {synthExpanded && (
            <pre className="p-4 overflow-auto text-xs text-stone-400 leading-relaxed font-mono max-h-64 border-t border-stone-700/30">
              {synthesisPrompt}
            </pre>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-stone-800/60">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-stone-400 hover:text-stone-200 hover:bg-stone-800/60 transition-all"
        >
          <ChevronLeft size={16} /> Back
        </button>
        <button
          onClick={onComplete}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-white transition-all shadow-lg shadow-amber-900/20"
        >
          I'm Ready → Waiting Room
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
