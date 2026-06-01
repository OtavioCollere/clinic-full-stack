import { api } from "@/lib/api";
import { extractTenantFromPath } from "@/lib/tenant";
import type { RegisterUserDto } from "./dtos/register-user.dto";

const baseUrl = "users";

export async function registerUser(data : RegisterUserDto) {
  const response = await api.post(`${baseUrl}/register-user`, data);
  return response.data;
}

export async function loginUser(data : {email : string, password : string}) {
  return await api.post(
    `${baseUrl}/authenticate`,
    data,
    {
      withCredentials : true
    }
  );
}

export async function fetchMe() {
  const tenant =
    typeof window !== "undefined"
      ? (extractTenantFromPath(window.location.pathname) ?? "")
      : "";

  const response = await fetch("/api/me", {
    credentials: "include",
    headers: {
      ...(tenant && { "X-Tenant-ID": tenant }),
    },
  });

  if (!response.ok) {
    throw new Error("Unauthorized");
  }

  return response.json();
}

export async function logoutUser() {
  const response = await api.post(
    `${baseUrl}/logout`,
    {},
    {
      withCredentials: true
    }
  );
  return response.data;
}

export async function changePasswordAuthenticated(
  currentPassword: string,
  newPassword: string
) {
  const response = await api.patch(`${baseUrl}/me/password`, {
    currentPassword,
    newPassword,
  });
  return response.data;
}