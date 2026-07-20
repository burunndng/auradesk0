import React, { ReactNode, useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  SacredCloseIcon,
  SacredChevronLeftIcon,
  SacredChevronRightIcon,
  SacredAlertIcon,
  SacredSpinnerIcon,
  SacredLockIcon,
} from './SacredNavIcons';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from './ToastContext';

/**
 * WizardFrame — The ritual container for all AOS practice tools.
 *
 * Design system:
 * - Surfaces use the Alchemical Void stack (#111113 base, #1a1a1f elevated)
 * - Module color via `module` prop → `data-module` → `--module-accent` CSS vars
 * - `accentColor` retained for backward compat; maps to the nearest ILP module
 * - Step transitions: Framer Motion AnimatePresence (ceremonial, not snappy)
 * - Reduced-motion guard on all animations
 */

// ── Module mapping ──────────────────────────────────────────────────────────

type ILPModule = 'shadow' | 'mind' | 'body' | 'spirit';

/** Map legacy accentColor prop → ILP module for data-module attribute */
const accentToModule: Record<string, ILPModule> = {
  purple: 'shadow',
  rose:   'shadow',
  teal:   'spirit',
  amber:  'mind',
  emerald:'body',
};

// ── Spring presets (from AuraOS design system) ────────────────────────────

const springs: Record<ILPModule, object> = {
  shadow: { type: 'spring', stiffness: 240, damping: 30, mass: 2.0 },
  mind:   { type: 'spring', stiffness: 320, damping: 26, mass: 1.2 },
  body:   { type: 'spring', stiffness: 260, damping: 28, mass: 1.8 },
  spirit: { type: 'spring', stiffness: 250, damping: 28, mass: 1.6 },
};

// ── Props ─────────────────────────────────────────────────────────────────

interface WizardFrameProps {
  title: string;
  currentStep: number;
  totalSteps: number;
  isLoading?: boolean;
  showBackButton?: boolean;
  nextButtonText?: string;
  onClose: () => void;
  onBack: () => void;
  onNext: () => void;
  /** ILP module — drives `data-module` and `--module-accent` token cascade */
  module?: ILPModule;
  /** Legacy color hint — mapped to nearest ILP module if `module` not provided */
  accentColor?: 'teal' | 'emerald' | 'amber' | 'rose' | 'purple';
  children: ReactNode;
  /** Optional content below the header (e.g., insight context banners) */
  headerSlot?: ReactNode;
  /** Optional content for the left side of the footer */
  leftFooterSlot?: ReactNode;
  /** When true, blurs content and shows a Pro upgrade overlay */
  premiumGated?: boolean;
  /** When true, disables the Next button (in addition to isLoading) */
  nextButtonDisabled?: boolean;
  /** Optional error message — shown as inline banner AND toast */
  errorMessage?: string | null;
  /**
   * Optional practice-type label for cognitive scaffolding.
   * e.g. "Shadow Integration · 5 steps" — shown next to the step counter.
   */
  practiceType?: string;
}

// ── Stripe checkout helper ────────────────────────────────────────────────

async function redirectToCheckout(userId: string, userEmail?: string) {
  const res = await fetch('/api/stripe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'checkout', userId, userEmail }),
  });
  const { url } = await res.json();
  if (url) window.location.href = url;
}

// ── Component ─────────────────────────────────────────────────────────────

