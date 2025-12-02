import { QUERY_KEYS } from '@/constants/queryKeys';
import { RunHistoryService } from '@/services/RunHistoryService';
import { useQuery } from '@tanstack/react-query';

const useGetRunHistoryTestSuiteByTestRun = (
  testRunId: string,
  applicationId: string
) => {
  return useQuery({
    queryKey: QUERY_KEYS.getRunHistoryTestSuiteByTestRun(
      testRunId,
      applicationId
    ),
    queryFn: async () => {
      return await RunHistoryService.getRunHistoryTestSuiteByTestRun(
        testRunId,
        applicationId
      );
    },
    enabled: !!(testRunId && applicationId),
  });
};

export default useGetRunHistoryTestSuiteByTestRun;
