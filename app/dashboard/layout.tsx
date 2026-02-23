"use client";

import { useConvexAuth } from "convex/react";
import { useEffect, useState } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [timedOut, setTimedOut] = useState(false);

  // Give the Convex backend up to 15s to confirm auth
  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), 15000);
    return () => clearTimeout(timer);
  }, []);

  // Auth resolved — not authenticated, or timed out
  useEffect(() => {
    if ((!isLoading && !isAuthenticated) || (timedOut && isLoading)) {
      window.location.href = "/sign-in";
    }
  }, [isLoading, isAuthenticated, timedOut]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#d1b799] to-[#a68b6b] flex items-center justify-center animate-pulse">
            <svg width="18" height="13" viewBox="0 0 56 48" fill="none">
              <path
                d="M4 36 Q14 6, 24 22 Q34 38, 44 12 Q48 4, 52 8"
                stroke="#1c1720"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="font-display text-[15px] text-[#9c9184]">
            Cadence
          </span>
        </div>
      </div>
    );
  }

  return <DashboardShell>{children}</DashboardShell>;
}
