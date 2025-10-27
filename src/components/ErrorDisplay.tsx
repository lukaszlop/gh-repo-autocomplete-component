/**
 * ErrorDisplay Component
 * Displays error messages with appropriate styling based on error severity.
 * Supports both error (red) and warning (yellow) states.
 */

import type { SearchError } from "@/types/github";
import { AlertCircle, AlertTriangle } from "lucide-react";

interface ErrorDisplayProps {
  /** Error object containing type and message */
  error: SearchError;
}

/**
 * ErrorDisplay shows user-friendly error messages with appropriate visual styling
 */
export function ErrorDisplay({ error }: ErrorDisplayProps): JSX.Element {
  // Determine if this is a warning (rate limit approaching) vs error
  const isWarning = error.type === "rate_limit" && error.message.includes("Zbliżasz się");

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-md
        ${isWarning ? "bg-amber-50 border border-amber-200" : "bg-red-50 border border-red-200"}
      `}
      role="alert"
      aria-live="assertive"
    >
      {/* Icon */}
      {isWarning ? (
        <AlertTriangle
          className="w-5 h-5 text-amber-600 shrink-0 mt-0.5"
          aria-hidden="true"
        />
      ) : (
        <AlertCircle
          className="w-5 h-5 text-red-600 shrink-0 mt-0.5"
          aria-hidden="true"
        />
      )}

      {/* Error message */}
      <p
        className={`
          text-sm flex-1
          ${isWarning ? "text-amber-800" : "text-red-800"}
        `}
      >
        {error.message}
      </p>
    </div>
  );
}
