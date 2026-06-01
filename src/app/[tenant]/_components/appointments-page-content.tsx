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
import { Calendar, History, List, Plus } from "lucide-react";
import CreateAppointmentModal from "@/app/[tenant]/dashboard/_components/create-appointment-modal";
import EditAppointmentModal from "@/app/[tenant]/dashboard/_components/edit-appointment-modal";
import ViewAppointmentDetailsModal from "@/app/[tenant]/dashboard/_components/view-appointment-details-modal";
import CreateServiceOrderModal from "@/app/[tenant]/dashboard/_components/create-service-order-modal";
import { useTenant } from "@/hooks/use-tenant";
import { createTenantLink } from "@/lib/tenant-navigation";
import {
  getAppointmentsByClinicId,
  getAppointmentHistoryByClinicId,
  editAppointment,
  confirmAppointment,
  type Appointment,
} from "@/services/appointments/appointment.service";
import { AppointmentCard } from "@/components/appointments/AppointmentCard";
import { formatAppointmentForDisplay, formatDate } from "@/components/appointments/appointment-utils";
import { useAuthContext } from "@/context/AuthContext";
import { getFranchises } from "@/services/franchise/franchise.service";
import { toast } from "sonner";
import CalendarFC from "./calendarFC";

const BRAZIL_TZ = "America/Sao_Paulo";

function getTodayStr(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: BRAZIL_TZ });
}

