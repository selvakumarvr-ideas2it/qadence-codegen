import type {
  ILastRegressionRun,
  ILastRunAndRegression,
  ITestRun,
} from '@/interfaces/Dashboard';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SkeletonLoader from '../shared/skeletonLoader/SkeletonLoader';
import LastRunCard from './LastRunCard';

interface ILastRunDetailProps {
  lastRunAndRegressionData: ILastRunAndRegression | null;
  isLastRunAndRegressionDataLoading: boolean;
}

interface ILastRunDetails {
  lastRun: ITestRun | null;
  lastRegressionRun: ILastRegressionRun | null;
}

const LastRunDetails = ({
  lastRunAndRegressionData,
  isLastRunAndRegressionDataLoading,
}: ILastRunDetailProps) => {
  const navigate = useNavigate();

  const [lastRunDetails, setLastRunDetails] = useState<ILastRunDetails>({
    lastRun: null,
    lastRegressionRun: null,
  });

  useEffect(() => {
    if (isLastRunAndRegressionDataLoading) {
      setLastRunDetails({ lastRun: null, lastRegressionRun: null });
      return;
    }
    if (lastRunAndRegressionData) {
      setLastRunDetails({
        lastRun: lastRunAndRegressionData.lastRun,
        lastRegressionRun: lastRunAndRegressionData.lastRegressionRun,
      });
    }
  }, [lastRunAndRegressionData, isLastRunAndRegressionDataLoading]);

  const handleCardClick = (testRunData: ITestRun | null) => {
    if (testRunData?.id) {
      navigate('/run-history', {
        state: {
          testRunId: testRunData.id,
        },
      });
    }
  };

  return (
    <>
      {isLastRunAndRegressionDataLoading ? (
        <section className="space-y-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <SkeletonLoader
              key={index}
              height="100px"
              width="100%"
              borderRadius="10px"
            />
          ))}
        </section>
      ) : (
        <section className="space-y-3">
          <LastRunCard
            lastRunData={lastRunDetails.lastRun}
            lastRunType="Last Run"
            onClick={() => handleCardClick(lastRunDetails.lastRun)}
          />
          <LastRunCard
            lastRunData={lastRunDetails.lastRegressionRun}
            lastRunType="Last End-to-End Run"
            onClick={() => handleCardClick(lastRunDetails.lastRegressionRun)}
          />
        </section>
      )}
    </>
  );
};

export default LastRunDetails;
