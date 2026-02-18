export interface PhysicalAssessment {
  bloodPressure?: string;
  height?: number;
  initialWeight?: number;
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
  botulinumRegion?: string;
  filler: boolean;
  fillerRegion?: string;
  fillerProduct?: string;
  suspensionThreads: boolean;
  suspensionThreadsRegion?: string;
  suspensionThreadsProduct?: string;
  surgicalLift: boolean;
  surgicalLiftRegion?: string;
  surgicalLiftProduct?: string;
  chemicalPeeling: boolean;
  chemicalPeelingRegion?: string;
  chemicalPeelingProduct?: string;
  laser: boolean;
  laserRegion?: string;
  laserProduct?: string;
  exposedToHeatOrColdWork: boolean;
}

export interface CreateAnamnesisDto {
  physicalAssessment?: PhysicalAssessment;
  medicalHistory?: MedicalHistory;
  healthConditions?: HealthConditions;
  aestheticHistory?: AestheticHistory;
}