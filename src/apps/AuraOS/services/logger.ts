/**
 * Production-aware logger utility for AOS
 *
 * Features:
 * - Respects Vite environment (DEV/PROD)
 * - 4 log levels: debug, info, warn, error
 * - Service name prefixing for easy filtering
 * - ISO timestamps on all log entries
 * - Production only logs warnings and errors (not debug/info)
 * - Pre-configured loggers for common services
 *
 * Usage:
 *   import { logger, createLogger } from './logger';
 *
 *   // Use pre-configured logger
 *   logger.auth.info('User logged in', { userId: '123' });
 *   logger.ai.error('Request failed', error);
 *
 *   // Create custom logger
 *   const myLogger = createLogger('MyService');
 *   myLogger.debug('Processing started');
 */

/** Log level type */
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Context object passed to log functions
 * Contains the service name and allows additional metadata
 */
interface LogContext {
  service: string;
  [key: string]: unknown;
}

/**
 * Logger interface returned by createLogger
 */
interface Logger {
  /** Log debug message - only in development */
  debug: (message: string, ...args: unknown[]) => void;
  /** Log info message - only in development */
  info: (message: string, ...args: unknown[]) => void;
  /** Log warning message - always logged */
  warn: (message: string, ...args: unknown[]) => void;
  /** Log error message - always logged, accepts error object */
  error: (message: string, error?: unknown, ...args: unknown[]) => void;
}

/** Environment detection */
const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;

/** Minimum log level for production (warn and above) */
const PROD_LOG_LEVEL: LogLevel = 'warn';

/** Numeric values for log level comparison */
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Determines if a message at the given level should be logged
 * In development: all levels are logged
 * In production: only warn and error are logged
 *
 * @param level - The log level to check
 * @returns true if the message should be logged
 */
function shouldLog(level: LogLevel): boolean {
  if (isDev) return true;
  return LOG_LEVELS[level] >= LOG_LEVELS[PROD_LOG_LEVEL];
}

/**
 * Formats a log message with timestamp, level, and service name
 *
 * @param level - The log level
 * @param ctx - The log context containing service name
 * @param message - The message to log
 * @returns Formatted log string
 */
function formatMessage(level: LogLevel, ctx: LogContext, message: string): string {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level.toUpperCase()}] [${ctx.service}] ${message}`;
}

/**
 * Creates a logger instance for a specific service
 *
 * @param service - The service name to prefix all log messages with
 * @returns Logger object with debug, info, warn, and error methods
 *
 * @example
 * const authLogger = createLogger('Auth');
 * authLogger.info('User authenticated', { userId: '123' });
 * // Output: [2024-01-15T10:30:00.000Z] [INFO] [Auth] User authenticated { userId: '123' }
 */
export function createLogger(service: string): Logger {
  const ctx: LogContext = { service };

  return {
    debug: (message: string, ...args: unknown[]) => {
      if (shouldLog('debug')) {
        console.log(formatMessage('debug', ctx, message), ...args);
      }
    },

    info: (message: string, ...args: unknown[]) => {
      if (shouldLog('info')) {
        console.log(formatMessage('info', ctx, message), ...args);
      }
    },

    warn: (message: string, ...args: unknown[]) => {
      if (shouldLog('warn')) {
        console.warn(formatMessage('warn', ctx, message), ...args);
      }
    },

    error: (message: string, error?: unknown, ...args: unknown[]) => {
      if (shouldLog('error')) {
        console.error(formatMessage('error', ctx, message), error, ...args);
        // Future: Sentry integration
        // if (isProd && typeof Sentry !== 'undefined') {
        //   Sentry.captureException(error, { extra: { service, message } });
        // }
      }
    },
  };
}

/**
 * Pre-configured loggers for common AOS services
 *
 * @example
 * import { logger } from './logger';
 *
 * logger.auth.info('Login successful');
 * logger.ai.error('OpenRouter request failed', error);
 * logger.forum.debug('Fetching posts', { page: 1 });
 */
export const logger = {
  /** Authentication service logger */
  auth: createLogger('Auth'),
  /** Forum service logger */
  forum: createLogger('Forum'),
  /** AI service logger (general) */
  ai: createLogger('AI'),
  /** Coach service logger */
  coach: createLogger('Coach'),
  /** Intelligence Hub logger */
  intelligence: createLogger('Intelligence'),
  /** RAG service logger */
  rag: createLogger('RAG'),
  /** Migration service logger */
  migration: createLogger('Migration'),
  /** Insight service logger */
  insight: createLogger('Insight'),
  /** OpenRouter API logger */
  openRouter: createLogger('OpenRouter'),
};

// Re-export types for consumers
export type { LogLevel, LogContext, Logger };
