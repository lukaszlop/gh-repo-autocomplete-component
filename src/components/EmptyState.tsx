/**
 * EmptyState Component
 * Displays a message when no search results are found for the user's query.
 */

import {Search} from "lucide-react";
import React from "react";

interface EmptyStateProps {
  /** The search query that returned no results */
  query: string;
}

/**
 * EmptyState displays a friendly message when no results are found
 */
export function EmptyState({query}: EmptyStateProps): React.JSX.Element {
  return (
    <div
      className='flex flex-col items-center justify-center py-8 px-4 text-center'
      role='status'
      aria-live='polite'
      data-testid='empty-state'
    >
      <Search
        className='w-12 h-12 text-muted-foreground/50 mb-3'
        aria-hidden='true'
      />
      <p className='text-sm text-muted-foreground'>
        No repositories or users found for '{query}'
      </p>
    </div>
  );
}
