import type { IApplicationTestCase } from '@/interfaces/Application';
import type {
  IAssociateTestCasesRequest,
  IDownloadScriptRequest,
  IGenerationScript,
  IScriptFileResponse,
  IUploadTestCasePayload,
  IUploadTestCaseResponse,
} from '@/interfaces/UploadTestCase';
import { apiClient } from './ApiClient';

const uploadTestCase = async (
  payload: IUploadTestCasePayload
): Promise<IUploadTestCaseResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', payload.file);
    formData.append('data', JSON.stringify(payload.data));

    const response = await apiClient.post(
      'dashboard-service/api/v1/test-case/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch {
    throw new Error('Failed to upload test case');
  }
};

const getGenerationScript = async (
  testCaseTrackerId: string
): Promise<IGenerationScript> => {
  try {
    const response = await apiClient.get(
      `dashboard-service/api/v1/test-case/script-file/status`,
      {
        params: {
          id: testCaseTrackerId,
          idType: 'TRACKER',
        },
      }
    );
    return response.data;
  } catch (err) {
    console.error('Error fetching generation status:', err);
    throw err;
  }
};

const getScriptFile = async (
  testCaseTrackerId: string
): Promise<IScriptFileResponse> => {
  try {
    const response = await apiClient.get(
      `/dashboard-service/api/v1/test-case/script-files`,
      { params: { testCaseTrackerId } }
    );
    return response.data;
  } catch (err) {
    console.error('Error fetching script files:', err);
    throw err;
  }
};

const downloadScriptFile = async (
  payload: IDownloadScriptRequest
): Promise<Blob> => {
  try {
    const response = await apiClient.post(
      `dashboard-service/api/v1/test-case/script-file/download`,
      payload,
      {
        responseType: 'blob',
      }
    );
    return response.data as Blob;
  } catch (err) {
    console.error('Error Download the script file', err);
    throw err;
  }
};

const createTestSuite = async (payload: {
  applicationId: string;
  name: string;
}): Promise<IApplicationTestCase> => {
  try {
    const response = await apiClient.post(
      `dashboard-service/api/v1/applications/test-suite`,
      payload
    );
    return response.data;
  } catch (err) {
    console.error('Failed to create a suite', err);
    throw err;
  }
};

const associateTestCasesWithSuite = async (
  payload: IAssociateTestCasesRequest
): Promise<IAssociateTestCasesRequest> => {
  try {
    const response = await apiClient.post(
      `dashboard-service/api/v1/applications/associate-test-cases`,
      payload
    );
    return response.data;
  } catch (err) {
    console.error('Failed to submit the associate test case', err);
    throw err;
  }
};

export const UploadTestCase = {
  uploadTestCase,
  getGenerationScript,
  getScriptFile,
  downloadScriptFile,
  createTestSuite,
  associateTestCasesWithSuite,
};
