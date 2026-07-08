import { api } from "@/lib/api";
import type { CreateAppointmentDto } from "./dtos/create-appointment.dto";

export interface Appointment {
  id: string;
  professionalId: string;
  franchiseId: string;
  patientId: string;
  patientName?: string;
  professionalName?: string;
  name: string;
  durationInMinutes: number;
  appointmentItems: Array<{
    id: string;
    procedureId: string;
    price: number;
    notes?: string;
  }>;
  startAt: string;
  endAt: string;
  status: "WAITING" | "CONFIRMED" | "DONE" | "CANCELED";
  createdAt: string;
  updatedAt?: string;
}

export async function createAppointment(data: CreateAppointmentDto) {
  const response = await api.post(`/appointments`, data);
  return response.data;
}

export async function getAppointmentsByClinicId(
  clinicId: string,
  options?: { period?: "future" | "all" }
) {
  const period = options?.period ?? "future";
  const response = await api.get(`/clinics/${clinicId}/appointments`, {
    params: { period },
  });
  return response.data;
}

export interface AppointmentHistoryResponse {
  items: Appointment[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export async function getAppointmentHistoryByClinicId(
  clinicId: string,
  page: number = 1,
  perPage: number = 20
): Promise<AppointmentHistoryResponse> {
  const response = await api.get<AppointmentHistoryResponse>(
    `/clinics/${clinicId}/appointments/history`,
    { params: { page, perPage } }
  );
  return response.data;
}

export async function getAppointmentsByClinicIdWeek(clinicId: string) {
  const response = await api.get(`/clinics/${clinicId}/appointments/week`);
  return response.data;
}

export async function getAppointmentsByProfessionalId(
  professionalId: string,
  period?: "active" | "history"
) {
  const params = period ? { period } : {};
  const response = await api.get(`/professionals/${professionalId}/appointments`, {
    params,
  });
  return response.data;
}

export async function getAppointmentsByPatientId(
  patientId: string,
  period?: "active" | "history"
) {
  const params = period ? { period } : {};
  const response = await api.get(`/patients/${patientId}/appointments`, {
    params,
  });
  return response.data;
}

export async function getAppointmentById(appointmentId: string) {
  const response = await api.get(`/appointments/${appointmentId}`);
  return response.data;
}

export async function editAppointment(appointmentId: string, data: CreateAppointmentDto) {
  const response = await api.put(`/appointments/${appointmentId}`, data);
  return response.data;
}

export async function confirmAppointment(appointmentId: string, patientId: string) {
  const response = await api.patch(`/appointments/${appointmentId}/confirm`, { patientId });
  return response.data;
}

