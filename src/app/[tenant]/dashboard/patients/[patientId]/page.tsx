"use client";

import {
  ArrowLeft,
  Calendar,
  ClipboardList,
  FileText,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { AnamnesisTimeline } from "@/components/PatientProfile/AnamnesisTimeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuthContext } from "@/context/AuthContext";
import { useTenant } from "@/hooks/use-tenant";
import { createTenantLink } from "@/lib/tenant-navigation";
import {
  type Appointment,
  getAppointmentsByPatientId,
} from "@/services/appointments/appointment.service";
import {
  type AnamnesisResponse,
  getAnamnesisByPatientId,
} from "@/services/patients/anamnesis.service";
import {
  getPatientById,
  type PatientResponse,
} from "@/services/patients/patients.service";
import type { PortalAppointment } from "@/types/portal";

function formatDateBr(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateTimeBr(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })} ${d.toLocaleTimeString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function calculateAge(birthDay: string) {
  const birth = new Date(birthDay);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const month = today.getMonth() - birth.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

const APPOINTMENT_STATUS_LABEL: Record<string, string> = {
  WAITING: "Aguardando",
  CONFIRMED: "Confirmada",
  DONE: "Concluída",
  CANCELED: "Cancelada",
};

const APPOINTMENT_STATUS_CLASS: Record<string, string> = {
  WAITING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-green-100 text-green-700",
  DONE: "bg-blue-100 text-blue-700",
  CANCELED: "bg-red-100 text-red-700",
};

export default function PatientDetailPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = use(params);
  const router = useRouter();
  const { user } = useAuthContext();
  const tenant = useTenant();

  const [patient, setPatient] = useState<PatientResponse | null>(null);
  const [activeAppointments, setActiveAppointments] = useState<
    PortalAppointment[]
  >([]);
  const [pastAppointments, setPastAppointments] = useState<PortalAppointment[]>(
    [],
  );
  const [doneAppointments, setDoneAppointments] = useState<Appointment[]>([]);
  const [anamnesis, setAnamnesis] = useState<AnamnesisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) return;
    const fetchAll = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [patientData, activeData, historyData, anamnesisData] =
          await Promise.all([
            getPatientById(patientId),
            getAppointmentsByPatientId(patientId, "active"),
            getAppointmentsByPatientId(patientId, "history"),
            getAnamnesisByPatientId(patientId),
          ]);
        setPatient(patientData);
        setActiveAppointments(Array.isArray(activeData) ? activeData : []);
        const history = Array.isArray(historyData) ? historyData : [];
        setPastAppointments(history);
        setDoneAppointments(
          history.filter((a: Appointment) => a.status === "DONE"),
        );
        setAnamnesis(anamnesisData);
      } catch (err) {
        setError(
          err && typeof err === "object" && "response" in err
            ? ((err as { response?: { data?: { message?: string } } })?.response
                ?.data?.message ?? "Erro ao carregar dados do paciente.")
            : "Erro ao carregar dados do paciente.",
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, [patientId]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-border rounded animate-pulse w-48" />
        <div className="h-32 bg-border rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-border rounded-lg animate-pulse" />
          <div className="lg:col-span-2 space-y-4">
            <div className="h-48 bg-border rounded-lg animate-pulse" />
            <div className="h-48 bg-border rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (!patient) return null;

  const age = calculateAge(patient.birthDay);
  const totalRevenue = doneAppointments.reduce(
    (sum, a) =>
      sum +
      a.appointmentItems.reduce((s, item) => s + Number(item.price || 0), 0),
    0,
  );

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="gap-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Button>

      {/* Patient Header */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              {patient.name}
            </h1>
            <div className="flex items-center gap-6 flex-wrap text-foreground">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Idade:</span>
                <span className="text-lg font-semibold">{age} anos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Endereço:</span>
                <span className="text-base font-medium">
                  {patient.address || "—"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">CEP:</span>
                <span className="text-base font-medium">
                  {patient.zipCode || "—"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 shrink-0 items-end">
            <div className="bg-card rounded-lg p-6 border border-blue-200 text-center">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Receita Gerada
              </p>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                router.push(
                  createTenantLink(
                    tenant,
                    `/dashboard/patients/${patientId}/history`,
                  ),
                )
              }
              className="gap-2 border-blue-200 bg-white/70 hover:bg-white"
            >
              <ClipboardList className="w-4 h-4" />
              Ver Histórico Completo
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column — Anamnesis Timeline */}
        <div className="lg:col-span-1">
          <div className="space-y-3 mb-4">
            <h2 className="text-xl font-bold text-foreground">
              Histórico de Anamnese
            </h2>
            <p className="text-sm text-muted-foreground">
              Registro clínico do paciente
            </p>
          </div>
          <AnamnesisTimeline anamnesis={anamnesis} />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Appointments */}
          <Card className="p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">
                Agendamentos Ativos
              </h3>
            </div>
            <div className="space-y-3">
              {activeAppointments.length > 0 ? (
                activeAppointments.slice(0, 5).map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">
                        {formatDateTimeBr(apt.startAt)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {apt.professionalName ?? "—"}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ml-4 ${
                        APPOINTMENT_STATUS_CLASS[apt.status] ??
                        "bg-border text-foreground"
                      }`}
                    >
                      {APPOINTMENT_STATUS_LABEL[apt.status] ?? apt.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum agendamento ativo.
                </p>
              )}
            </div>
          </Card>

          {/* Past Appointments */}
          <Card className="p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">
                Histórico de Agendamentos
              </h3>
            </div>
            <div className="space-y-3">
              {pastAppointments.length > 0 ? (
                pastAppointments.slice(0, 6).map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">
                        {formatDateTimeBr(apt.startAt)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {apt.professionalName ?? "—"}
                        {apt.appointmentItems.length > 0 &&
                          ` · ${apt.appointmentItems.length} procedimento${
                            apt.appointmentItems.length > 1 ? "s" : ""
                          }`}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ml-4 ${
                        APPOINTMENT_STATUS_CLASS[apt.status] ??
                        "bg-border text-foreground"
                      }`}
                    >
                      {APPOINTMENT_STATUS_LABEL[apt.status] ?? apt.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum agendamento no histórico.
                </p>
              )}
            </div>
          </Card>

          {/* Comandas (DONE appointments) */}
          <Card className="p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">
                Comandas
              </h3>
            </div>
            <div className="space-y-3">
              {doneAppointments.length > 0 ? (
                doneAppointments.slice(0, 8).map((apt) => {
                  const total = apt.appointmentItems.reduce(
                    (s, item) => s + Number(item.price || 0),
                    0,
                  );
                  return (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">
                          {formatDateTimeBr(apt.startAt)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {apt.professionalName ?? "—"}
                          {apt.appointmentItems.length > 0 &&
                            ` · ${apt.appointmentItems.length} proc.`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <span className="font-bold text-foreground text-sm">
                          {formatCurrency(total)}
                        </span>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          Pago
                        </Badge>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma comanda encontrada.
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
