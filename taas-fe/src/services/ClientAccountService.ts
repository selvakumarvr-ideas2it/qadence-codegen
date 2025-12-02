import type {
  IApplication,
  IApplicationData,
  IClientDetails,
  ICreateClientPayload,
} from '@/interfaces/ClientAccount';
import { adminApiClient } from './ApiClient';

const getApplicationsByTenant = async (
  tenantId: string
): Promise<IApplicationData[]> => {
  try {
    const response = await adminApiClient.get(
      `admin-service/api/v1/applications/tenant/${tenantId}`
    );
    return response.data.data;
  } catch (err) {
    console.error(err);
    throw new Error('Failed to fetch Tenant details');
  }
};

const getAllTenantList = async (): Promise<IClientDetails[]> => {
  try {
    const response = await adminApiClient.get(
      `admin-service/api/v1/tenants?page=0&size=20&sortBy=id&sortDir=ASC`
    );
    return response.data.data;
  } catch (err) {
    console.error(err);
    throw new Error('Failed to fetch Tenant list');
  }
};

const createClient = async (
  client: ICreateClientPayload
): Promise<IClientDetails> => {
  try {
    const response = await adminApiClient.post(
      'admin-service/api/v1/tenants/create',
      client
    );
    return response.data.data;
  } catch (err) {
    console.error(err);
    throw new Error('Failed to create client');
  }
};

const updateClient = async (
  tenantId: string,
  data: Partial<IClientDetails>
): Promise<IClientDetails> => {
  try {
    const response = await adminApiClient.put(
      `admin-service/api/v1/tenants/${tenantId}`,
      data
    );
    return response.data?.data ?? (data as IClientDetails);
  } catch (err) {
    console.error(err);
    throw new Error('Failed to update client');
  }
};

const createApplication = async (
  application: IApplication
): Promise<IApplication> => {
  try {
    const response = await adminApiClient.post(
      'admin-service/api/v1/applications',
      application
    );
    return response.data;
  } catch (err) {
    console.error(err);
    throw new Error('Failed to create application');
  }
};

const updateApplication = async (
  application: IApplication
): Promise<IApplication> => {
  try {
    const response = await adminApiClient.put(
      `admin-service/api/v1/applications/${application.id}`,
      application
    );
    return response.data;
  } catch (err) {
    console.error(err);
    throw new Error('Failed to update application');
  }
};

export const ClientAccountService = {
  getApplicationsByTenant,
  getAllTenantList,
  createApplication,
  createClient,
  updateClient,
  updateApplication,
};
