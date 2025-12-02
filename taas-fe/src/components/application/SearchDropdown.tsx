import type { ISelectOption } from '../shared/select/Select';

export const SearchDropdown = ({
  isOpen,
  applicationList,
  onSelect,
}: {
  isOpen: boolean;
  applicationList: ISelectOption[];
  onSelect: (app: ISelectOption) => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
      {applicationList.length > 0 ? (
        applicationList.map((app: ISelectOption, index: number) => (
          <div
            key={app.label || index}
            onClick={() => onSelect(app)}
            className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
          >
            <div className="font-medium text-gray-900">{app.label}</div>
          </div>
        ))
      ) : (
        <div className="px-3 py-2 text-gray-500 text-sm">No options found</div>
      )}
    </div>
  );
};
