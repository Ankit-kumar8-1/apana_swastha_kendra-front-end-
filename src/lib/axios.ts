// src/lib/axios.ts

import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
} from "axios";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

// ─── Token Storage ───────────────────────────────────────────────────────────
const ACCESS_KEY = "ask_access_token";
const REFRESH_KEY = "ask_refresh_token";

export const tokenStorage = {
  getAccess: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACCESS_KEY);
  },

  getRefresh: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_KEY);
  },

  setTokens: (access: string, refresh: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },

  clear: (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

// ─── Axios Instance ───────────────────────────────────────────────────────────
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor ─────────────────────────────────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccess();

    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ─── Refresh Queue System ────────────────────────────────────────────────────
let isRefreshing = false;

let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  refreshQueue.forEach((p) => {
    if (error) p.reject(error);
    else if (token) p.resolve(token);
  });

  refreshQueue = [];
};

// ─── Response Interceptor ────────────────────────────────────────────────────
interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

type RefreshResponse = {
  accessToken: string;
  refreshToken: string;
};

api.interceptors.response.use(
  (response: AxiosResponse) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = tokenStorage.getRefresh();

      if (!refreshToken) {
        tokenStorage.clear();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      // queue requests during refresh
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({
            resolve: (token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(api.request(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post<{ data: RefreshResponse }>(
          `${BASE_URL}/auth/refresh`,
          { refreshToken },
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        const { accessToken, refreshToken: newRefresh } = res.data.data;

        tokenStorage.setTokens(accessToken, newRefresh);
        processQueue(null, accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return api.request(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenStorage.clear();

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
