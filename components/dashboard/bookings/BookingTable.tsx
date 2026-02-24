"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import BookingStatusBadge from "@/components/dashboard/BookingStatusBadge";
import { useDashboard } from "@/lib/dashboard-context";
import { enrichBookings } from "@/lib/dashboard-helpers";
import { Search, Filter, MoreHorizontal, Check, X, AlertTriangle, CheckCircle2, Star, ArrowUpDown } from "lucide-react";

type BookingStatus =
  | "pending_approval"
  | "confirmed"
  | "reminder_sent"
  | "customer_confirmed"
  | "completed"
  | "no_show"
  | "cancelled_customer"
  | "cancelled_admin"
  | "rejected"
  | "reschedule_pending";

const TERMINAL_STATUSES: BookingStatus[] = ["completed", "no_show", "cancelled_customer", "cancelled_admin", "rejected"];

const UPCOMING_STATUSES: BookingStatus[] = ["pending_approval", "confirmed", "reminder_sent", "customer_confirmed", "reschedule_pending"];

const statusOptions: { label: string; value: BookingStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending_approval" },
  { label: "Confirmed", value: "confirmed" },
];

function getDateRange(): { startDate: string; endDate: string } {
  const now = new Date();
  const tz = "Asia/Kuala_Lumpur";

  const startDate = now.toLocaleDateString("en-CA", { timeZone: tz });

  const end = new Date(now);
  end.setDate(now.getDate() + 30);
  const endDate = end.toLocaleDateString("en-CA", { timeZone: tz });

  return { startDate, endDate };
}

