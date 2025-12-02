import { QUERY_KEYS } from '@/constants/queryKeys';
import { UserAccountService } from '@/services/UserAccountService';
import { useQuery } from '@tanstack/react-query';
import type { UsersPayload } from '@/interfaces/User';

// src/hooks/useGetAllUsers.ts
const useGetAllUsers = (page: number) => {
  return useQuery<UsersPayload>({
    queryKey: QUERY_KEYS.getAllUsersList(page),
    queryFn: () => UserAccountService.getAllUsersList({ page }),
    enabled: Number.isInteger(page) && page >= 0, // allow page 0
  });
};

export default useGetAllUsers;
