"use client";

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Id, Doc } from "../convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

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

function CadenceSpinner() {
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

interface SalonWithRole extends Doc<"salons"> {
  memberRole: "owner" | "admin";
}

function SalonPicker({
  salons,
  onSelect,
}: {
  salons: SalonWithRole[];
  onSelect: (id: Id<"salons">) => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <div className="w-full max-w-md cadence-animate">
        <h2 className="font-display text-[24px] text-foreground mb-2 text-center">
          Choose a salon
        </h2>
        <p className="text-[14px] text-muted-foreground mb-6 text-center">
          You have access to multiple salons. Pick one to manage.
        </p>
        <div className="space-y-3">
          {salons.map((s) => (
            <button
              key={s._id}
              onClick={() => onSelect(s._id)}
              className="w-full p-4 rounded-xl bg-card border border-border hover:border-[rgba(42,36,32,0.15)] hover:shadow-sm transition-all text-left flex items-center justify-between group"
            >
              <div>
                <p className="text-[15px] font-medium text-foreground">
                  {s.name}
                </p>
                <p className="text-[13px] text-muted-foreground mt-0.5">
                  {s.address}
                </p>
                <span className="inline-block mt-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#f0ebe3] text-[#8a7055]">
                  {s.memberRole === "owner" ? "Owner" : "Admin"}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function useMySalons() {
  return useQuery(api.salons.queries.getMySalons);
}

function NoSalonState() {
  const router = useRouter();
  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <div className="w-full max-w-sm text-center cadence-animate">
        <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[#d1b799] to-[#a68b6b] flex items-center justify-center">
          <svg width="24" height="18" viewBox="0 0 56 48" fill="none">
            <path d="M4 36 Q14 6, 24 22 Q34 38, 44 12 Q48 4, 52 8" stroke="#1c1720" strokeWidth="4" fill="none" strokeLinecap="round"/>
          </svg>
        </div>
        <h2 className="font-display text-[22px] text-foreground mb-2">
          No salon yet
        </h2>
        <p className="text-[14px] text-muted-foreground mb-6">
          Set up your salon to get started with Cadence.
        </p>
        <button
          onClick={() => router.push("/onboarding")}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-[14px] font-semibold text-[#1c1720] bg-gradient-to-r from-[#d1b799] to-[#c4a67e] hover:from-[#dcc5a8] hover:to-[#d1b799] transition-all shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
        >
          Set up my salon
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function AutoLinker() {
  const autoLink = useMutation(api.salonMembers.autoLink.autoLinkUserToSalon);
  const [tried, setTried] = useState(false);
  const [linked, setLinked] = useState(false);
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (attemptedRef.current) return;
    attemptedRef.current = true;
    autoLink({}).then((result) => {
      setLinked(result.linked);
      setTried(true);
    }).catch(() => {
      setTried(true);
    });
  }, [autoLink]);

  if (!tried) return <CadenceSpinner />;
  if (linked) {
    // Force re-render by reloading — the query will now find the salon
    window.location.reload();
    return <CadenceSpinner />;
  }
  return <NoSalonState />;
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const rawSalons = useMySalons();
  const mySalons = rawSalons as SalonWithRole[] | undefined;
  const [selectedSalonId, setSelectedSalonId] = useState<Id<"salons"> | null>(null);

  // Determine which salon to load
  const targetSalonId = selectedSalonId ?? mySalons?.[0]?._id ?? null;

  const services = useQuery(
    api.services.queries.listAllBySalon,
    targetSalonId ? { salonId: targetSalonId } : "skip"
  );
  const stylists = useQuery(
    api.stylists.queries.listAllBySalon,
    targetSalonId ? { salonId: targetSalonId } : "skip"
  );
  const customers = useQuery(
    api.customers.queries.listBySalon,
    targetSalonId ? { salonId: targetSalonId } : "skip"
  );

  // Still loading
  if (mySalons === undefined) {
    return <CadenceSpinner />;
  }

  // No salons linked to this user — try auto-linking first
  if (mySalons.length === 0) {
    return <AutoLinker />;
  }

  // Multi-salon: show picker if no selection yet and more than 1
  if (mySalons.length > 1 && !selectedSalonId) {
    return (
      <SalonPicker
        salons={mySalons}
        onSelect={setSelectedSalonId}
      />
    );
  }

  const salon = mySalons.find((s) => s._id === targetSalonId) ?? mySalons[0];

  if (!salon || !services || !stylists || !customers) {
    return <CadenceSpinner />;
  }

  return (
    <DashboardContext.Provider
      value={{ salonId: salon._id, salon, services, stylists, customers }}
    >
      {children}
    </DashboardContext.Provider>
  );
}
