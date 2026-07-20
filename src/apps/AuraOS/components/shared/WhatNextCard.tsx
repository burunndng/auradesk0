import React from 'react';
import { type ModuleKey, WIZARD_PROGRESSION_MAP } from '../../data/wizardProgressionMap';
import {
  UmbraFragmentIcon,
  InquiryVortexIcon,
  ResonanceFieldIcon,
  AscensionFlameIcon,
  AOSArrowIcon,
  AOSRejectIcon,
} from '../visualizations/SacredGeometryIcons';

// Matches actual tab implementations: MindToolsTab=teal, SpiritToolsTab=amber
const MODULE_ACCENT: Record<ModuleKey, string> = {
  shadow: 'oklch(0.58 0.18 290deg)',   // purple
  mind:   'oklch(0.72 0.14 185deg)',   // teal  (matches MindToolsTab)
  body:   'oklch(0.72 0.17 160deg)',   // emerald
  spirit: 'oklch(0.78 0.17 76deg)',    // amber  (matches SpiritToolsTab)
};

const MODULE_ICON: Record<ModuleKey, React.ReactNode> = {
  shadow: <UmbraFragmentIcon size={20} />,
  mind:   <InquiryVortexIcon size={20} />,
  body:   <ResonanceFieldIcon size={20} />,
  spirit: <AscensionFlameIcon size={20} />,
};

interface WhatNextCardProps {
  fromWizardId: string;
  moduleKey: ModuleKey;
  onDismiss: () => void;
  onBegin: (wizardId: string) => void;
}

export default function WhatNextCard({ fromWizardId, moduleKey, onDismiss, onBegin }: WhatNextCardProps) {
  const progression = WIZARD_PROGRESSION_MAP[fromWizardId];
  if (!progression) return null;

  const accent = MODULE_ACCENT[moduleKey];

  return (
    <div
      className="bg-neutral-950/90 rounded-xl px-5 py-4 flex items-center gap-4 mb-6"
      style={{ border: `1px solid color-mix(in oklch, ${accent} 25%, transparent)` }}
    >
      <div style={{ color: accent }}>
        {MODULE_ICON[moduleKey]}
      </div>

      <div className="flex-1 min-w-0">
        <div
          className="text-xs font-mono uppercase tracking-[0.15em] mb-0.5"
          style={{ color: `color-mix(in oklch, ${accent} 65%, transparent)` }}
        >
          Continue your practice
        </div>
        <div className="text-base font-serif text-neutral-100 leading-tight">
          {progression.nextTitle}
        </div>
        <div className="text-sm text-neutral-400 mt-0.5 leading-snug">
          {progression.rationale}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onBegin(progression.nextWizardId)}
          className="min-h-[44px] px-4 rounded-lg font-mono text-xs uppercase tracking-[0.15em] transition-all duration-200 flex items-center gap-2 bg-transparent hover:bg-neutral-900/80"
          style={{ color: accent, border: `1px solid color-mix(in oklch, ${accent} 30%, transparent)` }}
        >
          Begin <AOSArrowIcon size={12} />
        </button>
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="min-h-[44px] w-10 rounded-lg flex items-center justify-center text-neutral-600 hover:text-neutral-300 transition-colors border border-transparent hover:border-neutral-800"
        >
          <AOSRejectIcon size={14} />
        </button>
      </div>
    </div>
  );
}
