/**
 * SearchResultItem Component
 * Displays a single search result (repository or user) with appropriate styling and metadata.
 * Memoized for performance optimization.
 */

import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Badge} from "@/components/ui/badge";
import {formatStarCount} from "@/lib/utils/format";
import type {SearchResultItem as SearchResultItemType} from "@/types/github";
import React, {memo} from "react";

interface SearchResultItemProps {
  /** Search result item data */
  item: SearchResultItemType;
  /** Whether this item is currently active/highlighted */
  isActive: boolean;
  /** Click handler for item selection */
  onClick: () => void;
  /** Mouse enter handler for hover */
  onMouseEnter?: () => void;
  /** Unique ID for ARIA */
  id: string;
  /** Data test ID for E2E testing */
  "data-testid"?: string;
}

/**
 * SearchResultItem displays a single result with badge, avatar, name, and stars
 */
function SearchResultItemComponent({
  item,
  isActive,
  onClick,
  onMouseEnter,
  id,
  "data-testid": dataTestId,
}: SearchResultItemProps): React.JSX.Element {
  // Get initials for avatar fallback
  const getInitials = (name: string): string => {
    const parts = name.split(/[\s/-]/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Handle interaction to call onSelect callback
  const handleInteraction = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Stop propagation to prevent click-outside handler from firing
    e.stopPropagation();
    // Call onClick to trigger onSelect callback
    onClick();
    // Link will handle navigation automatically
  };

  return (
    <a
      id={id}
      role='option'
      aria-selected={isActive}
      href={item.url}
      target='_blank'
      rel='noopener noreferrer'
      onClick={handleInteraction}
      onMouseEnter={onMouseEnter}
      data-testid={dataTestId}
      data-active={isActive}
      tabIndex={-1}
      className={`
        flex items-center gap-3 p-2 rounded-md cursor-pointer
        transition-colors duration-150 no-underline
        ${
          isActive
            ? "bg-accent"
            : "active:bg-accent [@media(hover:hover)]:hover:bg-accent [@media(hover:hover)]:active:bg-accent/80"
        }
      `}
    >
      {/* Badge for type (User/Repo) */}
      <Badge
        variant='outline'
        className={`
          shrink-0 text-xs font-medium
          ${
            item.type === "user"
              ? "border-blue-300 text-blue-600 bg-blue-50"
              : "border-pink-300 text-pink-600 bg-pink-50"
          }
        `}
      >
        {item.type === "user" ? "User" : "Repo"}
      </Badge>

      {/* Avatar */}
      <Avatar className='w-8 h-8 shrink-0'>
        <AvatarImage src={item.avatarUrl} alt={item.name} loading='lazy' />
        <AvatarFallback className='text-xs'>
          {getInitials(item.name)}
        </AvatarFallback>
      </Avatar>

      {/* Name */}
      <span className='flex-1 truncate font-medium text-sm'>{item.name}</span>

      {/* Stars (only for repos) */}
      {item.type === "repo" && item.stars !== undefined && (
        <span className='shrink-0 text-sm text-muted-foreground'>
          {formatStarCount(item.stars)}
        </span>
      )}
    </a>
  );
}

/**
 * Memoized SearchResultItem to prevent unnecessary re-renders
 */
export const SearchResultItem = memo(SearchResultItemComponent);
