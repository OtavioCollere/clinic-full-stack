import { api } from "@/lib/api";

export interface ChangePasswordDto {
  password: string;
}

export async function changePassword(token: string, data: ChangePasswordDto) {
  const response = await api.post(`/users/change-password?token=${token}`, data);
  return response.data;
}