export function WizardFrame({
  title,
  currentStep,
  totalSteps,
  isLoading = false,
  showBackButton = true,
  nextButtonText = 'Continue',
  onClose,
  onBack,
  onNext,
  module: moduleProp,
  accentColor = 'teal',
  children,
  headerSlot,
  leftFooterSlot,
  premiumGated = false,
  nextButtonDisabled = false,
  errorMessage,
  practiceType,
}: WizardFrameProps) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const shouldReduce = useReducedMotion();

  const [upgrading, setUpgrading] = useState(false);
  const [gateDismissed, setGateDismissed] = useState(false);
  const [lastToastedError, setLastToastedError] = useState<string | null>(null);

  // Resolve ILP module — explicit prop takes priority over legacy accentColor
  const ilpModule: ILPModule = moduleProp ?? accentToModule[accentColor] ?? 'shadow';

  const progressPercentage = Math.min(100, Math.max(0, (currentStep / totalSteps) * 100));

  // Fire toast when errorMessage changes (deduplicated)
  useEffect(() => {
    if (errorMessage && errorMessage !== lastToastedError) {
      addToast(errorMessage, 'error', 5000);
      setLastToastedError(errorMessage);
    } else if (!errorMessage) {
      setLastToastedError(null);
    }
  }, [errorMessage, lastToastedError, addToast]);

  // Step transition spring — respects reduced motion
  const stepTransition = shouldReduce ? { duration: 0 } : springs[ilpModule];

  return (
    /*
     * Outer overlay — stone-950/85 backdrop (Alchemical Void ambient)
     * data-module drives --module-accent / --module-glow CSS vars
     */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 overflow-hidden"
      style={{ height: '100dvh', background: 'oklch(0.08 0.015 290deg / 0.85)', backdropFilter: 'blur(12px)' }}
      data-module={ilpModule}
    >
      {/*
       * Card — Alchemical Void surface stack
       * #111113 = surface-1 (cards, panels)
       * border: rgba(255,255,255,0.08) = standard glass edge
       */}
      <div
        className="w-full sm:max-w-2xl lg:max-w-4xl h-[100dvh] sm:h-auto max-h-[100dvh] sm:max-h-[90dvh] flex flex-col overflow-hidden rounded-none sm:rounded-xl"
        style={{
          background: '#111113',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 48px var(--module-glow, rgba(168,85,247,0.10))',
        }}
      >

        {/* ── Header ── */}
        <div
          className="flex items-center justify-between gap-2 px-3 sm:px-6 py-3 sm:py-4 sticky top-0 z-20"
          style={{
            background: 'rgba(26,26,31,0.95)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <h2 className="text-sm sm:text-xl font-bold font-serif text-stone-100 truncate leading-tight">
              {title}
            </h2>

            {/* Step counter + optional practice-type label (cognitive scaffolding) */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className="text-[10px] sm:text-xs font-mono px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  color: 'rgba(255,255,255,0.55)',
                }}
              >
                {currentStep}/{totalSteps}
              </span>
              {practiceType && (
                <span
                  className="hidden sm:inline text-[10px] font-sans tracking-wide"
                  style={{ color: 'var(--module-accent, oklch(0.58 0.18 290deg))', opacity: 0.75 }}
                >
                  {practiceType}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full transition-colors shrink-0 -mr-1 sm:mr-0"
            style={{ color: 'rgba(255,255,255,0.40)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.85)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.40)')}
            aria-label="Close wizard"
          >
            <SacredCloseIcon size={18} />
          </button>
        </div>

        {/* ── Progress bar — token-driven accent ── */}
        <div
          className="h-[2px] w-full"
          style={{ background: 'rgba(255,255,255,0.05)' }}
        >
          <motion.div
            className="h-full"
            style={{ background: 'var(--module-accent, oklch(0.58 0.18 290deg))' }}
            initial={false}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          />
        </div>

        {/* ── Optional header slot ── */}
        {headerSlot && (
          <div
            className="px-6 pt-4 pb-4"
            style={{ background: '#111113', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
          >
            {headerSlot}
          </div>
        )}

        {/* ── Inline error banner ── */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              role="alert"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="mx-3 sm:mx-6 mt-3 flex items-start gap-2 p-3 rounded-lg overflow-hidden"
              style={{
                background: 'rgba(168,85,247,0.08)',
                border: '1px solid rgba(168,85,247,0.25)',
                color: 'rgba(220,180,255,0.9)',
              }}
            >
              <SacredAlertIcon size={16} className="mt-0.5 shrink-0" style={{ color: 'rgba(192,132,252,0.9)' }} />
              <span className="text-sm leading-snug">{errorMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main content — AnimatePresence for ceremonial step transitions ── */}
        <main
          className="flex-1 overflow-y-auto overflow-x-hidden relative"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,255,255,0.12) transparent',
          }}
        >
          <div className={premiumGated && !gateDismissed ? 'blur-sm pointer-events-none select-none' : undefined}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`step-${currentStep}`}
                initial={shouldReduce ? false : { opacity: 0, y: 32, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={shouldReduce ? undefined : { opacity: 0, y: -24, scale: 0.97 }}
                transition={stepTransition}
                className="p-3 sm:p-6 lg:p-8"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Premium gate overlay */}
          {premiumGated && !gateDismissed && (
            <div
              className="absolute inset-0 flex items-center justify-center z-10"
              style={{ background: 'rgba(10,10,15,0.65)', backdropFilter: 'blur(8px)' }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={springs.spirit}
                className="text-center px-6 py-8 rounded-2xl shadow-2xl max-w-sm mx-4"
                style={{
                  background: '#1a1a1f',
                  border: '1px solid rgba(201,144,10,0.25)',
                  boxShadow: '0 32px 64px rgba(0,0,0,0.8), 0 0 40px rgba(201,144,10,0.08)',
                }}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{
                    background: 'rgba(201,144,10,0.10)',
                    border: '1px solid rgba(201,144,10,0.30)',
                  }}
                >
                  <SacredLockIcon size={32} style={{ color: 'oklch(0.72 0.14 60deg)' }} />
                </div>
                <h3
                  className="text-lg font-display mb-2"
                  style={{ color: 'oklch(0.78 0.12 58deg)' }}
                >
                  Pro Feature
                </h3>
                <p className="text-sm mb-5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  This practice is available on the Pro plan. Upgrade to unlock unlimited access.
                </p>
                <button
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all active:scale-95 disabled:opacity-60"
                  style={{
                    background: 'oklch(0.65 0.14 50deg)',
                    color: '#0a0a0f',
                    border: 'none',
                  }}
                  disabled={upgrading}
                  onClick={async () => {
                    if (!user?.id) return;
                    setUpgrading(true);
                    await redirectToCheckout(user.id, user.email ?? undefined);
                    setUpgrading(false);
                  }}
                >
                  <div
                    className="w-3.5 h-3.5 rotate-45 border-2 shrink-0"
                    style={{ borderColor: '#0a0a0f' }}
                  />
                  {upgrading ? 'Redirecting…' : 'Get Pro Access'}
                </button>
                <button
                  className="mt-2 text-xs transition-colors block mx-auto"
                  style={{ color: 'rgba(255,255,255,0.30)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.60)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.30)')}
                  onClick={() => setGateDismissed(true)}
                >
                  Maybe Later
                </button>
              </motion.div>
            </div>
          )}
        </main>

        {/* ── Footer ── */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-2 px-3 sm:px-6 py-3 sm:py-4"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(26,26,31,0.70)',
          }}
        >
          {/* Back / left slot */}
          <div className="w-full sm:w-auto">
            {leftFooterSlot ? (
              leftFooterSlot
            ) : showBackButton ? (
              <motion.button
                onClick={onBack}
                disabled={isLoading}
                aria-label="Back"
                whileHover={shouldReduce ? {} : { scale: 1.02 }}
                whileTap={shouldReduce ? {} : { scale: 0.96, transition: { duration: 0.1 } }}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                style={{
                  color: 'rgba(255,255,255,0.45)',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.80)';
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.45)';
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }}
              >
                <SacredChevronLeftIcon size={14} />
                <span className="hidden sm:inline">Back</span>
              </motion.button>
            ) : (
              <div />
            )}
          </div>

          {/* Next / continue */}
          <motion.button
            onClick={onNext}
            disabled={isLoading || nextButtonDisabled}
            aria-label={nextButtonText}
            whileHover={shouldReduce ? {} : { scale: 1.02 }}
            whileTap={shouldReduce ? {} : { scale: 0.96, transition: { duration: 0.1 } }}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 rounded-lg font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'var(--module-accent, oklch(0.58 0.18 290deg))',
              color: '#0a0a0f',
              border: 'none',
              boxShadow: '0 4px 16px var(--module-glow, rgba(168,85,247,0.20))',
            }}
          >
            {isLoading ? (
              <>
                <SacredSpinnerIcon
                  size={14}
                  className="animate-spin-slow"
                  style={{ color: '#0a0a0f' }}
                />
                <span className="hidden sm:inline">Processing…</span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">{nextButtonText}</span>
                <span className="sm:hidden">→</span>
                <SacredChevronRightIcon size={14} style={{ color: '#0a0a0f' }} className="hidden sm:inline-flex" />
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
