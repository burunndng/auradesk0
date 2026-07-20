import { ApiErrorCode, classifyError, isRetryableError } from '../../utils/apiErrors';

export interface AppError {
  code: ApiErrorCode;
  message: string;           // Technical message
  userMessage: string;        // User-friendly message
  context?: Record<string, any>;
  retryable: boolean;
  timestamp: Date;
}

export class ErrorHandler {
  // Main error handling method
  static handle(error: unknown, context: string): AppError {
    const errorCode = classifyError(error);
    const message = error instanceof Error ? error.message : String(error);

    return {
      code: errorCode,
      message,
      userMessage: this.getUserMessage(errorCode, message),
      context: { location: context },
      retryable: isRetryableError(error),
      timestamp: new Date(),
    };
  }

  // User-friendly error messages
  static getUserMessage(code: ApiErrorCode, technicalMessage: string): string {
    const messages: Record<ApiErrorCode, string> = {
      RATE_LIMIT: 'Too many requests. Please wait a moment and try again.',
      PARSE_ERROR: 'We received an unexpected response. Please try again.',
      NETWORK_ERROR: 'Connection issue. Please check your internet and retry.',
      API_KEY_MISSING: 'Configuration error. Please check your API keys.',
      TIMEOUT: 'Request timed out. Please try again.',
      INVALID_REQUEST: 'Invalid request. Please check your input.',
      UNKNOWN: 'An unexpected error occurred. Please try again.',
    };

    // Return user-friendly message, fall back to technical message if no mapping
    return messages[code] || technicalMessage;
  }

  // Logging with context
  static log(error: AppError): void {
    console.error(
      `[${error.context?.location || 'Unknown'}] ${error.code}:`,
      error.message,
      error.context
    );
    // Future: Send to Sentry/LogRocket
  }

  // Convenience wrapper for async operations
  static async wrapAsync<T>(
    fn: () => Promise<T>,
    options: {
      context: string;
      fallback?: T;
      onError?: (error: AppError) => void;
    }
  ): Promise<{ data: T | null; error: AppError | null }> {
    try {
      const data = await fn();
      return { data, error: null };
    } catch (err) {
      const error = this.handle(err, options.context);
      this.log(error);

      if (options.onError) {
        options.onError(error);
      }

      return {
        data: options.fallback ?? null,
        error,
      };
    }
  }
}
