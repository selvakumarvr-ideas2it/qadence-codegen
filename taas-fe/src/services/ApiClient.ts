import { getToken, logout, saveTokensToLocalStorage } from '@/utils/auth';
import type {
  AxiosInstance,
  AxiosRequestHeaders,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import axios from 'axios';

const headers: Readonly<Record<string, string | boolean>> = {
  'Content-Type': 'application/json',
};

// Environment variables for both services
const VITE_API_URL = import.meta.env.VITE_API_URL;
const ADMIN_API_URL = import.meta.env.VITE_ADMIN_API_URL;

// Create separate API clients for each service
export const ApiClients: AxiosInstance = axios.create({
  baseURL: VITE_API_URL,
  headers,
});

export const adminApiClient: AxiosInstance = axios.create({
  baseURL: ADMIN_API_URL,
  headers,
});

// Keep the original apiClient for backward compatibility (defaults to dashboard)
export const apiClient: AxiosInstance = ApiClients;

// Global refresh coordination (no per-request _retry)
let isRefreshing: Promise<string> | null = null;
let refreshAttempted = false;

const isLoginOrRefreshUrl = (url?: string): boolean => {
  if (!url) return false;
  const u = url.toLowerCase();
  return u.includes('/login') || u.includes('/auth/refresh');
};

const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = localStorage.getItem('refresh_token');

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  // Use admin service for token refresh
  const response = await axios.post(
    `${ADMIN_API_URL}/admin-service/api/v1/auth/refresh`,
    {
      refreshToken: refreshToken,
    }
  );

  const newAccessToken = response.data.authToken;
  const newRefreshToken = response.data.refreshToken;

  saveTokensToLocalStorage(newAccessToken, newRefreshToken);
  return newAccessToken;
};

// Helper function to add interceptors to any client
const addInterceptors = (client: AxiosInstance) => {
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getToken();
      if (token && config.headers) {
        (config.headers as Record<string, string>)['Authorization'] =
          `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error) => {
      const originalRequest = error.config as
        | InternalAxiosRequestConfig
        | undefined;
      const status = error.response?.status as number | undefined;

      if (status === 401) {
        if (!originalRequest || isLoginOrRefreshUrl(originalRequest.url)) {
          return Promise.reject(error.response?.data || error);
        }

        if (!refreshAttempted) {
          refreshAttempted = true;

          if (!isRefreshing) {
            isRefreshing = refreshAccessToken()
              .catch((refreshError) => {
                console.error('Refresh token failed', refreshError);
                logout();
                window.location.href = '/';
                throw refreshError;
              })
              .finally(() => {
                // Allow future refresh attempts after this cycle completes
                isRefreshing = null;
              });
          }

          try {
            const newToken = await isRefreshing;
            if (newToken) {
              client.defaults.headers.common['Authorization'] =
                `Bearer ${newToken}`;
              if (!originalRequest.headers) {
                originalRequest.headers = {} as AxiosRequestHeaders;
              }
              (originalRequest.headers as AxiosRequestHeaders)[
                'Authorization'
              ] = `Bearer ${newToken}`;
              // Retry the original request once
              const res = await client(originalRequest);
              return res;
            }
          } catch {
            return Promise.reject(error.response?.data || error);
          } finally {
            // Reset after the retry path completes to avoid permanently blocking future cycles
            refreshAttempted = false;
          }
        }

        // If we get here, a refresh was already attempted in this cycle → logout
        logout();
        window.location.href = '/';
        return Promise.reject(error.response?.data || error);
      }

      return Promise.reject(error.response?.data || error);
    }
  );
};

// Add interceptors to both clients
addInterceptors(apiClient);
addInterceptors(adminApiClient);
