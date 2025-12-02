import type {
  IRunHistoryTestCase,
  ITestSuitesResult,
} from '@/interfaces/RunHistory';
import { apiClient } from './ApiClient';

const getRunHistoryTestSuiteByTestRun = async (
  applicationId: string,
  testRunId: string
): Promise<ITestSuitesResult[]> => {
  try {
    const response = await apiClient.get(
      `dashboard-service/api/v1/test-suites/application/${applicationId}/test-run/${testRunId}/withResult`
    );
    return response?.data;
  } catch (err) {
    console.error(err);
    throw new Error('Failed to fetch all run history test suites');
  }
};

const getRunHistoryTestArtifactByTestCase = async (
  applicationId: string,
  testRunId: string,
  testSuiteId: string,
  testCaseId: string
): Promise<IRunHistoryTestCase> => {
  try {
    const response = await apiClient.get(
      `dashboard-service/api/v1/test-cases/application/${applicationId}/test-run/${testRunId}/test-suite/${testSuiteId}/test-case/${testCaseId}`
    );
    return response?.data;
  } catch (err) {
    console.error(err);
    throw new Error('Failed to fetch all run history test suites');
  }
};

export const RunHistoryService = {
  getRunHistoryTestSuiteByTestRun,
  getRunHistoryTestArtifactByTestCase,
};
