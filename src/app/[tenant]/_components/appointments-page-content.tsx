"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, List, Plus } from "lucide-react";
import CreateAppointmentModal from "@/app/[tenant]/dashboard/_components/create-appointment-modal";
import EditAppointmentModal from "@/app/[tenant]/dashboard/_components/edit-appointment-modal";
import ViewAppointmentDetailsModal from "@/app/[tenant]/dashboard/_components/view-appointment-details-modal";
import { useTenant } from "@/hooks/use-tenant";
import { createTenantLink } from "@/lib/tenant-navigation";
import {
  getAppointmentsByClinicId,
  type Appointment,
} from "@/services/appointments/appointment.service";
import { AppointmentCard } from "@/components/appointments/AppointmentCard";
import { formatAppointmentForDisplay, formatDate } from "@/components/appointments/appointment-utils";
import { useAuthContext } from "@/context/AuthContext";
import { getFranchises } from "@/services/franchise/franchise.service";

interface Franchise {
  id: string;
  name: string;
}

/** Base path do portal (ex: /dashboard, /professional, /patient) para montar links */
interface AppointmentsPageContentProps {
  portalBase: string;
}

export default function AppointmentsPageContent({ portalBase }: AppointmentsPageContentProps) {
  const router = useRouter();
  const tenant = useTenant();
  const { user } = useAuthContext();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [franchiseFilter, setFranchiseFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.clinicId) return;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [appointmentsResponse, franchisesResponse] = await Promise.all([
          getAppointmentsByClinicId(user.clinicId as string),
          getFranchises(user.clinicId as string),
        ]);
        setAppointments(Array.isArray(appointmentsResponse) ? appointmentsResponse : []);
        setFranchises(franchisesResponse ?? []);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        setAppointments([]);
        setFranchises([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user?.clinicId]);

  const filteredAppointments = appointments.filter(
    (apt) => franchiseFilter === "all" || apt.franchiseId === franchiseFilter
  );

  const groupedByDate = filteredAppointments.reduce(
    (acc, apt) => {
      const formatted = formatAppointmentForDisplay(apt);
      if (!acc[formatted.date]) acc[formatted.date] = [];
      acc[formatted.date].push(formatted);
      return acc;
    },
    {} as Record<string, ReturnType<typeof formatAppointmentForDisplay>[]>
  );

  const sortedDateEntries = Object.entries(groupedByDate).sort(([dateA], [dateB]) =>
    dateA.localeCompare(dateB)
  );

  const refreshAppointments = () => {
    if (user?.clinicId) {
      getAppointmentsByClinicId(user.clinicId as string).then((response) => {
        setAppointments(Array.isArray(response) ? response : []);
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Consultas</h1>
          <p className="text-muted-foreground">Gerencie as consultas da sua clínica</p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Consulta
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex-1 max-w-xs">
          <Select value={franchiseFilter} onValueChange={setFranchiseFilter}>
            <SelectTrigger className="bg-white border-border h-10">
              <SelectValue placeholder="Filtrar por franquia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as franquias</SelectItem>
              {franchises.map((franchise) => (
                <SelectItem key={franchise.id} value={franchise.id}>
                  {franchise.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

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

      {isLoading ? (
        <div className="bg-white rounded-xl border border-border p-8 shadow-sm">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando consultas...</p>
          </div>
        </div>
      ) : viewMode === "list" ? (
        <div className="space-y-6">
          {sortedDateEntries.map(([date, dateAppointments]) => (
            <div key={date}>
              <h2 className="text-lg font-semibold text-foreground mb-3">{formatDate(date)}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dateAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    variant="admin"
                    onClick={() =>
                      router.push(
                        createTenantLink(tenant, `${portalBase}/appointments/${appointment.id}`)
                      )
                    }
                    onViewDetails={(e) => {
                      e.stopPropagation();
                      setSelectedAppointmentId(appointment.id);
                      setIsDetailsModalOpen(true);
                    }}
                    onEdit={(e) => {
                      e.stopPropagation();
                      setSelectedAppointmentId(appointment.id);
                      setIsEditModalOpen(true);
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border p-8 shadow-sm">
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">Visualização em calendário em breve</p>
          </div>
        </div>
      )}

      {!isLoading && filteredAppointments.length === 0 && (
        <div className="bg-white rounded-xl border border-dashed border-border p-12 text-center">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-foreground font-medium mb-2">Ainda não há consultas</p>
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

      <CreateAppointmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          refreshAppointments();
        }}
      />

      {selectedAppointmentId && (
        <EditAppointmentModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedAppointmentId(null);
          }}
          appointmentId={selectedAppointmentId}
          onUpdated={refreshAppointments}
        />
      )}

      {selectedAppointmentId && (
        <ViewAppointmentDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedAppointmentId(null);
          }}
          appointmentId={selectedAppointmentId}
          onEdit={(id) => {
            setIsDetailsModalOpen(false);
            setSelectedAppointmentId(id);
            setIsEditModalOpen(true);
          }}
        />
      )}
    </div>
  );
}
