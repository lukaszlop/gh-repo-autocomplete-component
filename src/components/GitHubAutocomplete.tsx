/**
 * GitHubAutocomplete Component
 * Main autocomplete component for searching GitHub repositories and users.
 * Features: unified search, keyboard navigation, accessibility, mobile-optimized.
 */

import { EmptyState } from "@/components/EmptyState";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { HintState } from "@/components/HintState";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { SearchResultItem } from "@/components/SearchResultItem";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useDebounce } from "@/hooks/useDebounce";
import { useGitHubSearch } from "@/hooks/useGitHubSearch";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import { sortResultsAlphabetically } from "@/lib/utils/format";
import type { SearchResultItem as SearchResultItemType } from "@/types/github";
import { Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface GitHubAutocompleteProps {
  /**
   * Placeholder text for input field
   * @default "Search GitHub repositories and users..."
   */
  placeholder?: string;

  /**
   * Additional CSS classes for root container
   */
  className?: string;

  /**
   * Callback invoked when a result is selected
   * Useful for analytics/tracking
   */
  onSelect?: (result: SearchResultItemType) => void;
}

/**
 * GitHubAutocomplete provides real-time search for GitHub repositories and users
 */
export function GitHubAutocomplete({
  placeholder = "Search GitHub repositories and users...",
  className = "",
  onSelect,
}: GitHubAutocompleteProps): JSX.Element {
  // State management
  const [query, setQuery] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced query for API calls (400ms delay)
  const debouncedQuery = useDebounce(query, 400);

  // Search with GitHub API
  const { data, isLoading, error, isError } = useGitHubSearch({
    query: debouncedQuery,
    enabled: isOpen,
  });

  // Sort results alphabetically (memoized)
  const sortedResults = useMemo(() => {
    if (!data?.results) return [];
    return sortResultsAlphabetically(data.results);
  }, [data?.results]);

  // Keyboard navigation
  const { activeIndex, handleKeyDown, resetActiveIndex } = useKeyboardNavigation(
    {
      itemsCount: sortedResults.length,
      onSelect: (index) => {
        const result = sortedResults[index];
        if (result) {
          handleResultSelect(result);
        }
      },
      isOpen,
    }
  );

  // Handle input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newQuery = e.target.value;
      setQuery(newQuery);
      // Only open dropdown when user starts typing (not on focus with empty input)
      if (newQuery.length > 0) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
      resetActiveIndex();
    },
    [resetActiveIndex]
  );

  // Handle clear button
  const handleClear = useCallback(() => {
    // Close dropdown first to prevent empty dropdown flash
    setIsOpen(false);
    resetActiveIndex();
    // Then clear query
    setQuery("");
    inputRef.current?.focus();
  }, [resetActiveIndex]);

  // Handle result selection
  const handleResultSelect = useCallback(
    (result: SearchResultItemType) => {
      // Open GitHub URL in new tab
      window.open(result.url, "_blank", "noopener,noreferrer");

      // Call onSelect callback if provided
      if (onSelect) {
        onSelect(result);
      }

      // Close dropdown
      setIsOpen(false);
      resetActiveIndex();
    },
    [onSelect, resetActiveIndex]
  );

  // Handle click outside
  const handleClickOutside = useCallback((event: MouseEvent | TouchEvent) => {
    const target = event.target as HTMLElement;

    // Don't close if clicking inside Popover content (rendered in Portal)
    if (target.closest('[role="listbox"]')) {
      return;
    }

    // Don't close if clicking on the input itself (handled by onFocus/onBlur)
    if (target.closest('[role="combobox"]')) {
      return;
    }

    setIsOpen(false);
    resetActiveIndex();
  }, [resetActiveIndex]);

  // Click outside detection
  useClickOutside(dropdownRef, handleClickOutside);

  // Auto-dismiss errors after 8 seconds
  useEffect(() => {
    if (isError && error) {
      const timeoutId = setTimeout(() => {
        // Error will be cleared by re-query or closing dropdown
      }, 8000);
      return () => clearTimeout(timeoutId);
    }
  }, [isError, error]);

  // Close dropdown if there's nothing to show
  useEffect(() => {
    if (isOpen && query.length === 0) {
      setIsOpen(false);
      resetActiveIndex();
    }
  }, [isOpen, query.length, resetActiveIndex]);

  // Determine dropdown state
  const showHint = query.length > 0 && query.length < 3;

  // Show loading during debounce period OR actual loading
  const showLoading = query.length >= 3 && (
    isLoading || // Actual API loading
    (query.length >= 3 && debouncedQuery.length < 3) // Debounce period
  );

  const showError = isError && error && error.type !== "abort" && query.length >= 3;
  const showEmpty =
    !isLoading && !isError && sortedResults.length === 0 && debouncedQuery.length >= 3 && query.length >= 3;
  const showResults =
    !isLoading && !isError && sortedResults.length > 0 && debouncedQuery.length >= 3 && query.length >= 3;

  // Determine if there's any content to show in dropdown
  const hasDropdownContent = showHint || showLoading || showError || showEmpty || showResults;

  // Auto-close dropdown if there's nothing to display (prevents empty dropdown flash)
  useEffect(() => {
    // Don't close if user is still typing (query >= 3) and waiting for debounced search
    if (query.length >= 3 && debouncedQuery.length < 3) {
      return; // Keep dropdown open during debounce period
    }

    if (isOpen && !hasDropdownContent) {
      setIsOpen(false);
    }
  }, [isOpen, hasDropdownContent, query.length, debouncedQuery.length]);

  // Results count for screen reader announcements
  const resultsCount = sortedResults.length;

  return (
    <div className={`relative w-full max-w-md ${className}`} ref={dropdownRef}>
      <Popover
        open={isOpen}
        modal={false}
        onOpenChange={(open) => {
          // Prevent Popover from auto-closing on outside click
          // We handle this ourselves with useClickOutside
          if (!open) {
            return;
          }
          // Only allow opening dropdown if there's text in input
          if (open && query.length === 0) {
            return;
          }
          setIsOpen(open);
        }}
      >
        <PopoverTrigger asChild>
          <div className="relative">
            {/* Search icon */}
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
              aria-hidden="true"
            />

            {/* Input field */}
            <Input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                // Only open dropdown if user has typed something
                if (query.length > 0) {
                  setIsOpen(true);
                }
              }}
              placeholder={placeholder}
              className="pl-10 pr-10"
              role="combobox"
              aria-expanded={isOpen}
              aria-controls="search-results"
              aria-autocomplete="list"
              aria-activedescendant={
                activeIndex >= 0 ? `result-${activeIndex}` : undefined
              }
            />

            {/* Clear button */}
            {query.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </PopoverTrigger>

        <PopoverContent
          id="search-results"
          role="listbox"
          side="bottom"
          align="start"
          sideOffset={4}
          avoidCollisions={false}
          className="w-[--radix-popover-trigger-width] p-2 max-h-[50vh] md:max-h-[400px] overflow-y-auto"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {/* Hint state: < 3 characters */}
          {showHint && <HintState />}

          {/* Loading state */}
          {showLoading && <LoadingSkeleton />}

          {/* Error state */}
          {showError && error && <ErrorDisplay error={error} />}

          {/* Empty state */}
          {showEmpty && <EmptyState query={debouncedQuery} />}

          {/* Results */}
          {showResults && (
            <div className="space-y-1">
              {sortedResults.map((result, index) => (
                <SearchResultItem
                  key={result.id}
                  id={`result-${index}`}
                  item={result}
                  isActive={index === activeIndex}
                  onClick={() => handleResultSelect(result)}
                />
              ))}
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Screen reader live region for announcements */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {isLoading && "Loading results..."}
        {showResults && `${resultsCount} results found`}
        {showEmpty && "No results found"}
      </div>
    </div>
  );
}
