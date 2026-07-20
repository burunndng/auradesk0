/**
 * Type-Safe API Error Handling
 * Provides structured error context for UI fallback & retry strategies
 */

export type ApiErrorCode =
  | 'RATE_LIMIT'
  | 'PARSE_ERROR'
  | 'NETWORK_ERROR'
  | 'API_KEY_MISSING'
  | 'TIMEOUT'
  | 'INVALID_REQUEST'
  | 'UNKNOWN';

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  details?: Record<string, any>;
  retryable: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

/**
 * Helper to create error responses
 */
export function createErrorResponse<T>(
  code: ApiErrorCode,
  message: string,
  retryable: boolean = true,
  details?: Record<string, any>
): ApiResponse<T> {
  return {
    success: false,
    error: {
      code,
      message,
      retryable,
      details
    }
  };
}

/**
 * Helper to create success responses
 */
export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data
  };
}

/**
 * Determine if error is retryable based on error code
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes('rate limit') ||
      msg.includes('timeout') ||
      msg.includes('network') ||
      msg.includes('econnrefused')
    );
  }
  return false;
}

/**
 * Classify error into ApiErrorCode
 */
export function classifyError(error: unknown): ApiErrorCode {
  const msg = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  if (msg.includes('rate limit')) return 'RATE_LIMIT';
  if (msg.includes('parse') || msg.includes('json')) return 'PARSE_ERROR';
  if (msg.includes('network') || msg.includes('econnrefused')) return 'NETWORK_ERROR';
  if (msg.includes('api_key') || msg.includes('not set')) return 'API_KEY_MISSING';
  if (msg.includes('timeout')) return 'TIMEOUT';
  if (msg.includes('invalid')) return 'INVALID_REQUEST';

  return 'UNKNOWN';
}
