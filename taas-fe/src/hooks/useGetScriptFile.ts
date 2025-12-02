import { QUERY_KEYS } from '@/constants/queryKeys';
import type { IScriptFileResponse } from '@/interfaces/UploadTestCase';
import { UploadTestCase } from '@/services/UploadTestCase';
import { useQuery } from '@tanstack/react-query';

const useGetScriptFile = (
  testCaseTrackerId?: string | number,
  refetchInterval?: number | false
) => {
  return useQuery<IScriptFileResponse, Error>({
    queryKey: QUERY_KEYS.getScriptFile(testCaseTrackerId ?? 'none'),
    queryFn: async () => {
      if (!testCaseTrackerId) {
        throw new Error('testCaseTrackerId is required');
      }
      return await UploadTestCase.getScriptFile(
        String(testCaseTrackerId)
      );
    },
    enabled: !!testCaseTrackerId,
    refetchInterval: refetchInterval ?? false,
  });
};

export default useGetScriptFile;
