"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar, List, Plus } from "lucide-react";
import CreateAppointmentModal from "../_components/create-appointment-modal";

interface Appointment {
  id: string;
  patientName: string;
  professional: string;
  date: string;
  time: string;
    status: "Pendente" | "Confirmada" | "Cancelada" | "Concluída";
}

const mockAppointments: Appointment[] = [
  {
    id: "1",
    patientName: "Sarah Anderson",
    professional: "Dr. John Smith",
    date: "2024-02-15",
    time: "10:00",
    status: "Confirmada",
  },
  {
    id: "2",
    patientName: "Michael Johnson",
    professional: "Dr. Maria Garcia",
    date: "2024-02-15",
    time: "11:30",
    status: "Pendente",
  },
  {
    id: "3",
    patientName: "Emily Brown",
    professional: "Dr. John Smith",
    date: "2024-02-16",
    time: "14:00",
    status: "Confirmada",
  },
  {
    id: "4",
    patientName: "James Wilson",
    professional: "Dr. Maria Garcia",
    date: "2024-02-16",
    time: "15:30",
    status: "Cancelada",
  },
];

export default function AppointmentsPage() {
  const router = useRouter();
  const [appointments] = useState<Appointment[]>(mockAppointments);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed":
      case "Confirmada":
        return "bg-green-100 text-green-700";
      case "Pending":
      case "Pendente":
        return "bg-yellow-100 text-yellow-700";
      case "Cancelled":
      case "Cancelada":
        return "bg-red-100 text-red-700";
      case "Completed":
      case "Concluída":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const groupedByDate = appointments.reduce(
    (acc, apt) => {
      if (!acc[apt.date]) {
        acc[apt.date] = [];
      }
      acc[apt.date].push(apt);
      return acc;
    },
    {} as Record<string, Appointment[]>
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Consultas
            </h1>
            <p className="text-muted-foreground">
              Gerencie as consultas da sua clínica
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Consulta
          </Button>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 bg-secondary rounded-lg p-1 w-fit">
          <button
            onClick={() => setViewMode("list")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              viewMode === "list"
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <List className="w-4 h-4" />
            Visualização em Lista
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              viewMode === "calendar"
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Calendar className="w-4 h-4" />
            Visualização em Calendário
          </button>
        </div>

        {/* Appointments Display */}
        {viewMode === "list" ? (
          <div className="space-y-6">
            {Object.entries(groupedByDate).map(([date, dateAppointments]) => (
              <div key={date}>
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  {formatDate(date)}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dateAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="bg-white rounded-lg border border-border p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="mb-3">
                        <h3 className="font-semibold text-foreground text-sm mb-1">
                          {appointment.patientName}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {appointment.professional}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-foreground">
                          {appointment.time}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          {appointment.status}
                        </span>
                      </div>

                      <button
                        onClick={() =>
                          router.push(
                            `/dashboard/appointments/${appointment.id}`
                          )
                        }
                        className="w-full py-2 text-sm font-medium text-primary hover:bg-blue-50 rounded transition-colors"
                      >
                        Ver Detalhes
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-border p-8 shadow-sm">
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">
                Visualização em calendário em breve
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {appointments.length === 0 && (
          <div className="bg-white rounded-xl border border-dashed border-border p-12 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-foreground font-medium mb-2">
              Ainda não há consultas
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Crie sua primeira consulta para começar
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              Criar Consulta
            </Button>
          </div>
        )}

        {/* Create Appointment Modal */}
        <CreateAppointmentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
  );
}
