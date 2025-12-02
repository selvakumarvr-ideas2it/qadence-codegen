import type {
  IClientDetails,
  ICreateClientPayload,
} from '@/interfaces/ClientAccount';
import { ClientAccountService } from '@/services/ClientAccountService';
import { useMutation } from '@tanstack/react-query';

interface IUseCreateClientMutationProps {
  onSuccess?: (data: IClientDetails) => void;
  onError?: (error: Error) => void;
  onCloseModal?: () => void;
}

export const useCreateClientMutation = ({
  onSuccess,
  onError,
  onCloseModal,
}: IUseCreateClientMutationProps = {}) => {
  const createClient = useMutation<IClientDetails, Error, ICreateClientPayload>({
    mutationFn: async (data: ICreateClientPayload) => {
      const response = await ClientAccountService.createClient(data);
      return response;
    },
    onSuccess: async (data) => {
      if (onSuccess) {
        onSuccess(data);
      }

      if (onCloseModal) {
        onCloseModal();
      }
    },
    onError: (err) => {
      if (onError) onError(err);
    },
  });

  const onCreateClient = (data: ICreateClientPayload) => {
    if (!data) {
      return;
    }
    createClient.mutate(data);
  };

  return {
    createClient,
    onCreateClient,
  };
};
