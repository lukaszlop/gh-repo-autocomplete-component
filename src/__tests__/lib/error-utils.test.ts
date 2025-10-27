import {
  discriminateError,
  formatResetTime,
  getErrorMessage,
} from "@/lib/utils/error-utils";
import type {SearchError} from "@/types/github";
import {beforeEach, describe, expect, it, vi} from "vitest";

describe("Error Utilities", () => {
  describe("discriminateError", () => {
    it("should return generic error for non-Error objects", () => {
      const result = discriminateError("not an error");

      expect(result).toEqual({
        type: "generic",
        message: "An unknown error occurred.",
      });
    });

    it("should return generic error for null", () => {
      const result = discriminateError(null);

      expect(result).toEqual({
        type: "generic",
        message: "An unknown error occurred.",
      });
    });

    it("should detect AbortError", () => {
      const error = new Error("Request aborted");
      error.name = "AbortError";

      const result = discriminateError(error);

      expect(result).toEqual({
        type: "abort",
        message: "Request was cancelled.",
      });
    });

    it("should detect network offline", () => {
      // Mock navigator.onLine
      vi.stubGlobal("navigator", {onLine: false});

      const error = new Error("Some error");
      const result = discriminateError(error);

      expect(result).toEqual({
        type: "network",
        message: "Connection error. Check your internet access.",
      });

      // Restore navigator
      vi.unstubAllGlobals();
    });

    it("should detect network errors from error message - Failed to fetch", () => {
      vi.stubGlobal("navigator", {onLine: true});

      const error = new Error("Failed to fetch");
      const result = discriminateError(error);

      expect(result).toEqual({
        type: "network",
        message: "Connection error. Check your internet access.",
      });

      vi.unstubAllGlobals();
    });

    it("should detect network errors from error message - NetworkError", () => {
      vi.stubGlobal("navigator", {onLine: true});

      const error = new Error("NetworkError when attempting to fetch resource");
      const result = discriminateError(error);

      expect(result).toEqual({
        type: "network",
        message: "Connection error. Check your internet access.",
      });

      vi.unstubAllGlobals();
    });

    it("should detect network errors from error message - Network request failed", () => {
      vi.stubGlobal("navigator", {onLine: true});

      const error = new Error("Network request failed");
      const result = discriminateError(error);

      expect(result).toEqual({
        type: "network",
        message: "Connection error. Check your internet access.",
      });

      vi.unstubAllGlobals();
    });

    it("should detect timeout error by name", () => {
      vi.stubGlobal("navigator", {onLine: true});

      const error = new Error("Request timed out");
      error.name = "TimeoutError";

      const result = discriminateError(error);

      expect(result).toEqual({
        type: "timeout",
        message: "Request timed out.",
      });

      vi.unstubAllGlobals();
    });

    it("should detect timeout error from message - timeout", () => {
      vi.stubGlobal("navigator", {onLine: true});

      const error = new Error("Request timeout exceeded");
      const result = discriminateError(error);

      expect(result).toEqual({
        type: "timeout",
        message: "Request timed out.",
      });

      vi.unstubAllGlobals();
    });

    it("should detect timeout error from message - timed out", () => {
      vi.stubGlobal("navigator", {onLine: true});

      const error = new Error("The request timed out");
      const result = discriminateError(error);

      expect(result).toEqual({
        type: "timeout",
        message: "Request timed out.",
      });

      vi.unstubAllGlobals();
    });

    it("should detect rate limit error (429)", () => {
      vi.stubGlobal("navigator", {onLine: true});

      const error = new Error("GitHub API error: 429");
      const result = discriminateError(error);

      expect(result).toEqual({
        type: "rate_limit",
        message: "API rate limit exceeded.",
      });

      vi.unstubAllGlobals();
    });

    it("should detect server error (500)", () => {
      vi.stubGlobal("navigator", {onLine: true});

      const error = new Error("GitHub API error: 500");
      const result = discriminateError(error);

      expect(result).toEqual({
        type: "server",
        message: "GitHub API is currently unavailable. Please try again later.",
      });

      vi.unstubAllGlobals();
    });

    it("should detect server error (503)", () => {
      vi.stubGlobal("navigator", {onLine: true});

      const error = new Error("GitHub API error: 503");
      const result = discriminateError(error);

      expect(result).toEqual({
        type: "server",
        message: "GitHub API is currently unavailable. Please try again later.",
      });

      vi.unstubAllGlobals();
    });

    it("should detect client error (400)", () => {
      vi.stubGlobal("navigator", {onLine: true});

      const error = new Error("GitHub API error: 400");
      const result = discriminateError(error);

      expect(result).toEqual({
        type: "client",
        message: "An error occurred. Please try again.",
      });

      vi.unstubAllGlobals();
    });

    it("should detect client error (404)", () => {
      vi.stubGlobal("navigator", {onLine: true});

      const error = new Error("GitHub API error: 404");
      const result = discriminateError(error);

      expect(result).toEqual({
        type: "client",
        message: "An error occurred. Please try again.",
      });

      vi.unstubAllGlobals();
    });

    it("should return generic error for unrecognized status codes", () => {
      vi.stubGlobal("navigator", {onLine: true});

      const error = new Error("GitHub API error: 200");
      const result = discriminateError(error);

      expect(result).toEqual({
        type: "generic",
        message: "An error occurred. Please try again.",
      });

      vi.unstubAllGlobals();
    });

    it("should return generic error for errors without status codes", () => {
      vi.stubGlobal("navigator", {onLine: true});

      const error = new Error("Something went wrong");
      const result = discriminateError(error);

      expect(result).toEqual({
        type: "generic",
        message: "An error occurred. Please try again.",
      });

      vi.unstubAllGlobals();
    });
  });

  describe("formatResetTime", () => {
    beforeEach(() => {
      // Mock Date.now() to return a consistent timestamp
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2024-10-27T10:00:00Z"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should return 'a few seconds' for past timestamps", () => {
      const pastTimestamp = Math.floor(Date.now() / 1000) - 10;
      const result = formatResetTime(pastTimestamp);

      expect(result).toBe("a few seconds");
    });

    it("should return 'a few seconds' for current timestamp", () => {
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const result = formatResetTime(currentTimestamp);

      expect(result).toBe("a few seconds");
    });

    it("should return 'a few seconds' for less than 1 minute", () => {
      const futureTimestamp = Math.floor(Date.now() / 1000) + 30; // 30 seconds
      const result = formatResetTime(futureTimestamp);

      expect(result).toBe("a few seconds");
    });

    it("should return '1 minute' for exactly 1 minute", () => {
      const futureTimestamp = Math.floor(Date.now() / 1000) + 60; // 1 minute
      const result = formatResetTime(futureTimestamp);

      expect(result).toBe("1 minute");
    });

    it("should return 'X minutes' for multiple minutes", () => {
      const futureTimestamp = Math.floor(Date.now() / 1000) + 300; // 5 minutes
      const result = formatResetTime(futureTimestamp);

      expect(result).toBe("5 minutes");
    });

    it("should return '1 hour' for exactly 1 hour", () => {
      const futureTimestamp = Math.floor(Date.now() / 1000) + 3600; // 1 hour
      const result = formatResetTime(futureTimestamp);

      expect(result).toBe("1 hour");
    });

    it("should return 'X hours' for multiple hours", () => {
      const futureTimestamp = Math.floor(Date.now() / 1000) + 7200; // 2 hours
      const result = formatResetTime(futureTimestamp);

      expect(result).toBe("2 hours");
    });

    it("should prioritize hours over minutes", () => {
      const futureTimestamp = Math.floor(Date.now() / 1000) + 5400; // 1.5 hours
      const result = formatResetTime(futureTimestamp);

      expect(result).toBe("1 hour");
    });
  });

  describe("getErrorMessage", () => {
    it("should return network error message", () => {
      const error: SearchError = {
        type: "network",
        message: "Connection error. Check your internet access.",
      };

      const result = getErrorMessage(error);

      expect(result).toBe("Connection error. Check your internet access.");
    });

    it("should return rate limit error message without reset time", () => {
      const error: SearchError = {
        type: "rate_limit",
        message: "API rate limit exceeded.",
      };

      const result = getErrorMessage(error);

      expect(result).toBe("API rate limit exceeded. Please try again later.");
    });

    it("should return rate limit error message with reset time", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2024-10-27T10:00:00Z"));

      const resetTime = Math.floor(Date.now() / 1000) + 300; // 5 minutes from now
      const error: SearchError = {
        type: "rate_limit",
        message: "API rate limit exceeded.",
        resetTime,
      };

      const result = getErrorMessage(error);

      expect(result).toBe(
        "API rate limit exceeded. Please try again in 5 minutes."
      );

      vi.useRealTimers();
    });

    it("should return timeout error message", () => {
      const error: SearchError = {
        type: "timeout",
        message: "Request timed out.",
      };

      const result = getErrorMessage(error);

      expect(result).toBe("Request timed out.");
    });

    it("should return server error message", () => {
      const error: SearchError = {
        type: "server",
        message: "GitHub API is currently unavailable. Please try again later.",
      };

      const result = getErrorMessage(error);

      expect(result).toBe(
        "GitHub API is currently unavailable. Please try again later."
      );
    });

    it("should return client error message", () => {
      const error: SearchError = {
        type: "client",
        message: "An error occurred. Please try again.",
      };

      const result = getErrorMessage(error);

      expect(result).toBe("An error occurred. Please try again.");
    });

    it("should return empty string for abort error", () => {
      const error: SearchError = {
        type: "abort",
        message: "Request was cancelled.",
      };

      const result = getErrorMessage(error);

      expect(result).toBe("");
    });

    it("should return generic error message", () => {
      const error: SearchError = {
        type: "generic",
        message: "An error occurred. Please try again.",
      };

      const result = getErrorMessage(error);

      expect(result).toBe("An error occurred. Please try again.");
    });

    it("should return generic error message for unknown type", () => {
      const error = {
        type: "unknown_type",
        message: "Some message",
      } as SearchError;

      const result = getErrorMessage(error);

      expect(result).toBe("An error occurred. Please try again.");
    });
  });
});
