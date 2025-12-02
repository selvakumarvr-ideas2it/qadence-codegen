interface ITestResult {
  id: string;
  version: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  status: string;
  message: string | null;
  tenantId: string;
  tenantName: string | null;
  applicationId: string;
  testExecutionId: string | null;
  testRunId: string;
  testSuiteId: string;
  testCaseId: string;
  sourceTestCaseId: string | null;
  durationMs: number;
  errorMessage: string | null;
  confirmed: boolean | null;
  confirmationReason: string | null;
  errors: string | null;
  stdout: string;
  stderr: string;
  retry: number;
  steps: string;
  startTime: string;
  endTime: string | null;
}

interface IFailureBugResult {
  id: string;
  version: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  status: string;
  message: string | null;
  tenantId: string;
  tenantName: string | null;
  applicationId: string;
  applicationName: string;
  testRunId: string;
  testRunName: string;
  runCode: string;
  testSuiteId: string;
  name: string;
  testCaseExternalId: string | null;
  fullName: string | null;
  durationMs: number;
  errorMessage: string | null;
  errorDetails: string | null;
  screenshotUrl: string | null;
  videoUrl: string | null;
  testSteps: string | null;
  metadata: string | null;
  bugStatus: string;
  browser: string;
  bugReason: string | null;
  testCaseResult: ITestResult;
  testCaseResults: string | null;
  testArtifacts: string | null;
}

interface IConfirmedBugResult {
  id: string;
  version: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  status: string;
  message: string | null;
  tenantId: string;
  tenantName: string | null;
  applicationId: string;
  applicationName: string;
  testRunId: string;
  testRunName: string;
  runCode: string;
  testSuiteId: string;
  testCaseId: string;
  testCaseName: string;
  testCaseResultId: string;
  errorMessage: string | null;
  bugReason: string | null;
  browser: string;
  bugStatus: string;
  confirmedBy: string | null;
  confirmedAt: string | null;
  priority: string;
  startTime: string;
  bugTicketKey: string;
}

interface IBugStatus {
  id: string;
  tenantId: string;
  applicationId: string;
  applicationName: string;
  testRunId: string;
  testRunName: string;
  testSuiteId: string;
  testCaseId: string;
  testCaseName: string;
  testCaseResultId: string;
  errorMessage: string;
  bugReason: string;
  bugStatus: string;
  confirmedBy: string;
  browser: string;
  confirmedAt: string;
  priority: string;
  status: string;
  bugTicketKey: string;
  redirectUrl: string;
}

type IBugModalType = 'MARK_AS_BUG' | 'NOT_A_BUG';

export type {
  IBugModalType,
  IBugStatus,
  IConfirmedBugResult,
  IFailureBugResult,
  ITestResult,
};
