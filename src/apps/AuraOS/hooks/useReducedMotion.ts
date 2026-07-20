import { useState, useEffect } from 'react';

/**
 * Hook to detect and subscribe to prefers-reduced-motion media query.
 * Returns true if the user has requested reduced motion in their OS settings.
 * Updates reactively if the user changes their preference during the session.
 *
 * @example
 * const prefersReducedMotion = useReducedMotion();
 * // In JSX:
 * <motion.div animate={prefersReducedMotion ? {} : { x: 100 }} />
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    // Subscribe to changes
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
}
