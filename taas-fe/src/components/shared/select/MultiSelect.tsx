import Check from '@/assets/icons/Check.svg?react';
import SearchIcon from '@/assets/icons/SearchIcon.svg?react';
import { cn } from '@/utils/util';
import React, { useEffect, useMemo, useRef, useState } from 'react';

export interface ISelectOption {
  label: string;
  value: string | number;
  children?: ISelectOption[];
}

type IMultiSelectProps = {
  options: ISelectOption[];
  value?: ISelectOption[];
  onChange: (options: ISelectOption[]) => void;
  placeholder?: string;
  label?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  showSearch?: boolean;
  allowClear?: boolean;
  showSelectAll?: boolean;
  selectAllLabel?: string;
  wrapperClassName?: string;
  controlClassName?: string;
  isGroupCheckbox?: boolean;
  onBlur?: () => void;
  suffixIcon?: (isOpen: boolean) => React.ReactNode;
};

// Custom Checkbox Component
const CustomCheckbox: React.FC<{
  checked: boolean;
  onChange: () => void;
  className?: string;
  isGroupCheckbox?: boolean;
}> = ({ checked, isGroupCheckbox, onChange, className = '' }) => {
  return (
    <div
      onClick={onChange}
      className={cn(
        'w-4 h-4 rounded flex items-center justify-center cursor-pointer transition-colors border-2',
        checked && isGroupCheckbox
          ? 'border-blue-500'
          : 'bg-white border-gray-300 text-transparent',
        className
      )}
    >
      {checked && (
        <Check
          className={`w-3 h-3 ${
            isGroupCheckbox
              ? 'text-white-500 bg-blue-500 text-white'
              : 'text-blue-500'
          }`}
        />
      )}
    </div>
  );
};

