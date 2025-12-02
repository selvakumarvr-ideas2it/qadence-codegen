import type {
  ICreateUserPayload,
  IUserDetails,
  UsersPayload,
} from '@/interfaces/User';
import { UserAccountService } from '@/services/UserAccountService';
import { useMutation, type QueryObserverResult } from '@tanstack/react-query';

interface IUseCreateUserMutationProps {
  onSuccess?: (data: IUserDetails) => void;
  onCloseModal?: () => void;
  refetchAllUsers?: () => Promise<QueryObserverResult<UsersPayload, Error>>;
}

export const useCreateUserMutation = ({
  onSuccess,
  onCloseModal,
  refetchAllUsers,
}: IUseCreateUserMutationProps = {}) => {
  const createUser = useMutation<IUserDetails, Error, ICreateUserPayload>({
    mutationFn: async (data: ICreateUserPayload) => {
      const response = await UserAccountService.createUser(data);
      return response;
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

  const onCreateUser = (data: ICreateUserPayload) => {
    if (!data) {
      return;
    }
    createUser.mutate(data);
  };

  return {
    createUser,
    onCreateUser,
  };
};
