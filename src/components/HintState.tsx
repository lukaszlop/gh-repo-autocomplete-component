/**
 * HintState Component
 * Displays a hint message when the user hasn't typed enough characters to trigger a search.
 */

import { Info } from "lucide-react";

/**
 * HintState displays a message prompting the user to type at least 3 characters
 */
export function HintState(): JSX.Element {
  return (
    <div
      className="flex flex-col items-center justify-center py-8 px-4 text-center"
      role="status"
      aria-live="polite"
    >
      <Info
        className="w-10 h-10 text-muted-foreground/50 mb-3"
        aria-hidden="true"
      />
      <p className="text-sm text-muted-foreground">
        Type at least 3 characters to search
      </p>
    </div>
  );
}
