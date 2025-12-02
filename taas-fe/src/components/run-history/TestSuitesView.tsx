import CheckIcon from '@/assets/icons/CheckIcon.svg?react';
import ChromeIcon from '@/assets/icons/Chrome.svg?react';
import ClockIcon from '@/assets/icons/Clock.svg?react';
import ExclamationIcon from '@/assets/icons/Exclamation.svg?react';
import FailIcon from '@/assets/icons/Fail.svg?react';
import InfoCircleIcon from '@/assets/icons/InfoCircle.svg?react';
import ScreenshotIcon from '@/assets/icons/Screenshot.svg?react';
import TimerIcon from '@/assets/icons/TimerIcon.svg?react';
import { TestCaseStatus } from '@/constants/appConstant';
import useGetRunHistoryTestSuiteByTestRun from '@/hooks/useGetRunHistoryTestSuiteByTestRun';
import type { ISelectedRunDetails } from '@/interfaces/Dashboard';
import type { ITestCases, ITestSuitesResult } from '@/interfaces/RunHistory';
import { getBadgeStylesForStatus } from '@/utils/badgeStylesUtil';
import { formatDateTimestamp, formatTimeDuration } from '@/utils/dateUtils';
import { cn } from '@/utils/util';
import { useMemo, useState } from 'react';
import Accordion from '../shared/accordion/Accordion';
import { Card } from '../shared/card/Card';
import TextCollapse from '../shared/expandableText/TextCollapse';
import ScrollPanel from '../shared/scrollPanel/ScrollPanel';
import TabView, { type TabConfig } from '../shared/tab/TabView';

interface ITestSuiteHeaderViewProps {
  selectedRunDetails: ISelectedRunDetails | null;
  browser: string;
}

interface ITestSuitesViewProps {
  selectedRunDetails: ISelectedRunDetails | null;
  selectedTestCase: ITestCases | null;
  setSelectedTestCase: (testCase: ITestCases | null) => void;
}

type TestStatus = 'ALL' | 'PASSED' | 'FAILED' | 'SKIPPED' | 'FLAKY';

const tabConfig: TabConfig<TestStatus>[] = [
  { key: 'ALL', label: 'All Test', className: '' },
  { key: 'PASSED', label: 'Passed', className: 'text-green-600' },
  { key: 'FLAKY', label: 'Flaky', className: 'text-golden-600' },
  { key: 'FAILED', label: 'Failed', className: 'text-red-600' },
  { key: 'SKIPPED', label: 'Skipped', className: 'text-charcoal-600' },
];

function TestSuiteHeaderView({
  selectedRunDetails,
  browser,
}: ITestSuiteHeaderViewProps) {
  return (
    <>
      <div className="flex flex-row justify-between">
        <div className="flex items-center flex-row gap-2">
          <div className="font-light text-sm">
            {selectedRunDetails
              ? formatDateTimestamp(selectedRunDetails.startedAt)
              : ''}
          </div>
          <div className="flex items-center justify-center gap-1 text-purple-600">
            <TimerIcon className="w-4 h-4" />
            <span className="">
              {selectedRunDetails
                ? formatTimeDuration(selectedRunDetails.durationSeconds)
                : ''}
            </span>
          </div>
        </div>
        <div
          className={`text-xs my-auto ${getBadgeStylesForStatus(selectedRunDetails?.status || '')}`}
        >
          {selectedRunDetails?.status.toLowerCase()}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="font-semibold text-2xl">
          {selectedRunDetails?.runCode}-{selectedRunDetails?.runName}
        </div>
        <div className="flex flex-row gap-4">
          <div className="flex items-center justify-center gap-2">
            <ChromeIcon className="w-3.5 h-3.5" />
            <span className="font-base text-sm truncate">{browser}</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <InfoCircleIcon className="w-3.5 h-3.5" />
            <span className="font-base text-sm">Purpose</span>
          </div>
        </div>
      </div>
      <div>{selectedRunDetails?.applicationName}</div>
    </>
  );
}

