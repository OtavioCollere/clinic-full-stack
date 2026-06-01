"use client";

import React, { useState, useEffect } from "react";
import { ProfileSectionCard } from "../../_components/profile-section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getMyPatient, editPatient } from "@/services/patients/patients.service";
import {
  getAnamnesisByPatientId,
  type AnamnesisResponse,
} from "@/services/patients/anamnesis.service";
import { useAuthContext } from "@/context/AuthContext";
import { toast } from "sonner";

function formatDateBr(d: Date) {
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function AnamnesisDisplay({
  data,
  formatDateBr,
}: {
  data: AnamnesisResponse;
  formatDateBr: (d: Date) => string;
}) {
  const ah = (data.aestheticHistory ?? {}) as Record<string, unknown>;
  const hc = (data.healthConditions ?? {}) as Record<string, unknown>;
  const mh = (data.medicalHistory ?? {}) as Record<string, unknown>;
  const pa = (data.physicalAssessment ?? {}) as Record<string, unknown>;

  const boolLabel = (v: unknown): string => (v ? "Sim" : "Não");
  const val = (v: unknown): string =>
    v != null && v !== "" ? String(v) : "—";

  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-foreground border-b pb-1">
        {title}
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div>
    </div>
  );

  const Field = ({
    label,
    value,
    fullWidth,
  }: {
    label: string;
    value: string;
    fullWidth?: boolean;
  }) => (
    <div className={fullWidth ? "md:col-span-2" : ""}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <p className="text-foreground font-medium mt-1">{value}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 1. Histórico Estético */}
      <Section title="1. Histórico Estético">
        <Field
          label="Tratamento estético anterior"
          value={boolLabel(ah.hadPreviousAestheticTreatment)}
        />
        <Field label="Toxina botulínica" value={boolLabel(ah.botulinumToxin)} />
        {ah.botulinumRegion ? (
          <Field label="Região (toxina)" value={val(ah.botulinumRegion)} fullWidth />
        ) : null}
        <Field label="Preenchimento" value={boolLabel(ah.filler)} />
        {(ah.fillerRegion || ah.fillerProduct) ? (
          <Field
            label="Preenchimento (região/produto)"
            value={`${val(ah.fillerRegion)} ${val(ah.fillerProduct)}`.trim()}
            fullWidth
          />
        ) : null}
        <Field label="Fios de sustentação" value={boolLabel(ah.suspensionThreads)} />
        {(ah.suspensionThreadsRegion || ah.suspensionThreadsProduct) ? (
          <Field
            label="Fios (região/produto)"
            value={`${val(ah.suspensionThreadsRegion)} ${val(ah.suspensionThreadsProduct)}`.trim()}
            fullWidth
          />
        ) : null}
        <Field label="Lifting cirúrgico" value={boolLabel(ah.surgicalLift)} />
        {(ah.surgicalLiftRegion || ah.surgicalLiftProduct) ? (
          <Field
            label="Lifting (região/produto)"
            value={`${val(ah.surgicalLiftRegion)} ${val(ah.surgicalLiftProduct)}`.trim()}
            fullWidth
          />
        ) : null}
        <Field label="Peeling químico" value={boolLabel(ah.chemicalPeeling)} />
        {(ah.chemicalPeelingRegion || ah.chemicalPeelingProduct) ? (
          <Field
            label="Peeling (região/produto)"
            value={`${val(ah.chemicalPeelingRegion)} ${val(ah.chemicalPeelingProduct)}`.trim()}
            fullWidth
          />
        ) : null}
        <Field label="Laser" value={boolLabel(ah.laser)} />
        {(ah.laserRegion || ah.laserProduct) ? (
          <Field
            label="Laser (região/produto)"
            value={`${val(ah.laserRegion)} ${val(ah.laserProduct)}`.trim()}
            fullWidth
          />
        ) : null}
        <Field
          label="Trabalha exposto a calor/frio"
          value={boolLabel(ah.exposedToHeatOrColdWork)}
        />
      </Section>

      {/* 2. Condições de Saúde */}
      <Section title="2. Condições de Saúde">
        <Field label="Fumante" value={boolLabel(hc.smoker)} />
        <Field label="Distúrbio circulatório" value={boolLabel(hc.circulatoryDisorder)} />
        <Field label="Epilepsia" value={boolLabel(hc.epilepsy)} />
        <Field label="Ciclo menstrual regular" value={boolLabel(hc.regularMenstrualCycle)} />
        <Field label="Função intestinal regular" value={boolLabel(hc.regularIntestinalFunction)} />
        <Field label="Alterações cardíacas" value={boolLabel(hc.cardiacAlterations)} />
        <Field label="Distúrbio hormonal" value={boolLabel(hc.hormonalDisorder)} />
        <Field label="Hipo/hipertensão" value={boolLabel(hc.hypoOrHypertension)} />
        <Field label="Distúrbio renal" value={boolLabel(hc.renalDisorder)} />
        <Field label="Varizes ou lesões" value={boolLabel(hc.varicoseVeinsOrLesions)} />
        <Field label="Grávida" value={boolLabel(hc.pregnant)} />
        {hc.gestationalWeeks != null ? (
          <Field label="Semanas de gestação" value={val(hc.gestationalWeeks)} />
        ) : null}
        <Field label="Em tratamento médico" value={boolLabel(hc.underMedicalTreatment)} />
        {hc.medicalTreatmentDetails ? (
          <Field
            label="Detalhes do tratamento"
            value={val(hc.medicalTreatmentDetails)}
            fullWidth
          />
        ) : null}
      </Section>

      {/* 3. Histórico Médico */}
      <Section title="3. Histórico Médico">
        <Field label="Usa medicação" value={boolLabel(mh.usesMedication)} />
        {mh.medicationDetails ? (
          <Field label="Detalhes da medicação" value={val(mh.medicationDetails)} fullWidth />
        ) : null}
        <Field label="Alergia" value={boolLabel(mh.allergy)} />
        {mh.allergyDetails ? (
          <Field label="Detalhes da alergia" value={val(mh.allergyDetails)} fullWidth />
        ) : null}
        <Field label="Intolerância à lactose" value={boolLabel(mh.lactoseIntolerance)} />
        <Field
          label="Diabetes"
          value={
            mh.diabetes === "no"
              ? "Não"
              : mh.diabetes === "yes"
                ? "Sim"
                : mh.diabetes === "controlled"
                  ? "Controlada"
                  : "—"
          }
        />
        <Field label="Roacutan" value={boolLabel(mh.roacutan)} />
        <Field label="Cirurgia recente" value={boolLabel(mh.recentSurgery)} />
        {mh.recentSurgeryDetails ? (
          <Field label="Detalhes da cirurgia" value={val(mh.recentSurgeryDetails)} fullWidth />
        ) : null}
        <Field label="Tumor/lesão pré-cancerígena" value={boolLabel(mh.tumorOrPrecancerousLesion)} />
        {mh.tumorOrLesionDetails ? (
          <Field label="Detalhes tumor/lesão" value={val(mh.tumorOrLesionDetails)} fullWidth />
        ) : null}
        <Field label="Problemas de pele" value={boolLabel(mh.skinProblems)} />
        {mh.skinProblemsDetails ? (
          <Field label="Detalhes pele" value={val(mh.skinProblemsDetails)} fullWidth />
        ) : null}
        <Field label="Problemas ortopédicos" value={boolLabel(mh.orthopedicProblems)} />
        {mh.orthopedicProblemsDetails ? (
          <Field label="Detalhes ortopédicos" value={val(mh.orthopedicProblemsDetails)} fullWidth />
        ) : null}
        <Field label="Prótese corporal/facial" value={boolLabel(mh.hasBodyOrFacialProsthesis)} />
        {mh.prosthesisDetails ? (
          <Field label="Detalhes prótese" value={val(mh.prosthesisDetails)} fullWidth />
        ) : null}
        <Field label="Usa ácidos" value={boolLabel(mh.usingAcids)} />
        {mh.acidsDetails ? (
          <Field label="Detalhes ácidos" value={val(mh.acidsDetails)} fullWidth />
        ) : null}
        {mh.otherRelevantIssues ? (
          <Field label="Outras informações" value={val(mh.otherRelevantIssues)} fullWidth />
        ) : null}
      </Section>

      {/* 4. Avaliação Física */}
      <Section title="4. Avaliação Física">
        <Field label="Pressão arterial" value={val(pa.bloodPressure)} />
        <Field label="Altura (cm)" value={pa.height != null ? val(pa.height) : "—"} />
        <Field label="Peso inicial (kg)" value={pa.initialWeight != null ? val(pa.initialWeight) : "—"} />
        <Field label="Peso final (kg)" value={pa.finalWeight != null ? val(pa.finalWeight) : "—"} />
      </Section>

      <div className="pt-2 border-t">
        <Label className="text-xs text-muted-foreground">Cadastro em</Label>
        <p className="text-foreground font-medium mt-1">
          {data.createdAt ? formatDateBr(new Date(data.createdAt)) : "—"}
        </p>
      </div>
    </div>
  );
}

