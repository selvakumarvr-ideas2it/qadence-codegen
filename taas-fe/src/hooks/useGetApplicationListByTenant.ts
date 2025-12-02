import { QUERY_KEYS } from "@/constants/queryKeys";
import { ApplicationService } from "@/services/ApplicationService";
import { useQuery } from "@tanstack/react-query"

const useGetApplicationListByTenant = (tenantId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.getApplicationListByTenant(tenantId),
    queryFn: async () => {
      return await ApplicationService.getApplicationListByTenant(
        tenantId
      );
    },
    enabled: !!tenantId,
  });
}

export default useGetApplicationListByTenant;
