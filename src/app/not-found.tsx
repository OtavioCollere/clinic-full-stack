import Link from "next/link";
import { Stethoscope } from "lucide-react";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{
        background:
          "radial-gradient(ellipse at 80% 0%, rgba(124,58,237,0.14), transparent 50%), linear-gradient(180deg, #080B1A 0%, #050812 100%)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 mb-12">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{
            background: "rgba(203,152,73,0.18)",
            boxShadow: "0 0 16px rgba(203,152,73,0.30)",
          }}
        >
          <Stethoscope className="w-5 h-5" style={{ color: "#f5b85a" }} />
        </div>
        <span className="font-bold text-white text-xl tracking-wide">Cliniker</span>
      </div>

      {/* 404 */}
      <p
        className="text-[120px] font-bold leading-none select-none"
        style={{
          background: "linear-gradient(135deg, #8a6020 0%, #f5b85a 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        404
      </p>

      <h1 className="text-2xl font-bold text-white mt-4 mb-3 text-center">
        Página não encontrada
      </h1>
      <p className="text-sm text-center mb-10" style={{ color: "rgba(180,170,210,0.8)" }}>
        A URL que você acessou não existe ou o tenant informado não está cadastrado.
      </p>

      <Link
        href="/"
        className="px-6 py-3 rounded-lg font-semibold text-white text-sm transition-opacity hover:opacity-80"
        style={{
          background: "linear-gradient(135deg, #6a4815 0%, #cb9849 100%)",
          boxShadow: "0 0 20px rgba(124,58,237,0.35)",
        }}
      >
        Voltar ao início
      </Link>
    </div>
  );
}
