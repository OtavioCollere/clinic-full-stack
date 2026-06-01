"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MedicalForm from "@/app/[tenant]/dashboard/_components/medical-form";
import { useAuthContext } from "@/context/AuthContext";
import { createAnamnesis } from "@/services/patients/anamnesis.service";
import type { CreateAnamnesisDto, FacialRegion } from "@/services/patients/dtos/create-anamnesis.dto";
import { toast } from "sonner";

interface AnamnesisGateProps {
  isOpen: boolean;
}

interface MedicalFormData {
  hadAestheticTreatment?: boolean;
  botox?: boolean;
  botoxRegion?: FacialRegion;
  fillers?: boolean;
  fillersRegion?: FacialRegion;
  fillersProduct?: string;
  threads?: boolean;
  threadsRegion?: FacialRegion;
  threadsProduct?: string;
  surgicalLift?: boolean;
  surgicalLiftRegion?: FacialRegion;
  surgicalLiftProduct?: string;
  chemicalPeel?: boolean;
  chemicalPeelRegion?: FacialRegion;
  chemicalPeelProduct?: string;
  laser?: boolean;
  laserRegion?: FacialRegion;
  laserProduct?: string;
  exposedToHeatCold?: boolean;
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
  bloodPressure?: string;
  height?: number;
  initialWeight?: number;
  finalWeight?: number;
  patientSignature?: string;
}

function mapMedicalFormToAnamnesis(
  medicalData: MedicalFormData
): CreateAnamnesisDto {
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
      hypoOrHypertension: false,
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
      diabetes:
        medicalData.diabetes === "no"
          ? "no"
          : medicalData.diabetes === "yes"
            ? "yes"
            : medicalData.diabetes === "controlled"
              ? "controlled"
              : null,
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
      bloodPressure: medicalData.bloodPressure!,
      height: medicalData.height!,
      initialWeight: medicalData.initialWeight!,
      finalWeight: medicalData.finalWeight,
    },
    patientSignature: medicalData.patientSignature,
  };
}

export default function AnamnesisGate({ isOpen }: AnamnesisGateProps) {
  const { user, refetchUser } = useAuthContext();
  const [showMedicalForm, setShowMedicalForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMedicalFormSubmit = async (data: MedicalFormData) => {
    if (!user?.patientId) {
      toast.error("Paciente não encontrado. Tente fazer login novamente.");
      return;
    }

    setIsSubmitting(true);
    try {
      const mappedAnamnesis = mapMedicalFormToAnamnesis(data);
      const response = await createAnamnesis(user.patientId, mappedAnamnesis);

      if (response.status === 201) {
        toast.success("Anamnese preenchida com sucesso!");
        await refetchUser();
        setShowMedicalForm(false);
      }
    } catch (error: unknown) {
      const msg =
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data
          ? String((error.response.data as { message?: unknown }).message)
          : "Erro ao enviar anamnese. Tente novamente.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPatient = user?.clinicRole === "PATIENT";
  const needsAnamnesis = isPatient && !user?.isAnamneseDone;

  if (!user || !isPatient || !needsAnamnesis) {
    return null;
  }

  return (
    <>
      <Dialog open={isOpen && !showMedicalForm} onOpenChange={() => {}}>
        <DialogContent
          className="max-w-md"
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <div className="flex justify-center pt-4 pb-2">
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/30"
            >
              Etapa obrigatória: Anamnese
            </Badge>
          </div>

          <DialogHeader className="text-center space-y-3">
            <DialogTitle className="text-2xl font-bold">
              Antes de continuar…
            </DialogTitle>
            <p className="text-sm text-muted-foreground font-normal">
              Para usar o portal, precisamos que você preencha sua anamnese.
              Leva menos de 3 minutos e ajuda a equipe a te atender com mais
              segurança.
            </p>
          </DialogHeader>

          <div className="flex gap-3 pt-6">
            <Button
              onClick={() => setShowMedicalForm(true)}
              className="w-full bg-primary hover:bg-primary/90 text-white"
            >
              Preencher agora
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground pt-4">
            Você só precisa fazer isso uma vez.
          </p>
        </DialogContent>
      </Dialog>

      <Dialog open={showMedicalForm} onOpenChange={setShowMedicalForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preencher Anamnese</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <MedicalForm
              onSubmit={handleMedicalFormSubmit}
              isLoading={isSubmitting}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
