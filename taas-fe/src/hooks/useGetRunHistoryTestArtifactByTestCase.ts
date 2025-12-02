import { RunHistoryService } from '@/services/RunHistoryService';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../constants/queryKeys';

const useGetRunHistoryTestArtifactByTestCase = (
  applicationId: string,
  testRunId: string,
  testSuiteId: string,
  testCaseId: string
) => {
  return useQuery({
    queryKey: QUERY_KEYS.getRunHistoryTestArtifactByTestCase(
      applicationId,
      testRunId,
      testSuiteId,
      testCaseId
    ),
    queryFn: async () => {
      return await RunHistoryService.getRunHistoryTestArtifactByTestCase(
        applicationId,
        testRunId,
        testSuiteId,
        testCaseId
      );
    },
    enabled: !!(applicationId && testRunId && testSuiteId && testCaseId),
  });
};

export default useGetRunHistoryTestArtifactByTestCase;
