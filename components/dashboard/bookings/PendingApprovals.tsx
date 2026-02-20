"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Check, X, Clock } from "lucide-react";
import { useDashboard } from "@/lib/dashboard-context";
import { enrichBookings } from "@/lib/dashboard-helpers";

export default function PendingApprovals() {
  const { salonId, customers, services, stylists } = useDashboard();
  const bookings = useQuery(api.bookings.queries.getPendingApproval, { salonId });

  // Still loading
  if (bookings === undefined) return null;

  const enriched = enrichBookings(bookings, customers, services, stylists);

  if (enriched.length === 0) return null;

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
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1">
        {enriched.map((booking) => (
          <div
            key={booking._id}
            className="bg-card border border-border rounded-[14px] min-w-[270px] flex-shrink-0 transition-shadow hover:shadow-[0_4px_16px_rgba(42,36,32,0.06)]"
            style={{
              borderColor: "rgba(196,152,62,0.18)",
              background:
                "linear-gradient(to bottom, rgba(196,152,62,0.03), transparent)",
            }}
          >
            <div className="p-[18px]">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-[13px] font-medium text-foreground">
                    {booking.customerName}
                  </p>
                  <p className="text-[12px] text-muted-foreground mt-0.5">
                    {booking.serviceName}
                  </p>
                </div>
                <div
                  className="p-1.5 rounded-lg"
                  style={{ backgroundColor: "rgba(196,152,62,0.08)" }}
                >
                  <Clock className="w-3.5 h-3.5" style={{ color: "#c4983e" }} />
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground mb-2">
                <span>{booking.date}</span>
                <span className="text-[#9c9184]">&middot;</span>
                <span>
                  {booking.startTime} - {booking.endTime}
                </span>
              </div>

              <p className="text-[12px] text-[#9c9184] mb-4">
                Stylist: {booking.stylistName}
              </p>

              <div className="flex gap-2">
                <button
                  className="flex-1 h-8 text-[12px] font-medium rounded-lg inline-flex items-center justify-center transition-colors"
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
                  <Check className="w-3.5 h-3.5 mr-1" />
                  Approve
                </button>
                <button
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
