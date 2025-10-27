/**
 * useGitHubSearch Hook
 * Manages GitHub search queries with caching, error handling, and loading states.
 * Integrates with TanStack Query for optimized data fetching.
 */

import {searchGitHub} from "@/lib/api/github-api";
import {discriminateError} from "@/lib/utils/error-utils";
import type {SearchError, SearchResponse} from "@/types/github";
import {useQuery} from "@tanstack/react-query";

interface UseGitHubSearchOptions {
  /** Search query string */
  query: string;
  /** Whether the query should be executed */
  enabled: boolean;
}

interface UseGitHubSearchResult {
  /** Search response data (results + rate limit info) */
  data: SearchResponse | undefined;
  /** Whether the query is currently loading */
  isLoading: boolean;
  /** Structured error information if query failed */
  error: SearchError | null;
  /** Whether an error occurred */
  isError: boolean;
}

/**
 * Fetches GitHub search results with automatic caching and error handling
 * @param options - Search options including query and enabled flag
 * @returns Search result with data, loading state, and error information
 *
 * @example
 * const { data, isLoading, error } = useGitHubSearch({
 *   query: debouncedQuery,
 *   enabled: debouncedQuery.length >= 3
 * });
 */
export function useGitHubSearch({
  query,
  enabled,
}: UseGitHubSearchOptions): UseGitHubSearchResult {
  const {
    data,
    isLoading,
    error: queryError,
    isError,
  } = useQuery<SearchResponse, Error>({
    queryKey: ["github-search", query],
    queryFn: () => searchGitHub(query),
    enabled: enabled && query.length >= 3,
    // Retry and caching configured globally in QueryClient
  });

  // Transform error to structured SearchError
  const error = isError && queryError ? discriminateError(queryError) : null;

  return {
    data,
    isLoading,
    error,
    isError,
  };
}
