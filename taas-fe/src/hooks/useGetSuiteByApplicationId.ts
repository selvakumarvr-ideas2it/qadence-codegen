import { QUERY_KEYS } from '@/constants/queryKeys';
import type { IApplicationSuitesResponse } from '@/interfaces/Application';
import { ApplicationService } from '@/services/ApplicationService';
import { useQuery } from '@tanstack/react-query';

const useGetSuiteByApplicationId = (applicationId: string) => {
  return useQuery<IApplicationSuitesResponse>({
    queryKey: QUERY_KEYS.getSuiteByApplicationId(applicationId),
    queryFn: async () => {
      return await ApplicationService.getSuitesByApplicationId(applicationId);
    },
    enabled: !!applicationId,
  });
};

export default useGetSuiteByApplicationId;
