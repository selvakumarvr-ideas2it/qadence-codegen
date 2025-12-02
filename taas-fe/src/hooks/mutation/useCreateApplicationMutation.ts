import type { IApplication } from '@/interfaces/ClientAccount';
import { ClientAccountService } from '@/services/ClientAccountService';
import { useMutation } from '@tanstack/react-query';

interface UseCreateApplicationMutationProps {
  onSuccess?: (data: IApplication) => void;
  onCloseModal?: () => void;
}

export const useCreateApplicationMutation = ({
  onSuccess,
  onCloseModal,
}: UseCreateApplicationMutationProps = {}) => {
  const createApplication = useMutation<IApplication, Error, IApplication>({
    mutationFn: async (data: IApplication) => {
      const response = await ClientAccountService.createApplication(data);
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

  const onCreateApplication = (data: IApplication) => {
    if (!data) {
      return;
    }
    createApplication.mutate(data);
  };

  return {
    createApplication,
    onCreateApplication,
  };
};
