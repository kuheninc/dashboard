"use client";

import StatCard from "@/components/dashboard/StatCard";
import BookingTrendChart from "@/components/dashboard/charts/BookingTrendChart";
import ServicePopularityChart from "@/components/dashboard/charts/ServicePopularityChart";
import TodaySchedule from "@/components/dashboard/bookings/TodaySchedule";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import PendingApprovals from "@/components/dashboard/bookings/PendingApprovals";
import { CalendarDays, DollarSign, UserPlus, AlertTriangle } from "lucide-react";

export default function DashboardOverview() {
  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Page title */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Welcome back. Here&apos;s what&apos;s happening at Glow Studio today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's Bookings"
          value="7"
          trend={{ value: "+8%", positive: true }}
          icon={CalendarDays}
          iconColor="text-primary"
        />
        <StatCard
          label="Revenue (This Month)"
          value="RM 8,450"
          trend={{ value: "+12%", positive: true }}
          icon={DollarSign}
          iconColor="text-emerald-600"
        />
        <StatCard
          label="New Customers"
          value="23"
          trend={{ value: "+5%", positive: true }}
          icon={UserPlus}
          iconColor="text-violet-600"
        />
        <StatCard
          label="No-Show Rate"
          value="4.2%"
          trend={{ value: "-2%", positive: true }}
          icon={AlertTriangle}
          iconColor="text-amber-600"
        />
      </div>

      {/* Pending approvals */}
      <PendingApprovals />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <BookingTrendChart />
        </div>
        <div className="lg:col-span-2">
          <ServicePopularityChart />
        </div>
      </div>

      {/* Schedule + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TodaySchedule />
        <ActivityFeed />
      </div>
    </div>
  );
}
