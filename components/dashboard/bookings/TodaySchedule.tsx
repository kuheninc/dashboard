"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import BookingStatusBadge from "@/components/dashboard/BookingStatusBadge";
import { useDashboard } from "@/lib/dashboard-context";
import { enrichBookings, getTodayDateStr } from "@/lib/dashboard-helpers";
import { Clock, MoreVertical, Check, X, CalendarOff } from "lucide-react";

const TERMINAL_STATUSES = ["completed", "no_show", "cancelled", "rejected"];

/** Show full first name + last initial to avoid aggressive truncation */
function compactName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return name;
  return `${parts[0]} ${parts.slice(1).map((p) => p[0] + ".").join(" ")}`;
}

function ScheduleActions({ bookingId }: { bookingId: Id<"bookings"> }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const markCompleted = useMutation(api.bookings.mutations.markCompleted);
  const cancelBooking = useMutation(api.bookings.mutations.cancel);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen(!open)}
        className="p-1 rounded-md hover:bg-[rgba(166,139,107,0.1)] transition-colors"
      >
        <MoreVertical className="w-3.5 h-3.5 text-[#9c9184]" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-20 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[150px]">
          <button
            onClick={() => { markCompleted({ bookingId }); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-[12px] font-medium hover:bg-[rgba(166,139,107,0.06)] transition-colors"
            style={{ color: "#5a9a6e" }}
          >
            <Check className="w-3.5 h-3.5" />
            Mark Completed
          </button>
          <button
            onClick={() => { cancelBooking({ bookingId, cancelledBy: "admin" }); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-[12px] font-medium hover:bg-[rgba(166,139,107,0.06)] transition-colors"
            style={{ color: "#c45a5a" }}
          >
            <X className="w-3.5 h-3.5" />
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

export default function TodaySchedule() {
  const { salonId, customers, services, stylists } = useDashboard();
  const todayDate = getTodayDateStr();
  const bookings = useQuery(api.bookings.queries.getByDate, { salonId, date: todayDate });

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
          <div className="text-center py-8">
            <CalendarOff className="w-8 h-8 text-[#9c9184] mx-auto mb-2 opacity-40" />
            <p className="text-[13px] text-[#9c9184]">No appointments today</p>
            <p className="text-[11px] text-[#9c9184] mt-0.5 opacity-60">Create one with the + New Booking button</p>
          </div>
        ) : (
          enriched.map((booking) => {
            const isTerminal = TERMINAL_STATUSES.includes(booking.status);
            return (
              <div
                key={booking._id}
                className="flex items-center gap-3 p-3 rounded-lg bg-[rgba(166,139,107,0.05)] hover:bg-[rgba(166,139,107,0.08)] transition-colors"
              >
                <div className="flex items-center gap-1.5 text-[#9c9184] flex-shrink-0 w-[62px]">
                  <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="text-[13px] font-medium text-foreground font-data">{booking.startTime}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-foreground truncate" title={booking.customerName}>
                    {compactName(booking.customerName)}
                  </p>
                  <p className="text-[11px] text-[#9c9184] truncate" title={`${booking.serviceName} · ${booking.stylistName}`}>
                    {booking.serviceName} &middot; {booking.stylistName}
                  </p>
                </div>
                <BookingStatusBadge status={booking.status} />
                {!isTerminal && <ScheduleActions bookingId={booking._id as Id<"bookings">} />}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
