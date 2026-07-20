/**
 * Theme Configuration
 * Mystical Editorial - A distinctive design system for Aura ILP
 * Design philosophy: Sophisticated depth with meaningful color personality
 * Each module embodies its domain through color, atmosphere, and character
 */

// Base Color Palette (merged from design-tokens.ts)
export const colors = {
  neutral: {
    950: '#0a0a10',
    900: '#1a1a24',
    800: '#2d2d3a',
    700: '#3f3f4f',
    600: '#525263',
    500: '#737385',
    400: '#a3a3b3',
    300: '#d4d4e0',
    100: '#f5f5fa',
  },
  accent: {
    blue: { 500: '#3b82f6', 400: '#60a5fa' },
    cyan: { 500: '#06b6d4', 400: '#22d3ee' },
    purple: { 500: '#a855f7', 400: '#c084fc' },
    violet: { 500: '#8b5cf6', 400: '#a78bfa' },
    emerald: { 500: '#10b981', 400: '#34d399' },
    green: { 500: '#22c55e', 400: '#4ade80' },
    amber: { 500: '#f59e0b', 400: '#fbbf24' },
    orange: { 500: '#f97316', 400: '#fb923c' },
    yellow: { 500: '#eab308', 400: '#facc15' },
    teal: { 500: '#14b8a6', 400: '#2dd4bf' },
    indigo: { 500: '#6366f1', 400: '#818cf8' },
    fuchsia: { 500: '#d946ef', 400: '#e879f9' },
    sky: { 500: '#0ea5e9', 400: '#38bdf8' },
  },
  modules: {
    core: { primary: '#8B7355', bg: 'rgba(139, 115, 85, 0.2)', border: 'rgba(139, 115, 85, 0.3)', text: '#8B7355' },
    mind: { primary: '#3b82f6', bg: 'rgba(59, 130, 246, 0.2)', border: 'rgba(59, 130, 246, 0.3)', text: '#3b82f6' },
    shadow: { primary: '#c084fc', bg: 'rgba(192, 132, 252, 0.2)', border: 'rgba(192, 132, 252, 0.3)', text: '#c084fc' },
    body: { primary: '#fb923c', bg: 'rgba(251, 146, 60, 0.2)', border: 'rgba(251, 146, 60, 0.3)', text: '#fb923c' },
    spirit: { primary: '#c9830a', bg: 'rgba(201, 131, 10, 0.2)', border: 'rgba(201, 131, 10, 0.3)', text: '#c9830a' },
    'integral-theory': { primary: '#2C5F5C', bg: 'rgba(44, 95, 92, 0.2)', border: 'rgba(44, 95, 92, 0.3)', text: '#2C5F5C' },
  }
};

export const shadows = {
  sm: '0 4px 12px rgba(0, 0, 0, 0.4)',
  md: '0 8px 32px rgba(0, 0, 0, 0.7)',
  lg: '0 16px 48px rgba(0, 0, 0, 0.9)',
  glow: '0 0 24px rgba(255, 255, 255, 0.03)',
};

// Spacing tokens (REM values) for inline styles
export const spacing = {
  xs: '0.25rem', // 4px
  sm: '0.5rem',  // 8px
  md: '0.75rem', // 12px
  lg: '1rem',    // 16px
  xl: '1.5rem',  // 24px
  '2xl': '2rem', // 32px
};

