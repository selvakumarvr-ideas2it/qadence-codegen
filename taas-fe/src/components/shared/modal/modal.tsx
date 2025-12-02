import React from 'react';

interface IModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  isCloseButtonEnabled?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  children,
  className = 'w-full max-w-md mx-4',
  isCloseButtonEnabled,
}: IModalProps) {
  return (
    <>
      {!isOpen ? null : (
        <div
          tabIndex={-1}
          className="fixed inset-0 flex items-center justify-center backdrop-brightness-50 z-10"
          onClick={onClose}
        >
          <div
            className={`bg-white rounded-lg shadow-xl p-6 relative ${className}`}
            onClick={(e) => e.stopPropagation()}
          >
            {isCloseButtonEnabled && (
              <button
                onClick={onClose}
                className="absolute top-1 right-2 text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            )}
            {children}
          </div>
        </div>
      )}
    </>
  );
}
