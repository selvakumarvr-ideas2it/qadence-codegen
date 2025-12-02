import { BugListView } from '@/components/bugs/BugListView';
import { useAppContext } from '@/context/app/AppContext';
import useGetConfirmedBug from '@/hooks/useGetConfirmedBug';
import useGetFailureByApplicationId from '@/hooks/useGetFailureByApplicationId';

const Bugs = () => {
  const { state: appState } = useAppContext();
  const { applicationList } = appState;

  const selectedAppId = String(appState.selectedApplication?.value ?? '');

  const {
    data: failedBugs,
    isLoading: isFailedBugLoading,
    refetch: refetchFailedBugs,
  } = useGetFailureByApplicationId(selectedAppId);

  const {
    data: confirmedBug,
    isLoading: isConfirmedBugLoading,
    refetch: refetchConfirmedBugs,
  } = useGetConfirmedBug(selectedAppId);

  return (
    <div className="w-full">
      <BugListView
        applicationOptions={applicationList ?? []}
        failedBug={failedBugs ?? []}
        confirmedBug={confirmedBug ?? []}
        isLoading={isFailedBugLoading || isConfirmedBugLoading}
        refetchFailedBugs={refetchFailedBugs}
        refetchConfirmedBugs={refetchConfirmedBugs}
      />
    </div>
  );
};

export default Bugs;
