import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Trash2, X as XIcon } from "lucide-react";
import { toast } from "sonner";
import { useAuthContext } from "@/context/AuthContext";
import { getProfessionalsByFranchiseId } from "@/services/professional/professional.service";
import { getFranchises } from "@/services/franchise/franchise.service";
import { getPatients } from "@/services/patients/patients.service";
import { getProceduresByClinicId } from "@/services/procedures/procedure.service";
import { getAppointmentById, editAppointment } from "@/services/appointments/appointment.service";

interface AppointmentItem {
  procedureId: string;
  price: number;
  notes?: string;
}

interface EditAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  onUpdated?: () => void;
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

const hasCompleteAppointmentDateTime = (dateTime: string) =>
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(dateTime);

const isPastAppointmentDateTime = (dateTime: string) => {
  if (!hasCompleteAppointmentDateTime(dateTime)) return false;
  return new Date(dateTime).getTime() <= Date.now();
};

export default function EditAppointmentModal({
  isOpen,
  onClose,
  appointmentId,
  onUpdated,
}: EditAppointmentModalProps) {
  const { user } = useAuthContext();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProfessionals, setIsLoadingProfessionals] = useState(false);
  const [isReturnConsultation, setIsReturnConsultation] = useState(false);
  const [patientSearchQuery, setPatientSearchQuery] = useState("");
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const patientInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    professionalId: "",
    franchiseId: "",
    patientId: "",
    name: "",
    startAt: "",
    durationInMinutes: "",
  });

  const [appointmentItems, setAppointmentItems] = useState<AppointmentItem[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);

  // Load initial data
  useEffect(() => {
    if (!isOpen || !user?.clinicId) return;

    const fetchInitialData = async () => {
      try {
        const [franchisesResponse, proceduresResponse] = await Promise.all([
          getFranchises(user.clinicId as string),
          getProceduresByClinicId(user.clinicId as string),
        ]);
        setFranchises(franchisesResponse);
        setProcedures(proceduresResponse);
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
      }
    };

    fetchInitialData();
  }, [isOpen, user?.clinicId]);

  // Load appointment data on modal open
  useEffect(() => {
    if (isOpen && appointmentId) {
      loadAppointmentData();
    }
  }, [isOpen, appointmentId]);

  // Load professionals when franchise changes
  useEffect(() => {
    if (formData.franchiseId) {
      loadProfessionals(formData.franchiseId);
    } else {
      setProfessionals([]);
    }
  }, [formData.franchiseId]);

  // Load patients when search query changes or when modal opens
  useEffect(() => {
    if (!isOpen || !user?.clinicId) return;

    const fetchPatients = async () => {
      try {
        const patientsResponse = await getPatients(
          user.clinicId as string,
          1,
          100,
          patientSearchQuery || undefined
        );
        const patientsList = Array.isArray(patientsResponse)
          ? patientsResponse
          : patientsResponse?.data || [];
        setPatients(patientsList);
      } catch (error) {
        console.error("Erro ao buscar pacientes:", error);
      }
    };

    // If there's no search query, fetch immediately to show all patients
    if (!patientSearchQuery) {
      fetchPatients();
    } else {
      // If there's a search query, debounce it
      const debounceTimer = setTimeout(() => {
        fetchPatients();
      }, 300);
      return () => clearTimeout(debounceTimer);
    }
  }, [patientSearchQuery, isOpen, user?.clinicId]);

  const loadAppointmentData = async () => {
    setIsLoading(true);
    try {
      const appointment = await getAppointmentById(appointmentId);

      if (!appointment) {
        toast.error("Agendamento não encontrado");
        onClose();
        return;
      }

      // Load professionals for the franchise
      await loadProfessionals(appointment.franchiseId);

      // Determine if it's a return consultation
      const isReturn = appointment.appointmentItems?.every(
        (item: AppointmentItem) => item.price === 0
      );

      // Format startAt for datetime-local input
      const startDate = new Date(appointment.startAt);
      const year = startDate.getFullYear();
      const month = String(startDate.getMonth() + 1).padStart(2, "0");
      const day = String(startDate.getDate()).padStart(2, "0");
      const hours = String(startDate.getHours()).padStart(2, "0");
      const minutes = String(startDate.getMinutes()).padStart(2, "0");
      const formattedStartAt = `${year}-${month}-${day}T${hours}:${minutes}`;

      setFormData({
        professionalId: appointment.professionalId,
        franchiseId: appointment.franchiseId,
        patientId: appointment.patientId,
        name: appointment.name,
        startAt: formattedStartAt,
        durationInMinutes: String(appointment.durationInMinutes),
      });

      setAppointmentItems(
        appointment.appointmentItems.map((item: AppointmentItem) => ({
          procedureId: item.procedureId,
          price: item.price,
          notes: item.notes,
        }))
      );
      setIsReturnConsultation(isReturn);
      setPatientSearchQuery(appointment.patientName || "");

      setIsLoading(false);
    } catch (error: any) {
      console.error("Error loading appointment:", error);
      toast.error("Erro ao carregar agendamento");
      onClose();
    }
  };

  const loadProfessionals = async (franchiseId: string) => {
    setIsLoadingProfessionals(true);
    try {
      const professionalsResponse = await getProfessionalsByFranchiseId(franchiseId);
      setProfessionals(professionalsResponse);
    } catch (error) {
      console.error("Erro ao carregar profissionais:", error);
      setProfessionals([]);
    } finally {
      setIsLoadingProfessionals(false);
    }
  };

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
    const selectedDate = formData.startAt.slice(0, 10);
    if (!selectedDate) return timeOptions;

    return timeOptions.filter(
      (opt) => !isPastAppointmentDateTime(`${selectedDate}T${opt.value}`)
    );
  }, [formData.startAt, timeOptions]);

  const dateOptions = useMemo(() => {
    const opts: { value: string; label: string }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = -30; i < 90; i++) {
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

  const filteredPatients = useMemo(() => {
    // If no search query, show all patients (limited to first 50 for performance)
    if (!patientSearchQuery) {
      return patients.slice(0, 50);
    }
    // If there's a search query, filter by it
    return patients.filter((p) =>
      p.name.toLowerCase().includes(patientSearchQuery.toLowerCase())
    );
  }, [patients, patientSearchQuery]);

  const selectedPatient = patients.find((p) => p.id === formData.patientId);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Load professionals when franchise changes
    if (name === "franchiseId") {
      loadProfessionals(value);
    }
  };

  const handlePatientSelect = (patientId: string | null) => {
    if (!patientId) {
      setFormData((prev) => ({
        ...prev,
        patientId: "",
      }));
      setPatientSearchQuery("");
      return;
    }
    const selected = patients.find((p) => p.id === patientId);
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        patientId,
      }));
      setPatientSearchQuery(selected.name);
    }
  };

  // Sincronizar searchQuery quando um paciente é selecionado
  useEffect(() => {
    if (formData.patientId && selectedPatient) {
      setPatientSearchQuery(selectedPatient.name);
    } else if (!formData.patientId) {
      if (!patientSearchQuery) {
        setPatientSearchQuery("");
      }
    }
  }, [formData.patientId, selectedPatient]);

  const handleAddProcedure = () => {
    const newPrice = isReturnConsultation ? 0 : undefined;
    setAppointmentItems([
      ...appointmentItems,
      { procedureId: "", price: newPrice ?? 0, notes: "" },
    ]);
  };

  const handleRemoveProcedure = (index: number) => {
    setAppointmentItems(appointmentItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof AppointmentItem,
    value: string | number
  ) => {
    const newItems = [...appointmentItems];
    if (field === "price") {
      newItems[index][field] = parseFloat(value as string) || 0;
    } else {
      newItems[index][field] = value as string;
    }
    setAppointmentItems(newItems);
  };

  const handleProcedureSelect = (index: number, procedureId: string) => {
    const procedure = procedures.find((p) => p.id === procedureId);
    const newItems = [...appointmentItems];
    newItems[index].procedureId = procedureId;

    if (procedure) {
      const price = typeof procedure.price === "string"
        ? parseFloat(procedure.price)
        : procedure.price;
      // Se for consulta de retorno, sempre zerar o preço
      newItems[index].price = isReturnConsultation ? 0 : price || 0;
    } else {
      newItems[index].price = 0;
    }

    setAppointmentItems(newItems);
  };

  const handleDurationShortcut = (minutes: number) => {
    setFormData((prev) => ({
      ...prev,
      durationInMinutes: String(minutes),
    }));
  };

  const handleReturnConsultationChange = (checked: boolean) => {
    setIsReturnConsultation(checked);
    if (checked) {
      // Set all prices to 0
      setAppointmentItems(appointmentItems.map((item) => ({ ...item, price: 0 })));
    }
  };

  const isFormValid =
    formData.professionalId &&
    formData.franchiseId &&
    formData.patientId &&
    formData.startAt &&
    hasCompleteAppointmentDateTime(formData.startAt) &&
    !isPastAppointmentDateTime(formData.startAt) &&
    formData.durationInMinutes !== "" &&
    appointmentItems.length > 0 &&
    appointmentItems.every((item) => item.procedureId && (isReturnConsultation || item.price > 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      return;
    }

    if (isPastAppointmentDateTime(formData.startAt)) {
      toast.error("Escolha um horário futuro para o agendamento.");
      return;
    }

    const payload = {
      professionalId: formData.professionalId,
      franchiseId: formData.franchiseId,
      patientId: formData.patientId,
      name: formData.name || "Agendamento",
      appointmentItems: appointmentItems,
      startAt: new Date(formData.startAt).toISOString(),
      durationInMinutes: parseInt(formData.durationInMinutes, 10),
    };

    setIsSubmitting(true);
    try {
      await editAppointment(appointmentId, payload);
      toast.success("Agendamento atualizado com sucesso!");
      onUpdated?.();
      onClose();
    } catch (error: any) {
      console.error("Error updating appointment:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Erro ao atualizar agendamento. Tente novamente.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Agendamento</DialogTitle>
          <DialogDescription>
            Atualize os dados do agendamento
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Carregando agendamento...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Main Fields */}
            <div className="space-y-4">
              {/* Franchise */}
              <div className="space-y-2">
                <Label htmlFor="franchiseId" className="text-foreground font-semibold">
                  Unidade *
                </Label>
                <Select
                  value={formData.franchiseId}
                  onValueChange={(value) => handleSelectChange("franchiseId", value)}
                >
                  <SelectTrigger id="franchiseId" className="bg-card border-border h-10">
                    <SelectValue placeholder="Selecione uma unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {franchises.map((fran) => (
                      <SelectItem key={fran.id} value={fran.id}>
                        {fran.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Professional */}
              <div className="space-y-2">
                <Label htmlFor="professionalId" className="text-foreground font-semibold">
                  Profissional *
                </Label>
                <Select
                  value={formData.professionalId}
                  onValueChange={(value) => handleSelectChange("professionalId", value)}
                  disabled={!formData.franchiseId || isLoadingProfessionals}
                >
                  <SelectTrigger id="professionalId" className="bg-card border-border h-10">
                    <SelectValue placeholder="Selecione um profissional" />
                  </SelectTrigger>
                  <SelectContent>
                    {professionals.map((prof) => (
                      <SelectItem key={prof.id} value={prof.id}>
                        {prof.name || "Sem nome"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Patient Search */}
              <div className="space-y-2">
                <Label htmlFor="patientSearch" className="text-foreground font-semibold">
                  Paciente *
                </Label>
                <div className="relative">
                  <Input
                    id="patientSearch"
                    ref={patientInputRef}
                    placeholder="Digite para buscar paciente..."
                    value={patientSearchQuery}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setPatientSearchQuery(newValue);
                      setShowPatientDropdown(true);
                      if (formData.patientId && selectedPatient && newValue !== selectedPatient.name) {
                        setFormData((prev) => ({ ...prev, patientId: "" }));
                      }
                    }}
                    onFocus={() => setShowPatientDropdown(true)}
                    onBlur={() => setTimeout(() => setShowPatientDropdown(false), 100)}
                    className="h-10 bg-card border-border pr-10"
                  />
                  {formData.patientId && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => handlePatientSelect(null)}
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  )}

                  {showPatientDropdown && filteredPatients.length > 0 && (
                    <div className="absolute z-10 w-full bg-card border border-border rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                      {filteredPatients.map((patient) => (
                        <button
                          key={patient.id}
                          type="button"
                          className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground"
                          onClick={() => {
                            handlePatientSelect(patient.id);
                            setShowPatientDropdown(false);
                          }}
                        >
                          {patient.name}
                        </button>
                      ))}
                    </div>
                  )}
                  {showPatientDropdown && filteredPatients.length === 0 && patientSearchQuery && (
                    <div className="absolute z-10 w-full bg-card border border-border rounded-md shadow-lg mt-1 p-4 text-sm text-muted-foreground">
                      Nenhum paciente encontrado
                    </div>
                  )}
                </div>
              </div>

              {/* Return Consultation Checkbox */}
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isReturnConsultation}
                    onChange={(e) => handleReturnConsultationChange(e.target.checked)}
                    className="rounded"
                  />
                  <span className="font-medium text-foreground">
                    Consulta de retorno
                  </span>
                </label>
                <p className="text-xs text-muted-foreground ml-6">
                  Marcar se for uma consulta de acompanhamento (procedimentos sem custo adicional)
                </p>
              </div>

              {/* Appointment Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground font-semibold">
                  Título do Agendamento
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Consulta de Rotina"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="h-10 bg-card border-border"
                />
              </div>

              {/* Start Date/Time */}
              <div className="space-y-2">
                <Label className="text-foreground font-semibold">Data e Hora *</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    value={formData.startAt.slice(0, 10)}
                    onValueChange={(date) =>
                      setFormData((prev) => {
                        const time = prev.startAt.slice(11, 16) || "08:00";
                        const nextStartAt = `${date}T${time}`;

                        return {
                          ...prev,
                          startAt: isPastAppointmentDateTime(nextStartAt)
                            ? `${date}T`
                            : nextStartAt,
                        };
                      })
                    }
                  >
                    <SelectTrigger className="h-10 bg-card border-border">
                      <SelectValue placeholder="Data" />
                    </SelectTrigger>
                    <SelectContent>
                      {dateOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={formData.startAt.slice(11, 16)}
                    onValueChange={(time) =>
                      setFormData((prev) => ({
                        ...prev,
                        startAt: `${prev.startAt.slice(0, 10) || getLocalDateValue(new Date())}T${time}`,
                      }))
                    }
                  >
                    <SelectTrigger className="h-10 bg-card border-border">
                      <SelectValue placeholder="Horário" />
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
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="durationInMinutes" className="text-foreground font-semibold">
                  Duração (minutos) *
                </Label>
                <Input
                  id="durationInMinutes"
                  name="durationInMinutes"
                  type="number"
                  placeholder="e.g., 30"
                  min="15"
                  step="15"
                  value={formData.durationInMinutes}
                  onChange={handleInputChange}
                  className="h-10 bg-card border-border mb-2"
                />
                <div className="flex gap-2 flex-wrap">
                  {[["30", "30m"], ["60", "1h"], ["90", "1:30h"]].map(([val, label]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleDurationShortcut(Number(val))}
                      className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                        formData.durationInMinutes === val
                          ? "bg-primary text-white border-primary"
                          : "border-border text-foreground hover:bg-secondary"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleDurationShortcut(0)}
                    className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                      formData.durationInMinutes === "0"
                        ? "bg-orange-500 text-white border-orange-500"
                        : "border-border text-foreground hover:bg-secondary"
                    }`}
                  >
                    Sem duração
                  </button>
                </div>
                {formData.durationInMinutes === "0" && (
                  <p className="text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-md px-3 py-2 mt-1">
                    ⚠️ Sem duração definida — podem ocorrer conflitos de agenda.
                  </p>
                )}
              </div>
            </div>

            {/* Appointment Items Section */}
            <div className="border-t border-border pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Procedimentos</h3>
                <Button
                  type="button"
                  onClick={handleAddProcedure}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-white text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Adicionar Procedimento
                </Button>
              </div>

              {appointmentItems.length === 0 && (
                <div className="text-center py-6 bg-secondary/50 rounded-lg border border-dashed border-border">
                  <p className="text-sm text-muted-foreground">
                    Nenhum procedimento adicionado.
                  </p>
                </div>
              )}

              {appointmentItems.map((item, index) => (
                <div
                  key={index}
                  className="border border-border rounded-lg p-4 space-y-3 bg-secondary/20"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-foreground">
                      Procedimento {index + 1}
                    </span>
                    <Button
                      type="button"
                      onClick={() => handleRemoveProcedure(index)}
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Procedure Select */}
                  <div className="space-y-2">
                    <Label className="text-sm text-foreground font-medium">
                      Procedimento *
                    </Label>
                    <Select
                      value={item.procedureId}
                      onValueChange={(value) => handleProcedureSelect(index, value)}
                    >
                      <SelectTrigger className="bg-card border-border h-10">
                        <SelectValue placeholder="Selecione um procedimento" />
                      </SelectTrigger>
                      <SelectContent>
                        {procedures.map((proc) => (
                          <SelectItem key={proc.id} value={proc.id}>
                            {proc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price */}
                  <div className="space-y-2">
                    <Label className="text-sm text-foreground font-medium">
                      Preço (R$) *
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={item.price || ""}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "price",
                          e.target.value ? parseFloat(e.target.value) : 0
                        )
                      }
                      disabled={isReturnConsultation}
                      className="h-10 bg-card border-border disabled:opacity-50"
                    />
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label className="text-sm text-foreground font-medium">
                      Observações (Opcional)
                    </Label>
                    <textarea
                      placeholder="Adicione observações sobre este procedimento..."
                      value={item.notes || ""}
                      onChange={(e) => handleItemChange(index, "notes", e.target.value)}
                      className="w-full border border-border rounded-lg p-2 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1 border-border"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !isFormValid}
                className="flex-1 bg-primary hover:bg-primary/90 text-white disabled:opacity-50"
              >
                {isSubmitting ? "Salvando..." : "Salvar alterações"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
