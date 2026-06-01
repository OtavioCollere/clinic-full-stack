"use client";

import { ArrowLeft, ClipboardList, Stethoscope } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { use, useEffect, useState } from "react";
import { AnamnesisTimeline } from "@/components/PatientProfile/AnamnesisTimeline";
import { Button } from "@/components/ui/button";
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

function formatDateTimeBr(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric" })} ${d.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" })}`;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

type Tab = "procedimentos" | "anamnese";

export default function PatientHistoryPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab =
    searchParams.get("tab") === "anamnese" ? "anamnese" : "procedimentos";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [patient, setPatient] = useState<PatientResponse | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [anamnesis, setAnamnesis] = useState<AnamnesisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const nextTab =
      searchParams.get("tab") === "anamnese" ? "anamnese" : "procedimentos";
    setTab(nextTab);
  }, [searchParams]);

  useEffect(() => {
    if (!patientId) return;
    Promise.all([
      getPatientById(patientId),
      getAppointmentsByPatientId(patientId, "history"),
      getAnamnesisByPatientId(patientId),
    ])
      .then(([p, appts, ana]) => {
        setPatient(p);
        const list = Array.isArray(appts) ? appts : [];
        setAppointments(list.filter((a: Appointment) => a.status === "DONE"));
        setAnamnesis(ana);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [patientId]);

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

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Histórico{patient ? ` — ${patient.name}` : ""}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Procedimentos realizados e dados clínicos do paciente
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-muted rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setTab("procedimentos")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === "procedimentos"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          Procedimentos
        </button>
        <button
          type="button"
          onClick={() => setTab("anamnese")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === "anamnese"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          Anamnese
        </button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      )}

      {/* Procedimentos tab */}
      {!isLoading && tab === "procedimentos" && (
        <div className="space-y-4">
          {appointments.length === 0 && (
            <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center">
              <Stethoscope className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-foreground font-medium mb-1">
                Nenhum procedimento realizado
              </p>
              <p className="text-sm text-muted-foreground">
                Os procedimentos concluídos aparecerão aqui
              </p>
            </div>
          )}

          {appointments.map((appt) => {
            const total = appt.appointmentItems.reduce(
              (s, i) => s + Number(i.price || 0),
              0,
            );
            return (
              <div
                key={appt.id}
                className="bg-card border border-border rounded-xl p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">{appt.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTimeBr(appt.startAt)}
                      {appt.professionalName && (
                        <span className="ml-2">· {appt.professionalName}</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(total)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {appt.appointmentItems.length} item
                      {appt.appointmentItems.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {appt.appointmentItems.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border space-y-1">
                    {appt.appointmentItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-muted-foreground">
                          {item.notes || "Procedimento"}
                        </span>
                        <span className="font-medium text-foreground">
                          {formatCurrency(Number(item.price))}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Anamnese tab */}
      {!isLoading && tab === "anamnese" && (
        <AnamnesisTimeline anamnesis={anamnesis} />
      )}
    </div>
  );
}
