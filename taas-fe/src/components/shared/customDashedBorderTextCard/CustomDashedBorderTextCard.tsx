interface ICustomDashedBorderTextCard {
  children: React.ReactNode;
  className?: string;
  textClassName?: string;
}

const CustomDashedBorderTextCard = ({
  className,
  children,
  textClassName = 'text-gray-600',
}: ICustomDashedBorderTextCard) => {
  return (
    <div
      className={`border-dashed border-2 border-gray-300 rounded-lg p-4 text-center ${textClassName} ${className ? className : ''}`}
    >
      {children}
    </div>
  );
};

export default CustomDashedBorderTextCard;
