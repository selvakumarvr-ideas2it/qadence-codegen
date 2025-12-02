interface IStaticAccordionProps {
  header: React.ReactNode;
  body: React.ReactNode;
}

const StaticAccordion = (props: IStaticAccordionProps) => {
  const { header, body } = props;

  return (
    <div className="mb-3">
      {/* Header */}
      <div className="border border-[#E0E0E0] rounded-t-lg p-2.5 flex items-center gap-2.5 bg-[#f9fafb] ">
        {header}
      </div>

      {/* Body (always visible) */}
      <div className="border border-[#E0E0E0] border-t-0  rounded-b-lg p-2.5">
        {body}
      </div>
    </div>
  );
};

export default StaticAccordion;
