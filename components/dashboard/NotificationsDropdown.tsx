"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useDashboard } from "@/lib/dashboard-context";
import { enrichBookings } from "@/lib/dashboard-helpers";
import { Bell, Check, X, Clock } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

export default function NotificationsDropdown() {
  const { salonId, salon, customers, services, stylists } = useDashboard();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const approve = useMutation(api.bookings.mutations.approve);
  const reject = useMutation(api.bookings.mutations.reject);

  const pending = useQuery(api.bookings.queries.getPendingApproval, { salonId });
  const enriched = pending
    ? enrichBookings(pending, customers, services, stylists)
    : [];

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  const count = enriched.length;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative w-[34px] h-[34px] flex items-center justify-center bg-card border border-border rounded-lg hover:border-[rgba(42,36,32,0.12)] hover:bg-white transition-all"
      >
        <Bell className="w-4 h-4 text-muted-foreground" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] flex items-center justify-center text-[9px] font-bold text-white bg-[#c4983e] rounded-full px-1">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[320px] sm:w-[360px] bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="font-display text-[14px] text-foreground">
              Notifications
            </h3>
            {count > 0 && (
              <span
                className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{
                  color: "#c4983e",
                  backgroundColor: "rgba(196,152,62,0.08)",
                }}
              >
                {count} pending
              </span>
            )}
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {count === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="w-8 h-8 text-[#9c9184] mx-auto mb-2 opacity-40" />
                <p className="text-[13px] text-[#9c9184]">All caught up</p>
                <p className="text-[11px] text-[#9c9184] mt-0.5 opacity-70">
                  No bookings waiting for approval
                </p>
              </div>
            ) : (
              enriched.map((booking) => (
                <div
                  key={booking._id}
                  className="px-4 py-3 border-b border-border last:border-b-0 hover:bg-[rgba(166,139,107,0.03)] transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="p-1.5 rounded-lg mt-0.5 flex-shrink-0"
                      style={{ backgroundColor: "rgba(196,152,62,0.08)" }}
                    >
                      <Clock
                        className="w-3.5 h-3.5"
                        style={{ color: "#c4983e" }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-foreground truncate">
                        {booking.customerName}
                      </p>
                      <p className="text-[12px] text-muted-foreground truncate">
                        {booking.serviceName} with {booking.stylistName}
                      </p>
                      <p className="text-[11px] text-[#9c9184] mt-0.5 font-data">
                        {booking.date} &middot; {booking.startTime} -{" "}
                        {booking.endTime}
                      </p>

                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() =>
                            approve({
                              bookingId: booking._id as Id<"bookings">,
                              adminPhone: salon.adminPhones[0],
                            })
                          }
                          className="h-7 px-3 text-[11px] font-medium rounded-md inline-flex items-center transition-colors text-white"
                          style={{ backgroundColor: "#5a9a6e" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "#4e8a60")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = "#5a9a6e")
                          }
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            reject({
                              bookingId: booking._id as Id<"bookings">,
                            })
                          }
                          className="h-7 px-3 text-[11px] font-medium rounded-md inline-flex items-center border transition-colors"
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
                            (e.currentTarget.style.backgroundColor =
                              "transparent")
                          }
                        >
                          <X className="w-3 h-3 mr-1" />
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
