import type {
  IBugStatus,
  IConfirmedBugResult,
  IFailureBugResult,
} from '@/interfaces/Bug';
import { apiClient } from './ApiClient';

const getFailureByApplicationId = async (
  applicationId: string
): Promise<IFailureBugResult[]> => {
  try {
    const response = await apiClient.get(
      `dashboard-service/api/v1/test-cases/application/${applicationId}/status/FAILED`
    );
    return response.data;
  } catch (err) {
    console.error(err);
    throw new Error('Failed to fetch Failure bug list');
  }
};

const UpdateTestCaseBugStatus = async (payload: {
  id: string | null;
  applicationId: string;
  applicationName: string;
  runCode: string;
  errorMessage: string;
  testRunName: string;
  testRunId: string;
  testSuiteId: string;
  testCaseId: string;
  testCaseName: string;
  testCaseResultId: string;
  bugStatus: string;
  browser: string;
  bugReason: string;
  confirmedBy: string;
  createTicket: boolean;
}[]): Promise<IBugStatus> => {
  try {
    const response = await apiClient.post<IBugStatus>(
      `dashboard-service/api/v1/bugs/mark-as-bug`,
      payload
    );
    return response.data;
  } catch (err) {
    console.error(err);
    throw new Error('Failed to mark as bug');
  }
};

const getConfirmedBug = async (
  applicationId: string
): Promise<IConfirmedBugResult[]> => {
  try {
    const response = await apiClient.get(
      `dashboard-service/api/v1/bugs/application/${applicationId}/status/MARKED_AS_BUG`
    );
    return response.data;
  } catch (err) {
    console.error(err);
    throw new Error('Failed to fetch Confirmed bug');
  }
};

export const BugService = {
  getFailureByApplicationId,
  UpdateTestCaseBugStatus,
  getConfirmedBug,
};
