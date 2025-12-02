import { QUERY_KEYS } from '@/constants/queryKeys';
import { DashboardService } from '@/services/DashboardService';
import { useQuery } from '@tanstack/react-query';

const useGetApplicationSummaryByTenant = (
  tenantId: string,
  isEnabled: boolean = true
) => {
  return useQuery({
    queryKey: QUERY_KEYS.getApplicationSummaryByTenant(tenantId),
    queryFn: async () => {
      return await DashboardService.getApplicationSummaryByTenant(tenantId);
    },
    enabled: isEnabled,
  });
};

export default useGetApplicationSummaryByTenant;
