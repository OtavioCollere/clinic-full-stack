import { api } from "@/lib/api";
import type { RegisterFranchiseDto } from "./dtos/register-franchise.dto";

const baseUrl = "clinic/franchise";

export async function registerFranchise(data: RegisterFranchiseDto) {
  const response = await api.post(`${baseUrl}/register-franchise`, data);
  return response.data;
}