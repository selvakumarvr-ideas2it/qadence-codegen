import type { IBugModalType } from '@/interfaces/Bug';
import { useState } from 'react';
import PrimaryButton from '../shared/buttons/PrimaryButton';
import SecondaryButton from '../shared/buttons/SecondaryButton';
import { Modal } from '../shared/modal/modal';
import ToggleSwitch from '../shared/toggle-switch/ToggleSwitch';

interface IBugStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalType: IBugModalType;
  onSubmit: (message: string, createTicket: boolean) => Promise<void>;
}

export const BugStatusModal = ({
  isOpen,
  onClose,
  modalType,
  onSubmit,
}: IBugStatusModalProps) => {
  const [bugMessage, setBugMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createTicket, setCreateTicket] = useState(false);

  const isMarkingAsBug = modalType === 'MARK_AS_BUG';
  const title = isMarkingAsBug ? 'Mark as Bug' : 'Mark as Not a Bug';
  const placeholder = isMarkingAsBug
    ? 'Explain why this is a bug...'
    : 'Explain why this is not a bug...';
  const buttonText = isMarkingAsBug ? 'Mark as Bug' : 'Mark as Not a Bug';

  const handleSubmit = async () => {
    if (!bugMessage.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(bugMessage, createTicket);
      handleClose();
    } catch (error) {
      console.error('Failed to submit bug confirmation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setBugMessage('');
    setCreateTicket(false);
    setIsSubmitting(false);
    onClose();
  };

  const getButtonStyles = () => {
    const baseStyles = 'disabled:cursor-not-allowed';
    if (isMarkingAsBug) {
      return `${baseStyles} bg-red-500 hover:bg-red-600 disabled:bg-red-300`;
    }
    return `${baseStyles} bg-green-500 hover:bg-green-600 disabled:bg-green-300`;
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="text-lg font-semibold text-gray-900 mb-4">{title}</div>

      <div className="mb-4">
        <label
          htmlFor="bug-message"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Reason/Details *
        </label>
        <textarea
          id="bug-message"
          value={bugMessage}
          onChange={(e) => setBugMessage(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          rows={4}
          disabled={isSubmitting}
          aria-describedby="bug-message-help"
        />
        <p id="bug-message-help" className="text-sm text-gray-500 mt-1">
          Please provide a detailed explanation for your decision.
        </p>
        {modalType !== 'NOT_A_BUG' ? (
          <ToggleSwitch
            isChecked={createTicket}
            onToggle={(nextValue) => setCreateTicket(nextValue)}
            disabled={isSubmitting}
          />
        ) : null}
      </div>

      <div className="flex justify-end gap-3">
        <SecondaryButton
          onClick={handleClose}
          disabled={isSubmitting}
          className="border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 px-4 py-2"
        >
          Cancel
        </SecondaryButton>
        <PrimaryButton
          onClick={handleSubmit}
          disabled={!bugMessage.trim() || isSubmitting}
          className={`${getButtonStyles()} px-4 py-2`}
        >
          {isSubmitting ? 'Submitting...' : buttonText}
        </PrimaryButton>
      </div>
    </Modal>
  );
};
