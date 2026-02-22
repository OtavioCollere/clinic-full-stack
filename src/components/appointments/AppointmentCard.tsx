"use client";

import { Pencil } from "lucide-react";
import type { AppointmentDisplay } from "./appointment-utils";
import { getStatusColor, getStatusLabel, getStatusAccentBorder } from "./appointment-utils";

export type AppointmentCardVariant = "admin" | "patient";

interface AppointmentCardProps {
  appointment: AppointmentDisplay;
  variant: AppointmentCardVariant;
  onClick?: () => void;
  onViewDetails?: (e: React.MouseEvent) => void;
  onEdit?: (e: React.MouseEvent) => void;
}

export function AppointmentCard({
  appointment,
  variant,
  onClick,
  onViewDetails,
  onEdit,
}: AppointmentCardProps) {
  const showPatientLine = variant === "admin" && appointment.appointmentName !== appointment.patientName;
  const showEditButton = variant === "admin" && onEdit;
  const statusBorder = getStatusAccentBorder(appointment.status);

  return (
    <div
      role={onClick ? "button" : undefined}
      className={`bg-white rounded-lg border border-border border-l-4 p-5 shadow-sm hover:shadow-lg transition-all cursor-pointer hover:border-primary/50 ${statusBorder}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground text-base mb-1">
            {appointment.appointmentName}
          </h3>
          {showPatientLine && (
            <p className="text-sm text-muted-foreground mb-1">{appointment.patientName}</p>
          )}
        </div>
        <span
          className={`px-3 py-1.5 rounded-md text-sm font-semibold whitespace-nowrap ring-1 ring-current/20 ${getStatusColor(
            appointment.status
          )}`}
        >
          {getStatusLabel(appointment.status)}
        </span>
      </div>
      <div className="space-y-2 mb-4">
        {variant === "admin" && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Paciente:</span>
            <span className="font-medium text-foreground">{appointment.patientName}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Profissional:</span>
          <span className="font-medium text-foreground">{appointment.professionalName}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Horário:</span>
          <span className="font-medium text-foreground">{appointment.time}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Duração:</span>
          <span className="font-medium text-foreground">{appointment.duration}</span>
        </div>
      </div>
      {(onViewDetails || showEditButton) && (
        <div className="pt-3 border-t border-border flex gap-2" onClick={(e) => e.stopPropagation()}>
          {onViewDetails && (
            <button
              onClick={onViewDetails}
              className="flex-1 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded transition-colors"
            >
              Ver Detalhes
            </button>
          )}
          {showEditButton && (
            <button
              onClick={onEdit}
              className="px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded transition-colors border border-border"
              title="Editar agendamento"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
