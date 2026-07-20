import { StorageManager } from '../.claude/lib/storageManager';

export const DBTPrivacy = {
  saveSensitive(key: string, data: unknown, expiryHours: number = 720): void {
    const wrapped = {
      data,
      expiresAt: Date.now() + expiryHours * 60 * 60 * 1000,
      v: 1,
    };
    StorageManager.setUntyped(key, wrapped);
  },

  loadSensitive<T>(key: string): T | null {
    try {
      const raw = StorageManager.getUntyped(key);
      if (!raw) return null;
      const wrapped = raw as any;
      if (wrapped && typeof wrapped === 'object' && 'expiresAt' in wrapped && Date.now() > wrapped.expiresAt) {
        StorageManager.delete(key);
        return null;
      }
      return wrapped?.data as T;
    } catch {
      return null;
    }
  },

  clearAllDBTData(): void {
    const allKeys = Object.keys(localStorage);
    allKeys
      .filter(k => k.startsWith('aura-dbt-'))
      .forEach(k => StorageManager.delete(k));
  },
};
