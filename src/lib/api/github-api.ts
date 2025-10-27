/**
 * GitHub API Integration
 * Handles all communication with GitHub Search API including rate limiting,
 * request cancellation, and data transformation.
 */

import type {
  GitHubRepository,
  GitHubUser,
  RateLimitInfo,
  SearchRepositoriesResponse,
  SearchResponse,
  SearchResultItem,
  SearchUsersResponse,
} from "@/types/github";

/**
 * Extended fetch options with timeout support
 */
interface FetchOptions extends RequestInit {
  timeout?: number;
}

/**
 * Fetches a URL with timeout support using AbortController
 * @param url - URL to fetch
 * @param options - Fetch options including optional timeout in milliseconds
 * @returns Promise resolving to Response
 * @throws Error if timeout is reached or fetch fails
 */
export async function fetchWithTimeout(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const {timeout = 10000, ...fetchOptions} = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Extracts rate limit information from GitHub API response headers
 * @param headers - Response headers from GitHub API
 * @returns RateLimitInfo object or null if headers not available
 */
export function extractRateLimit(headers: Headers): RateLimitInfo | null {
  try {
    const limit = headers.get("X-RateLimit-Limit");
    const remaining = headers.get("X-RateLimit-Remaining");
    const reset = headers.get("X-RateLimit-Reset");

    if (!limit || !remaining || !reset) {
      return null;
    }

    return {
      limit: parseInt(limit, 10),
      remaining: parseInt(remaining, 10),
      reset: parseInt(reset, 10),
    };
  } catch {
    return null;
  }
}

/**
 * Transforms a GitHub repository to a unified search result item
 * @param repo - GitHub repository object
 * @returns SearchResultItem
 */
export function transformRepositoryToResult(
  repo: GitHubRepository
): SearchResultItem {
  return {
    id: `repo:${repo.id}`,
    type: "repo",
    name: repo.full_name,
    avatarUrl: repo.owner.avatar_url,
    url: repo.html_url,
    stars: repo.stargazers_count,
  };
}

/**
 * Transforms a GitHub user to a unified search result item
 * @param user - GitHub user object
 * @returns SearchResultItem
 */
export function transformUserToResult(user: GitHubUser): SearchResultItem {
  return {
    id: `user:${user.id}`,
    type: "user",
    name: user.login,
    avatarUrl: user.avatar_url,
    url: user.html_url,
  };
}

/**
 * Searches GitHub for repositories and users matching the query
 * Performs parallel searches and combines results
 * @param query - Search query string (minimum 3 characters)
 * @returns Promise resolving to SearchResponse with results and rate limit info
 * @throws Error if API request fails
 */
export async function searchGitHub(query: string): Promise<SearchResponse> {
  // Get optional GitHub token from environment
  const token = import.meta.env.VITE_GITHUB_TOKEN;

  // Prepare headers
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  // Add authorization header if token is available
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Create AbortController for request cancellation
  const controller = new AbortController();

  try {
    // Parallel fetch for repositories and users
    const [reposResponse, usersResponse] = await Promise.all([
      fetchWithTimeout(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(
          query
        )}&per_page=25&sort=name`,
        {
          headers,
          signal: controller.signal,
          timeout: 10000,
        }
      ),
      fetchWithTimeout(
        `https://api.github.com/search/users?q=${encodeURIComponent(
          query
        )}&per_page=25&sort=name`,
        {
          headers,
          signal: controller.signal,
          timeout: 10000,
        }
      ),
    ]);

    // Check for error responses
    if (!reposResponse.ok || !usersResponse.ok) {
      const errorResponse = !reposResponse.ok ? reposResponse : usersResponse;
      throw new Error(`GitHub API error: ${errorResponse.status}`);
    }

    // Parse JSON responses
    const [reposData, usersData] = await Promise.all([
      reposResponse.json() as Promise<SearchRepositoriesResponse>,
      usersResponse.json() as Promise<SearchUsersResponse>,
    ]);

    // Extract rate limit info from first response (both should have same limits)
    const rateLimit = extractRateLimit(reposResponse.headers);

    // Transform and combine results
    const repoResults = reposData.items.map(transformRepositoryToResult);
    const userResults = usersData.items.map(transformUserToResult);

    return {
      results: [...repoResults, ...userResults],
      rateLimit,
    };
  } catch (error) {
    // Clean up abort controller
    controller.abort();
    throw error;
  }
}
