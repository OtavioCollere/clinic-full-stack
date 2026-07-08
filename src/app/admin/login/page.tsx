"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAdmin, fetchAdminMe } from "@/services/auth/auth.service";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await loginAdmin({ email, password });
      const me = await fetchAdminMe();
      if (me.role !== "ADMIN") {
        toast.error("Acesso restrito a administradores.");
        return;
      }
      router.replace("/admin/clinics");
    } catch {
      toast.error("Credenciais inválidas.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#8a6020] flex items-center justify-center mx-auto">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Painel Admin</h1>
          <p className="text-sm text-slate-400">Cliniker · Superadministrador</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4"
        >
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm">E-mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@exemplo.com"
                required
                className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-[#cb9849]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-[#cb9849]"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#8a6020] hover:bg-[#6a4815] text-white"
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
