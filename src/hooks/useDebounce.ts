/**
 * useDebounce Hook
 * Debounces a value by delaying its update until after a specified delay.
 * Useful for reducing API calls on rapid user input (e.g., search queries).
 */

import {useEffect, useState} from "react";

/**
 * Debounces a value by the specified delay
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds before updating the debounced value
 * @returns Debounced value that updates after the delay
 *
 * @example
 * const [query, setQuery] = useState('');
 * const debouncedQuery = useDebounce(query, 400);
 * // debouncedQuery will only update 400ms after the user stops typing
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up timeout to update debounced value after delay
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function: cancel timeout if value changes before delay completes
    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, delay]);

  return debouncedValue;
}
