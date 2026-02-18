import { api } from "@/lib/api";
import type { RegisterFranchiseDto } from "./dtos/register-franchise.dto";

const baseUrl = "clinics/franchise";

export async function registerFranchise(data: RegisterFranchiseDto) {
  const response = await api.post(`${baseUrl}/register-franchise`, data);
  return response.data;
}

export async function getFranchises(clinicId: string) {
  const response = await api.get(`clinics/${clinicId}/franchises`);
  return response.data;
}