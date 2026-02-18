import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface MedicalFormData {
  // Aesthetic History
  hadAestheticTreatment: boolean;
  botox: boolean;
  botoxRegion?: string;
  fillers: boolean;
  fillersRegion?: string;
  fillersProduct?: string;
  threads: boolean;
  threadsRegion?: string;
  threadsProduct?: string;
  surgicalLift: boolean;
  surgicalLiftRegion?: string;
  surgicalLiftProduct?: string;
  chemicalPeel: boolean;
  chemicalPeelRegion?: string;
  chemicalPeelProduct?: string;
  laser: boolean;
  laserRegion?: string;
  laserProduct?: string;
  exposedToHeatCold: boolean;

  // Health Conditions
  smoker: boolean;
  circulatoryDisorder: boolean;
  epilepsy: boolean;
  regularMenstrualCycle: boolean;
  regularBowelFunction: boolean;
  cardiacIssues: boolean;
  hormonalDisorder: boolean;
  kidneyDisorder: boolean;
  varices: boolean;
  isPregnant: boolean;
  pregnancyWeeks?: number;
  inMedicalTreatment: boolean;
  medicalTreatmentDetails?: string;

  // Medical History
  usesMedication: boolean;
  medicationDetails?: string;
  hasAllergy: boolean;
  allergyDetails?: string;
  lactoseIntolerance: boolean;
  diabetes: "no" | "yes" | "controlled";
  usedRoacutan: boolean;
  recentSurgery: boolean;
  surgeryDetails?: string;
  tumorOrPreCancer: boolean;
  tumorDetails?: string;
  skinProblems: boolean;
  skinProblemsDetails?: string;
  orthopedicProblems: boolean;
  orthopedicDetails?: string;
  corporalProsthesis: boolean;
  prosthesisDetails?: string;
  usesAcids: boolean;
  acidsDetails?: string;
  additionalInfo?: string;

  // Physical Assessment
  bloodPressure?: string;
  height?: number;
  initialWeight?: number;
  finalWeight?: number;
}

interface MedicalFormProps {
  onSubmit: (data: MedicalFormData) => void;
  isLoading?: boolean;
}

