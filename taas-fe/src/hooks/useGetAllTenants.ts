import { QUERY_KEYS } from '@/constants/queryKeys';
import type { IClientDetails } from '@/interfaces/ClientAccount';
import { ClientAccountService } from '@/services/ClientAccountService';
import { useQuery } from '@tanstack/react-query';

const useGetAllTenants = (isEnabled: boolean = true) => {
  return useQuery<IClientDetails[]>({
    queryKey: QUERY_KEYS.getAllTenants,
    queryFn: async () => {
      return await ClientAccountService.getAllTenantList();
    },
    enabled: isEnabled,
  });
};

export default useGetAllTenants;
