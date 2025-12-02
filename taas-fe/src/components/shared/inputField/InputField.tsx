import EyeCloseIcon from '@/assets/icons/EyeCloseIcon.svg?react';
import EyeIcon from '@/assets/icons/EyeIcon.svg?react';
import React, { useState, type InputHTMLAttributes } from 'react';

interface IInputFieldProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'name' | 'value' | 'onChange' | 'onBlur' | 'type'
  > {
  label: React.ReactNode;
  name: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  className?: string;
  togglePassword?: boolean;
  disabled?: boolean;
}

const InputField = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  className,
  togglePassword = false,
  type = 'text',
  placeholder,
  disabled,
  ...props
}: IInputFieldProps) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const isPassword = type === 'password';
  const effectiveType =
    isPassword && togglePassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="flex flex-col gap-1 mt-2">
      <label
        htmlFor={name}
        className={`text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-900'}`}
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete="off"
          type={effectiveType}
          disabled={disabled}
          {...props}
          className={`px-4 py-1.5 rounded-lg border w-full h-9 text-sm ${
            error ? 'border-red-500' : 'border-gray-200'
          } focus:outline-none focus:ring-2 ${
            error ? 'focus:ring-red-400' : 'focus:ring-blue-500'
          } ${togglePassword && isPassword ? 'pr-10' : ''} ${disabled ? 'cursor-not-allowed' : ''} ${className || ''}`}
        />
        {togglePassword && isPassword && (
          <button
            type="button"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword((s) => !s)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
          >
            {showPassword ? (
              <EyeCloseIcon className="w-4 h-4" />
            ) : (
              <EyeIcon className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default InputField;
