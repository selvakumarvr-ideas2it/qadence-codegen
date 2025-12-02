import type { ISelectedRunDetails } from '@/interfaces/Dashboard';
import type { ITestCases } from '@/interfaces/RunHistory';
import { useEffect, useState } from 'react';
import CustomDashedBorderTextCard from '../shared/customDashedBorderTextCard/CustomDashedBorderTextCard';
import { RunHistoryCardSkeletonLoader } from '../shared/skeletonLoader/RunHistoryCardSkeletonLoader';
import { TestCaseView } from './TestCaseView';
import { TestSuitesView } from './TestSuitesView';

interface IRunHistoryCardDetailViewProps {
  selectedRunDetails: ISelectedRunDetails | null;
  isRunHistoryApplicationLoading: boolean;
}

export function RunHistoryCardDetailView({
  selectedRunDetails,
  isRunHistoryApplicationLoading,
}: IRunHistoryCardDetailViewProps) {
  const [selectedTestCase, setSelectedTestCase] = useState<ITestCases | null>(
    null
  );

  useEffect(() => {
    setSelectedTestCase(null);
  }, [selectedRunDetails?.id]);

  return (
    <div className="flex w-full">
      {isRunHistoryApplicationLoading ? (
        <RunHistoryCardSkeletonLoader />
      ) : selectedRunDetails ? (
        <div className="flex-[2] flex flex-col gap-4 h-screen p-6">
          {!selectedTestCase && (
            <TestSuitesView
              selectedRunDetails={selectedRunDetails}
              selectedTestCase={selectedTestCase}
              setSelectedTestCase={setSelectedTestCase}
            />
          )}
          {selectedTestCase && (
            <TestCaseView
              selectedTestCase={selectedTestCase}
              onBack={() => setSelectedTestCase(null)}
              applicationName={selectedRunDetails.applicationName}
              testRunName={selectedRunDetails.runName}
            />
          )}
        </div>
      ) : (
        <CustomDashedBorderTextCard className="w-full h-20 mt-5 mx-5 flex items-center justify-center">
          <p>No test suites found</p>
        </CustomDashedBorderTextCard>
      )}
    </div>
  );
}
