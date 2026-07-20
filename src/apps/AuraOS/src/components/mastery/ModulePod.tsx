import React from 'react';
import { ConceptMasteryRing } from './ConceptMasteryRing';
import { typography, getButtonClass } from '../../../theme';

export interface ModuleMastery {
  level: number;
  tier: 'novice' | 'practitioner' | 'adept' | 'contemplative';
  questionsAttempted: number;
  questionsCorrect: number;
  conceptsMastered?: number;
  totalConcepts?: number;
}

interface ModulePodProps {
  id: string;
  name: string;
  description?: string;
  icon: React.FC<{ size?: number; className?: string; color?: string }>;
  mastery: ModuleMastery;
  color: {
    primary: string;
    light: string;
    dark: string;
    glow: string;
  };
  isSelected: boolean;
  onSelect: () => void;
}

const getTierLabel = (tier: ModuleMastery['tier']) => {
  const labels = {
    novice: 'Novice',
    practitioner: 'Practitioner',
    adept: 'Adept',
    contemplative: 'Contemplative',
  };
  return labels[tier];
};

export const ModulePod: React.FC<ModulePodProps> = ({
  name,
  description,
  icon: Icon,
  mastery,
  color,
  isSelected,
  onSelect,
}) => {
  const accuracy = mastery.questionsAttempted > 0
    ? Math.round((mastery.questionsCorrect / mastery.questionsAttempted) * 100)
    : 0;

  return (
    <button
      onClick={onSelect}
      className={`
        relative group cursor-pointer text-left
        rounded-lg overflow-hidden
        transition-all duration-200
        ${isSelected ? '' : 'hover:bg-stone-800/30'}
      `}
      style={{
        background: isSelected ? 'rgba(41, 37, 36, 0.6)' : 'rgba(28, 25, 23, 0.4)',
        border: `1px solid ${isSelected ? color.primary : 'rgba(68, 64, 60, 0.5)'}`,
        boxShadow: isSelected ? `0 0 0 1px ${color.primary}` : undefined,
      }}
    >
      <div className="p-4 space-y-3">
        {/* Icon and Name */}
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <div
              className="p-3 rounded-full relative z-10"
              style={{
                background: `${color.primary}15`,
              }}
            >
              <Icon size={20} color={color.primary} />
            </div>

            {/* Mastery Ring Component Integrated Directly */}
            <div className="absolute inset-0 -m-1.5 flex items-center justify-center">
              <ConceptMasteryRing
                score={mastery.level}
                size={56}
                strokeWidth={3}
                color={color.primary}
                isMastered={mastery.tier === 'contemplative'}
              />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className={`${typography.label} text-stone-200 leading-tight`}>
              {name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`${typography.caption} text-stone-500 uppercase tracking-wider`}>{getTierLabel(mastery.tier)}</span>
              {mastery.questionsAttempted > 0 && (
                <span className={typography.caption} style={{ color: color.primary }}>{mastery.level}%</span>
              )}
            </div>
            {description && (
              <p className={`${typography.caption} text-stone-600 mt-2 line-clamp-1 border-stone-800/40`}>
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Accuracy and Volume */}
        {mastery.questionsAttempted > 0 && (
          <div className="pt-2 flex items-center justify-between border-t border-stone-800/30">
            <div className={`${typography.caption} text-stone-500`}>
              {accuracy}% accuracy
            </div>
            <div className={`${typography.caption} text-stone-500`}>
              {mastery.questionsAttempted} Qs
            </div>
          </div>
        )}

        {mastery.questionsAttempted === 0 && (
          <div className={`${typography.caption} text-stone-600 italic`}>
            Begin your exploration
          </div>
        )}
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <div
          className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full"
          style={{ background: color.primary }}
        />
      )}
    </button>
  );
};