export const theme = {
  // ... existing background ...
  background: {
    base: 'neutral-950',
    elevated: 'neutral-900/60',
    glass: 'neutral-900/30',
    cosmic: 'linear-gradient(135deg, #0a0a0f 0%, #14141f 50%, #0f0a14 100%)',
  },

  // Module-specific color system
  modules: {
    core: {
      primary: 'stone-400',
      primaryHex: '#8B7355',
      secondary: '#A69076',
      glow: 'rgba(139, 115, 85, 0.25)',
      gradient: 'from-stone-500/20 via-stone-600/15 to-stone-700/20',
      gradientBg: 'from-stone-900/40 to-stone-950/30',
      borderColor: 'border-stone-500/30',
      borderColorHover: 'hover:border-stone-400/60',
      accentClass: 'accent-stone',
      shadowColor: '0 8px 32px rgba(139, 115, 85, 0.2)',
      label: 'Core',
    },
    mind: {
      primary: 'blue-500',
      primaryHex: '#3b82f6',
      secondary: '#2563eb',
      glow: 'rgba(59, 130, 246, 0.25)',
      gradient: 'from-blue-600/20 via-blue-500/15 to-indigo-600/20',
      gradientBg: 'from-blue-950/40 to-indigo-950/30',
      borderColor: 'border-blue-500/30',
      borderColorHover: 'hover:border-blue-400/60',
      accentClass: 'accent-blue',
      shadowColor: '0 8px 32px rgba(59, 130, 246, 0.2)',
      label: 'Mind',
    },
    shadow: {
      primary: 'purple-400',
      primaryHex: '#c084fc',
      secondary: '#a855f7',
      glow: 'rgba(192, 132, 252, 0.25)',
      gradient: 'from-purple-500/20 via-violet-500/15 to-purple-600/20',
      gradientBg: 'from-purple-950/40 to-violet-950/30',
      borderColor: 'border-purple-500/30',
      borderColorHover: 'hover:border-purple-400/60',
      accentClass: 'accent-purple',
      shadowColor: '0 8px 32px rgba(192, 132, 252, 0.2)',
      label: 'Shadow',
    },
    body: {
      primary: 'orange-400',
      primaryHex: '#fb923c',
      secondary: '#f97316',
      glow: 'rgba(251, 146, 60, 0.25)',
      gradient: 'from-orange-500/20 via-amber-500/15 to-orange-600/20',
      gradientBg: 'from-orange-950/40 to-amber-950/30',
      borderColor: 'border-orange-500/30',
      borderColorHover: 'hover:border-orange-400/60',
      accentClass: 'accent-orange',
      shadowColor: '0 8px 32px rgba(251, 146, 60, 0.2)',
      label: 'Body',
    },
    spirit: {
      primary: 'amber-500',
      primaryHex: '#c9830a',
      secondary: '#d97706',
      glow: 'rgba(201, 131, 10, 0.25)',
      gradient: 'from-amber-600/20 via-amber-500/15 to-yellow-700/20',
      gradientBg: 'from-amber-950/40 to-yellow-950/30',
      borderColor: 'border-amber-500/30',
      borderColorHover: 'hover:border-amber-400/60',
      accentClass: 'accent-amber',
      shadowColor: '0 8px 32px rgba(201, 131, 10, 0.2)',
      label: 'Spirit',
    },
    'integral-theory': {
      primary: 'teal-400',
      primaryHex: '#2C5F5C',
      secondary: '#3D7A76',
      glow: 'rgba(44, 95, 92, 0.25)',
      gradient: 'from-teal-500/20 via-emerald-500/15 to-teal-600/20',
      gradientBg: 'from-teal-950/40 to-emerald-950/30',
      borderColor: 'border-teal-500/30',
      borderColorHover: 'hover:border-teal-400/60',
      accentClass: 'accent-teal',
      shadowColor: '0 8px 32px rgba(44, 95, 92, 0.2)',
      label: 'Integral Theory',
    },
  },

  // Additional accent colors (merged from design-tokens.ts)
  accents: {
    indigo: { primary: '#6366f1', border: 'rgba(99, 102, 241, 0.3)', bg: 'rgba(49, 46, 129, 0.2)' },
    teal: { primary: '#14b8a6', border: 'rgba(20, 184, 166, 0.3)', bg: 'rgba(19, 78, 74, 0.2)' },
    fuchsia: { primary: '#d946ef', border: 'rgba(217, 70, 239, 0.3)', bg: 'rgba(112, 26, 117, 0.2)' },
    sky: { primary: '#0ea5e9', border: 'rgba(14, 165, 233, 0.3)', bg: 'rgba(12, 74, 110, 0.2)' },
    emerald: { primary: '#10b981', border: 'rgba(16, 185, 129, 0.3)', bg: 'rgba(5, 46, 22, 0.2)' },
  },

  // Text colors - High contrast with warmth
  text: {
    primary: 'neutral-50',
    secondary: 'neutral-400',
    accent: 'neutral-200',
    muted: 'neutral-500',
  },

  // Card styles - Atmospheric depth with subtle glow
  card: {
    base: 'bg-neutral-900/50 backdrop-blur-md',
    border: 'border border-neutral-800/50',
    shadow: 'shadow-[0_8px_32px_rgba(0,0,0,0.7)]',
    shadowHover: 'hover:shadow-[0_16px_48px_rgba(0,0,0,0.9)]',
    transition: 'transition-all duration-500 ease-out',
    hover: 'hover:-translate-y-1',
    glow: 'shadow-[0_0_24px_rgba(255,255,255,0.03)]',
  },

  // Button styles - Sophisticated with personality
  button: {
    primary: 'bg-neutral-800/80 hover:bg-neutral-700/90 border border-neutral-600/50 shadow-lg hover:shadow-2xl transform hover:scale-[1.03] backdrop-blur-sm',
    secondary: 'bg-neutral-900/40 hover:bg-neutral-800/60 border border-neutral-700/40 backdrop-blur-sm',
    ghost: 'bg-transparent hover:bg-neutral-800/30 border border-transparent hover:border-neutral-700/40',
  },

  // Animation classes - Enhanced with sophistication
  animation: {
    fadeIn: 'animate-fade-in',
    fadeInUp: 'animate-fade-in-up',
    slideInRight: 'animate-slide-in-right',
    popIn: 'animate-pop-in',
    glow: 'animate-glow-pulse',
    shimmer: 'animate-shimmer',
    float: 'animate-float',
  },
};

