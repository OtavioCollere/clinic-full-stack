"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { fetchMe, logoutUser } from "@/services/auth/auth.service";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { extractTenantFromPath, addTenantToPath } from "@/lib/tenant";

import type { ClinicRoleType } from "@/lib/portal";

export interface User {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  clinicId?: string;
  clinicMembershipId?: string;
  clinicRole?: ClinicRoleType;
  permissions?: string[];
  /** Apenas para PATIENT: id do paciente (para formulário de anamnese) */
  patientId?: string;
  /** Apenas para PROFESSIONAL: id do profissional (para agendamentos) */
  professionalId?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  refetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const doFetchUser = async () => {
    try {
      setLoading(true);
      const response = await fetchMe();
      if (response?.user?.id) {
        const role = response.clinicRole?.value ?? response.clinicRole;
        setUser({
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          cpf: response.user.cpf,
          clinicId: response.clinicId,
          clinicMembershipId: response.clinicMembershipId,
          clinicRole: role as ClinicRoleType,
          permissions: response.permissions ?? [],
          isAnamneseDone: response.isAnamneseDone,
          patientId: response.patientId,
          professionalId: response.professionalId,
        });
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    if (typeof window === "undefined") return;
    if (window.location.pathname.includes("/auth/")) {
      setLoading(false);
      return;
    }
    await doFetchUser();
  };

  const refetchUser = async () => {
    await doFetchUser();
  };

  const handleLogout = async () => {
    if (typeof window === "undefined") return;
    const tenant = extractTenantFromPath(window.location.pathname);
    const loginPath = tenant ? addTenantToPath(tenant, "/auth/login") : "/auth/login";

    try {
      await logoutUser();
      toast.success("Logout realizado com sucesso");
    } catch (error: unknown) {
      const msg =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      toast.error(msg || "Erro ao fazer logout");
    } finally {
      setUser(null);
      // Redireciona no próximo tick para não ser interrompido pelo fechamento do dropdown
      setTimeout(() => {
        window.location.href = loginPath;
      }, 0);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser, refetchUser, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
