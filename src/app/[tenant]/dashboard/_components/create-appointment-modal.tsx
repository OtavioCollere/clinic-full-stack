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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Trash2, X as XIcon } from "lucide-react";
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

export default function CreateAppointmentModal({
  isOpen,
  onClose,
}: CreateAppointmentModalProps) {
  const { user } = useAuthContext();
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
    name: "",
    startAt: "",
    durationInMinutes: "",
  });

  const [appointmentItems, setAppointmentItems] = useState<AppointmentItem[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);

  // Buscar pacientes quando o termo de busca mudar
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
        // O backend retorna um array diretamente
        const patientsList = Array.isArray(patientsResponse)
          ? patientsResponse
          : [];
        setPatients(patientsList);
      } catch (error) {
        console.error("Erro ao buscar pacientes:", error);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchPatients();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [isOpen, user?.clinicId, patientSearchQuery]);

  // Ao abrir o modal: definir duração padrão (30 min) para o botão poder habilitar
  useEffect(() => {
    if (!isOpen) return;
    setFormData((prev) =>
      prev.durationInMinutes ? prev : { ...prev, durationInMinutes: "30" }
    );
  }, [isOpen]);

  // Buscar dados iniciais
  useEffect(() => {
    if (!isOpen || !user?.clinicId) return;

    const fetchData = async () => {
      try {
        setIsLoadingData(true);
        const [franchisesResponse, proceduresResponse] = await Promise.all([
          getFranchises(user.clinicId as string),
          getProceduresByClinicId(user.clinicId as string),
        ]);
        setFranchises(franchisesResponse);
        setProcedures(proceduresResponse);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        toast.error("Erro ao carregar dados. Tente novamente.");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [isOpen, user?.clinicId]);

  // Buscar profissionais quando franquia for selecionada
  useEffect(() => {
    if (!formData.franchiseId) {
      setProfessionals([]);
      setFormData((prev) => ({ ...prev, professionalId: "" }));
      return;
    }

    const fetchProfessionals = async () => {
      try {
        setIsLoadingProfessionals(true);
        const professionalsResponse = await getProfessionalsByFranchiseId(formData.franchiseId);
        setProfessionals(professionalsResponse);
        // Limpar seleção de profissional se não estiver mais na lista
        if (formData.professionalId) {
          const professionalExists = professionalsResponse.some(
            (p: Professional) => p.id === formData.professionalId
          );
          if (!professionalExists) {
            setFormData((prev) => ({ ...prev, professionalId: "" }));
          }
        }
      } catch (error) {
        console.error("Erro ao buscar profissionais:", error);
        toast.error("Erro ao carregar profissionais. Tente novamente.");
      } finally {
        setIsLoadingProfessionals(false);
      }
    };

    fetchProfessionals();
  }, [formData.franchiseId]);

  // Filtrar pacientes baseado na busca
  const filteredPatients = useMemo(() => {
    if (!patientSearchQuery) return patients;
    const query = patientSearchQuery.toLowerCase();
    return patients.filter((patient) =>
      patient.name.toLowerCase().includes(query)
    );
  }, [patients, patientSearchQuery]);

  // Auto-selecionar paciente quando há exatamente um resultado e o nome digitado é igual ao do paciente (digitou o nome mas não clicou no dropdown)
  useEffect(() => {
    if (filteredPatients.length !== 1 || !patientSearchQuery.trim()) return;
    const match = filteredPatients[0];
    const queryNorm = patientSearchQuery.trim().toLowerCase();
    const nameNorm = (match.name || "").trim().toLowerCase();
    if (nameNorm === queryNorm) {
      setFormData((prev) => (prev.patientId === match.id ? prev : { ...prev, patientId: match.id }));
    }
  }, [filteredPatients, patientSearchQuery]);

  // Zerar preços quando checkbox de retorno for marcado
  useEffect(() => {
    if (isReturnConsultation) {
      setAppointmentItems((prevItems) =>
        prevItems.map((item) => ({ ...item, price: 0 }))
      );
    }
  }, [isReturnConsultation]);

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
  };

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
      // Atualiza o search query com o nome do paciente selecionado
      setPatientSearchQuery(selected.name);
    }
  };

  const isFormValid =
    formData.professionalId &&
    formData.franchiseId &&
    formData.patientId &&
    formData.startAt &&
    formData.durationInMinutes &&
    appointmentItems.length > 0 &&
    appointmentItems.every((item) => item.procedureId && (isReturnConsultation || item.price > 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      return;
    }

    const payload = {
      professionalId: formData.professionalId,
      franchiseId: formData.franchiseId,
      patientId: formData.patientId,
      name: formData.name || "Agendamento",
      appointmentItems: appointmentItems,
      startAt: new Date(formData.startAt).toISOString(),
      durationInMinutes: durationMinutes > 0 ? durationMinutes : 30,
    };

    setIsSubmitting(true);
    try {
      await createAppointment(payload);
      toast.success("Agendamento criado com sucesso!");

      // Reset form
      setFormData({
        professionalId: "",
        franchiseId: "",
        patientId: "",
        name: "",
        startAt: "",
        durationInMinutes: "",
      });
      setAppointmentItems([]);
      setIsReturnConsultation(false);
      setPatientSearchQuery("");
      onClose();
    } catch (error: any) {
      console.error("Error creating appointment:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Erro ao criar agendamento. Tente novamente.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPatient = patients.find((p) => p.id === formData.patientId);

  // Sincronizar searchQuery quando um paciente é selecionado
  useEffect(() => {
    if (formData.patientId && selectedPatient) {
      setPatientSearchQuery(selectedPatient.name);
    } else if (!formData.patientId) {
      // Se não há paciente selecionado e o campo está vazio, limpa a busca
      if (!patientSearchQuery) {
        setPatientSearchQuery("");
      }
    }
  }, [formData.patientId, selectedPatient]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Agendamento</DialogTitle>
          <DialogDescription>
            Preencha todos os dados para agendar uma consulta
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Fields */}
          <div className="space-y-4">
            {/* Franchise - Primeiro campo */}
            <div className="space-y-2">
              <Label htmlFor="franchiseId" className="text-foreground font-semibold">
                Unidade *
              </Label>
              <Select
                value={formData.franchiseId}
                onValueChange={(value) => handleSelectChange("franchiseId", value)}
              >
                <SelectTrigger id="franchiseId" className="bg-white border-border h-10">
                  <SelectValue placeholder="Selecione uma unidade" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingData ? (
                    <SelectItem value="loading" disabled>
                      Carregando...
                    </SelectItem>
                  ) : (
                    franchises.map((fran) => (
                      <SelectItem key={fran.id} value={fran.id}>
                        {fran.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Professional - Filtrado por franquia */}
            <div className="space-y-2">
              <Label htmlFor="professionalId" className="text-foreground font-semibold">
                Profissional *
              </Label>
              <Select
                value={formData.professionalId}
                onValueChange={(value) => handleSelectChange("professionalId", value)}
                disabled={!formData.franchiseId || isLoadingProfessionals}
              >
                <SelectTrigger id="professionalId" className="bg-white border-border h-10">
                  <SelectValue
                    placeholder={
                      !formData.franchiseId
                        ? "Selecione primeiro uma unidade"
                        : isLoadingProfessionals
                        ? "Carregando..."
                        : "Selecione um profissional"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingProfessionals ? (
                    <SelectItem value="loading" disabled>
                      Carregando...
                    </SelectItem>
                  ) : professionals.length === 0 ? (
                    <SelectItem value="no-professionals" disabled>
                      Nenhum profissional encontrado para esta unidade
                    </SelectItem>
                  ) : (
                    professionals.map((prof) => (
                      <SelectItem key={prof.id} value={prof.id}>
                        {prof.name || "Sem nome"}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Patient - Input com busca customizada */}
            <div className="space-y-2 relative">
              <Label htmlFor="patientId" className="text-foreground font-semibold">
                Paciente *
              </Label>
              <div className="relative">
                <Input
                  id="patientId"
                  placeholder="Digite para buscar paciente..."
                  value={patientSearchQuery}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setPatientSearchQuery(newValue);
                    setIsPatientDropdownOpen(true);
                    // Limpa a seleção quando o usuário digita algo diferente do nome selecionado
                    if (formData.patientId && selectedPatient && newValue !== selectedPatient.name) {
                      setFormData((prev) => ({ ...prev, patientId: "" }));
                    }
                  }}
                  onFocus={() => setIsPatientDropdownOpen(true)}
                  onBlur={() => {
                    // Delay para permitir clique no item
                    setTimeout(() => setIsPatientDropdownOpen(false), 200);
                  }}
                  className="h-10 bg-white border-border"
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
                {isPatientDropdownOpen && (patientSearchQuery || filteredPatients.length > 0) && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredPatients.length === 0 ? (
                      <div className="px-4 py-2 text-sm text-muted-foreground">
                        {patientSearchQuery ? "Nenhum paciente encontrado" : "Digite para buscar"}
                      </div>
                    ) : (
                      filteredPatients.map((patient) => (
                        <button
                          key={patient.id}
                          type="button"
                          onClick={() => {
                            handlePatientSelect(patient.id);
                            setIsPatientDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer focus:bg-accent focus:text-accent-foreground"
                        >
                          {patient.name}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Return Consultation Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="returnConsultation"
                checked={isReturnConsultation}
                onCheckedChange={(checked) => setIsReturnConsultation(checked === true)}
              />
              <Label
                htmlFor="returnConsultation"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Consulta de retorno
              </Label>
            </div>

            {/* Appointment Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground font-semibold">
                Título do Agendamento *
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Consulta de Rotina"
                value={formData.name}
                onChange={handleInputChange}
                className="h-10 bg-white border-border"
              />
            </div>

            {/* Start Date/Time */}
            <div className="space-y-2">
              <Label htmlFor="startAt" className="text-foreground font-semibold">
                Data e Hora *
              </Label>
              <Input
                id="startAt"
                name="startAt"
                type="datetime-local"
                value={formData.startAt}
                onChange={handleInputChange}
                className="h-10 bg-white border-border"
              />
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
                className="h-10 bg-white border-border"
              />
              <div className="flex gap-2 flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData((prev) => ({ ...prev, durationInMinutes: "30" }))}
                  className="text-xs h-8"
                >
                  30m
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData((prev) => ({ ...prev, durationInMinutes: "60" }))}
                  className="text-xs h-8"
                >
                  1h
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData((prev) => ({ ...prev, durationInMinutes: "90" }))}
                  className="text-xs h-8"
                >
                  1:30h
                </Button>
              </div>
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
                  Nenhum procedimento adicionado. Clique em "Adicionar Procedimento" para começar.
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
                    <SelectTrigger className="bg-white border-border h-10">
                      <SelectValue placeholder="Selecione um procedimento" />
                    </SelectTrigger>
                    <SelectContent>
                      {procedures.length === 0 ? (
                        <SelectItem value="no-procedures" disabled>
                          Nenhum procedimento cadastrado
                        </SelectItem>
                      ) : (
                        procedures.map((proc) => (
                          <SelectItem key={proc.id} value={proc.id}>
                            {proc.name} - R${" "}
                            {typeof proc.price === "string"
                              ? parseFloat(proc.price).toFixed(2)
                              : proc.price.toFixed(2)}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <Label className="text-sm text-foreground font-medium">
                    Preço (R$) * {isReturnConsultation && "(Consulta de retorno - R$ 0,00)"}
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
                    className="h-10 bg-white border-border"
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
                    className="w-full border border-border rounded-lg p-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
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
              {isSubmitting ? "Criando..." : "Criar Agendamento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
