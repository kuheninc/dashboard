"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import BookingStatusBadge from "@/components/dashboard/BookingStatusBadge";
import type { EnrichedBooking } from "@/lib/dashboard-helpers";
import type { StylistColor } from "./BookingBlock";
import { X, Check, XCircle, AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface BookingPopoverProps {
  booking: EnrichedBooking;
  stylistColor: StylistColor;
  anchorRect: DOMRect;
  onClose: () => void;
  onOpenDetail?: () => void;
}

export default function BookingPopover({
  booking,
  stylistColor,
  anchorRect,
  onClose,
  onOpenDetail,
}: BookingPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);

  const approve = useMutation(api.bookings.mutations.approve);
  const reject = useMutation(api.bookings.mutations.reject);
  const cancel = useMutation(api.bookings.mutations.cancel);
  const markCompleted = useMutation(api.bookings.mutations.markCompleted);
  const markNoShow = useMutation(api.bookings.mutations.markNoShow);
  const [conflictError, setConflictError] = useState<string | null>(null);

  // Track scroll offset so popover moves with the calendar
  const [scrollOffset, setScrollOffset] = useState({ x: 0, y: 0 });
  const initialScroll = useRef({ calX: 0, calY: 0, mainY: 0 });

  const updateScrollOffset = useCallback(() => {
    const calendarEl = document.querySelector("[data-calendar-scroll]");
    const mainEl = document.querySelector("main");
    const calX = calendarEl ? calendarEl.scrollLeft : 0;
    const calY = calendarEl ? calendarEl.scrollTop : 0;
    const mainY = mainEl ? mainEl.scrollTop : 0;
    setScrollOffset({
      x: initialScroll.current.calX - calX,
      y: (initialScroll.current.calY - calY) + (initialScroll.current.mainY - mainY),
    });
  }, []);

  // Capture initial scroll positions on mount
  useEffect(() => {
    const calendarEl = document.querySelector("[data-calendar-scroll]");
    const mainEl = document.querySelector("main");
    initialScroll.current = {
      calX: calendarEl ? calendarEl.scrollLeft : 0,
      calY: calendarEl ? calendarEl.scrollTop : 0,
      mainY: mainEl ? mainEl.scrollTop : 0,
    };
  }, []);

  // Position: prefer below-right, adjust if near edges
  const top = anchorRect.bottom + 8 + scrollOffset.y;
  const left = Math.min(anchorRect.left + scrollOffset.x, window.innerWidth - 320);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    // Update position on scroll of both the calendar and page containers
    const calendarEl = document.querySelector("[data-calendar-scroll]");
    const mainEl = document.querySelector("main");
    calendarEl?.addEventListener("scroll", updateScrollOffset);
    mainEl?.addEventListener("scroll", updateScrollOffset);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
      calendarEl?.removeEventListener("scroll", updateScrollOffset);
      mainEl?.removeEventListener("scroll", updateScrollOffset);
    };
  }, [onClose, updateScrollOffset]);

  const dateFormatted = format(
    new Date(booking.date + "T00:00:00"),
    "EEEE, MMM d, yyyy"
  );

  const isPending = booking.status === "pending";
  const isActive = booking.status === "confirmed";

  return createPortal(
    <div
      ref={ref}
      className="fixed z-[100] w-[300px] bg-card border border-border rounded-xl shadow-lg overflow-hidden cadence-animate"
      style={{ top, left }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: stylistColor.border }}
          />
          <span className="text-[14px] font-medium text-foreground truncate">
            {booking.customerName}
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:bg-muted/60 transition-colors shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 py-3 space-y-2.5">
        <div className="flex items-center gap-2">
          <BookingStatusBadge status={booking.status} />
          {booking.createdBy === "admin" && (
            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-muted/40 text-muted-foreground uppercase">
              Admin
            </span>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-[12px] text-muted-foreground">
            <span className="font-data font-medium text-foreground">
              {booking.startTime}
            </span>
            <span className="text-[#9c9184] mx-1">–</span>
            <span className="font-data font-medium text-foreground">
              {booking.endTime}
            </span>
          </p>
          <p className="text-[12px] text-muted-foreground">{dateFormatted}</p>
        </div>

        <div className="space-y-0.5">
          <p className="text-[12px] text-foreground font-medium">
            {booking.serviceName}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {booking.serviceDurationMinutes} min &middot; RM{" "}
            {booking.servicePrice}
          </p>
        </div>

        <p className="text-[11px] text-muted-foreground">
          with{" "}
          <span
            className="font-medium"
            style={{ color: stylistColor.text }}
          >
            {booking.stylistName}
          </span>
        </p>

        {onOpenDetail && (
          <button
            onClick={onOpenDetail}
            className="text-[11px] font-medium text-primary hover:underline mt-1"
          >
            View full details &rarr;
          </button>
        )}
      </div>

      {/* Conflict error */}
      {conflictError && (
        <div className="mx-4 mb-1 px-2.5 py-2 rounded-md flex items-start gap-1.5" style={{ backgroundColor: "rgba(196,90,90,0.08)" }}>
          <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: "#c45a5a" }} />
          <p className="text-[11px] text-[#c45a5a] leading-snug">{conflictError}</p>
        </div>
      )}

      {/* Actions */}
      {(isPending || isActive) && (
        <div className="px-4 py-2.5 border-t border-border flex gap-1.5 flex-wrap">
          {isPending && (
            <>
              <button
                onClick={async () => {
                  try {
                    setConflictError(null);
                    await approve({ bookingId: booking._id as Id<"bookings"> });
                    onClose();
                  } catch (err: unknown) {
                    const msg = err instanceof Error ? err.message : String(err);
                    if (msg.includes("Cannot approve")) {
                      setConflictError(msg);
                    } else {
                      setConflictError("Failed to approve booking");
                    }
                  }
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-medium bg-[rgba(90,154,110,0.1)] text-[#5a9a6e] hover:bg-[rgba(90,154,110,0.18)] transition-colors"
              >
                <Check className="w-3 h-3" />
                Approve
              </button>
              <button
                onClick={() => {
                  reject({
                    bookingId: booking._id as Id<"bookings">,
                  });
                  onClose();
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-medium bg-[rgba(196,90,90,0.08)] text-[#c45a5a] hover:bg-[rgba(196,90,90,0.15)] transition-colors"
              >
                <XCircle className="w-3 h-3" />
                Decline
              </button>
            </>
          )}
          {isActive && (
            <>
              <button
                onClick={() => {
                  markCompleted({
                    bookingId: booking._id as Id<"bookings">,
                  });
                  onClose();
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-medium bg-[rgba(90,154,110,0.1)] text-[#5a9a6e] hover:bg-[rgba(90,154,110,0.18)] transition-colors"
              >
                <CheckCircle2 className="w-3 h-3" />
                Complete
              </button>
              <button
                onClick={() => {
                  markNoShow({
                    bookingId: booking._id as Id<"bookings">,
                  });
                  onClose();
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-medium bg-[rgba(196,152,62,0.08)] text-[#c4983e] hover:bg-[rgba(196,152,62,0.15)] transition-colors"
              >
                <AlertTriangle className="w-3 h-3" />
                No-Show
              </button>
              <button
                onClick={() => {
                  cancel({
                    bookingId: booking._id as Id<"bookings">,
                    cancelledBy: "admin",
                  });
                  onClose();
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-medium bg-[rgba(196,90,90,0.08)] text-[#c45a5a] hover:bg-[rgba(196,90,90,0.15)] transition-colors"
              >
                <XCircle className="w-3 h-3" />
                Cancel
              </button>
            </>
          )}
        </div>
      )}
    </div>,
    document.body
  );
}
