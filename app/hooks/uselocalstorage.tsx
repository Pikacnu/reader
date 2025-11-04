import { useState } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (fn: ((value: T) => T) | T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (val: ((value: T) => T) | T) => {
    if (typeof val === 'function' && val instanceof Function) {
      try {
        const valueToStore = (val as (value: T) => T)(storedValue);
        setStoredValue(valueToStore);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      setStoredValue(val);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(val));
      }
    }
  };

  return [storedValue, setValue];
}
