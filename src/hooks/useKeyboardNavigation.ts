/**
 * useKeyboardNavigation Hook
 * Manages keyboard navigation for list items with circular navigation,
 * selection, and auto-scroll functionality.
 */

import {useCallback, useEffect, useState} from "react";

interface UseKeyboardNavigationOptions {
  /** Total number of items in the list */
  itemsCount: number;
  /** Callback when user selects an item (Enter key) */
  onSelect: (index: number) => void;
  /** Whether the dropdown/list is open */
  isOpen: boolean;
}

interface UseKeyboardNavigationResult {
  /** Currently active/highlighted item index (-1 = none) */
  activeIndex: number;
  /** Keyboard event handler for arrow keys, Enter, and Escape */
  handleKeyDown: (e: React.KeyboardEvent) => void;
  /** Reset active index to -1 */
  resetActiveIndex: () => void;
  /** Set active index (for mouse hover) */
  setActiveIndex: (index: number) => void;
}

/**
 * Manages keyboard navigation for dropdown lists with ARIA support
 * @param options - Configuration including item count, selection handler, and open state
 * @returns Navigation state and handlers
 *
 * @example
 * const { activeIndex, handleKeyDown, resetActiveIndex } = useKeyboardNavigation({
 *   itemsCount: results.length,
 *   onSelect: (index) => handleResultSelect(results[index]),
 *   isOpen: dropdownOpen
 * });
 */
export function useKeyboardNavigation({
  itemsCount,
  onSelect,
  isOpen,
}: UseKeyboardNavigationOptions): UseKeyboardNavigationResult {
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  // Reset active index when dropdown closes or items count changes
  useEffect(() => {
    if (!isOpen || itemsCount === 0) {
      setActiveIndex(-1);
    }
  }, [isOpen, itemsCount]);

  // Auto-scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && isOpen) {
      const element = document.getElementById(`result-${activeIndex}`);
      if (element) {
        element.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [activeIndex, isOpen]);

  const resetActiveIndex = useCallback(() => {
    setActiveIndex(-1);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen || itemsCount === 0) {
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((prev) => {
            // Circular navigation: after last item, go to first
            if (prev === -1 || prev >= itemsCount - 1) {
              return 0;
            }
            return prev + 1;
          });
          break;

        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((prev) => {
            // Circular navigation: before first item, go to last
            if (prev <= 0) {
              return itemsCount - 1;
            }
            return prev - 1;
          });
          break;

        case "Enter":
          e.preventDefault();
          if (activeIndex >= 0) {
            // Select highlighted item
            onSelect(activeIndex);
          } else if (itemsCount > 0) {
            // No highlight: select first item
            onSelect(0);
          }
          break;

        case "Escape":
          e.preventDefault();
          // Close handled by parent component
          resetActiveIndex();
          break;

        default:
          break;
      }
    },
    [isOpen, itemsCount, activeIndex, onSelect, resetActiveIndex]
  );

  return {
    activeIndex,
    handleKeyDown,
    resetActiveIndex,
    setActiveIndex,
  };
}
