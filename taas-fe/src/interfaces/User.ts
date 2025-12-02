interface IApplications {
  applicationId: string;
  applicationName: string;
}

interface IUserDetails {
  id: string;
  version: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  status: string;
  message: string | null;
  tenantId: string;
  tenantName: string;
  email: string;
  userName: string;
  applications: IApplications[];
  roleName: string;
}

interface IUserListResponse {
  content: IUserDetails[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface IUserDetailsPayload {
  id: string;
  tenantId: string;
  email: string;
  userName: string;
  password: string;
  roleName: string;
  clientName: string;
  status: string;
  applications: IApplications[];
}
interface ICreateUserPayload {
  id: string;
  tenantId: string;
  userDetails: IUserDetailsPayload;
}

interface IUpdateUserPayload {
  tenantId?: string;
  userDetails: Partial<IUserDetailsPayload> & { status: string };
}

interface IRoleResponse {
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
  name: string;
  description: string;
  type: string;
  isActive: boolean;
  permissions: string[] | null;
}

export type {
  ICreateUserPayload,
  IRoleResponse,
  IUpdateUserPayload,
  IUserDetails,
  IUserDetailsPayload,
  IUserListResponse,
};

export type UsersPayload = IUserListResponse;
