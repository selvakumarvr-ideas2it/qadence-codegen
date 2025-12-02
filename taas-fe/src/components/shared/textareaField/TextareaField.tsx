interface ITextareaFieldProps {
  label: string;
  name: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  error?: string;
  rows?: number;
  className?: string;
}

const TextareaField = ({
  label,
  name,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  rows = 3,
  className,
  ...props
}: ITextareaFieldProps) => {
  return (
    <div className="flex flex-col gap-2 mt-2">
      <label htmlFor={name} className="text-sm font-medium text-gray-900">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        rows={rows}
        autoComplete="off"
        {...props}
        className={`px-4 py-1.5 rounded-lg border text-sm ${
          error ? 'border-red-500' : 'border-gray-200'
        } focus:outline-none focus:ring-2 ${
          error ? 'focus:ring-red-400' : 'focus:ring-blue-500'
        } ${className || ''}`}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default TextareaField;
