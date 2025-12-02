import { cn } from '@/utils/util';
import type { ReactNode } from 'react';

export interface TabConfig<T extends string> {
  key: T;
  label: string;
  className?: string;
  disabled?: boolean;
  icon?: ReactNode;
}

interface TabViewProps<T extends string> {
  tabs: TabConfig<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  className?: string;
  disabledTabs?: T[];
  showCounts?: boolean;
  counts?: Record<T, number>;
  variant?: 'default' | 'with-icons' | 'bug-list';
}

const TabView = <T extends string>({
  tabs,
  activeTab,
  onTabChange,
  className = '',
  disabledTabs = [],
  showCounts = false,
  counts = {} as Record<T, number>,
  variant = 'default',
}: TabViewProps<T>) => {
  const isTabDisabled = (tabKey: T) => {
    return disabledTabs.includes(tabKey) || (counts && counts[tabKey] === 0);
  };

  const handleTabClick = (tabKey: T) => {
    if (!isTabDisabled(tabKey)) {
      onTabChange(tabKey);
    }
  };

  const renderTabContent = (tab: TabConfig<T>) => {
    if (variant === 'bug-list') {
      return (
        <div className="flex items-center gap-2">
          {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
          <span>
            {tab.label}
            {showCounts && counts[tab.key] !== undefined && (
              <span className="ml-1">({counts[tab.key]})</span>
            )}
          </span>
        </div>
      );
    }
    // Default and with-icons variants
    if (showCounts && counts[tab.key] !== undefined) {
      return `${counts[tab.key]} - ${tab.label}`;
    }
    return tab.label;
  };

  const getTabStyles = (isActive: boolean, isDisabled: boolean, customClassName?: string) => {
    if (variant === 'bug-list') {
      return cn(
        'flex-1 flex justify-center px-4 py-2 rounded-lg text-sm font-medium transition-colors relative',
        isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        isActive ? 'bg-white shadow-sm' : 'bg-gray-100 hover:bg-gray-200',
        customClassName
      );
    }

    // Default styles for other variants
    return cn(
      'flex-1 flex justify-center px-4 py-2 rounded-xl text-sm font-medium transition-colors',
      isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
      isActive ? 'bg-white shadow-sm' : '',
      customClassName
    );
  };

  const getContainerStyles = () => {
    if (variant === 'bug-list') {
      return cn(
        'w-full flex flex-row bg-gray-100 items-center p-1 rounded-lg',
        className
      );
    }

    return cn(
      'w-full flex flex-row bg-gray-100 items-center p-1 rounded-xl',
      className
    );
  };

  return (
    <div className={getContainerStyles()}>
      {tabs.map((tab) => {
        const isDisabled = isTabDisabled(tab.key);
        const isActive = activeTab === tab.key;

        return (
          <div
            key={tab.key}
            onClick={() => handleTabClick(tab.key)}
            className={getTabStyles(isActive, isDisabled, tab.className)}
          >
            {renderTabContent(tab)}
          </div>
        );
      })}
    </div>
  );
};

export default TabView;