export default function PatientProfilePage() {
  const { user, loading: authLoading } = useAuthContext();
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    cpf: "",
  });
  const [patientInfo, setPatientInfo] = useState<{
    name: string;
    birthDay: Date;
    address: string;
    zipCode: string;
    clinicId: string;
    createdAt: Date;
  } | null>(null);
  const [anamnesisInfo, setAnamnesisInfo] = useState<AnamnesisResponse | null>(null);
  const [isLoadingPatient, setIsLoadingPatient] = useState(true);
  const [isLoadingAnamnesis, setIsLoadingAnamnesis] = useState(true);
  const [showUserEditModal, setShowUserEditModal] = useState(false);
  const [showPatientEditModal, setShowPatientEditModal] = useState(false);
  const [userFormData, setUserFormData] = useState({ name: "", email: "" });
  const [patientFormData, setPatientFormData] = useState({
    name: "",
    birthDay: "",
    address: "",
    zipCode: "",
  });
  const [isSavingPatient, setIsSavingPatient] = useState(false);

  const patientId = user?.patientId;

  useEffect(() => {
    if (user) {
      setUserInfo({
        name: user.name ?? "",
        email: user.email ?? "",
        cpf: user.cpf ?? "",
      });
      setUserFormData({
        name: user.name ?? "",
        email: user.email ?? "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (!patientId) {
      setIsLoadingPatient(false);
      setIsLoadingAnamnesis(false);
      return;
    }
    const fetchPatient = async () => {
      setIsLoadingPatient(true);
      try {
        const data = await getMyPatient();
        setPatientInfo({
          name: data.name,
          birthDay: new Date(data.birthDay),
          address: data.address ?? "",
          zipCode: data.zipCode ?? "",
          clinicId: data.clinicId,
          createdAt: new Date(data.createdAt),
        });
        setPatientFormData({
          name: data.name,
          birthDay: data.birthDay
            ? new Date(data.birthDay).toISOString().slice(0, 10)
            : "",
          address: data.address ?? "",
          zipCode: data.zipCode ?? "",
        });
      } catch {
        setPatientInfo(null);
        toast.error("Não foi possível carregar os dados do paciente.");
      } finally {
        setIsLoadingPatient(false);
      }
    };
    fetchPatient();
  }, [patientId]);

  useEffect(() => {
    if (!patientId) return;
    const fetchAnamnesis = async () => {
      setIsLoadingAnamnesis(true);
      try {
        const data = await getAnamnesisByPatientId(patientId);
        setAnamnesisInfo(data);
      } catch {
        setAnamnesisInfo(null);
      } finally {
        setIsLoadingAnamnesis(false);
      }
    };
    fetchAnamnesis();
  }, [patientId]);

  const handleSaveUserInfo = () => {
    setUserInfo((prev) => ({
      ...prev,
      name: userFormData.name,
      email: userFormData.email,
    }));
    setShowUserEditModal(false);
    toast.info("Edição de dados do usuário em breve.");
  };

  const handleSavePatientInfo = async () => {
    if (!patientId) return;
    setIsSavingPatient(true);
    try {
      await editPatient(patientId, {
        name: patientFormData.name,
        birthDay: patientFormData.birthDay || undefined,
        address: patientFormData.address,
        zipCode: patientFormData.zipCode,
      });
      setPatientInfo((prev) =>
        prev
          ? {
              ...prev,
              name: patientFormData.name,
              birthDay: patientFormData.birthDay
                ? new Date(patientFormData.birthDay)
                : prev.birthDay,
              address: patientFormData.address,
              zipCode: patientFormData.zipCode,
            }
          : null
      );
      setShowPatientEditModal(false);
      toast.success("Dados do paciente atualizados.");
    } catch {
      toast.error("Erro ao atualizar dados do paciente.");
    } finally {
      setIsSavingPatient(false);
    }
  };

  if (authLoading || (patientId && isLoadingPatient)) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!patientId) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
        <p className="text-muted-foreground">
          Você não possui vínculo como paciente nesta clínica.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie suas informações pessoais e dados de paciente
        </p>
      </div>

      <ProfileSectionCard
        title="Dados do Usuário"
        description="Seus dados de acesso à plataforma"
        onEditClick={() => setShowUserEditModal(true)}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">Nome</Label>
            <p className="text-foreground font-medium mt-1">{userInfo.name}</p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">CPF</Label>
            <p className="text-foreground font-medium mt-1">{userInfo.cpf}</p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Email</Label>
            <p className="text-foreground font-medium mt-1">{userInfo.email}</p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Função</Label>
            <Badge variant="secondary" className="mt-1">
              Paciente
            </Badge>
          </div>
        </div>
      </ProfileSectionCard>

      <ProfileSectionCard
        title="Dados do Paciente"
        description="Seus dados como paciente no sistema"
        onEditClick={() => setShowPatientEditModal(true)}
      >
        {patientInfo ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">
                Nome do Paciente
              </Label>
              <p className="text-foreground font-medium mt-1">{patientInfo.name}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Data de Nascimento
              </Label>
              <p className="text-foreground font-medium mt-1">
                {formatDateBr(patientInfo.birthDay)}
              </p>
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs text-muted-foreground">Endereço</Label>
              <p className="text-foreground font-medium mt-1">
                {patientInfo.address || "—"}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">CEP</Label>
              <p className="text-foreground font-medium mt-1">
                {patientInfo.zipCode || "—"}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Cadastro em</Label>
              <p className="text-foreground font-medium mt-1">
                {formatDateBr(patientInfo.createdAt)}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Não foi possível carregar os dados. Tente novamente mais tarde.
          </p>
        )}
      </ProfileSectionCard>

      <ProfileSectionCard
        title="Anamnese"
        description="Histórico médico e informações de saúde"
        readOnlyMode={true}
      >
        {isLoadingAnamnesis ? (
          <p className="text-sm text-muted-foreground">Carregando anamnese...</p>
        ) : anamnesisInfo ? (
          <AnamnesisDisplay data={anamnesisInfo} formatDateBr={formatDateBr} />
        ) : (
          <div className="bg-slate-50 p-4 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">
              Ainda não há anamnese preenchida. A anamnese é preenchida em fluxo
              separado com seu profissional.
            </p>
          </div>
        )}
      </ProfileSectionCard>

      <Dialog open={showUserEditModal} onOpenChange={setShowUserEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Dados do Usuário</DialogTitle>
            <DialogDescription>
              Atualize seus dados de acesso (em breve).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="user-name">Nome</Label>
              <Input
                id="user-name"
                value={userFormData.name}
                onChange={(e) =>
                  setUserFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Seu nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-email">Email</Label>
              <Input
                id="user-email"
                type="email"
                value={userFormData.email}
                onChange={(e) =>
                  setUserFormData((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                placeholder="seu@email.com"
              />
            </div>
            <div className="bg-slate-50 p-3 rounded-lg text-sm text-muted-foreground">
              CPF não pode ser editado.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserEditModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveUserInfo}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPatientEditModal} onOpenChange={setShowPatientEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Dados do Paciente</DialogTitle>
            <DialogDescription>
              Atualize seus dados como paciente
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="patient-name">Nome</Label>
              <Input
                id="patient-name"
                value={patientFormData.name}
                onChange={(e) =>
                  setPatientFormData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="Seu nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="patient-birthDay">Data de Nascimento</Label>
              <Input
                id="patient-birthDay"
                type="date"
                value={patientFormData.birthDay}
                onChange={(e) =>
                  setPatientFormData((prev) => ({
                    ...prev,
                    birthDay: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="patient-address">Endereço</Label>
              <Input
                id="patient-address"
                value={patientFormData.address}
                onChange={(e) =>
                  setPatientFormData((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
                placeholder="Rua, número, complemento"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="patient-zipCode">CEP</Label>
              <Input
                id="patient-zipCode"
                value={patientFormData.zipCode}
                onChange={(e) =>
                  setPatientFormData((prev) => ({
                    ...prev,
                    zipCode: e.target.value,
                  }))
                }
                placeholder="00000-000"
              />
            </div>
            <div className="bg-slate-50 p-3 rounded-lg text-sm text-muted-foreground">
              CPF não pode ser editado.
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPatientEditModal(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSavePatientInfo}
              disabled={isSavingPatient}
            >
              {isSavingPatient ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
