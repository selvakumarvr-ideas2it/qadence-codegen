import type {
  ICreateUserPayload,
  IRoleResponse,
  IUpdateUserPayload,
  IUserDetails,
  UsersPayload,
} from '@/interfaces/User';
import { adminApiClient } from './ApiClient';

type UserListQuery = {
  page: number;
};

const getAllUsersList = async (
  params: UserListQuery
): Promise<UsersPayload> => {
  try {
    const { page } = params;
    const response = await adminApiClient.get(
      `admin-service/api/v1/users/all?page=${page}&size=7&sortBy=id&sortDir=ASC`
    );
    return response.data as UsersPayload;
  } catch (err) {
    console.error(err);
    throw new Error('Failed to fetch Users list');
  }
};

const createUser = async (user: ICreateUserPayload): Promise<IUserDetails> => {
  try {
    const response = await adminApiClient.post(
      'admin-service/api/v1/users/create',
      user
    );
    return response.data;
  } catch (err) {
    console.error(err);
    throw new Error('Failed to create user');
  }
};

const updateUser = async (
  userId: string,
  data: IUpdateUserPayload
): Promise<IUserDetails> => {
  try {
    const response = await adminApiClient.put(
      `admin-service/api/v1/users/${userId}/update`,
      data
    );
    return response.data;
  } catch (err) {
    console.error(err);
    throw new Error('Failed to update user');
  }
};

const getRolesByTenant = async (tenantId: string): Promise<IRoleResponse[]> => {
  try {
    const response = await adminApiClient.get(
      `admin-service/api/v1/roles/tenant/${tenantId}`
    );
    return response.data.data;
  } catch (err) {
    console.error(err);
    throw new Error('Failed to fetch roles');
  }
};

export const UserAccountService = {
  getAllUsersList,
  createUser,
  updateUser,
  getRolesByTenant,
};
