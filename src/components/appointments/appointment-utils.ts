import type { Appointment } from "@/services/appointments/appointment.service";

const BRAZIL_TZ = "America/Sao_Paulo";

export type AppointmentDisplay = {
  id: string;
  professionalId: string;
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
  const date = startDate.toLocaleDateString("en-CA", { timeZone: BRAZIL_TZ });
  const time = startDate.toLocaleTimeString("pt-BR", {
    timeZone: BRAZIL_TZ,
    hour: "2-digit",
    minute: "2-digit",
  });
  const hours = Math.floor(apt.durationInMinutes / 60);
  const minutes = apt.durationInMinutes % 60;
  const durationText =
    hours > 0 && minutes > 0 ? `${hours}h${minutes}m` : hours > 0 ? `${hours}h` : `${minutes}min`;
  return {
    id: apt.id,
    professionalId: apt.professionalId,
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
      return "bg-emerald-500/15 text-emerald-400";
    case "WAITING":
      return "bg-amber-500/15 text-amber-400";
    case "CANCELED":
      return "bg-red-500/15 text-red-400";
    case "DONE":
      return "bg-primary/15 text-primary";
    default:
      return "bg-border text-muted-foreground";
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
  return new Date(dateStr + "T12:00:00").toLocaleDateString("pt-BR", {
    timeZone: BRAZIL_TZ,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Data em formato curto BR (dd/MM/yyyy) para uso em cards. */
export function formatDateShort(dateStr: string): string {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("pt-BR", {
    timeZone: BRAZIL_TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** Data compacta para card: "ter., 28 abr." */
export function formatDateCard(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const weekday = d.toLocaleDateString("pt-BR", { timeZone: BRAZIL_TZ, weekday: "short" });
  const day = d.toLocaleDateString("pt-BR", { timeZone: BRAZIL_TZ, day: "numeric" });
  const month = d.toLocaleDateString("pt-BR", { timeZone: BRAZIL_TZ, month: "short" });
  return `${weekday} ${day} ${month}`;
}
