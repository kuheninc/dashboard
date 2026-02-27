"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Check, X, Clock, CheckCheck, Loader2 } from "lucide-react";
import { useDashboard } from "@/lib/dashboard-context";
import { enrichBookings, type EnrichedBooking } from "@/lib/dashboard-helpers";
import type { Id } from "@/convex/_generated/dataModel";

interface PendingApprovalsProps {
  onViewDetails?: (booking: EnrichedBooking) => void;
}

export default function PendingApprovals({ onViewDetails }: PendingApprovalsProps) {
  const { salonId, salon, customers, services, stylists } = useDashboard();
  const approve = useMutation(api.bookings.mutations.approve);
  const reject = useMutation(api.bookings.mutations.reject);
  const bookings = useQuery(api.bookings.queries.getPendingApproval, { salonId });
  const [error, setError] = useState<string | null>(null);
  const [bulkApproving, setBulkApproving] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Still loading
  if (bookings === undefined) return null;

  const enriched = enrichBookings(bookings, customers, services, stylists);

  if (enriched.length === 0) return null;

  const handleApprove = async (bookingId: Id<"bookings">) => {
    try {
      setError(null);
      setLoadingId(bookingId);
      await approve({ bookingId, adminPhone: salon.adminPhones[0] });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg.includes("Cannot approve") ? msg : "Failed to approve booking");
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoadingId(null);
    }
  };

  const handleBulkApprove = async () => {
    setBulkApproving(true);
    setError(null);
    for (const booking of enriched) {
      try {
        await approve({
          bookingId: booking._id as Id<"bookings">,
          adminPhone: salon.adminPhones[0],
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg.includes("Cannot approve") ? msg : `Failed to approve ${booking.customerName}'s booking`);
        break;
      }
    }
    setBulkApproving(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5">
        <h3 className="font-display text-[17px] text-foreground">
          Pending Approval
        </h3>
        <span
          className="text-[11px] font-medium px-2.5 py-1 rounded-full"
          style={{
            color: "#c4983e",
            backgroundColor: "rgba(196,152,62,0.08)",
          }}
        >
          {enriched.length}
        </span>
        {enriched.length >= 2 && (
          <button
            onClick={handleBulkApprove}
            disabled={bulkApproving}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-[#5a9a6e] text-white hover:bg-[#4e8a60] disabled:opacity-50 transition-colors"
          >
            {bulkApproving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCheck className="w-3.5 h-3.5" />
            )}
            {bulkApproving ? "Approving..." : "Approve All"}
          </button>
        )}
      </div>

      {error && (
        <div className="px-3 py-2 rounded-lg text-[12px] font-medium" style={{ color: "#c45a5a", backgroundColor: "rgba(196,90,90,0.08)", border: "1px solid rgba(196,90,90,0.15)" }}>
          {error}
        </div>
      )}

      <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        {enriched.map((booking) => (
          <div
            key={booking._id}
            className="bg-card border border-border rounded-xl min-w-[240px] sm:min-w-[270px] flex-shrink-0 transition-shadow card-glow cursor-pointer"
            style={{
              borderColor: "rgba(196,152,62,0.18)",
              background:
                "linear-gradient(to bottom, rgba(196,152,62,0.03), transparent)",
            }}
            onClick={() => onViewDetails?.(booking)}
          >
            <div className="p-4 sm:p-[18px]">
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0 flex-1 mr-2">
                  <p className="text-[13px] font-medium text-foreground truncate">
                    {booking.customerName}
                  </p>
                  <p className="text-[12px] text-muted-foreground mt-0.5 truncate">
                    {booking.serviceName}
                  </p>
                </div>
                <div
                  className="p-1.5 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: "rgba(196,152,62,0.08)" }}
                >
                  <Clock className="w-3.5 h-3.5" style={{ color: "#c4983e" }} />
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground mb-2">
                <span>{booking.date}</span>
                <span className="text-[#9c9184]">&middot;</span>
                <span className="font-data">
                  {booking.startTime} - {booking.endTime}
                </span>
              </div>

              <p className="text-[12px] text-[#9c9184] mb-1">
                Stylist: {booking.stylistName}
              </p>
              {booking.preferredStylistName && (
                <p className="text-[12px] text-[#c4983e] mb-3">
                  Requested: {booking.preferredStylistName}
                </p>
              )}
              {!booking.preferredStylistName && <div className="mb-3" />}

              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => handleApprove(booking._id as Id<"bookings">)}
                  disabled={loadingId === booking._id}
                  className="flex-1 h-8 text-[12px] font-medium rounded-lg inline-flex items-center justify-center transition-colors disabled:opacity-50"
                  style={{
                    color: "#fff",
                    backgroundColor: "#5a9a6e",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#4e8a60")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#5a9a6e")
                  }
                >
                  {loadingId === booking._id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1" />
                      Approve
                    </>
                  )}
                </button>
                <button
                  onClick={() =>
                    reject({
                      bookingId: booking._id as Id<"bookings">,
                    })
                  }
                  className="flex-1 h-8 text-[12px] font-medium rounded-lg inline-flex items-center justify-center border transition-colors"
                  style={{
                    color: "#c45a5a",
                    borderColor: "rgba(196,90,90,0.2)",
                    backgroundColor: "transparent",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "rgba(196,90,90,0.05)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  Decline
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
