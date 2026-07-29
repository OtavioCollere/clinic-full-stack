"use client";

import {
  ClipboardList,
  Plus,
  Search,
  Send,
  Stethoscope,
  Syringe,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  type CSSProperties,
  type MouseEvent,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthContext } from "@/context/AuthContext";
import { useTenant } from "@/hooks/use-tenant";
import { api } from "@/lib/api";
import { createTenantLink } from "@/lib/tenant-navigation";
import {
  type Appointment,
  getAppointmentHistoryByClinicId,
} from "@/services/appointments/appointment.service";
import { getPatients } from "@/services/patients/patients.service";

interface Patient {
  id: string;
  clinicId: string;
  userId: string;
  name: string;
  birthDay: string;
  address: string;
  zipCode: string;
  createdAt: string;
  updatedAt?: string | null;
  email?: string | null;
  cpf?: string | null;
  phone?: string | null;
  status?: "Medical Form Pending" | "Completed";
  franchiseName?: string;
  franchiseId?: string;
  isEmailVerified?: boolean;
  isAnamneseDone?: boolean;
  anamneseId?: string | null;
}

interface PatientsPageContentProps {
  portalBase: string;
  onPatientClick?: (patient: Patient) => void;
}

type ViewMode = "pacientes" | "procedimentos";

