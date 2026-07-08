"use client";

import { ClipboardList } from "lucide-react";
import type { AnamnesisResponse } from "@/services/patients/anamnesis.service";

interface AnamnesisTimelineProps {
  anamnesis: AnamnesisResponse | null;
}

function formatDateBr(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/* ─── Label maps — todos os campos do DTO mapeados ─── */
const HC_LABELS: Record<string, string> = {
  smoker: "Fumante",
  circulatoryDisorder: "Distúrbio circulatório",
  epilepsy: "Epilepsia",
  regularMenstrualCycle: "Ciclo menstrual regular",
  regularIntestinalFunction: "Função intestinal regular",
  cardiacAlterations: "Alterações cardíacas",
  hormonalDisorder: "Distúrbio hormonal",
  hypoOrHypertension: "Hipo/Hipertensão",
  renalDisorder: "Distúrbio renal",
  varicoseVeinsOrLesions: "Varizes ou lesões",
  pregnant: "Grávida",
  gestationalWeeks: "Semanas gestacionais",
  underMedicalTreatment: "Em tratamento médico",
  medicalTreatmentDetails: "Detalhes do tratamento médico",
};

const MH_LABELS: Record<string, string> = {
  usesMedication: "Usa medicação",
  medicationDetails: "Medicações",
  allergy: "Alergia",
  allergyDetails: "Detalhes da alergia",
  lactoseIntolerance: "Intolerância à lactose",
  diabetes: "Diabetes",
  roacutan: "Roacutan",
  recentSurgery: "Cirurgia recente",
  recentSurgeryDetails: "Detalhes da cirurgia",
  tumorOrPrecancerousLesion: "Tumor / lesão pré-cancerosa",
  tumorOrLesionDetails: "Detalhes do tumor/lesão",
  skinProblems: "Problemas de pele",
  skinProblemsDetails: "Detalhes dos problemas de pele",
  orthopedicProblems: "Problemas ortopédicos",
  orthopedicProblemsDetails: "Detalhes ortopédicos",
  hasBodyOrFacialProsthesis: "Prótese corporal ou facial",
  prosthesisDetails: "Detalhes da prótese",
  usingAcids: "Usa ácidos em casa",
  acidsDetails: "Ácidos utilizados",
  otherRelevantIssues: "Outras observações",
};

const AH_LABELS: Record<string, string> = {
  hadPreviousAestheticTreatment: "Tratamento estético anterior",
  botulinumToxin: "Toxina botulínica",
  botulinumRegion: "Região da toxina",
  filler: "Preenchimento",
  fillerRegion: "Região do preenchimento",
  fillerProduct: "Produto utilizado",
  suspensionThreads: "Fios de suspensão",
  suspensionThreadsRegion: "Região dos fios",
  suspensionThreadsProduct: "Produto dos fios",
  surgicalLift: "Lifting cirúrgico",
  surgicalLiftRegion: "Região do lifting",
  surgicalLiftProduct: "Produto do lifting",
  chemicalPeeling: "Peeling químico",
  chemicalPeelingRegion: "Região do peeling",
  chemicalPeelingProduct: "Produto do peeling",
  laser: "Laser",
  laserRegion: "Região do laser",
  laserProduct: "Produto do laser",
  exposedToHeatOrColdWork: "Exposição a calor/frio no trabalho",
};

/* diabetes é enum string, não boolean */
const DIABETES_LABELS: Record<string, string> = {
  yes: "Sim",
  controlled: "Controlado",
  no: "Não",
};

/* ─── Renderers ─── */
function BoolField({ label, value }: { label: string; value: unknown }) {
  const bool = Boolean(value);
  return (
    <div className="py-2 border-b border-slate-100 last:border-0">
      <p className="text-[11px] text-muted-foreground mb-1">{label}</p>
      <span
        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          bool ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"
        }`}
      >
        {bool ? "Sim" : "Não"}
      </span>
    </div>
  );
}

function TextField({ label, value }: { label: string; value: unknown }) {
  const str = value != null && value !== "" ? String(value) : "—";
  return (
    <div className="py-2 border-b border-slate-100 last:border-0">
      <p className="text-[11px] text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm font-medium text-foreground">{str}</p>
    </div>
  );
}

function renderEntries(
  data: Record<string, unknown>,
  labelMap: Record<string, string>,
) {
  return Object.entries(data)
    .filter(([key, v]) => {
      if (v == null || v === "" || v === false) return false;
      // diabetes "no" equivale a false — ocultar
      if (key === "diabetes" && v === "no") return false;
      return true;
    })
    .map(([key, val]) => {
      const label = labelMap[key] ?? key;

      // diabetes: enum string → label em PT
      if (key === "diabetes" && typeof val === "string") {
        return (
          <TextField
            key={key}
            label={label}
            value={DIABETES_LABELS[val] ?? val}
          />
        );
      }

      return typeof val === "boolean" ? (
        <BoolField key={key} label={label} value={val} />
      ) : (
        <TextField key={key} label={label} value={val} />
      );
    });
}

/* ─── Main component ─── */
export function AnamnesisTimeline({ anamnesis }: AnamnesisTimelineProps) {
  if (!anamnesis) {
    return (
      <div className="bg-slate-50 border border-dashed border-border rounded-xl p-6 text-center">
        <ClipboardList className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
        <p className="text-sm text-muted-foreground">
          Anamnese ainda não preenchida.
        </p>
      </div>
    );
  }

  const hc = anamnesis.healthConditions as Record<string, unknown>;
  const mh = anamnesis.medicalHistory as Record<string, unknown>;
  const pa = anamnesis.physicalAssessment as Record<string, unknown>;
  const ah = anamnesis.aestheticHistory as Record<string, unknown>;

  const hcEntries = renderEntries(hc, HC_LABELS);
  const mhEntries = renderEntries(mh, MH_LABELS);
  const ahEntries = renderEntries(ah, AH_LABELS);

  return (
    <div className="relative pl-6">
      <div className="absolute left-2.5 top-4 bottom-4 w-0.5 bg-primary/20 rounded-full" />

      <div className="relative">
        <div className="absolute -left-6 top-4 w-4 h-4 rounded-full bg-primary border-2 border-white shadow" />

        <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">
              Anamnese
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDateBr(anamnesis.createdAt)}
            </span>
          </div>

          {/* Avaliação física */}
          {Object.keys(pa).length > 0 && (
            <section>
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">
                Avaliação física
              </p>
              <TextField label="Pressão arterial" value={pa.bloodPressure} />
              <TextField label="Peso inicial (kg)" value={pa.initialWeight} />
              {pa.finalWeight != null && (
                <TextField label="Peso final (kg)" value={pa.finalWeight} />
              )}
              <TextField label="Altura (m)" value={pa.height} />
            </section>
          )}

          {/* Condições de saúde */}
          {hcEntries.length > 0 && (
            <section>
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">
                Condições de saúde
              </p>
              <div className="grid grid-cols-2 gap-x-6">{hcEntries}</div>
            </section>
          )}

          {/* Histórico médico */}
          {mhEntries.length > 0 && (
            <section>
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">
                Histórico médico
              </p>
              <div className="grid grid-cols-2 gap-x-6">{mhEntries}</div>
            </section>
          )}

          {/* Histórico estético */}
          {ahEntries.length > 0 && (
            <section>
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">
                Histórico estético
              </p>
              <div className="grid grid-cols-2 gap-x-6">{ahEntries}</div>
            </section>
          )}

          {/* Assinatura */}
          {anamnesis.patientSignature && (
            <section>
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">
                Assinatura do paciente
              </p>
              <div className="border border-border rounded-lg overflow-hidden bg-white p-2 max-w-xs">
                <img
                  src={anamnesis.patientSignature}
                  alt="Assinatura do paciente"
                  className="w-full h-auto"
                />
              </div>
            </section>
          )}

          {anamnesis.updatedAt &&
            anamnesis.updatedAt !== anamnesis.createdAt && (
              <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                Última atualização: {formatDateBr(anamnesis.updatedAt)}
              </p>
            )}
        </div>
      </div>
    </div>
  );
}
