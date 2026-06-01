"use client";

import { CalendarDays, Clock3, Eye, Pencil } from "lucide-react";
import type { AppointmentDisplay } from "./appointment-utils";
import {
  formatDateCard,
  getStatusAccentBorder,
  getStatusColor,
  getStatusLabel,
} from "./appointment-utils";

export type AppointmentCardVariant = "admin" | "patient";

interface AppointmentCardProps {
  appointment: AppointmentDisplay;
  variant: AppointmentCardVariant;
  onClick?: () => void;
  onViewDetails?: (e: React.MouseEvent) => void;
  onEdit?: (e: React.MouseEvent) => void;
  onConfirmConsultation?: (e: React.MouseEvent) => void;
}

export function AppointmentCard({
  appointment,
  variant,
  onClick,
  onViewDetails,
  onEdit,
  onConfirmConsultation,
}: AppointmentCardProps) {
  const showEditButton = variant === "admin" && onEdit;
  const showConfirmButton = variant === "admin" && onConfirmConsultation;
  const statusBorder = getStatusAccentBorder(appointment.status);

  return (
    // biome-ignore lint/a11y/useSemanticElements: the card contains nested action buttons, so it cannot be a native button.
    <div
      role="button"
      tabIndex={onClick ? 0 : undefined}
      className={`group rounded-xl border border-border border-l-4 bg-card px-4 py-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md sm:px-5 ${
        onClick ? "cursor-pointer" : ""
      } ${statusBorder}`}
      onClick={onClick}
      onKeyDown={(event) => {
        if (!onClick) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <div className="grid gap-4 sm:grid-cols-[112px_minmax(0,1fr)_auto] sm:items-center">
        <div className="flex items-center gap-3 sm:block sm:text-center">
          <div className="flex h-12 min-w-20 items-center justify-center rounded-lg bg-primary/10 px-3 sm:h-auto sm:min-w-0 sm:bg-transparent sm:px-0">
            <p className="text-2xl font-bold leading-none text-foreground tabular-nums sm:text-3xl">
              {appointment.time}
            </p>
          </div>

          <div className="space-y-1 sm:mt-2">
            <p className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground sm:justify-center">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDateCard(appointment.date)}
            </p>
            <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground sm:justify-center">
              <Clock3 className="h-3.5 w-3.5" />
              {appointment.duration}
            </p>
          </div>
        </div>

        <div className="min-w-0 border-border sm:border-l sm:pl-5">
          <p className="text-lg font-semibold leading-snug text-foreground">
            {appointment.patientName}
          </p>
          <p className="mt-1 text-[15px] leading-6 text-muted-foreground">
            {appointment.professionalName}
          </p>
          {appointment.appointmentName && (
            <p className="mt-1 line-clamp-2 text-[15px] font-medium leading-6 text-foreground/80">
              {appointment.appointmentName}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <span
            className={`rounded-md px-3 py-1.5 text-sm font-semibold whitespace-nowrap ring-1 ring-current/20 ${getStatusColor(
              appointment.status,
            )}`}
          >
            {getStatusLabel(appointment.status)}
          </span>

          {showConfirmButton && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onConfirmConsultation(event);
              }}
              className="rounded-md border border-primary/20 px-3 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              Confirmar
            </button>
          )}

          {onViewDetails && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onViewDetails(event);
              }}
              className="rounded-md border border-border p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              title="Ver detalhes"
            >
              <Eye className="h-5 w-5" />
            </button>
          )}

          {showEditButton && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onEdit(event);
              }}
              className="rounded-md border border-border p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              title="Editar agendamento"
            >
              <Pencil className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