// Helper functions for module-specific styling
export const getModuleTheme = (module: 'mind' | 'shadow' | 'body' | 'spirit') => {
  const moduleTheme = theme.modules[module];
  if (!moduleTheme) {
    console.warn(`[Theme] Invalid module key: "${module}". Falling back to "mind".`);
    return theme.modules.mind;
  }
  return moduleTheme;
};

export const getCardClasses = (accentModule?: 'mind' | 'shadow' | 'body' | 'spirit') => {
  const base = `${theme.card.base} ${theme.card.border} ${theme.card.shadow} ${theme.card.shadowHover} ${theme.card.transition} ${theme.card.hover}`;
  if (accentModule) {
    const moduleTheme = theme.modules[accentModule];
    if (!moduleTheme) {
      console.warn(`[Theme] Invalid accent module: "${accentModule}"`);
      return base;
    }
    return `${base} ${moduleTheme.borderColor} ${moduleTheme.borderColorHover}`;
  }
  return base;
};

export const getGradientText = (module: 'mind' | 'shadow' | 'body' | 'spirit') => {
  const moduleTheme = theme.modules[module];
  if (!moduleTheme) {
    console.warn(`[Theme] Invalid module key for gradient: "${module}". Falling back to "mind".`);
    return `bg-gradient-to-r ${theme.modules.mind.gradient} bg-clip-text text-transparent`;
  }
  return `bg-gradient-to-r ${moduleTheme.gradient} bg-clip-text text-transparent`;
};

// Spacing utilities - Systematic scale for consistent spacing (Tailwind Classes)
export const spacingClasses = {
  // Component spacing
  card: 'p-6',
  cardCompact: 'p-4',
  cardLarge: 'p-8',
  modal: 'p-4 sm:p-6',
  modalHeader: 'p-4 sm:p-6',
  modalFooter: 'p-4 sm:p-6',

  // Layout spacing
  section: 'space-y-6',
  sectionCompact: 'space-y-4',
  sectionLarge: 'space-y-8',
  stack: 'space-y-4',
  stackTight: 'space-y-2',
  stackLoose: 'space-y-6',
  inline: 'space-x-4',
  inlineTight: 'space-x-2',
  inlineLoose: 'space-x-6',

  // Button spacing
  buttonPadding: 'px-4 py-2.5',
  buttonPaddingSmall: 'px-3 py-2',
  buttonPaddingLarge: 'px-6 py-3',
  buttonGap: 'gap-2',

  // Grid spacing
  gridGap: 'gap-4',
  gridGapTight: 'gap-2',
  gridGapLoose: 'gap-6',

  // Container spacing
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  containerNarrow: 'max-w-4xl mx-auto px-4 sm:px-6',
  containerWide: 'max-w-full mx-auto px-4 sm:px-6 lg:px-8',
} as const;

// Common shadow and backdrop effects
export const effects = {
  // Box shadows
  shadowSmall: 'shadow-[0_2px_8px_rgba(0,0,0,0.4)]',
  shadowMedium: 'shadow-[0_8px_32px_rgba(0,0,0,0.7)]',
  shadowLarge: 'shadow-[0_16px_48px_rgba(0,0,0,0.9)]',
  shadowGlow: 'shadow-[0_0_24px_rgba(255,255,255,0.03)]',

  // Backdrop effects
  backdropBlur: 'backdrop-blur-md',
  backdropBlurLight: 'backdrop-blur-sm',
  backdropBlurHeavy: 'backdrop-blur-lg',

  // Glass morphism
  glass: 'bg-neutral-900/30 backdrop-blur-md',
  glassCard: 'bg-neutral-900/50 backdrop-blur-md border border-neutral-800/50',
  glassDark: 'bg-neutral-900/60 backdrop-blur-md',

  // Gradient backgrounds
  gradientCosmic: 'bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950',
  gradientSubtle: 'bg-gradient-to-b from-neutral-900 to-neutral-950',
} as const;

