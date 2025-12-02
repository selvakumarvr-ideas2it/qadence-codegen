import React, { useEffect, useRef } from 'react';

type ScrollPanelProps = {
  children: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  height?: string;
  width?: string;
  tabIndex?: number;
  scrollAmount?: number; // pixels to scroll per key press
};

const ScrollPanel: React.FC<ScrollPanelProps> = ({
  children,
  header,
  className = '',
  contentClassName = '',
  width = '100%',
  height,
  tabIndex = 0,
  scrollAmount = 40,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: KeyboardEvent) => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    switch (e.key) {
      case 'ArrowDown':
        scrollEl.scrollBy({ top: scrollAmount, behavior: 'smooth' });
        break;
      case 'ArrowUp':
        scrollEl.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
        break;
      case 'ArrowRight':
        scrollEl.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        break;
      case 'ArrowLeft':
        scrollEl.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    scrollEl.addEventListener('keydown', handleKeyDown);
    return () => {
      scrollEl.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div
      className={`relative overflow-hidden h-screen pe-2 ${className}`}
      style={{ width, height }}
    >
      {header && <div className="px-4 py-2 border-b font-medium">{header}</div>}

      <div
        ref={scrollRef}
        className={`overflow-auto h-full w-full focus:outline-none ${contentClassName}`}
        tabIndex={tabIndex}
      >
        {children}
      </div>
    </div>
  );
};

export default ScrollPanel;
