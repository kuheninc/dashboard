"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useQuery, useConvexAuth } from "convex/react";
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
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();

  // Only query once auth has settled — prevents race condition where
  // getAuthUserId returns null before the WebSocket has authenticated
  const salon = useQuery(
    api.salons.queries.getMySalon,
    authLoading ? "skip" : {}
  );
  const salonId = salon?._id;

  const services = useQuery(
    api.services.queries.listAllBySalon,
    salonId ? { salonId } : "skip"
  );
  const stylists = useQuery(
    api.stylists.queries.listAllBySalon,
    salonId ? { salonId } : "skip"
  );
  const customers = useQuery(
    api.customers.queries.listBySalon,
    salonId ? { salonId } : "skip"
  );

  // Redirect only when auth is resolved and user is not authenticated,
  // or when authenticated but no salon found
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || salon === null) {
      window.location.href = "/sign-in";
    }
  }, [authLoading, isAuthenticated, salon]);

  if (authLoading || !salon || !services || !stylists || !customers) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#d1b799] to-[#a68b6b] flex items-center justify-center animate-pulse">
            <svg width="22" height="16" viewBox="0 0 56 48" fill="none">
              <path d="M4 36 Q14 6, 24 22 Q34 38, 44 12 Q48 4, 52 8" stroke="#1c1720" strokeWidth="4" fill="none" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-display text-[15px] text-[#9c9184]">Cadence</span>
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
