import CheckIcon from '@/assets/icons/CheckIcon.svg?react';
import Clock from '@/assets/icons/Clock.svg?react';
import DownChevronGray from '@/assets/icons/DownChevronGray.svg?react';
import downloadIcon from '@/assets/icons/DownloadIcon.svg';
import ExclamationIcon from '@/assets/icons/Exclamation.svg?react';
import FailIcon from '@/assets/icons/Fail.svg?react';
import RunHistoryIcon from '@/assets/icons/RunHistoryIcon.svg';
import Spinner from '@/assets/icons/Spinner.svg?react';
import TimerIcon from '@/assets/icons/TimerIcon.svg?react';
import { RunStatus } from '@/constants/appConstant';
import { useAppContext } from '@/context/app/AppContext';
import { AppReducerActions } from '@/context/app/AppReducer';
import type {
  IApplicationSummaryByTenant,
  IRunHistory,
  ISelectedRunDetails,
} from '@/interfaces/Dashboard';
import { getBadgeStylesForStatus } from '@/utils/badgeStylesUtil';
import { formatDateTimestamp, formatTimeDuration } from '@/utils/dateUtils';
import { cn, transformToLabelValue } from '@/utils/util';
import { useMemo } from 'react';
import { IconButton } from '../shared/buttons/IconButton';
import { Card } from '../shared/card/Card';
import CustomDashedBorderTextCard from '../shared/customDashedBorderTextCard/CustomDashedBorderTextCard';
import ScrollPanel from '../shared/scrollPanel/ScrollPanel';
import Select, { type ISelectOption } from '../shared/select/Select';
import SkeletonLoader from '../shared/skeletonLoader/SkeletonLoader';

interface IRunHistoryCardListProps {
  applicationOptions: IApplicationSummaryByTenant[];
  onSelectApplication: (id: string) => void;
  runHistoryApplicationList?: IRunHistory[];
  isRunHistoryApplicationLoading: boolean;
  selectedRunDetails: ISelectedRunDetails | null;
}

