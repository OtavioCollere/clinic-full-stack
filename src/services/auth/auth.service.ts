import { api } from "@/lib/api";
import { getApiUrl } from "@/lib/api-url";
import type { RegisterUserDto } from "./dtos/register-user.dto";

const baseUrl = "/users";

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
  const response = await api.get(`${baseUrl}/me`);
  return response.data;
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

export async function editMyUser(data: { name?: string; email?: string }) {
  const response = await api.patch(`${baseUrl}/me`, data);
  return response.data as { name: string; email: string };
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

export async function loginAdmin(data: { email: string; password: string }) {
  return api.post(`${baseUrl}/authenticate`, data, { withCredentials: true });
}

export async function fetchAdminMe(): Promise<{ id: string; role: string }> {
  const apiUrl = getApiUrl();
  const response = await fetch(`${apiUrl}/admin/me`, { credentials: "include" });
  if (!response.ok) throw new Error("Unauthorized");
  return response.json();
}
