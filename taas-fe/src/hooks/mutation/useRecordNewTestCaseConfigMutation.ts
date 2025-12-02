// hooks/useRunTestMutation.ts
import type { IRecordNewTestCaseConfig } from '@/interfaces/RecordNewTestCase';
import { RecordNewTestCaseService } from '@/services/RecordNewTestCaseService';
import { useMutation } from '@tanstack/react-query';

interface UseRecordNewTestCaseConfigMutationProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useRecordNewTestCaseConfigMutation = ({
  onSuccess,
  onError,
}: UseRecordNewTestCaseConfigMutationProps = {}) => {
  const mutation = useMutation<void, Error, IRecordNewTestCaseConfig>({
    mutationFn: (payload) =>
      RecordNewTestCaseService.RecordNewTestCaseConfig(payload),
    onSuccess: () => {
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      onError?.(error);
    },
  });
  return mutation; // exposes mutate, mutateAsync, isLoading, etc.
};
