interface ISecondaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
}

const SecondaryButton = ({
  children,
  onClick,
  type = 'button',
  disabled = false,
  icon,
  iconPosition = 'left',
  className,
}: ISecondaryButtonProps) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-lg bg-white font-medium hover:bg-grey-100 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border ${className}`}
    >
      {icon && iconPosition === 'left' && (
        <span className="mr-2 flex items-center">{icon}</span>
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <span className="ml-2 flex items-center">{icon}</span>
      )}
    </button>
  );
};

export default SecondaryButton;
