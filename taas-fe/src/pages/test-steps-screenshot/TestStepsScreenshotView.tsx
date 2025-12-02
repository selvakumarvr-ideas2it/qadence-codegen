import TestStepScreenshotDetailView from '@/components/test-steps-screenshot/TestStepScreenshotDetailView';
import TestStepScreenshotList from '@/components/test-steps-screenshot/TestStepScreenshotList';
import useGetRunHistoryTestArtifactByTestCase from '@/hooks/useGetRunHistoryTestArtifactByTestCase';

function TestStepsScreenshotView() {
  const { data: testStepsScreenshot, isLoading: isScreenshotLoading } =
    useGetRunHistoryTestArtifactByTestCase(
      '77770003-0000-0000-0000-000000000000',
      '752ba91a-44ca-4f2c-b289-ff90e38ebd79',
      'ad3c509a-b6cb-4a7a-bd64-14b420eb0c0f',
      'd5945222-1626-4dc0-948d-753476244632'
    );

  console.log('testCaseDetails', testStepsScreenshot);

  return (
    <div className="flex w-full">
      <TestStepScreenshotList
        testStepsScreenshot={testStepsScreenshot}
        isScreenshotLoading={isScreenshotLoading}
      />
      <TestStepScreenshotDetailView
        testStepsScreenshot={testStepsScreenshot}
        isScreenshotLoading={isScreenshotLoading}
      />
    </div>
  );
}

export default TestStepsScreenshotView;
