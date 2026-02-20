"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import BookingStatusBadge from "@/components/dashboard/BookingStatusBadge";
import { useDashboard } from "@/lib/dashboard-context";
import { enrichBookings, type EnrichedBooking } from "@/lib/dashboard-helpers";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";

const statusDotColor: Record<string, string> = {
  pending_approval: "bg-amber-400",
  confirmed: "bg-blue-400",
  reminder_sent: "bg-sky-400",
  customer_confirmed: "bg-indigo-400",
  completed: "bg-emerald-400",
  no_show: "bg-red-400",
  cancelled_customer: "bg-gray-300",
  cancelled_admin: "bg-gray-300",
};

function getMonthRange(month: Date): { startDate: string; endDate: string } {
  const calStart = startOfWeek(startOfMonth(month));
  const calEnd = endOfWeek(endOfMonth(month));
  return {
    startDate: format(calStart, "yyyy-MM-dd"),
    endDate: format(calEnd, "yyyy-MM-dd"),
  };
}

export default function CalendarView() {
  const { salonId, customers, services, stylists } = useDashboard();
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(() =>
    new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kuala_Lumpur" })
  );

  const { startDate, endDate } = useMemo(
    () => getMonthRange(currentMonth),
    [currentMonth]
  );

  const bookings = useQuery(api.bookings.queries.getByDateRange, {
    salonId,
    startDate,
    endDate,
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const enriched = useMemo(() => {
    if (!bookings) return [];
    return enrichBookings(bookings, customers, services, stylists);
  }, [bookings, customers, services, stylists]);

  // Group bookings by date for quick lookup
  const bookingsByDate = useMemo(() => {
    const map = new Map<string, EnrichedBooking[]>();
    for (const b of enriched) {
      const existing = map.get(b.date);
      if (existing) {
        existing.push(b);
      } else {
        map.set(b.date, [b]);
      }
    }
    return map;
  }, [enriched]);

  const selectedBookings = useMemo(() => {
    if (!selectedDate) return [];
    return (bookingsByDate.get(selectedDate) ?? []).sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );
  }, [selectedDate, bookingsByDate]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Calendar Grid */}
      <Card className="lg:col-span-2 shadow-sm border-border/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              {format(currentMonth, "MMMM yyyy")}
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-center text-[11px] font-medium text-muted-foreground py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-0.5">
            {days.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const dayBookings = bookingsByDate.get(dateStr) ?? [];
              const isSelected = selectedDate === dateStr;
              const inMonth = isSameMonth(day, currentMonth);

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={cn(
                    "relative h-16 p-1 rounded-lg text-left transition-colors",
                    inMonth ? "hover:bg-muted/50" : "opacity-30",
                    isSelected && "bg-primary/5 ring-1 ring-primary/30",
                    isToday(day) && "bg-primary/5"
                  )}
                >
                  <span
                    className={cn(
                      "text-xs font-medium",
                      isToday(day) ? "text-primary font-bold" : "text-foreground"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  {dayBookings.length > 0 && (
                    <div className="flex flex-wrap gap-0.5 mt-1">
                      {dayBookings.slice(0, 3).map((b) => (
                        <div
                          key={b._id}
                          className={cn("w-1.5 h-1.5 rounded-full", statusDotColor[b.status])}
                        />
                      ))}
                      {dayBookings.length > 3 && (
                        <span className="text-[9px] text-muted-foreground">+{dayBookings.length - 3}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Loading indicator */}
          {bookings === undefined && (
            <div className="flex items-center justify-center py-4">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Day Detail */}
      <Card className="shadow-sm border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            {selectedDate ? format(new Date(selectedDate + "T00:00:00"), "EEEE, MMM d") : "Select a date"}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {selectedBookings.length} appointment{selectedBookings.length !== 1 ? "s" : ""}
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {bookings === undefined ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
            </div>
          ) : selectedBookings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No bookings</p>
          ) : (
            selectedBookings.map((b) => (
              <div key={b._id} className="p-2.5 rounded-lg bg-muted/30 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{b.customerName}</span>
                  <BookingStatusBadge status={b.status} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {b.startTime} - {b.endTime} &middot; {b.serviceName}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
