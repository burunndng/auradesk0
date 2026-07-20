import { useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';
import { ModuleKey } from '../../../types';

// Fallback values in case computed styles fail (SSR, etc.)
// Derived directly from void-tokens.css OKLCH source values
const FALLBACK_TOKENS: Record<ModuleKey, { accent: string; base: string }> = {
  shadow: {
    accent: '#a855f7', // oklch(0.58 0.18 290deg)
    base: '#0c080f'    // oklch(0.08 0.01 290deg)
  },
  mind: {
    accent: '#c9930f', // oklch(0.72 0.16 75deg)
    base: '#100e08'    // oklch(0.08 0.01 75deg)
  },
  body: {
    accent: '#10b981', // oklch(0.72 0.17 160deg)
    base: '#080e0c'    // oklch(0.08 0.01 160deg)
  },
  spirit: {
    accent: '#2dd4bf', // oklch(0.70 0.14 185deg)
    base: '#080d0e'    // oklch(0.08 0.01 185deg)
  }
};

/**
 * useVoidColors bridges CSS tokens to Three.js Color objects.
 * It reads --module-accent-hex and --void-base-hex from the computed style
 * of the nearest ancestor with a data-module attribute or falls back to defaults.
 */
export function useVoidColors(module: ModuleKey): { accent: THREE.Color; voidBase: THREE.Color } {
  // We use state to hold raw hex string values to safely recreate THREE colors.
  const [colors, setColors] = useState({
    accent: FALLBACK_TOKENS[module].accent,
    base: FALLBACK_TOKENS[module].base
  });

  useEffect(() => {
    // Read --module-accent-hex and --void-base-hex from computed style
    // We look for elements with [data-module=...] which defines the tokens
    const element = document.querySelector(`[data-module="${module}"]`) as HTMLElement 
      || document.documentElement;

    if (element && typeof window !== 'undefined') {
      const styles = window.getComputedStyle(element);
      const accentHex = styles.getPropertyValue('--module-accent-hex').trim();
      const baseHex = styles.getPropertyValue('--void-base-hex').trim();

      if (accentHex && baseHex) {
        setColors({ accent: accentHex, base: baseHex });
        return;
      }
    }

    // Fallback if not found
    setColors({
      accent: FALLBACK_TOKENS[module].accent,
      base: FALLBACK_TOKENS[module].base
    });
  }, [module]);

  // Return Three.js Color objects. Cache until hex inputs change.
  return useMemo(() => ({
    accent: new THREE.Color(colors.accent),
    voidBase: new THREE.Color(colors.base)
  }), [colors.accent, colors.base]);
}
