import SearchIcon from '@/assets/icons/SearchIcon.svg?react';

export const SearchInput = ({
  value,
  onChange,
  onSubmit,
  onFocus,
  className,
  placeholder,
  showLeftIcon,
  showRightIcon,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onFocus: () => void;
  className?: string;
  placeholder?: string;
  showLeftIcon?: boolean;
  showRightIcon?: boolean;
}) => (
  <form onSubmit={onSubmit} className={`relative`}>
    {(showLeftIcon ?? false) && (
      <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
        <SearchIcon className="w-4 h-4" />
      </span>
    )}
    <input
      type="text"
      placeholder={placeholder || 'Search'}
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      className={`${(showLeftIcon ?? false) ? 'pl-8' : 'pl-3'} py-1 border border-gray-200 focus:border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-40 placeholder:text-sm ${className || ''}`}
    />
    {(showRightIcon ?? true) && (
      <button
        type="submit"
        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        <SearchIcon className="w-4 h-4" />
      </button>
    )}
  </form>
);
