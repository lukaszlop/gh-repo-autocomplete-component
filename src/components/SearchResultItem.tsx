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

  return (
    <div
      id={id}
      role='option'
      aria-selected={isActive}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      data-testid={dataTestId}
      data-active={isActive}
      className={`
        flex items-center gap-3 p-2 rounded-md cursor-pointer
        transition-colors duration-150
        ${
          isActive
            ? "bg-accent"
            : "hover:bg-accent active:bg-accent md:hover:bg-accent md:active:bg-transparent"
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
    </div>
  );
}

/**
 * Memoized SearchResultItem to prevent unnecessary re-renders
 */
export const SearchResultItem = memo(SearchResultItemComponent);
