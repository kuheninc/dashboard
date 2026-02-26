"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useDashboard } from "@/lib/dashboard-context";
import { Bell, Clock, CheckCircle2, XCircle, BarChart3, Check, X } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

const typeConfig: Record<string, { icon: typeof Clock; color: string; bg: string }> = {
  pending_booking: { icon: Clock, color: "#c4983e", bg: "rgba(196,152,62,0.08)" },
  status_check: { icon: CheckCircle2, color: "#508cb4", bg: "rgba(80,140,180,0.08)" },
  customer_cancelled: { icon: XCircle, color: "#c45a5a", bg: "rgba(196,90,90,0.08)" },
  weekly_summary: { icon: BarChart3, color: "#5a9a6e", bg: "rgba(90,154,110,0.08)" },
};

export default function NotificationsDropdown() {
  const { salonId, salon } = useDashboard();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const notifications = useQuery(api.notifications.queries.getBySalon, { salonId });
  const unreadCount = useQuery(api.notifications.queries.getUnreadCount, { salonId });
  const markRead = useMutation(api.notifications.mutations.markRead);
  const markAllRead = useMutation(api.notifications.mutations.markAllRead);
  const markActedOn = useMutation(api.notifications.mutations.markActedOn);
  const approve = useMutation(api.bookings.mutations.approve);
  const reject = useMutation(api.bookings.mutations.reject);

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

  const count = unreadCount ?? 0;
  const items = notifications ?? [];

  function timeAgo(ts: number): string {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }

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
            <div className="flex items-center gap-2">
              {count > 0 && (
                <>
                  <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{
                      color: "#c4983e",
                      backgroundColor: "rgba(196,152,62,0.08)",
                    }}
                  >
                    {count} new
                  </span>
                  <button
                    onClick={() => markAllRead({ salonId })}
                    className="text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Mark all read
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="w-8 h-8 text-[#9c9184] mx-auto mb-2 opacity-40" />
                <p className="text-[13px] text-[#9c9184]">All caught up</p>
                <p className="text-[11px] text-[#9c9184] mt-0.5 opacity-70">
                  No notifications yet
                </p>
              </div>
            ) : (
              items.map((n) => {
                const config = typeConfig[n.type] ?? typeConfig.pending_booking;
                const Icon = config.icon;
                const isPendingBooking = n.type === "pending_booking" && n.bookingId && !n.actedOn;

                return (
                  <div
                    key={n._id}
                    className={`px-4 py-3 border-b border-border last:border-b-0 hover:bg-[rgba(166,139,107,0.03)] transition-colors ${
                      !n.read ? "bg-[rgba(196,152,62,0.03)]" : ""
                    }`}
                    onClick={() => {
                      if (!n.read) markRead({ notificationId: n._id as Id<"notifications"> });
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="p-1.5 rounded-lg mt-0.5 flex-shrink-0"
                        style={{ backgroundColor: config.bg }}
                      >
                        <Icon
                          className="w-3.5 h-3.5"
                          style={{ color: config.color }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] text-foreground truncate ${!n.read ? "font-semibold" : "font-medium"}`}>
                          {n.title}
                        </p>
                        <p className="text-[12px] text-muted-foreground truncate">
                          {n.body}
                        </p>
                        <p className="text-[10px] text-[#9c9184] mt-0.5">
                          {timeAgo(n.createdAt)}
                        </p>

                        {isPendingBooking && (
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                approve({
                                  bookingId: n.bookingId as Id<"bookings">,
                                  adminPhone: salon.adminPhones[0],
                                });
                                markActedOn({ notificationId: n._id as Id<"notifications"> });
                              }}
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
                              onClick={(e) => {
                                e.stopPropagation();
                                reject({
                                  bookingId: n.bookingId as Id<"bookings">,
                                });
                                markActedOn({ notificationId: n._id as Id<"notifications"> });
                              }}
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
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
