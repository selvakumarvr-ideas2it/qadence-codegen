// hooks/useRunTestMutation.ts
import type {
  INewRunFormRequest,
  INewRunFormResponse,
} from '@/interfaces/NewRun';
import { AddNewService } from '@/services/AddNewService';
import { useMutation } from '@tanstack/react-query';

interface UseNewRunMutationProps {
  onSuccess?: (data: INewRunFormResponse) => void;
  onError?: (error: Error) => void;
}

export const useNewRunMutation = ({
  onSuccess,
  onError,
}: UseNewRunMutationProps = {}) => {
  const mutation = useMutation<INewRunFormResponse, Error, INewRunFormRequest>({
    mutationFn: (payload) => AddNewService.CreateRunTest(payload),
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });
  return mutation; // exposes mutate, mutateAsync, isLoading, etc.
};
