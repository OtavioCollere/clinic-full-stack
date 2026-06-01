"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Package,
  PackagePlus,
  Plus,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/context/AuthContext";
import type { InventoryItem } from "@/services/inventory/inventory.service";
import {
  INVENTORY_CATEGORY_LABELS,
  listInventoryItems,
} from "@/services/inventory/inventory.service";
import InventoryEntryModal from "./_components/inventory-entry-modal";
import InventoryItemModal from "./_components/inventory-item-modal";

function StockBadge({ item }: { item: InventoryItem }) {
  if (item.isBelowMinimum) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400">
        <AlertTriangle className="w-3 h-3" /> Estoque baixo
      </span>
    );
  }
  if (item.isNearMinimum) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-500">
        <AlertTriangle className="w-3 h-3" /> Atenção
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400">
      <CheckCircle2 className="w-3 h-3" /> OK
    </span>
  );
}

type Modal = "none" | "create" | "edit" | "entry";

export default function InventoryPage() {
  const { user } = useAuthContext();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState<Modal>("none");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [entryItemId, setEntryItemId] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "low" | "ok">("all");

  const clinicId = user?.clinicId as string;

  const fetchItems = useCallback(async () => {
    if (!clinicId) return;
    try {
      setIsLoading(true);
      const data = await listInventoryItems(clinicId);
      setItems(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Erro ao carregar insumos");
    } finally {
      setIsLoading(false);
    }
  }, [clinicId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  function openEdit(item: InventoryItem) {
    setSelectedItem(item);
    setModal("edit");
  }

  function openEntry(itemId?: string) {
    setEntryItemId(itemId);
    setModal("entry");
  }

  function closeModal() {
    setModal("none");
    setSelectedItem(null);
    setEntryItemId(undefined);
  }

  function handleSaved() {
    closeModal();
    fetchItems();
  }

  const filtered = items.filter((item) => {
    const categoryLabel =
      INVENTORY_CATEGORY_LABELS[item.category] ?? item.category;
    const matchesSearch =
      !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      categoryLabel.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      filterStatus === "all"
        ? true
        : filterStatus === "low"
          ? item.isBelowMinimum || item.isNearMinimum
          : !item.isBelowMinimum && !item.isNearMinimum;
    return matchesSearch && matchesStatus;
  });

  const lowCount = items.filter((i) => i.isBelowMinimum).length;
  const nearCount = items.filter(
    (i) => !i.isBelowMinimum && i.isNearMinimum,
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">
            Controle de Insumos
          </h1>
          <p className="text-muted-foreground text-sm">
            Gerencie o estoque de insumos e materiais da clínica
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => openEntry()}
            className="gap-2"
          >
            <PackagePlus className="w-4 h-4" />
            Registrar Entrada
          </Button>
          <Button
            onClick={() => setModal("create")}
            className="gap-2 bg-primary text-white hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            Novo Insumo
          </Button>
        </div>
      </div>

      {/* Alerts banner */}
      {(lowCount > 0 || nearCount > 0) && (
        <div className="flex flex-wrap gap-3">
          {lowCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm font-medium">
              <AlertTriangle className="w-4 h-4" />
              {lowCount} insumo{lowCount > 1 ? "s" : ""} abaixo do estoque
              mínimo
            </div>
          )}
          {nearCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 text-yellow-700 dark:text-yellow-500 text-sm font-medium">
              <AlertTriangle className="w-4 h-4" />
              {nearCount} insumo{nearCount > 1 ? "s" : ""} próximo
              {nearCount > 1 ? "s" : ""} do mínimo
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Buscar insumo ou categoria..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary w-64"
        />
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
          {(["all", "low", "ok"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${filterStatus === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              {f === "all" ? "Todos" : f === "low" ? "Atenção" : "OK"}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-12 text-muted-foreground">
          Carregando insumos...
        </div>
      )}

      {/* Table */}
      {!isLoading && filtered.length > 0 && (
        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Insumo
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">
                  Categoria
                </th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                  Estoque
                </th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">
                  Custo médio
                </th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr
                  key={item.id}
                  className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors ${idx % 2 === 1 ? "bg-muted/10" : ""}`}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">
                      {item.name}
                    </div>
                    {item.supplier && (
                      <div className="text-xs text-muted-foreground">
                        {item.supplier}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {INVENTORY_CATEGORY_LABELS[item.category] ?? item.category}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    <span
                      className={
                        item.isBelowMinimum
                          ? "text-red-600 dark:text-red-400 font-semibold"
                          : item.isNearMinimum
                            ? "text-yellow-600 dark:text-yellow-500 font-semibold"
                            : "text-foreground"
                      }
                    >
                      {Number(item.currentQuantity).toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">
                      {item.unitType}
                    </span>
                    {item.minimumQuantity > 0 && (
                      <div className="text-xs text-muted-foreground">
                        mín: {Number(item.minimumQuantity).toFixed(2)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground hidden sm:table-cell">
                    {Number(item.averageCost) > 0
                      ? `R$ ${Number(item.averageCost).toFixed(2)}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StockBadge item={item} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEntry(item.id)}
                        className="px-2 py-1 text-xs text-primary border border-primary/30 hover:bg-primary/10 rounded-md transition-colors"
                        title="Registrar entrada"
                      >
                        <PackagePlus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openEdit(item)}
                        className="px-2 py-1 text-xs text-muted-foreground border border-border hover:bg-muted rounded-md transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filtered.length === 0 && (
        <div className="bg-card rounded-xl border border-dashed border-border p-12 text-center">
          <Package className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
          <p className="text-foreground font-medium mb-2">
            {items.length === 0
              ? "Nenhum insumo cadastrado"
              : "Nenhum insumo encontrado"}
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            {items.length === 0
              ? "Cadastre o primeiro insumo para controlar o estoque"
              : "Tente ajustar os filtros"}
          </p>
          {items.length === 0 && (
            <Button
              onClick={() => setModal("create")}
              className="bg-primary text-white hover:bg-primary/90"
            >
              Cadastrar Primeiro Insumo
            </Button>
          )}
        </div>
      )}

      {/* Modals */}
      {modal === "create" && (
        <InventoryItemModal
          clinicId={clinicId}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}
      {modal === "edit" && selectedItem && (
        <InventoryItemModal
          clinicId={clinicId}
          item={selectedItem}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}
      {modal === "entry" && (
        <InventoryEntryModal
          clinicId={clinicId}
          items={items}
          preselectedItemId={entryItemId}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
