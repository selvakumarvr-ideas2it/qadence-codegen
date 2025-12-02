import { QUERY_KEYS } from '@/constants/queryKeys';
import type { IAssociateTestCasesRequest } from '@/interfaces/UploadTestCase';
import { UploadTestCase } from '@/services/UploadTestCase';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UseAssociateTestCasesWithSuiteMutationProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

type AssociatePayload = {
  applicationId: string;
  payload: IAssociateTestCasesRequest;
};

export const useAssociateTestCasesWithSuiteMutation = ({
  onSuccess,
  onError,
}: UseAssociateTestCasesWithSuiteMutationProps = {}) => {
  const queryClient = useQueryClient();

  const associateMutation = useMutation<void, Error, AssociatePayload>({
    mutationFn: async ({ payload }) => {
      await UploadTestCase.associateTestCasesWithSuite(payload);
    },
    onSuccess: async (_data, variables) => {
      if (onSuccess) onSuccess();

      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.getSuiteByApplicationId(variables.applicationId),
      });
    },
    onError: (err) => {
      if (onError) onError(err);
    },
  });

  const onAssociateTestCases = (variables: AssociatePayload) => {
    associateMutation.mutate(variables);
  };

  return {
    associateMutation,
    onAssociateTestCases,
  };
};
