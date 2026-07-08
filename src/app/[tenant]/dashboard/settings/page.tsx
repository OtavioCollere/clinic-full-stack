"use client";

import {
  Bell,
  Building2,
  CheckCircle2,
  ChevronDown,
  Clock,
  MessageCircle,
  Phone,
  QrCode,
  RefreshCw,
  Settings,
  Smartphone,
  ToggleLeft,
  ToggleRight,
  Unlink,
  Wifi,
  WifiOff,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAuthContext } from "@/context/AuthContext";
import { useFranchise, type Franchise } from "@/context/FranchiseContext";
import {
  type WhatsappConfig,
  type WhatsappStatus,
  connectWhatsapp,
  disconnectWhatsapp,
  getWhatsappConfig,
  getWhatsappStatus,
  saveWhatsappConfig,
} from "@/services/whatsapp/whatsapp.service";

/* ─── tipos ─── */
type Tab = "clinica" | "franquias" | "automacoes";

interface FranchiseWaStatus {
  status: WhatsappStatus;
  phoneNumber?: string;
  loading: boolean;
}

/* ─── componente de toggle customizado ─── */
function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-primary" : "bg-muted-foreground/30"
      }`}
    >
      <span
        className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

/* ─── Sheet de conexão WhatsApp ─── */
type QrState = "idle" | "loading" | "qr" | "connected" | "error";

function WhatsappConnectSheet({
  franchise,
  open,
  currentStatus,
  onClose,
  onConnected,
}: {
  franchise: Franchise;
  open: boolean;
  currentStatus: WhatsappStatus;
  onClose: () => void;
  onConnected: (phone: string) => void;
}) {
  const [qrState, setQrState] = useState<QrState>("idle");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [connectedPhone, setConnectedPhone] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimers = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  useEffect(() => {
    if (!open) {
      stopTimers();
      setQrState("idle");
      setQrCode(null);
      setCountdown(60);
    }
  }, [open]);

  useEffect(() => () => stopTimers(), []);

  const startPolling = () => {
    pollRef.current = setInterval(async () => {
      try {
        const res = await getWhatsappStatus(franchise.id);
        if (res.status === "CONNECTED") {
          stopTimers();
          setQrState("connected");
          setConnectedPhone(res.phoneNumber ?? "");
          onConnected(res.phoneNumber ?? "");
        }
      } catch {
        /* silencioso */
      }
    }, 3000);
  };

  const startCountdown = () => {
    setCountdown(60);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          stopTimers();
          setQrState("idle");
          setQrCode(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleConnect = async () => {
    setQrState("loading");
    try {
      const res = await connectWhatsapp(franchise.id);
      setQrCode(res.qrCode);
      setQrState("qr");
      startPolling();
      startCountdown();
    } catch {
      setQrState("error");
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWhatsapp(franchise.id);
      onConnected("");
      onClose();
      toast.success("WhatsApp desconectado.");
    } catch {
      toast.error("Erro ao desconectar.");
    }
  };

  const isAlreadyConnected = currentStatus === "CONNECTED";

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-border">
          <div>
            <p className="font-bold text-foreground text-base">WhatsApp — {franchise.name}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{franchise.address}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-5 space-y-6">
          {/* Já conectado */}
          {isAlreadyConnected && qrState === "idle" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-800">WhatsApp conectado</p>
                  <p className="text-xs text-emerald-700 mt-0.5">{connectedPhone}</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full gap-2 border-red-200 text-red-600 hover:bg-red-50"
                onClick={handleDisconnect}
              >
                <Unlink className="w-4 h-4" />
                Desconectar este número
              </Button>
            </div>
          )}

          {/* Estado idle / start */}
          {!isAlreadyConnected && qrState === "idle" && (
            <div className="space-y-5">
              <div className="rounded-xl bg-muted/50 p-5 space-y-3">
                <p className="text-sm font-semibold text-foreground">Como funciona</p>
                {[
                  { icon: QrCode, text: "Clique em conectar para gerar o QR Code" },
                  { icon: Smartphone, text: "Abra o WhatsApp no celular da unidade" },
                  { icon: Settings, text: "Vá em Dispositivos vinculados → Vincular dispositivo" },
                  { icon: CheckCircle2, text: "Escaneie o QR Code com a câmera" },
                ].map(({ icon: Icon, text }, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">{text}</p>
                  </div>
                ))}
              </div>
              <Button className="w-full gap-2 bg-primary hover:bg-primary/90 text-white" onClick={handleConnect}>
                <Wifi className="w-4 h-4" />
                Gerar QR Code
              </Button>
            </div>
          )}

          {/* Loading */}
          {qrState === "loading" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <RefreshCw className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Gerando QR Code...</p>
            </div>
          )}

          {/* QR Code */}
          {qrState === "qr" && qrCode && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-4">
                <div className="bg-white border-2 border-primary/20 rounded-2xl p-4 shadow-sm">
                  <img src={qrCode} alt="QR Code WhatsApp" className="w-48 h-48 object-contain" />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Expira em <strong className={countdown <= 15 ? "text-red-500" : "text-foreground"}>{countdown}s</strong></span>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                <p className="text-xs text-amber-700">Aguardando leitura do QR Code...</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={() => {
                  stopTimers();
                  setQrState("idle");
                  setQrCode(null);
                }}
              >
                Cancelar
              </Button>
            </div>
          )}

          {/* Conectado (após scan) */}
          {qrState === "connected" && (
            <div className="flex flex-col items-center gap-5 py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="text-center">
                <p className="font-bold text-foreground text-lg">Conectado!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {connectedPhone ? `Número: ${connectedPhone}` : "WhatsApp vinculado com sucesso."}
                </p>
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90 text-white" onClick={onClose}>
                Concluir
              </Button>
            </div>
          )}

          {/* Erro */}
          {qrState === "error" && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                <WifiOff className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-700">Falha na conexão</p>
                  <p className="text-xs text-red-600 mt-1">
                    A integração com WhatsApp ainda não está configurada nesta unidade.
                    Entre em contato com o suporte.
                  </p>
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={() => setQrState("idle")}>
                Tentar novamente
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ─── Aba Clínica ─── */
function ClinicTab() {
  const { user } = useAuthContext();

  return (
    <div className="space-y-5">
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Informações da clínica</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoRow label="Responsável" value={user?.name ?? "—"} />
          <InfoRow label="E-mail" value={user?.email ?? "—"} />
          <InfoRow label="Perfil" value={user?.clinicRole ?? "—"} />
          <InfoRow label="ID da clínica" value={user?.clinicId ? `...${user.clinicId.slice(-8)}` : "—"} mono />
        </div>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <Settings className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-sm text-amber-700">
          Edição de dados da clínica (nome, CNPJ, endereço) disponível em breve.
        </p>
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <p className={`text-sm text-foreground font-semibold ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

