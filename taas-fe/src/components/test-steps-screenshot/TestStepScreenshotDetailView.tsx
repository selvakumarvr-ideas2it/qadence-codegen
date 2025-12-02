import type { IRunHistoryTestCase } from '@/interfaces/RunHistory';
import { useMemo } from 'react';
import StaticAccordion from '../shared/accordion/StaticAccordion';
import { Card } from '../shared/card/Card';
import CustomDashedBorderTextCard from '../shared/customDashedBorderTextCard/CustomDashedBorderTextCard';
import SkeletonLoader from '../shared/skeletonLoader/SkeletonLoader';

interface ITestStepScreenshotDetailViewProps {
  testStepsScreenshot?: IRunHistoryTestCase;
  isScreenshotLoading: boolean;
}
function TestStepScreenshotDetailView({
  testStepsScreenshot,
  isScreenshotLoading,
}: ITestStepScreenshotDetailViewProps) {
  console.log('isScreenshotLoading2222', isScreenshotLoading);
  const screenshotList = useMemo(
    () => ({
      screenshots:
        testStepsScreenshot?.testArtifacts?.filter(
          (artifact: { artifactType: string }) =>
            artifact.artifactType === 'SCREENSHOT'
        ) || [],
    }),
    [testStepsScreenshot]
  );
  return (
    <div className="flex-[2] flex flex-col gap-4 h-screen p-6">
      {isScreenshotLoading ? (
        <div className="mt-20">
          {' '}
          <StaticAccordion
            header={
              <SkeletonLoader
                height="30px"
                width="100%"
                borderRadius="12px"
                className="w-full"
              />
            }
            body={
              <SkeletonLoader
                height="300px"
                width="100%"
                borderRadius="12px"
                className="w-full "
              />
            }
          ></StaticAccordion>
        </div>
      ) : screenshotList.screenshots ? (
        <div className="">
          {/* Step Header */}
          <div className="flex items-center gap-2 whitespace-nowrap mt-14">
            <span className="font-inter font-semibold text-lg leading-[18px]">
              Step 2
            </span>
            <span className="font-inter font-medium text-base text-gray-600">
              of 8 Steps recorded
            </span>
          </div>

          {/* Screenshot Section */}
          <section>
            <div className="mt-4">
              <StaticAccordion
                header={<div className="text-base font-medium">Screenshot</div>}
                body={
                  <div className="flex flex-col gap-4">
                    <Card className="m-3 me-2 mt-0 px-3 py-2 relative">
                      <section className="p-2 pb-3">
                        <div className="flex w-full justify-center">
                          {/* Screenshot Box */}
                          <div
                            className="bg-gray-100 overflow-hidden rounded-lg"
                            style={{ width: 700, height: 300 }}
                          >
                            {screenshotList.screenshots?.[0]?.fileContent && (
                              <img
                                src={`data:image/png;base64,${screenshotList.screenshots[0].fileContent}`}
                                alt={screenshotList.screenshots[0].fileName}
                                className="object-cover w-full h-full"
                              />
                            )}
                          </div>
                        </div>
                      </section>
                    </Card>
                  </div>
                }
              />
            </div>
          </section>
        </div>
      ) : (
        <CustomDashedBorderTextCard className="w-full h-20 mt-5 mx-5 flex items-center justify-center">
          <p>No ScreenShot</p>
        </CustomDashedBorderTextCard>
      )}
    </div>
  );
}

export default TestStepScreenshotDetailView;
