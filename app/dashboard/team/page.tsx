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
    <div className="space-y-7 max-w-[1400px]">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="cadence-animate cadence-delay-1">
          <StatCard label="Active Stylists" value={String(activeStylists.length)} icon={UserCog} iconColor="text-primary" />
        </div>
        <div className="cadence-animate cadence-delay-2">
          <StatCard label="Avg. Completion Rate" value={bookings ? `${avgCompletionRate}%` : "\u2014"} icon={CheckCircle2} iconColor="text-[#5a9a6e]" />
        </div>
        <div className="cadence-animate cadence-delay-3">
          <StatCard label="Total Bookings (Month)" value={bookings ? String(totalBookingsMonth) : "\u2014"} icon={Calendar} iconColor="text-[#8a7055]" />
        </div>
      </div>

      {/* Stylist cards */}
      <div className="cadence-animate cadence-delay-4">
        <h2 className="font-display text-[17px] text-foreground mb-4">Stylists</h2>
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
      <div className="cadence-animate cadence-delay-5">
        <AvailabilityGrid stylists={stylists} />
      </div>
    </div>
  );
}
