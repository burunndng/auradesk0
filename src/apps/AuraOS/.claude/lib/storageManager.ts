import { z } from 'zod';
import { STORAGE_SCHEMAS, STORAGE_VERSIONS, STORAGE_KEYS } from './storageSchemas';

interface StorageQuota {
  used: number;
  available: number;
  percentUsed: number;
}

// ===== UNBOUNDED HISTORY ARRAY LIMITS =====
// Prevents memory bloat from accumulating session histories
const HISTORY_MAX_LENGTH = 75; // Keep most recent 75 sessions per wizard

// Keys that contain history arrays that should be capped
const HISTORY_KEYS = [
  STORAGE_KEYS.HISTORY_321,
  STORAGE_KEYS.HISTORY_IFS,
  STORAGE_KEYS.HISTORY_BIAS,
  STORAGE_KEYS.HISTORY_BIAS_FINDER,
  STORAGE_KEYS.HISTORY_SO,
  STORAGE_KEYS.HISTORY_PS,
  STORAGE_KEYS.HISTORY_PM,
  STORAGE_KEYS.HISTORY_KEGAN,
  STORAGE_KEYS.HISTORY_RELATIONAL,
  STORAGE_KEYS.HISTORY_ROLE_ALIGNMENT,
  STORAGE_KEYS.HISTORY_JHANA,
  STORAGE_KEYS.HISTORY_MEMORY_RECON,
  STORAGE_KEYS.HISTORY_EIGHT_ZONES,
  STORAGE_KEYS.HISTORY_ADAPTIVE_CYCLE,
  STORAGE_KEYS.HISTORY_ATTACHMENT,
  STORAGE_KEYS.HISTORY_BIG_MIND,
  STORAGE_KEYS.HISTORY_PSYCHEDELIC_JOURNEY,
  STORAGE_KEYS.SHADOW_SESSIONS,
  STORAGE_KEYS.SOMATIC_PRACTICE_HISTORY,
  STORAGE_KEYS.SCHEMA_DETECTIVE_SESSIONS,
  STORAGE_KEYS.INTEGRAL_BODY_PLAN_HISTORY,
  STORAGE_KEYS.PRACTICE_DESIGNER_HISTORY, // Cap practice designer history
  STORAGE_KEYS.INTEGRATED_INSIGHTS, // Cap unbounded insights array
  STORAGE_KEYS.SOMATIC_BODY_MAP_HISTORY, // Cap somatic cartography check-in history
] as const;

/**
 * Migrate old data structure to new schema
 * Handles backward compatibility for schema changes
 */
function migrateData(key: string, data: any): any {
  // Migrate integratedInsights: ensure shadowWorkSessionsAddressed and relatedPracticeSessions are arrays
  if (key === STORAGE_KEYS.INTEGRATED_INSIGHTS && Array.isArray(data)) {
    return data.map((insight: any) => ({
      ...insight,
      shadowWorkSessionsAddressed: Array.isArray(insight.shadowWorkSessionsAddressed)
        ? insight.shadowWorkSessionsAddressed
        : [],
      relatedPracticeSessions: Array.isArray(insight.relatedPracticeSessions)
        ? insight.relatedPracticeSessions
        : [],
    }));
  }

  return data;
}

/**
 * Enforce maxLength caps on history arrays
 * Prevents unbounded growth of session histories
 * Keeps most recent N entries, removes oldest
 */
function enforceHistoryMaxLength(key: string, value: unknown): unknown {
  if (!HISTORY_KEYS.includes(key as any)) return value; // Not a history key
  if (!Array.isArray(value)) return value; // Not an array

  if (value.length > HISTORY_MAX_LENGTH) {
    console.log(
      `[Storage] History ${key} exceeded max length (${value.length} → ${HISTORY_MAX_LENGTH}), keeping most recent entries`
    );
    return value.slice(-HISTORY_MAX_LENGTH); // Keep most recent
  }

  return value;
}

// Debounce map for setDebounced calls
const debouncedWrites = new Map<string, {
  timeout: NodeJS.Timeout | null;
  value: unknown;
}>();

/**
 * Debounce helper - delays storage writes to reduce API call frequency
 * Useful for frequently-updated values (notes, preferences, etc.)
 * Default delay: 500ms (80-90% reduction in write frequency)
 */
