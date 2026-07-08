import { api } from "@/lib/api";
import type { CreateAnamnesisDto } from "./dtos/create-anamnesis.dto";

export interface AnamnesisResponse {
  id: string;
  patientId: string;
  aestheticHistory: Record<string, unknown>;
  healthConditions: Record<string, unknown>;
  medicalHistory: Record<string, unknown>;
  physicalAssessment: Record<string, unknown>;
  patientSignature?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export async function createAnamnesis(patientId: string, data: CreateAnamnesisDto) {
  const response = await api.post(`/patients/${patientId}/anamnesis`, data);
  return response;
}

export async function getAnamnesisByPatientId(
  patientId: string
): Promise<AnamnesisResponse | null> {
  const response = await api.get<AnamnesisResponse | null>(
    `/patients/${patientId}/anamnesis`
  );
  return response.data ?? null;
}