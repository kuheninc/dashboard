"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BookingStatusBadge from "@/components/dashboard/BookingStatusBadge";
import { mockBookings, getCustomerName, getServiceName, getStylistName } from "@/lib/mock-data";
import { Clock } from "lucide-react";

export default function TodaySchedule() {
  const todayBookings = mockBookings
    .filter((b) => b.date === "2026-02-20")
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <Card className="shadow-sm border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Today&apos;s Schedule</CardTitle>
          <span className="text-xs text-muted-foreground">{todayBookings.length} appointments</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {todayBookings.map((booking) => (
          <div
            key={booking.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-1.5 text-muted-foreground min-w-[70px]">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-sm font-medium">{booking.startTime}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {getCustomerName(booking.customerId)}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {getServiceName(booking.serviceId)} &middot; {getStylistName(booking.stylistId)}
              </p>
            </div>
            <BookingStatusBadge status={booking.status} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
