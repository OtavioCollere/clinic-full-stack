/**
 * Types for Patient and Professional portal views.
 * Aligned with API response format (Appointment from appointment.service).
 */

export type AppointmentStatus =
  | "WAITING"
  | "CONFIRMED"
  | "DONE"
  | "CANCELED";

export type UserRole = "PATIENT" | "PROFESSIONAL";

export interface PortalAppointmentItem {
  id: string;
  procedureId: string;
  price: number;
  notes?: string;
}

/** Appointment as returned by API - used for both Patient and Professional list */
export interface PortalAppointment {
  id: string;
  professionalId: string;
  franchiseId: string;
  patientId: string;
  patientName?: string;
  professionalName?: string;
  name: string;
  durationInMinutes: number;
  appointmentItems: PortalAppointmentItem[];
  startAt: string;
  endAt: string;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt?: string;
}

/** For Patient list: shows professional name */
export type PatientAppointment = PortalAppointment;

/** For Professional list: shows patient name */
export type ProfessionalAppointment = PortalAppointment;

/** Council and Profession for Professional profile - match backend enums */
export type Council = "CRM" | "CRBM" | "COREN" | "CREF" | "CFO";
export type Profession =
  | "DOCTOR"
  | "NURSE"
  | "PHYSIOTHERAPIST"
  | "DENTIST"
  | "MEDICO"
  | "BIOMEDICO";
