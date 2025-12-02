import type {
  IRecordNewTestCaseConfig,
  IRecordNewTestCaseRequest,
  IRecordNewTestCaseResponse,
} from '@/interfaces/RecordNewTestCase';
import { apiClient } from './ApiClient';

const RecordNewTestCase = async (
  payload: IRecordNewTestCaseRequest
): Promise<IRecordNewTestCaseResponse> => {
  try {
    console.log('try to hit the api');
    const response = await apiClient.post<IRecordNewTestCaseResponse>(
      'dashboard-service/api/v1/test-case/record',
      payload
    );
    return response.data;
  } catch (err) {
    console.error(err);
    throw new Error('Failed to record new test case');
  }
};

const RecordNewTestCaseConfig = async (payload: IRecordNewTestCaseConfig) => {
  try {
    const response = await apiClient.post(
      'http://localhost:3001/api/recording-config',
      payload
    );
    return response.data;
  } catch (err) {
    console.error(err);
    throw new Error('Failed to record new test case');
  }
};
export const RecordNewTestCaseService = {
  RecordNewTestCase,
  RecordNewTestCaseConfig,
};
