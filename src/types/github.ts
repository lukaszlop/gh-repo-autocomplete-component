/**
 * GitHub API Response Types
 * Types matching the structure of GitHub REST API v3 responses
 */

/**
 * Repository response from GitHub API
 */
export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  html_url: string;
  stargazers_count: number;
  description: string | null;
}

/**
 * User response from GitHub API
 */
export interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  type: "User" | "Organization";
}

/**
 * Search repositories API response
 */
export interface SearchRepositoriesResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubRepository[];
}

/**
 * Search users API response
 */
export interface SearchUsersResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubUser[];
}

/**
 * Internal Application Types
 * Types used within the application for unified data handling
 */

/**
 * Type of search result item
 */
export type SearchResultType = "repo" | "user";

/**
 * Unified search result item combining repos and users
 */
export interface SearchResultItem {
  /** Unique identifier in format "type:id" */
  id: string;
  /** Type of result */
  type: SearchResultType;
  /** Repository name or user login */
  name: string;
  /** Avatar URL from GitHub CDN */
  avatarUrl: string;
  /** GitHub URL for the item */
  url: string;
  /** Star count (only for repositories) */
  stars?: number;
}

/**
 * Rate limit information extracted from response headers
 */
export interface RateLimitInfo {
  /** Maximum requests allowed */
  limit: number;
  /** Remaining requests in current window */
  remaining: number;
  /** Unix timestamp when the rate limit resets */
  reset: number;
}

/**
 * Combined search response with results and rate limit info
 */
export interface SearchResponse {
  /** Unified list of search results */
  results: SearchResultItem[];
  /** Rate limit information (null if headers not available) */
  rateLimit: RateLimitInfo | null;
}

/**
 * Error types for different failure scenarios
 */
export type ErrorType =
  | "network" // Network connectivity issues
  | "rate_limit" // GitHub API rate limit exceeded
  | "timeout" // Request timeout
  | "server" // Server errors (5xx)
  | "client" // Client errors (4xx)
  | "abort" // Request cancelled
  | "generic"; // Unknown/catch-all errors

/**
 * Structured error information for search failures
 */
export interface SearchError {
  /** Type of error for discriminated handling */
  type: ErrorType;
  /** User-friendly error message */
  message: string;
  /** Unix timestamp when rate limit resets (only for rate_limit errors) */
  resetTime?: number;
}
