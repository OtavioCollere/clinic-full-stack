export const FACIAL_REGIONS = [
  "Testa",
  "Glabela",
  "Olhos / Pés de galinha",
  "Nariz",
  "Lábios",
  "Sulco nasolabial",
  "Bochecha / Malar",
  "Queixo",
  "Mandíbula",
  "Pescoço / Platisma",
  "Décolleté",
  "Mãos",
  "Corpo",
  "Outro",
] as const;

export type FacialRegion = (typeof FACIAL_REGIONS)[number];

export interface PhysicalAssessment {
  bloodPressure: string;
  height: number;
  initialWeight: number;
  finalWeight?: number;
}

export interface MedicalHistory {
  usesMedication: boolean;
  medicationDetails?: string;
  allergy: boolean;
  allergyDetails?: string;
  lactoseIntolerance: boolean;
  diabetes: "controlled" | "yes" | "no" | null;
  roacutan: boolean;
  recentSurgery: boolean;
  recentSurgeryDetails?: string;
  tumorOrPrecancerousLesion: boolean;
  tumorOrLesionDetails?: string;
  skinProblems: boolean;
  skinProblemsDetails?: string;
  orthopedicProblems: boolean;
  orthopedicProblemsDetails?: string;
  hasBodyOrFacialProsthesis: boolean;
  prosthesisDetails?: string;
  usingAcids: boolean;
  acidsDetails?: string;
  otherRelevantIssues?: string;
}

export interface HealthConditions {
  smoker: boolean;
  circulatoryDisorder: boolean;
  epilepsy: boolean;
  regularMenstrualCycle: boolean;
  regularIntestinalFunction: boolean;
  cardiacAlterations: boolean;
  hormonalDisorder: boolean;
  hypoOrHypertension: boolean;
  renalDisorder: boolean;
  varicoseVeinsOrLesions: boolean;
  pregnant: boolean;
  gestationalWeeks?: number;
  underMedicalTreatment: boolean;
  medicalTreatmentDetails?: string;
}

export interface AestheticHistory {
  hadPreviousAestheticTreatment: boolean;
  botulinumToxin: boolean;
  botulinumRegion?: FacialRegion;
  filler: boolean;
  fillerRegion?: FacialRegion;
  fillerProduct?: string;
  suspensionThreads: boolean;
  suspensionThreadsRegion?: FacialRegion;
  suspensionThreadsProduct?: string;
  surgicalLift: boolean;
  surgicalLiftRegion?: FacialRegion;
  surgicalLiftProduct?: string;
  chemicalPeeling: boolean;
  chemicalPeelingRegion?: FacialRegion;
  chemicalPeelingProduct?: string;
  laser: boolean;
  laserRegion?: FacialRegion;
  laserProduct?: string;
  exposedToHeatOrColdWork: boolean;
}

export interface CreateAnamnesisDto {
  physicalAssessment: PhysicalAssessment;
  medicalHistory?: MedicalHistory;
  healthConditions?: HealthConditions;
  aestheticHistory?: AestheticHistory;
  patientSignature?: string;
}