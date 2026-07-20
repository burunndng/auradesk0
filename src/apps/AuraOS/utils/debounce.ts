/**
 * Debounce utility for deferred function execution.
 * Useful for batching expensive operations (like Intelligence Hub refresh).
 */
export function createDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number
) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: any[] | null = null;

  function debounced(...args: any[]) {
    lastArgs = args;

    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      if (lastArgs !== null) {
        fn(...lastArgs);
      }
      timeoutId = null;
      lastArgs = null;
    }, delayMs);
  }

  debounced.flush = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      if (lastArgs !== null) {
        fn(...lastArgs);
      }
      timeoutId = null;
      lastArgs = null;
    }
  };

  debounced.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
      lastArgs = null;
    }
  };

  return debounced as T & {
    flush: () => void;
    cancel: () => void;
  };
}
