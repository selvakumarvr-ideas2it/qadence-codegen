import { QUERY_KEYS } from '@/constants/queryKeys';
import type { IConfirmedBugResult } from '@/interfaces/Bug';
import { BugService } from '@/services/BugService';
import { useQuery } from '@tanstack/react-query';

const confirmedBugQueryOptions = (applicationId: string) => ({
  queryKey: QUERY_KEYS.getConfirmedBug,
  queryFn: async () => {
    return await BugService.getConfirmedBug(applicationId);
  },
  enabled: !!applicationId,
});

const useGetConfirmedBug = (applicationId: string) => {
  return useQuery<IConfirmedBugResult[]>(
    confirmedBugQueryOptions(applicationId)
  );
};

export default useGetConfirmedBug;
