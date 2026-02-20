"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useDashboard } from "@/lib/dashboard-context";
import { enrichBookings, getTodayDateStr, getDateRangeStr } from "@/lib/dashboard-helpers";
import StatCard from "@/components/dashboard/StatCard";
import BookingTrendChart from "@/components/dashboard/charts/BookingTrendChart";
import ServicePopularityChart from "@/components/dashboard/charts/ServicePopularityChart";
import TodaySchedule from "@/components/dashboard/bookings/TodaySchedule";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import PendingApprovals from "@/components/dashboard/bookings/PendingApprovals";
import { CalendarDays, DollarSign, UserPlus, AlertTriangle } from "lucide-react";

export default function DashboardOverview() {
  const { salonId, services, stylists, customers } = useDashboard();
  const today = getTodayDateStr();
  const { startDate, endDate } = useMemo(() => getDateRangeStr(30), []);

  const todayBookings = useQuery(api.bookings.queries.getByDate, { salonId, date: today });
  const monthBookings = useQuery(api.bookings.queries.getByDateRange, { salonId, startDate, endDate });

  const stats = useMemo(() => {
    if (!monthBookings || !todayBookings) return null;

    const enrichedMonth = enrichBookings(monthBookings, customers, services, stylists);
    const completedMonth = enrichedMonth.filter((b) => b.status === "completed");
    const revenue = completedMonth.reduce((sum, b) => sum + b.servicePrice, 0);
    const noShows = enrichedMonth.filter((b) => b.status === "no_show").length;
    const noShowRate = enrichedMonth.length > 0 ? ((noShows / enrichedMonth.length) * 100).toFixed(1) : "0";

    const startMs = new Date(startDate + "T00:00:00").getTime();
    const newCustomers = customers.filter((c) => c._creationTime >= startMs).length;

    const dateCountMap = new Map<string, number>();
    for (const b of monthBookings) {
      dateCountMap.set(b.date, (dateCountMap.get(b.date) ?? 0) + 1);
    }
    const trendData: { date: string; value: number }[] = [];
    const d = new Date(startDate);
    const end = new Date(endDate);
    while (d <= end) {
      const dateStr = d.toISOString().split("T")[0];
      trendData.push({ date: dateStr, value: dateCountMap.get(dateStr) ?? 0 });
      d.setDate(d.getDate() + 1);
    }

    const serviceCountMap = new Map<string, number>();
    for (const b of enrichedMonth) {
      serviceCountMap.set(b.serviceName, (serviceCountMap.get(b.serviceName) ?? 0) + 1);
    }
    const popularityData = Array.from(serviceCountMap.entries())
      .map(([name, bookings]) => ({ name, bookings }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysStr = sevenDaysAgo.toISOString().split("T")[0];
    const recentBookings = enrichedMonth.filter((b) => b.date >= sevenDaysStr);

    return {
      todayCount: todayBookings.length,
      revenue,
      newCustomers,
      noShowRate,
      trendData,
      popularityData,
      recentBookings,
    };
  }, [monthBookings, todayBookings, customers, services, stylists, startDate, endDate]);

  return (
    <div className="space-y-7 max-w-[1400px]">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="cadence-animate cadence-delay-1">
          <StatCard
            label="Today's Bookings"
            value={stats ? String(stats.todayCount) : "\u2014"}
            icon={CalendarDays}
            iconColor="text-primary"
          />
        </div>
        <div className="cadence-animate cadence-delay-2">
          <StatCard
            label="Revenue (This Month)"
            value={stats ? `RM ${stats.revenue.toLocaleString()}` : "\u2014"}
            icon={DollarSign}
            iconColor="text-[#5a9a6e]"
          />
        </div>
        <div className="cadence-animate cadence-delay-3">
          <StatCard
            label="New Customers"
            value={stats ? String(stats.newCustomers) : "\u2014"}
            icon={UserPlus}
            iconColor="text-[#8a7055]"
          />
        </div>
        <div className="cadence-animate cadence-delay-4">
          <StatCard
            label="No-Show Rate"
            value={stats ? `${stats.noShowRate}%` : "\u2014"}
            icon={AlertTriangle}
            iconColor="text-[#c4983e]"
          />
        </div>
      </div>

      {/* Pending approvals */}
      <PendingApprovals />

      {/* Content grid: charts + right column */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5">
        {/* Left: charts */}
        <div className="space-y-5 cadence-animate cadence-delay-5">
          <BookingTrendChart data={stats?.trendData ?? []} />
          <ServicePopularityChart data={stats?.popularityData ?? []} />
        </div>

        {/* Right column */}
        <div className="space-y-5 cadence-animate cadence-delay-6">
          <TodaySchedule />
          <ActivityFeed bookings={stats?.recentBookings ?? []} />
        </div>
      </div>
    </div>
  );
}
