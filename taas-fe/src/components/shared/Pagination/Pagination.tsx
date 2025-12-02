import LeftChevronBlue from '@/assets/icons/LeftChevronBlue.svg?react';
import RightChevronBlue from '@/assets/icons/RightChevronBlue.svg?react';
import { useCallback, useMemo, useState } from 'react';
import SecondaryButton from '../buttons/SecondaryButton';

type ClickedSide = 'previous' | 'next';

export type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (nextPage: number) => void;
  className?: string;
};

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  const [clickedButton, setClickedButton] = useState<ClickedSide>('next');

  const isPrevDisabled = useMemo(() => currentPage <= 0, [currentPage]);
  const isNextDisabled = useMemo(
    () => totalPages <= 0 || currentPage >= totalPages - 1,
    [currentPage, totalPages]
  );

  const handlePreviousClick = useCallback(() => {
    if (isPrevDisabled) return;
    setClickedButton('previous');
    onPageChange(currentPage - 1);
  }, [currentPage, isPrevDisabled, onPageChange]);

  const handleNextClick = useCallback(() => {
    if (isNextDisabled) return;
    setClickedButton('next');
    onPageChange(currentPage + 1);
  }, [currentPage, isNextDisabled, onPageChange]);

  const containerClass = ['flex justify-evenly w-full', className || '']
    .join(' ')
    .trim();

  if (totalPages <= 0) {
    return null;
  }

  return (
    <div className={containerClass}>
      <div className="w-full"></div>
      <div className="flex items-center justify-center w-full gap-2">
        <SecondaryButton
          onClick={handlePreviousClick}
          disabled={isPrevDisabled}
          aria-label="Previous page"
          className="border border-slate-200 rounded-md flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LeftChevronBlue className="my-auto" />
          {clickedButton === 'previous' && (
            <span className="text-sm leading-none">Previous Page</span>
          )}
        </SecondaryButton>

        <SecondaryButton
          onClick={handleNextClick}
          disabled={isNextDisabled}
          aria-label="Next page"
          className="border border-slate-200 rounded-md flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {clickedButton === 'next' && (
            <span className="text-sm leading-none">Next Page</span>
          )}
          <RightChevronBlue className="my-auto" />
        </SecondaryButton>
      </div>

      <div className="flex gap-3 w-full items-center justify-end me-10">
        <div className="text-neutral-500" aria-live="polite">
          Page
        </div>
        <div className="border border-slate-200 rounded-md px-4 py-2">
          {currentPage + 1}
        </div>
        <div className="text-blue-600 text-sm">of {totalPages}</div>
      </div>
    </div>
  );
}
