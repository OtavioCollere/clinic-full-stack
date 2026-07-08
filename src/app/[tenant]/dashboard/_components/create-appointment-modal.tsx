"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Building2,
  UserCheck,
  User,
  CalendarDays,
  Stethoscope,
  Plus,
  Trash2,
  X as XIcon,
  Pencil,
  Check,
} from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { getProfessionalsByFranchiseId } from "@/services/professional/professional.service";
import { getFranchises } from "@/services/franchise/franchise.service";
import { getPatients } from "@/services/patients/patients.service";
import { getProceduresByClinicId } from "@/services/procedures/procedure.service";
import { createAppointment } from "@/services/appointments/appointment.service";
import { toast } from "sonner";

interface AppointmentItem {
  procedureId: string;
  price: number;
  notes?: string;
}

interface CreateAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStartAt?: string;
  initialDurationMinutes?: number;
  lockedProfessionalId?: string;
  lockedProfessionalName?: string;
}

interface Professional {
  id: string;
  name: string | null;
}

interface Franchise {
  id: string;
  name: string;
}

interface Patient {
  id: string;
  name: string;
}

interface Procedure {
  id: string;
  name: string;
  price: number | string;
}

const getLocalDateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getAppointmentStartAt = (date: string, time: string) =>
  date && time ? new Date(`${date}T${time}:00`) : null;

const isPastAppointmentDateTime = (date: string, time: string) => {
  const startAt = getAppointmentStartAt(date, time);
  return !!startAt && startAt.getTime() <= Date.now();
};

