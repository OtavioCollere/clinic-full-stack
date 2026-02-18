import { api } from "@/lib/api";
import type { CreateProfessionalDto } from "./dtos/create-professional.dto";

const baseUrl = "professional";

export async function createProfessional(data: CreateProfessionalDto) {
  const response = await api.post(`franchises/${data.franchiseId}/professionals`, data);
  return response.data;
}

export async function getProfessionals(clinicId: string) {
  const response = await api.get(`clinics/${clinicId}/professionals`);
  return response.data;
}