// Responsive Breakpoints - Mobile-first approach
export const breakpoints = {
  xs: 320,  // Extra small phones
  sm: 640,  // Small tablets/large phones
  md: 768,  // Tablets
  lg: 1024, // Laptops/desktops
  xl: 1280, // Large desktops
  '2xl': 1536, // Extra large desktops
} as const;

// Touch Target Utilities - WCAG 2.1 AA compliance (minimum 44x44px)
export const touchTargets = {
  // Minimum touch target size
  minSize: 'min-h-[44px] min-w-[44px]',

  // Button variants with proper touch targets
  buttonBase: 'min-h-[44px] px-4 py-3 touch-target',
  buttonSmall: 'min-h-[44px] px-3 py-2.5 touch-target',
  buttonLarge: 'min-h-[52px] px-6 py-4 touch-target',

  // Icon buttons (square touch targets)
  iconButton: 'min-h-[44px] min-w-[44px] p-2 touch-target',
  iconButtonSmall: 'min-h-[44px] min-w-[44px] p-1.5 touch-target',
  iconButtonLarge: 'min-h-[52px] min-w-[52px] p-3 touch-target',

  // Interactive list items
  listItem: 'min-h-[44px] py-3 touch-target',

  // Tab buttons
  tab: 'min-h-[44px] px-4 py-3 touch-target',
} as const;

// Mobile-specific spacing scale (tighter on mobile, looser on desktop)
export const mobileSpacing = {
  // Container padding - responsive
  containerMobile: 'px-4 py-3',
  containerTablet: 'sm:px-6 sm:py-4',
  containerDesktop: 'lg:px-8 lg:py-6',

  // Card padding - responsive
  cardMobile: 'p-4',
  cardTablet: 'sm:p-5',
  cardDesktop: 'lg:p-6',

  // Section spacing - responsive
  sectionMobile: 'space-y-4',
  sectionTablet: 'sm:space-y-5',
  sectionDesktop: 'lg:space-y-6',

  // Stack spacing - responsive
  stackMobile: 'space-y-3',
  stackTablet: 'sm:space-y-4',
  stackDesktop: 'lg:space-y-5',
} as const;

// Responsive Typography Utilities - Enhanced with sizing, weight, leading
export const typography = {
  // Headings - scale down on mobile
  h1: 'text-2xl sm:text-3xl lg:text-4xl font-serif font-bold leading-tight tracking-tight',
  h2: 'text-xl sm:text-2xl lg:text-3xl font-serif font-semibold leading-snug tracking-tight',
  h3: 'text-lg sm:text-xl lg:text-2xl font-serif font-semibold leading-snug tracking-tight',
  h4: 'text-base sm:text-lg lg:text-xl font-serif font-medium leading-normal tracking-normal',
  h5: 'text-sm sm:text-base lg:text-lg font-serif font-medium leading-normal tracking-normal',
  h6: 'text-xs sm:text-sm lg:text-base font-serif font-medium leading-normal tracking-normal',

  // Body text - comfortable reading size
  body: 'text-sm sm:text-base lg:text-base font-sans font-normal leading-relaxed',
  bodySmall: 'text-xs sm:text-sm lg:text-sm font-sans font-normal leading-relaxed',
  bodyLarge: 'text-base sm:text-lg lg:text-lg font-sans font-normal leading-relaxed',

  // Labels and UI text
  label: 'text-xs sm:text-sm lg:text-sm font-sans font-medium leading-normal',
  caption: 'text-xs font-sans font-normal leading-normal',
  captionSmall: 'text-xs font-sans font-normal leading-tight',

  // Code and mono
  code: 'text-xs sm:text-sm font-mono font-normal leading-normal',

  // Additional semantic styles
  display: 'text-3xl sm:text-4xl lg:text-5xl font-serif font-bold leading-tight tracking-tighter',
  displaySmall: 'text-2xl sm:text-3xl lg:text-4xl font-serif font-bold leading-tight tracking-tight',
  subtitle: 'text-lg sm:text-xl lg:text-2xl font-serif font-medium leading-snug tracking-tight text-neutral-300',
  overline: 'text-xs font-sans font-bold uppercase tracking-wider leading-none',
} as const;

