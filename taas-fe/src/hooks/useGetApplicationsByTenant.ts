import { QUERY_KEYS } from '@/constants/queryKeys';
import { ClientAccountService } from '@/services/ClientAccountService';
import { useQuery } from '@tanstack/react-query';

const useGetApplicationsByTenant = (tenantId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.getApplicationsByTenant(tenantId),
    queryFn: async () => {
      return await ClientAccountService.getApplicationsByTenant(tenantId);
    },
    enabled: !!tenantId,
  });
};

export default useGetApplicationsByTenant;
