import type { ILoginRequest } from '@/interfaces/Auth';
import { adminApiClient } from './ApiClient';

const onLogin = async (data: ILoginRequest) => {
  try {
    const response = await adminApiClient.post(
      '/admin-service/api/v1/auth/login',
      data
    );
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const AuthService = {
  onLogin,
};
