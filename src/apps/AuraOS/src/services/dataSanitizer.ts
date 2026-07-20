/**
 * Data Sanitizer
 *
 * Safely sanitizes sensitive data before sharing/exporting for debugging.
 * Removes:
 * - Authentication tokens
 * - Personal identifiers (emails, phone numbers)
 * - Sensitive session history
 * - API keys and credentials
 */

import { StorageManager } from '../../.claude/lib/storageManager';

export interface SanitizationOptions {
  redactEmails?: boolean;
  redactTokens?: boolean;
  redactPersonalData?: boolean;
  summarizeArrays?: boolean;
  maxArrayLength?: number;
}

const DEFAULT_OPTIONS: SanitizationOptions = {
  redactEmails: true,
  redactTokens: true,
  redactPersonalData: true,
  summarizeArrays: true,
  maxArrayLength: 5,
};

// Patterns for sensitive data detection
const SENSITIVE_PATTERNS = {
  authToken: /token|auth|jwt|apikey|api_key|secret|password|passwd|credential/i,
  email: /[^\s@]+@[^\s@]+\.[^\s@]+/,
  // phoneNumber pattern: North American format only (XXX-XXX-XXXX, (XXX) XXX-XXXX, etc.)
  // TODO: Consider libphonenumber-js for international support
  phoneNumber: /(\+?1)?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/,
  creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/,
};

/**
 * Sanitize a single value based on its key name and content
 */
function sanitizeValue(value: any, key: string, options: SanitizationOptions): any {
  if (value === null || value === undefined) {
    return value;
  }

  // Check key name for sensitive patterns
  if (options.redactTokens && SENSITIVE_PATTERNS.authToken.test(key)) {
    return '[REDACTED]';
  }

  // Handle strings
  if (typeof value === 'string') {
    // Redact emails
    if (options.redactEmails && SENSITIVE_PATTERNS.email.test(value)) {
      return '[EMAIL REDACTED]';
    }

    // Redact tokens/keys (very long random strings with high entropy)
    // Only redact if: very long (>40 chars), random-looking (mixed case + numbers), and key suggests it's a token
    if (
      options.redactTokens &&
      value.length > 40 &&
      /[A-Z]/.test(value) &&
      /[0-9]/.test(value) &&
      /[a-z]/.test(value)
    ) {
      return '[TOKEN REDACTED]';
    }

    // Redact phone numbers
    if (options.redactPersonalData && SENSITIVE_PATTERNS.phoneNumber.test(value)) {
      return '[PHONE REDACTED]';
    }

    // Redact credit cards
    if (options.redactPersonalData && SENSITIVE_PATTERNS.creditCard.test(value)) {
      return '[CARD REDACTED]';
    }

    return value;
  }

  // Handle objects recursively
  if (typeof value === 'object') {
    return sanitizeObject(value, options);
  }

  return value;
}

/**
 * Recursively sanitize an object or array
 */
function sanitizeObject(data: any, options: SanitizationOptions): any {
  if (Array.isArray(data)) {
    // Optionally summarize large arrays
    if (options.summarizeArrays && data.length > (options.maxArrayLength || 5)) {
      return `[${data.length} items - redacted for brevity]`;
    }
    return data.map(item => sanitizeValue(item, 'item', options));
  }

  if (data === null) {
    return null;
  }

  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    // Sanitize the value (includes key-based sensitive checks)
    sanitized[key] = sanitizeValue(value, key, options);
  }

  return sanitized;
}

/**
 * Safe way to share debug data
 *
 * @param data The data to sanitize
 * @param options Sanitization options
 * @returns Sanitized copy of the data
 */
export function sanitizeForSharing(
  data: any,
  options: Partial<SanitizationOptions> = {}
): any {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  // Handle different data types appropriately
  if (typeof data === 'object' && data !== null) {
    return sanitizeObject(data, mergedOptions);
  }

  // For primitive types, use sanitizeValue with a generic key
  return sanitizeValue(data, 'root_value', mergedOptions);
}

/**
 * Sanitize localStorage for sharing
 * Also applies AOS-specific redaction for known sensitive keys
 */
export function sanitizeLocalStorage(
  options: Partial<SanitizationOptions> = {}
): Record<string, any> {
  const sanitized: Record<string, any> = {};

  // AOS-specific sensitive keys that should be removed entirely
  const aosSensitiveKeys = [
    'mjw-auth-token',
    'supabase.auth',
    'auth-token',
    'apikey',
  ];

  // Use StorageManager's exportAll to get all localStorage data
  const allData = StorageManager.exportAll();

  for (const [key, value] of Object.entries(allData)) {
    // Remove known sensitive localStorage keys
    if (aosSensitiveKeys.includes(key)) {
      sanitized[key] = '[REDACTED]';
      continue;
    }

    // Skip keys that look sensitive
    if (
      key.includes('auth') ||
      key.includes('token') ||
      key.includes('password') ||
      key.includes('secret') ||
      key.includes('apikey')
    ) {
      sanitized[key] = '[REDACTED]';
      continue;
    }

    try {
      sanitized[key] = sanitizeForSharing(value, options);
    } catch {
      // If error, include as-is but sanitize the string
      sanitized[key] = sanitizeForSharing(value, options);
    }

    // AOS-specific: Summarize history arrays
    if (
      key === 'historyIFS' ||
      (key.includes('history') && Array.isArray(sanitized[key]))
    ) {
      sanitized[key] = `[${(sanitized[key] as any[]).length} items - redacted]`;
    }
  }

  return sanitized;
}

/**
 * Create a safe debug report for sharing
 */
export function createDebugReport(options: Partial<SanitizationOptions> = {}) {
  return {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    localStorage: sanitizeLocalStorage(options),
    // Add more debug info as needed, always sanitized
  };
}
