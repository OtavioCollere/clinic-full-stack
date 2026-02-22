import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  User,
  Stethoscope,
  Building2,
  Calendar,
  Clock,
  CreditCard,
  Hash,
  FileText,
  Pencil,
  Ban,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { getAppointmentById, type Appointment as AppointmentType } from "@/services/appointments/appointment.service";
import { getFranchises } from "@/services/franchise/franchise.service";
import { getProceduresByClinicId } from "@/services/procedures/procedure.service";
import { useAuthContext } from "@/context/AuthContext";

interface AppointmentItem {
  procedureId: string;
  price: number;
  notes?: string;
}

interface Procedure {
  id: string;
  name: string;
  price: number;
}

interface ViewAppointmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  onEdit?: (appointmentId: string) => void;
  onConfirm?: (appointmentId: string) => void;
  onCancel?: (appointmentId: string) => void;
}


export default function ViewAppointmentDetailsModal({
  isOpen,
  onClose,
  appointmentId,
  onEdit,
  onConfirm,
  onCancel,
}: ViewAppointmentDetailsModalProps) {
  const { user } = useAuthContext();
  const [isLoadingAppointment, setIsLoadingAppointment] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointment, setAppointment] = useState<AppointmentType | null>(null);
  const [franchise, setFranchise] = useState<{ id: string; name: string; address?: string; zipCode?: string } | null>(null);
  const [procedures, setProcedures] = useState<Record<string, Procedure>>({});

  useEffect(() => {
    if (isOpen && appointmentId) {
      loadData();
    }
  }, [isOpen, appointmentId]);

  const loadData = async () => {
    setIsLoadingAppointment(true);
    setError(null);

    try {
      // Load appointment
      const apt = await getAppointmentById(appointmentId);
      if (!apt) {
        setError("Agendamento não encontrado");
        return;
      }

      setAppointment(apt);

      // Load franchise and procedures in parallel
      if (user?.clinicId) {
        try {
          const [franchisesResponse, proceduresResponse] = await Promise.all([
            getFranchises(user.clinicId as string),
            getProceduresByClinicId(user.clinicId as string),
          ]);

          const foundFranchise = franchisesResponse.find((f: { id: string }) => f.id === apt.franchiseId);
          if (foundFranchise) {
            setFranchise(foundFranchise);
          }

          // Map procedures
          const procs: Record<string, Procedure> = {};
          proceduresResponse.forEach((proc: { id: string; name: string; price: number | string }) => {
            procs[proc.id] = {
              id: proc.id,
              name: proc.name,
              price: typeof proc.price === "string" ? parseFloat(proc.price) : proc.price,
            };
          });
          setProcedures(procs);
        } catch (err) {
          console.error("Erro ao carregar dados extras:", err);
        }
      }
    } catch (err: any) {
      console.error("Error loading appointment:", err);
      setError("Erro ao carregar agendamento");
    } finally {
      setIsLoadingAppointment(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}min`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}min`;
  };

  const getDayOfWeek = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", { weekday: "long" });
  };

  const isReturnConsultation =
    appointment?.appointmentItems.every((item) => Number(item.price || 0) === 0);

  const totalValue = appointment?.appointmentItems.reduce(
    (sum, item) => sum + item.price,
    0
  ) || 0;

  const handleEdit = () => {
    if (onEdit) {
      onEdit(appointmentId);
      onClose();
    }
  };

  const handleConfirm = async () => {
    if (onConfirm) {
      try {
        onConfirm(appointmentId);
        toast.success("Agendamento confirmado com sucesso!");
        onClose();
      } catch (err) {
        toast.error("Erro ao confirmar agendamento");
      }
    }
  };

  const handleCancel = async () => {
    if (onCancel) {
      try {
        onCancel(appointmentId);
        toast.success("Agendamento cancelado com sucesso!");
        onClose();
      } catch (err) {
        toast.error("Erro ao cancelar agendamento");
      }
    }
  };

  if (!isOpen) return null;

  const status = appointment?.status || "";
  const statusBarBg = getStatusAccentBg(status);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto pb-32 p-0">
        <div className={`h-1.5 rounded-t-lg ${statusBarBg}`} aria-hidden />
        <div className="px-6 pt-4">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={`${getStatusColor(status)} text-sm font-semibold px-3 py-1 ring-1 ring-current/20`}>
                    {getStatusLabel(status)}
                  </Badge>
                </div>
                <DialogTitle className="text-2xl">{appointment?.name || "Carregando..."}</DialogTitle>
                {appointment?.id && (
                  <DialogDescription className="text-xs mt-1">
                    ID: #{appointment.id.substring(0, 8)}
                  </DialogDescription>
                )}
              </div>
            </div>
          </DialogHeader>
        </div>

        {error ? (
          <div className="p-6 text-center text-red-600">{error}</div>
        ) : isLoadingAppointment ? (
          <div className="space-y-4 p-6">
            <div className="h-20 bg-secondary rounded-lg animate-pulse"></div>
            <div className="h-40 bg-secondary rounded-lg animate-pulse"></div>
          </div>
        ) : !appointment ? (
          <div className="p-6 text-center text-muted-foreground">
            Agendamento não encontrado
          </div>
        ) : (
          <div className="space-y-6 px-6 py-4">
            {/* Data e Hora Summary */}
            <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Calendar className="w-4 h-4" />
                {getDayOfWeek(appointment.startAt)}, {formatDate(appointment.startAt)}
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <Clock className="w-4 h-4" />
                {formatTime(appointment.startAt)} - {formatTime(appointment.endAt)} •{" "}
                {formatDuration(appointment.durationInMinutes)}
              </div>
            </div>

            <Separator />

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Patient Card */}
              <div className="bg-white border border-border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Paciente
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Nome</p>
                    <p className="text-foreground font-medium">{appointment.patientName || "Paciente Desconhecido"}</p>
                  </div>
                </div>
              </div>

              {/* Professional Card */}
              <div className="bg-white border border-border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" />
                  Profissional
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Nome</p>
                    <p className="text-foreground font-medium">{appointment.professionalName || "Profissional Desconhecido"}</p>
                  </div>
                </div>
              </div>

              {/* Franchise Card */}
              <div className="bg-white border border-border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Unidade
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Nome</p>
                    <p className="text-foreground font-medium">
                      {franchise?.name || `Unidade ${appointment.franchiseId}`}
                    </p>
                  </div>
                  {franchise?.address && (
                    <div>
                      <p className="text-muted-foreground text-xs">Endereço</p>
                      <p className="text-foreground">{franchise.address}</p>
                    </div>
                  )}
                  {franchise?.zipCode && (
                    <div>
                      <p className="text-muted-foreground text-xs">CEP</p>
                      <p className="text-foreground">{franchise.zipCode}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Schedule Card */}
              <div className="bg-white border border-border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Horário
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Dia da Semana</p>
                    <p className="text-foreground font-medium capitalize">
                      {getDayOfWeek(appointment.startAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Data</p>
                    <p className="text-foreground">{formatDate(appointment.startAt)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Início - Fim</p>
                    <p className="text-foreground">
                      {formatTime(appointment.startAt)} - {formatTime(appointment.endAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Duração</p>
                    <p className="text-foreground">{formatDuration(appointment.durationInMinutes)}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Procedures Section */}
            <div>
              <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4" />
                Procedimentos
              </h3>

              <div className="space-y-3">
                {appointment.appointmentItems.map((item, index) => (
                  <div
                    key={index}
                    className="border border-border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">
                          {procedures[item.procedureId]?.name || `Procedimento (${item.procedureId})`}
                        </p>
                        {procedures[item.procedureId]?.price &&
                          Number(procedures[item.procedureId].price || 0) !== Number(item.price || 0) && (
                            <p className="text-xs text-muted-foreground">
                              Preço padrão: R$ {Number(procedures[item.procedureId].price || 0).toFixed(2)}
                            </p>
                          )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          R$ {Number(item.price || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    {item.notes && (
                      <p className="text-sm text-muted-foreground border-t border-border pt-2">
                        {item.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Procedures Summary */}
              <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-foreground">Total de procedimentos:</span>
                  <span className="font-semibold text-foreground">
                    {appointment.appointmentItems.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground">Valor total:</span>
                  <span className="font-semibold text-lg text-foreground">
                    R$ {Number(totalValue || 0).toFixed(2)}
                  </span>
                </div>
                {isReturnConsultation && (
                  <div className="pt-2">
                    <Badge className="bg-blue-100 text-blue-800">
                      Consulta de retorno
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Additional Info */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Criado em:</span>
                <span className="text-foreground">
                  {formatDate(appointment.createdAt)} às {formatTime(appointment.createdAt)}
                </span>
              </div>
              {appointment.updatedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Atualizado em:</span>
                  <span className="text-foreground">
                    {formatDate(appointment.updatedAt)} às {formatTime(appointment.updatedAt)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sticky Footer Actions */}
        {!error && appointment && (
          <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-white p-4 flex gap-3 max-w-3xl mx-auto rounded-b-lg">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-border"
            >
              Voltar
            </Button>

            {appointment.status === "WAITING" && onConfirm && (
              <Button
                onClick={handleConfirm}
                disabled={isLoadingAppointment}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="w-4 h-4 mr-2" />
                Confirmar
              </Button>
            )}

            {appointment.status !== "CANCELED" &&
              appointment.status !== "DONE" &&
              onCancel && (
                <Button
                  onClick={handleCancel}
                  disabled={isLoadingAppointment}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              )}

            {onEdit && (
              <Button
                onClick={handleEdit}
                disabled={isLoadingAppointment}
                className="flex-1 bg-primary hover:bg-primary/90 text-white"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Editar
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
