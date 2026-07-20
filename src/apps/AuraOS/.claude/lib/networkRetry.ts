export const withRetry = async <T,>(
  fn: () => Promise<T>,
  options = { maxRetries: 3, delay: 1000 }
): Promise<T> => {
  let lastError: Error | null = null;

  for (let i = 0; i <= options.maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < options.maxRetries) {
        const waitTime = options.delay * Math.pow(2, i); // exponential backoff
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError;
};

// Usage in services:
export const apiCall = async (endpoint: string) => {
  return withRetry(
    () => fetch(endpoint).then(r => r.json()),
    { maxRetries: 3, delay: 500 }
  );
};
