"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useDashboard } from "@/lib/dashboard-context";
import { enrichBookings, getDateRangeStr } from "@/lib/dashboard-helpers";
import StatCard from "@/components/dashboard/StatCard";
import RevenueChart from "@/components/dashboard/charts/RevenueChart";
import ServicePopularityChart from "@/components/dashboard/charts/ServicePopularityChart";
import BookingFunnelChart from "@/components/dashboard/charts/BookingFunnelChart";
import PeakHoursHeatmap from "@/components/dashboard/charts/PeakHoursHeatmap";
import StylistPerformanceChart from "@/components/dashboard/charts/StylistPerformanceChart";
import CustomerRetentionChart from "@/components/dashboard/charts/CustomerRetentionChart";
import BookingTrendChart from "@/components/dashboard/charts/BookingTrendChart";
import { DollarSign, TrendingUp, BarChart3, Users } from "lucide-react";

type Tab = "revenue" | "bookings" | "customers";

export default function AnalyticsPage() {
  const { salonId, services, stylists, customers } = useDashboard();
  const { startDate, endDate } = useMemo(() => getDateRangeStr(90), []);
  const [tab, setTab] = useState<Tab>("revenue");

  const bookings = useQuery(api.bookings.queries.getByDateRange, { salonId, startDate, endDate });

  const data = useMemo(() => {
    if (!bookings) return null;

    const enriched = enrichBookings(bookings, customers, services, stylists);
    const completed = enriched.filter((b) => b.status === "completed");
    const revenue = completed.reduce((sum, b) => sum + b.servicePrice, 0);
    const avgValue = completed.length > 0 ? Math.round(revenue / completed.length) : 0;
    const nonCancelled = enriched.filter(
      (b) => b.status !== "cancelled_customer" && b.status !== "cancelled_admin"
    );
    const completionRate = nonCancelled.length > 0
      ? Math.round((completed.length / nonCancelled.length) * 100)
      : 0;

    const customerBookingCount = new Map<string, number>();
    for (const b of enriched) {
      customerBookingCount.set(b.customerId, (customerBookingCount.get(b.customerId) ?? 0) + 1);
    }
    const totalWithBookings = customerBookingCount.size;
    const returning = Array.from(customerBookingCount.values()).filter((c) => c > 1).length;
    const returningPct = totalWithBookings > 0 ? Math.round((returning / totalWithBookings) * 100) : 0;

    const revByDate = new Map<string, number>();
    for (const b of completed) {
      revByDate.set(b.date, (revByDate.get(b.date) ?? 0) + b.servicePrice);
    }
    const revenueData: { date: string; value: number }[] = [];
    const d = new Date(startDate);
    const end = new Date(endDate);
    while (d <= end) {
      const ds = d.toISOString().split("T")[0];
      revenueData.push({ date: ds, value: revByDate.get(ds) ?? 0 });
      d.setDate(d.getDate() + 1);
    }

    const countByDate = new Map<string, number>();
    for (const b of enriched) {
      countByDate.set(b.date, (countByDate.get(b.date) ?? 0) + 1);
    }
    const trendData: { date: string; value: number }[] = [];
    const d2 = new Date(startDate);
    while (d2 <= end) {
      const ds = d2.toISOString().split("T")[0];
      trendData.push({ date: ds, value: countByDate.get(ds) ?? 0 });
      d2.setDate(d2.getDate() + 1);
    }

    const serviceCountMap = new Map<string, number>();
    for (const b of enriched) {
      serviceCountMap.set(b.serviceName, (serviceCountMap.get(b.serviceName) ?? 0) + 1);
    }
    const popularityData = Array.from(serviceCountMap.entries())
      .map(([name, bookings]) => ({ name, bookings }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5);

    const stylistMap = new Map<string, { bookings: number; completed: number; noShows: number }>();
    for (const b of enriched) {
      const key = b.stylistName;
      const prev = stylistMap.get(key) ?? { bookings: 0, completed: 0, noShows: 0 };
      prev.bookings++;
      if (b.status === "completed") prev.completed++;
      if (b.status === "no_show") prev.noShows++;
      stylistMap.set(key, prev);
    }
    const stylistPerformanceData = Array.from(stylistMap.entries()).map(([name, s]) => ({
      name,
      ...s,
    }));

    const confirmed = enriched.filter(
      (b) => ["confirmed", "reminder_sent", "customer_confirmed"].includes(b.status)
    ).length;
    const completedCount = completed.length;
    const funnelData = [
      { stage: "Requested", count: enriched.length },
      { stage: "Confirmed", count: confirmed + completedCount },
      { stage: "Completed", count: completedCount },
    ];

    const peakMap = new Map<string, number>();
    for (const b of enriched) {
      const dateObj = new Date(b.date + "T00:00:00");
      const day = dateObj.getDay();
      const hour = parseInt(b.startTime.split(":")[0], 10);
      const key = `${day}-${hour}`;
      peakMap.set(key, (peakMap.get(key) ?? 0) + 1);
    }
    const peakData: { day: number; hour: number; count: number }[] = [];
    for (let day = 0; day < 7; day++) {
      for (let hour = 9; hour <= 20; hour++) {
        peakData.push({ day, hour, count: peakMap.get(`${day}-${hour}`) ?? 0 });
      }
    }

    const retentionData = [
      { name: "Returning", value: returningPct },
      { name: "New", value: 100 - returningPct },
    ];

    return {
      revenue,
      avgValue,
      completionRate,
      returningPct,
      revenueData,
      trendData,
      popularityData,
      stylistPerformanceData,
      funnelData,
      peakData,
      retentionData,
    };
  }, [bookings, customers, services, stylists, startDate, endDate]);

  return (
    <div className="space-y-7 max-w-[1400px]">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="cadence-animate cadence-delay-1">
          <StatCard
            label="Monthly Revenue"
            value={data ? `RM ${data.revenue.toLocaleString()}` : "\u2014"}
            icon={DollarSign}
            iconColor="text-[#5a9a6e]"
          />
        </div>
        <div className="cadence-animate cadence-delay-2">
          <StatCard
            label="Avg. Booking Value"
            value={data ? `RM ${data.avgValue}` : "\u2014"}
            icon={TrendingUp}
            iconColor="text-primary"
          />
        </div>
        <div className="cadence-animate cadence-delay-3">
          <StatCard
            label="Completion Rate"
            value={data ? `${data.completionRate}%` : "\u2014"}
            icon={BarChart3}
            iconColor="text-[#8a7055]"
          />
        </div>
        <div className="cadence-animate cadence-delay-4">
          <StatCard
            label="Returning Customers"
            value={data ? `${data.returningPct}%` : "\u2014"}
            icon={Users}
            iconColor="text-[#c4983e]"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="cadence-animate cadence-delay-5">
        <div className="flex gap-1 bg-muted/50 p-1 rounded-[10px] w-fit mb-5">
          {(["revenue", "bookings", "customers"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-[8px] text-[13px] font-medium transition-colors capitalize ${
                tab === t
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Revenue Tab */}
        {tab === "revenue" && (
          <div className="space-y-5">
            <RevenueChart data={data?.revenueData ?? []} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <ServicePopularityChart data={data?.popularityData ?? []} />
              <StylistPerformanceChart data={data?.stylistPerformanceData ?? []} />
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {tab === "bookings" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <BookingFunnelChart data={data?.funnelData ?? []} />
              <BookingTrendChart data={data?.trendData ?? []} />
            </div>
            <PeakHoursHeatmap data={data?.peakData ?? []} />
          </div>
        )}

        {/* Customers Tab */}
        {tab === "customers" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <CustomerRetentionChart data={data?.retentionData ?? []} />
              <StylistPerformanceChart data={data?.stylistPerformanceData ?? []} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
