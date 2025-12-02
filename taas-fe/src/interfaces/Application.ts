interface IApplicationCredential {
  id: string;
  version: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  status: string | null;
  message: string | null;
  tenantId: string;
  tenantName: string | null;
  role: string;
  username: string;
  password: string;
  environmentId: string;
}

interface IApplicationEnvironment {
  id: string;
  version: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  status: string | null;
  message: string | null;
  tenantId: string;
  tenantName: string | null;
  environmentType: string;
  url: string | null;
  targetBrowser: string;
  s3BucketPreference: string;
  s3BucketEndpoint: string;
  s3BucketName: string;
  s3BucketStatus: string;
  githubRepositoryUrl: string;
  applicationId: string;
  githubUsername: string;
  githubPatToken: string;
  s3ApiKey: string;
  s3SecretKey: string;
  s3BucketRegion: string;
  s3BucketPrefix: string;
  s3FailureRetryCount: number;
  credentials: IApplicationCredential | null;
}

interface IApplicationsListResult {
  id: string;
  version: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  status: string | null;
  message: string | null;
  tenantId: string;
  tenantName: string | null;
  appName: string;
  appDescription: string;
  notes: string;
  applicationExternalId: string;
  applicationType: string;
  mobileType: string | null;
  totalTestRuns: number;
  totalTestSuites: number;
  totalTestCases: number;
  environments: IApplicationEnvironment[];
}

interface IApplicationTestCase {
  id: string;
  version: number;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string;
  updatedBy: string | null;
  status: string;
  message: string | null;
  tenantId: string;
  tenantName: string | null;
  name: string;
  fullName: string | null;
}

interface IApplicationSuiteDetails {
  id: string;
  version: number;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string;
  updatedBy: string | null;
  status: string;
  message: string | null;
  tenantId: string;
  tenantName: string | null;
  applicationId: string;
  name: string;
  applicationName: string;
  testCases: IApplicationTestCase[];
}

type IApplicationSuitesResponse = IApplicationSuiteDetails[];

export type {
  IApplicationCredential,
  IApplicationEnvironment,
  IApplicationSuiteDetails,
  IApplicationTestCase,
  IApplicationsListResult,
  IApplicationSuitesResponse,
};
