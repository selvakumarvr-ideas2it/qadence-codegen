interface ITestCases {
  applicationId: string;
  testRunId: string;
  testSuiteId: string;
  id: string;
  name: string;
  browser: string;
  steps: string;
  status: string;
  durationSeconds: number;
  errorMessage: string;
  videoUrl: string;
  screenshotUrl: string;
  suiteName: string;
}

interface ITestSuitesResult {
  id: string;
  name: string;
  browser: string;
  testCaseCount: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  durationSeconds: number;
  startedAt: string;
  completedAt: string;
  testCases: ITestCases[];
}

interface ITestStep {
  status: string;
  title: string;
}

interface ITestCaseArtifacts {
  id: string;
  testCaseId: string;
  artifactType: 'TRACE' | 'VIDEO' | 'SCREENSHOT' | 'LOG';
  fileName: string;
  fileUrl: string;
  fileContent: string;
  fileSize: number | null;
  mimeType: string;
  createdAt: string;
}

interface ITestCaseResults {
  id: string;
  errorMessage: string | null;
  steps: string;
  status: string;
  durationSeconds: number;
  retry: number;
}

interface IScreenshot {
  id: string;
  name: string;
  fileUrl: string;
  screenshotTime: number;
}

interface IVideo {
  fileUrl: string | undefined;
  id: string;
  name: string;
  videoUrl: string;
  duration: number;
}

interface IRunHistoryTestCase {
  testArtifacts: ITestCaseArtifacts[] | null;
  createdAt: string;
  durationMs: number;
  errorDetails: string | null;
  errorMessage: string[] | null;
  fullName: string | null;
  id: string;
  metadata: string | null;
  name: string;
  testCaseResults: ITestCaseResults[] | null;
  screenshotUrl: IScreenshot | null;
  status: string;
  bugStatus?: string;
  testSteps: ITestStep[] | null;
  testSuiteId: string;
  videoUrl: IVideo | null;
}

interface ITestSuite {
  id: string;
  name: string;
  testCaseCount: number;
  testCases: IRunHistoryTestCase[];
}

export type {
  IRunHistoryTestCase,
  IScreenshot,
  ITestCaseArtifacts,
  ITestCases,
  ITestStep,
  ITestSuite,
  ITestSuitesResult,
  IVideo,
};
