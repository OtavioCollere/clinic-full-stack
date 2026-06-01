"use client";

import { createContext, useContext, useEffect, useLayoutEffect, useState, ReactNode } from "react";
import { fetchMe, logoutUser } from "@/services/auth/auth.service";
import { usePathname, useRouter } from "next/navigation";
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
  /** Apenas para PATIENT: se já possui anamnese preenchida */
  isAnamneseDone?: boolean;
  /** Se a clínica já possui ao menos uma franquia cadastrada */
  hasFranchise?: boolean;
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
  const pathname = usePathname();
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
          hasFranchise: response.hasFranchise,
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
    if (typeof window === "undefined" || !pathname) return;
    if (pathname.includes("/auth/")) {
      setLoading(false);
      return;
    }
    await doFetchUser();
  };

  const refetchUser = async () => {
    await doFetchUser();
  };

  const handleLogout = async () => {
    const tenant =
      typeof window !== "undefined" ? extractTenantFromPath(window.location.pathname) : null;
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
      router.replace(loginPath);
    }
  };

  useLayoutEffect(() => {
    if (!pathname || pathname.includes("/auth/")) return;
    setLoading(true);
  }, [pathname]);

  useEffect(() => {
    fetchUser();
  }, [pathname]);

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
