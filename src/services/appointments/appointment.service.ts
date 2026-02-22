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

export async function getAppointmentsByClinicId(clinicId: string) {
  const response = await api.get(`/clinics/${clinicId}/appointments`);
  return response.data;
}

export async function getAppointmentsByClinicIdWeek(clinicId: string) {
  const response = await api.get(`/clinics/${clinicId}/appointments/week`);
  return response.data;
}

export async function getAppointmentsByProfessionalId(professionalId: string) {
  const response = await api.get(`/professionals/${professionalId}/appointments`);
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

