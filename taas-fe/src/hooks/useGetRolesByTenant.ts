import { QUERY_KEYS } from '@/constants/queryKeys';
import type { IRoleResponse } from '@/interfaces/User';
import { UserAccountService } from '@/services/UserAccountService';
import { useQuery } from '@tanstack/react-query';

const useGetRolesByTenant = (tenantId: string) => {
  return useQuery<IRoleResponse[]>({
    queryKey: QUERY_KEYS.getRolesByTenant(tenantId),
    queryFn: async () => {
      return await UserAccountService.getRolesByTenant(tenantId);
    },
    enabled: !!tenantId,
  });
};

export default useGetRolesByTenant;
