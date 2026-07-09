import { getApiUrl } from "@/lib/api-url";

const API = getApiUrl();

export interface AdminClinic {
  id: string;
  name: string;
  slug: string;
  cnpj: string;
  status: string;
  createdAt: string;
  owner: { id: string; name: string; email: string };
  franchiseCount: number;
  patientCount: number;
}

export interface AdminClinicDetail {
  id: string;
  name: string;
  slug: string;
  cnpj: string;
  status: string;
  createdAt: string;
  patientCount: number;
  owner: { id: string; name: string; email: string; cpf: string | null; phone: string | null };
  franchises: { id: string; name: string; address: string; zipCode: string; status: string; createdAt: string }[];
}

async function adminFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, { credentials: "include" });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

export const listClinics = () => adminFetch<AdminClinic[]>("/admin/clinics");
export const getClinic = (id: string) => adminFetch<AdminClinicDetail>(`/admin/clinics/${id}`);
