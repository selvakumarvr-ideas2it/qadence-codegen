import { RunHistoryCardDetailView } from '@/components/run-history/RunHistoryCardDetailView';
import RunHistoryCardList from '@/components/run-history/RunHistoryCardList';
import { useAppContext } from '@/context/app/AppContext';
import useGetAllTestRuns from '@/hooks/useGetAllTestRuns';
import type { ISelectedRunDetails } from '@/interfaces/Dashboard';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

const RunHistory = () => {
  const location = useLocation();
  const { state: appState } = useAppContext();
  const { applicationList, selectedApplication } = appState;
  const [selectedRunDetails, setSelectedRunDetails] =
    useState<ISelectedRunDetails | null>(null);

  const applicationId = appState.selectedApplication?.value;

  const {
    data: runHistoryApplicationList,
    isLoading: isRunHistoryApplicationLoading,
  } = useGetAllTestRuns(applicationId ?? '');

  const validRunDetails = useMemo(() => {
    return selectedApplication &&
      selectedRunDetails?.applicationId !== selectedApplication?.value
      ? null
      : selectedRunDetails;
  }, [selectedApplication, selectedRunDetails]);

  useEffect(() => {
    if (location?.state?.testRunId && runHistoryApplicationList) {
      const selectedRun = runHistoryApplicationList.find(
        (run) => run.id === location.state.testRunId
      );
      if (selectedRun) {
        setSelectedRunDetails({
          ...selectedRun,
          applicationName: selectedRun?.applicationName || '',
          selectedTestRunId: selectedRun.id,
        });
      }
    }
  }, [location.state, runHistoryApplicationList]);

  useEffect(() => {
    if (!isRunHistoryApplicationLoading && runHistoryApplicationList?.length) {
      if (!location?.state?.testRunId && !selectedRunDetails) {
        const runDetails = runHistoryApplicationList[0];
        setSelectedRunDetails({
          ...runDetails,
          applicationName: runDetails?.applicationName || '',
          selectedTestRunId: runDetails.id,
        });
      }
    }
  }, [
    location?.state,
    runHistoryApplicationList,
    isRunHistoryApplicationLoading,
    selectedRunDetails,
  ]);

  const handleSelectApplication = (id: string) => {
    const selectedRun = runHistoryApplicationList?.find((run) => run.id === id);
    if (selectedRun) {
      setSelectedRunDetails({
        ...selectedRun,
        applicationName: selectedRun?.applicationName || '',
        selectedTestRunId: selectedRun.id,
      });
    }
  };

  return (
    <div className="flex w-full">
      <RunHistoryCardList
        applicationOptions={applicationList ?? []}
        runHistoryApplicationList={runHistoryApplicationList}
        isRunHistoryApplicationLoading={isRunHistoryApplicationLoading}
        onSelectApplication={handleSelectApplication}
        selectedRunDetails={validRunDetails}
      />
      <RunHistoryCardDetailView
        selectedRunDetails={validRunDetails}
        isRunHistoryApplicationLoading={isRunHistoryApplicationLoading}
      />
    </div>
  );
};

export default RunHistory;
