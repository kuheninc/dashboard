"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Id, Doc } from "../convex/_generated/dataModel";

interface DashboardContextValue {
  salonId: Id<"salons">;
  salon: Doc<"salons">;
  services: Doc<"services">[];
  stylists: Doc<"stylists">[];
  customers: Doc<"customers">[];
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}

export function useSalonId() {
  return useDashboard().salonId;
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const salons = useQuery(api.salons.queries.listActive);
  const salon = salons?.[0];
  const salonId = salon?._id;

  const services = useQuery(
    api.services.queries.listAllBySalon,
    salonId ? { salonId } : "skip"
  );
  const stylists = useQuery(
    api.stylists.queries.listBySalon,
    salonId ? { salonId } : "skip"
  );
  const customers = useQuery(
    api.customers.queries.listBySalon,
    salonId ? { salonId } : "skip"
  );

  if (!salon || !services || !stylists || !customers) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d1b799] to-[#a68b6b] flex items-center justify-center animate-pulse">
            <svg width="22" height="18" viewBox="0 0 56 48" fill="none">
              <path d="M4 36 Q14 6, 24 22 Q34 38, 44 12 Q48 4, 52 8" stroke="#1c1720" strokeWidth="4" fill="none" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-[13px] text-[#9c9184]">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <DashboardContext.Provider
      value={{ salonId: salon._id, salon, services, stylists, customers }}
    >
      {children}
    </DashboardContext.Provider>
  );
}
