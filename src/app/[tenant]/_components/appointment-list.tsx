import { CalendarDays, Clock3, Eye, ReceiptText } from "lucide-react";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type {
  AppointmentStatus,
  PortalAppointment,
  UserRole,
} from "@/types/portal";

function formatDate(d: Date) {
  return d.toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
function formatTime(d: Date) {
  return d.toLocaleTimeString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface AppointmentsListProps {
  appointments: PortalAppointment[];
  role: UserRole;
  isLoading?: boolean;
  onViewDetails: (appointment: PortalAppointment) => void;
  emptyMessage?: string;
}

const getStatusColor = (status: AppointmentStatus) => {
  switch (status) {
    case "WAITING":
      return "bg-amber-100 text-amber-800 ring-amber-200";
    case "CONFIRMED":
      return "bg-blue-100 text-blue-800 ring-blue-200";
    case "DONE":
      return "bg-emerald-100 text-emerald-800 ring-emerald-200";
    case "CANCELED":
      return "bg-red-100 text-red-800 ring-red-200";
    default:
      return "bg-border text-gray-800 ring-border";
  }
};

const getStatusLabel = (status: AppointmentStatus) => {
  switch (status) {
    case "WAITING":
      return "Pendente";
    case "CONFIRMED":
      return "Confirmado";
    case "DONE":
      return "Realizado";
    case "CANCELED":
      return "Cancelado";
    default:
      return status;
  }
};

export const AppointmentsList: React.FC<AppointmentsListProps> = ({
  appointments,
  role,
  isLoading = false,
  onViewDetails,
  emptyMessage = "Você não possui agendamentos.",
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-slate-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </Card>
    );
  }

  const totalFor = (apt: PortalAppointment) =>
    apt.appointmentItems.reduce((sum, i) => sum + Number(i.price || 0), 0);

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => {
        const dateStart = new Date(appointment.startAt);
        const dateEnd = new Date(appointment.endAt);
        const formattedDate = formatDate(dateStart);
        const formattedTime = `${formatTime(dateStart)} - ${formatTime(dateEnd)}`;
        const total = totalFor(appointment);

        return (
          <Card
            key={appointment.id}
            className="overflow-hidden border border-border bg-card p-0 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md"
          >
            <div className="grid gap-0 sm:grid-cols-[132px_minmax(0,1fr)]">
              <div className="flex items-center justify-between gap-3 border-border bg-muted/30 p-4 sm:block sm:border-r">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {formattedDate}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-foreground tabular-nums">
                    {formatTime(dateStart)}
                  </p>
                  <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock3 className="h-3.5 w-3.5" />
                    até {formatTime(dateEnd)}
                  </p>
                </div>
                <Badge
                  className={`ring-1 ${getStatusColor(appointment.status)}`}
                >
                  {getStatusLabel(appointment.status)}
                </Badge>
              </div>

              <div className="space-y-4 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-lg font-semibold leading-snug text-foreground">
                      {role === "PATIENT"
                        ? appointment.professionalName || "Profissional"
                        : appointment.patientName || "Paciente"}
                    </p>
                    <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formattedTime}
                    </p>
                  </div>
                  <Button
                    onClick={() => onViewDetails(appointment)}
                    size="sm"
                    className="shrink-0 gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Detalhes
                  </Button>
                </div>

                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  <div className="rounded-lg bg-muted/30 p-3">
                    <p className="text-xs font-medium text-muted-foreground">
                      Unidade
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {appointment.franchiseId || "—"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/30 p-3">
                    <p className="text-xs font-medium text-muted-foreground">
                      Serviços
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {appointment.appointmentItems.length} procedimento
                      {appointment.appointmentItems.length > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-4">
                  <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <ReceiptText className="h-4 w-4" />
                    Total
                  </p>
                  <p className="text-xl font-bold text-primary tabular-nums">
                    R$ {total.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
