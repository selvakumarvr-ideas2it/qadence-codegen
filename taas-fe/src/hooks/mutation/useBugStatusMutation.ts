import type {
  IBugStatus,
  IConfirmedBugResult,
  IFailureBugResult,
} from '@/interfaces/Bug';
import { BugService } from '@/services/BugService';
import { useMutation, type QueryObserverResult } from '@tanstack/react-query';

interface IBugStatusPayload {
  id: string | null;
  applicationId: string;
  applicationName: string;
  runCode: string;
  errorMessage: string;
  testRunName: string;
  testRunId: string;
  testSuiteId: string;
  testCaseId: string;
  testCaseName: string;
  testCaseResultId: string;
  bugStatus: string;
  browser: string;
  bugReason: string;
  confirmedBy: string;
  createTicket: boolean;
}

interface UseBugStatusMutationProps {
  onSuccess?: (data: IBugStatus) => void;
  onCloseModal?: () => void;
  refetchFailedBugs?: () => Promise<
    QueryObserverResult<IFailureBugResult[], Error>
  >;
  refetchConfirmedBugs?: () => Promise<
    QueryObserverResult<IConfirmedBugResult[], Error>
  >;
}

export const useBugStatusMutation = ({
  onSuccess,
  onCloseModal,
  refetchFailedBugs,
  refetchConfirmedBugs,
}: UseBugStatusMutationProps = {}) => {
  const markAsBug = useMutation<IBugStatus, Error, IBugStatusPayload[]>({
    mutationFn: (payload) => BugService.UpdateTestCaseBugStatus(payload),
    onSuccess: async (data) => {
      if (onSuccess) {
        onSuccess(data);
      }

      if (onCloseModal) {
        onCloseModal();
      }

      if (refetchFailedBugs && refetchConfirmedBugs) {
        await Promise.all([refetchFailedBugs(), refetchConfirmedBugs()]);
      }
    },
  });

  const onBugStatus = (payload: IBugStatusPayload[]) => {
    markAsBug.mutate(payload);
  };

  return {
    markAsBug,
    onBugStatus,
  };
};
