import InfoCircleIcon from '@/assets/icons/InfoCircle.svg?react';
import TestTubeIcon from '@/assets/icons/TestTubeIcon.svg?react';
import useGetSuiteByApplicationId from '@/hooks/useGetSuiteByApplicationId';
import type { IApplicationSuiteDetails } from '@/interfaces/Application';
import { cn } from '@/utils/util';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Accordion from '../shared/accordion/Accordion';
import CustomDashedBorderTextCard from '../shared/customDashedBorderTextCard/CustomDashedBorderTextCard';
import ScrollPanel from '../shared/scrollPanel/ScrollPanel';
import SkeletonLoader from '../shared/skeletonLoader/SkeletonLoader';
export interface IApplicationCardDetailViewProps {
  selectedApplicationId: string | null;
  appName: string;
  totalTestSuites: number;
  totalTestCases: number;
  totalTestRuns: number;
}

export function ApplicationCardDetailView({
  selectedApplicationId,
  appName,
  totalTestSuites,
  totalTestCases,
  totalTestRuns,
}: IApplicationCardDetailViewProps) {
  const { data: applicationTestSuitesResponse, isLoading: isTestSuiteLoading } =
    useGetSuiteByApplicationId(selectedApplicationId ?? '');
  const applicationTestSuites = applicationTestSuitesResponse ?? [];

  const navigate = useNavigate();

  const onViewRunsClick = useCallback(() => {
    navigate('/run-history');
  }, [navigate]);

  const cardDetailHeader = useMemo(() => {
    return (
      <section className="flex flex-row justify-between">
        {/* Left Section */}
        <div className="flex items-center flex-row gap-2">
          <h3 className="font-semibold text-xl">{appName}</h3>

          <div className="flex items-center justify-center gap-1">
            <InfoCircleIcon className="w-3.5 h-3.5" />
          </div>
        </div>
        {/* Right Section */}
        <div className="flex items-center justify-center gap-2 ">
          <span className="text-xs text-blue-600 font-bold">
            {totalTestSuites ?? 0} - Test Suites
          </span>
          <span className="text-xs text-purple-600 font-bold">
            {totalTestCases ?? 0} - Test Cases
          </span>
          <span className="text-xs font-bold">
            {totalTestRuns ?? 0}- Total Runs
          </span>
          <button
            onClick={onViewRunsClick}
            className=" px-2 py-1.5 rounded-md border border-gray-300 bg-white text-xs font-bold text-black cursor-pointer"
          >
            View Runs
          </button>
        </div>
      </section>
    );
  }, [appName, totalTestSuites, totalTestCases, totalTestRuns, onViewRunsClick,]);

  const renderTestSuites = useMemo(() => {
    return (applicationTestSuites: IApplicationSuiteDetails[]) => {
      return (
        <div className="space-y-3">
          {(applicationTestSuites ?? [])?.map((suite, suiteIndex) => (
            <Accordion
              key={suiteIndex}
              header={
                <div className="flex items-center justify-between w-full">
                  <div className="flex gap-2 items-start">
                    <div className="flex flex-col">
                      <div className="font-bold text-sm">{suite.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center ">
                    <span className="px-2.5 py-0.5 rounded-full border border-gray-300 bg-white text-[10px] font-bold text-black">
                      {` ${suite.testCases?.length ?? 0} Test Cases`}
                    </span>
                  </div>
                </div>
              }
              body={
                <div className="space-y-2">
                  {(suite.testCases ?? [])?.map((testCase, caseIndex) => (
                    <div
                      key={caseIndex}
                      className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex gap-2 items-center">
                          <TestTubeIcon className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-500" />
                          <div className="flex flex-col">
                            <span className="font-bold text-sm">
                              {testCase?.name}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              }
            />
          ))}
        </div>
      );
    };
  }, []);

  return (
    <>
      {isTestSuiteLoading ? (
        <div className="flex-[2] p-4">
          {/* Skeleton for cardDetailHeader */}
          <SkeletonLoader
            height="70px"
            width="100%"
            borderRadius="8px"
            className="mb-2"
          />

          {/* Skeletons for renderTestSuites */}
          <div className="flex flex-col gap-4 w-full pt-3 pb-3">
            {Array.from({
              length: 5,
            }).map((_, index) => (
              <SkeletonLoader
                key={index}
                height="50px"
                width="100%"
                borderRadius="12px"
                className=" w-2/3 "
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="w-2/3 px-6 pt-6 pb-0 ">
          {applicationTestSuites && cardDetailHeader}
          <section className="flex flex-col h-[calc(100vh-55px)] overflow-hidden">
            <ScrollPanel header={false} className={cn('!pe-0 pt-6')}>
              {applicationTestSuites.length ? (
                <div className="flex flex-col gap-4 w-full pb-3 pe-2">
                  {renderTestSuites(applicationTestSuites)}
                </div>
              ) : (
                <CustomDashedBorderTextCard className="h-1/3 px-4 flex items-center justify-center">
                  <p>No Test Suites found</p>
                </CustomDashedBorderTextCard>
              )}
            </ScrollPanel>
          </section>
        </div>
      )}
    </>
  );
}
