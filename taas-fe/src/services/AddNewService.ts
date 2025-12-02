import type {
  INewRunFormRequest,
  INewRunFormResponse,
} from '@/interfaces/NewRun';
import { apiClient } from './ApiClient';

const CreateRunTest = async (
  payload: INewRunFormRequest
): Promise<INewRunFormResponse> => {
  try {
    const response = await apiClient.post<INewRunFormResponse>(
      'dashboard-service/api/v1/test-execution-requests/trigger-test-run',
      payload
    );
    return response.data;
  } catch (err) {
    console.error(err);
    throw new Error('Failed to run new test');
  }
};

export const AddNewService = {
  CreateRunTest,
};
