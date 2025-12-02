import { QUERY_KEYS } from '@/constants/queryKeys';
import type { IFailureBugResult } from '@/interfaces/Bug';
import { BugService } from '@/services/BugService';
import { useQuery } from '@tanstack/react-query';

const failureQueryOptions = (applicationId: string) => ({
  queryKey: QUERY_KEYS.getFailureByApplicationId(applicationId),
  queryFn: async () => {
    return await BugService.getFailureByApplicationId(applicationId);
  },
  enabled: !!applicationId,
});

const useGetFailureByApplicationId = (applicationId: string) => {
  return useQuery<IFailureBugResult[]>(failureQueryOptions(applicationId));
};

export default useGetFailureByApplicationId;
