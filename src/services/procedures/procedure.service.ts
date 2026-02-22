import { api } from "@/lib/api";
import type { CreateProcedureDto } from "./dtos/create-procedure.dto";

export async function createProcedure(procedure: CreateProcedureDto) {
  const response = await api.post(`/procedures`, procedure);
  return response.data;
}

export async function getProceduresByClinicId(clinicId: string) {
  const response = await api.get(`/clinics/${clinicId}/procedures`);
  return response.data;
}

export async function getProcedureById(procedureId: string) {
  const response = await api.get(`/procedures/${procedureId}`);
  return response.data;
}

export async function updateProcedure(procedureId: string, data: { name?: string; price?: number; notes?: string }) {
  const response = await api.patch(`/procedures/${procedureId}`, data);
  return response.data;
}

export async function deleteProcedure(procedureId: string) {
  const response = await api.delete(`/procedures/${procedureId}`);
  return response.data;
}