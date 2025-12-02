import type { IClientDetails } from '@/interfaces/ClientAccount';
import { ClientAccountService } from '@/services/ClientAccountService';
import { useMutation, type QueryObserverResult } from '@tanstack/react-query';

type UpdateClientPayload = {
  tenantId: string;
  data: Partial<IClientDetails>;
};

interface UseUpdateClientMutationProps {
  onSuccess?: (data: IClientDetails) => void;
  onError?: (error: Error) => void;
  onCloseModal?: () => void;
  refetchAllTenants?: () => Promise<QueryObserverResult<IClientDetails[], Error>>;
}

export const useUpdateClientMutation = ({
  onSuccess,
  onError,
  onCloseModal,
}: UseUpdateClientMutationProps = {}) => {
  const updateClient = useMutation<IClientDetails, Error, UpdateClientPayload>({
    mutationFn: async ({ tenantId, data }: UpdateClientPayload) => {
      return ClientAccountService.updateClient(tenantId, data);
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

  const onUpdateClient = (tenantId: string, data: Partial<IClientDetails>) => {
    if (!tenantId) {
      return;
    }
    updateClient.mutate({ tenantId, data });
  };

  return {
    updateClient,
    onUpdateClient,
  };
};
