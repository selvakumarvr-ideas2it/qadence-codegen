import BinIcon from '@/assets/icons/BinIcon.svg?react';
import ChromeIcon from '@/assets/icons/Chrome.svg?react';
import DownChevronGray from '@/assets/icons/DownChevronGray.svg?react';
import EditIcon from '@/assets/icons/EditIcon.svg?react';
// import Play from '@/assets/icons/Play.svg?react';
import Save from '@/assets/icons/Save.svg?react';
import type { IRunHistoryTestCase } from '@/interfaces/RunHistory';
import { cn } from '@/utils/util';
import { useMemo, useState } from 'react';
import PrimaryButton from '../shared/buttons/PrimaryButton';
import { Card } from '../shared/card/Card';
import CustomDashedBorderTextCard from '../shared/customDashedBorderTextCard/CustomDashedBorderTextCard';
import ScrollPanel from '../shared/scrollPanel/ScrollPanel';
import SkeletonLoader from '../shared/skeletonLoader/SkeletonLoader';

interface ITestStepScreenshotListProps {
  testStepsScreenshot?: IRunHistoryTestCase;
  isScreenshotLoading?: boolean;
}
function TestStepScreenshotList({
  testStepsScreenshot,
  isScreenshotLoading,
}: ITestStepScreenshotListProps) {
  const testData = useMemo(
    () => ({
      screenshots:
        testStepsScreenshot?.testArtifacts?.filter(
          (artifact: { artifactType: string }) =>
            artifact.artifactType === 'SCREENSHOT'
        ) || [],
    }),
    [testStepsScreenshot]
  );
  const [enabled, setEnabled] = useState(false);

  function selectedScreenshot() {
    setEnabled(!enabled);
  }
  return (
    <div className="flex-[1] bg-[#F9FAFB]">
      <section className="flex items-center justify-between p-4 pb-3">
        {/* Left Section */}
        <div className="flex items-center gap-3 whitespace-nowrap">
          <DownChevronGray className="w-2.5 h-2.5 text-gray-400 rotate-90 -ml-2" />
          <div className="font-base text-xs leading-[18px] tracking-normal font-inter whitespace-nowrap -ml-1">
            Back to Recording
          </div>
        </div>

        {/* Right Buttons Section */}
        <div className="flex items-center gap-2 justify-end ml-auto whitespace-nowrap">
          <PrimaryButton
            className={cn(
              'px-2 py-1.5 rounded-lg opacity-100 flex items-center gap-[7px] whitespace-nowrap'
            )}
          >
            <Save className="w-3 h-3" />
            <span className="font-medium text-xs tracking-normal font-inter whitespace-nowrap">
              Save & Proceed
            </span>
          </PrimaryButton>

          {/* <PrimaryButton
            className={cn(
              'px-2 py-1.5 rounded-lg opacity-100 flex items-center gap-[7px] whitespace-nowrap'
            )}
          >
            <Play className="w-3 h-3" />
            <span className="font-medium text-xs tracking-normal font-inter whitespace-nowrap">
              Run Now
            </span>
          </PrimaryButton> */}
        </div>
      </section>

      <section className="flex items-center justify-between p-3">
        {/* Left Section */}
        <div className="flex items-center gap-3 whitespace-nowrap">
          <div className="font-semibold text-xl leading-[18px] tracking-normal font-inter whitespace-nowrap">
            Login
          </div>
          <ChromeIcon className="w-3 h-3" />
          <span className="font-medium text-xs text-gray-600 tracking-normal font-inter whitespace-nowrap -ml-2">
            Chrome
          </span>
        </div>
      </section>

      <section className="flex items-center justify-between p-3">
        {/* Left Section */}
        <div className="flex items-center gap-2 whitespace-nowrap">
          <div className="font-semibold  text-lg leading-[18px] tracking-normal font-inter">
            Test Steps
          </div>

          {/* Separator */}
          <span className="text-gray-400">|</span>

          <span className="font-medium text-xs text-gray-600 tracking-normal font-inter">
            8 Steps recorded
          </span>
        </div>
      </section>
      <ScrollPanel header={false} className="max-h-[400px]">
        <section className="p-3">
          <div className="flex items-start gap-6 p-3">
            {/* Application */}
            <div className="flex flex-col w-auto">
              <span className="text-xs font-inter text-gray-600">
                Application
              </span>
              <span className="text-sm font-inter font-medium ">
                {'application'}
              </span>
            </div>

            {/* Environment */}
            <div className="flex flex-col w-auto">
              <span className="text-xs font-inter text-gray-600">
                Environment
              </span>
              <span className="text-sm font-inter   font-medium">{'env'}</span>
            </div>

            {/* URL */}
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-inter text-gray-600">URL</span>
              <span className="text-sm font-medium font-inter text-blue-600 truncate">
                {'https://staging'}
              </span>
            </div>
          </div>
        </section>
        <section>
          {isScreenshotLoading ? (
            <div>
              <Card className={cn('m-3 me-2 mt-0 px-3 py-2 relative ')}>
                {' '}
                <SkeletonLoader
                  height="100px"
                  width="100%"
                  borderRadius="12px"
                  className="w-full"
                />
              </Card>
              <Card className={cn('m-3 me-2 mt-0 px-3 py-2 relative ')}>
                {' '}
                <SkeletonLoader
                  height="100px"
                  width="100%"
                  borderRadius="12px"
                  className="w-full"
                />
              </Card>
              <Card className={cn('m-3 me-2 mt-0 px-3 py-2 relative ')}>
                {' '}
                <SkeletonLoader
                  height="100px"
                  width="100%"
                  borderRadius="12px"
                  className="w-full"
                />
              </Card>
              <Card className={cn('m-3 me-2 mt-0 px-3 py-2 relative ')}>
                {' '}
                <SkeletonLoader
                  height="100px"
                  width="100%"
                  borderRadius="12px"
                  className="w-full"
                />
              </Card>
              <Card className={cn('m-3 me-2 mt-0 px-3 py-2 relative ')}>
                {' '}
                <SkeletonLoader
                  height="100px"
                  width="100%"
                  borderRadius="12px"
                  className="px-3 py-2"
                />
              </Card>
            </div>
          ) : testData.screenshots ? (
            <div>
              {' '}
              <div onClick={selectedScreenshot}>
                {' '}
                <Card
                  isSelected={enabled}
                  className={cn('m-3 me-2 mt-0 px-3 py-2 relative')}
                >
                  <></>
                  {/* <section className="p-2 pb-3">
            {/* TOP-RIGHT ICONS */}
                  <div className="absolute top-2 right-2 flex items-center gap-2">
                    <EditIcon className="w-4 h-4 cursor-pointer text-slate-500" />
                    <BinIcon className="w-4 h-4 cursor-pointer text-slate-500 " />
                  </div>

                  <div className="flex w-full items-stretch">
                    {/* Screenshot List */}
                    <div className="flex items-center justify-start overflow-auto gap-4">
                      {testData.screenshots.map((screenshot) => (
                        <div key={screenshot.id}>
                          <div className="bg-gray-100 rounded-lg flex items-center justify-center w-[93px] h-[74px] overflow-hidden">
                            {screenshot.fileContent && (
                              <img
                                src={`data:image/png;base64,${screenshot.fileContent}`}
                                alt={screenshot.fileName}
                                className="object-contain h-full w-full transition-transform duration-300 hover:scale-105"
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Step Description */}
                    <div className="items-center whitespace-nowrap mt-6 ml-3">
                      <span className="font-base text-sm font-inter">
                        1. Navigate to login page
                      </span>
                    </div>
                  </div>
                  {/* </section> */}
                </Card>
              </div>
              <Card className={cn('m-3 me-2 mt-0 px-3 py-2 relative ')}>
                <section className="p-2 pb-3">
                  {/* TOP-RIGHT ICONS */}
                  <div className="absolute top-2 right-2 flex items-center gap-2">
                    <EditIcon className="w-4 h-4 cursor-pointer text-slate-500" />
                    <BinIcon className="w-4 h-4 cursor-pointer text-slate-500 " />
                  </div>

                  <div className="flex w-full items-stretch">
                    {/* Screenshot List */}
                    <div className="flex items-center justify-start overflow-auto gap-4">
                      {testData.screenshots.map((screenshot) => (
                        <div key={screenshot.id}>
                          <div className="bg-gray-100 rounded-lg flex items-center justify-center w-[93px] h-[74px] overflow-hidden">
                            {screenshot.fileContent ? (
                              <img
                                src={`data:image/png;base64,${screenshot.fileContent}`}
                                alt={screenshot.fileName}
                                className="object-contain h-full w-full transition-transform duration-300 hover:scale-105"
                              />
                            ) : (
                              <></>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Step Description */}
                    <div className="items-center whitespace-nowrap mt-6 ml-3">
                      <span className="font-base text-sm font-inter">
                        1. Navigate to login page
                      </span>
                    </div>
                  </div>
                </section>
              </Card>
              <Card className={cn('m-3 me-2 mt-0 px-3 py-2 relative ')}>
                <section className="p-2 pb-3">
                  {/* TOP-RIGHT ICONS */}
                  <div className="absolute top-2 right-2 flex items-center gap-2">
                    <EditIcon className="w-4 h-4 cursor-pointer text-slate-500" />
                    <BinIcon className="w-4 h-4 cursor-pointer text-slate-500 " />
                  </div>

                  <div className="flex w-full items-stretch">
                    {/* Screenshot List */}
                    <div className="flex items-center justify-start overflow-auto gap-4">
                      {testData.screenshots.map((screenshot) => (
                        <div key={screenshot.id}>
                          <div className="bg-gray-100 rounded-lg flex items-center justify-center w-[93px] h-[74px] overflow-hidden">
                            {screenshot.fileContent ? (
                              <img
                                src={`data:image/png;base64,${screenshot.fileContent}`}
                                alt={screenshot.fileName}
                                className="object-contain h-full w-full transition-transform duration-300 hover:scale-105"
                              />
                            ) : (
                              <></>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Step Description */}
                    <div className="items-center whitespace-nowrap mt-6 ml-3">
                      <span className="font-base text-sm font-inter">
                        1. Navigate to login page
                      </span>
                    </div>
                  </div>
                </section>
              </Card>
              <Card className={cn('m-3 me-2 mt-0 px-3 py-2 relative ')}>
                <section className="p-2 pb-3">
                  {/* TOP-RIGHT ICONS */}
                  <div className="absolute top-2 right-2 flex items-center gap-2">
                    <EditIcon className="w-4 h-4 cursor-pointer text-slate-500" />
                    <BinIcon className="w-4 h-4 cursor-pointer text-slate-500 " />
                  </div>

                  <div className="flex w-full items-stretch">
                    {/* Screenshot List */}
                    <div className="flex items-center justify-start overflow-auto gap-4">
                      {testData.screenshots.map((screenshot) => (
                        <div key={screenshot.id}>
                          <div className="bg-gray-100 rounded-lg flex items-center justify-center w-[93px] h-[74px] overflow-hidden">
                            {screenshot.fileContent ? (
                              <img
                                src={`data:image/png;base64,${screenshot.fileContent}`}
                                alt={screenshot.fileName}
                                className="object-contain h-full w-full transition-transform duration-300 hover:scale-105"
                              />
                            ) : (
                              <></>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Step Description */}
                    <div className="items-center whitespace-nowrap mt-6 ml-3">
                      <span className="font-base text-sm font-inter">
                        1. Navigate to login page
                      </span>
                    </div>
                  </div>
                </section>
              </Card>
              <Card className={cn('m-3 me-2 mt-0 px-3 py-2 relative ')}>
                <section className="p-2 pb-3">
                  {/* TOP-RIGHT ICONS */}
                  <div className="absolute top-2 right-2 flex items-center gap-2">
                    <EditIcon className="w-4 h-4 cursor-pointer text-slate-500" />
                    <BinIcon className="w-4 h-4 cursor-pointer text-slate-500 " />
                  </div>

                  <div className="flex w-full items-stretch">
                    {/* Screenshot List */}
                    <div className="flex items-center justify-start overflow-auto gap-4">
                      {testData.screenshots.map((screenshot) => (
                        <div key={screenshot.id}>
                          <div className="bg-gray-100 rounded-lg flex items-center justify-center w-[93px] h-[74px] overflow-hidden">
                            {screenshot.fileContent ? (
                              <img
                                src={`data:image/png;base64,${screenshot.fileContent}`}
                                alt={screenshot.fileName}
                                className="object-contain h-full w-full transition-transform duration-300 hover:scale-105"
                              />
                            ) : (
                              <></>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Step Description */}
                    <div className="items-center whitespace-nowrap mt-6 ml-3">
                      <span className="font-base text-sm font-inter">
                        1. Navigate to login page
                      </span>
                    </div>
                  </div>
                </section>
              </Card>
            </div>
          ) : (
            <CustomDashedBorderTextCard className="h-1/2 px-4 flex items-center justify-center ml-2">
              <p>No Test Steps</p>
            </CustomDashedBorderTextCard>
          )}
        </section>
      </ScrollPanel>
    </div>
  );
}

export default TestStepScreenshotList;
