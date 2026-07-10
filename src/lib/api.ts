// src/services/api.ts

import axios from "axios";
import { getApiUrl } from "@/lib/api-url";
import { extractTenantFromPath, addTenantToPath } from "@/lib/tenant";

export const api = axios.create({
  baseURL: getApiUrl(),
  withCredentials: true, // 🔥 obrigatório pra cookie
});

const refreshApi = axios.create({
  baseURL: getApiUrl(),
  withCredentials: true,
});

// 🔥 INTERCEPTOR DE REQUEST - Adiciona o tenant em todas as requisições
api.interceptors.request.use(
  (config) => {
    // Se estiver no cliente (browser), extrai o tenant da URL atual
    if (typeof window !== "undefined") {
      const tenant = extractTenantFromPath(window.location.pathname);
      if (tenant) {
        // Adiciona o tenant apenas como header (X-Tenant-ID)
        config.headers["X-Tenant-ID"] = tenant;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 🔥 INTERCEPTOR DE RESPONSE
let refreshPromise: Promise<unknown> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url ?? "";
    const isRefreshRequest = requestUrl.includes("/users/refresh");
    const isAuthRequest = requestUrl.includes("/users/authenticate");

    if (!originalRequest || isRefreshRequest || isAuthRequest) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        refreshPromise ??= refreshApi
          .post("/users/refresh")
          .finally(() => {
            refreshPromise = null;
          });
        await refreshPromise;
        return api(originalRequest);
      } catch (refreshError) {
        if (typeof window !== "undefined" && !window.location.pathname.includes("/auth/login")) {
          const tenant = extractTenantFromPath(window.location.pathname);
          const loginPath = tenant ? addTenantToPath(tenant, "/auth/login") : "/auth/login";
          window.location.href = loginPath;
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
