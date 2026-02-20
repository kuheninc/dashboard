"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useDashboard } from "@/lib/dashboard-context";
import { getTodayDateStr, getDateRangeStr } from "@/lib/dashboard-helpers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PendingApprovals from "@/components/dashboard/bookings/PendingApprovals";
import BookingTable from "@/components/dashboard/bookings/BookingTable";
import CalendarView from "@/components/dashboard/bookings/CalendarView";
import StatCard from "@/components/dashboard/StatCard";
import { CalendarDays, Clock, CheckCircle2, XCircle } from "lucide-react";

export default function BookingsPage() {
  const { salonId } = useDashboard();
  const today = getTodayDateStr();
  const { startDate: monthStart, endDate: monthEnd } = useMemo(() => getDateRangeStr(30), []);

  // Compute this week range
  const { startDate: weekStart, endDate: weekEnd } = useMemo(() => getDateRangeStr(7), []);

  const todayBookings = useQuery(api.bookings.queries.getByDate, { salonId, date: today });
  const pendingBookings = useQuery(api.bookings.queries.getPendingApproval, { salonId });
  const weekBookings = useQuery(api.bookings.queries.getByDateRange, { salonId, startDate: weekStart, endDate: weekEnd });
  const monthBookings = useQuery(api.bookings.queries.getByDateRange, { salonId, startDate: monthStart, endDate: monthEnd });

  const cancelledCount = useMemo(() => {
    if (!monthBookings) return 0;
    return monthBookings.filter(
      (b) => b.status === "cancelled_customer" || b.status === "cancelled_admin"
    ).length;
  }, [monthBookings]);

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-xl font-bold text-foreground">Bookings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage appointments, approvals, and scheduling.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today"
          value={todayBookings ? String(todayBookings.length) : "—"}
          icon={CalendarDays}
          iconColor="text-primary"
        />
        <StatCard
          label="Pending Approval"
          value={pendingBookings ? String(pendingBookings.length) : "—"}
          icon={Clock}
          iconColor="text-amber-600"
        />
        <StatCard
          label="This Week"
          value={weekBookings ? String(weekBookings.length) : "—"}
          icon={CheckCircle2}
          iconColor="text-emerald-600"
        />
        <StatCard
          label="Cancelled (Month)"
          value={monthBookings ? String(cancelledCount) : "—"}
          icon={XCircle}
          iconColor="text-red-500"
        />
      </div>

      {/* Pending approvals */}
      <PendingApprovals />

      {/* Tabs: List vs Calendar */}
      <Tabs defaultValue="list">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="list" className="text-xs">List View</TabsTrigger>
          <TabsTrigger value="calendar" className="text-xs">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          <BookingTable />
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <CalendarView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
