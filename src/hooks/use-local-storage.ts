// src/hooks/use-local-storage.ts
"use client";

import { useState, useEffect, useCallback } from 'react';

// Debounce function
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };

  return debounced;
}

export function useLocalStorage<T>(key: string, initialValue: T, debounceMs: number = 500) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          setStoredValue(JSON.parse(item));
        }
      } catch (error) {
        console.error(`Error reading localStorage key "${key}":`, error);
        // Keep initialValue if error
      } finally {
        setIsInitialized(true);
      }
    } else {
        setIsInitialized(true); // For SSR, initialize with initialValue
    }
  }, [key]);

  const debouncedSaveToLocalStorage = useCallback(
    debounce((value: T) => {
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
          console.error(`Error setting localStorage key "${key}":`, error);
        }
      }
    }, debounceMs),
    [key, debounceMs]
  );

  const setValue = (value: T | ((val: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    if (isInitialized) { // Only save if initialized to prevent overwriting on initial load
        debouncedSaveToLocalStorage(valueToStore);
    }
  };
  
  // Save to localStorage when isInitialized becomes true and storedValue is not initialValue (or if it's the first time and it matches initialValue)
  // This ensures that if the hook is used with a dynamic initialValue that changes after mount, it gets saved.
  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
        // This effect will run after the first effect that loads from localStorage.
        // It ensures that if the initialValue prop changes or if we want to save the initialValue itself.
        debouncedSaveToLocalStorage(storedValue);
    }
  }, [isInitialized, storedValue, debouncedSaveToLocalStorage]);


  return [storedValue, setValue, isInitialized] as const;
}
