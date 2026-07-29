"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import MedicalForm from "@/app/[tenant]/dashboard/_components/medical-form";
import {
  type AnamnesisTokenInfo,
  submitAnamnesisViaToken,
  validateAnamnesisToken,
} from "@/services/anamnesis-token/anamnesis-token.service";
import type {
  CreateAnamnesisDto,
  FacialRegion,
} from "@/services/patients/dtos/create-anamnesis.dto";

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

function mapFormToDto(data: MedicalFormData): CreateAnamnesisDto {
  return {
    aestheticHistory: {
      hadPreviousAestheticTreatment: data.hadAestheticTreatment ?? false,
      botulinumToxin: data.botox ?? false,
      botulinumRegion: data.botoxRegion,
      filler: data.fillers ?? false,
      fillerRegion: data.fillersRegion,
      fillerProduct: data.fillersProduct,
      suspensionThreads: data.threads ?? false,
      suspensionThreadsRegion: data.threadsRegion,
      suspensionThreadsProduct: data.threadsProduct,
      surgicalLift: data.surgicalLift ?? false,
      surgicalLiftRegion: data.surgicalLiftRegion,
      surgicalLiftProduct: data.surgicalLiftProduct,
      chemicalPeeling: data.chemicalPeel ?? false,
      chemicalPeelingRegion: data.chemicalPeelRegion,
      chemicalPeelingProduct: data.chemicalPeelProduct,
      laser: data.laser ?? false,
      laserRegion: data.laserRegion,
      laserProduct: data.laserProduct,
      exposedToHeatOrColdWork: data.exposedToHeatCold ?? false,
    },
    healthConditions: {
      smoker: data.smoker ?? false,
      circulatoryDisorder: data.circulatoryDisorder ?? false,
      epilepsy: data.epilepsy ?? false,
      regularMenstrualCycle: data.regularMenstrualCycle ?? false,
      regularIntestinalFunction: data.regularBowelFunction ?? false,
      cardiacAlterations: data.cardiacIssues ?? false,
      hormonalDisorder: data.hormonalDisorder ?? false,
      hypoOrHypertension: false,
      renalDisorder: data.kidneyDisorder ?? false,
      varicoseVeinsOrLesions: data.varices ?? false,
      pregnant: data.isPregnant ?? false,
      gestationalWeeks: data.pregnancyWeeks,
      underMedicalTreatment: data.inMedicalTreatment ?? false,
      medicalTreatmentDetails: data.medicalTreatmentDetails,
    },
    medicalHistory: {
      usesMedication: data.usesMedication ?? false,
      medicationDetails: data.medicationDetails,
      allergy: data.hasAllergy ?? false,
      allergyDetails: data.allergyDetails,
      lactoseIntolerance: data.lactoseIntolerance ?? false,
      diabetes:
        data.diabetes === "no"
          ? "no"
          : data.diabetes === "yes"
            ? "yes"
            : data.diabetes === "controlled"
              ? "controlled"
              : null,
      roacutan: data.usedRoacutan ?? false,
      recentSurgery: data.recentSurgery ?? false,
      recentSurgeryDetails: data.surgeryDetails,
      tumorOrPrecancerousLesion: data.tumorOrPreCancer ?? false,
      tumorOrLesionDetails: data.tumorDetails,
      skinProblems: data.skinProblems ?? false,
      skinProblemsDetails: data.skinProblemsDetails,
      orthopedicProblems: data.orthopedicProblems ?? false,
      orthopedicProblemsDetails: data.orthopedicDetails,
      hasBodyOrFacialProsthesis: data.corporalProsthesis ?? false,
      prosthesisDetails: data.prosthesisDetails,
      usingAcids: data.usesAcids ?? false,
      acidsDetails: data.acidsDetails,
      otherRelevantIssues: data.additionalInfo,
    },
    physicalAssessment: {
      bloodPressure: data.bloodPressure!,
      height: data.height!,
      initialWeight: data.initialWeight!,
      finalWeight: data.finalWeight,
    },
    patientSignature: data.patientSignature,
  };
}

type PageState =
  | "loading"
  | "valid"
  | "invalid"
  | "expired"
  | "used"
  | "submitted";

export default function AnamnesisTokenPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;

  const [pageState, setPageState] = useState<PageState>("loading");
  const [tokenInfo, setTokenInfo] = useState<AnamnesisTokenInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;

    validateAnamnesisToken(token)
      .then((info) => {
        setTokenInfo(info);
        setPageState("valid");
      })
      .catch((err: unknown) => {
        const status =
          err &&
          typeof err === "object" &&
          "response" in err &&
          err.response &&
          typeof err.response === "object" &&
          "status" in err.response
            ? (err.response as { status: number }).status
            : 400;
        if (status === 410) setPageState("expired");
        else if (status === 409) setPageState("used");
        else setPageState("invalid");
      });
  }, [token]);

  const handleSubmit = async (data: MedicalFormData) => {
    if (!token) return;
    setIsSubmitting(true);
    try {
      await submitAnamnesisViaToken(token, mapFormToDto(data));
      setPageState("submitted");
      toast.success("Anamnese enviada com sucesso!");
    } catch {
      toast.error("Erro ao enviar anamnese. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-2xl font-bold text-purple-700 mb-1">
            Cliniker
          </div>
          <div className="text-sm text-gray-500">Sistema de Gestão Clínica</div>
        </div>

        {pageState === "loading" && (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
            Verificando link…
          </div>
        )}

        {pageState === "invalid" && (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Link inválido
            </h2>
            <p className="text-gray-500">
              Este link de anamnese não existe ou não é válido. Entre em contato
              com a clínica para solicitar um novo link.
            </p>
          </div>
        )}

        {pageState === "expired" && (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <div className="text-5xl mb-4">⏰</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Link expirado
            </h2>
            <p className="text-gray-500">
              Este link de anamnese expirou (validade de 7 dias). Entre em
              contato com a clínica para solicitar um novo link.
            </p>
          </div>
        )}

        {pageState === "used" && (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Anamnese já preenchida
            </h2>
            <p className="text-gray-500">
              Este link já foi utilizado e sua anamnese foi registrada. Caso
              precise atualizá-la, entre em contato com a clínica.
            </p>
          </div>
        )}

        {pageState === "submitted" && (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Anamnese enviada!
            </h2>
            <p className="text-gray-500">
              Obrigada, {tokenInfo?.patientName}. Sua anamnese foi registrada
              com sucesso. A equipe da clínica já pode acessá-la.
            </p>
          </div>
        )}

        {pageState === "valid" && tokenInfo && (
          <div className="bg-white rounded-xl shadow p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Olá, {tokenInfo.patientName}!
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Preencha sua anamnese abaixo. Não é necessário criar conta ou
                fazer login.
              </p>
            </div>
            <MedicalForm onSubmit={handleSubmit} isLoading={isSubmitting} />
          </div>
        )}
      </div>
    </div>
  );
}
