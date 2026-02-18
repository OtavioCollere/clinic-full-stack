"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stethoscope, ChevronRight, ChevronLeft, User, Mail, CreditCard, MapPin } from "lucide-react";
import MedicalForm from "../../_components/medical-form";
import { createPatient } from "@/services/patients/patients.service";
import { useAuthContext } from "@/context/AuthContext";
import { useTenant } from "@/hooks/use-tenant";
import { createTenantLink } from "@/lib/tenant-navigation";
import { validateCPF } from "@/utils/validate-cpf";
import { toast } from "sonner";
import type { CreateAnamnesisDto } from "@/services/patients/dtos/create-anamnesis.dto";
import { createAnamnesis } from "@/services/patients/anamnesis.service";

interface UserFormData {
  name: string;
  email: string;
  cpf: string;
}

interface PatientFormData {
  address: string;
  zipCode: string;
  birthDate: string;
}

interface MedicalFormData {
  // Aesthetic History
  hadAestheticTreatment?: boolean;
  botox?: boolean;
  botoxRegion?: string;
  fillers?: boolean;
  fillersRegion?: string;
  fillersProduct?: string;
  threads?: boolean;
  threadsRegion?: string;
  threadsProduct?: string;
  surgicalLift?: boolean;
  surgicalLiftRegion?: string;
  surgicalLiftProduct?: string;
  chemicalPeel?: boolean;
  chemicalPeelRegion?: string;
  chemicalPeelProduct?: string;
  laser?: boolean;
  laserRegion?: string;
  laserProduct?: string;
  exposedToHeatCold?: boolean;

  // Health Conditions
  smoker?: boolean;
  circulatoryDisorder?: boolean;
  epilepsy?: boolean;
  regularMenstrualCycle?: boolean;
  regularBowelFunction?: boolean;
  cardiacIssues?: boolean;
  hormonalDisorder?: boolean;
  kidneyDisorder?: boolean;
  varices?: boolean;
  isPregnant?: boolean;
  pregnancyWeeks?: number;
  inMedicalTreatment?: boolean;
  medicalTreatmentDetails?: string;

  // Medical History
  usesMedication?: boolean;
  medicationDetails?: string;
  hasAllergy?: boolean;
  allergyDetails?: string;
  lactoseIntolerance?: boolean;
  diabetes?: "no" | "yes" | "controlled";
  usedRoacutan?: boolean;
  recentSurgery?: boolean;
  surgeryDetails?: string;
  tumorOrPreCancer?: boolean;
  tumorDetails?: string;
  skinProblems?: boolean;
  skinProblemsDetails?: string;
  orthopedicProblems?: boolean;
  orthopedicDetails?: string;
  corporalProsthesis?: boolean;
  prosthesisDetails?: string;
  usesAcids?: boolean;
  acidsDetails?: string;
  additionalInfo?: string;

  // Physical Assessment
  bloodPressure?: string;
  height?: number;
  initialWeight?: number;
  finalWeight?: number;
}

