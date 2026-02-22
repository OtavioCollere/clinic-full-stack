"use client";

import { useAuthContext } from "@/context/AuthContext";

export default function PatientHomePage() {
  const user = useAuthContext();
  console.log(user);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Área do Paciente</h1>
      <p className="text-muted-foreground mt-2">
        Bem-vindo. Aqui você poderá acompanhar suas consultas e informações (em construção).
      </p>
    </div>
  );
}
