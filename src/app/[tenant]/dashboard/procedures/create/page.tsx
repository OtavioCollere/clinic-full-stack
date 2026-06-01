"use client";

import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthContext } from "@/context/AuthContext";
import { useTenant } from "@/hooks/use-tenant";
import { createTenantLink } from "@/lib/tenant-navigation";
import { getFranchises } from "@/services/franchise/franchise.service";
import {
  type InventoryItem,
  listInventoryItems,
  upsertSupplyTemplate,
} from "@/services/inventory/inventory.service";
import { createProcedure } from "@/services/procedures/procedure.service";

type SupplyRow = {
  inventoryItemId: string;
  defaultQuantity: string;
  unitCost: string;
};

type Franchise = {
  id: string;
  name: string;
};

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  const apiError = error as ApiError;
  return apiError?.response?.data?.message || apiError?.message || fallback;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );

const resolveUnitCost = (rowUnitCost: string, defaultCost: number) => {
  if (rowUnitCost.trim() === "") return defaultCost;
  const parsedCost = parseFloat(rowUnitCost);
  return Number.isFinite(parsedCost) ? parsedCost : defaultCost;
};

export default function CreateProcedure() {
  const router = useRouter();
  const { user } = useAuthContext();
  const tenant = useTenant();
  const [isLoading, setIsLoading] = useState(false);
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [createForAll, setCreateForAll] = useState(false);
  const [priceWasEdited, setPriceWasEdited] = useState(false);
  const [supplyRows, setSupplyRows] = useState<SupplyRow[]>([]);
  const [formData, setFormData] = useState({
    franchise: "",
    procedureName: "",
    price: "",
    notes: "",
  });

  useEffect(() => {
    if (!user?.clinicId) return;

    const fetchData = async () => {
      try {
        const [franchisesResponse, inventoryResponse] = await Promise.all([
          getFranchises(user.clinicId as string),
          listInventoryItems(user.clinicId as string),
        ]);
        setFranchises(franchisesResponse);
        setInventoryItems(
          Array.isArray(inventoryResponse) ? inventoryResponse : [],
        );
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        setFranchises([]);
        setInventoryItems([]);
      }
    };

    fetchData();
  }, [user?.clinicId]);

  const selectedSupplyCost = useMemo(() => {
    return supplyRows.reduce((sum, row) => {
      const item = inventoryItems.find(
        (inventoryItem) => inventoryItem.id === row.inventoryItemId,
      );
      const quantity = parseFloat(row.defaultQuantity) || 0;
      const unitCost = resolveUnitCost(
        row.unitCost,
        Number(item?.averageCost || 0),
      );
      return sum + quantity * unitCost;
    }, 0);
  }, [inventoryItems, supplyRows]);

  useEffect(() => {
    if (priceWasEdited || supplyRows.length === 0 || selectedSupplyCost <= 0)
      return;

    setFormData((prev) => ({
      ...prev,
      price: selectedSupplyCost.toFixed(2),
    }));
  }, [priceWasEdited, selectedSupplyCost, supplyRows.length]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    if (name === "price") {
      setPriceWasEdited(true);
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddSupply = () => {
    setSupplyRows((prev) => [
      ...prev,
      { inventoryItemId: "", defaultQuantity: "1", unitCost: "" },
    ]);
  };

  const handleSupplyChange = (
    index: number,
    field: keyof SupplyRow,
    value: string,
  ) => {
    setSupplyRows((prev) =>
      prev.map((row, rowIndex) => {
        if (rowIndex !== index) return row;

        if (field === "inventoryItemId") {
          const selectedItem = inventoryItems.find((item) => item.id === value);
          return {
            ...row,
            inventoryItemId: value,
            unitCost: selectedItem
              ? String(selectedItem.averageCost || 0)
              : row.unitCost,
          };
        }

        return { ...row, [field]: value };
      }),
    );
  };

  const handleRemoveSupply = (index: number) => {
    setSupplyRows((prev) => prev.filter((_, rowIndex) => rowIndex !== index));
  };

  const validSupplyRows = Object.values(
    supplyRows.reduce<Record<string, SupplyRow>>((acc, row) => {
      const quantity = parseFloat(row.defaultQuantity) || 0;
      if (!row.inventoryItemId || quantity <= 0) return acc;

      const existingQuantity =
        parseFloat(acc[row.inventoryItemId]?.defaultQuantity ?? "0") || 0;
      acc[row.inventoryItemId] = {
        inventoryItemId: row.inventoryItemId,
        defaultQuantity: String(existingQuantity + quantity),
        unitCost: row.unitCost,
      };

      return acc;
    }, {}),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await createProcedure({
        franchiseId: createForAll ? "" : formData.franchise,
        name: formData.procedureName,
        price: parseFloat(formData.price),
        notes: formData.notes,
        createForAllFranchises: createForAll,
        clinicId: user?.clinicId as string,
      });

      if (user?.clinicId && validSupplyRows.length > 0) {
        const createdProcedures = Array.isArray(response?.procedures)
          ? response.procedures
          : response?.id
            ? [response]
            : [];

        await Promise.all(
          createdProcedures.flatMap((procedure: { id: string }) =>
            validSupplyRows.map((row) =>
              upsertSupplyTemplate(user.clinicId as string, {
                procedureId: procedure.id,
                inventoryItemId: row.inventoryItemId,
                defaultQuantity: parseFloat(row.defaultQuantity),
                isRequired: true,
              }),
            ),
          ),
        );
      }

      toast.success(
        createForAll
          ? `Procedimento criado para todas as ${franchises.length} franquias!`
          : "Procedimento criado com sucesso!",
      );
      router.push(createTenantLink(tenant, "/dashboard/procedures"));
    } catch (error: unknown) {
      console.error("Erro ao criar procedimento:", error);
      const errorMessage = getErrorMessage(
        error,
        "Erro ao criar procedimento. Tente novamente.",
      );
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    (createForAll || formData.franchise) &&
    formData.procedureName &&
    formData.price &&
    parseFloat(formData.price) > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={() =>
            router.push(createTenantLink(tenant, "/dashboard/procedures"))
          }
          className="flex items-center gap-2 text-primary hover:text-primary/90 font-medium mb-4 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Procedimentos
        </button>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Criar Procedimento
        </h1>
        <p className="text-muted-foreground">
          Adicione um novo procedimento à sua clínica
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-card rounded-xl border border-border p-8 shadow-sm max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Create for all franchises checkbox */}
          <div className="flex items-center space-x-2 p-4 bg-secondary rounded-lg">
            <Checkbox
              id="createForAll"
              checked={createForAll}
              onCheckedChange={(checked) => {
                setCreateForAll(checked as boolean);
                if (checked) {
                  setFormData((prev) => ({ ...prev, franchise: "" }));
                }
              }}
            />
            <Label
              htmlFor="createForAll"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Criar para todas as franquias
            </Label>
          </div>

          {/* Franchise */}
          <div className="space-y-2">
            <Label
              htmlFor="franchise"
              className="text-foreground font-semibold"
            >
              Franquia {!createForAll && "*"}
            </Label>
            <Select
              value={formData.franchise}
              onValueChange={(value) => handleSelectChange("franchise", value)}
              disabled={createForAll}
            >
              <SelectTrigger
                id="franchise"
                className={`bg-card border-border h-11 ${createForAll ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <SelectValue placeholder="Selecione uma franquia" />
              </SelectTrigger>
              <SelectContent>
                {franchises.map((franchise) => (
                  <SelectItem key={franchise.id} value={franchise.id}>
                    {franchise.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {createForAll && (
              <p className="text-xs text-muted-foreground">
                O procedimento será criado para todas as {franchises.length}{" "}
                franquias
              </p>
            )}
          </div>

          {/* Procedure Name */}
          <div className="space-y-2">
            <Label
              htmlFor="procedureName"
              className="text-foreground font-semibold"
            >
              Nome do Procedimento *
            </Label>
            <Input
              id="procedureName"
              name="procedureName"
              type="text"
              placeholder="e.g., Teeth Cleaning"
              value={formData.procedureName}
              onChange={handleChange}
              className="h-11 bg-card border-border"
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price" className="text-foreground font-semibold">
              Preço (R$) *
            </Label>
            <Input
              id="price"
              name="price"
              type="number"
              placeholder="e.g., 75.00"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={handleChange}
              className="h-11 bg-card border-border"
            />
            {supplyRows.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Custo estimado pelos insumos:{" "}
                {formatCurrency(selectedSupplyCost)}. O valor final pode ser
                ajustado manualmente.
              </p>
            )}
          </div>

          {/* Supplies */}
          <div className="space-y-4 rounded-lg border border-border p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Insumos do procedimento
                </h2>
                <p className="text-xs text-muted-foreground">
                  Adicione os insumos usados para sugerir o custo do
                  procedimento
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSupply}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            </div>

            {supplyRows.length === 0 && (
              <p className="rounded-lg bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                Nenhum insumo vinculado.
              </p>
            )}

            {supplyRows.map((row, index) => {
              const selectedItem = inventoryItems.find(
                (item) => item.id === row.inventoryItemId,
              );
              const quantity = parseFloat(row.defaultQuantity) || 0;
              const unitCost = resolveUnitCost(
                row.unitCost,
                Number(selectedItem?.averageCost || 0),
              );
              const rowCost = quantity * unitCost;

              return (
                <div
                  key={`${row.inventoryItemId}-${index}`}
                  className="grid min-w-0 gap-3 rounded-lg bg-muted/30 p-3 lg:grid-cols-[minmax(220px,1fr)_110px_120px_120px_40px] lg:items-end"
                >
                  <div className="min-w-0 space-y-1.5">
                    <Label className="text-xs">Insumo</Label>
                    <Select
                      value={row.inventoryItemId}
                      onValueChange={(value) =>
                        handleSupplyChange(index, "inventoryItemId", value)
                      }
                    >
                      <SelectTrigger className="w-full bg-card">
                        <SelectValue placeholder="Selecione um insumo" />
                      </SelectTrigger>
                      <SelectContent>
                        {inventoryItems.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name} ({item.unitType})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Quantidade</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.defaultQuantity}
                      onChange={(event) =>
                        handleSupplyChange(
                          index,
                          "defaultQuantity",
                          event.target.value,
                        )
                      }
                      className="bg-card"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Custo un.</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.unitCost}
                      onChange={(event) =>
                        handleSupplyChange(
                          index,
                          "unitCost",
                          event.target.value,
                        )
                      }
                      placeholder={
                        selectedItem
                          ? Number(selectedItem.averageCost || 0).toFixed(2)
                          : "0.00"
                      }
                      className="bg-card"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Custo</Label>
                    <div className="flex h-10 items-center rounded-md border border-border bg-card px-3 text-sm font-medium">
                      {formatCurrency(rowCost)}
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveSupply(index)}
                    aria-label="Remover insumo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-foreground font-semibold">
              Observações (Opcional)
            </Label>
            <textarea
              id="notes"
              name="notes"
              placeholder="Add details about this procedure..."
              value={formData.notes}
              onChange={handleChange}
              className="w-full border border-border rounded-lg p-3 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Detalhes opcionais visíveis para sua equipe
            </p>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            type="submit"
            disabled={isLoading || !isFormValid}
            className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-medium disabled:opacity-50"
          >
            {isLoading ? "Criando Procedimento..." : "Criar Procedimento"}
          </Button>
        </form>
      </div>
    </div>
  );
}
