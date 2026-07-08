"use client";

import { useState, useEffect, useCallback } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Receipt } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { getFranchises } from "@/services/franchise/franchise.service";
import {
  getServiceOrdersByFranchiseId,
  markServiceOrderAsPaid,
  type ServiceOrderResponse,
} from "@/services/service-order/service-order.service";
import { toast } from "sonner";

interface Franchise {
  id: string;
  name: string;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  WAITING_PAYMENT: "Aguardando Pag.",
  PAID: "Pago",
  CANCELED: "Cancelado",
  FAILED: "Falhou",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  WAITING_PAYMENT: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  PAID: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  CANCELED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  FAILED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Dinheiro",
  credit_card: "Cartão de crédito",
  debit_card: "Cartão de débito",
  pix: "PIX",
  bank_transfer: "Transferência",
  other: "Outro",
  CASH: "Dinheiro",
  CREDIT_CARD: "Cartão de crédito",
  DEBIT_CARD: "Cartão de débito",
  PIX: "PIX",
  BANK_TRANSFER: "Transferência",
  OTHER: "Outro",
};

export default function ComandasPage() {
  const { user } = useAuthContext();
  const [serviceOrders, setServiceOrders] = useState<ServiceOrderResponse[]>([]);
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.clinicId) return;
    getFranchises(user.clinicId)
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setFranchises(list);
        if (list.length > 0) setSelectedFranchiseId(list[0].id);
      })
      .catch(() => {});
  }, [user?.clinicId]);

  const fetchOrders = useCallback(async () => {
    if (!selectedFranchiseId) return;
    try {
      setIsLoading(true);
      const data = await getServiceOrdersByFranchiseId(
        selectedFranchiseId,
        statusFilter !== "all" ? statusFilter : undefined
      );
      setServiceOrders(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Erro ao carregar comandas");
      setServiceOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFranchiseId, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleMarkAsPaid = async (orderId: string) => {
    try {
      setPayingId(orderId);
      await markServiceOrderAsPaid(orderId);
      toast.success("Comanda marcada como paga");
      fetchOrders();
    } catch {
      toast.error("Erro ao registrar pagamento");
    } finally {
      setPayingId(null);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Comandas</h1>
          <p className="text-muted-foreground">Gerencie os pedidos de serviço e pagamentos da clínica</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {franchises.length > 1 && (
          <Select value={selectedFranchiseId} onValueChange={setSelectedFranchiseId}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Selecionar unidade" />
            </SelectTrigger>
            <SelectContent>
              {franchises.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="PENDING">Pendente</SelectItem>
            <SelectItem value="WAITING_PAYMENT">Aguardando Pagamento</SelectItem>
            <SelectItem value="PAID">Pago</SelectItem>
            <SelectItem value="CANCELED">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando comandas...</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && serviceOrders.length === 0 && (
        <div className="bg-card rounded-xl border border-dashed border-border p-12 text-center">
          <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" />
          <p className="text-foreground font-medium mb-2">Nenhuma comanda encontrada</p>
          <p className="text-sm text-muted-foreground">
            As comandas são criadas automaticamente ao confirmar uma consulta.
          </p>
        </div>
      )}

      {/* Table */}
      {!isLoading && serviceOrders.length > 0 && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {/* Header row — desktop only */}
          <div className="hidden xl:grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 border-b bg-secondary text-xs font-semibold uppercase text-muted-foreground">
            <span>Comanda</span>
            <span>Status</span>
            <span>Forma de pag.</span>
            <span>Total</span>
            <span className="w-28">Ação</span>
          </div>

          <div className="divide-y divide-border">
            {serviceOrders.map((order) => (
              <div
                key={order.id}
                className="grid gap-3 p-4 xl:grid-cols-[1fr_1fr_1fr_1fr_auto] xl:items-center"
              >
                {/* ID + Date */}
                <div>
                  <span className="mb-1 block text-[11px] font-semibold uppercase text-muted-foreground xl:hidden">
                    Comanda
                  </span>
                  <p className="font-mono text-sm text-foreground">{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatDate(order.createdAt)}</p>
                </div>

                {/* Status */}
                <div>
                  <span className="mb-1 block text-[11px] font-semibold uppercase text-muted-foreground xl:hidden">
                    Status
                  </span>
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] ?? "bg-secondary text-foreground"}`}
                  >
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                </div>

                {/* Payment method */}
                <div>
                  <span className="mb-1 block text-[11px] font-semibold uppercase text-muted-foreground xl:hidden">
                    Pagamento
                  </span>
                  <span className="text-sm text-foreground">
                    {PAYMENT_LABELS[order.paymentMethod ?? ""] ?? order.paymentMethod ?? "—"}
                  </span>
                </div>

                {/* Total */}
                <div>
                  <span className="mb-1 block text-[11px] font-semibold uppercase text-muted-foreground xl:hidden">
                    Total
                  </span>
                  <span className="font-semibold text-foreground">{formatCurrency(order.total)}</span>
                </div>

                {/* Action */}
                <div className="xl:w-28">
                  {order.status !== "PAID" && order.status !== "CANCELED" ? (
                    <button
                      type="button"
                      disabled={payingId === order.id}
                      onClick={() => handleMarkAsPaid(order.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      {payingId === order.id ? "Salvando..." : "Marcar pago"}
                    </button>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