export default function RunHistoryCardList({
  applicationOptions = [],
  runHistoryApplicationList = [],
  isRunHistoryApplicationLoading,
  onSelectApplication,
  selectedRunDetails,
}: IRunHistoryCardListProps) {
  const { state: appState, dispatch: appDispatch } = useAppContext();
  const { selectedApplication } = appState;
  // Handler for when the application is changed in the Select dropdown
  const handleApplicationChange = (value?: ISelectOption | null) => {
    appDispatch({
      type: AppReducerActions.SET_SELECTED_APPLICATION,
      payload: value ?? null,
    });
  };

  // Filter the run history based on the selected application
  const filteredRunHistory = useMemo(() => {
    const list = Array.isArray(runHistoryApplicationList)
      ? runHistoryApplicationList
      : [];

    return selectedApplication
      ? list.filter((run) => run.applicationId === selectedApplication.value)
      : list;
  }, [selectedApplication, runHistoryApplicationList]);

  // Calculate the count of test runs based on their status
  const testRunStatistics = useMemo(() => {
    const counts = filteredRunHistory.reduce(
      (acc, run) => {
        switch (run.status) {
          case RunStatus.COMPLETED:
            acc.passed += 1;
            break;
          case RunStatus.FAILED:
            acc.failed += 1;
            break;
          case RunStatus.ABORTED:
            acc.partial += 1;
            break;
        }
        return acc;
      },
      { passed: 0, failed: 0, partial: 0 }
    );

    return [
      {
        label: 'Total Runs',
        value: counts.failed + counts.partial + counts.passed,
        color: 'text-slate-950',
      },
      { label: 'Passed Runs', value: counts.passed, color: 'text-green-600' },
      { label: 'Failed Runs', value: counts.failed, color: 'text-red-600' },
      { label: 'Partial Runs', value: counts.partial, color: 'text-[#A28E0C]' },
    ];
  }, [filteredRunHistory]);

  return (
    <div className="flex-[1] bg-[#F9FAFB]">
      <section className="flex items-center justify-between p-4 pe-6 pb-3">
        <div className="flex items-center gap-3">
          <IconButton icon={RunHistoryIcon} alt="RunHistoryIcon" />
          <div className="font-bold text-xl">Run History</div>
        </div>

        <div className="flex items-center gap-3">
          <IconButton icon={downloadIcon} alt="downloadIcon" />
          <div className="relative text-xs min-w-[145px]">
            <Select
              options={transformToLabelValue(applicationOptions, 'name', 'id')}
              value={selectedApplication}
              placeholder="Select an Application"
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
      </section>
      <section className="flex items-center justify-around px-4 pe-5 py-1 gap-2">
        {testRunStatistics.map(({ label, value, color }) => (
          <div
            key={label}
            className="border border-gray-300 rounded-lg flex flex-col items-center justify-center p-3 bg-white shadow-md w-full text-nowrap"
          >
            <p className={`${color}`}>{value}</p>
            <p className={`text-xs ${color}`}>{label}</p>
          </div>
        ))}
      </section>
      <section className="flex flex-col h-[calc(100vh-149px)] overflow-hidden pt-3 px-1">
        <ScrollPanel header={false}>
          {isRunHistoryApplicationLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <Card key={index} className="m-3 me-2 mt-0 px-3 py-2">
                <SkeletonLoader
                  height="100px"
                  width="100%"
                  borderRadius="12px"
                  className="w-full"
                />
              </Card>
            ))
          ) : filteredRunHistory.length ? (
            filteredRunHistory.map((run) => (
              <Card
                key={run.id}
                isSelected={selectedRunDetails?.id === run.id}
                onSelect={() => onSelectApplication(run.id)}
                className={cn('m-3 me-2 mt-0 px-3 py-2')}
              >
                <div className="flex items-center justify-between leading-loose">
                  <p
                    className={
                      run.status === RunStatus.IN_PROGRESS
                        ? 'text-blue-700 text-xs'
                        : 'text-xs'
                    }
                  >
                    {selectedApplication?.label}
                  </p>
                  <p
                    className={`text-xs ${getBadgeStylesForStatus(run.status)}`}
                  >
                    {run.status.toLowerCase()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className={
                      run.status === RunStatus.IN_PROGRESS
                        ? ' font-semibold text-blue-700'
                        : 'font-semibold py-2'
                    }
                  >
                    {run.runCode}-{run.runName}
                  </div>
                  {run.status === RunStatus.IN_PROGRESS && (
                    <div>{<Spinner className="h-4 w-4" />}</div>
                  )}
                </div>
                {run.status !== RunStatus.IN_PROGRESS && (
                  <div className="flex items-center justify-start gap-4 leading-loose">
                    {[
                      {
                        icon: <CheckIcon className="h-4 w-4" />,
                        value: run.passedTests,
                        color: 'text-green-600',
                        key: 'passed',
                      },
                      {
                        icon: <ExclamationIcon className="h-4 w-4" />,
                        value: run.flakyTests,
                        color: 'text-golden-600',
                        key: 'flaky',
                      },
                      {
                        icon: <FailIcon className="h-4 w-4" />,
                        value: run.failedTests,
                        color: 'text-red-600',
                        key: 'failed',
                      },
                      {
                        icon: <Clock className="h-4 w-4" />,
                        value: run.skippedTests,
                        color: 'text-charcoal-600',
                        key: 'skipped',
                      },
                    ].map(({ icon, value, color, key }) => (
                      <div
                        key={key}
                        className={`flex items-center justify-center gap-1 text-lg ${color}`}
                      >
                        {icon}
                        <span className="text-base">{value}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <div className="text-sm text-gray-600 leading-loose">
                    {formatDateTimestamp(run.startedAt)}
                  </div>
                  {run.status !== RunStatus.IN_PROGRESS && (
                    <div className="flex items-center justify-center gap-1 text-purple-600">
                      <TimerIcon className="h-4 w-4" />
                      <span className="text-sm">
                        {formatTimeDuration(run.durationSeconds)}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <CustomDashedBorderTextCard className="h-1/2 px-4 flex items-center justify-center">
              <p>No runs found</p>
            </CustomDashedBorderTextCard>
          )}
        </ScrollPanel>
      </section>
    </div>
  );
}