export default function CreateAppointmentModal({
  isOpen,
  onClose,
  initialStartAt,
  initialDurationMinutes,
  lockedProfessionalId,
  lockedProfessionalName,
}: CreateAppointmentModalProps) {
  const { user } = useAuthContext();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isLoadingProfessionals, setIsLoadingProfessionals] = useState(false);
  const [isReturnConsultation, setIsReturnConsultation] = useState(false);
  const [patientSearchQuery, setPatientSearchQuery] = useState("");
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);
  const [formData, setFormData] = useState({
    professionalId: "",
    franchiseId: "",
    patientId: "",
    date: "",
    time: "",
    durationInMinutes: "30",
  });
  const [appointmentItems, setAppointmentItems] = useState<AppointmentItem[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);

  // Reset state when modal closes; pre-fill when it opens from a calendar slot
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setFormData({
        professionalId: "",
        franchiseId: "",
        patientId: "",
        date: "",
        time: "",
        durationInMinutes: "30",
      });
      setAppointmentItems([]);
      setIsReturnConsultation(false);
      setPatientSearchQuery("");
      return;
    }

    if (initialStartAt) {
      const d = new Date(initialStartAt);
      const date = getLocalDateValue(d);
      let h = d.getHours();
      let m = Math.round(d.getMinutes() / 10) * 10;
      if (m === 60) { m = 0; h = (h + 1) % 24; }
      const time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      setFormData((prev) => ({ ...prev, date, time }));
    }
    if (initialDurationMinutes != null) {
      setFormData((prev) => ({
        ...prev,
        durationInMinutes: String(initialDurationMinutes),
      }));
    }
  }, [isOpen]);

  // Fetch franchises + procedures on open
  useEffect(() => {
    if (!isOpen || !user?.clinicId) return;
    const fetchData = async () => {
      try {
        setIsLoadingData(true);
        const [fr, pr] = await Promise.all([
          getFranchises(user.clinicId as string),
          getProceduresByClinicId(user.clinicId as string),
        ]);
        setFranchises(fr);
        setProcedures(pr);
      } catch {
        toast.error("Erro ao carregar dados.");
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, [isOpen, user?.clinicId]);

  // Fetch professionals when franchise changes
  useEffect(() => {
    if (!formData.franchiseId) {
      setProfessionals([]);
      return;
    }
    const fetchProfessionals = async () => {
      try {
        setIsLoadingProfessionals(true);
        const profs = await getProfessionalsByFranchiseId(formData.franchiseId);
        setProfessionals(profs);
        if (
          formData.professionalId &&
          !profs.some((p: Professional) => p.id === formData.professionalId)
        ) {
          setFormData((prev) => ({ ...prev, professionalId: "" }));
        }
      } catch {
        toast.error("Erro ao carregar profissionais.");
      } finally {
        setIsLoadingProfessionals(false);
      }
    };
    fetchProfessionals();
  }, [formData.franchiseId]);

  // Fetch patients with debounce
  useEffect(() => {
    if (!isOpen || !user?.clinicId) return;
    const timeout = setTimeout(async () => {
      try {
        const res = await getPatients(
          user.clinicId as string,
          1,
          100,
          patientSearchQuery || undefined
        );
        setPatients(Array.isArray(res) ? res : []);
      } catch {
        /* silent */
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [isOpen, user?.clinicId, patientSearchQuery]);

  // Zero prices when return consultation is toggled on
  useEffect(() => {
    if (isReturnConsultation) {
      setAppointmentItems((prev) => prev.map((item) => ({ ...item, price: 0 })));
    }
  }, [isReturnConsultation]);

  const filteredPatients = useMemo(() => {
    if (!patientSearchQuery) return patients;
    const q = patientSearchQuery.toLowerCase();
    return patients.filter((p) => p.name.toLowerCase().includes(q));
  }, [patients, patientSearchQuery]);

  const timeOptions = useMemo(() => {
    const opts: { value: string; label: string }[] = [];
    for (let h = 7; h <= 20; h++) {
      for (let m = 0; m < 60; m += 10) {
        if (h === 20 && m > 0) break;
        const hh = String(h).padStart(2, "0");
        const mm = String(m).padStart(2, "0");
        opts.push({ value: `${hh}:${mm}`, label: `${hh}:${mm}` });
      }
    }
    return opts;
  }, []);

  const availableTimeOptions = useMemo(() => {
    if (!formData.date) return timeOptions;

    return timeOptions.filter(
      (opt) => !isPastAppointmentDateTime(formData.date, opt.value)
    );
  }, [formData.date, timeOptions]);

  const dateOptions = useMemo(() => {
    const opts: { value: string; label: string }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 60; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      opts.push({
        value: getLocalDateValue(d),
        label: d.toLocaleDateString("pt-BR", {
          weekday: "short",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
      });
    }
    return opts;
  }, []);


  // ─── Step handlers ──────────────────────────────────────────────────────────

  const handleFranchiseSelect = (value: string) => {
    const changed = value !== formData.franchiseId;
    setFormData((prev) => ({
      ...prev,
      franchiseId: value,
      ...(changed ? { professionalId: lockedProfessionalId ?? "" } : {}),
    }));
    setCurrentStep(lockedProfessionalId ? 2 : 1);
  };

  const handleProfessionalSelect = (value: string) => {
    setFormData((prev) => ({ ...prev, professionalId: value }));
    setCurrentStep(2);
  };

  const handlePatientSelect = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) return;
    setFormData((prev) => ({ ...prev, patientId }));
    setPatientSearchQuery(patient.name);
    setIsPatientDropdownOpen(false);
    setCurrentStep(3);
  };

  const handleDateTimeConfirm = () => {
    if (isPastAppointmentDateTime(formData.date, formData.time)) {
      toast.error("Escolha um horário futuro para o agendamento.");
      return;
    }

    if (formData.date && formData.time && formData.durationInMinutes) {
      setCurrentStep(4);
    }
  };

  // ─── Procedure handlers ─────────────────────────────────────────────────────

  const handleAddProcedure = () => {
    setAppointmentItems((prev) => [...prev, { procedureId: "", price: 0, notes: "" }]);
  };

  const handleRemoveProcedure = (index: number) => {
    setAppointmentItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProcedureSelect = (index: number, procedureId: string) => {
    const procedure = procedures.find((p) => p.id === procedureId);
    const rawPrice = procedure
      ? typeof procedure.price === "string"
        ? parseFloat(procedure.price)
        : procedure.price
      : 0;
    const price = isReturnConsultation ? 0 : rawPrice || 0;
    setAppointmentItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], procedureId, price };
      return next;
    });
  };

  const handleProcedurePrice = (index: number, value: string) => {
    setAppointmentItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], price: parseFloat(value) || 0 };
      return next;
    });
  };

  // ─── Submit ─────────────────────────────────────────────────────────────────

  const isFormValid =
    formData.professionalId &&
    formData.franchiseId &&
    formData.patientId &&
    formData.date &&
    formData.time &&
    !isPastAppointmentDateTime(formData.date, formData.time) &&
    formData.durationInMinutes !== "" &&
    appointmentItems.every(
      (item) =>
        item.procedureId && (isReturnConsultation || item.price > 0)
    );

  const handleSubmit = async () => {
    if (!isFormValid) return;
    if (isPastAppointmentDateTime(formData.date, formData.time)) {
      toast.error("Escolha um horário futuro para o agendamento.");
      return;
    }
    const startAt = new Date(`${formData.date}T${formData.time}:00`).toISOString();
    const durationInMinutes = parseInt(formData.durationInMinutes, 10) || 30;
    setIsSubmitting(true);
    try {
      await createAppointment({
        professionalId: formData.professionalId,
        franchiseId: formData.franchiseId,
        patientId: formData.patientId,
        name: "Agendamento",
        appointmentItems,
        startAt,
        durationInMinutes,
      });
      toast.success("Agendamento criado com sucesso!");
      onClose();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Erro ao criar agendamento."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Derived display values ─────────────────────────────────────────────────

  const selectedFranchise = franchises.find((f) => f.id === formData.franchiseId);
  const selectedProfessional = professionals.find(
    (p) => p.id === formData.professionalId
  );
  const selectedPatient = patients.find((p) => p.id === formData.patientId);
  const selectedDateLabel = dateOptions.find(
    (d) => d.value === formData.date
  )?.label;

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[480px] flex flex-col p-0 gap-0"
      >
        <SheetHeader className="px-6 py-5 border-b border-border shrink-0">
          <SheetTitle className="text-lg font-semibold">Nova Consulta</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
          {/* ── Step 1: Unidade ── */}
          {currentStep > 0 ? (
            <CompletedStep
              number={1}
              label="Unidade"
              value={selectedFranchise?.name ?? ""}
              icon={<Building2 className="w-4 h-4" />}
              onEdit={() => setCurrentStep(0)}
            />
          ) : (
            <ActiveStep
              number={1}
              label="Selecione a unidade"
              icon={<Building2 className="w-4 h-4" />}
            >
              <Select
                value={formData.franchiseId}
                onValueChange={handleFranchiseSelect}
              >
                <SelectTrigger className="h-10 bg-card">
                  <SelectValue placeholder="Selecione uma unidade" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingData ? (
                    <SelectItem value="__loading" disabled>
                      Carregando...
                    </SelectItem>
                  ) : (
                    franchises.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </ActiveStep>
          )}

          {/* ── Step 2: Profissional ── */}
          {currentStep >= 1 &&
            (lockedProfessionalId ? (
              <CompletedStep
                number={2}
                label="Profissional"
                value={lockedProfessionalName ?? ""}
                icon={<UserCheck className="w-4 h-4" />}
              />
            ) : currentStep > 1 ? (
              <CompletedStep
                number={2}
                label="Profissional"
                value={selectedProfessional?.name ?? ""}
                icon={<UserCheck className="w-4 h-4" />}
                onEdit={() => setCurrentStep(1)}
              />
            ) : (
              <ActiveStep
                number={2}
                label="Selecione o profissional"
                icon={<UserCheck className="w-4 h-4" />}
              >
                <Select
                  value={formData.professionalId}
                  onValueChange={handleProfessionalSelect}
                  disabled={isLoadingProfessionals}
                >
                  <SelectTrigger className="h-10 bg-card">
                    <SelectValue
                      placeholder={
                        isLoadingProfessionals
                          ? "Carregando..."
                          : "Selecione um profissional"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {professionals.length === 0 ? (
                      <SelectItem value="__none" disabled>
                        Nenhum profissional encontrado
                      </SelectItem>
                    ) : (
                      professionals.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name ?? "Sem nome"}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </ActiveStep>
            ))}

          {/* ── Step 3: Paciente ── */}
          {currentStep >= 2 &&
            (currentStep > 2 ? (
              <CompletedStep
                number={3}
                label="Paciente"
                value={selectedPatient?.name ?? patientSearchQuery}
                icon={<User className="w-4 h-4" />}
                onEdit={() => setCurrentStep(2)}
              />
            ) : (
              <ActiveStep
                number={3}
                label="Selecione o paciente"
                icon={<User className="w-4 h-4" />}
              >
                <div className="relative">
                  <Input
                    placeholder="Buscar paciente pelo nome..."
                    value={patientSearchQuery}
                    onChange={(e) => {
                      setPatientSearchQuery(e.target.value);
                      setIsPatientDropdownOpen(true);
                      if (formData.patientId) {
                        setFormData((prev) => ({ ...prev, patientId: "" }));
                      }
                    }}
                    onFocus={() => setIsPatientDropdownOpen(true)}
                    onBlur={() =>
                      setTimeout(() => setIsPatientDropdownOpen(false), 200)
                    }
                    className="h-10 bg-card"
                  />
                  {formData.patientId && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, patientId: "" }));
                        setPatientSearchQuery("");
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  )}
                  {isPatientDropdownOpen && filteredPatients.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-52 overflow-auto">
                      {filteredPatients.map((patient) => (
                        <button
                          key={patient.id}
                          type="button"
                          onClick={() => handlePatientSelect(patient.id)}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-accent transition-colors"
                        >
                          {patient.name}
                        </button>
                      ))}
                    </div>
                  )}
                  {isPatientDropdownOpen &&
                    patientSearchQuery &&
                    filteredPatients.length === 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg px-4 py-3 text-sm text-muted-foreground">
                        Nenhum paciente encontrado
                      </div>
                    )}
                </div>
              </ActiveStep>
            ))}

          {/* ── Step 4: Data e Horário ── */}
          {currentStep >= 3 &&
            (currentStep > 3 ? (
              <CompletedStep
                number={4}
                label="Data e Horário"
                value={`${selectedDateLabel ?? formData.date} às ${formData.time} · ${formData.durationInMinutes}min`}
                icon={<CalendarDays className="w-4 h-4" />}
                onEdit={() => setCurrentStep(3)}
              />
            ) : (
              <ActiveStep
                number={4}
                label="Data e Horário"
                icon={<CalendarDays className="w-4 h-4" />}
              >
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground font-medium">
                      Data
                    </Label>
                    <Select
                      value={formData.date}
                      onValueChange={(v) =>
                        setFormData((prev) => ({
                          ...prev,
                          date: v,
                          time: isPastAppointmentDateTime(v, prev.time) ? "" : prev.time,
                        }))
                      }
                    >
                      <SelectTrigger className="h-10 bg-card">
                        <SelectValue placeholder="Selecione a data" />
                      </SelectTrigger>
                      <SelectContent>
                        {dateOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground font-medium">
                      Horário
                    </Label>
                    <Select
                      value={formData.time}
                      onValueChange={(v) => setFormData((prev) => ({ ...prev, time: v }))}
                    >
                      <SelectTrigger className="h-10 bg-card">
                        <SelectValue placeholder="Selecione o horário" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTimeOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                        {availableTimeOptions.length === 0 && (
                          <SelectItem value="__none" disabled>
                            Nenhum horário futuro hoje
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground font-medium">
                      Duração
                    </Label>
                    <div className="flex gap-2 flex-wrap items-center">
                      {["15", "30", "60", "90"].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              durationInMinutes: val,
                            }))
                          }
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                            formData.durationInMinutes === val
                              ? "bg-primary text-white border-primary"
                              : "bg-card border-border text-foreground hover:bg-accent"
                          }`}
                        >
                          {val === "60" ? "1h" : val === "90" ? "1h30" : `${val}min`}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, durationInMinutes: "0" }))}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                          formData.durationInMinutes === "0"
                            ? "bg-orange-500 text-white border-orange-500"
                            : "bg-card border-border text-foreground hover:bg-accent"
                        }`}
                      >
                        Sem duração
                      </button>
                      <Input
                        type="number"
                        min="10"
                        step="10"
                        value={formData.durationInMinutes === "0" ? "" : formData.durationInMinutes}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            durationInMinutes: e.target.value,
                          }))
                        }
                        className="h-8 w-20 text-sm bg-card"
                        placeholder="min"
                      />
                    </div>
                    {formData.durationInMinutes === "0" && (
                      <p className="text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-md px-3 py-2">
                        ⚠️ Sem duração definida — podem ocorrer conflitos de agenda.
                      </p>
                    )}
                  </div>

                  <Button
                    type="button"
                    onClick={handleDateTimeConfirm}
                    disabled={
                      !formData.date ||
                      !formData.time ||
                      !formData.durationInMinutes ||
                      isPastAppointmentDateTime(formData.date, formData.time)
                    }
                    className="w-full mt-1"
                  >
                    Confirmar
                  </Button>
                </div>
              </ActiveStep>
            ))}

          {/* ── Step 5: Procedimentos ── */}
          {currentStep >= 4 && (
            <ActiveStep
              number={5}
              label="Procedimentos"
              icon={<Stethoscope className="w-4 h-4" />}
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="returnConsultation"
                    checked={isReturnConsultation}
                    onCheckedChange={(checked) =>
                      setIsReturnConsultation(checked === true)
                    }
                  />
                  <Label
                    htmlFor="returnConsultation"
                    className="text-sm cursor-pointer leading-none"
                  >
                    Consulta de retorno (sem cobrança)
                  </Label>
                </div>

                {appointmentItems.map((item, index) => (
                  <div
                    key={index}
                    className="border border-border rounded-xl p-3 space-y-2.5 bg-secondary/20"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        Procedimento {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveProcedure(index)}
                        className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <Select
                      value={item.procedureId}
                      onValueChange={(v) => handleProcedureSelect(index, v)}
                    >
                      <SelectTrigger className="h-9 bg-card text-sm">
                        <SelectValue placeholder="Selecione um procedimento" />
                      </SelectTrigger>
                      <SelectContent>
                        {procedures
                          .filter(
                            (proc) =>
                              proc.id === item.procedureId ||
                              !appointmentItems.some(
                                (other, i) => i !== index && other.procedureId === proc.id
                              )
                          )
                          .map((proc) => (
                            <SelectItem key={proc.id} value={proc.id}>
                              {proc.name} — R${" "}
                              {typeof proc.price === "string"
                                ? parseFloat(proc.price).toFixed(2)
                                : proc.price.toFixed(2)}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>

                    {!isReturnConsultation && (
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Preço (R$)"
                        value={item.price || ""}
                        onChange={(e) =>
                          handleProcedurePrice(index, e.target.value)
                        }
                        className="h-9 bg-card text-sm"
                      />
                    )}
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddProcedure}
                  className="w-full border-dashed"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Procedimento
                </Button>
              </div>
            </ActiveStep>
          )}
        </div>

        {/* ── Footer: submit button ── */}
        {currentStep >= 4 && (
          <div className="px-6 py-4 border-t border-border shrink-0">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !isFormValid}
              className="w-full bg-primary hover:bg-primary/90 text-white disabled:opacity-50"
            >
              {isSubmitting ? "Criando..." : "Criar Agendamento"}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CompletedStep({
  number,
  label,
  value,
  icon,
  onEdit,
}: {
  number: number;
  label: string;
  value: string;
  icon: React.ReactNode;
  onEdit?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-xl">
      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white shrink-0">
        <Check className="w-3 h-3" />
      </div>
      <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <span className="flex-1 text-sm font-semibold text-foreground truncate">
        {value}
      </span>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors shrink-0"
          title="Editar"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

function ActiveStep({
  number,
  label,
  icon,
  children,
}: {
  number: number;
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border-2 border-primary/30 rounded-xl p-4 space-y-3 shadow-sm">
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold shrink-0">
          {number}
        </div>
        <div className="flex items-center gap-2 text-foreground">
          {icon}
          <span className="font-semibold text-sm">{label}</span>
        </div>
      </div>
      {children}
    </div>
  );
}
