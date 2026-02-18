"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { fetchMe, logoutUser } from "@/services/auth/auth.service";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { extractTenantFromPath, addTenantToPath } from "@/lib/tenant";

interface User {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  clinicId?: string;
  clinicMembershipId?: string;
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

  const fetchUser = async () => {
    try {
      // Não busca usuário se estiver na página de login/register
      if (typeof window !== "undefined" && window.location.pathname.includes("/auth/")) {
        setLoading(false);
        return;
      }

      // Busca dados do usuário usando o cookie (enviado automaticamente com withCredentials: true)
      const response = await fetchMe();
      
      // O backend retorna: { user: {...}, clinicId: "...", clinicMembershipId: "..." }
      if (response?.user?.id) {
        setUser({
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          cpf: response.user.cpf,
          clinicId: response.clinicId,
          clinicMembershipId: response.clinicMembershipId,
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      // Se falhar, o usuário não está autenticado ou o endpoint não existe
      // Não fazemos nada aqui porque o layout já protege as rotas
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    console.log("🔄 Iniciando logout...");
    try {
      console.log("📤 Chamando logoutUser...");
      await logoutUser();
      console.log("✅ Logout no backend concluído");
      setUser(null);
      toast.success("Logout realizado com sucesso");
    } catch (error: any) {
      console.error("❌ Erro no logout:", error);
      // Mesmo se der erro, limpa o estado
      setUser(null);
      toast.error(error?.response?.data?.message || "Erro ao fazer logout");
    } finally {
      console.log("🚀 Redirecionando para login...");
      // Sempre redireciona, mesmo se der erro
      // Extrai o tenant do pathname atual
      const tenant = extractTenantFromPath(window.location.pathname);
      const loginPath = tenant ? addTenantToPath(tenant, "/auth/login") : "/auth/login";
      window.location.href = loginPath;
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser, refetchUser: fetchUser, logout: handleLogout }}>
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