function getWeekBounds(): [string, string] {
  const todayStr = getTodayStr();
  const [y, m, d] = todayStr.split("-").map(Number);
  const today = new Date(y, m - 1, d);
  const dayOfWeek = today.getDay();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(y, m - 1, d - daysFromMonday);
  const sunday = new Date(y, m - 1, d - daysFromMonday + 6);
  const fmt = (dt: Date) =>
    `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
  return [fmt(monday), fmt(sunday)];
}

interface Franchise {
  id: string;
  name: string;
}

/** Base path do portal (ex: /dashboard, /professional, /patient) para montar links */
interface AppointmentsPageContentProps {
  portalBase: string;
  /** Quando true, esconde botões de criar/editar/confirmar — somente visualização */
  readonly?: boolean;
  /** Quando informado, habilita criar e mostra editar apenas para as consultas deste profissional */
  ownProfessionalId?: string;
  /** Quando informado, filtra a lista para exibir apenas consultas deste profissional */
  filterProfessionalId?: string;
  /** Quando true, oculta o título e a descrição da seção */
  hideTitle?: boolean;
  /** Quando true, colapsa os controles em uma única linha sem filtro de franquia */
  simplified?: boolean;
}

export default function AppointmentsPageContent({ portalBase, readonly = false, ownProfessionalId, filterProfessionalId, hideTitle = false, simplified = false }: AppointmentsPageContentProps) {
  const router = useRouter();
  const tenant = useTenant();
  const { user } = useAuthContext();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [franchiseFilter, setFranchiseFilter] = useState("all");
  const [section, setSection] = useState<"upcoming" | "history">("upcoming");
  const [historyPage, setHistoryPage] = useState(1);
  const [historyData, setHistoryData] = useState<{
    items: Appointment[];
    total: number;
    totalPages: number;
    perPage: number;
  } | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [listDateFilter, setListDateFilter] = useState<"today" | "week" | "date">("today");
  const [filterDate, setFilterDate] = useState<string>(getTodayStr());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isServiceOrderModalOpen, setIsServiceOrderModalOpen] = useState(false);
  const [selectedAppointmentForServiceOrder, setSelectedAppointmentForServiceOrder] =
    useState<Appointment | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [initialSlot, setInitialSlot] = useState<{ start: Date; end: Date } | null>(null);

  const HISTORY_PER_PAGE = 20;
  useEffect(() => {
    if (!user?.clinicId) return;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [appointmentsResponse, franchisesResponse] = await Promise.all([
          getAppointmentsByClinicId(user.clinicId as string, { period: "all" }),
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

  useEffect(() => {
    if (!user?.clinicId || section !== "history") return;
    const fetchHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const data = await getAppointmentHistoryByClinicId(
          user.clinicId as string,
          historyPage,
          HISTORY_PER_PAGE
        );
        setHistoryData({
          items: data.items,
          total: data.total,
          totalPages: data.totalPages,
          perPage: data.perPage,
        });
      } catch (error) {
        console.error("Erro ao buscar histórico:", error);
        setHistoryData({ items: [], total: 0, totalPages: 0, perPage: HISTORY_PER_PAGE });
      } finally {
        setIsLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [user?.clinicId, section, historyPage]);

  const filteredAppointments = appointments.filter(
    (apt) =>
      (franchiseFilter === "all" || apt.franchiseId === franchiseFilter) &&
      (!filterProfessionalId || apt.professionalId === filterProfessionalId)
  );

  const getTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  };

  const listFilteredAppointments = filteredAppointments.filter((apt) => {
    const { date } = formatAppointmentForDisplay(apt);
    if (listDateFilter === "today") return date === getTodayStr();
    if (listDateFilter === "tomorrow") return date === getTomorrowStr();
    if (listDateFilter === "week") {
      const [start, end] = getWeekBounds();
      return date >= start && date <= end;
    }
    if (listDateFilter === "date" && filterDate) return date === filterDate;
    return true;
  });

  const groupedByDate = listFilteredAppointments.reduce(
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

  const sortAppointmentsChronologically = (
    list: ReturnType<typeof formatAppointmentForDisplay>[]
  ) =>
    [...list].sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });

  const refreshAppointments = () => {
    if (user?.clinicId) {
      getAppointmentsByClinicId(user.clinicId as string, { period: "all" }).then(
        (response) => {
          setAppointments(Array.isArray(response) ? response : []);
        }
      );
    }
    if (section === "history" && user?.clinicId) {
      getAppointmentHistoryByClinicId(user.clinicId, historyPage, HISTORY_PER_PAGE).then(
        (data) => {
          setHistoryData({
            items: data.items,
            total: data.total,
            totalPages: data.totalPages,
            perPage: data.perPage,
          });
        }
      );
    }
  };

  const handleCalendarEventClick = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setIsDetailsModalOpen(true);
  };

  const handleCalendarSelectSlot = (start: Date, end: Date) => {
    setInitialSlot({ start, end });
    setIsModalOpen(true);
  };

  const canEdit = (professionalId: string) => {
    if (readonly) return false;
    if (ownProfessionalId) return professionalId === ownProfessionalId;
    return true;
  };

  const handleCalendarEventChange = async (
    appointmentId: string,
    startAt: string,
    durationInMinutes: number
  ) => {
    const apt = filteredAppointments.find((a) => a.id === appointmentId);
    if (!apt) return;
    if (!canEdit(apt.professionalId)) return;

    try {
      await editAppointment(appointmentId, {
        professionalId: apt.professionalId,
        franchiseId: apt.franchiseId,
        patientId: apt.patientId,
        name: apt.name,
        appointmentItems: apt.appointmentItems.map((item) => ({
          procedureId: item.procedureId,
          price: item.price,
          notes: item.notes,
        })),
        startAt,
        durationInMinutes,
      });
      toast.success("Horário atualizado com sucesso.");
      refreshAppointments();
    } catch (error: any) {
      console.error("Erro ao atualizar horário:", error);
      const errorMessage =
        error?.response?.data?.message ||
        "Não foi possível atualizar o horário. Tente novamente.";
      toast.error(errorMessage);
      refreshAppointments();
    }
  };

  return (
    <div className="space-y-5">
      {!hideTitle && (
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Consultas</h1>
          <p className="text-muted-foreground text-sm">Gerencie as consultas da sua clínica</p>
        </div>
      )}

      {simplified ? (
        /* ── Toolbar simplificada (uma linha) ── */
        <div className="flex items-center gap-2 flex-wrap justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-1 bg-secondary rounded-lg p-1">
              <button
                onClick={() => setSection("upcoming")}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${section === "upcoming" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Calendar className="w-4 h-4" />
                Próximas
              </button>
              <button
                onClick={() => setSection("history")}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${section === "history" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                <History className="w-4 h-4" />
                Histórico
              </button>
            </div>

            {section === "upcoming" && (
              <>
                <div className="flex gap-1 bg-secondary rounded-lg p-1">
                  <button onClick={() => setListDateFilter("today")} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${listDateFilter === "today" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>Hoje</button>
                  <button onClick={() => setListDateFilter("week")} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${listDateFilter === "week" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>Semana</button>
                  <button onClick={() => setListDateFilter("date")} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${listDateFilter === "date" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>Data</button>
                </div>
                {listDateFilter === "date" && (
                  <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="h-9 rounded-md border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                )}
                <div className="flex gap-1 bg-secondary rounded-lg p-1">
                  <button onClick={() => setViewMode("list")} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${viewMode === "list" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}><List className="w-4 h-4" />Lista</button>
                  <button onClick={() => setViewMode("calendar")} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${viewMode === "calendar" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}><Calendar className="w-4 h-4" />Calendário</button>
                </div>
              </>
            )}
          </div>

          {(!readonly || ownProfessionalId) && section === "upcoming" && (
            <Button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90 text-white h-9">
              <Plus className="w-4 h-4 mr-2" />
              Nova Consulta
            </Button>
          )}
        </div>
      ) : (
      <>
      {/* Linha 1: Seção + Franquia (esquerda) | Visualização (direita) */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-1 bg-secondary rounded-lg p-1">
            <button
              onClick={() => setSection("upcoming")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                section === "upcoming"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Calendar className="w-4 h-4" />
              Próximas consultas
            </button>
            <button
              onClick={() => setSection("history")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                section === "history"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <History className="w-4 h-4" />
              Histórico
            </button>
          </div>
          <Select value={franchiseFilter} onValueChange={setFranchiseFilter}>
            <SelectTrigger className="bg-card border-border h-9 text-sm w-44">
              <SelectValue placeholder="Todas as franquias" />
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

        {section === "upcoming" && (
          <div className="flex gap-1 bg-secondary rounded-lg p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                viewMode === "list"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="w-4 h-4" />
              Lista
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                viewMode === "calendar"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Calendar className="w-4 h-4" />
              Calendário
            </button>
          </div>
        )}
      </div>

      {/* Linha 2: Filtros de data (esquerda) | Nova Consulta (direita) */}
      {section === "upcoming" && viewMode === "list" && (
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-1 bg-secondary rounded-lg p-1">
              <button
                onClick={() => setListDateFilter("today")}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  listDateFilter === "today"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Hoje
              </button>
              <button
                onClick={() => setListDateFilter("tomorrow")}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  listDateFilter === "tomorrow"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Amanhã
              </button>
              <button
                onClick={() => setListDateFilter("week")}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  listDateFilter === "week"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => setListDateFilter("date")}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  listDateFilter === "date"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Filtrar por data
              </button>
            </div>
            {listDateFilter === "date" && (
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="h-9 rounded-md border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            )}
          </div>
          {(!readonly || ownProfessionalId) && (
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-white h-9"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Consulta
            </Button>
          )}
        </div>
      )}

      {/* Calendário: botão nova consulta separado */}
      {section === "upcoming" && viewMode === "calendar" && (!readonly || ownProfessionalId) && (
        <div className="flex justify-end">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white h-9"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Consulta
          </Button>
        </div>
      )}
      </>
      )}

      {section === "history" ? (
        <div className="space-y-6">
          {isLoadingHistory ? (
            <div className="bg-card rounded-xl border border-border p-8 shadow-sm">
              <div className="text-center py-12">
                <p className="text-muted-foreground">Carregando histórico...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {(historyData?.items ?? [])
                  .filter(
                    (apt) =>
                      franchiseFilter === "all" || apt.franchiseId === franchiseFilter
                  )
                  .map((apt) => {
                    const formatted = formatAppointmentForDisplay(apt);
                    return (
                      <AppointmentCard
                        key={apt.id}
                        appointment={formatted}
                        variant="admin"
                        onClick={() => {
                          setSelectedAppointmentId(apt.id);
                          setIsDetailsModalOpen(true);
                        }}
                        onViewDetails={(e) => {
                          e.stopPropagation();
                          setSelectedAppointmentId(apt.id);
                          setIsDetailsModalOpen(true);
                        }}
                        onEdit={canEdit(apt.professionalId) ? (e) => {
                          e.stopPropagation();
                          setSelectedAppointmentId(apt.id);
                          setIsEditModalOpen(true);
                        } : undefined}
                      />
                    );
                  })}
              </div>
              {historyData && historyData.total > 0 && (
                <div className="flex items-center justify-between gap-4 flex-wrap border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground">
                    {historyData.total} consulta(s) no total • Página {historyPage} de{" "}
                    {historyData.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                      disabled={historyPage <= 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setHistoryPage((p) =>
                          Math.min(historyData.totalPages, p + 1)
                        )
                      }
                      disabled={historyPage >= historyData.totalPages}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
              {historyData?.total === 0 && (
                <div className="bg-card rounded-xl border border-dashed border-border p-12 text-center">
                  <History className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-foreground font-medium mb-2">Nenhuma consulta no histórico</p>
                  <p className="text-sm text-muted-foreground">
                    As consultas passadas aparecerão aqui, da mais recente para a mais antiga.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
      <>
      {isLoading ? (
        <div className="bg-card rounded-xl border border-border p-8 shadow-sm">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando consultas...</p>
          </div>
        </div>
      ) : viewMode === "list" ? (
        <div className="space-y-6">
          {sortedDateEntries.map(([date, dateAppointments]) => (
            <div key={date}>
              <h2 className="text-lg font-semibold text-foreground mb-3">{formatDate(date)}</h2>
              <div className="space-y-3">
                {sortAppointmentsChronologically(dateAppointments).map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    variant="admin"
                    onClick={() => {
                      setSelectedAppointmentId(appointment.id);
                      setIsDetailsModalOpen(true);
                    }}
                    onViewDetails={(e) => {
                      e.stopPropagation();
                      setSelectedAppointmentId(appointment.id);
                      setIsDetailsModalOpen(true);
                    }}
                    onEdit={canEdit(appointment.professionalId) ? (e) => {
                      e.stopPropagation();
                      setSelectedAppointmentId(appointment.id);
                      setIsEditModalOpen(true);
                    } : undefined}
                    onConfirmConsultation={!readonly && !ownProfessionalId ? (e) => {
                      e.stopPropagation();
                      const fullAppointment = filteredAppointments.find(
                        (a) => a.id === appointment.id
                      );
                      if (fullAppointment) {
                        setSelectedAppointmentForServiceOrder(fullAppointment);
                        setIsServiceOrderModalOpen(true);
                      }
                    } : undefined}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border p-8 shadow-sm">
          <CalendarFC
            appointments={filteredAppointments}
            isLoading={isLoading}
            onEventClick={handleCalendarEventClick}
            onSelectSlot={handleCalendarSelectSlot}
            onEventChange={handleCalendarEventChange}
          />
        </div>
      )}

      {!isLoading && viewMode === "list" && listFilteredAppointments.length === 0 && (
        <div className="bg-card rounded-xl border border-dashed border-border p-12 text-center">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-foreground font-medium mb-2">Nenhuma consulta encontrada</p>
          <p className="text-sm text-muted-foreground mb-6">
            {listDateFilter === "today"
              ? "Não há consultas agendadas para hoje."
              : listDateFilter === "week"
              ? "Não há consultas agendadas para esta semana."
              : "Não há consultas para a data selecionada."}
          </p>
          {(!readonly || ownProfessionalId) && (
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              Criar Consulta
            </Button>
          )}
        </div>
      )}
      </>
      )}

      <CreateAppointmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setInitialSlot(null);
          refreshAppointments();
        }}
        initialStartAt={initialSlot?.start.toISOString()}
        initialDurationMinutes={
          initialSlot
            ? Math.round((initialSlot.end.getTime() - initialSlot.start.getTime()) / 60000)
            : undefined
        }
        lockedProfessionalId={ownProfessionalId}
        lockedProfessionalName={ownProfessionalId ? user?.name ?? undefined : undefined}
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
          onEdit={canEdit(filteredAppointments.find((a) => a.id === selectedAppointmentId)?.professionalId ?? "") ? (id) => {
            setIsDetailsModalOpen(false);
            setSelectedAppointmentId(id);
            setIsEditModalOpen(true);
          } : undefined}
          onConfirm={!readonly && !ownProfessionalId ? async (id) => {
            const apt = filteredAppointments.find((a) => a.id === id);
            if (!apt) return;
            await confirmAppointment(id, apt.patientId);
            refreshAppointments();
          } : undefined}
          onCreateServiceOrder={!readonly && !ownProfessionalId ? (appointment) => {
            setSelectedAppointmentForServiceOrder(appointment);
            setIsServiceOrderModalOpen(true);
            setIsDetailsModalOpen(false);
            setSelectedAppointmentId(null);
          } : undefined}
        />
      )}

      {selectedAppointmentForServiceOrder && (
        <CreateServiceOrderModal
          isOpen={isServiceOrderModalOpen}
          onClose={() => {
            setIsServiceOrderModalOpen(false);
            setSelectedAppointmentForServiceOrder(null);
          }}
          appointment={selectedAppointmentForServiceOrder}
          onSuccess={refreshAppointments}
        />
      )}
    </div>
  );
}
