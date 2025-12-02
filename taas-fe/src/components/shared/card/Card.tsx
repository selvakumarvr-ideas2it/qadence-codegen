interface ICardProps {
  className?: string;
  children: React.ReactNode;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  disabled?: boolean;
  header?: string;
}

/**
 * Card component renders a styled container for content with optional selection state.
 *
 * @param [className] - Additional CSS classes for the card.
 * @param children - Content to display inside the card.
 * @param [isSelected] - Controls if card is selected (default: false).
 * @param [onSelect] - Callback when card is clicked.
 * @param [disabled] - Disables click functionality when true.
 * @returns The styled card container with selection functionality.
 */
export function Card({
  className = '',
  children,
  isSelected = false,
  onSelect,
  disabled = false,
}: ICardProps) {
  const handleClick = () => {
    if (!disabled && onSelect) {
      onSelect(!isSelected);
    }
  };

  const baseClasses = 'bg-white rounded-xl border shadow p-5';
  const borderClasses = isSelected
    ? 'border-blue-500 shadow-blue-500/50'
    : 'border-gray-200';
  const cursorClasses = disabled
    ? 'cursor-not-allowed'
    : onSelect
      ? 'cursor-pointer hover:shadow-md transition-shadow'
      : '';
  const opacityClasses = disabled ? 'opacity-60' : '';

  return (
    <div
      className={`${baseClasses} ${borderClasses} ${cursorClasses} ${opacityClasses} ${className}`}
      tabIndex={disabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (!disabled && onSelect && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onSelect(!isSelected);
        }
      }}
    >
      {children}
    </div>
  );
}
