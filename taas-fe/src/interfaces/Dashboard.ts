interface ILineChartPassRate {
  date: string;
  passRate: number;
}

interface IApplicationSummaryByTenant {
  id: string;
  name: string;
}

interface ITestRun {
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
  testExecutionRequestId: string | null;
  runName: string;
  runType: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  flakyTests: number;
  durationSeconds: number;
  startedAt: string;
  completedAt: string;
  regressionStatus: string | null;
  fileUploadHistoryId: string;
  runCode: string;
}

interface ISelectedRunDetails extends ITestRun {
  applicationName: string;
  selectedTestRunId: string;
}

interface IRunHistory extends ITestRun {
  applicationName: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ILastRegressionRun extends ITestRun {}

interface ILastRunAndRegression {
  applicationId: string;
  applicationName: string;
  lastRun: ITestRun | null;
  lastRegressionRun: ILastRegressionRun | null;
}

export type {
  IApplicationSummaryByTenant,
  ILastRegressionRun,
  ILastRunAndRegression,
  ILineChartPassRate,
  IRunHistory,
  ISelectedRunDetails,
  ITestRun,
};
