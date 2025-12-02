import type {
  IApplicationsListResult,
  IApplicationSuitesResponse,
} from '@/interfaces/Application';
import { apiClient } from './ApiClient';

const getApplicationListByTenant = async (
  tenantId: string
): Promise<IApplicationsListResult[]> => {
  try {
    const response = await apiClient.get(
      `dashboard-service/api/v1/applications/tenant/${tenantId}/all`
    );
    return response.data;
  } catch (err) {
    console.error(err);
    throw new Error('Failed to fetch application list');
  }
};

const getSuitesByApplicationId = async (
  applicationId: string
): Promise<IApplicationSuitesResponse> => {
  try {
    const response = await apiClient.get(
      `dashboard-service/api/v1/applications/${applicationId}/test-suite/all`
    );
    return response.data as IApplicationSuitesResponse;
  } catch (err) {
    console.error(err);
    throw new Error('Failed to fetch application suites details');
  }
};

export const ApplicationService = {
  getApplicationListByTenant,
  getSuitesByApplicationId,
};
