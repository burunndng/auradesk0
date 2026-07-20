/**
 * PsychedelicJourneyHub - Unified entry point for psychedelic preparation and integration
 *
 * Features:
 * - Selector view with both prep and integration cards side-by-side
 * - Equal visual weight for both paths (neither privileged)
 * - Resume draft support
 * - Visual indicator when prep is complete but integration pending
 * - Back button returns to selector, not parent tab
 */

import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { getIconComponent } from '../../.claude/lib/iconMap';
import PsychedelicJourneyWizard from './PsychedelicJourneyWizard';
import type { PsychedelicJourneySession, IntegratedInsight } from '../../types';

interface PsychedelicJourneyHubProps {
  onClose: () => void;
  onSave: (session: PsychedelicJourneySession) => void;
  draft?: Partial<PsychedelicJourneySession> | null;
  insightContext?: IntegratedInsight | null;
  markInsightAsAddressed?: (insightId: string, wizardType: string, sessionId: string) => void;
}

type HubView = 'selector' | 'prep-wizard' | 'integration-wizard';

export default function PsychedelicJourneyHub({
  onClose,
  onSave,
  draft,
  insightContext,
  markInsightAsAddressed,
}: PsychedelicJourneyHubProps) {
  const [view, setView] = useState<HubView>('selector');

  // Check if prep is complete (for visual indicator)
  const prepComplete = draft?.prepCompletedAt !== undefined;
  const integrationStarted = draft?.integrationStartedAt !== undefined;
  const hasDraft = draft !== null && draft !== undefined;

  // Handler to return to selector
  const handleBackToSelector = () => {
    setView('selector');
  };

  // Handler for wizard save - returns to selector
  const handleWizardSave = (session: PsychedelicJourneySession) => {
    onSave(session);
    setView('selector');
  };

  // Render wizard view
  if (view === 'prep-wizard' || view === 'integration-wizard') {
    const mode = view === 'prep-wizard' ? 'prep' : 'integration';

    return (
      <PsychedelicJourneyWizard
        onClose={handleBackToSelector}
        onSave={handleWizardSave}
        session={draft}
        insightContext={insightContext}
        markInsightAsAddressed={markInsightAsAddressed}
        mode={mode}
      />
    );
  }

  // Render selector view
  const InquiryVortexIcon = getIconComponent('InquiryVortex');
  const EvolutionaryUnfoldingIcon = getIconComponent('EvolutionaryUnfolding');

  return (
    <div className="fixed inset-0 bg-stone-950 z-50 flex flex-col">
      {/* Header */}
      <div className="border-b border-purple-500/30 bg-stone-900/80 px-4 sm:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition p-2 hover:bg-stone-800 rounded-lg"
            aria-label="Close psychedelic journeys hub"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-100">
              Psychedelic Journeys
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Choose your path: preparation or integration
            </p>
          </div>
        </div>
        {React.createElement(getIconComponent('VoidBloom') || 'div', { size: 28, className: 'text-purple-300' })}
      </div>

      {/* Selector Cards Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Connection indicator if prep is complete */}
          {prepComplete && !integrationStarted && (
            <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg flex items-center gap-3">
              <CheckCircle2 size={20} className="text-purple-400 flex-shrink-0" />
              <p className="text-xs sm:text-sm text-purple-200">
                You've completed your preparation. Ready to integrate your journey?
              </p>
            </div>
          )}

          {/* Side-by-side cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Preparation Card */}
            <button
              onClick={() => setView('prep-wizard')}
              className="group relative bg-stone-950/80 border border-purple-500/30 rounded-lg p-6 sm:p-8 flex flex-col transition-all duration-300 hover:border-purple-400/60 hover:shadow-lg hover:shadow-purple-500/20 text-left"
              aria-label="Start or resume psychedelic preparation"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Content */}
              <div className="relative z-10 flex flex-col h-full">
                {/* Icon and title */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0">
                    <InquiryVortexIcon className="w-12 h-12 sm:w-16 sm:h-16 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-100 mb-2">
                      Preparation
                    </h2>
                    {prepComplete && (
                      <span className="inline-flex items-center gap-1 text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                        <CheckCircle2 size={12} />
                        Complete
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-400 mb-6 flex-grow">
                  Set intention, assess readiness, optimize set and setting, and create a safety plan for your psychedelic journey.
                </p>

                {/* When to use */}
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-purple-300 mb-2 uppercase tracking-wide">
                    When to Use
                  </h3>
                  <ul className="text-xs text-slate-400 space-y-1">
                    <li>• Planning a psychedelic therapy or ceremonial experience</li>
                    <li>• Need preparation guidance and safety support</li>
                    <li>• Want to clarify intention and set before the journey</li>
                  </ul>
                </div>

                {/* Action button area */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">30-45 minutes</span>
                  <span className="text-xs sm:text-sm font-medium text-purple-400 group-hover:text-purple-300 transition">
                    {hasDraft && !prepComplete ? 'Resume →' : 'Start →'}
                  </span>
                </div>
              </div>
            </button>

            {/* Integration Card */}
            <button
              onClick={() => setView('integration-wizard')}
              className="group relative bg-stone-950/80 border border-purple-500/30 rounded-lg p-6 sm:p-8 flex flex-col transition-all duration-300 hover:border-purple-400/60 hover:shadow-lg hover:shadow-indigo-500/20 text-left"
              aria-label="Start or resume psychedelic integration"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Content */}
              <div className="relative z-10 flex flex-col h-full">
                {/* Icon and title */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0">
                    <EvolutionaryUnfoldingIcon className="w-12 h-12 sm:w-16 sm:h-16 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-100 mb-2">
                      Integration
                    </h2>
                    {integrationStarted && (
                      <span className="inline-flex items-center gap-1 text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                        <CheckCircle2 size={12} />
                        In Progress
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-400 mb-6 flex-grow">
                  Process narrative, make meaning of insights, explore somatic integration, and create concrete follow-up practices.
                </p>

                {/* When to use */}
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-purple-300 mb-2 uppercase tracking-wide">
                    When to Use
                  </h3>
                  <ul className="text-xs text-slate-400 space-y-1">
                    <li>• Integrating insights from a recent psychedelic journey</li>
                    <li>• Seeking meaning-making from a transformative experience</li>
                    <li>• Want structured follow-up after the experience</li>
                  </ul>
                </div>

                {/* Action button area */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">30-45 minutes</span>
                  <span className="text-xs sm:text-sm font-medium text-purple-400 group-hover:text-purple-300 transition">
                    {hasDraft && integrationStarted ? 'Resume →' : 'Start →'}
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* Footer note */}
          <div className="mt-8 p-4 bg-purple-500/5 border border-purple-500/20 rounded-lg">
            <p className="text-xs sm:text-sm text-slate-400 text-center">
              <strong className="text-purple-300">Note:</strong> These tools support your journey but do not replace professional guidance.
              Consult qualified practitioners for psychedelic therapy or harm reduction support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
