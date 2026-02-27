"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useDashboard } from "@/lib/dashboard-context";
import { enrichBookings, type EnrichedBooking } from "@/lib/dashboard-helpers";
import BookingStatusBadge from "@/components/dashboard/BookingStatusBadge";
import {
  X,
  Check,
  XCircle,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Phone,
  Clock,
  Calendar,
  User,
  Scissors,
  MessageSquare,
} from "lucide-react";
import { format } from "date-fns";

interface BookingDetailPanelProps {
  booking: EnrichedBooking;
  onClose: () => void;
}

export default function BookingDetailPanel({
  booking,
  onClose,
}: BookingDetailPanelProps) {
  const { salon, customers, services, stylists } = useDashboard();
  const [conflictError, setConflictError] = useState<string | null>(null);

  const approve = useMutation(api.bookings.mutations.approve);
  const reject = useMutation(api.bookings.mutations.reject);
  const cancel = useMutation(api.bookings.mutations.cancel);
  const markCompleted = useMutation(api.bookings.mutations.markCompleted);
  const markNoShow = useMutation(api.bookings.mutations.markNoShow);

  // Customer's full booking history
  const customerBookings = useQuery(api.bookings.queries.getByCustomer, {
    customerId: booking.customerId as Id<"customers">,
  });

  const customer = customers.find((c) => c._id === booking.customerId);

  const customerHistory = customerBookings
    ? enrichBookings(customerBookings, customers, services, stylists)
        .filter((b) => b._id !== booking._id)
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 5)
    : [];

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const dateFormatted = format(
    new Date(booking.date + "T00:00:00"),
    "EEEE, MMM d, yyyy"
  );

  const isPending = booking.status === "pending";
  const isActive = booking.status === "confirmed";

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-[90]"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-card border-l border-border z-[100] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between flex-shrink-0">
          <h2 className="font-display text-[17px] text-foreground">
            Booking Details
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {/* Status + meta */}
          <div className="flex items-center gap-2.5">
            <BookingStatusBadge status={booking.status} />
            {booking.createdBy === "admin" && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-muted/40 text-muted-foreground uppercase">
                Created by Admin
              </span>
            )}
          </div>

          {/* Customer */}
          <div className="space-y-2.5">
            <p className="font-label text-[#9c9184]">Customer</p>
            <div className="p-3.5 bg-background rounded-xl border border-border space-y-2">
              <div className="flex items-center gap-2.5">
                <User className="w-3.5 h-3.5 text-[#9c9184]" />
                <span className="text-[14px] font-medium text-foreground">
                  {booking.customerName}
                </span>
              </div>
              {customer?.phone && (
                <div className="flex items-center gap-2.5">
                  <Phone className="w-3.5 h-3.5 text-[#9c9184]" />
                  <span className="text-[13px] text-muted-foreground font-mono">
                    +{customer.phone}
                  </span>
                  <a
                    href={`https://wa.me/${customer.phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto flex items-center gap-1 text-[11px] font-medium text-[#5a9a6e] hover:underline"
                  >
                    <MessageSquare className="w-3 h-3" />
                    WhatsApp
                  </a>
                </div>
              )}
              {customer && (
                <div className="flex items-center gap-3 mt-1 pt-2 border-t border-border">
                  <span className="text-[11px] text-muted-foreground">
                    {customer.totalBookings} bookings
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    &middot;
                  </span>
                  {customer.noShowCount > 0 ? (
                    <span className="text-[11px] text-[#c45a5a] font-medium">
                      {customer.noShowCount} no-shows
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#5a9a6e]">
                      No missed appointments
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Appointment */}
          <div className="space-y-2.5">
            <p className="font-label text-[#9c9184]">Appointment</p>
            <div className="p-3.5 bg-background rounded-xl border border-border space-y-2.5">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-3.5 h-3.5 text-[#9c9184]" />
                <span className="text-[13px] text-foreground">
                  {dateFormatted}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-3.5 h-3.5 text-[#9c9184]" />
                <span className="text-[13px] text-foreground font-data">
                  {booking.startTime} - {booking.endTime}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  ({booking.serviceDurationMinutes} min)
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Scissors className="w-3.5 h-3.5 text-[#9c9184]" />
                <span className="text-[13px] text-foreground">
                  {booking.serviceName}
                </span>
                <span className="text-[13px] text-muted-foreground font-data ml-auto">
                  RM {booking.servicePrice}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <User className="w-3.5 h-3.5 text-[#9c9184]" />
                <span className="text-[13px] text-foreground">
                  {booking.stylistName}
                </span>
              </div>
              {booking.preferredStylistName && (
                <p className="text-[12px] text-[#c4983e] mt-1">
                  Customer requested: {booking.preferredStylistName}
                </p>
              )}
            </div>
          </div>

          {/* Customer History */}
          <div className="space-y-2.5">
            <p className="font-label text-[#9c9184]">Customer History</p>
            {customerBookings === undefined ? (
              <p className="text-[13px] text-muted-foreground py-3">
                Loading...
              </p>
            ) : customerHistory.length === 0 ? (
              <p className="text-[13px] text-muted-foreground py-3">
                First booking for this customer
              </p>
            ) : (
              <div className="space-y-1.5">
                {customerHistory.map((b) => (
                  <div
                    key={b._id}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-background border border-border"
                  >
                    <div>
                      <p className="text-[12px] font-medium text-foreground">
                        {b.serviceName}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        <span className="font-data">{b.date}</span> &middot;{" "}
                        {b.stylistName}
                      </p>
                    </div>
                    <BookingStatusBadge status={b.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Conflict error */}
        {conflictError && (
          <div className="mx-5 mb-2 px-3 py-2 rounded-lg flex items-start gap-2 bg-[rgba(196,90,90,0.08)] border border-[rgba(196,90,90,0.15)]">
            <AlertCircle
              className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-[#c45a5a]"
            />
            <p className="text-[12px] text-[#c45a5a]">{conflictError}</p>
          </div>
        )}

        {/* Actions */}
        {(isPending || isActive) && (
          <div className="px-5 py-4 border-t border-border flex-shrink-0">
            <div className="flex gap-2">
              {isPending && (
                <>
                  <button
                    onClick={async () => {
                      try {
                        setConflictError(null);
                        await approve({
                          bookingId: booking._id as Id<"bookings">,
                          adminPhone: salon.adminPhones[0],
                        });
                        onClose();
                      } catch (err: unknown) {
                        const msg =
                          err instanceof Error ? err.message : String(err);
                        setConflictError(
                          msg.includes("Cannot approve")
                            ? msg
                            : "Failed to approve booking"
                        );
                      }
                    }}
                    className="flex-1 h-9 text-[13px] font-medium rounded-lg inline-flex items-center justify-center gap-1.5 transition-colors bg-[#5a9a6e] text-white hover:bg-[#4e8a60]"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      reject({ bookingId: booking._id as Id<"bookings"> });
                      onClose();
                    }}
                    className="flex-1 h-9 text-[13px] font-medium rounded-lg inline-flex items-center justify-center gap-1.5 border border-[rgba(196,90,90,0.2)] text-[#c45a5a] hover:bg-[rgba(196,90,90,0.05)] transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
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
                    className="flex-1 h-9 text-[13px] font-medium rounded-lg inline-flex items-center justify-center gap-1.5 bg-[#5a9a6e] text-white hover:bg-[#4e8a60] transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Complete
                  </button>
                  <button
                    onClick={() => {
                      markNoShow({
                        bookingId: booking._id as Id<"bookings">,
                      });
                      onClose();
                    }}
                    className="h-9 px-3 text-[13px] font-medium rounded-lg inline-flex items-center gap-1.5 bg-[rgba(196,152,62,0.1)] text-[#c4983e] hover:bg-[rgba(196,152,62,0.18)] transition-colors"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
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
                    className="h-9 px-3 text-[13px] font-medium rounded-lg inline-flex items-center gap-1.5 border border-[rgba(196,90,90,0.2)] text-[#c45a5a] hover:bg-[rgba(196,90,90,0.05)] transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>,
    document.body
  );
}
