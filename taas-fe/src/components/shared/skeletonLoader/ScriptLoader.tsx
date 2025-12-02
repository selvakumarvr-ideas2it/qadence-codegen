import CheckIcon from '@/assets/icons/CheckIcon.svg?react';
import { createRoot, type Root } from 'react-dom/client';

let root: Root | null = null;
let container: HTMLDivElement | null = null;

interface CornerLoaderProps {
  title?: string;
  progress?: number; // 0-100
  mainText?: string;
  subtitle?: string;
  text?: string;
  onClick?: () => void;
  isCompleted?: boolean;
}

function CircularProgress({
  progress,
  isCompleted = false,
}: {
  progress: number;
  isCompleted?: boolean;
}) {
  const size = 50;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  // Show checkmark when completed
  if (isCompleted) {
    return (
      <div className="relative w-12 h-12">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
          <CheckIcon className="w-6 h-6 text-green-600" />
        </div>
      </div>
    );
  }

  return (
    <>
      {progress === 0 ? (
        <div className="inset-0 flex items-center justify-center">
          <div className="w-9 h-9 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="relative w-12 h-12">
          <svg width={size} height={size} className="-rotate-90">
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth={strokeWidth}
            />
            {/* Progress circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#2563eb"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.3s ease' }}
            />
          </svg>
          {/* Percentage text */}
          <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-blue-600">
            {Math.round(progress)}%
          </div>
        </div>
      )}
    </>
  );
}

function CornerLoader({
  title,
  progress,
  mainText,
  subtitle,
  text,
  onClick,
  isCompleted = false,
}: CornerLoaderProps) {
  // For backward compatibility, use text prop if provided
  const displayMainText = mainText || text || 'Processing...';
  const displaySubtitle = subtitle || 'Please wait...';
  const displayTitle = title || 'Processing';
  const displayProgress = progress ?? 0;

  return (
    <div className="fixed right-4 bottom-4 z-[9999]">
      <div
        className={`bg-white/95 border border-gray-200 rounded-xl px-4 py-2 shadow-lg min-w-[320px] ${
          isCompleted && onClick
            ? 'cursor-pointer hover:shadow-xl transition-shadow'
            : ''
        }`}
        onClick={isCompleted && onClick ? onClick : undefined}
      >
        {/* Title */}
        {displayTitle && (
          <div className="text-base font-bold text-gray-900 mb-1.5">
            {displayTitle}
          </div>
        )}

        {/* Content: Progress circle and text */}
        <div className="flex items-center gap-4">
          {/* Progress Circle */}
          <CircularProgress
            progress={displayProgress}
            isCompleted={isCompleted}
          />

          {/* Text content */}
          <div className="flex-1">
            <div className="text-sm font-semibold text-gray-900 mb-1">
              {displayMainText}
            </div>
            {/* Only show subtitle if not completed */}
            {!isCompleted && (
              <div className="font-normal text-blue-600 text-[13px]">
                {displaySubtitle}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function showCornerLoader(options?: string | CornerLoaderProps): void {
  // Support both old API (string) and new API (object)
  const props = typeof options === 'string' ? { text: options } : options || {};

  if (!container) {
    container = document.createElement('div');
    container.setAttribute('data-corner-loader', 'true');
    document.body.appendChild(container);
  }
  if (!root) {
    root = createRoot(container);
  }
  root.render(<CornerLoader {...props} />);
}

export function hideCornerLoader() {
  if (root) {
    root.unmount();
    root = null;
  }
  if (container) {
    container.remove();
    container = null;
  }
}
