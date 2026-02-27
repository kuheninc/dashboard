"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useDashboard } from "@/lib/dashboard-context";
import { getTodayDateStr, getDateRangeStr, enrichBookings, type EnrichedBooking } from "@/lib/dashboard-helpers";
import PendingApprovals from "@/components/dashboard/bookings/PendingApprovals";
import BookingTable from "@/components/dashboard/bookings/BookingTable";
import WeeklyCalendarView from "@/components/dashboard/bookings/WeeklyCalendarView";
import BookingLogs from "@/components/dashboard/bookings/BookingLogs";
import BookingDetailPanel from "@/components/dashboard/bookings/BookingDetailPanel";
import StatCard from "@/components/dashboard/StatCard";
import EmptyState from "@/components/dashboard/EmptyState";
import { CalendarDays, Clock, CheckCircle2, XCircle, Search, Filter } from "lucide-react";

export default function BookingsPage() {
  const { salonId, services, stylists } = useDashboard();
  const today = getTodayDateStr();
  const { startDate: monthStart, endDate: monthEnd } = useMemo(() => getDateRangeStr(30), []);
  const { startDate: weekStart, endDate: weekEnd } = useMemo(() => getDateRangeStr(7), []);

  const todayBookings = useQuery(api.bookings.queries.getByDate, { salonId, date: today });
  const pendingBookings = useQuery(api.bookings.queries.getPendingApproval, { salonId });
  const weekBookings = useQuery(api.bookings.queries.getByDateRange, { salonId, startDate: weekStart, endDate: weekEnd });
  const monthBookings = useQuery(api.bookings.queries.getByDateRange, { salonId, startDate: monthStart, endDate: monthEnd });

  const [tab, setTab] = useState<"calendar" | "list" | "logs">("calendar");
  const [detailBooking, setDetailBooking] = useState<EnrichedBooking | null>(null);

  // Shared filters for list/logs
  const [stylistFilter, setStylistFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");

  const cancelledCount = useMemo(() => {
    if (!monthBookings) return 0;
    return monthBookings.filter((b) => b.status === "cancelled").length;
  }, [monthBookings]);

  const isEmpty =
    todayBookings !== undefined &&
    todayBookings.length === 0 &&
    monthBookings !== undefined &&
    monthBookings.length === 0 &&
    (!pendingBookings || pendingBookings.length === 0);

  const activeStylists = stylists.filter((s) => s.isActive);
  const activeServices = services.filter((s) => s.isActive);

  return (
    <div className="space-y-5 max-w-[1400px]">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="cadence-animate cadence-delay-1">
          <StatCard label="Today" value={todayBookings ? String(todayBookings.length) : "\u2014"} icon={CalendarDays} iconColor="text-primary" />
        </div>
        <div className="cadence-animate cadence-delay-2">
          <StatCard label="Pending Approval" value={pendingBookings ? String(pendingBookings.length) : "\u2014"} icon={Clock} iconColor="text-[#c4983e]" />
        </div>
        <div className="cadence-animate cadence-delay-3">
          <StatCard label="This Week" value={weekBookings ? String(weekBookings.length) : "\u2014"} icon={CheckCircle2} iconColor="text-[#5a9a6e]" />
        </div>
        <div className="cadence-animate cadence-delay-4">
          <StatCard label="Cancelled (Month)" value={monthBookings ? String(cancelledCount) : "\u2014"} icon={XCircle} iconColor="text-[#c45a5a]" />
        </div>
      </div>

      {/* Empty state */}
      {isEmpty && (
        <EmptyState
          icon={CalendarDays}
          title="No bookings yet"
          description="Once customers start booking via WhatsApp, their appointments will show up here."
        />
      )}

      {/* Pending approvals */}
      {!isEmpty && (
        <PendingApprovals onViewDetails={setDetailBooking} />
      )}

      {/* Tabs + Filters */}
      {!isEmpty && (
        <div className="cadence-animate cadence-delay-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            {/* Tab buttons */}
            <div className="flex gap-1 bg-muted/40 p-0.5 rounded-lg border border-border w-fit">
              <button
                onClick={() => setTab("calendar")}
                className={`px-3.5 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
                  tab === "calendar"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Calendar
              </button>
              <button
                onClick={() => setTab("list")}
                className={`px-3.5 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
                  tab === "list"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setTab("logs")}
                className={`px-3.5 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
                  tab === "logs"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                History
              </button>
            </div>

            {/* Filter dropdowns for list/logs */}
            {(tab === "list" || tab === "logs") && (
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-[#9c9184]" />
                <select
                  value={stylistFilter}
                  onChange={(e) => setStylistFilter(e.target.value)}
                  className="bg-card border border-border rounded-lg px-2.5 py-1.5 text-[12px] text-foreground outline-none focus:ring-1 focus:ring-primary/30"
                >
                  <option value="all">All Stylists</option>
                  {activeStylists.map((s) => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
                <select
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
                  className="bg-card border border-border rounded-lg px-2.5 py-1.5 text-[12px] text-foreground outline-none focus:ring-1 focus:ring-primary/30"
                >
                  <option value="all">All Services</option>
                  {activeServices.map((s) => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {tab === "calendar" && (
            <WeeklyCalendarView onOpenDetail={setDetailBooking} />
          )}
          {tab === "list" && (
            <BookingTable
              stylistFilter={stylistFilter}
              serviceFilter={serviceFilter}
              onOpenDetail={setDetailBooking}
            />
          )}
          {tab === "logs" && (
            <BookingLogs
              stylistFilter={stylistFilter}
              serviceFilter={serviceFilter}
            />
          )}
        </div>
      )}

      {/* Detail Panel */}
      {detailBooking && (
        <BookingDetailPanel
          booking={detailBooking}
          onClose={() => setDetailBooking(null)}
        />
      )}
    </div>
  );
}
