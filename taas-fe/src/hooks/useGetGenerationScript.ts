import { QUERY_KEYS } from '@/constants/queryKeys';
import type { IGenerationScript } from '@/interfaces/UploadTestCase';
import { UploadTestCase } from '@/services/UploadTestCase';
import { useQuery } from '@tanstack/react-query';

const useGetGenerationScript = (
  testCaseTrackerId?: string | number,
  refetchInterval?: number | false
) => {
  return useQuery<IGenerationScript, Error>({
    queryKey: QUERY_KEYS.getGenerationScript(testCaseTrackerId ?? 'none'),
    queryFn: async () => {
      if (!testCaseTrackerId) {
        throw new Error('testCaseTrackerId is required');
      }
      return await UploadTestCase.getGenerationScript(
        String(testCaseTrackerId)
      );
    },
    enabled: !!testCaseTrackerId,
    refetchInterval: refetchInterval ?? false, // Poll every 1 mins, or false to disable
  });
};

export default useGetGenerationScript;
