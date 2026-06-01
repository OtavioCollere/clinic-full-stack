import { api } from "@/lib/api";
import type { CreateProfessionalDto } from "./dtos/create-professional.dto";

export interface ProfessionalResponse {
  id: string;
  franchiseId: string;
  userId: string;
  name: string | null;
  council: string | null;
  councilNumber: string | null;
  councilState: string | null;
  profession: string;
  createdAt: string;
  updatedAt: string;
}

export async function getProfessionalById(
  professionalId: string
): Promise<ProfessionalResponse> {
  const response = await api.get(`/professionals/${professionalId}`);
  return response.data;
}

export async function createProfessional(data: CreateProfessionalDto) {
  const response = await api.post(`franchises/${data.franchiseId}/professionals`, data);
  return response.data;
}

export async function getProfessionals(clinicId: string) {
  const response = await api.get(`clinics/${clinicId}/professionals`);
  return response.data;
}

export async function getProfessionalsByFranchiseId(franchiseId: string) {
  const response = await api.get(`franchises/${franchiseId}/professionals`);
  return response.data;
}

export interface UpdateProfessionalDto {
  editorId: string;
  council?: string;
  councilNumber?: string;
  councilState?: string;
  profession?: string;
}

export async function updateProfessional(professionalId: string, data: UpdateProfessionalDto) {
  const response = await api.patch(`professionals/${professionalId}`, data);
  return response.data;
}

export interface CreateStaffMemberDto {
  name: string;
  cpf: string;
  email: string;
}

export async function createStaffMember(clinicId: string, data: CreateStaffMemberDto) {
  const response = await api.post(`clinics/${clinicId}/staff`, data);
  return response.data;
}