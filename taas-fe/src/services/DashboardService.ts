import type {
  IApplicationSummaryByTenant,
  ILastRunAndRegression,
  IRunHistory,
} from '@/interfaces/Dashboard';
import { adminApiClient, apiClient } from './ApiClient';

const getLastRunAndRegressionData = async (
  applicationId: string | number
): Promise<ILastRunAndRegression> => {
  try {
    const response = await apiClient.get(
      `/dashboard-service/api/v1/test-runs/application/${applicationId}/last-runs`
    );
    return response.data;
  } catch (err) {
    console.error(err);
    throw new Error('Failed to fetch last run and regression data');
  }
};

const getApplicationSummaryByTenant = async (
  tenantId: string
): Promise<IApplicationSummaryByTenant[]> => {
  try {
    const response = await adminApiClient.get(
      `/admin-service/api/v1/applications/tenant/${tenantId}/summary`
    );
    return response.data.data;
  } catch (err) {
    console.error(err);
    throw new Error('Failed to fetch application list');
  }
};

const getAllTestRuns = async (
  applicationId: string | number
): Promise<IRunHistory[]> => {
  try {
    const response = await apiClient.get(
      `/dashboard-service/api/v1/test-runs/application/${applicationId}`
    );
    return response.data;
  } catch (err) {
    console.error(err);
    throw new Error('Failed to fetch run-history application list');
  }
};

export const DashboardService = {
  getLastRunAndRegressionData,
  getApplicationSummaryByTenant,
  getAllTestRuns,
};
