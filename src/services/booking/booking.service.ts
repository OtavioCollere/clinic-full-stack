import axios from "axios";

const publicApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: false,
});

export interface BookingClinicInfo {
  clinic: { id: string; name: string };
  professionals: { id: string; name: string; profession: string; franchiseId: string }[];
  procedures: { id: string; name: string; price: number; durationInMinutes: number; franchiseId: string }[];
}

export interface BookingPatient {
  id: string;
  name: string;
}

export async function getBookingInfo(slug: string): Promise<BookingClinicInfo> {
  const res = await publicApi.get(`/booking/${slug}`);
  return res.data;
}

export async function lookupPatientByCpf(slug: string, cpf: string): Promise<BookingPatient> {
  const res = await publicApi.post(`/booking/${slug}/lookup`, { cpf });
  return res.data;
}

export async function createPublicAppointment(
  slug: string,
  data: {
    patientId: string;
    professionalId: string;
    franchiseId: string;
    procedureId: string;
    price: number;
    startAt: string;
    durationInMinutes: number;
    notes?: string;
  }
): Promise<{ success: boolean; appointmentId: string }> {
  const res = await publicApi.post(`/booking/${slug}/appointments`, data);
  return res.data;
}
