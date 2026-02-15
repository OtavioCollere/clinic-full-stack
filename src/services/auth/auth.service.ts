import { api } from "@/lib/api";
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
  const response = await api.get(`${baseUrl}/me`, {
    withCredentials : true
  });
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