import type { IApplication } from '@/interfaces/ClientAccount';
import { ClientAccountService } from '@/services/ClientAccountService';
import { useMutation } from '@tanstack/react-query';

interface UseUpdateApplicationMutationProps {
  onSuccess?: (data: IApplication) => void;
  onCloseModal?: () => void;
}

export const useUpdateApplicationMutation = ({
  onSuccess,
  onCloseModal,
}: UseUpdateApplicationMutationProps = {}) => {
  const updateApplication = useMutation<IApplication, Error, IApplication>({
    mutationFn: async (data: IApplication) => {
      const response = await ClientAccountService.updateApplication(data);
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
  });

  const onUpdateApplication = (data: IApplication) => {
    if (!data?.id) {
      return;
    }
    updateApplication.mutate(data);
  };

  return {
    updateApplication,
    onUpdateApplication,
  };
};
