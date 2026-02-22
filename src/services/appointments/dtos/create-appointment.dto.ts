export interface AppointmentItem {
  procedureId: string;
  price: number;
  notes?: string;
}

export interface CreateAppointmentDto {
  professionalId: string;
  franchiseId: string;
  patientId: string;
  name: string;
  appointmentItems: AppointmentItem[];
  startAt: string;
  durationInMinutes: number;
}



