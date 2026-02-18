import { api } from "@/lib/api";
import type { CreateClinicDto } from "./dtos/create-clinic.dto";

const baseUrl = "clinic";

export async function createClinic(data: CreateClinicDto) {
  const response = await api.post(`${baseUrl}/clinic`, data);
  return response.data;
}

export async function getLinkedUsers(clinicId: string) {
  const response = await api.get(`clinics/${clinicId}/users`);
  return response.data;
}
