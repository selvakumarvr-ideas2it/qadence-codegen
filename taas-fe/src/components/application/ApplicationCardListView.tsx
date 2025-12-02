import ApplicationIcon from '@/assets/icons/ApplicationIcon.svg';
import PlayIcon from '@/assets/icons/Play.svg?react';
import TestTubeIcon from '@/assets/icons/TestTubeIcon.svg?react';
import vectorIcon from '@/assets/icons/VectorIcon.svg';
import type { IApplicationsListResult } from '@/interfaces/Application';
import { cn } from '@/utils/util';
import { useEffect, useMemo, useState } from 'react';
import { IconButton } from '../shared/buttons/IconButton';
import { Card } from '../shared/card/Card';
import CustomDashedBorderTextCard from '../shared/customDashedBorderTextCard/CustomDashedBorderTextCard';
import ScrollPanel from '../shared/scrollPanel/ScrollPanel';
import type { ISelectOption } from '../shared/select/Select';
import SkeletonLoader from '../shared/skeletonLoader/SkeletonLoader';
import { SearchDropdown } from './SearchDropdown';
import { SearchInput } from './SearchInput';
export interface IApplicationCardListViewProps {
  applicationList: IApplicationsListResult[];
  isLoading?: boolean;
  onSelectionChange?: (selectedId: string | null) => void;
}

export function ApplicationCardListView({
  applicationList,
  isLoading = false,
  onSelectionChange,
}: IApplicationCardListViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [displayedApplications, setDisplayedApplications] = useState<
    IApplicationsListResult[]
  >([]);

  // Initialize displayed applications when applicationList changes
  useEffect(() => {
    if (applicationList && applicationList.length > 0) {
      setDisplayedApplications(applicationList);
      // Auto-select the first application if none is selected
      if (selectedId === null && applicationList.length > 0) {
        const appId = applicationList[0].id;
        setSelectedId(appId);
        // Call the callback to pass the selectedId to parent
        onSelectionChange?.(appId);
      }
    }
  }, [applicationList, selectedId, onSelectionChange]);

  // Filter applications by name as user types
  const filteredOptions = useMemo(() => {
    if (!applicationList?.length) return [];
    const searchLower = searchTerm.toLowerCase();
    return applicationList.filter((app: IApplicationsListResult) =>
      app.appName.toString().toLowerCase().includes(searchLower)
    );
  }, [applicationList, searchTerm]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsDropdownOpen(true);
    if (value === '') {
      setDisplayedApplications(applicationList); // Show all if cleared
    } else {
      // Filter by name (case-insensitive)
      setDisplayedApplications(
        applicationList.filter((app) =>
          app.appName.toLowerCase().includes(value.toLowerCase())
        )
      );
    }
  };

  // Handle selecting an application from dropdown
  const handleApplicationSelect = (application: ISelectOption) => {
    setSearchTerm(application.label);
    setIsDropdownOpen(false);
    setDisplayedApplications(
      applicationList.filter((app) => app.appName === application.label)
    );
    const newSelectedId = String(application.value);
    setSelectedId(newSelectedId);
    // Call the callback to pass the selectedId to parent
    onSelectionChange?.(newSelectedId);
  };

  // Handle search submit (enter key)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filteredOptions.length > 0) {
      handleApplicationSelect({
        label: filteredOptions[0].appName,
        value: filteredOptions[0].id,
      });
    }
  };

  // Handle clearing search
  const handleClearSearch = () => {
    setSearchTerm('');
    setIsDropdownOpen(false);
    setDisplayedApplications(applicationList);
  };

  // Render scroll panel content
  const renderApplicationTestSuites = useMemo(() => {
    return displayedApplications.map((app: IApplicationsListResult) => {
      const applicationStats = [
        {
          Label: 'Test Suites',
          Value: app.totalTestSuites.toString(),
          icon: <TestTubeIcon className="w-3.5 h-3.5 text-gray-600" />,
        },
        {
          Label: 'Test Cases',
          Value: app.totalTestCases.toString(),
          icon: <TestTubeIcon className="w-3.5 h-3.5 text-gray-600" />,
        },
        {
          Label: 'Total Runs',
          Value: app.totalTestRuns.toString(),
          icon: <PlayIcon className="w-3.5 h-3.5 text-gray-600" />,
        },
      ];

      return (
        <Card
          key={app.id}
          isSelected={selectedId === app.id}
          onSelect={() => {
            setSelectedId(app.id);
            // Call the callback to pass the selectedId to parent
            onSelectionChange?.(app.id);
          }}
          className={cn('m-3 me-2 mt-0 px-3 py-2')}
        >
          <span
            className={`text-sm
            ${
              selectedId === app.id
                ? 'text-blue-500 font-semibold'
                : 'font-semibold'
            }
          `}
          >
            {app.appName}
          </span>
          <div className="text-gray-500 text-xs my-1">
            {app.appDescription || 'No description available'}
          </div>
          <div className="flex items-center justify-around gap-4">
            {applicationStats.map((stat) => (
              <div
                key={stat.Label}
                className="flex items-center justify-center gap-3"
              >
                {stat.icon}
                <div>
                  <p className="text-xs text-gray-500">{stat.Label}</p>
                  <p className="font-bold text-sm">{stat.Value}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      );
    });
  }, [displayedApplications, selectedId, onSelectionChange]);

  return (
    <div className="flex-[1] bg-[#F9FAFB] pt-2 h-screen">
      <section className="flex items-center justify-between p-4 pe-6 pb-2">
        <div className="flex items-center gap-3">
          <IconButton icon={ApplicationIcon} alt="ApplicationIcon" />
          <div className="font-bold text-lg">Applications</div>
        </div>

        <div className="flex items-center gap-3">
          <IconButton icon={vectorIcon} alt="vectorIcon" />
          <div className="relative">
            <SearchInput
              value={searchTerm}
              onChange={handleSearchChange}
              onSubmit={handleSearchSubmit}
              onFocus={() => setIsDropdownOpen(true)}
            />
            <SearchDropdown
              isOpen={isDropdownOpen && !!searchTerm}
              applicationList={filteredOptions.map((app) => ({
                label: app.appName,
                value: app.id,
              }))}
              onSelect={handleApplicationSelect}
            />
          </div>
        </div>
      </section>
      <section className="flex flex-col h-[calc(100vh-55px)] overflow-hidden pt-3 px-1">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <Card key={index} className="m-3 me-2 mt-0 px-3 py-2">
              <SkeletonLoader
                height="120px"
                width="100%"
                borderRadius="12px"
                className="w-full"
              />
            </Card>
          ))
        ) : displayedApplications.length ? (
          <ScrollPanel header={false}>
            {renderApplicationTestSuites}
          </ScrollPanel>
        ) : (
          <CustomDashedBorderTextCard
            className="py-4 px-4 flex items-center justify-center mt-7"
            children={
              <div className="text-sm">
                {searchTerm ? (
                  <button
                    onClick={handleClearSearch}
                    className="text-blue-500 hover:text-blue-700 underline cursor-pointer"
                  >
                    Clear search to see all applications
                  </button>
                ) : (
                  <p>No applications found</p>
                )}
              </div>
            }
          ></CustomDashedBorderTextCard>
        )}
      </section>
    </div>
  );
}
