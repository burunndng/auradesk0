import { useState, useEffect } from 'react';
import { breakpoints } from '../theme';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

interface ResponsiveState {
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  width: number;
  height: number;
}

/**
 * useResponsive Hook
 *
 * Detects current breakpoint and touch device capability.
 * Uses window.matchMedia for efficient breakpoint detection.
 *
 * Breakpoints:
 * - mobile: < 768px (phones)
 * - tablet: 768px - 1023px (tablets)
 * - desktop: >= 1024px (laptops/desktops)
 *
 * @returns ResponsiveState object with breakpoint info
 *
 * @example
 * const { isMobile, isTablet, isDesktop, isTouchDevice } = useResponsive();
 *
 * if (isMobile) {
 *   return <MobileNav />;
 * }
 * return <DesktopNav />;
 */
export const useResponsive = (): ResponsiveState => {
  const [state, setState] = useState<ResponsiveState>(() => {
    // Initialize with default values (SSR-safe)
    if (typeof window === 'undefined') {
      return {
        breakpoint: 'desktop',
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isTouchDevice: false,
        width: 1024,
        height: 768,
      };
    }

    // Client-side initialization
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isTouchDevice =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0;

    let breakpoint: Breakpoint = 'desktop';
    if (width < breakpoints.md) {
      breakpoint = 'mobile';
    } else if (width < breakpoints.lg) {
      breakpoint = 'tablet';
    }

    return {
      breakpoint,
      isMobile: breakpoint === 'mobile',
      isTablet: breakpoint === 'tablet',
      isDesktop: breakpoint === 'desktop',
      isTouchDevice,
      width,
      height,
    };
  });

  useEffect(() => {
    // Skip if window is not defined (SSR)
    if (typeof window === 'undefined') return;

    // Create media query matchers
    const mobileQuery = window.matchMedia(`(max-width: ${breakpoints.md - 1}px)`);
    const tabletQuery = window.matchMedia(
      `(min-width: ${breakpoints.md}px) and (max-width: ${breakpoints.lg - 1}px)`
    );

    // Update state based on viewport size
    const updateState = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      let breakpoint: Breakpoint = 'desktop';
      if (mobileQuery.matches) {
        breakpoint = 'mobile';
      } else if (tabletQuery.matches) {
        breakpoint = 'tablet';
      }

      setState({
        breakpoint,
        isMobile: breakpoint === 'mobile',
        isTablet: breakpoint === 'tablet',
        isDesktop: breakpoint === 'desktop',
        isTouchDevice:
          'ontouchstart' in window ||
          navigator.maxTouchPoints > 0 ||
          (navigator as any).msMaxTouchPoints > 0,
        width,
        height,
      });
    };

    // Listen for viewport changes
    const handleResize = () => {
      updateState();
    };

    // Modern browsers: use matchMedia.addEventListener
    if (mobileQuery.addEventListener) {
      mobileQuery.addEventListener('change', updateState);
      tabletQuery.addEventListener('change', updateState);
    } else {
      // Fallback for older browsers
      mobileQuery.addListener(updateState);
      tabletQuery.addListener(updateState);
    }

    // Also listen to resize events (for height changes)
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (mobileQuery.removeEventListener) {
        mobileQuery.removeEventListener('change', updateState);
        tabletQuery.removeEventListener('change', updateState);
      } else {
        mobileQuery.removeListener(updateState);
        tabletQuery.removeListener(updateState);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return state;
};

/**
 * useBreakpoint Hook (simplified version)
 *
 * Returns only the current breakpoint string.
 * Useful when you only need to know the current breakpoint.
 *
 * @returns Current breakpoint ('mobile' | 'tablet' | 'desktop')
 *
 * @example
 * const breakpoint = useBreakpoint();
 * return breakpoint === 'mobile' ? <MobileView /> : <DesktopView />;
 */
export const useBreakpoint = (): Breakpoint => {
  const { breakpoint } = useResponsive();
  return breakpoint;
};

/**
 * useIsMobile Hook (convenience)
 *
 * Returns true if viewport is mobile-sized (< 768px).
 *
 * @returns boolean
 *
 * @example
 * const isMobile = useIsMobile();
 * if (isMobile) return <MobileNav />;
 */
export const useIsMobile = (): boolean => {
  const { isMobile } = useResponsive();
  return isMobile;
};

/**
 * useIsTouchDevice Hook (convenience)
 *
 * Returns true if device has touch capability.
 * Note: This detects capability, not current input method.
 *
 * @returns boolean
 *
 * @example
 * const isTouchDevice = useIsTouchDevice();
 * if (isTouchDevice) {
 *   return <button className="touch-target">Tap Me</button>;
 * }
 */
export const useIsTouchDevice = (): boolean => {
  const { isTouchDevice } = useResponsive();
  return isTouchDevice;
};
