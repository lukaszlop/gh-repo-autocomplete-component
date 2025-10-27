/**
 * LoadingSkeleton Component
 * Displays animated placeholder items while search results are loading.
 * Shows 5 skeleton items matching the structure of SearchResultItem.
 */

/**
 * LoadingSkeleton displays placeholder content during data fetching
 */
export function LoadingSkeleton(): JSX.Element {
  return (
    <div className="space-y-2" aria-label="Loading results...">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 p-2"
          aria-hidden="true"
        >
          {/* Badge skeleton */}
          <div className="w-12 h-5 bg-muted rounded animate-pulse shrink-0" />

          {/* Avatar skeleton */}
          <div className="w-8 h-8 bg-muted rounded-full animate-pulse shrink-0" />

          {/* Name skeleton */}
          <div className="flex-1 space-y-1">
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
          </div>

          {/* Stars skeleton */}
          <div className="w-12 h-4 bg-muted rounded animate-pulse shrink-0" />
        </div>
      ))}
    </div>
  );
}
