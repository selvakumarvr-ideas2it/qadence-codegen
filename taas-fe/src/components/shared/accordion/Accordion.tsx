import RightChevron from '@/assets/icons/RightChevron.svg?react';
import { useState } from 'react';

interface IAccordionProps {
  header: React.ReactNode;
  body: React.ReactNode;
}

const Accordion = (props: IAccordionProps) => {
  const { header, body } = props;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-3">
      <div
        className={`cursor-pointer border border-[#E0E0E0] rounded-lg p-2.5  flex items-center gap-2.5 ${isOpen ? 'rounded-b-none' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={`${isOpen ? 'rotate-90' : ''}`}>
          <RightChevron className="h-4 w-4" />
        </div>
        {header}
      </div>
      {isOpen && (
        <div className="border border-[#E0E0E0] border-t-0  bg-[#f9fafb] rounded-b-lg p-2.5">
          {body}
        </div>
      )}
    </div>
  );
};

export default Accordion;
