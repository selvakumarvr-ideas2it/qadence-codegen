import DownChevronGray from '@/assets/icons/DownChevronGray.svg?react';
import { useAppContext } from '@/context/app/AppContext';
import { AppReducerActions } from '@/context/app/AppReducer';
import { transformToLabelValue } from '@/utils/util';
import { useEffect, useState } from 'react';
import Select, { type ISelectOption } from '../shared/select/Select';

// Code-level commands for Header function:
//
// 1. Define the Header functional component with props: userName, selectedApplication, onApplicationChange.
// 2. Use the useGetApplicationSummaryByTenant hook to fetch application dropdown data.
// 3. Prepare dropdownOptions from the fetched data, defaulting to an empty array if data is undefined.
// 4. Construct applicationOptions by prepending an "All Application" option if dropdownOptions is not empty.
// 5. Define handleApplicationChange to call onApplicationChange with the selected value or null.
// 6. Render a header element with a welcome message and a Select dropdown for applications.

export function Header() {
  const { state: appState, dispatch: appDispatch } = useAppContext();
  const { selectedApplication, applicationList } = appState;

  const userName = localStorage.getItem('user') || 'User';

  const [applicationOptions, setApplicationOptions] = useState<ISelectOption[]>(
    []
  );

  useEffect(() => {
    if (applicationList?.length) {
      setApplicationOptions(
        transformToLabelValue(applicationList, 'name', 'id')
      );
    }
  }, [applicationList]);

  const handleApplicationChange = (selectedOption?: ISelectOption | null) => {
    appDispatch({
      type: AppReducerActions.SET_SELECTED_APPLICATION,
      payload: selectedOption ?? null,
    });
  };

  return (
    <header className="bg-card pb-3">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">
          <span className="capitalize">Welcome, {userName}</span>
        </h1>
        <div className="flex items-start gap-2 text-sm">
          <div className="relative min-w-[220px]">
            <Select
              options={applicationOptions}
              value={selectedApplication}
              placeholder="Select a Application"
              onChange={handleApplicationChange}
              showSearch={false}
              allowClear={false}
              suffixIcon={(isOpen) => (
                <DownChevronGray
                  className={`w-3 h-3 text-gray-400 ${isOpen ? 'rotate-180' : ''}`}
                />
              )}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
