import RightChevron from '@/assets/icons/RightChevron.svg?react';
import { useState } from 'react';

interface ICustomAccordionProps {
  title: string;
  accordionIcon: React.ReactNode;
  body: React.ReactNode;
  totalItems?: number;
}

const CustomAccordion = (props: ICustomAccordionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { title, accordionIcon, body } = props;

  const onOpenAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <div
        className={` ${body ? 'cursor-pointer' : ''} p-4 rounded-lg border border-[#E0E0E0] flex justify-between items-center  ${isOpen ? 'rounded-b-none' : ''}`}
        onClick={onOpenAccordion}
      >
        <div className="flex gap-2 items-center">
          {body && (
            <div className={`${isOpen ? 'rotate-90' : ''}`}>
              <RightChevron className="h-4 w-4" />
            </div>
          )}

          <div className="flex gap-2 items-center">
            {accordionIcon}
            <div className="font-bold">{title}</div>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="border border-[#E0E0E0] border-t-0 bg-[#f9fafb] rounded-b-lg">
          <div className="p-2.5">{body}</div>
        </div>
      )}
    </div>
  );
};

export default CustomAccordion;
