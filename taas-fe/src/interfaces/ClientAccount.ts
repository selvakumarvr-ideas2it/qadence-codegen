// client account interfaces
interface IClientConfiguration {
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
  databaseMode: string;
  inheritDatabaseConfig: boolean;
  propagateDatabaseConfigToChildren: boolean;
  server: string;
  database: string;
  username: string;
  passwordRef: string;
  dbAnchorTenantId: string;
}

interface IClientDetails {
  id: string;
  version: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  status: string;
  message: string;
  description: string;
  tenantExtId: string;
  name: string;
  contactEmail: string;
  contactPersonName: string;
  organizationAddress: string;
  domainName: string;
  sectorType: string;
  appCount: number;
  configuration: IClientConfiguration;
}

interface IErrorInfo {
  code: string;
  message: string;
  details: string;
  timestamp: string;
}

interface IClientAccountResponse {
  success: boolean;
  data: IClientDetails;
  message: string;
  timestamp: string;
  path: string;
  error: IErrorInfo;
}

// application interfaces
interface IApplicationCredentials {
  id: string;
  tenantId: string;
  username: string;
  password: string;
  role: string;
  environmentId: string;
  url: string;
}

interface IApplicationEnvironment {
  id: string;
  tenantId: string;
  environmentType: string;
  targetBrowser: string;
  s3BucketPreference: string;
  s3BucketEndpoint: string;
  s3ApiKey: string;
  s3SecretKey: string;
  githubRepositoryUrl: string;
  githubUsername: string;
  githubPatToken: string;
  applicationId: string;
  credentials: IApplicationCredentials;
  url: string; // want to change
}

interface IApplication {
  id: string;
  tenantId: string;
  appName: string;
  appDescription: string;
  notes: string;
  applicationExternalId: string;
  applicationType: string;
  mobileType: string;
  environments: IApplicationEnvironment[];
}

interface IEnvironmentCredentials {
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
  role: string;
  url: string; // get from IApplicationViewEnvironment
  username: string;
  password: string;
  environmentId: string;
}

interface IApplicationViewEnvironment {
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
  environmentType: string;
  url: string;
  targetBrowser: string;
  s3BucketPreference: string;
  s3BucketEndpoint: string;
  s3ApiKey: string;
  s3SecretKey: string;
  s3BucketRegion: string;
  s3BucketPrefix: string;
  s3BucketName: string;
  s3FailureRetryCount: number;
  s3BucketStatus: string;
  githubRepositoryUrl: string;
  githubUsername: string;
  githubPatToken: string;
  applicationId: string;
  credentials: IEnvironmentCredentials;
}

interface IApplicationData {
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
  appName: string;
  appDescription: string;
  notes: string;
  applicationExternalId: string;
  applicationType: string;
  mobileType: string;
  environments: IApplicationViewEnvironment[];
}

interface IApplicationErrorInfo {
  code: string;
  message: string;
  details: string;
  timestamp: string;
}

interface IApplicationResponse {
  success: boolean;
  data: IApplicationData[];
  message: string;
  timestamp: string;
  path: string;
  error: IApplicationErrorInfo;
}

// Form mode type
type FormMode = 'create' | 'edit';

interface ITenantDetails {
  name: string;
  description?: string;
  tenantExtId?: string;
  contactPersonName: string;
  contactEmail: string;
  organizationAddress?: string;
  sectorType: string;
  domainName?: string;
}

interface IDefaultTenantAdmin {
  userDetails: {
    id: string;
    status: string;
  };
}

interface IConfiguration {
  databaseMode: string;
  dbAnchorTenantId: string;
}

interface ICreateClientPayload {
  tenantDetails: ITenantDetails;
  parentTenantId: string;
  defaultTenantAdmin: IDefaultTenantAdmin;
  configuration: IConfiguration;
}

// old interfaces
interface IUser {
  userId: string;
  userName: string;
  userMail: string;
  role: string;
}

export type {
  FormMode,
  IApplication,
  IApplicationCredentials,
  IApplicationData,
  IApplicationEnvironment,
  IApplicationErrorInfo,
  IApplicationResponse,
  IApplicationViewEnvironment,
  IClientAccountResponse,
  IClientConfiguration,
  IClientDetails,
  IConfiguration,
  ICreateClientPayload,
  IDefaultTenantAdmin,
  IEnvironmentCredentials,
  IErrorInfo,
  ITenantDetails,
  IUser,
};
