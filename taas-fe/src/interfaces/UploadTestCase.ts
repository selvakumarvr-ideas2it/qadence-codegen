interface IUploadTestCasePayload {
  file: File | string;
  data: IUploadTestCaseData;
}

interface IUploadTestCaseData {
  id: string;
  tenantId: string;
  applicationId: string;
  environment: string;
  fileName: string;
  githubFilePath: string;
  repositoryUrl: string;
  commitId: string;
  commitMessage: string;
  fileType: string;
  message: string;
  status: string;
  sourceType: string;
}

interface IUploadTestCaseResponse {
  success: boolean;
  data: IUploadTestCaseResponseData;
  message: string;
  timestamp: string;
  path: string;
  error: IUploadTestCaseError;
}

interface IUploadTestCaseResponseData {
  id: string;
  version: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  status: string;
  message: string;
  tenantId: string;
  tenantName: string;
  applicationId: string;
  environment: string;
  fileName: string;
  githubFilePath: string;
  repositoryUrl: string;
  commitId: string;
  commitMessage: string;
  fileType: string;
  testCaseTrackerId: string;
}

interface IUploadTestCaseError {
  code: string;
  message: string;
  details: string;
  timestamp: string;
}
interface IGenerateScriptData {
  id: string | null;
  version: string | null;
  createdAt: string | null;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
  status: string;
  message: string | null;
  tenantId: string | null;
  tenantName: string | null;
  testCaseTrackerId: string;
  applicationId: string | null;
  environment: string | null;
  fileName: string | null;
  githubFilePath: string | null;
  repositoryUrl: string | null;
  commitId: string | null;
  commitMessage: string | null;
  fileType: string | null;
  completedCount: number | null;
  totalCount: number | null;
}

interface IGenerationScript {
  success: boolean;
  progress?: number;
  message?: string;
  data?: IGenerateScriptData;
}

interface IScriptFile {
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
  applicationId: string;
  testCaseId: string;
  testCaseName: string;
  testCaseDescription: string;
  scriptUrl: string;
  sizeInBytes: number;
  scriptStatus: string;
}

interface IScriptFileResponse {
  success: boolean;
  data: IScriptFile[];
  message: string;
}

interface IDownloadScriptRequest {
  id: string;
  tenantId: string;
  isSelectedAll: boolean;
  testCaseTrackerId: string;
  testCaseIds: string[];
}

interface ITestCaseMapping {
  testSuiteId: string;
  testCaseId: string;
}

interface IAssociateTestCasesRequest {
  trackerId: string;
  mapping: ITestCaseMapping[];
}

export type {
  IAssociateTestCasesRequest,
  IDownloadScriptRequest,
  IGenerateScriptData,
  IGenerationScript,
  IScriptFile,
  IScriptFileResponse,
  ITestCaseMapping,
  IUploadTestCaseData,
  IUploadTestCaseError,
  IUploadTestCasePayload,
  IUploadTestCaseResponse,
  IUploadTestCaseResponseData,
};
