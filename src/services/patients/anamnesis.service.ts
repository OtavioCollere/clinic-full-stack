import { api } from "@/lib/api";
import type { CreateAnamnesisDto } from "./dtos/create-anamnesis.dto";

export async function createAnamnesis(patientId: string, data: CreateAnamnesisDto)  {
  const response = await api.post(`patients/${patientId}/anamnesis`, data);
  return response;
}