"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import BookingStatusBadge from "@/components/dashboard/BookingStatusBadge";
import { useDashboard } from "@/lib/dashboard-context";
import { enrichBookings, getTodayDateStr } from "@/lib/dashboard-helpers";
import { Clock, Check, X } from "lucide-react";

const TERMINAL_STATUSES = ["completed", "no_show", "cancelled_customer", "cancelled_admin"];

export default function TodaySchedule() {
  const { salonId, customers, services, stylists } = useDashboard();
  const todayDate = getTodayDateStr();
  const bookings = useQuery(api.bookings.queries.getByDate, { salonId, date: todayDate });

  const markCompleted = useMutation(api.bookings.mutations.markCompleted);
  const cancelBooking = useMutation(api.bookings.mutations.cancel);

  if (bookings === undefined) {
    return (
      <div className="bg-card border border-border rounded-xl">
        <div className="px-5 py-4 border-b border-border">
          <div className="font-display text-[17px] text-foreground">Today&apos;s Schedule</div>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="ml-2 text-[13px] text-[#9c9184]">Loading...</span>
        </div>
      </div>
    );
  }

  const enriched = enrichBookings(bookings, customers, services, stylists)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="bg-card border border-border rounded-xl">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="font-display text-[17px] text-foreground">Today&apos;s Schedule</div>
        <span className="text-[12px] text-[#9c9184]">{enriched.length} appointments</span>
      </div>
      <div className="px-5 py-4 space-y-2.5">
        {enriched.length === 0 ? (
          <p className="text-[13px] text-[#9c9184] text-center py-6">No appointments today</p>
        ) : (
          enriched.map((booking) => {
            const isTerminal = TERMINAL_STATUSES.includes(booking.status);
            return (
              <div
                key={booking._id}
                className="group flex items-center gap-3.5 p-3 rounded-lg bg-[rgba(166,139,107,0.05)] hover:bg-[rgba(166,139,107,0.08)] transition-colors"
              >
                <div className="flex items-center gap-1.5 text-[#9c9184] min-w-[70px]">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-[13px] font-medium text-foreground font-data">{booking.startTime}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-foreground truncate">
                    {booking.customerName}
                  </p>
                  <p className="text-[12px] text-[#9c9184] truncate">
                    {booking.serviceName} &middot; {booking.stylistName}
                  </p>
                </div>
                {!isTerminal && (
                  <div className="hidden group-hover:flex items-center gap-1">
                    <button
                      onClick={() => markCompleted({ bookingId: booking._id as Id<"bookings"> })}
                      className="p-1.5 rounded-md transition-colors"
                      style={{ color: "#5a9a6e" }}
                      title="Mark completed"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => cancelBooking({ bookingId: booking._id as Id<"bookings">, cancelledBy: "cancelled_admin" })}
                      className="p-1.5 rounded-md transition-colors"
                      style={{ color: "#c45a5a" }}
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                <BookingStatusBadge status={booking.status} />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
