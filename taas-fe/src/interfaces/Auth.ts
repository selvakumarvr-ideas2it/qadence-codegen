export interface ILoginRequest {
  email: string;
  password: string;
}

export interface ILoginResponse {
  success: boolean;
  data: IAuthData;
  message: string;
  timestamp: string;
  path: string;
  error: IErrorDetails;
}

export interface IAuthData {
  token: string;
  user: IUser;
  expiresIn: number;
}

export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userName: string;
  mobileNumber: string;
  emailVerified: boolean;
  mobileVerified: boolean;
  status: string;
  roles: string[];
  permissions: string[];
  accessibleTenants: ITenant[];
  defaultTenantId: string;
}

export interface ITenant {
  id: string;
  name: string;
  domainName: string;
}

export interface IErrorDetails {
  code: string;
  message: string;
  details: string;
  timestamp: string;
}
