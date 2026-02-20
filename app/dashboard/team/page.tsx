"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useDashboard } from "@/lib/dashboard-context";
import { getDateRangeStr } from "@/lib/dashboard-helpers";
import StatCard from "@/components/dashboard/StatCard";
import StylistCard from "@/components/dashboard/team/StylistCard";
import AvailabilityGrid from "@/components/dashboard/team/AvailabilityGrid";
import { UserCog, CheckCircle2, Calendar } from "lucide-react";

export default function TeamPage() {
  const { salonId, stylists } = useDashboard();
  const { startDate, endDate } = useMemo(() => getDateRangeStr(30), []);
  const bookings = useQuery(api.bookings.queries.getByDateRange, { salonId, startDate, endDate });

  const activeStylists = stylists.filter((s) => s.isActive);

  // Compute per-stylist stats from bookings
  const stylistStats = useMemo(() => {
    if (!bookings) return new Map<string, { bookings: number; completed: number; noShows: number }>();
    const map = new Map<string, { bookings: number; completed: number; noShows: number }>();
    for (const b of bookings) {
      const prev = map.get(b.stylistId) ?? { bookings: 0, completed: 0, noShows: 0 };
      prev.bookings++;
      if (b.status === "completed") prev.completed++;
      if (b.status === "no_show") prev.noShows++;
      map.set(b.stylistId, prev);
    }
    return map;
  }, [bookings]);

  const totalBookingsMonth = bookings?.length ?? 0;
  const totalCompleted = bookings?.filter((b) => b.status === "completed").length ?? 0;
  const totalNonCancelled = bookings?.filter(
    (b) => b.status !== "cancelled_customer" && b.status !== "cancelled_admin"
  ).length ?? 0;
  const avgCompletionRate = totalNonCancelled > 0
    ? Math.round((totalCompleted / totalNonCancelled) * 100)
    : 0;

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-xl font-bold text-foreground">Team</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          View stylist profiles, performance, and availability.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Active Stylists"
          value={String(activeStylists.length)}
          icon={UserCog}
          iconColor="text-primary"
        />
        <StatCard
          label="Avg. Completion Rate"
          value={bookings ? `${avgCompletionRate}%` : "—"}
          icon={CheckCircle2}
          iconColor="text-emerald-600"
        />
        <StatCard
          label="Total Bookings (Month)"
          value={bookings ? String(totalBookingsMonth) : "—"}
          icon={Calendar}
          iconColor="text-violet-600"
        />
      </div>

      {/* Stylist cards */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Stylists</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stylists.map((stylist) => (
            <StylistCard
              key={stylist._id}
              stylist={stylist}
              stats={stylistStats.get(stylist._id)}
            />
          ))}
        </div>
      </div>

      {/* Availability grid */}
      <AvailabilityGrid stylists={stylists} />
    </div>
  );
}
