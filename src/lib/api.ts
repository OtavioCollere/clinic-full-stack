// src/services/api.ts

import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // 🔥 obrigatório pra cookie
});

// 🔥 INTERCEPTOR AQUI
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
          window.location.href = "/auth/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
