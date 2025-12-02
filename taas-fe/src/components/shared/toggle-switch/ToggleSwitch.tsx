import CreateTicketBlue from '@/assets/icons/CreateTicketBlue.svg?react';
import { useId, type ChangeEvent, type KeyboardEvent } from 'react';

interface ToggleSwitchProps {
  isChecked: boolean;
  onToggle: (nextValue: boolean) => void;
  disabled?: boolean;
  label?: string;
}

const ToggleSwitch = ({
  isChecked,
  onToggle,
  disabled = false,
  label = 'Create a Ticket',
}: ToggleSwitchProps) => {
  const toggleId = useId();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    onToggle(event.target.checked);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLLabelElement>) => {
    if (disabled) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onToggle(!isChecked);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-3">
      <CreateTicketBlue className="w-5 h-5 my-auto" />
      <p className="text-sm text-gray-700">{label}</p>
      <label
        htmlFor={toggleId}
        className="flex items-center cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        role="switch"
        aria-checked={isChecked}
        aria-disabled={disabled}
        aria-label={label}
      >
        <div className="relative">
          <input
            type="checkbox"
            id={toggleId}
            className="sr-only peer"
            checked={isChecked}
            onChange={handleChange}
            disabled={disabled}
          />
          <div className="block h-5 w-9 rounded-full bg-gray-300 transition-colors duration-300 peer-checked:bg-blue-600 peer-disabled:bg-gray-200" />
          <div className="absolute left-1 top-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-300 peer-checked:translate-x-3 peer-disabled:bg-gray-100" />
        </div>
      </label>
    </div>
  );
};

export default ToggleSwitch;