function debounceWrite(key: string, value: unknown, delay: number = 500): void {
  const existing = debouncedWrites.get(key);
  if (existing && existing.timeout) {
    clearTimeout(existing.timeout);
  }

  const timeout = setTimeout(() => {
    StorageManager.set(key as any, value as any); // Type cast safe here because it goes to StorageManager.set
    debouncedWrites.delete(key);
  }, delay);

  debouncedWrites.set(key, { timeout, value });
}

// Safe JSON parsing
function safeJsonParse<T = unknown>(raw: string, fallback: T, context: string): T {
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error(`[StorageManager] JSON parse error in ${context}:`, error);
    return fallback;
  }
}

// Safe JSON stringification
function safeJsonStringify(value: unknown, context: string): string | null {
  try {
    return JSON.stringify(value);
  } catch (error) {
    console.error(`[StorageManager] JSON stringify error in ${context}:`, error);
    return null;
  }
}

export class StorageManager {
  private static _totalUsedBytes: number | null = null;
  private static readonly META_SIZE_KEY = 'aura-meta-size';

  // Initialize total size cache
  private static initCache(): void {
    if (this._totalUsedBytes !== null) return;
    
    // 1. Try to get from meta key (O(1))
    const cached = localStorage.getItem(this.META_SIZE_KEY);
    if (cached) {
      this._totalUsedBytes = parseInt(cached, 10);
      if (!isNaN(this._totalUsedBytes)) return;
    }

    // 2. Fallback to full calculation (O(N)) if meta key missing or invalid
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key !== this.META_SIZE_KEY) {
        total += (localStorage.getItem(key)?.length || 0);
      }
    }
    this._totalUsedBytes = total;
    this.saveMetaSize();
  }

  private static saveMetaSize(): void {
    if (this._totalUsedBytes !== null) {
      localStorage.setItem(this.META_SIZE_KEY, this._totalUsedBytes.toString());
    }
  }

  // Get with validation
  static get<K extends keyof typeof STORAGE_SCHEMAS>(
    key: K
  ): z.infer<typeof STORAGE_SCHEMAS[K]> | null {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;

      // Parse JSON
      const parsed = safeJsonParse(raw, null, `StorageManager.get.${key}`);
      if (!parsed) return null;

      // Check if versioned (not all keys are in STORAGE_VERSIONS)
      const currentVersion = (STORAGE_VERSIONS as Record<string, number | undefined>)[key as string];
      if (currentVersion !== undefined && parsed.version !== undefined) {
        // Versioned data
        if (parsed.version !== currentVersion) {
          console.warn(
            `[Storage] Version mismatch for ${key}: v${parsed.version} -> v${currentVersion}, attempting migration`
          );
          // Attempt migration: run structural migrations on the old data
          const migratedFromOld = migrateData(key, parsed.data ?? parsed);
          const schema = STORAGE_SCHEMAS[key];
          const migrationResult = schema.safeParse(migratedFromOld);
          if (migrationResult.success) {
            // Migration succeeded — re-save with new version so we don't migrate again
            console.log(`[Storage] Migration succeeded for ${key} v${parsed.version} -> v${currentVersion}`);
            const wrapped = { version: currentVersion, data: migrationResult.data };
            try {
              localStorage.setItem(key, JSON.stringify(wrapped));
            } catch (e) {
              // Non-critical: migration will re-run next load if save fails
              console.warn(`[Storage] Failed to save migrated data for key '${key}':`, e);
            }
            return migrationResult.data;
          }
          console.warn(`[Storage] Migration failed for ${key} — returning null to use defaults`);
          return null;
        }

        // Migrate old data structure before validation
        const migratedData = migrateData(key, parsed.data);

        // Validate schema
        const schema = STORAGE_SCHEMAS[key];
        const result = schema.safeParse(migratedData);
        if (!result.success) {
          console.error(
            `[Storage] Schema validation failed for ${key}:`,
            result.error
          );
          return null;
        }

        return result.data;
      } else {
        // Non-versioned data (legacy)
        // Migrate old data structure before validation
        const migratedData = migrateData(key, parsed);

        const schema = STORAGE_SCHEMAS[key];
        const result = schema.safeParse(migratedData);
        if (!result.success) {
          console.error(
            `[Storage] Schema validation failed for ${key}:`,
            result.error
          );
          return null;
        }

        return result.data;
      }
    } catch (error) {
      console.error(`[StorageManager] Error getting ${key}:`, error);
      return null;
    }
  }

  // Set with debounce (for frequently-updated values)
  static setDebounced<K extends keyof typeof STORAGE_SCHEMAS>(
    key: K,
    value: z.infer<typeof STORAGE_SCHEMAS[K]>,
    delayMs: number = 500
  ): void {
    debounceWrite(key, value, delayMs);
  }

  // Set with validation and quota check
  static set<K extends keyof typeof STORAGE_SCHEMAS>(
    key: K,
    value: z.infer<typeof STORAGE_SCHEMAS[K]>
  ): boolean {
    try {
      // Enforce history array length caps (BEFORE validation)
      let cappedValue = enforceHistoryMaxLength(key as string, value);

      // Migrate data structure (BEFORE validation)
      cappedValue = migrateData(key as string, cappedValue);

      // Validate schema
      const schema = STORAGE_SCHEMAS[key];
      const result = schema.safeParse(cappedValue);
      if (!result.success) {
        console.error(`[Storage] Invalid data for ${key}:`, result.error);
        return false;
      }

      // Wrap with version (not all keys are in STORAGE_VERSIONS)
      const currentVersion = (STORAGE_VERSIONS as Record<string, number | undefined>)[key as string];
      const wrapped =
        currentVersion !== undefined
          ? { version: currentVersion, data: cappedValue }
          : cappedValue;

      // Serialize
      const json = safeJsonStringify(wrapped, `StorageManager.set.${key}`);
      if (!json) return false;

      // Check quota before writing
      if (!this.checkQuota(json.length)) {
        console.warn(`[Storage] Quota exceeded, attempting cleanup...`);
        this.cleanup(); // Async cleanup

        // Still check quota for the immediate write
        const quota = this.getQuota();
        if (quota.used + json.length > quota.available) {
           throw new Error('Storage quota exceeded even after cleanup request');
        }
      }

      // Update size cache
      this.initCache();
      const oldRaw = localStorage.getItem(key);
      const oldSize = oldRaw ? oldRaw.length : 0;
      if (this._totalUsedBytes !== null) {
        this._totalUsedBytes += (json.length - oldSize);
        this.saveMetaSize();
      }

      // Write to localStorage
      localStorage.setItem(key, json);
      return true;
    } catch (error) {
      console.error(`[StorageManager] Error setting ${key}:`, error);
      return false;
    }
  }

  /**
   * Non-blocking write with deferred validation
   * Optimized for background persistence
   */
  static setDeferred<K extends keyof typeof STORAGE_SCHEMAS>(
    key: K,
    value: z.infer<typeof STORAGE_SCHEMAS[K]>
  ): void {
    const task = () => {
      this.set(key, value);
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(task);
    } else {
      setTimeout(task, 1);
    }
  }

  // Delete key
  static delete(key: string): void {
    const oldRaw = localStorage.getItem(key);
    if (oldRaw && this._totalUsedBytes !== null) {
      this._totalUsedBytes -= oldRaw.length;
    }
    localStorage.removeItem(key);
  }

  // Check storage quota
  static checkQuota(additionalBytes: number = 0): boolean {
    const quota = this.getQuota();
    return quota.used + additionalBytes < quota.available * 0.9; // 90% threshold
  }

  // Get quota information
  static getQuota(): StorageQuota {
    this.initCache();
    const used = this._totalUsedBytes || 0;
    const available = 5 * 1024 * 1024; // 5MB conservative estimate (characters)
    const percentUsed = (used / available) * 100;

    return { used, available, percentUsed };
  }

  // Cleanup old data (now asynchronous)
  static cleanup(): void {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => this.runCleanup());
    } else {
      setTimeout(() => this.runCleanup(), 100);
    }
  }

  // Internal cleanup logic
  private static runCleanup(): void {
    console.log('[Storage] Running background cleanup...');
    // ... rest of cleanup logic
    this.performCleanup();
    // Reset cache after cleanup to ensure accuracy
    this._totalUsedBytes = null;
    this.initCache();
  }

  private static performCleanup(): void {
    // Strategy 1: Remove expired cache data
    const hubCache = localStorage.getItem(STORAGE_KEYS.INTELLIGENCE_HUB_CACHE);
    if (hubCache) {
      const parsed = safeJsonParse(
        hubCache,
        null,
        'StorageManager.cleanup.hubCache'
      );
      if (parsed?.metadata?.lastUpdate) {
        const age = Date.now() - parsed.metadata.lastUpdate;
        const TTL = 24 * 60 * 60 * 1000; // 24 hours
        if (age > TTL) {
          console.log('[Storage] Removing expired Intelligence Hub cache');
          localStorage.removeItem(STORAGE_KEYS.INTELLIGENCE_HUB_CACHE);
        }
      }
    }

    // Strategy 2: Trim old wizard session histories to max 50
    const historyKeys = Object.keys(localStorage).filter((k) =>
      k.startsWith('history')
    );
    historyKeys.forEach((key) => {
      const raw = localStorage.getItem(key);
      if (!raw) return;

      const sessions = safeJsonParse(
        raw,
        [],
        'StorageManager.cleanup.history'
      );
      if (Array.isArray(sessions) && sessions.length > 50) {
        console.log(
          `[Storage] Trimming ${key} from ${sessions.length} to 50 sessions`
        );
        const trimmed = sessions.slice(-50); // Keep most recent 50
        localStorage.setItem(key, JSON.stringify(trimmed));
      }
    });

    // Strategy 3: Remove orphaned keys (not in schema registry)
    const validKeys = Object.values(STORAGE_KEYS);
    Object.keys(localStorage).forEach((key) => {
      if (!validKeys.includes(key as any)) {
        console.log(`[Storage] Removing orphaned key: ${key}`);
        localStorage.removeItem(key);
      }
    });
  }

  // Export all data (for backup)
  static exportAll(): Record<string, any> {
    const data: Record<string, any> = {};
    Object.keys(localStorage).forEach((key) => {
      const value = localStorage.getItem(key);
      if (value) {
        data[key] = safeJsonParse(value, null, 'StorageManager.exportAll');
      }
    });
    return data;
  }

  // Import data (for restore)
  static importAll(data: Record<string, any>): void {
    Object.entries(data).forEach(([key, value]) => {
      const json = safeJsonStringify(value, 'StorageManager.importAll');
      if (json) {
        localStorage.setItem(key, json);
      }
    });
    this._totalUsedBytes = null; // Invalidate cache
  }

  // Get untyped value (for keys not in schema registry)
  static getUntyped(key: string): unknown {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return safeJsonParse(raw, null, `StorageManager.getUntyped.${key}`);
    } catch (error) {
      console.error(`[StorageManager] Error getting untyped ${key}:`, error);
      return null;
    }
  }

  // Set untyped value (for keys not in schema registry)
  static setUntyped(key: string, value: unknown): boolean {
    try {
      // Enforce history array caps even for untyped values
      const cappedValue = enforceHistoryMaxLength(key, value);

      const json = safeJsonStringify(cappedValue, `StorageManager.setUntyped.${key}`);
      if (!json) return false;

      // Check quota
      if (!this.checkQuota(json.length)) {
        console.warn(`[Storage] Quota exceeded, attempting cleanup...`);
        this.cleanup();

        const quota = this.getQuota();
        if (quota.used + json.length > quota.available) {
           throw new Error('Storage quota exceeded even after cleanup request');
        }
      }

      // Update size cache
      this.initCache();
      const oldRaw = localStorage.getItem(key);
      const oldSize = oldRaw ? oldRaw.length : 0;
      if (this._totalUsedBytes !== null) {
        this._totalUsedBytes += (json.length - oldSize);
        this.saveMetaSize();
      }

      localStorage.setItem(key, json);
      return true;
    } catch (error) {
      console.error(`[StorageManager] Error setting untyped ${key}:`, error);
      return false;
    }
  }

  // Clear all data
  static clearAll(): void {
    localStorage.clear();
    this._totalUsedBytes = 0;
    console.log('[StorageManager] All data cleared.');
  }
}

