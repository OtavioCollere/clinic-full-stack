import type { Appointment } from "@/services/appointments/appointment.service";

export type AppointmentDisplay = {
  id: string;
  patientName: string;
  professionalName: string;
  appointmentName: string;
  date: string;
  time: string;
  duration: string;
  durationInMinutes: number;
  status: Appointment["status"];
};

export function formatAppointmentForDisplay(apt: Appointment): AppointmentDisplay {
  const startDate = new Date(apt.startAt);
  const date = startDate.toISOString().split("T")[0];
  const time = startDate.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const hours = Math.floor(apt.durationInMinutes / 60);
  const minutes = apt.durationInMinutes % 60;
  const durationText =
    hours > 0 && minutes > 0 ? `${hours}h${minutes}m` : hours > 0 ? `${hours}h` : `${minutes}min`;
  return {
    id: apt.id,
    patientName: apt.patientName || "Paciente não encontrado",
    professionalName: apt.professionalName || "Profissional não encontrado",
    appointmentName: apt.name,
    date,
    time,
    duration: durationText,
    durationInMinutes: apt.durationInMinutes,
    status: apt.status,
  };
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "CONFIRMED":
      return "bg-green-100 text-green-700";
    case "WAITING":
      return "bg-yellow-100 text-yellow-700";
    case "CANCELED":
      return "bg-red-100 text-red-700";
    case "DONE":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case "CONFIRMED":
      return "Confirmada";
    case "WAITING":
      return "Pendente";
    case "CANCELED":
      return "Cancelada";
    case "DONE":
      return "Concluída";
    default:
      return status;
  }
}

/** Cor da borda/barra de destaque por status (borda esquerda do card ou faixa no modal). */
export function getStatusAccentBorder(status: string): string {
  switch (status) {
    case "CONFIRMED":
      return "border-l-green-500";
    case "WAITING":
      return "border-l-yellow-500";
    case "CANCELED":
      return "border-l-red-500";
    case "DONE":
      return "border-l-blue-500";
    default:
      return "border-l-gray-500";
  }
}

/** Cor de fundo para faixa/barra de status (ex.: topo do modal). */
export function getStatusAccentBg(status: string): string {
  switch (status) {
    case "CONFIRMED":
      return "bg-green-500";
    case "WAITING":
      return "bg-yellow-500";
    case "CANCELED":
      return "bg-red-500";
    case "DONE":
      return "bg-blue-500";
    default:
      return "bg-gray-500";
  }
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
