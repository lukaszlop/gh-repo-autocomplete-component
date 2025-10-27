/**
 * Formatting Utilities
 * Provides functions for formatting numbers, sorting results,
 * and other display-related transformations.
 */

import type {SearchResultItem} from "@/types/github";

/**
 * Formats star count to human-readable format with suffixes
 * Examples: 123 → "123 ★", 1234 → "1.2k ★", 1234567 → "1.2M ★"
 * @param count - Number of stars
 * @returns Formatted string with star symbol
 */
export function formatStarCount(count: number): string {
  if (count < 1000) {
    return `${count} ★`;
  }

  if (count < 1000000) {
    const thousands = (count / 1000).toFixed(1);
    // Remove trailing .0
    const formatted = thousands.endsWith(".0")
      ? thousands.slice(0, -2)
      : thousands;
    return `${formatted}k ★`;
  }

  const millions = (count / 1000000).toFixed(1);
  // Remove trailing .0
  const formatted = millions.endsWith(".0") ? millions.slice(0, -2) : millions;
  return `${formatted}M ★`;
}

/**
 * Sorts search results alphabetically by name (case-insensitive)
 * Preserves the original array and returns a new sorted array
 * @param results - Array of search result items
 * @returns New array sorted alphabetically by name
 */
export function sortResultsAlphabetically(
  results: SearchResultItem[]
): SearchResultItem[] {
  return [...results].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, {
      sensitivity: "base", // Case-insensitive comparison
      numeric: true, // Handle numbers naturally (e.g., "item2" before "item10")
    })
  );
}
