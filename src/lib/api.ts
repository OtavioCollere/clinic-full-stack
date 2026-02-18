// src/services/api.ts

import axios from "axios";
import { extractTenantFromPath, addTenantToPath } from "@/lib/tenant";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // 🔥 obrigatório pra cookie
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
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await api.post("/refresh");
        return api(originalRequest); // 🔥 reexecuta a request original
      } catch (refreshError) {
        // Só redireciona se não estiver já na página de login
        if (typeof window !== "undefined" && !window.location.pathname.includes("/auth/login")) {
          // Extrai o tenant do pathname atual
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
