import type {
  IUploadTestCasePayload,
  IUploadTestCaseResponse,
} from '@/interfaces/UploadTestCase';
import { UploadTestCase } from '@/services/UploadTestCase';
import { useMutation } from '@tanstack/react-query';

interface UseUploadTestCaseMutationProps {
  onSuccess?: (data: IUploadTestCaseResponse) => void;
  onError?: (error: Error) => void;
}

export const useUploadTestCaseMutation = ({
  onSuccess,
  onError,
}: UseUploadTestCaseMutationProps = {}) => {
  const uploadTestCase = useMutation<
    IUploadTestCaseResponse,
    Error,
    IUploadTestCasePayload
  >({
    mutationFn: async (payload: IUploadTestCasePayload) => {
      return UploadTestCase.uploadTestCase(payload);
    },
    onSuccess: (data) => {
      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (error) => {
      if (onError) {
        onError(error);
      }
    },
  });

  const onUploadTestCase = (payload: IUploadTestCasePayload) => {
    uploadTestCase.mutate(payload);
  };

  return {
    uploadTestCase,
    onUploadTestCase,
  };
};
