import CalendarIcon from '@/assets/icons/Calendar.svg?react';
import CheckIcon from '@/assets/icons/CheckIcon.svg?react';
import ClockIcon from '@/assets/icons/Clock.svg?react';
import ExclamationIcon from '@/assets/icons/Exclamation.svg?react';
import FailIcon from '@/assets/icons/Fail.svg?react';
import InfoCircleIcon from '@/assets/icons/InfoCircle.svg?react';
import LineChartIcon from '@/assets/icons/LineChart.svg?react';
import PlayIcon from '@/assets/icons/Play.svg?react';
import StepForwardIcon from '@/assets/icons/StepForward.svg?react';
import type { ITestRun } from '@/interfaces/Dashboard';
import { getBadgeStylesForRunType } from '@/utils/badgeStylesUtil';
import { formatDateTimestamp, formatTimeDuration } from '@/utils/dateUtils';
import { cn } from '@/utils/util';
import { Card } from '../shared/card/Card';

interface ILastRunCardProps {
  lastRunData: ITestRun | null;
  className?: string;
  isSelected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  lastRunType: 'Last Run' | 'Last End-to-End Run';
}
const LastRunCard = ({
  lastRunData,
  className = '',
  isSelected = false,
  onClick,
  disabled = false,
  lastRunType,
}: ILastRunCardProps) => {
  const handleCardClick = () => {
    if (onClick && !disabled) {
      onClick();
    }
  };

  const renderTitle = () => (
    <div className="w-[380px] flex items-center">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          {lastRunType === 'Last Run' ? (
            <PlayIcon className="w-6 h-6 text-blue-600" />
          ) : (
            <LineChartIcon className="w-6 h-6 text-blue-600" />
          )}
          <span className="font-bold text-gray-900 text-xl">{lastRunType}</span>
        </div>
        {lastRunData?.startedAt && (
          <div className="flex items-center gap-1 text-xs text-gray-400 leading-tight">
            <CalendarIcon className="w-3 h-3" />
            <span className="text-gray-600 text-sm">
              {lastRunData?.startedAt
                ? formatDateTimestamp(lastRunData?.startedAt)
                : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  const renderTestResult = (lastRunInfo: ITestRun) => {
    const {
      totalTests,
      skippedTests,
      passedTests,
      failedTests,
      flakyTests,
      durationSeconds,
    } = lastRunInfo;

    const testResult = [
      {
        label: 'Test cases executed',
        value: `${totalTests - skippedTests} / ${totalTests}`,
        icon: null,
        valueStyle: 'font-bold text-gray-900',
      },
      {
        label: 'Passed',
        value: passedTests,
        icon: <CheckIcon className="w-5 h-5" />,
        valueStyle: 'text-green-700',
      },
      {
        label: 'Flaky',
        value: flakyTests,
        icon: <ExclamationIcon className="w-5 h-5" />,
        valueStyle: 'text-golden-600',
      },
      {
        label: 'Failed',
        value: failedTests,
        icon: <FailIcon className="w-5 h-5" />,
        valueStyle: 'text-red-700',
      },
      {
        label: 'Skipped',
        value: skippedTests,
        icon: <StepForwardIcon className="w-5 h-5" />,
        valueStyle: 'text-charcoal-600',
      },
      {
        label: 'Duration',
        value: formatTimeDuration(durationSeconds),
        icon: <ClockIcon className="w-5 h-5" />,
        valueStyle: 'text-purple-700 w-[112px]',
      },
    ];

    return (
      <div className="flex items-center justify-between w-full">
        {testResult.map((result) => (
          <div className="flex flex-col items-center" key={result.label}>
            <div className={`flex items-center gap-1.5 ${result.valueStyle}`}>
              {result.icon && <>{result.icon}</>}
              <div className="font-semibold text-xl">{result.value}</div>
            </div>
            <div className="text-sm text-gray-400">{result.label}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderLastRunTag = (lastRunInfo: ITestRun) => {
    return (
      <div className="flex justify-end w-[230px]">
        <div className="flex gap-2">
          {lastRunInfo.runType === 'FULL' && (
            <span
              className={cn(
                `text-xs my-auto ${getBadgeStylesForRunType(lastRunInfo.runType)}`
              )}
            >
              {lastRunInfo.runType.toLowerCase()}
            </span>
          )}
          <span className="group relative flex items-center justify-center w-7 h-7 cursor-pointer">
            <InfoCircleIcon className="w-4 h-4" />
            <span className="absolute  mt-16 w-60 bg-white text-black text-xs rounded px-3 py-1 shadow-md transition-opacity duration-200 opacity-0 group-hover:opacity-100 pointer-events-none mr-48">
              {lastRunInfo.runName}
            </span>
          </span>
        </div>
      </div>
    );
  };

  return (
    <Card
      isSelected={isSelected}
      onSelect={handleCardClick}
      disabled={disabled}
      header=""
      className={cn(
        'border-l-4 border-l-blue-600 items-baseline justify-between',
        className
      )}
    >
      <div className="flex items-start gap-2">
        {renderTitle()}
        {lastRunData ? (
          <>
            {lastRunData && renderTestResult(lastRunData)}
            {lastRunData && renderLastRunTag(lastRunData)}
          </>
        ) : (
          <div className="w-full flex justify-center">
            {'No data available'}
          </div>
        )}
      </div>
    </Card>
  );
};

export default LastRunCard;
