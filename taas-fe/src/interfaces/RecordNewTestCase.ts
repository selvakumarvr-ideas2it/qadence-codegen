interface IRecordNewTestCaseRequest {
  applicationId: string;
  applicationUrl: string;
  environment: string;
  browser: string;
  testCaseName: string;
}

interface IRecordNewTestCaseResponse {
  success: boolean;
  data: IRecordNewTestCaseData;
  message: string;
}

interface IRecordNewTestCaseData {
  id: string | null;
  version: number | null;
  createdAt: string | null;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
  status: string | null;
  message: string | null;
  tenantId: string | null;
  tenantName: string | null;
  testCaseTrackerId: string;
  applicationId: string | null;
  applicationName: string;
  applicationUrl: string;
  environment: string;
  fileName: string | null;
  githubFilePath: string | null;
  repositoryUrl: string | null;
  commitId: string | null;
  commitMessage: string | null;
  fileType: string | null;
  completedCount: number | null;
  totalCount: number | null;
  testCaseName: string;
}

interface IRecordNewTestCaseConfig {
  url: string;
  browser: string;
  testCaseTrackerId: string;
  sourceType: string;
}

export type {
  IRecordNewTestCaseConfig,
  IRecordNewTestCaseData,
  IRecordNewTestCaseRequest,
  IRecordNewTestCaseResponse,
};
