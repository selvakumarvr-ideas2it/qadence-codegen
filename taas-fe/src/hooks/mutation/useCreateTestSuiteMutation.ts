import { QUERY_KEYS } from '@/constants/queryKeys';
import type { IApplicationTestCase } from '@/interfaces/Application';
import { UploadTestCase } from '@/services/UploadTestCase';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UseCreateTestSuiteMutationProps {
  onSuccess?: (data: IApplicationTestCase) => void;
  onError?: (error: Error) => void;
  onCloseModal?: () => void;
}

type CreateSuitePayload = {
  applicationId: string;
  name: string;
};

export const useCreateTestSuiteMutation = ({
  onSuccess,
  onError,
  onCloseModal,
}: UseCreateTestSuiteMutationProps = {}) => {
  const queryClient = useQueryClient();

  const createTestSuite = useMutation<
    IApplicationTestCase,
    Error,
    CreateSuitePayload
  >({
    mutationFn: async (payload) => {
      return await UploadTestCase.createTestSuite(payload);
    },
    onSuccess: async (data, variables) => {
      if (onSuccess) onSuccess(data);
      if (onCloseModal) onCloseModal();

      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.getSuiteByApplicationId(variables.applicationId),
      });
    },
    onError: (err) => {
      if (onError) onError(err);
    },
  });

  const onCreateTestSuite = (payload: CreateSuitePayload) => {
    createTestSuite.mutate(payload);
  };

  return {
    createTestSuite,
    onCreateTestSuite,
  };
};
