import Check from '@/assets/icons/Check.svg?react';
import SearchIcon from '@/assets/icons/SearchIcon.svg?react';
import React, { useEffect, useMemo, useRef, useState } from 'react';

export interface ISelectOption {
  label: string;
  value: string | number;
}

type ISelectProps = {
  options: ISelectOption[];
  value?: ISelectOption | null;
  onChange: (option?: ISelectOption | null) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  showSearch?: boolean;
  allowClear?: boolean;
  wrapperClassName?: string;
  controlClassName?: string;
  isAddNewForm?: boolean;
  onBlur?: () => void;
  suffixIcon?: (isOpen: boolean) => React.ReactNode;
};

const Select: React.FC<ISelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  label,
  disabled = false,
  className,
  showSearch = false,
  allowClear = false,
  wrapperClassName,
  controlClassName,
  isAddNewForm,
  onBlur,
  suffixIcon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(() => {
    return options.filter((option) =>
      option.label.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  const handleOutsideClick = (event: MouseEvent) => {
    if (
      wrapperRef.current &&
      !wrapperRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, onBlur]);

  const handleSelect = (option: ISelectOption) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    onChange(undefined);
    setSearchTerm('');
    setIsOpen(false);
  };

  const listboxId = 'select-listbox';

  return (
    <div
      className={`relative w-full ${wrapperClassName ?? className}`}
      ref={wrapperRef}
    >
      {label && (
        <label className="block text-sm font-normal text-gray-700 mb-1">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          onBlur={onBlur}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={isOpen ? listboxId : undefined}
          className={`w-full flex justify-between items-center px-2 py-1.5 bg-white border border-gray-200 rounded-md text-left shadow-xs focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 gap-1 ${
            disabled
              ? 'cursor-not-allowed bg-gray-100 text-gray-400'
              : 'cursor-pointer'
          } ${controlClassName || ''}`}
        >
          {' '}
          {isAddNewForm && (
            <SearchIcon
              className={
                isOpen
                  ? 'w-3 h-3 flex-shrink-0'
                  : ' absolute w-3 h-3 flex-shrink-0'
              }
            />
          )}
          {isAddNewForm && isOpen ? (
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={placeholder}
              className="w-full rounded-md text-sm px-2 py-1.5 focus:outline-none"
              autoFocus
              onClick={(e) => e.stopPropagation()} // Prevents closing when clicking input
            />
          ) : (
            <div>
              <span className={isAddNewForm ? ' mx-5 truncate' : 'truncate'}>
                {value ? (
                  value.label
                ) : (
                  <span className="text-gray-500 text-sm">{placeholder}</span>
                )}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-500">
            {allowClear && value && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="hover:text-red-500 cursor-pointer"
              >
                <i className="fa fa-close" />
              </div>
            )}

            {suffixIcon && suffixIcon(isOpen)}
          </div>
        </button>
      </div>

      {isOpen && !disabled && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute z-10 mt-1 w-full bg-white border border-gray-200 text-sm rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {showSearch && (
            <div className="p-2 border-b">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-1 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}
          <ul className="max-h-52 overflow-y-auto group">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={value?.value === option.value}
                  onClick={() => handleSelect(option)}
                  data-value={option.value}
                  className={`
                    px-7 py-1 m-1 rounded-md hover:bg-blue-50 cursor-pointer flex items-center text-xs
                    ${value?.value === option.value ? 'group-hover:bg-transparent bg-blue-50 text-xs text-nowrap ps-1.5' : ''}
                  `}
                >
                  {value?.value === option.value && <Check className="mr-1" />}
                  {option.label}
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-gray-500 text-sm">
                No options found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Select;
