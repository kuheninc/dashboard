"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { Doc } from "@/convex/_generated/dataModel";
import type { EnrichedBooking } from "@/lib/dashboard-helpers";
import BookingStatusBadge from "@/components/dashboard/BookingStatusBadge";
import { X, AlertTriangle, ArrowRight } from "lucide-react";
import { format } from "date-fns";

interface RescheduleConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  booking: EnrichedBooking;
  newDate: string;
  newStartTime: string;
  newEndTime: string;
  stylists: Doc<"stylists">[];
  salon: Doc<"salons">;
  salonId: Id<"salons">;
}

export default function RescheduleConfirmDialog({
  isOpen,
  onClose,
  booking,
  newDate,
  newStartTime,
  newEndTime,
  stylists,
  salon,
  salonId,
}: RescheduleConfirmDialogProps) {
  const [selectedStylistId, setSelectedStylistId] = useState<string>(
    booking.stylistId
  );
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reschedule = useMutation(api.bookings.mutations.reschedule);

  // Check conflicts for the new time/stylist
  const conflicts = useQuery(
    api.bookings.queries.checkConflicts,
    isOpen
      ? {
          salonId,
          stylistId: selectedStylistId as Id<"stylists">,
          date: newDate,
          startTime: newStartTime,
          endTime: newEndTime,
          excludeBookingId: booking._id as Id<"bookings">,
        }
      : "skip"
  );

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedStylistId(booking.stylistId);
      setReason("");
      setSubmitting(false);
    }
  }, [isOpen, booking.stylistId]);

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatDateLabel = (dateStr: string) =>
    format(new Date(dateStr + "T00:00:00"), "EEE, MMM d, yyyy");

  const dateChanged = newDate !== booking.date;
  const timeChanged =
    newStartTime !== booking.startTime || newEndTime !== booking.endTime;
  const stylistChanged = selectedStylistId !== booking.stylistId;
  const durationChanged = newEndTime !== booking.endTime && newStartTime === booking.startTime;

  const selectedStylist = stylists.find((s) => s._id === selectedStylistId);

  // Check if outside salon hours
  const dayOfWeek = new Date(newDate + "T00:00:00").getDay();
  const dayHours = salon.openingHours.find((h) => h.day === dayOfWeek);
  const outsideHours =
    !dayHours ||
    dayHours.isClosed ||
    newStartTime < dayHours.open ||
    newEndTime > dayHours.close;

  const isPending = booking.status === "pending_approval";

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await reschedule({
        bookingId: booking._id as Id<"bookings">,
        newDate,
        newStartTime,
        newEndTime,
        newStylistId: stylistChanged
          ? (selectedStylistId as Id<"stylists">)
          : undefined,
        reason: reason.trim() || undefined,
      });
      onClose();
    } catch (err) {
      console.error("Reschedule failed:", err);
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-card border border-border rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden cadence-animate">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-display text-[17px] text-foreground">
            Confirm Reschedule
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-[rgba(166,139,107,0.08)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Customer + service info */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[14px] font-medium text-foreground">
                {booking.customerName}
              </p>
              <p className="text-[12px] text-muted-foreground">
                {booking.serviceName} &middot; RM {booking.servicePrice}
              </p>
            </div>
            <BookingStatusBadge status={booking.status} />
          </div>

          {/* Before → After comparison */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-start">
            {/* Before */}
            <div className="p-3 rounded-lg border border-border bg-muted/20">
              <p className="text-[10px] font-label text-muted-foreground mb-2 uppercase tracking-wider">
                Current
              </p>
              <p className="text-[12px] text-foreground font-data">
                {formatDateLabel(booking.date)}
              </p>
              <p className="text-[13px] text-foreground font-data font-medium">
                {booking.startTime} – {booking.endTime}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                {booking.stylistName}
              </p>
            </div>

            {/* Arrow */}
            <div className="flex items-center justify-center pt-8">
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>

            {/* After */}
            <div className="p-3 rounded-lg border border-border bg-[rgba(90,154,110,0.04)]">
              <p className="text-[10px] font-label text-muted-foreground mb-2 uppercase tracking-wider">
                New
              </p>
              <p
                className={`text-[12px] font-data ${
                  dateChanged
                    ? "text-[#5a9a6e] font-medium"
                    : "text-foreground"
                }`}
              >
                {formatDateLabel(newDate)}
              </p>
              <p
                className={`text-[13px] font-data font-medium ${
                  timeChanged ? "text-[#5a9a6e]" : "text-foreground"
                }`}
              >
                {newStartTime} – {newEndTime}
              </p>
              <p
                className={`text-[11px] mt-1 ${
                  stylistChanged
                    ? "text-[#5a9a6e] font-medium"
                    : "text-muted-foreground"
                }`}
              >
                {selectedStylist?.name ?? booking.stylistName}
              </p>
            </div>
          </div>

          {/* Duration change note */}
          {durationChanged && (
            <p className="text-[11px] text-[#508cb4]">
              Duration changed from{" "}
              {booking.serviceDurationMinutes} min to{" "}
              {(() => {
                const [sh, sm] = newStartTime.split(":").map(Number);
                const [eh, em] = newEndTime.split(":").map(Number);
                return (eh * 60 + em) - (sh * 60 + sm);
              })()}{" "}
              min
            </p>
          )}

          {/* Stylist reassignment */}
          <div>
            <label className="text-[11px] font-label text-muted-foreground uppercase tracking-wider block mb-1.5">
              Stylist
            </label>
            <select
              value={selectedStylistId}
              onChange={(e) => setSelectedStylistId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
            >
              {stylists
                .filter((s) => s.isActive)
                .map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Reason */}
          <div>
            <label className="text-[11px] font-label text-muted-foreground uppercase tracking-wider block mb-1.5">
              Reason (optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Stylist unavailable, salon event..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-[13px] text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
          </div>

          {/* Warnings */}
          {conflicts && conflicts.length > 0 && (
            <div className="p-3 rounded-lg bg-[rgba(196,152,62,0.08)] border border-[rgba(196,152,62,0.2)]">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-[#c4983e]" />
                <p className="text-[12px] text-[#c4983e] font-medium">
                  {conflicts.length} conflicting booking
                  {conflicts.length > 1 ? "s" : ""} for{" "}
                  {selectedStylist?.name ?? "this stylist"}
                </p>
              </div>
            </div>
          )}

          {outsideHours && (
            <div className="p-3 rounded-lg bg-[rgba(196,152,62,0.08)] border border-[rgba(196,152,62,0.2)]">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-[#c4983e]" />
                <p className="text-[12px] text-[#c4983e] font-medium">
                  {dayHours?.isClosed
                    ? "Salon is closed on this day"
                    : `Outside salon hours (${dayHours?.open} – ${dayHours?.close})`}
                </p>
              </div>
            </div>
          )}

          {/* Info message */}
          <p className="text-[11px] text-muted-foreground">
            {isPending
              ? "This booking will be moved. The customer will be informed through the normal approval flow."
              : "The customer will receive a WhatsApp message asking them to confirm the new time."}
          </p>
        </div>

        {/* Actions */}
        <div className="px-5 py-3 border-t border-border flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-[12px] font-medium text-muted-foreground hover:bg-muted/40 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="px-4 py-2 rounded-lg text-[12px] font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? "Rescheduling..." : "Confirm Reschedule"}
          </button>
        </div>
      </div>
    </div>
  );
}
