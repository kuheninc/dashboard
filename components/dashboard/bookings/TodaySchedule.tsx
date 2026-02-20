"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BookingStatusBadge from "@/components/dashboard/BookingStatusBadge";
import { useDashboard } from "@/lib/dashboard-context";
import { enrichBookings, getTodayDateStr } from "@/lib/dashboard-helpers";
import { Clock } from "lucide-react";

export default function TodaySchedule() {
  const { salonId, customers, services, stylists } = useDashboard();
  const todayDate = getTodayDateStr();
  const bookings = useQuery(api.bookings.queries.getByDate, { salonId, date: todayDate });

  if (bookings === undefined) {
    return (
      <Card className="shadow-sm border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Today&apos;s Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const enriched = enrichBookings(bookings, customers, services, stylists)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <Card className="shadow-sm border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Today&apos;s Schedule</CardTitle>
          <span className="text-xs text-muted-foreground">{enriched.length} appointments</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {enriched.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No appointments today</p>
        ) : (
          enriched.map((booking) => (
            <div
              key={booking._id}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-1.5 text-muted-foreground min-w-[70px]">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-sm font-medium">{booking.startTime}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {booking.customerName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {booking.serviceName} &middot; {booking.stylistName}
                </p>
              </div>
              <BookingStatusBadge status={booking.status} />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
