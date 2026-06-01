"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getFranchises } from "@/services/franchise/franchise.service";

export interface Franchise {
  id: string;
  name: string;
  address: string;
  zipCode: string;
  status: string;
  description?: string;
}

interface FranchiseContextType {
  franchises: Franchise[];
  selected: Franchise | null;
  setSelected: (franchise: Franchise) => void;
  isLoading: boolean;
}

const FranchiseContext = createContext<FranchiseContextType | undefined>(undefined);

export function FranchiseProvider({
  children,
  clinicId,
}: {
  children: ReactNode;
  clinicId: string | null;
}) {
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [selected, setSelected] = useState<Franchise | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!clinicId) return;
    setIsLoading(true);
    getFranchises(clinicId)
      .then((data) => {
        const list: Franchise[] = Array.isArray(data) ? data : [];
        const active = list.filter((f) => f.status === "ACTIVE");
        setFranchises(active);
        if (active.length > 0) setSelected(active[0]);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [clinicId]);

  return (
    <FranchiseContext.Provider value={{ franchises, selected, setSelected, isLoading }}>
      {children}
    </FranchiseContext.Provider>
  );
}

export function useFranchise() {
  const ctx = useContext(FranchiseContext);
  if (!ctx) throw new Error("useFranchise must be used within FranchiseProvider");
  return ctx;
}
