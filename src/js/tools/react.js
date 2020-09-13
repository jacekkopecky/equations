import React, { useRef, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

// This hook returns a ref.
// If the dependencies have changed and the ref has an element, it will focus.
export function useAutofocusRef(dependencies) {
  const inputElRef = useRef(null);

  useEffect(() => {
    if (inputElRef.current && inputElRef.current.focus) {
      inputElRef.current.focus();
    }
  }, dependencies);

  return inputElRef;
}

export function PropsFromRouteParams(props) {
  const params = useParams();

  return React.cloneElement(props.children, params);
}

/*
 * useLocalStorage hook from https://usehooks.com/useLocalStorage/ 2020-09-13
 *
 * extended to add deleteValue() (does not affect the state)
 */
export function useLocalStorage(key, initialValue) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.log(error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
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