const MultiSelect: React.FC<IMultiSelectProps> = ({
  options,
  value = [],
  onChange,
  placeholder,
  label,
  disabled = false,
  className,
  showSearch = false,
  allowClear = false,
  showSelectAll = true,
  selectAllLabel = 'Select All',
  wrapperClassName,
  controlClassName,
  isGroupCheckbox = false,
  onBlur,
  suffixIcon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expanded, setExpanded] = useState<Set<string | number>>(new Set());
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(() => {
    const filterFn = (opt: ISelectOption): boolean => {
      if (opt.label.toLowerCase().includes(searchTerm.toLowerCase()))
        return true;
      if (opt.children) {
        return opt.children.some((c) =>
          c.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      return false;
    };
    return options.filter(filterFn);
  }, [options, searchTerm]);

  const handleOutsideClick = (event: MouseEvent) => {
    if (
      wrapperRef.current &&
      !wrapperRef.current.contains(event.target as Node)
    ) {
      if (isOpen) {
        setIsOpen(false);
        onBlur?.();
      } else {
        setIsOpen(false);
      }
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, onBlur]);

  const isOptionSelected = (option: ISelectOption) => {
    return value.some((item) => item.value === option.value);
  };

  const toggleOption = (option: ISelectOption) => {
    const selected = isOptionSelected(option);
    if (selected) {
      onChange(value.filter((item) => item.value !== option.value));
    } else {
      onChange([...value, option]);
    }
  };

  const areAllChildrenSelected = (parent: ISelectOption) =>
    parent.children?.every((c) => isOptionSelected(c)) ?? false;

  const toggleParent = (parent: ISelectOption) => {
    if (!parent.children) return;
    if (areAllChildrenSelected(parent)) {
      // Deselect all children
      const newValue = value.filter(
        (item) => !parent.children!.some((c) => c.value === item.value)
      );
      onChange(newValue);
    } else {
      // Select missing children
      const selectedValues = value.map((v) => v.value);
      const newChildren = parent.children.filter(
        (c) => !selectedValues.includes(c.value)
      );
      onChange([...value, ...newChildren]);
    }
  };

  const toggleExpand = (val: string | number) => {
    setExpanded((prev) => {
      const copy = new Set(prev);
      if (copy.has(val)) copy.delete(val);
      else copy.add(val);
      return copy;
    });
  };

  const handleSelectAll = () => {
    const allFilteredSelected = filteredOptions.every((opt) => {
      if (opt.children) return opt.children.every((c) => isOptionSelected(c));
      return isOptionSelected(opt);
    });

    if (allFilteredSelected) {
      // deselect all
      const newValue = value.filter(
        (item) =>
          !filteredOptions.some(
            (opt) =>
              opt.value === item.value ||
              opt.children?.some((c) => c.value === item.value)
          )
      );
      onChange(newValue);
    } else {
      // select all
      const selectedValues = value.map((v) => v.value);
      const newOptions: ISelectOption[] = [];
      filteredOptions.forEach((opt) => {
        if (opt.children) {
          newOptions.push(
            ...opt.children.filter((c) => !selectedValues.includes(c.value))
          );
        } else if (!selectedValues.includes(opt.value)) {
          newOptions.push(opt);
        }
      });
      onChange([...value, ...newOptions]);
    }
  };

  const handleClear = () => {
    onChange([]);
    setSearchTerm('');
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (value.length === 0) {
      return (
        <span
          className={isGroupCheckbox ? 'text-gray-400 mx-5' : 'text-gray-400'}
        >
          {placeholder}
        </span>
      );
    }
    if (isGroupCheckbox) {
      const selectedSuiteNames = options
        .filter((suite) =>
          suite.children?.some((child) =>
            value.some((selected) => selected.value === child.value)
          )
        )
        .map((suite) => suite.label);

      const hiddenSuitesCount = selectedSuiteNames.length - 3;
      const namesToShow =
        hiddenSuitesCount > 0
          ? selectedSuiteNames.slice(0, 3)
          : selectedSuiteNames;

      return (
        <div className="flex flex-wrap gap-1 ">
          {namesToShow.map((name) => (
            <span
              key={name}
              className=" max-w-[120px]  px-2 py-0.5 rounded-full border border-gray-300 bg-white text-xs font-normal text-black truncate"
            >
              {name}
            </span>
          ))}
          {hiddenSuitesCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full border border-gray-300 bg-white text-xs font-normal text-gray-600">
              +{hiddenSuitesCount}
            </span>
          )}
        </div>
      );
    }
    if (value.length === 1) {
      return value[0].label;
    }
    return `${value.length} selected`;
  };

  const listboxId = 'multiselect-listbox';

  return (
    <div
      className={`relative w-full mt-2 ${wrapperClassName ?? className}`}
      ref={wrapperRef}
    >
      {label && (
        <label className="block text-sm font-medium text-gray-900 mb-1">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (isOpen) {
              setIsOpen(false);
              onBlur?.();
            } else {
              setIsOpen(true);
            }
          }}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={isOpen ? listboxId : undefined}
          className={`w-full flex justify-between items-center px-2 py-1.5 bg-white border border-gray-200 rounded-md text-left shadow-xs focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 gap-1 ${
            disabled
              ? 'cursor-not-allowed bg-gray-100 text-gray-400'
              : 'cursor-pointer'
          } ${controlClassName || ''}`}
        >
          {isGroupCheckbox && ((isOpen && showSearch) || !value.length) && (
            <SearchIcon
              className={
                isOpen
                  ? 'w-3 h-3 flex-shrink-0'
                  : ' absolute w-3 h-3 flex-shrink-0'
              }
            />
          )}
          {isOpen && isGroupCheckbox && showSearch ? (
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-1.5 rounded-md text-sm focus:outline-none "
              onClick={(e) => e.stopPropagation()} // to not close dropdown on input click
              autoFocus
            />
          ) : (
            <div>
              <span className="truncate">{getDisplayText()}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-500">
            {allowClear && value.length > 0 && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="hover:text-red-500 cursor-pointer"
              >
                X
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
          aria-multiselectable="true"
          className="absolute z-10 mt-1 w-full bg-white border border-gray-200 text-sm rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {!isGroupCheckbox && showSearch && (
            <div className="p-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full px-3 py-1 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}

          {!isGroupCheckbox && showSelectAll && filteredOptions.length > 0 && (
            <div
              onClick={handleSelectAll}
              className="px-3 py-2 mx-1 mt-1 rounded-md hover:bg-blue-50 cursor-pointer flex items-center"
            >
              <div className="flex items-center w-full">
                <div className="mr-3">
                  <CustomCheckbox
                    checked={filteredOptions.every((opt) =>
                      opt.children
                        ? opt.children.every((c) => isOptionSelected(c))
                        : isOptionSelected(opt)
                    )}
                    onChange={handleSelectAll}
                  />
                </div>
                <span className="flex-1">{selectAllLabel}</span>
              </div>
            </div>
          )}

          <ul className="max-h-52 overflow-y-auto group">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) =>
                isGroupCheckbox && option.children ? (
                  <div key={option.value} className="m-1">
                    {/* Parent */}
                    <div
                      className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-blue-50 rounded-md"
                      onClick={() => toggleExpand(option.value)}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">
                          {expanded.has(option.value) ? '-' : '+'}
                        </div>
                        <span>{option.label}</span>
                      </div>
                      <CustomCheckbox
                        checked={areAllChildrenSelected(option)}
                        isGroupCheckbox={isGroupCheckbox}
                        onChange={() => toggleParent(option)}
                      />
                    </div>

                    {/* Children */}
                    {expanded.has(option.value) && (
                      <div className="pl-6 bg-gray-50">
                        {option.children.map((child) => (
                          <div
                            key={child.value}
                            className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          >
                            <span>{child.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <li
                    key={option.value}
                    onClick={() => toggleOption(option)}
                    data-value={option.value}
                    className={`
                    px-3 py-2 m-1 rounded-md hover:bg-blue-50 cursor-pointer flex items-center
                    ${isOptionSelected(option) ? 'bg-blue-50' : ''}
                  `}
                  >
                    <div className="flex items-center w-full">
                      <div className="mr-3">
                        <CustomCheckbox
                          checked={isOptionSelected(option)}
                          onChange={() => toggleOption(option)}
                        />
                      </div>
                      <span className="flex-1">{option.label}</span>
                    </div>
                  </li>
                )
              )
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

export default MultiSelect;
