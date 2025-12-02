import CheckIcon from '@/assets/icons/Check.svg?react';
import SearchIcon from '@/assets/icons/SearchIcon.svg?react';
import { PLACEMENT } from '@/constants/appConstant';
import { useEffect, useRef, useState } from 'react';

interface SuiteOption {
  id: string;
  name: string;
}

interface SuiteSearchDropdownProps {
  suites: SuiteOption[];
  selectedSuiteId?: string;
  onSelectSuite: (suiteId: string, suiteName: string) => void;
  onAddNewSuite: (suiteName: string) => void | Promise<void>;
  onClose?: () => void;
  className?: string;
  placeholder?: string;
  placement?: (typeof PLACEMENT)[keyof typeof PLACEMENT];
  validationError?: string;
  onClearValidationError?: () => void;
}

export function SuiteSearchDropdown({
  suites,
  selectedSuiteId,
  onSelectSuite,
  onAddNewSuite,
  onClose,
  className = '',
  placeholder = 'Search',
  placement = PLACEMENT.DOWN,
  validationError,
  onClearValidationError,
}: SuiteSearchDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddMode, setIsAddMode] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Normalize inputs
  const normalizedSuites: SuiteOption[] = Array.isArray(suites)
    ? suites.filter((suite) => suite && suite.id && suite.name)
    : [];

  const safeSearch = searchTerm.toLowerCase().trim();

  // Filter suites based on search term (guard against missing names)
  const filteredSuites = normalizedSuites.filter((suite) => {
    const name = (suite?.name ?? '').toLowerCase();
    if (!safeSearch) return true;
    return name.includes(safeSearch);
  });

  // Dropdown or up
  const dropdownPositionClasses =
    placement === PLACEMENT.UP ? 'bottom-full mb-1' : 'top-full mt-1';

  // Check if search term matches a new suite name (not in existing suites)
  const canAddNewSuite =
    safeSearch !== '' &&
    !normalizedSuites.some(
      (suite) => (suite?.name ?? '').toLowerCase() === safeSearch
    );

  const handleAddNewSuite = () => {
    const trimmedName = searchTerm.trim();
    if (trimmedName && canAddNewSuite) {
      onAddNewSuite(trimmedName);
      setSearchTerm('');
      setIsAddMode(false);
      setIsOpen(false);
    }
  };

  const handleSelectSuite = (suite: SuiteOption) => {
    onSelectSuite(suite.id, suite.name);
    setIsOpen(false);
    setSearchTerm('');
    setIsAddMode(false);
  };

  const handleAddButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAddMode(true);
    setIsOpen(true);
  };

  // Clear validation error when user types
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (validationError && onClearValidationError) {
      onClearValidationError();
    }
    setIsOpen(true);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setIsAddMode(false);
        setSearchTerm('');
        // Notify parent to replace with button
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Main Display/Input Area with Add Button */}
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-md shadow-sm">
        <div className="relative flex-1">
          {isAddMode ? (
            <>
              <input
                type="text"
                placeholder="Type the New Test Suite here"
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setIsOpen(true)}
                className="w-full pl-3 pr-3 py-2 text-sm border-0 focus:outline-none rounded-md"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  } else if (e.key === 'Escape') {
                    setIsAddMode(false);
                    setSearchTerm('');
                    setIsOpen(false);
                  }
                }}
              />
            </>
          ) : (
            <>
              <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder={placeholder}
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setIsOpen(true)}
                className="w-full pl-8 pr-3 py-2 text-sm border-0 focus:outline-none rounded-md"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setIsOpen(false);
                    setSearchTerm('');
                  }
                }}
              />
            </>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (isAddMode) {
              if (canAddNewSuite) handleAddNewSuite();
            } else {
              handleAddButtonClick(e);
            }
          }}
          className={`flex items-center justify-center w-9 h-9 rounded-r-md transition-colors ${
            isAddMode
              ? canAddNewSuite
                ? 'bg-green-100 hover:bg-green-300 text-green-500'
                : 'bg-gray-300 text-white cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
          title={
            isAddMode
              ? canAddNewSuite
                ? 'Confirm add'
                : 'Type a unique name to enable'
              : 'Add new suite'
          }
        >
          {isAddMode ? <CheckIcon className="w-5 h-5" /> : '+'}
        </button>
      </div>

      {/* Dropdown List */}
      {isOpen && (
        <div
          role="listbox"
          aria-expanded={isOpen}
          className={`absolute left-0 right-0 ${dropdownPositionClasses} bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto`}
        >
          {!isAddMode && filteredSuites.length > 0 ? (
            filteredSuites.map((suite) => (
              <div
                key={suite.id}
                role="option"
                aria-selected={selectedSuiteId === suite.id}
                onClick={() => handleSelectSuite(suite)}
                className={`px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center justify-between ${
                  selectedSuiteId === suite.id ? 'bg-blue-50' : ''
                }`}
              >
                <span className="text-sm text-gray-900">{suite.name}</span>
                {selectedSuiteId === suite.id && (
                  <CheckIcon className="w-5 h-5 text-green-600" />
                )}
              </div>
            ))
          ) : isAddMode ? (
            searchTerm.trim() && !canAddNewSuite ? (
              <div className="px-4 py-2 border-b border-gray-100 flex items-center gap-2 text-sm text-gray-700">
                <span>Suite already exists "{searchTerm.trim()}"</span>
              </div>
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">
                {searchTerm.trim()
                  ? 'Click check to create a new suite'
                  : 'Type a new suite name'}
              </div>
            )
          ) : searchTerm.trim() ? (
            <div className="px-4 py-2 text-sm text-gray-500">
              No suites found matching "{searchTerm}"
            </div>
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500">
              No suites available
            </div>
          )}
        </div>
      )}
    </div>
  );
}
