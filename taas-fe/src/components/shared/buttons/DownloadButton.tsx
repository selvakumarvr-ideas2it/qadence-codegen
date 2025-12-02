import DownloadIcon from '@/assets/icons/DownloadIcon.svg?react';
import SecondaryButton from './SecondaryButton';
import PrimaryButton from './PrimaryButton';

interface IDownloadButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  className?: string;
  children?: React.ReactNode;
  iconClassName?: string;
  iconPosition?: 'left' | 'right';
  'aria-label'?: string;
}

const DownloadButton = ({
  onClick,
  isLoading = false,
  disabled = false,
  variant = 'primary',
  className = '',
  children = 'Download',
  iconClassName = 'h-5 w-5',
  iconPosition = 'right',
  'aria-label': ariaLabel = 'Download file',
}: IDownloadButtonProps) => {
  const isDisabled = disabled || isLoading;
  const icon = <DownloadIcon className={iconClassName} />;

  if (variant === 'secondary') {
    return (
      <SecondaryButton
        onClick={onClick}
        disabled={isDisabled}
        className={className}
        icon={icon}
        iconPosition={iconPosition}
        aria-label={ariaLabel}
      >
        {children}
      </SecondaryButton>
    );
  }

  return (
    <PrimaryButton
      onClick={onClick}
      disabled={isDisabled}
      className={className}
      icon={icon}
      iconPosition={iconPosition}
      aria-label={ariaLabel}
    >
      {children}
    </PrimaryButton>
  );
};

export default DownloadButton;
