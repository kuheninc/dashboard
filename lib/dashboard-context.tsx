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
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm text-muted-foreground">Loading dashboard...</span>
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
