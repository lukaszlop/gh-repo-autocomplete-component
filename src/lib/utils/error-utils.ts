/**
 * Error Handling Utilities
 * Provides functions for error discrimination, message generation,
 * and time formatting for user-facing error displays.
 */

import type {SearchError} from "@/types/github";

/**
 * Discriminates error type from unknown error object
 * Analyzes error properties to determine the specific error type
 * @param error - Unknown error object to analyze
 * @returns SearchError with type, message, and optional resetTime
 */
export function discriminateError(error: unknown): SearchError {
  // Type guard for Error objects
  if (!(error instanceof Error)) {
    return {
      type: "generic",
      message: "An unknown error occurred.",
    };
  }

  // Check for AbortError (cancelled request)
  if (error.name === "AbortError") {
    return {
      type: "abort",
      message: "Request was cancelled.",
    };
  }

  // Check for network offline
  if (!navigator.onLine) {
    return {
      type: "network",
      message: "Connection error. Check your internet access.",
    };
  }

  // Check for network errors
  if (
    error.message.includes("Failed to fetch") ||
    error.message.includes("NetworkError") ||
    error.message.includes("Network request failed")
  ) {
    return {
      type: "network",
      message: "Connection error. Check your internet access.",
    };
  }

  // Check for timeout
  if (
    error.name === "TimeoutError" ||
    error.message.includes("timeout") ||
    error.message.includes("timed out")
  ) {
    return {
      type: "timeout",
      message: "Request timed out.",
    };
  }

  // Check for HTTP status code errors in message
  const statusMatch = error.message.match(/GitHub API error: (\d+)/);
  if (statusMatch) {
    const statusCode = parseInt(statusMatch[1], 10);

    // Rate limit exceeded (429)
    if (statusCode === 429) {
      return {
        type: "rate_limit",
        message: "API rate limit exceeded.",
      };
    }

    // Server errors (5xx)
    if (statusCode >= 500 && statusCode < 600) {
      return {
        type: "server",
        message: "GitHub API is currently unavailable. Please try again later.",
      };
    }

    // Client errors (4xx, excluding 429)
    if (statusCode >= 400 && statusCode < 500) {
      return {
        type: "client",
        message: "An error occurred. Please try again.",
      };
    }
  }

  // Generic error fallback
  return {
    type: "generic",
    message: "An error occurred. Please try again.",
  };
}

/**
 * Formats Unix timestamp to human-readable time remaining
 * @param resetTimestamp - Unix timestamp when rate limit resets
 * @returns Formatted string like "5 minutes" or "2 hours"
 */
export function formatResetTime(resetTimestamp: number): string {
  const now = Math.floor(Date.now() / 1000); // Current time in Unix seconds
  const diffSeconds = resetTimestamp - now;

  if (diffSeconds <= 0) {
    return "a few seconds";
  }

  const minutes = Math.floor(diffSeconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return hours === 1 ? "1 hour" : `${hours} hours`;
  }

  if (minutes > 0) {
    return minutes === 1 ? "1 minute" : `${minutes} minutes`;
  }

  return "a few seconds";
}

/**
 * Gets user-friendly error message based on error type
 * Includes special handling for rate limit errors with reset time
 * @param error - SearchError object with type and optional resetTime
 * @returns User-friendly error message string
 */
export function getErrorMessage(error: SearchError): string {
  switch (error.type) {
    case "network":
      return "Connection error. Check your internet access.";

    case "rate_limit":
      if (error.resetTime) {
        const timeRemaining = formatResetTime(error.resetTime);
        return `API rate limit exceeded. Please try again in ${timeRemaining}.`;
      }
      return "API rate limit exceeded. Please try again later.";

    case "timeout":
      return "Request timed out.";

    case "server":
      return "GitHub API is currently unavailable. Please try again later.";

    case "client":
      return "An error occurred. Please try again.";

    case "abort":
      // Abort errors should be silent (user typing new query)
      return "";

    case "generic":
    default:
      return "An error occurred. Please try again.";
  }
}