function getDayLabel(dateStr: string, todayStr: string): string {
  const today = new Date(todayStr + "T00:00:00");
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = tomorrow.toLocaleDateString("en-CA");

  if (dateStr === todayStr) return "Today";
  if (dateStr === tomorrowStr) return "Tomorrow";

  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-MY", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const avatarColors = [
  "bg-[rgba(90,154,110,0.12)] text-[#5a9a6e]",
  "bg-[rgba(196,152,62,0.12)] text-[#c4983e]",
  "bg-[rgba(166,139,107,0.12)] text-[#a68b6b]",
  "bg-[rgba(130,120,180,0.12)] text-[#8278b4]",
  "bg-[rgba(196,90,90,0.12)] text-[#c45a5a]",
  "bg-[rgba(80,140,180,0.12)] text-[#508cb4]",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function ActionsDropdown({
  bookingId,
  status,
  feedbackRequestedAt,
}: {
  bookingId: Id<"bookings">;
  status: BookingStatus;
  feedbackRequestedAt?: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { salon } = useDashboard();

  const approveMut = useMutation(api.bookings.mutations.approve);
  const rejectMut = useMutation(api.bookings.mutations.reject);
  const cancelMut = useMutation(api.bookings.mutations.cancel);
  const markCompletedMut = useMutation(api.bookings.mutations.markCompleted);
  const markNoShowMut = useMutation(api.bookings.mutations.markNoShow);
  const requestFeedbackAction = useAction(api.bookings.actions.requestFeedback);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Terminal statuses with no actions (except completed which can have feedback)
  if (TERMINAL_STATUSES.includes(status) && status !== "completed") return null;

  const actions: { label: string; icon: React.ReactNode; onClick: () => void; color?: string; disabled?: boolean }[] = [];

  if (status === "pending_approval") {
    actions.push({
      label: "Approve",
      icon: <Check className="w-3.5 h-3.5" />,
      onClick: () => approveMut({ bookingId, adminPhone: salon.adminPhones[0] }),
      color: "#5a9a6e",
    });
    actions.push({
      label: "Decline",
      icon: <X className="w-3.5 h-3.5" />,
      onClick: () => rejectMut({ bookingId }),
      color: "#c45a5a",
    });
  } else if (status === "completed") {
    if (feedbackRequestedAt) {
      actions.push({
        label: "Review Sent",
        icon: <Star className="w-3.5 h-3.5" />,
        onClick: () => {},
        color: "#9c9184",
        disabled: true,
      });
    } else {
      actions.push({
        label: "Request Review",
        icon: <Star className="w-3.5 h-3.5" />,
        onClick: () => requestFeedbackAction({ bookingId }),
        color: "#c4983e",
      });
    }
  } else {
    actions.push({
      label: "Mark Completed",
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      onClick: () => markCompletedMut({ bookingId }),
      color: "#5a9a6e",
    });
    actions.push({
      label: "Mark No-Show",
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
      onClick: () => markNoShowMut({ bookingId }),
      color: "#c4983e",
    });
    actions.push({
      label: "Cancel",
      icon: <X className="w-3.5 h-3.5" />,
      onClick: () => cancelMut({ bookingId, cancelledBy: "cancelled_admin" }),
      color: "#c45a5a",
    });
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-md hover:bg-[rgba(166,139,107,0.08)] transition-colors"
      >
        <MoreHorizontal className="w-4 h-4 text-[#9c9184]" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-20 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[160px]">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={() => {
                if (!action.disabled) {
                  action.onClick();
                  setOpen(false);
                }
              }}
              disabled={action.disabled}
              className={`w-full flex items-center gap-2 px-3 py-2 text-[12px] font-medium transition-colors ${action.disabled ? "opacity-50 cursor-default" : "hover:bg-[rgba(166,139,107,0.06)]"}`}
              style={{ color: action.color }}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BookingTable() {
  const { salonId, customers, services, stylists } = useDashboard();
  const { startDate, endDate } = useMemo(() => getDateRange(), []);
  const todayStr = useMemo(() => {
    return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kuala_Lumpur" });
  }, []);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"time" | "stylist">("time");

  const bookings = useQuery(api.bookings.queries.getByDateRange, {
    salonId,
    startDate,
    endDate,
  });

  if (bookings === undefined) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-12">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="ml-2 text-[13px] text-muted-foreground">Loading bookings...</span>
        </div>
      </div>
    );
  }

  const enriched = enrichBookings(bookings, customers, services, stylists)
    .filter((b) => UPCOMING_STATUSES.includes(b.status as BookingStatus));

  const filtered = enriched
    .filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (search) {
        const term = search.toLowerCase();
        return (
          b.customerName.toLowerCase().includes(term) ||
          b.serviceName.toLowerCase().includes(term)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const dateComp = a.date.localeCompare(b.date);
      if (dateComp !== 0) return dateComp;
      if (sortBy === "stylist") {
        const stylistComp = a.stylistName.localeCompare(b.stylistName);
        if (stylistComp !== 0) return stylistComp;
      }
      return a.startTime.localeCompare(b.startTime);
    });

  // Group bookings by date
  const grouped = new Map<string, typeof filtered>();
  for (const booking of filtered) {
    const existing = grouped.get(booking.date);
    if (existing) {
      existing.push(booking);
    } else {
      grouped.set(booking.date, [booking]);
    }
  }

  const sortedDates = Array.from(grouped.keys()).sort();

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex items-center flex-1 max-w-sm">
          <Search className="absolute left-4 w-4 h-4 text-[#9c9184]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer or service..."
            className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2.5 text-[13px] text-foreground placeholder:text-[#9c9184] outline-none focus:ring-1 focus:ring-primary/30 transition-shadow"
          />
        </div>
        <div className="flex items-center gap-2.5 overflow-x-auto">
          <Filter className="w-4 h-4 text-[#9c9184] flex-shrink-0" />
          <div className="flex gap-1.5 flex-wrap">
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`px-2.5 py-1 text-[11px] font-medium transition-colors whitespace-nowrap ${
                  statusFilter === opt.value
                    ? "bg-primary text-primary-foreground rounded-md"
                    : "bg-muted text-muted-foreground rounded-md hover:bg-[rgba(166,139,107,0.08)]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="h-4 w-px bg-border flex-shrink-0 mx-1" />
          <button
            onClick={() => setSortBy(sortBy === "time" ? "stylist" : "time")}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap ${
              sortBy === "stylist"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-[rgba(166,139,107,0.08)]"
            }`}
          >
            <ArrowUpDown className="w-3 h-3" />
            Stylist
          </button>
        </div>
      </div>

      {/* Day-grouped sections */}
      {sortedDates.length === 0 ? (
        <div className="bg-card border border-border rounded-xl py-12 text-center text-[13px] text-[#9c9184]">
          No upcoming bookings
        </div>
      ) : (
        <div className="space-y-8">
          {sortedDates.map((dateStr) => {
            const dayBookings = grouped.get(dateStr)!;
            const label = getDayLabel(dateStr, todayStr);
            const isToday = dateStr === todayStr;

            return (
              <div key={dateStr}>
                {/* Day header */}
                <div className="flex items-center gap-3 mb-2">
                  <h3 className={`text-[13px] font-semibold ${isToday ? "text-primary" : "text-foreground"}`}>
                    {label}
                  </h3>
                  <span className="text-[11px] text-[#9c9184] font-medium">
                    {dayBookings.length} booking{dayBookings.length !== 1 ? "s" : ""}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Table for this day */}
                <div className="bg-card border border-border rounded-xl overflow-hidden transition-shadow hover:shadow-[0_2px_12px_rgba(42,36,32,0.06)]">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead>
                        <tr className="bg-[rgba(166,139,107,0.05)]">
                          <th className="text-left font-label text-[#9c9184] px-4 lg:px-5 py-2.5">
                            Time
                          </th>
                          <th className="text-left font-label text-[#9c9184] px-4 lg:px-5 py-2.5">
                            Customer
                          </th>
                          <th className="text-left font-label text-[#9c9184] px-4 lg:px-5 py-2.5">
                            Service
                          </th>
                          <th className="text-left font-label text-[#9c9184] px-4 lg:px-5 py-2.5 hidden lg:table-cell">
                            Stylist
                          </th>
                          <th className="text-left font-label text-[#9c9184] px-4 lg:px-5 py-2.5 hidden sm:table-cell">
                            Price
                          </th>
                          <th className="text-left font-label text-[#9c9184] px-4 lg:px-5 py-2.5">
                            Status
                          </th>
                          <th className="w-10 px-2 py-2.5" />
                        </tr>
                      </thead>
                      <tbody>
                        {dayBookings.map((booking) => (
                          <tr
                            key={booking._id}
                            className="border-t border-border hover:bg-[rgba(166,139,107,0.05)] transition-colors"
                          >
                            <td className="text-[13px] px-4 lg:px-5 py-3 whitespace-nowrap">
                              <span className="font-medium text-foreground font-data">
                                {booking.startTime}
                              </span>
                              <span className="text-[#9c9184] mx-1">-</span>
                              <span className="font-medium text-foreground font-data">
                                {booking.endTime}
                              </span>
                            </td>
                            <td className="text-[13px] px-4 lg:px-5 py-3">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`w-7 h-7 rounded-md flex items-center justify-center text-[12px] font-semibold flex-shrink-0 ${getAvatarColor(booking.customerName)}`}
                                >
                                  {getInitials(booking.customerName)}
                                </div>
                                <span className="font-medium text-foreground truncate max-w-[120px] lg:max-w-none">
                                  {booking.customerName}
                                </span>
                              </div>
                            </td>
                            <td className="text-[13px] text-muted-foreground px-4 lg:px-5 py-3 truncate max-w-[140px]">
                              {booking.serviceName}
                            </td>
                            <td className="text-[13px] text-muted-foreground px-4 lg:px-5 py-3 hidden lg:table-cell">
                              {booking.stylistName}
                            </td>
                            <td className="text-[13px] text-foreground font-data px-4 lg:px-5 py-3 hidden sm:table-cell whitespace-nowrap">
                              RM {booking.servicePrice}
                            </td>
                            <td className="text-[13px] px-4 lg:px-5 py-3">
                              <BookingStatusBadge status={booking.status} />
                            </td>
                            <td className="px-2 py-3">
                              <ActionsDropdown
                                bookingId={booking._id as Id<"bookings">}
                                status={booking.status as BookingStatus}
                                feedbackRequestedAt={booking.feedbackRequestedAt}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