export default function PatientRegistration() {
  const router = useRouter();
  const { user } = useAuthContext();
  const tenant = useTenant();
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fillMedicalForm, setFillMedicalForm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // CPF validation state
  const [cpfTouched, setCpfTouched] = useState(false);
  const [cpfIsValid, setCpfIsValid] = useState<boolean | null>(null);
  
  const [userData, setUserData] = useState<UserFormData>({
    name: "",
    email: "",
    cpf: "",
  });

  const [patientId, setPatientId] = useState<string>("");

  const [patientData, setPatientData] = useState<PatientFormData>({
    address: "",
    zipCode: "",
    birthDate: "",
  });

  const [anamnesisData, setAnamnesisData] = useState<CreateAnamnesisDto>({});

  // CPF masking function - formats input as 000.000.000-00
  const maskCPF = (value: string): string => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
    if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
  };

  const handleUserDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Apply CPF masking if it's the CPF field
    if (name === "cpf") {
      const maskedValue = maskCPF(value);
      setUserData((prev) => ({
        ...prev,
        [name]: maskedValue,
      }));
      
      // Reset validation state while typing (neutral state)
      // Only validate if field was previously touched
      if (cpfTouched) {
        const isValid = validateCPF(maskedValue);
        setCpfIsValid(isValid);
      }
    } else {
      setUserData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handlePatientDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPatientData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle CPF blur - validate when user leaves the field
  const handleCpfBlur = () => {
    setCpfTouched(true);
    if (userData.cpf) {
      const isValid = validateCPF(userData.cpf);
      setCpfIsValid(isValid);
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!userData.name.trim()) {
      newErrors.name = "Nome completo é obrigatório";
    }
    if (!userData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      newErrors.email = "Email inválido";
    }
    if (!userData.cpf.trim()) {
      newErrors.cpf = "CPF é obrigatório";
    } else if (!validateCPF(userData.cpf)) {
      newErrors.cpf = "CPF inválido";
    }
    if (!patientData.birthDate) {
      newErrors.birthDate = "Data de nascimento é obrigatória";
    }
    if (!patientData.address.trim()) {
      newErrors.address = "Endereço é obrigatório";
    }
    if (!patientData.zipCode.trim()) {
      newErrors.zipCode = "CEP é obrigatório";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else {
      router.push(createTenantLink(tenant, "/dashboard/patients"));
    }
  };

  const handlePatientRegistration = async () => {
    if (!validateStep1()) {
      return;
    }

    if (!user?.clinicId) {
      toast.error("Clínica não encontrada. Faça login novamente.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Backend cria usuário e paciente em uma transação
      const response = await createPatient({
        clinicId: user.clinicId,
        name: userData.name,
        cpf: userData.cpf,
        email: userData.email,
        birthDay: new Date(patientData.birthDate),
        address: patientData.address,
        zipCode: patientData.zipCode,
      });

      // O serviço já retorna response.data, então acessamos diretamente
      if (response?.id) {
        setPatientId(response.id);
        toast.success("Paciente criado com sucesso!");
        setCurrentStep(2);
      } else {
        toast.error("Erro ao criar paciente. ID não retornado.");
      }
    } catch (error: unknown) {
      console.error("Erro ao criar paciente:", error);
      
      // Tenta extrair a mensagem de erro de diferentes formatos possíveis
      let errorMessage = "Erro ao criar paciente. Tente novamente.";
      
      try {
        if (error && typeof error === 'object' && 'response' in error) {
          // Axios error com response
          const axiosError = error as { response?: { data?: unknown; status?: number } };
          const responseData = axiosError.response?.data;
          
          if (typeof responseData === 'string') {
            errorMessage = responseData;
          } else if (responseData && typeof responseData === 'object') {
            const data = responseData as Record<string, unknown>;
            if (typeof data.message === 'string') {
              errorMessage = data.message;
            } else if (typeof data.error === 'string') {
              errorMessage = data.error;
            } else if (Array.isArray(data.message) && data.message.length > 0) {
              // NestJS pode retornar array de mensagens de validação
              errorMessage = String(data.message[0]);
            }
          }
        } else if (error instanceof Error) {
          // Erro padrão do JavaScript
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        }
      } catch (parseError) {
        // Se houver erro ao parsear, usa mensagem padrão
        console.error("Erro ao parsear mensagem de erro:", parseError);
      }
      
      // Garante que o toast seja exibido mesmo se houver algum problema
      setTimeout(() => {
        toast.error(errorMessage);
      }, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para mapear MedicalFormData para CreateAnamnesisDto
  const mapMedicalFormToAnamnesis = (medicalData: MedicalFormData): CreateAnamnesisDto => {
    return {
      aestheticHistory: {
        hadPreviousAestheticTreatment: medicalData.hadAestheticTreatment ?? false,
        botulinumToxin: medicalData.botox ?? false,
        botulinumRegion: medicalData.botoxRegion,
        filler: medicalData.fillers ?? false,
        fillerRegion: medicalData.fillersRegion,
        fillerProduct: medicalData.fillersProduct,
        suspensionThreads: medicalData.threads ?? false,
        suspensionThreadsRegion: medicalData.threadsRegion,
        suspensionThreadsProduct: medicalData.threadsProduct,
        surgicalLift: medicalData.surgicalLift ?? false,
        surgicalLiftRegion: medicalData.surgicalLiftRegion,
        surgicalLiftProduct: medicalData.surgicalLiftProduct,
        chemicalPeeling: medicalData.chemicalPeel ?? false,
        chemicalPeelingRegion: medicalData.chemicalPeelRegion,
        chemicalPeelingProduct: medicalData.chemicalPeelProduct,
        laser: medicalData.laser ?? false,
        laserRegion: medicalData.laserRegion,
        laserProduct: medicalData.laserProduct,
        exposedToHeatOrColdWork: medicalData.exposedToHeatCold ?? false,
      },
      healthConditions: {
        smoker: medicalData.smoker ?? false,
        circulatoryDisorder: medicalData.circulatoryDisorder ?? false,
        epilepsy: medicalData.epilepsy ?? false,
        regularMenstrualCycle: medicalData.regularMenstrualCycle ?? false,
        regularIntestinalFunction: medicalData.regularBowelFunction ?? false,
        cardiacAlterations: medicalData.cardiacIssues ?? false,
        hormonalDisorder: medicalData.hormonalDisorder ?? false,
        hypoOrHypertension: false, // Não há campo correspondente no formulário
        renalDisorder: medicalData.kidneyDisorder ?? false,
        varicoseVeinsOrLesions: medicalData.varices ?? false,
        pregnant: medicalData.isPregnant ?? false,
        gestationalWeeks: medicalData.pregnancyWeeks,
        underMedicalTreatment: medicalData.inMedicalTreatment ?? false,
        medicalTreatmentDetails: medicalData.medicalTreatmentDetails,
      },
      medicalHistory: {
        usesMedication: medicalData.usesMedication ?? false,
        medicationDetails: medicalData.medicationDetails,
        allergy: medicalData.hasAllergy ?? false,
        allergyDetails: medicalData.allergyDetails,
        lactoseIntolerance: medicalData.lactoseIntolerance ?? false,
        diabetes: medicalData.diabetes === "no" ? "no" : medicalData.diabetes === "yes" ? "yes" : medicalData.diabetes === "controlled" ? "controlled" : null,
        roacutan: medicalData.usedRoacutan ?? false,
        recentSurgery: medicalData.recentSurgery ?? false,
        recentSurgeryDetails: medicalData.surgeryDetails,
        tumorOrPrecancerousLesion: medicalData.tumorOrPreCancer ?? false,
        tumorOrLesionDetails: medicalData.tumorDetails,
        skinProblems: medicalData.skinProblems ?? false,
        skinProblemsDetails: medicalData.skinProblemsDetails,
        orthopedicProblems: medicalData.orthopedicProblems ?? false,
        orthopedicProblemsDetails: medicalData.orthopedicDetails,
        hasBodyOrFacialProsthesis: medicalData.corporalProsthesis ?? false,
        prosthesisDetails: medicalData.prosthesisDetails,
        usingAcids: medicalData.usesAcids ?? false,
        acidsDetails: medicalData.acidsDetails,
        otherRelevantIssues: medicalData.additionalInfo,
      },
      physicalAssessment: {
        bloodPressure: medicalData.bloodPressure,
        height: medicalData.height,
        initialWeight: medicalData.initialWeight,
        finalWeight: medicalData.finalWeight,
      },
    };
  };

  // Função para validar se a anamnese tem dados preenchidos
  const validateAnamnesisData = (data: CreateAnamnesisDto): { isValid: boolean; missingSection?: string } => {
    // Verifica se pelo menos uma seção tem dados significativos
    // Considera tanto valores true quanto campos de texto preenchidos
    const hasAestheticHistory = data.aestheticHistory && (
      data.aestheticHistory.hadPreviousAestheticTreatment === true ||
      data.aestheticHistory.botulinumToxin === true ||
      data.aestheticHistory.botulinumRegion ||
      data.aestheticHistory.filler === true ||
      data.aestheticHistory.fillerRegion ||
      data.aestheticHistory.fillerProduct ||
      data.aestheticHistory.suspensionThreads === true ||
      data.aestheticHistory.suspensionThreadsRegion ||
      data.aestheticHistory.suspensionThreadsProduct ||
      data.aestheticHistory.surgicalLift === true ||
      data.aestheticHistory.surgicalLiftRegion ||
      data.aestheticHistory.surgicalLiftProduct ||
      data.aestheticHistory.chemicalPeeling === true ||
      data.aestheticHistory.chemicalPeelingRegion ||
      data.aestheticHistory.chemicalPeelingProduct ||
      data.aestheticHistory.laser === true ||
      data.aestheticHistory.laserRegion ||
      data.aestheticHistory.laserProduct ||
      data.aestheticHistory.exposedToHeatOrColdWork === true
    );

    const hasHealthConditions = data.healthConditions && (
      data.healthConditions.smoker === true ||
      data.healthConditions.circulatoryDisorder === true ||
      data.healthConditions.epilepsy === true ||
      data.healthConditions.regularMenstrualCycle === true ||
      data.healthConditions.regularIntestinalFunction === true ||
      data.healthConditions.cardiacAlterations === true ||
      data.healthConditions.hormonalDisorder === true ||
      data.healthConditions.hypoOrHypertension === true ||
      data.healthConditions.renalDisorder === true ||
      data.healthConditions.varicoseVeinsOrLesions === true ||
      data.healthConditions.pregnant === true ||
      data.healthConditions.gestationalWeeks !== undefined ||
      data.healthConditions.underMedicalTreatment === true ||
      data.healthConditions.medicalTreatmentDetails
    );

    const hasMedicalHistory = data.medicalHistory && (
      data.medicalHistory.usesMedication === true ||
      data.medicalHistory.medicationDetails ||
      data.medicalHistory.allergy === true ||
      data.medicalHistory.allergyDetails ||
      data.medicalHistory.lactoseIntolerance === true ||
      data.medicalHistory.diabetes !== null ||
      data.medicalHistory.roacutan === true ||
      data.medicalHistory.recentSurgery === true ||
      data.medicalHistory.recentSurgeryDetails ||
      data.medicalHistory.tumorOrPrecancerousLesion === true ||
      data.medicalHistory.tumorOrLesionDetails ||
      data.medicalHistory.skinProblems === true ||
      data.medicalHistory.skinProblemsDetails ||
      data.medicalHistory.orthopedicProblems === true ||
      data.medicalHistory.orthopedicProblemsDetails ||
      data.medicalHistory.hasBodyOrFacialProsthesis === true ||
      data.medicalHistory.prosthesisDetails ||
      data.medicalHistory.usingAcids === true ||
      data.medicalHistory.acidsDetails ||
      data.medicalHistory.otherRelevantIssues
    );

    const hasPhysicalAssessment = data.physicalAssessment && (
      (data.physicalAssessment.bloodPressure && data.physicalAssessment.bloodPressure.trim() !== '') ||
      data.physicalAssessment.height !== undefined ||
      data.physicalAssessment.initialWeight !== undefined ||
      data.physicalAssessment.finalWeight !== undefined
    );

    if (!hasAestheticHistory && !hasHealthConditions && !hasMedicalHistory && !hasPhysicalAssessment) {
      return {
        isValid: false,
        missingSection: "aesthetic" // Retorna a primeira seção para abrir
      };
    }

    return { isValid: true };
  };

  const handleMedicalFormSubmit = async (medicalData: MedicalFormData) => {
    // Mapeia os dados do formulário para o formato da anamnese
    const mappedAnamnesis = mapMedicalFormToAnamnesis(medicalData);
    setAnamnesisData(mappedAnamnesis);
    
    // Valida os dados mapeados diretamente (não depende do estado)
    const validation = validateAnamnesisData(mappedAnamnesis);
    
    if (!validation.isValid) {
      toast.error("Preencha pelo menos uma seção do formulário de anamnese para finalizar o cadastro.");
      
      // Abre o accordion da seção que precisa ser preenchida
      if (validation.missingSection) {
        setTimeout(() => {
          // Encontra o AccordionItem pelo value usando o seletor correto
          const accordionItem = Array.from(document.querySelectorAll('[data-state]')).find(
            (el) => el.getAttribute('data-value') === validation.missingSection || 
                    el.querySelector(`[value="${validation.missingSection}"]`)
          ) as HTMLElement;
          
          // Se não encontrar pelo data-value, tenta encontrar pelo conteúdo
          if (!accordionItem) {
            const allAccordions = Array.from(document.querySelectorAll('[class*="AccordionItem"]'));
            const targetAccordion = allAccordions.find((el) => {
              const text = el.textContent || '';
              const sectionMap: Record<string, string> = {
                'aesthetic': 'Histórico Estético',
                'health': 'Condições de Saúde',
                'medical': 'Histórico Médico',
                'physical': 'Avaliação Física'
              };
              return text.includes(sectionMap[validation.missingSection || ''] || '');
            }) as HTMLElement;
            
            if (targetAccordion) {
              const trigger = targetAccordion.querySelector('button') as HTMLElement;
              if (trigger) {
                trigger.click();
                targetAccordion.scrollIntoView({ behavior: 'smooth', block: 'center' });
                targetAccordion.style.border = '2px solid #ef4444';
                targetAccordion.style.borderRadius = '8px';
                setTimeout(() => {
                  targetAccordion.style.border = '';
                  targetAccordion.style.borderRadius = '';
                }, 3000);
              }
            }
          } else {
            const trigger = accordionItem.querySelector('button') as HTMLElement;
            if (trigger) {
              trigger.click();
              accordionItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
              accordionItem.style.border = '2px solid #ef4444';
              accordionItem.style.borderRadius = '8px';
    setTimeout(() => {
                accordionItem.style.border = '';
                accordionItem.style.borderRadius = '';
              }, 3000);
            }
          }
        }, 200);
      }
      return;
    }
    
    // Chama handleAnamnesisForm com os dados mapeados
    await handleAnamnesisForm(mappedAnamnesis);
  };

  const handleAnamnesisForm = async (data?: CreateAnamnesisDto) => {
    if (!patientId) {
      toast.error("Paciente não encontrado. Por favor, recarregue a página.");
      return;
    }

    if (fillMedicalForm) {
      // Usa os dados passados como parâmetro ou do estado
      const anamnesisToSubmit = data || anamnesisData;
      
      // Valida novamente
      const validation = validateAnamnesisData(anamnesisToSubmit);
      
      if (!validation.isValid) {
        toast.error("Preencha pelo menos uma seção do formulário de anamnese para finalizar o cadastro.");
        
        // Abre o accordion da seção que precisa ser preenchida
        if (validation.missingSection) {
          setTimeout(() => {
            const accordionTrigger = document.querySelector(`[value="${validation.missingSection}"]`) as HTMLElement;
            if (accordionTrigger) {
              accordionTrigger.click();
              // Adiciona destaque visual
              accordionTrigger.scrollIntoView({ behavior: 'smooth', block: 'center' });
              accordionTrigger.style.border = '2px solid #ef4444';
              accordionTrigger.style.borderRadius = '8px';
              setTimeout(() => {
                accordionTrigger.style.border = '';
                accordionTrigger.style.borderRadius = '';
              }, 3000);
            }
          }, 100);
        }
        return;
      }

      setIsSubmitting(true);
      try {
        const response = await createAnamnesis(patientId, anamnesisToSubmit);

        if (response.status === 201) {
          toast.success("Anamnese criada com sucesso!");
          router.push(createTenantLink(tenant, "/dashboard/patients"));
        }
      } catch (error: any) {
        console.error("Erro ao criar anamnese:", error);
        const errorMessage = error?.response?.data?.message 
          || error?.message 
          || "Erro ao criar anamnese. Tente novamente.";
        toast.error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Se não estiver marcado, finaliza sem anamnese e redireciona
      router.push(createTenantLink(tenant, "/dashboard/patients"));
    }
  };

  return (  
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-foreground">SaaS Clinic</span>
          </div>

          {/* Progress Indicator */}
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep >= 1
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > 1 ? "✓" : "1"}
              </div>
              <span
                className={`text-sm font-medium ${
                  currentStep >= 1 ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                Dados Pessoais
              </span>
            </div>
            <div className="w-12 h-0.5 mx-2 bg-border"></div>
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep >= 2
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                2
              </div>
              <span
                className={`text-sm font-medium ${
                  currentStep >= 2 ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                Anamnese
              </span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            {currentStep === 1 ? "Cadastro do Paciente" : "Formulário de Anamnese"}
          </h1>
          <p className="text-muted-foreground">
            {currentStep === 1
              ? "Preencha os dados pessoais do paciente"
              : "Preencha o formulário de saúde (opcional)"}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
          {currentStep === 1 ? (
            // STEP 1: Patient Basic Information
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground">Dados do Usuário</h2>

            {/* Full Name */}
            <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground font-semibold">
                Nome Completo *
              </Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                    id="name"
                    name="name"
                type="text"
                    placeholder="e.g., João Silva"
                    value={userData.name}
                    onChange={handleUserDataChange}
                    className={`pl-12 h-11 bg-white border-border ${
                      errors.name ? "border-red-500 focus:ring-red-500" : ""
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-semibold">
                  Email *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="e.g., joao@email.com"
                    value={userData.email}
                    onChange={handleUserDataChange}
                    className={`pl-12 h-11 bg-white border-border ${
                      errors.email ? "border-red-500 focus:ring-red-500" : ""
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email}</p>
                )}
            </div>

            {/* CPF */}
            <div className="space-y-2">
              <Label htmlFor="cpf" className="text-foreground font-semibold">
                CPF *
              </Label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="cpf"
                name="cpf"
                type="text"
                    placeholder="000.000.000-00"
                    value={userData.cpf}
                    onChange={handleUserDataChange}
                    onBlur={handleCpfBlur}
                    className={`pl-12 h-11 bg-white border-border ${
                      cpfTouched
                        ? cpfIsValid === false
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : cpfIsValid === true
                          ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                          : ""
                        : errors.cpf
                        ? "border-red-500 focus:ring-red-500"
                        : ""
                    }`}
              />
            </div>
                {cpfTouched && cpfIsValid === false && (
                  <p className="text-sm text-red-500">Coloque um CPF válido</p>
                )}
                {errors.cpf && !cpfTouched && (
                  <p className="text-sm text-red-600">{errors.cpf}</p>
                )}
              </div>

              <h2 className="text-xl font-bold text-foreground pt-4 border-t border-border">
                Dados do Paciente
              </h2>

            {/* Birth Date */}
            <div className="space-y-2">
              <Label htmlFor="birthDate" className="text-foreground font-semibold">
                Data de Nascimento *
              </Label>
              <Input
                id="birthDate"
                name="birthDate"
                type="date"
                  value={patientData.birthDate}
                  onChange={handlePatientDataChange}
                  className={`h-11 bg-white border-border ${
                    errors.birthDate ? "border-red-500 focus:ring-red-500" : ""
                  }`}
                />
                {errors.birthDate && (
                  <p className="text-sm text-red-600">{errors.birthDate}</p>
                )}
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="text-foreground font-semibold">
                Endereço *
              </Label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="address"
                name="address"
                type="text"
                    placeholder="e.g., Rua das Flores, 123"
                    value={patientData.address}
                    onChange={handlePatientDataChange}
                    className={`pl-12 h-11 bg-white border-border ${
                      errors.address ? "border-red-500 focus:ring-red-500" : ""
                    }`}
                  />
                </div>
                {errors.address && (
                  <p className="text-sm text-red-600">{errors.address}</p>
                )}
            </div>

            {/* Zip Code */}
            <div className="space-y-2">
              <Label htmlFor="zipCode" className="text-foreground font-semibold">
                CEP *
              </Label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="zipCode"
                name="zipCode"
                type="text"
                placeholder="e.g., 12345-678"
                    value={patientData.zipCode}
                    onChange={handlePatientDataChange}
                    className={`pl-12 h-11 bg-white border-border ${
                      errors.zipCode ? "border-red-500 focus:ring-red-500" : ""
                    }`}
                  />
                </div>
                {errors.zipCode && (
                  <p className="text-sm text-red-600">{errors.zipCode}</p>
                )}
            </div>

              {/* Step 1 Buttons */}
              <div className="flex gap-3 pt-6 border-t border-border">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1 h-11 border-border"
                  type="button"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  onClick={handlePatientRegistration}
                  disabled={isSubmitting}
                  className="flex-1 h-11 bg-primary hover:bg-primary/90 text-white disabled:opacity-50"
                  type="button"
                >
                  {isSubmitting ? "Cadastrando..." : "Cadastrar Paciente"}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          ) : (
            // STEP 2: Anamnese
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground">Anamnese</h2>

              {/* Toggle for Medical Form */}
              <div className="bg-secondary/40 rounded-lg p-4 border border-border">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fillMedicalForm}
                    onChange={(e) => setFillMedicalForm(e.target.checked)}
                    className="rounded"
                  />
                  <span className="font-medium text-foreground">
                    Preencher anamnese agora
                  </span>
                </label>
                <p className="text-sm text-muted-foreground mt-2">
                  Se desmarcar, o paciente será criado com status "Anamnese Pendente" e poderá
                  preencher posteriormente.
                </p>
            </div>

              {/* Medical Form - Show only if checkbox is checked */}
              {fillMedicalForm && (
                <div className="border-t border-border pt-6">
                  <MedicalForm
                    onSubmit={handleMedicalFormSubmit}
                    isLoading={isSubmitting}
              />
            </div>
              )}

              {/* Step 2 Buttons (only show if medical form is not visible) */}
              {!fillMedicalForm && (
                <div className="flex gap-3 pt-6 border-t border-border">
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    className="flex-1 h-11 border-border"
                    type="button"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
            <Button
                    onClick={() => handleAnamnesisForm()}
                    disabled={isSubmitting}
                    className="flex-1 h-11 bg-primary hover:bg-primary/90 text-white disabled:opacity-50"
                    type="button"
                  >
                    {isSubmitting ? "Finalizando..." : "Finalizar Cadastro"}
            </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          {currentStep === 1
            ? "Passo 1 de 2 – Dados Pessoais"
            : "Passo 2 de 2 – Formulário de Anamnese"}
        </p>
        </div>
      </div>
  );
}
