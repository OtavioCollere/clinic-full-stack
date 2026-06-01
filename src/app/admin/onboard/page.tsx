"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Stethoscope,
  Building2,
  User,
  Mail,
  CreditCard,
  CheckCircle2,
  MapPin,
  Plus,
  Trash2,
  Briefcase,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { validateCPF } from "@/utils/validate-cpf";
import { toast } from "sonner";

// --- Types ---
interface ClinicData {
  clinicName: string;
  cnpj: string;
  ownerName: string;
  ownerCpf: string;
  ownerEmail: string;
}

interface FranchiseData {
  name: string;
  address: string;
  zipCode: string;
  description: string;
}

interface ProfessionalData {
  name: string;
  cpf: string;
  email: string;
  franchiseIndex: number;
  profession: "MEDICO" | "BIOMEDICO" | "";
  council: "CRM" | "CRBM" | "";
  councilNumber: string;
  councilState: string;
}

// --- Masks ---
function maskCPF(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`;
}

function maskCNPJ(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12, 14)}`;
}

function maskZip(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

// --- Default values ---
const emptyFranchise = (): FranchiseData => ({ name: "", address: "", zipCode: "", description: "" });
const emptyProfessional = (): ProfessionalData => ({
  name: "",
  cpf: "",
  email: "",
  franchiseIndex: 0,
  profession: "",
  council: "",
  councilNumber: "",
  councilState: "",
});

// --- Step indicator ---
function StepIndicator({ step }: { step: number }) {
  const steps = ["Clínica & Responsável", "Unidades (Franquias)", "Profissionais"];
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                i + 1 === step
                  ? "bg-primary text-primary-foreground"
                  : i + 1 < step
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1 < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-xs mt-1 whitespace-nowrap ${i + 1 === step ? "text-foreground font-medium" : "text-muted-foreground"}`}>
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-12 h-px mb-5 mx-1 ${i + 1 < step ? "bg-primary/40" : "bg-border"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// --- Main Page ---
export default function OnboardClinicPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<{ email: string; clinicSlug: string } | null>(null);

  // Step 1
  const [clinic, setClinic] = useState<ClinicData>({
    clinicName: "", cnpj: "", ownerName: "", ownerCpf: "", ownerEmail: "",
  });
  const [ownerCpfValid, setOwnerCpfValid] = useState<boolean | null>(null);
  const [ownerCpfTouched, setOwnerCpfTouched] = useState(false);

  // Step 2
  const [franchises, setFranchises] = useState<FranchiseData[]>([emptyFranchise()]);

  // Step 3
  const [professionals, setProfessionals] = useState<ProfessionalData[]>([]);
  const [profCpfState, setProfCpfState] = useState<(boolean | null)[]>([]);

  // --- Step 1 handlers ---
  const handleClinicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "ownerCpf") {
      const masked = maskCPF(value);
      setClinic((p) => ({ ...p, ownerCpf: masked }));
      if (ownerCpfTouched) setOwnerCpfValid(validateCPF(masked));
    } else if (name === "cnpj") {
      setClinic((p) => ({ ...p, cnpj: maskCNPJ(value) }));
    } else {
      setClinic((p) => ({ ...p, [name]: value }));
    }
  };

  const goToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCPF(clinic.ownerCpf)) {
      setOwnerCpfTouched(true);
      setOwnerCpfValid(false);
      return;
    }
    setStep(2);
  };

  // --- Step 2 handlers ---
  const updateFranchise = (i: number, field: keyof FranchiseData, value: string) => {
    setFranchises((prev) => {
      const next = [...prev];
      if (field === "zipCode") {
        next[i] = { ...next[i], zipCode: maskZip(value) };
      } else {
        next[i] = { ...next[i], [field]: value };
      }
      return next;
    });
  };

  const addFranchise = () => setFranchises((p) => [...p, emptyFranchise()]);

  const removeFranchise = (i: number) => {
    setFranchises((p) => p.filter((_, idx) => idx !== i));
    // Fix professional franchiseIndex references
    setProfessionals((p) =>
      p.map((prof) => ({
        ...prof,
        franchiseIndex: prof.franchiseIndex >= i
          ? Math.max(0, prof.franchiseIndex - 1)
          : prof.franchiseIndex,
      }))
    );
  };

  const goToStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    for (const f of franchises) {
      if (!f.name || !f.address || !f.zipCode) {
        toast.error("Preencha todos os campos obrigatórios das unidades.");
        return;
      }
    }
    setStep(3);
  };

  // --- Step 3 handlers ---
  const updateProfessional = (i: number, field: keyof ProfessionalData, value: string | number) => {
    setProfessionals((prev) => {
      const next = [...prev];
      if (field === "cpf") {
        const masked = maskCPF(value as string);
        next[i] = { ...next[i], cpf: masked };
        setProfCpfState((s) => {
          const ns = [...s];
          ns[i] = null;
          return ns;
        });
      } else {
        next[i] = { ...next[i], [field]: value };
      }
      return next;
    });
  };

  const addProfessional = () => {
    setProfessionals((p) => [...p, emptyProfessional()]);
    setProfCpfState((s) => [...s, null]);
  };

  const removeProfessional = (i: number) => {
    setProfessionals((p) => p.filter((_, idx) => idx !== i));
    setProfCpfState((s) => s.filter((_, idx) => idx !== i));
  };

  // --- Final submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    for (let i = 0; i < professionals.length; i++) {
      const prof = professionals[i];
      if (!validateCPF(prof.cpf)) {
        setProfCpfState((s) => { const ns = [...s]; ns[i] = false; return ns; });
        toast.error(`CPF inválido no profissional ${i + 1}.`);
        return;
      }
      if (!prof.name || !prof.email || !prof.profession) {
        toast.error(`Preencha todos os campos obrigatórios do profissional ${i + 1}.`);
        return;
      }
    }

    setIsLoading(true);
    try {
      const payload = {
        ...clinic,
        franchises: franchises.map((f) => ({
          name: f.name,
          address: f.address,
          zipCode: f.zipCode.replace(/\D/g, ""),
          description: f.description || undefined,
        })),
        professionals: professionals.map((p) => ({
          name: p.name,
          cpf: p.cpf,
          email: p.email,
          franchiseIndex: p.franchiseIndex,
          profession: p.profession,
          council: p.council || undefined,
          councilNumber: p.councilNumber || undefined,
          councilState: p.councilState || undefined,
        })),
      };

      const res = await fetch("/api/admin/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.message || "Erro ao cadastrar clínica.");
        return;
      }

      setSuccess({ email: data.email, clinicSlug: data.clinicSlug });
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetAll = () => {
    setSuccess(null);
    setStep(1);
    setClinic({ clinicName: "", cnpj: "", ownerName: "", ownerCpf: "", ownerEmail: "" });
    setOwnerCpfValid(null);
    setOwnerCpfTouched(false);
    setFranchises([emptyFranchise()]);
    setProfessionals([]);
    setProfCpfState([]);
  };

  // --- Success screen ---
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-violet-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Clínica criada com sucesso!</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              As credenciais de acesso foram enviadas para{" "}
              <strong className="text-foreground">{success.email}</strong>.
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              O link de login da clínica é:{" "}
              <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                /{success.clinicSlug}/auth/login
              </span>
            </p>
          </div>
          <Button onClick={resetAll} variant="outline" className="w-full">
            Cadastrar outra clínica
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-violet-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-primary">
              <Stethoscope className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">Cliniker</span>
          </div>
          <h1 className="text-xl font-bold text-foreground mb-1">Cadastrar nova clínica</h1>
          <p className="text-sm text-muted-foreground">Preencha os dados em 3 etapas.</p>
        </div>

        <StepIndicator step={step} />

        {/* ── Step 1: Clinic & Owner ── */}
        {step === 1 && (
          <form onSubmit={goToStep2} className="bg-card border border-border rounded-2xl p-8 shadow-sm space-y-6">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">Dados da clínica</p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clinicName">Nome da clínica</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="clinicName" name="clinicName" placeholder="Clínica Estética Silva" value={clinic.clinicName} onChange={handleClinicChange} className="pl-10 h-11" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="cnpj" name="cnpj" placeholder="00.000.000/0001-00" value={clinic.cnpj} onChange={handleClinicChange} className="pl-10 h-11" required />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border" />

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">Dados do responsável (owner)</p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Nome completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="ownerName" name="ownerName" placeholder="Nome do responsável" value={clinic.ownerName} onChange={handleClinicChange} className="pl-10 h-11" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerCpf">CPF</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="ownerCpf"
                      name="ownerCpf"
                      placeholder="000.000.000-00"
                      value={clinic.ownerCpf}
                      onChange={handleClinicChange}
                      onBlur={() => { setOwnerCpfTouched(true); if (clinic.ownerCpf) setOwnerCpfValid(validateCPF(clinic.ownerCpf)); }}
                      className={`pl-10 h-11 ${ownerCpfTouched ? ownerCpfValid === false ? "border-red-500" : ownerCpfValid === true ? "border-green-500" : "" : ""}`}
                      required
                    />
                  </div>
                  {ownerCpfTouched && ownerCpfValid === false && <p className="text-xs text-red-500">CPF inválido</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerEmail">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="ownerEmail" name="ownerEmail" type="email" placeholder="dono@clinica.com" value={clinic.ownerEmail} onChange={handleClinicChange} className="pl-10 h-11" required />
                  </div>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-medium">
              Próximo <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </form>
        )}

        {/* ── Step 2: Franchises ── */}
        {step === 2 && (
          <form onSubmit={goToStep3} className="bg-card border border-border rounded-2xl p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Unidades / Franquias</p>
              <Button type="button" variant="outline" size="sm" onClick={addFranchise}>
                <Plus className="w-4 h-4 mr-1" /> Adicionar unidade
              </Button>
            </div>

            <div className="space-y-6">
              {franchises.map((f, i) => (
                <div key={i} className="border border-border rounded-xl p-5 space-y-4 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">Unidade {i + 1}</span>
                    {franchises.length > 1 && (
                      <button type="button" onClick={() => removeFranchise(i)} className="text-red-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Nome da unidade <span className="text-red-500">*</span></Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Ex: Unidade Centro" value={f.name} onChange={(e) => updateFranchise(i, "name", e.target.value)} className="pl-10 h-10" required />
                      </div>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Endereço <span className="text-red-500">*</span></Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Rua das Flores, 123" value={f.address} onChange={(e) => updateFranchise(i, "address", e.target.value)} className="pl-10 h-10" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>CEP <span className="text-red-500">*</span></Label>
                      <Input placeholder="00000-000" value={f.zipCode} onChange={(e) => updateFranchise(i, "zipCode", e.target.value)} className="h-10" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Descrição</Label>
                      <Input placeholder="Opcional" value={f.description} onChange={(e) => updateFranchise(i, "description", e.target.value)} className="h-10" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1 h-11" onClick={() => setStep(1)}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
              </Button>
              <Button type="submit" className="flex-1 h-11 bg-primary hover:bg-primary/90 text-white font-medium">
                Próximo <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </form>
        )}

        {/* ── Step 3: Professionals ── */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Profissionais</p>
                <p className="text-xs text-muted-foreground mt-0.5">Opcional — pode adicionar depois</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addProfessional}>
                <Plus className="w-4 h-4 mr-1" /> Adicionar profissional
              </Button>
            </div>

            {professionals.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-xl">
                Nenhum profissional adicionado. Você pode cadastrá-los depois.
              </div>
            )}

            <div className="space-y-6">
              {professionals.map((prof, i) => (
                <div key={i} className="border border-border rounded-xl p-5 space-y-4 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">Profissional {i + 1}</span>
                    <button type="button" onClick={() => removeProfessional(i)} className="text-red-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Nome completo <span className="text-red-500">*</span></Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Nome do profissional" value={prof.name} onChange={(e) => updateProfessional(i, "name", e.target.value)} className="pl-10 h-10" required />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>CPF <span className="text-red-500">*</span></Label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="000.000.000-00"
                          value={prof.cpf}
                          onChange={(e) => updateProfessional(i, "cpf", e.target.value)}
                          onBlur={() => setProfCpfState((s) => { const ns = [...s]; ns[i] = validateCPF(prof.cpf); return ns; })}
                          className={`pl-10 h-10 ${profCpfState[i] === false ? "border-red-500" : profCpfState[i] === true ? "border-green-500" : ""}`}
                          required
                        />
                      </div>
                      {profCpfState[i] === false && <p className="text-xs text-red-500">CPF inválido</p>}
                    </div>

                    <div className="space-y-2">
                      <Label>E-mail <span className="text-red-500">*</span></Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input type="email" placeholder="prof@clinica.com" value={prof.email} onChange={(e) => updateProfessional(i, "email", e.target.value)} className="pl-10 h-10" required />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Profissão <span className="text-red-500">*</span></Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <select
                          value={prof.profession}
                          onChange={(e) => updateProfessional(i, "profession", e.target.value)}
                          className="w-full pl-10 h-10 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          required
                        >
                          <option value="">Selecione...</option>
                          <option value="MEDICO">Médico</option>
                          <option value="BIOMEDICO">Biomédico</option>
                        </select>
                      </div>
                    </div>

                    {franchises.length > 1 && (
                      <div className="space-y-2">
                        <Label>Unidade</Label>
                        <select
                          value={prof.franchiseIndex}
                          onChange={(e) => updateProfessional(i, "franchiseIndex", Number(e.target.value))}
                          className="w-full h-10 rounded-md border border-input bg-background text-sm px-3 focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          {franchises.map((f, fi) => (
                            <option key={fi} value={fi}>{f.name || `Unidade ${fi + 1}`}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Conselho</Label>
                      <select
                        value={prof.council}
                        onChange={(e) => updateProfessional(i, "council", e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background text-sm px-3 focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">Sem conselho</option>
                        <option value="CRM">CRM</option>
                        <option value="CRBM">CRBM</option>
                      </select>
                    </div>

                    {prof.council && (
                      <>
                        <div className="space-y-2">
                          <Label>Número do conselho</Label>
                          <Input placeholder="123456" value={prof.councilNumber} onChange={(e) => updateProfessional(i, "councilNumber", e.target.value)} className="h-10" />
                        </div>
                        <div className="space-y-2">
                          <Label>Estado do conselho</Label>
                          <Input placeholder="SP" maxLength={2} value={prof.councilState} onChange={(e) => updateProfessional(i, "councilState", e.target.value.toUpperCase())} className="h-10" />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1 h-11" onClick={() => setStep(2)}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1 h-11 bg-primary hover:bg-primary/90 text-white font-medium">
                {isLoading ? "Cadastrando..." : "Finalizar cadastro"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
