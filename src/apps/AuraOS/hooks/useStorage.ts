import { useState, useCallback } from 'react';
import { StorageManager } from '../.claude/lib/storageManager';

export function useStorage<T>(
  key: string,
  initialValue: T,
  _version: number = 1,
  _validate?: (data: any) => data is T
): [T, (value: T | ((val: T) => T)) => void] {
  
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    const val = StorageManager.getUntyped(key);
    return val !== null ? (val as T) : initialValue;
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    setStoredValue((current) => {
      const valueToStore = value instanceof Function ? value(current) : value;
      
      // Defer the storage write to avoid blocking the main thread
      // This improves INP by moving the expensive JSON stringify/write off the critical path
      setTimeout(() => {
        StorageManager.setUntyped(key, valueToStore);
      }, 0);
      
      return valueToStore;
    });
  }, [key]);

  return [storedValue, setValue];
}
