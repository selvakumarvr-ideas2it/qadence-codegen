import CheckIcon from '@/assets/icons/CheckIcon.svg?react';
import Display from '@/assets/icons/Display.svg?react';
import Exclamation from '@/assets/icons/Exclamation.svg?react';
import FailIcon from '@/assets/icons/Fail.svg?react';
import InfoCircle from '@/assets/icons/InfoCircle.svg?react';
import LeftArrowIcon from '@/assets/icons/LeftArrow.svg?react';
import Refresh from '@/assets/icons/Refresh.svg?react';
import Screenshot from '@/assets/icons/Screenshot.svg?react';
import Video from '@/assets/icons/Video.svg?react';
import { BugStatus, TestCaseStatus } from '@/constants/appConstant';
import { useBugStatusMutation } from '@/hooks/mutation/useBugStatusMutation';
import useGetRunHistoryTestArtifactByTestCase from '@/hooks/useGetRunHistoryTestArtifactByTestCase';
import { useToast } from '@/hooks/useToast';
import type { IBugModalType } from '@/interfaces/Bug';
import type {
  ITestCaseArtifacts,
  ITestCases,
  ITestStep,
} from '@/interfaces/RunHistory';
import { getBadgeStylesForStatus } from '@/utils/badgeStylesUtil';
import { formatDateTimestamp, formatTimeDuration } from '@/utils/dateUtils';
import { cn } from '@/utils/util';
import { Dialog } from '@headlessui/react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BugStatusModal } from '../bugs/BugStatusModal';
import Accordion from '../shared/accordion/Accordion';
import SecondaryButton from '../shared/buttons/SecondaryButton';
import { Card } from '../shared/card/Card';
import TextCollapse from '../shared/expandableText/TextCollapse';
import ScrollPanel from '../shared/scrollPanel/ScrollPanel';
import { TestCaseSkeletonLoader } from '../shared/skeletonLoader/TestCaseSkeletonLoader';

interface ITestCaseViewProps {
  selectedTestCase: ITestCases;
  onBack: () => void;
  applicationName: string;
  testRunName: string;
}

interface ITestCaseData {
  errorMessage: string[];
  testSteps: ITestStep[];
  screenshots: ITestCaseArtifacts[];
  videos: ITestCaseArtifacts[];
}

interface IInfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  bgClass: string;
  textClass: string;
  width?: string; // Make width configurable
}

function InfoCard({
  icon,
  label,
  value,
  bgClass,
  textClass,
  width = 'w-48',
}: IInfoCardProps) {
  return (
    <div
      className={cn(
        'flex flex-row items-center gap-4 font-base text-sm rounded-lg p-3',
        bgClass,
        textClass,
        width
      )}
    >
      <div className="flex items-center justify-center">{icon}</div>
      <div className="flex flex-col gap-1">
        <span className="text-black text-sm">{label}</span>
        <span className={cn('font-bold text-md', textClass)}>{value}</span>
      </div>
    </div>
  );
}

const getStepIcon = (status: string) => {
  switch (status) {
    case 'PASSED':
      return <CheckIcon className="w-4 h-4 text-green-600" />;
    case 'FAILED':
      return <FailIcon className="w-4 h-4 text-red-600" />;
    case 'SKIPPED':
      return <Exclamation className="w-4 h-4 text-charcoal-600" />;
    case 'NOT-EXECUTED':
      return (
        <div className="w-4 h-4 font-bold flex items-center justify-center">
          -
        </div>
      );
    default:
      return null;
  }
};

