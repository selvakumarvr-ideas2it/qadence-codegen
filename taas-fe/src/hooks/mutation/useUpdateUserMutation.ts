import type {
  IUpdateUserPayload,
  IUserDetails,
  UsersPayload,
} from '@/interfaces/User';
import { UserAccountService } from '@/services/UserAccountService';
import { useMutation, type QueryObserverResult } from '@tanstack/react-query';

type UpdateUserPayload = {
  userId: string;
  data: IUpdateUserPayload;
};

interface UseUpdateUserMutationProps {
  onSuccess?: (data: IUserDetails) => void;
  onCloseModal?: () => void;
  refetchAllUsers?: () => Promise<QueryObserverResult<UsersPayload, Error>>;
}

export const useUpdateUserMutation = ({
  onSuccess,
  onCloseModal,
  refetchAllUsers,
}: UseUpdateUserMutationProps = {}) => {
  const updateUser = useMutation<IUserDetails, Error, UpdateUserPayload>({
    mutationFn: async ({ userId, data }: UpdateUserPayload) => {
      return UserAccountService.updateUser(userId, data);
    },
    onSuccess: async (data) => {
      if (onSuccess) {
        onSuccess(data);
      }

      if (refetchAllUsers) {
        await refetchAllUsers();
      }

      if (onCloseModal) {
        onCloseModal();
      }
    },
  });

  const onUpdateUser = (userId: string, data: IUpdateUserPayload) => {
    if (!userId) {
      return;
    }
    updateUser.mutate({ userId, data });
  };

  return {
    updateUser,
    onUpdateUser,
  };
};
