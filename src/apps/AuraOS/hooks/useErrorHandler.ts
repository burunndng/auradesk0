import { useState, useCallback } from 'react';
import { ErrorHandler, AppError } from '../.claude/lib/errorHandler';

export function useErrorHandler() {
  const [error, setError] = useState<AppError | null>(null);

  const handleError = useCallback((err: unknown, context: string) => {
    const appError = ErrorHandler.handle(err, context);
    ErrorHandler.log(appError);
    setError(appError);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
    userMessage: error?.userMessage || null,
    isRetryable: error?.retryable || false,
  };
}