export function TestCaseView({
  selectedTestCase,
  onBack,
  applicationName,
  testRunName,
}: ITestCaseViewProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [isScreenshotDialogOpen, setIsScreenshotDialogOpen] = useState(false);
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const [bugModalType, setBugModalType] =
    useState<IBugModalType>('MARK_AS_BUG');

  const {
    data: testCaseDetails,
    isLoading: isTestCaseLoading,
    refetch: refetchTestCases,
  } = useGetRunHistoryTestArtifactByTestCase(
    selectedTestCase?.applicationId ?? '',
    selectedTestCase?.testRunId ?? '',
    selectedTestCase?.testSuiteId ?? '',
    selectedTestCase?.id ?? ''
  );

  const { onBugStatus } = useBugStatusMutation({
    onSuccess: async (data) => {
      const url = data?.redirectUrl?.trim?.() ?? '';
      if (url) {
        window.location.assign(url);
        return;
      }

      await refetchTestCases();

      // Add toast message for successful bug marking
      toast.success('Test case marked as bug successfully!');

      setIsBugModalOpen(false);
      navigate('/run-history', { replace: true });
    },
  });

  const handleMarkAsBug = () => {
    setBugModalType('MARK_AS_BUG');
    setIsBugModalOpen(true);
  };

  type BugStatusPayload = Parameters<typeof onBugStatus>[0][number];
  const handleBugStatusSubmit = async (
    message: string,
    createTicket: boolean
  ) => {
    if (!testCaseDetails?.id) return;
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;
    const user_id = localStorage.getItem('user_id');
    const payload: BugStatusPayload = {
      id: null,
      applicationId: selectedTestCase.applicationId,
      applicationName,
      runCode: selectedTestCase.testRunId,
      testRunId: selectedTestCase.testRunId,
      testRunName,
      testSuiteId: selectedTestCase.testSuiteId,
      testCaseId: selectedTestCase.id,
      testCaseName: testCaseDetails.name ?? selectedTestCase.name,
      testCaseResultId: testCaseDetails?.testCaseResults?.[0]?.id || '',
      errorMessage:
        testCaseDetails?.testCaseResults?.[0]?.errorMessage ||
        selectedTestCase.errorMessage ||
        '',
      bugReason: trimmedMessage,
      bugStatus: BugStatus.MARKED_AS_BUG,
      confirmedBy: user_id || '',
      browser: selectedTestCase.browser,
      createTicket,
    };
    await onBugStatus([payload]);
  };

  // Memoize icon components to prevent unnecessary re-renders
  const infoCardIcons = useMemo(
    () => ({
      runTime: <InfoCircle className="w-4 h-4" />,
      retry: <Refresh className="w-4 h-4" />,
      browser: <Display className="w-4 h-4" />,
    }),
    []
  );

  // Memoize info cards data
  const infoCardsData = useMemo(
    () => [
      {
        icon: infoCardIcons.runTime,
        label: 'Run Time',
        value: formatTimeDuration(
          testCaseDetails?.testCaseResults?.[0]?.durationSeconds ?? 0
        ),
        bgClass: 'bg-purple-100',
        textClass: 'text-purple-500',
      },
      {
        icon: infoCardIcons.retry,
        label: 'Retry',
        value: testCaseDetails?.testCaseResults?.[0]?.retry,
        bgClass: 'bg-[#fff7ed]',
        textClass: 'text-orange-500',
      },
      {
        icon: infoCardIcons.browser,
        label: 'Browser',
        value: selectedTestCase.browser,
        bgClass: 'bg-blue-50',
        textClass: 'text-blue-500',
      },
    ],
    [infoCardIcons, testCaseDetails?.testCaseResults, selectedTestCase.browser]
  );

  const testData: ITestCaseData = useMemo(
    () => ({
      errorMessage: testCaseDetails?.testCaseResults?.[0]?.errorMessage
        ? [testCaseDetails.testCaseResults[0].errorMessage]
        : [],
      testSteps: (() => {
        try {
          const steps = testCaseDetails?.testCaseResults?.[0]?.steps;
          if (!steps || steps === '') return [];
          return JSON.parse(steps);
        } catch (error) {
          console.warn('Failed to parse test steps:', error);
          return [];
        }
      })(),
      screenshots:
        testCaseDetails?.testArtifacts?.filter(
          (artifact: { artifactType: string }) =>
            artifact.artifactType === 'SCREENSHOT'
        ) || [],
      videos:
        testCaseDetails?.testArtifacts?.filter(
          (artifact: { artifactType: string }) =>
            artifact.artifactType === 'VIDEO'
        ) || [],
    }),
    [testCaseDetails]
  );

  /**
   * Renders test case errors in an accordion format
   * @param testData - The test case data containing error messages
   * @returns JSX element with error details
   */
  const renderTestCaseError = useMemo(() => {
    return (testData: ITestCaseData) => {
      return (
        <div>
          {testData?.errorMessage?.length > 0 && (
            <Accordion
              header={
                <div className="flex items-center justify-between w-full">
                  <div className="flex gap-2 items-center">
                    <FailIcon className="w-5 h-5 text-red-600" />
                    <div className="font-bold">{'Errors'}</div>
                  </div>
                  <div className="flex items-center ">
                    <span
                      className={`text-xs text-white !bg-red-500 !border-red-500 ${getBadgeStylesForStatus(String(testData?.errorMessage?.length))}`}
                    >
                      {`${testData?.errorMessage?.length} ${'errors'}`}
                    </span>
                  </div>
                </div>
              }
              body={
                <div className="w-full break-words">
                  {testData.errorMessage.map((error: string, index: number) => (
                    <TextCollapse
                      key={index}
                      message={error}
                      containerClassName="w-full"
                    />
                  ))}
                </div>
              }
            />
          )}
        </div>
      );
    };
  }, []);

  /**
   * Renders test steps in an accordion format
   * @param testData - The test case data containing test steps
   * @returns JSX element with test step details
   */
  const renderTestSteps = useMemo(
    () => (testData: ITestCaseData) => {
      return (
        <div>
          {!!testData?.testSteps.length && (
            <Accordion
              header={
                <div className="flex items-center justify-between w-full">
                  <div className="flex gap-2 items-center">
                    <CheckIcon className="w-5 h-5 text-blue-600" />
                    <div className="font-bold">{'Test Steps'}</div>
                  </div>
                  <div className="flex items-center ">
                    <span
                      className={`text-xs ${getBadgeStylesForStatus(String(testData?.testSteps?.length))}`}
                    >
                      {`${testData?.testSteps?.length} ${'steps'}`}
                    </span>
                  </div>
                </div>
              }
              body={
                <div className="space-y-2">
                  {(typeof testData?.testSteps === 'string'
                    ? JSON.parse(testData?.testSteps)
                    : testData.testSteps
                  )?.map((step: ITestStep, index: number, arr: ITestStep[]) => {
                    const isLastStep = index === arr.length - 1;
                    const isFailedStep =
                      isLastStep && testData?.errorMessage?.length > 0;
                    const badgeStatus = isFailedStep ? 'FAILED' : 'PASSED';

                    return (
                      <div
                        key={step.title}
                        className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                      >
                        <div className="flex flex-row items-center justify-between w-full">
                          <div className="flex items-center gap-4">
                            <span className="text-gray-500"># {index + 1}</span>
                            <span className="flex items-center gap-3">
                              <span>{getStepIcon(badgeStatus)}</span>
                              <span className="text-sm">
                                {step?.title
                                  ?.split('.')[0]
                                  .replace(/^Step\s*\d+:\s*/, '')}
                              </span>
                            </span>
                          </div>
                          <span
                            className={cn(
                              'text-xs',
                              getBadgeStylesForStatus(badgeStatus)
                            )}
                          >
                            {badgeStatus === TestCaseStatus.FAILED
                              ? 'Failed'
                              : 'Passed'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              }
            />
          )}
        </div>
      );
    },
    []
  );

  /**
   * Renders test case screenshots in an accordion format
   * @param testData - The test case data containing screenshots
   * @returns JSX element with screenshot details
   */
  const renderTestCaseScreenshots = useMemo(() => {
    return (testData: ITestCaseData) => (
      <div>
        {testData?.screenshots?.length > 0 && (
          <>
            <Accordion
              header={
                <div className="flex items-center justify-between w-full">
                  <div className="flex gap-2 items-center">
                    <Screenshot className="w-5 h-5 text-green-600" />
                    <div className="font-bold">{'Screenshots'}</div>
                  </div>
                  <div className="flex items-center ">
                    <span
                      className={`text-xs ${getBadgeStylesForStatus(String(testData?.screenshots?.length))}`}
                    >
                      {`${testData?.screenshots?.length} ${'screenshots'}`}
                    </span>
                  </div>
                </div>
              }
              body={
                <Card className="p-4 rounded">
                  {/* <div className="grid grid-cols-3 gap-4"> */}
                  <div className="flex item-center justify-start overflow-auto gap-4">
                    {testData.screenshots.map((screenshot) => (
                      <div
                        key={screenshot.id}
                        className="border border-gray-200 rounded-lg p-2 cursor-pointer"
                        onClick={() => setIsScreenshotDialogOpen(true)}
                      >
                        <div className="bg-gray-100 rounded-lg flex items-center justify-center mb-2 h-[150px] overflow-hidden">
                          {screenshot.fileContent ? (
                            <img
                              src={`data:image/png;base64,${screenshot?.fileContent}`}
                              alt={screenshot?.fileName}
                              className="object-contain h-full w-full transition-transform duration-300 hover:scale-105"
                            />
                          ) : (
                            <Screenshot className="w-12 h-12 text-gray-400" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              }
            />

            {/* Screenshot Dialog */}
            {
              <Dialog
                open={isScreenshotDialogOpen}
                onClose={() => setIsScreenshotDialogOpen(false)}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
              >
                <div>
                  <img
                    src={`data:image/png;base64,${testData.screenshots[0]?.fileContent}`}
                    alt={testData.screenshots[0]?.fileName}
                    className="w-full max-h-[500px] object-contain"
                  />
                  <button
                    onClick={() => setIsScreenshotDialogOpen(false)}
                    className="absolute top-2 right-2 text-white bg-black bg-opacity-60 rounded-full p-1"
                  >
                    ✕
                  </button>
                </div>
              </Dialog>
            }
          </>
        )}
      </div>
    );
  }, [isScreenshotDialogOpen]);

  /**
   * Renders test case videos in an accordion format
   * @param testData - The test case data containing videos
   * @returns JSX element with video details
   */
  const renderTestCaseVideos = useMemo(() => {
    return (testData: ITestCaseData) => {
      return (
        <div>
          {testData?.videos && (
            <>
              <Accordion
                header={
                  <div className="flex items-center justify-between w-full">
                    <div className="flex gap-2 items-center">
                      <Video className="w-5 h-5 text-purple-600" />
                      <div className="font-bold">{'Videos'}</div>
                    </div>
                    <div className="flex items-center ">
                      <span
                        className={`text-xs ${getBadgeStylesForStatus(String(testData?.videos?.length))}`}
                      >
                        {`${testData?.videos?.length} ${'videos'}`}
                      </span>
                    </div>
                  </div>
                }
                body={
                  <Card className="p-4 rounded">
                    <div className="flex items-center justify-between bg-white rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Video className="w-5 h-5 text-purple-600" />
                        <div>
                          <h3 className="text-base font-medium">
                            {testData.videos[0]?.fileName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Created:{' '}
                            {formatDateTimestamp(testData.videos[0]?.createdAt)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsVideoDialogOpen(true)}
                        className="px-4 py-2 text-sm font-medium text-purple-600 bg-white border border-purple-600 rounded-md hover:bg-purple-50"
                      >
                        Play Video
                      </button>
                    </div>
                  </Card>
                }
              />
              {
                <Dialog
                  open={isVideoDialogOpen}
                  onClose={() => setIsVideoDialogOpen(false)}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                >
                  <div className="bg-white rounded-lg overflow-hidden shadow-xl max-w-3xl w-full relative">
                    <video controls autoPlay className="w-full h-[500px]">
                      <source
                        src={`data:video/mp4;base64,${testData.videos[0]?.fileContent}`}
                        type="video/webm"
                      />
                    </video>
                    <button
                      onClick={() => setIsVideoDialogOpen(false)}
                      className="absolute top-2 right-2 text-white bg-black bg-opacity-60 rounded-full py-0 px-1.5"
                    >
                      ✕
                    </button>
                  </div>
                </Dialog>
              }
            </>
          )}
        </div>
      );
    };
  }, [isVideoDialogOpen, setIsVideoDialogOpen]);

  return (
    <>
      {isTestCaseLoading ? (
        <TestCaseSkeletonLoader />
      ) : !testCaseDetails ? (
        <div className="w-full overflow-auto h-screen gap-5 flex flex-col">
          <Card className="p-8 rounded flex flex-col items-center justify-center">
            <div className="text-gray-500 text-lg">No test data available</div>
            <button
              onClick={onBack}
              className="mt-4 px-4 py-2 text-sm font-medium border border-gray-200 rounded-md"
            >
              Go Back
            </button>
          </Card>
        </div>
      ) : (
        <div className="w-full h-screen gap-4 flex flex-col p-2">
          <div className="flex items-center gap-2">
            <div
              className="border border-gray-200 p-1.5 w-fit h-fit bg-white rounded-md cursor-pointer"
              onClick={onBack}
            >
              <LeftArrowIcon className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-semibold">
              {selectedTestCase.suiteName}
            </h1>
          </div>

          <Card className="p-4 rounded">
            <div className="flex flex-col gap-4">
              <div className="flex flex-row items-baseline justify-between">
                <div className="flex flex-row items-center gap-2 w-2/3">
                  <div className="text-xl font-semibold">
                    {testCaseDetails.name}
                  </div>
                </div>
                <div className="flex flex-row gap-2">
                  <div
                    className={cn(
                      'text-xs my-auto',
                      getBadgeStylesForStatus(
                        testCaseDetails?.testCaseResults?.[0]?.status ?? ''
                      )
                    )}
                  >
                    {testCaseDetails?.testCaseResults?.[0]?.status.toLowerCase()}
                  </div>
                  {testCaseDetails.status === TestCaseStatus.FAILED &&
                    testCaseDetails?.bugStatus !== BugStatus.MARKED_AS_BUG && (
                      <SecondaryButton
                        onClick={handleMarkAsBug}
                        className={cn(
                          'border-red-300 text-red-600 hover:bg-red-50 hover:text-black text-nowrap px-3 py-1.5'
                        )}
                      >
                        Mark as Bug
                      </SecondaryButton>
                    )}
                </div>
              </div>
              <div className="flex flex-row gap-2">
                {infoCardsData.map((card, index) => (
                  <InfoCard
                    key={index}
                    icon={card.icon}
                    label={card.label}
                    value={card.value}
                    bgClass={card.bgClass}
                    textClass={card.textClass}
                  />
                ))}
              </div>
            </div>
          </Card>

          <ScrollPanel header={false} className={cn('mb-5 !pe-0')}>
            <div className="flex flex-col w-full pb-2 pe-2">
              {testData && (
                <>
                  {renderTestCaseError(testData)}
                  {renderTestSteps(testData)}
                  {renderTestCaseScreenshots(testData)}
                  {renderTestCaseVideos(testData)}
                </>
              )}
            </div>
          </ScrollPanel>
        </div>
      )}

      {/* Bug Status Modal */}
      <BugStatusModal
        isOpen={isBugModalOpen}
        onClose={() => setIsBugModalOpen(false)}
        modalType={bugModalType}
        onSubmit={handleBugStatusSubmit}
      />
    </>
  );
}
