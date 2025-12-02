import { cn } from '@/utils/util';
import { useState } from 'react';

type ITextCollapseProps = {
  message?: string | null;
  containerClassName?: string;
  toggleWordThreshold?: number;
  clampLines?: number;
  showToggle?: boolean;
};

export default function TextCollapse({
  message,
  containerClassName,
  toggleWordThreshold = 20,
  clampLines = 3,
  showToggle,
}: ITextCollapseProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const words = (message || '').trim().split(/\s+/);
  const shouldShowToggle =
    showToggle === true ||
    (showToggle !== false && message && words.length > toggleWordThreshold);

  const displayText = isExpanded
    ? message || 'No error message available'
    : words.slice(0, 20).join(' ') + (words.length > 20 ? '...' : '');

  const clampClass = isExpanded ? '' : 'line-clamp-2';

  return (
    <div
      className={cn(
        'text-red-800 border border-red-200 rounded bg-red-50 w-full px-4 py-2.5 text-sm',
        containerClassName
      )}
    >
      <div className={cn(clampLines === 2 ? clampClass : '')}>
        {displayText}
      </div>
      {shouldShowToggle && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded((v) => !v);
          }}
          className="text-red-600 hover:text-red-800 text-xs focus:outline-none w-full flex items-center justify-end"
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
}