export default function MedicalForm({ onSubmit, isLoading = false }: MedicalFormProps) {
  const [formData, setFormData] = useState<MedicalFormData>({
    hadAestheticTreatment: false,
    botox: false,
    fillers: false,
    threads: false,
    surgicalLift: false,
    chemicalPeel: false,
    laser: false,
    exposedToHeatCold: false,
    smoker: false,
    circulatoryDisorder: false,
    epilepsy: false,
    regularMenstrualCycle: false,
    regularBowelFunction: false,
    cardiacIssues: false,
    hormonalDisorder: false,
    kidneyDisorder: false,
    varices: false,
    isPregnant: false,
    inMedicalTreatment: false,
    usesMedication: false,
    hasAllergy: false,
    lactoseIntolerance: false,
    diabetes: "no",
    usedRoacutan: false,
    recentSurgery: false,
    tumorOrPreCancer: false,
    skinProblems: false,
    orthopedicProblems: false,
    corporalProsthesis: false,
    usesAcids: false,
  });

  const handleBooleanChange = (field: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTextChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNumberChange = (field: string, value: number | undefined) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value as any,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const BooleanField = ({
    label,
    value,
    onChange,
    required,
  }: {
    label: string;
    value: boolean;
    onChange: (value: boolean) => void;
    required?: boolean;
  }) => (
    <div className="space-y-2">
      <Label className="text-foreground font-medium">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </Label>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={value === true}
            onChange={() => onChange(true)}
            className="rounded-full"
          />
          <span className="text-sm text-foreground">Sim</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={value === false}
            onChange={() => onChange(false)}
            className="rounded-full"
          />
          <span className="text-sm text-foreground">Não</span>
        </label>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Accordion type="single" collapsible defaultValue="aesthetic" className="space-y-4">
        {/* 1. Aesthetic History */}
        <AccordionItem value="aesthetic" className="border border-border rounded-lg">
          <AccordionTrigger className="px-6 py-4 hover:bg-secondary">
            <span className="font-semibold text-foreground">1. Histórico Estético</span>
          </AccordionTrigger>
          <AccordionContent className="px-6 py-6 space-y-6 border-t border-border">
            <BooleanField
              label="Já realizou tratamento estético anteriormente?"
              value={formData.hadAestheticTreatment}
              onChange={(value) => handleBooleanChange("hadAestheticTreatment", value)}
            />

            {/* Aesthetic Sub-treatments */}
            <div className="space-y-6">
              {/* Botox */}
              <div className="border-l-4 border-blue-200 pl-4 space-y-3">
                <BooleanField
                  label="Toxina Botulínica"
                  value={formData.botox}
                  onChange={(value) => handleBooleanChange("botox", value)}
                />
                {formData.botox && (
                  <Input
                    placeholder="Região"
                    value={formData.botoxRegion || ""}
                    onChange={(e) => handleTextChange("botoxRegion", e.target.value)}
                    className="h-10 bg-white border-border"
                  />
                )}
              </div>

              {/* Fillers */}
              <div className="border-l-4 border-blue-200 pl-4 space-y-3">
                <BooleanField
                  label="Preenchimento"
                  value={formData.fillers}
                  onChange={(value) => handleBooleanChange("fillers", value)}
                />
                {formData.fillers && (
                  <div className="space-y-3">
                    <Input
                      placeholder="Região"
                      value={formData.fillersRegion || ""}
                      onChange={(e) => handleTextChange("fillersRegion", e.target.value)}
                      className="h-10 bg-white border-border"
                    />
                    <Input
                      placeholder="Produto utilizado"
                      value={formData.fillersProduct || ""}
                      onChange={(e) => handleTextChange("fillersProduct", e.target.value)}
                      className="h-10 bg-white border-border"
                    />
                  </div>
                )}
              </div>

              {/* Threads */}
              <div className="border-l-4 border-blue-200 pl-4 space-y-3">
                <BooleanField
                  label="Fios de Sustentação"
                  value={formData.threads}
                  onChange={(value) => handleBooleanChange("threads", value)}
                />
                {formData.threads && (
                  <div className="space-y-3">
                    <Input
                      placeholder="Região"
                      value={formData.threadsRegion || ""}
                      onChange={(e) => handleTextChange("threadsRegion", e.target.value)}
                      className="h-10 bg-white border-border"
                    />
                    <Input
                      placeholder="Produto utilizado"
                      value={formData.threadsProduct || ""}
                      onChange={(e) => handleTextChange("threadsProduct", e.target.value)}
                      className="h-10 bg-white border-border"
                    />
                  </div>
                )}
              </div>

              {/* Surgical Lift */}
              <div className="border-l-4 border-blue-200 pl-4 space-y-3">
                <BooleanField
                  label="Lifting Cirúrgico"
                  value={formData.surgicalLift}
                  onChange={(value) => handleBooleanChange("surgicalLift", value)}
                />
                {formData.surgicalLift && (
                  <div className="space-y-3">
                    <Input
                      placeholder="Região"
                      value={formData.surgicalLiftRegion || ""}
                      onChange={(e) => handleTextChange("surgicalLiftRegion", e.target.value)}
                      className="h-10 bg-white border-border"
                    />
                    <Input
                      placeholder="Produto utilizado"
                      value={formData.surgicalLiftProduct || ""}
                      onChange={(e) => handleTextChange("surgicalLiftProduct", e.target.value)}
                      className="h-10 bg-white border-border"
                    />
                  </div>
                )}
              </div>

              {/* Chemical Peel */}
              <div className="border-l-4 border-blue-200 pl-4 space-y-3">
                <BooleanField
                  label="Peeling Químico"
                  value={formData.chemicalPeel}
                  onChange={(value) => handleBooleanChange("chemicalPeel", value)}
                />
                {formData.chemicalPeel && (
                  <div className="space-y-3">
                    <Input
                      placeholder="Região"
                      value={formData.chemicalPeelRegion || ""}
                      onChange={(e) => handleTextChange("chemicalPeelRegion", e.target.value)}
                      className="h-10 bg-white border-border"
                    />
                    <Input
                      placeholder="Produto utilizado"
                      value={formData.chemicalPeelProduct || ""}
                      onChange={(e) => handleTextChange("chemicalPeelProduct", e.target.value)}
                      className="h-10 bg-white border-border"
                    />
                  </div>
                )}
              </div>

              {/* Laser */}
              <div className="border-l-4 border-blue-200 pl-4 space-y-3">
                <BooleanField
                  label="Laser"
                  value={formData.laser}
                  onChange={(value) => handleBooleanChange("laser", value)}
                />
                {formData.laser && (
                  <div className="space-y-3">
                    <Input
                      placeholder="Região"
                      value={formData.laserRegion || ""}
                      onChange={(e) => handleTextChange("laserRegion", e.target.value)}
                      className="h-10 bg-white border-border"
                    />
                    <Input
                      placeholder="Produto utilizado"
                      value={formData.laserProduct || ""}
                      onChange={(e) => handleTextChange("laserProduct", e.target.value)}
                      className="h-10 bg-white border-border"
                    />
                  </div>
                )}
              </div>
            </div>

            <BooleanField
              label="Trabalha exposto a calor ou frio excessivo?"
              value={formData.exposedToHeatCold}
              onChange={(value) => handleBooleanChange("exposedToHeatCold", value)}
            />
          </AccordionContent>
        </AccordionItem>

        {/* 2. Health Conditions */}
        <AccordionItem value="health" className="border border-border rounded-lg">
          <AccordionTrigger className="px-6 py-4 hover:bg-secondary">
            <span className="font-semibold text-foreground">2. Condições de Saúde</span>
          </AccordionTrigger>
          <AccordionContent className="px-6 py-6 space-y-6 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BooleanField
                label="Fumante"
                value={formData.smoker}
                onChange={(value) => handleBooleanChange("smoker", value)}
              />
              <BooleanField
                label="Distúrbio circulatório"
                value={formData.circulatoryDisorder}
                onChange={(value) => handleBooleanChange("circulatoryDisorder", value)}
              />
              <BooleanField
                label="Epilepsia"
                value={formData.epilepsy}
                onChange={(value) => handleBooleanChange("epilepsy", value)}
              />
              <BooleanField
                label="Ciclo menstrual regular"
                value={formData.regularMenstrualCycle}
                onChange={(value) => handleBooleanChange("regularMenstrualCycle", value)}
              />
              <BooleanField
                label="Função intestinal regular"
                value={formData.regularBowelFunction}
                onChange={(value) => handleBooleanChange("regularBowelFunction", value)}
              />
              <BooleanField
                label="Alterações cardíacas"
                value={formData.cardiacIssues}
                onChange={(value) => handleBooleanChange("cardiacIssues", value)}
              />
              <BooleanField
                label="Distúrbio hormonal"
                value={formData.hormonalDisorder}
                onChange={(value) => handleBooleanChange("hormonalDisorder", value)}
              />
              <BooleanField
                label="Distúrbio renal"
                value={formData.kidneyDisorder}
                onChange={(value) => handleBooleanChange("kidneyDisorder", value)}
              />
              <BooleanField
                label="Varizes ou lesões vasculares"
                value={formData.varices}
                onChange={(value) => handleBooleanChange("varices", value)}
              />
            </div>

            {/* Pregnancy */}
            <div className="border-t border-border pt-6">
              <BooleanField
                label="Está grávida?"
                value={formData.isPregnant}
                onChange={(value) => handleBooleanChange("isPregnant", value)}
              />
              {formData.isPregnant && (
                <div className="mt-3">
                  <Label className="text-foreground font-medium text-sm block mb-2">
                    Semanas de gestação
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.pregnancyWeeks || ""}
                    onChange={(e) =>
                      handleNumberChange("pregnancyWeeks", e.target.value ? parseInt(e.target.value) : undefined)
                    }
                    className="h-10 bg-white border-border"
                  />
                </div>
              )}
            </div>

            {/* Medical Treatment */}
            <div className="border-t border-border pt-6">
              <BooleanField
                label="Está em tratamento médico?"
                value={formData.inMedicalTreatment}
                onChange={(value) => handleBooleanChange("inMedicalTreatment", value)}
              />
              {formData.inMedicalTreatment && (
                <div className="mt-3">
                  <Label className="text-foreground font-medium text-sm block mb-2">
                    Detalhes do tratamento
                  </Label>
                  <textarea
                    value={formData.medicalTreatmentDetails || ""}
                    onChange={(e) => handleTextChange("medicalTreatmentDetails", e.target.value)}
                    className="w-full border border-border rounded-lg p-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 3. Medical History */}
        <AccordionItem value="medical" className="border border-border rounded-lg">
          <AccordionTrigger className="px-6 py-4 hover:bg-secondary">
            <span className="font-semibold text-foreground">3. Histórico Médico</span>
          </AccordionTrigger>
          <AccordionContent className="px-6 py-6 space-y-6 border-t border-border">
            {/* Medication */}
            <div>
              <BooleanField
                label="Usa medicação?"
                value={formData.usesMedication}
                onChange={(value) => handleBooleanChange("usesMedication", value)}
              />
              {formData.usesMedication && (
                <div className="mt-3">
                  <Label className="text-foreground font-medium text-sm block mb-2">
                    Detalhes da medicação
                  </Label>
                  <textarea
                    value={formData.medicationDetails || ""}
                    onChange={(e) => handleTextChange("medicationDetails", e.target.value)}
                    className="w-full border border-border rounded-lg p-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>
              )}
            </div>

            {/* Allergies */}
            <div className="border-t border-border pt-6">
              <BooleanField
                label="Possui alergia?"
                value={formData.hasAllergy}
                onChange={(value) => handleBooleanChange("hasAllergy", value)}
              />
              {formData.hasAllergy && (
                <div className="mt-3">
                  <Label className="text-foreground font-medium text-sm block mb-2">
                    Detalhes da alergia
                  </Label>
                  <textarea
                    value={formData.allergyDetails || ""}
                    onChange={(e) => handleTextChange("allergyDetails", e.target.value)}
                    className="w-full border border-border rounded-lg p-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>
              )}
            </div>

            {/* Other conditions */}
            <div className="border-t border-border pt-6 space-y-6">
              <BooleanField
                label="Intolerância à lactose"
                value={formData.lactoseIntolerance}
                onChange={(value) => handleBooleanChange("lactoseIntolerance", value)}
              />

              <div>
                <Label className="text-foreground font-medium mb-2 block">Diabetes</Label>
                <div className="flex gap-4">
                  {["no", "yes", "controlled"].map((option) => (
                    <label key={option} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.diabetes === option}
                        onChange={() => handleSelectChange("diabetes", option)}
                        className="rounded-full"
                      />
                      <span className="text-sm text-foreground">
                        {option === "no" ? "Não" : option === "yes" ? "Sim" : "Controlada"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <BooleanField
                label="Uso de Roacutan"
                value={formData.usedRoacutan}
                onChange={(value) => handleBooleanChange("usedRoacutan", value)}
              />

              <BooleanField
                label="Cirurgia recente?"
                value={formData.recentSurgery}
                onChange={(value) => handleBooleanChange("recentSurgery", value)}
              />
              {formData.recentSurgery && (
                <Input
                  placeholder="Detalhes da cirurgia"
                  value={formData.surgeryDetails || ""}
                  onChange={(e) => handleTextChange("surgeryDetails", e.target.value)}
                  className="h-10 bg-white border-border"
                />
              )}

              <BooleanField
                label="Tumor ou lesão pré-cancerígena?"
                value={formData.tumorOrPreCancer}
                onChange={(value) => handleBooleanChange("tumorOrPreCancer", value)}
              />
              {formData.tumorOrPreCancer && (
                <Input
                  placeholder="Detalhes"
                  value={formData.tumorDetails || ""}
                  onChange={(e) => handleTextChange("tumorDetails", e.target.value)}
                  className="h-10 bg-white border-border"
                />
              )}

              <BooleanField
                label="Problemas de pele?"
                value={formData.skinProblems}
                onChange={(value) => handleBooleanChange("skinProblems", value)}
              />
              {formData.skinProblems && (
                <Input
                  placeholder="Detalhes"
                  value={formData.skinProblemsDetails || ""}
                  onChange={(e) => handleTextChange("skinProblemsDetails", e.target.value)}
                  className="h-10 bg-white border-border"
                />
              )}

              <BooleanField
                label="Problemas ortopédicos?"
                value={formData.orthopedicProblems}
                onChange={(value) => handleBooleanChange("orthopedicProblems", value)}
              />
              {formData.orthopedicProblems && (
                <Input
                  placeholder="Detalhes"
                  value={formData.orthopedicDetails || ""}
                  onChange={(e) => handleTextChange("orthopedicDetails", e.target.value)}
                  className="h-10 bg-white border-border"
                />
              )}

              <BooleanField
                label="Possui prótese corporal ou facial?"
                value={formData.corporalProsthesis}
                onChange={(value) => handleBooleanChange("corporalProsthesis", value)}
              />
              {formData.corporalProsthesis && (
                <Input
                  placeholder="Detalhes"
                  value={formData.prosthesisDetails || ""}
                  onChange={(e) => handleTextChange("prosthesisDetails", e.target.value)}
                  className="h-10 bg-white border-border"
                />
              )}

              <BooleanField
                label="Uso de ácidos?"
                value={formData.usesAcids}
                onChange={(value) => handleBooleanChange("usesAcids", value)}
              />
              {formData.usesAcids && (
                <Input
                  placeholder="Detalhes"
                  value={formData.acidsDetails || ""}
                  onChange={(e) => handleTextChange("acidsDetails", e.target.value)}
                  className="h-10 bg-white border-border"
                />
              )}
            </div>

            {/* Additional Info */}
            <div className="border-t border-border pt-6">
              <Label className="text-foreground font-medium block mb-2">
                Outras informações relevantes
              </Label>
              <textarea
                value={formData.additionalInfo || ""}
                onChange={(e) => handleTextChange("additionalInfo", e.target.value)}
                className="w-full border border-border rounded-lg p-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                rows={4}
                placeholder="Alguma outra informação que não foi abordada?"
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 4. Physical Assessment */}
        <AccordionItem value="physical" className="border border-border rounded-lg">
          <AccordionTrigger className="px-6 py-4 hover:bg-secondary">
            <span className="font-semibold text-foreground">4. Avaliação Física</span>
          </AccordionTrigger>
          <AccordionContent className="px-6 py-6 space-y-6 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Pressão Arterial</Label>
                <Input
                  placeholder="e.g., 120/80"
                  value={formData.bloodPressure || ""}
                  onChange={(e) => handleTextChange("bloodPressure", e.target.value)}
                  className="h-10 bg-white border-border"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Altura (cm)</Label>
                <Input
                  type="number"
                  placeholder="e.g., 170"
                  value={formData.height || ""}
                  onChange={(e) =>
                    handleNumberChange("height", e.target.value ? parseInt(e.target.value) : undefined)
                  }
                  className="h-10 bg-white border-border"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Peso Inicial (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g., 70.5"
                  value={formData.initialWeight || ""}
                  onChange={(e) =>
                    handleNumberChange("initialWeight", e.target.value ? parseFloat(e.target.value) : undefined)
                  }
                  className="h-10 bg-white border-border"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Peso Final (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g., 70.5"
                  value={formData.finalWeight || ""}
                  onChange={(e) =>
                    handleNumberChange("finalWeight", e.target.value ? parseFloat(e.target.value) : undefined)
                  }
                  className="h-10 bg-white border-border"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Form Actions */}
      <div className="flex gap-3 pt-6 border-t border-border">
        <Button type="button" variant="outline" className="flex-1 border-border">
          Voltar
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-primary hover:bg-primary/90 text-white disabled:opacity-50"
        >
          {isLoading ? "Finalizando..." : "Finalizar Cadastro"}
        </Button>
      </div>
    </form>
  );
}
