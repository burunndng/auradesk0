/**
 * Reusable style utilities - Mystical Editorial Design System
 * Updated with distinctive color personality and sophisticated interactions
 */

import { colors } from '../theme';

// Card styles - Atmospheric depth with module-aware accents
export const cardClasses = {
  base: 'bg-neutral-900/50 border border-neutral-800/50 rounded-lg p-6 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.7)]',
  hover: 'hover:border-neutral-700/60 hover:shadow-[0_16px_48px_rgba(0,0,0,0.9)] hover:-translate-y-1 transition-all duration-500',
  glass: 'backdrop-blur-xl bg-neutral-900/40 shadow-[0_0_24px_rgba(255,255,255,0.02)]',
};

// Button styles - Sophisticated with personality
export const buttonClasses = {
  primary: 'bg-neutral-800/80 hover:bg-neutral-700/90 text-neutral-50 px-4 py-2.5 rounded-lg font-medium font-sans border border-neutral-600/50 shadow-lg hover:shadow-[0_8px_24px_rgba(0,0,0,0.6)] hover:brightness-110 transition-[background-color,box-shadow,filter] duration-[180ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] backdrop-blur-sm',
  secondary: 'bg-neutral-900/40 hover:bg-neutral-800/60 text-neutral-200 px-4 py-2.5 rounded-lg font-medium font-sans border border-neutral-700/40 backdrop-blur-sm transition-all duration-500',
  ghost: 'bg-transparent hover:bg-neutral-800/30 text-neutral-300 hover:text-neutral-100 px-4 py-2.5 rounded-lg font-medium font-sans border border-transparent hover:border-neutral-700/40 transition-all duration-500',
};

// Layout utilities
export const flexCenter = 'flex items-center justify-center';
export const flexBetween = 'flex items-center justify-between';
export const flexColCenter = 'flex flex-col items-center justify-center';

/**
 * Get module-specific CSS classes - Each domain has meaningful character
 * Mind: Cyan/Blue (Clarity, intellect)
 * Shadow: Purple/Violet (Mystery, depth)
 * Body: Orange/Amber (Vitality, grounding)
 * Spirit: Yellow/Teal (Transcendence, illumination)
 */
export const getModuleClasses = (module: 'mind' | 'shadow' | 'body' | 'spirit') => {
  const colorMap = {
    mind: 'text-blue-400 bg-blue-950/30 border-blue-500/30 hover:border-blue-400/50 hover:shadow-[0_0_24px_rgba(59,130,246,0.2)]',
    shadow: 'text-purple-500 bg-purple-950/30 border-purple-500/30 hover:border-purple-400/50 hover:shadow-[0_0_24px_rgba(192,132,252,0.2)]',
    body: 'text-emerald-500 bg-emerald-950/30 border-emerald-500/30 hover:border-emerald-400/50 hover:shadow-[0_0_24px_rgba(16,185,129,0.2)]',
    spirit: 'text-amber-400 bg-amber-950/30 border-amber-500/30 hover:border-amber-400/50 hover:shadow-[0_0_24px_rgba(245,158,11,0.2)]',
  };
  return colorMap[module];
};

/**
 * Get module-specific CSS variable styles for inline styling
 * Usage: style={getModuleStyles('mind')}
 */
export const getModuleStyles = (module: 'mind' | 'shadow' | 'body' | 'spirit') => {
  const moduleColor = colors.modules[module];
  if (!moduleColor) {
    console.warn(`[Styles] Invalid module key: "${module}". Falling back to "mind".`);
    const fallback = colors.modules.mind;
    return {
      color: fallback.text,
      borderColor: fallback.border,
      backgroundColor: fallback.bg,
    };
  }
  return {
    color: moduleColor.text,
    borderColor: moduleColor.border,
    backgroundColor: moduleColor.bg,
  };
};
