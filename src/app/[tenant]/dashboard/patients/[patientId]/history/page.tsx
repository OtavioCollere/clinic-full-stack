"use client";

import {
  ArrowLeft,
  Calendar,
  CalendarPlus,
  ClipboardList,
  Clock,
  CreditCard,
  Eye,
  Stethoscope,
  User,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { use, useEffect, useState } from "react";
import { AnamnesisTimeline } from "@/components/PatientProfile/AnamnesisTimeline";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useTenant } from "@/hooks/use-tenant";
import { createTenantLink } from "@/lib/tenant-navigation";
import {
  type Appointment,
  getAppointmentsByPatientId,
} from "@/services/appointments/appointment.service";
import {
  type AnamnesisResponse,
  getAnamnesisByPatientId,
} from "@/services/patients/anamnesis.service";
import {
  getPatientById,
  type PatientResponse,
} from "@/services/patients/patients.service";
import {
  type ServiceOrderListItem,
  getServiceOrdersByPatientId,
} from "@/services/service-order/service-order.service";

/* ─── helpers ─── */
function formatDateBr(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateLong(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/* ─── status configs ─── */
const APPT_STATUS: Record<string, { label: string; className: string }> = {
  DONE:      { label: "Realizado",  className: "bg-emerald-100 text-emerald-700" },
  CONFIRMED: { label: "Confirmado", className: "bg-blue-100 text-blue-700" },
  WAITING:   { label: "Aguardando", className: "bg-amber-100 text-amber-700" },
  CANCELED:  { label: "Cancelado",  className: "bg-red-100 text-red-700" },
};

const ORDER_STATUS: Record<string, { label: string; className: string }> = {
  PAID:            { label: "Pago",                className: "bg-emerald-100 text-emerald-700" },
  PENDING:         { label: "Pendente",            className: "bg-amber-100 text-amber-700" },
  WAITING_PAYMENT: { label: "Aguardando Pag.",     className: "bg-blue-100 text-blue-700" },
  CANCELED:        { label: "Cancelada",           className: "bg-red-100 text-red-700" },
  FAILED:          { label: "Falhou",              className: "bg-red-100 text-red-700" },
};

const PAYMENT_METHOD: Record<string, string> = {
  credit_card:   "Cartão de Crédito",
  debit_card:    "Cartão de Débito",
  pix:           "PIX",
  bank_transfer: "Transferência",
  cash:          "Dinheiro",
  other:         "Outro",
};

/* ─── types ─── */
type Tab = "procedimentos" | "anamnese" | "agendamentos";

/* ─── Appointment Detail Sheet ─── */
function AppointmentDetailSheet({
  appointment,
  serviceOrder,
  open,
  onClose,
}: {
  appointment: Appointment | null;
  serviceOrder: ServiceOrderListItem | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!appointment) return null;

  const apptStatus = APPT_STATUS[appointment.status] ?? { label: appointment.status, className: "bg-muted text-muted-foreground" };
  const total = appointment.appointmentItems.reduce((s, i) => s + Number(i.price || 0), 0);

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-border">
          <div className="flex items-start justify-between gap-3">
            <div>
              <SheetTitle className="text-lg font-bold text-foreground leading-tight">
                {appointment.name}
              </SheetTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                {formatDateLong(appointment.startAt)} · {formatTime(appointment.startAt)}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-muted transition-colors shrink-0"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </SheetHeader>

        <div className="space-y-5 py-5">

          {/* Agendamento */}
          <section className="space-y-3">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
              Agendamento
            </p>
            <div className="bg-muted/40 rounded-xl p-4 space-y-2.5">
              <Row icon={<Calendar className="w-4 h-4" />} label="Data">
                {formatDateBr(appointment.startAt)}
              </Row>
              <Row icon={<Clock className="w-4 h-4" />} label="Horário">
                {formatTime(appointment.startAt)} · {appointment.durationInMinutes} min
              </Row>
              {appointment.professionalName && (
                <Row icon={<User className="w-4 h-4" />} label="Profissional">
                  {appointment.professionalName}
                </Row>
              )}
              <Row icon={<Stethoscope className="w-4 h-4" />} label="Status">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${apptStatus.className}`}>
                  {apptStatus.label}
                </span>
              </Row>
            </div>
          </section>

          {/* Procedimentos */}
          <section className="space-y-3">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
              Procedimentos
            </p>
            <div className="bg-muted/40 rounded-xl divide-y divide-border">
              {appointment.appointmentItems.map((item, i) => (
                <div key={item.id} className="px-4 py-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      Item {i + 1}
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {formatCurrency(Number(item.price))}
                    </span>
                  </div>
                  {item.notes && (
                    <p className="text-xs text-muted-foreground">{item.notes}</p>
                  )}
                </div>
              ))}
              {appointment.appointmentItems.length > 1 && (
                <div className="px-4 py-3 flex justify-between">
                  <span className="text-sm font-semibold text-foreground">Total</span>
                  <span className="text-sm font-bold text-emerald-600">{formatCurrency(total)}</span>
                </div>
              )}
            </div>
          </section>

          {/* Comanda */}
          {serviceOrder ? (
            <section className="space-y-3">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
                Comanda
              </p>
              <div className="bg-muted/40 rounded-xl p-4 space-y-2.5">
                <Row icon={<ClipboardList className="w-4 h-4" />} label="Status">
                  {(() => {
                    const s = ORDER_STATUS[serviceOrder.status] ?? { label: serviceOrder.status, className: "bg-muted text-muted-foreground" };
                    return (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.className}`}>
                        {s.label}
                      </span>
                    );
                  })()}
                </Row>
                {serviceOrder.paymentMethod && (
                  <Row icon={<CreditCard className="w-4 h-4" />} label="Pagamento">
                    {PAYMENT_METHOD[serviceOrder.paymentMethod] ?? serviceOrder.paymentMethod}
                  </Row>
                )}
                <Row icon={<CreditCard className="w-4 h-4" />} label="Total">
                  <span className="font-bold text-emerald-600">
                    {formatCurrency(serviceOrder.total)}
                  </span>
                </Row>
                {serviceOrder.items.some((i) => i.notes) && (
                  <div className="pt-2 border-t border-border space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">Itens</p>
                    {serviceOrder.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{item.notes || "—"}</span>
                        <span className="font-medium">{formatCurrency(item.price)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          ) : (
            <section className="space-y-3">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
                Comanda
              </p>
              <p className="text-sm text-muted-foreground italic">
                Nenhuma comanda gerada para este agendamento.
              </p>
            </section>
          )}

          {/* Observações gerais */}
          {appointment.appointmentItems.some((i) => i.notes) && !serviceOrder?.items.some((i) => i.notes) && (
            <section className="space-y-3">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
                Observações
              </p>
              <div className="bg-muted/40 rounded-xl p-4 space-y-1">
                {appointment.appointmentItems.filter((i) => i.notes).map((item) => (
                  <p key={item.id} className="text-sm text-foreground">{item.notes}</p>
                ))}
              </div>
            </section>
          )}

        </div>
      </SheetContent>
    </Sheet>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-muted-foreground text-sm shrink-0">
        {icon}
        {label}
      </div>
      <div className="text-sm font-medium text-foreground text-right">{children}</div>
    </div>
  );
}