export function TestSuitesView({
  selectedRunDetails,
  setSelectedTestCase,
}: ITestSuitesViewProps) {
  const { data: testSuites = [] } = useGetRunHistoryTestSuiteByTestRun(
    selectedRunDetails?.applicationId ?? '',
    selectedRunDetails?.id ?? ''
  );
  const [activeTab, setActiveTab] = useState<TestStatus>('ALL');

  const testSuiteCounts = useMemo(() => {
    if (!selectedRunDetails) {
      return { ALL: 0, PASSED: 0, FAILED: 0, SKIPPED: 0, FLAKY: 0 };
    }

    return {
      ALL: selectedRunDetails.totalTests,
      PASSED: selectedRunDetails.passedTests,
      FAILED: selectedRunDetails.failedTests,
      SKIPPED: selectedRunDetails.skippedTests,
      FLAKY: selectedRunDetails.flakyTests,
    };
  }, [selectedRunDetails]);

  const filteredTestSuites = useMemo(() => {
    return testSuites
      .map((suite) => {
        const filteredSuite = {
          ...suite,
          testCases:
            suite?.testCases?.filter((testCase) =>
              activeTab === 'ALL' ? true : testCase.status === activeTab
            ) || [],
        };
        return filteredSuite.testCases.length > 0 ? filteredSuite : null;
      })
      .filter((suite): suite is ITestSuitesResult => suite !== null);
  }, [testSuites, activeTab]);
  const handleTestCaseClick = (testCaseId: string) => {
    const found = testSuites
      .flatMap((suite) =>
        suite.testCases.map((tc) => ({
          ...tc,
          suiteName: suite.name,
          browser: suite.browser,
        }))
      )
      .find((tc) => tc.id === testCaseId);
    setSelectedTestCase(found || null);
  };

  return (
    <>
      <section className="flex flex-col gap-1">
        <TestSuiteHeaderView
          selectedRunDetails={selectedRunDetails}
          browser={filteredTestSuites?.[0]?.browser}
        />
      </section>
      <section className="w-full">
        <TabView<TestStatus>
          tabs={tabConfig}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          showCounts={true}
          counts={testSuiteCounts}
          disabledTabs={
            Object.keys(testSuiteCounts).filter(
              (key) => testSuiteCounts[key as TestStatus] === 0
            ) as TestStatus[]
          }
        />
      </section>
      {/* className="overflow-auto flex flex-col gap-4 p-2" */}
      <ScrollPanel header={false} className={cn('!pe-0')}>
        <section className="overflow-auto flex flex-col pe-2">
          {filteredTestSuites.map((suite: ITestSuitesResult) => (
            <Accordion
              key={suite.id}
              header={<div className="text-lg font-medium">{suite.name}</div>}
              body={
                <div className="flex flex-col gap-4">
                  {suite.testCases.map((testCase: ITestCases) => (
                    <div
                      key={testCase.id}
                      onClick={() =>
                        testCase.status !== TestCaseStatus.SKIPPED &&
                        handleTestCaseClick(testCase.id)
                      }
                    >
                      <Card
                        className={cn(
                          'p-4 border border-gray-200 rounded hover:shadow-sm transition-shadow',
                          testCase.status === TestCaseStatus.SKIPPED
                            ? 'cursor-not-allowed'
                            : 'cursor-pointer'
                        )}
                      >
                        <div className="flex items-baseline gap-2">
                          <div className="flex items-center gap-2">
                            {testCase.status === TestCaseStatus.PASSED ? (
                              <CheckIcon className="w-5 h-5 text-green-700 relative top-1" />
                            ) : testCase.status === TestCaseStatus.FAILED ? (
                              <FailIcon className="w-5 h-5 text-red-700 relative top-1" />
                            ) : testCase.status === TestCaseStatus.SKIPPED ? (
                              <ClockIcon className="w-5 h-5 text-charcoal-600 relative top-1" />
                            ) : (
                              <ExclamationIcon className="w-5 h-5 text-golden-600 relative top-1" />
                            )}
                          </div>
                          <div className="flex flex-col gap-2 w-full">
                            <div className="flex flex-col items-start gap-2">
                              <div className="flex flex-row items-baseline justify-between w-full">
                                <div className="font-medium text-gray-900">
                                  {testCase.name}
                                </div>
                                <div
                                  className={cn(
                                    'text-xs',
                                    getBadgeStylesForStatus(testCase.status)
                                  )}
                                >
                                  {testCase.status.toLowerCase()}
                                </div>
                              </div>
                              <div className="flex flex-row items-center justify-between gap-4">
                                <div className="flex flex-row items-center gap-1 font-base text-sm text-gray-700">
                                  <TimerIcon className="w-4 h-4" />
                                  <span>
                                    {formatTimeDuration(
                                      testCase.durationSeconds
                                    )}
                                  </span>
                                </div>
                                {testCase.screenshotUrl && (
                                  <div className="flex flex-row items-center justify-between gap-1 font-base text-sm text-gray-700">
                                    <ScreenshotIcon className="w-4 h-4" />
                                    <span>screenshot available</span>
                                  </div>
                                )}
                              </div>
                              {testCase.errorMessage &&
                                testCase.status === TestCaseStatus.FAILED && (
                                  <div className="flex flex-row items-start gap-2 p-3 pb-0 bg-red-50 rounded-lg text-sm border border-red-200 font-medium text-red-700 w-full break-words">
                                    <ExclamationIcon className="w-5 h-5 mb-auto mt-4 flex-shrink-0" />
                                    <TextCollapse
                                      message={testCase.errorMessage}
                                      containerClassName="min-w-0 flex-1 border-none"
                                    />
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              }
            />
          ))}
        </section>
      </ScrollPanel>
    </>
  );
}
