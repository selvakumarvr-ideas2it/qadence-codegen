import type { ILoginRequest, ILoginResponse } from '@/interfaces/Auth';
import { AuthService } from '@/services/AuthService';
import { useMutation } from '@tanstack/react-query';

export const useLoginMutation = (
  onSuccess: (data: ILoginResponse) => void,
  onError?: (error: Error) => void
) => {
  const onLogin = useMutation({
    mutationFn: async (data: ILoginRequest) => {
      const response = await AuthService.onLogin(data);
      return response;
    },
    onSuccess: (data) => {
      onSuccess(data);
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      if (onError) {
        onError(error);
      }
    },
  });

  const onUserLogin = async (data: ILoginRequest) => {
    onLogin.mutate(data);
  };

  return {
    onLogin,
    onUserLogin,
  };
};
