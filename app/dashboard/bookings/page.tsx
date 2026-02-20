"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PendingApprovals from "@/components/dashboard/bookings/PendingApprovals";
import BookingTable from "@/components/dashboard/bookings/BookingTable";
import CalendarView from "@/components/dashboard/bookings/CalendarView";
import StatCard from "@/components/dashboard/StatCard";
import { CalendarDays, Clock, CheckCircle2, XCircle } from "lucide-react";

export default function BookingsPage() {
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
        <StatCard label="Today" value="7" icon={CalendarDays} iconColor="text-primary" />
        <StatCard label="Pending Approval" value="3" icon={Clock} iconColor="text-amber-600" />
        <StatCard label="This Week" value="18" icon={CheckCircle2} iconColor="text-emerald-600" />
        <StatCard label="Cancelled (Month)" value="2" icon={XCircle} iconColor="text-red-500" />
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