/**
 * Enhanced Typography Scale - More granular control
 * Maps typography level to responsive sizes, weights, and spacing
 *
 * Usage:
 * <h1 className={typographyScale.h1.mobile + ' ' + typographyScale.h1.weight}>
 *   This is an h1 heading
 * </h1>
 *
 * Or use helper function: getTypographyClass('h1', 'mobile')
 */
export const typographyScale = {
  h1: {
    mobile: 'text-2xl',      // 24px
    tablet: 'sm:text-3xl',   // 28px
    desktop: 'lg:text-4xl',  // 36px
    weight: 'font-bold',     // 700
    leading: 'leading-tight',
    tracking: 'tracking-tight',
    all: 'text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-tight',
  },
  h2: {
    mobile: 'text-xl',       // 20px
    tablet: 'sm:text-2xl',   // 24px
    desktop: 'lg:text-3xl',  // 28px
    weight: 'font-semibold', // 600
    leading: 'leading-snug',
    tracking: 'tracking-tight',
    all: 'text-xl sm:text-2xl lg:text-3xl font-semibold leading-snug tracking-tight',
  },
  h3: {
    mobile: 'text-lg',       // 18px
    tablet: 'sm:text-xl',    // 20px
    desktop: 'lg:text-2xl',  // 24px
    weight: 'font-semibold', // 600
    leading: 'leading-snug',
    tracking: 'tracking-normal',
    all: 'text-lg sm:text-xl lg:text-2xl font-semibold leading-snug',
  },
  h4: {
    mobile: 'text-base',     // 16px
    tablet: 'sm:text-lg',    // 18px
    desktop: 'lg:text-xl',   // 20px
    weight: 'font-medium',   // 500
    leading: 'leading-normal',
    tracking: 'tracking-normal',
    all: 'text-base sm:text-lg lg:text-xl font-medium leading-normal',
  },
  body: {
    mobile: 'text-sm',       // 14px
    tablet: 'sm:text-base',  // 16px
    desktop: 'lg:text-base', // 16px
    weight: 'font-normal',   // 400
    leading: 'leading-relaxed', // 1.625 for comfortable reading
    tracking: 'tracking-normal',
    all: 'text-sm sm:text-base lg:text-base font-normal leading-relaxed',
  },
  bodySmall: {
    mobile: 'text-xs',       // 12px
    tablet: 'sm:text-sm',    // 14px
    desktop: 'lg:text-sm',   // 14px
    weight: 'font-normal',   // 400
    leading: 'leading-relaxed',
    tracking: 'tracking-normal',
    all: 'text-xs sm:text-sm font-normal leading-relaxed',
  },
  label: {
    mobile: 'text-xs',       // 12px
    tablet: 'sm:text-sm',    // 14px
    desktop: 'lg:text-sm',   // 14px
    weight: 'font-medium',   // 500
    leading: 'leading-normal',
    tracking: 'tracking-normal',
    all: 'text-xs sm:text-sm font-medium leading-normal',
  },
  caption: {
    mobile: 'text-xs',       // 12px
    tablet: 'sm:text-xs',    // 12px
    desktop: 'lg:text-xs',   // 12px
    weight: 'font-normal',   // 400
    leading: 'leading-normal',
    tracking: 'tracking-normal',
    all: 'text-xs font-normal leading-normal',
  },
} as const;

/**
 * Helper function to get typography class by level and breakpoint
 * @param level - 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'bodySmall' | 'label' | 'caption'
 * @param breakpoint - 'mobile' | 'tablet' | 'desktop' | 'all'
 * @returns Tailwind class string
 *
 * Usage:
 * <h1 className={getTypographyClass('h1', 'all')}>Title</h1>
 * <p className={getTypographyClass('body', 'all')}>Body text</p>
 */
export const getTypographyClass = (
  level: keyof typeof typographyScale,
  breakpoint: 'mobile' | 'tablet' | 'desktop' | 'all' = 'all'
): string => {
  const scale = typographyScale[level];
  return scale[breakpoint as keyof typeof scale] as string;
};

/**
 * Enhanced Button System - Standardized sizing and module-aware variants
 *
 * All buttons must meet WCAG 2.1 AA 44x44px touch target minimum
 */
