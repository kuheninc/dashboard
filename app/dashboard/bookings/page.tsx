"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useDashboard } from "@/lib/dashboard-context";
import { getTodayDateStr, getDateRangeStr } from "@/lib/dashboard-helpers";
import PendingApprovals from "@/components/dashboard/bookings/PendingApprovals";
import BookingTable from "@/components/dashboard/bookings/BookingTable";
import CalendarView from "@/components/dashboard/bookings/CalendarView";
import StatCard from "@/components/dashboard/StatCard";
import { CalendarDays, Clock, CheckCircle2, XCircle } from "lucide-react";

export default function BookingsPage() {
  const { salonId } = useDashboard();
  const today = getTodayDateStr();
  const { startDate: monthStart, endDate: monthEnd } = useMemo(() => getDateRangeStr(30), []);
  const { startDate: weekStart, endDate: weekEnd } = useMemo(() => getDateRangeStr(7), []);

  const todayBookings = useQuery(api.bookings.queries.getByDate, { salonId, date: today });
  const pendingBookings = useQuery(api.bookings.queries.getPendingApproval, { salonId });
  const weekBookings = useQuery(api.bookings.queries.getByDateRange, { salonId, startDate: weekStart, endDate: weekEnd });
  const monthBookings = useQuery(api.bookings.queries.getByDateRange, { salonId, startDate: monthStart, endDate: monthEnd });

  const [tab, setTab] = useState<"list" | "calendar">("list");

  const cancelledCount = useMemo(() => {
    if (!monthBookings) return 0;
    return monthBookings.filter(
      (b) => b.status === "cancelled_customer" || b.status === "cancelled_admin"
    ).length;
  }, [monthBookings]);

  return (
    <div className="space-y-7 max-w-[1400px]">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Pending approvals */}
      <PendingApprovals />

      {/* Tabs */}
      <div className="cadence-animate cadence-delay-5">
        <div className="flex gap-1 bg-muted/50 p-1 rounded-[10px] w-fit mb-5">
          <button
            onClick={() => setTab("list")}
            className={`px-4 py-2 rounded-[8px] text-[13px] font-medium transition-colors ${
              tab === "list"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setTab("calendar")}
            className={`px-4 py-2 rounded-[8px] text-[13px] font-medium transition-colors ${
              tab === "calendar"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Calendar View
          </button>
        </div>

        {tab === "list" ? <BookingTable /> : <CalendarView />}
      </div>
    </div>
  );
}
