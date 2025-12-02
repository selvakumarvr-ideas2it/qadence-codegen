import type {
  IRecordNewTestCaseRequest,
  IRecordNewTestCaseResponse,
} from '@/interfaces/RecordNewTestCase';
import { RecordNewTestCaseService } from '@/services/RecordNewTestCaseService';
import { useMutation } from '@tanstack/react-query';

interface UseRecordNewTestCaseProps {
  onSuccess?: (data: IRecordNewTestCaseResponse) => void;
  onError?: (error: Error) => void;
}

export const useRecordNewTestCaseMutation = ({
  onSuccess,
  onError,
}: UseRecordNewTestCaseProps = {}) => {
  const mutation = useMutation<
    IRecordNewTestCaseResponse,
    Error,
    IRecordNewTestCaseRequest
  >({
    mutationFn: (payload) =>
      RecordNewTestCaseService.RecordNewTestCase(payload),
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });
  return mutation; // exposes mutate, mutateAsync, isLoading, etc.
};
