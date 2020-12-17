import * as React from 'react';
import { useRef, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

// This hook returns a ref.
// If the dependencies have changed and the ref has an element, it will focus.
export function useAutofocusRef<T extends HTMLInputElement|HTMLTextAreaElement>(
  dependencies: React.DependencyList,
): React.RefObject<T> {
  const inputElRef = useRef<T>(null);

  useEffect(() => {
    if (inputElRef.current && inputElRef.current.focus) {
      inputElRef.current.focus();
    }
  }, dependencies);

  return inputElRef;
}

/*
 * useLocalStorage hook from https://usehooks.com/useLocalStorage/ 2020-09-13
 *
 * extended to add deleteValue() (does not affect the state)
 * extended to detect stale state
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  migration?: (data: unknown) => T,
): [T, (t: T) => void, () => void] {
  const getCurrentValue = () => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);

      if (!item) return initialValue;

      // Parse stored json and possibly migrate
      let parsed: unknown = JSON.parse(item);
      if (migration) parsed = migration(parsed);
      return parsed as T;
    } catch (error) {
      // If error also return initialValue
      console.log(error);
      return initialValue;
    }
  };

  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState(getCurrentValue);

  // remember the key so we can find out when state gets stale
  const [storedKey, setStoredKey] = useState(key);

  if (storedKey !== key) {
    const currentRaw = window.localStorage.getItem(key);
    if (JSON.stringify(storedValue) !== currentRaw) {
      setStoredValue(getCurrentValue());
    }
    setStoredKey(key);
  }

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: T) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) as T : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage (remove if)
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error);
    }
  };

  const deleteValue = () => {
    window.localStorage.removeItem(key);
  };

  return [storedValue, setValue, deleteValue];
}

// adopted from https://reactrouter.com/web/example/query-parameters
export function useQuery(): URLSearchParams {
  return new URLSearchParams(useLocation().search);
}
