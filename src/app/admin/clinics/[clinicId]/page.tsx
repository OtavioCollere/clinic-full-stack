"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { use } from "react";
import { ArrowLeft, Building2, Mail, MapPin, Phone, User } from "lucide-react";
import { getClinic, type AdminClinicDetail } from "@/services/admin/admin.service";

function formatCNPJ(v: string) {
  const d = v.replace(/\D/g, "");
  if (d.length !== 14) return v;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function StatusBadge({ status }: { status: string }) {
  const active = status === "ACTIVE";
  return (
    <span
      className="px-2.5 py-1 rounded-full text-xs font-semibold"
      style={active
        ? { background: "var(--grn-lt)", color: "var(--grn)" }
        : { background: "var(--red-lt)", color: "var(--red-cl)" }
      }
    >
      {active ? "Ativa" : "Inativa"}
    </span>
  );
}

export default function ClinicDetailPage({ params }: { params: Promise<{ clinicId: string }> }) {
  const { clinicId } = use(params);
  const [clinic, setClinic] = useState<AdminClinicDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getClinic(clinicId)
      .then(setClinic)
      .catch(() => setError("Clínica não encontrada."))
      .finally(() => setLoading(false));
  }, [clinicId]);

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <div className="h-8 w-48 rounded-lg bg-white/60 animate-pulse" />
        <div className="h-40 rounded-xl bg-white animate-pulse" />
        <div className="h-32 rounded-xl bg-white animate-pulse" />
      </div>
    );
  }

  if (error || !clinic) {
    return (
      <div className="p-8">
        <p className="text-red-600">{error ?? "Erro desconhecido."}</p>
        <Link href="/admin/clinics" className="text-sm text-[#8a6020] hover:underline mt-2 inline-block">
          ← Voltar
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-3xl">
      {/* Back */}
      <Link href="/admin/clinics" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Clínicas
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-border p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#fdf8f0] flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6 text-[#8a6020]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-foreground">{clinic.name}</h1>
              <StatusBadge status={clinic.status} />
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Slug: <span className="font-mono text-foreground">{clinic.slug}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              CNPJ: {formatCNPJ(clinic.cnpj)} · Criada em {formatDate(clinic.createdAt)}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-extrabold text-foreground">{clinic.patientCount}</p>
            <p className="text-[11px] text-muted-foreground">pacientes</p>
          </div>
        </div>
      </div>

      {/* Owner */}
      <div className="bg-white rounded-xl border border-border p-6">
        <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-[#8a6020]" />
          Proprietário
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-semibold">Nome</p>
            <p className="text-sm font-medium text-foreground mt-0.5">{clinic.owner.name}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-semibold flex items-center gap-1"><Mail className="w-3 h-3" />E-mail</p>
            <p className="text-sm text-foreground mt-0.5">{clinic.owner.email}</p>
          </div>
          {clinic.owner.cpf && (
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-semibold">CPF</p>
              <p className="text-sm font-mono text-foreground mt-0.5">{clinic.owner.cpf}</p>
            </div>
          )}
          {clinic.owner.phone && (
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-semibold flex items-center gap-1"><Phone className="w-3 h-3" />Telefone</p>
              <p className="text-sm text-foreground mt-0.5">{clinic.owner.phone}</p>
            </div>
          )}
        </div>
      </div>

      {/* Franchises */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#8a6020]" />
            Unidades
            <span className="ml-1 px-2 py-0.5 rounded-full bg-[#fdf8f0] text-[#6a4815] text-[11px] font-bold">
              {clinic.franchises.length}
            </span>
          </h2>
        </div>

        {clinic.franchises.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Nenhuma unidade cadastrada.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {clinic.franchises.map((f) => (
              <div key={f.id} className="px-6 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{f.name}</span>
                    <StatusBadge status={f.status} />
                  </div>
                  <p className="text-[13px] text-muted-foreground mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    {f.address}
                  </p>
                </div>
                <p className="text-[12px] text-muted-foreground shrink-0">{formatDate(f.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