/* ─── Aba Franquias ─── */
function FranchisesTab() {
  const { franchises, isLoading } = useFranchise();
  const [waStatuses, setWaStatuses] = useState<Record<string, FranchiseWaStatus>>({});
  const [selectedFranchise, setSelectedFranchise] = useState<Franchise | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (franchises.length === 0) return;
    const initial: Record<string, FranchiseWaStatus> = {};
    franchises.forEach((f) => {
      initial[f.id] = { status: "DISCONNECTED", loading: true };
    });
    setWaStatuses(initial);

    Promise.allSettled(
      franchises.map((f) =>
        getWhatsappStatus(f.id)
          .then((res) =>
            setWaStatuses((prev) => ({
              ...prev,
              [f.id]: { status: res.status, phoneNumber: res.phoneNumber, loading: false },
            }))
          )
          .catch(() =>
            setWaStatuses((prev) => ({
              ...prev,
              [f.id]: { status: "DISCONNECTED", loading: false },
            }))
          )
      )
    );
  }, [franchises]);

  const openSheet = (f: Franchise) => {
    setSelectedFranchise(f);
    setSheetOpen(true);
  };

  const handleConnected = (franchiseId: string, phone: string) => {
    setWaStatuses((prev) => ({
      ...prev,
      [franchiseId]: {
        status: phone ? "CONNECTED" : "DISCONNECTED",
        phoneNumber: phone || undefined,
        loading: false,
      },
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-28 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (franchises.length === 0) {
    return (
      <div className="bg-card border border-dashed border-border rounded-xl p-10 text-center">
        <Building2 className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-foreground font-medium">Nenhuma franquia cadastrada</p>
        <p className="text-sm text-muted-foreground mt-1">Crie uma franquia para configurar a automação de WhatsApp.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {franchises.map((f) => {
          const wa = waStatuses[f.id];
          return (
            <div key={f.id} className="bg-card border border-border rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                    <p className="font-semibold text-foreground text-[15px] truncate">{f.name}</p>
                  </div>
                  <p className="text-xs text-muted-foreground truncate pl-6">{f.address}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {wa?.loading ? (
                    <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  ) : wa?.status === "CONNECTED" ? (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-xs font-semibold text-emerald-700">
                          {wa.phoneNumber ?? "Conectado"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => openSheet(f)}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                        title="Gerenciar"
                      >
                        <Settings className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      className="gap-2 bg-primary hover:bg-primary/90 text-white text-xs"
                      onClick={() => openSheet(f)}
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Conectar WhatsApp
                    </Button>
                  )}
                </div>
              </div>

              {wa?.status === "CONNECTED" && (
                <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <p className="text-xs text-emerald-700 font-medium">
                    Automações ativas para esta unidade
                  </p>
                  <span className="text-xs text-muted-foreground">— configure na aba Automações</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedFranchise && (
        <WhatsappConnectSheet
          franchise={selectedFranchise}
          open={sheetOpen}
          currentStatus={waStatuses[selectedFranchise.id]?.status ?? "DISCONNECTED"}
          onClose={() => {
            setSheetOpen(false);
            setSelectedFranchise(null);
          }}
          onConnected={(phone) => handleConnected(selectedFranchise.id, phone)}
        />
      )}
    </>
  );
}

/* ─── Aba Automações ─── */
const DEFAULT_CONFIG: WhatsappConfig = {
  notifyOnCreate: true,
  notifyReminder: true,
  reminderHoursBefore: 24,
  notifyPostConsult: false,
  notifyOnCancel: true,
};

function AutomacoesTab() {
  const { franchises } = useFranchise();
  const [selectedId, setSelectedId] = useState<string>("");
  const [config, setConfig] = useState<WhatsappConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedFranchise = franchises.find((f) => f.id === selectedId);

  useEffect(() => {
    if (franchises.length > 0 && !selectedId) setSelectedId(franchises[0].id);
  }, [franchises, selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    getWhatsappConfig(selectedId)
      .then(setConfig)
      .catch(() => setConfig(DEFAULT_CONFIG))
      .finally(() => setLoading(false));
  }, [selectedId]);

  const save = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      await saveWhatsappConfig(selectedId, config);
      toast.success("Configurações salvas.");
    } catch {
      toast.error("Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const automations = [
    {
      key: "notifyOnCreate" as keyof WhatsappConfig,
      icon: Bell,
      title: "Confirmação de agendamento",
      desc: "Envia mensagem ao paciente quando um agendamento é criado",
    },
    {
      key: "notifyReminder" as keyof WhatsappConfig,
      icon: Clock,
      title: "Lembrete antes da consulta",
      desc: `Lembrete enviado ${config.reminderHoursBefore}h antes do horário`,
    },
    {
      key: "notifyPostConsult" as keyof WhatsappConfig,
      icon: CheckCircle2,
      title: "Mensagem pós-consulta",
      desc: "Envia uma mensagem de acompanhamento após a realização",
    },
    {
      key: "notifyOnCancel" as keyof WhatsappConfig,
      icon: X,
      title: "Notificação de cancelamento",
      desc: "Avisa o paciente quando um agendamento é cancelado",
    },
  ];

  if (franchises.length === 0) {
    return (
      <div className="bg-card border border-dashed border-border rounded-xl p-10 text-center">
        <Zap className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-foreground font-medium">Nenhuma franquia disponível</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Seletor de franquia */}
      <div className="relative">
        <p className="text-xs font-semibold text-muted-foreground mb-1.5">Configurando para</p>
        <button
          type="button"
          onClick={() => setDropdownOpen((v) => !v)}
          className="flex items-center justify-between w-full sm:w-72 px-3.5 py-2.5 bg-card border border-border rounded-xl text-sm font-medium text-foreground hover:border-primary/50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            {selectedFranchise?.name ?? "Selecionar unidade"}
          </span>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
        </button>
        {dropdownOpen && (
          <div className="absolute top-full left-0 mt-1 z-50 bg-card border border-border rounded-xl shadow-lg py-1 min-w-[18rem]">
            {franchises.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  setSelectedId(f.id);
                  setDropdownOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3.5 py-2.5 text-sm text-left hover:bg-secondary transition-colors ${
                  f.id === selectedId ? "text-primary font-semibold" : "text-foreground"
                }`}
              >
                <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                {f.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Automações */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {automations.map(({ key, icon: Icon, title, desc }) => {
            const isOn = Boolean(config[key]);
            return (
              <div
                key={key}
                className={`bg-card border rounded-xl p-4 flex items-center justify-between gap-4 transition-colors ${
                  isOn ? "border-primary/30 bg-primary/[0.02]" : "border-border"
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isOn ? "bg-primary/10" : "bg-muted"}`}>
                    <Icon className={`w-4 h-4 ${isOn ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
                <Toggle
                  checked={isOn}
                  onChange={(v) => setConfig((prev) => ({ ...prev, [key]: v }))}
                />
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-end pt-2">
        <Button
          onClick={save}
          disabled={saving || loading}
          className="gap-2 bg-primary hover:bg-primary/90 text-white"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          {saving ? "Salvando..." : "Salvar configurações"}
        </Button>
      </div>
    </div>
  );
}

/* ─── Page principal ─── */
export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("clinica");

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "clinica", label: "Clínica", icon: Building2 },
    { key: "franquias", label: "Franquias & WhatsApp", icon: MessageCircle },
    { key: "automacoes", label: "Automações", icon: Zap },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie sua clínica, franquias e automações de mensagens
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-muted rounded-xl w-fit">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      {tab === "clinica" && <ClinicTab />}
      {tab === "franquias" && <FranchisesTab />}
      {tab === "automacoes" && <AutomacoesTab />}
    </div>
  );
}
