import { QUERY_KEYS } from '@/constants/queryKeys';
import { DashboardService } from '@/services/DashboardService';
import { useQuery } from '@tanstack/react-query';

const useGetAllTestRuns = (applicationId?: string | number) => {
  return useQuery({
    queryKey: QUERY_KEYS.getAllTestRuns(applicationId ?? 'none'),
    queryFn: async () => {
      if (!applicationId) return [];
      return await DashboardService.getAllTestRuns(applicationId);
    },
    enabled: !!applicationId,
  });
};

export default useGetAllTestRuns;
