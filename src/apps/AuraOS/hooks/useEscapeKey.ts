/**
 * useEscapeKey Hook
 *
 * A custom hook that calls a callback function when the Escape key is pressed.
 * Useful for modals, dropdowns, and other dismissable UI components.
 *
 * @param callback - Function to call when Escape is pressed
 * @param enabled - Whether the hook is active (default: true)
 *
 * @example
 * ```tsx
 * function MyModal({ onClose }) {
 *   useEscapeKey(onClose);
 *   return <div>...</div>;
 * }
 * ```
 */

import { useEffect } from 'react';

export default function useEscapeKey(callback: () => void, enabled: boolean = true): void {
  useEffect(() => {
    if (!enabled) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        callback();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [callback, enabled]);
}
