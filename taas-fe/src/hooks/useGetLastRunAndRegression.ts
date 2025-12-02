import { QUERY_KEYS } from '@/constants/queryKeys';
import type { ILastRunAndRegression } from '@/interfaces/Dashboard';
import { DashboardService } from '@/services/DashboardService';
import { useQuery } from '@tanstack/react-query';

const useGetLastRunAndRegression = (applicationId?: string | number) => {
  return useQuery<ILastRunAndRegression | null, Error>({
    queryKey: QUERY_KEYS.getLastRunAndRegression(applicationId ?? 'none'),
    queryFn: async () => {
      if (!applicationId) return null;
      return await DashboardService.getLastRunAndRegressionData(applicationId);
    },
    enabled: !!applicationId,
  });
};

export default useGetLastRunAndRegression;
