import { api } from "@/lib/api";
import type { CreatePatientDto } from "./dtos/create-patient.dto";

export interface PatientResponse {
  id: string;
  clinicId: string;
  userId: string;
  name: string;
  birthDay: string;
  address: string;
  zipCode: string;
  createdAt: string;
  updatedAt: string;
}

export async function getPatientById(patientId: string): Promise<PatientResponse> {
  const response = await api.get(`/patients/${patientId}`);
  return response.data;
}

/** Busca o paciente do usuário logado via userId (tabela patients) */
export async function getMyPatient(): Promise<PatientResponse> {
  const response = await api.get<PatientResponse>("/users/me/patient");
  return response.data;
}

export async function editPatient(
  patientId: string,
  data: Partial<{ name: string; birthDay: string; address: string; zipCode: string }>
) {
  const response = await api.patch(`/patients/${patientId}`, data);
  return response.data;
}

export async function createPatient(data: CreatePatientDto) {
  const { clinicId, ...body } = data;
  const response = await api.post(`/clinics/${clinicId}/patients`, body);
  return response.data;
}
  
export async function getPatientsByProfessionalId(professionalId: string): Promise<PatientResponse[]> {
  const response = await api.get<PatientResponse[]>(`/professionals/${professionalId}/patients`);
  return response.data;
}

export async function getPatients(clinicId: string, page: number = 1, pageSize: number = 100, query?: string) {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });
  
  if (query) {
    params.append('query', query);
  }
  
  const response = await api.get(`/clinics/${clinicId}/patients?${params.toString()}`);
  return response.data;
}