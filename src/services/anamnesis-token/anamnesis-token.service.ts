import axios from "axios";
import { getApiUrl } from "@/lib/api-url";
import type { CreateAnamnesisDto } from "@/services/patients/dtos/create-anamnesis.dto";

const publicApi = axios.create({
  baseURL: getApiUrl(),
  withCredentials: false,
});

export interface AnamnesisTokenInfo {
  patientId: string;
  patientName: string;
  expiresAt: string;
}

export async function validateAnamnesisToken(token: string): Promise<AnamnesisTokenInfo> {
  const res = await publicApi.get<{ success: boolean; data: AnamnesisTokenInfo }>(
    `/anamnesis/token/${token}`
  );
  return res.data.data;
}

export async function submitAnamnesisViaToken(
  token: string,
  data: CreateAnamnesisDto
): Promise<void> {
  await publicApi.post(`/anamnesis/token/${token}`, data);
}