export default function PatientsPageContent({
  portalBase,
  onPatientClick,
}: PatientsPageContentProps) {
  const router = useRouter();
  const tenant = useTenant();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [franchiseFilter, setFranchiseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("pacientes");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [resendingPatientId, setResendingPatientId] = useState<string | null>(
    null,
  );
  const { user } = useAuthContext();

  useEffect(() => {
    if (!user?.clinicId) return;
    const fetchPatients = async () => {
      try {
        const response = await getPatients(user.clinicId as string, 1, 100);
        setPatients(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error("Erro ao buscar pacientes:", error);
        setPatients([]);
      }
    };
    fetchPatients();
  }, [user?.clinicId]);

  useEffect(() => {
    if (viewMode !== "procedimentos" || !user?.clinicId) return;
    setLoadingAppointments(true);
    getAppointmentHistoryByClinicId(user.clinicId as string, 1, 50)
      .then((res) => setAppointments(res.items))
      .catch(() => setAppointments([]))
      .finally(() => setLoadingAppointments(false));
  }, [viewMode, user?.clinicId]);

  const handleResendAnamnesis = async (
    event: MouseEvent<HTMLButtonElement>,
    patientId: string,
  ) => {
    event.stopPropagation();
    setResendingPatientId(patientId);
    try {
      await api.post(`/patients/${patientId}/anamnesis-token/resend`);
      toast.success("Link de anamnese reenviado com sucesso!");
    } catch {
      toast.error("Erro ao reenviar link. Tente novamente.");
    } finally {
      setResendingPatientId(null);
    }
  };

  const filteredPatients = patients.filter((patient) => {
    const patientName = patient.name?.toLowerCase() || "";
    const patientEmail = patient.email?.toLowerCase() || "";
    const patientCpf = patient.cpf || "";
    const patientPhone = patient.phone || "";
    const matchesSearch =
      patientName.includes(searchTerm.toLowerCase()) ||
      patientEmail.includes(searchTerm.toLowerCase()) ||
      patientCpf.includes(searchTerm.toLowerCase()) ||
      patientPhone.includes(searchTerm.toLowerCase());
    const matchesFranchise =
      franchiseFilter === "all" ||
      patient.franchiseId === franchiseFilter ||
      patient.franchiseName === franchiseFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "verified" && patient.isEmailVerified === true) ||
      (statusFilter === "unverified" && patient.isEmailVerified === false) ||
      (statusFilter === "anamnese-done" && patient.isAnamneseDone === true) ||
      (statusFilter === "anamnese-pending" && patient.isAnamneseDone === false);
    return matchesSearch && matchesFranchise && matchesStatus;
  });

  const uniqueFranchises = Array.from(
    patients
      .reduce((map, p) => {
        if (p.franchiseId && p.franchiseName)
          map.set(p.franchiseId, p.franchiseName);
        else if (p.franchiseName) map.set(p.franchiseName, p.franchiseName);
        return map;
      }, new Map<string, string>())
      .entries(),
  ).map(([id, name]) => ({ id, name }));

  const STATUS_OPTIONS = [
    { value: "verified", label: "E-mail Verificado" },
    { value: "unverified", label: "E-mail Não Verificado" },
    { value: "anamnese-done", label: "Anamnese Concluída" },
    { value: "anamnese-pending", label: "Anamnese Pendente" },
  ];

  const getStatusStyle = (status?: boolean): CSSProperties => {
    if (status === true)
      return { background: "var(--grn-lt)", color: "var(--grn)" };
    if (status === false)
      return { background: "var(--amb-lt)", color: "var(--amb)" };
    return { background: "var(--muted)", color: "var(--muted-foreground)" };
  };

  const getAnamneseStyle = (isDone?: boolean): CSSProperties => {
    if (isDone === true)
      return { background: "var(--grn-lt)", color: "var(--grn)" };
    if (isDone === false)
      return { background: "var(--amb-lt)", color: "var(--amb)" };
    return { background: "var(--muted)", color: "var(--muted-foreground)" };
  };

  const registerPath = createTenantLink(
    tenant,
    `${portalBase}/patients/register`,
  );

  const openPatientHistory = (
    event: MouseEvent<HTMLButtonElement>,
    patientId: string,
    tab: "procedimentos" | "anamnese",
  ) => {
    event.stopPropagation();
    router.push(
      createTenantLink(
        tenant,
        `${portalBase}/patients/${patientId}/history?tab=${tab}`,
      ),
    );
  };

  const filteredAppointments = appointments.filter((a) => {
    const term = searchTerm.toLowerCase();
    return (
      (a.patientName?.toLowerCase().includes(term) ?? false) ||
      a.name.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Pacientes</h1>
          <p className="text-muted-foreground">
            Gerencie o banco de dados e registros dos seus pacientes
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Toggle view */}
          <div className="flex items-center gap-1 p-1 bg-muted rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode("pacientes")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                viewMode === "pacientes"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users className="w-4 h-4" />
              Pacientes
            </button>
            <button
              type="button"
              onClick={() => setViewMode("procedimentos")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                viewMode === "procedimentos"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Syringe className="w-4 h-4" />
              Últimos Procedimentos
            </button>
          </div>
          {viewMode === "pacientes" && (
            <Button
              onClick={() => router.push(registerPath)}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Paciente
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative">
          {/* search always visible */}
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por nome, e-mail, telefone ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-card border-border h-11"
          />
        </div>
        {viewMode === "pacientes" && (
          <div className="flex gap-4 flex-wrap">
            <Select value={franchiseFilter} onValueChange={setFranchiseFilter}>
              <SelectTrigger className="bg-card border-border h-11 w-48">
                <SelectValue>
                  {franchiseFilter === "all"
                    ? "Todas as Franquias"
                    : (uniqueFranchises.find((f) => f.id === franchiseFilter)
                        ?.name ?? "Todas as Franquias")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Franquias</SelectItem>
                {uniqueFranchises.map(({ id, name }) => (
                  <SelectItem key={id} value={id}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-card border-border h-11 w-48">
                <SelectValue>
                  {statusFilter === "all"
                    ? "Todos os Status"
                    : (STATUS_OPTIONS.find((s) => s.value === statusFilter)
                        ?.label ?? "Todos os Status")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                {STATUS_OPTIONS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {viewMode === "pacientes" && (
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
          <div className="hidden xl:grid grid-cols-[minmax(180px,1.35fr)_minmax(130px,0.9fr)_minmax(190px,1.25fr)_minmax(120px,0.85fr)_minmax(120px,0.75fr)_minmax(115px,0.75fr)_220px] gap-4 p-6 border-b border-border bg-secondary">
            <div className="text-sm font-semibold text-foreground">
              Nome do Paciente
            </div>
            <div className="text-sm font-semibold text-foreground">
              Telefone
            </div>
            <div className="text-sm font-semibold text-foreground">E-mail</div>
            <div className="text-sm font-semibold text-foreground">
              Franquia
            </div>
            <div className="text-sm font-semibold text-foreground">
              Verificado
            </div>
            <div className="text-sm font-semibold text-foreground">
              Anamnese
            </div>
            <div className="text-sm font-semibold text-foreground">Ações</div>
          </div>

          {filteredPatients.length === 0 ? (
            <div className="p-12 text-center">
              <Search className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" />
              <p className="text-foreground font-medium mb-2">
                Nenhum paciente encontrado
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                {patients.length === 0
                  ? "Crie seu primeiro paciente para começar"
                  : "Tente ajustar sua pesquisa ou filtros"}
              </p>
              <Button
                onClick={() => router.push(registerPath)}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                Adicionar Paciente
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="grid gap-4 p-4 transition-colors hover:bg-secondary/40 sm:p-5 xl:grid-cols-[minmax(180px,1.35fr)_minmax(130px,0.9fr)_minmax(190px,1.25fr)_minmax(120px,0.85fr)_minmax(120px,0.75fr)_minmax(115px,0.75fr)_220px] xl:items-center xl:p-6"
                >
                  <div>
                    <span className="mb-1 block text-[11px] font-semibold uppercase text-muted-foreground xl:hidden">
                      Paciente
                    </span>
                    <button
                      type="button"
                      className="font-medium text-foreground text-sm text-left hover:text-primary transition-colors"
                      onClick={() => onPatientClick?.(patient)}
                    >
                      {patient.name || "N/A"}
                    </button>
                    <p className="text-xs text-muted-foreground">
                      {patient.cpf || "N/A"}
                    </p>
                  </div>
                  <div className="text-sm text-foreground">
                    <span className="mb-1 block text-[11px] font-semibold uppercase text-muted-foreground xl:hidden">
                      Telefone
                    </span>
                    {patient.phone || "N/A"}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    <span className="mb-1 block text-[11px] font-semibold uppercase text-muted-foreground xl:hidden">
                      E-mail
                    </span>
                    {patient.email || "N/A"}
                  </div>
                  <div className="text-sm text-foreground">
                    <span className="mb-1 block text-[11px] font-semibold uppercase text-muted-foreground xl:hidden">
                      Franquia
                    </span>
                    {patient.franchiseName || "N/A"}
                  </div>
                  <div>
                    <span className="mb-1 block text-[11px] font-semibold uppercase text-muted-foreground xl:hidden">
                      Verificado
                    </span>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium inline-block"
                      style={getStatusStyle(patient.isEmailVerified)}
                    >
                      {patient.isEmailVerified
                        ? "Verificado"
                        : "Não verificado"}
                    </span>
                  </div>
                  <div>
                    <span className="mb-1 block text-[11px] font-semibold uppercase text-muted-foreground xl:hidden">
                      Anamnese
                    </span>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium inline-block"
                      style={getAnamneseStyle(patient.isAnamneseDone)}
                    >
                      {patient.isAnamneseDone ? "Concluída" : "Pendente"}
                    </span>
                  </div>
                  <div>
                    <span className="mb-2 block text-[11px] font-semibold uppercase text-muted-foreground xl:hidden">
                      Ações
                    </span>
                    <div className="flex flex-col gap-1.5">
                      <div className="inline-flex h-9 w-full overflow-hidden rounded-md border border-border bg-card shadow-sm sm:w-auto">
                        <button
                          type="button"
                          className="inline-flex flex-1 items-center justify-center gap-1.5 px-3 text-xs font-medium text-foreground transition-colors hover:bg-secondary focus-visible:bg-secondary focus-visible:outline-none sm:flex-none"
                          onClick={(event) =>
                            openPatientHistory(event, patient.id, "anamnese")
                          }
                          title="Ver histórico de anamnese"
                        >
                          <ClipboardList className="h-3.5 w-3.5 text-primary" />
                          Anamnese
                        </button>
                        <div className="w-px bg-border" />
                        <button
                          type="button"
                          className="inline-flex flex-1 items-center justify-center gap-1.5 px-3 text-xs font-medium text-foreground transition-colors hover:bg-secondary focus-visible:bg-secondary focus-visible:outline-none sm:flex-none"
                          onClick={(event) =>
                            openPatientHistory(
                              event,
                              patient.id,
                              "procedimentos",
                            )
                          }
                          title="Ver histórico de procedimentos"
                        >
                          <Stethoscope className="h-3.5 w-3.5 text-primary" />
                          Procedimentos
                        </button>
                      </div>
                      {!patient.isAnamneseDone && (
                        <button
                          type="button"
                          disabled={resendingPatientId === patient.id}
                          className="inline-flex h-7 w-full items-center justify-center gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-3 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100 disabled:opacity-50 sm:w-auto dark:border-amber-600 dark:bg-amber-950 dark:text-amber-400 dark:hover:bg-amber-900"
                          onClick={(event) =>
                            handleResendAnamnesis(event, patient.id)
                          }
                          title="Reenviar link de anamnese por e-mail e WhatsApp"
                        >
                          <Send className="h-3 w-3" />
                          {resendingPatientId === patient.id
                            ? "Enviando…"
                            : "Reenviar anamnese"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {filteredPatients.length > 0 && viewMode === "pacientes" && (
        <div className="text-sm text-muted-foreground text-center">
          Mostrando {filteredPatients.length} de {patients.length} pacientes
        </div>
      )}

      {/* ─── View: Últimos Procedimentos ─── */}
      {viewMode === "procedimentos" && (
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
          <div className="hidden xl:grid grid-cols-[1fr_1fr_160px_140px] gap-4 p-5 border-b border-border bg-secondary">
            <div className="text-sm font-semibold text-foreground">
              Paciente
            </div>
            <div className="text-sm font-semibold text-foreground">
              Procedimento
            </div>
            <div className="text-sm font-semibold text-foreground">
              Profissional
            </div>
            <div className="text-sm font-semibold text-foreground">Data</div>
          </div>

          {loadingAppointments ? (
            <div className="p-10 text-center">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Carregando...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="p-12 text-center">
              <Syringe className="w-12 h-12 mx-auto text-muted-foreground opacity-30 mb-3" />
              <p className="text-foreground font-medium mb-1">
                Nenhum procedimento realizado
              </p>
              <p className="text-sm text-muted-foreground">
                {searchTerm
                  ? "Nenhum resultado para a busca"
                  : "Os procedimentos concluídos aparecerão aqui"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredAppointments.map((appt) => {
                const date = new Date(appt.startAt);
                const dateStr = date.toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                });
                return (
                  <div
                    key={appt.id}
                    className="grid gap-3 p-4 hover:bg-secondary/40 transition-colors sm:p-5 xl:grid-cols-[1fr_1fr_160px_140px] xl:items-center xl:p-5"
                  >
                    <div>
                      <span className="mb-1 block text-[11px] font-semibold uppercase text-muted-foreground xl:hidden">
                        Paciente
                      </span>
                      <p className="text-sm font-medium text-foreground">
                        {appt.patientName ?? "—"}
                      </p>
                    </div>
                    <div>
                      <span className="mb-1 block text-[11px] font-semibold uppercase text-muted-foreground xl:hidden">
                        Procedimento
                      </span>
                      <p className="text-sm text-foreground">{appt.name}</p>
                    </div>
                    <div>
                      <span className="mb-1 block text-[11px] font-semibold uppercase text-muted-foreground xl:hidden">
                        Profissional
                      </span>
                      <p className="text-sm text-muted-foreground">
                        {appt.professionalName ?? "—"}
                      </p>
                    </div>
                    <div>
                      <span className="mb-1 block text-[11px] font-semibold uppercase text-muted-foreground xl:hidden">
                        Data
                      </span>
                      <p className="text-sm text-muted-foreground">{dateStr}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
