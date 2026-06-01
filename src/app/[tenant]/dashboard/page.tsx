"use client";

import { useState } from "react";
import GeneralTab from "./_components/general-tab";
import BillingPage from "./billing/page";
import FinancialPage from "./financial/page";
import PerformancePage from "./performance/page";

type DashTab = "geral" | "performance" | "faturamento" | "procedimentos";

const TABS: { key: DashTab; label: string }[] = [
  { key: "geral", label: "Geral" },
  { key: "performance", label: "Performance" },
  { key: "faturamento", label: "Faturamento" },
  { key: "procedimentos", label: "Procedimentos" },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<DashTab>("geral");

  return (
    <div className="w-full space-y-6">
      {/* Tab nav */}
      <div className="flex items-center gap-1 p-1 bg-muted rounded-xl w-fit">
        {TABS.map(({ key, label }) => (
          <button
            type="button"
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              activeTab === key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "geral" && <GeneralTab />}
      {activeTab === "performance" && <PerformancePage />}
      {activeTab === "faturamento" && <BillingPage />}
      {activeTab === "procedimentos" && <FinancialPage />}
    </div>
  );
}