export const buttonSystem = {
  // Size variants (all include 44px minimum touch target)
  sizes: {
    xs: 'min-h-[32px] px-2 py-1 text-xs', // Non-interactive elements, exceptions only
    sm: 'min-h-[36px] px-3 py-1.5 text-sm', // Secondary buttons
    md: 'min-h-[44px] px-4 py-2.5 text-base', // Standard/primary (meets touch target)
    lg: 'min-h-[48px] px-6 py-3 text-base', // Large/prominent actions
    xl: 'min-h-[52px] px-8 py-4 text-lg', // Extra-large/full-width
  },

  // Style variants
  styles: {
    primary: 'bg-neutral-800/80 hover:bg-neutral-700/90 border border-neutral-600/50 text-neutral-50 shadow-lg hover:shadow-2xl transition-all duration-300',
    secondary: 'bg-neutral-900/40 hover:bg-neutral-800/60 border border-neutral-700/40 text-neutral-200 transition-all duration-300',
    ghost: 'bg-transparent hover:bg-neutral-800/30 border border-transparent hover:border-neutral-700/40 text-neutral-300 transition-all duration-300',
    success: 'bg-emerald-900/60 hover:bg-emerald-800/70 border border-emerald-600/40 text-emerald-100 transition-all duration-300',
    danger: 'bg-red-900/60 hover:bg-red-800/70 border border-red-600/40 text-red-100 transition-all duration-300',
  },

  // Module-specific variants
  module: {
    mind: 'bg-transparent hover:bg-blue-950/30 border border-blue-500/30 hover:border-blue-400/60 text-blue-400 hover:text-blue-300 transition-all duration-300',
    shadow: 'bg-transparent hover:bg-purple-950/30 border border-purple-500/30 hover:border-purple-400/60 text-purple-400 hover:text-purple-300 transition-all duration-300',
    body: 'bg-transparent hover:bg-orange-950/30 border border-orange-500/30 hover:border-orange-400/60 text-orange-400 hover:text-orange-300 transition-all duration-300',
    spirit: 'bg-transparent hover:bg-amber-950/30 border border-amber-500/30 hover:border-amber-400/60 text-amber-400 hover:text-amber-300 transition-all duration-300',
  },

  // Shared button classes
  shared: 'rounded-lg font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-400/80 focus-visible:outline-offset-2',
  transform: 'transform hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200',
} as const;

// Mobile-friendly button variants (legacy, use buttonSystem instead)
export const mobileButtons = {
  // Primary buttons - full touch target
  primary: `${touchTargets.buttonBase} ${theme.button.primary}`,
  secondary: `${touchTargets.buttonBase} ${theme.button.secondary}`,
  ghost: `${touchTargets.buttonBase} ${theme.button.ghost}`,

  // Icon-only buttons
  icon: `${touchTargets.iconButton} rounded-lg ${theme.button.secondary}`,
  iconGhost: `${touchTargets.iconButton} rounded-lg ${theme.button.ghost}`,

  // Wizard navigation buttons
  wizardNext: `${touchTargets.buttonLarge} rounded-xl ${theme.button.primary} font-semibold`,
  wizardBack: `${touchTargets.buttonBase} rounded-lg ${theme.button.ghost}`,

  // Close/dismiss buttons
  close: `${touchTargets.iconButton} rounded-full ${theme.button.ghost} hover:bg-red-900/30 hover:border-red-500/40`,
} as const;

/**
 * Helper function to build button class strings
 * @param size - 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 * @param style - 'primary' | 'secondary' | 'ghost' | 'success' | 'danger' | module name
 * @returns Complete button class string
 *
 * Usage:
 * <button className={getButtonClass('md', 'primary')}>Click me</button>
 * <button className={getButtonClass('lg', 'mind')}>Mind button</button>
 */
export const getButtonClass = (
  size: keyof typeof buttonSystem.sizes = 'md',
  style: keyof typeof buttonSystem.styles | keyof typeof buttonSystem.module = 'primary'
): string => {
  const sizeClass = buttonSystem.sizes[size];
  const styleClass = (buttonSystem.styles[style as keyof typeof buttonSystem.styles] ||
                     buttonSystem.module[style as keyof typeof buttonSystem.module] ||
                     buttonSystem.styles.primary);
  return `${sizeClass} ${styleClass} ${buttonSystem.shared} ${buttonSystem.transform}`;
};