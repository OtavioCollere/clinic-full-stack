import { api } from "@/lib/api";
import type { CreatePatientDto } from "./dtos/create-patient.dto";

export async function createPatient(data: CreatePatientDto) {
  const { clinicId, ...body } = data;
  const response = await api.post(`/clinics/${clinicId}/patients`, body);
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