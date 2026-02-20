"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
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
  pending_approval: "bg-[#c4983e]",
  confirmed: "bg-[#5a9a6e]",
  reminder_sent: "bg-[#508cb4]",
  customer_confirmed: "bg-[#8278b4]",
  completed: "bg-[#5a9a6e]",
  no_show: "bg-[#c45a5a]",
  cancelled_customer: "bg-[#9c9184]",
  cancelled_admin: "bg-[#9c9184]",
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Calendar Grid */}
      <div className="lg:col-span-2 bg-card border border-border rounded-[14px] transition-shadow hover:shadow-[0_2px_12px_rgba(42,36,32,0.06)]">
        {/* Card Header */}
        <div className="px-[22px] py-[18px] border-b border-border flex items-center justify-between">
          <h3 className="font-display text-[17px] text-foreground italic">
            {format(currentMonth, "MMMM yyyy")}
          </h3>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="w-9 h-9 rounded-[10px] flex items-center justify-center text-muted-foreground hover:bg-[rgba(166,139,107,0.08)] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="w-9 h-9 rounded-[10px] flex items-center justify-center text-muted-foreground hover:bg-[rgba(166,139,107,0.08)] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Card Content */}
        <div className="px-[22px] py-[18px]">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div
                key={d}
                className="text-center text-[11px] tracking-[1px] uppercase font-medium text-[#9c9184] py-1.5"
              >
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
              const today = isToday(day);

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={cn(
                    "relative flex flex-col items-center py-2 rounded-[10px] transition-colors",
                    inMonth ? "hover:bg-[rgba(166,139,107,0.05)]" : "opacity-30",
                    isSelected && !today && "bg-[rgba(166,139,107,0.08)] ring-1 ring-primary/30",
                    today && "bg-primary text-white"
                  )}
                >
                  <span
                    className={cn(
                      "w-9 h-9 flex items-center justify-center rounded-[10px] text-[13px]",
                      today
                        ? "font-semibold text-white"
                        : "font-medium text-foreground"
                    )}
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {format(day, "d")}
                  </span>
                  {dayBookings.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                      {dayBookings.slice(0, 3).map((b) => (
                        <div
                          key={b._id}
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            today ? "bg-white/70" : statusDotColor[b.status]
                          )}
                        />
                      ))}
                      {dayBookings.length > 3 && (
                        <span
                          className={cn(
                            "text-[9px]",
                            today ? "text-white/70" : "text-[#9c9184]"
                          )}
                        >
                          +{dayBookings.length - 3}
                        </span>
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
              <span className="ml-2 text-[13px] text-muted-foreground">Loading...</span>
            </div>
          )}
        </div>
      </div>

      {/* Selected Day Detail */}
      <div className="bg-card border border-border rounded-[14px] transition-shadow hover:shadow-[0_2px_12px_rgba(42,36,32,0.06)] self-start">
        {/* Card Header */}
        <div className="px-[22px] py-[18px] border-b border-border">
          <h3 className="font-display text-[17px] text-foreground italic">
            {selectedDate
              ? format(new Date(selectedDate + "T00:00:00"), "EEEE, MMM d")
              : "Select a date"}
          </h3>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            {selectedBookings.length} appointment{selectedBookings.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Card Content */}
        <div className="px-[22px] py-[18px] space-y-2.5">
          {bookings === undefined ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="ml-2 text-[13px] text-muted-foreground">Loading...</span>
            </div>
          ) : selectedBookings.length === 0 ? (
            <p className="text-[13px] text-[#9c9184] text-center py-8">No bookings</p>
          ) : (
            selectedBookings.map((b) => (
              <div
                key={b._id}
                className="p-3.5 rounded-[10px] border border-border bg-[rgba(166,139,107,0.03)] hover:bg-[rgba(166,139,107,0.06)] transition-colors space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-foreground">
                    {b.customerName}
                  </span>
                  <BookingStatusBadge status={b.status} />
                </div>
                <p className="text-[12px] text-muted-foreground">
                  <span className="font-medium text-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {b.startTime}
                  </span>
                  <span className="text-[#9c9184] mx-1">-</span>
                  <span className="font-medium text-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {b.endTime}
                  </span>
                  <span className="text-[#9c9184] mx-1.5">&middot;</span>
                  <span>{b.serviceName}</span>
                </p>
                {b.stylistName !== "Unknown" && (
                  <p className="text-[12px] text-[#9c9184]">
                    with {b.stylistName}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
