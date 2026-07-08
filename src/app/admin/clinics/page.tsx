"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, ChevronRight, Plus, Users } from "lucide-react";
import { listClinics, type AdminClinic } from "@/services/admin/admin.service";

function StatusBadge({ status }: { status: string }) {
  const active = status === "ACTIVE";
  return (
    <span
      className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
      style={active
        ? { background: "var(--grn-lt)", color: "var(--grn)" }
        : { background: "var(--red-lt)", color: "var(--red-cl)" }
      }
    >
      {active ? "Ativa" : "Inativa"}
    </span>
  );
}

export default function AdminClinicsPage() {
  const [clinics, setClinics] = useState<AdminClinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listClinics()
      .then(setClinics)
      .catch(() => setError("Erro ao carregar clínicas."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clínicas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading ? "Carregando..." : `${clinics.length} clínica${clinics.length !== 1 ? "s" : ""} cadastrada${clinics.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link
          href="/admin/onboard"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#8a6020] hover:bg-[#6a4815] text-white text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Clínica
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((k) => (
            <div key={k} className="bg-white rounded-xl border border-border h-24 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && clinics.length === 0 && (
        <div className="bg-white rounded-xl border border-border p-16 text-center">
          <Building2 className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="font-medium text-foreground mb-1">Nenhuma clínica cadastrada</p>
          <p className="text-sm text-muted-foreground mb-5">Crie a primeira clínica para começar.</p>
          <Link
            href="/admin/onboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#8a6020] hover:bg-[#6a4815] text-white text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nova Clínica
          </Link>
        </div>
      )}

      {/* Clinic list */}
      {!loading && clinics.length > 0 && (
        <div className="space-y-2">
          {clinics.map((clinic) => (
            <Link key={clinic.id} href={`/admin/clinics/${clinic.id}`}>
              <div className="bg-white rounded-xl border border-border px-5 py-4 flex items-center gap-4 hover:border-[#cb9849] hover:shadow-sm transition-all cursor-pointer group">
                {/* Icon */}
                <div className="w-10 h-10 rounded-lg bg-[#fdf8f0] flex items-center justify-center shrink-0 group-hover:bg-[#ffe8c4] transition-colors">
                  <Building2 className="w-5 h-5 text-[#8a6020]" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-foreground text-sm">{clinic.name}</span>
                    <StatusBadge status={clinic.status} />
                  </div>
                  <p className="text-[13px] text-muted-foreground mt-0.5">
                    {clinic.owner.name} · {clinic.owner.email}
                  </p>
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-5 shrink-0">
                  <div className="text-center">
                    <p className="text-[11px] text-muted-foreground">Unidades</p>
                    <p className="text-base font-bold text-foreground">{clinic.franchiseCount}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" />Pacientes</p>
                    <p className="text-base font-bold text-foreground">{clinic.patientCount}</p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0 group-hover:text-[#cb9849] transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
