/**
 * Tab Identity System
 *
 * Provides distinct visual themes and layout presets for Learning/Theory tabs
 * while maintaining overall design coherence within the Alchemical Void system.
 *
 * Icons: all sacred geometry, NO Lucide.
 * Colors: mapped to the 4 ILP modules (shadow/mind/body/spirit) via data-module.
 * Surfaces: Alchemical Void stack (#111113 / #1a1a1f / #242428).
 */

import React from 'react';
import {
  CompassRoseIcon,
  IcosahedronIcon,
  ScrollIcon,
  NetworkNodesIcon,
  GrowthSpiralIcon,
  GoldenSpiralIcon,
  HendecagramIcon,
} from './SacredNavIcons';

/** The 4 canonical ILP modules — drives data-module and --module-accent cascade */
export type ILPModule = 'shadow' | 'mind' | 'body' | 'spirit';

/** Layout presets for page structure */
export type TabLayoutPreset = 'reading' | 'atlas' | 'lab' | 'canvas';

/** Icon component compatible with SacredNavIcons signature */
export type SacredIconComponent = React.FC<{
  size?: number | string;
  className?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}>;

/**
 * Tab theme configuration
 *
 * `module` drives `data-module` on the wrapper — this cascades
 * `--module-accent`, `--module-glow`, and `--void-base` from void-tokens.css.
 * Use `var(--module-accent)` in inline styles rather than hardcoded colors.
 */
export interface TabTheme {
  /** Display label */
  label: string;
  /** Sacred geometry icon component */
  icon: SacredIconComponent;
  /** ILP module — drives data-module attribute */
  module: ILPModule;
  /**
   * Header gradient background (Tailwind classes).
   * Uses the void-base for each module: all rooted in stone-950 depth.
   */
  headerBg: string;
  /** Page background (Tailwind / CSS) */
  pageBg: string;
  /** Surface/card background */
  surfaceBg: string;
  /** Layout preset */
  preset: TabLayoutPreset;
  /** Optional radial glow (CSS box-shadow value) — uses module-glow var */
  glow?: string;
  /** Optional texture/pattern overlay */
  texture?: string;
}

/**
 * Tab theme registry.
 *
 * Learning/theory tabs are mapped to the closest ILP module:
 * - aqal-learning  → shadow  (depth exploration, integration of all zones)
 * - integral-theory → mind   (conceptual framework, discernment)
 * - integral-history → mind  (scholarly, historical understanding)
 * - metamodern-bridge → spirit (bridging frameworks, transcendence of fixed views)
 * - practice-ecology → body  (embodied practice landscape)
 * - journey → spirit          (meaning-making, life trajectory)
 * - quiz → mind               (knowledge, epistemic testing)
 */
export const TAB_THEMES: Record<string, TabTheme> = {
  'aqal-learning': {
    label: 'AQAL Explorer',
    icon: CompassRoseIcon,
    module: 'shadow',
    headerBg: 'from-[#0c080f] via-[#0c080f] to-[#111113]',
    pageBg: 'bg-[#0c080f]',
    surfaceBg: 'bg-[#111113]',
    preset: 'canvas',
    glow: '0 0 60px oklch(0.58 0.18 290deg / 0.06)',
    texture: 'radial-gradient(circle at 50% 50%, oklch(0.58 0.18 290deg / 0.03) 0%, transparent 55%)',
  },

  'integral-theory': {
    label: 'Integral Theory',
    icon: IcosahedronIcon,
    module: 'mind',
    headerBg: 'from-[#07080f] via-[#07080f] to-[#111113]',
    pageBg: 'bg-[#07080f]',
    surfaceBg: 'bg-[#111113]',
    preset: 'atlas',
    texture: 'radial-gradient(ellipse 80% 50% at 20% 20%, oklch(0.52 0.22 255deg / 0.04) 0%, transparent 50%)',
  },

  'integral-history': {
    label: 'Integral History',
    icon: ScrollIcon,
    module: 'mind',
    headerBg: 'from-[#07080f] via-[#07080f] to-[#111113]',
    pageBg: 'bg-[#07080f]',
    surfaceBg: 'bg-[#111113]',
    preset: 'reading',
    texture: 'radial-gradient(ellipse 60% 40% at 80% 80%, oklch(0.52 0.22 255deg / 0.03) 0%, transparent 50%)',
  },

  'metamodern-bridge': {
    label: 'Metamodern Bridge',
    icon: NetworkNodesIcon,
    module: 'spirit',
    headerBg: 'from-[#0f0c07] via-[#0f0c07] to-[#111113]',
    pageBg: 'bg-[#0f0c07]',
    surfaceBg: 'bg-[#111113]',
    preset: 'lab',
    texture: 'radial-gradient(ellipse 70% 50% at 30% 30%, oklch(0.65 0.14 50deg / 0.04) 0%, transparent 60%)',
  },

  'practice-ecology': {
    label: 'Practice Ecology',
    icon: GrowthSpiralIcon,
    module: 'body',
    headerBg: 'from-[#080e0c] via-[#080e0c] to-[#111113]',
    pageBg: 'bg-[#080e0c]',
    surfaceBg: 'bg-[#111113]',
    preset: 'canvas',
    texture: 'radial-gradient(ellipse 50% 50% at 50% 50%, oklch(0.72 0.17 160deg / 0.03) 0%, transparent 50%)',
  },

  'journey': {
    label: 'Journey',
    icon: GoldenSpiralIcon,
    module: 'spirit',
    headerBg: 'from-[#0f0c07] via-[#0f0c07] to-[#111113]',
    pageBg: 'bg-[#0f0c07]',
    surfaceBg: 'bg-[#111113]',
    preset: 'canvas',
    texture: 'radial-gradient(ellipse 60% 60% at 50% 50%, oklch(0.65 0.14 50deg / 0.03) 0%, transparent 50%)',
  },

  'quiz': {
    label: 'ILP Knowledge',
    icon: HendecagramIcon,
    module: 'mind',
    headerBg: 'from-[#07080f] via-[#07080f] to-[#111113]',
    pageBg: 'bg-[#07080f]',
    surfaceBg: 'bg-[#111113]',
    preset: 'reading',
    texture: 'radial-gradient(ellipse 50% 50% at 70% 30%, oklch(0.52 0.22 255deg / 0.03) 0%, transparent 50%)',
  },
};

/** Get theme for a specific tab */
export const getTabTheme = (tabId: string): TabTheme | undefined => {
  return TAB_THEMES[tabId];
};

/**
 * Get layout-specific wrapper classes.
 * Structural hints without forcing rigid layouts.
 */
export const getLayoutClasses = (preset: TabLayoutPreset): string => {
  switch (preset) {
    case 'reading':
      return 'max-w-5xl mx-auto px-6 sm:px-8';
    case 'atlas':
      return 'max-w-7xl mx-auto px-6 sm:px-8';
    case 'lab':
      return 'max-w-full px-6 sm:px-8 lg:px-12';
    case 'canvas':
      return 'w-full';
    default:
      return 'max-w-6xl mx-auto px-6 sm:px-8';
  }
};
