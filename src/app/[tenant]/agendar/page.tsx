"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { Check, ChevronRight, Clock, User, Stethoscope, Scissors, Calendar, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getBookingInfo,
  lookupPatientByCpf,
  createPublicAppointment,
  type BookingClinicInfo,
  type BookingPatient,
} from "@/services/booking/booking.service";

// ── Types ────────────────────────────────────────────────────────────────────

type Step = "cpf" | "professional" | "procedure" | "datetime" | "confirm" | "success";

interface SelectedProfessional {
  id: string;
  name: string;
  profession: string;
  franchiseId: string;
}

interface SelectedProcedure {
  id: string;
  name: string;
  price: number;
  durationInMinutes: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function maskCPF(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function generateTimeSlots(durationMinutes: number): string[] {
  const slots: string[] = [];
  const start = 8 * 60; // 8h
  const end = 18 * 60;  // 18h
  for (let t = start; t + durationMinutes <= end; t += durationMinutes) {
    const h = String(Math.floor(t / 60)).padStart(2, "0");
    const m = String(t % 60).padStart(2, "0");
    slots.push(`${h}:${m}`);
  }
  return slots;
}

function buildStartAt(date: string, time: string) {
  return new Date(`${date}T${time}:00`).toISOString();
}

function getMinDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

function professionLabel(p: string) {
  if (p === "BIOMEDICO") return "Biomédico(a)";
  if (p === "MEDICO") return "Médico(a)";
  return p;
}

// ── Step indicator ────────────────────────────────────────────────────────────

const STEPS: { id: Step; label: string }[] = [
  { id: "cpf",          label: "Identificação" },
  { id: "professional", label: "Profissional" },
  { id: "procedure",    label: "Procedimento" },
  { id: "datetime",     label: "Data & Hora" },
  { id: "confirm",      label: "Confirmação" },
];

const STEP_ORDER: Step[] = ["cpf", "professional", "procedure", "datetime", "confirm", "success"];

function StepBar({ current }: { current: Step }) {
  const idx = STEP_ORDER.indexOf(current);
  return (
    <div className="flex items-center gap-0 mb-10">
      {STEPS.map((s, i) => {
        const done = i < idx;
        const active = s.id === current;
        return (
          <div key={s.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  done
                    ? "bg-blue-600 text-white"
                    : active
                    ? "bg-blue-600 text-white ring-4 ring-blue-100"
                    : "bg-border text-muted-foreground"
                }`}
              >
                {done ? <Check size={14} /> : <span>{i + 1}</span>}
              </div>
              <span className={`text-[11px] font-medium whitespace-nowrap ${active ? "text-blue-600" : done ? "text-gray-500" : "text-muted-foreground"}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px mx-2 mb-4 ${i < idx ? "bg-blue-600" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function PublicBookingPage() {
  const params = useParams();
  const slug = params.tenant as string;

  const [step, setStep] = useState<Step>("cpf");
  const [info, setInfo] = useState<BookingClinicInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [infoError, setInfoError] = useState(false);

  // Form state
  const [cpf, setCpf] = useState("");
  const [patient, setPatient] = useState<BookingPatient | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");

  const [professional, setProfessional] = useState<SelectedProfessional | null>(null);
  const [procedure, setProcedure] = useState<SelectedProcedure | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    getBookingInfo(slug)
      .then(setInfo)
      .catch(() => setInfoError(true))
      .finally(() => setLoadingInfo(false));
  }, [slug]);

  // Procedures available for the selected professional's franchise
  const availableProcedures = useMemo(() => {
    if (!info || !professional) return [];
    return info.procedures.filter((p) => p.franchiseId === professional.franchiseId);
  }, [info, professional]);

  const timeSlots = useMemo(
    () => (procedure ? generateTimeSlots(procedure.durationInMinutes || 60) : []),
    [procedure]
  );

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleLookup = async () => {
    const raw = cpf.replace(/\D/g, "");
    if (raw.length < 11) { setLookupError("CPF inválido"); return; }
    setLookupLoading(true);
    setLookupError("");
    try {
      const p = await lookupPatientByCpf(slug, raw);
      setPatient(p);
      setStep("professional");
    } catch (e: any) {
      setLookupError(e?.response?.data?.message ?? "CPF não encontrado nesta clínica");
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSelectProfessional = (p: SelectedProfessional) => {
    setProfessional(p);
    setProcedure(null);
    setStep("procedure");
  };

  const handleSelectProcedure = (p: SelectedProcedure) => {
    setProcedure(p);
    setDate("");
    setTime("");
    setStep("datetime");
  };

  const handleConfirm = async () => {
    if (!patient || !professional || !procedure || !date || !time) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      await createPublicAppointment(slug, {
        patientId: patient.id,
        professionalId: professional.id,
        franchiseId: professional.franchiseId,
        procedureId: procedure.id,
        price: procedure.price,
        startAt: buildStartAt(date, time),
        durationInMinutes: procedure.durationInMinutes,
      });
      setStep("success");
    } catch (e: any) {
      setSubmitError(e?.response?.data?.message ?? "Erro ao criar agendamento. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (loadingInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8fafc" }}>
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (infoError || !info) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8fafc" }}>
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">Clínica não encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#f8fafc" }}>
      {/* Header */}
      <header className="bg-card border-b border-gray-100 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-700 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
              <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/>
              <path d="M12 8v8M8 12h8"/>
            </svg>
          </div>
          <div>
            <div className="font-bold text-gray-900 text-[15px]">Cliniker</div>
            <div className="text-xs text-muted-foreground">{info.clinic.name}</div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-10">

        {step !== "success" && <StepBar current={step} />}

        {/* ── Step 1: CPF ──────────────────────────────────────────── */}
        {step === "cpf" && (
          <div className="bg-card rounded-2xl border border-gray-100 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <User size={20} className="text-blue-600" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">Identificação</h2>
                <p className="text-sm text-gray-500">Digite seu CPF para continuar</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">CPF</Label>
                <Input
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => { setCpf(maskCPF(e.target.value)); setLookupError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                  className="h-12 text-base"
                  maxLength={14}
                />
                {lookupError && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle size={14} />
                    {lookupError}
                  </div>
                )}
              </div>
              <Button
                onClick={handleLookup}
                disabled={lookupLoading || cpf.replace(/\D/g, "").length < 11}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold"
              >
                {lookupLoading ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
                {lookupLoading ? "Buscando..." : "Continuar"}
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 2: Professional ─────────────────────────────────── */}
        {step === "professional" && patient && (
          <div className="space-y-4">
            <div className="bg-primary/10 border border-blue-100 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                {patient.name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-900">Olá, {patient.name.split(" ")[0]}!</p>
                <p className="text-xs text-blue-600">Escolha um profissional para continuar</p>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-5">
                <Stethoscope size={18} className="text-blue-600" />
                <h2 className="font-bold text-gray-900">Selecionar Profissional</h2>
              </div>
              <div className="space-y-3">
                {info.professionals.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectProfessional(p)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-primary/10/50 transition-all text-left group"
                  >
                    <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                      {p.name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{professionLabel(p.profession)}</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-400 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Procedure ────────────────────────────────────── */}
        {step === "procedure" && professional && (
          <div className="space-y-4">
            <button
              onClick={() => setStep("professional")}
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              ← Voltar
            </button>
            <div className="bg-card rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-1">
                <Scissors size={18} className="text-blue-600" />
                <h2 className="font-bold text-gray-900">Selecionar Procedimento</h2>
              </div>
              <p className="text-xs text-muted-foreground mb-5 ml-7">com {professional.name}</p>

              {availableProcedures.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Nenhum procedimento disponível para este profissional
                </div>
              ) : (
                <div className="space-y-3">
                  {availableProcedures.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectProcedure(p)}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-primary/10/50 transition-all text-left group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                        <Scissors size={16} className="text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">{p.name}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock size={11} /> {p.durationInMinutes}min
                          </span>
                          <span className="text-xs font-semibold text-blue-600">
                            R$ {Number(p.price).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-400 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Step 4: Date & Time ──────────────────────────────────── */}
        {step === "datetime" && procedure && (
          <div className="space-y-4">
            <button
              onClick={() => setStep("procedure")}
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              ← Voltar
            </button>
            <div className="bg-card rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-blue-600" />
                <h2 className="font-bold text-gray-900">Data & Horário</h2>
              </div>

              {/* Date picker */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">Escolha a data</Label>
                <Input
                  type="date"
                  min={getMinDate()}
                  value={date}
                  onChange={(e) => { setDate(e.target.value); setTime(""); }}
                  className="h-12 text-base"
                />
              </div>

              {/* Time slots */}
              {date && (
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-foreground">Escolha o horário</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setTime(slot)}
                        className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                          time === slot
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-card text-foreground border-gray-200 hover:border-blue-300 hover:bg-primary/10"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={() => setStep("confirm")}
                disabled={!date || !time}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Continuar
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 5: Confirm ──────────────────────────────────────── */}
        {step === "confirm" && patient && professional && procedure && date && time && (
          <div className="space-y-4">
            <button
              onClick={() => setStep("datetime")}
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              ← Voltar
            </button>
            <div className="bg-card rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h2 className="font-bold text-gray-900 text-lg">Confirmar Agendamento</h2>

              <div className="space-y-3 text-sm">
                {[
                  { icon: User,        label: "Paciente",      value: patient.name },
                  { icon: Stethoscope, label: "Profissional",  value: professional.name },
                  { icon: Scissors,    label: "Procedimento",  value: procedure.name },
                  {
                    icon: Calendar,
                    label: "Data & Hora",
                    value: `${new Date(date + "T12:00:00").toLocaleDateString("pt-BR")} às ${time}`,
                  },
                  {
                    icon: Clock,
                    label: "Duração",
                    value: `${procedure.durationInMinutes} minutos`,
                  },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                      <Icon size={15} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">{label}</p>
                      <p className="font-semibold text-gray-900 mt-0.5">{value}</p>
                    </div>
                  </div>
                ))}

                <div className="bg-primary/10 rounded-xl p-4 flex items-center justify-between">
                  <span className="font-semibold text-blue-900">Total</span>
                  <span className="text-xl font-bold text-blue-700">R$ {Number(procedure.price).toFixed(2)}</span>
                </div>
              </div>

              {submitError && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg p-3">
                  <AlertCircle size={15} />
                  {submitError}
                </div>
              )}

              <Button
                onClick={handleConfirm}
                disabled={submitting}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base"
              >
                {submitting ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
                {submitting ? "Agendando..." : "Confirmar Agendamento"}
              </Button>
            </div>
          </div>
        )}

        {/* ── Success ──────────────────────────────────────────────── */}
        {step === "success" && (
          <div className="bg-card rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={36} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Agendado!</h2>
            <p className="text-gray-500 text-sm mb-1">
              Seu agendamento foi confirmado com sucesso.
            </p>
            {professional && procedure && date && time && (
              <p className="text-sm text-muted-foreground mb-8">
                {procedure.name} com {professional.name} em{" "}
                {new Date(date + "T12:00:00").toLocaleDateString("pt-BR")} às {time}
              </p>
            )}
            <Button
              onClick={() => {
                setCpf(""); setPatient(null); setProfessional(null);
                setProcedure(null); setDate(""); setTime("");
                setStep("cpf");
              }}
              variant="outline"
              className="border-gray-200"
            >
              Fazer outro agendamento
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
