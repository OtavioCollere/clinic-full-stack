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
import { getProfessionalById } from "@/services/professional/professional.service";
import { changePasswordAuthenticated } from "@/services/auth/auth.service";
import { useAuthContext } from "@/context/AuthContext";
import { toast } from "sonner";

const getProfessionLabel = (profession: string) => {
  const map: Record<string, string> = {
    MEDICO: "Médico(a)",
    BIOMEDICO: "Biomédico(a)",
    DOCTOR: "Médico(a)",
    NURSE: "Enfermeiro(a)",
    PHYSIOTHERAPIST: "Fisioterapeuta",
    DENTIST: "Dentista",
  };
  return map[profession] ?? profession;
};

export default function ProfessionalProfilePage() {
  const { user } = useAuthContext();
  const [userInfo, setUserInfo] = useState({ name: "", email: "", cpf: "" });
  const [professionalInfo, setProfessionalInfo] = useState<{
    council: string | null;
    councilNumber: string | null;
    councilState: string | null;
    profession: string;
    franchiseId: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showUserEditModal, setShowUserEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [userFormData, setUserFormData] = useState({ name: "", email: "" });
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const professionalId = user?.professionalId;

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
    if (!professionalId) {
      setIsLoading(false);
      return;
    }
    const fetchProfessional = async () => {
      try {
        const data = await getProfessionalById(professionalId);
        setProfessionalInfo({
          council: data.council ?? null,
          councilNumber: data.councilNumber ?? null,
          councilState: data.councilState ?? null,
          profession: data.profession,
          franchiseId: data.franchiseId,
        });
      } catch {
        setProfessionalInfo(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfessional();
  }, [professionalId]);

  const handleSaveUserInfo = () => {
    setUserInfo((prev) => ({
      ...prev,
      name: userFormData.name,
      email: userFormData.email,
    }));
    setShowUserEditModal(false);
  };

  const handleChangePassword = async () => {
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }
    if (passwordFormData.newPassword.length < 8) {
      toast.error("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }
    setIsChangingPassword(true);
    try {
      await changePasswordAuthenticated(
        passwordFormData.currentPassword,
        passwordFormData.newPassword
      );
      toast.success("Senha alterada com sucesso!");
      setShowPasswordModal(false);
      setPasswordFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const msg = err?.response?.data?.message ?? err?.message ?? "Erro ao alterar senha.";
      toast.error(msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!professionalId) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
        <p className="text-muted-foreground">
          Você não possui vínculo como profissional nesta clínica.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie suas informações profissionais e de acesso
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
              Profissional
            </Badge>
          </div>
        </div>
      </ProfileSectionCard>

      <ProfileSectionCard
        title="Dados do Profissional"
        description="Seus dados profissionais (somente leitura)"
        readOnlyMode={true}
      >
        {professionalInfo && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Profissão</Label>
              <p className="text-foreground font-medium mt-1">
                {getProfessionLabel(professionalInfo.profession)}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Conselho</Label>
              <p className="text-foreground font-medium mt-1">
                {professionalInfo.council ?? "—"}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Número do Conselho
              </Label>
              <p className="text-foreground font-medium mt-1">
                {professionalInfo.councilNumber ?? "—"}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Estado do Conselho
              </Label>
              <p className="text-foreground font-medium mt-1">
                {professionalInfo.councilState ?? "—"}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Franquia ID</Label>
              <p className="text-foreground font-medium mt-1 text-sm">
                {professionalInfo.franchiseId}
              </p>
            </div>
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-2 italic">
          A edição dos dados profissionais deve ser feita pela administração da
          clínica.
        </p>
      </ProfileSectionCard>

      <ProfileSectionCard
        title="Segurança"
        description="Gerencie o acesso à sua conta"
        onEditClick={() => setShowPasswordModal(true)}
      >
        <div>
          <Label className="text-xs text-muted-foreground">Senha</Label>
          <p className="text-foreground font-medium mt-1">••••••••</p>
        </div>
      </ProfileSectionCard>

      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
            <DialogDescription>
              Insira sua senha atual e escolha uma nova senha
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Senha Atual</Label>
              <Input
                id="current-password"
                type="password"
                value={passwordFormData.currentPassword}
                onChange={(e) =>
                  setPasswordFormData((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
                placeholder="Sua senha atual"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova Senha</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordFormData.newPassword}
                onChange={(e) =>
                  setPasswordFormData((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
                placeholder="Mínimo 8 caracteres"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordFormData.confirmPassword}
                onChange={(e) =>
                  setPasswordFormData((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                placeholder="Repita a nova senha"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPasswordModal(false);
                setPasswordFormData({
                  currentPassword: "",
                  newPassword: "",
                  confirmPassword: "",
                });
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleChangePassword} disabled={isChangingPassword}>
              {isChangingPassword ? "Salvando..." : "Alterar Senha"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
    </div>
  );
}
