/**
 * useClickOutside Hook
 * Detects clicks outside of a specified element and calls a handler function.
 * Useful for closing dropdowns, modals, and popovers when clicking outside.
 */

import {useEffect} from "react";

/**
 * Calls handler when user clicks outside the referenced element
 * @param ref - React ref to the element to detect clicks outside of
 * @param handler - Function to call when click occurs outside the element (receives the event)
 *
 * @example
 * const dropdownRef = useRef<HTMLDivElement>(null);
 * useClickOutside(dropdownRef, (event) => {
 *   // Check if click is in a portal/modal
 *   setIsOpen(false);
 * });
 * // Dropdown will close when user clicks outside
 */
export function useClickOutside<T extends HTMLElement | null>(
  ref: React.RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void
): void {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent): void => {
      // Check if the ref exists and the click target is not inside the ref element
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler(event);
      }
    };

    // Use 'click' instead of 'mousedown'/'touchstart' to ensure onClick handlers fire first
    // This is crucial for mobile devices where touch events need to complete before closing
    document.addEventListener("click", handleClickOutside);

    // Cleanup: remove event listeners on unmount
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [ref, handler]);
}
