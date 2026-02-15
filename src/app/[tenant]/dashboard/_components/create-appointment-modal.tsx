"use client";

import { useState } from "react";
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
import { Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CreateAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock patients data - in real app, this would come from an API
const mockPatients = [
  { id: "sarah", name: "Sarah Anderson", email: "sarah@example.com" },
  { id: "michael", name: "Michael Johnson", email: "michael@example.com" },
  { id: "emily", name: "Emily Brown", email: "emily@example.com" },
  { id: "david", name: "David Wilson", email: "david@example.com" },
  { id: "lisa", name: "Lisa Martinez", email: "lisa@example.com" },
  { id: "james", name: "James Taylor", email: "james@example.com" },
  { id: "maria", name: "Maria Garcia", email: "maria@example.com" },
  { id: "robert", name: "Robert Lee", email: "robert@example.com" },
];

export default function CreateAppointmentModal({
  isOpen,
  onClose,
}: CreateAppointmentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patientSearch, setPatientSearch] = useState("");
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);

  const [formData, setFormData] = useState({
    franchise: "",
    professional: "",
    patient: "",
    procedures: [] as string[],
    startDate: "",
    startTime: "",
    duration: "",
  });

  // Filter patients based on search
  const filteredPatients = mockPatients.filter((patient) =>
    patient.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
    patient.email.toLowerCase().includes(patientSearch.toLowerCase())
  );

  // Get selected patient name for display
  const selectedPatient = mockPatients.find((p) => p.id === formData.patient);

  const handlePatientSelect = (patientId: string) => {
    handleSelectChange("patient", patientId);
    setPatientSearch("");
    setIsPatientDropdownOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleProcedureToggle = (procedure: string) => {
    setFormData((prev) => ({
      ...prev,
      procedures: prev.procedures.includes(procedure)
        ? prev.procedures.filter((p) => p !== procedure)
        : [...prev.procedures, procedure],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      // 🔥 Aqui você depois vai chamar sua API real
      await new Promise((resolve) => setTimeout(resolve, 1500));

      onClose();

      // Reset form
      setFormData({
        franchise: "",
        professional: "",
        patient: "",
        procedures: [],
        startDate: "",
        startTime: "",
        duration: "",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    formData.franchise &&
    formData.professional &&
    formData.patient &&
    formData.startDate &&
    formData.startTime &&
    formData.duration;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Nova Consulta</DialogTitle>
          <DialogDescription>
            Agende uma consulta para seu paciente
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Franchise */}
          <div className="space-y-2">
            <Label className="font-semibold">Selecionar Franquia *</Label>
            <Select
              value={formData.franchise}
              onValueChange={(value) =>
                handleSelectChange("franchise", value)
              }
            >
              <SelectTrigger className="bg-white border-border h-10">
                <SelectValue placeholder="Escolha uma franquia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="downtown">Downtown Unit</SelectItem>
                <SelectItem value="uptown">Uptown Unit</SelectItem>
                <SelectItem value="mall">Shopping Mall Unit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Professional */}
          <div className="space-y-2">
            <Label className="font-semibold">Selecionar Profissional *</Label>
            <Select
              value={formData.professional}
              onValueChange={(value) =>
                handleSelectChange("professional", value)
              }
            >
              <SelectTrigger className="bg-white border-border h-10">
                <SelectValue placeholder="Escolha um profissional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dr-smith">Dr. John Smith</SelectItem>
                <SelectItem value="dr-garcia">Dr. Maria Garcia</SelectItem>
                <SelectItem value="dr-johnson">Dr. Robert Johnson</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Patient - Searchable Select */}
          <div className="space-y-2">
            <Label className="font-semibold">Selecionar Paciente *</Label>
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Pesquisar paciente por nome ou e-mail..."
                  value={patientSearch || selectedPatient?.name || ""}
                  onChange={(e) => {
                    setPatientSearch(e.target.value);
                    setIsPatientDropdownOpen(true);
                    if (!e.target.value && formData.patient) {
                      handleSelectChange("patient", "");
                    }
                  }}
                  onFocus={() => setIsPatientDropdownOpen(true)}
                  className="pl-10 pr-10 h-10 bg-white border-border"
                />
                {formData.patient && (
                  <button
                    type="button"
                    onClick={() => {
                      handleSelectChange("patient", "");
                      setPatientSearch("");
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {/* Dropdown List */}
              {isPatientDropdownOpen && (
                <>
                  {/* Overlay to close dropdown when clicking outside */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsPatientDropdownOpen(false)}
                  />
                  <div className="absolute z-50 w-full mt-1 bg-white border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map((patient) => (
                        <button
                          key={patient.id}
                          type="button"
                          onClick={() => handlePatientSelect(patient.id)}
                          className="w-full px-4 py-3 text-left hover:bg-secondary transition-colors border-b border-border last:border-b-0"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{patient.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {patient.email}
                            </span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                        Nenhum paciente encontrado
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Procedures */}
          <div className="space-y-2">
            <Label className="font-semibold">Procedimentos</Label>
            <div className="space-y-2">
              {["Cleaning", "Filling", "Root Canal", "Whitening"].map(
                (procedure) => (
                  <label
                    key={procedure}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.procedures.includes(procedure)}
                      onChange={() => handleProcedureToggle(procedure)}
                      className="rounded border-border"
                    />
                    <span className="text-sm">{procedure}</span>
                  </label>
                )
              )}
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-semibold">Data de Início *</Label>
              <Input
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                className="h-10 bg-white border-border"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">Horário de Início *</Label>
              <Input
                name="startTime"
                type="time"
                value={formData.startTime}
                onChange={handleChange}
                className="h-10 bg-white border-border"
              />
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label className="font-semibold">
              Duração (minutos) *
            </Label>
            <Input
              name="duration"
              type="number"
              min="15"
              step="15"
              placeholder="e.g., 30"
              value={formData.duration}
              onChange={handleChange}
              className="h-10 bg-white border-border"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
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
              {isSubmitting
                ? "Agendando..."
                : "Agendar Consulta"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
