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
  const { salonId, salon, services, stylists, customers } = useDashboard();
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

    // New customers: those created in the last 30 days
    const startMs = new Date(startDate + "T00:00:00").getTime();
    const newCustomers = customers.filter((c) => c._creationTime >= startMs).length;

    // Booking trend: group by date for last 30 days
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

    // Service popularity: count bookings per service this month
    const serviceCountMap = new Map<string, number>();
    for (const b of enrichedMonth) {
      serviceCountMap.set(b.serviceName, (serviceCountMap.get(b.serviceName) ?? 0) + 1);
    }
    const popularityData = Array.from(serviceCountMap.entries())
      .map(([name, bookings]) => ({ name, bookings }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5);

    // Recent bookings for activity feed (last 7 days)
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
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Welcome back. Here&apos;s what&apos;s happening at {salon.name} today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's Bookings"
          value={stats ? String(stats.todayCount) : "—"}
          icon={CalendarDays}
          iconColor="text-primary"
        />
        <StatCard
          label="Revenue (This Month)"
          value={stats ? `RM ${stats.revenue.toLocaleString()}` : "—"}
          icon={DollarSign}
          iconColor="text-emerald-600"
        />
        <StatCard
          label="New Customers"
          value={stats ? String(stats.newCustomers) : "—"}
          icon={UserPlus}
          iconColor="text-violet-600"
        />
        <StatCard
          label="No-Show Rate"
          value={stats ? `${stats.noShowRate}%` : "—"}
          icon={AlertTriangle}
          iconColor="text-amber-600"
        />
      </div>

      {/* Pending approvals */}
      <PendingApprovals />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <BookingTrendChart data={stats?.trendData ?? []} />
        </div>
        <div className="lg:col-span-2">
          <ServicePopularityChart data={stats?.popularityData ?? []} />
        </div>
      </div>

      {/* Schedule + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TodaySchedule />
        <ActivityFeed bookings={stats?.recentBookings ?? []} />
      </div>
    </div>
  );
}