/* ─── Procedure Timeline ─── */
function ProcedureTimeline({
  appointments,
  serviceOrders,
  onViewDetails,
  onNewAppointment,
}: {
  appointments: Appointment[];
  serviceOrders: ServiceOrderListItem[];
  onViewDetails: (appt: Appointment) => void;
  onNewAppointment: () => void;
}) {
  const done = appointments
    .filter((a) => a.status === "DONE")
    .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime());

  if (done.length === 0) {
    return (
      <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center">
        <Stethoscope className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
        <p className="text-foreground font-medium mb-1">Nenhum procedimento realizado</p>
        <p className="text-sm text-muted-foreground mb-4">
          Agende a primeira consulta para este paciente
        </p>
        <Button
          onClick={onNewAppointment}
          className="gap-2 bg-primary hover:bg-primary/90 text-white"
          size="sm"
        >
          <CalendarPlus className="w-4 h-4" />
          Agendar consulta
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* linha vertical */}
      <div className="absolute left-[88px] top-4 bottom-4 w-0.5 bg-primary/20 rounded-full" />

      <div className="space-y-4">
        {done.map((appt) => {
          const total = appt.appointmentItems.reduce((s, i) => s + Number(i.price || 0), 0);
          const order = serviceOrders.find((o) => o.appointmentId === appt.id) ?? null;
          const orderStatus = order ? (ORDER_STATUS[order.status] ?? { label: order.status, className: "bg-muted text-muted-foreground" }) : null;

          return (
            <div key={appt.id} className="flex items-start gap-4">
              {/* data à esquerda da bolinha */}
              <div className="w-20 shrink-0 text-right pt-3.5">
                <p className="text-[11px] font-semibold text-primary leading-tight">
                  {new Date(appt.startAt).toLocaleDateString("pt-BR", {
                    timeZone: "America/Sao_Paulo",
                    day: "2-digit",
                    month: "short",
                  }).replace(".", "")}
                </p>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  {new Date(appt.startAt).getFullYear()}
                </p>
              </div>

              {/* bolinha */}
              <div className="relative shrink-0">
                <div className="w-4 h-4 rounded-full bg-primary border-2 border-white shadow mt-3" />
              </div>

              {/* card */}
              <div className="flex-1 bg-card border border-border rounded-xl p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-[15px] truncate">
                      {appt.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(appt.startAt)}
                      {appt.professionalName && (
                        <span className="ml-2 text-muted-foreground/70">
                          · {appt.professionalName}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* valor */}
                    <div className="text-right">
                      <p className="text-base font-bold text-emerald-600">
                        {formatCurrency(total)}
                      </p>
                      {appt.appointmentItems.length > 1 && (
                        <p className="text-[11px] text-muted-foreground">
                          {appt.appointmentItems.length} itens
                        </p>
                      )}
                    </div>

                    {/* botão olhinho */}
                    <button
                      type="button"
                      onClick={() => onViewDetails(appt)}
                      className="p-2 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                      title="Ver detalhes"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* badge comanda */}
                {orderStatus && (
                  <div className="mt-2 pt-2 border-t border-border flex items-center gap-1.5">
                    <ClipboardList className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Comanda:</span>
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${orderStatus.className}`}>
                      {orderStatus.label}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Page ─── */
export default function PatientHistoryPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenant = useTenant();

  const rawTab = searchParams.get("tab");
  const initialTab: Tab =
    rawTab === "anamnese" ? "anamnese" : rawTab === "agendamentos" ? "agendamentos" : "procedimentos";

  const [tab, setTab] = useState<Tab>(initialTab);
  const [patient, setPatient] = useState<PatientResponse | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrderListItem[]>([]);
  const [anamnesis, setAnamnesis] = useState<AnamnesisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [detailAppt, setDetailAppt] = useState<Appointment | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const t = searchParams.get("tab");
    const nextTab: Tab =
      t === "anamnese" ? "anamnese" : t === "agendamentos" ? "agendamentos" : "procedimentos";
    setTab(nextTab);
  }, [searchParams]);

  useEffect(() => {
    if (!patientId) return;
    setIsLoading(true);
    setError(null);

    Promise.all([
      getPatientById(patientId),
      getAppointmentsByPatientId(patientId, "history"),
      getAnamnesisByPatientId(patientId),
      getServiceOrdersByPatientId(patientId).catch(() => []),
    ])
      .then(([p, appts, ana, orders]) => {
        setPatient(p);
        setAppointments(Array.isArray(appts) ? appts : []);
        setAnamnesis(ana);
        setServiceOrders(Array.isArray(orders) ? orders : []);
      })
      .catch((err) => {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          (err as { message?: string })?.message ??
          "Erro ao carregar dados do paciente.";
        setError(msg);
      })
      .finally(() => setIsLoading(false));
  }, [patientId]);

  const newAppointmentHref = createTenantLink(tenant, `/dashboard/appointments`);

  const openDetail = (appt: Appointment) => {
    setDetailAppt(appt);
    setSheetOpen(true);
  };

  const detailServiceOrder = detailAppt
    ? (serviceOrders.find((o) => o.appointmentId === detailAppt.id) ?? null)
    : null;

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="gap-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {patient ? patient.name : "Histórico do paciente"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Procedimentos realizados e dados clínicos
          </p>
        </div>

        {tab === "procedimentos" && (
          <Button
            onClick={() => router.push(newAppointmentHref)}
            className="gap-2 bg-primary hover:bg-primary/90 text-white shrink-0"
          >
            <CalendarPlus className="w-4 h-4" />
            Novo Agendamento
          </Button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-muted rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setTab("procedimentos")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === "procedimentos"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          Procedimentos
          {appointments.filter((a) => a.status === "DONE").length > 0 && (
            <span className="ml-1 text-[11px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded-full">
              {appointments.filter((a) => a.status === "DONE").length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setTab("anamnese")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === "anamnese"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          Anamnese
        </button>
        <button
          type="button"
          onClick={() => setTab("agendamentos")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === "agendamentos"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Calendar className="w-4 h-4" />
          Agendamentos
          {appointments.length > 0 && (
            <span className="ml-1 text-[11px] bg-muted-foreground/20 text-muted-foreground font-bold px-1.5 py-0.5 rounded-full">
              {appointments.length}
            </span>
          )}
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      )}

      {/* Procedimentos — timeline */}
      {!isLoading && !error && tab === "procedimentos" && (
        <ProcedureTimeline
          appointments={appointments}
          serviceOrders={serviceOrders}
          onViewDetails={openDetail}
          onNewAppointment={() => router.push(newAppointmentHref)}
        />
      )}

      {/* Anamnese */}
      {!isLoading && !error && tab === "anamnese" && (
        <AnamnesisTimeline anamnesis={anamnesis} />
      )}

      {/* Agendamentos */}
      {!isLoading && !error && tab === "agendamentos" && (
        <div className="space-y-3">
          {appointments.length === 0 ? (
            <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center">
              <Calendar className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-foreground font-medium mb-1">Nenhum agendamento encontrado</p>
              <p className="text-sm text-muted-foreground mb-4">
                O histórico de agendamentos deste paciente aparecerá aqui
              </p>
              <Button
                onClick={() => router.push(newAppointmentHref)}
                className="gap-2 bg-primary hover:bg-primary/90 text-white"
                size="sm"
              >
                <CalendarPlus className="w-4 h-4" />
                Agendar consulta
              </Button>
            </div>
          ) : (
            [...appointments]
              .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime())
              .map((appt) => {
                const status = APPT_STATUS[appt.status] ?? {
                  label: appt.status,
                  className: "bg-muted text-muted-foreground",
                };
                return (
                  <div
                    key={appt.id}
                    className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-start justify-between gap-4 flex-wrap"
                  >
                    <div className="space-y-0.5">
                      <p className="font-semibold text-foreground text-[15px]">{appt.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateBr(appt.startAt)} · {formatTime(appt.startAt)}
                        {appt.professionalName && (
                          <span className="ml-2 text-muted-foreground/70">
                            · {appt.professionalName}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.className}`}>
                        {status.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => openDetail(appt)}
                        className="p-2 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                        title="Ver detalhes"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      )}

      {/* Detail Sheet */}
      <AppointmentDetailSheet
        appointment={detailAppt}
        serviceOrder={detailServiceOrder}
        open={sheetOpen}
        onClose={() => {
          setSheetOpen(false);
          setDetailAppt(null);
        }}
      />
    </div>
  );
}
