"use client";

import { type AnamnesisResponse } from "@/services/patients/anamnesis.service";
import { ClipboardList } from "lucide-react";

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

function BoolField({ label, value }: { label: string; value: unknown }) {
  const bool = Boolean(value);
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          bool
            ? "bg-amber-100 text-amber-800"
            : "bg-green-100 text-green-800"
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
    <div className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{str}</span>
    </div>
  );
}

export function AnamnesisTimeline({ anamnesis }: AnamnesisTimelineProps) {
  if (!anamnesis) {
    return (
      <div className="bg-slate-50 border border-dashed border-border rounded-xl p-6 text-center">
        <ClipboardList className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
        <p className="text-sm text-muted-foreground">Anamnese ainda não preenchida.</p>
      </div>
    );
  }

  const hc = anamnesis.healthConditions as Record<string, unknown>;
  const mh = anamnesis.medicalHistory as Record<string, unknown>;
  const pa = anamnesis.physicalAssessment as Record<string, unknown>;
  const ah = anamnesis.aestheticHistory as Record<string, unknown>;

  return (
    <div className="relative pl-6">
      {/* Timeline line */}
      <div className="absolute left-2.5 top-4 bottom-4 w-0.5 bg-primary/20 rounded-full" />

      {/* Single entry */}
      <div className="relative">
        {/* Dot */}
        <div className="absolute -left-6 top-4 w-4 h-4 rounded-full bg-primary border-2 border-white shadow" />

        <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">
              Anamnese Registrada
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDateBr(anamnesis.createdAt)}
            </span>
          </div>

          {/* Condições de saúde */}
          {Object.keys(hc).length > 0 && (
            <div>
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">
                Condições de saúde
              </p>
              <BoolField label="Fumante" value={hc.smoker} />
              <BoolField label="Grávida" value={hc.pregnant} />
              <BoolField label="Diabetes" value={hc.diabetes} />
              <BoolField label="Hipertensão" value={hc.hypertension} />
            </div>
          )}

          {/* Histórico médico */}
          {Object.keys(mh).length > 0 && (
            <div>
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">
                Histórico médico
              </p>
              <BoolField label="Usa medicação" value={mh.usesMedication} />
              <BoolField label="Alergia" value={mh.allergy} />
              {mh.medicationName && (
                <TextField label="Medicação" value={mh.medicationName} />
              )}
            </div>
          )}

          {/* Avaliação física */}
          {Object.keys(pa).length > 0 && (
            <div>
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">
                Avaliação física
              </p>
              <TextField label="Pressão arterial" value={pa.bloodPressure} />
              <TextField label="Peso (kg)" value={pa.initialWeight} />
              <TextField label="Altura (cm)" value={pa.height} />
            </div>
          )}

          {/* Histórico estético */}
          {Object.keys(ah).length > 0 && (
            <div>
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">
                Histórico estético
              </p>
              {Object.entries(ah).map(([key, val]) => (
                <TextField key={key} label={key} value={val} />
              ))}
            </div>
          )}

          {/* Assinatura do paciente */}
          {anamnesis.patientSignature && (
            <div>
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
            </div>
          )}

          {anamnesis.updatedAt && anamnesis.updatedAt !== anamnesis.createdAt && (
            <p className="text-xs text-muted-foreground pt-2 border-t border-border">
              Última atualização: {formatDateBr(anamnesis.updatedAt)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
